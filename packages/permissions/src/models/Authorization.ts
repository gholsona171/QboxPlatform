import type { Permission } from "../catalog/PermissionCatalog.js";
import type { PermissionPrincipal, PermissionScope } from "./Permission.js";

/** Evaluation mode matching command policy semantics. */
export type PermissionEvaluationMode = "all" | "any";

/**
 * Immutable request evaluated by the persistent permission domain service.
 * Principals must be verified by the calling adapter and agree with guild scope.
 * Requests contain no process state and may be evaluated concurrently; future
 * consumers can add principal/scope variants without integration dependencies.
 */
export interface PermissionAuthorizationRequest {
  readonly principals: readonly PermissionPrincipal[];
  readonly scope: PermissionScope;
  readonly required: readonly Permission[];
  readonly mode: PermissionEvaluationMode;
  readonly administratorOverride: boolean;
  readonly now?: Date;
}

/** Stable machine-readable authorization outcome for logs, metrics, and consumers. */
export type PermissionDecisionReason =
  | "no-permissions-required"
  | "owner-override"
  | "administrator-override"
  | "permissions-satisfied"
  | "permission-denied"
  | "missing-guild-context"
  | "invalid-permission-data"
  | "unsupported-permission-group"
  | "repository-unavailable";

/**
 * Result of an authorization check; it never exposes persistence internals.
 * Decisions are immutable point-in-time values suitable for structured logs and
 * metrics. They carry cache/degraded state for process-level observability.
 */
export interface PermissionAuthorizationDecision {
  readonly allowed: boolean;
  readonly reason: PermissionDecisionReason;
  readonly effectivePermissions: readonly Permission[];
  readonly deniedPermissions: readonly Permission[];
  readonly usedCache: boolean;
  readonly degraded: boolean;
}

/**
 * Integration-facing asynchronous authorization port.
 * Implementations must be safe for concurrent calls and fail closed through a
 * denied decision when authoritative state cannot be loaded.
 */
export interface PermissionAuthorizer {
  authorize(
    request: PermissionAuthorizationRequest,
  ): Promise<PermissionAuthorizationDecision>;
}
