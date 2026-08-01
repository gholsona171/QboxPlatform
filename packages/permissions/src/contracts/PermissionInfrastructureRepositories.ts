import type {
  PermissionCatalogSynchronizationStatus,
  PermissionCatalogSnapshot,
} from "../catalog/PermissionCatalog.js";
import type {
  PermissionAssignment,
  PermissionEffect,
  PermissionPrincipal,
  PermissionPrincipalType,
  PermissionScope,
} from "../models/Permission.js";
import type {
  PermissionAuditAction,
  PermissionAuditInput,
  PermissionMutationActor,
  PermissionMutationReason,
  PermissionMutationReasonCode,
} from "../models/Mutation.js";

/** Trusted administrative mutation context supplied by application composition. */
export interface PermissionOperationContext {
  readonly actor: PermissionMutationActor;
  readonly correlationId: string;
  readonly reasonCode: PermissionMutationReasonCode;
  readonly reason?: string;
  readonly occurredAt?: Date;
}

/** Append-only audit request for non-assignment infrastructure mutations. */
export interface PermissionInfrastructureAuditInput extends PermissionOperationContext {
  readonly action: PermissionAuditAction;
  readonly target?: PermissionPrincipal;
  readonly scope?: PermissionScope;
}

/** JSON-compatible immutable metadata accepted at infrastructure boundaries. */
export type PermissionRecordMetadata = Readonly<Record<string, unknown>>;

/** Persisted guild projection independent of its database representation. */
export interface PersistedGuild {
  readonly id: string;
  readonly discordGuildId: string;
  readonly metadata: PermissionRecordMetadata;
  readonly enabled: boolean;
  readonly disabledAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Persisted principal projection independent of its database representation. */
export interface PersistedPermissionPrincipal {
  readonly id: string;
  readonly principal: PermissionPrincipal;
  readonly metadata: PermissionRecordMetadata;
  readonly enabled: boolean;
  readonly disabledAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Persisted compiled-catalog definition metadata. */
export interface PersistedPermissionDefinition {
  readonly id: string;
  readonly key: string;
  readonly description?: string;
  readonly category?: string;
  readonly enabled: boolean;
  readonly disabledAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Immutable audit-event projection safe for administrative history views. */
export interface PersistedPermissionAuditEvent {
  readonly id: string;
  readonly audit: PermissionAuditInput;
  readonly assignmentId?: string;
  readonly permissionKey?: string;
  readonly beforeSnapshot?: PermissionRecordMetadata;
  readonly afterSnapshot?: PermissionRecordMetadata;
  readonly createdAt: Date;
}

/** Catalog synchronization result including unknown persisted keys. */
export interface PermissionCatalogSynchronizationResult {
  readonly status: PermissionCatalogSynchronizationStatus;
  readonly unknownKeys: readonly string[];
  readonly synchronizedDefinitions: number;
}

/** Guild persistence port. Implementations soft-disable instead of deleting. */
export interface GuildRepository {
  create(
    discordGuildId: string,
    metadata?: PermissionRecordMetadata,
  ): Promise<PersistedGuild>;
  findByDiscordId(discordGuildId: string): Promise<PersistedGuild | undefined>;
  updateMetadata(
    discordGuildId: string,
    metadata: PermissionRecordMetadata,
  ): Promise<PersistedGuild>;
  disable(
    discordGuildId: string,
    context: PermissionOperationContext,
  ): Promise<PersistedGuild>;
  enable(
    discordGuildId: string,
    context: PermissionOperationContext,
  ): Promise<PersistedGuild>;
}

/** Discord principal persistence port with strict guild isolation. */
export interface PermissionPrincipalRepository {
  getOrCreateDiscordPrincipal(
    principal: PermissionPrincipal,
    metadata?: PermissionRecordMetadata,
  ): Promise<PersistedPermissionPrincipal>;
  updateMetadata(
    principal: PermissionPrincipal,
    metadata: PermissionRecordMetadata,
  ): Promise<PersistedPermissionPrincipal>;
  disable(
    principal: PermissionPrincipal,
    context: PermissionOperationContext,
  ): Promise<PersistedPermissionPrincipal>;
  enable(
    principal: PermissionPrincipal,
    context: PermissionOperationContext,
  ): Promise<PersistedPermissionPrincipal>;
  findDiscordUser(
    guildId: string,
    externalId: string,
  ): Promise<PersistedPermissionPrincipal | undefined>;
  findDiscordRole(
    guildId: string,
    externalId: string,
  ): Promise<PersistedPermissionPrincipal | undefined>;
}

/** Compiled permission-definition persistence and synchronization port. */
export interface PermissionDefinitionRepository {
  synchronizeCatalog(
    catalog: PermissionCatalogSnapshot,
    reason: PermissionMutationReason,
    now?: Date,
  ): Promise<PermissionCatalogSynchronizationResult>;
  findByKey(key: string): Promise<PersistedPermissionDefinition | undefined>;
  findUnknownKeys(compiledKeys: readonly string[]): Promise<readonly string[]>;
  currentSynchronizationStatus(
    catalog: PermissionCatalogSnapshot,
  ): Promise<PermissionCatalogSynchronizationStatus>;
  disable(
    key: string,
    context: PermissionOperationContext,
  ): Promise<PersistedPermissionDefinition>;
  enable(
    key: string,
    context: PermissionOperationContext,
  ): Promise<PersistedPermissionDefinition>;
}

/** Append-only audit query/append port; implementations never expose mutation. */
export interface PermissionAuditRepository {
  append(
    audit: PermissionAuditInput,
    details?: {
      readonly assignmentId?: string;
      readonly permissionKey?: string;
      readonly beforeSnapshot?: PermissionRecordMetadata;
      readonly afterSnapshot?: PermissionRecordMetadata;
    },
  ): Promise<PersistedPermissionAuditEvent>;
  findByCorrelationId(
    correlationId: string,
  ): Promise<readonly PersistedPermissionAuditEvent[]>;
}

/** Persisted catalog version/checksum state port. */
export interface PermissionCatalogRepository {
  current(): Promise<
    | {
        readonly version: string;
        readonly checksum: string;
        readonly syncedAt: Date;
      }
    | undefined
  >;
  update(
    version: string,
    checksum: string,
    syncedAt?: Date,
  ): Promise<{
    readonly version: string;
    readonly checksum: string;
    readonly syncedAt: Date;
  }>;
}

/** Rich assignment query filters used by administrative and cache consumers. */
export interface PermissionAssignmentFilters {
  readonly principal?: PermissionPrincipal;
  readonly permission?: string;
  readonly scope?: PermissionScope;
  readonly effect?: PermissionEffect;
  readonly activeAt?: Date;
  readonly includeHistorical?: boolean;
}

/** Assignment management extension implemented by persistent repositories. */
export interface PermissionAssignmentAdministrationRepository {
  findByPrincipal(
    principal: PermissionPrincipal,
    includeHistorical?: boolean,
  ): Promise<readonly PermissionAssignment[]>;
  findByPermission(
    permission: string,
    includeHistorical?: boolean,
  ): Promise<readonly PermissionAssignment[]>;
  findActive(
    filters?: PermissionAssignmentFilters,
  ): Promise<readonly PermissionAssignment[]>;
  findHistorical(
    filters?: PermissionAssignmentFilters,
  ): Promise<readonly PermissionAssignment[]>;
  findExpired(
    expiredAt?: Date,
    filters?: PermissionAssignmentFilters,
  ): Promise<readonly PermissionAssignment[]>;
}

/** Normalizes a domain principal discriminator for repository implementations. */
export function isDiscordPrincipalType(
  type: string,
): type is PermissionPrincipalType {
  return type === "discord-user" || type === "discord-role";
}
