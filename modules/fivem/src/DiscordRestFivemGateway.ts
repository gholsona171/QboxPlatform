import { colorValue, DISCORD_ERROR, discordErrorCode, type DiscordRestClient } from "@qbox/shared/discord-rest";

import type { FivemEmbed, FivemGateway, FivemImage, FivemStatusMessageOptions } from "./types.js";

/** FiveM status messages and alerts through the Discord REST API (v10). */
export class DiscordRestFivemGateway implements FivemGateway {
  public constructor(private readonly rest: DiscordRestClient) {}

  public async upsertStatusMessage(
    channelId: string,
    messageId: string | undefined,
    embed: FivemEmbed,
    connectUrl: string | undefined,
    options: FivemStatusMessageOptions = {},
  ): Promise<string> {
    if (messageId) {
      try {
        await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, request(embed, connectUrl, options.refreshImage ? options.image : undefined));
        return messageId;
      } catch (error) {
        // Only a deleted message is replaced. A rate limit or a Discord hiccup
        // is thrown, so the next check edits the same message again instead
        // of leaving a stale copy behind and posting a duplicate.
        if (discordErrorCode(error) !== DISCORD_ERROR.unknownMessage) throw error;
      }
    }
    const message = (await this.rest.post(`/channels/${channelId}/messages`, request(embed, connectUrl, options.image))) as { readonly id: string };
    return message.id;
  }

  public async postAlert(channelId: string, content: string, embed: FivemEmbed, roleId: string | undefined): Promise<void> {
    await this.rest.post(`/channels/${channelId}/messages`, {
      body: {
        content: roleId ? `<@&${roleId}> ${content}` : content,
        embeds: [toEmbed(embed)],
        allowed_mentions: { parse: [], roles: roleId ? [roleId] : [] },
      },
    });
  }
}

function request(embed: FivemEmbed, connectUrl: string | undefined, image: FivemImage | undefined) {
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
export function connectButton(connectUrl: string | undefined) {
  return connectUrl ? [{ type: 1, components: [{ type: 2, style: 5, label: "Connect", url: connectUrl }] }] : [];
}

export function toEmbed(embed: FivemEmbed) {
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
