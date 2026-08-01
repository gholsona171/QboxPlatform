import type {
  CachedPermissionAssignments,
  PermissionCache,
  PermissionCacheKey,
} from "../contracts/PermissionCache.js";
import type {
  PermissionAssignmentQuery,
  PermissionRepository,
} from "../contracts/PermissionRepository.js";
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

/**
 * Deterministic repository adapter for unit tests and local domain composition.
 *
 * It is process-local, owns no resources, and is not suitable for production or
 * cross-process synchronization. Future persistence adapters implement the same port.
 */
export class InMemoryPermissionRepository implements PermissionRepository {
  public readonly audits: PermissionAuditInput[] = [];
  private readonly assignments = new Map<string, PermissionAssignment>();
  private nextId = 1;

  public constructor(seed: readonly PermissionAssignment[] = []) {
    for (const assignment of seed)
      this.assignments.set(assignment.id, assignment);
  }

  public async findAssignments(
    query: PermissionAssignmentQuery,
  ): Promise<readonly PermissionAssignment[]> {
    return [...this.assignments.values()].filter(
      (assignment) =>
        query.principals.some(
          (principal) =>
            principal.type === assignment.principal.type &&
            principal.externalId === assignment.principal.externalId &&
            principal.guildId === assignment.principal.guildId,
        ) && this.sameScope(query.scope, assignment.scope),
    );
  }

  public async findAssignment(
    assignmentId: string,
  ): Promise<PermissionAssignment | undefined> {
    return this.assignments.get(assignmentId);
  }

  public async applyMutation(
    mutation: PermissionMutation,
    audit: PermissionAuditInput,
  ): Promise<PermissionMutationResult> {
    this.audits.push(audit);
    if (
      mutation.type === "revoke-assignment" ||
      mutation.type === "disable-assignment"
    ) {
      const assignment = this.assignments.get(mutation.assignmentId);
      if (!assignment) return { affectedScopes: [] };
      this.assignments.set(mutation.assignmentId, {
        ...assignment,
        enabled: false,
      });
      return { affectedScopes: [assignment.scope] };
    }
    if (mutation.type === "enable-assignment") {
      const assignment = this.assignments.get(mutation.assignmentId);
      if (!assignment) return { affectedScopes: [] };
      const enabled = { ...assignment, enabled: true };
      this.assignments.set(mutation.assignmentId, enabled);
      return { assignment: enabled, affectedScopes: [assignment.scope] };
    }
    if (mutation.type === "expire-assignment") {
      const assignment = this.assignments.get(mutation.assignmentId);
      if (!assignment) return { affectedScopes: [] };
      const expired = { ...assignment, expiresAt: mutation.expiresAt };
      this.assignments.set(mutation.assignmentId, expired);
      return { assignment: expired, affectedScopes: [assignment.scope] };
    }
    const assignment: PermissionAssignment = {
      id: `assignment-${this.nextId++}`,
      principal: mutation.target,
      selector: mutation.selector,
      scope: mutation.scope,
      effect: mutation.effect,
      enabled: true,
      ...(mutation.expiresAt === undefined
        ? {}
        : { expiresAt: mutation.expiresAt }),
    };
    this.assignments.set(assignment.id, assignment);
    return { assignment, affectedScopes: [assignment.scope] };
  }

  public async countActiveOwners(now: Date): Promise<number> {
    return [...this.assignments.values()].filter(
      (assignment) =>
        assignment.enabled &&
        (!assignment.expiresAt || assignment.expiresAt > now) &&
        assignment.effect === "allow" &&
        assignment.selector.type === "permission" &&
        assignment.selector.permission === "platform.owner",
    ).length;
  }

  public async isActiveOwner(
    principal: PermissionPrincipal,
    now: Date,
  ): Promise<boolean> {
    return [...this.assignments.values()].some(
      (assignment) =>
        assignment.enabled &&
        (!assignment.expiresAt || assignment.expiresAt > now) &&
        assignment.effect === "allow" &&
        assignment.scope.type === "platform" &&
        assignment.selector.type === "permission" &&
        assignment.selector.permission === "platform.owner" &&
        assignment.principal.type === principal.type &&
        assignment.principal.externalId === principal.externalId &&
        assignment.principal.guildId === principal.guildId,
    );
  }

  public async recordRejectedMutation(
    _mutation: PermissionMutation,
    audit: PermissionAuditInput,
    _errorCode: string,
  ): Promise<void> {
    this.audits.push({ ...audit, action: "owner-protection-rejection" });
  }

  private sameScope(left: PermissionScope, right: PermissionScope): boolean {
    return (
      left.type === right.type &&
      (left.type === "platform" ||
        (right.type === "discord-guild" && left.guildId === right.guildId))
    );
  }
}

/**
 * Process-local cache adapter for deterministic tests.
 *
 * Entries are isolated by serialized principal and scope identity. It owns no
 * resources and provides no cross-process invalidation guarantees.
 */
export class InMemoryPermissionCache implements PermissionCache {
  private readonly values = new Map<string, CachedPermissionAssignments>();

  public async get(
    key: PermissionCacheKey,
  ): Promise<CachedPermissionAssignments | undefined> {
    return this.values.get(this.key(key));
  }

  public async set(
    key: PermissionCacheKey,
    value: CachedPermissionAssignments,
  ): Promise<void> {
    this.values.set(this.key(key), value);
  }

  public async invalidate(scopes: readonly PermissionScope[]): Promise<void> {
    for (const [key] of this.values) {
      if (scopes.some((scope) => key.includes(this.scopeKey(scope))))
        this.values.delete(key);
    }
  }

  private key(key: PermissionCacheKey): string {
    const principals = [...key.principals]
      .map(
        (principal) =>
          `${principal.type}:${principal.guildId}:${principal.externalId}`,
      )
      .sort()
      .join("|");
    return `${this.scopeKey(key.scope)}::${principals}`;
  }

  private scopeKey(scope: PermissionScope): string {
    return scope.type === "platform"
      ? "platform"
      : `discord-guild:${scope.guildId}`;
  }
}
