import type { DiscordRestClient } from "@qbox/shared/discord-rest";

import type { BotStatus, BuilderGateway, ChannelCreateInput, ExistingChannel, ExistingRole, ForumPostInput, RoleCreateInput, WipeExpression, WipeLayout, WipeLayoutChannel, WipeLayoutRole } from "./types.js";

interface ApiRole { readonly id: string; readonly name: string; readonly position: number; readonly permissions: string; readonly managed?: boolean; readonly color?: number; readonly hoist?: boolean; readonly mentionable?: boolean }
interface ApiOverwrite { readonly id: string; readonly type: number; readonly allow: string; readonly deny: string }
interface ApiChannel { readonly id: string; readonly name: string; readonly type: number; readonly parent_id?: string | null; readonly topic?: string | null; readonly nsfw?: boolean; readonly rate_limit_per_user?: number; readonly user_limit?: number; readonly bitrate?: number; readonly position?: number; readonly permission_overwrites?: readonly ApiOverwrite[] }
interface ApiGuild { readonly name?: string; readonly features?: readonly string[]; readonly owner_id?: string; readonly rules_channel_id?: string | null; readonly public_updates_channel_id?: string | null }
interface ApiMember { readonly roles: readonly string[] }
interface ApiEmoji { readonly id: string | null; readonly name: string | null }
interface ApiSticker { readonly id: string; readonly name: string }

/** Discord's PINNED flag for forum posts. */
const PINNED = 2;

/** `name:id` becomes a custom emoji; anything else is a unicode emoji. */
function emojiFields(emoji: string): { emoji_id: string | null; emoji_name: string | null } {
  const custom = /^[a-zA-Z0-9_]{2,32}:(\d{17,20})$/.exec(emoji);
  return custom ? { emoji_id: custom[1] as string, emoji_name: null } : { emoji_id: null, emoji_name: emoji };
}

/** Server builder operations through the Discord REST API (v10). */
export class DiscordRestBuilderGateway implements BuilderGateway {
  private botUserId: string | undefined;

  public constructor(private readonly rest: DiscordRestClient) {}

  public async listRoles(guildId: string): Promise<readonly ExistingRole[]> {
    const roles = (await this.rest.get(`/guilds/${guildId}/roles`)) as readonly ApiRole[];
    return roles.map((role) => ({ id: role.id, name: role.name, position: role.position, managed: role.managed === true, permissions: role.permissions }));
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
      ...(guild.owner_id ? { ownerId: guild.owner_id } : {}),
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
        ...(input.tags?.length ? { available_tags: input.tags.map((tag) => ({ name: tag.name, moderated: false, ...(tag.emoji ? emojiFields(tag.emoji) : {}) })) } : {}),
        ...(input.defaultReactionEmoji ? { default_reaction_emoji: emojiFields(input.defaultReactionEmoji) } : {}),
      },
      reason,
    })) as { readonly id: string };
    return channel.id;
  }

  public async createForumPost(channelId: string, input: ForumPostInput, reason: string): Promise<{ readonly threadId: string }> {
    const thread = (await this.rest.post(`/channels/${channelId}/threads`, {
      body: { name: input.title, message: { content: input.content }, applied_tags: [] },
      reason,
    })) as { readonly id: string };
    return { threadId: thread.id };
  }

  public async pinForumPost(threadId: string, reason: string): Promise<void> {
    await this.rest.patch(`/channels/${threadId}`, { body: { flags: PINNED }, reason });
  }

  /** Deleting something that is already gone counts as done. */
  public async deleteChannel(channelId: string, reason: string): Promise<void> {
    await this.rest.delete(`/channels/${channelId}`, { reason }).catch(ignoreMissing);
  }

  public async deleteRole(guildId: string, roleId: string, reason: string): Promise<void> {
    await this.rest.delete(`/guilds/${guildId}/roles/${roleId}`, { reason }).catch(ignoreMissing);
  }

  public async readLayout(guildId: string): Promise<WipeLayout> {
    const [guild, roles, channels] = await Promise.all([
      this.rest.get(`/guilds/${guildId}`) as Promise<ApiGuild>,
      this.rest.get(`/guilds/${guildId}/roles`) as Promise<readonly ApiRole[]>,
      this.rest.get(`/guilds/${guildId}/channels`) as Promise<readonly ApiChannel[]>,
    ]);
    return {
      name: guild.name ?? "",
      community: guild.features?.includes("COMMUNITY") ?? false,
      ...(guild.rules_channel_id ? { rulesChannelId: guild.rules_channel_id } : {}),
      ...(guild.public_updates_channel_id ? { publicUpdatesChannelId: guild.public_updates_channel_id } : {}),
      roles: roles.map(toLayoutRole),
      channels: channels.map(toLayoutChannel),
    };
  }

  public async listEmojis(guildId: string): Promise<readonly WipeExpression[]> {
    const emojis = (await this.rest.get(`/guilds/${guildId}/emojis`)) as readonly ApiEmoji[];
    return emojis.flatMap((emoji) => (emoji.id ? [{ id: emoji.id, name: emoji.name ?? emoji.id }] : []));
  }

  public async listStickers(guildId: string): Promise<readonly WipeExpression[]> {
    const stickers = (await this.rest.get(`/guilds/${guildId}/stickers`)) as readonly ApiSticker[];
    return stickers.map((sticker) => ({ id: sticker.id, name: sticker.name }));
  }

  public async deleteEmoji(guildId: string, emojiId: string, reason: string): Promise<void> {
    await this.rest.delete(`/guilds/${guildId}/emojis/${emojiId}`, { reason }).catch(ignoreMissing);
  }

  public async deleteSticker(guildId: string, stickerId: string, reason: string): Promise<void> {
    await this.rest.delete(`/guilds/${guildId}/stickers/${stickerId}`, { reason }).catch(ignoreMissing);
  }

  private async selfId(): Promise<string> {
    if (!this.botUserId) this.botUserId = ((await this.rest.get("/users/@me")) as { readonly id: string }).id;
    return this.botUserId;
  }
}

function toLayoutRole(role: ApiRole): WipeLayoutRole {
  return {
    id: role.id,
    name: role.name,
    color: role.color ?? 0,
    hoist: role.hoist === true,
    mentionable: role.mentionable === true,
    permissions: role.permissions,
    position: role.position,
    managed: role.managed === true,
  };
}

function toLayoutChannel(channel: ApiChannel): WipeLayoutChannel {
  return {
    id: channel.id,
    name: channel.name,
    type: channel.type,
    nsfw: channel.nsfw === true,
    slowmodeSeconds: channel.rate_limit_per_user ?? 0,
    userLimit: channel.user_limit ?? 0,
    position: channel.position ?? 0,
    ...(channel.topic ? { topic: channel.topic } : {}),
    ...(typeof channel.bitrate === "number" ? { bitrate: channel.bitrate } : {}),
    ...(channel.parent_id ? { parentId: channel.parent_id } : {}),
    overwrites: (channel.permission_overwrites ?? []).map((overwrite) => ({
      id: overwrite.id,
      type: overwrite.type === 1 ? 1 : 0,
      allow: overwrite.allow,
      deny: overwrite.deny,
    })),
  };
}

function ignoreMissing(error: unknown): void {
  if (error && typeof error === "object" && "status" in error && error.status === 404) return;
  throw error;
}
