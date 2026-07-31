import type {
  Permission,
  PermissionGrant,
  PermissionSubject
} from "./models/Permission.js";

export class PermissionService {
  private readonly grants = new Map<
    string,
    Set<Permission>
  >();

  public registerGrant(grant: PermissionGrant): void {
    const permissions =
      this.grants.get(grant.roleId) ??
      new Set<Permission>();

    for (const permission of grant.permissions) {
      permissions.add(permission);
    }

    this.grants.set(grant.roleId, permissions);
  }

  public hasPermission(
    subject: PermissionSubject,
    permission: Permission
  ): boolean {
    return subject.roleIds.some((roleId) =>
      this.grants.get(roleId)?.has(permission) ?? false
    );
  }

  public hasEveryPermission(
    subject: PermissionSubject,
    permissions: readonly Permission[]
  ): boolean {
    return permissions.every((permission) =>
      this.hasPermission(subject, permission)
    );
  }

  public hasAnyPermission(
    subject: PermissionSubject,
    permissions: readonly Permission[]
  ): boolean {
    return permissions.some((permission) =>
      this.hasPermission(subject, permission)
    );
  }

  public clear(): void {
    this.grants.clear();
  }
}

export const permissions = new PermissionService();

export * from "./models/Permission.js";
