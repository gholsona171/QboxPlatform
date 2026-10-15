import { PersistentPermissionService } from "./PersistentPermissionService.js";
/** Process-local permission runtime used before a persistent adapter exists. */
export declare function createInMemoryPermissionRuntime(guildId: string, roleIds: readonly string[]): {
    authorizer: PersistentPermissionService;
    compatibility: import("./compatibility/LegacyAdministratorAssignments.js").LegacyAdministratorCompatibility;
};
//# sourceMappingURL=PermissionRuntime.d.ts.map