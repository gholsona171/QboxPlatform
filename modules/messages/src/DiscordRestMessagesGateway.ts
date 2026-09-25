import type { DiscordRestClient } from "@qbox/shared/discord-rest";
import type { OutgoingMessage } from "@qbox/shared/messages";

import type { MessagesGateway } from "./types.js";

/** Test messages and server names through the Discord REST API (v10). */
export class DiscordRestMessagesGateway implements MessagesGateway {
  public constructor(private readonly rest: DiscordRestClient) {}

  public async postMessage(channelId: string, message: OutgoingMessage): Promise<{ readonly messageId: string }> {
    const posted = (await this.rest.post(`/channels/${channelId}/messages`, {
      body: { content: message.content ?? "", embeds: message.embeds ?? [], allowed_mentions: { parse: [] } },
    })) as { readonly id: string };
    return { messageId: posted.id };
  }

  public async guildName(guildId: string): Promise<string | undefined> {
    try {
      return ((await this.rest.get(`/guilds/${guildId}`)) as { readonly name: string }).name;
    } catch {
      return undefined;
    }
  }
}
