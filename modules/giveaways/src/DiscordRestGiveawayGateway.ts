import { colorValue, type DiscordRestClient } from "@qbox/shared/discord-rest";

import type { GiveawayGateway, GiveawayMessage } from "./types.js";

/** Giveaway messages and winner DMs through the Discord REST API (v10). */
export class DiscordRestGiveawayGateway implements GiveawayGateway {
  public constructor(private readonly rest: DiscordRestClient) {}

  public async postMessage(channelId: string, message: GiveawayMessage, replyToMessageId?: string): Promise<{ readonly messageId: string }> {
    const body = {
      ...toBody(message),
      ...(replyToMessageId ? { message_reference: { message_id: replyToMessageId, fail_if_not_exists: false } } : {}),
    };
    const posted = (await this.rest.post(`/channels/${channelId}/messages`, { body })) as { readonly id: string };
    return { messageId: posted.id };
  }

  public async editMessage(channelId: string, messageId: string, message: GiveawayMessage): Promise<void> {
    await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, { body: toBody(message) });
  }

  public async directMessage(userId: string, message: GiveawayMessage): Promise<boolean> {
    try {
      const channel = (await this.rest.post("/users/@me/channels", { body: { recipient_id: userId } })) as { readonly id: string };
      await this.rest.post(`/channels/${channel.id}/messages`, { body: toBody(message) });
      return true;
    } catch {
      return false;
    }
  }
}

function toBody(message: GiveawayMessage) {
  return {
    content: message.content ?? "",
    embeds: message.embed
      ? [{
          title: message.embed.title,
          description: message.embed.description,
          color: colorValue(message.embed.color),
          ...(message.embed.fields.length ? { fields: message.embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })) } : {}),
          ...(message.embed.footer ? { footer: { text: message.embed.footer } } : {}),
        }]
      : [],
    components: message.enterButton
      ? [{ type: 1, components: [{ type: 2, style: 1, custom_id: message.enterButton.customId, label: message.enterButton.label, emoji: { name: "🎉" } }] }]
      : [],
    allowed_mentions: { parse: [], users: [...message.mentionUserIds], roles: [...message.mentionRoleIds] },
  };
}
