import { DeterministicOwnerProtectionService, } from "@qbox/permissions";
import { PrismaClientFactory } from "@qbox/prisma";
import { PrismaAuthenticationPersistence } from "./authentication/PrismaAuthenticationPersistence.js";
import { PrismaRoleMenuRepository } from "./roleMenus/PrismaRoleMenuRepository.js";
import { PrismaDiscordCommunityRepository } from "./discordCommunity/PrismaDiscordCommunityRepository.js";
import { PrismaDiscordRoleDependencyRepository } from "./discordRoles/PrismaDiscordRoleDependencyRepository.js";
import { PrismaTicketRepository } from "./tickets/PrismaTicketRepository.js";
import { PrismaGuildRepository, PrismaPermissionAuditRepository, PrismaPermissionCatalogRepository, PrismaPermissionDefinitionRepository, PrismaPermissionPrincipalRepository, PrismaPermissionRepository, } from "./permissions/PrismaPermissionRepositories.js";
/**
 * Lifecycle-owned Prisma client and persistent permission repositories.
 *
 * Construction creates no connection. `DatabaseService` calls `start` before
 * repository use and `stop` during shutdown. All repositories are injected with
 * the same client; no singleton or process-global state exists.
 */
export class PrismaPermissionPersistenceClient {
    repositories;
    /** Authentication adapters sharing this exact lifecycle-owned Prisma client. */
    authentication;
    client;
    started = false;
    /**
     * Shared lifecycle-owned Prisma client for feature repositories composed
     * outside this class (for example `new PrismaModerationRepository(persistence.prisma)`).
     */
    get prisma() {
        return this.client;
    }
    constructor(configuration, dependencies = {}) {
        this.client = (dependencies.clientFactory ??
            new PrismaClientFactory(dependencies.onQuery ? { onQuery: dependencies.onQuery } : {})).create(configuration);
        this.authentication = new PrismaAuthenticationPersistence(this.client, configuration.diagnostics().queryTimeoutMs);
        const ownerProtection = dependencies.ownerProtection ?? new DeterministicOwnerProtectionService();
        this.repositories = {
            permissions: new PrismaPermissionRepository(this.client, ownerProtection, dependencies.invalidations),
            definitions: new PrismaPermissionDefinitionRepository(this.client, ownerProtection),
            principals: new PrismaPermissionPrincipalRepository(this.client, ownerProtection),
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
    async start(signal) {
        if (signal.aborted)
            throw new Error("database-startup-aborted");
        await this.client.$connect();
        if (signal.aborted) {
            await this.client.$disconnect();
            throw new Error("database-startup-aborted");
        }
        await this.client.$queryRaw `SELECT 1`;
        this.started = true;
    }
    /** Idempotently releases the Prisma adapter pool. */
    async stop() {
        if (!this.started) {
            await this.client.$disconnect();
            return;
        }
        this.started = false;
        await this.client.$disconnect();
    }
}
//# sourceMappingURL=PrismaPermissionPersistenceClient.js.map