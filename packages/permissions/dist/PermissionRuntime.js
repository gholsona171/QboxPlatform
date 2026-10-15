import { createLegacyAdministratorCompatibility } from "./compatibility/LegacyAdministratorAssignments.js";
import { PersistentPermissionService } from "./PersistentPermissionService.js";
import { InMemoryPermissionCache, InMemoryPermissionRepository, } from "./testing/InMemoryPermissionAdapters.js";
/** Process-local permission runtime used before a persistent adapter exists. */
export function createInMemoryPermissionRuntime(guildId, roleIds) {
    const compatibility = createLegacyAdministratorCompatibility(guildId, roleIds);
    const authorizer = new PersistentPermissionService(new InMemoryPermissionRepository(), new InMemoryPermissionCache(), { legacyAssignments: compatibility.assignments });
    return { authorizer, compatibility };
}
//# sourceMappingURL=PermissionRuntime.js.map