import {
  assertCompatibilityCanBeDisabled,
  CompatibilityDisableGuardError,
  DeterministicOwnerProtectionService,
  OwnerInvariantViolationError,
  type OwnerProtectionContext,
  type PermissionAssignment,
} from "../src/index.js";
import { describe, expect, it, vi } from "vitest";

const now = new Date("2026-07-31T00:00:00.000Z");

describe("DeterministicOwnerProtectionService", () => {
  it("locks and rejects removal of the last active owner", async () => {
    const operation = vi.fn(async () => undefined);
    await expect(
      new DeterministicOwnerProtectionService().protect(
        {
          target: { type: "assignment", assignmentId: "owner-1" },
          now,
        },
        context([owner("owner-1")]),
        operation,
      ),
    ).rejects.toBeInstanceOf(OwnerInvariantViolationError);
    expect(operation).not.toHaveBeenCalled();
  });

  it("allows removal when another active owner remains", async () => {
    const operation = vi.fn(async () => "committed");
    await expect(
      new DeterministicOwnerProtectionService().protect(
        {
          target: { type: "assignment", assignmentId: "owner-1" },
          now,
        },
        context([owner("owner-1"), owner("owner-2", "user-2")]),
        operation,
      ),
    ).resolves.toBe("committed");
  });

  it("rejects expiration when no owner survives the requested instant", async () => {
    await expect(
      new DeterministicOwnerProtectionService().protect(
        {
          target: {
            type: "assignment",
            assignmentId: "owner-1",
            expiresAt: new Date("2027-01-01T00:00:00.000Z"),
          },
          now,
        },
        context([
          owner("owner-1"),
          owner("owner-2", "user-2", new Date("2026-12-01T00:00:00.000Z")),
        ]),
        async () => undefined,
      ),
    ).rejects.toBeInstanceOf(OwnerInvariantViolationError);
  });
});

describe("compatibility disable guard", () => {
  it("requires both an owner and administrator recovery path", () => {
    expect(() => assertCompatibilityCanBeDisabled(0, 1)).toThrow(
      CompatibilityDisableGuardError,
    );
    expect(() => assertCompatibilityCanBeDisabled(1, 0)).toThrow(
      CompatibilityDisableGuardError,
    );
    expect(() => assertCompatibilityCanBeDisabled(1, 1)).not.toThrow();
  });
});

function context(
  owners: readonly PermissionAssignment[],
): OwnerProtectionContext {
  return {
    acquireMutationLock: vi.fn(async () => undefined),
    loadActiveOwners: vi.fn(async () => owners),
  };
}

function owner(
  id: string,
  externalId = "user-1",
  expiresAt?: Date,
): PermissionAssignment {
  return {
    id,
    principal: { type: "discord-user", externalId, guildId: "guild-1" },
    selector: { type: "permission", permission: "platform.owner" },
    scope: { type: "platform" },
    effect: "allow",
    enabled: true,
    ...(expiresAt ? { expiresAt } : {}),
  };
}
