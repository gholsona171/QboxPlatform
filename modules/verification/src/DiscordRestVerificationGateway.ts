import { MISSING_PANEL_CHANNEL_MESSAGE, colorValue, isMissingChannelError, type DiscordRestClient } from "@qbox/shared/discord-rest";
import type { OutgoingMessage } from "@qbox/shared/messages";

import type { GuildMemberInfo, VerificationEmbed, VerificationGateway, VerificationPanel } from "./types.js";
import { VERIFICATION_CUSTOM_ID } from "./types.js";
import { VerificationError } from "./validation.js";

interface ApiMember {
  readonly nick?: string | null;
  readonly roles: readonly string[];
  readonly user: { readonly id: string; readonly username: string; readonly global_name?: string | null };
}

const GUILD_NAME_CACHE_MS = 10 * 60_000;

/** Verification actions through the Discord REST API (v10). */
export class DiscordRestVerificationGateway implements VerificationGateway {
  private readonly names = new Map<string, { readonly name: string; readonly at: number }>();

  public constructor(
    private readonly rest: DiscordRestClient,
    private readonly now: () => number = Date.now,
  ) {}

  public async member(guildId: string, userId: string): Promise<GuildMemberInfo | undefined> {
    try {
      const member = (await this.rest.get(`/guilds/${guildId}/members/${userId}`)) as ApiMember;
      return { userId, displayName: member.nick ?? member.user.global_name ?? member.user.username, roleIds: member.roles };
    } catch {
      return undefined;
    }
  }

  public async guildName(guildId: string): Promise<string> {
    const cached = this.names.get(guildId);
    if (cached && this.now() - cached.at < GUILD_NAME_CACHE_MS) return cached.name;
    const guild = (await this.rest.get(`/guilds/${guildId}`)) as { readonly name: string };
    this.names.set(guildId, { name: guild.name, at: this.now() });
    return guild.name;
  }

  public async addRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void> {
    await this.rest.put(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
  }

  public async removeRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void> {
    await this.rest.delete(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
  }

  public async kick(guildId: string, userId: string, reason: string): Promise<void> {
    await this.rest.delete(`/guilds/${guildId}/members/${userId}`, { reason });
  }

  public async directMessage(userId: string, content: string): Promise<boolean> {
    try {
      const channel = (await this.rest.post("/users/@me/channels", { body: { recipient_id: userId } })) as { readonly id: string };
      await this.rest.post(`/channels/${channel.id}/messages`, { body: { content, allowed_mentions: { parse: [] } } });
      return true;
    } catch {
      return false;
    }
  }

  public async sendMessage(channelId: string, message: OutgoingMessage, mentionUserId: string): Promise<void> {
    await this.rest.post(`/channels/${channelId}/messages`, { body: { ...message, allowed_mentions: { parse: [], users: [mentionUserId] } } });
  }

  public async postEmbed(channelId: string, embed: VerificationEmbed): Promise<void> {
    await this.rest.post(`/channels/${channelId}/messages`, {
      body: {
        embeds: [{ title: embed.title, description: embed.description, color: colorValue(embed.color), ...(embed.footer ? { footer: { text: embed.footer } } : {}), timestamp: new Date(this.now()).toISOString() }],
        allowed_mentions: { parse: [] },
      },
    });
  }

  public async publishPanel(channelId: string, panel: VerificationPanel, existingMessageId?: string): Promise<{ readonly messageId: string }> {
    const body = {
      embeds: [{ title: panel.title, description: panel.description, color: colorValue(panel.color) }],
      components: [{ type: 1, components: [{ type: 2, style: 3, label: panel.buttonLabel, custom_id: VERIFICATION_CUSTOM_ID.start }] }],
      allowed_mentions: { parse: [] },
    };
    if (existingMessageId) {
      try {
        await this.rest.patch(`/channels/${channelId}/messages/${existingMessageId}`, { body });
        return { messageId: existingMessageId };
      } catch (error) {
        // A deleted channel cannot take a new post either; otherwise the old panel was deleted, so post a new one below.
        if (isMissingChannelError(error)) throw new VerificationError("INVALID_STATE", MISSING_PANEL_CHANNEL_MESSAGE);
      }
    }
    try {
      const message = (await this.rest.post(`/channels/${channelId}/messages`, { body })) as { readonly id: string };
      return { messageId: message.id };
    } catch (error) {
      if (isMissingChannelError(error)) throw new VerificationError("INVALID_STATE", MISSING_PANEL_CHANNEL_MESSAGE);
      throw error;
    }
  }
}
