export type ScheduleType = "ONCE" | "INTERVAL" | "DAILY" | "WEEKLY" | "MONTHLY";
export declare const SCHEDULE_TYPES: readonly ScheduleType[];
export declare const MIN_INTERVAL_MINUTES = 10;
export declare const MAX_SCHEDULED_MESSAGES = 100;
/**
 * When a message posts. Times and dates are wall-clock values in `timeZone`,
 * so a daily 09:00 message stays at 09:00 across daylight saving changes.
 */
export interface Schedule {
    readonly type: ScheduleType;
    readonly timeZone: string;
    /** ONCE: `YYYY-MM-DDTHH:MM`. */
    readonly runAt?: string | undefined;
    /** INTERVAL: minutes between posts (at least 10). */
    readonly intervalMinutes?: number | undefined;
    /** DAILY, WEEKLY, MONTHLY: `HH:MM`. INTERVAL: optional first post time on the start date. */
    readonly time?: string | undefined;
    /** WEEKLY: days of the week, 0 (Sunday) to 6. */
    readonly weekdays?: readonly number[] | undefined;
    /** MONTHLY: 1-31. Shorter months use their last day. */
    readonly dayOfMonth?: number | undefined;
    /** First day posts may happen, `YYYY-MM-DD`. */
    readonly startDate?: string | undefined;
    /** Last day posts may happen, `YYYY-MM-DD`. */
    readonly endDate?: string | undefined;
}
export interface EmbedField {
    readonly name: string;
    readonly value: string;
    readonly inline: boolean;
}
export interface ScheduledEmbed {
    readonly title?: string | undefined;
    readonly description?: string | undefined;
    readonly color?: string | undefined;
    readonly imageUrl?: string | undefined;
    readonly footer?: string | undefined;
    readonly fields: readonly EmbedField[];
}
export interface ScheduledMessage {
    readonly id: string;
    readonly guildId: string;
    readonly name: string;
    readonly channelId: string;
    readonly content?: string | undefined;
    readonly embed?: ScheduledEmbed | undefined;
    readonly pingRoleIds: readonly string[];
    readonly schedule: Schedule;
    /** Paused messages keep their schedule but do not post. */
    readonly enabled: boolean;
    /** Delete the previous post when posting again. */
    readonly deletePrevious: boolean;
    readonly pin: boolean;
    /** Stop after this many scheduled posts. */
    readonly maxRuns?: number | undefined;
    readonly runCount: number;
    readonly lastRunAt?: Date | undefined;
    readonly lastMessageId?: string | undefined;
    /** Undefined when paused or when the schedule has no more posts. */
    readonly nextRunAt?: Date | undefined;
    readonly createdById: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
/** Fields a staff member edits. */
export interface ScheduledMessageInput {
    readonly guildId: string;
    readonly name: string;
    readonly channelId: string;
    readonly content?: string | undefined;
    readonly embed?: ScheduledEmbed | undefined;
    readonly pingRoleIds: readonly string[];
    readonly schedule: Schedule;
    readonly enabled: boolean;
    readonly deletePrevious: boolean;
    readonly pin: boolean;
    readonly maxRuns?: number | undefined;
}
export interface ScheduledMessageCreate extends ScheduledMessageInput {
    readonly createdById: string;
    readonly nextRunAt?: Date | undefined;
}
/** Changes to a message. `null` clears an optional field. */
export interface ScheduledMessagePatch {
    readonly name?: string;
    readonly channelId?: string;
    readonly content?: string | null;
    readonly embed?: ScheduledEmbed | null;
    readonly pingRoleIds?: readonly string[];
    readonly schedule?: Schedule;
    readonly enabled?: boolean;
    readonly deletePrevious?: boolean;
    readonly pin?: boolean;
    readonly maxRuns?: number | null;
    readonly runCount?: number;
    readonly lastRunAt?: Date;
    readonly lastMessageId?: string | null;
    readonly nextRunAt?: Date | null;
}
export interface ScheduledMessageRun {
    readonly id: string;
    readonly messageId: string;
    readonly guildId: string;
    readonly success: boolean;
    /** Discord message ID of the post. */
    readonly discordMessageId?: string | undefined;
    readonly error?: string | undefined;
    /** Sent with "Send now" instead of by the schedule. */
    readonly manual: boolean;
    readonly ranAt: Date;
}
export type ScheduledMessageRunCreate = Omit<ScheduledMessageRun, "id">;
export interface ScheduledMessageRepository {
    create(input: ScheduledMessageCreate): Promise<ScheduledMessage>;
    get(guildId: string, id: string): Promise<ScheduledMessage | undefined>;
    findByName(guildId: string, name: string): Promise<ScheduledMessage | undefined>;
    list(guildId: string): Promise<readonly ScheduledMessage[]>;
    count(guildId: string): Promise<number>;
    update(id: string, patch: ScheduledMessagePatch): Promise<ScheduledMessage>;
    delete(id: string): Promise<void>;
    /** Enabled messages with `nextRunAt` at or before `now`, across all guilds. */
    listDue(now: Date, limit: number): Promise<readonly ScheduledMessage[]>;
    /**
     * Moves `nextRunAt` from `expected` to `next` only if it still equals
     * `expected`, so a post is claimed by one worker. Returns false when taken.
     */
    claim(id: string, expected: Date, next: Date | undefined, runCount: number): Promise<boolean>;
    addRun(input: ScheduledMessageRunCreate): Promise<ScheduledMessageRun>;
    listRuns(guildId: string, messageId?: string, limit?: number): Promise<readonly ScheduledMessageRun[]>;
}
export interface OutgoingMessage {
    readonly content?: string | undefined;
    readonly embed?: ScheduledEmbed | undefined;
    readonly pingRoleIds: readonly string[];
}
/** Discord operations scheduled messages need. */
export interface ScheduledMessageGateway {
    post(channelId: string, message: OutgoingMessage): Promise<{
        readonly messageId: string;
    }>;
    deleteMessage(channelId: string, messageId: string): Promise<void>;
    pin(channelId: string, messageId: string): Promise<void>;
}
//# sourceMappingURL=types.d.ts.map