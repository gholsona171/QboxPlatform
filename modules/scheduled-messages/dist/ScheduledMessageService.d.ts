import type { ScheduledMessage, ScheduledMessageGateway, ScheduledMessageInput, ScheduledMessageRepository, ScheduledMessageRun } from "./types.js";
/**
 * Scheduled message rules shared by the bot and the API: saving messages,
 * working out the next post, posting due messages, and run history.
 */
export declare class ScheduledMessageService {
    private readonly repository;
    private readonly gateway?;
    private readonly now;
    constructor(repository: ScheduledMessageRepository, gateway?: ScheduledMessageGateway | undefined, now?: () => Date);
    list(guildId: string): Promise<readonly ScheduledMessage[]>;
    get(guildId: string, id: string): Promise<ScheduledMessage>;
    /** Finds a message by its name (any case). */
    byName(guildId: string, name: string): Promise<ScheduledMessage>;
    create(input: ScheduledMessageInput, createdById: string): Promise<ScheduledMessage>;
    update(guildId: string, id: string, input: ScheduledMessageInput): Promise<ScheduledMessage>;
    delete(guildId: string, id: string): Promise<ScheduledMessage>;
    /** Pauses or resumes a message. Resuming continues from now; missed posts are skipped. */
    setEnabled(guildId: string, id: string, enabled: boolean): Promise<ScheduledMessage>;
    /** Posts a message right away. The schedule and post count do not change. */
    sendNow(guildId: string, id: string): Promise<ScheduledMessageRun>;
    runs(guildId: string, messageId?: string, limit?: number): Promise<readonly ScheduledMessageRun[]>;
    /** Posts every message that is due. Each due post is claimed so it is sent once. */
    runDue(): Promise<{
        readonly sent: number;
        readonly failed: number;
    }>;
    private deliver;
    private requireNext;
    private requireUniqueName;
}
//# sourceMappingURL=ScheduledMessageService.d.ts.map