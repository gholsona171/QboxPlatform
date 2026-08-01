import type {
  PermissionAssignment,
  PermissionPrincipal,
} from "../models/Permission.js";

/** Infrastructure mutation that may invalidate one or more platform owners. */
export type OwnerMutationTarget =
  | {
      readonly type: "assignment";
      readonly assignmentId: string;
      readonly expiresAt?: Date;
    }
  | { readonly type: "principal"; readonly principal: PermissionPrincipal }
  | { readonly type: "guild"; readonly guildId: string }
  | {
      readonly type: "permission-definition";
      readonly permission: "platform.owner";
    };

/** Protection request evaluated against a locked owner snapshot. */
export interface OwnerProtectionRequest {
  readonly target: OwnerMutationTarget;
  readonly now: Date;
}

/** Transaction callbacks supplied by a persistence adapter without leaking its ORM. */
export interface OwnerProtectionContext {
  acquireMutationLock(): Promise<void>;
  loadActiveOwners(now: Date): Promise<readonly PermissionAssignment[]>;
}

/** Stable typed failure returned when a mutation would violate owner recovery. */
export class OwnerInvariantViolationError extends Error {
  public readonly code = "last-owner-protection";

  public constructor(
    message = "The mutation would remove the last active platform owner.",
  ) {
    super(message);
    this.name = "OwnerInvariantViolationError";
  }
}

/**
 * Transaction-scoped owner protection port.
 *
 * Phase 4 deliberately supplies a pass-through implementation. Phase 5 will
 * execute the operation only after locking active platform-owner assignment
 * rows in the same database transaction and verifying that one owner remains.
 */
export interface OwnerProtectionService {
  protect<TResult>(
    request: OwnerProtectionRequest,
    context: OwnerProtectionContext,
    operation: () => Promise<TResult>,
  ): Promise<TResult>;
}

/** Deterministic owner invariant evaluated after the adapter acquires its lock. */
export class DeterministicOwnerProtectionService implements OwnerProtectionService {
  public async protect<TResult>(
    request: OwnerProtectionRequest,
    context: OwnerProtectionContext,
    operation: () => Promise<TResult>,
  ): Promise<TResult> {
    await context.acquireMutationLock();
    const owners = await context.loadActiveOwners(request.now);
    if (this.invalidatesLastOwner(request, owners))
      throw new OwnerInvariantViolationError();
    return operation();
  }

  private invalidatesLastOwner(
    request: OwnerProtectionRequest,
    owners: readonly PermissionAssignment[],
  ): boolean {
    if (request.target.type === "permission-definition") return true;
    const target = request.target;
    if (
      target.type === "assignment" &&
      !owners.some((owner) => owner.id === target.assignmentId)
    )
      return false;
    const unaffected = owners.filter((owner) => {
      if (target.type === "assignment") return owner.id !== target.assignmentId;
      if (target.type === "principal")
        return !samePrincipal(owner.principal, target.principal);
      if (target.type === "guild")
        return owner.principal.guildId !== target.guildId;
      return false;
    });
    if (target.type === "assignment" && target.expiresAt) {
      return !unaffected.some(
        (owner) => !owner.expiresAt || owner.expiresAt > target.expiresAt!,
      );
    }
    return unaffected.length === 0 && owners.length > 0;
  }
}

function samePrincipal(
  left: PermissionPrincipal,
  right: PermissionPrincipal,
): boolean {
  return (
    left.type === right.type &&
    left.externalId === right.externalId &&
    left.guildId === right.guildId
  );
}
