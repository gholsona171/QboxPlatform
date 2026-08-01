import type {
  Permission,
  PermissionGrant,
  PermissionSubject,
} from "./models/Permission.js";

/**
 * Legacy synchronous role-grant service used by the current Discord adapter.
 *
 * State is process-local and must be rebuilt on startup. It is intentionally
 * retained through Phase 1 and will be replaced at the integration boundary in
 * Phase 2; new cross-system consumers should use PersistentPermissionService.
 *
 * @deprecated Use the injected asynchronous PermissionAuthorizer contract.
 */
export class PermissionService {
  private readonly grants = new Map<string, Set<Permission>>();

  public registerGrant(grant: PermissionGrant): void {
    const permissions = this.grants.get(grant.roleId) ?? new Set<Permission>();

    for (const permission of grant.permissions) {
      permissions.add(permission);
    }

    this.grants.set(grant.roleId, permissions);
  }

  public hasPermission(
    subject: PermissionSubject,
    permission: Permission,
  ): boolean {
    return subject.roleIds.some(
      (roleId) => this.grants.get(roleId)?.has(permission) ?? false,
    );
  }

  public hasEveryPermission(
    subject: PermissionSubject,
    permissions: readonly Permission[],
  ): boolean {
    return permissions.every((permission) =>
      this.hasPermission(subject, permission),
    );
  }

  public hasAnyPermission(
    subject: PermissionSubject,
    permissions: readonly Permission[],
  ): boolean {
    return permissions.some((permission) =>
      this.hasPermission(subject, permission),
    );
  }

  public clear(): void {
    this.grants.clear();
  }
}

/** Process-local legacy singleton retained for current Discord compatibility. */
export const permissions = new PermissionService();

export * from "./catalog/PermissionCatalog.js";
export * from "./compatibility/LegacyAdministratorAssignments.js";
export * from "./contracts/PermissionCache.js";
export * from "./contracts/PermissionRepository.js";
export * from "./models/Authorization.js";
export * from "./models/Permission.js";
export * from "./models/Mutation.js";
export * from "./PersistentPermissionService.js";
export * from "./PermissionRuntime.js";
export * from "./testing/InMemoryPermissionAdapters.js";
