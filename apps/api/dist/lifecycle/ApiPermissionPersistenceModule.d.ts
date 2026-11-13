import type { PlatformModule, PlatformModuleContext } from "@qbox/core";
import type { DatabaseServiceContract } from "@qbox/database";
import { type PermissionAuthorizer, type PermissionDefinitionRepository } from "@qbox/permissions";
import type { ApiLifecycleHealth } from "./ApiLifecycleHealth.js";
/** Repository collection registered for future injected application services. */
export interface ApiPermissionRepositories {
    readonly definitions: Pick<PermissionDefinitionRepository, "synchronizeCatalog">;
}
/** Starts persistence and synchronizes the compiled catalog before HTTP. */
export declare class ApiPermissionPersistenceModule implements PlatformModule {
    private readonly database;
    private readonly repositories;
    private readonly authorizer;
    private readonly closeCache;
    private readonly health;
    readonly name = "api-permission-persistence";
    readonly version = "0.1.0";
    constructor(database: DatabaseServiceContract, repositories: ApiPermissionRepositories, authorizer: PermissionAuthorizer, closeCache: () => void | Promise<void>, health: ApiLifecycleHealth);
    start(context: PlatformModuleContext): Promise<void>;
    stop(): Promise<void>;
}
//# sourceMappingURL=ApiPermissionPersistenceModule.d.ts.map