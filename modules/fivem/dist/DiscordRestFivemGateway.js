import { colorValue, DISCORD_ERROR, discordErrorCode } from "@qbox/shared/discord-rest";
/** FiveM status messages and alerts through the Discord REST API (v10). */
export class DiscordRestFivemGateway {
    rest;
    constructor(rest) {
        this.rest = rest;
    }
    async upsertStatusMessage(channelId, messageId, embed, connectUrl, options = {}) {
        if (messageId) {
            try {
                await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, request(embed, connectUrl, options.refreshImage ? options.image : undefined));
                return messageId;
            }
            catch (error) {
                // Only a deleted message is replaced. A rate limit or a Discord hiccup
                // is thrown, so the next check edits the same message again instead
                // of leaving a stale copy behind and posting a duplicate.
                if (discordErrorCode(error) !== DISCORD_ERROR.unknownMessage)
                    throw error;
            }
        }
        const message = (await this.rest.post(`/channels/${channelId}/messages`, request(embed, connectUrl, options.image)));
        return message.id;
    }
    async postAlert(channelId, content, embed, roleId) {
        await this.rest.post(`/channels/${channelId}/messages`, {
            body: {
                content: roleId ? `<@&${roleId}> ${content}` : content,
                embeds: [toEmbed(embed)],
                allowed_mentions: { parse: [], roles: roleId ? [roleId] : [] },
            },
        });
    }
}
function request(embed, connectUrl, image) {
    const body = {
        embeds: [toEmbed(embed)],
        components: connectButton(connectUrl),
        allowed_mentions: { parse: [] },
        // Without `attachments` an edit keeps the graph already attached.
        ...(image ? { attachments: [{ id: 0, filename: image.name }] } : {}),
    };
    return image ? { body, files: [{ name: image.name, data: image.data, contentType: "image/png" }] } : { body };
}
/** A link button row for the cfx.re join link, or no components. */
export function connectButton(connectUrl) {
    return connectUrl ? [{ type: 1, components: [{ type: 2, style: 5, label: "Connect", url: connectUrl }] }] : [];
}
export function toEmbed(embed) {
    return {
        title: embed.title,
        description: embed.description,
        color: colorValue(embed.color),
        ...(embed.fields?.length ? { fields: embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })) } : {}),
        ...(embed.image ? { image: { url: embed.image } } : {}),
        ...(embed.thumbnail ? { thumbnail: { url: embed.thumbnail } } : {}),
        ...(embed.footer ? { footer: { text: embed.footer } } : {}),
        ...(embed.timestamp ? { timestamp: embed.timestamp.toISOString() } : {}),
    };
}
//# sourceMappingURL=DiscordRestFivemGateway.js.map