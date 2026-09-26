import type { BrowserSessionService, DiscordGuildMembership, ExternalIdentity } from "@qbox/authentication";

import { TtlCache } from "../cache/TtlCache.js";
import { SessionVerificationCache } from "./SessionVerificationCache.js";

/** Account summary (the Discord identity row) is reused for a minute. */
export const ACCOUNT_CACHE_MS = 60_000;
/** The stored membership snapshot for one member and server is reused for 30 seconds. */
export const MEMBERSHIP_CACHE_MS = 30_000;
/** Guild rows never change once created; their lookup by Discord ID is reused for 10 minutes. */
export const GUILD_ROW_CACHE_MS = 10 * 60_000;

/** A stored membership lookup result; `membership` is undefined when there is no row. */
export interface CachedMembership {
  readonly membership: DiscordGuildMembership | undefined;
}

/**
 * Short in-process caches for the reads every portal request repeats.
 * All are bounded and keyed per identity, member + server, or server.
 */
export class AuthenticationCaches {
  public readonly sessions: SessionVerificationCache;
  public readonly accounts: TtlCache<string, ExternalIdentity>;
  public readonly memberships: TtlCache<string, CachedMembership>;
  public readonly guildRows: TtlCache<string, { readonly id: string }>;

  public constructor(
    sessions: Pick<BrowserSessionService, "verifySession" | "verifySessionCsrf">,
    options: { readonly now?: () => number; readonly sessionTtlMs?: number } = {},
  ) {
    const now = options.now ? { now: options.now } : {};
    this.sessions = new SessionVerificationCache(sessions, { ...now, ...(options.sessionTtlMs ? { ttlMs: options.sessionTtlMs } : {}) });
    this.accounts = new TtlCache({ ttlMs: ACCOUNT_CACHE_MS, maxEntries: 2_000, ...now });
    this.memberships = new TtlCache({ ttlMs: MEMBERSHIP_CACHE_MS, maxEntries: 5_000, ...now });
    this.guildRows = new TtlCache({ ttlMs: GUILD_ROW_CACHE_MS, maxEntries: 1_000, ...now });
  }

  /** Drops the account summary and every membership snapshot of one identity (login, logout). */
  public forgetIdentity(externalIdentityId: string): void {
    this.accounts.delete(externalIdentityId);
    this.memberships.deleteWhere((key) => key.startsWith(`${externalIdentityId}:`));
  }
}

export function membershipCacheKey(externalIdentityId: string, guildDiscordId: string): string {
  return `${externalIdentityId}:${guildDiscordId}`;
}
