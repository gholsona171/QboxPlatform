import type { StreamsGuildConfig, StreamsRepository, StreamsSettings, StreamsSettingsInput, StreamsSubscription, StreamsSubscriptionCreate, StreamsSubscriptionPatch, StreamsSubscriptionState } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryStreamsRepository implements StreamsRepository {
    private readonly now;
    readonly settings: Map<string, StreamsSettings>;
    readonly subscriptions: Map<string, StreamsSubscription>;
    private sequence;
    constructor(now?: () => Date);
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
//# sourceMappingURL=InMemoryStreamsRepository.d.ts.map