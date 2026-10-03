import { type OwnerProtectionService, type PermissionCacheInvalidationPublisher } from "@qbox/permissions";
import { PrismaClientFactory, type PrismaClient } from "@qbox/prisma";
import type { DatabaseConfiguration } from "./config/DatabaseConfiguration.js";
import type { DatabaseClient } from "./contracts/DatabaseContracts.js";
import { PrismaAuthenticationPersistence } from "./authentication/PrismaAuthenticationPersistence.js";
import { PrismaRoleMenuRepository } from "./roleMenus/PrismaRoleMenuRepository.js";
import { PrismaDiscordCommunityRepository } from "./discordCommunity/PrismaDiscordCommunityRepository.js";
import { PrismaDiscordRoleDependencyRepository } from "./discordRoles/PrismaDiscordRoleDependencyRepository.js";
import { PrismaTicketRepository } from "./tickets/PrismaTicketRepository.js";
import { PrismaGuildRepository, PrismaPermissionAuditRepository, PrismaPermissionCatalogRepository, PrismaPermissionDefinitionRepository, PrismaPermissionPrincipalRepository, PrismaPermissionRepository } from "./permissions/PrismaPermissionRepositories.js";
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
export declare class PrismaPermissionPersistenceClient implements DatabaseClient {
    readonly repositories: PermissionPersistenceRepositories;
    /** Authentication adapters sharing this exact lifecycle-owned Prisma client. */
    readonly authentication: PrismaAuthenticationPersistence;
    private readonly client;
    private started;
    /**
     * Shared lifecycle-owned Prisma client for feature repositories composed
     * outside this class (for example `new PrismaModerationRepository(persistence.prisma)`).
     */
    get prisma(): PrismaClient;
    constructor(configuration: DatabaseConfiguration, dependencies?: {
        readonly ownerProtection?: OwnerProtectionService;
        readonly invalidations?: PermissionCacheInvalidationPublisher;
        readonly clientFactory?: PrismaClientFactory;
        /** Receives each statement's duration (never the SQL); used for per-request timing. */
        readonly onQuery?: (durationMs: number) => void;
    });
    /** Connects and verifies PostgreSQL readiness without exposing credentials. */
    start(signal: AbortSignal): Promise<void>;
    /** Idempotently releases the Prisma adapter pool. */
    stop(): Promise<void>;
}
//# sourceMappingURL=PrismaPermissionPersistenceClient.d.ts.map