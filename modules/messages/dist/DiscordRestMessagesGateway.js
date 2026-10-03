/** Test messages and server names through the Discord REST API (v10). */
export class DiscordRestMessagesGateway {
    rest;
    constructor(rest) {
        this.rest = rest;
    }
    async postMessage(channelId, message) {
        const posted = (await this.rest.post(`/channels/${channelId}/messages`, {
            body: { content: message.content ?? "", embeds: message.embeds ?? [], allowed_mentions: { parse: [] } },
        }));
        return { messageId: posted.id };
    }
    async guildName(guildId) {
        try {
            return (await this.rest.get(`/guilds/${guildId}`)).name;
        }
        catch {
            return undefined;
        }
    }
}
//# sourceMappingURL=DiscordRestMessagesGateway.js.map