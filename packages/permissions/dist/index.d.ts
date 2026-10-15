import type { Permission, PermissionGrant, PermissionSubject } from "./models/Permission.js";
/**
 * Legacy synchronous role-grant service used by the current Discord adapter.
 *
 * State is process-local and must be rebuilt on startup. It is intentionally
 * retained through Phase 1 and will be replaced at the integration boundary in
 * Phase 2; new cross-system consumers should use PersistentPermissionService.
 *
 * @deprecated Use the injected asynchronous PermissionAuthorizer contract.
 */
export declare class PermissionService {
    private readonly grants;
    registerGrant(grant: PermissionGrant): void;
    hasPermission(subject: PermissionSubject, permission: Permission): boolean;
    hasEveryPermission(subject: PermissionSubject, permissions: readonly Permission[]): boolean;
    hasAnyPermission(subject: PermissionSubject, permissions: readonly Permission[]): boolean;
    clear(): void;
}
/** Process-local legacy singleton retained for current Discord compatibility. */
export declare const permissions: PermissionService;
export * from "./catalog/PermissionCatalog.js";
export * from "./compatibility/LegacyAdministratorAssignments.js";
export * from "./compatibility/CompatibilityDisableGuard.js";
export * from "./contracts/PermissionCache.js";
export * from "./contracts/PermissionInfrastructureRepositories.js";
export * from "./contracts/PermissionRepository.js";
export * from "./contracts/OwnerProtectionService.js";
export * from "./models/Authorization.js";
export * from "./models/Permission.js";
export * from "./models/Mutation.js";
export * from "./PersistentPermissionService.js";
export * from "./PermissionRuntime.js";
export * from "./testing/InMemoryPermissionAdapters.js";
//# sourceMappingURL=index.d.ts.map