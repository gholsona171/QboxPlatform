import { GuildNameCache } from "@qbox/shared/discord-rest";
/** Giveaway messages and winner DMs through the Discord REST API (v10). */
export class DiscordRestGiveawayGateway {
    rest;
    guildNames;
    constructor(rest) {
        this.rest = rest;
        this.guildNames = new GuildNameCache(rest);
    }
    guildName(guildId) {
        return this.guildNames.name(guildId);
    }
    async postMessage(channelId, message, replyToMessageId) {
        const body = {
            ...toBody(message),
            ...(replyToMessageId ? { message_reference: { message_id: replyToMessageId, fail_if_not_exists: false } } : {}),
        };
        const posted = (await this.rest.post(`/channels/${channelId}/messages`, { body }));
        return { messageId: posted.id };
    }
    async editMessage(channelId, messageId, message) {
        await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, { body: toBody(message) });
    }
    async directMessage(userId, message) {
        try {
            const channel = (await this.rest.post("/users/@me/channels", { body: { recipient_id: userId } }));
            await this.rest.post(`/channels/${channel.id}/messages`, { body: toBody(message) });
            return true;
        }
        catch {
            return false;
        }
    }
}
function toBody(message) {
    return {
        content: message.content ?? "",
        embeds: message.embeds ?? [],
        components: message.enterButton
            ? [{ type: 1, components: [{ type: 2, style: 1, custom_id: message.enterButton.customId, label: message.enterButton.label, emoji: { name: "🎉" } }] }]
            : [],
        allowed_mentions: { parse: [], users: [...message.mentionUserIds], roles: [...message.mentionRoleIds] },
    };
}
//# sourceMappingURL=DiscordRestGiveawayGateway.js.map