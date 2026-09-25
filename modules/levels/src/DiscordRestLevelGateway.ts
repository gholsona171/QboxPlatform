import type { DiscordRestClient } from "@qbox/shared/discord-rest";

import type { LevelGateway } from "./types.js";

interface ApiMember { readonly roles: readonly string[] }

/** Level rewards and level-up messages through the Discord REST API (v10). */
export class DiscordRestLevelGateway implements LevelGateway {
  public constructor(private readonly rest: DiscordRestClient) {}

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

  public async sendMessage(channelId: string, content: string, mentionUserId: string): Promise<void> {
    await this.rest.post(`/channels/${channelId}/messages`, { body: { content, allowed_mentions: { parse: [], users: [mentionUserId] } } });
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
}
