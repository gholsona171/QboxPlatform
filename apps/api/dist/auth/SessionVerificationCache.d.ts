import type { BrowserSessionService, OpaqueAuthenticationSecret } from "@qbox/authentication";
type VerifiedSession = Awaited<ReturnType<BrowserSessionService["verifySession"]>>;
/** A successful verification is reused for at most this long. */
export declare const SESSION_VERIFICATION_CACHE_MS = 10000;
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
export declare class SessionVerificationCache {
    private readonly service;
    private readonly sessions;
    private readonly csrf;
    constructor(service: Pick<BrowserSessionService, "verifySession" | "verifySessionCsrf">, options?: {
        readonly ttlMs?: number;
        readonly now?: () => number;
    });
    verifySession(secret: OpaqueAuthenticationSecret): Promise<VerifiedSession>;
    verifySessionCsrf(secret: OpaqueAuthenticationSecret, csrfSecret: OpaqueAuthenticationSecret): Promise<VerifiedSession>;
    /** Drops everything remembered for one session secret (logout, revocation). */
    forget(secret: OpaqueAuthenticationSecret): void;
    /** Drops every session of one account (its sessions were ended, for example by an ABSENT membership). */
    forgetAccount(platformUserId: string): void;
}
export {};
//# sourceMappingURL=SessionVerificationCache.d.ts.map