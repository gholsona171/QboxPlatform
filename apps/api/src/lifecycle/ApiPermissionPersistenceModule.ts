import type { PlatformModule, PlatformModuleContext } from "@qbox/core";
import type { DatabaseServiceContract } from "@qbox/database";
import {
  permissionCatalog,
  type PermissionAuthorizer,
  type PermissionDefinitionRepository,
} from "@qbox/permissions";
import type { ApiLifecycleHealth } from "./ApiLifecycleHealth.js";

/** Repository collection registered for future injected application services. */
export interface ApiPermissionRepositories {
  readonly definitions: Pick<
    PermissionDefinitionRepository,
    "synchronizeCatalog"
  >;
}

/** Starts persistence and synchronizes the compiled catalog before HTTP. */
export class ApiPermissionPersistenceModule implements PlatformModule {
  public readonly name = "api-permission-persistence";
  public readonly version = "0.1.0";

  public constructor(
    private readonly database: DatabaseServiceContract,
    private readonly repositories: ApiPermissionRepositories,
    private readonly authorizer: PermissionAuthorizer,
    private readonly closeCache: () => void | Promise<void>,
    private readonly health: ApiLifecycleHealth,
  ) {}

  public async start(context: PlatformModuleContext): Promise<void> {
    const startup = await this.database.start();
    if (!startup.started)
      throw new Error(`Permission database startup failed: ${startup.reason ?? startup.state}.`);
    try {
      const synchronization = await this.repositories.definitions.synchronizeCatalog(permissionCatalog, {
        reasonCode: "system-maintenance",
        reason: "API process startup catalog synchronization.",
      });
      if (
        synchronization.status.state !== "synchronized" ||
        synchronization.unknownKeys.length > 0
      ) {
        throw new Error("Permission catalog synchronization did not reach synchronized state.");
      }
      this.health.markCatalogSynchronized();
      context.services.register("database", this.database);
      context.services.register("permissionRepositories", this.repositories);
      context.services.register("permissions", this.authorizer);
    } catch (error) {
      this.health.markCatalogFailed();
      await this.database.stop();
      throw error;
    }
  }

  public async stop(): Promise<void> {
    let cacheError: unknown;
    try {
      await this.closeCache();
    } catch (error) {
      cacheError = error;
    }
    const result = await this.database.stop();
    if (!result.stopped)
      throw new Error(`Permission database shutdown failed: ${result.reason ?? result.state}.`);
    if (cacheError !== undefined) throw cacheError;
  }
}
