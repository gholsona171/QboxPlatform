import { randomUUID } from "node:crypto";

import {
  DeferredOwnerProtectionService,
  permissionCatalog,
  PersistentPermissionService,
  UnknownPermissionCatalogEntriesError,
  type PermissionAuditInput,
  type PermissionMutation,
  type OwnerProtectionService,
  type OwnerRevocationRequest,
  type PermissionPrincipal,
} from "@qbox/permissions";
import { PrismaClientFactory } from "@qbox/prisma";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  DatabaseConfiguration,
  InMemoryPermissionInvalidationBus,
  PrismaGuildRepository,
  PrismaPermissionAuditRepository,
  PrismaPermissionCatalogRepository,
  PrismaPermissionDefinitionRepository,
  PrismaPermissionPrincipalRepository,
  PrismaPermissionRepository,
} from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl)
  throw new Error("DATABASE_URL is required for repository integration tests.");
const databaseName = new URL(databaseUrl).pathname.slice(1);
if (!databaseName.toLowerCase().includes("test"))
  throw new Error(
    `Refusing repository cleanup for non-test database '${databaseName}'.`,
  );

const configuration = DatabaseConfiguration.from({
  databaseUrl,
  environment: "test",
});
const client = new PrismaClientFactory().create(configuration);
const invalidations = new InMemoryPermissionInvalidationBus();
const guilds = new PrismaGuildRepository(client);
const principals = new PrismaPermissionPrincipalRepository(client);
const definitions = new PrismaPermissionDefinitionRepository(client);
const catalogs = new PrismaPermissionCatalogRepository(client);
const audits = new PrismaPermissionAuditRepository(client);
const permissions = new PrismaPermissionRepository(
  client,
  new DeferredOwnerProtectionService(),
  invalidations,
);

const guildOne = "100000000000000001";
const guildTwo = "100000000000000002";
const userOne: PermissionPrincipal = {
  type: "discord-user",
  externalId: "200000000000000001",
  guildId: guildOne,
};

beforeAll(async () => client.$connect());
beforeEach(async () => {
  await client.$executeRawUnsafe(
    'TRUNCATE TABLE "permission_audit_events", "permission_assignments", "permission_principals", "permission_definitions", "permission_catalog_state", "guilds" CASCADE',
  );
});
afterAll(async () => client.$disconnect());

describe("persistent permission repositories", () => {
  it("creates and retrieves a Discord principal with metadata", async () => {
    await guilds.create(guildOne, { name: "Guild One" });
    const created = await principals.getOrCreateDiscordPrincipal(userOne, {
      displayName: "Test User",
    });
    expect(created.metadata).toEqual({ displayName: "Test User" });
    await expect(
      principals.findDiscordUser(guildOne, userOne.externalId),
    ).resolves.toEqual(created);
  });

  it("makes duplicate principal creation idempotent", async () => {
    await guilds.create(guildOne);
    const first = await principals.getOrCreateDiscordPrincipal(userOne);
    const second = await principals.getOrCreateDiscordPrincipal(userOne);
    expect(second.id).toBe(first.id);
    expect(await client.permissionPrincipal.count()).toBe(1);
  });

  it("synchronizes compiled permission definitions and catalog state", async () => {
    const result = await synchronize();
    expect(result.synchronizedDefinitions).toBe(
      permissionCatalog.permissions.length,
    );
    expect(result.status.state).toBe("synchronized");
    await expect(
      definitions.findByKey("moderation.warn"),
    ).resolves.toMatchObject({
      key: "moderation.warn",
      enabled: true,
    });
    await expect(catalogs.current()).resolves.toMatchObject({
      version: permissionCatalog.version,
      checksum: permissionCatalog.checksum,
    });
  });

  it("grants a permission atomically with its audit event", async () => {
    await seedPrincipal();
    const outcome = await permissions.applyMutation(
      grant(),
      audit("set-assignment"),
    );
    expect(outcome.assignment?.selector).toEqual({
      type: "permission",
      permission: "moderation.warn",
    });
    expect(await client.permissionAuditEvent.count()).toBe(1);
  });

  it("revokes without deleting assignment history", async () => {
    await seedPrincipal();
    const granted = await permissions.applyMutation(
      grant(),
      audit("set-assignment"),
    );
    await permissions.applyMutation(
      revoke(required(granted.assignment?.id)),
      audit("revoke-assignment"),
    );
    expect(await permissions.findActive()).toHaveLength(0);
    expect(await permissions.findHistorical()).toHaveLength(1);
    expect(await client.permissionAuditEvent.count()).toBe(2);
  });

  it("executes revocation through the transaction-scoped owner boundary", async () => {
    await seedPrincipal();
    const protection = new RecordingOwnerProtectionService();
    const repository = new PrismaPermissionRepository(client, protection);
    const granted = await repository.applyMutation(
      grant(),
      audit("set-assignment"),
    );
    const assignmentId = required(granted.assignment?.id);

    await repository.applyMutation(
      revoke(assignmentId),
      audit("revoke-assignment"),
    );

    expect(protection.requests).toEqual([
      expect.objectContaining({ assignmentId }),
    ]);
  });

  it("excludes expired assignments while preserving history", async () => {
    await seedPrincipal();
    const granted = await permissions.applyMutation(
      grant(),
      audit("set-assignment"),
    );
    await permissions.applyMutation(
      {
        type: "expire-assignment",
        actor: { type: "system", service: "repository-integration-test" },
        assignmentId: required(granted.assignment?.id),
        expiresAt: new Date(Date.now() + 1_000),
        reasonCode: "administrator-action",
      },
      audit("expire-assignment"),
    );
    expect(
      await permissions.findActive({ activeAt: new Date(Date.now() + 2_000) }),
    ).toHaveLength(0);
    expect(await permissions.findHistorical()).toHaveLength(1);
    expect(await client.permissionAuditEvent.count()).toBe(2);
  });

  it("disables and re-enables an assignment with immutable audit history", async () => {
    await seedPrincipal();
    const granted = await permissions.applyMutation(
      grant(),
      audit("set-assignment"),
    );
    const assignmentId = required(granted.assignment?.id);

    await permissions.applyMutation(
      {
        type: "disable-assignment",
        actor: { type: "system", service: "repository-integration-test" },
        assignmentId,
        reasonCode: "administrator-action",
      },
      audit("disable-assignment"),
    );
    expect(await permissions.findActive()).toHaveLength(0);

    await permissions.applyMutation(
      {
        type: "enable-assignment",
        actor: { type: "system", service: "repository-integration-test" },
        assignmentId,
        reasonCode: "administrator-action",
      },
      audit("enable-assignment"),
    );
    expect(await permissions.findActive()).toHaveLength(1);
    expect(await client.permissionAuditEvent.count()).toBe(3);
  });

  it("applies explicit deny precedence over allow", async () => {
    await seedPrincipal();
    await permissions.applyMutation(grant("allow"), audit("set-assignment"));
    await permissions.applyMutation(grant("deny"), audit("set-assignment"));
    const decision = await new PersistentPermissionService(
      permissions,
    ).authorize({
      principals: [userOne],
      scope: { type: "discord-guild", guildId: guildOne },
      required: ["moderation.warn"],
      mode: "all",
      administratorOverride: false,
    });
    expect(decision).toMatchObject({
      allowed: false,
      reason: "permission-denied",
    });
  });

  it("allows an effective permission when no deny exists", async () => {
    await seedPrincipal();
    await permissions.applyMutation(grant(), audit("set-assignment"));
    const decision = await new PersistentPermissionService(
      permissions,
    ).authorize({
      principals: [userOne],
      scope: { type: "discord-guild", guildId: guildOne },
      required: ["moderation.warn"],
      mode: "all",
      administratorOverride: false,
    });
    expect(decision).toMatchObject({
      allowed: true,
      reason: "permissions-satisfied",
    });
  });

  it("isolates assignments between Discord guilds", async () => {
    await seedPrincipal();
    await guilds.create(guildTwo);
    const other = { ...userOne, guildId: guildTwo };
    await principals.getOrCreateDiscordPrincipal(other);
    await permissions.applyMutation(grant(), audit("set-assignment"));
    expect(
      await permissions.findAssignments({
        principals: [other],
        scope: { type: "discord-guild", guildId: guildTwo },
      }),
    ).toHaveLength(0);
  });

  it("loads platform assignments alongside guild authorization", async () => {
    await seedPrincipal();
    const mutation = grant();
    await permissions.applyMutation(
      { ...mutation, scope: { type: "platform" } },
      audit("set-assignment", { type: "platform" }),
    );
    const decision = await new PersistentPermissionService(
      permissions,
    ).authorize({
      principals: [userOne],
      scope: { type: "discord-guild", guildId: guildOne },
      required: ["moderation.warn"],
      mode: "all",
      administratorOverride: false,
    });
    expect(decision.allowed).toBe(true);
  });

  it("rolls back the assignment when audit insertion fails", async () => {
    await seedPrincipal();
    await expect(
      permissions.applyMutation(grant(), {
        ...audit("set-assignment"),
        correlationId: "not-a-uuid",
      }),
    ).rejects.toThrow();
    expect(await client.permissionAssignment.count()).toBe(0);
    expect(await client.permissionAuditEvent.count()).toBe(0);
  });

  it("queries immutable audit history by correlation ID", async () => {
    await seedPrincipal();
    const event = audit("set-assignment");
    await permissions.applyMutation(grant(), event);
    const history = await audits.findByCorrelationId(event.correlationId);
    expect(history).toHaveLength(1);
    expect(history[0]?.permissionKey).toBe("moderation.warn");
  });

  it("excludes assignments for disabled guilds, principals, and definitions", async () => {
    await seedPrincipal();
    await permissions.applyMutation(grant(), audit("set-assignment"));
    await principals.disable(userOne);
    expect(await permissions.findActive()).toHaveLength(0);
    await principals.enable(userOne);
    await guilds.disable(guildOne);
    expect(await permissions.findActive()).toHaveLength(0);
    await guilds.enable(guildOne);
    await client.permissionDefinition.update({
      where: { key: "moderation.warn" },
      data: { enabled: false, disabledAt: new Date() },
    });
    expect(await permissions.findActive()).toHaveLength(0);
  });

  it("reports synchronization state without mutating the catalog", async () => {
    expect(
      (await definitions.currentSynchronizationStatus(permissionCatalog)).state,
    ).toBe("persisted-catalog-unavailable");
    await synchronize();
    expect(
      (await definitions.currentSynchronizationStatus(permissionCatalog)).state,
    ).toBe("synchronized");
  });

  it("rejects unknown persisted catalog keys", async () => {
    await client.permissionDefinition.create({
      data: { key: "unknown.permission" },
    });
    await expect(synchronize()).rejects.toBeInstanceOf(
      UnknownPermissionCatalogEntriesError,
    );
    await expect(
      definitions.findUnknownKeys(permissionCatalog.permissions),
    ).resolves.toEqual(["unknown.permission"]);
  });
});

async function seedPrincipal(): Promise<void> {
  await guilds.create(guildOne);
  await principals.getOrCreateDiscordPrincipal(userOne);
  await synchronize();
}

async function synchronize() {
  return definitions.synchronizeCatalog(permissionCatalog, {
    reasonCode: "system-maintenance",
    reason: "Repository integration test.",
  });
}

function grant(
  effect: "allow" | "deny" = "allow",
): Extract<PermissionMutation, { type: "set-assignment" }> {
  return {
    type: "set-assignment",
    actor: { type: "system", service: "repository-integration-test" },
    target: userOne,
    selector: { type: "permission", permission: "moderation.warn" },
    scope: { type: "discord-guild", guildId: guildOne },
    effect,
    reasonCode: "administrator-action",
  };
}

function revoke(
  assignmentId: string,
): Extract<PermissionMutation, { type: "revoke-assignment" }> {
  return {
    type: "revoke-assignment",
    actor: { type: "system", service: "repository-integration-test" },
    assignmentId,
    reasonCode: "administrator-action",
  };
}

function audit(
  action: PermissionAuditInput["action"],
  scope: PermissionAuditInput["scope"] = {
    type: "discord-guild",
    guildId: guildOne,
  },
): PermissionAuditInput {
  return {
    correlationId: randomUUID(),
    action,
    actor: { type: "system", service: "repository-integration-test" },
    target: userOne,
    scope,
    reasonCode: "administrator-action",
    occurredAt: new Date(),
  };
}

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Expected value was not created.");
  return value;
}

class RecordingOwnerProtectionService implements OwnerProtectionService {
  public readonly requests: OwnerRevocationRequest[] = [];

  public async protect<TResult>(
    request: OwnerRevocationRequest,
    operation: () => Promise<TResult>,
  ): Promise<TResult> {
    this.requests.push(request);
    return operation();
  }
}
