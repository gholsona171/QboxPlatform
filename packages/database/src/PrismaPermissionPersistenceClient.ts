import {
  DeferredOwnerProtectionService,
  type OwnerProtectionService,
  type PermissionCacheInvalidationPublisher,
} from "@qbox/permissions";
import { PrismaClientFactory, type PrismaClient } from "@qbox/prisma";

import type { DatabaseConfiguration } from "./config/DatabaseConfiguration.js";
import type { DatabaseClient } from "./contracts/DatabaseContracts.js";
import {
  PrismaGuildRepository,
  PrismaPermissionAuditRepository,
  PrismaPermissionCatalogRepository,
  PrismaPermissionDefinitionRepository,
  PrismaPermissionPrincipalRepository,
  PrismaPermissionRepository,
} from "./permissions/PrismaPermissionRepositories.js";

/** Repository collection sharing one process-local Prisma client and pool. */
export interface PermissionPersistenceRepositories {
  readonly permissions: PrismaPermissionRepository;
  readonly definitions: PrismaPermissionDefinitionRepository;
  readonly principals: PrismaPermissionPrincipalRepository;
  readonly guilds: PrismaGuildRepository;
  readonly audits: PrismaPermissionAuditRepository;
  readonly catalog: PrismaPermissionCatalogRepository;
}

/**
 * Lifecycle-owned Prisma client and persistent permission repositories.
 *
 * Construction creates no connection. `DatabaseService` calls `start` before
 * repository use and `stop` during shutdown. All repositories are injected with
 * the same client; no singleton or process-global state exists.
 */
export class PrismaPermissionPersistenceClient implements DatabaseClient {
  public readonly repositories: PermissionPersistenceRepositories;
  private readonly client: PrismaClient;
  private started = false;

  public constructor(
    configuration: DatabaseConfiguration,
    dependencies: {
      readonly ownerProtection?: OwnerProtectionService;
      readonly invalidations?: PermissionCacheInvalidationPublisher;
      readonly clientFactory?: PrismaClientFactory;
    } = {},
  ) {
    this.client = (
      dependencies.clientFactory ?? new PrismaClientFactory()
    ).create(configuration);
    this.repositories = {
      permissions: new PrismaPermissionRepository(
        this.client,
        dependencies.ownerProtection ?? new DeferredOwnerProtectionService(),
        dependencies.invalidations,
      ),
      definitions: new PrismaPermissionDefinitionRepository(this.client),
      principals: new PrismaPermissionPrincipalRepository(this.client),
      guilds: new PrismaGuildRepository(this.client),
      audits: new PrismaPermissionAuditRepository(this.client),
      catalog: new PrismaPermissionCatalogRepository(this.client),
    };
  }

  /** Connects and verifies PostgreSQL readiness without exposing credentials. */
  public async start(signal: AbortSignal): Promise<void> {
    if (signal.aborted) throw new Error("database-startup-aborted");
    await this.client.$connect();
    if (signal.aborted) {
      await this.client.$disconnect();
      throw new Error("database-startup-aborted");
    }
    await this.client.$queryRaw`SELECT 1`;
    this.started = true;
  }

  /** Idempotently releases the Prisma adapter pool. */
  public async stop(): Promise<void> {
    if (!this.started) {
      await this.client.$disconnect();
      return;
    }
    this.started = false;
    await this.client.$disconnect();
  }
}
