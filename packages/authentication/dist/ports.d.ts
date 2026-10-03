import type { ExternalIdentity, ExternalIdentityProvider, PlatformUser, PlatformUserStatus, PlatformUserStatusReasonCode } from "./accounts.js";
import type { AuthenticationAuditEvent, AuthenticationAuditReasonCode } from "./audit.js";
import type { AuthenticationAuditEventId, AuthenticationCorrelationId, AuthenticationDigest, BrowserSessionId, DiscordGuildId, DiscordGuildMembershipId, DiscordRoleId, DiscordUserId, ExternalIdentityId, OAuthCredentialId, OAuthTransactionId, OpaqueAuthenticationSecret, PlatformUserId } from "./identifiers.js";
import type { DiscordGuildMembership, DiscordGuildMembershipSource } from "./membership.js";
import type { BrowserSession, BrowserSessionRevocationReason } from "./sessions.js";
import type { EncryptedAuthenticationSecret, OAuthCredential, OAuthCredentialRevocationReason, OAuthProvider, OAuthTransaction, OAuthTransactionFailureReason } from "./oauth.js";
/** Atomic account persistence port; implementations must preserve immutable IDs. */
export interface PlatformUserRepository {
    /** Finds a platform account by its internal identifier. */
    findById(id: PlatformUserId): Promise<PlatformUser | undefined>;
    /** Creates one account or reports an ownership/uniqueness conflict. */
    create(user: PlatformUser): Promise<PlatformUser>;
    /** Changes status and revision using compare-and-set or equivalent serialization. */
    updateStatus(id: PlatformUserId, expectedAuthenticationRevision: number, status: PlatformUserStatus, reasonCode: PlatformUserStatusReasonCode, occurredAt: Date): Promise<PlatformUser>;
    /** Increments the authentication revision with compare-and-set semantics. */
    incrementAuthenticationRevision(id: PlatformUserId, expectedAuthenticationRevision: number, occurredAt: Date): Promise<PlatformUser>;
}
/** Provider identity ownership port; unlinked rows retain their ownership history. */
export interface ExternalIdentityRepository {
    /** Finds one retained external identity by its immutable internal identifier. */
    findById(id: ExternalIdentityId): Promise<ExternalIdentity | undefined>;
    /** Finds the globally owned identity for one immutable provider subject. */
    findByProviderSubject(provider: ExternalIdentityProvider, providerSubjectId: DiscordUserId): Promise<ExternalIdentity | undefined>;
    /** Finds the sole initial identity for one account and provider. */
    findByPlatformUser(platformUserId: PlatformUserId, provider: ExternalIdentityProvider): Promise<ExternalIdentity | undefined>;
    /** Creates an identity while atomically enforcing global and per-account ownership. */
    create(identity: ExternalIdentity): Promise<ExternalIdentity>;
    /** Replaces mutable display-only provider profile data after verification. */
    updateVerifiedIdentity(identity: ExternalIdentity): Promise<ExternalIdentity>;
    /** Marks an identity unlinked without releasing its provider subject for reuse. */
    unlink(id: ExternalIdentityId, occurredAt: Date): Promise<ExternalIdentity>;
}
/** Opaque browser-session persistence port; raw cookie values are never accepted. */
export interface BrowserSessionRepository {
    /**
     * Serializes account-wide session mutations inside the ambient transaction.
     * Implementations must use a process-independent transaction lock and must
     * release it automatically when the transaction ends.
     */
    acquireAccountMutationLock(platformUserId: PlatformUserId): Promise<void>;
    /** Finds a session by keyed-HMAC token digest. */
    findByTokenDigest(digest: AuthenticationDigest): Promise<BrowserSession | undefined>;
    /** Finds a session by internal identifier. */
    findById(id: BrowserSessionId): Promise<BrowserSession | undefined>;
    /** Creates a validated session while enforcing the configured active-session limit. */
    create(session: BrowserSession): Promise<BrowserSession>;
    /** Atomically rotates one source session into one unique successor. */
    rotate(sourceId: BrowserSessionId, successor: BrowserSession): Promise<BrowserSession>;
    /** Revokes an active session idempotently with a structured reason. */
    revoke(id: BrowserSessionId, reason: BrowserSessionRevocationReason, occurredAt: Date): Promise<BrowserSession | undefined>;
    /** Revokes every active session for an account in one transaction. */
    revokeAll(platformUserId: PlatformUserId, reason: BrowserSessionRevocationReason, occurredAt: Date): Promise<number>;
    /** Lists active sessions for limit enforcement and user-facing session management. */
    findActiveForPlatformUser(platformUserId: PlatformUserId, now: Date): Promise<readonly BrowserSession[]>;
    /** Lists expired records for a future retention/cleanup owner. */
    findExpired(now: Date, limit: number): Promise<readonly BrowserSession[]>;
    /**
     * Advances last-seen and idle expiry only when the expected timestamp still
     * matches. `undefined` means another verifier won the compare-and-set race.
     */
    touch(id: BrowserSessionId, expectedLastSeenAt: Date, lastSeenAt: Date, idleExpiresAt: Date): Promise<BrowserSession | undefined>;
}
/** Atomic OAuth transaction port implementing one-time claim leases and terminality. */
export interface OAuthTransactionRepository {
    /** Creates a transaction with unique state and browser-binding digests. */
    create(transaction: OAuthTransaction): Promise<OAuthTransaction>;
    /** Finds a transaction by its keyed-HMAC state digest. */
    findByStateDigest(digest: AuthenticationDigest): Promise<OAuthTransaction | undefined>;
    /** Finds a transaction by its internal identifier for trusted lifecycle work. */
    findById(id: OAuthTransactionId): Promise<OAuthTransaction | undefined>;
    /** Claims a pending or stale-leased transaction atomically. */
    claim(id: OAuthTransactionId, claimedAt: Date, claimExpiresAt: Date): Promise<OAuthTransaction>;
    /** Persists one valid terminal transition using compare-and-set state protection. */
    transition(transaction: OAuthTransaction, expectedState: OAuthTransaction["state"]): Promise<OAuthTransaction>;
    /** Lists expired active transactions for future bounded cleanup. */
    findExpired(now: Date, limit: number): Promise<readonly OAuthTransaction[]>;
}
/** Encrypted provider-credential persistence port with optimistic refresh versioning. */
export interface OAuthCredentialRepository {
    /** Finds the credential owned by one external identity. */
    findByExternalIdentity(externalIdentityId: ExternalIdentityId): Promise<OAuthCredential | undefined>;
    /** Creates the sole credential record for an external identity. */
    create(credential: OAuthCredential): Promise<OAuthCredential>;
    /** Replaces encrypted provider tokens only when the refresh version matches. */
    updateEncryptedCredential(id: OAuthCredentialId, expectedRefreshVersion: number, credential: OAuthCredential): Promise<OAuthCredential>;
    /** Revokes local credential use immediately without deleting ciphertext history. */
    revoke(id: OAuthCredentialId, reason: OAuthCredentialRevocationReason, occurredAt: Date): Promise<OAuthCredential>;
}
/** Discord membership snapshot port; role replacement and status update are atomic. */
export interface DiscordGuildMembershipRepository {
    /** Finds one identity/guild snapshot. */
    find(externalIdentityId: ExternalIdentityId, guildId: DiscordGuildId): Promise<DiscordGuildMembership | undefined>;
    /** Replaces a verified membership and normalized role snapshot transactionally. */
    replaceVerifiedSnapshot(membership: DiscordGuildMembership): Promise<DiscordGuildMembership>;
}
/** Append-only authentication audit port; it deliberately exposes no mutation API. */
export interface AuthenticationAuditRepository {
    /** Appends one validated immutable audit event in the caller's transaction. */
    append(event: AuthenticationAuditEvent): Promise<AuthenticationAuditEvent>;
    /** Finds immutable history for one canonical operation correlation ID. */
    findByCorrelationId(correlationId: AuthenticationAuditEvent["correlationId"]): Promise<readonly AuthenticationAuditEvent[]>;
    /** Finds one event by its immutable identifier. */
    findById(id: AuthenticationAuditEventId): Promise<AuthenticationAuditEvent | undefined>;
}
/** Repository set exposed only inside one authentication transaction callback. */
export interface AuthenticationTransactionContext {
    readonly platformUsers: PlatformUserRepository;
    readonly externalIdentities: ExternalIdentityRepository;
    readonly browserSessions: BrowserSessionRepository;
    readonly oauthTransactions: OAuthTransactionRepository;
    readonly oauthCredentials: OAuthCredentialRepository;
    readonly guildMemberships: DiscordGuildMembershipRepository;
    readonly audit: AuthenticationAuditRepository;
}
/**
 * Process-safe authentication transaction boundary. Implementations provide one
 * database transaction per callback and must roll back all writes on failure.
 */
export interface AuthenticationUnitOfWork {
    /** Runs a callback against repositories bound to the same transaction. */
    run<TResult>(operation: (context: AuthenticationTransactionContext) => Promise<TResult>, options?: AuthenticationTransactionOptions): Promise<TResult>;
}
/** Bounded execution policy for one infrastructure-owned authentication transaction. */
export interface AuthenticationTransactionOptions {
    /** Optional cooperative cancellation boundary checked before transaction work. */
    readonly signal?: AbortSignal;
    /** Optional reviewed transaction deadline in milliseconds. */
    readonly timeoutMs?: number;
}
/** Injectable wall-clock boundary for deterministic expiry and transition tests. */
export interface AuthenticationClock {
    /** Returns the authoritative instant for one application operation. */
    now(): Date;
}
/** Non-secret key reference resolved by a trusted process-level key provider. */
export interface AuthenticationKeyHandle {
    readonly purpose: "SESSION_HMAC" | "CSRF_HMAC" | "METADATA_HMAC" | "OAUTH_ENCRYPTION";
    readonly version: number;
    readonly identifier: string;
}
/** Key-provider port; raw key material never crosses the domain interface. */
export interface AuthenticationKeyProvider {
    /** Returns the active key handle for new cryptographic material. */
    active(purpose: AuthenticationKeyHandle["purpose"]): Promise<AuthenticationKeyHandle>;
    /** Returns a retained key handle for validation/decryption by version. */
    byVersion(purpose: AuthenticationKeyHandle["purpose"], version: number): Promise<AuthenticationKeyHandle | undefined>;
    /**
     * Returns a small bounded active-plus-retained set for digest verification.
     * Ordering is deterministic with the active version first; callers must never
     * use this method to scan persisted rows.
     */
    verificationCandidates(purpose: AuthenticationKeyHandle["purpose"]): Promise<readonly AuthenticationKeyHandle[]>;
}
/**
 * Cryptography port implemented with reviewed platform-native primitives later.
 * Raw secrets are ephemeral inputs/outputs and never accepted by repositories.
 */
export interface AuthenticationCrypto {
    /** Creates a high-entropy opaque credential of at least the requested byte length. */
    createOpaqueSecret(byteLength: number): Promise<OpaqueAuthenticationSecret>;
    /** Computes a keyed HMAC using a key handle rather than raw key material. */
    hmac(value: OpaqueAuthenticationSecret | string, key: AuthenticationKeyHandle): Promise<AuthenticationDigest>;
    /** Encrypts bounded plaintext for provider-only server-side use. */
    encrypt(plaintext: OpaqueAuthenticationSecret, key: AuthenticationKeyHandle, associatedData: string): Promise<EncryptedAuthenticationSecret>;
    /** Decrypts provider material only inside a bounded trusted adapter operation. */
    decrypt(encrypted: EncryptedAuthenticationSecret, key: AuthenticationKeyHandle, associatedData: string): Promise<OpaqueAuthenticationSecret>;
    /** Compares canonical digests without data-dependent early exit. */
    constantTimeEqual(left: AuthenticationDigest, right: AuthenticationDigest): Promise<boolean>;
}
/**
 * Typed internal-ID factory used by pure services. Implementations use a
 * cryptographically secure UUID source; repositories never invent service IDs.
 */
export interface AuthenticationIdGenerator {
    /** Creates a platform-account identifier for future first-login services. */
    platformUserId(): PlatformUserId;
    /** Creates an external-identity identifier for future linking services. */
    externalIdentityId(): ExternalIdentityId;
    /** Creates a browser-session identifier. */
    browserSessionId(): BrowserSessionId;
    /** Creates a one-time OAuth transaction identifier. */
    oauthTransactionId(): OAuthTransactionId;
    /** Creates an encrypted OAuth credential identifier. */
    oauthCredentialId(): OAuthCredentialId;
    /** Creates a Discord guild-membership snapshot identifier. */
    discordGuildMembershipId(): DiscordGuildMembershipId;
    /** Creates an immutable authentication audit-event identifier. */
    authenticationAuditEventId(): AuthenticationAuditEventId;
}
/** Transient authorization-code input accepted only by a provider adapter. */
export interface DiscordOAuthCodeExchangeRequest {
    readonly authorizationCode: OpaqueAuthenticationSecret;
    readonly redirectUri: URL;
    readonly pkceVerifier?: OpaqueAuthenticationSecret;
    readonly signal: AbortSignal;
}
/** Transient verified Discord token result; persistence must encrypt it immediately. */
export interface DiscordOAuthTokenResult {
    readonly accessToken: OpaqueAuthenticationSecret;
    readonly refreshToken: OpaqueAuthenticationSecret;
    readonly scopes: readonly string[];
    readonly expiresAt: Date;
}
/** Transient refresh-token input accepted only by a provider adapter. */
export interface DiscordOAuthRefreshRequest {
    /** Plaintext refresh token decrypted for exactly one provider operation. */
    readonly refreshToken: OpaqueAuthenticationSecret;
    /** Cooperative cancellation boundary. */
    readonly signal: AbortSignal;
}
/** Provider token revocation hint; local revocation remains authoritative. */
export type DiscordOAuthRevocationTokenHint = "access_token" | "refresh_token";
/** Transient provider-token revocation request. */
export interface DiscordOAuthRevocationRequest {
    /** Plaintext provider token decrypted for exactly one revocation request. */
    readonly token: OpaqueAuthenticationSecret;
    /** Optional Discord token_type_hint. */
    readonly tokenHint?: DiscordOAuthRevocationTokenHint;
    /** Cooperative cancellation boundary. */
    readonly signal: AbortSignal;
}
/** Safe OAuth authorization inspection returned by the provider. */
export interface DiscordOAuthAuthorizationInspection {
    /** Discord application/client identifier that owns the grant. */
    readonly clientId: string;
    /** Normalized granted scope set. */
    readonly scopes: readonly string[];
    /** Provider-reported grant expiry when available. */
    readonly expiresAt?: Date;
    /** Verified Discord user subject when the provider returns it. */
    readonly userId?: DiscordUserId;
}
/** Verified immutable Discord subject plus display-only provider snapshot. */
export interface VerifiedDiscordIdentity {
    readonly userId: DiscordUserId;
    readonly username?: string;
    readonly globalName?: string;
    readonly avatar?: string;
}
/** Discord OAuth network boundary; Phase 1 supplies no implementation or routes. */
export interface DiscordOAuthProvider {
    /** Returns an authorization URL from prevalidated fixed configuration keys. */
    createAuthorizationUrl(input: {
        readonly state: OpaqueAuthenticationSecret;
        readonly redirectUri: URL;
        readonly scopes: readonly string[];
        readonly pkceChallenge?: string;
    }): URL;
    /** Exchanges a one-time code without logging or persisting plaintext credentials. */
    exchangeCode(request: DiscordOAuthCodeExchangeRequest): Promise<DiscordOAuthTokenResult>;
    /** Refreshes a provider grant without retrying after possible token rotation. */
    refreshToken(request: DiscordOAuthRefreshRequest): Promise<DiscordOAuthTokenResult>;
    /** Inspects the current authorization without treating it as a Qbox credential. */
    inspectAuthorization(accessToken: OpaqueAuthenticationSecret, signal: AbortSignal): Promise<DiscordOAuthAuthorizationInspection>;
    /** Retrieves the immutable provider subject for an accepted access credential. */
    fetchIdentity(accessToken: OpaqueAuthenticationSecret, signal: AbortSignal): Promise<VerifiedDiscordIdentity>;
    /** Best-effort provider revocation; local credential rejection remains authoritative. */
    revokeCredential(request: DiscordOAuthRevocationRequest): Promise<DiscordOAuthRevocationResult>;
}
/** Result of a best-effort Discord provider revocation operation. */
export interface DiscordOAuthRevocationResult {
    /** Whether Discord accepted the revocation request. */
    readonly providerAccepted: boolean;
    /** Safe failure category when the provider request could not complete. */
    readonly failure?: DiscordOAuthProviderFailure;
}
/** Result of a fresh trusted Discord guild-membership verification. */
export interface DiscordGuildMembershipVerification {
    readonly guildId: DiscordGuildId;
    readonly status: "PRESENT" | "ABSENT" | "UNKNOWN";
    readonly roleIds: readonly DiscordRoleId[];
    readonly source: DiscordGuildMembershipSource;
    readonly verifiedAt: Date;
    readonly validUntil?: Date;
    readonly failure?: DiscordOAuthProviderFailure;
}
/** Provider-backed guild-membership verification input. */
export interface DiscordGuildMembershipVerificationRequest {
    /** Verified Discord identity whose subject must match provider membership data. */
    readonly identity: VerifiedDiscordIdentity;
    /** Plaintext access token decrypted for exactly one provider operation. */
    readonly accessToken: OpaqueAuthenticationSecret;
    /** Configured Discord guild to verify. */
    readonly guildId: DiscordGuildId;
    /** Cooperative cancellation boundary. */
    readonly signal: AbortSignal;
}
/** Discord membership verifier boundary; stale UNKNOWN state never grants access. */
export interface DiscordGuildMembershipVerifier {
    /** Verifies current membership from trusted bot/provider data under cancellation. */
    verify(request: DiscordGuildMembershipVerificationRequest): Promise<DiscordGuildMembershipVerification>;
}
/**
 * Owner recovery protection boundary. Later infrastructure must use the existing
 * permission owner lock and authentication transaction before disabling the last
 * usable owner account or login identity.
 */
export interface OwnerAccessProtectionService {
    /**
     * Runs a mutation through transaction-bound repositories only when a usable
     * owner path remains. Infrastructure appends exactly one supplied success or
     * rejection audit in the same transaction as the decision.
     */
    protect<TResult>(input: OwnerAccessProtectionInput<TResult>): Promise<TResult>;
}
/** Transaction-bound owner access request used for account and identity mutations. */
export interface OwnerAccessProtectionInput<TResult> {
    /** Authentication record whose removal may invalidate a verified owner path. */
    readonly target: {
        readonly type: "platform-user";
        readonly id: PlatformUserId;
    } | {
        readonly type: "external-identity";
        readonly id: ExternalIdentityId;
    };
    /** Canonical privileged-operation correlation identifier. */
    readonly correlationId: AuthenticationCorrelationId;
    /** Structured audit reason for the protected mutation. */
    readonly reasonCode: AuthenticationAuditReasonCode;
    /** Optional bounded operator explanation. */
    readonly reason?: string;
    /** Authoritative mutation instant. */
    readonly occurredAt: Date;
    /** Mandatory immutable event appended after a successful mutation. */
    readonly successAudit: AuthenticationAuditEvent;
    /** Mandatory immutable event appended when owner access rejects the mutation. */
    readonly rejectionAudit: AuthenticationAuditEvent;
    /** Mutation receiving repositories bound to the locked transaction. */
    readonly operation: (context: AuthenticationTransactionContext) => Promise<TResult>;
}
/** Reserved provider constant documents that no additional provider is operational. */
export declare const INITIAL_AUTHENTICATION_PROVIDER: OAuthProvider;
/** Reserved structured failure contract for future persistence implementations. */
export interface AuthenticationRepositoryFailure {
    readonly code: "CONFLICT" | "NOT_FOUND" | "STALE_REVISION" | "STALE_TRANSACTION_STATE" | "DEPENDENCY_UNAVAILABLE" | "INVALID_PERSISTED_STATE";
    readonly operation: string;
    readonly retryable: boolean;
}
/** Reserved provider failure contract without credential or response-body leakage. */
export interface DiscordOAuthProviderFailure {
    readonly code: OAuthTransactionFailureReason | "EXPIRED_OR_REVOKED_PROVIDER_TOKEN" | "MISSING_REQUIRED_SCOPE" | "IDENTITY_MISMATCH" | "APPLICATION_MISMATCH" | "CONFIRMED_NON_MEMBERSHIP" | "MEMBERSHIP_PENDING" | "RATE_LIMITED" | "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE" | "MALFORMED_PROVIDER_RESPONSE" | "CANCELLED" | "LOCAL_CRYPTOGRAPHY_FAILURE";
    readonly retryable: boolean;
    readonly operation?: string;
    readonly retryAfterMs?: number;
    readonly httpStatusCategory?: "4xx" | "5xx";
}
//# sourceMappingURL=ports.d.ts.map