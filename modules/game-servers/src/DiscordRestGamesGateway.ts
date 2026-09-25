import type { DiscordRestClient } from "@qbox/shared/discord-rest";
import type { OutgoingMessage } from "@qbox/shared/messages";

import type { GamesGateway } from "./types.js";

/** Game server status messages, alerts, and channel renames through the Discord REST API (v10). */
export class DiscordRestGamesGateway implements GamesGateway {
  public constructor(private readonly rest: DiscordRestClient) {}

  public async upsertStatusMessage(channelId: string, messageId: string | undefined, message: OutgoingMessage, connectUrl: string | undefined): Promise<string> {
    const body = { content: message.content ?? "", embeds: message.embeds ?? [], components: connectButton(connectUrl), allowed_mentions: { parse: [] } };
    if (messageId) {
      try {
        await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, { body });
        return messageId;
      } catch {
        // Deleted or not editable: post a new message below.
      }
    }
    const posted = (await this.rest.post(`/channels/${channelId}/messages`, { body })) as { readonly id: string };
    return posted.id;
  }

  public async postAlert(channelId: string, message: OutgoingMessage, roleId: string | undefined): Promise<void> {
    const content = message.content ?? "";
    await this.rest.post(`/channels/${channelId}/messages`, {
      body: {
        content: roleId ? `<@&${roleId}> ${content}`.trim() : content,
        embeds: message.embeds ?? [],
        allowed_mentions: { parse: [], roles: roleId ? [roleId] : [] },
      },
    });
  }

  public async renameChannel(channelId: string, name: string): Promise<void> {
    await this.rest.patch(`/channels/${channelId}`, { body: { name }, reason: "Game server player count" });
  }
}

/** A link button row for an http(s) connect link, or no components. */
export function connectButton(connectUrl: string | undefined) {
  return connectUrl ? [{ type: 1, components: [{ type: 2, style: 5, label: "Connect", url: connectUrl }] }] : [];
}
