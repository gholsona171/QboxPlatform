import type { Leaderboard, LeaveFilter, RankInput, ShiftFilter, StaffActor, StaffEmbed, StaffGateway, StaffLeave, StaffMember, StaffProfile, StaffRank, StaffRecord, StaffRecordType, StaffRepository, StaffRoster, StaffSettings, StaffSettingsInput, StaffShift, StaffStatus, StaffStrikeView, StaffTarget } from "./types.js";
export interface HireInput {
    readonly rankId?: string | undefined;
    readonly callsign?: string | undefined;
    readonly reason?: string | undefined;
    readonly joinedAt?: Date | undefined;
}
export interface MemberUpdateInput {
    readonly displayName?: string | undefined;
    readonly callsign?: string | null | undefined;
    readonly status?: StaffStatus | undefined;
    readonly notes?: string | null | undefined;
    readonly joinedAt?: Date | undefined;
}
export interface LeaveRequestInput {
    readonly startsAt: Date;
    readonly endsAt: Date;
    readonly reason: string;
}
export interface SweepResult {
    readonly clockedOut: number;
    readonly leavesStarted: number;
    readonly leavesEnded: number;
}
export declare function defaultStaffSettings(guildId: string): StaffSettings;
export declare function recordLabel(type: StaffRecordType): string;
export declare function statusLabel(status: StaffStatus): string;
/** Monday 00:00 UTC of the week containing `date`. */
export declare function weekStart(date: Date): Date;
/** `3h 20m` style duration. */
export declare function formatSeconds(seconds: number): string;
/** Seconds of `shift` that fall inside [since, until). Open shifts run until `now`. */
export declare function secondsWithin(shift: StaffShift, since: Date, until: Date, now: Date): number;
/** Roster message body: every rank, highest first, with its members. */
export declare function rosterEmbed(ranks: readonly StaffRank[], members: readonly StaffMember[]): StaffEmbed;
/**
 * Staff roster, ranks, history, strikes, leave, and shifts. Shared by the bot
 * and the API. The caller checks permissions before calling; the service
 * validates input, changes Discord roles, keeps the history, posts to the
 * staff log, and keeps the roster message up to date.
 */
export declare class StaffService {
    private readonly repository;
    private readonly gateway?;
    private readonly now;
    constructor(repository: StaffRepository, gateway?: StaffGateway | undefined, now?: () => Date);
    settings(guildId: string): Promise<StaffSettings>;
    saveSettings(input: StaffSettingsInput): Promise<StaffSettings>;
    ranks(guildId: string): Promise<readonly StaffRank[]>;
    /** Adds a rank below the current lowest rank. */
    createRank(guildId: string, input: RankInput): Promise<StaffRank>;
    /** Changes a rank. A new Discord role is given to everyone in the rank. */
    updateRank(guildId: string, rankId: string, input: RankInput): Promise<StaffRank>;
    deleteRank(guildId: string, rankId: string): Promise<void>;
    /** Reorders ranks; `rankIds` lists every rank, highest first. */
    reorderRanks(guildId: string, rankIds: readonly string[]): Promise<readonly StaffRank[]>;
    roster(guildId: string): Promise<StaffRoster>;
    /** Roster entry for a user, or undefined when they are not on staff. */
    member(guildId: string, userId: string): Promise<StaffMember | undefined>;
    profile(guildId: string, userId: string): Promise<StaffProfile>;
    /** Adds someone to the roster (lowest rank unless given) and gives them the rank role. */
    hire(guildId: string, target: StaffTarget, actor: StaffActor, input?: HireInput): Promise<StaffMember>;
    promote(guildId: string, userId: string, actor: StaffActor, rankId?: string, reason?: string): Promise<StaffMember>;
    demote(guildId: string, userId: string, actor: StaffActor, rankId?: string, reason?: string): Promise<StaffMember>;
    /** Removes someone from the roster and takes away their rank and leave roles. History is kept. */
    fire(guildId: string, userId: string, actor: StaffActor, reason?: string): Promise<void>;
    /** Changes callsign, notes, join date, or status (active, suspended, retired). */
    updateMember(guildId: string, userId: string, actor: StaffActor, input: MemberUpdateInput): Promise<StaffMember>;
    note(guildId: string, userId: string, actor: StaffActor, text: string): Promise<void>;
    /** Gives a strike. `expiresInDays` makes it stop counting after that many days. */
    strike(guildId: string, userId: string, actor: StaffActor, reason: string, expiresInDays?: number): Promise<StaffStrikeView>;
    revokeStrike(guildId: string, strikeId: string, actor: StaffActor): Promise<StaffStrikeView>;
    strikes(guildId: string, userId?: string): Promise<readonly StaffStrikeView[]>;
    records(guildId: string, userId?: string, limit?: number): Promise<readonly StaffRecord[]>;
    leaves(filter: LeaveFilter): Promise<readonly StaffLeave[]>;
    /** A staff member asks for leave. Managers approve or deny it. */
    requestLeave(guildId: string, requester: StaffTarget, input: LeaveRequestInput): Promise<StaffLeave>;
    reviewLeave(guildId: string, leaveId: string, actor: StaffActor, approve: boolean, note?: string): Promise<StaffLeave>;
    /** The member withdraws a pending or approved request, or ends their leave early. */
    cancelLeave(guildId: string, leaveId: string, userId: string): Promise<StaffLeave>;
    /** The member's own leave that is pending, approved, or active. */
    currentLeave(guildId: string, userId: string): Promise<StaffLeave | undefined>;
    /** A manager ends someone's active leave now, or cancels an approved one. */
    endLeave(guildId: string, leaveId: string, actor: StaffActor): Promise<StaffLeave>;
    clockIn(guildId: string, target: StaffTarget): Promise<StaffShift>;
    clockOut(guildId: string, userId: string): Promise<StaffShift>;
    shifts(filter: ShiftFilter): Promise<readonly StaffShift[]>;
    /** Time on shift per member for a week (Monday to Monday, UTC). `weeksAgo` 0 is this week. */
    leaderboard(guildId: string, weeksAgo?: number): Promise<Leaderboard>;
    /** Ends shifts past the auto clock-out limit, and starts and ends leave on schedule. */
    sweep(): Promise<SweepResult>;
    /** Posts or updates the roster message. Throws when no roster channel is set. */
    publishRoster(guildId: string): Promise<{
        readonly messageId: string;
    }>;
    private refreshRoster;
    private changeRank;
    private startLeave;
    private finishLeave;
    private updateLeaveMessage;
    private record;
    private post;
    private strikeView;
    private requireMember;
    private requireLeave;
    private changeRoles;
    private requireGateway;
}
//# sourceMappingURL=StaffService.d.ts.map