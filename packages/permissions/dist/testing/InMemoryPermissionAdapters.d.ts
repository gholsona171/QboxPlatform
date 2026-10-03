import type { CachedPermissionAssignments, PermissionCache, PermissionCacheKey } from "../contracts/PermissionCache.js";
import type { PermissionAssignmentQuery, PermissionRepository } from "../contracts/PermissionRepository.js";
import type { PermissionAssignment, PermissionPrincipal, PermissionScope } from "../models/Permission.js";
import type { PermissionAuditInput, PermissionMutation, PermissionMutationResult } from "../models/Mutation.js";
/**
 * Deterministic repository adapter for unit tests and local domain composition.
 *
 * It is process-local, owns no resources, and is not suitable for production or
 * cross-process synchronization. Future persistence adapters implement the same port.
 */
export declare class InMemoryPermissionRepository implements PermissionRepository {
    readonly audits: PermissionAuditInput[];
    private readonly assignments;
    private nextId;
    constructor(seed?: readonly PermissionAssignment[]);
    findAssignments(query: PermissionAssignmentQuery): Promise<readonly PermissionAssignment[]>;
    findAssignment(assignmentId: string): Promise<PermissionAssignment | undefined>;
    applyMutation(mutation: PermissionMutation, audit: PermissionAuditInput): Promise<PermissionMutationResult>;
    countActiveOwners(now: Date): Promise<number>;
    isActiveOwner(principal: PermissionPrincipal, now: Date): Promise<boolean>;
    recordRejectedMutation(_mutation: PermissionMutation, audit: PermissionAuditInput, _errorCode: string): Promise<void>;
    private sameScope;
}
/** How long the bot and API trust cached permission lookups before rereading the database. */
export declare const PERMISSION_CACHE_TTL_MS = 60000;
/**
 * Process-local permission cache.
 *
 * Entries are isolated by serialized principal and scope identity. It owns no
 * resources and provides no cross-process invalidation, so processes that
 * share a database (bot, API, operator CLI) pass `ttlMs` to pick up changes
 * made elsewhere. Without it, entries live until invalidated.
 */
export declare class InMemoryPermissionCache implements PermissionCache {
    private readonly values;
    private readonly ttlMs;
    private readonly now;
    constructor(options?: {
        readonly ttlMs?: number;
        readonly now?: () => number;
    });
    get(key: PermissionCacheKey): Promise<CachedPermissionAssignments | undefined>;
    set(key: PermissionCacheKey, value: CachedPermissionAssignments): Promise<void>;
    invalidate(scopes: readonly PermissionScope[]): Promise<void>;
    private key;
    private scopeKey;
}
//# sourceMappingURL=InMemoryPermissionAdapters.d.ts.map