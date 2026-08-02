import { createHash, randomUUID } from "node:crypto";

import {
  authenticationAuditEventId,
  authenticationCorrelationId,
  authenticationDigest,
  browserSessionId,
  claimOAuthTransaction,
  completeOAuthTransaction,
  discordGuildMembershipId,
  discordRoleId,
  discordUserId,
  externalIdentityId,
  guildId,
  oauthCredentialId,
  oauthTransactionId,
  opaqueAuthenticationSecret,
  platformUserId,
  discordGuildId,
  BrowserSessionService,
  DiscordGuildMembershipService,
  MetadataHashingService,
  OAuthCredentialService,
  OAuthTransactionService,
  type AuthenticationAuditEvent,
  type BrowserSession,
  type ExternalIdentity,
  type OAuthCredential,
  type OAuthTransaction,
  type PlatformUser,
  type DiscordOAuthProvider,
  type DiscordGuildMembershipVerifier,
} from "@qbox/authentication";
import {
  PermissionAssignmentEffect,
  PermissionPrincipalType,
  PermissionScopeType,
  PrismaClientFactory,
} from "@qbox/prisma";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  DatabaseConfiguration,
  AuthenticationKeyRing,
  NodeAuthenticationIdGenerator,
  PrismaAuthenticationPersistence,
  PrismaOwnerAccessProtectionService,
} from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl)
  throw new Error("DATABASE_URL is required for authentication integration tests.");
const databaseName = new URL(databaseUrl).pathname.slice(1);
if (!databaseName.toLowerCase().includes("test"))
  throw new Error(`Refusing authentication cleanup for non-test database '${databaseName}'.`);

const configuration = DatabaseConfiguration.from({ databaseUrl, environment: "test" });
const client = new PrismaClientFactory().create(configuration);
const persistence = new PrismaAuthenticationPersistence(client);
const repositories = persistence.repositories;
const now = new Date();

beforeAll(async () => client.$connect());
beforeEach(async () => {
  await client.$executeRawUnsafe(
    'TRUNCATE TABLE "authentication_audit_events", "discord_guild_membership_roles", "discord_guild_memberships", "oauth_credentials", "oauth_transactions", "browser_sessions", "external_identities", "platform_users", "permission_audit_events", "permission_assignments", "permission_principals", "permission_definitions", "permission_catalog_state", "guilds" CASCADE',
  );
});
afterAll(async () => {
  await client.$executeRawUnsafe(
    'TRUNCATE TABLE "authentication_audit_events", "discord_guild_membership_roles", "discord_guild_memberships", "oauth_credentials", "oauth_transactions", "browser_sessions", "external_identities", "platform_users", "permission_audit_events", "permission_assignments", "permission_principals", "permission_definitions", "permission_catalog_state", "guilds" CASCADE',
  );
  await client.$disconnect();
});

describe("Prisma authentication repositories", () => {
  it("creates, finds, status-updates, and revision-invalidates platform users with CAS", async () => {
    const user = makeUser();
    await expect(repositories.platformUsers.create(user)).resolves.toEqual(user);
    await expect(repositories.platformUsers.findById(user.id)).resolves.toEqual(user);
    const disabled = await repositories.platformUsers.updateStatus(
      user.id,
      1,
      "DISABLED",
      "SECURITY_RESPONSE",
      new Date(now.getTime() + 1_000),
    );
    expect(disabled).toMatchObject({ status: "DISABLED", authenticationRevision: 2 });
    await expect(
      repositories.platformUsers.updateStatus(
        user.id,
        1,
        "ACTIVE",
        "RECOVERY",
        new Date(now.getTime() + 2_000),
      ),
    ).rejects.toMatchObject({ code: "stale-revision" });
  });

  it("retains immutable provider identity ownership and translates concurrent conflicts", async () => {
    const firstUser = await repositories.platformUsers.create(makeUser());
    const secondUser = await repositories.platformUsers.create(makeUser());
    const subject = discordUserId("804859666655739996");
    const left = makeIdentity(firstUser.id, subject);
    const right = makeIdentity(secondUser.id, subject);
    const outcomes = await Promise.allSettled([
      repositories.externalIdentities.create(left),
      repositories.externalIdentities.create(right),
    ]);
    expect(outcomes.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = outcomes.find((result) => result.status === "rejected");
    expect(rejected).toMatchObject({
      reason: { code: "duplicate-provider-identity" },
    });
    const owner = await repositories.externalIdentities.findByProviderSubject(
      "DISCORD",
      subject,
    );
    expect(owner?.providerSubjectId).toBe(subject);
    const unlinked = await repositories.externalIdentities.unlink(owner!.id, now);
    expect(unlinked).toMatchObject({ enabled: false, unlinkedAt: now });
    await expect(
      repositories.externalIdentities.unlink(owner!.id, new Date(now.getTime() + 1_000)),
    ).resolves.toEqual(unlinked);
  });

  it("creates, touches, lists, expires, revokes, and finds digest-only sessions", async () => {
    const { user, identity } = await createAccount();
    const session = makeSession(user, identity);
    await repositories.browserSessions.create(session);
    await expect(repositories.browserSessions.findByTokenDigest(session.tokenDigest)).resolves.toEqual(session);
    const touchedAt = new Date(now.getTime() + 60_000);
    const touched = await repositories.browserSessions.touch(
      session.id,
      session.lastSeenAt,
      touchedAt,
      new Date(touchedAt.getTime() + 60 * 60_000),
    );
    expect(touched?.lastSeenAt).toEqual(touchedAt);
    await expect(repositories.browserSessions.findActiveForPlatformUser(user.id, now)).resolves.toHaveLength(1);
    await expect(
      repositories.browserSessions.findExpired(
        new Date(session.absoluteExpiresAt.getTime() + 1),
        10,
      ),
    ).resolves.toHaveLength(1);
    const revoked = await repositories.browserSessions.revoke(session.id, "LOGOUT", touchedAt);
    expect(revoked?.status).toBe("REVOKED");
    await expect(repositories.browserSessions.revoke(session.id, "LOGOUT", touchedAt)).resolves.toEqual(revoked);
  });

  it("serializes concurrent session rotation so one source has one successor", async () => {
    const { user, identity } = await createAccount();
    const source = await repositories.browserSessions.create(makeSession(user, identity));
    const outcomes = await Promise.allSettled([
      repositories.browserSessions.rotate(source.id, makeSession(user, identity, source.id)),
      repositories.browserSessions.rotate(source.id, makeSession(user, identity, source.id)),
    ]);
    expect(outcomes.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(await client.browserSession.count({ where: { rotatedFromSessionId: source.id } })).toBe(1);
  });

  it("atomically claims OAuth transactions, reclaims stale leases, and rejects replay", async () => {
    const pending = await repositories.oauthTransactions.create(makeTransaction());
    const leaseEnd = new Date(now.getTime() + 60_000);
    const claims = await Promise.allSettled([
      repositories.oauthTransactions.claim(pending.id, now, leaseEnd),
      repositories.oauthTransactions.claim(pending.id, now, leaseEnd),
    ]);
    expect(claims.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(claims.find((result) => result.status === "rejected")).toMatchObject({
      reason: { code: "oauth-transaction-claimed" },
    });
    const staleClaimed = await repositories.oauthTransactions.create(
      makeTransaction({
        state: "CLAIMED",
        createdAt: new Date(now.getTime() - 120_000),
        claimedAt: new Date(now.getTime() - 120_000),
        claimExpiresAt: new Date(now.getTime() - 60_000),
        expiresAt: new Date(now.getTime() + 10 * 60_000),
        updatedAt: new Date(now.getTime() - 120_000),
      }),
    );
    const reclaimAt = now;
    const reclaimed = await repositories.oauthTransactions.claim(
      staleClaimed.id,
      reclaimAt,
      new Date(reclaimAt.getTime() + 60_000),
    );
    const completed = completeOAuthTransaction(reclaimed, new Date(reclaimAt.getTime() + 1));
    await repositories.oauthTransactions.transition(completed, "CLAIMED");
    await expect(
      repositories.oauthTransactions.claim(
        staleClaimed.id,
        new Date(reclaimAt.getTime() + 2),
        new Date(reclaimAt.getTime() + 60_002),
      ),
    ).rejects.toMatchObject({ code: "oauth-transaction-terminal" });
  });

  it("enforces transaction-specific PKCE mode metadata in PostgreSQL", async () => {
    await expect(
      client.$executeRawUnsafe(
        `INSERT INTO "oauth_transactions" (
          "id", "provider", "purpose", "state", "state_digest", "browser_binding_digest",
          "redirect_key", "return_target_key", "pkce_mode", "expires_at", "created_at", "updated_at"
        ) VALUES (
          $1::uuid, 'discord', 'login', 'pending', $2, $3,
          'web-login', 'dashboard', 's256-verified', now() + interval '10 minutes', now(), now()
        )`,
        randomUUID(),
        digest("pkce-state"),
        digest("pkce-binding"),
      ),
    ).rejects.toBeDefined();
  });

  it("optimistically replaces encrypted credentials with one concurrent winner", async () => {
    const { identity } = await createAccount();
    const credential = await repositories.oauthCredentials.create(makeCredential(identity));
    const replacement = makeCredential(identity, {
      id: credential.id,
      refreshVersion: 2,
      updatedAt: new Date(now.getTime() + 1_000),
    });
    const updates = await Promise.allSettled([
      repositories.oauthCredentials.updateEncryptedCredential(credential.id, 1, replacement),
      repositories.oauthCredentials.updateEncryptedCredential(credential.id, 1, replacement),
    ]);
    expect(updates.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(updates.find((result) => result.status === "rejected")).toMatchObject({
      reason: { code: "credential-refresh-conflict" },
    });
    await expect(
      repositories.oauthCredentials.revoke(credential.id, "SECURITY_RESPONSE", now),
    ).resolves.toMatchObject({ revocationReason: "SECURITY_RESPONSE" });
  });

  it("atomically replaces guild membership state and normalized roles", async () => {
    const { identity } = await createAccount();
    const guild = await client.guild.create({
      data: { discordGuildId: "1257928923048837201" },
    });
    await expect(
      repositories.guildMemberships.replaceVerifiedSnapshot(
        makeMembership(identity, guild.id, [
          "1262656532902842423",
          "1262656532902842423",
        ]),
      ),
    ).rejects.toMatchObject({ code: "invalid-membership" });
    const membership = makeMembership(identity, guild.id, [
      "1262656532902842423",
      "1262656532902842424",
    ]);
    const present = await repositories.guildMemberships.replaceVerifiedSnapshot(membership);
    expect(present.roles.map((role) => role.roleId)).toEqual([
      "1262656532902842423",
      "1262656532902842424",
    ]);
    const { validUntil: _validUntil, ...presentWithoutValidity } = present;
    void _validUntil;
    const absent = await repositories.guildMemberships.replaceVerifiedSnapshot({
      ...presentWithoutValidity,
      status: "ABSENT",
      departedAt: new Date(now.getTime() + 2_000),
      roles: [],
      updatedAt: new Date(now.getTime() + 2_000),
    });
    expect(absent.roles).toEqual([]);
  });

  it("keeps authentication audit append-only and queryable by ID and correlation", async () => {
    const event = makeAudit();
    await repositories.audit.append(event);
    await expect(repositories.audit.findById(event.id)).resolves.toEqual(event);
    await expect(repositories.audit.findByCorrelationId(event.correlationId)).resolves.toEqual([event]);
    await expect(
      client.$executeRawUnsafe(
        'UPDATE "authentication_audit_events" SET "outcome" = \'failure\' WHERE "id" = $1::uuid',
        event.id,
      ),
    ).rejects.toThrow();
    await expect(
      client.$executeRawUnsafe(
        'DELETE FROM "authentication_audit_events" WHERE "id" = $1::uuid',
        event.id,
      ),
    ).rejects.toThrow();
  });

  it("binds all unit-of-work repositories to one rollback boundary", async () => {
    const user = makeUser();
    await expect(
      persistence.unitOfWork.run(async (transaction) => {
        await transaction.platformUsers.create(user);
        await transaction.externalIdentities.create(makeIdentity(user.id));
        expect(await transaction.externalIdentities.findByPlatformUser(user.id, "DISCORD")).toBeDefined();
        throw new Error("force-rollback");
      }),
    ).rejects.toMatchObject({ code: "dependency-unavailable" });
    expect(await client.platformUser.count({ where: { id: user.id } })).toBe(0);
    expect(await client.externalIdentity.count()).toBe(0);
  });

  it("persists records across a separately constructed client lifecycle", async () => {
    const { user } = await createAccount();
    const restarted = new PrismaClientFactory().create(configuration);
    await restarted.$connect();
    try {
      const secondPersistence = new PrismaAuthenticationPersistence(restarted);
      await expect(secondPersistence.repositories.platformUsers.findById(user.id)).resolves.toEqual(user);
    } finally {
      await restarted.$disconnect();
    }
  });

  it("translates database outage without leaking the connection string", async () => {
    const unavailableConfiguration = DatabaseConfiguration.from({
      databaseUrl: "postgresql://test:test@127.0.0.1:1/qbox_auth_outage_test",
      environment: "test",
      queryTimeoutMs: 100,
    });
    const unavailable = new PrismaClientFactory().create(unavailableConfiguration);
    const adapter = new PrismaAuthenticationPersistence(unavailable, 100);
    const error = await adapter.repositories.platformUsers
      .findById(platformUserId(randomUUID()))
      .catch((failure: unknown) => failure);
    expect(error).toMatchObject({ code: "dependency-unavailable" });
    expect(String(error)).not.toContain("postgresql://");
    await unavailable.$disconnect();
  });

  it("persists a full service session and OAuth lifecycle without plaintext", async () => {
    const keyRing = new AuthenticationKeyRing([
      { purpose: "SESSION_HMAC", version: 1, material: new Uint8Array(32).fill(11), active: true },
      { purpose: "CSRF_HMAC", version: 1, material: new Uint8Array(32).fill(12), active: true },
      { purpose: "METADATA_HMAC", version: 1, material: new Uint8Array(32).fill(13), active: true },
      { purpose: "OAUTH_ENCRYPTION", version: 1, material: new Uint8Array(32).fill(14), active: true },
    ]);
    const crypto = keyRing.createCrypto();
    const ids = new NodeAuthenticationIdGenerator();
    const clock = { now: () => new Date() };
    const firstClient = new PrismaClientFactory().create(configuration);
    await firstClient.$connect();
    const firstPersistence = new PrismaAuthenticationPersistence(firstClient);
    const user = makeUserAt(clock.now());
    const identity = makeIdentityAt(user.id, discordUserId("804859666655739996"), clock.now());
    await firstPersistence.repositories.platformUsers.create(user);
    await firstPersistence.repositories.externalIdentities.create(identity);
    const firstSessions = new BrowserSessionService({
      unitOfWork: firstPersistence.unitOfWork,
      clock,
      crypto,
      keys: keyRing,
      ids,
      metadata: new MetadataHashingService(crypto, keyRing),
    });
    const issued = await firstSessions.createSession({
      platformUserId: user.id,
      loginIdentityId: identity.id,
      context: { correlationId: authenticationCorrelationId(randomUUID()) },
      clientMetadata: { clientIp: "127.0.0.1", userAgent: "integration-agent" },
    });
    await expect(firstSessions.verifySession(issued.sessionSecret)).resolves.toMatchObject({
      actor: { platformUserId: user.id },
    });
    await firstClient.$disconnect();

    const restartedClient = new PrismaClientFactory().create(configuration);
    await restartedClient.$connect();
    try {
      const restartedPersistence = new PrismaAuthenticationPersistence(restartedClient);
      const sessions = new BrowserSessionService({
        unitOfWork: restartedPersistence.unitOfWork,
        clock,
        crypto,
        keys: keyRing,
        ids,
        metadata: new MetadataHashingService(crypto, keyRing),
      });
      await expect(sessions.verifySession(issued.sessionSecret)).resolves.toMatchObject({
        actor: { platformUserId: user.id },
      });
      const rotated = await sessions.rotateSession(issued.sessionSecret, {
        correlationId: authenticationCorrelationId(randomUUID()),
      });
      await expect(sessions.verifySession(issued.sessionSecret)).rejects.toBeDefined();
      await expect(sessions.verifySession(rotated.sessionSecret)).resolves.toBeDefined();

      const oauth = new OAuthTransactionService({
        unitOfWork: restartedPersistence.unitOfWork,
        clock,
        crypto,
        keys: keyRing,
        ids,
      });
      const oauthIssued = await oauth.createTransaction({
        purpose: "LOGIN",
        redirectKey: "web-login",
        returnTargetKey: "dashboard",
        context: { correlationId: authenticationCorrelationId(randomUUID()) },
      });
      await oauth.claimTransaction(
        oauthIssued.state,
        oauthIssued.browserBinding,
        { correlationId: authenticationCorrelationId(randomUUID()) },
      );
      await expect(
        oauth.completeTransaction(oauthIssued.transactionId, {
          correlationId: authenticationCorrelationId(randomUUID()),
        }),
      ).resolves.toMatchObject({ state: "COMPLETED" });
      const provider = new IntegrationProvider();
      const credentials = new OAuthCredentialService({
        unitOfWork: restartedPersistence.unitOfWork,
        clock,
        crypto,
        keys: keyRing,
        ids,
        provider,
      });
      const grant = await credentials.persistInitialGrant({
        externalIdentityId: identity.id,
        tokenResult: integrationToken("access-integration", "refresh-integration"),
        context: { correlationId: authenticationCorrelationId(randomUUID()) },
      });
      expect(JSON.stringify(grant)).not.toContain("access-integration");
      const guild = await restartedClient.guild.create({
        data: { discordGuildId: "1257928923048837201" },
      });
      const verifier = new IntegrationMembershipVerifier();
      const memberships = new DiscordGuildMembershipService({
        unitOfWork: restartedPersistence.unitOfWork,
        clock,
        ids,
        credentials,
        verifier,
      });
      const present = await memberships.verifyCurrentMembership({
        externalIdentityId: identity.id,
        guildId: guildId(guild.id),
        discordGuildId: discordGuildId("1257928923048837201"),
        context: { correlationId: authenticationCorrelationId(randomUUID()) },
        signal: new AbortController().signal,
      });
      expect(present).toMatchObject({ status: "PRESENT" });
      verifier.status = "ABSENT";
      await memberships.verifyCurrentMembership({
        externalIdentityId: identity.id,
        guildId: guildId(guild.id),
        discordGuildId: discordGuildId("1257928923048837201"),
        context: { correlationId: authenticationCorrelationId(randomUUID()) },
        signal: new AbortController().signal,
      });
      await expect(sessions.verifySession(rotated.sessionSecret)).rejects.toBeDefined();
      expect(
        await restartedClient.browserSession.count({
          where: { platformUserId: user.id, revocationReason: "GUILD_DEPARTURE" },
        }),
      ).toBeGreaterThanOrEqual(1);
      await sessions.revokeAllSessions(user.id, {
        correlationId: authenticationCorrelationId(randomUUID()),
      });
      await expect(sessions.verifySession(rotated.sessionSecret)).rejects.toBeDefined();

      const storedSession = await restartedClient.browserSession.findUniqueOrThrow({
        where: { id: rotated.session.id },
      });
      const storedOAuth = await restartedClient.oAuthTransaction.findUniqueOrThrow({
        where: { id: oauthIssued.transactionId },
      });
      const serialized = JSON.stringify({ storedSession, storedOAuth });
      expect(serialized).not.toContain(issued.sessionSecret);
      expect(serialized).not.toContain(issued.csrfSecret);
      expect(serialized).not.toContain(rotated.sessionSecret);
      expect(serialized).not.toContain(rotated.csrfSecret);
      expect(serialized).not.toContain(oauthIssued.state);
      expect(serialized).not.toContain(oauthIssued.browserBinding);
      expect(await restartedClient.authenticationAuditEvent.count()).toBeGreaterThanOrEqual(6);
    } finally {
      await restartedClient.$disconnect();
    }
  });
});

describe("owner access transaction protection", () => {
  it("rejects disabling the last active platform account with an owner path", async () => {
    const owner = await createOwnerPath("804859666655739996");
    const service = new PrismaOwnerAccessProtectionService(client);
    await expect(
      service.protect({
        target: { type: "platform-user", id: owner.user.id },
        correlationId: authenticationCorrelationId(randomUUID()),
        reasonCode: "SECURITY_RESPONSE",
        occurredAt: now,
        successAudit: makeAudit({ target: { platformUserId: owner.user.id } }),
        rejectionAudit: makeAudit({
          outcome: "REJECTED",
          reasonCode: "ACCOUNT_UNAVAILABLE",
          target: { platformUserId: owner.user.id },
        }),
        operation: ({ platformUsers }) =>
          platformUsers.updateStatus(
            owner.user.id,
            owner.user.authenticationRevision,
            "DISABLED",
            "SECURITY_RESPONSE",
            now,
          ),
      }),
    ).rejects.toMatchObject({ code: "owner-access-required" });
    expect((await repositories.platformUsers.findById(owner.user.id))?.status).toBe(
      "ACTIVE",
    );
  });

  it("rejects last identity unlink, permits one of multiple paths, and audits both", async () => {
    const first = await createOwnerPath("804859666655739996");
    const ownerProtection = new PrismaOwnerAccessProtectionService(client);
    await expect(
      ownerProtection.protect({
        target: { type: "external-identity", id: first.identity.id },
        correlationId: authenticationCorrelationId(randomUUID()),
        reasonCode: "ADMINISTRATOR_ACTION",
        occurredAt: now,
        successAudit: makeAudit({ target: { externalIdentityId: first.identity.id } }),
        rejectionAudit: makeAudit({
          outcome: "REJECTED",
          reasonCode: "ACCOUNT_UNAVAILABLE",
          target: { externalIdentityId: first.identity.id },
        }),
        operation: ({ externalIdentities }) => externalIdentities.unlink(first.identity.id, now),
      }),
    ).rejects.toMatchObject({ code: "owner-access-required" });
    expect((await repositories.externalIdentities.findById(first.identity.id))?.enabled).toBe(true);

    await createOwnerPath("804859666655739997", first.permissionDefinitionId, first.guildId);
    await expect(
      ownerProtection.protect({
        target: { type: "external-identity", id: first.identity.id },
        correlationId: authenticationCorrelationId(randomUUID()),
        reasonCode: "ADMINISTRATOR_ACTION",
        occurredAt: now,
        successAudit: makeAudit({ target: { externalIdentityId: first.identity.id } }),
        rejectionAudit: makeAudit({
          outcome: "REJECTED",
          target: { externalIdentityId: first.identity.id },
        }),
        operation: ({ externalIdentities }) => externalIdentities.unlink(first.identity.id, now),
      }),
    ).resolves.toMatchObject({ enabled: false });
    expect(await client.authenticationAuditEvent.count()).toBe(2);
  });

  it("serializes concurrent owner-path removals so at least one remains", async () => {
    const first = await createOwnerPath("804859666655739996");
    const second = await createOwnerPath(
      "804859666655739997",
      first.permissionDefinitionId,
      first.guildId,
    );
    const service = new PrismaOwnerAccessProtectionService(client);
    const remove = (identity: ExternalIdentity) =>
      service.protect({
        target: { type: "external-identity", id: identity.id },
        correlationId: authenticationCorrelationId(randomUUID()),
        reasonCode: "SECURITY_RESPONSE",
        occurredAt: now,
        successAudit: makeAudit({ target: { externalIdentityId: identity.id } }),
        rejectionAudit: makeAudit({ outcome: "REJECTED", target: { externalIdentityId: identity.id } }),
        operation: ({ externalIdentities }) => externalIdentities.unlink(identity.id, now),
      });
    const outcomes = await Promise.allSettled([remove(first.identity), remove(second.identity)]);
    expect(outcomes.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(await client.externalIdentity.count({ where: { enabled: true } })).toBe(1);
  });

  it("does not count revoked, expired, or disabled owner paths as recovery access", async () => {
    const mutationTime = new Date(Date.now() + 120_000);
    const first = await createOwnerPath("804859666655739996");
    const second = await createOwnerPath(
      "804859666655739997",
      first.permissionDefinitionId,
      first.guildId,
    );
    await client.permissionAssignment.update({
      where: { id: second.assignmentId },
      data: { revokedAt: mutationTime, enabled: false },
    });
    await client.externalIdentity.update({
      where: { id: second.identity.id },
      data: { enabled: false, unlinkedAt: mutationTime },
    });
    const service = new PrismaOwnerAccessProtectionService(client);
    await expect(
      service.protect({
        target: { type: "external-identity", id: first.identity.id },
        correlationId: authenticationCorrelationId(randomUUID()),
        reasonCode: "SECURITY_RESPONSE",
        occurredAt: mutationTime,
        successAudit: makeAudit({ target: { externalIdentityId: first.identity.id } }),
        rejectionAudit: makeAudit({
          outcome: "REJECTED",
          target: { externalIdentityId: first.identity.id },
        }),
        operation: ({ externalIdentities }) =>
          externalIdentities.unlink(first.identity.id, mutationTime),
      }),
    ).rejects.toMatchObject({ code: "owner-access-required" });

    await client.permissionAssignment.update({
      where: { id: second.assignmentId },
      data: {
        revokedAt: null,
        enabled: true,
        expiresAt: new Date(mutationTime.getTime() - 30_000),
      },
    });
    await client.externalIdentity.update({
      where: { id: second.identity.id },
      data: { enabled: true, unlinkedAt: null },
    });
    await expect(
      service.protect({
        target: { type: "external-identity", id: first.identity.id },
        correlationId: authenticationCorrelationId(randomUUID()),
        reasonCode: "SECURITY_RESPONSE",
        occurredAt: mutationTime,
        successAudit: makeAudit({ target: { externalIdentityId: first.identity.id } }),
        rejectionAudit: makeAudit({ outcome: "REJECTED" }),
        operation: ({ externalIdentities }) =>
          externalIdentities.unlink(first.identity.id, mutationTime),
      }),
    ).rejects.toMatchObject({ code: "owner-access-required" });
  });

  it("rolls a protected mutation back when its mandatory success audit fails", async () => {
    const first = await createOwnerPath("804859666655739996");
    await createOwnerPath("804859666655739997", first.permissionDefinitionId, first.guildId);
    const duplicateAudit = makeAudit({ target: { externalIdentityId: first.identity.id } });
    await repositories.audit.append(duplicateAudit);
    const service = new PrismaOwnerAccessProtectionService(client);
    await expect(
      service.protect({
        target: { type: "external-identity", id: first.identity.id },
        correlationId: duplicateAudit.correlationId,
        reasonCode: "SECURITY_RESPONSE",
        occurredAt: now,
        successAudit: duplicateAudit,
        rejectionAudit: makeAudit({ outcome: "REJECTED" }),
        operation: ({ externalIdentities }) => externalIdentities.unlink(first.identity.id, now),
      }),
    ).rejects.toBeDefined();
    expect((await repositories.externalIdentities.findById(first.identity.id))?.enabled).toBe(true);
  });
});

class IntegrationProvider implements DiscordOAuthProvider {
  public createAuthorizationUrl(): URL {
    throw new Error("not used");
  }
  public async exchangeCode(): Promise<never> {
    throw new Error("not used");
  }
  public async refreshToken() {
    return integrationToken("access-refreshed", "refresh-refreshed");
  }
  public async inspectAuthorization(): Promise<never> {
    throw new Error("not used");
  }
  public async fetchIdentity(): Promise<never> {
    throw new Error("not used");
  }
  public async revokeCredential() {
    return { providerAccepted: true };
  }
}

class IntegrationMembershipVerifier implements DiscordGuildMembershipVerifier {
  public status: "PRESENT" | "ABSENT" = "PRESENT";
  public async verify() {
    const verifiedAt = new Date();
    return {
      guildId: discordGuildId("1257928923048837201"),
      status: this.status,
      roleIds: this.status === "PRESENT" ? [discordRoleId("1262656532902842423")] : [],
      source: "DISCORD_OAUTH" as const,
      verifiedAt,
      ...(this.status === "PRESENT"
        ? { validUntil: new Date(verifiedAt.getTime() + 5 * 60_000) }
        : {}),
    };
  }
}

async function createAccount() {
  const user = await repositories.platformUsers.create(makeUser());
  const identity = await repositories.externalIdentities.create(makeIdentity(user.id));
  return { user, identity };
}

function makeUser(): PlatformUser {
  return makeUserAt(now);
}

function makeUserAt(createdAt: Date): PlatformUser {
  return {
    id: platformUserId(randomUUID()),
    status: "ACTIVE",
    authenticationRevision: 1,
    statusReasonCode: "ACCOUNT_CREATED",
    createdAt,
    updatedAt: createdAt,
  };
}

function makeIdentity(
  userId: PlatformUser["id"],
  subject = discordUserId(String(800000000000000000n + BigInt(Math.floor(Math.random() * 1_000_000)))),
): ExternalIdentity {
  return makeIdentityAt(userId, subject, now);
}

function makeIdentityAt(
  userId: PlatformUser["id"],
  subject: ReturnType<typeof discordUserId>,
  createdAt: Date,
): ExternalIdentity {
  return {
    id: externalIdentityId(randomUUID()),
    platformUserId: userId,
    provider: "DISCORD",
    providerSubjectId: subject,
    profile: { username: "display-only" },
    enabled: true,
    linkedAt: createdAt,
    verifiedAt: createdAt,
    createdAt,
    updatedAt: createdAt,
  };
}

function digest(label: string) {
  return authenticationDigest(createHash("sha256").update(`${label}:${randomUUID()}`).digest("hex"));
}

function makeSession(
  user: PlatformUser,
  identity: ExternalIdentity,
  rotatedFromSessionId?: BrowserSession["id"],
): BrowserSession {
  const sessionTime = new Date(now.getTime() + (rotatedFromSessionId ? 1_000 : 0));
  return {
    id: browserSessionId(randomUUID()),
    platformUserId: user.id,
    loginIdentityId: identity.id,
    tokenDigest: digest("token"),
    tokenKeyVersion: 1,
    csrfDigest: digest("csrf"),
    csrfKeyVersion: 1,
    authenticationRevisionAtIssue: user.authenticationRevision,
    authenticatedAt: sessionTime,
    lastSeenAt: sessionTime,
    idleExpiresAt: new Date(sessionTime.getTime() + 8 * 60 * 60_000),
    absoluteExpiresAt: new Date(sessionTime.getTime() + 7 * 24 * 60 * 60_000),
    status: "ACTIVE",
    ...(rotatedFromSessionId ? { rotatedFromSessionId } : {}),
    createdAt: sessionTime,
    updatedAt: sessionTime,
  };
}

function makeTransaction(overrides: Partial<OAuthTransaction> = {}): OAuthTransaction {
  return {
    id: oauthTransactionId(randomUUID()),
    provider: "DISCORD",
    purpose: "LOGIN",
    state: "PENDING",
    stateDigest: digest("state"),
    browserBindingDigest: digest("binding"),
    redirectKey: "web-login",
    returnTargetKey: "dashboard",
    pkceMode: "DISABLED_UNVERIFIED",
    expiresAt: new Date(now.getTime() + 10 * 60_000),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeCredential(
  identity: ExternalIdentity,
  overrides: Partial<OAuthCredential> = {},
): OAuthCredential {
  const encrypted = {
    ciphertext: new Uint8Array([1, 2, 3]),
    nonce: new Uint8Array(12),
    authenticationTag: new Uint8Array(16),
    keyVersion: 1,
  };
  return {
    id: oauthCredentialId(randomUUID()),
    externalIdentityId: identity.id,
    provider: "DISCORD",
    encryptedAccessToken: encrypted,
    encryptedRefreshToken: encrypted,
    scopes: ["identify"],
    providerExpiresAt: new Date(now.getTime() + 60 * 60_000),
    refreshVersion: 1,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeMembership(identity: ExternalIdentity, internalGuildId: string, roles: string[]) {
  const id = discordGuildMembershipId(randomUUID());
  return {
    id,
    externalIdentityId: identity.id,
    guildId: guildId(internalGuildId),
    status: "PRESENT" as const,
    source: "DISCORD_BOT" as const,
    verifiedAt: now,
    validUntil: new Date(now.getTime() + 5 * 60_000),
    roles: roles.map((roleId) => ({ id, membershipId: id, roleId: discordRoleId(roleId), createdAt: now })),
    createdAt: now,
    updatedAt: now,
  };
}

function makeAudit(overrides: Partial<AuthenticationAuditEvent> = {}): AuthenticationAuditEvent {
  return {
    id: authenticationAuditEventId(randomUUID()),
    action: "SESSION_REVOCATION",
    outcome: "SUCCESS",
    reasonCode: "SECURITY_RESPONSE",
    correlationId: authenticationCorrelationId(randomUUID()),
    target: {},
    metadata: {},
    occurredAt: now,
    createdAt: now,
    ...overrides,
  };
}

function integrationToken(access: string, refresh: string) {
  return {
    accessToken: opaqueAuthenticationSecret(`${access}-${"x".repeat(32)}`),
    refreshToken: opaqueAuthenticationSecret(`${refresh}-${"x".repeat(32)}`),
    scopes: ["guilds.members.read", "identify"],
    expiresAt: new Date(Date.now() + 60 * 60_000),
  };
}

async function createOwnerPath(
  discordId: string,
  permissionDefinitionId?: string,
  existingGuildId?: string,
) {
  const user = await repositories.platformUsers.create(makeUser());
  const identity = await repositories.externalIdentities.create(
    makeIdentity(user.id, discordUserId(discordId)),
  );
  const guild = existingGuildId
    ? await client.guild.findUniqueOrThrow({ where: { id: existingGuildId } })
    : await client.guild.create({ data: { discordGuildId: "1257928923048837201" } });
  const definition = permissionDefinitionId
    ? await client.permissionDefinition.findUniqueOrThrow({ where: { id: permissionDefinitionId } })
    : await client.permissionDefinition.create({ data: { key: "platform.owner", enabled: true } });
  const principal = await client.permissionPrincipal.create({
    data: {
      type: PermissionPrincipalType.DISCORD_USER,
      guildId: guild.id,
      externalId: discordId,
      enabled: true,
    },
  });
  const assignment = await client.permissionAssignment.create({
    data: {
      principalId: principal.id,
      permissionDefinitionId: definition.id,
      scope: PermissionScopeType.PLATFORM,
      effect: PermissionAssignmentEffect.ALLOW,
      enabled: true,
    },
  });
  return {
    user,
    identity,
    assignmentId: assignment.id,
    guildId: guild.id,
    permissionDefinitionId: definition.id,
  };
}
