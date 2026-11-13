import type { Giveaway, GiveawayCreateData, GiveawayEntry, GiveawayFilter, GiveawayPatch, GiveawayRepository } from "@qbox/giveaways";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "giveawayCounter" | "giveaway" | "giveawayEntry">;
/** PostgreSQL giveaways and entries. `guildId` is the Discord guild ID. */
export declare class PrismaGiveawayRepository implements GiveawayRepository {
    private readonly client;
    constructor(client: Client);
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
export {};
//# sourceMappingURL=PrismaGiveawayRepository.d.ts.map