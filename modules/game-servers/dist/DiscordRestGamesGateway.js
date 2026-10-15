/** Game server status messages, alerts, and channel renames through the Discord REST API (v10). */
export class DiscordRestGamesGateway {
    rest;
    constructor(rest) {
        this.rest = rest;
    }
    async upsertStatusMessage(channelId, messageId, message, connectUrl) {
        const body = { content: message.content ?? "", embeds: message.embeds ?? [], components: connectButton(connectUrl), allowed_mentions: { parse: [] } };
        if (messageId) {
            try {
                await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, { body });
                return messageId;
            }
            catch {
                // Deleted or not editable: post a new message below.
            }
        }
        const posted = (await this.rest.post(`/channels/${channelId}/messages`, { body }));
        return posted.id;
    }
    async postAlert(channelId, message, roleId) {
        const content = message.content ?? "";
        await this.rest.post(`/channels/${channelId}/messages`, {
            body: {
                content: roleId ? `<@&${roleId}> ${content}`.trim() : content,
                embeds: message.embeds ?? [],
                allowed_mentions: { parse: [], roles: roleId ? [roleId] : [] },
            },
        });
    }
    async renameChannel(channelId, name) {
        await this.rest.patch(`/channels/${channelId}`, { body: { name }, reason: "Game server player count" });
    }
}
/** A link button row for an http(s) connect link, or no components. */
export function connectButton(connectUrl) {
    return connectUrl ? [{ type: 1, components: [{ type: 2, style: 5, label: "Connect", url: connectUrl }] }] : [];
}
//# sourceMappingURL=DiscordRestGamesGateway.js.map