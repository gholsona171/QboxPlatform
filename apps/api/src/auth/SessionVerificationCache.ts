import { createHash } from "node:crypto";
import type { BrowserSessionService, OpaqueAuthenticationSecret } from "@qbox/authentication";

import { TtlCache } from "../cache/TtlCache.js";

type VerifiedSession = Awaited<ReturnType<BrowserSessionService["verifySession"]>>;

/** A successful verification is reused for at most this long. */
export const SESSION_VERIFICATION_CACHE_MS = 10_000;
const MAX_ENTRIES = 2_000;

/**
 * Remembers successful session (and session + CSRF) verifications for a few
 * seconds, keyed by a SHA-256 digest of the secrets so raw secrets are never
 * held as map keys.
 *
 * Failures are never cached. An entry never outlives the session's own idle
 * or absolute expiry. Logout and revocation in this process call `forget`,
 * which drops the entry at once; a revocation made by another process (the
 * bot, another API instance) is noticed within `SESSION_VERIFICATION_CACHE_MS`.
 */
export class SessionVerificationCache {
  private readonly sessions: TtlCache<string, VerifiedSession>;
  private readonly csrf: TtlCache<string, VerifiedSession>;

  public constructor(
    private readonly service: Pick<BrowserSessionService, "verifySession" | "verifySessionCsrf">,
    options: { readonly ttlMs?: number; readonly now?: () => number } = {},
  ) {
    const limits = { ttlMs: options.ttlMs ?? SESSION_VERIFICATION_CACHE_MS, maxEntries: MAX_ENTRIES, ...(options.now ? { now: options.now } : {}) };
    this.sessions = new TtlCache(limits);
    this.csrf = new TtlCache(limits);
  }

  public verifySession(secret: OpaqueAuthenticationSecret): Promise<VerifiedSession> {
    return this.sessions.getOrLoad(digest(secret), () => this.service.verifySession(secret), expiryOf);
  }

  public verifySessionCsrf(secret: OpaqueAuthenticationSecret, csrfSecret: OpaqueAuthenticationSecret): Promise<VerifiedSession> {
    return this.csrf.getOrLoad(`${digest(secret)}:${digest(csrfSecret)}`, () => this.service.verifySessionCsrf(secret, csrfSecret), expiryOf);
  }

  /** Drops everything remembered for one session secret (logout, revocation). */
  public forget(secret: OpaqueAuthenticationSecret): void {
    const key = digest(secret);
    this.sessions.delete(key);
    this.csrf.deleteWhere((entry) => entry.startsWith(`${key}:`));
  }

  /** Drops every session of one account (its sessions were ended, for example by an ABSENT membership). */
  public forgetAccount(platformUserId: string): void {
    const matches = (_key: string, value: VerifiedSession | undefined) => value?.actor.platformUserId === platformUserId;
    this.sessions.deleteWhere(matches);
    this.csrf.deleteWhere(matches);
  }
}

function digest(secret: string): string {
  return createHash("sha256").update(secret, "utf8").digest("base64url");
}

function expiryOf(verified: VerifiedSession): number {
  return Math.min(verified.session.idleExpiresAt.getTime(), verified.session.absoluteExpiresAt.getTime());
}
