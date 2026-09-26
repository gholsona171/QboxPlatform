import {
  DeterministicOwnerProtectionService,
  type OwnerProtectionService,
  type PermissionCacheInvalidationPublisher,
} from "@qbox/permissions";
import { PrismaClientFactory, type PrismaClient } from "@qbox/prisma";

import type { DatabaseConfiguration } from "./config/DatabaseConfiguration.js";
import type { DatabaseClient } from "./contracts/DatabaseContracts.js";
import { PrismaAuthenticationPersistence } from "./authentication/PrismaAuthenticationPersistence.js";
import { PrismaRoleMenuRepository } from "./roleMenus/PrismaRoleMenuRepository.js";
import { PrismaDiscordCommunityRepository } from "./discordCommunity/PrismaDiscordCommunityRepository.js";
import { PrismaDiscordRoleDependencyRepository } from "./discordRoles/PrismaDiscordRoleDependencyRepository.js";
import { PrismaTicketRepository } from "./tickets/PrismaTicketRepository.js";
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
  readonly roleMenus: PrismaRoleMenuRepository;
  readonly discordCommunity: PrismaDiscordCommunityRepository;
  readonly discordRoles: PrismaDiscordRoleDependencyRepository;
  readonly tickets: PrismaTicketRepository;
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
  /** Authentication adapters sharing this exact lifecycle-owned Prisma client. */
  public readonly authentication: PrismaAuthenticationPersistence;
  private readonly client: PrismaClient;
  private started = false;

  /**
   * Shared lifecycle-owned Prisma client for feature repositories composed
   * outside this class (for example `new PrismaModerationRepository(persistence.prisma)`).
   */
  public get prisma(): PrismaClient {
    return this.client;
  }

  public constructor(
    configuration: DatabaseConfiguration,
    dependencies: {
      readonly ownerProtection?: OwnerProtectionService;
      readonly invalidations?: PermissionCacheInvalidationPublisher;
      readonly clientFactory?: PrismaClientFactory;
      /** Receives each statement's duration (never the SQL); used for per-request timing. */
      readonly onQuery?: (durationMs: number) => void;
    } = {},
  ) {
    this.client = (
      dependencies.clientFactory ??
      new PrismaClientFactory(dependencies.onQuery ? { onQuery: dependencies.onQuery } : {})
    ).create(configuration);
    this.authentication = new PrismaAuthenticationPersistence(
      this.client,
      configuration.diagnostics().queryTimeoutMs,
    );
    const ownerProtection =
      dependencies.ownerProtection ?? new DeterministicOwnerProtectionService();
    this.repositories = {
      permissions: new PrismaPermissionRepository(
        this.client,
        ownerProtection,
        dependencies.invalidations,
      ),
      definitions: new PrismaPermissionDefinitionRepository(
        this.client,
        ownerProtection,
      ),
      principals: new PrismaPermissionPrincipalRepository(
        this.client,
        ownerProtection,
      ),
      guilds: new PrismaGuildRepository(this.client, ownerProtection),
      audits: new PrismaPermissionAuditRepository(this.client),
      catalog: new PrismaPermissionCatalogRepository(this.client),
      roleMenus: new PrismaRoleMenuRepository(this.client),
      discordCommunity: new PrismaDiscordCommunityRepository(this.client),
      discordRoles: new PrismaDiscordRoleDependencyRepository(this.client),
      tickets: new PrismaTicketRepository(this.client),
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
