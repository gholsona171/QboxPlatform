import {
  permissionCatalog,
  permissionCatalogStatus,
  requirePermission,
  OwnerInvariantViolationError,
  DeterministicOwnerProtectionService,
  PermissionMutationAuthorizationError,
  UnknownPermissionCatalogEntriesError,
  type GuildRepository,
  type OwnerProtectionService,
  type PermissionAssignment,
  type PermissionAssignmentAdministrationRepository,
  type PermissionAssignmentFilters,
  type PermissionAssignmentQuery,
  type PermissionAuditInput,
  type PermissionAuditRepository,
  type PermissionCacheInvalidationEvent,
  type PermissionCacheInvalidationPublisher,
  type PermissionCacheInvalidationSubscriber,
  type PermissionCatalogRepository,
  type PermissionCatalogSnapshot,
  type PermissionCatalogSynchronizationResult,
  type PermissionDefinitionRepository,
  type PermissionMutation,
  type PermissionMutationReason,
  type PermissionOperationContext,
  type PermissionMutationResult,
  type PermissionPrincipal,
  type PermissionPrincipalRepository,
  type PermissionRecordMetadata,
  type PermissionRepository,
  type PermissionScope,
  type PersistedGuild,
  type PersistedPermissionAuditEvent,
  type PersistedPermissionDefinition,
  type PersistedPermissionPrincipal,
} from "@qbox/permissions";
import {
  PermissionAssignmentEffect,
  PermissionAuditAction,
  PermissionAuditActorType,
  PermissionMutationReasonCode,
  PermissionPrincipalType,
  PermissionScopeType,
  Prisma,
  type PrismaClient,
} from "@qbox/prisma";

type DatabaseContext = PrismaClient | Prisma.TransactionClient;
type AssignmentRow = Prisma.PermissionAssignmentGetPayload<{
  include: {
    principal: { include: { guild: true } };
    permissionDefinition: true;
    guild: true;
  };
}>;

const assignmentInclude = {
  principal: { include: { guild: true } },
  permissionDefinition: true,
  guild: true,
} as const;

/** Prisma-backed guild repository with soft-disable semantics. */
export class PrismaGuildRepository implements GuildRepository {
  public constructor(
    private readonly database: PrismaClient,
    private readonly ownerProtection: OwnerProtectionService = new DeterministicOwnerProtectionService(),
  ) {}

  public async create(
    discordGuildId: string,
    metadata: PermissionRecordMetadata = {},
  ): Promise<PersistedGuild> {
    return mapGuild(
      await this.database.guild.create({
        data: { discordGuildId, metadata: jsonObject(metadata) },
      }),
    );
  }

  public async findByDiscordId(
    discordGuildId: string,
  ): Promise<PersistedGuild | undefined> {
    const row = await this.database.guild.findUnique({
      where: { discordGuildId },
    });
    return row ? mapGuild(row) : undefined;
  }

  public async updateMetadata(
    discordGuildId: string,
    metadata: PermissionRecordMetadata,
  ): Promise<PersistedGuild> {
    return mapGuild(
      await this.database.guild.update({
        where: { discordGuildId },
        data: { metadata: jsonObject(metadata) },
      }),
    );
  }

  public async disable(
    discordGuildId: string,
    context: PermissionOperationContext,
  ): Promise<PersistedGuild> {
    const audit = infrastructureAudit(context, "disable-guild", {
      scope: { type: "discord-guild", guildId: discordGuildId },
    });
    try {
      return await this.database.$transaction(async (transaction) =>
        this.ownerProtection.protect(
          {
            target: { type: "guild", guildId: discordGuildId },
            now: audit.occurredAt,
          },
          ownerProtectionContext(transaction),
          async () => {
            const before = await transaction.guild.findUniqueOrThrow({
              where: { discordGuildId },
            });
            const row = await transaction.guild.update({
              where: { discordGuildId },
              data: { enabled: false, disabledAt: audit.occurredAt },
            });
            await new PrismaPermissionAuditRepository(transaction).append(
              audit,
              {
                beforeSnapshot: guildSnapshot(before),
                afterSnapshot: guildSnapshot(row),
              },
            );
            return mapGuild(row);
          },
        ),
      );
    } catch (error) {
      await this.auditOwnerRejection(error, audit);
      throw error;
    }
  }

  public async enable(
    discordGuildId: string,
    context: PermissionOperationContext,
  ): Promise<PersistedGuild> {
    const audit = infrastructureAudit(context, "enable-guild", {
      scope: { type: "discord-guild", guildId: discordGuildId },
    });
    return this.database.$transaction(async (transaction) => {
      const before = await transaction.guild.findUniqueOrThrow({
        where: { discordGuildId },
      });
      const row = await transaction.guild.update({
        where: { discordGuildId },
        data: { enabled: true, disabledAt: null },
      });
      await new PrismaPermissionAuditRepository(transaction).append(audit, {
        beforeSnapshot: guildSnapshot(before),
        afterSnapshot: guildSnapshot(row),
      });
      return mapGuild(row);
    });
  }

  private async auditOwnerRejection(
    error: unknown,
    audit: PermissionAuditInput,
  ): Promise<void> {
    if (!(error instanceof OwnerInvariantViolationError)) return;
    await new PrismaPermissionAuditRepository(this.database).append(
      { ...audit, action: "owner-protection-rejection" },
      { afterSnapshot: rejectionSnapshot(audit.action, error) },
    );
  }
}

/** Prisma-backed Discord principal repository isolated by guild identity. */
export class PrismaPermissionPrincipalRepository implements PermissionPrincipalRepository {
  public constructor(
    private readonly database: PrismaClient,
    private readonly ownerProtection: OwnerProtectionService = new DeterministicOwnerProtectionService(),
  ) {}

  public async getOrCreateDiscordPrincipal(
    principal: PermissionPrincipal,
    metadata: PermissionRecordMetadata = {},
  ): Promise<PersistedPermissionPrincipal> {
    const guild = await this.requireGuild(principal.guildId);
    const row = await this.database.permissionPrincipal.upsert({
      where: {
        type_guildId_externalId: {
          type: principalType(principal.type),
          guildId: guild.id,
          externalId: principal.externalId,
        },
      },
      create: {
        type: principalType(principal.type),
        guildId: guild.id,
        externalId: principal.externalId,
        metadata: jsonObject(metadata),
      },
      update: {},
      include: { guild: true },
    });
    return mapPrincipal(row);
  }

  public async updateMetadata(
    principal: PermissionPrincipal,
    metadata: PermissionRecordMetadata,
  ): Promise<PersistedPermissionPrincipal> {
    return this.update(principal, { metadata: jsonObject(metadata) });
  }

  public async disable(
    principal: PermissionPrincipal,
    context: PermissionOperationContext,
  ): Promise<PersistedPermissionPrincipal> {
    const audit = infrastructureAudit(context, "disable-principal", {
      target: principal,
    });
    try {
      return await this.database.$transaction(async (transaction) =>
        this.ownerProtection.protect(
          { target: { type: "principal", principal }, now: audit.occurredAt },
          ownerProtectionContext(transaction),
          async () => {
            const existing = await requirePrincipalRow(transaction, principal);
            const row = await transaction.permissionPrincipal.update({
              where: { id: existing.id },
              data: { enabled: false, disabledAt: audit.occurredAt },
              include: { guild: true },
            });
            await new PrismaPermissionAuditRepository(transaction).append(
              audit,
              {
                beforeSnapshot: principalSnapshot(existing),
                afterSnapshot: principalSnapshot(row),
              },
            );
            return mapPrincipal(row);
          },
        ),
      );
    } catch (error) {
      if (error instanceof OwnerInvariantViolationError)
        await new PrismaPermissionAuditRepository(this.database).append(
          { ...audit, action: "owner-protection-rejection" },
          { afterSnapshot: rejectionSnapshot(audit.action, error) },
        );
      throw error;
    }
  }

  public async enable(
    principal: PermissionPrincipal,
    context: PermissionOperationContext,
  ): Promise<PersistedPermissionPrincipal> {
    const audit = infrastructureAudit(context, "enable-principal", {
      target: principal,
    });
    return this.database.$transaction(async (transaction) => {
      const existing = await requirePrincipalRow(transaction, principal);
      const row = await transaction.permissionPrincipal.update({
        where: { id: existing.id },
        data: { enabled: true, disabledAt: null },
        include: { guild: true },
      });
      await new PrismaPermissionAuditRepository(transaction).append(audit, {
        beforeSnapshot: principalSnapshot(existing),
        afterSnapshot: principalSnapshot(row),
      });
      return mapPrincipal(row);
    });
  }

  public async findDiscordUser(
    guildId: string,
    externalId: string,
  ): Promise<PersistedPermissionPrincipal | undefined> {
    return this.find("discord-user", guildId, externalId);
  }

  public async findDiscordRole(
    guildId: string,
    externalId: string,
  ): Promise<PersistedPermissionPrincipal | undefined> {
    return this.find("discord-role", guildId, externalId);
  }

  private async find(
    type: PermissionPrincipal["type"],
    guildId: string,
    externalId: string,
  ): Promise<PersistedPermissionPrincipal | undefined> {
    const row = await this.database.permissionPrincipal.findFirst({
      where: {
        type: principalType(type),
        externalId,
        guild: { discordGuildId: guildId },
      },
      include: { guild: true },
    });
    return row ? mapPrincipal(row) : undefined;
  }

  private async update(
    principal: PermissionPrincipal,
    data: Prisma.PermissionPrincipalUpdateInput,
  ): Promise<PersistedPermissionPrincipal> {
    const existing = await this.find(
      principal.type,
      principal.guildId,
      principal.externalId,
    );
    if (!existing) throw new Error("Permission principal does not exist.");
    return mapPrincipal(
      await this.database.permissionPrincipal.update({
        where: { id: existing.id },
        data,
        include: { guild: true },
      }),
    );
  }

  private async requireGuild(discordGuildId: string) {
    const guild = await this.database.guild.findUnique({
      where: { discordGuildId },
    });
    if (!guild) throw new Error("Discord guild does not exist.");
    return guild;
  }
}

/** Prisma-backed catalog singleton repository. */
export class PrismaPermissionCatalogRepository implements PermissionCatalogRepository {
  public constructor(private readonly database: DatabaseContext) {}

  public async current() {
    const row = await this.database.permissionCatalogState.findUnique({
      where: { id: "compiled-permission-catalog" },
    });
    return row
      ? { version: row.version, checksum: row.checksum, syncedAt: row.syncedAt }
      : undefined;
  }

  public async update(
    version: string,
    checksum: string,
    syncedAt = new Date(),
  ) {
    const row = await this.database.permissionCatalogState.upsert({
      where: { id: "compiled-permission-catalog" },
      create: {
        id: "compiled-permission-catalog",
        version,
        checksum,
        syncedAt,
      },
      update: { version, checksum, syncedAt },
    });
    return {
      version: row.version,
      checksum: row.checksum,
      syncedAt: row.syncedAt,
    };
  }
}

/** Prisma-backed definition repository synchronized from the compiled catalog. */
export class PrismaPermissionDefinitionRepository implements PermissionDefinitionRepository {
  public constructor(
    private readonly client: PrismaClient,
    private readonly ownerProtection: OwnerProtectionService = new DeterministicOwnerProtectionService(),
  ) {}

  public async synchronizeCatalog(
    catalog: PermissionCatalogSnapshot,
    _reason: PermissionMutationReason,
    now = new Date(),
  ): Promise<PermissionCatalogSynchronizationResult> {
    if (
      catalog.version !== permissionCatalog.version ||
      catalog.checksum !== permissionCatalog.checksum ||
      catalog.permissions.length !== permissionCatalog.permissions.length ||
      catalog.permissions.some(
        (key, index) => key !== permissionCatalog.permissions[index],
      )
    ) {
      throw new Error(
        "Permission catalog version, checksum, or identifiers do not match the compiled authority.",
      );
    }
    return this.client.$transaction(async (transaction) => {
      const persisted = await transaction.permissionDefinition.findMany({
        select: { key: true },
      });
      const known = new Set<string>(catalog.permissions);
      const unknownKeys = persisted
        .map(({ key }) => key)
        .filter((key) => !known.has(key))
        .sort();
      if (unknownKeys.length > 0)
        throw new UnknownPermissionCatalogEntriesError(unknownKeys);

      await transaction.permissionDefinition.createMany({
        data: catalog.permissions.map((key) => ({ key })),
        skipDuplicates: true,
      });
      await new PrismaPermissionCatalogRepository(transaction).update(
        catalog.version,
        catalog.checksum,
        now,
      );
      return {
        status: permissionCatalogStatus(catalog.version, catalog.checksum),
        unknownKeys: [],
        synchronizedDefinitions: catalog.permissions.length,
      };
    });
  }

  public async findByKey(
    key: string,
  ): Promise<PersistedPermissionDefinition | undefined> {
    const row = await this.client.permissionDefinition.findUnique({
      where: { key },
    });
    return row ? mapDefinition(row) : undefined;
  }

  public async findUnknownKeys(
    compiledKeys: readonly string[],
  ): Promise<readonly string[]> {
    const rows = await this.client.permissionDefinition.findMany({
      where: { key: { notIn: [...compiledKeys] } },
      select: { key: true },
      orderBy: { key: "asc" },
    });
    return rows.map(({ key }) => key);
  }

  public async currentSynchronizationStatus(
    catalog: PermissionCatalogSnapshot,
  ) {
    const state = await new PrismaPermissionCatalogRepository(
      this.client,
    ).current();
    return permissionCatalogStatus(state?.version, state?.checksum);
  }

  public async disable(
    key: string,
    context: PermissionOperationContext,
  ): Promise<PersistedPermissionDefinition> {
    requirePermission(key);
    const audit = infrastructureAudit(context, "disable-definition");
    try {
      return await this.client.$transaction(async (transaction) => {
        const operation = async () => {
          const before =
            await transaction.permissionDefinition.findUniqueOrThrow({
              where: { key },
            });
          const row = await transaction.permissionDefinition.update({
            where: { key },
            data: { enabled: false, disabledAt: audit.occurredAt },
          });
          await new PrismaPermissionAuditRepository(transaction).append(audit, {
            permissionKey: key,
            beforeSnapshot: definitionSnapshot(before),
            afterSnapshot: definitionSnapshot(row),
          });
          return mapDefinition(row);
        };
        return key === "platform.owner"
          ? this.ownerProtection.protect(
              {
                target: {
                  type: "permission-definition",
                  permission: "platform.owner",
                },
                now: audit.occurredAt,
              },
              ownerProtectionContext(transaction),
              operation,
            )
          : operation();
      });
    } catch (error) {
      if (error instanceof OwnerInvariantViolationError)
        await new PrismaPermissionAuditRepository(this.client).append(
          { ...audit, action: "owner-protection-rejection" },
          {
            permissionKey: key,
            afterSnapshot: rejectionSnapshot(audit.action, error),
          },
        );
      throw error;
    }
  }

  public async enable(
    key: string,
    context: PermissionOperationContext,
  ): Promise<PersistedPermissionDefinition> {
    requirePermission(key);
    const audit = infrastructureAudit(context, "enable-definition");
    return this.client.$transaction(async (transaction) => {
      const before = await transaction.permissionDefinition.findUniqueOrThrow({
        where: { key },
      });
      const row = await transaction.permissionDefinition.update({
        where: { key },
        data: { enabled: true, disabledAt: null },
      });
      await new PrismaPermissionAuditRepository(transaction).append(audit, {
        permissionKey: key,
        beforeSnapshot: definitionSnapshot(before),
        afterSnapshot: definitionSnapshot(row),
      });
      return mapDefinition(row);
    });
  }
}

/** Prisma append-only audit repository; database triggers reject mutation. */
export class PrismaPermissionAuditRepository implements PermissionAuditRepository {
  public constructor(private readonly database: DatabaseContext) {}

  public async append(
    audit: PermissionAuditInput,
    details: {
      readonly assignmentId?: string;
      readonly permissionKey?: string;
      readonly beforeSnapshot?: PermissionRecordMetadata;
      readonly afterSnapshot?: PermissionRecordMetadata;
    } = {},
  ): Promise<PersistedPermissionAuditEvent> {
    const data = await auditCreateData(this.database, audit, details);
    return mapAudit(await this.database.permissionAuditEvent.create({ data }));
  }

  public async findByCorrelationId(
    correlationId: string,
  ): Promise<readonly PersistedPermissionAuditEvent[]> {
    const rows = await this.database.permissionAuditEvent.findMany({
      where: { correlationId },
      orderBy: { occurredAt: "asc" },
    });
    return rows.map(mapAudit);
  }
}

/** Prisma-backed assignment repository with atomic mutation plus audit writes. */
export class PrismaPermissionRepository
  implements PermissionRepository, PermissionAssignmentAdministrationRepository
{
  public constructor(
    private readonly client: PrismaClient,
    private readonly ownerProtection: OwnerProtectionService,
    private readonly invalidations?: PermissionCacheInvalidationPublisher,
  ) {}

  public async findAssignments(
    query: PermissionAssignmentQuery,
  ): Promise<readonly PermissionAssignment[]> {
    if (query.principals.length === 0) return [];
    const rows = await this.client.permissionAssignment.findMany({
      where: {
        ...activeEntityWhere(),
        OR: query.principals.map((principal) => principalWhere(principal)),
        ...scopeWhere(query.scope),
      },
      include: assignmentInclude,
      orderBy: { createdAt: "asc" },
    });
    return rows.map(mapAssignment);
  }

  public async findAssignment(
    assignmentId: string,
  ): Promise<PermissionAssignment | undefined> {
    const row = await this.client.permissionAssignment.findUnique({
      where: { id: assignmentId },
      include: assignmentInclude,
    });
    return row ? mapAssignment(row) : undefined;
  }

  public async applyMutation(
    mutation: PermissionMutation,
    audit: PermissionAuditInput,
  ): Promise<PermissionMutationResult> {
    if (mutation.type !== "set-assignment" && !mutation.correlationId)
      throw new PermissionMutationAuthorizationError(
        "Privileged permission mutations require a correlationId.",
      );
    let result: PermissionMutationResult;
    try {
      result = await this.client.$transaction(async (transaction) => {
        if (mutation.type === "set-assignment")
          return this.setAssignment(transaction, mutation, audit);
        return this.ownerProtection.protect(
          {
            target: {
              type: "assignment",
              assignmentId: mutation.assignmentId,
              ...(mutation.type === "expire-assignment"
                ? { expiresAt: mutation.expiresAt }
                : {}),
            },
            now: audit.occurredAt,
          },
          ownerProtectionContext(transaction),
          () => this.mutateExistingAssignment(transaction, mutation, audit),
        );
      });
    } catch (error) {
      if (
        error instanceof OwnerInvariantViolationError ||
        error instanceof PermissionMutationAuthorizationError
      )
        await this.recordRejectedMutation(mutation, audit, error.code);
      throw error;
    }
    await this.invalidations?.publish({
      scopes: result.affectedScopes,
      occurredAt: audit.occurredAt,
      correlationId: audit.correlationId,
    });
    return result;
  }

  public async countActiveOwners(now: Date): Promise<number> {
    return this.client.permissionAssignment.count({
      where: {
        ...activeEntityWhere(now),
        scope: PermissionScopeType.PLATFORM,
        effect: PermissionAssignmentEffect.ALLOW,
        permissionDefinition: { key: "platform.owner", enabled: true },
      },
    });
  }

  public async isActiveOwner(
    principal: PermissionPrincipal,
    now: Date,
  ): Promise<boolean> {
    return (
      (await this.client.permissionAssignment.count({
        where: {
          ...activeEntityWhere(now),
          ...principalWhere(principal),
          scope: PermissionScopeType.PLATFORM,
          effect: PermissionAssignmentEffect.ALLOW,
          permissionDefinition: { key: "platform.owner", enabled: true },
        },
      })) > 0
    );
  }

  public async recordRejectedMutation(
    mutation: PermissionMutation,
    audit: PermissionAuditInput,
    errorCode: string,
  ): Promise<void> {
    await new PrismaPermissionAuditRepository(this.client).append(
      { ...audit, action: "owner-protection-rejection" },
      {
        ...(mutation.type === "set-assignment"
          ? mutation.selector.type === "permission"
            ? { permissionKey: mutation.selector.permission }
            : {}
          : { assignmentId: mutation.assignmentId }),
        afterSnapshot: {
          outcome: "rejected",
          attemptedAction: mutation.type,
          errorCode,
        },
      },
    );
  }

  public async findByPrincipal(
    principal: PermissionPrincipal,
    includeHistorical = false,
  ) {
    return this.findMany({ principal, includeHistorical });
  }

  public async findByPermission(permission: string, includeHistorical = false) {
    return this.findMany({ permission, includeHistorical });
  }

  public async findActive(filters: PermissionAssignmentFilters = {}) {
    return this.findMany({
      ...filters,
      activeAt: filters.activeAt ?? new Date(),
    });
  }

  public async findHistorical(filters: PermissionAssignmentFilters = {}) {
    return this.findMany({ ...filters, includeHistorical: true });
  }

  public async findExpired(
    expiredAt = new Date(),
    filters: PermissionAssignmentFilters = {},
  ) {
    const rows = await this.client.permissionAssignment.findMany({
      where: {
        ...(filters.principal ? principalWhere(filters.principal) : {}),
        ...(filters.permission
          ? { permissionDefinition: { key: filters.permission } }
          : {}),
        ...(filters.scope ? scopeWhere(filters.scope) : {}),
        ...(filters.effect ? { effect: effectType(filters.effect) } : {}),
        expiresAt: { lte: expiredAt },
      },
      include: assignmentInclude,
      orderBy: { expiresAt: "asc" },
    });
    return rows.map(mapAssignment);
  }

  private async setAssignment(
    transaction: Prisma.TransactionClient,
    mutation: Extract<PermissionMutation, { type: "set-assignment" }>,
    audit: PermissionAuditInput,
  ): Promise<PermissionMutationResult> {
    if (mutation.selector.type !== "permission")
      throw new Error("Permission groups are not supported by persistence.");
    const elevated =
      mutation.selector.permission === "platform.owner" ||
      mutation.selector.permission === "platform.admin";
    if (elevated && !mutation.correlationId)
      throw new PermissionMutationAuthorizationError(
        "Privileged permission mutations require a correlationId.",
      );
    if (
      elevated &&
      mutation.actor.type === "principal" &&
      samePrincipal(mutation.actor.principal, mutation.target)
    )
      throw new PermissionMutationAuthorizationError(
        "A principal cannot grant elevated permission to itself.",
      );
    if (
      mutation.selector.permission === "platform.owner" &&
      mutation.actor.type === "principal" &&
      !(await isActiveOwnerInTransaction(
        transaction,
        mutation.actor.principal,
        audit.occurredAt,
      ))
    )
      throw new PermissionMutationAuthorizationError(
        "Only an active owner may grant platform.owner.",
      );
    const principal = await findPrincipalRow(transaction, mutation.target);
    if (!principal || !principal.enabled || !principal.guild.enabled)
      throw new Error("Permission principal is unavailable or disabled.");
    const definition = await transaction.permissionDefinition.findUnique({
      where: { key: mutation.selector.permission },
    });
    if (!definition || !definition.enabled)
      throw new Error("Permission definition is unavailable or disabled.");
    const guild =
      mutation.scope.type === "discord-guild"
        ? await transaction.guild.findUnique({
            where: { discordGuildId: mutation.scope.guildId },
          })
        : undefined;
    if (mutation.scope.type === "discord-guild" && (!guild || !guild.enabled))
      throw new Error("Permission scope guild is unavailable or disabled.");

    const existing = await transaction.permissionAssignment.findFirst({
      where: {
        principalId: principal.id,
        permissionDefinitionId: definition.id,
        scope: scopeType(mutation.scope),
        guildId: guild?.id ?? null,
        effect: effectType(mutation.effect),
        enabled: true,
        revokedAt: null,
      },
      include: assignmentInclude,
    });
    const beforeSnapshot = existing ? assignmentSnapshot(existing) : undefined;
    let row: AssignmentRow;
    if (existing) {
      row = await transaction.permissionAssignment.update({
        where: { id: existing.id },
        data: { expiresAt: mutation.expiresAt ?? null },
        include: assignmentInclude,
      });
    } else {
      row = await transaction.permissionAssignment.create({
        data: {
          principalId: principal.id,
          permissionDefinitionId: definition.id,
          scope: scopeType(mutation.scope),
          guildId: guild?.id ?? null,
          effect: effectType(mutation.effect),
          ...(mutation.expiresAt ? { expiresAt: mutation.expiresAt } : {}),
        },
        include: assignmentInclude,
      });
    }
    await new PrismaPermissionAuditRepository(transaction).append(audit, {
      assignmentId: row.id,
      permissionKey: definition.key,
      ...(beforeSnapshot ? { beforeSnapshot } : {}),
      afterSnapshot: assignmentSnapshot(row),
    });
    return { assignment: mapAssignment(row), affectedScopes: [mutation.scope] };
  }

  private async mutateExistingAssignment(
    transaction: Prisma.TransactionClient,
    mutation: Exclude<PermissionMutation, { type: "set-assignment" }>,
    audit: PermissionAuditInput,
  ): Promise<PermissionMutationResult> {
    const existing = await transaction.permissionAssignment.findUnique({
      where: { id: mutation.assignmentId },
      include: assignmentInclude,
    });
    if (!existing) return { affectedScopes: [] };
    const data: Prisma.PermissionAssignmentUpdateInput =
      mutation.type === "enable-assignment"
        ? { enabled: true, revokedAt: null }
        : mutation.type === "expire-assignment"
          ? { expiresAt: mutation.expiresAt }
          : { enabled: false, revokedAt: audit.occurredAt };
    const row = await transaction.permissionAssignment.update({
      where: { id: mutation.assignmentId },
      data,
      include: assignmentInclude,
    });
    await new PrismaPermissionAuditRepository(transaction).append(audit, {
      assignmentId: mutation.assignmentId,
      permissionKey: existing.permissionDefinition.key,
      beforeSnapshot: assignmentSnapshot(existing),
      afterSnapshot: assignmentSnapshot(row),
    });
    return {
      ...(mutation.type === "enable-assignment" ||
      mutation.type === "expire-assignment"
        ? { assignment: mapAssignment(row) }
        : {}),
      affectedScopes: [mapAssignment(existing).scope],
    };
  }

  private async findMany(filters: PermissionAssignmentFilters) {
    const where: Prisma.PermissionAssignmentWhereInput = {
      ...(filters.principal ? principalWhere(filters.principal) : {}),
      ...(filters.permission
        ? { permissionDefinition: { key: filters.permission } }
        : {}),
      ...(filters.scope ? scopeWhere(filters.scope) : {}),
      ...(filters.effect ? { effect: effectType(filters.effect) } : {}),
      ...(filters.includeHistorical ? {} : activeEntityWhere(filters.activeAt)),
    };
    const rows = await this.client.permissionAssignment.findMany({
      where,
      include: assignmentInclude,
      orderBy: { createdAt: "asc" },
    });
    return rows.map(mapAssignment);
  }
}

/** Process-local invalidation publisher/subscriber used until Redis is approved. */
export class InMemoryPermissionInvalidationBus
  implements
    PermissionCacheInvalidationPublisher,
    PermissionCacheInvalidationSubscriber
{
  private readonly listeners = new Set<
    (event: PermissionCacheInvalidationEvent) => Promise<void>
  >();

  public async publish(event: PermissionCacheInvalidationEvent): Promise<void> {
    await Promise.all([...this.listeners].map((listener) => listener(event)));
  }

  public subscribe(
    listener: (event: PermissionCacheInvalidationEvent) => Promise<void>,
  ): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

function activeEntityWhere(
  now = new Date(),
): Prisma.PermissionAssignmentWhereInput {
  return {
    enabled: true,
    revokedAt: null,
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    principal: { enabled: true, guild: { enabled: true } },
    permissionDefinition: { enabled: true },
  };
}

function ownerProtectionContext(transaction: Prisma.TransactionClient) {
  return {
    async acquireMutationLock(): Promise<void> {
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended('qbox:platform-owner-mutation', 0))`;
    },
    async loadActiveOwners(
      now: Date,
    ): Promise<readonly PermissionAssignment[]> {
      const rows = await transaction.permissionAssignment.findMany({
        where: {
          ...activeEntityWhere(now),
          scope: PermissionScopeType.PLATFORM,
          effect: PermissionAssignmentEffect.ALLOW,
          permissionDefinition: { key: "platform.owner", enabled: true },
        },
        include: assignmentInclude,
        orderBy: { createdAt: "asc" },
      });
      return rows.map(mapAssignment);
    },
  };
}

function principalWhere(
  principal: PermissionPrincipal,
): Prisma.PermissionAssignmentWhereInput {
  return {
    principal: {
      type: principalType(principal.type),
      externalId: principal.externalId,
      guild: { discordGuildId: principal.guildId },
    },
  };
}

function samePrincipal(
  left: PermissionPrincipal,
  right: PermissionPrincipal,
): boolean {
  return (
    left.type === right.type &&
    left.externalId === right.externalId &&
    left.guildId === right.guildId
  );
}

async function isActiveOwnerInTransaction(
  transaction: Prisma.TransactionClient,
  principal: PermissionPrincipal,
  now: Date,
): Promise<boolean> {
  return (
    (await transaction.permissionAssignment.count({
      where: {
        ...activeEntityWhere(now),
        ...principalWhere(principal),
        scope: PermissionScopeType.PLATFORM,
        effect: PermissionAssignmentEffect.ALLOW,
        permissionDefinition: { key: "platform.owner", enabled: true },
      },
    })) > 0
  );
}

function scopeWhere(
  scope: PermissionScope,
): Prisma.PermissionAssignmentWhereInput {
  return scope.type === "platform"
    ? { scope: PermissionScopeType.PLATFORM, guildId: null }
    : {
        scope: PermissionScopeType.DISCORD_GUILD,
        guild: { discordGuildId: scope.guildId },
      };
}

async function findPrincipalRow(
  database: DatabaseContext,
  principal: PermissionPrincipal,
) {
  return database.permissionPrincipal.findFirst({
    where: {
      type: principalType(principal.type),
      externalId: principal.externalId,
      guild: { discordGuildId: principal.guildId },
    },
    include: { guild: true },
  });
}

async function auditCreateData(
  database: DatabaseContext,
  audit: PermissionAuditInput,
  details: {
    readonly assignmentId?: string;
    readonly permissionKey?: string;
    readonly beforeSnapshot?: PermissionRecordMetadata;
    readonly afterSnapshot?: PermissionRecordMetadata;
  },
): Promise<Prisma.PermissionAuditEventUncheckedCreateInput> {
  const actorPrincipal =
    audit.actor.type === "principal"
      ? await findPrincipalRow(database, audit.actor.principal)
      : undefined;
  if (audit.actor.type === "principal" && !actorPrincipal)
    throw new Error("Audit actor principal does not exist.");
  const targetPrincipal = audit.target
    ? await findPrincipalRow(database, audit.target)
    : undefined;
  const scopeGuild =
    audit.scope?.type === "discord-guild"
      ? await database.guild.findUnique({
          where: { discordGuildId: audit.scope.guildId },
        })
      : undefined;
  const definition = details.permissionKey
    ? await database.permissionDefinition.findUnique({
        where: { key: details.permissionKey },
      })
    : undefined;
  return {
    action: auditAction(audit.action),
    actorType:
      audit.actor.type === "principal"
        ? PermissionAuditActorType.PRINCIPAL
        : PermissionAuditActorType.SYSTEM,
    actorPrincipalId: actorPrincipal?.id ?? null,
    actorPrincipalType:
      audit.actor.type === "principal"
        ? principalType(audit.actor.principal.type)
        : null,
    actorExternalId:
      audit.actor.type === "principal"
        ? audit.actor.principal.externalId
        : null,
    actorGuildDiscordId:
      audit.actor.type === "principal" ? audit.actor.principal.guildId : null,
    actorService: audit.actor.type === "system" ? audit.actor.service : null,
    targetPrincipalId: targetPrincipal?.id ?? null,
    targetPrincipalType: audit.target ? principalType(audit.target.type) : null,
    targetExternalId: audit.target?.externalId ?? null,
    targetGuildDiscordId: audit.target?.guildId ?? null,
    scope: audit.scope ? scopeType(audit.scope) : null,
    scopeGuildId: scopeGuild?.id ?? null,
    scopeGuildDiscordId:
      audit.scope?.type === "discord-guild" ? audit.scope.guildId : null,
    permissionDefinitionId: definition?.id ?? null,
    permissionKey: details.permissionKey ?? null,
    assignmentId: details.assignmentId ?? null,
    reasonCode: reasonCode(audit.reasonCode),
    reason: audit.reason ?? null,
    correlationId: audit.correlationId,
    beforeSnapshot: details.beforeSnapshot
      ? jsonObject(details.beforeSnapshot)
      : Prisma.JsonNull,
    afterSnapshot: details.afterSnapshot
      ? jsonObject(details.afterSnapshot)
      : Prisma.JsonNull,
    occurredAt: audit.occurredAt,
  };
}

function mapAssignment(row: AssignmentRow): PermissionAssignment {
  const permission = requirePermission(row.permissionDefinition.key);
  const scope: PermissionScope =
    row.scope === PermissionScopeType.PLATFORM
      ? { type: "platform" }
      : { type: "discord-guild", guildId: required(row.guild?.discordGuildId) };
  return {
    id: row.id,
    principal: {
      type: domainPrincipalType(row.principal.type),
      externalId: row.principal.externalId,
      guildId: row.principal.guild.discordGuildId,
    },
    selector: { type: "permission", permission },
    scope,
    effect: row.effect === PermissionAssignmentEffect.ALLOW ? "allow" : "deny",
    enabled: row.enabled,
    ...(row.expiresAt ? { expiresAt: row.expiresAt } : {}),
  };
}

function mapGuild(row: {
  id: string;
  discordGuildId: string;
  metadata: Prisma.JsonValue;
  enabled: boolean;
  disabledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): PersistedGuild {
  return {
    id: row.id,
    discordGuildId: row.discordGuildId,
    metadata: metadataObject(row.metadata),
    enabled: row.enabled,
    ...(row.disabledAt ? { disabledAt: row.disabledAt } : {}),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapPrincipal(row: {
  id: string;
  type: PermissionPrincipalType;
  externalId: string;
  metadata: Prisma.JsonValue;
  enabled: boolean;
  disabledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  guild: { discordGuildId: string };
}): PersistedPermissionPrincipal {
  return {
    id: row.id,
    principal: {
      type: domainPrincipalType(row.type),
      externalId: row.externalId,
      guildId: row.guild.discordGuildId,
    },
    metadata: metadataObject(row.metadata),
    enabled: row.enabled,
    ...(row.disabledAt ? { disabledAt: row.disabledAt } : {}),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapDefinition(row: {
  id: string;
  key: string;
  description: string | null;
  category: string | null;
  enabled: boolean;
  disabledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): PersistedPermissionDefinition {
  return {
    id: row.id,
    key: row.key,
    ...(row.description ? { description: row.description } : {}),
    ...(row.category ? { category: row.category } : {}),
    enabled: row.enabled,
    ...(row.disabledAt ? { disabledAt: row.disabledAt } : {}),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapAudit(row: {
  id: string;
  action: PermissionAuditAction;
  actorType: PermissionAuditActorType;
  actorPrincipalType: PermissionPrincipalType | null;
  actorExternalId: string | null;
  actorGuildDiscordId: string | null;
  actorService: string | null;
  targetPrincipalType: PermissionPrincipalType | null;
  targetExternalId: string | null;
  targetGuildDiscordId: string | null;
  scope: PermissionScopeType | null;
  scopeGuildDiscordId: string | null;
  reasonCode: PermissionMutationReasonCode;
  reason: string | null;
  correlationId: string;
  occurredAt: Date;
  createdAt: Date;
  assignmentId: string | null;
  permissionKey: string | null;
  beforeSnapshot: Prisma.JsonValue | null;
  afterSnapshot: Prisma.JsonValue | null;
}): PersistedPermissionAuditEvent {
  const actor =
    row.actorType === PermissionAuditActorType.SYSTEM
      ? { type: "system" as const, service: required(row.actorService) }
      : {
          type: "principal" as const,
          principal: {
            type: domainPrincipalType(required(row.actorPrincipalType)),
            externalId: required(row.actorExternalId),
            guildId: required(row.actorGuildDiscordId),
          },
        };
  const target =
    row.targetPrincipalType && row.targetExternalId && row.targetGuildDiscordId
      ? {
          type: domainPrincipalType(row.targetPrincipalType),
          externalId: row.targetExternalId,
          guildId: row.targetGuildDiscordId,
        }
      : undefined;
  const scope =
    row.scope === PermissionScopeType.PLATFORM
      ? { type: "platform" as const }
      : row.scope === PermissionScopeType.DISCORD_GUILD
        ? {
            type: "discord-guild" as const,
            guildId: required(row.scopeGuildDiscordId),
          }
        : undefined;
  return {
    id: row.id,
    audit: {
      correlationId: row.correlationId,
      action: domainAuditAction(row.action),
      actor,
      reasonCode: domainReasonCode(row.reasonCode),
      ...(row.reason ? { reason: row.reason } : {}),
      ...(target ? { target } : {}),
      ...(scope ? { scope } : {}),
      occurredAt: row.occurredAt,
    },
    ...(row.assignmentId ? { assignmentId: row.assignmentId } : {}),
    ...(row.permissionKey ? { permissionKey: row.permissionKey } : {}),
    ...(row.beforeSnapshot
      ? { beforeSnapshot: metadataObject(row.beforeSnapshot) }
      : {}),
    ...(row.afterSnapshot
      ? { afterSnapshot: metadataObject(row.afterSnapshot) }
      : {}),
    createdAt: row.createdAt,
  };
}

function assignmentSnapshot(row: AssignmentRow): PermissionRecordMetadata {
  return {
    id: row.id,
    enabled: row.enabled,
    effect: row.effect,
    scope: row.scope,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
  };
}

function infrastructureAudit(
  context: PermissionOperationContext,
  action: PermissionAuditInput["action"],
  identity: Pick<PermissionAuditInput, "target" | "scope"> = {},
): PermissionAuditInput {
  if (context.correlationId.trim().length === 0)
    throw new Error("Privileged operations require a correlationId.");
  return {
    action,
    actor: context.actor,
    correlationId: context.correlationId,
    reasonCode: context.reasonCode,
    ...(context.reason ? { reason: context.reason } : {}),
    ...identity,
    occurredAt: context.occurredAt ?? new Date(),
  };
}

function rejectionSnapshot(
  attemptedAction: PermissionAuditInput["action"],
  error: OwnerInvariantViolationError,
): PermissionRecordMetadata {
  return { outcome: "rejected", attemptedAction, errorCode: error.code };
}

function guildSnapshot(row: {
  id: string;
  discordGuildId: string;
  enabled: boolean;
  disabledAt: Date | null;
}): PermissionRecordMetadata {
  return {
    id: row.id,
    discordGuildId: row.discordGuildId,
    enabled: row.enabled,
    disabledAt: row.disabledAt?.toISOString() ?? null,
  };
}

function principalSnapshot(row: {
  id: string;
  type: PermissionPrincipalType;
  externalId: string;
  enabled: boolean;
  disabledAt: Date | null;
}): PermissionRecordMetadata {
  return {
    id: row.id,
    type: domainPrincipalType(row.type),
    externalId: row.externalId,
    enabled: row.enabled,
    disabledAt: row.disabledAt?.toISOString() ?? null,
  };
}

function definitionSnapshot(row: {
  id: string;
  key: string;
  enabled: boolean;
  disabledAt: Date | null;
}): PermissionRecordMetadata {
  return {
    id: row.id,
    key: row.key,
    enabled: row.enabled,
    disabledAt: row.disabledAt?.toISOString() ?? null,
  };
}

async function requirePrincipalRow(
  database: DatabaseContext,
  principal: PermissionPrincipal,
) {
  const row = await findPrincipalRow(database, principal);
  if (!row) throw new Error("Permission principal does not exist.");
  return row;
}

function principalType(
  type: PermissionPrincipal["type"],
): PermissionPrincipalType {
  return type === "discord-user"
    ? PermissionPrincipalType.DISCORD_USER
    : PermissionPrincipalType.DISCORD_ROLE;
}

function domainPrincipalType(
  type: PermissionPrincipalType,
): PermissionPrincipal["type"] {
  return type === PermissionPrincipalType.DISCORD_USER
    ? "discord-user"
    : "discord-role";
}

function scopeType(scope: PermissionScope): PermissionScopeType {
  return scope.type === "platform"
    ? PermissionScopeType.PLATFORM
    : PermissionScopeType.DISCORD_GUILD;
}

function effectType(effect: "allow" | "deny"): PermissionAssignmentEffect {
  return effect === "allow"
    ? PermissionAssignmentEffect.ALLOW
    : PermissionAssignmentEffect.DENY;
}

function reasonCode(
  code: PermissionAuditInput["reasonCode"],
): PermissionMutationReasonCode {
  const values: Record<
    PermissionAuditInput["reasonCode"],
    PermissionMutationReasonCode
  > = {
    bootstrap: PermissionMutationReasonCode.BOOTSTRAP,
    "administrator-action": PermissionMutationReasonCode.ADMINISTRATOR_ACTION,
    "security-response": PermissionMutationReasonCode.SECURITY_RESPONSE,
    "role-synchronization": PermissionMutationReasonCode.ROLE_SYNCHRONIZATION,
    migration: PermissionMutationReasonCode.MIGRATION,
    expiration: PermissionMutationReasonCode.EXPIRATION,
    "system-maintenance": PermissionMutationReasonCode.SYSTEM_MAINTENANCE,
  };
  return values[code];
}

function auditAction(
  action: PermissionAuditInput["action"],
): PermissionAuditAction {
  const values: Record<PermissionAuditInput["action"], PermissionAuditAction> =
    {
      "set-assignment": PermissionAuditAction.SET_ASSIGNMENT,
      "revoke-assignment": PermissionAuditAction.REVOKE_ASSIGNMENT,
      "disable-assignment": PermissionAuditAction.DISABLE_ASSIGNMENT,
      "enable-assignment": PermissionAuditAction.ENABLE_ASSIGNMENT,
      "expire-assignment": PermissionAuditAction.EXPIRE_ASSIGNMENT,
      "disable-principal": PermissionAuditAction.DISABLE_PRINCIPAL,
      "enable-principal": PermissionAuditAction.ENABLE_PRINCIPAL,
      "disable-guild": PermissionAuditAction.DISABLE_GUILD,
      "enable-guild": PermissionAuditAction.ENABLE_GUILD,
      "disable-definition": PermissionAuditAction.DISABLE_DEFINITION,
      "enable-definition": PermissionAuditAction.ENABLE_DEFINITION,
      "owner-protection-rejection":
        PermissionAuditAction.OWNER_PROTECTION_REJECTION,
    };
  return values[action];
}

function domainAuditAction(
  action: PermissionAuditAction,
): PermissionAuditInput["action"] {
  const values: Record<PermissionAuditAction, PermissionAuditInput["action"]> =
    {
      [PermissionAuditAction.SET_ASSIGNMENT]: "set-assignment",
      [PermissionAuditAction.REVOKE_ASSIGNMENT]: "revoke-assignment",
      [PermissionAuditAction.DISABLE_ASSIGNMENT]: "disable-assignment",
      [PermissionAuditAction.ENABLE_ASSIGNMENT]: "enable-assignment",
      [PermissionAuditAction.EXPIRE_ASSIGNMENT]: "expire-assignment",
      [PermissionAuditAction.DISABLE_PRINCIPAL]: "disable-principal",
      [PermissionAuditAction.ENABLE_PRINCIPAL]: "enable-principal",
      [PermissionAuditAction.DISABLE_GUILD]: "disable-guild",
      [PermissionAuditAction.ENABLE_GUILD]: "enable-guild",
      [PermissionAuditAction.DISABLE_DEFINITION]: "disable-definition",
      [PermissionAuditAction.ENABLE_DEFINITION]: "enable-definition",
      [PermissionAuditAction.OWNER_PROTECTION_REJECTION]:
        "owner-protection-rejection",
    };
  return values[action];
}

function domainReasonCode(
  code: PermissionMutationReasonCode,
): PermissionAuditInput["reasonCode"] {
  return code as PermissionAuditInput["reasonCode"];
}

function jsonObject(value: PermissionRecordMetadata): Prisma.InputJsonObject {
  validateJson(value);
  return value as Prisma.InputJsonObject;
}

function metadataObject(value: Prisma.JsonValue): PermissionRecordMetadata {
  if (!value || Array.isArray(value) || typeof value !== "object")
    throw new Error("Persisted metadata must be a JSON object.");
  return Object.freeze({ ...value });
}

function validateJson(value: unknown): void {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return;
  if (typeof value === "number" && Number.isFinite(value)) return;
  if (Array.isArray(value)) {
    value.forEach(validateJson);
    return;
  }
  if (typeof value === "object") {
    Object.values(value).forEach(validateJson);
    return;
  }
  throw new Error("Metadata must contain only JSON-compatible values.");
}

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined)
    throw new Error(
      "Persisted permission record violates a required invariant.",
    );
  return value;
}
