import type { Poll, PollCreateData, PollFilter, PollPatch, PollRepository, PollVote } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryPollRepository implements PollRepository {
    private readonly now;
    readonly polls: Poll[];
    readonly votes: PollVote[];
    private readonly counters;
    constructor(now?: () => Date);
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
//# sourceMappingURL=InMemoryPollRepository.d.ts.map