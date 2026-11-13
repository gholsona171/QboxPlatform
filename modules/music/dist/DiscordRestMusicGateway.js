/**
 * Now-playing messages through the Discord REST API (v10). A cover is sent as
 * an attachment the embed thumbnail points at (`attachment://cover.jpg`);
 * progress edits keep that attachment.
 */
export class DiscordRestMusicGateway {
    rest;
    constructor(rest) {
        this.rest = rest;
    }
    async post(channelId, message, options) {
        const posted = (await this.rest.post(`/channels/${channelId}/messages`, request(message, options)));
        return posted.id;
    }
    async edit(channelId, messageId, message, options) {
        await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, request(message, options));
    }
    async deleteMessage(channelId, messageId) {
        await this.rest.delete(`/channels/${channelId}/messages/${messageId}`);
    }
    async guildName(guildId) {
        const guild = (await this.rest.get(`/guilds/${guildId}`));
        return guild.name;
    }
}
function request(message, options) {
    const attachment = options.attachment;
    const body = {
        content: message.content ?? "",
        embeds: message.embeds ?? [],
        components: options.components,
        allowed_mentions: { parse: [] },
        ...(attachment ? { attachments: [{ id: 0, filename: attachment.name }] } : options.keepAttachments ? {} : { attachments: [] }),
    };
    return attachment ? { body, files: [{ name: attachment.name, data: attachment.data }] } : { body };
}
//# sourceMappingURL=DiscordRestMusicGateway.js.map