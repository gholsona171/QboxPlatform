import { createHash } from "node:crypto";
import { TtlCache } from "../cache/TtlCache.js";
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
    service;
    sessions;
    csrf;
    constructor(service, options = {}) {
        this.service = service;
        const limits = { ttlMs: options.ttlMs ?? SESSION_VERIFICATION_CACHE_MS, maxEntries: MAX_ENTRIES, ...(options.now ? { now: options.now } : {}) };
        this.sessions = new TtlCache(limits);
        this.csrf = new TtlCache(limits);
    }
    verifySession(secret) {
        return this.sessions.getOrLoad(digest(secret), () => this.service.verifySession(secret), expiryOf);
    }
    verifySessionCsrf(secret, csrfSecret) {
        return this.csrf.getOrLoad(`${digest(secret)}:${digest(csrfSecret)}`, () => this.service.verifySessionCsrf(secret, csrfSecret), expiryOf);
    }
    /** Drops everything remembered for one session secret (logout, revocation). */
    forget(secret) {
        const key = digest(secret);
        this.sessions.delete(key);
        this.csrf.deleteWhere((entry) => entry.startsWith(`${key}:`));
    }
    /** Drops every session of one account (its sessions were ended, for example by an ABSENT membership). */
    forgetAccount(platformUserId) {
        const matches = (_key, value) => value?.actor.platformUserId === platformUserId;
        this.sessions.deleteWhere(matches);
        this.csrf.deleteWhere(matches);
    }
}
function digest(secret) {
    return createHash("sha256").update(secret, "utf8").digest("base64url");
}
function expiryOf(verified) {
    return Math.min(verified.session.idleExpiresAt.getTime(), verified.session.absoluteExpiresAt.getTime());
}
//# sourceMappingURL=SessionVerificationCache.js.map