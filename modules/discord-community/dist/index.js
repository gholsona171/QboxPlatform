import { BRAND } from "@qbox/shared/brand";
import { passthroughTemplates } from "@qbox/shared/messages";
/** Server log event keys. `destinations` may map each key, or `all`, to a channel. */
export const LOG_EVENTS = ["memberJoin", "memberLeave", "messageDelete", "messageEdit", "roleChange", "nicknameChange", "voice", "ban"];
const LOG_COLORS = {
    memberJoin: "#57F287",
    memberLeave: "#ED4245",
    messageDelete: "#ED4245",
    messageEdit: "#FEE75C",
    roleChange: "#5865F2",
    nicknameChange: "#5865F2",
    voice: "#99AAB5",
    ban: "#ED4245",
};
export class CommunityFeatureError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "CommunityFeatureError";
    }
}
const snowflake = /^\d{17,20}$/;
const hexColor = /^#?[0-9a-fA-F]{6}$/;
export class DiscordCommunityService {
    repository;
    gateway;
    templates;
    constructor(repository, gateway, templates = passthroughTemplates) {
        this.repository = repository;
        this.gateway = gateway;
        this.templates = templates;
    }
    settings(guildId) {
        requireSnowflake("guildId", guildId);
        return this.repository.getSettings(guildId);
    }
    saveWelcomeGoodbye(input) {
        validateWelcomeGoodbye(input);
        return this.repository.saveWelcomeGoodbye(input);
    }
    renderWelcomeGoodbye(config, context) {
        const content = renderPlaceholders(config.messageText, context);
        const embed = config.embedEnabled
            ? compactEmbed(optionalEmbed({
                title: renderOptional(config.embedTitle, context),
                description: renderOptional(config.embedDescription, context) ?? content,
                color: parseColor(config.embedColor),
                thumbnailUrl: config.thumbnailAvatar ? `avatar:${context.userId}` : undefined,
                imageUrl: config.imageUrl,
                footer: renderOptional(config.footer, context),
            }))
            : undefined;
        return {
            guildId: config.guildId,
            channelId: config.channelId,
            content: config.roleMentionId ? `<@&${config.roleMentionId}> ${content}` : content,
            ...(embed ? { embed } : {}),
            ...(config.deleteAfterSeconds === undefined ? {} : { deleteAfterSeconds: config.deleteAfterSeconds }),
        };
    }
    async deliverWelcomeGoodbye(kind, guildId, context) {
        const settings = await this.settings(guildId);
        const config = kind === "WELCOME" ? settings.welcome : settings.goodbye;
        if (!config?.enabled)
            return undefined;
        if (!this.gateway)
            throw unavailable();
        const rendered = this.renderWelcomeGoodbye(config, context);
        const message = await this.templates.apply(guildId, kind === "WELCOME" ? "community.welcome" : "community.goodbye", { user: context.user, username: context.displayName, server: context.server, memberCount: context.memberCount }, outgoingMessage(rendered, context.avatarUrl));
        return this.gateway.postMessage({
            guildId,
            channelId: config.channelId,
            message,
            ...(rendered.deleteAfterSeconds === undefined ? {} : { deleteAfterSeconds: rendered.deleteAfterSeconds }),
        });
    }
    saveAutoroles(input) {
        validateAutoroles(input);
        return this.repository.saveAutoroles(input);
    }
    addAutorole(input) {
        requireSnowflake("guildId", input.guildId);
        requireRoleId(input.roleId);
        return this.repository.addAutorole(input);
    }
    removeAutorole(guildId, roleId) {
        requireSnowflake("guildId", guildId);
        requireRoleId(roleId);
        return this.repository.removeAutorole(guildId, roleId);
    }
    async applyAutoroles(guildId, memberId, isBot) {
        const config = (await this.settings(guildId)).autoroles;
        if (!config.enabled || (isBot && !config.includeBots))
            return [];
        if (!this.gateway)
            throw unavailable();
        const results = [];
        for (const rule of [...config.roles].sort((left, right) => left.position - right.position)) {
            const validation = await this.gateway.validateRole({ guildId, memberId, roleId: rule.roleId });
            if (!validation.assignable) {
                results.push({ changed: false, message: validation.reason ?? "Role cannot be assigned." });
                continue;
            }
            results.push(await this.gateway.assignRole({ guildId, memberId, roleId: rule.roleId, reason: `${BRAND.name} autorole assignment.` }));
        }
        return results;
    }
    saveRules(input) {
        validateRules(input);
        return this.repository.saveRules(input);
    }
    async acceptRules(guildId, memberId) {
        const rules = (await this.settings(guildId)).rules;
        if (!rules?.enabled)
            throw new CommunityFeatureError("DISABLED", "Rules acknowledgement is disabled.");
        if (!this.gateway)
            throw unavailable();
        const validation = await this.gateway.validateRole({ guildId, memberId, roleId: rules.acceptedRoleId });
        if (!validation.assignable)
            throw new CommunityFeatureError("FORBIDDEN", validation.reason ?? "Accepted role cannot be assigned.");
        const results = [await this.gateway.assignRole({ guildId, memberId, roleId: rules.acceptedRoleId, reason: `${BRAND.name} rules accepted.` })];
        if (rules.pendingRoleId)
            results.push(await this.gateway.removeRole({ guildId, memberId, roleId: rules.pendingRoleId, reason: `${BRAND.name} rules accepted.` }));
        return results;
    }
    saveCounter(input) {
        validateCounter(input);
        return this.repository.saveCounter(input);
    }
    async refreshCounter(counter) {
        if (!counter.enabled)
            throw new CommunityFeatureError("DISABLED", "Counter is disabled.");
        if (!this.gateway)
            throw unavailable();
        const value = await this.gateway.countMembers({
            guildId: counter.guildId,
            type: counter.type,
            ...(counter.roleId === undefined ? {} : { roleId: counter.roleId }),
        });
        await this.gateway.renameChannel({ guildId: counter.guildId, channelId: counter.channelId, name: renderCounter(counter.labelTemplate, value) });
        return value;
    }
    deleteCounter(guildId, id) {
        requireSnowflake("guildId", guildId);
        return this.repository.deleteCounter(guildId, id);
    }
    saveLogs(input) {
        validateLogs(input);
        return this.repository.saveLogs(input);
    }
    /** Posts a server log entry when logging is on for this event and nothing is ignored. */
    async deliverLog(input) {
        const logs = (await this.settings(input.guildId)).logs;
        if (!logs?.enabled || !logs.events.includes(input.event))
            return undefined;
        if (input.isBot && !logs.includeBots)
            return undefined;
        if (input.userId && logs.ignoredUsers.includes(input.userId))
            return undefined;
        if (input.channelId && logs.ignoredChannels.includes(input.channelId))
            return undefined;
        if (input.roleIds?.some((roleId) => logs.ignoredRoles.includes(roleId)))
            return undefined;
        const channelId = logs.destinations[input.event] ?? logs.destinations.all ?? Object.values(logs.destinations)[0];
        if (!channelId)
            return undefined;
        if (!this.gateway)
            throw unavailable();
        return this.gateway.sendMessage({
            guildId: input.guildId,
            channelId,
            embed: compactEmbed({
                title: input.title,
                description: input.description.slice(0, 4000),
                color: parseColor(logs.colors[input.event] ?? LOG_COLORS[input.event]),
                timestamp: true,
            }),
        });
    }
    saveEmbedTemplate(input) {
        validateEmbed(input);
        return this.repository.saveEmbedTemplate(input);
    }
    deleteEmbedTemplate(guildId, id) {
        requireSnowflake("guildId", guildId);
        return this.repository.deleteEmbedTemplate(guildId, id);
    }
    renderEmbed(template) {
        validateEmbed(template);
        return {
            guildId: template.guildId,
            channelId: "",
            ...(template.content ? { content: template.content } : {}),
            embed: compactEmbed(optionalEmbed({
                title: template.title,
                description: template.description,
                color: parseColor(template.color),
                thumbnailUrl: template.thumbnailUrl,
                imageUrl: template.imageUrl,
                footer: template.footer,
                fields: template.fields,
                timestamp: template.timestamp,
            })),
        };
    }
    async sendEmbedTemplate(guildId, name, channelId) {
        if (!this.gateway)
            throw unavailable();
        const gateway = this.gateway;
        requireSnowflake("guildId", guildId);
        requireSnowflake("channelId", channelId);
        const template = (await this.settings(guildId)).embedTemplates.find((item) => item.name === name);
        if (!template)
            throw new CommunityFeatureError("NOT_FOUND", "Embed template was not found.");
        const rendered = this.renderEmbed(template);
        return gateway.sendMessage({ ...rendered, channelId });
    }
    async sendAnnouncement(input) {
        if (!this.gateway)
            throw unavailable();
        const gateway = this.gateway;
        requireSnowflake("guildId", input.guildId);
        requireSnowflake("channelId", input.channelId);
        requireLength("content", input.content, 1, 2000);
        if (/@(?:everyone|here)\b/.test(input.content))
            throw new CommunityFeatureError("INVALID_INPUT", "Announcements cannot mention everyone or here.");
        return gateway.sendMessage({ guildId: input.guildId, channelId: input.channelId, content: input.content });
    }
    saveCustomCommand(input) {
        validateCustom(input);
        return this.repository.saveCustomCommand(input);
    }
    deleteCustomCommand(guildId, name) {
        requireSnowflake("guildId", guildId);
        return this.repository.deleteCustomCommand(guildId, normalizeCommandName(name));
    }
    matchCustomCommand(commands, content, channelId, roleIds) {
        const lower = content.toLowerCase();
        return commands.find((command) => {
            if (!command.enabled || command.triggerMode === "SLASH_ONLY")
                return false;
            if (command.allowedChannels.length > 0 && !command.allowedChannels.includes(channelId))
                return false;
            if (command.deniedChannels.includes(channelId))
                return false;
            if (command.requiredRoles.length > 0 && !command.requiredRoles.some((roleId) => roleIds.includes(roleId)))
                return false;
            const phrase = command.triggerPhrase?.toLowerCase();
            if (!phrase)
                return false;
            if (command.triggerMode === "EXACT")
                return lower === phrase;
            if (command.triggerMode === "STARTS_WITH")
                return lower.startsWith(phrase);
            return lower.includes(phrase);
        });
    }
    createSuggestion(input) {
        requireSnowflake("guildId", input.guildId);
        requireSnowflake("submitterId", input.submitterId);
        requireLength("content", input.content, 1, 1900);
        return this.repository.createSuggestion(input);
    }
    updateSuggestion(input) {
        requireSnowflake("guildId", input.guildId);
        return this.repository.updateSuggestion(input);
    }
    saveStarboard(input) {
        validateStarboard(input);
        return this.repository.saveStarboard(input);
    }
    shouldStar(config, input) {
        if (!config.enabled)
            return false;
        if (!config.allowSelfStar && input.authorId === input.reactorId)
            return false;
        if (!config.includeBotMessages && input.isBot)
            return false;
        if (config.nsfw === "BLOCK" && input.nsfw)
            return false;
        if (config.mode === "ALLOWLIST" && config.channels.length > 0 && !config.channels.includes(input.channelId))
            return false;
        if (config.mode === "DENYLIST" && config.channels.includes(input.channelId))
            return false;
        return input.count >= config.threshold;
    }
    upsertStarboardEntry(input) {
        requireSnowflake("guildId", input.guildId);
        requireSnowflake("sourceChannelId", input.sourceChannelId);
        requireSnowflake("sourceMessageId", input.sourceMessageId);
        return this.repository.upsertStarboardEntry(input);
    }
    markStarboardEntryDeleted(guildId, sourceMessageId) {
        requireSnowflake("guildId", guildId);
        requireSnowflake("sourceMessageId", sourceMessageId);
        return this.repository.markStarboardEntryDeleted(guildId, sourceMessageId);
    }
}
export function renderPlaceholders(template, context) {
    return template
        .replaceAll("{user}", context.user)
        .replaceAll("{username}", context.username)
        .replaceAll("{displayName}", context.displayName)
        .replaceAll("{userId}", context.userId)
        .replaceAll("{server}", context.server)
        .replaceAll("{memberCount}", String(context.memberCount))
        .replaceAll("{joinedAt}", context.joinedAt.toISOString());
}
export function renderCounter(template, value) {
    return template.replaceAll("{count}", String(value));
}
function renderOptional(value, context) {
    return value === undefined ? undefined : renderPlaceholders(value, context);
}
/** A welcome or goodbye message as Discord message JSON, the way the channel shows it. */
function outgoingMessage(message, avatarUrl) {
    const embed = message.embed;
    const thumbnailUrl = embed?.thumbnailUrl?.startsWith("avatar:") ? avatarUrl : embed?.thumbnailUrl;
    return {
        ...(message.content ? { content: message.content } : {}),
        ...(embed
            ? {
                embeds: [{
                        ...(embed.title ? { title: embed.title } : {}),
                        ...(embed.description ? { description: embed.description } : {}),
                        ...(embed.color === undefined ? {} : { color: embed.color }),
                        ...(thumbnailUrl ? { thumbnail: { url: thumbnailUrl } } : {}),
                        ...(embed.imageUrl ? { image: { url: embed.imageUrl } } : {}),
                        ...(embed.footer ? { footer: { text: embed.footer } } : {}),
                        ...(embed.timestamp ? { timestamp: new Date().toISOString() } : {}),
                        ...(embed.fields?.length ? { fields: embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline })) } : {}),
                    }],
            }
            : {}),
    };
}
function compactEmbed(input) {
    return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== ""));
}
function optionalEmbed(input) {
    return compactEmbed(input);
}
function validateWelcomeGoodbye(input) {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("channelId", input.channelId);
    if (input.roleMentionId)
        requireRoleId(input.roleMentionId);
    requireLength("messageText", input.messageText, 1, 1900);
    if (input.embedTitle)
        requireLength("embedTitle", input.embedTitle, 1, 256);
    if (input.embedDescription)
        requireLength("embedDescription", input.embedDescription, 1, 4000);
    if (input.embedColor && !hexColor.test(input.embedColor))
        invalid("embedColor must be a hex color.");
    if (input.deleteAfterSeconds !== undefined && input.deleteAfterSeconds < 1)
        invalid("deleteAfterSeconds must be positive.");
}
function validateAutoroles(input) {
    requireSnowflake("guildId", input.guildId);
    if (input.delaySeconds < 0 || input.delaySeconds > 86400)
        invalid("delaySeconds must be between 0 and 86400.");
    for (const role of input.roles)
        requireRoleId(role.roleId);
}
function validateRules(input) {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("channelId", input.channelId);
    requireRoleId(input.acceptedRoleId);
    if (input.pendingRoleId)
        requireRoleId(input.pendingRoleId);
    requireLength("messageText", input.messageText, 1, 4000);
    requireLength("buttonLabel", input.buttonLabel, 1, 80);
}
function validateCounter(input) {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("channelId", input.channelId);
    requireLength("labelTemplate", input.labelTemplate, 1, 100);
    if (input.type === "ROLE" && !input.roleId)
        invalid("roleId is required for role counters.");
    if (input.roleId)
        requireRoleId(input.roleId);
    if (input.intervalSeconds < 60 || input.intervalSeconds > 86400)
        invalid("intervalSeconds must be between 60 and 86400.");
}
function validateLogs(input) {
    requireSnowflake("guildId", input.guildId);
    for (const channelId of Object.values(input.destinations))
        requireSnowflake("destination channel", channelId);
}
function validateEmbed(input) {
    requireSnowflake("guildId", input.guildId);
    requireLength("name", input.name, 1, 80);
    if (input.title)
        requireLength("title", input.title, 1, 256);
    if (input.description)
        requireLength("description", input.description, 1, 4000);
    if (input.color && !hexColor.test(input.color))
        invalid("color must be a hex color.");
    if (input.fields.length > 25)
        invalid("Embeds cannot contain more than 25 fields.");
    for (const roleId of input.allowedRoleMentions)
        requireRoleId(roleId);
}
function validateCustom(input) {
    requireSnowflake("guildId", input.guildId);
    requireLength("name", normalizeCommandName(input.name), 1, 32);
    requireLength("description", input.description, 1, 100);
    requireLength("responseText", input.responseText, 1, 1900);
    if (input.cooldownSeconds < 0 || input.cooldownSeconds > 86400)
        invalid("cooldownSeconds must be between 0 and 86400.");
    if (input.triggerMode !== "SLASH_ONLY" && !input.triggerPhrase)
        invalid("triggerPhrase is required for message triggers.");
}
function validateStarboard(input) {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("destinationChannelId", input.destinationChannelId);
    if (input.threshold < 1 || input.threshold > 1000)
        invalid("threshold must be between 1 and 1000.");
}
function normalizeCommandName(name) {
    return name.trim().toLowerCase().replaceAll(/\s+/g, "-");
}
function parseColor(value) {
    if (!value)
        return undefined;
    const normalized = value.startsWith("#") ? value.slice(1) : value;
    return Number.parseInt(normalized, 16);
}
function requireSnowflake(name, value) {
    if (!snowflake.test(value))
        invalid(`${name} must be a Discord snowflake.`);
}
function requireRoleId(value) {
    if (value === "0")
        invalid("@everyone cannot be configured as a managed role.");
    requireSnowflake("roleId", value);
}
function requireLength(name, value, min, max) {
    if (value.length < min || value.length > max)
        invalid(`${name} length must be between ${min} and ${max}.`);
}
function invalid(message) {
    throw new CommunityFeatureError("INVALID_INPUT", message);
}
function unavailable() {
    return new CommunityFeatureError("DEPENDENCY_UNAVAILABLE", "Discord gateway is not configured.");
}
//# sourceMappingURL=index.js.map