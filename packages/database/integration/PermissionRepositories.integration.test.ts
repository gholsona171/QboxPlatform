import { randomUUID } from "node:crypto";

import {
  DeterministicOwnerProtectionService,
  OwnerInvariantViolationError,
  permissionCatalog,
  PersistentPermissionService,
  UnknownPermissionCatalogEntriesError,
  type PermissionAuditInput,
  type PermissionMutation,
  type OwnerProtectionService,
  type OwnerProtectionContext,
  type OwnerProtectionRequest,
  type PermissionPrincipal,
} from "@qbox/permissions";
import { PrismaClientFactory } from "@qbox/prisma";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  DatabaseConfiguration,
  InMemoryPermissionInvalidationBus,
  PermissionBootstrapService,
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
  new DeterministicOwnerProtectionService(),
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
      expect.objectContaining({
        target: expect.objectContaining({ assignmentId }),
      }),
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
        correlationId: randomUUID(),
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
        correlationId: randomUUID(),
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
        correlationId: randomUUID(),
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
    await principals.disable(userOne, operationContext());
    expect(await permissions.findActive()).toHaveLength(0);
    await principals.enable(userOne, operationContext());
    await guilds.disable(guildOne, operationContext());
    expect(await permissions.findActive()).toHaveLength(0);
    await guilds.enable(guildOne, operationContext());
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

  it("creates first and second persistent owners", async () => {
    await seedPrincipal();
    await permissions.applyMutation(
      ownerGrant(userOne),
      audit("set-assignment", { type: "platform" }),
    );
    const second = user("200000000000000002");
    await principals.getOrCreateDiscordPrincipal(second);
    await permissions.applyMutation(
      ownerGrant(second),
      auditFor(second, "set-assignment"),
    );
    expect(await permissions.countActiveOwners(new Date())).toBe(2);
  });

  it("rejects every assignment mutation that would remove the last owner", async () => {
    await seedPrincipal();
    const granted = await permissions.applyMutation(
      ownerGrant(userOne),
      audit("set-assignment", { type: "platform" }),
    );
    const assignmentId = required(granted.assignment?.id);
    const attempts: Array<[PermissionMutation, PermissionAuditInput]> = [
      [
        { ...revoke(assignmentId), correlationId: randomUUID() },
        audit("revoke-assignment", { type: "platform" }),
      ],
      [
        {
          type: "disable-assignment",
          actor: systemActor(),
          assignmentId,
          correlationId: randomUUID(),
          reasonCode: "administrator-action",
        },
        audit("disable-assignment", { type: "platform" }),
      ],
      [
        {
          type: "expire-assignment",
          actor: systemActor(),
          assignmentId,
          expiresAt: new Date(Date.now() + 60_000),
          correlationId: randomUUID(),
          reasonCode: "expiration",
        },
        audit("expire-assignment", { type: "platform" }),
      ],
    ];
    for (const [mutation, event] of attempts)
      await expect(
        permissions.applyMutation(mutation, event),
      ).rejects.toBeInstanceOf(OwnerInvariantViolationError);
    expect(await permissions.countActiveOwners(new Date())).toBe(1);
    expect(
      await client.permissionAuditEvent.count({
        where: { action: "OWNER_PROTECTION_REJECTION" },
      }),
    ).toBe(3);
  });

  it("protects the last owner from principal, guild, and definition disable", async () => {
    await seedPrincipal();
    await permissions.applyMutation(
      ownerGrant(userOne),
      audit("set-assignment", { type: "platform" }),
    );
    await expect(
      principals.disable(userOne, operationContext()),
    ).rejects.toBeInstanceOf(OwnerInvariantViolationError);
    await expect(
      guilds.disable(guildOne, operationContext()),
    ).rejects.toBeInstanceOf(OwnerInvariantViolationError);
    await expect(
      definitions.disable("platform.owner", operationContext()),
    ).rejects.toBeInstanceOf(OwnerInvariantViolationError);
    expect(await permissions.countActiveOwners(new Date())).toBe(1);
  });

  it("serializes concurrent owner revocations so one remains", async () => {
    await seedPrincipal();
    const second = user("200000000000000002");
    await principals.getOrCreateDiscordPrincipal(second);
    const firstGrant = await permissions.applyMutation(
      ownerGrant(userOne),
      auditFor(userOne, "set-assignment"),
    );
    const secondGrant = await permissions.applyMutation(
      ownerGrant(second),
      auditFor(second, "set-assignment"),
    );
    const results = await Promise.allSettled([
      permissions.applyMutation(
        {
          ...revoke(required(firstGrant.assignment?.id)),
          correlationId: randomUUID(),
        },
        auditFor(userOne, "revoke-assignment"),
      ),
      permissions.applyMutation(
        {
          ...revoke(required(secondGrant.assignment?.id)),
          correlationId: randomUUID(),
        },
        auditFor(second, "revoke-assignment"),
      ),
    ]);
    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(
      1,
    );
    expect(results.filter(({ status }) => status === "rejected")).toHaveLength(
      1,
    );
    expect(await permissions.countActiveOwners(new Date())).toBe(1);
  });

  it("bootstraps owners and legacy administrators idempotently", async () => {
    await synchronize();
    const bootstrap = new PermissionBootstrapService(
      guilds,
      principals,
      permissions,
      new PersistentPermissionService(permissions),
    );
    expect(
      (await bootstrap.applyOwner(guildOne, userOne.externalId))
        .createdAssignments,
    ).toBe(1);
    expect(
      (await bootstrap.applyOwner(guildOne, userOne.externalId))
        .createdAssignments,
    ).toBe(0);
    const roleId = "300000000000000001";
    expect(
      (await bootstrap.applyLegacyAdministrators(guildOne, [roleId]))
        .createdAssignments,
    ).toBe(1);
    expect(
      (await bootstrap.applyLegacyAdministrators(guildOne, [roleId]))
        .createdAssignments,
    ).toBe(0);
    expect(await permissions.findActive()).toHaveLength(2);
  });

  it("queries expired assignments historically without deleting them", async () => {
    await seedPrincipal();
    const expiresAt = new Date(Date.now() + 1_000);
    await permissions.applyMutation(
      { ...grant(), expiresAt },
      audit("set-assignment"),
    );
    expect(
      await permissions.findExpired(new Date(expiresAt.getTime() + 1_000)),
    ).toHaveLength(1);
    expect(await permissions.findHistorical()).toHaveLength(1);
    expect(await client.permissionAssignment.count()).toBe(1);
  });

  it("persists assignments across a disconnected client restart", async () => {
    await seedPrincipal();
    await permissions.applyMutation(grant(), audit("set-assignment"));
    const restarted = new PrismaClientFactory().create(configuration);
    await restarted.$connect();
    try {
      const repository = new PrismaPermissionRepository(
        restarted,
        new DeterministicOwnerProtectionService(),
      );
      await expect(repository.findHistorical()).resolves.toHaveLength(1);
    } finally {
      await restarted.$disconnect();
    }
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

function ownerGrant(
  target: PermissionPrincipal,
): Extract<PermissionMutation, { type: "set-assignment" }> {
  return {
    type: "set-assignment",
    actor: systemActor(),
    target,
    selector: { type: "permission", permission: "platform.owner" },
    scope: { type: "platform" },
    effect: "allow",
    correlationId: randomUUID(),
    reasonCode: "bootstrap",
  };
}

function user(externalId: string): PermissionPrincipal {
  return { type: "discord-user", externalId, guildId: guildOne };
}

function systemActor() {
  return { type: "system" as const, service: "repository-integration-test" };
}

function auditFor(
  target: PermissionPrincipal,
  action: PermissionAuditInput["action"],
): PermissionAuditInput {
  return { ...audit(action, { type: "platform" }), target };
}

function revoke(
  assignmentId: string,
): Extract<PermissionMutation, { type: "revoke-assignment" }> {
  return {
    type: "revoke-assignment",
    actor: { type: "system", service: "repository-integration-test" },
    assignmentId,
    correlationId: randomUUID(),
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
  public readonly requests: OwnerProtectionRequest[] = [];

  public async protect<TResult>(
    request: OwnerProtectionRequest,
    _context: OwnerProtectionContext,
    operation: () => Promise<TResult>,
  ): Promise<TResult> {
    this.requests.push(request);
    return operation();
  }
}

function operationContext() {
  return {
    actor: { type: "system" as const, service: "repository-integration-test" },
    correlationId: randomUUID(),
    reasonCode: "administrator-action" as const,
  };
}
