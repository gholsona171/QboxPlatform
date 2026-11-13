import { Events } from "discord.js";
import { DiscordCommunityService } from "@qbox/discord-community";
import { logger } from "@qbox/logger";
export class DiscordCommunityEventHandler {
    service;
    counterTimer;
    client;
    counterRefreshedAt = new Map();
    constructor(service) {
        this.service = service;
    }
    attach(client) {
        client.on(Events.GuildMemberAdd, (member) => void this.safe("welcome/autorole", () => this.onMemberAdd(member)));
        client.on(Events.GuildMemberRemove, (member) => void this.safe("goodbye", () => this.onMemberRemove(member)));
        client.on(Events.MessageCreate, (message) => void this.safe("custom-message-trigger", () => this.onMessage(message)));
        client.on(Events.MessageReactionAdd, (reaction, user) => void this.safe("starboard-add", () => this.onReaction(reaction, user)));
        client.on(Events.MessageDelete, (message) => void this.safe("message-delete", () => this.onMessageDelete(message)));
        client.on(Events.VoiceStateUpdate, (oldState, newState) => void this.safe("voice-log", () => this.onVoice(oldState, newState)));
        client.on(Events.MessageUpdate, (oldMessage, newMessage) => void this.safe("message-edit-log", () => this.onMessageEdit(oldMessage, newMessage)));
        client.on(Events.GuildMemberUpdate, (oldMember, newMember) => void this.safe("member-update-log", () => this.onMemberUpdate(oldMember, newMember)));
        client.on(Events.GuildBanAdd, (ban) => void this.safe("ban-log", () => this.onBan(ban, true)));
        client.on(Events.GuildBanRemove, (ban) => void this.safe("ban-log", () => this.onBan(ban, false)));
        this.client = client;
        this.counterTimer = setInterval(() => void this.safe("counter-timer", () => this.refreshDueCounters()), 60 * 1000);
        this.counterTimer.unref?.();
    }
    detach() {
        if (this.counterTimer)
            clearInterval(this.counterTimer);
    }
    async onMemberAdd(member) {
        const context = {
            user: `<@${member.id}>`,
            username: member.user.username,
            displayName: member.displayName,
            userId: member.id,
            server: member.guild.name,
            memberCount: member.guild.memberCount,
            joinedAt: member.joinedAt ?? new Date(),
            avatarUrl: member.displayAvatarURL(),
        };
        await this.service.deliverLog({ guildId: member.guild.id, event: "memberJoin", title: "Member joined", description: `<@${member.id}> (${member.user.tag}) joined. Account created <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>.`, userId: member.id, isBot: member.user.bot });
        await this.service.deliverWelcomeGoodbye("WELCOME", member.guild.id, context);
        const settings = await this.service.settings(member.guild.id);
        if (settings.autoroles.delaySeconds > 0)
            await wait(settings.autoroles.delaySeconds * 1000);
        await this.service.applyAutoroles(member.guild.id, member.id, member.user.bot);
        await this.refreshCounters(member.guild.id);
    }
    async onMemberRemove(member) {
        await this.service.deliverLog({ guildId: member.guild.id, event: "memberLeave", title: "Member left", description: `<@${member.id}> (${member.user.tag}) left the server.`, userId: member.id, roleIds: [...member.roles.cache.keys()], isBot: member.user.bot });
        await this.service.deliverWelcomeGoodbye("GOODBYE", member.guild.id, {
            user: `<@${member.id}>`,
            username: member.user.username,
            displayName: member.displayName,
            userId: member.id,
            server: member.guild.name,
            memberCount: member.guild.memberCount,
            joinedAt: member.joinedAt ?? new Date(),
            avatarUrl: member.displayAvatarURL(),
        });
        await this.refreshCounters(member.guild.id);
    }
    async onMessage(message) {
        if (!message.guild || message.author.bot)
            return;
        const settings = await this.service.settings(message.guild.id);
        const command = this.service.matchCustomCommand(settings.customCommands, message.content ?? "", message.channelId, [...message.member?.roles.cache.keys() ?? []]);
        if (!command)
            return;
        await message.reply({ content: command.responseText, allowedMentions: { parse: [] } });
        if (command.deleteTriggeringMessage)
            await message.delete().catch(() => undefined);
    }
    async onReaction(reaction, user) {
        if (user.bot)
            return;
        const fullReaction = reaction.partial ? await reaction.fetch() : reaction;
        const message = fullReaction.message.partial ? await fullReaction.message.fetch() : fullReaction.message;
        if (!message.guild || !message.author)
            return;
        const settings = await this.service.settings(message.guild.id);
        const config = settings.starboard;
        if (!config || fullReaction.emoji.toString() !== config.emoji)
            return;
        const count = fullReaction.count ?? 0;
        if (!this.service.shouldStar(config, {
            channelId: message.channelId,
            authorId: message.author.id,
            reactorId: user.id,
            isBot: message.author.bot,
            nsfw: "nsfw" in message.channel && message.channel.nsfw === true,
            count,
        }))
            return;
        await this.service.upsertStarboardEntry({
            guildId: message.guild.id,
            sourceChannelId: message.channelId,
            sourceMessageId: message.id,
            authorId: message.author.id,
            starCount: count,
            deleted: false,
        });
    }
    async onMessageDelete(message) {
        if (!message.guild)
            return;
        await this.service.markStarboardEntryDeleted(message.guild.id, message.id).catch(() => undefined);
        await this.service.deliverLog({
            guildId: message.guild.id,
            event: "messageDelete",
            title: "Message deleted",
            description: `${message.author ? `<@${message.author.id}>` : "A message"} in <#${message.channelId}>${message.content ? `:\n${message.content.slice(0, 1800)}` : ""}`,
            userId: message.author?.id,
            channelId: message.channelId,
            isBot: message.author?.bot,
        });
    }
    async onMessageEdit(oldMessage, newMessage) {
        if (!newMessage.guild || oldMessage.content === newMessage.content || !newMessage.author)
            return;
        await this.service.deliverLog({
            guildId: newMessage.guild.id,
            event: "messageEdit",
            title: "Message edited",
            description: `<@${newMessage.author.id}> in <#${newMessage.channelId}> ([jump](${newMessage.url}))${oldMessage.content ? `\n**Before:** ${oldMessage.content.slice(0, 900)}` : ""}${newMessage.content ? `\n**After:** ${newMessage.content.slice(0, 900)}` : ""}`,
            userId: newMessage.author.id,
            channelId: newMessage.channelId,
            isBot: newMessage.author.bot,
        });
    }
    async onMemberUpdate(oldMember, newMember) {
        const added = newMember.roles.cache.filter((role) => !oldMember.roles.cache.has(role.id));
        const removed = oldMember.roles.cache.filter((role) => !newMember.roles.cache.has(role.id));
        const base = { guildId: newMember.guild.id, userId: newMember.id, roleIds: [...newMember.roles.cache.keys()], isBot: newMember.user.bot };
        if (!oldMember.partial && (added.size > 0 || removed.size > 0))
            await this.service.deliverLog({
                ...base,
                event: "roleChange",
                title: "Roles changed",
                description: `<@${newMember.id}>${added.size ? `\n**Added:** ${added.map((role) => `<@&${role.id}>`).join(" ")}` : ""}${removed.size ? `\n**Removed:** ${removed.map((role) => `<@&${role.id}>`).join(" ")}` : ""}`,
            });
        if (!oldMember.partial && oldMember.nickname !== newMember.nickname)
            await this.service.deliverLog({ ...base, event: "nicknameChange", title: "Nickname changed", description: `<@${newMember.id}>: ${oldMember.nickname ?? "none"} → ${newMember.nickname ?? "none"}` });
    }
    async onVoice(oldState, newState) {
        if (oldState.channelId === newState.channelId || !newState.member)
            return;
        const who = `<@${newState.member.id}>`;
        const description = !oldState.channelId
            ? `${who} joined <#${newState.channelId}>`
            : !newState.channelId
                ? `${who} left <#${oldState.channelId}>`
                : `${who} moved from <#${oldState.channelId}> to <#${newState.channelId}>`;
        await this.service.deliverLog({ guildId: newState.guild.id, event: "voice", title: "Voice", description, userId: newState.member.id, roleIds: [...newState.member.roles.cache.keys()], isBot: newState.member.user.bot });
    }
    async onBan(ban, banned) {
        await this.service.deliverLog({
            guildId: ban.guild.id,
            event: "ban",
            title: banned ? "Member banned" : "Member unbanned",
            description: `<@${ban.user.id}> (${ban.user.tag})${banned && ban.reason ? `\n**Reason:** ${ban.reason}` : ""}`,
            userId: ban.user.id,
            isBot: ban.user.bot,
        });
    }
    /** Refreshes each counter once its own interval has passed. */
    async refreshDueCounters() {
        const now = Date.now();
        for (const guildId of this.client?.guilds.cache.keys() ?? []) {
            const settings = await this.service.settings(guildId);
            for (const counter of settings.counters) {
                if (!counter.enabled)
                    continue;
                const key = counter.id ?? counter.channelId;
                if (now - (this.counterRefreshedAt.get(key) ?? 0) < counter.intervalSeconds * 1000)
                    continue;
                this.counterRefreshedAt.set(key, now);
                await this.service.refreshCounter(counter).catch((error) => logger.warn({ err: error, counterId: counter.id }, "Discord counter refresh failed."));
            }
        }
    }
    async refreshCounters(guildId) {
        if (!guildId)
            return;
        const settings = await this.service.settings(guildId);
        for (const counter of settings.counters)
            await this.service.refreshCounter(counter).catch((error) => logger.warn({ err: error, counterId: counter.id }, "Discord counter refresh failed."));
    }
    async safe(feature, operation) {
        try {
            await operation();
        }
        catch (error) {
            logger.warn({ err: error, feature }, "Discord community feature handler failed.");
        }
    }
}
export function rulesCustomId(guildId) {
    return `qbox:rules:${guildId}`;
}
export function suggestionStatus(value) {
    return value === "approve" ? "APPROVED" : value === "deny" ? "DENIED" : value === "implemented" ? "IMPLEMENTED" : "UNDER_REVIEW";
}
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=DiscordCommunityEventHandler.js.map