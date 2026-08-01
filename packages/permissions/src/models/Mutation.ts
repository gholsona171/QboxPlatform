import type {
  PermissionAssignment,
  PermissionPrincipal,
  PermissionScope,
  PermissionSelector,
  PermissionEffect,
} from "./Permission.js";

/** Closed catalog of structured reasons accepted for mutations and audit records. */
export const PERMISSION_MUTATION_REASON_CODES = [
  "bootstrap",
  "administrator-action",
  "security-response",
  "role-synchronization",
  "migration",
  "expiration",
  "system-maintenance",
] as const;

/** Required structured reason for every mutation and audit record. */
export type PermissionMutationReasonCode =
  (typeof PERMISSION_MUTATION_REASON_CODES)[number];

/** Verified actor; system actors are restricted to trusted process composition. */
export type PermissionMutationActor =
  | { readonly type: "principal"; readonly principal: PermissionPrincipal }
  | { readonly type: "system"; readonly service: string };

/** Common, mandatory audit explanation attached to a mutation. */
export interface PermissionMutationReason {
  /** Optional upstream trace identifier; the service generates one when absent. */
  readonly correlationId?: string;
  readonly reasonCode: PermissionMutationReasonCode;
  readonly reason?: string;
}

/**
 * Create or replace an assignment through the repository transaction boundary.
 * The actor must already be verified, reasonCode is mandatory, and adapters must
 * commit this mutation with its audit record atomically under concurrent use.
 */
export interface SetPermissionAssignmentMutation extends PermissionMutationReason {
  readonly type: "set-assignment";
  readonly actor: PermissionMutationActor;
  readonly target: PermissionPrincipal;
  readonly selector: PermissionSelector;
  readonly scope: PermissionScope;
  readonly effect: PermissionEffect;
  readonly expiresAt?: Date;
}

/**
 * Revoke an existing assignment without deleting its audit history.
 * Repository adapters preserve append-only audit data and enforce process-safe
 * transaction semantics; future revocation modes extend the mutation union.
 */
export interface RevokePermissionAssignmentMutation extends PermissionMutationReason {
  readonly type: "revoke-assignment";
  readonly actor: PermissionMutationActor;
  readonly assignmentId: string;
}

/** Mutation union designed for future mutation kinds without persistence leakage. */
export type PermissionMutation =
  SetPermissionAssignmentMutation | RevokePermissionAssignmentMutation;

/**
 * Append-only audit input written atomically with a mutation by a repository.
 * Callers never supply authoritative before/after snapshots. Repository adapters
 * own persistence lifecycle, tamper controls, and concurrent transaction safety.
 */
export interface PermissionAuditInput extends PermissionMutationReason {
  /** Cross-system request identifier used to trace one mutation safely. */
  readonly correlationId: string;
  readonly action: PermissionMutation["type"];
  readonly actor: PermissionMutationActor;
  readonly target?: PermissionPrincipal;
  readonly scope?: PermissionScope;
  readonly occurredAt: Date;
}

/** Authoritative repository result after mutation and audit commit. */
export interface PermissionMutationResult {
  readonly assignment?: PermissionAssignment;
  readonly affectedScopes: readonly PermissionScope[];
}

/** Domain mutation outcome exposing cache consistency to process-level logging. */
export interface PermissionMutationOutcome {
  readonly result: PermissionMutationResult;
  readonly cacheInvalidated: boolean;
}
