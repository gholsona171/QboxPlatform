import { type MessageTemplates } from "@qbox/shared/messages";
import type { AutomodMessage, AutomodViolation, CaseFilter, CaseType, ModerationCase, ModerationGateway, ModerationRepository, ModerationSettings, ModerationSettingsInput, ModerationStats, ModerationTarget, Moderator } from "./types.js";
export interface ModerationActionInput {
    readonly guildId: string;
    readonly type: CaseType;
    readonly target: ModerationTarget;
    readonly moderator: Moderator;
    readonly reason?: string | undefined;
    /** Timeout length, or temporary ban length. Omit for permanent bans. */
    readonly durationMinutes?: number | undefined;
    /** Ban/softban: hours of the member's messages to delete (0-168). */
    readonly deleteMessageHours?: number | undefined;
    readonly evidence?: readonly string[] | undefined;
}
export interface MemberHistory {
    readonly cases: readonly ModerationCase[];
    readonly activeWarnings: number;
    readonly activeBan?: ModerationCase | undefined;
    readonly activeTimeout?: ModerationCase | undefined;
}
export interface ExternalAction {
    readonly guildId: string;
    readonly type: "BAN" | "UNBAN" | "KICK";
    readonly target: ModerationTarget;
    readonly moderatorId?: string | undefined;
    readonly moderatorName?: string | undefined;
    readonly reason?: string | undefined;
}
export declare function defaultModerationSettings(guildId: string): ModerationSettings;
export declare function caseLabel(type: CaseType): string;
/**
 * Moderation rules shared by the bot, the API, and automod.
 *
 * The caller checks permissions (warn, timeout, kick, ban, ...) before calling.
 * This service enforces role hierarchy, protected roles, reasons, and
 * durations, performs the Discord action, records a numbered case, DMs the
 * member, posts to the log channel, and applies warning escalation.
 */
export declare class ModerationService {
    private readonly repository;
    private readonly gateway?;
    private readonly now;
    private readonly templates;
    private readonly spam;
    constructor(repository: ModerationRepository, gateway?: ModerationGateway | undefined, now?: () => Date, templates?: MessageTemplates);
    settings(guildId: string): Promise<ModerationSettings>;
    saveSettings(input: ModerationSettingsInput): Promise<ModerationSettings>;
    /** Performs a moderation action and records it as a case. */
    act(input: ModerationActionInput): Promise<ModerationCase>;
    /** Current and past cases for one member. */
    history(guildId: string, targetId: string): Promise<MemberHistory>;
    getCase(guildId: string, number: number): Promise<ModerationCase>;
    list(filter: CaseFilter): Promise<readonly ModerationCase[]>;
    stats(guildId: string): Promise<ModerationStats>;
    updateReason(guildId: string, number: number, moderator: Moderator, reason: string): Promise<ModerationCase>;
    addEvidence(guildId: string, number: number, url: string): Promise<ModerationCase>;
    /**
     * Pardons a case: warnings stop counting, active timeouts are lifted, and
     * active bans are lifted in Discord.
     */
    revoke(guildId: string, number: number, moderator: Moderator, reason?: string): Promise<ModerationCase>;
    purge(guildId: string, channelId: string, count: number, moderator: Moderator, userId?: string): Promise<number>;
    lock(guildId: string, channelId: string, locked: boolean, moderator: Moderator, reason?: string): Promise<void>;
    slowmode(guildId: string, channelId: string, seconds: number, moderator: Moderator): Promise<void>;
    /** Checks a message against automod and applies the configured action. */
    handleMessage(message: AutomodMessage): Promise<AutomodViolation | undefined>;
    /** Records a ban, unban, or kick done directly in Discord. */
    recordExternal(action: ExternalAction): Promise<ModerationCase | undefined>;
    /** Lifts expired temporary bans and closes expired timeouts. */
    sweepExpired(): Promise<{
        readonly unbanned: number;
        readonly timeoutsEnded: number;
    }>;
    private escalate;
    private duration;
    private deleteSeconds;
    private warningCutoff;
    private deactivate;
    private dmEmbed;
    /** A moderation embed as Discord embed JSON, the way the log channel shows it. */
    private embed;
    private log;
    private post;
    private requireGateway;
}
//# sourceMappingURL=ModerationService.d.ts.map