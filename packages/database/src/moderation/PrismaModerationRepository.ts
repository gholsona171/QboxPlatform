import {
  ModerationError,
  defaultAutomod,
  type AutomodSettings,
  type CaseCreateData,
  type CaseFilter,
  type CasePatch,
  type CaseType,
  type EscalationStep,
  type ModerationCase,
  type ModerationRepository,
  type ModerationSettings,
  type ModerationSettingsInput,
  type ModerationStats,
} from "@qbox/moderation";
import type { Prisma, PrismaClient } from "@qbox/prisma";

type Client = Pick<PrismaClient, "moderationSettings" | "moderationCase">;
type SettingsRow = Prisma.ModerationSettingsGetPayload<object>;
type CaseRow = Prisma.ModerationCaseGetPayload<object>;

/** PostgreSQL moderation settings and cases. `guildId` is the Discord guild ID. */
export class PrismaModerationRepository implements ModerationRepository {
  public constructor(private readonly client: Client) {}

  public async getSettings(guildId: string): Promise<ModerationSettings | undefined> {
    const row = await this.client.moderationSettings.findUnique({ where: { guildId } });
    return row ? mapSettings(row) : undefined;
  }

  public async saveSettings(input: ModerationSettingsInput): Promise<ModerationSettings> {
    const data = {
      logChannelId: input.logChannelId ?? null,
      dmOnAction: input.dmOnAction,
      dmIncludeModerator: input.dmIncludeModerator,
      appealMessage: input.appealMessage ?? null,
      requireReason: input.requireReason,
      defaultTimeoutMinutes: input.defaultTimeoutMinutes,
      banDeleteMessageHours: input.banDeleteMessageHours,
      warningExpiryDays: input.warningExpiryDays,
      protectedRoleIds: [...input.protectedRoleIds],
      escalation: input.escalation.map((step) => ({ ...step })) as Prisma.InputJsonValue,
      automod: JSON.parse(JSON.stringify(input.automod)) as Prisma.InputJsonValue,
      recordExternalActions: input.recordExternalActions,
    };
    const existing = await this.client.moderationSettings.findUnique({ where: { guildId: input.guildId }, select: { revision: true } });
    if (!existing) {
      if (input.expectedRevision !== undefined && input.expectedRevision !== 0)
        throw new ModerationError("CONFLICT", "Moderation settings changed since they were loaded.", { currentRevision: 0 });
      return mapSettings(await this.client.moderationSettings.create({ data: { guildId: input.guildId, ...data } }));
    }
    const result = await this.client.moderationSettings.updateMany({
      where: { guildId: input.guildId, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
      data: { ...data, revision: { increment: 1 } },
    });
    if (result.count === 0)
      throw new ModerationError("CONFLICT", "Moderation settings changed since they were loaded.", { currentRevision: existing.revision });
    return mapSettings(await this.client.moderationSettings.findUniqueOrThrow({ where: { guildId: input.guildId } }));
  }

  public async allocateCaseNumber(guildId: string): Promise<number> {
    const row = await this.client.moderationSettings.upsert({
      where: { guildId },
      create: { guildId, nextCaseNumber: 2, protectedRoleIds: [], revision: 0 },
      update: { nextCaseNumber: { increment: 1 } },
      select: { nextCaseNumber: true },
    });
    return row.nextCaseNumber - 1;
  }

  public async createCase(input: CaseCreateData): Promise<ModerationCase> {
    return mapCase(await this.client.moderationCase.create({
      data: {
        guildId: input.guildId,
        number: input.number,
        type: input.type,
        targetId: input.targetId,
        targetName: input.targetName,
        moderatorId: input.moderatorId,
        moderatorName: input.moderatorName,
        reason: input.reason ?? null,
        durationMinutes: input.durationMinutes ?? null,
        expiresAt: input.expiresAt ?? null,
        active: input.active,
        source: input.source,
        evidence: [...input.evidence],
        dmDelivered: input.dmDelivered ?? null,
      },
    }));
  }

  public async getCase(guildId: string, number: number): Promise<ModerationCase | undefined> {
    const row = await this.client.moderationCase.findUnique({ where: { guildId_number: { guildId, number } } });
    return row ? mapCase(row) : undefined;
  }

  public async listCases(filter: CaseFilter): Promise<readonly ModerationCase[]> {
    const search = filter.search?.trim();
    const searchNumber = search && /^#?\d{1,9}$/.test(search) ? Number(search.replace("#", "")) : undefined;
    const rows = await this.client.moderationCase.findMany({
      where: {
        guildId: filter.guildId,
        ...(filter.types ? { type: { in: [...filter.types] } } : {}),
        ...(filter.targetId ? { targetId: filter.targetId } : {}),
        ...(filter.moderatorId ? { moderatorId: filter.moderatorId } : {}),
        ...(filter.active === undefined ? {} : { active: filter.active }),
        ...(filter.source ? { source: filter.source } : {}),
        ...(search
          ? {
              OR: [
                ...(searchNumber === undefined ? [] : [{ number: searchNumber }]),
                { targetName: { contains: search, mode: "insensitive" as const } },
                { reason: { contains: search, mode: "insensitive" as const } },
                { targetId: search },
              ],
            }
          : {}),
      },
      orderBy: { number: "desc" },
      take: filter.limit ?? 50,
    });
    return rows.map(mapCase);
  }

  public async updateCase(id: string, patch: CasePatch): Promise<ModerationCase> {
    const data: Prisma.ModerationCaseUpdateInput = {};
    if (patch.reason !== undefined) data.reason = patch.reason;
    if (patch.active !== undefined) data.active = patch.active;
    if (patch.logMessageId !== undefined) data.logMessageId = patch.logMessageId;
    if (patch.revokedAt !== undefined) data.revokedAt = patch.revokedAt;
    if (patch.revokedById !== undefined) data.revokedById = patch.revokedById;
    if (patch.revokeReason !== undefined) data.revokeReason = patch.revokeReason;
    if (patch.evidence !== undefined) data.evidence = [...patch.evidence];
    return mapCase(await this.client.moderationCase.update({ where: { id }, data }));
  }

  public async listExpired(types: readonly CaseType[], now: Date): Promise<readonly ModerationCase[]> {
    const rows = await this.client.moderationCase.findMany({
      where: { type: { in: [...types] }, active: true, expiresAt: { lte: now } },
      orderBy: { expiresAt: "asc" },
      take: 200,
    });
    return rows.map(mapCase);
  }

  public countActiveWarnings(guildId: string, targetId: string, since?: Date): Promise<number> {
    return this.client.moderationCase.count({
      where: { guildId, targetId, type: "WARN", active: true, revokedAt: null, ...(since ? { createdAt: { gte: since } } : {}) },
    });
  }

  public async stats(guildId: string, now: Date): Promise<ModerationStats> {
    const [byType, total, recent, activeBans, activeTimeouts, moderators, automod] = await Promise.all([
      this.client.moderationCase.groupBy({ by: ["type"], where: { guildId }, _count: { _all: true } }),
      this.client.moderationCase.count({ where: { guildId } }),
      this.client.moderationCase.count({ where: { guildId, createdAt: { gte: new Date(now.getTime() - 7 * 86_400_000) } } }),
      this.client.moderationCase.count({ where: { guildId, type: "BAN", active: true } }),
      this.client.moderationCase.count({ where: { guildId, type: "TIMEOUT", active: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } }),
      this.client.moderationCase.groupBy({
        by: ["moderatorId", "moderatorName"],
        where: { guildId, source: { in: ["DISCORD", "WEB"] } },
        _count: { _all: true },
        orderBy: { _count: { moderatorId: "desc" } },
        take: 10,
      }),
      this.client.moderationCase.count({ where: { guildId, source: "AUTOMOD" } }),
    ]);
    return {
      total,
      last7Days: recent,
      byType: Object.fromEntries(byType.map((row) => [row.type, row._count._all])),
      activeBans,
      activeTimeouts,
      topModerators: moderators.map((row) => ({ userId: row.moderatorId, name: row.moderatorName, cases: row._count._all })),
      automodActions: automod,
    };
  }
}

function mapSettings(row: SettingsRow): ModerationSettings {
  return {
    guildId: row.guildId,
    ...(row.logChannelId ? { logChannelId: row.logChannelId } : {}),
    dmOnAction: row.dmOnAction,
    dmIncludeModerator: row.dmIncludeModerator,
    ...(row.appealMessage ? { appealMessage: row.appealMessage } : {}),
    requireReason: row.requireReason,
    defaultTimeoutMinutes: row.defaultTimeoutMinutes,
    banDeleteMessageHours: row.banDeleteMessageHours,
    warningExpiryDays: row.warningExpiryDays,
    protectedRoleIds: row.protectedRoleIds,
    escalation: parseEscalation(row.escalation),
    automod: parseAutomod(row.automod),
    recordExternalActions: row.recordExternalActions,
    revision: row.revision,
  };
}

function mapCase(row: CaseRow): ModerationCase {
  return {
    id: row.id,
    guildId: row.guildId,
    number: row.number,
    type: row.type,
    targetId: row.targetId,
    targetName: row.targetName,
    moderatorId: row.moderatorId,
    moderatorName: row.moderatorName,
    ...(row.reason === null ? {} : { reason: row.reason }),
    ...(row.durationMinutes === null ? {} : { durationMinutes: row.durationMinutes }),
    ...(row.expiresAt === null ? {} : { expiresAt: row.expiresAt }),
    active: row.active,
    source: row.source,
    evidence: row.evidence,
    ...(row.dmDelivered === null ? {} : { dmDelivered: row.dmDelivered }),
    ...(row.logMessageId === null ? {} : { logMessageId: row.logMessageId }),
    ...(row.revokedAt === null ? {} : { revokedAt: row.revokedAt }),
    ...(row.revokedById === null ? {} : { revokedById: row.revokedById }),
    ...(row.revokeReason === null ? {} : { revokeReason: row.revokeReason }),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function parseEscalation(value: Prisma.JsonValue): readonly EscalationStep[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const { warnings, action, durationMinutes } = item as Record<string, unknown>;
    if (typeof warnings !== "number" || (action !== "TIMEOUT" && action !== "KICK" && action !== "BAN")) return [];
    return [{ warnings, action, durationMinutes: typeof durationMinutes === "number" ? durationMinutes : 0 }];
  });
}

/** Stored automod JSON merged over defaults so new rules appear with safe values. */
function parseAutomod(value: Prisma.JsonValue): AutomodSettings {
  const defaults = defaultAutomod();
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;
  const stored = value as Record<string, unknown>;
  const merge = <T extends object>(key: string, base: T): T => {
    const part = stored[key];
    return part && typeof part === "object" && !Array.isArray(part) ? { ...base, ...(part as Partial<T>) } : base;
  };
  return {
    enabled: stored.enabled === true,
    exemptRoleIds: Array.isArray(stored.exemptRoleIds) ? stored.exemptRoleIds.filter((id): id is string => typeof id === "string") : [],
    exemptChannelIds: Array.isArray(stored.exemptChannelIds) ? stored.exemptChannelIds.filter((id): id is string => typeof id === "string") : [],
    spam: merge("spam", defaults.spam),
    invites: merge("invites", defaults.invites),
    links: merge("links", defaults.links),
    words: merge("words", defaults.words),
    mentions: merge("mentions", defaults.mentions),
    caps: merge("caps", defaults.caps),
  };
}
