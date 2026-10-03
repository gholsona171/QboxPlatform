import { AuthenticationDomainError } from "./errors.js";
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
/** Reviewed default browser-session policy used by future application services. */
export const AUTHENTICATION_SESSION_DEFAULTS = Object.freeze({
    idleTimeoutMs: 8 * HOUR_MS,
    absoluteTimeoutMs: 7 * DAY_MS,
    maximumActiveSessions: 5,
});
/** Safe configurable bounds for future browser-session composition. */
export const AUTHENTICATION_SESSION_LIMITS = Object.freeze({
    minimumIdleTimeoutMs: 5 * MINUTE_MS,
    maximumIdleTimeoutMs: 24 * HOUR_MS,
    maximumAbsoluteTimeoutMs: 30 * DAY_MS,
    maximumActiveSessions: 20,
});
/** Validates and freezes a future session policy within reviewed security bounds. */
export function createBrowserSessionPolicy(input = {}) {
    const policy = {
        idleTimeoutMs: input.idleTimeoutMs ?? AUTHENTICATION_SESSION_DEFAULTS.idleTimeoutMs,
        absoluteTimeoutMs: input.absoluteTimeoutMs ??
            AUTHENTICATION_SESSION_DEFAULTS.absoluteTimeoutMs,
        maximumActiveSessions: input.maximumActiveSessions ??
            AUTHENTICATION_SESSION_DEFAULTS.maximumActiveSessions,
    };
    if (!Number.isSafeInteger(policy.idleTimeoutMs) ||
        policy.idleTimeoutMs < AUTHENTICATION_SESSION_LIMITS.minimumIdleTimeoutMs ||
        policy.idleTimeoutMs > AUTHENTICATION_SESSION_LIMITS.maximumIdleTimeoutMs)
        invalidSession("Idle timeout is outside the reviewed session-policy bounds.");
    if (!Number.isSafeInteger(policy.absoluteTimeoutMs) ||
        policy.absoluteTimeoutMs < policy.idleTimeoutMs ||
        policy.absoluteTimeoutMs >
            AUTHENTICATION_SESSION_LIMITS.maximumAbsoluteTimeoutMs)
        invalidSession("Absolute timeout is outside the reviewed session-policy bounds.");
    if (!Number.isSafeInteger(policy.maximumActiveSessions) ||
        policy.maximumActiveSessions < 1 ||
        policy.maximumActiveSessions >
            AUTHENTICATION_SESSION_LIMITS.maximumActiveSessions)
        invalidSession("Maximum active sessions is outside the reviewed bounds.");
    return Object.freeze(policy);
}
/** Validates a persisted session without accepting or returning a raw token. */
export function validateBrowserSession(session) {
    for (const [name, value] of [
        ["token key version", session.tokenKeyVersion],
        ["CSRF key version", session.csrfKeyVersion],
        ["authentication revision", session.authenticationRevisionAtIssue],
    ]) {
        if (!Number.isSafeInteger(value) || value < 1)
            invalidSession(`${name} must be a positive integer.`);
    }
    const metadataPresent = Boolean(session.ipHmac || session.userAgentHmac || session.deviceHmac);
    if (metadataPresent !== Boolean(session.metadataKeyVersion) ||
        (session.metadataKeyVersion !== undefined &&
            (!Number.isSafeInteger(session.metadataKeyVersion) ||
                session.metadataKeyVersion < 1)))
        invalidSession("Metadata HMACs and their key version must be stored together.");
    if (session.authenticatedAt < session.createdAt)
        invalidSession("Session authentication cannot precede creation.");
    if (session.updatedAt < session.createdAt)
        invalidSession("Session updatedAt cannot precede creation.");
    if (session.lastSeenAt < session.authenticatedAt)
        invalidSession("Session last-seen time cannot precede authentication.");
    if (session.idleExpiresAt <= session.lastSeenAt)
        invalidSession("Session idle expiry must follow its last-seen time.");
    if (session.absoluteExpiresAt < session.idleExpiresAt)
        invalidSession("Session absolute expiry cannot precede idle expiry.");
    if (session.rotatedFromSessionId === session.id)
        invalidSession("A session cannot rotate from itself.");
    if (session.status === "ACTIVE") {
        if (session.revokedAt || session.revocationReason)
            invalidSession("Active sessions cannot contain revocation metadata.");
    }
    else if (!session.revokedAt || !session.revocationReason) {
        invalidSession("Inactive sessions require a revocation timestamp and reason.");
    }
    else if (session.revokedAt < session.createdAt) {
        invalidSession("Session revocation cannot precede creation.");
    }
    if (session.status === "ROTATED" && session.revocationReason !== "ROTATED")
        invalidSession("Rotated sessions require the ROTATED reason.");
    if (session.status === "EXPIRED" && session.revocationReason !== "EXPIRED")
        invalidSession("Expired sessions require the EXPIRED reason.");
    if (session.deviceLabel !== undefined &&
        (session.deviceLabel.length < 1 ||
            session.deviceLabel.length > 120 ||
            /[\u0000-\u001f\u007f]/.test(session.deviceLabel)))
        invalidSession("Device labels must be safely bounded.");
    return session;
}
/** Returns true only while the persisted session remains temporally active. */
export function isBrowserSessionActive(session, now) {
    validateBrowserSession(session);
    return (session.status === "ACTIVE" &&
        session.idleExpiresAt > now &&
        session.absoluteExpiresAt > now);
}
/**
 * Validates the relationship between a rotated predecessor and its successor.
 * Persistence must additionally serialize the update and enforce uniqueness.
 */
export function validateSessionRotation(predecessor, successor) {
    validateBrowserSession(predecessor);
    validateBrowserSession(successor);
    if (predecessor.status !== "ROTATED" ||
        successor.rotatedFromSessionId !== predecessor.id ||
        successor.platformUserId !== predecessor.platformUserId ||
        successor.createdAt < predecessor.revokedAt)
        invalidSession("Session rotation predecessor and successor are inconsistent.");
}
function invalidSession(message) {
    throw new AuthenticationDomainError("invalid-session", message);
}
//# sourceMappingURL=sessions.js.map