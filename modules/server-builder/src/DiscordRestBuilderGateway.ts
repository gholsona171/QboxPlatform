import type { DiscordRestClient } from "@qbox/shared/discord-rest";

import type { BotStatus, BuilderGateway, ChannelCreateInput, ExistingChannel, ExistingRole, RoleCreateInput } from "./types.js";

interface ApiRole { readonly id: string; readonly name: string; readonly position: number; readonly permissions: string; readonly managed?: boolean }
interface ApiChannel { readonly id: string; readonly name: string; readonly type: number; readonly parent_id?: string | null }
interface ApiGuild { readonly features?: readonly string[] }
interface ApiMember { readonly roles: readonly string[] }

/** Server builder operations through the Discord REST API (v10). */
export class DiscordRestBuilderGateway implements BuilderGateway {
  private botUserId: string | undefined;

  public constructor(private readonly rest: DiscordRestClient) {}

  public async listRoles(guildId: string): Promise<readonly ExistingRole[]> {
    const roles = (await this.rest.get(`/guilds/${guildId}/roles`)) as readonly ApiRole[];
    return roles.map((role) => ({ id: role.id, name: role.name, position: role.position, managed: role.managed === true }));
  }

  public async listChannels(guildId: string): Promise<readonly ExistingChannel[]> {
    const channels = (await this.rest.get(`/guilds/${guildId}/channels`)) as readonly ApiChannel[];
    return channels.map((channel) => ({ id: channel.id, name: channel.name, type: channel.type, ...(channel.parent_id ? { parentId: channel.parent_id } : {}) }));
  }

  public async botStatus(guildId: string): Promise<BotStatus> {
    const userId = await this.selfId();
    const [guild, roles, member] = await Promise.all([
      this.rest.get(`/guilds/${guildId}`) as Promise<ApiGuild>,
      this.rest.get(`/guilds/${guildId}/roles`) as Promise<readonly ApiRole[]>,
      this.rest.get(`/guilds/${guildId}/members/${userId}`) as Promise<ApiMember>,
    ]);
    const mine = roles.filter((role) => role.id === guildId || member.roles.includes(role.id));
    return {
      userId,
      permissions: mine.reduce((bits, role) => bits | BigInt(role.permissions), 0n),
      topRolePosition: mine.reduce((top, role) => Math.max(top, role.position), 0),
      highestRolePosition: roles.reduce((top, role) => Math.max(top, role.position), 0),
      community: guild.features?.includes("COMMUNITY") ?? false,
    };
  }

  public async createRole(guildId: string, input: RoleCreateInput, reason: string): Promise<string> {
    const role = (await this.rest.post(`/guilds/${guildId}/roles`, {
      body: { name: input.name, color: input.color, hoist: input.hoist, mentionable: input.mentionable, permissions: input.permissions },
      reason,
    })) as { readonly id: string };
    return role.id;
  }

  public async setRolePositions(guildId: string, positions: readonly { readonly id: string; readonly position: number }[], reason: string): Promise<void> {
    await this.rest.patch(`/guilds/${guildId}/roles`, { body: positions.map((item) => ({ id: item.id, position: item.position })), reason });
  }

  public async createChannel(guildId: string, input: ChannelCreateInput, reason: string): Promise<string> {
    const channel = (await this.rest.post(`/guilds/${guildId}/channels`, {
      body: {
        name: input.name,
        type: input.type,
        permission_overwrites: input.overwrites.map((overwrite) => ({ id: overwrite.id, type: overwrite.type, allow: overwrite.allow, deny: overwrite.deny })),
        ...(input.parentId ? { parent_id: input.parentId } : {}),
        ...(input.topic ? { topic: input.topic } : {}),
        ...(input.slowmodeSeconds ? { rate_limit_per_user: input.slowmodeSeconds } : {}),
        ...(input.nsfw ? { nsfw: true } : {}),
        ...(input.userLimit ? { user_limit: input.userLimit } : {}),
      },
      reason,
    })) as { readonly id: string };
    return channel.id;
  }

  /** Deleting something that is already gone counts as done. */
  public async deleteChannel(channelId: string, reason: string): Promise<void> {
    await this.rest.delete(`/channels/${channelId}`, { reason }).catch(ignoreMissing);
  }

  public async deleteRole(guildId: string, roleId: string, reason: string): Promise<void> {
    await this.rest.delete(`/guilds/${guildId}/roles/${roleId}`, { reason }).catch(ignoreMissing);
  }

  private async selfId(): Promise<string> {
    if (!this.botUserId) this.botUserId = ((await this.rest.get("/users/@me")) as { readonly id: string }).id;
    return this.botUserId;
  }
}

function ignoreMissing(error: unknown): void {
  if (error && typeof error === "object" && "status" in error && error.status === 404) return;
  throw error;
}
