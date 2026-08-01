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
    'TRUNCATE TABLE "permission_audit_events", "permission_assignments", "permission_principals", "permission_definitions", "permission_catalog_state", "guilds" CASCADE',
  );
});

afterAll(async () => {
  await client.$disconnect();
});

describe("permission foundation migration", () => {
  it("applies the committed migration to an empty database", async () => {
    const migrations = await client.$queryRawUnsafe<Array<{ count: bigint }>>(
      'SELECT count(*) AS "count" FROM "_prisma_migrations" WHERE "finished_at" IS NOT NULL AND "rolled_back_at" IS NULL',
    );
    const tables = await client.$queryRawUnsafe<Array<{ table_name: string }>>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'permission_%'",
    );
    expect(migrations[0]?.count).toBe(1n);
    expect(tables.map(({ table_name }) => table_name).sort()).toEqual([
      "permission_assignments",
      "permission_audit_events",
      "permission_catalog_state",
      "permission_definitions",
      "permission_principals",
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

function requiredId(rows: Array<{ id: string }>): string {
  const id = rows[0]?.id;
  if (!id)
    throw new Error("PostgreSQL did not return the inserted identifier.");
  return id;
}
