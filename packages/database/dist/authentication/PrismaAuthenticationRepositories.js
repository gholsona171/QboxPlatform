import { AuthenticationInfrastructureError, AuthenticationDomainError, AuthenticationServiceError, OwnerAccessInvariantError, validateAuthenticationAuditEvent, validateBrowserSession, validateDiscordGuildMembership, validateExternalIdentity, validateOAuthCredential, validateOAuthTransaction, validatePlatformUser, transitionPlatformUser, authenticationAuditEventId, authenticationCorrelationId, authenticationDigest, authenticationRequestId, browserSessionId, discordGuildId, discordGuildMembershipId, discordRoleId, discordUserId, externalIdentityId, guildId, oauthCredentialId, oauthTransactionId, platformUserId, serviceIdentityId, } from "@qbox/authentication";
import { AuthenticationAuditAction, AuthenticationAuditActorType, AuthenticationAuditOutcome, AuthenticationAuditReasonCode, AuthenticationProvider, BrowserSessionRevocationReason as PrismaBrowserSessionRevocationReason, BrowserSessionStatus, DiscordGuildMembershipSource, DiscordGuildMembershipStatus, OAuthCredentialRevocationReason as PrismaOAuthCredentialRevocationReason, OAuthPkceMode as PrismaOAuthPkceMode, OAuthTransactionFailureReason, OAuthTransactionPurpose, OAuthTransactionState, PlatformUserStatus as PrismaPlatformUserStatus, PlatformUserStatusReasonCode as PrismaPlatformUserStatusReasonCode, Prisma, } from "@qbox/prisma";
/** Creates authentication repositories over one exact Prisma context. */
export function createPrismaAuthenticationRepositorySet(database) {
    return Object.freeze({
        platformUsers: new PrismaPlatformUserRepository(database),
        externalIdentities: new PrismaExternalIdentityRepository(database),
        browserSessions: new PrismaBrowserSessionRepository(database),
        oauthTransactions: new PrismaOAuthTransactionRepository(database),
        oauthCredentials: new PrismaOAuthCredentialRepository(database),
        guildMemberships: new PrismaDiscordGuildMembershipRepository(database),
        audit: new PrismaAuthenticationAuditRepository(database),
    });
}
/**
 * Prisma authentication unit of work. Each callback receives repositories bound
 * to one PostgreSQL transaction and the transaction objects are never retained.
 */
export class PrismaAuthenticationUnitOfWork {
    client;
    defaultTimeoutMs;
    /** Creates a transaction boundary over the lifecycle-owned process client. */
    constructor(client, defaultTimeoutMs = 5_000) {
        this.client = client;
        this.defaultTimeoutMs = defaultTimeoutMs;
        validateTimeout(defaultTimeoutMs);
    }
    /** Runs one callback atomically with optional cancellation and timeout policy. */
    async run(operation, options = {}) {
        if (options.signal?.aborted)
            throw failure("dependency-unavailable", "authentication.transaction", true);
        const timeout = options.timeoutMs ?? this.defaultTimeoutMs;
        validateTimeout(timeout);
        try {
            return await this.client.$transaction(async (transaction) => {
                if (options.signal?.aborted)
                    throw failure("dependency-unavailable", "authentication.transaction", true);
                return operation(createPrismaAuthenticationRepositorySet(transaction));
            }, { timeout, maxWait: timeout });
        }
        catch (error) {
            if (error instanceof AuthenticationInfrastructureError ||
                error instanceof AuthenticationDomainError ||
                error instanceof AuthenticationServiceError ||
                error instanceof OwnerAccessInvariantError)
                throw error;
            throw translate(error, "authentication.transaction");
        }
    }
}
/** Prisma-backed canonical platform-account repository. */
export class PrismaPlatformUserRepository {
    database;
    /** Binds account operations to an existing Prisma client or transaction. */
    constructor(database) {
        this.database = database;
    }
    /** Finds one account by its immutable internal UUID. */
    async findById(id) {
        return guarded("platform-user.find", async () => {
            const row = await this.database.platformUser.findUnique({ where: { id } });
            return row ? mapPlatformUser(row) : undefined;
        });
    }
    /** Creates a validated account without relying on database-generated identity. */
    async create(user) {
        validatePlatformUser(user);
        return guarded("platform-user.create", async () => mapPlatformUser(await this.database.platformUser.create({
            data: {
                id: user.id,
                status: platformUserStatus(user.status),
                authenticationRevision: user.authenticationRevision,
                statusReasonCode: platformUserStatusReason(user.statusReasonCode),
                ...(user.suspendedAt ? { suspendedAt: user.suspendedAt } : {}),
                ...(user.disabledAt ? { disabledAt: user.disabledAt } : {}),
                ...(user.deletedAt ? { deletedAt: user.deletedAt } : {}),
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        })), "conflict");
    }
    /** Applies a compare-and-set lifecycle transition and increments auth revision. */
    async updateStatus(id, expectedAuthenticationRevision, status, reasonCode, occurredAt) {
        return guarded("platform-user.update-status", async () => {
            const current = await this.database.platformUser.findUnique({ where: { id } });
            if (!current)
                throw failure("not-found", "platform-user.update-status");
            const next = transitionPlatformUser(mapPlatformUser(current), status, reasonCode, occurredAt);
            const updated = await this.database.platformUser.updateMany({
                where: { id, authenticationRevision: expectedAuthenticationRevision },
                data: {
                    status: platformUserStatus(next.status),
                    authenticationRevision: next.authenticationRevision,
                    statusReasonCode: platformUserStatusReason(next.statusReasonCode),
                    suspendedAt: next.suspendedAt ?? null,
                    disabledAt: next.disabledAt ?? null,
                    deletedAt: next.deletedAt ?? null,
                    updatedAt: next.updatedAt,
                },
            });
            if (updated.count !== 1)
                throw failure("stale-revision", "platform-user.update-status", true);
            return mapPlatformUser(await this.database.platformUser.findUniqueOrThrow({ where: { id } }));
        });
    }
    /** Increments only the authentication revision using compare-and-set semantics. */
    async incrementAuthenticationRevision(id, expectedAuthenticationRevision, occurredAt) {
        return guarded("platform-user.increment-revision", async () => {
            const updated = await this.database.platformUser.updateMany({
                where: { id, authenticationRevision: expectedAuthenticationRevision },
                data: {
                    authenticationRevision: { increment: 1 },
                    updatedAt: occurredAt,
                },
            });
            if (updated.count !== 1) {
                const exists = await this.database.platformUser.count({ where: { id } });
                throw failure(exists ? "stale-revision" : "not-found", "platform-user.increment-revision", exists > 0);
            }
            return mapPlatformUser(await this.database.platformUser.findUniqueOrThrow({ where: { id } }));
        });
    }
}
/** Prisma-backed retained external-identity ownership repository. */
export class PrismaExternalIdentityRepository {
    database;
    /** Binds identity operations to an existing Prisma client or transaction. */
    constructor(database) {
        this.database = database;
    }
    /** Finds a retained identity by internal UUID. */
    async findById(id) {
        return guarded("external-identity.find-id", async () => {
            const row = await this.database.externalIdentity.findUnique({ where: { id } });
            return row ? mapExternalIdentity(row) : undefined;
        });
    }
    /** Finds globally retained ownership by immutable provider subject. */
    async findByProviderSubject(provider, providerSubjectId) {
        return guarded("external-identity.find-subject", async () => {
            const row = await this.database.externalIdentity.findUnique({
                where: {
                    provider_providerSubjectId: {
                        provider: authenticationProvider(provider),
                        providerSubjectId,
                    },
                },
            });
            return row ? mapExternalIdentity(row) : undefined;
        });
    }
    /** Finds the sole initial identity owned by one account/provider pair. */
    async findByPlatformUser(platformUserIdValue, provider) {
        return guarded("external-identity.find-account", async () => {
            const row = await this.database.externalIdentity.findUnique({
                where: {
                    platformUserId_provider: {
                        platformUserId: platformUserIdValue,
                        provider: authenticationProvider(provider),
                    },
                },
            });
            return row ? mapExternalIdentity(row) : undefined;
        });
    }
    /** Creates immutable identity ownership and translates either uniqueness conflict. */
    async create(identity) {
        validateExternalIdentity(identity);
        try {
            return mapExternalIdentity(await this.database.externalIdentity.create({
                data: {
                    id: identity.id,
                    platformUserId: identity.platformUserId,
                    provider: authenticationProvider(identity.provider),
                    providerSubjectId: identity.providerSubjectId,
                    username: identity.profile.username ?? null,
                    globalName: identity.profile.globalName ?? null,
                    avatar: identity.profile.avatar ?? null,
                    enabled: identity.enabled,
                    linkedAt: identity.linkedAt,
                    verifiedAt: identity.verifiedAt,
                    lastProviderRefreshAt: identity.lastProviderRefreshAt ?? null,
                    unlinkedAt: identity.unlinkedAt ?? null,
                    createdAt: identity.createdAt,
                    updatedAt: identity.updatedAt,
                },
            }));
        }
        catch (error) {
            if (isUnique(error)) {
                const existing = await this.database.externalIdentity.findFirst({
                    where: {
                        OR: [
                            {
                                provider: authenticationProvider(identity.provider),
                                providerSubjectId: identity.providerSubjectId,
                            },
                            {
                                platformUserId: identity.platformUserId,
                                provider: authenticationProvider(identity.provider),
                            },
                        ],
                    },
                });
                const code = existing?.providerSubjectId === identity.providerSubjectId
                    ? "duplicate-provider-identity"
                    : "duplicate-account-provider-identity";
                throw failure(code, "external-identity.create");
            }
            throw translate(error, "external-identity.create");
        }
    }
    /** Updates display-only verified profile fields without transferring ownership. */
    async updateVerifiedIdentity(identity) {
        validateExternalIdentity(identity);
        return guarded("external-identity.update-profile", async () => {
            const updated = await this.database.externalIdentity.updateMany({
                where: {
                    id: identity.id,
                    platformUserId: identity.platformUserId,
                    provider: authenticationProvider(identity.provider),
                    providerSubjectId: identity.providerSubjectId,
                },
                data: {
                    username: identity.profile.username ?? null,
                    globalName: identity.profile.globalName ?? null,
                    avatar: identity.profile.avatar ?? null,
                    verifiedAt: identity.verifiedAt,
                    lastProviderRefreshAt: identity.lastProviderRefreshAt ?? null,
                    updatedAt: identity.updatedAt,
                },
            });
            if (updated.count !== 1)
                throw failure("not-found", "external-identity.update-profile");
            return mapExternalIdentity(await this.database.externalIdentity.findUniqueOrThrow({
                where: { id: identity.id },
            }));
        });
    }
    /** Idempotently unlinks an identity while retaining provider-subject ownership. */
    async unlink(id, occurredAt) {
        return guarded("external-identity.unlink", async () => {
            const existing = await this.database.externalIdentity.findUnique({ where: { id } });
            if (!existing)
                throw failure("not-found", "external-identity.unlink");
            if (!existing.enabled && existing.unlinkedAt)
                return mapExternalIdentity(existing);
            return mapExternalIdentity(await this.database.externalIdentity.update({
                where: { id },
                data: { enabled: false, unlinkedAt: occurredAt, updatedAt: occurredAt },
            }));
        });
    }
}
/** Prisma-backed keyed-digest browser-session repository. */
export class PrismaBrowserSessionRepository {
    database;
    /** Binds session operations to an existing Prisma client or transaction. */
    constructor(database) {
        this.database = database;
    }
    /** Serializes account-wide session mutations within the ambient transaction. */
    async acquireAccountMutationLock(platformUserIdValue) {
        return guarded("browser-session.account-lock", async () => {
            const lockKey = `qbox:browser-sessions:${platformUserIdValue}`;
            await this.database.$executeRaw `
        SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))
      `;
        });
    }
    /** Finds one session by a canonical keyed-HMAC digest. */
    async findByTokenDigest(digest) {
        return guarded("browser-session.find-digest", async () => {
            const row = await this.database.browserSession.findUnique({
                where: { tokenDigest: digest },
            });
            return row ? mapBrowserSession(row) : undefined;
        });
    }
    /** Finds one session by internal UUID. */
    async findById(id) {
        return guarded("browser-session.find-id", async () => {
            const row = await this.database.browserSession.findUnique({ where: { id } });
            return row ? mapBrowserSession(row) : undefined;
        });
    }
    /** Creates one validated digest-only session record. */
    async create(session) {
        validateBrowserSession(session);
        return guarded("browser-session.create", async () => mapBrowserSession(await createBrowserSession(this.database, session)), "duplicate-session-digest");
    }
    /** Rotates a predecessor and creates its sole successor in one transaction. */
    async rotate(sourceId, successor) {
        validateBrowserSession(successor);
        return guarded("browser-session.rotate", () => atomic(this.database, async (transaction) => {
            const source = await transaction.browserSession.findUnique({
                where: { id: sourceId },
            });
            if (!source || source.status !== BrowserSessionStatus.ACTIVE)
                throw failure("session-rotation-conflict", "browser-session.rotate", true);
            const updated = await transaction.browserSession.updateMany({
                where: { id: sourceId, status: BrowserSessionStatus.ACTIVE },
                data: {
                    status: BrowserSessionStatus.ROTATED,
                    revokedAt: successor.createdAt,
                    revocationReason: PrismaBrowserSessionRevocationReason.ROTATED,
                    updatedAt: successor.createdAt,
                },
            });
            if (updated.count !== 1)
                throw failure("session-rotation-conflict", "browser-session.rotate", true);
            try {
                return mapBrowserSession(await createBrowserSession(transaction, successor));
            }
            catch (error) {
                if (isUnique(error))
                    throw failure("session-rotation-conflict", "browser-session.rotate", true);
                throw error;
            }
        }));
    }
    /** Idempotently revokes one active session without reactivating terminal rows. */
    async revoke(id, reason, occurredAt) {
        return guarded("browser-session.revoke", async () => {
            const existing = await this.database.browserSession.findUnique({ where: { id } });
            if (!existing)
                return undefined;
            if (existing.status !== BrowserSessionStatus.ACTIVE)
                return mapBrowserSession(existing);
            await this.database.browserSession.updateMany({
                where: { id, status: BrowserSessionStatus.ACTIVE },
                data: {
                    status: reason === "EXPIRED"
                        ? BrowserSessionStatus.EXPIRED
                        : reason === "ROTATED"
                            ? BrowserSessionStatus.ROTATED
                            : BrowserSessionStatus.REVOKED,
                    revokedAt: occurredAt,
                    revocationReason: browserSessionRevocationReason(reason),
                    updatedAt: occurredAt,
                },
            });
            return mapBrowserSession(await this.database.browserSession.findUniqueOrThrow({ where: { id } }));
        });
    }
    /** Revokes every currently active account session with one conditional update. */
    async revokeAll(platformUserIdValue, reason, occurredAt) {
        return guarded("browser-session.revoke-all", async () => (await this.database.browserSession.updateMany({
            where: {
                platformUserId: platformUserIdValue,
                status: BrowserSessionStatus.ACTIVE,
            },
            data: {
                status: BrowserSessionStatus.REVOKED,
                revokedAt: occurredAt,
                revocationReason: browserSessionRevocationReason(reason),
                updatedAt: occurredAt,
            },
        })).count);
    }
    /** Lists active non-expired sessions in deterministic LRU order. */
    async findActiveForPlatformUser(platformUserIdValue, now) {
        return guarded("browser-session.find-active", async () => (await this.database.browserSession.findMany({
            where: {
                platformUserId: platformUserIdValue,
                status: BrowserSessionStatus.ACTIVE,
                idleExpiresAt: { gt: now },
                absoluteExpiresAt: { gt: now },
            },
            orderBy: [{ lastSeenAt: "asc" }, { createdAt: "asc" }, { id: "asc" }],
        })).map(mapBrowserSession));
    }
    /** Lists bounded temporal expirations without deleting historical rows. */
    async findExpired(now, limit) {
        validateLimit(limit, 1_000);
        return guarded("browser-session.find-expired", async () => (await this.database.browserSession.findMany({
            where: {
                status: BrowserSessionStatus.ACTIVE,
                OR: [{ idleExpiresAt: { lte: now } }, { absoluteExpiresAt: { lte: now } }],
            },
            orderBy: [{ absoluteExpiresAt: "asc" }, { idleExpiresAt: "asc" }, { id: "asc" }],
            take: limit,
        })).map(mapBrowserSession));
    }
    /** Advances activity using a last-seen compare-and-set guard. */
    async touch(id, expectedLastSeenAt, lastSeenAt, idleExpiresAt) {
        return guarded("browser-session.touch", async () => {
            const updated = await this.database.browserSession.updateMany({
                where: {
                    id,
                    status: BrowserSessionStatus.ACTIVE,
                    lastSeenAt: expectedLastSeenAt,
                    idleExpiresAt: { gt: lastSeenAt },
                    absoluteExpiresAt: { gt: lastSeenAt, gte: idleExpiresAt },
                },
                data: { lastSeenAt, idleExpiresAt, updatedAt: lastSeenAt },
            });
            if (updated.count === 0)
                return undefined;
            return mapBrowserSession(await this.database.browserSession.findUniqueOrThrow({ where: { id } }));
        });
    }
}
/** Prisma-backed one-time OAuth transaction state repository. */
export class PrismaOAuthTransactionRepository {
    database;
    /** Binds transaction operations to an existing Prisma client or transaction. */
    constructor(database) {
        this.database = database;
    }
    /** Creates a validated pending transaction with unique keyed digests. */
    async create(transaction) {
        validateOAuthTransaction(transaction);
        return guarded("oauth-transaction.create", async () => mapOAuthTransaction(await this.database.oAuthTransaction.create({
            data: oauthTransactionData(transaction),
        })), "conflict");
    }
    /** Finds a transaction by keyed state digest. */
    async findByStateDigest(digest) {
        return guarded("oauth-transaction.find-state", async () => {
            const row = await this.database.oAuthTransaction.findUnique({
                where: { stateDigest: digest },
            });
            return row ? mapOAuthTransaction(row) : undefined;
        });
    }
    /** Finds a transaction by internal identifier. */
    async findById(id) {
        return guarded("oauth-transaction.find-id", async () => {
            const row = await this.database.oAuthTransaction.findUnique({ where: { id } });
            return row ? mapOAuthTransaction(row) : undefined;
        });
    }
    /** Atomically claims PENDING or reclaims a stale CLAIMED lease. */
    async claim(id, claimedAt, claimExpiresAt) {
        return guarded("oauth-transaction.claim", async () => {
            const updated = await this.database.oAuthTransaction.updateMany({
                where: {
                    id,
                    expiresAt: { gt: claimedAt },
                    OR: [
                        { state: OAuthTransactionState.PENDING },
                        {
                            state: OAuthTransactionState.CLAIMED,
                            claimExpiresAt: { lte: claimedAt },
                        },
                    ],
                },
                data: {
                    state: OAuthTransactionState.CLAIMED,
                    claimedAt,
                    claimExpiresAt,
                    updatedAt: claimedAt,
                },
            });
            if (updated.count !== 1) {
                const current = await this.database.oAuthTransaction.findUnique({ where: { id } });
                if (!current)
                    throw failure("not-found", "oauth-transaction.claim");
                if (current.state === OAuthTransactionState.COMPLETED ||
                    current.state === OAuthTransactionState.FAILED ||
                    current.state === OAuthTransactionState.CANCELLED ||
                    current.state === OAuthTransactionState.EXPIRED)
                    throw failure("oauth-transaction-terminal", "oauth-transaction.claim");
                throw failure("oauth-transaction-claimed", "oauth-transaction.claim", true);
            }
            return mapOAuthTransaction(await this.database.oAuthTransaction.findUniqueOrThrow({ where: { id } }));
        });
    }
    /** Persists one compare-and-set terminal state transition. */
    async transition(transaction, expectedState) {
        validateOAuthTransaction(transaction);
        return guarded("oauth-transaction.transition", async () => {
            const updated = await this.database.oAuthTransaction.updateMany({
                where: { id: transaction.id, state: oauthTransactionState(expectedState) },
                data: oauthTransactionTransitionData(transaction),
            });
            if (updated.count !== 1) {
                const current = await this.database.oAuthTransaction.findUnique({
                    where: { id: transaction.id },
                });
                throw failure(current && terminalOAuthState(current.state)
                    ? "oauth-transaction-terminal"
                    : current
                        ? "stale-transaction-state"
                        : "not-found", "oauth-transaction.transition", Boolean(current && !terminalOAuthState(current.state)));
            }
            return mapOAuthTransaction(await this.database.oAuthTransaction.findUniqueOrThrow({
                where: { id: transaction.id },
            }));
        });
    }
    /** Lists bounded active transactions whose absolute expiry has elapsed. */
    async findExpired(now, limit) {
        validateLimit(limit, 1_000);
        return guarded("oauth-transaction.find-expired", async () => (await this.database.oAuthTransaction.findMany({
            where: {
                state: { in: [OAuthTransactionState.PENDING, OAuthTransactionState.CLAIMED] },
                expiresAt: { lte: now },
            },
            orderBy: [{ expiresAt: "asc" }, { id: "asc" }],
            take: limit,
        })).map(mapOAuthTransaction));
    }
}
/** Prisma-backed encrypted OAuth credential repository. */
export class PrismaOAuthCredentialRepository {
    database;
    /** Binds credential operations to an existing Prisma client or transaction. */
    constructor(database) {
        this.database = database;
    }
    /** Finds the sole locally usable or revoked credential for an identity. */
    async findByExternalIdentity(externalIdentityIdValue) {
        return guarded("oauth-credential.find", async () => {
            const row = await this.database.oAuthCredential.findUnique({
                where: { externalIdentityId: externalIdentityIdValue },
            });
            return row ? mapOAuthCredential(row) : undefined;
        });
    }
    /** Persists complete encrypted token envelopes and no plaintext fields. */
    async create(credential) {
        validateOAuthCredential(credential);
        return guarded("oauth-credential.create", async () => mapOAuthCredential(await this.database.oAuthCredential.create({
            data: oauthCredentialData(credential),
        })), "conflict");
    }
    /** Replaces ciphertext using optimistic refresh-version compare-and-set. */
    async updateEncryptedCredential(id, expectedRefreshVersion, credential) {
        validateOAuthCredential(credential);
        if (credential.id !== id || credential.refreshVersion !== expectedRefreshVersion + 1)
            throw failure("credential-refresh-conflict", "oauth-credential.refresh");
        return guarded("oauth-credential.refresh", async () => {
            const updated = await this.database.oAuthCredential.updateMany({
                where: { id, refreshVersion: expectedRefreshVersion, revokedAt: null },
                data: {
                    accessTokenCiphertext: bytes(credential.encryptedAccessToken.ciphertext),
                    accessTokenNonce: bytes(credential.encryptedAccessToken.nonce),
                    accessTokenAuthenticationTag: bytes(credential.encryptedAccessToken.authenticationTag),
                    accessTokenKeyVersion: credential.encryptedAccessToken.keyVersion,
                    refreshTokenCiphertext: bytes(credential.encryptedRefreshToken.ciphertext),
                    refreshTokenNonce: bytes(credential.encryptedRefreshToken.nonce),
                    refreshTokenAuthenticationTag: bytes(credential.encryptedRefreshToken.authenticationTag),
                    refreshTokenKeyVersion: credential.encryptedRefreshToken.keyVersion,
                    scopes: [...credential.scopes],
                    providerExpiresAt: credential.providerExpiresAt,
                    refreshVersion: credential.refreshVersion,
                    updatedAt: credential.updatedAt,
                },
            });
            if (updated.count !== 1)
                throw failure("credential-refresh-conflict", "oauth-credential.refresh", true);
            return mapOAuthCredential(await this.database.oAuthCredential.findUniqueOrThrow({ where: { id } }));
        });
    }
    /** Idempotently disables local credential use while retaining encrypted history. */
    async revoke(id, reason, occurredAt) {
        return guarded("oauth-credential.revoke", async () => {
            const current = await this.database.oAuthCredential.findUnique({ where: { id } });
            if (!current)
                throw failure("not-found", "oauth-credential.revoke");
            if (current.revokedAt)
                return mapOAuthCredential(current);
            return mapOAuthCredential(await this.database.oAuthCredential.update({
                where: { id },
                data: {
                    revokedAt: occurredAt,
                    revocationReason: oauthCredentialRevocationReason(reason),
                    updatedAt: occurredAt,
                },
            }));
        });
    }
}
/** Prisma-backed Discord guild-membership snapshot repository. */
export class PrismaDiscordGuildMembershipRepository {
    database;
    /** Binds membership operations to an existing Prisma client or transaction. */
    constructor(database) {
        this.database = database;
    }
    /** Finds one identity/guild snapshot including normalized role children. */
    async find(externalIdentityIdValue, guildDiscordId) {
        return guarded("guild-membership.find", async () => {
            const row = await this.database.discordGuildMembership.findFirst({
                where: {
                    externalIdentityId: externalIdentityIdValue,
                    guild: { discordGuildId: guildDiscordId },
                },
                include: { roles: { orderBy: { roleId: "asc" } } },
            });
            return row ? mapDiscordGuildMembership(row) : undefined;
        });
    }
    /** Atomically replaces status and normalized roles with deterministic deduplication. */
    async replaceVerifiedSnapshot(membership) {
        validateDiscordGuildMembership(membership);
        return guarded("guild-membership.replace", () => atomic(this.database, async (transaction) => {
            const uniqueRoles = [...new Set(membership.roles.map((role) => role.roleId))].sort();
            const where = {
                externalIdentityId_guildId: {
                    externalIdentityId: membership.externalIdentityId,
                    guildId: membership.guildId,
                },
            };
            const existing = await transaction.discordGuildMembership.findUnique({ where });
            if (existing)
                await transaction.discordGuildMembershipRole.deleteMany({
                    where: { membershipId: existing.id },
                });
            const row = await transaction.discordGuildMembership.upsert({
                where,
                create: {
                    id: membership.id,
                    externalIdentityId: membership.externalIdentityId,
                    guildId: membership.guildId,
                    status: membershipStatus(membership.status),
                    source: membershipSource(membership.source),
                    verifiedAt: membership.verifiedAt ?? null,
                    validUntil: membership.validUntil ?? null,
                    departedAt: membership.departedAt ?? null,
                    createdAt: membership.createdAt,
                    updatedAt: membership.updatedAt,
                },
                update: {
                    status: membershipStatus(membership.status),
                    source: membershipSource(membership.source),
                    verifiedAt: membership.verifiedAt ?? null,
                    validUntil: membership.validUntil ?? null,
                    departedAt: membership.departedAt ?? null,
                    updatedAt: membership.updatedAt,
                },
            });
            if (membership.status === "PRESENT" && uniqueRoles.length > 0)
                await transaction.discordGuildMembershipRole.createMany({
                    data: uniqueRoles.map((roleId) => ({
                        membershipId: row.id,
                        roleId,
                        createdAt: membership.updatedAt,
                    })),
                });
            return mapDiscordGuildMembership(await transaction.discordGuildMembership.findUniqueOrThrow({
                where: { id: row.id },
                include: { roles: { orderBy: { roleId: "asc" } } },
            }));
        }));
    }
}
/** Prisma-backed append-only authentication security audit repository. */
export class PrismaAuthenticationAuditRepository {
    database;
    /** Binds audit operations to an existing Prisma client or transaction. */
    constructor(database) {
        this.database = database;
    }
    /** Appends one validated event; no update or delete operation is exposed. */
    async append(event) {
        validateAuthenticationAuditEvent(event);
        return guarded("authentication-audit.append", async () => mapAuthenticationAuditEvent(await this.database.authenticationAuditEvent.create({
            data: authenticationAuditData(event),
        })));
    }
    /** Lists immutable events for one canonical correlation identifier. */
    async findByCorrelationId(correlationId) {
        return guarded("authentication-audit.find-correlation", async () => (await this.database.authenticationAuditEvent.findMany({
            where: { correlationId },
            orderBy: [{ occurredAt: "asc" }, { id: "asc" }],
        })).map(mapAuthenticationAuditEvent));
    }
    /** Finds one immutable event by internal UUID. */
    async findById(id) {
        return guarded("authentication-audit.find-id", async () => {
            const row = await this.database.authenticationAuditEvent.findUnique({
                where: { id },
            });
            return row ? mapAuthenticationAuditEvent(row) : undefined;
        });
    }
}
async function createBrowserSession(database, session) {
    return database.browserSession.create({
        data: {
            id: session.id,
            platformUserId: session.platformUserId,
            loginIdentityId: session.loginIdentityId,
            tokenDigest: session.tokenDigest,
            tokenKeyVersion: session.tokenKeyVersion,
            csrfDigest: session.csrfDigest,
            csrfKeyVersion: session.csrfKeyVersion,
            authenticationRevisionAtIssue: session.authenticationRevisionAtIssue,
            authenticatedAt: session.authenticatedAt,
            lastSeenAt: session.lastSeenAt,
            idleExpiresAt: session.idleExpiresAt,
            absoluteExpiresAt: session.absoluteExpiresAt,
            status: browserSessionStatus(session.status),
            revokedAt: session.revokedAt ?? null,
            revocationReason: session.revocationReason
                ? browserSessionRevocationReason(session.revocationReason)
                : null,
            rotatedFromSessionId: session.rotatedFromSessionId ?? null,
            ipHmac: session.ipHmac ?? null,
            userAgentHmac: session.userAgentHmac ?? null,
            deviceHmac: session.deviceHmac ?? null,
            metadataKeyVersion: session.metadataKeyVersion ?? null,
            deviceLabel: session.deviceLabel ?? null,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
        },
    });
}
function oauthTransactionData(transaction) {
    const pkce = transaction.encryptedPkceVerifier;
    return {
        id: transaction.id,
        provider: authenticationProvider(transaction.provider),
        purpose: oauthTransactionPurpose(transaction.purpose),
        state: oauthTransactionState(transaction.state),
        stateDigest: transaction.stateDigest,
        browserBindingDigest: transaction.browserBindingDigest,
        platformUserId: transaction.platformUserId ?? null,
        initiatingSessionId: transaction.initiatingSessionId ?? null,
        redirectKey: transaction.redirectKey,
        returnTargetKey: transaction.returnTargetKey,
        pkceMode: oauthPkceMode(transaction.pkceMode),
        pkceCiphertext: pkce ? bytes(pkce.ciphertext) : null,
        pkceNonce: pkce ? bytes(pkce.nonce) : null,
        pkceAuthenticationTag: pkce ? bytes(pkce.authenticationTag) : null,
        pkceKeyVersion: pkce?.keyVersion ?? null,
        expiresAt: transaction.expiresAt,
        claimedAt: transaction.claimedAt ?? null,
        claimExpiresAt: transaction.claimExpiresAt ?? null,
        completedAt: transaction.completedAt ?? null,
        failedAt: transaction.failedAt ?? null,
        cancelledAt: transaction.cancelledAt ?? null,
        expiredAt: transaction.expiredAt ?? null,
        failureReason: transaction.failureReason
            ? oauthTransactionFailureReason(transaction.failureReason)
            : null,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
    };
}
function oauthTransactionTransitionData(transaction) {
    return {
        state: oauthTransactionState(transaction.state),
        claimedAt: transaction.claimedAt ?? null,
        claimExpiresAt: transaction.claimExpiresAt ?? null,
        completedAt: transaction.completedAt ?? null,
        failedAt: transaction.failedAt ?? null,
        cancelledAt: transaction.cancelledAt ?? null,
        expiredAt: transaction.expiredAt ?? null,
        failureReason: transaction.failureReason
            ? oauthTransactionFailureReason(transaction.failureReason)
            : null,
        updatedAt: transaction.updatedAt,
    };
}
function oauthCredentialData(credential) {
    return {
        id: credential.id,
        externalIdentityId: credential.externalIdentityId,
        provider: authenticationProvider(credential.provider),
        accessTokenCiphertext: bytes(credential.encryptedAccessToken.ciphertext),
        accessTokenNonce: bytes(credential.encryptedAccessToken.nonce),
        accessTokenAuthenticationTag: bytes(credential.encryptedAccessToken.authenticationTag),
        accessTokenKeyVersion: credential.encryptedAccessToken.keyVersion,
        refreshTokenCiphertext: bytes(credential.encryptedRefreshToken.ciphertext),
        refreshTokenNonce: bytes(credential.encryptedRefreshToken.nonce),
        refreshTokenAuthenticationTag: bytes(credential.encryptedRefreshToken.authenticationTag),
        refreshTokenKeyVersion: credential.encryptedRefreshToken.keyVersion,
        scopes: [...credential.scopes],
        providerExpiresAt: credential.providerExpiresAt,
        refreshVersion: credential.refreshVersion,
        revokedAt: credential.revokedAt ?? null,
        revocationReason: credential.revocationReason
            ? oauthCredentialRevocationReason(credential.revocationReason)
            : null,
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt,
    };
}
function authenticationAuditData(event) {
    const actorType = event.actor
        ? event.actor.type === "platform-user"
            ? AuthenticationAuditActorType.PLATFORM_USER
            : AuthenticationAuditActorType.SERVICE
        : null;
    return {
        id: event.id,
        action: authenticationAuditAction(event.action),
        outcome: authenticationAuditOutcome(event.outcome),
        reasonCode: authenticationAuditReason(event.reasonCode),
        requestId: event.requestId ?? null,
        correlationId: event.correlationId,
        actorType,
        actorPlatformUserId: event.actor?.type === "platform-user" ? event.actor.id : null,
        actorServiceIdentityId: event.actor?.type === "service" ? event.actor.id : null,
        targetPlatformUserId: event.target.platformUserId ?? null,
        targetExternalIdentityId: event.target.externalIdentityId ?? null,
        targetBrowserSessionId: event.target.browserSessionId ?? null,
        targetOAuthTransactionId: event.target.oauthTransactionId ?? null,
        targetOAuthCredentialId: event.target.oauthCredentialId ?? null,
        targetGuildMembershipId: event.target.guildMembershipId ?? null,
        provider: event.provider ? authenticationProvider(event.provider) : null,
        purpose: event.purpose ? oauthTransactionPurpose(event.purpose) : null,
        metadata: auditMetadataJson(event.metadata),
        ipHmac: event.ipHmac ?? null,
        userAgentHmac: event.userAgentHmac ?? null,
        deviceHmac: event.deviceHmac ?? null,
        metadataKeyVersion: event.metadataKeyVersion ?? null,
        occurredAt: event.occurredAt,
        createdAt: event.createdAt,
    };
}
function mapPlatformUser(row) {
    return safelyMap("platform-user.map", () => validatePlatformUser({
        id: platformUserId(row.id),
        status: domainPlatformUserStatus(row.status),
        authenticationRevision: row.authenticationRevision,
        statusReasonCode: domainPlatformUserStatusReason(row.statusReasonCode),
        ...(row.suspendedAt ? { suspendedAt: row.suspendedAt } : {}),
        ...(row.disabledAt ? { disabledAt: row.disabledAt } : {}),
        ...(row.deletedAt ? { deletedAt: row.deletedAt } : {}),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }));
}
function mapExternalIdentity(row) {
    return safelyMap("external-identity.map", () => validateExternalIdentity({
        id: externalIdentityId(row.id),
        platformUserId: platformUserId(row.platformUserId),
        provider: domainAuthenticationProvider(row.provider),
        providerSubjectId: discordUserId(row.providerSubjectId),
        profile: Object.freeze({
            ...(row.username ? { username: row.username } : {}),
            ...(row.globalName ? { globalName: row.globalName } : {}),
            ...(row.avatar ? { avatar: row.avatar } : {}),
        }),
        enabled: row.enabled,
        linkedAt: row.linkedAt,
        verifiedAt: row.verifiedAt,
        ...(row.lastProviderRefreshAt
            ? { lastProviderRefreshAt: row.lastProviderRefreshAt }
            : {}),
        ...(row.unlinkedAt ? { unlinkedAt: row.unlinkedAt } : {}),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }));
}
function mapBrowserSession(row) {
    return safelyMap("browser-session.map", () => validateBrowserSession({
        id: browserSessionId(row.id),
        platformUserId: platformUserId(row.platformUserId),
        loginIdentityId: externalIdentityId(row.loginIdentityId),
        tokenDigest: authenticationDigest(row.tokenDigest),
        tokenKeyVersion: row.tokenKeyVersion,
        csrfDigest: authenticationDigest(row.csrfDigest),
        csrfKeyVersion: row.csrfKeyVersion,
        authenticationRevisionAtIssue: row.authenticationRevisionAtIssue,
        authenticatedAt: row.authenticatedAt,
        lastSeenAt: row.lastSeenAt,
        idleExpiresAt: row.idleExpiresAt,
        absoluteExpiresAt: row.absoluteExpiresAt,
        status: domainBrowserSessionStatus(row.status),
        ...(row.revokedAt ? { revokedAt: row.revokedAt } : {}),
        ...(row.revocationReason
            ? { revocationReason: domainBrowserSessionRevocationReason(row.revocationReason) }
            : {}),
        ...(row.rotatedFromSessionId
            ? { rotatedFromSessionId: browserSessionId(row.rotatedFromSessionId) }
            : {}),
        ...(row.ipHmac ? { ipHmac: authenticationDigest(row.ipHmac) } : {}),
        ...(row.userAgentHmac
            ? { userAgentHmac: authenticationDigest(row.userAgentHmac) }
            : {}),
        ...(row.deviceHmac ? { deviceHmac: authenticationDigest(row.deviceHmac) } : {}),
        ...(row.metadataKeyVersion
            ? { metadataKeyVersion: row.metadataKeyVersion }
            : {}),
        ...(row.deviceLabel ? { deviceLabel: row.deviceLabel } : {}),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }));
}
function mapOAuthTransaction(row) {
    return safelyMap("oauth-transaction.map", () => validateOAuthTransaction({
        id: oauthTransactionId(row.id),
        provider: domainAuthenticationProvider(row.provider),
        purpose: domainOAuthTransactionPurpose(row.purpose),
        state: domainOAuthTransactionState(row.state),
        stateDigest: authenticationDigest(row.stateDigest),
        browserBindingDigest: authenticationDigest(row.browserBindingDigest),
        ...(row.platformUserId
            ? { platformUserId: platformUserId(row.platformUserId) }
            : {}),
        ...(row.initiatingSessionId
            ? { initiatingSessionId: browserSessionId(row.initiatingSessionId) }
            : {}),
        redirectKey: row.redirectKey,
        returnTargetKey: row.returnTargetKey,
        ...(row.pkceCiphertext && row.pkceNonce && row.pkceAuthenticationTag && row.pkceKeyVersion
            ? {
                encryptedPkceVerifier: {
                    ciphertext: uint8(row.pkceCiphertext),
                    nonce: uint8(row.pkceNonce),
                    authenticationTag: uint8(row.pkceAuthenticationTag),
                    keyVersion: row.pkceKeyVersion,
                },
            }
            : {}),
        pkceMode: domainOAuthPkceMode(row.pkceMode),
        expiresAt: row.expiresAt,
        ...(row.claimedAt ? { claimedAt: row.claimedAt } : {}),
        ...(row.claimExpiresAt ? { claimExpiresAt: row.claimExpiresAt } : {}),
        ...(row.completedAt ? { completedAt: row.completedAt } : {}),
        ...(row.failedAt ? { failedAt: row.failedAt } : {}),
        ...(row.cancelledAt ? { cancelledAt: row.cancelledAt } : {}),
        ...(row.expiredAt ? { expiredAt: row.expiredAt } : {}),
        ...(row.failureReason
            ? { failureReason: domainOAuthTransactionFailureReason(row.failureReason) }
            : {}),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }));
}
function mapOAuthCredential(row) {
    return safelyMap("oauth-credential.map", () => validateOAuthCredential({
        id: oauthCredentialId(row.id),
        externalIdentityId: externalIdentityId(row.externalIdentityId),
        provider: domainAuthenticationProvider(row.provider),
        encryptedAccessToken: {
            ciphertext: uint8(row.accessTokenCiphertext),
            nonce: uint8(row.accessTokenNonce),
            authenticationTag: uint8(row.accessTokenAuthenticationTag),
            keyVersion: row.accessTokenKeyVersion,
        },
        encryptedRefreshToken: {
            ciphertext: uint8(row.refreshTokenCiphertext),
            nonce: uint8(row.refreshTokenNonce),
            authenticationTag: uint8(row.refreshTokenAuthenticationTag),
            keyVersion: row.refreshTokenKeyVersion,
        },
        scopes: Object.freeze([...row.scopes]),
        providerExpiresAt: row.providerExpiresAt,
        refreshVersion: row.refreshVersion,
        ...(row.revokedAt ? { revokedAt: row.revokedAt } : {}),
        ...(row.revocationReason
            ? { revocationReason: domainOAuthCredentialRevocationReason(row.revocationReason) }
            : {}),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }));
}
function mapDiscordGuildMembership(row) {
    return safelyMap("guild-membership.map", () => validateDiscordGuildMembership({
        id: discordGuildMembershipId(row.id),
        externalIdentityId: externalIdentityId(row.externalIdentityId),
        guildId: guildId(row.guildId),
        status: domainMembershipStatus(row.status),
        source: domainMembershipSource(row.source),
        ...(row.verifiedAt ? { verifiedAt: row.verifiedAt } : {}),
        ...(row.validUntil ? { validUntil: row.validUntil } : {}),
        ...(row.departedAt ? { departedAt: row.departedAt } : {}),
        roles: Object.freeze(row.roles.map((role) => Object.freeze({
            membershipId: discordGuildMembershipId(role.membershipId),
            roleId: discordRoleId(role.roleId),
            createdAt: role.createdAt,
        }))),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }));
}
function mapAuthenticationAuditEvent(row) {
    return safelyMap("authentication-audit.map", () => {
        const actor = row.actorType === AuthenticationAuditActorType.PLATFORM_USER &&
            row.actorPlatformUserId
            ? ({
                type: "platform-user",
                id: platformUserId(row.actorPlatformUserId),
            })
            : row.actorType === AuthenticationAuditActorType.SERVICE &&
                row.actorServiceIdentityId
                ? ({
                    type: "service",
                    id: serviceIdentityId(row.actorServiceIdentityId),
                })
                : undefined;
        return validateAuthenticationAuditEvent({
            id: authenticationAuditEventId(row.id),
            action: domainAuthenticationAuditAction(row.action),
            outcome: domainAuthenticationAuditOutcome(row.outcome),
            reasonCode: domainAuthenticationAuditReason(row.reasonCode),
            ...(row.requestId ? { requestId: authenticationRequestId(row.requestId) } : {}),
            correlationId: authenticationCorrelationId(row.correlationId),
            ...(actor ? { actor } : {}),
            target: Object.freeze({
                ...(row.targetPlatformUserId
                    ? { platformUserId: platformUserId(row.targetPlatformUserId) }
                    : {}),
                ...(row.targetExternalIdentityId
                    ? { externalIdentityId: externalIdentityId(row.targetExternalIdentityId) }
                    : {}),
                ...(row.targetBrowserSessionId
                    ? { browserSessionId: browserSessionId(row.targetBrowserSessionId) }
                    : {}),
                ...(row.targetOAuthTransactionId
                    ? { oauthTransactionId: oauthTransactionId(row.targetOAuthTransactionId) }
                    : {}),
                ...(row.targetOAuthCredentialId
                    ? { oauthCredentialId: oauthCredentialId(row.targetOAuthCredentialId) }
                    : {}),
                ...(row.targetGuildMembershipId
                    ? {
                        guildMembershipId: discordGuildMembershipId(row.targetGuildMembershipId),
                    }
                    : {}),
            }),
            ...(row.provider ? { provider: domainAuthenticationProvider(row.provider) } : {}),
            ...(row.purpose ? { purpose: domainOAuthTransactionPurpose(row.purpose) } : {}),
            metadata: auditMetadata(row.metadata),
            ...(row.ipHmac ? { ipHmac: authenticationDigest(row.ipHmac) } : {}),
            ...(row.userAgentHmac
                ? { userAgentHmac: authenticationDigest(row.userAgentHmac) }
                : {}),
            ...(row.deviceHmac ? { deviceHmac: authenticationDigest(row.deviceHmac) } : {}),
            ...(row.metadataKeyVersion
                ? { metadataKeyVersion: row.metadataKeyVersion }
                : {}),
            occurredAt: row.occurredAt,
            createdAt: row.createdAt,
        });
    });
}
function platformUserStatus(status) {
    return PrismaPlatformUserStatus[status];
}
function domainPlatformUserStatus(status) {
    return status;
}
function platformUserStatusReason(reason) {
    return PrismaPlatformUserStatusReasonCode[reason];
}
function domainPlatformUserStatusReason(reason) {
    return reason;
}
function authenticationProvider(provider) {
    return AuthenticationProvider.DISCORD;
}
function domainAuthenticationProvider(provider) {
    if (provider !== AuthenticationProvider.DISCORD)
        throw failure("invalid-persisted-state", "authentication-provider.map");
    return "DISCORD";
}
function browserSessionStatus(status) {
    return BrowserSessionStatus[status];
}
function domainBrowserSessionStatus(status) {
    return status;
}
function browserSessionRevocationReason(reason) {
    return PrismaBrowserSessionRevocationReason[reason];
}
function domainBrowserSessionRevocationReason(reason) {
    return reason;
}
function oauthTransactionState(state) {
    return OAuthTransactionState[state];
}
function domainOAuthTransactionState(state) {
    return state;
}
function oauthTransactionPurpose(purpose) {
    return OAuthTransactionPurpose[purpose];
}
function domainOAuthTransactionPurpose(purpose) {
    return purpose;
}
function oauthTransactionFailureReason(reason) {
    return OAuthTransactionFailureReason[reason];
}
function domainOAuthTransactionFailureReason(reason) {
    return reason;
}
function oauthPkceMode(mode) {
    return PrismaOAuthPkceMode[mode];
}
function domainOAuthPkceMode(mode) {
    return mode;
}
function oauthCredentialRevocationReason(reason) {
    return PrismaOAuthCredentialRevocationReason[reason];
}
function domainOAuthCredentialRevocationReason(reason) {
    return reason;
}
function membershipStatus(status) {
    return DiscordGuildMembershipStatus[status];
}
function domainMembershipStatus(status) {
    return status;
}
function membershipSource(source) {
    return DiscordGuildMembershipSource[source];
}
function domainMembershipSource(source) {
    return source;
}
function authenticationAuditAction(action) {
    return AuthenticationAuditAction[action];
}
function domainAuthenticationAuditAction(action) {
    return action;
}
function authenticationAuditOutcome(outcome) {
    return AuthenticationAuditOutcome[outcome];
}
function domainAuthenticationAuditOutcome(outcome) {
    return outcome;
}
function authenticationAuditReason(reason) {
    return AuthenticationAuditReasonCode[reason];
}
function domainAuthenticationAuditReason(reason) {
    return reason;
}
function terminalOAuthState(state) {
    return (state === OAuthTransactionState.COMPLETED ||
        state === OAuthTransactionState.FAILED ||
        state === OAuthTransactionState.CANCELLED ||
        state === OAuthTransactionState.EXPIRED);
}
function bytes(value) {
    const copy = new Uint8Array(new ArrayBuffer(value.byteLength));
    copy.set(value);
    return copy;
}
function uint8(value) {
    return new Uint8Array(value);
}
function auditMetadataJson(metadata) {
    for (const value of Object.values(metadata)) {
        if (value !== null &&
            typeof value !== "string" &&
            typeof value !== "number" &&
            typeof value !== "boolean")
            throw failure("invalid-persisted-state", "authentication-audit.metadata");
    }
    return { ...metadata };
}
function auditMetadata(value) {
    if (!value || Array.isArray(value) || typeof value !== "object")
        throw failure("invalid-persisted-state", "authentication-audit.map");
    const result = {};
    for (const [key, item] of Object.entries(value)) {
        if (item !== null &&
            typeof item !== "string" &&
            typeof item !== "number" &&
            typeof item !== "boolean")
            throw failure("invalid-persisted-state", "authentication-audit.map");
        result[key] = item;
    }
    return Object.freeze(result);
}
async function atomic(database, operation) {
    if ("$transaction" in database)
        return database.$transaction((transaction) => operation(transaction));
    return operation(database);
}
async function guarded(operation, work, uniqueCode = "conflict") {
    try {
        return await work();
    }
    catch (error) {
        if (error instanceof AuthenticationInfrastructureError)
            throw error;
        if (isUnique(error))
            throw failure(uniqueCode, operation);
        throw translate(error, operation);
    }
}
function safelyMap(operation, mapper) {
    try {
        return mapper();
    }
    catch (error) {
        if (error instanceof AuthenticationInfrastructureError)
            throw error;
        throw failure("invalid-persisted-state", operation);
    }
}
function translate(error, operation) {
    if (error instanceof AuthenticationInfrastructureError)
        return error;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025")
            return failure("not-found", operation);
        if (error.code === "P2002")
            return failure("conflict", operation);
        if (error.code === "P1001" || error.code === "P1008" || error.code === "P2024")
            return failure("dependency-unavailable", operation, true);
    }
    if (error instanceof Prisma.PrismaClientInitializationError)
        return failure("dependency-unavailable", operation, true);
    return failure("dependency-unavailable", operation, true);
}
function isUnique(error) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
function failure(code, operation, retryable = false) {
    return new AuthenticationInfrastructureError({ code, operation, retryable });
}
function validateTimeout(value) {
    if (!Number.isSafeInteger(value) || value < 100 || value > 300_000)
        throw new RangeError("Authentication transaction timeout is outside reviewed bounds.");
}
function validateLimit(value, maximum) {
    if (!Number.isSafeInteger(value) || value < 1 || value > maximum)
        throw new RangeError(`Authentication query limit must be between 1 and ${maximum}.`);
}
//# sourceMappingURL=PrismaAuthenticationRepositories.js.map