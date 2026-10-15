/** PostgreSQL giveaways and entries. `guildId` is the Discord guild ID. */
export class PrismaGiveawayRepository {
    client;
    constructor(client) {
        this.client = client;
    }
    async allocateNumber(guildId) {
        const row = await this.client.giveawayCounter.upsert({
            where: { guildId },
            create: { guildId, nextNumber: 2 },
            update: { nextNumber: { increment: 1 } },
            select: { nextNumber: true },
        });
        return row.nextNumber - 1;
    }
    async create(data) {
        return mapGiveaway(await this.client.giveaway.create({
            data: {
                guildId: data.guildId,
                number: data.number,
                prize: data.prize,
                description: data.description ?? null,
                winnerCount: data.winnerCount,
                channelId: data.channelId,
                hostId: data.hostId,
                requiredRoleIds: [...data.requiredRoleIds],
                blockedRoleIds: [...data.blockedRoleIds],
                minAccountAgeDays: data.minAccountAgeDays,
                minServerDays: data.minServerDays,
                bonusEntries: data.bonusEntries.map((bonus) => ({ ...bonus })),
                pingRoleId: data.pingRoleId ?? null,
                dmWinners: data.dmWinners,
                endsAt: data.endsAt,
                winnerIds: [],
                createdById: data.createdById,
                createdByName: data.createdByName,
            },
        }));
    }
    async get(guildId, id) {
        const row = await this.client.giveaway.findFirst({ where: { guildId, id } });
        return row ? mapGiveaway(row) : undefined;
    }
    async findById(id) {
        const row = await this.client.giveaway.findUnique({ where: { id } });
        return row ? mapGiveaway(row) : undefined;
    }
    async getByNumber(guildId, number) {
        const row = await this.client.giveaway.findUnique({ where: { guildId_number: { guildId, number } } });
        return row ? mapGiveaway(row) : undefined;
    }
    async list(filter) {
        const rows = await this.client.giveaway.findMany({
            where: { guildId: filter.guildId, ...(filter.statuses ? { status: { in: [...filter.statuses] } } : {}) },
            orderBy: { number: "desc" },
            take: filter.limit ?? 50,
        });
        return rows.map(mapGiveaway);
    }
    async update(id, patch) {
        const data = {};
        if (patch.messageId !== undefined)
            data.messageId = patch.messageId;
        if (patch.status !== undefined)
            data.status = patch.status;
        if (patch.endsAt !== undefined)
            data.endsAt = patch.endsAt;
        if (patch.pausedAt !== undefined)
            data.pausedAt = patch.pausedAt;
        if (patch.winnerIds !== undefined)
            data.winnerIds = [...patch.winnerIds];
        if (patch.endedAt !== undefined)
            data.endedAt = patch.endedAt;
        if (patch.endedById !== undefined)
            data.endedById = patch.endedById;
        return mapGiveaway(await this.client.giveaway.update({ where: { id }, data }));
    }
    async delete(id) {
        await this.client.giveaway.deleteMany({ where: { id } });
    }
    async listDue(now) {
        const rows = await this.client.giveaway.findMany({ where: { status: "RUNNING", endsAt: { lte: now } }, orderBy: { endsAt: "asc" }, take: 100 });
        return rows.map(mapGiveaway);
    }
    async addEntry(giveawayId, userId, userName, entries) {
        return mapEntry(await this.client.giveawayEntry.upsert({
            where: { giveawayId_userId: { giveawayId, userId } },
            create: { giveawayId, userId, userName, entries },
            update: {},
        }));
    }
    async removeEntry(giveawayId, userId) {
        const result = await this.client.giveawayEntry.deleteMany({ where: { giveawayId, userId } });
        return result.count > 0;
    }
    async listEntries(giveawayId) {
        const rows = await this.client.giveawayEntry.findMany({ where: { giveawayId }, orderBy: { createdAt: "asc" } });
        return rows.map(mapEntry);
    }
    async countEntrants(giveawayIds) {
        if (giveawayIds.length === 0)
            return new Map();
        const rows = await this.client.giveawayEntry.groupBy({ by: ["giveawayId"], where: { giveawayId: { in: [...giveawayIds] } }, _count: { _all: true } });
        return new Map(rows.map((row) => [row.giveawayId, row._count._all]));
    }
}
function mapGiveaway(row) {
    return {
        id: row.id,
        guildId: row.guildId,
        number: row.number,
        prize: row.prize,
        ...(row.description === null ? {} : { description: row.description }),
        winnerCount: row.winnerCount,
        channelId: row.channelId,
        ...(row.messageId === null ? {} : { messageId: row.messageId }),
        hostId: row.hostId,
        requiredRoleIds: row.requiredRoleIds,
        blockedRoleIds: row.blockedRoleIds,
        minAccountAgeDays: row.minAccountAgeDays,
        minServerDays: row.minServerDays,
        bonusEntries: parseBonus(row.bonusEntries),
        ...(row.pingRoleId === null ? {} : { pingRoleId: row.pingRoleId }),
        dmWinners: row.dmWinners,
        endsAt: row.endsAt,
        ...(row.pausedAt === null ? {} : { pausedAt: row.pausedAt }),
        status: row.status,
        winnerIds: row.winnerIds,
        ...(row.endedAt === null ? {} : { endedAt: row.endedAt }),
        ...(row.endedById === null ? {} : { endedById: row.endedById }),
        createdById: row.createdById,
        createdByName: row.createdByName,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
function mapEntry(row) {
    return { giveawayId: row.giveawayId, userId: row.userId, userName: row.userName, entries: row.entries, createdAt: row.createdAt };
}
function parseBonus(value) {
    if (!Array.isArray(value))
        return [];
    return value.flatMap((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item))
            return [];
        const { roleId, entries } = item;
        return typeof roleId === "string" && typeof entries === "number" ? [{ roleId, entries }] : [];
    });
}
//# sourceMappingURL=PrismaGiveawayRepository.js.map