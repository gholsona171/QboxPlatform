import { GuildNameCache, type DiscordRestClient } from "@qbox/shared/discord-rest";
import type { OutgoingMessage } from "@qbox/shared/messages";

import type { LevelGateway } from "./types.js";

interface ApiMember { readonly roles: readonly string[] }

/** Level rewards and level-up messages through the Discord REST API (v10). */
export class DiscordRestLevelGateway implements LevelGateway {
  private readonly guildNames: GuildNameCache;

  public constructor(private readonly rest: DiscordRestClient) {
    this.guildNames = new GuildNameCache(rest);
  }

  public guildName(guildId: string): Promise<string> {
    return this.guildNames.name(guildId);
  }

  public async memberRoleIds(guildId: string, userId: string): Promise<readonly string[] | undefined> {
    try {
      return ((await this.rest.get(`/guilds/${guildId}/members/${userId}`)) as ApiMember).roles;
    } catch {
      return undefined;
    }
  }

  public async addRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void> {
    await this.rest.put(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
  }

  public async removeRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void> {
    await this.rest.delete(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
  }

  public async sendMessage(channelId: string, message: OutgoingMessage, mentionUserId: string): Promise<void> {
    await this.rest.post(`/channels/${channelId}/messages`, { body: { ...message, allowed_mentions: { parse: [], users: [mentionUserId] } } });
  }

  public async directMessage(userId: string, message: OutgoingMessage): Promise<boolean> {
    try {
      const channel = (await this.rest.post("/users/@me/channels", { body: { recipient_id: userId } })) as { readonly id: string };
      await this.rest.post(`/channels/${channel.id}/messages`, { body: { ...message, allowed_mentions: { parse: [] } } });
      return true;
    } catch {
      return false;
    }
  }
}
