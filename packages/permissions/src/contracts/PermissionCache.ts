import type {
  PermissionAssignment,
  PermissionPrincipal,
  PermissionScope,
} from "../models/Permission.js";

/** Scope- and identity-complete cache key preventing cross-guild leakage. */
export interface PermissionCacheKey {
  readonly principals: readonly PermissionPrincipal[];
  readonly scope: PermissionScope;
}

/** Cached assignment snapshot with an explicit expiry controlled by adapters. */
export interface CachedPermissionAssignments {
  readonly assignments: readonly PermissionAssignment[];
  readonly expiresAt: Date;
}

/**
 * Optional cache port for permission lookups.
 *
 * Implementations may be process-local now and distributed later. They contain
 * no authorization logic, must isolate complete keys, and must tolerate repeated
 * invalidation. Process synchronization is an adapter responsibility.
 */
export interface PermissionCache {
  get(
    key: PermissionCacheKey,
  ): Promise<CachedPermissionAssignments | undefined>;
  set(
    key: PermissionCacheKey,
    value: CachedPermissionAssignments,
  ): Promise<void>;
  invalidate(scopes: readonly PermissionScope[]): Promise<void>;
  close?(): Promise<void>;
}

/** Cache-invalidation message emitted after a committed permission mutation. */
export interface PermissionCacheInvalidationEvent {
  readonly scopes: readonly PermissionScope[];
  readonly occurredAt: Date;
  readonly correlationId?: string;
}

/** Publisher boundary supporting process-local now and distributed events later. */
export interface PermissionCacheInvalidationPublisher {
  publish(event: PermissionCacheInvalidationEvent): Promise<void>;
}

/** Subscription boundary used by cache adapters without transport coupling. */
export interface PermissionCacheInvalidationSubscriber {
  subscribe(
    listener: (event: PermissionCacheInvalidationEvent) => Promise<void>,
  ): () => void;
}
