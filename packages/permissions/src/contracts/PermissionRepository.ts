import type {
  PermissionAssignment,
  PermissionPrincipal,
  PermissionScope,
} from "../models/Permission.js";
import type {
  PermissionAuditInput,
  PermissionMutation,
  PermissionMutationResult,
} from "../models/Mutation.js";

/** Query for all assignments that may affect principals in one scope. */
export interface PermissionAssignmentQuery {
  readonly principals: readonly PermissionPrincipal[];
  readonly scope: PermissionScope;
}

/**
 * Persistence port for permission domain data.
 *
 * Implementations own transactions and process-safe concurrency. The domain
 * assumes mutations and audit writes commit atomically. Prisma is intentionally
 * absent from this contract and will be supplied by a future adapter.
 */
export interface PermissionRepository {
  findAssignments(
    query: PermissionAssignmentQuery,
  ): Promise<readonly PermissionAssignment[]>;
  findAssignment(
    assignmentId: string,
  ): Promise<PermissionAssignment | undefined>;
  applyMutation(
    mutation: PermissionMutation,
    audit: PermissionAuditInput,
  ): Promise<PermissionMutationResult>;
  countActiveOwners(now: Date): Promise<number>;
  isActiveOwner(principal: PermissionPrincipal, now: Date): Promise<boolean>;
  recordRejectedMutation(
    mutation: PermissionMutation,
    audit: PermissionAuditInput,
    errorCode: string,
  ): Promise<void>;
}
