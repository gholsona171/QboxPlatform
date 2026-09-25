import type { DiscordRestClient } from "@qbox/shared/discord-rest";
import type { OutgoingMessage } from "@qbox/shared/messages";

import type { StreamsGateway, StreamsPostOptions } from "./types.js";

/** Stream announcements through the Discord REST API (v10). */
export class DiscordRestStreamsGateway implements StreamsGateway {
  public constructor(private readonly rest: DiscordRestClient) {}

  public async post(channelId: string, message: OutgoingMessage, options: StreamsPostOptions): Promise<string> {
    const posted = (await this.rest.post(`/channels/${channelId}/messages`, { body: body(message, options) })) as { readonly id: string };
    return posted.id;
  }

  public async edit(channelId: string, messageId: string, message: OutgoingMessage, options: StreamsPostOptions): Promise<void> {
    await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, { body: body(message, options) });
  }

  public async deleteMessage(channelId: string, messageId: string): Promise<void> {
    await this.rest.delete(`/channels/${channelId}/messages/${messageId}`, { reason: "Stream ended" });
  }

  public async guildName(guildId: string): Promise<string | undefined> {
    const guild = (await this.rest.get(`/guilds/${guildId}`)) as { readonly name?: string };
    return guild.name;
  }
}

/** A link button row for the "Watch" button, or no components. */
export function watchButton(url: string | undefined) {
  return url ? [{ type: 1, components: [{ type: 2, style: 5, label: "Watch", url }] }] : [];
}

function body(message: OutgoingMessage, options: StreamsPostOptions) {
  return {
    content: message.content ?? "",
    embeds: message.embeds ?? [],
    components: watchButton(options.watchUrl),
    allowed_mentions: { parse: [], roles: options.pingRoleId ? [options.pingRoleId] : [] },
  };
}
