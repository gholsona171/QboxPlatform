import { GuildNameCache } from "@qbox/shared/discord-rest";
/** Level rewards and level-up messages through the Discord REST API (v10). */
export class DiscordRestLevelGateway {
    rest;
    guildNames;
    constructor(rest) {
        this.rest = rest;
        this.guildNames = new GuildNameCache(rest);
    }
    guildName(guildId) {
        return this.guildNames.name(guildId);
    }
    async memberRoleIds(guildId, userId) {
        try {
            return (await this.rest.get(`/guilds/${guildId}/members/${userId}`)).roles;
        }
        catch {
            return undefined;
        }
    }
    async addRole(guildId, userId, roleId, reason) {
        await this.rest.put(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
    }
    async removeRole(guildId, userId, roleId, reason) {
        await this.rest.delete(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
    }
    async sendMessage(channelId, message, mentionUserId) {
        await this.rest.post(`/channels/${channelId}/messages`, { body: { ...message, allowed_mentions: { parse: [], users: [mentionUserId] } } });
    }
    async directMessage(userId, message) {
        try {
            const channel = (await this.rest.post("/users/@me/channels", { body: { recipient_id: userId } }));
            await this.rest.post(`/channels/${channel.id}/messages`, { body: { ...message, allowed_mentions: { parse: [] } } });
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=DiscordRestLevelGateway.js.map