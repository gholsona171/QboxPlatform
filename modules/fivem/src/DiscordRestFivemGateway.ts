import { colorValue, type DiscordRestClient } from "@qbox/shared/discord-rest";

import type { FivemEmbed, FivemGateway } from "./types.js";

/** FiveM status messages and alerts through the Discord REST API (v10). */
export class DiscordRestFivemGateway implements FivemGateway {
  public constructor(private readonly rest: DiscordRestClient) {}

  public async upsertStatusMessage(channelId: string, messageId: string | undefined, embed: FivemEmbed, connectUrl: string | undefined): Promise<string> {
    const body = { embeds: [toEmbed(embed)], components: connectButton(connectUrl), allowed_mentions: { parse: [] } };
    if (messageId) {
      try {
        await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, { body });
        return messageId;
      } catch {
        // Deleted or not editable: post a new message below.
      }
    }
    const message = (await this.rest.post(`/channels/${channelId}/messages`, { body })) as { readonly id: string };
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

/** A link button row for the cfx.re join link, or no components. */
export function connectButton(connectUrl: string | undefined) {
  return connectUrl ? [{ type: 1, components: [{ type: 2, style: 5, label: "Connect", url: connectUrl }] }] : [];
}

function toEmbed(embed: FivemEmbed) {
  return {
    title: embed.title,
    description: embed.description,
    color: colorValue(embed.color),
    ...(embed.fields?.length ? { fields: embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })) } : {}),
    ...(embed.footer ? { footer: { text: embed.footer } } : {}),
    ...(embed.timestamp ? { timestamp: embed.timestamp.toISOString() } : {}),
  };
}
