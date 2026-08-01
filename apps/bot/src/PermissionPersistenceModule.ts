import type { PlatformModule, PlatformModuleContext } from "@qbox/core";
import {
  DatabaseService,
  type PrismaPermissionPersistenceClient,
} from "@qbox/database";
import { logger } from "@qbox/logger";
import {
  permissionCatalog,
  assertCompatibilityCanBeDisabled,
  type PermissionCache,
  type PermissionDefinitionRepository,
} from "@qbox/permissions";

/** Starts persistence, synchronizes the compiled catalog, and owns shutdown. */
export class PermissionPersistenceModule implements PlatformModule {
  public readonly name = "permission-persistence";
  public readonly version = "0.1.0";

  public constructor(
    private readonly database: DatabaseService,
    private readonly persistence: PrismaPermissionPersistenceClient,
    private readonly definitions: PermissionDefinitionRepository,
    private readonly cache: PermissionCache,
    private readonly compatibility: {
      readonly enabled: boolean;
      readonly guildId?: string;
      readonly roleIds: readonly string[];
    },
  ) {}

  public async start(context: PlatformModuleContext): Promise<void> {
    const startup = await this.database.start();
    if (!startup.started)
      throw new Error(
        `Permission database startup failed: ${startup.reason ?? startup.state}.`,
      );
    try {
      const synchronization = await this.definitions.synchronizeCatalog(
        permissionCatalog,
        {
          reasonCode: "system-maintenance",
          reason: "Process startup catalog synchronization.",
        },
      );
      const activeOwners =
        await this.persistence.repositories.permissions.findActive({
          permission: "platform.owner",
          effect: "allow",
        });
      const activeAdmins =
        await this.persistence.repositories.permissions.findActive({
          permission: "platform.admin",
          effect: "allow",
        });
      const migratedRoleIds = new Set(this.compatibility.roleIds);
      const persistentMigratedGrantCount = activeAdmins.filter(
        (assignment) =>
          assignment.principal.type === "discord-role" &&
          migratedRoleIds.has(assignment.principal.externalId) &&
          (!this.compatibility.guildId ||
            assignment.principal.guildId === this.compatibility.guildId),
      ).length;
      if (!this.compatibility.enabled) {
        assertCompatibilityCanBeDisabled(
          activeOwners.length,
          activeAdmins.length,
        );
      }
      context.services.register("database", this.database);
      context.services.register(
        "permissionRepositories",
        this.persistence.repositories,
      );
      logger.info(
        {
          catalogVersion: permissionCatalog.version,
          catalogChecksum: permissionCatalog.checksum,
          synchronizationState: synchronization.status.state,
          synchronizedDefinitions: synchronization.synchronizedDefinitions,
          permissionCompatibilityEnabled: this.compatibility.enabled,
          permissionCompatibilityGuildId: this.compatibility.guildId,
          permissionCompatibilityRoleCount: this.compatibility.roleIds.length,
          persistentMigratedGrantCount,
        },
        "Persistent permission database ready.",
      );
    } catch (error) {
      await this.database.stop();
      throw error;
    }
  }

  public async stop(): Promise<void> {
    await this.cache.close?.();
    const shutdown = await this.database.stop();
    if (!shutdown.stopped)
      throw new Error(
        `Permission database shutdown failed: ${shutdown.reason ?? shutdown.state}.`,
      );
    logger.info("Persistent permission database stopped.");
  }
}
