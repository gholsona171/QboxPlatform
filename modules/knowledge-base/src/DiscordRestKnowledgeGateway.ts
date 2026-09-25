import { colorValue, type DiscordRestClient } from "@qbox/shared/discord-rest";

import type { KnowledgeEmbed, KnowledgeGateway } from "./types.js";

/** Knowledge base messages through the Discord REST API (v10). */
export class DiscordRestKnowledgeGateway implements KnowledgeGateway {
  public constructor(private readonly rest: DiscordRestClient) {}

  public async postEmbed(channelId: string, embed: KnowledgeEmbed): Promise<{ readonly messageId: string }> {
    const message = (await this.rest.post(`/channels/${channelId}/messages`, { body: { embeds: [toEmbed(embed)], allowed_mentions: { parse: [] } } })) as { readonly id: string };
    return { messageId: message.id };
  }

  public async replyEmbed(channelId: string, messageId: string, content: string, embed: KnowledgeEmbed): Promise<void> {
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

function toEmbed(embed: KnowledgeEmbed) {
  return {
    title: embed.title,
    description: embed.description,
    color: colorValue(embed.color),
    ...(embed.url ? { url: embed.url } : {}),
    ...(embed.fields?.length ? { fields: embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })) } : {}),
    ...(embed.footer ? { footer: { text: embed.footer } } : {}),
  };
}
