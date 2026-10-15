import { permissionCatalog, } from "@qbox/permissions";
/** Starts persistence and synchronizes the compiled catalog before HTTP. */
export class ApiPermissionPersistenceModule {
    database;
    repositories;
    authorizer;
    closeCache;
    health;
    name = "api-permission-persistence";
    version = "0.1.0";
    constructor(database, repositories, authorizer, closeCache, health) {
        this.database = database;
        this.repositories = repositories;
        this.authorizer = authorizer;
        this.closeCache = closeCache;
        this.health = health;
    }
    async start(context) {
        const startup = await this.database.start();
        if (!startup.started)
            throw new Error(`Permission database startup failed: ${startup.reason ?? startup.state}.`);
        try {
            const synchronization = await this.repositories.definitions.synchronizeCatalog(permissionCatalog, {
                reasonCode: "system-maintenance",
                reason: "API process startup catalog synchronization.",
            });
            if (synchronization.status.state !== "synchronized" ||
                synchronization.unknownKeys.length > 0) {
                throw new Error("Permission catalog synchronization did not reach synchronized state.");
            }
            this.health.markCatalogSynchronized();
            context.services.register("database", this.database);
            context.services.register("permissionRepositories", this.repositories);
            context.services.register("permissions", this.authorizer);
        }
        catch (error) {
            this.health.markCatalogFailed();
            await this.database.stop();
            throw error;
        }
    }
    async stop() {
        let cacheError;
        try {
            await this.closeCache();
        }
        catch (error) {
            cacheError = error;
        }
        const result = await this.database.stop();
        if (!result.stopped)
            throw new Error(`Permission database shutdown failed: ${result.reason ?? result.state}.`);
        if (cacheError !== undefined)
            throw cacheError;
    }
}
//# sourceMappingURL=ApiPermissionPersistenceModule.js.map