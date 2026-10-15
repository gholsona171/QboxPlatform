import { colorValue } from "@qbox/shared/discord-rest";
/** Knowledge base messages through the Discord REST API (v10). */
export class DiscordRestKnowledgeGateway {
    rest;
    constructor(rest) {
        this.rest = rest;
    }
    async postEmbed(channelId, embed) {
        const message = (await this.rest.post(`/channels/${channelId}/messages`, { body: { embeds: [toEmbed(embed)], allowed_mentions: { parse: [] } } }));
        return { messageId: message.id };
    }
    async replyEmbed(channelId, messageId, content, embed) {
        await this.rest.post(`/channels/${channelId}/messages`, {
            body: {
                content,
                embeds: [toEmbed(embed)],
                message_reference: { message_id: messageId, fail_if_not_exists: false },
                allowed_mentions: { parse: [], replied_user: false },
            },
        });
    }
}
function toEmbed(embed) {
    return {
        title: embed.title,
        description: embed.description,
        color: colorValue(embed.color),
        ...(embed.url ? { url: embed.url } : {}),
        ...(embed.fields?.length ? { fields: embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })) } : {}),
        ...(embed.footer ? { footer: { text: embed.footer } } : {}),
    };
}
//# sourceMappingURL=DiscordRestKnowledgeGateway.js.map