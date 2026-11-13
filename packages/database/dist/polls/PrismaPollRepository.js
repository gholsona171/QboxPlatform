import { PollError } from "@qbox/polls";
/** PostgreSQL polls and votes. `guildId` is the Discord guild ID. */
export class PrismaPollRepository {
    client;
    constructor(client) {
        this.client = client;
    }
    async allocateNumber(guildId) {
        const row = await this.client.pollCounter.upsert({
            where: { guildId },
            create: { guildId, nextNumber: 2 },
            update: { nextNumber: { increment: 1 } },
            select: { nextNumber: true },
        });
        return row.nextNumber - 1;
    }
    async create(data) {
        return mapPoll(await this.client.poll.create({
            data: {
                guildId: data.guildId,
                number: data.number,
                question: data.question,
                options: data.options.map((option) => ({ ...option })),
                maxChoices: data.maxChoices,
                anonymous: data.anonymous,
                resultsVisibility: data.resultsVisibility,
                allowVoteChange: data.allowVoteChange,
                allowedRoleIds: [...data.allowedRoleIds],
                channelId: data.channelId,
                pingRoleId: data.pingRoleId ?? null,
                endsAt: data.endsAt ?? null,
                createdById: data.createdById,
                createdByName: data.createdByName,
            },
        }));
    }
    async get(guildId, id) {
        const row = await this.client.poll.findFirst({ where: { guildId, id } });
        return row ? mapPoll(row) : undefined;
    }
    async findById(id) {
        const row = await this.client.poll.findUnique({ where: { id } });
        return row ? mapPoll(row) : undefined;
    }
    async getByNumber(guildId, number) {
        const row = await this.client.poll.findUnique({ where: { guildId_number: { guildId, number } } });
        return row ? mapPoll(row) : undefined;
    }
    async list(filter) {
        const rows = await this.client.poll.findMany({
            where: { guildId: filter.guildId, ...(filter.status ? { status: filter.status } : {}) },
            orderBy: { number: "desc" },
            take: filter.limit ?? 50,
        });
        return rows.map(mapPoll);
    }
    async update(id, patch) {
        const data = {};
        if (patch.messageId !== undefined)
            data.messageId = patch.messageId;
        if (patch.status !== undefined)
            data.status = patch.status;
        if (patch.endsAt !== undefined)
            data.endsAt = patch.endsAt;
        if (patch.closedAt !== undefined)
            data.closedAt = patch.closedAt;
        if (patch.closedById !== undefined)
            data.closedById = patch.closedById;
        return mapPoll(await this.client.poll.update({ where: { id }, data }));
    }
    async delete(id) {
        await this.client.poll.deleteMany({ where: { id } });
    }
    async listEnded(now) {
        const rows = await this.client.poll.findMany({ where: { status: "OPEN", endsAt: { lte: now } }, orderBy: { endsAt: "asc" }, take: 100 });
        return rows.map(mapPoll);
    }
    async getVote(pollId, userId) {
        const row = await this.client.pollVote.findUnique({ where: { pollId_userId: { pollId, userId } } });
        return row ? mapVote(row) : undefined;
    }
    async saveVote(pollId, userId, userName, optionIds) {
        return mapVote(await this.client.pollVote.upsert({
            where: { pollId_userId: { pollId, userId } },
            create: { pollId, userId, userName, optionIds: [...optionIds] },
            update: { userName, optionIds: [...optionIds] },
        }));
    }
    async deleteVote(pollId, userId) {
        const result = await this.client.pollVote.deleteMany({ where: { pollId, userId } });
        return result.count > 0;
    }
    async listVotes(pollId) {
        const rows = await this.client.pollVote.findMany({ where: { pollId }, orderBy: { createdAt: "asc" } });
        return rows.map(mapVote);
    }
    async countVoters(pollIds) {
        if (pollIds.length === 0)
            return new Map();
        const rows = await this.client.pollVote.groupBy({ by: ["pollId"], where: { pollId: { in: [...pollIds] } }, _count: { _all: true } });
        return new Map(rows.map((row) => [row.pollId, row._count._all]));
    }
}
function mapPoll(row) {
    return {
        id: row.id,
        guildId: row.guildId,
        number: row.number,
        question: row.question,
        options: parseOptions(row.options),
        maxChoices: row.maxChoices,
        anonymous: row.anonymous,
        resultsVisibility: row.resultsVisibility,
        allowVoteChange: row.allowVoteChange,
        allowedRoleIds: row.allowedRoleIds,
        channelId: row.channelId,
        ...(row.messageId === null ? {} : { messageId: row.messageId }),
        ...(row.pingRoleId === null ? {} : { pingRoleId: row.pingRoleId }),
        ...(row.endsAt === null ? {} : { endsAt: row.endsAt }),
        status: row.status,
        createdById: row.createdById,
        createdByName: row.createdByName,
        ...(row.closedAt === null ? {} : { closedAt: row.closedAt }),
        ...(row.closedById === null ? {} : { closedById: row.closedById }),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
function mapVote(row) {
    return { pollId: row.pollId, userId: row.userId, userName: row.userName, optionIds: row.optionIds, createdAt: row.createdAt, updatedAt: row.updatedAt };
}
function parseOptions(value) {
    if (!Array.isArray(value))
        throw new PollError("INVALID_STATE", "This poll's options could not be read.");
    return value.flatMap((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item))
            return [];
        const { id, label, emoji } = item;
        if (typeof id !== "string" || typeof label !== "string")
            return [];
        return [{ id, label, ...(typeof emoji === "string" ? { emoji } : {}) }];
    });
}
//# sourceMappingURL=PrismaPollRepository.js.map