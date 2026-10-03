export type StaffStatus = "ACTIVE" | "LOA" | "SUSPENDED" | "RETIRED";
export type StaffRecordType = "HIRE" | "PROMOTE" | "DEMOTE" | "FIRE" | "LOA_START" | "LOA_END" | "NOTE" | "STRIKE";
export type StaffLeaveStatus = "PENDING" | "APPROVED" | "ACTIVE" | "ENDED" | "DENIED" | "CANCELLED";
export type StaffSource = "DISCORD" | "WEB" | "SYSTEM";
export declare const STAFF_STATUSES: readonly StaffStatus[];
export declare const STAFF_RECORD_TYPES: readonly StaffRecordType[];
export declare const STAFF_LEAVE_STATUSES: readonly StaffLeaveStatus[];
export declare const MAX_RANKS = 25;
/** Custom ID prefixes for staff buttons. */
export declare const STAFF_CUSTOM_ID: {
    readonly prefix: "qbox:staff:";
    readonly approveLeave: "qbox:staff:loa-approve:";
    readonly denyLeave: "qbox:staff:loa-deny:";
};
export interface StaffSettings {
    readonly guildId: string;
    /** Hires, promotions, strikes, and leave requests are posted here. */
    readonly logChannelId?: string | undefined;
    /** Channel holding the auto-updating roster message. */
    readonly rosterChannelId?: string | undefined;
    readonly rosterMessageId?: string | undefined;
    /** Role given to members while they are on leave. */
    readonly loaRoleId?: string | undefined;
    /** Open shifts are ended after this many hours. 0 = never. */
    readonly autoClockOutHours: number;
    /** Longest leave a member can request. */
    readonly maxLeaveDays: number;
    readonly revision: number;
}
export interface StaffSettingsInput extends Omit<StaffSettings, "revision" | "rosterMessageId"> {
    readonly expectedRevision?: number | undefined;
}
export interface StaffRank {
    readonly id: string;
    readonly guildId: string;
    readonly name: string;
    readonly roleId?: string | undefined;
    readonly color: string;
    readonly description?: string | undefined;
    /** 0 is the highest rank. */
    readonly position: number;
}
export interface RankInput {
    readonly name: string;
    readonly roleId?: string | undefined;
    readonly color: string;
    readonly description?: string | undefined;
}
export interface RankPatch {
    readonly name?: string;
    readonly roleId?: string | null;
    readonly color?: string;
    readonly description?: string | null;
}
export interface StaffMember {
    readonly id: string;
    readonly guildId: string;
    readonly userId: string;
    readonly displayName: string;
    readonly rankId: string;
    readonly callsign?: string | undefined;
    readonly joinedAt: Date;
    readonly status: StaffStatus;
    readonly notes?: string | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export interface MemberCreateData {
    readonly guildId: string;
    readonly userId: string;
    readonly displayName: string;
    readonly rankId: string;
    readonly callsign?: string | undefined;
    readonly joinedAt: Date;
}
export interface MemberPatch {
    readonly displayName?: string;
    readonly rankId?: string;
    readonly callsign?: string | null;
    readonly status?: StaffStatus;
    readonly notes?: string | null;
    readonly joinedAt?: Date;
}
export interface StaffRecord {
    readonly id: string;
    readonly guildId: string;
    readonly userId: string;
    readonly userName: string;
    readonly type: StaffRecordType;
    readonly actorId: string;
    readonly actorName: string;
    readonly reason?: string | undefined;
    readonly fromRank?: string | undefined;
    readonly toRank?: string | undefined;
    readonly createdAt: Date;
}
export type RecordCreateData = Omit<StaffRecord, "id" | "createdAt">;
export interface StaffStrike {
    readonly id: string;
    readonly guildId: string;
    readonly userId: string;
    readonly userName: string;
    readonly reason: string;
    readonly actorId: string;
    readonly actorName: string;
    readonly expiresAt?: Date | undefined;
    readonly revokedAt?: Date | undefined;
    readonly revokedById?: string | undefined;
    readonly createdAt: Date;
}
export type StrikeCreateData = Omit<StaffStrike, "id" | "createdAt" | "revokedAt" | "revokedById">;
export interface StaffLeave {
    readonly id: string;
    readonly guildId: string;
    readonly userId: string;
    readonly userName: string;
    readonly startsAt: Date;
    readonly endsAt: Date;
    readonly reason: string;
    readonly status: StaffLeaveStatus;
    readonly reviewerId?: string | undefined;
    readonly reviewerName?: string | undefined;
    readonly reviewNote?: string | undefined;
    readonly reviewedAt?: Date | undefined;
    /** Request message in the staff log channel. */
    readonly messageId?: string | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export interface LeaveCreateData {
    readonly guildId: string;
    readonly userId: string;
    readonly userName: string;
    readonly startsAt: Date;
    readonly endsAt: Date;
    readonly reason: string;
}
export interface LeavePatch {
    readonly status?: StaffLeaveStatus;
    readonly endsAt?: Date;
    readonly reviewerId?: string;
    readonly reviewerName?: string;
    readonly reviewNote?: string | null;
    readonly reviewedAt?: Date;
    readonly messageId?: string | null;
}
export interface LeaveFilter {
    readonly guildId: string;
    readonly statuses?: readonly StaffLeaveStatus[] | undefined;
    readonly userId?: string | undefined;
    readonly limit?: number | undefined;
}
export interface StaffShift {
    readonly id: string;
    readonly guildId: string;
    readonly userId: string;
    readonly userName: string;
    readonly startedAt: Date;
    readonly endedAt?: Date | undefined;
    readonly durationSeconds?: number | undefined;
    readonly autoEnded: boolean;
}
export interface ShiftFilter {
    readonly guildId: string;
    readonly userId?: string | undefined;
    /** Shifts that were running at any time in [since, until). */
    readonly since?: Date | undefined;
    readonly until?: Date | undefined;
    readonly limit?: number | undefined;
}
export interface StaffRepository {
    getSettings(guildId: string): Promise<StaffSettings | undefined>;
    saveSettings(input: StaffSettingsInput & {
        readonly rosterMessageId?: string | undefined;
    }): Promise<StaffSettings>;
    /** Stores the roster message ID without changing the settings revision. */
    setRosterMessage(guildId: string, messageId: string | undefined): Promise<void>;
    listRanks(guildId: string): Promise<readonly StaffRank[]>;
    createRank(guildId: string, input: RankInput, position: number): Promise<StaffRank>;
    updateRank(id: string, patch: RankPatch): Promise<StaffRank>;
    deleteRank(id: string): Promise<void>;
    /** Sets `position` to each rank's index in `rankIds`. */
    setRankPositions(guildId: string, rankIds: readonly string[]): Promise<void>;
    listMembers(guildId: string): Promise<readonly StaffMember[]>;
    getMember(guildId: string, userId: string): Promise<StaffMember | undefined>;
    createMember(input: MemberCreateData): Promise<StaffMember>;
    updateMember(id: string, patch: MemberPatch): Promise<StaffMember>;
    deleteMember(id: string): Promise<void>;
    createRecord(input: RecordCreateData): Promise<StaffRecord>;
    listRecords(guildId: string, userId: string | undefined, limit: number): Promise<readonly StaffRecord[]>;
    createStrike(input: StrikeCreateData): Promise<StaffStrike>;
    getStrike(guildId: string, id: string): Promise<StaffStrike | undefined>;
    revokeStrike(id: string, revokedAt: Date, revokedById: string): Promise<StaffStrike>;
    listStrikes(guildId: string, userId: string | undefined, limit: number): Promise<readonly StaffStrike[]>;
    createLeave(input: LeaveCreateData): Promise<StaffLeave>;
    getLeave(guildId: string, id: string): Promise<StaffLeave | undefined>;
    updateLeave(id: string, patch: LeavePatch): Promise<StaffLeave>;
    listLeaves(filter: LeaveFilter): Promise<readonly StaffLeave[]>;
    /** Approved leaves that should start and active leaves that should end, across all guilds. */
    listDueLeaves(now: Date): Promise<readonly StaffLeave[]>;
    createShift(input: {
        readonly guildId: string;
        readonly userId: string;
        readonly userName: string;
        readonly startedAt: Date;
    }): Promise<StaffShift>;
    getOpenShift(guildId: string, userId: string): Promise<StaffShift | undefined>;
    endShift(id: string, endedAt: Date, autoEnded: boolean): Promise<StaffShift>;
    listShifts(filter: ShiftFilter): Promise<readonly StaffShift[]>;
    /** Open shifts started before `startedBefore`, across all guilds. */
    listOpenShifts(startedBefore: Date): Promise<readonly StaffShift[]>;
}
export interface StaffEmbed {
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
export interface StaffButton {
    readonly customId: string;
    readonly label: string;
    readonly style: "success" | "danger";
}
/** Discord operations staff management needs. */
export interface StaffGateway {
    addRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
    removeRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
    postEmbed(channelId: string, embed: StaffEmbed, buttons?: readonly StaffButton[]): Promise<{
        readonly messageId: string;
    }>;
    /** Replaces a message's embed and buttons. Throws when the message is gone. */
    editEmbed(channelId: string, messageId: string, embed: StaffEmbed, buttons?: readonly StaffButton[]): Promise<void>;
}
/** Who performs an action. Permission checks happen before the service is called. */
export interface StaffActor {
    readonly userId: string;
    readonly displayName: string;
    readonly source: StaffSource;
}
export interface StaffTarget {
    readonly userId: string;
    readonly displayName: string;
}
export interface StaffStrikeView extends StaffStrike {
    readonly active: boolean;
}
export interface StaffProfile {
    readonly member: StaffMember;
    readonly rank: StaffRank;
    readonly records: readonly StaffRecord[];
    readonly strikes: readonly StaffStrikeView[];
    readonly activeStrikes: number;
    readonly leaves: readonly StaffLeave[];
    readonly shifts: readonly StaffShift[];
    readonly openShift?: StaffShift | undefined;
    readonly weekSeconds: number;
}
export interface LeaderboardEntry {
    readonly userId: string;
    readonly userName: string;
    readonly seconds: number;
    readonly shifts: number;
}
export interface Leaderboard {
    readonly since: Date;
    readonly until: Date;
    readonly entries: readonly LeaderboardEntry[];
}
export interface StaffRoster {
    readonly ranks: readonly StaffRank[];
    readonly members: readonly StaffMember[];
}
//# sourceMappingURL=types.d.ts.map