/**
 * Safe infrastructure-boundary failure. The error deliberately excludes SQL,
 * constraint names, query arguments, and credential material. Infrastructure
 * adapters may attach the original cause only to private allowlisted logging.
 */
export class AuthenticationInfrastructureError extends Error {
    /** Stable category used by application services without ORM knowledge. */
    code;
    /** Allowlisted operation name that never contains caller-controlled data. */
    operation;
    /** Whether a bounded retry may be appropriate. */
    retryable;
    /** Creates one sanitized persistence failure. */
    constructor(input) {
        super(`Authentication infrastructure operation '${input.operation}' failed.`);
        this.name = "AuthenticationInfrastructureError";
        this.code = input.code;
        this.operation = input.operation;
        this.retryable = input.retryable ?? false;
    }
}
/**
 * Transport-independent authentication use-case failure. Messages are stable,
 * contain no secret values, and may be mapped to Problem Details later.
 */
export class AuthenticationServiceError extends Error {
    /** Stable machine-readable service category. */
    code;
    /** Creates a sanitized application-service failure. */
    constructor(code, message) {
        super(message);
        this.name = "AuthenticationServiceError";
        this.code = code;
    }
}
/** Typed rejection raised when an account mutation would remove all owner access. */
export class OwnerAccessInvariantError extends Error {
    /** Stable category used by operator tooling and future API mappings. */
    code = "owner-access-required";
    /** Creates the non-enumerating owner recovery failure. */
    constructor() {
        super("The operation would remove the last usable platform-owner access path.");
        this.name = "OwnerAccessInvariantError";
    }
}
/**
 * Typed failure returned when untrusted input violates an authentication domain
 * invariant. Instances contain safe messages and no credential material. The
 * error is process-local and may later be translated by transport adapters.
 */
export class AuthenticationDomainError extends Error {
    /** Stable code suitable for application-service branching and safe diagnostics. */
    code;
    /** Creates an immutable authentication failure with a stable public code. */
    constructor(code, message) {
        super(message);
        this.name = "AuthenticationDomainError";
        this.code = code;
    }
}
//# sourceMappingURL=errors.js.map