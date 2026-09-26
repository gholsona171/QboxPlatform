import type {
  BotStatus,
  BuilderGateway,
  ChannelCreateInput,
  ExistingChannel,
  ExistingRole,
  ForumPostInput,
  RoleCreateInput,
  WipeExpression,
  WipeLayout,
} from "@qbox/server-builder";

import { TtlCache } from "../cache/TtlCache.js";

/** The bot's own standing in a server (owner, roles, bot member) is reused for a minute. */
export const BOT_STATUS_CACHE_MS = 60_000;

/**
 * Builder gateway that remembers `botStatus` per server for the builder page
 * overview, which otherwise reads the server, its roles, and the bot member
 * from Discord on every load. Any change the builder makes in a server, and
 * `forget` (called when a run finishes), drops that server's entry.
 * Role, channel, and layout reads used while building are never cached.
 */
export class CachedBuilderGateway implements BuilderGateway {
  private readonly status: TtlCache<string, BotStatus>;

  public constructor(
    private readonly inner: BuilderGateway,
    options: { readonly ttlMs?: number; readonly now?: () => number } = {},
  ) {
    this.status = new TtlCache({ ttlMs: options.ttlMs ?? BOT_STATUS_CACHE_MS, maxEntries: 500, ...(options.now ? { now: options.now } : {}) });
  }

  public forget(guildId: string): void {
    this.status.delete(guildId);
  }

  public botStatus(guildId: string): Promise<BotStatus> {
    return this.status.getOrLoad(guildId, () => this.inner.botStatus(guildId));
  }

  public listRoles(guildId: string): Promise<readonly ExistingRole[]> {
    return this.inner.listRoles(guildId);
  }

  public listChannels(guildId: string): Promise<readonly ExistingChannel[]> {
    return this.inner.listChannels(guildId);
  }

  public readLayout(guildId: string): Promise<WipeLayout> {
    return this.inner.readLayout(guildId);
  }

  public listEmojis(guildId: string): Promise<readonly WipeExpression[]> {
    return this.inner.listEmojis(guildId);
  }

  public listStickers(guildId: string): Promise<readonly WipeExpression[]> {
    return this.inner.listStickers(guildId);
  }

  public createRole(guildId: string, input: RoleCreateInput, reason: string): Promise<string> {
    this.forget(guildId);
    return this.inner.createRole(guildId, input, reason);
  }

  public setRolePositions(guildId: string, positions: readonly { readonly id: string; readonly position: number }[], reason: string): Promise<void> {
    this.forget(guildId);
    return this.inner.setRolePositions(guildId, positions, reason);
  }

  public createChannel(guildId: string, input: ChannelCreateInput, reason: string): Promise<string> {
    return this.inner.createChannel(guildId, input, reason);
  }

  public createForumPost(channelId: string, input: ForumPostInput, reason: string): Promise<{ readonly threadId: string }> {
    return this.inner.createForumPost(channelId, input, reason);
  }

  public pinForumPost(threadId: string, reason: string): Promise<void> {
    return this.inner.pinForumPost(threadId, reason);
  }

  public deleteChannel(channelId: string, reason: string): Promise<void> {
    return this.inner.deleteChannel(channelId, reason);
  }

  public deleteRole(guildId: string, roleId: string, reason: string): Promise<void> {
    this.forget(guildId);
    return this.inner.deleteRole(guildId, roleId, reason);
  }

  public deleteEmoji(guildId: string, emojiId: string, reason: string): Promise<void> {
    return this.inner.deleteEmoji(guildId, emojiId, reason);
  }

  public deleteSticker(guildId: string, stickerId: string, reason: string): Promise<void> {
    return this.inner.deleteSticker(guildId, stickerId, reason);
  }
}
