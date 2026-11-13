import type { BotStatus, BuilderGateway, ChannelCreateInput, ExistingChannel, ExistingRole, ForumPostInput, RoleCreateInput, WipeExpression, WipeLayout } from "@qbox/server-builder";
/** The bot's own standing in a server (owner, roles, bot member) is reused for a minute. */
export declare const BOT_STATUS_CACHE_MS = 60000;
/**
 * Builder gateway that remembers `botStatus` per server for the builder page
 * overview, which otherwise reads the server, its roles, and the bot member
 * from Discord on every load. Any change the builder makes in a server, and
 * `forget` (called when a run finishes), drops that server's entry.
 * Role, channel, and layout reads used while building are never cached.
 */
export declare class CachedBuilderGateway implements BuilderGateway {
    private readonly inner;
    private readonly status;
    constructor(inner: BuilderGateway, options?: {
        readonly ttlMs?: number;
        readonly now?: () => number;
    });
    forget(guildId: string): void;
    botStatus(guildId: string): Promise<BotStatus>;
    listRoles(guildId: string): Promise<readonly ExistingRole[]>;
    listChannels(guildId: string): Promise<readonly ExistingChannel[]>;
    readLayout(guildId: string): Promise<WipeLayout>;
    listEmojis(guildId: string): Promise<readonly WipeExpression[]>;
    listStickers(guildId: string): Promise<readonly WipeExpression[]>;
    createRole(guildId: string, input: RoleCreateInput, reason: string): Promise<string>;
    setRolePositions(guildId: string, positions: readonly {
        readonly id: string;
        readonly position: number;
    }[], reason: string): Promise<void>;
    createChannel(guildId: string, input: ChannelCreateInput, reason: string): Promise<string>;
    createForumPost(channelId: string, input: ForumPostInput, reason: string): Promise<{
        readonly threadId: string;
    }>;
    pinForumPost(threadId: string, reason: string): Promise<void>;
    deleteChannel(channelId: string, reason: string): Promise<void>;
    deleteRole(guildId: string, roleId: string, reason: string): Promise<void>;
    deleteEmoji(guildId: string, emojiId: string, reason: string): Promise<void>;
    deleteSticker(guildId: string, stickerId: string, reason: string): Promise<void>;
}
//# sourceMappingURL=CachedBuilderGateway.d.ts.map