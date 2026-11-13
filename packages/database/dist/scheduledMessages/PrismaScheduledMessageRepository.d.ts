import type { ScheduledMessage, ScheduledMessageCreate, ScheduledMessagePatch, ScheduledMessageRepository, ScheduledMessageRun, ScheduledMessageRunCreate } from "@qbox/scheduled-messages";
import { type PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "scheduledMessage" | "scheduledMessageRun">;
/** PostgreSQL scheduled messages and their run history. `guildId` is the Discord guild ID. */
export declare class PrismaScheduledMessageRepository implements ScheduledMessageRepository {
    private readonly client;
    constructor(client: Client);
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
export {};
//# sourceMappingURL=PrismaScheduledMessageRepository.d.ts.map