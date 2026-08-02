import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { PrismaClientFactory } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl)
  throw new Error("DATABASE_URL is required for PostgreSQL integration tests.");

const databaseName = new URL(databaseUrl).pathname.slice(1);
if (!databaseName.toLowerCase().includes("test")) {
  throw new Error(
    `Refusing destructive integration-test cleanup for database '${databaseName}': its name must contain 'test'.`,
  );
}

const client = new PrismaClientFactory().create({
  connectionStringForClientFactory: () => databaseUrl,
});

interface SeedState {
  guildId: string;
  otherGuildId: string;
  principalId: string;
  permissionId: string;
}

beforeAll(async () => {
  await client.$connect();
});

beforeEach(async () => {
  await client.$executeRawUnsafe(
    'TRUNCATE TABLE "authentication_audit_events", "discord_guild_membership_roles", "discord_guild_memberships", "oauth_credentials", "oauth_transactions", "browser_sessions", "external_identities", "platform_users", "role_menu_options", "role_menus", "permission_audit_events", "permission_assignments", "permission_principals", "permission_definitions", "permission_catalog_state", "guilds" CASCADE',
  );
});

afterAll(async () => {
  await client.$disconnect();
});

describe("permission foundation migration", () => {
  it("applies the committed migration to an empty database", async () => {
    const migrations = await client.$queryRawUnsafe<
      Array<{ migration_name: string }>
    >(
      'SELECT "migration_name" FROM "_prisma_migrations" WHERE "finished_at" IS NOT NULL AND "rolled_back_at" IS NULL ORDER BY "migration_name"',
    );
    const tables = await client.$queryRawUnsafe<Array<{ table_name: string }>>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'permission_%'",
    );
    expect(migrations.map(({ migration_name }) => migration_name)).toEqual([
      "20260731000000_permission_foundation",
      "20260731230000_permission_repository_metadata",
      "20260731233000_permission_assignment_lifecycle_actions",
      "20260731234500_owner_protection_audit_actions",
      "20260801000000_authentication_foundation",
      "20260801030000_oauth_pkce_mode",
      "20260802090000_role_menus",
      "20260802093000_permission_hyphenated_segments",
      "20260802180000_discord_community_essentials",
      "20260802193000_role_management_parity",
      "20260802203000_role_management_conflict_metadata",
    ]);
    expect(tables.map(({ table_name }) => table_name).sort()).toEqual([
      "permission_assignments",
      "permission_audit_events",
      "permission_catalog_state",
      "permission_definitions",
      "permission_principals",
    ]);
  });

  it("creates only the approved additive authentication tables", async () => {
    const tables = await client.$queryRawUnsafe<Array<{ table_name: string }>>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE 'oauth_%' OR table_name LIKE 'authentication_%' OR table_name IN ('platform_users', 'external_identities', 'browser_sessions', 'discord_guild_memberships', 'discord_guild_membership_roles'))",
    );
    expect(tables.map(({ table_name }) => table_name).sort()).toEqual([
      "authentication_audit_events",
      "browser_sessions",
      "discord_guild_membership_roles",
      "discord_guild_memberships",
      "external_identities",
      "oauth_credentials",
      "oauth_transactions",
      "platform_users",
    ]);
  });

  it("rejects duplicate Discord guild identities", async () => {
    await insertGuild("100");
    await expect(insertGuild("100")).rejects.toThrow();
  });

  it("rejects duplicate principals within a guild", async () => {
    const guildId = await insertGuild("100");
    await insertPrincipal(guildId, "200");
    await expect(insertPrincipal(guildId, "200")).rejects.toThrow();
  });

  it("isolates the same external principal identity across guilds", async () => {
    const firstGuild = await insertGuild("100");
    const secondGuild = await insertGuild("101");
    await expect(insertPrincipal(firstGuild, "200")).resolves.toBeTypeOf(
      "string",
    );
    await expect(insertPrincipal(secondGuild, "200")).resolves.toBeTypeOf(
      "string",
    );
  });

  it("rejects invalid scope/guild combinations and cross-guild assignment", async () => {
    const state = await seed();
    await expect(
      insertAssignment(state, "platform", state.guildId),
    ).rejects.toThrow();
    await expect(
      insertAssignment(state, "discord-guild", null),
    ).rejects.toThrow();
    await expect(
      insertAssignment(state, "discord-guild", state.otherGuildId),
    ).rejects.toThrow();
  });

  it("rejects duplicate active platform assignments despite a NULL guild", async () => {
    const state = await seed();
    await insertAssignment(state, "platform", null);
    await expect(insertAssignment(state, "platform", null)).rejects.toThrow();
  });

  it("rejects duplicate active guild assignments", async () => {
    const state = await seed();
    await insertAssignment(state, "discord-guild", state.guildId);
    await expect(
      insertAssignment(state, "discord-guild", state.guildId),
    ).rejects.toThrow();
  });

  it("stores historical expired and disabled assignments", async () => {
    const state = await seed();
    await client.$executeRawUnsafe(
      `INSERT INTO "permission_assignments" ("principal_id", "permission_definition_id", "scope", "effect", "enabled", "expires_at", "created_at", "updated_at") VALUES ($1::uuid, $2::uuid, 'platform', 'allow', true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', NOW())`,
      state.principalId,
      state.permissionId,
    );
    await client.$executeRawUnsafe(
      `INSERT INTO "permission_assignments" ("principal_id", "permission_definition_id", "scope", "effect", "enabled", "revoked_at", "created_at", "updated_at") VALUES ($1::uuid, $2::uuid, 'platform', 'deny', false, NOW(), NOW() - INTERVAL '1 day', NOW())`,
      state.principalId,
      state.permissionId,
    );
    const count = await client.permissionAssignment.count();
    expect(count).toBe(2);
  });

  it("restricts deletion when historical relationships exist", async () => {
    const state = await seed();
    await insertAssignment(state, "discord-guild", state.guildId);
    await expect(
      client.guild.delete({ where: { id: state.guildId } }),
    ).rejects.toThrow();
    await expect(
      client.permissionDefinition.delete({ where: { id: state.permissionId } }),
    ).rejects.toThrow();
  });

  it("rejects UPDATE and DELETE of append-only audit events", async () => {
    const eventId = await insertAuditEvent();
    await expect(
      client.$executeRawUnsafe(
        'UPDATE "permission_audit_events" SET "reason" = $1 WHERE "id" = $2::uuid',
        "changed",
        eventId,
      ),
    ).rejects.toThrow(/append-only/);
    await expect(
      client.$executeRawUnsafe(
        'DELETE FROM "permission_audit_events" WHERE "id" = $1::uuid',
        eventId,
      ),
    ).rejects.toThrow(/append-only/);
  });

  it("enforces the named catalog singleton and permission-key syntax", async () => {
    await client.permissionCatalogState.create({
      data: {
        id: "compiled-permission-catalog",
        version: "1.0.0",
        checksum: `sha256:${"a".repeat(64)}`,
        syncedAt: new Date(),
      },
    });
    await expect(
      client.permissionCatalogState.create({
        data: {
          id: "another-catalog",
          version: "1.0.0",
          checksum: `sha256:${"b".repeat(64)}`,
          syncedAt: new Date(),
        },
      }),
    ).rejects.toThrow();
    await expect(
      client.permissionDefinition.create({ data: { key: "Invalid Key" } }),
    ).rejects.toThrow();
  });

  it("rolls back a transaction without leaving partial rows", async () => {
    await expect(
      client.$transaction(async (transaction) => {
        await transaction.guild.create({ data: { discordGuildId: "100" } });
        throw new Error("intentional rollback");
      }),
    ).rejects.toThrow("intentional rollback");
    expect(await client.guild.count()).toBe(0);
  });
});

describe("authentication foundation migration", () => {
  it("enforces provider-subject and one-Discord-identity-per-account uniqueness", async () => {
    const firstUser = await insertPlatformUser();
    const secondUser = await insertPlatformUser();
    await insertExternalIdentity(firstUser, "10000000000000001");
    await expect(
      insertExternalIdentity(secondUser, "10000000000000001"),
    ).rejects.toThrow();
    await expect(
      insertExternalIdentity(firstUser, "10000000000000002"),
    ).rejects.toThrow();
  });

  it("retains provider-subject ownership after an identity is unlinked", async () => {
    const firstUser = await insertPlatformUser();
    const secondUser = await insertPlatformUser();
    const identityId = await insertExternalIdentity(
      firstUser,
      "10000000000000001",
    );
    await client.$executeRawUnsafe(
      'UPDATE "external_identities" SET "enabled" = false, "unlinked_at" = NOW(), "updated_at" = NOW() WHERE "id" = $1::uuid',
      identityId,
    );
    await expect(
      insertExternalIdentity(secondUser, "10000000000000001"),
    ).rejects.toThrow();
  });

  it("rejects invalid account and external-identity lifecycle states", async () => {
    await expect(
      client.$executeRawUnsafe(
        `INSERT INTO "platform_users" ("status", "status_reason_code", "updated_at") VALUES ('suspended', 'security-response', NOW())`,
      ),
    ).rejects.toThrow();
    const userId = await insertPlatformUser();
    await expect(
      client.$executeRawUnsafe(
        `INSERT INTO "external_identities" ("platform_user_id", "provider", "provider_subject_id", "enabled", "linked_at", "verified_at", "updated_at") VALUES ($1::uuid, 'discord', 'not-a-snowflake', true, NOW(), NOW(), NOW())`,
        userId,
      ),
    ).rejects.toThrow();
    await expect(
      client.$executeRawUnsafe(
        `INSERT INTO "external_identities" ("platform_user_id", "provider", "provider_subject_id", "enabled", "linked_at", "verified_at", "updated_at") VALUES ($1::uuid, 'discord', '10000000000000001', false, NOW(), NOW(), NOW())`,
        userId,
      ),
    ).rejects.toThrow();
  });

  it("serializes concurrent provider-subject ownership", async () => {
    const firstUser = await insertPlatformUser();
    const secondUser = await insertPlatformUser();
    const results = await Promise.allSettled([
      insertExternalIdentity(firstUser, "10000000000000001"),
      insertExternalIdentity(secondUser, "10000000000000001"),
    ]);
    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(results.filter(({ status }) => status === "rejected")).toHaveLength(1);
    expect(await client.externalIdentity.count()).toBe(1);
  });

  it("rolls back the losing account during concurrent first login", async () => {
    const subject = "10000000000000001";
    const firstLogin = () =>
      client.$transaction(async (transaction) => {
        const now = new Date();
        const user = await transaction.platformUser.create({
          data: { createdAt: now, updatedAt: now },
        });
        await transaction.externalIdentity.create({
          data: {
            platformUserId: user.id,
            provider: "DISCORD",
            providerSubjectId: subject,
            linkedAt: now,
            verifiedAt: now,
            createdAt: now,
            updatedAt: now,
          },
        });
        return user.id;
      });
    const results = await Promise.allSettled([firstLogin(), firstLogin()]);
    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(results.filter(({ status }) => status === "rejected")).toHaveLength(1);
    expect(await client.platformUser.count()).toBe(1);
    expect(await client.externalIdentity.count()).toBe(1);
  });

  it("enforces session digests, expiry, revision, and revocation state", async () => {
    const userId = await insertPlatformUser();
    const identityId = await insertExternalIdentity(
      userId,
      "10000000000000001",
    );
    const sessionId = await insertBrowserSession(userId, identityId, "a", "b");
    await expect(insertBrowserSession(userId, identityId, "a", "c")).rejects.toThrow();
    await expect(insertBrowserSession(userId, identityId, "d", "b")).rejects.toThrow();
    await expect(
      client.$executeRawUnsafe(
        `UPDATE "browser_sessions" SET "status" = 'revoked', "updated_at" = NOW() WHERE "id" = $1::uuid`,
        sessionId,
      ),
    ).rejects.toThrow();
    await expect(
      client.$executeRawUnsafe(
        `INSERT INTO "browser_sessions" ("platform_user_id", "login_identity_id", "token_digest", "token_key_version", "csrf_digest", "csrf_key_version", "authentication_revision_at_issue", "authenticated_at", "last_seen_at", "idle_expires_at", "absolute_expires_at", "updated_at") VALUES ($1::uuid, $2::uuid, $3, 1, $4, 1, 0, NOW(), NOW(), NOW() + INTERVAL '1 hour', NOW() + INTERVAL '7 days', NOW())`,
        userId,
        identityId,
        digest("e"),
        digest("f"),
      ),
    ).rejects.toThrow();
  });

  it("enforces a single non-branching session rotation relationship", async () => {
    const userId = await insertPlatformUser();
    const identityId = await insertExternalIdentity(
      userId,
      "10000000000000001",
    );
    const sourceId = await insertBrowserSession(userId, identityId, "a", "b");
    await client.$executeRawUnsafe(
      `UPDATE "browser_sessions" SET "status" = 'rotated', "revoked_at" = NOW(), "revocation_reason" = 'rotated', "updated_at" = NOW() WHERE "id" = $1::uuid`,
      sourceId,
    );
    await insertBrowserSession(userId, identityId, "c", "d", sourceId);
    await expect(
      insertBrowserSession(userId, identityId, "e", "f", sourceId),
    ).rejects.toThrow();
  });

  it("rejects session identity/account mismatch and restrictive deletion", async () => {
    const firstUser = await insertPlatformUser();
    const secondUser = await insertPlatformUser();
    const identityId = await insertExternalIdentity(
      firstUser,
      "10000000000000001",
    );
    await expect(
      insertBrowserSession(secondUser, identityId, "a", "b"),
    ).rejects.toThrow();
    await expect(
      client.platformUser.delete({ where: { id: firstUser } }),
    ).rejects.toThrow();
  });

  it("enforces OAuth state and browser-binding uniqueness", async () => {
    await insertOAuthTransaction("a", "b");
    await expect(insertOAuthTransaction("a", "c")).rejects.toThrow();
    await expect(insertOAuthTransaction("d", "b")).rejects.toThrow();
    await expect(
      client.$executeRawUnsafe(
        `INSERT INTO "oauth_transactions" ("provider", "purpose", "state_digest", "browser_binding_digest", "redirect_key", "return_target_key", "expires_at", "updated_at") VALUES ('discord', 'login', $1, $2, 'INVALID', 'dashboard', NOW() + INTERVAL '10 minutes', NOW())`,
        digest("e"),
        digest("f"),
      ),
    ).rejects.toThrow();
  });

  it("permits only one concurrent OAuth transaction claim", async () => {
    const id = await insertOAuthTransaction("a", "b");
    const claim = () =>
      client.$queryRawUnsafe<Array<{ id: string }>>(
        `UPDATE "oauth_transactions" SET "state" = 'claimed', "claimed_at" = NOW(), "claim_expires_at" = NOW() + INTERVAL '30 seconds', "updated_at" = NOW() WHERE "id" = $1::uuid AND "state" = 'pending' RETURNING "id"`,
        id,
      );
    const results = await Promise.all([claim(), claim()]);
    expect(results.map((rows) => rows.length).sort()).toEqual([0, 1]);
  });

  it("allows safe OAuth claim reclaim after lease expiry", async () => {
    const id = await insertOAuthTransaction("a", "b");
    await client.$executeRawUnsafe(
      `UPDATE "oauth_transactions" SET "state" = 'claimed', "claimed_at" = NOW() - INTERVAL '2 minutes', "claim_expires_at" = NOW() - INTERVAL '1 minute', "updated_at" = NOW() WHERE "id" = $1::uuid`,
      id,
    );
    await expect(
      client.$executeRawUnsafe(
        `UPDATE "oauth_transactions" SET "claimed_at" = NOW(), "claim_expires_at" = NOW() + INTERVAL '30 seconds', "updated_at" = NOW() WHERE "id" = $1::uuid`,
        id,
      ),
    ).resolves.toBe(1);
  });

  it("rejects completed OAuth callback replay", async () => {
    const id = await insertOAuthTransaction("a", "b");
    await client.$executeRawUnsafe(
      `UPDATE "oauth_transactions" SET "state" = 'claimed', "claimed_at" = NOW(), "claim_expires_at" = NOW() + INTERVAL '30 seconds', "updated_at" = NOW() WHERE "id" = $1::uuid`,
      id,
    );
    await client.$executeRawUnsafe(
      `UPDATE "oauth_transactions" SET "state" = 'completed', "completed_at" = NOW(), "updated_at" = NOW() WHERE "id" = $1::uuid`,
      id,
    );
    await expect(
      client.$executeRawUnsafe(
        `UPDATE "oauth_transactions" SET "state" = 'claimed', "completed_at" = NULL, "updated_at" = NOW() WHERE "id" = $1::uuid`,
        id,
      ),
    ).rejects.toThrow(/terminal OAuth transaction/);
  });

  it("enforces encrypted OAuth credential metadata and normalized scopes", async () => {
    const userId = await insertPlatformUser();
    const identityId = await insertExternalIdentity(
      userId,
      "10000000000000001",
    );
    await insertOAuthCredential(identityId);
    await expect(insertOAuthCredential(identityId)).rejects.toThrow();
    await expect(
      client.$executeRawUnsafe(
        `INSERT INTO "oauth_credentials" ("external_identity_id", "provider", "access_token_ciphertext", "access_token_nonce", "access_token_authentication_tag", "access_token_key_version", "refresh_token_ciphertext", "refresh_token_nonce", "refresh_token_authentication_tag", "refresh_token_key_version", "scopes", "provider_expires_at", "updated_at") VALUES ($1::uuid, 'discord', '\\x01', '\\x000000000000000000000000', '\\x00000000000000000000000000000000', 1, '\\x02', '\\x000000000000000000000000', '\\x00000000000000000000000000000000', 1, ARRAY['identify', 'email'], NOW() + INTERVAL '1 hour', NOW())`,
        identityId,
      ),
    ).rejects.toThrow();
  });

  it("enforces membership uniqueness, status, and normalized Discord roles", async () => {
    const userId = await insertPlatformUser();
    const identityId = await insertExternalIdentity(
      userId,
      "10000000000000001",
    );
    const guild = await insertGuild("1257928923048837201");
    const membershipId = await insertMembership(identityId, guild);
    await expect(insertMembership(identityId, guild)).rejects.toThrow();
    await client.$executeRawUnsafe(
      `INSERT INTO "discord_guild_membership_roles" ("membership_id", "role_id") VALUES ($1::uuid, '1262656532902842423')`,
      membershipId,
    );
    await expect(
      client.$executeRawUnsafe(
        `INSERT INTO "discord_guild_membership_roles" ("membership_id", "role_id") VALUES ($1::uuid, 'invalid')`,
        membershipId,
      ),
    ).rejects.toThrow();
    await expect(
      client.$executeRawUnsafe(
        `INSERT INTO "discord_guild_memberships" ("external_identity_id", "guild_id", "status", "source", "updated_at") VALUES ($1::uuid, $2::uuid, 'present', 'discord-oauth', NOW())`,
        identityId,
        await insertGuild("1257928923048837202"),
      ),
    ).rejects.toThrow();
    const invalidGuild = await insertGuild("100");
    await expect(insertMembership(identityId, invalidGuild)).rejects.toThrow();
    const unknownGuild = await insertGuild("1257928923048837203");
    const unknownRows = await client.$queryRawUnsafe<Array<{ id: string }>>(
      `INSERT INTO "discord_guild_memberships" ("external_identity_id", "guild_id", "status", "source", "updated_at") VALUES ($1::uuid, $2::uuid, 'unknown', 'discord-oauth', NOW()) RETURNING "id"`,
      identityId,
      unknownGuild,
    );
    await expect(
      client.$executeRawUnsafe(
        `INSERT INTO "discord_guild_membership_roles" ("membership_id", "role_id") VALUES ($1::uuid, '1262656532902842423')`,
        requiredId(unknownRows),
      ),
    ).rejects.toThrow(/present Discord memberships/);
  });

  it("keeps authentication audit append-only and rejects unsafe metadata", async () => {
    const eventId = await insertAuthenticationAuditEvent();
    await expect(
      client.$executeRawUnsafe(
        `UPDATE "authentication_audit_events" SET "outcome" = 'failure' WHERE "id" = $1::uuid`,
        eventId,
      ),
    ).rejects.toThrow(/append-only/);
    await expect(
      client.$executeRawUnsafe(
        `DELETE FROM "authentication_audit_events" WHERE "id" = $1::uuid`,
        eventId,
      ),
    ).rejects.toThrow(/append-only/);
    await expect(
      client.$executeRawUnsafe(
        `INSERT INTO "authentication_audit_events" ("action", "outcome", "reason_code", "correlation_id", "metadata", "occurred_at") VALUES ('login-failure', 'failure', 'invalid-credential', $1::uuid, '{"token":"unsafe"}'::jsonb, NOW())`,
        randomUUID(),
      ),
    ).rejects.toThrow();
  });

  it("rolls back authentication writes without partial ownership", async () => {
    await expect(
      client.$transaction(async (transaction) => {
        await transaction.platformUser.create({ data: {} });
        throw new Error("authentication rollback");
      }),
    ).rejects.toThrow("authentication rollback");
    expect(await client.platformUser.count()).toBe(0);
  });

  it("persists authentication records across a client restart", async () => {
    const userId = await insertPlatformUser();
    await client.$disconnect();
    await client.$connect();
    await expect(
      client.platformUser.findUnique({ where: { id: userId } }),
    ).resolves.toMatchObject({ id: userId, status: "ACTIVE" });
  });
});

async function seed(): Promise<SeedState> {
  const guildId = await insertGuild("100");
  const otherGuildId = await insertGuild("101");
  const principalId = await insertPrincipal(guildId, "200");
  const permissionId = await insertPermission("moderation.warn");
  return { guildId, otherGuildId, principalId, permissionId };
}

async function insertGuild(discordGuildId: string): Promise<string> {
  const rows = await client.$queryRawUnsafe<Array<{ id: string }>>(
    'INSERT INTO "guilds" ("discord_guild_id", "updated_at") VALUES ($1, NOW()) RETURNING "id"',
    discordGuildId,
  );
  return requiredId(rows);
}

async function insertPrincipal(
  guildId: string,
  externalId: string,
): Promise<string> {
  const rows = await client.$queryRawUnsafe<Array<{ id: string }>>(
    `INSERT INTO "permission_principals" ("type", "guild_id", "external_id", "updated_at") VALUES ('discord-user', $1::uuid, $2, NOW()) RETURNING "id"`,
    guildId,
    externalId,
  );
  return requiredId(rows);
}

async function insertPermission(key: string): Promise<string> {
  const rows = await client.$queryRawUnsafe<Array<{ id: string }>>(
    'INSERT INTO "permission_definitions" ("key", "updated_at") VALUES ($1, NOW()) RETURNING "id"',
    key,
  );
  return requiredId(rows);
}

async function insertAssignment(
  state: SeedState,
  scope: "platform" | "discord-guild",
  guildId: string | null,
): Promise<string> {
  const rows = await client.$queryRawUnsafe<Array<{ id: string }>>(
    'INSERT INTO "permission_assignments" ("principal_id", "permission_definition_id", "scope", "guild_id", "effect", "updated_at") VALUES ($1::uuid, $2::uuid, $3::"PermissionScopeType", $4::uuid, \'allow\', NOW()) RETURNING "id"',
    state.principalId,
    state.permissionId,
    scope,
    guildId,
  );
  return requiredId(rows);
}

async function insertAuditEvent(): Promise<string> {
  const rows = await client.$queryRawUnsafe<Array<{ id: string }>>(
    `INSERT INTO "permission_audit_events" ("action", "actor_type", "actor_service", "scope", "reason_code", "correlation_id", "occurred_at") VALUES ('set-assignment', 'system', 'integration-test', 'platform', 'system-maintenance', $1::uuid, NOW()) RETURNING "id"`,
    randomUUID(),
  );
  return requiredId(rows);
}

async function insertPlatformUser(): Promise<string> {
  const rows = await client.$queryRawUnsafe<Array<{ id: string }>>(
    `INSERT INTO "platform_users" ("updated_at") VALUES (NOW()) RETURNING "id"`,
  );
  return requiredId(rows);
}

async function insertExternalIdentity(
  platformUserId: string,
  providerSubjectId: string,
): Promise<string> {
  const rows = await client.$queryRawUnsafe<Array<{ id: string }>>(
    `INSERT INTO "external_identities" ("platform_user_id", "provider", "provider_subject_id", "linked_at", "verified_at", "updated_at") VALUES ($1::uuid, 'discord', $2, NOW(), NOW(), NOW()) RETURNING "id"`,
    platformUserId,
    providerSubjectId,
  );
  return requiredId(rows);
}

async function insertBrowserSession(
  platformUserId: string,
  loginIdentityId: string,
  tokenSeed: string,
  csrfSeed: string,
  rotatedFromSessionId?: string,
): Promise<string> {
  const rows = await client.$queryRawUnsafe<Array<{ id: string }>>(
    `INSERT INTO "browser_sessions" ("platform_user_id", "login_identity_id", "token_digest", "token_key_version", "csrf_digest", "csrf_key_version", "authentication_revision_at_issue", "authenticated_at", "last_seen_at", "idle_expires_at", "absolute_expires_at", "rotated_from_session_id", "updated_at") VALUES ($1::uuid, $2::uuid, $3, 1, $4, 1, 1, NOW(), NOW(), NOW() + INTERVAL '1 hour', NOW() + INTERVAL '7 days', $5::uuid, NOW()) RETURNING "id"`,
    platformUserId,
    loginIdentityId,
    digest(tokenSeed),
    digest(csrfSeed),
    rotatedFromSessionId ?? null,
  );
  return requiredId(rows);
}

async function insertOAuthTransaction(
  stateSeed: string,
  browserSeed: string,
): Promise<string> {
  const rows = await client.$queryRawUnsafe<Array<{ id: string }>>(
    `INSERT INTO "oauth_transactions" ("provider", "purpose", "state_digest", "browser_binding_digest", "redirect_key", "return_target_key", "expires_at", "created_at", "updated_at") VALUES ('discord', 'login', $1, $2, 'web-login', 'dashboard', NOW() + INTERVAL '10 minutes', NOW() - INTERVAL '5 minutes', NOW()) RETURNING "id"`,
    digest(stateSeed),
    digest(browserSeed),
  );
  return requiredId(rows);
}

async function insertOAuthCredential(externalIdentityId: string): Promise<string> {
  const rows = await client.$queryRawUnsafe<Array<{ id: string }>>(
    `INSERT INTO "oauth_credentials" ("external_identity_id", "provider", "access_token_ciphertext", "access_token_nonce", "access_token_authentication_tag", "access_token_key_version", "refresh_token_ciphertext", "refresh_token_nonce", "refresh_token_authentication_tag", "refresh_token_key_version", "scopes", "provider_expires_at", "updated_at") VALUES ($1::uuid, 'discord', '\\x01', '\\x000000000000000000000000', '\\x00000000000000000000000000000000', 1, '\\x02', '\\x000000000000000000000000', '\\x00000000000000000000000000000000', 1, ARRAY['identify'], NOW() + INTERVAL '1 hour', NOW()) RETURNING "id"`,
    externalIdentityId,
  );
  return requiredId(rows);
}

async function insertMembership(
  externalIdentityId: string,
  guildId: string,
): Promise<string> {
  const rows = await client.$queryRawUnsafe<Array<{ id: string }>>(
    `INSERT INTO "discord_guild_memberships" ("external_identity_id", "guild_id", "status", "source", "verified_at", "valid_until", "updated_at") VALUES ($1::uuid, $2::uuid, 'present', 'combined', NOW(), NOW() + INTERVAL '5 minutes', NOW()) RETURNING "id"`,
    externalIdentityId,
    guildId,
  );
  return requiredId(rows);
}

async function insertAuthenticationAuditEvent(): Promise<string> {
  const rows = await client.$queryRawUnsafe<Array<{ id: string }>>(
    `INSERT INTO "authentication_audit_events" ("action", "outcome", "reason_code", "correlation_id", "metadata", "occurred_at") VALUES ('login-start', 'success', 'requested', $1::uuid, '{"provider_latency_ms":12}'::jsonb, NOW()) RETURNING "id"`,
    randomUUID(),
  );
  return requiredId(rows);
}

function digest(seed: string): string {
  return seed.repeat(64).slice(0, 64);
}

function requiredId(rows: Array<{ id: string }>): string {
  const id = rows[0]?.id;
  if (!id)
    throw new Error("PostgreSQL did not return the inserted identifier.");
  return id;
}
