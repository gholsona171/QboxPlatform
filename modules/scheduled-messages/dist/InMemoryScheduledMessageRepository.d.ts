import type { ScheduledMessage, ScheduledMessageCreate, ScheduledMessagePatch, ScheduledMessageRepository, ScheduledMessageRun, ScheduledMessageRunCreate } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryScheduledMessageRepository implements ScheduledMessageRepository {
    private readonly now;
    readonly messages: ScheduledMessage[];
    readonly runsList: ScheduledMessageRun[];
    constructor(now?: () => Date);
    create(input: ScheduledMessageCreate): Promise<ScheduledMessage>;
    get(guildId: string, id: string): Promise<ScheduledMessage | undefined>;
    findByName(guildId: string, name: string): Promise<ScheduledMessage | undefined>;
    list(guildId: string): Promise<readonly ScheduledMessage[]>;
    count(guildId: string): Promise<number>;
    update(id: string, patch: ScheduledMessagePatch): Promise<ScheduledMessage>;
    delete(id: string): Promise<void>;
    listDue(now: Date, limit: number): Promise<readonly ScheduledMessage[]>;
    claim(id: string, expected: Date, next: Date | undefined, runCount: number): Promise<boolean>;
    addRun(input: ScheduledMessageRunCreate): Promise<ScheduledMessageRun>;
    listRuns(guildId: string, messageId?: string, limit?: number): Promise<readonly ScheduledMessageRun[]>;
}
//# sourceMappingURL=InMemoryScheduledMessageRepository.d.ts.map