import type { DiscordRestClient } from "@qbox/shared/discord-rest";
import type { OutgoingMessage } from "@qbox/shared/messages";

import type { MusicGateway, MusicPostOptions } from "./types.js";

/**
 * Now-playing messages through the Discord REST API (v10). A cover is sent as
 * an attachment the embed thumbnail points at (`attachment://cover.jpg`);
 * progress edits keep that attachment.
 */
export class DiscordRestMusicGateway implements MusicGateway {
  public constructor(private readonly rest: DiscordRestClient) {}

  public async post(channelId: string, message: OutgoingMessage, options: MusicPostOptions): Promise<string> {
    const posted = (await this.rest.post(`/channels/${channelId}/messages`, request(message, options))) as { readonly id: string };
    return posted.id;
  }

  public async edit(channelId: string, messageId: string, message: OutgoingMessage, options: MusicPostOptions): Promise<void> {
    await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, request(message, options));
  }

  public async deleteMessage(channelId: string, messageId: string): Promise<void> {
    await this.rest.delete(`/channels/${channelId}/messages/${messageId}`);
  }

  public async guildName(guildId: string): Promise<string | undefined> {
    const guild = (await this.rest.get(`/guilds/${guildId}`)) as { readonly name?: string };
    return guild.name;
  }
}

function request(message: OutgoingMessage, options: MusicPostOptions) {
  const attachment = options.attachment;
  const body = {
    content: message.content ?? "",
    embeds: message.embeds ?? [],
    components: options.components,
    allowed_mentions: { parse: [] },
    ...(attachment ? { attachments: [{ id: 0, filename: attachment.name }] } : options.keepAttachments ? {} : { attachments: [] }),
  };
  return attachment ? { body, files: [{ name: attachment.name, data: attachment.data }] } : { body };
}
