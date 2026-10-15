import { authenticationAuditEventId, authenticationCorrelationId, authenticationDigest, browserSessionId, discordGuildId, discordUserId, externalIdentityId, oauthCredentialId, oauthTransactionId, platformUserId, type AuthenticationAuditEvent, type AuthenticationAuditRepository, type AuthenticationTransactionContext, type AuthenticationTransactionOptions, type AuthenticationUnitOfWork, type BrowserSession, type BrowserSessionRepository, type BrowserSessionRevocationReason, type DiscordGuildMembership, type DiscordGuildMembershipRepository, type ExternalIdentity, type ExternalIdentityProvider, type ExternalIdentityRepository, type OAuthCredential, type OAuthCredentialRepository, type OAuthCredentialRevocationReason, type OAuthTransaction, type OAuthTransactionRepository, type PlatformUser, type PlatformUserRepository, type PlatformUserStatus, type PlatformUserStatusReasonCode } from "@qbox/authentication";
import { Prisma, type PrismaClient } from "@qbox/prisma";
type DatabaseContext = PrismaClient | Prisma.TransactionClient;
/** Immutable repository collection backed by one Prisma client or transaction. */
export interface PrismaAuthenticationRepositorySet extends AuthenticationTransactionContext {
    readonly platformUsers: PrismaPlatformUserRepository;
    readonly externalIdentities: PrismaExternalIdentityRepository;
    readonly browserSessions: PrismaBrowserSessionRepository;
    readonly oauthTransactions: PrismaOAuthTransactionRepository;
    readonly oauthCredentials: PrismaOAuthCredentialRepository;
    readonly guildMemberships: PrismaDiscordGuildMembershipRepository;
    readonly audit: PrismaAuthenticationAuditRepository;
}
/** Creates authentication repositories over one exact Prisma context. */
export declare function createPrismaAuthenticationRepositorySet(database: DatabaseContext): PrismaAuthenticationRepositorySet;
/**
 * Prisma authentication unit of work. Each callback receives repositories bound
 * to one PostgreSQL transaction and the transaction objects are never retained.
 */
export declare class PrismaAuthenticationUnitOfWork implements AuthenticationUnitOfWork {
    private readonly client;
    private readonly defaultTimeoutMs;
    /** Creates a transaction boundary over the lifecycle-owned process client. */
    constructor(client: PrismaClient, defaultTimeoutMs?: number);
    /** Runs one callback atomically with optional cancellation and timeout policy. */
    run<TResult>(operation: (context: AuthenticationTransactionContext) => Promise<TResult>, options?: AuthenticationTransactionOptions): Promise<TResult>;
}
/** Prisma-backed canonical platform-account repository. */
export declare class PrismaPlatformUserRepository implements PlatformUserRepository {
    private readonly database;
    /** Binds account operations to an existing Prisma client or transaction. */
    constructor(database: DatabaseContext);
    /** Finds one account by its immutable internal UUID. */
    findById(id: ReturnType<typeof platformUserId>): Promise<PlatformUser | undefined>;
    /** Creates a validated account without relying on database-generated identity. */
    create(user: PlatformUser): Promise<PlatformUser>;
    /** Applies a compare-and-set lifecycle transition and increments auth revision. */
    updateStatus(id: ReturnType<typeof platformUserId>, expectedAuthenticationRevision: number, status: PlatformUserStatus, reasonCode: PlatformUserStatusReasonCode, occurredAt: Date): Promise<PlatformUser>;
    /** Increments only the authentication revision using compare-and-set semantics. */
    incrementAuthenticationRevision(id: ReturnType<typeof platformUserId>, expectedAuthenticationRevision: number, occurredAt: Date): Promise<PlatformUser>;
}
/** Prisma-backed retained external-identity ownership repository. */
export declare class PrismaExternalIdentityRepository implements ExternalIdentityRepository {
    private readonly database;
    /** Binds identity operations to an existing Prisma client or transaction. */
    constructor(database: DatabaseContext);
    /** Finds a retained identity by internal UUID. */
    findById(id: ReturnType<typeof externalIdentityId>): Promise<ExternalIdentity | undefined>;
    /** Finds globally retained ownership by immutable provider subject. */
    findByProviderSubject(provider: ExternalIdentityProvider, providerSubjectId: ReturnType<typeof discordUserId>): Promise<ExternalIdentity | undefined>;
    /** Finds the sole initial identity owned by one account/provider pair. */
    findByPlatformUser(platformUserIdValue: ReturnType<typeof platformUserId>, provider: ExternalIdentityProvider): Promise<ExternalIdentity | undefined>;
    /** Creates immutable identity ownership and translates either uniqueness conflict. */
    create(identity: ExternalIdentity): Promise<ExternalIdentity>;
    /** Updates display-only verified profile fields without transferring ownership. */
    updateVerifiedIdentity(identity: ExternalIdentity): Promise<ExternalIdentity>;
    /** Idempotently unlinks an identity while retaining provider-subject ownership. */
    unlink(id: ReturnType<typeof externalIdentityId>, occurredAt: Date): Promise<ExternalIdentity>;
}
/** Prisma-backed keyed-digest browser-session repository. */
export declare class PrismaBrowserSessionRepository implements BrowserSessionRepository {
    private readonly database;
    /** Binds session operations to an existing Prisma client or transaction. */
    constructor(database: DatabaseContext);
    /** Serializes account-wide session mutations within the ambient transaction. */
    acquireAccountMutationLock(platformUserIdValue: ReturnType<typeof platformUserId>): Promise<void>;
    /** Finds one session by a canonical keyed-HMAC digest. */
    findByTokenDigest(digest: ReturnType<typeof authenticationDigest>): Promise<BrowserSession | undefined>;
    /** Finds one session by internal UUID. */
    findById(id: ReturnType<typeof browserSessionId>): Promise<BrowserSession | undefined>;
    /** Creates one validated digest-only session record. */
    create(session: BrowserSession): Promise<BrowserSession>;
    /** Rotates a predecessor and creates its sole successor in one transaction. */
    rotate(sourceId: ReturnType<typeof browserSessionId>, successor: BrowserSession): Promise<BrowserSession>;
    /** Idempotently revokes one active session without reactivating terminal rows. */
    revoke(id: ReturnType<typeof browserSessionId>, reason: BrowserSessionRevocationReason, occurredAt: Date): Promise<BrowserSession | undefined>;
    /** Revokes every currently active account session with one conditional update. */
    revokeAll(platformUserIdValue: ReturnType<typeof platformUserId>, reason: BrowserSessionRevocationReason, occurredAt: Date): Promise<number>;
    /** Lists active non-expired sessions in deterministic LRU order. */
    findActiveForPlatformUser(platformUserIdValue: ReturnType<typeof platformUserId>, now: Date): Promise<readonly BrowserSession[]>;
    /** Lists bounded temporal expirations without deleting historical rows. */
    findExpired(now: Date, limit: number): Promise<readonly BrowserSession[]>;
    /** Advances activity using a last-seen compare-and-set guard. */
    touch(id: ReturnType<typeof browserSessionId>, expectedLastSeenAt: Date, lastSeenAt: Date, idleExpiresAt: Date): Promise<BrowserSession | undefined>;
}
/** Prisma-backed one-time OAuth transaction state repository. */
export declare class PrismaOAuthTransactionRepository implements OAuthTransactionRepository {
    private readonly database;
    /** Binds transaction operations to an existing Prisma client or transaction. */
    constructor(database: DatabaseContext);
    /** Creates a validated pending transaction with unique keyed digests. */
    create(transaction: OAuthTransaction): Promise<OAuthTransaction>;
    /** Finds a transaction by keyed state digest. */
    findByStateDigest(digest: ReturnType<typeof authenticationDigest>): Promise<OAuthTransaction | undefined>;
    /** Finds a transaction by internal identifier. */
    findById(id: ReturnType<typeof oauthTransactionId>): Promise<OAuthTransaction | undefined>;
    /** Atomically claims PENDING or reclaims a stale CLAIMED lease. */
    claim(id: ReturnType<typeof oauthTransactionId>, claimedAt: Date, claimExpiresAt: Date): Promise<OAuthTransaction>;
    /** Persists one compare-and-set terminal state transition. */
    transition(transaction: OAuthTransaction, expectedState: OAuthTransaction["state"]): Promise<OAuthTransaction>;
    /** Lists bounded active transactions whose absolute expiry has elapsed. */
    findExpired(now: Date, limit: number): Promise<readonly OAuthTransaction[]>;
}
/** Prisma-backed encrypted OAuth credential repository. */
export declare class PrismaOAuthCredentialRepository implements OAuthCredentialRepository {
    private readonly database;
    /** Binds credential operations to an existing Prisma client or transaction. */
    constructor(database: DatabaseContext);
    /** Finds the sole locally usable or revoked credential for an identity. */
    findByExternalIdentity(externalIdentityIdValue: ReturnType<typeof externalIdentityId>): Promise<OAuthCredential | undefined>;
    /** Persists complete encrypted token envelopes and no plaintext fields. */
    create(credential: OAuthCredential): Promise<OAuthCredential>;
    /** Replaces ciphertext using optimistic refresh-version compare-and-set. */
    updateEncryptedCredential(id: ReturnType<typeof oauthCredentialId>, expectedRefreshVersion: number, credential: OAuthCredential): Promise<OAuthCredential>;
    /** Idempotently disables local credential use while retaining encrypted history. */
    revoke(id: ReturnType<typeof oauthCredentialId>, reason: OAuthCredentialRevocationReason, occurredAt: Date): Promise<OAuthCredential>;
}
/** Prisma-backed Discord guild-membership snapshot repository. */
export declare class PrismaDiscordGuildMembershipRepository implements DiscordGuildMembershipRepository {
    private readonly database;
    /** Binds membership operations to an existing Prisma client or transaction. */
    constructor(database: DatabaseContext);
    /** Finds one identity/guild snapshot including normalized role children. */
    find(externalIdentityIdValue: ReturnType<typeof externalIdentityId>, guildDiscordId: ReturnType<typeof discordGuildId>): Promise<DiscordGuildMembership | undefined>;
    /** Atomically replaces status and normalized roles with deterministic deduplication. */
    replaceVerifiedSnapshot(membership: DiscordGuildMembership): Promise<DiscordGuildMembership>;
}
/** Prisma-backed append-only authentication security audit repository. */
export declare class PrismaAuthenticationAuditRepository implements AuthenticationAuditRepository {
    private readonly database;
    /** Binds audit operations to an existing Prisma client or transaction. */
    constructor(database: DatabaseContext);
    /** Appends one validated event; no update or delete operation is exposed. */
    append(event: AuthenticationAuditEvent): Promise<AuthenticationAuditEvent>;
    /** Lists immutable events for one canonical correlation identifier. */
    findByCorrelationId(correlationId: ReturnType<typeof authenticationCorrelationId>): Promise<readonly AuthenticationAuditEvent[]>;
    /** Finds one immutable event by internal UUID. */
    findById(id: ReturnType<typeof authenticationAuditEventId>): Promise<AuthenticationAuditEvent | undefined>;
}
export {};
//# sourceMappingURL=PrismaAuthenticationRepositories.d.ts.map