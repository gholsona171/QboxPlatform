import type { OutgoingMessage } from "@qbox/shared/messages";
export type GiveawayStatus = "RUNNING" | "PAUSED" | "ENDED" | "CANCELLED";
export declare const GIVEAWAY_STATUSES: readonly GiveawayStatus[];
/** Longest giveaway (90 days). */
export declare const MAX_GIVEAWAY_MINUTES = 129600;
export declare const MAX_GIVEAWAY_WINNERS = 50;
/** Custom ID prefix for the Enter button. */
export declare const GIVEAWAY_CUSTOM_ID: {
    readonly enter: "qbox:giveaways:enter:";
};
/** Members with `roleId` get `entries` extra entries. */
export interface GiveawayBonusEntry {
    readonly roleId: string;
    readonly entries: number;
}
export interface Giveaway {
    readonly id: string;
    readonly guildId: string;
    readonly number: number;
    readonly prize: string;
    readonly description?: string | undefined;
    readonly winnerCount: number;
    readonly channelId: string;
    readonly messageId?: string | undefined;
    readonly hostId: string;
    /** Members need at least one of these roles. Empty means no role is required. */
    readonly requiredRoleIds: readonly string[];
    /** Members with any of these roles cannot enter. */
    readonly blockedRoleIds: readonly string[];
    readonly minAccountAgeDays: number;
    readonly minServerDays: number;
    readonly bonusEntries: readonly GiveawayBonusEntry[];
    readonly pingRoleId?: string | undefined;
    readonly dmWinners: boolean;
    readonly endsAt: Date;
    readonly pausedAt?: Date | undefined;
    readonly status: GiveawayStatus;
    readonly winnerIds: readonly string[];
    readonly endedAt?: Date | undefined;
    /** Who ended or cancelled it ("0" for the timer). */
    readonly endedById?: string | undefined;
    readonly createdById: string;
    readonly createdByName: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export interface GiveawayCreateData {
    readonly guildId: string;
    readonly number: number;
    readonly prize: string;
    readonly description?: string | undefined;
    readonly winnerCount: number;
    readonly channelId: string;
    readonly hostId: string;
    readonly requiredRoleIds: readonly string[];
    readonly blockedRoleIds: readonly string[];
    readonly minAccountAgeDays: number;
    readonly minServerDays: number;
    readonly bonusEntries: readonly GiveawayBonusEntry[];
    readonly pingRoleId?: string | undefined;
    readonly dmWinners: boolean;
    readonly endsAt: Date;
    readonly createdById: string;
    readonly createdByName: string;
}
export interface GiveawayPatch {
    readonly messageId?: string | null;
    readonly status?: GiveawayStatus;
    readonly endsAt?: Date;
    readonly pausedAt?: Date | null;
    readonly winnerIds?: readonly string[];
    readonly endedAt?: Date | null;
    readonly endedById?: string | null;
}
export interface GiveawayEntry {
    readonly giveawayId: string;
    readonly userId: string;
    readonly userName: string;
    /** 1 plus bonus entries from roles, fixed when the member entered. */
    readonly entries: number;
    readonly createdAt: Date;
}
export interface GiveawayFilter {
    readonly guildId: string;
    readonly statuses?: readonly GiveawayStatus[] | undefined;
    readonly limit?: number | undefined;
}
export interface GiveawayRepository {
    /** Atomically returns the next giveaway number for the guild. */
    allocateNumber(guildId: string): Promise<number>;
    create(data: GiveawayCreateData): Promise<Giveaway>;
    get(guildId: string, id: string): Promise<Giveaway | undefined>;
    /** Looks a giveaway up by ID in any guild (used by background refreshes). */
    findById(id: string): Promise<Giveaway | undefined>;
    getByNumber(guildId: string, number: number): Promise<Giveaway | undefined>;
    list(filter: GiveawayFilter): Promise<readonly Giveaway[]>;
    update(id: string, patch: GiveawayPatch): Promise<Giveaway>;
    /** Removes a giveaway and its entries. */
    delete(id: string): Promise<void>;
    /** Running giveaways whose end time has passed, across all guilds. */
    listDue(now: Date): Promise<readonly Giveaway[]>;
    addEntry(giveawayId: string, userId: string, userName: string, entries: number): Promise<GiveawayEntry>;
    /** True when an entry was removed. */
    removeEntry(giveawayId: string, userId: string): Promise<boolean>;
    listEntries(giveawayId: string): Promise<readonly GiveawayEntry[]>;
    /** Number of members who entered, per giveaway. */
    countEntrants(giveawayIds: readonly string[]): Promise<ReadonlyMap<string, number>>;
}
/** A rendered message; the gateway turns it into a Discord message. */
/** A giveaway message: Discord message JSON plus who it may ping and the Enter button. */
export interface GiveawayMessage extends OutgoingMessage {
    readonly mentionUserIds: readonly string[];
    readonly mentionRoleIds: readonly string[];
    readonly enterButton?: {
        readonly customId: string;
        readonly label: string;
    } | undefined;
}
/** Discord operations giveaways need. */
export interface GiveawayGateway {
    guildName(guildId: string): Promise<string>;
    postMessage(channelId: string, message: GiveawayMessage, replyToMessageId?: string): Promise<{
        readonly messageId: string;
    }>;
    editMessage(channelId: string, messageId: string, message: GiveawayMessage): Promise<void>;
    /** Returns false when the member's DMs are closed. */
    directMessage(userId: string, message: GiveawayMessage): Promise<boolean>;
}
/** Staff member acting on a giveaway. Permission checks happen before the service is called. */
export interface GiveawayActor {
    readonly userId: string;
    readonly displayName: string;
}
/** Member pressing Enter. */
export interface GiveawayEntrant {
    readonly userId: string;
    readonly displayName: string;
    readonly roleIds: readonly string[];
    /** When they joined the server, if known. */
    readonly joinedAt?: Date | undefined;
}
export interface GiveawayStartInput {
    readonly guildId: string;
    readonly prize: string;
    readonly description?: string | undefined;
    readonly winnerCount?: number | undefined;
    readonly channelId: string;
    /** Defaults to the actor. */
    readonly hostId?: string | undefined;
    readonly requiredRoleIds?: readonly string[] | undefined;
    readonly blockedRoleIds?: readonly string[] | undefined;
    readonly minAccountAgeDays?: number | undefined;
    readonly minServerDays?: number | undefined;
    readonly bonusEntries?: readonly GiveawayBonusEntry[] | undefined;
    readonly pingRoleId?: string | undefined;
    readonly dmWinners?: boolean | undefined;
    /** Give an end time or a duration. */
    readonly endsAt?: Date | undefined;
    readonly durationMinutes?: number | undefined;
}
export interface GiveawaySummary extends Giveaway {
    readonly entrantCount: number;
}
export interface GiveawayDetail {
    readonly giveaway: Giveaway;
    readonly entries: readonly GiveawayEntry[];
    readonly totalEntries: number;
}
//# sourceMappingURL=types.d.ts.map