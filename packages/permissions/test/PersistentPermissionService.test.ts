import { describe, expect, it, vi } from "vitest";

import {
  InMemoryPermissionCache,
  InMemoryPermissionRepository,
  PersistentPermissionService,
} from "../src/index.js";
import type {
  PermissionAssignment,
  PermissionAuthorizationRequest,
  Permission,
  PermissionPrincipal,
  PermissionRepository,
  PermissionScope,
} from "../src/index.js";

const guildScope = (guildId = "guild-1"): PermissionScope => ({
  type: "discord-guild",
  guildId,
});
const user = (
  externalId = "user-1",
  guildId = "guild-1",
): PermissionPrincipal => ({ type: "discord-user", externalId, guildId });
const role = (
  externalId = "role-1",
  guildId = "guild-1",
): PermissionPrincipal => ({ type: "discord-role", externalId, guildId });
const assignment = (
  permission: Permission,
  overrides: Partial<PermissionAssignment> = {},
): PermissionAssignment => ({
  id: `assignment-${permission}`,
  principal: role(),
  selector: { type: "permission", permission },
  scope: guildScope(),
  effect: "allow",
  enabled: true,
  ...overrides,
});
const request = (
  overrides: Partial<PermissionAuthorizationRequest> = {},
): PermissionAuthorizationRequest => ({
  principals: [user(), role()],
  scope: guildScope(),
  required: ["moderation.warn"],
  mode: "all",
  administratorOverride: false,
  now: new Date("2026-01-01T00:00:00Z"),
  ...overrides,
});

describe("PersistentPermissionService authorization", () => {
  it("combines direct user and Discord role grants", async () => {
    const repository = new InMemoryPermissionRepository([
      assignment("moderation.warn"),
      assignment("moderation.kick", { id: "user-grant", principal: user() }),
    ]);
    const service = new PersistentPermissionService(repository);
    const decision = await service.authorize(
      request({ required: ["moderation.warn", "moderation.kick"] }),
    );
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("permissions-satisfied");
  });

  it("supports all and any evaluation deterministically", async () => {
    const service = new PersistentPermissionService(
      new InMemoryPermissionRepository([assignment("moderation.warn")]),
    );
    expect(
      (
        await service.authorize(
          request({
            required: ["moderation.warn", "moderation.kick"],
            mode: "all",
          }),
        )
      ).allowed,
    ).toBe(false);
    expect(
      (
        await service.authorize(
          request({
            required: ["moderation.warn", "moderation.kick"],
            mode: "any",
          }),
        )
      ).allowed,
    ).toBe(true);
  });

  it("keeps guild assignments isolated", async () => {
    const service = new PersistentPermissionService(
      new InMemoryPermissionRepository([assignment("moderation.warn")]),
    );
    const decision = await service.authorize(
      request({
        principals: [user("user-1", "guild-2")],
        scope: guildScope("guild-2"),
      }),
    );
    expect(decision.allowed).toBe(false);
  });

  it("fails closed for mismatched verified guild context", async () => {
    const service = new PersistentPermissionService(
      new InMemoryPermissionRepository(),
    );
    expect(
      await service.authorize(
        request({ principals: [user("user-1", "guild-2")] }),
      ),
    ).toMatchObject({ allowed: false, reason: "missing-guild-context" });
  });

  it("applies deny precedence over grants and administrator override", async () => {
    const service = new PersistentPermissionService(
      new InMemoryPermissionRepository([
        assignment("moderation.warn"),
        assignment("moderation.warn", {
          id: "deny",
          principal: user(),
          effect: "deny",
        }),
        assignment("platform.admin", { id: "admin" }),
        assignment("platform.admin", {
          id: "admin-deny",
          principal: user(),
          effect: "deny",
        }),
      ]),
    );
    const decision = await service.authorize(
      request({ administratorOverride: true }),
    );
    expect(decision.allowed).toBe(false);
    expect(decision.deniedPermissions).toEqual(
      expect.arrayContaining(["moderation.warn", "platform.admin"]),
    );
  });

  it("allows administrator override only when requested", async () => {
    const service = new PersistentPermissionService(
      new InMemoryPermissionRepository([assignment("platform.admin")]),
    );
    expect(
      (await service.authorize(request({ administratorOverride: false })))
        .allowed,
    ).toBe(false);
    expect(
      (await service.authorize(request({ administratorOverride: true })))
        .reason,
    ).toBe("administrator-override");
  });

  it("gives owner override precedence over ordinary denies", async () => {
    const service = new PersistentPermissionService(
      new InMemoryPermissionRepository([
        assignment("platform.owner", { scope: { type: "platform" } }),
        assignment("moderation.warn", { id: "deny", effect: "deny" }),
      ]),
    );
    expect((await service.authorize(request())).reason).toBe("owner-override");
  });

  it("ignores disabled and expired assignments", async () => {
    const service = new PersistentPermissionService(
      new InMemoryPermissionRepository([
        assignment("moderation.warn", { enabled: false }),
        assignment("moderation.warn", {
          id: "expired",
          expiresAt: new Date("2025-01-01T00:00:00Z"),
        }),
      ]),
    );
    expect((await service.authorize(request())).allowed).toBe(false);
  });

  it("uses active legacy assignments without persisting them", async () => {
    const service = new PersistentPermissionService(
      new InMemoryPermissionRepository(),
      undefined,
      {
        legacyAssignments: [assignment("platform.admin")],
      },
    );
    expect(
      (await service.authorize(request({ administratorOverride: true })))
        .reason,
    ).toBe("administrator-override");
  });

  it("rejects reserved permission groups without wildcard evaluation", async () => {
    const grouped: PermissionAssignment = {
      ...assignment("moderation.warn"),
      selector: { type: "group", group: "staff.*" },
    };
    const service = new PersistentPermissionService(
      new InMemoryPermissionRepository([grouped]),
    );
    expect((await service.authorize(request())).reason).toBe(
      "unsupported-permission-group",
    );
  });

  it("uses and expires cache snapshots", async () => {
    const repository = new InMemoryPermissionRepository([
      assignment("moderation.warn"),
    ]);
    const find = vi.spyOn(repository, "findAssignments");
    const service = new PersistentPermissionService(
      repository,
      new InMemoryPermissionCache(),
      { cacheTtlMs: 100 },
    );
    await service.authorize(request());
    expect((await service.authorize(request())).usedCache).toBe(true);
    await service.authorize(request({ now: new Date("2026-01-01T00:00:01Z") }));
    expect(find).toHaveBeenCalledTimes(4);
  });

  it("falls back after cache failure and fails closed after repository failure", async () => {
    const repository = new InMemoryPermissionRepository([
      assignment("moderation.warn"),
    ]);
    const cache = {
      get: vi.fn().mockRejectedValue(new Error("cache")),
      set: vi.fn(),
      invalidate: vi.fn(),
    };
    expect(
      (
        await new PersistentPermissionService(repository, cache).authorize(
          request(),
        )
      ).allowed,
    ).toBe(true);
    const failedRepository = {
      ...repository,
      findAssignments: vi.fn().mockRejectedValue(new Error("database")),
    } as unknown as PermissionRepository;
    expect(
      await new PersistentPermissionService(failedRepository).authorize(
        request(),
      ),
    ).toMatchObject({
      allowed: false,
      reason: "repository-unavailable",
      degraded: true,
    });
  });
});

describe("PersistentPermissionService mutations", () => {
  it("requires structured reasons, prevents self-elevation, and validates expiry", async () => {
    const service = new PersistentPermissionService(
      new InMemoryPermissionRepository(),
    );
    const base = {
      type: "set-assignment" as const,
      actor: { type: "principal" as const, principal: user() },
      target: user(),
      selector: {
        type: "permission" as const,
        permission: "platform.admin" as const,
      },
      scope: guildScope(),
      effect: "allow" as const,
      reasonCode: "administrator-action" as const,
      correlationId: "privileged-mutation-test",
    };
    await expect(service.mutate(base)).rejects.toThrow("cannot grant elevated");
    await expect(
      service.mutate({
        ...base,
        target: user("user-2"),
        expiresAt: new Date(0),
      }),
    ).rejects.toThrow("future");
    await expect(
      service.mutate({ ...base, target: user("user-2"), reason: " " }),
    ).rejects.toThrow("cannot be blank");
  });

  it("commits audit reason codes and invalidates affected scope", async () => {
    const repository = new InMemoryPermissionRepository();
    const cache = new InMemoryPermissionCache();
    const invalidate = vi.spyOn(cache, "invalidate");
    const service = new PersistentPermissionService(repository, cache);
    await service.mutate({
      type: "set-assignment",
      actor: { type: "system", service: "bootstrap" },
      target: role(),
      selector: { type: "permission", permission: "platform.admin" },
      scope: guildScope(),
      effect: "allow",
      reasonCode: "bootstrap",
      reason: "Initial administrator role",
      correlationId: "interaction-123",
    });
    expect(repository.audits[0]).toMatchObject({
      reasonCode: "bootstrap",
      reason: "Initial administrator role",
      correlationId: "interaction-123",
    });
    expect(invalidate).toHaveBeenCalledWith([guildScope()]);
  });

  it("rejects an ordinary administrator attempting to grant owner", async () => {
    const administrator = user("administrator");
    const repository = new InMemoryPermissionRepository([
      assignment("platform.admin", { principal: administrator }),
    ]);
    const service = new PersistentPermissionService(repository);
    await expect(
      service.mutate({
        type: "set-assignment",
        actor: { type: "principal", principal: administrator },
        target: user("owner-candidate"),
        selector: { type: "permission", permission: "platform.owner" },
        scope: { type: "platform" },
        effect: "allow",
        correlationId: "ordinary-admin-owner-attempt",
        reasonCode: "administrator-action",
      }),
    ).rejects.toThrow("Only an active owner");
    expect(repository.audits.at(-1)?.action).toBe("owner-protection-rejection");
  });

  it("delegates owner revocation to the repository transaction boundary", async () => {
    const owner = assignment("platform.owner", {
      id: "owner",
      scope: { type: "platform" },
    });
    const unrelated = assignment("moderation.warn", { id: "warn" });
    const repository = new InMemoryPermissionRepository([owner, unrelated]);
    const service = new PersistentPermissionService(repository);
    const actor = { type: "system" as const, service: "test" };
    await expect(
      service.mutate({
        type: "revoke-assignment",
        actor,
        assignmentId: "owner",
        correlationId: "owner-revoke",
        reasonCode: "administrator-action",
      }),
    ).resolves.toBeDefined();
    await expect(
      service.mutate({
        type: "revoke-assignment",
        actor,
        assignmentId: "warn",
        correlationId: "warn-revoke",
        reasonCode: "administrator-action",
      }),
    ).resolves.toBeDefined();
  });

  it("rejects group assignment mutations until groups are implemented", async () => {
    const service = new PersistentPermissionService(
      new InMemoryPermissionRepository(),
    );
    await expect(
      service.mutate({
        type: "set-assignment",
        actor: { type: "system", service: "test" },
        target: role(),
        selector: { type: "group", group: "staff.*" },
        scope: guildScope(),
        effect: "allow",
        reasonCode: "system-maintenance",
      }),
    ).rejects.toThrow("not implemented");
  });
});

describe("InMemoryPermissionCache expiry", () => {
  it("forgets entries after the configured time so other processes' changes apply", async () => {
    let now = 1_000;
    const cache = new InMemoryPermissionCache({ ttlMs: 60_000, now: () => now });
    const key = { scope: { type: "platform" as const }, principals: [] };
    const value = { assignments: [], loadedAt: new Date(0) } as never;
    await cache.set(key as never, value);
    expect(await cache.get(key as never)).toBe(value);
    now += 59_999;
    expect(await cache.get(key as never)).toBe(value);
    now += 1;
    expect(await cache.get(key as never)).toBeUndefined();
  });
});
