import { createPlatformUserActor } from "../actors.js";
import { AuthenticationServiceError } from "../errors.js";
import { createBrowserSessionPolicy, isBrowserSessionActive, validateBrowserSession, } from "../sessions.js";
import { MetadataHashingService } from "./MetadataHashingService.js";
const SECRET_BYTES = 32;
const MAX_RETAINED_HMAC_KEYS = 4;
const DEFAULT_TOUCH_INTERVAL_MS = 5 * 60_000;
/**
 * Transport-independent opaque browser-session lifecycle.
 *
 * The service stores only keyed digests, performs every security mutation and
 * mandatory audit inside one injected unit of work, and returns raw secrets only
 * as ephemeral post-commit results. Instances are process-local, stateless apart
 * from immutable policy, and safe for concurrent use when their ports are safe.
 */
export class BrowserSessionService {
    #unitOfWork;
    #clock;
    #crypto;
    #keys;
    #ids;
    #metadata;
    #policy;
    #touchIntervalMs;
    /** Constructs the session service without issuing credentials or touching persistence. */
    constructor(dependencies) {
        this.#unitOfWork = dependencies.unitOfWork;
        this.#clock = dependencies.clock;
        this.#crypto = dependencies.crypto;
        this.#keys = dependencies.keys;
        this.#ids = dependencies.ids;
        this.#metadata = dependencies.metadata;
        this.#policy = createBrowserSessionPolicy(dependencies.policy);
        this.#touchIntervalMs = dependencies.touchIntervalMs ?? DEFAULT_TOUCH_INTERVAL_MS;
        if (!Number.isSafeInteger(this.#touchIntervalMs) ||
            this.#touchIntervalMs < 0 ||
            this.#touchIntervalMs > this.#policy.idleTimeoutMs)
            throw new RangeError("Session touch interval is outside reviewed bounds.");
    }
    /** Creates, audits, and returns one new opaque browser session after commit. */
    async createSession(input) {
        const now = this.#clock.now();
        const [sessionSecret, csrfSecret, tokenKey, csrfKey, metadata] = await Promise.all([
            this.#crypto.createOpaqueSecret(SECRET_BYTES),
            this.#crypto.createOpaqueSecret(SECRET_BYTES),
            this.#keys.active("SESSION_HMAC"),
            this.#keys.active("CSRF_HMAC"),
            this.#metadata.hash(input.clientMetadata),
        ]);
        const [tokenDigest, csrfDigest] = await Promise.all([
            this.#crypto.hmac(sessionSecret, tokenKey),
            this.#crypto.hmac(csrfSecret, csrfKey),
        ]);
        const sessionId = this.#ids.browserSessionId();
        const persisted = await this.#unitOfWork.run(async (repositories) => {
            const [account, identity] = await Promise.all([
                repositories.platformUsers.findById(input.platformUserId),
                repositories.externalIdentities.findByPlatformUser(input.platformUserId, "DISCORD"),
            ]);
            if (!account || account.status !== "ACTIVE")
                accountUnavailable();
            if (!identity ||
                identity.id !== input.loginIdentityId ||
                !identity.enabled ||
                identity.unlinkedAt)
                identityUnavailable();
            await repositories.browserSessions.acquireAccountMutationLock(account.id);
            const active = await repositories.browserSessions.findActiveForPlatformUser(account.id, now);
            const excess = active.length - this.#policy.maximumActiveSessions + 1;
            for (const session of active.slice(0, Math.max(0, excess))) {
                const revoked = await repositories.browserSessions.revoke(session.id, "SESSION_LIMIT", now);
                if (revoked)
                    await repositories.audit.append(this.#audit(input.context, {
                        action: "SESSION_REVOCATION",
                        reasonCode: "SYSTEM_MAINTENANCE",
                        target: {
                            platformUserId: account.id,
                            browserSessionId: revoked.id,
                        },
                        occurredAt: now,
                    }));
            }
            const session = validateBrowserSession({
                id: sessionId,
                platformUserId: account.id,
                loginIdentityId: identity.id,
                tokenDigest,
                tokenKeyVersion: tokenKey.version,
                csrfDigest,
                csrfKeyVersion: csrfKey.version,
                authenticationRevisionAtIssue: account.authenticationRevision,
                authenticatedAt: now,
                lastSeenAt: now,
                idleExpiresAt: new Date(now.getTime() + this.#policy.idleTimeoutMs),
                absoluteExpiresAt: new Date(now.getTime() + this.#policy.absoluteTimeoutMs),
                status: "ACTIVE",
                ...metadata,
                ...(input.deviceLabel ? { deviceLabel: input.deviceLabel } : {}),
                createdAt: now,
                updatedAt: now,
            });
            const created = await repositories.browserSessions.create(session);
            await repositories.audit.append(this.#audit(input.context, {
                action: "SESSION_CREATION",
                reasonCode: "COMPLETED",
                target: {
                    platformUserId: account.id,
                    externalIdentityId: identity.id,
                    browserSessionId: created.id,
                },
                occurredAt: now,
            }));
            return created;
        });
        return Object.freeze({
            session: sessionSummary(persisted),
            sessionSecret,
            csrfSecret,
        });
    }
    /** Verifies an opaque secret and returns a trusted immutable platform actor. */
    async verifySession(sessionSecret) {
        const now = this.#clock.now();
        return this.#unitOfWork.run(async (repositories) => {
            const session = await this.#findBySecret(repositories, sessionSecret);
            if (!session)
                authenticationFailed();
            if (session.status !== "ACTIVE")
                sessionUnavailable(session.status);
            if (!isBrowserSessionActive(session, now))
                throw new AuthenticationServiceError("session-expired", "The browser session is no longer valid.");
            const [account, loginIdentity] = await Promise.all([
                repositories.platformUsers.findById(session.platformUserId),
                repositories.externalIdentities.findById(session.loginIdentityId),
            ]);
            if (!account || account.status !== "ACTIVE")
                accountUnavailable();
            if (account.authenticationRevision !== session.authenticationRevisionAtIssue)
                authenticationFailed();
            if (!loginIdentity ||
                loginIdentity.platformUserId !== account.id ||
                loginIdentity.id !== session.loginIdentityId ||
                !loginIdentity.enabled ||
                loginIdentity.unlinkedAt)
                identityUnavailable();
            let current = session;
            if (now.getTime() - session.lastSeenAt.getTime() >= this.#touchIntervalMs) {
                const idleExpiresAt = new Date(Math.min(now.getTime() + this.#policy.idleTimeoutMs, session.absoluteExpiresAt.getTime()));
                if (idleExpiresAt > now) {
                    current =
                        (await repositories.browserSessions.touch(session.id, session.lastSeenAt, now, idleExpiresAt)) ?? session;
                }
            }
            return Object.freeze({
                actor: createPlatformUserActor({
                    platformUserId: account.id,
                    sessionId: current.id,
                    loginIdentityId: loginIdentity.id,
                    authenticationRevision: account.authenticationRevision,
                    authenticatedAt: current.authenticatedAt,
                }),
                session: sessionSummary(current),
            });
        });
    }
    /** Verifies both the opaque session secret and its paired CSRF secret. */
    async verifySessionCsrf(sessionSecret, csrfSecret) {
        const verified = await this.verifySession(sessionSecret);
        const csrfValid = await this.#unitOfWork.run(async (repositories) => {
            const session = await repositories.browserSessions.findById(verified.session.id);
            if (!session || session.status !== "ACTIVE")
                return false;
            const keys = await boundedCandidates(this.#keys, "CSRF_HMAC");
            for (const key of keys) {
                const digest = await this.#crypto.hmac(csrfSecret, key);
                if (session.csrfKeyVersion === key.version &&
                    (await this.#crypto.constantTimeEqual(digest, session.csrfDigest)))
                    return true;
            }
            return false;
        });
        if (!csrfValid)
            throw new AuthenticationServiceError("authentication-failed", "The CSRF credential could not be verified.");
        return verified;
    }
    /** Atomically rotates an active session and returns only the new ephemeral secrets. */
    async rotateSession(sourceSecret, context) {
        const now = this.#clock.now();
        const [sessionSecret, csrfSecret, tokenKey, csrfKey] = await Promise.all([
            this.#crypto.createOpaqueSecret(SECRET_BYTES),
            this.#crypto.createOpaqueSecret(SECRET_BYTES),
            this.#keys.active("SESSION_HMAC"),
            this.#keys.active("CSRF_HMAC"),
        ]);
        const [tokenDigest, csrfDigest] = await Promise.all([
            this.#crypto.hmac(sessionSecret, tokenKey),
            this.#crypto.hmac(csrfSecret, csrfKey),
        ]);
        const successorId = this.#ids.browserSessionId();
        const successor = await this.#unitOfWork.run(async (repositories) => {
            const source = await this.#findBySecret(repositories, sourceSecret);
            if (!source || !isBrowserSessionActive(source, now))
                throw new AuthenticationServiceError("session-rotation-conflict", "The browser session cannot be rotated.");
            const { revokedAt: _revokedAt, revocationReason: _revocationReason, rotatedFromSessionId: _rotatedFromSessionId, ...activeSource } = source;
            void _revokedAt;
            void _revocationReason;
            void _rotatedFromSessionId;
            const next = validateBrowserSession({
                ...activeSource,
                id: successorId,
                tokenDigest,
                tokenKeyVersion: tokenKey.version,
                csrfDigest,
                csrfKeyVersion: csrfKey.version,
                authenticatedAt: now,
                lastSeenAt: now,
                idleExpiresAt: new Date(now.getTime() + this.#policy.idleTimeoutMs),
                absoluteExpiresAt: new Date(now.getTime() + this.#policy.absoluteTimeoutMs),
                status: "ACTIVE",
                rotatedFromSessionId: source.id,
                createdAt: now,
                updatedAt: now,
            });
            const rotated = await repositories.browserSessions.rotate(source.id, next);
            await repositories.audit.append(this.#audit(context, {
                action: "SESSION_ROTATION",
                reasonCode: "COMPLETED",
                target: {
                    platformUserId: source.platformUserId,
                    browserSessionId: rotated.id,
                },
                metadata: { rotated_from_id: source.id },
                occurredAt: now,
            }));
            return rotated;
        });
        return Object.freeze({
            session: sessionSummary(successor),
            sessionSecret,
            csrfSecret,
        });
    }
    /** Revokes the session identified by an ephemeral current-session secret. */
    async revokeCurrentSession(secret, context) {
        const now = this.#clock.now();
        await this.#unitOfWork.run(async (repositories) => {
            const session = await this.#findBySecret(repositories, secret);
            if (!session)
                return;
            await this.#revoke(repositories, session, "LOGOUT", "LOGOUT", context, now);
        });
    }
    /** Revokes one owned session without revealing whether another account owns it. */
    async revokeSession(platformUserId, sessionId, context) {
        const now = this.#clock.now();
        await this.#unitOfWork.run(async (repositories) => {
            const session = await repositories.browserSessions.findById(sessionId);
            if (!session || session.platformUserId !== platformUserId)
                return;
            await this.#revoke(repositories, session, "LOGOUT", "SESSION_REVOCATION", context, now);
        });
    }
    /** Revokes all account sessions and increments the account authentication revision. */
    async revokeAllSessions(platformUserId, context) {
        const now = this.#clock.now();
        return this.#unitOfWork.run(async (repositories) => {
            const account = await repositories.platformUsers.findById(platformUserId);
            if (!account)
                return 0;
            await repositories.browserSessions.acquireAccountMutationLock(account.id);
            const count = await repositories.browserSessions.revokeAll(account.id, "GLOBAL_LOGOUT", now);
            await repositories.platformUsers.incrementAuthenticationRevision(account.id, account.authenticationRevision, now);
            await repositories.audit.append(this.#audit(context, {
                action: "GLOBAL_LOGOUT",
                reasonCode: "USER_ACTION",
                target: { platformUserId: account.id },
                metadata: { revoked_count: count },
                occurredAt: now,
            }));
            return count;
        });
    }
    /** Lists safe active-session summaries in deterministic least-recently-used order. */
    async listActiveSessions(platformUserId) {
        const now = this.#clock.now();
        return this.#unitOfWork.run(async ({ browserSessions }) => Object.freeze((await browserSessions.findActiveForPlatformUser(platformUserId, now)).map(sessionSummary)));
    }
    /** Identifies bounded expired-session summaries for a future cleanup scheduler. */
    async identifyExpiredSessions(limit) {
        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1_000)
            throw new RangeError("Expired session query limit must be between 1 and 1000.");
        const now = this.#clock.now();
        return this.#unitOfWork.run(async ({ browserSessions }) => Object.freeze((await browserSessions.findExpired(now, limit)).map(sessionSummary)));
    }
    async #findBySecret(repositories, secret) {
        const candidates = await boundedCandidates(this.#keys, "SESSION_HMAC");
        for (const key of candidates) {
            const digest = await this.#crypto.hmac(secret, key);
            const session = await repositories.browserSessions.findByTokenDigest(digest);
            if (session && session.tokenKeyVersion === key.version)
                return session;
        }
        return undefined;
    }
    async #revoke(repositories, session, reason, action, context, now) {
        if (session.status !== "ACTIVE")
            return;
        const revoked = await repositories.browserSessions.revoke(session.id, reason, now);
        if (!revoked)
            return;
        await repositories.audit.append(this.#audit(context, {
            action,
            reasonCode: "USER_ACTION",
            target: {
                platformUserId: session.platformUserId,
                browserSessionId: session.id,
            },
            occurredAt: now,
        }));
    }
    #audit(context, input) {
        return {
            id: this.#ids.authenticationAuditEventId(),
            action: input.action,
            outcome: "SUCCESS",
            reasonCode: input.reasonCode,
            ...(context.requestId ? { requestId: context.requestId } : {}),
            correlationId: context.correlationId,
            ...(context.actor ? { actor: context.actor } : {}),
            target: input.target,
            metadata: Object.freeze({ ...(context.metadata ?? {}), ...(input.metadata ?? {}) }),
            occurredAt: input.occurredAt,
            createdAt: input.occurredAt,
        };
    }
}
/** Converts a persisted session into a frozen secret-free summary. */
export function sessionSummary(session) {
    return Object.freeze({
        id: session.id,
        status: session.status,
        authenticatedAt: session.authenticatedAt,
        lastSeenAt: session.lastSeenAt,
        idleExpiresAt: session.idleExpiresAt,
        absoluteExpiresAt: session.absoluteExpiresAt,
        ...(session.deviceLabel ? { deviceLabel: session.deviceLabel } : {}),
    });
}
async function boundedCandidates(keys, purpose) {
    const candidates = await keys.verificationCandidates(purpose);
    if (candidates.length < 1 || candidates.length > MAX_RETAINED_HMAC_KEYS)
        throw new AuthenticationServiceError("cryptography-failed", "Authentication key verification candidates are unavailable.");
    return candidates;
}
function accountUnavailable() {
    throw new AuthenticationServiceError("account-unavailable", "The platform account is unavailable.");
}
function identityUnavailable() {
    throw new AuthenticationServiceError("identity-unavailable", "The login identity is unavailable.");
}
function authenticationFailed() {
    throw new AuthenticationServiceError("authentication-failed", "The browser session could not be verified.");
}
function sessionUnavailable(status) {
    throw new AuthenticationServiceError(status === "REVOKED" || status === "ROTATED"
        ? "session-revoked"
        : "session-expired", "The browser session is no longer valid.");
}
//# sourceMappingURL=BrowserSessionService.js.map