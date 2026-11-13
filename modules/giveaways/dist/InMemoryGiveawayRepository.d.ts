import type { Giveaway, GiveawayCreateData, GiveawayEntry, GiveawayFilter, GiveawayPatch, GiveawayRepository } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryGiveawayRepository implements GiveawayRepository {
    private readonly now;
    readonly giveaways: Giveaway[];
    readonly entries: GiveawayEntry[];
    private readonly counters;
    constructor(now?: () => Date);
    allocateNumber(guildId: string): Promise<number>;
    create(data: GiveawayCreateData): Promise<Giveaway>;
    get(guildId: string, id: string): Promise<Giveaway | undefined>;
    findById(id: string): Promise<Giveaway | undefined>;
    getByNumber(guildId: string, number: number): Promise<Giveaway | undefined>;
    list(filter: GiveawayFilter): Promise<readonly Giveaway[]>;
    update(id: string, patch: GiveawayPatch): Promise<Giveaway>;
    delete(id: string): Promise<void>;
    listDue(now: Date): Promise<readonly Giveaway[]>;
    addEntry(giveawayId: string, userId: string, userName: string, entries: number): Promise<GiveawayEntry>;
    removeEntry(giveawayId: string, userId: string): Promise<boolean>;
    listEntries(giveawayId: string): Promise<readonly GiveawayEntry[]>;
    countEntrants(giveawayIds: readonly string[]): Promise<ReadonlyMap<string, number>>;
}
//# sourceMappingURL=InMemoryGiveawayRepository.d.ts.map