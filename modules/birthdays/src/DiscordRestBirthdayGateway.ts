import type { DiscordRestClient } from "@qbox/shared/discord-rest";

import type { BirthdayAnnouncement, BirthdayGateway } from "./types.js";

const GUILD_CACHE_MS = 10 * 60_000;

/** Birthday messages and roles through the Discord REST API (v10). */
export class DiscordRestBirthdayGateway implements BirthdayGateway {
  private readonly names = new Map<string, { readonly name: string; readonly at: number }>();

  public constructor(
    private readonly rest: DiscordRestClient,
    private readonly now: () => number = Date.now,
  ) {}

  public async guildName(guildId: string): Promise<string> {
    const cached = this.names.get(guildId);
    if (cached && this.now() - cached.at < GUILD_CACHE_MS) return cached.name;
    const guild = (await this.rest.get(`/guilds/${guildId}`)) as { readonly name: string };
    this.names.set(guildId, { name: guild.name, at: this.now() });
    return guild.name;
  }

  public async post(channelId: string, announcement: BirthdayAnnouncement): Promise<{ readonly messageId: string }> {
    const message = (await this.rest.post(`/channels/${channelId}/messages`, {
      body: {
        content: announcement.content ?? "",
        embeds: announcement.embeds ?? [],
        allowed_mentions: { parse: [], users: [...announcement.mentionUserIds], roles: [...announcement.mentionRoleIds] },
      },
    })) as { readonly id: string };
    return { messageId: message.id };
  }

  public async addRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void> {
    await this.rest.put(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
  }

  public async removeRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void> {
    await this.rest.delete(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
  }
}
