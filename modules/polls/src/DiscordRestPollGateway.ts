import { colorValue, emojiObject, type DiscordRestClient } from "@qbox/shared/discord-rest";

import type { PollButton, PollGateway, PollMessage } from "./types.js";

const BUTTON_STYLE: Readonly<Record<PollButton["style"], number>> = { PRIMARY: 1, SECONDARY: 2, DANGER: 4 };

/** Poll messages through the Discord REST API (v10). */
export class DiscordRestPollGateway implements PollGateway {
  public constructor(private readonly rest: DiscordRestClient) {}

  public async postMessage(channelId: string, message: PollMessage, replyToMessageId?: string): Promise<{ readonly messageId: string }> {
    const body = {
      ...toBody(message),
      ...(replyToMessageId ? { message_reference: { message_id: replyToMessageId, fail_if_not_exists: false } } : {}),
    };
    const posted = (await this.rest.post(`/channels/${channelId}/messages`, { body })) as { readonly id: string };
    return { messageId: posted.id };
  }

  public async editMessage(channelId: string, messageId: string, message: PollMessage): Promise<void> {
    await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, { body: toBody(message) });
  }

  public async deleteMessage(channelId: string, messageId: string): Promise<void> {
    await this.rest.delete(`/channels/${channelId}/messages/${messageId}`);
  }
}

/** Discord message JSON for a rendered poll message. */
function toBody(message: PollMessage) {
  const rows: unknown[] = [];
  if (message.select)
    rows.push({
      type: 1,
      components: [{
        type: 3,
        custom_id: message.select.customId,
        placeholder: message.select.placeholder,
        min_values: 1,
        max_values: message.select.maxValues,
        options: message.select.options.map((option) => ({
          label: option.label.slice(0, 100),
          value: option.value,
          ...(option.emoji ? { emoji: emojiObject(option.emoji) } : {}),
        })),
      }],
    });
  for (const row of message.buttonRows)
    rows.push({
      type: 1,
      components: row.map((button) => ({
        type: 2,
        style: BUTTON_STYLE[button.style],
        custom_id: button.customId,
        label: button.label,
        ...(button.emoji ? { emoji: emojiObject(button.emoji) } : {}),
      })),
    });
  return {
    content: message.content ?? "",
    embeds: [{
      title: message.embed.title,
      description: message.embed.description,
      color: colorValue(message.embed.color),
      ...(message.embed.fields.length ? { fields: message.embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })) } : {}),
      ...(message.embed.footer ? { footer: { text: message.embed.footer } } : {}),
    }],
    components: rows,
    allowed_mentions: { parse: [], roles: [...message.mentionRoleIds] },
  };
}
