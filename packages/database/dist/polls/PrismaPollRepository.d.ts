import { type Poll, type PollCreateData, type PollFilter, type PollPatch, type PollRepository, type PollVote } from "@qbox/polls";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "pollCounter" | "poll" | "pollVote">;
/** PostgreSQL polls and votes. `guildId` is the Discord guild ID. */
export declare class PrismaPollRepository implements PollRepository {
    private readonly client;
    constructor(client: Client);
    allocateNumber(guildId: string): Promise<number>;
    create(data: PollCreateData): Promise<Poll>;
    get(guildId: string, id: string): Promise<Poll | undefined>;
    findById(id: string): Promise<Poll | undefined>;
    getByNumber(guildId: string, number: number): Promise<Poll | undefined>;
    list(filter: PollFilter): Promise<readonly Poll[]>;
    update(id: string, patch: PollPatch): Promise<Poll>;
    delete(id: string): Promise<void>;
    listEnded(now: Date): Promise<readonly Poll[]>;
    getVote(pollId: string, userId: string): Promise<PollVote | undefined>;
    saveVote(pollId: string, userId: string, userName: string, optionIds: readonly string[]): Promise<PollVote>;
    deleteVote(pollId: string, userId: string): Promise<boolean>;
    listVotes(pollId: string): Promise<readonly PollVote[]>;
    countVoters(pollIds: readonly string[]): Promise<ReadonlyMap<string, number>>;
}
export {};
//# sourceMappingURL=PrismaPollRepository.d.ts.map