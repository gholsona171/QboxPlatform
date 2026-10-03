import type { LeaveCreateData, LeaveFilter, LeavePatch, MemberCreateData, MemberPatch, RankInput, RankPatch, RecordCreateData, ShiftFilter, StaffLeave, StaffMember, StaffRank, StaffRecord, StaffRepository, StaffSettings, StaffSettingsInput, StaffShift, StaffStrike, StrikeCreateData } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryStaffRepository implements StaffRepository {
    private readonly now;
    readonly settingsByGuild: Map<string, StaffSettings>;
    ranks: StaffRank[];
    members: StaffMember[];
    readonly records: StaffRecord[];
    readonly strikes: StaffStrike[];
    readonly leaves: StaffLeave[];
    readonly shifts: StaffShift[];
    constructor(now?: () => Date);
    getSettings(guildId: string): Promise<StaffSettings | undefined>;
    saveSettings(input: StaffSettingsInput & {
        readonly rosterMessageId?: string | undefined;
    }): Promise<StaffSettings>;
    setRosterMessage(guildId: string, messageId: string | undefined): Promise<void>;
    listRanks(guildId: string): Promise<readonly StaffRank[]>;
    createRank(guildId: string, input: RankInput, position: number): Promise<StaffRank>;
    updateRank(id: string, patch: RankPatch): Promise<StaffRank>;
    deleteRank(id: string): Promise<void>;
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
    listOpenShifts(startedBefore: Date): Promise<readonly StaffShift[]>;
    private patch;
}
//# sourceMappingURL=InMemoryStaffRepository.d.ts.map