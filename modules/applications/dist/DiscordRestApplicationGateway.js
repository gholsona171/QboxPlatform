import { MISSING_PANEL_CHANNEL_MESSAGE, colorValue, emojiObject, isMissingChannelError } from "@qbox/shared/discord-rest";
import { APPLICATION_CUSTOM_ID } from "./types.js";
import { ApplicationError } from "./validation.js";
import { BRAND } from "@qbox/shared/brand";
const BUTTON_STYLE = { PRIMARY: 1, SECONDARY: 2, SUCCESS: 3, DANGER: 4 };
const PRIVATE_THREAD = 12;
const THREAD_ARCHIVE_MINUTES = 10_080;
/** Application Discord operations through the Discord REST API (v10). */
export class DiscordRestApplicationGateway {
    rest;
    guildNames = new Map();
    constructor(rest) {
        this.rest = rest;
    }
    async postReview(channelId, message) {
        const posted = (await this.rest.post(`/channels/${channelId}/messages`, {
            body: { ...reviewBody(message), ...(message.content ? { content: message.content } : {}), allowed_mentions: { parse: [], users: [...message.mentionUserIds] } },
        }));
        return { messageId: posted.id };
    }
    async updateReview(channelId, messageId, message) {
        await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, { body: { ...reviewBody(message), allowed_mentions: { parse: [] } } });
    }
    async createDiscussion(channelId, name, memberIds, content) {
        const thread = (await this.rest.post(`/channels/${channelId}/threads`, {
            body: { name, type: PRIVATE_THREAD, invitable: false, auto_archive_duration: THREAD_ARCHIVE_MINUTES },
            reason: `${BRAND.name} application discussion`,
        }));
        for (const userId of new Set(memberIds))
            await this.rest.put(`/channels/${thread.id}/thread-members/${userId}`).catch(() => undefined);
        await this.rest.post(`/channels/${thread.id}/messages`, { body: { content: content.slice(0, 2000), allowed_mentions: { parse: ["users", "roles"] } } });
        return { threadId: thread.id };
    }
    async postMessage(channelId, content) {
        await this.rest.post(`/channels/${channelId}/messages`, { body: { content: content.slice(0, 2000), allowed_mentions: { parse: [] } } });
    }
    async addRoles(guildId, userId, roleIds, reason) {
        for (const roleId of roleIds)
            await this.rest.put(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
    }
    async removeRoles(guildId, userId, roleIds, reason) {
        for (const roleId of roleIds)
            await this.rest.delete(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
    }
    async directMessage(userId, embed) {
        try {
            const channel = (await this.rest.post("/users/@me/channels", { body: { recipient_id: userId } }));
            await this.rest.post(`/channels/${channel.id}/messages`, { body: { embeds: [toEmbed(embed)], allowed_mentions: { parse: [] } } });
            return true;
        }
        catch {
            return false;
        }
    }
    async publishPanel(panel, forms) {
        const body = {
            embeds: [{ title: panel.title, description: panel.description, color: colorValue(panel.color) }],
            components: chunk(forms, 5).map((row) => ({
                type: 1,
                components: row.map((form) => ({
                    type: 2,
                    style: BUTTON_STYLE[form.buttonStyle],
                    custom_id: `${APPLICATION_CUSTOM_ID.open}${form.id}`,
                    label: (form.buttonLabel ?? form.name).slice(0, 80),
                    ...(form.buttonEmoji ? { emoji: emojiObject(form.buttonEmoji) } : {}),
                })),
            })),
            allowed_mentions: { parse: [] },
        };
        if (panel.messageId) {
            try {
                await this.rest.patch(`/channels/${panel.channelId}/messages/${panel.messageId}`, { body });
                return { messageId: panel.messageId };
            }
            catch (error) {
                // A deleted channel cannot take a new post either; otherwise the old panel message was deleted, so post a fresh one.
                if (isMissingChannelError(error))
                    throw new ApplicationError("INVALID_STATE", MISSING_PANEL_CHANNEL_MESSAGE);
            }
        }
        try {
            const message = (await this.rest.post(`/channels/${panel.channelId}/messages`, { body }));
            return { messageId: message.id };
        }
        catch (error) {
            if (isMissingChannelError(error))
                throw new ApplicationError("INVALID_STATE", MISSING_PANEL_CHANNEL_MESSAGE);
            throw error;
        }
    }
    async deleteMessage(channelId, messageId) {
        await this.rest.delete(`/channels/${channelId}/messages/${messageId}`);
    }
    async guildName(guildId) {
        const cached = this.guildNames.get(guildId);
        if (cached)
            return cached;
        const guild = (await this.rest.get(`/guilds/${guildId}`));
        this.guildNames.set(guildId, guild.name);
        return guild.name;
    }
}
function reviewBody(message) {
    const id = message.applicationId;
    return {
        embeds: [toEmbed(message.embed)],
        components: message.closed
            ? []
            : [{
                    type: 1,
                    components: [
                        { type: 2, style: BUTTON_STYLE.SUCCESS, custom_id: `${APPLICATION_CUSTOM_ID.accept}${id}`, label: "Accept" },
                        { type: 2, style: BUTTON_STYLE.DANGER, custom_id: `${APPLICATION_CUSTOM_ID.deny}${id}`, label: "Deny" },
                        { type: 2, style: BUTTON_STYLE.SECONDARY, custom_id: `${APPLICATION_CUSTOM_ID.up}${id}`, label: String(message.upvotes), emoji: { name: "👍" } },
                        { type: 2, style: BUTTON_STYLE.SECONDARY, custom_id: `${APPLICATION_CUSTOM_ID.down}${id}`, label: String(message.downvotes), emoji: { name: "👎" } },
                    ],
                }],
    };
}
function toEmbed(embed) {
    return {
        title: embed.title,
        description: embed.description,
        color: colorValue(embed.color),
        ...(embed.fields?.length ? { fields: embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })) } : {}),
        ...(embed.footer ? { footer: { text: embed.footer } } : {}),
        timestamp: new Date().toISOString(),
    };
}
function chunk(items, size) {
    const rows = [];
    for (let index = 0; index < items.length; index += size)
        rows.push(items.slice(index, index + size));
    return rows;
}
//# sourceMappingURL=DiscordRestApplicationGateway.js.map