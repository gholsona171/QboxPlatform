import type { OutgoingMessage } from "@qbox/shared/messages";
export type CaseType = "WARN" | "TIMEOUT" | "UNTIMEOUT" | "KICK" | "BAN" | "UNBAN" | "SOFTBAN" | "NOTE";
export type CaseSource = "DISCORD" | "WEB" | "AUTOMOD" | "EXTERNAL";
export type AutomodAction = "DELETE" | "WARN" | "TIMEOUT";
export type EscalationAction = "TIMEOUT" | "KICK" | "BAN";
export declare const CASE_TYPES: readonly CaseType[];
/** Longest timeout Discord allows (28 days). */
export declare const MAX_TIMEOUT_MINUTES = 40320;
export interface AutomodRule {
    readonly enabled: boolean;
    readonly action: AutomodAction;
    /** Timeout length when `action` is TIMEOUT. */
    readonly timeoutMinutes: number;
}
export interface AutomodSettings {
    readonly enabled: boolean;
    readonly exemptRoleIds: readonly string[];
    readonly exemptChannelIds: readonly string[];
    readonly spam: AutomodRule & {
        readonly maxMessages: number;
        readonly perSeconds: number;
    };
    readonly invites: AutomodRule;
    readonly links: AutomodRule & {
        readonly allowedDomains: readonly string[];
    };
    readonly words: AutomodRule & {
        readonly words: readonly string[];
    };
    readonly mentions: AutomodRule & {
        readonly maxMentions: number;
    };
    readonly caps: AutomodRule & {
        readonly minLength: number;
        readonly percent: number;
    };
}
/** Automatic punishment when a member reaches `warnings` active warnings. */
export interface EscalationStep {
    readonly warnings: number;
    readonly action: EscalationAction;
    /** Timeout length, or ban length (0 = permanent). */
    readonly durationMinutes: number;
}
export interface ModerationSettings {
    readonly guildId: string;
    readonly logChannelId?: string | undefined;
    readonly dmOnAction: boolean;
    readonly dmIncludeModerator: boolean;
    /** Added to DMs for bans and kicks, e.g. an appeal link. */
    readonly appealMessage?: string | undefined;
    readonly requireReason: boolean;
    readonly defaultTimeoutMinutes: number;
    readonly banDeleteMessageHours: number;
    /** Warnings older than this stop counting toward escalation. 0 = never expire. */
    readonly warningExpiryDays: number;
    /** Members with these roles cannot be moderated through Qbox. */
    readonly protectedRoleIds: readonly string[];
    readonly escalation: readonly EscalationStep[];
    readonly automod: AutomodSettings;
    /** Record bans and unbans done directly in Discord as cases. */
    readonly recordExternalActions: boolean;
    readonly revision: number;
}
export interface ModerationSettingsInput extends Omit<ModerationSettings, "revision"> {
    readonly expectedRevision?: number | undefined;
}
export interface ModerationCase {
    readonly id: string;
    readonly guildId: string;
    readonly number: number;
    readonly type: CaseType;
    readonly targetId: string;
    readonly targetName: string;
    readonly moderatorId: string;
    readonly moderatorName: string;
    readonly reason?: string | undefined;
    readonly durationMinutes?: number | undefined;
    readonly expiresAt?: Date | undefined;
    /** Bans and timeouts in effect, and warnings still counting. */
    readonly active: boolean;
    readonly source: CaseSource;
    readonly evidence: readonly string[];
    readonly dmDelivered?: boolean | undefined;
    readonly logMessageId?: string | undefined;
    readonly revokedAt?: Date | undefined;
    readonly revokedById?: string | undefined;
    readonly revokeReason?: string | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export interface CaseCreateData {
    readonly guildId: string;
    readonly number: number;
    readonly type: CaseType;
    readonly targetId: string;
    readonly targetName: string;
    readonly moderatorId: string;
    readonly moderatorName: string;
    readonly reason?: string | undefined;
    readonly durationMinutes?: number | undefined;
    readonly expiresAt?: Date | undefined;
    readonly active: boolean;
    readonly source: CaseSource;
    readonly evidence: readonly string[];
    readonly dmDelivered?: boolean | undefined;
}
export interface CasePatch {
    readonly reason?: string | null;
    readonly active?: boolean;
    readonly logMessageId?: string | null;
    readonly revokedAt?: Date | null;
    readonly revokedById?: string | null;
    readonly revokeReason?: string | null;
    readonly evidence?: readonly string[];
}
export interface CaseFilter {
    readonly guildId: string;
    readonly types?: readonly CaseType[] | undefined;
    readonly targetId?: string | undefined;
    readonly moderatorId?: string | undefined;
    readonly active?: boolean | undefined;
    readonly source?: CaseSource | undefined;
    readonly search?: string | undefined;
    readonly limit?: number | undefined;
}
export interface ModerationStats {
    readonly total: number;
    readonly last7Days: number;
    readonly byType: Readonly<Partial<Record<CaseType, number>>>;
    readonly activeBans: number;
    readonly activeTimeouts: number;
    readonly topModerators: readonly {
        readonly userId: string;
        readonly name: string;
        readonly cases: number;
    }[];
    readonly automodActions: number;
}
export interface ModerationRepository {
    getSettings(guildId: string): Promise<ModerationSettings | undefined>;
    saveSettings(input: ModerationSettingsInput): Promise<ModerationSettings>;
    /** Atomically returns the next case number for the guild. */
    allocateCaseNumber(guildId: string): Promise<number>;
    createCase(input: CaseCreateData): Promise<ModerationCase>;
    getCase(guildId: string, number: number): Promise<ModerationCase | undefined>;
    listCases(filter: CaseFilter): Promise<readonly ModerationCase[]>;
    updateCase(id: string, patch: CasePatch): Promise<ModerationCase>;
    /** Active bans or timeouts whose expiry has passed, across all guilds. */
    listExpired(types: readonly CaseType[], now: Date): Promise<readonly ModerationCase[]>;
    /** Active, unrevoked warnings for a member created after `since`. */
    countActiveWarnings(guildId: string, targetId: string, since?: Date): Promise<number>;
    stats(guildId: string, now: Date): Promise<ModerationStats>;
}
export interface HierarchyCheck {
    readonly allowed: boolean;
    readonly reason?: string | undefined;
    /** Role IDs the target holds, when they are a member. */
    readonly targetRoleIds: readonly string[];
    readonly targetIsMember: boolean;
}
export interface ModerationEmbed {
    readonly title: string;
    readonly description: string;
    readonly color: string;
    readonly fields?: readonly {
        readonly name: string;
        readonly value: string;
        readonly inline?: boolean;
    }[] | undefined;
    readonly footer?: string | undefined;
}
/** Discord operations moderation needs. */
export interface ModerationGateway {
    /** Checks Discord role hierarchy and ownership for moderator, bot, and target. */
    checkHierarchy(guildId: string, moderatorId: string | undefined, targetId: string): Promise<HierarchyCheck>;
    /** Sets or clears (`until` undefined) a member timeout. */
    timeout(guildId: string, userId: string, until: Date | undefined, reason: string): Promise<void>;
    kick(guildId: string, userId: string, reason: string): Promise<void>;
    ban(guildId: string, userId: string, deleteMessageSeconds: number, reason: string): Promise<void>;
    unban(guildId: string, userId: string, reason: string): Promise<void>;
    guildName(guildId: string): Promise<string>;
    /** Sends the rendered `moderation.warn-dm` message. */
    directMessage(userId: string, message: OutgoingMessage): Promise<boolean>;
    postEmbed(channelId: string, embed: ModerationEmbed): Promise<{
        readonly messageId: string;
    }>;
    /** Posts the rendered `moderation.case-log` message. */
    postMessage(channelId: string, message: OutgoingMessage): Promise<{
        readonly messageId: string;
    }>;
    /** Bulk-deletes up to `count` recent messages (optionally from one user). Returns the number deleted. */
    purge(channelId: string, count: number, userId?: string): Promise<number>;
    setLocked(guildId: string, channelId: string, locked: boolean, reason: string): Promise<void>;
    setSlowmode(channelId: string, seconds: number, reason: string): Promise<void>;
    deleteMessage(channelId: string, messageId: string, reason: string): Promise<void>;
}
/** Who performs an action. Permission checks happen before the service is called. */
export interface Moderator {
    readonly userId: string;
    readonly displayName: string;
    readonly source: CaseSource;
}
export interface ModerationTarget {
    readonly userId: string;
    readonly displayName: string;
}
/** A message checked by automod. */
export interface AutomodMessage {
    readonly guildId: string;
    readonly channelId: string;
    readonly messageId: string;
    readonly authorId: string;
    readonly authorName: string;
    readonly authorRoleIds: readonly string[];
    readonly content: string;
    readonly mentionCount: number;
    readonly createdAt: Date;
}
export interface AutomodViolation {
    readonly rule: "spam" | "invites" | "links" | "words" | "mentions" | "caps";
    readonly description: string;
    readonly action: AutomodAction;
    readonly timeoutMinutes: number;
}
//# sourceMappingURL=types.d.ts.map