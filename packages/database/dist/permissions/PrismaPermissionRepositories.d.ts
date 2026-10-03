import { type GuildRepository, type OwnerProtectionService, type PermissionAssignment, type PermissionAssignmentAdministrationRepository, type PermissionAssignmentFilters, type PermissionAssignmentQuery, type PermissionAuditInput, type PermissionAuditRepository, type PermissionCacheInvalidationEvent, type PermissionCacheInvalidationPublisher, type PermissionCacheInvalidationSubscriber, type PermissionCatalogRepository, type PermissionCatalogSnapshot, type PermissionCatalogSynchronizationResult, type PermissionDefinitionRepository, type PermissionMutation, type PermissionMutationReason, type PermissionOperationContext, type PermissionMutationResult, type PermissionPrincipal, type PermissionPrincipalRepository, type PermissionRecordMetadata, type PermissionRepository, type PersistedGuild, type PersistedPermissionAuditEvent, type PersistedPermissionDefinition, type PersistedPermissionPrincipal } from "@qbox/permissions";
import { Prisma, type PrismaClient } from "@qbox/prisma";
type DatabaseContext = PrismaClient | Prisma.TransactionClient;
/** Prisma-backed guild repository with soft-disable semantics. */
export declare class PrismaGuildRepository implements GuildRepository {
    private readonly database;
    private readonly ownerProtection;
    constructor(database: PrismaClient, ownerProtection?: OwnerProtectionService);
    create(discordGuildId: string, metadata?: PermissionRecordMetadata): Promise<PersistedGuild>;
    findByDiscordId(discordGuildId: string): Promise<PersistedGuild | undefined>;
    updateMetadata(discordGuildId: string, metadata: PermissionRecordMetadata): Promise<PersistedGuild>;
    disable(discordGuildId: string, context: PermissionOperationContext): Promise<PersistedGuild>;
    enable(discordGuildId: string, context: PermissionOperationContext): Promise<PersistedGuild>;
    private auditOwnerRejection;
}
/** Prisma-backed Discord principal repository isolated by guild identity. */
export declare class PrismaPermissionPrincipalRepository implements PermissionPrincipalRepository {
    private readonly database;
    private readonly ownerProtection;
    constructor(database: PrismaClient, ownerProtection?: OwnerProtectionService);
    getOrCreateDiscordPrincipal(principal: PermissionPrincipal, metadata?: PermissionRecordMetadata): Promise<PersistedPermissionPrincipal>;
    updateMetadata(principal: PermissionPrincipal, metadata: PermissionRecordMetadata): Promise<PersistedPermissionPrincipal>;
    disable(principal: PermissionPrincipal, context: PermissionOperationContext): Promise<PersistedPermissionPrincipal>;
    enable(principal: PermissionPrincipal, context: PermissionOperationContext): Promise<PersistedPermissionPrincipal>;
    findDiscordUser(guildId: string, externalId: string): Promise<PersistedPermissionPrincipal | undefined>;
    findDiscordRole(guildId: string, externalId: string): Promise<PersistedPermissionPrincipal | undefined>;
    private find;
    private update;
    private requireGuild;
}
/** Prisma-backed catalog singleton repository. */
export declare class PrismaPermissionCatalogRepository implements PermissionCatalogRepository {
    private readonly database;
    constructor(database: DatabaseContext);
    current(): Promise<{
        version: string;
        checksum: string;
        syncedAt: Date;
    } | undefined>;
    update(version: string, checksum: string, syncedAt?: Date): Promise<{
        version: string;
        checksum: string;
        syncedAt: Date;
    }>;
}
/** Prisma-backed definition repository synchronized from the compiled catalog. */
export declare class PrismaPermissionDefinitionRepository implements PermissionDefinitionRepository {
    private readonly client;
    private readonly ownerProtection;
    constructor(client: PrismaClient, ownerProtection?: OwnerProtectionService);
    synchronizeCatalog(catalog: PermissionCatalogSnapshot, _reason: PermissionMutationReason, now?: Date): Promise<PermissionCatalogSynchronizationResult>;
    findByKey(key: string): Promise<PersistedPermissionDefinition | undefined>;
    findUnknownKeys(compiledKeys: readonly string[]): Promise<readonly string[]>;
    currentSynchronizationStatus(catalog: PermissionCatalogSnapshot): Promise<import("@qbox/permissions").PermissionCatalogSynchronizationStatus>;
    disable(key: string, context: PermissionOperationContext): Promise<PersistedPermissionDefinition>;
    enable(key: string, context: PermissionOperationContext): Promise<PersistedPermissionDefinition>;
}
/** Prisma append-only audit repository; database triggers reject mutation. */
export declare class PrismaPermissionAuditRepository implements PermissionAuditRepository {
    private readonly database;
    constructor(database: DatabaseContext);
    append(audit: PermissionAuditInput, details?: {
        readonly assignmentId?: string;
        readonly permissionKey?: string;
        readonly beforeSnapshot?: PermissionRecordMetadata;
        readonly afterSnapshot?: PermissionRecordMetadata;
    }): Promise<PersistedPermissionAuditEvent>;
    findByCorrelationId(correlationId: string): Promise<readonly PersistedPermissionAuditEvent[]>;
}
/** Prisma-backed assignment repository with atomic mutation plus audit writes. */
export declare class PrismaPermissionRepository implements PermissionRepository, PermissionAssignmentAdministrationRepository {
    private readonly client;
    private readonly ownerProtection;
    private readonly invalidations?;
    constructor(client: PrismaClient, ownerProtection: OwnerProtectionService, invalidations?: PermissionCacheInvalidationPublisher | undefined);
    findAssignments(query: PermissionAssignmentQuery): Promise<readonly PermissionAssignment[]>;
    findAssignment(assignmentId: string): Promise<PermissionAssignment | undefined>;
    applyMutation(mutation: PermissionMutation, audit: PermissionAuditInput): Promise<PermissionMutationResult>;
    countActiveOwners(now: Date): Promise<number>;
    isActiveOwner(principal: PermissionPrincipal, now: Date): Promise<boolean>;
    recordRejectedMutation(mutation: PermissionMutation, audit: PermissionAuditInput, errorCode: string): Promise<void>;
    findByPrincipal(principal: PermissionPrincipal, includeHistorical?: boolean): Promise<PermissionAssignment[]>;
    findByPermission(permission: string, includeHistorical?: boolean): Promise<PermissionAssignment[]>;
    findActive(filters?: PermissionAssignmentFilters): Promise<PermissionAssignment[]>;
    findHistorical(filters?: PermissionAssignmentFilters): Promise<PermissionAssignment[]>;
    findExpired(expiredAt?: Date, filters?: PermissionAssignmentFilters): Promise<PermissionAssignment[]>;
    private setAssignment;
    private mutateExistingAssignment;
    private findMany;
}
/** Process-local invalidation publisher/subscriber used until Redis is approved. */
export declare class InMemoryPermissionInvalidationBus implements PermissionCacheInvalidationPublisher, PermissionCacheInvalidationSubscriber {
    private readonly listeners;
    publish(event: PermissionCacheInvalidationEvent): Promise<void>;
    subscribe(listener: (event: PermissionCacheInvalidationEvent) => Promise<void>): () => void;
}
export {};
//# sourceMappingURL=PrismaPermissionRepositories.d.ts.map