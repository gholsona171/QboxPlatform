import { colorValue } from "@qbox/shared/discord-rest";
/** Posts scheduled messages through the Discord REST API (v10). */
export class DiscordRestScheduledMessageGateway {
    rest;
    constructor(rest) {
        this.rest = rest;
    }
    async post(channelId, message) {
        const pings = message.pingRoleIds.map((id) => `<@&${id}>`).join(" ");
        const content = [pings, message.content ?? ""].filter(Boolean).join(" ");
        const embed = message.embed;
        const posted = (await this.rest.post(`/channels/${channelId}/messages`, {
            body: {
                ...(content ? { content } : {}),
                ...(embed
                    ? {
                        embeds: [{
                                ...(embed.title ? { title: embed.title } : {}),
                                ...(embed.description ? { description: embed.description } : {}),
                                ...(embed.color ? { color: colorValue(embed.color) } : {}),
                                ...(embed.imageUrl ? { image: { url: embed.imageUrl } } : {}),
                                ...(embed.footer ? { footer: { text: embed.footer } } : {}),
                                ...(embed.fields.length ? { fields: embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline })) } : {}),
                            }],
                    }
                    : {}),
                allowed_mentions: { parse: [], roles: [...message.pingRoleIds] },
            },
        }));
        return { messageId: posted.id };
    }
    async deleteMessage(channelId, messageId) {
        await this.rest.delete(`/channels/${channelId}/messages/${messageId}`, { reason: "Replaced by the next scheduled post" });
    }
    async pin(channelId, messageId) {
        await this.rest.put(`/channels/${channelId}/pins/${messageId}`, { reason: "Scheduled message" });
    }
}
//# sourceMappingURL=DiscordRestScheduledMessageGateway.js.map