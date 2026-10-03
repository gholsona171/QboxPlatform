/** Stream announcements through the Discord REST API (v10). */
export class DiscordRestStreamsGateway {
    rest;
    constructor(rest) {
        this.rest = rest;
    }
    async post(channelId, message, options) {
        const posted = (await this.rest.post(`/channels/${channelId}/messages`, { body: body(message, options) }));
        return posted.id;
    }
    async edit(channelId, messageId, message, options) {
        await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, { body: body(message, options) });
    }
    async deleteMessage(channelId, messageId) {
        await this.rest.delete(`/channels/${channelId}/messages/${messageId}`, { reason: "Stream ended" });
    }
    async guildName(guildId) {
        const guild = (await this.rest.get(`/guilds/${guildId}`));
        return guild.name;
    }
}
/** A link button row for the "Watch" button, or no components. */
export function watchButton(url) {
    return url ? [{ type: 1, components: [{ type: 2, style: 5, label: "Watch", url }] }] : [];
}
function body(message, options) {
    return {
        content: message.content ?? "",
        embeds: message.embeds ?? [],
        components: watchButton(options.watchUrl),
        allowed_mentions: { parse: [], roles: options.pingRoleId ? [options.pingRoleId] : [] },
    };
}
//# sourceMappingURL=DiscordRestStreamsGateway.js.map