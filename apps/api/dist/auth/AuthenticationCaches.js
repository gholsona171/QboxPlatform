import { TtlCache } from "../cache/TtlCache.js";
import { SessionVerificationCache } from "./SessionVerificationCache.js";
/** Account summary (the Discord identity row) is reused for a minute. */
export const ACCOUNT_CACHE_MS = 60_000;
/** The stored membership snapshot for one member and server is reused for 30 seconds. */
export const MEMBERSHIP_CACHE_MS = 30_000;
/** Guild rows never change once created; their lookup by Discord ID is reused for 10 minutes. */
export const GUILD_ROW_CACHE_MS = 10 * 60_000;
/**
 * Short in-process caches for the reads every portal request repeats.
 * All are bounded and keyed per identity, member + server, or server.
 */
export class AuthenticationCaches {
    sessions;
    accounts;
    memberships;
    guildRows;
    constructor(sessions, options = {}) {
        const now = options.now ? { now: options.now } : {};
        this.sessions = new SessionVerificationCache(sessions, { ...now, ...(options.sessionTtlMs ? { ttlMs: options.sessionTtlMs } : {}) });
        this.accounts = new TtlCache({ ttlMs: ACCOUNT_CACHE_MS, maxEntries: 2_000, ...now });
        this.memberships = new TtlCache({ ttlMs: MEMBERSHIP_CACHE_MS, maxEntries: 5_000, ...now });
        this.guildRows = new TtlCache({ ttlMs: GUILD_ROW_CACHE_MS, maxEntries: 1_000, ...now });
    }
    /** Drops the account summary and every membership snapshot of one identity (login, logout). */
    forgetIdentity(externalIdentityId) {
        this.accounts.delete(externalIdentityId);
        this.memberships.deleteWhere((key) => key.startsWith(`${externalIdentityId}:`));
    }
}
export function membershipCacheKey(externalIdentityId, guildDiscordId) {
    return `${externalIdentityId}:${guildDiscordId}`;
}
//# sourceMappingURL=AuthenticationCaches.js.map