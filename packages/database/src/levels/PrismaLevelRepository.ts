import {
  LevelError,
  type LevelActivity,
  type LevelMember,
  type LevelRepository,
  type LevelReward,
  type LevelSettings,
  type LevelSettingsInput,
  type XpMultiplier,
} from "@qbox/levels";
import type { Prisma, PrismaClient } from "@qbox/prisma";

type Client = Pick<PrismaClient, "levelSettings" | "levelMember" | "$transaction">;
type SettingsRow = Prisma.LevelSettingsGetPayload<object>;
type MemberRow = Prisma.LevelMemberGetPayload<object>;

/** PostgreSQL level settings and member XP. `guildId` is the Discord guild ID. */
export class PrismaLevelRepository implements LevelRepository {
  public constructor(private readonly client: Client) {}

  public async getSettings(guildId: string): Promise<LevelSettings | undefined> {
    const row = await this.client.levelSettings.findUnique({ where: { guildId } });
    return row ? mapSettings(row) : undefined;
  }

  public async saveSettings(input: LevelSettingsInput): Promise<LevelSettings> {
    const data = {
      enabled: input.enabled,
      messageXpMin: input.messageXpMin,
      messageXpMax: input.messageXpMax,
      cooldownSeconds: input.cooldownSeconds,
      voiceXpPerMinute: input.voiceXpPerMinute,
      curveBase: input.curve.base,
      curveExponent: input.curve.exponent,
      curveLinear: input.curve.linear,
      roleMultipliers: input.roleMultipliers.map((item) => ({ id: item.id, multiplier: item.multiplier })) as Prisma.InputJsonValue,
      channelMultipliers: input.channelMultipliers.map((item) => ({ id: item.id, multiplier: item.multiplier })) as Prisma.InputJsonValue,
      noXpRoleIds: [...input.noXpRoleIds],
      noXpChannelIds: [...input.noXpChannelIds],
      levelUpMode: input.levelUpMode,
      levelUpChannelId: input.levelUpChannelId ?? null,
      levelUpMessage: input.levelUpMessage,
      rewards: input.rewards.map((reward) => ({ level: reward.level, roleId: reward.roleId })) as Prisma.InputJsonValue,
      rewardMode: input.rewardMode,
      removeRewardsOnReset: input.removeRewardsOnReset,
      maxLevel: input.maxLevel,
    };
    const existing = await this.client.levelSettings.findUnique({ where: { guildId: input.guildId }, select: { revision: true } });
    if (!existing) {
      if (input.expectedRevision !== undefined && input.expectedRevision !== 0)
        throw new LevelError("CONFLICT", "Level settings changed since they were loaded.", { currentRevision: 0 });
      return mapSettings(await this.client.levelSettings.create({ data: { guildId: input.guildId, ...data } }));
    }
    const result = await this.client.levelSettings.updateMany({
      where: { guildId: input.guildId, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
      data: { ...data, revision: { increment: 1 } },
    });
    if (result.count === 0) throw new LevelError("CONFLICT", "Level settings changed since they were loaded.", { currentRevision: existing.revision });
    return mapSettings(await this.client.levelSettings.findUniqueOrThrow({ where: { guildId: input.guildId } }));
  }

  public async getMember(guildId: string, userId: string): Promise<LevelMember | undefined> {
    const row = await this.client.levelMember.findUnique({ where: { guildId_userId: { guildId, userId } } });
    return row ? mapMember(row) : undefined;
  }

  public async addActivity(guildId: string, userId: string, activity: LevelActivity): Promise<LevelMember> {
    const name = activity.displayName ? { displayName: activity.displayName.slice(0, 100) } : {};
    const row = await this.client.levelMember.upsert({
      where: { guildId_userId: { guildId, userId } },
      create: {
        guildId,
        userId,
        ...name,
        xp: Math.max(0, activity.xp),
        messages: activity.messages ?? 0,
        voiceMinutes: activity.voiceMinutes ?? 0,
        lastMessageAt: activity.lastMessageAt ?? null,
      },
      update: {
        ...name,
        xp: { increment: activity.xp },
        ...(activity.messages ? { messages: { increment: activity.messages } } : {}),
        ...(activity.voiceMinutes ? { voiceMinutes: { increment: activity.voiceMinutes } } : {}),
        ...(activity.lastMessageAt ? { lastMessageAt: activity.lastMessageAt } : {}),
      },
    });
    if (row.xp >= 0) return mapMember(row);
    return mapMember(await this.client.levelMember.update({ where: { guildId_userId: { guildId, userId } }, data: { xp: 0 } }));
  }

  public async setXp(guildId: string, userId: string, xp: number, displayName?: string): Promise<LevelMember> {
    const name = displayName ? { displayName: displayName.slice(0, 100) } : {};
    return mapMember(await this.client.levelMember.upsert({
      where: { guildId_userId: { guildId, userId } },
      create: { guildId, userId, ...name, xp },
      update: { ...name, xp },
    }));
  }

  public async setLevel(guildId: string, userId: string, level: number): Promise<LevelMember> {
    try {
      return mapMember(await this.client.levelMember.update({ where: { guildId_userId: { guildId, userId } }, data: { level } }));
    } catch {
      throw new LevelError("NOT_FOUND", "That member has no XP yet.");
    }
  }

  public async deleteMember(guildId: string, userId: string): Promise<void> {
    await this.client.levelMember.deleteMany({ where: { guildId, userId } });
  }

  public async resetAll(guildId: string): Promise<readonly string[]> {
    const [leveled] = await this.client.$transaction([
      this.client.levelMember.findMany({ where: { guildId, level: { gt: 0 } }, select: { userId: true } }),
      this.client.levelMember.deleteMany({ where: { guildId } }),
    ]);
    return leveled.map((row) => row.userId);
  }

  public async leaderboard(guildId: string, offset: number, limit: number): Promise<{ readonly members: readonly LevelMember[]; readonly total: number }> {
    const [rows, total] = await Promise.all([
      this.client.levelMember.findMany({ where: { guildId }, orderBy: [{ xp: "desc" }, { userId: "asc" }], skip: offset, take: limit }),
      this.client.levelMember.count({ where: { guildId } }),
    ]);
    return { members: rows.map(mapMember), total };
  }

  public async rank(guildId: string, userId: string): Promise<number | undefined> {
    const member = await this.client.levelMember.findUnique({ where: { guildId_userId: { guildId, userId } }, select: { xp: true } });
    if (!member) return undefined;
    const ahead = await this.client.levelMember.count({
      where: { guildId, OR: [{ xp: { gt: member.xp } }, { xp: member.xp, userId: { lt: userId } }] },
    });
    return ahead + 1;
  }

  public async search(guildId: string, query: string, limit: number): Promise<readonly LevelMember[]> {
    const rows = await this.client.levelMember.findMany({
      where: { guildId, OR: [{ userId: query }, { displayName: { contains: query, mode: "insensitive" } }] },
      orderBy: [{ xp: "desc" }, { userId: "asc" }],
      take: limit,
    });
    return rows.map(mapMember);
  }
}

function mapSettings(row: SettingsRow): LevelSettings {
  return {
    guildId: row.guildId,
    enabled: row.enabled,
    messageXpMin: row.messageXpMin,
    messageXpMax: row.messageXpMax,
    cooldownSeconds: row.cooldownSeconds,
    voiceXpPerMinute: row.voiceXpPerMinute,
    curve: { base: row.curveBase, exponent: row.curveExponent, linear: row.curveLinear },
    roleMultipliers: parseMultipliers(row.roleMultipliers),
    channelMultipliers: parseMultipliers(row.channelMultipliers),
    noXpRoleIds: row.noXpRoleIds,
    noXpChannelIds: row.noXpChannelIds,
    levelUpMode: row.levelUpMode,
    ...(row.levelUpChannelId ? { levelUpChannelId: row.levelUpChannelId } : {}),
    levelUpMessage: row.levelUpMessage,
    rewards: parseRewards(row.rewards),
    rewardMode: row.rewardMode,
    removeRewardsOnReset: row.removeRewardsOnReset,
    maxLevel: row.maxLevel,
    revision: row.revision,
  };
}

function mapMember(row: MemberRow): LevelMember {
  return {
    guildId: row.guildId,
    userId: row.userId,
    displayName: row.displayName,
    xp: row.xp,
    level: row.level,
    messages: row.messages,
    voiceMinutes: row.voiceMinutes,
    ...(row.lastMessageAt === null ? {} : { lastMessageAt: row.lastMessageAt }),
    updatedAt: row.updatedAt,
  };
}

function objects(value: Prisma.JsonValue): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => (item && typeof item === "object" && !Array.isArray(item) ? [item as Record<string, unknown>] : []));
}

function parseMultipliers(value: Prisma.JsonValue): readonly XpMultiplier[] {
  return objects(value).flatMap(({ id, multiplier }) => (typeof id === "string" && typeof multiplier === "number" ? [{ id, multiplier }] : []));
}

function parseRewards(value: Prisma.JsonValue): readonly LevelReward[] {
  return objects(value).flatMap(({ level, roleId }) => (typeof level === "number" && typeof roleId === "string" ? [{ level, roleId }] : []));
}
