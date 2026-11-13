import { MISSING_PANEL_CHANNEL_MESSAGE, colorValue, isMissingChannelError } from "@qbox/shared/discord-rest";
import { VERIFICATION_CUSTOM_ID } from "./types.js";
import { VerificationError } from "./validation.js";
const GUILD_NAME_CACHE_MS = 10 * 60_000;
/** Verification actions through the Discord REST API (v10). */
export class DiscordRestVerificationGateway {
    rest;
    now;
    names = new Map();
    constructor(rest, now = Date.now) {
        this.rest = rest;
        this.now = now;
    }
    async member(guildId, userId) {
        try {
            const member = (await this.rest.get(`/guilds/${guildId}/members/${userId}`));
            return { userId, displayName: member.nick ?? member.user.global_name ?? member.user.username, roleIds: member.roles };
        }
        catch {
            return undefined;
        }
    }
    async guildName(guildId) {
        const cached = this.names.get(guildId);
        if (cached && this.now() - cached.at < GUILD_NAME_CACHE_MS)
            return cached.name;
        const guild = (await this.rest.get(`/guilds/${guildId}`));
        this.names.set(guildId, { name: guild.name, at: this.now() });
        return guild.name;
    }
    async addRole(guildId, userId, roleId, reason) {
        await this.rest.put(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
    }
    async removeRole(guildId, userId, roleId, reason) {
        await this.rest.delete(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
    }
    async kick(guildId, userId, reason) {
        await this.rest.delete(`/guilds/${guildId}/members/${userId}`, { reason });
    }
    async directMessage(userId, content) {
        try {
            const channel = (await this.rest.post("/users/@me/channels", { body: { recipient_id: userId } }));
            await this.rest.post(`/channels/${channel.id}/messages`, { body: { content, allowed_mentions: { parse: [] } } });
            return true;
        }
        catch {
            return false;
        }
    }
    async sendMessage(channelId, message, mentionUserId) {
        await this.rest.post(`/channels/${channelId}/messages`, { body: { ...message, allowed_mentions: { parse: [], users: [mentionUserId] } } });
    }
    async postEmbed(channelId, embed) {
        await this.rest.post(`/channels/${channelId}/messages`, {
            body: {
                embeds: [{ title: embed.title, description: embed.description, color: colorValue(embed.color), ...(embed.footer ? { footer: { text: embed.footer } } : {}), timestamp: new Date(this.now()).toISOString() }],
                allowed_mentions: { parse: [] },
            },
        });
    }
    async publishPanel(channelId, panel, existingMessageId) {
        const body = {
            embeds: [{ title: panel.title, description: panel.description, color: colorValue(panel.color) }],
            components: [{ type: 1, components: [{ type: 2, style: 3, label: panel.buttonLabel, custom_id: VERIFICATION_CUSTOM_ID.start }] }],
            allowed_mentions: { parse: [] },
        };
        if (existingMessageId) {
            try {
                await this.rest.patch(`/channels/${channelId}/messages/${existingMessageId}`, { body });
                return { messageId: existingMessageId };
            }
            catch (error) {
                // A deleted channel cannot take a new post either; otherwise the old panel was deleted, so post a new one below.
                if (isMissingChannelError(error))
                    throw new VerificationError("INVALID_STATE", MISSING_PANEL_CHANNEL_MESSAGE);
            }
        }
        try {
            const message = (await this.rest.post(`/channels/${channelId}/messages`, { body }));
            return { messageId: message.id };
        }
        catch (error) {
            if (isMissingChannelError(error))
                throw new VerificationError("INVALID_STATE", MISSING_PANEL_CHANNEL_MESSAGE);
            throw error;
        }
    }
}
//# sourceMappingURL=DiscordRestVerificationGateway.js.map