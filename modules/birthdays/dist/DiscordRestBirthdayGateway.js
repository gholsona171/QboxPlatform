const GUILD_CACHE_MS = 10 * 60_000;
/** Birthday messages and roles through the Discord REST API (v10). */
export class DiscordRestBirthdayGateway {
    rest;
    now;
    names = new Map();
    constructor(rest, now = Date.now) {
        this.rest = rest;
        this.now = now;
    }
    async guildName(guildId) {
        const cached = this.names.get(guildId);
        if (cached && this.now() - cached.at < GUILD_CACHE_MS)
            return cached.name;
        const guild = (await this.rest.get(`/guilds/${guildId}`));
        this.names.set(guildId, { name: guild.name, at: this.now() });
        return guild.name;
    }
    async post(channelId, announcement) {
        const message = (await this.rest.post(`/channels/${channelId}/messages`, {
            body: {
                content: announcement.content ?? "",
                embeds: announcement.embeds ?? [],
                allowed_mentions: { parse: [], users: [...announcement.mentionUserIds], roles: [...announcement.mentionRoleIds] },
            },
        }));
        return { messageId: message.id };
    }
    async addRole(guildId, userId, roleId, reason) {
        await this.rest.put(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
    }
    async removeRole(guildId, userId, roleId, reason) {
        await this.rest.delete(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
    }
}
//# sourceMappingURL=DiscordRestBirthdayGateway.js.map