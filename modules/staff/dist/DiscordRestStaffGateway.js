import { colorValue } from "@qbox/shared/discord-rest";
/** Staff role changes and messages through the Discord REST API (v10). */
export class DiscordRestStaffGateway {
    rest;
    constructor(rest) {
        this.rest = rest;
    }
    async addRole(guildId, userId, roleId, reason) {
        await this.rest.put(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
    }
    async removeRole(guildId, userId, roleId, reason) {
        await this.rest.delete(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
    }
    async postEmbed(channelId, embed, buttons = []) {
        const message = (await this.rest.post(`/channels/${channelId}/messages`, { body: messageBody(embed, buttons) }));
        return { messageId: message.id };
    }
    async editEmbed(channelId, messageId, embed, buttons = []) {
        await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, { body: messageBody(embed, buttons) });
    }
}
function messageBody(embed, buttons) {
    return {
        embeds: [{
                title: embed.title,
                description: embed.description,
                color: colorValue(embed.color),
                ...(embed.fields?.length ? { fields: embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })) } : {}),
                ...(embed.footer ? { footer: { text: embed.footer } } : {}),
                timestamp: new Date().toISOString(),
            }],
        components: buttons.length
            ? [{ type: 1, components: buttons.map((button) => ({ type: 2, style: button.style === "success" ? 3 : 4, label: button.label, custom_id: button.customId })) }]
            : [],
        allowed_mentions: { parse: [] },
    };
}
//# sourceMappingURL=DiscordRestStaffGateway.js.map