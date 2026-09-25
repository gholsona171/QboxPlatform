import { PollError, type Poll, type PollCreateData, type PollFilter, type PollOption, type PollPatch, type PollRepository, type PollVote } from "@qbox/polls";
import type { Prisma, PrismaClient } from "@qbox/prisma";

type Client = Pick<PrismaClient, "pollCounter" | "poll" | "pollVote">;
type PollRow = Prisma.PollGetPayload<object>;
type VoteRow = Prisma.PollVoteGetPayload<object>;

/** PostgreSQL polls and votes. `guildId` is the Discord guild ID. */
export class PrismaPollRepository implements PollRepository {
  public constructor(private readonly client: Client) {}

  public async allocateNumber(guildId: string): Promise<number> {
    const row = await this.client.pollCounter.upsert({
      where: { guildId },
      create: { guildId, nextNumber: 2 },
      update: { nextNumber: { increment: 1 } },
      select: { nextNumber: true },
    });
    return row.nextNumber - 1;
  }

  public async create(data: PollCreateData): Promise<Poll> {
    return mapPoll(await this.client.poll.create({
      data: {
        guildId: data.guildId,
        number: data.number,
        question: data.question,
        options: data.options.map((option) => ({ ...option })) as Prisma.InputJsonValue,
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

  public async get(guildId: string, id: string): Promise<Poll | undefined> {
    const row = await this.client.poll.findFirst({ where: { guildId, id } });
    return row ? mapPoll(row) : undefined;
  }

  public async findById(id: string): Promise<Poll | undefined> {
    const row = await this.client.poll.findUnique({ where: { id } });
    return row ? mapPoll(row) : undefined;
  }

  public async getByNumber(guildId: string, number: number): Promise<Poll | undefined> {
    const row = await this.client.poll.findUnique({ where: { guildId_number: { guildId, number } } });
    return row ? mapPoll(row) : undefined;
  }

  public async list(filter: PollFilter): Promise<readonly Poll[]> {
    const rows = await this.client.poll.findMany({
      where: { guildId: filter.guildId, ...(filter.status ? { status: filter.status } : {}) },
      orderBy: { number: "desc" },
      take: filter.limit ?? 50,
    });
    return rows.map(mapPoll);
  }

  public async update(id: string, patch: PollPatch): Promise<Poll> {
    const data: Prisma.PollUpdateInput = {};
    if (patch.messageId !== undefined) data.messageId = patch.messageId;
    if (patch.status !== undefined) data.status = patch.status;
    if (patch.endsAt !== undefined) data.endsAt = patch.endsAt;
    if (patch.closedAt !== undefined) data.closedAt = patch.closedAt;
    if (patch.closedById !== undefined) data.closedById = patch.closedById;
    return mapPoll(await this.client.poll.update({ where: { id }, data }));
  }

  public async delete(id: string): Promise<void> {
    await this.client.poll.deleteMany({ where: { id } });
  }

  public async listEnded(now: Date): Promise<readonly Poll[]> {
    const rows = await this.client.poll.findMany({ where: { status: "OPEN", endsAt: { lte: now } }, orderBy: { endsAt: "asc" }, take: 100 });
    return rows.map(mapPoll);
  }

  public async getVote(pollId: string, userId: string): Promise<PollVote | undefined> {
    const row = await this.client.pollVote.findUnique({ where: { pollId_userId: { pollId, userId } } });
    return row ? mapVote(row) : undefined;
  }

  public async saveVote(pollId: string, userId: string, userName: string, optionIds: readonly string[]): Promise<PollVote> {
    return mapVote(await this.client.pollVote.upsert({
      where: { pollId_userId: { pollId, userId } },
      create: { pollId, userId, userName, optionIds: [...optionIds] },
      update: { userName, optionIds: [...optionIds] },
    }));
  }

  public async deleteVote(pollId: string, userId: string): Promise<boolean> {
    const result = await this.client.pollVote.deleteMany({ where: { pollId, userId } });
    return result.count > 0;
  }

  public async listVotes(pollId: string): Promise<readonly PollVote[]> {
    const rows = await this.client.pollVote.findMany({ where: { pollId }, orderBy: { createdAt: "asc" } });
    return rows.map(mapVote);
  }

  public async countVoters(pollIds: readonly string[]): Promise<ReadonlyMap<string, number>> {
    if (pollIds.length === 0) return new Map();
    const rows = await this.client.pollVote.groupBy({ by: ["pollId"], where: { pollId: { in: [...pollIds] } }, _count: { _all: true } });
    return new Map(rows.map((row) => [row.pollId, row._count._all]));
  }
}

function mapPoll(row: PollRow): Poll {
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

function mapVote(row: VoteRow): PollVote {
  return { pollId: row.pollId, userId: row.userId, userName: row.userName, optionIds: row.optionIds, createdAt: row.createdAt, updatedAt: row.updatedAt };
}

function parseOptions(value: Prisma.JsonValue): readonly PollOption[] {
  if (!Array.isArray(value)) throw new PollError("INVALID_STATE", "This poll's options could not be read.");
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const { id, label, emoji } = item as Record<string, unknown>;
    if (typeof id !== "string" || typeof label !== "string") return [];
    return [{ id, label, ...(typeof emoji === "string" ? { emoji } : {}) }];
  });
}
