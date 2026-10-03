import { colorValue } from "@qbox/shared/discord-rest";
/** FiveM status messages and alerts through the Discord REST API (v10). */
export class DiscordRestFivemGateway {
    rest;
    constructor(rest) {
        this.rest = rest;
    }
    async upsertStatusMessage(channelId, messageId, embed, connectUrl) {
        const body = { embeds: [toEmbed(embed)], components: connectButton(connectUrl), allowed_mentions: { parse: [] } };
        if (messageId) {
            try {
                await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, { body });
                return messageId;
            }
            catch {
                // Deleted or not editable: post a new message below.
            }
        }
        const message = (await this.rest.post(`/channels/${channelId}/messages`, { body }));
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
/** A link button row for the cfx.re join link, or no components. */
export function connectButton(connectUrl) {
    return connectUrl ? [{ type: 1, components: [{ type: 2, style: 5, label: "Connect", url: connectUrl }] }] : [];
}
function toEmbed(embed) {
    return {
        title: embed.title,
        description: embed.description,
        color: colorValue(embed.color),
        ...(embed.fields?.length ? { fields: embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })) } : {}),
        ...(embed.footer ? { footer: { text: embed.footer } } : {}),
        ...(embed.timestamp ? { timestamp: embed.timestamp.toISOString() } : {}),
    };
}
//# sourceMappingURL=DiscordRestFivemGateway.js.map