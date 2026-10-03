import type { AuthenticationDigest, BrowserSessionId, ExternalIdentityId, PlatformUserId } from "./identifiers.js";
/** Reviewed default browser-session policy used by future application services. */
export declare const AUTHENTICATION_SESSION_DEFAULTS: Readonly<{
    idleTimeoutMs: number;
    absoluteTimeoutMs: number;
    maximumActiveSessions: 5;
}>;
/** Safe configurable bounds for future browser-session composition. */
export declare const AUTHENTICATION_SESSION_LIMITS: Readonly<{
    minimumIdleTimeoutMs: number;
    maximumIdleTimeoutMs: number;
    maximumAbsoluteTimeoutMs: number;
    maximumActiveSessions: 20;
}>;
/** Validated immutable session timing and concurrency policy. */
export interface BrowserSessionPolicy {
    readonly idleTimeoutMs: number;
    readonly absoluteTimeoutMs: number;
    readonly maximumActiveSessions: number;
}
/** Closed lifecycle states for a persisted opaque browser session. */
export type BrowserSessionStatus = "ACTIVE" | "REVOKED" | "EXPIRED" | "ROTATED";
/** Structured revocation causes; active sessions never carry one. */
export type BrowserSessionRevocationReason = "LOGOUT" | "GLOBAL_LOGOUT" | "ACCOUNT_STATUS_CHANGED" | "AUTHENTICATION_REVISION_CHANGED" | "IDENTITY_UNLINKED" | "GUILD_DEPARTURE" | "SECURITY_RESPONSE" | "SESSION_LIMIT" | "ROTATED" | "EXPIRED";
/**
 * Persistable server-side browser session. Only keyed-HMAC digests are retained;
 * the raw cookie credential is deliberately absent from this contract.
 */
export interface BrowserSession {
    readonly id: BrowserSessionId;
    readonly platformUserId: PlatformUserId;
    readonly loginIdentityId: ExternalIdentityId;
    readonly tokenDigest: AuthenticationDigest;
    readonly tokenKeyVersion: number;
    readonly csrfDigest: AuthenticationDigest;
    readonly csrfKeyVersion: number;
    readonly authenticationRevisionAtIssue: number;
    readonly authenticatedAt: Date;
    readonly lastSeenAt: Date;
    readonly idleExpiresAt: Date;
    readonly absoluteExpiresAt: Date;
    readonly status: BrowserSessionStatus;
    readonly revokedAt?: Date;
    readonly revocationReason?: BrowserSessionRevocationReason;
    readonly rotatedFromSessionId?: BrowserSessionId;
    readonly ipHmac?: AuthenticationDigest;
    readonly userAgentHmac?: AuthenticationDigest;
    readonly deviceHmac?: AuthenticationDigest;
    readonly metadataKeyVersion?: number;
    readonly deviceLabel?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
/** Validates and freezes a future session policy within reviewed security bounds. */
export declare function createBrowserSessionPolicy(input?: Partial<BrowserSessionPolicy>): BrowserSessionPolicy;
/** Validates a persisted session without accepting or returning a raw token. */
export declare function validateBrowserSession(session: BrowserSession): BrowserSession;
/** Returns true only while the persisted session remains temporally active. */
export declare function isBrowserSessionActive(session: BrowserSession, now: Date): boolean;
/**
 * Validates the relationship between a rotated predecessor and its successor.
 * Persistence must additionally serialize the update and enforce uniqueness.
 */
export declare function validateSessionRotation(predecessor: BrowserSession, successor: BrowserSession): void;
//# sourceMappingURL=sessions.d.ts.map