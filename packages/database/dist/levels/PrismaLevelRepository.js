import { LevelError, } from "@qbox/levels";
/** PostgreSQL level settings and member XP. `guildId` is the Discord guild ID. */
export class PrismaLevelRepository {
    client;
    constructor(client) {
        this.client = client;
    }
    async getSettings(guildId) {
        const row = await this.client.levelSettings.findUnique({ where: { guildId } });
        return row ? mapSettings(row) : undefined;
    }
    async saveSettings(input) {
        const data = {
            enabled: input.enabled,
            messageXpMin: input.messageXpMin,
            messageXpMax: input.messageXpMax,
            cooldownSeconds: input.cooldownSeconds,
            voiceXpPerMinute: input.voiceXpPerMinute,
            curveBase: input.curve.base,
            curveExponent: input.curve.exponent,
            curveLinear: input.curve.linear,
            roleMultipliers: input.roleMultipliers.map((item) => ({ id: item.id, multiplier: item.multiplier })),
            channelMultipliers: input.channelMultipliers.map((item) => ({ id: item.id, multiplier: item.multiplier })),
            noXpRoleIds: [...input.noXpRoleIds],
            noXpChannelIds: [...input.noXpChannelIds],
            levelUpMode: input.levelUpMode,
            levelUpChannelId: input.levelUpChannelId ?? null,
            levelUpMessage: input.levelUpMessage,
            rewards: input.rewards.map((reward) => ({ level: reward.level, roleId: reward.roleId })),
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
        if (result.count === 0)
            throw new LevelError("CONFLICT", "Level settings changed since they were loaded.", { currentRevision: existing.revision });
        return mapSettings(await this.client.levelSettings.findUniqueOrThrow({ where: { guildId: input.guildId } }));
    }
    async getMember(guildId, userId) {
        const row = await this.client.levelMember.findUnique({ where: { guildId_userId: { guildId, userId } } });
        return row ? mapMember(row) : undefined;
    }
    async addActivity(guildId, userId, activity) {
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
        if (row.xp >= 0)
            return mapMember(row);
        return mapMember(await this.client.levelMember.update({ where: { guildId_userId: { guildId, userId } }, data: { xp: 0 } }));
    }
    async setXp(guildId, userId, xp, displayName) {
        const name = displayName ? { displayName: displayName.slice(0, 100) } : {};
        return mapMember(await this.client.levelMember.upsert({
            where: { guildId_userId: { guildId, userId } },
            create: { guildId, userId, ...name, xp },
            update: { ...name, xp },
        }));
    }
    async setLevel(guildId, userId, level) {
        try {
            return mapMember(await this.client.levelMember.update({ where: { guildId_userId: { guildId, userId } }, data: { level } }));
        }
        catch {
            throw new LevelError("NOT_FOUND", "That member has no XP yet.");
        }
    }
    async deleteMember(guildId, userId) {
        await this.client.levelMember.deleteMany({ where: { guildId, userId } });
    }
    async resetAll(guildId) {
        const [leveled] = await this.client.$transaction([
            this.client.levelMember.findMany({ where: { guildId, level: { gt: 0 } }, select: { userId: true } }),
            this.client.levelMember.deleteMany({ where: { guildId } }),
        ]);
        return leveled.map((row) => row.userId);
    }
    async leaderboard(guildId, offset, limit) {
        const [rows, total] = await Promise.all([
            this.client.levelMember.findMany({ where: { guildId }, orderBy: [{ xp: "desc" }, { userId: "asc" }], skip: offset, take: limit }),
            this.client.levelMember.count({ where: { guildId } }),
        ]);
        return { members: rows.map(mapMember), total };
    }
    async rank(guildId, userId) {
        const member = await this.client.levelMember.findUnique({ where: { guildId_userId: { guildId, userId } }, select: { xp: true } });
        if (!member)
            return undefined;
        const ahead = await this.client.levelMember.count({
            where: { guildId, OR: [{ xp: { gt: member.xp } }, { xp: member.xp, userId: { lt: userId } }] },
        });
        return ahead + 1;
    }
    async search(guildId, query, limit) {
        const rows = await this.client.levelMember.findMany({
            where: { guildId, OR: [{ userId: query }, { displayName: { contains: query, mode: "insensitive" } }] },
            orderBy: [{ xp: "desc" }, { userId: "asc" }],
            take: limit,
        });
        return rows.map(mapMember);
    }
}
function mapSettings(row) {
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
function mapMember(row) {
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
function objects(value) {
    if (!Array.isArray(value))
        return [];
    return value.flatMap((item) => (item && typeof item === "object" && !Array.isArray(item) ? [item] : []));
}
function parseMultipliers(value) {
    return objects(value).flatMap(({ id, multiplier }) => (typeof id === "string" && typeof multiplier === "number" ? [{ id, multiplier }] : []));
}
function parseRewards(value) {
    return objects(value).flatMap(({ level, roleId }) => (typeof level === "number" && typeof roleId === "string" ? [{ level, roleId }] : []));
}
//# sourceMappingURL=PrismaLevelRepository.js.map