/** Stable machine-readable failures raised by pure authentication invariants. */
export type AuthenticationDomainErrorCode = "invalid-identifier" | "invalid-account-state" | "identity-ownership-conflict" | "invalid-session" | "invalid-oauth-transaction" | "oauth-transaction-expired" | "oauth-transaction-terminal" | "oauth-transaction-claimed" | "invalid-oauth-credential" | "invalid-membership" | "unsafe-audit-metadata";
/** Stable failure categories emitted by authentication persistence adapters. */
export type AuthenticationInfrastructureErrorCode = "conflict" | "not-found" | "stale-revision" | "stale-transaction-state" | "duplicate-provider-identity" | "duplicate-account-provider-identity" | "duplicate-session-digest" | "session-rotation-conflict" | "oauth-transaction-claimed" | "oauth-transaction-terminal" | "credential-refresh-conflict" | "dependency-unavailable" | "invalid-persisted-state";
/**
 * Safe infrastructure-boundary failure. The error deliberately excludes SQL,
 * constraint names, query arguments, and credential material. Infrastructure
 * adapters may attach the original cause only to private allowlisted logging.
 */
export declare class AuthenticationInfrastructureError extends Error {
    /** Stable category used by application services without ORM knowledge. */
    readonly code: AuthenticationInfrastructureErrorCode;
    /** Allowlisted operation name that never contains caller-controlled data. */
    readonly operation: string;
    /** Whether a bounded retry may be appropriate. */
    readonly retryable: boolean;
    /** Creates one sanitized persistence failure. */
    constructor(input: {
        readonly code: AuthenticationInfrastructureErrorCode;
        readonly operation: string;
        readonly retryable?: boolean;
    });
}
/** Stable application-service failures safe for transport mapping in a later phase. */
export type AuthenticationServiceErrorCode = "authentication-failed" | "account-unavailable" | "identity-unavailable" | "session-unavailable" | "session-expired" | "session-revoked" | "session-rotation-conflict" | "oauth-state-invalid" | "oauth-browser-binding-invalid" | "oauth-transaction-claimed" | "oauth-transaction-terminal" | "owner-access-required" | "cryptography-failed";
/**
 * Transport-independent authentication use-case failure. Messages are stable,
 * contain no secret values, and may be mapped to Problem Details later.
 */
export declare class AuthenticationServiceError extends Error {
    /** Stable machine-readable service category. */
    readonly code: AuthenticationServiceErrorCode;
    /** Creates a sanitized application-service failure. */
    constructor(code: AuthenticationServiceErrorCode, message: string);
}
/** Typed rejection raised when an account mutation would remove all owner access. */
export declare class OwnerAccessInvariantError extends Error {
    /** Stable category used by operator tooling and future API mappings. */
    readonly code: "owner-access-required";
    /** Creates the non-enumerating owner recovery failure. */
    constructor();
}
/**
 * Typed failure returned when untrusted input violates an authentication domain
 * invariant. Instances contain safe messages and no credential material. The
 * error is process-local and may later be translated by transport adapters.
 */
export declare class AuthenticationDomainError extends Error {
    /** Stable code suitable for application-service branching and safe diagnostics. */
    readonly code: AuthenticationDomainErrorCode;
    /** Creates an immutable authentication failure with a stable public code. */
    constructor(code: AuthenticationDomainErrorCode, message: string);
}
//# sourceMappingURL=errors.d.ts.map