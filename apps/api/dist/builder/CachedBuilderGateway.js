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
export class CachedBuilderGateway {
    inner;
    status;
    constructor(inner, options = {}) {
        this.inner = inner;
        this.status = new TtlCache({ ttlMs: options.ttlMs ?? BOT_STATUS_CACHE_MS, maxEntries: 500, ...(options.now ? { now: options.now } : {}) });
    }
    forget(guildId) {
        this.status.delete(guildId);
    }
    botStatus(guildId) {
        return this.status.getOrLoad(guildId, () => this.inner.botStatus(guildId));
    }
    listRoles(guildId) {
        return this.inner.listRoles(guildId);
    }
    listChannels(guildId) {
        return this.inner.listChannels(guildId);
    }
    readLayout(guildId) {
        return this.inner.readLayout(guildId);
    }
    listEmojis(guildId) {
        return this.inner.listEmojis(guildId);
    }
    listStickers(guildId) {
        return this.inner.listStickers(guildId);
    }
    createRole(guildId, input, reason) {
        this.forget(guildId);
        return this.inner.createRole(guildId, input, reason);
    }
    setRolePositions(guildId, positions, reason) {
        this.forget(guildId);
        return this.inner.setRolePositions(guildId, positions, reason);
    }
    createChannel(guildId, input, reason) {
        return this.inner.createChannel(guildId, input, reason);
    }
    createForumPost(channelId, input, reason) {
        return this.inner.createForumPost(channelId, input, reason);
    }
    pinForumPost(threadId, reason) {
        return this.inner.pinForumPost(threadId, reason);
    }
    deleteChannel(channelId, reason) {
        return this.inner.deleteChannel(channelId, reason);
    }
    deleteRole(guildId, roleId, reason) {
        this.forget(guildId);
        return this.inner.deleteRole(guildId, roleId, reason);
    }
    deleteEmoji(guildId, emojiId, reason) {
        return this.inner.deleteEmoji(guildId, emojiId, reason);
    }
    deleteSticker(guildId, stickerId, reason) {
        return this.inner.deleteSticker(guildId, stickerId, reason);
    }
}
//# sourceMappingURL=CachedBuilderGateway.js.map