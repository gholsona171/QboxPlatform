import type { PermissionAssignment, PermissionPrincipal } from "../models/Permission.js";
/** Infrastructure mutation that may invalidate one or more platform owners. */
export type OwnerMutationTarget = {
    readonly type: "assignment";
    readonly assignmentId: string;
    readonly expiresAt?: Date;
} | {
    readonly type: "principal";
    readonly principal: PermissionPrincipal;
} | {
    readonly type: "guild";
    readonly guildId: string;
} | {
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
export declare class OwnerInvariantViolationError extends Error {
    readonly code = "last-owner-protection";
    constructor(message?: string);
}
/**
 * Transaction-scoped owner protection port.
 *
 * Phase 4 deliberately supplies a pass-through implementation. Phase 5 will
 * execute the operation only after locking active platform-owner assignment
 * rows in the same database transaction and verifying that one owner remains.
 */
export interface OwnerProtectionService {
    protect<TResult>(request: OwnerProtectionRequest, context: OwnerProtectionContext, operation: () => Promise<TResult>): Promise<TResult>;
}
/** Deterministic owner invariant evaluated after the adapter acquires its lock. */
export declare class DeterministicOwnerProtectionService implements OwnerProtectionService {
    protect<TResult>(request: OwnerProtectionRequest, context: OwnerProtectionContext, operation: () => Promise<TResult>): Promise<TResult>;
    private invalidatesLastOwner;
}
//# sourceMappingURL=OwnerProtectionService.d.ts.map