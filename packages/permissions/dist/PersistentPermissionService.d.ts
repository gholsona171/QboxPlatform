import type { PermissionCache } from "./contracts/PermissionCache.js";
import type { PermissionRepository } from "./contracts/PermissionRepository.js";
import type { PermissionAuthorizer, PermissionAuthorizationDecision, PermissionAuthorizationRequest } from "./models/Authorization.js";
import type { PermissionAssignment } from "./models/Permission.js";
import type { PermissionMutation, PermissionMutationOutcome } from "./models/Mutation.js";
/**
 * Configuration for bounded cache snapshots and compatibility assignments.
 * Values are consumed at construction and must not be mutated afterward. Cache
 * implementations own process/distributed lifecycle; future options stay additive.
 */
export interface PersistentPermissionServiceOptions {
    readonly cacheTtlMs?: number;
    readonly legacyAssignments?: readonly PermissionAssignment[];
}
/** Typed rejection for trusted-context and privileged mutation violations. */
export declare class PermissionMutationAuthorizationError extends Error {
    readonly code = "permission-mutation-not-authorized";
    constructor(message: string);
}
/**
 * Pure application-domain authorization and mutation coordinator.
 *
 * Instances are safe to share within one process when injected repository and
 * cache adapters satisfy their own concurrency contracts. The service owns no
 * external resources; adapter lifecycle remains with process composition.
 */
export declare class PersistentPermissionService implements PermissionAuthorizer {
    private readonly repository;
    private readonly cache?;
    private readonly cacheTtlMs;
    private readonly legacyAssignments;
    constructor(repository: PermissionRepository, cache?: PermissionCache | undefined, options?: PersistentPermissionServiceOptions);
    /** Evaluates exact permissions with deterministic owner, deny, and admin precedence. */
    authorize(request: PermissionAuthorizationRequest): Promise<PermissionAuthorizationDecision>;
    /** Validates, commits, audits, and invalidates one permission mutation. */
    mutate(mutation: PermissionMutation, now?: Date): Promise<PermissionMutationOutcome>;
    private loadAssignments;
    private loadAssignmentsForScope;
    private isApplicable;
    private permissionsFor;
    private samePrincipal;
    private sameScope;
    private validateRequest;
    private validateMutation;
    private isPrivilegedMutation;
    private decision;
}
//# sourceMappingURL=PersistentPermissionService.d.ts.map