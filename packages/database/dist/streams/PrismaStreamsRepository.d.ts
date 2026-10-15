import { type StreamsGuildConfig, type StreamsRepository, type StreamsSettings, type StreamsSettingsInput, type StreamsSubscription, type StreamsSubscriptionCreate, type StreamsSubscriptionPatch, type StreamsSubscriptionState } from "@qbox/streams";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "streamsSettings" | "streamsSubscription">;
/** PostgreSQL stream settings and subscriptions. `guildId` is the Discord guild ID. */
export declare class PrismaStreamsRepository implements StreamsRepository {
    private readonly client;
    constructor(client: Client);
    getSettings(guildId: string): Promise<StreamsSettings | undefined>;
    saveSettings(input: StreamsSettingsInput): Promise<StreamsSettings>;
    listSubscriptions(guildId: string): Promise<readonly StreamsSubscription[]>;
    getSubscription(guildId: string, id: string): Promise<StreamsSubscription | undefined>;
    countSubscriptions(guildId: string): Promise<number>;
    createSubscription(input: StreamsSubscriptionCreate): Promise<StreamsSubscription>;
    updateSubscription(id: string, patch: StreamsSubscriptionPatch): Promise<StreamsSubscription>;
    deleteSubscription(guildId: string, id: string): Promise<boolean>;
    saveState(id: string, state: Partial<StreamsSubscriptionState>): Promise<void>;
    listActive(): Promise<readonly StreamsGuildConfig[]>;
}
export {};
//# sourceMappingURL=PrismaStreamsRepository.d.ts.map