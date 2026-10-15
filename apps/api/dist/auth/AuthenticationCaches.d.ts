import type { BrowserSessionService, DiscordGuildMembership, ExternalIdentity } from "@qbox/authentication";
import { TtlCache } from "../cache/TtlCache.js";
import { SessionVerificationCache } from "./SessionVerificationCache.js";
/** Account summary (the Discord identity row) is reused for a minute. */
export declare const ACCOUNT_CACHE_MS = 60000;
/** The stored membership snapshot for one member and server is reused for 30 seconds. */
export declare const MEMBERSHIP_CACHE_MS = 30000;
/** Guild rows never change once created; their lookup by Discord ID is reused for 10 minutes. */
export declare const GUILD_ROW_CACHE_MS: number;
/** A stored membership lookup result; `membership` is undefined when there is no row. */
export interface CachedMembership {
    readonly membership: DiscordGuildMembership | undefined;
}
/**
 * Short in-process caches for the reads every portal request repeats.
 * All are bounded and keyed per identity, member + server, or server.
 */
export declare class AuthenticationCaches {
    readonly sessions: SessionVerificationCache;
    readonly accounts: TtlCache<string, ExternalIdentity>;
    readonly memberships: TtlCache<string, CachedMembership>;
    readonly guildRows: TtlCache<string, {
        readonly id: string;
    }>;
    constructor(sessions: Pick<BrowserSessionService, "verifySession" | "verifySessionCsrf">, options?: {
        readonly now?: () => number;
        readonly sessionTtlMs?: number;
    });
    /** Drops the account summary and every membership snapshot of one identity (login, logout). */
    forgetIdentity(externalIdentityId: string): void;
}
export declare function membershipCacheKey(externalIdentityId: string, guildDiscordId: string): string;
//# sourceMappingURL=AuthenticationCaches.d.ts.map