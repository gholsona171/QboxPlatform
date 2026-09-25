import {
  VerificationError,
  type AttemptCreateData,
  type AttemptFilter,
  type PendingMember,
  type VerificationAttempt,
  type VerificationQuestion,
  type VerificationRepository,
  type VerificationSettings,
  type VerificationSettingsInput,
  type VerificationStats,
} from "@qbox/verification";
import type { Prisma, PrismaClient } from "@qbox/prisma";

type Client = Pick<PrismaClient, "verificationSettings" | "verificationAttempt" | "verificationPendingMember">;
type SettingsRow = Prisma.VerificationSettingsGetPayload<object>;
type AttemptRow = Prisma.VerificationAttemptGetPayload<object>;
type PendingRow = Prisma.VerificationPendingMemberGetPayload<object>;

/** PostgreSQL verification settings, attempts, and pending members. `guildId` is the Discord guild ID. */
export class PrismaVerificationRepository implements VerificationRepository {
  public constructor(private readonly client: Client) {}

  public async getSettings(guildId: string): Promise<VerificationSettings | undefined> {
    const row = await this.client.verificationSettings.findUnique({ where: { guildId } });
    return row ? mapSettings(row) : undefined;
  }

  public async saveSettings(input: VerificationSettingsInput): Promise<VerificationSettings> {
    const data = {
      enabled: input.enabled,
      mode: input.mode,
      verifiedRoleIds: [...input.verifiedRoleIds],
      unverifiedRoleId: input.unverifiedRoleId ?? null,
      channelId: input.channelId ?? null,
      panelTitle: input.panel.title,
      panelDescription: input.panel.description,
      panelColor: input.panel.color,
      panelButtonLabel: input.panel.buttonLabel,
      questions: input.questions.map((question) => ({ id: question.id, prompt: question.prompt, answers: [...question.answers] })) as Prisma.InputJsonValue,
      logChannelId: input.logChannelId ?? null,
      minAccountAgeDays: input.minAccountAgeDays,
      ageAction: input.ageAction,
      kickUnverifiedMinutes: input.kickUnverifiedMinutes,
      maxAttempts: input.maxAttempts,
      cooldownMinutes: input.cooldownMinutes,
      dmOnSuccess: input.dmOnSuccess,
      successMessage: input.successMessage ?? null,
      welcomeChannelId: input.welcomeChannelId ?? null,
      welcomeMessage: input.welcomeMessage ?? null,
    };
    const existing = await this.client.verificationSettings.findUnique({ where: { guildId: input.guildId }, select: { revision: true } });
    if (!existing) {
      if (input.expectedRevision !== undefined && input.expectedRevision !== 0)
        throw new VerificationError("CONFLICT", "Verification settings changed since they were loaded.", { currentRevision: 0 });
      return mapSettings(await this.client.verificationSettings.create({ data: { guildId: input.guildId, ...data } }));
    }
    const result = await this.client.verificationSettings.updateMany({
      where: { guildId: input.guildId, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
      data: { ...data, revision: { increment: 1 } },
    });
    if (result.count === 0)
      throw new VerificationError("CONFLICT", "Verification settings changed since they were loaded.", { currentRevision: existing.revision });
    return mapSettings(await this.client.verificationSettings.findUniqueOrThrow({ where: { guildId: input.guildId } }));
  }

  public async setPanelMessage(guildId: string, channelId: string, messageId: string): Promise<void> {
    await this.client.verificationSettings.updateMany({ where: { guildId }, data: { panelChannelId: channelId, panelMessageId: messageId } });
  }

  public async listKickEnabled(): Promise<readonly VerificationSettings[]> {
    const rows = await this.client.verificationSettings.findMany({ where: { enabled: true, kickUnverifiedMinutes: { gt: 0 } } });
    return rows.map(mapSettings);
  }

  public async recordAttempt(input: AttemptCreateData): Promise<VerificationAttempt> {
    return mapAttempt(await this.client.verificationAttempt.create({
      data: {
        guildId: input.guildId,
        userId: input.userId,
        userName: input.userName,
        result: input.result,
        reason: input.reason ?? null,
        staffId: input.staffId ?? null,
        staffName: input.staffName ?? null,
        source: input.source,
        createdAt: input.createdAt,
      },
    }));
  }

  public async listAttempts(filter: AttemptFilter): Promise<readonly VerificationAttempt[]> {
    const search = filter.search?.trim();
    const rows = await this.client.verificationAttempt.findMany({
      where: {
        guildId: filter.guildId,
        ...(filter.results ? { result: { in: [...filter.results] } } : {}),
        ...(filter.userId ? { userId: filter.userId } : {}),
        ...(search
          ? {
              OR: [
                { userName: { contains: search, mode: "insensitive" as const } },
                { reason: { contains: search, mode: "insensitive" as const } },
                { userId: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: filter.limit ?? 50,
    });
    return rows.map(mapAttempt);
  }

  public async failuresSince(guildId: string, userId: string, since: Date): Promise<readonly Date[]> {
    const rows = await this.client.verificationAttempt.findMany({
      where: { guildId, userId, result: "FAILED", createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
      take: 100,
    });
    return rows.map((row) => row.createdAt);
  }

  public async upsertPending(member: PendingMember): Promise<void> {
    await this.client.verificationPendingMember.upsert({
      where: { guildId_userId: { guildId: member.guildId, userId: member.userId } },
      create: { guildId: member.guildId, userId: member.userId, joinedAt: member.joinedAt, flagged: member.flagged },
      update: { joinedAt: member.joinedAt, flagged: member.flagged },
    });
  }

  public async getPending(guildId: string, userId: string): Promise<PendingMember | undefined> {
    const row = await this.client.verificationPendingMember.findUnique({ where: { guildId_userId: { guildId, userId } } });
    return row ? mapPending(row) : undefined;
  }

  public async deletePending(guildId: string, userId: string): Promise<void> {
    await this.client.verificationPendingMember.deleteMany({ where: { guildId, userId } });
  }

  public async listPendingBefore(guildId: string, before: Date, limit: number): Promise<readonly PendingMember[]> {
    const rows = await this.client.verificationPendingMember.findMany({ where: { guildId, joinedAt: { lte: before } }, orderBy: { joinedAt: "asc" }, take: limit });
    return rows.map(mapPending);
  }

  public async stats(guildId: string, since: Date): Promise<VerificationStats> {
    const [recent, verifiedTotal, pending] = await Promise.all([
      this.client.verificationAttempt.groupBy({ by: ["result"], where: { guildId, createdAt: { gte: since } }, _count: { _all: true } }),
      this.client.verificationAttempt.count({ where: { guildId, result: { in: ["PASSED", "MANUAL"] } } }),
      this.client.verificationPendingMember.count({ where: { guildId } }),
    ]);
    const count = (...results: string[]) => recent.filter((row) => results.includes(row.result)).reduce((total, row) => total + row._count._all, 0);
    return {
      verified24h: count("PASSED", "MANUAL"),
      failed24h: count("FAILED"),
      deniedAge24h: count("DENIED_AGE"),
      kicked24h: count("KICKED"),
      verifiedTotal,
      pending,
    };
  }
}

function mapSettings(row: SettingsRow): VerificationSettings {
  return {
    guildId: row.guildId,
    enabled: row.enabled,
    mode: row.mode,
    verifiedRoleIds: row.verifiedRoleIds,
    ...(row.unverifiedRoleId ? { unverifiedRoleId: row.unverifiedRoleId } : {}),
    ...(row.channelId ? { channelId: row.channelId } : {}),
    panel: { title: row.panelTitle, description: row.panelDescription, color: row.panelColor, buttonLabel: row.panelButtonLabel },
    questions: parseQuestions(row.questions),
    ...(row.logChannelId ? { logChannelId: row.logChannelId } : {}),
    minAccountAgeDays: row.minAccountAgeDays,
    ageAction: row.ageAction,
    kickUnverifiedMinutes: row.kickUnverifiedMinutes,
    maxAttempts: row.maxAttempts,
    cooldownMinutes: row.cooldownMinutes,
    dmOnSuccess: row.dmOnSuccess,
    ...(row.successMessage ? { successMessage: row.successMessage } : {}),
    ...(row.welcomeChannelId ? { welcomeChannelId: row.welcomeChannelId } : {}),
    ...(row.welcomeMessage ? { welcomeMessage: row.welcomeMessage } : {}),
    ...(row.panelChannelId ? { panelChannelId: row.panelChannelId } : {}),
    ...(row.panelMessageId ? { panelMessageId: row.panelMessageId } : {}),
    revision: row.revision,
  };
}

function mapAttempt(row: AttemptRow): VerificationAttempt {
  return {
    id: row.id,
    guildId: row.guildId,
    userId: row.userId,
    userName: row.userName,
    result: row.result,
    ...(row.reason === null ? {} : { reason: row.reason }),
    ...(row.staffId === null ? {} : { staffId: row.staffId }),
    ...(row.staffName === null ? {} : { staffName: row.staffName }),
    source: row.source,
    createdAt: row.createdAt,
  };
}

function mapPending(row: PendingRow): PendingMember {
  return { guildId: row.guildId, userId: row.userId, joinedAt: row.joinedAt, flagged: row.flagged };
}

function parseQuestions(value: Prisma.JsonValue): readonly VerificationQuestion[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const { id, prompt, answers } = item as Record<string, unknown>;
    if (typeof id !== "string" || typeof prompt !== "string" || !Array.isArray(answers)) return [];
    return [{ id, prompt, answers: answers.filter((answer): answer is string => typeof answer === "string") }];
  });
}
