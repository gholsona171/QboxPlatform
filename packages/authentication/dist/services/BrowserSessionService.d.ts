import type { BrowserSessionId, OpaqueAuthenticationSecret, PlatformUserId } from "../identifiers.js";
import type { AuthenticationClock, AuthenticationCrypto, AuthenticationIdGenerator, AuthenticationKeyProvider, AuthenticationUnitOfWork } from "../ports.js";
import { type BrowserSession, type BrowserSessionPolicy } from "../sessions.js";
import type { AuthenticationOperationContext, BrowserSessionSummary, CreateBrowserSessionInput, IssuedBrowserSession, VerifiedBrowserSession } from "./AuthenticationServiceContracts.js";
import { MetadataHashingService } from "./MetadataHashingService.js";
/** Dependencies for the transport-independent browser-session use cases. */
export interface BrowserSessionServiceDependencies {
    /** Atomic authentication persistence boundary. */
    readonly unitOfWork: AuthenticationUnitOfWork;
    /** Injectable security clock. */
    readonly clock: AuthenticationClock;
    /** Opaque-secret and keyed-digest implementation. */
    readonly crypto: AuthenticationCrypto;
    /** Active and bounded retained authentication key handles. */
    readonly keys: AuthenticationKeyProvider;
    /** Cryptographically secure internal identifier source. */
    readonly ids: AuthenticationIdGenerator;
    /** Keyed-HMAC client metadata service. */
    readonly metadata: MetadataHashingService;
    /** Optional reviewed browser-session policy. */
    readonly policy?: Partial<BrowserSessionPolicy>;
    /** Minimum interval between compare-and-set activity writes. */
    readonly touchIntervalMs?: number;
}
/**
 * Transport-independent opaque browser-session lifecycle.
 *
 * The service stores only keyed digests, performs every security mutation and
 * mandatory audit inside one injected unit of work, and returns raw secrets only
 * as ephemeral post-commit results. Instances are process-local, stateless apart
 * from immutable policy, and safe for concurrent use when their ports are safe.
 */
export declare class BrowserSessionService {
    #private;
    /** Constructs the session service without issuing credentials or touching persistence. */
    constructor(dependencies: BrowserSessionServiceDependencies);
    /** Creates, audits, and returns one new opaque browser session after commit. */
    createSession(input: CreateBrowserSessionInput): Promise<IssuedBrowserSession>;
    /** Verifies an opaque secret and returns a trusted immutable platform actor. */
    verifySession(sessionSecret: OpaqueAuthenticationSecret): Promise<VerifiedBrowserSession>;
    /** Verifies both the opaque session secret and its paired CSRF secret. */
    verifySessionCsrf(sessionSecret: OpaqueAuthenticationSecret, csrfSecret: OpaqueAuthenticationSecret): Promise<VerifiedBrowserSession>;
    /** Atomically rotates an active session and returns only the new ephemeral secrets. */
    rotateSession(sourceSecret: OpaqueAuthenticationSecret, context: AuthenticationOperationContext): Promise<IssuedBrowserSession>;
    /** Revokes the session identified by an ephemeral current-session secret. */
    revokeCurrentSession(secret: OpaqueAuthenticationSecret, context: AuthenticationOperationContext): Promise<void>;
    /** Revokes one owned session without revealing whether another account owns it. */
    revokeSession(platformUserId: PlatformUserId, sessionId: BrowserSessionId, context: AuthenticationOperationContext): Promise<void>;
    /** Revokes all account sessions and increments the account authentication revision. */
    revokeAllSessions(platformUserId: PlatformUserId, context: AuthenticationOperationContext): Promise<number>;
    /** Lists safe active-session summaries in deterministic least-recently-used order. */
    listActiveSessions(platformUserId: PlatformUserId): Promise<readonly BrowserSessionSummary[]>;
    /** Identifies bounded expired-session summaries for a future cleanup scheduler. */
    identifyExpiredSessions(limit: number): Promise<readonly BrowserSessionSummary[]>;
}
/** Converts a persisted session into a frozen secret-free summary. */
export declare function sessionSummary(session: BrowserSession): BrowserSessionSummary;
//# sourceMappingURL=BrowserSessionService.d.ts.map