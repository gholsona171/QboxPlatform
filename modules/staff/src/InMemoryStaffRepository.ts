import { randomUUID } from "node:crypto";

import { defaultStaffSettings } from "./StaffService.js";
import type {
  LeaveCreateData,
  LeaveFilter,
  LeavePatch,
  MemberCreateData,
  MemberPatch,
  RankInput,
  RankPatch,
  RecordCreateData,
  ShiftFilter,
  StaffLeave,
  StaffMember,
  StaffRank,
  StaffRecord,
  StaffRepository,
  StaffSettings,
  StaffSettingsInput,
  StaffShift,
  StaffStrike,
  StrikeCreateData,
} from "./types.js";
import { StaffError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryStaffRepository implements StaffRepository {
  public readonly settingsByGuild = new Map<string, StaffSettings>();
  public ranks: StaffRank[] = [];
  public members: StaffMember[] = [];
  public readonly records: StaffRecord[] = [];
  public readonly strikes: StaffStrike[] = [];
  public readonly leaves: StaffLeave[] = [];
  public readonly shifts: StaffShift[] = [];

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async getSettings(guildId: string): Promise<StaffSettings | undefined> {
    return this.settingsByGuild.get(guildId);
  }

  public async saveSettings(input: StaffSettingsInput & { readonly rosterMessageId?: string | undefined }): Promise<StaffSettings> {
    const current = this.settingsByGuild.get(input.guildId) ?? defaultStaffSettings(input.guildId);
    if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
      throw new StaffError("CONFLICT", "Staff settings changed since they were loaded.", { currentRevision: current.revision });
    const { expectedRevision: _expected, ...rest } = input;
    const saved = { ...rest, revision: current.revision + 1 };
    this.settingsByGuild.set(input.guildId, saved);
    return saved;
  }

  public async setRosterMessage(guildId: string, messageId: string | undefined): Promise<void> {
    const current = this.settingsByGuild.get(guildId) ?? defaultStaffSettings(guildId);
    this.settingsByGuild.set(guildId, { ...current, rosterMessageId: messageId });
  }

  public async listRanks(guildId: string): Promise<readonly StaffRank[]> {
    return this.ranks.filter((rank) => rank.guildId === guildId).sort((left, right) => left.position - right.position);
  }

  public async createRank(guildId: string, input: RankInput, position: number): Promise<StaffRank> {
    const rank: StaffRank = { ...input, id: randomUUID(), guildId, position };
    this.ranks.push(rank);
    return rank;
  }

  public async updateRank(id: string, patch: RankPatch): Promise<StaffRank> {
    return this.patch(this.ranks, id, patch);
  }

  public async deleteRank(id: string): Promise<void> {
    this.ranks = this.ranks.filter((rank) => rank.id !== id);
  }

  public async setRankPositions(guildId: string, rankIds: readonly string[]): Promise<void> {
    this.ranks = this.ranks.map((rank) => (rank.guildId === guildId && rankIds.includes(rank.id) ? { ...rank, position: rankIds.indexOf(rank.id) } : rank));
  }

  public async listMembers(guildId: string): Promise<readonly StaffMember[]> {
    return this.members.filter((member) => member.guildId === guildId);
  }

  public async getMember(guildId: string, userId: string): Promise<StaffMember | undefined> {
    return this.members.find((member) => member.guildId === guildId && member.userId === userId);
  }

  public async createMember(input: MemberCreateData): Promise<StaffMember> {
    const now = this.now();
    const member: StaffMember = { ...input, id: randomUUID(), status: "ACTIVE", createdAt: now, updatedAt: now };
    this.members.push(member);
    return member;
  }

  public async updateMember(id: string, patch: MemberPatch): Promise<StaffMember> {
    return this.patch(this.members, id, { ...patch, updatedAt: this.now() });
  }

  public async deleteMember(id: string): Promise<void> {
    this.members = this.members.filter((member) => member.id !== id);
  }

  public async createRecord(input: RecordCreateData): Promise<StaffRecord> {
    const record: StaffRecord = { ...input, id: randomUUID(), createdAt: this.now() };
    this.records.push(record);
    return record;
  }

  public async listRecords(guildId: string, userId: string | undefined, limit: number): Promise<readonly StaffRecord[]> {
    return this.records.filter((record) => record.guildId === guildId && (!userId || record.userId === userId)).reverse().slice(0, limit);
  }

  public async createStrike(input: StrikeCreateData): Promise<StaffStrike> {
    const strike: StaffStrike = { ...input, id: randomUUID(), createdAt: this.now() };
    this.strikes.push(strike);
    return strike;
  }

  public async getStrike(guildId: string, id: string): Promise<StaffStrike | undefined> {
    return this.strikes.find((strike) => strike.guildId === guildId && strike.id === id);
  }

  public async revokeStrike(id: string, revokedAt: Date, revokedById: string): Promise<StaffStrike> {
    return this.patch(this.strikes, id, { revokedAt, revokedById });
  }

  public async listStrikes(guildId: string, userId: string | undefined, limit: number): Promise<readonly StaffStrike[]> {
    return this.strikes.filter((strike) => strike.guildId === guildId && (!userId || strike.userId === userId)).reverse().slice(0, limit);
  }

  public async createLeave(input: LeaveCreateData): Promise<StaffLeave> {
    const now = this.now();
    const leave: StaffLeave = { ...input, id: randomUUID(), status: "PENDING", createdAt: now, updatedAt: now };
    this.leaves.push(leave);
    return leave;
  }

  public async getLeave(guildId: string, id: string): Promise<StaffLeave | undefined> {
    return this.leaves.find((leave) => leave.guildId === guildId && leave.id === id);
  }

  public async updateLeave(id: string, patch: LeavePatch): Promise<StaffLeave> {
    return this.patch(this.leaves, id, { ...patch, updatedAt: this.now() });
  }

  public async listLeaves(filter: LeaveFilter): Promise<readonly StaffLeave[]> {
    return this.leaves
      .filter((leave) => leave.guildId === filter.guildId)
      .filter((leave) => !filter.statuses || filter.statuses.includes(leave.status))
      .filter((leave) => !filter.userId || leave.userId === filter.userId)
      .reverse()
      .slice(0, filter.limit ?? 50);
  }

  public async listDueLeaves(now: Date): Promise<readonly StaffLeave[]> {
    return this.leaves.filter((leave) => (leave.status === "APPROVED" && leave.startsAt <= now) || (leave.status === "ACTIVE" && leave.endsAt <= now));
  }

  public async createShift(input: { readonly guildId: string; readonly userId: string; readonly userName: string; readonly startedAt: Date }): Promise<StaffShift> {
    const shift: StaffShift = { ...input, id: randomUUID(), autoEnded: false };
    this.shifts.push(shift);
    return shift;
  }

  public async getOpenShift(guildId: string, userId: string): Promise<StaffShift | undefined> {
    return this.shifts.find((shift) => shift.guildId === guildId && shift.userId === userId && !shift.endedAt);
  }

  public async endShift(id: string, endedAt: Date, autoEnded: boolean): Promise<StaffShift> {
    const shift = this.shifts.find((item) => item.id === id);
    if (!shift) throw new StaffError("NOT_FOUND", "Shift was not found.");
    return this.patch(this.shifts, id, { endedAt, autoEnded, durationSeconds: Math.max(0, Math.floor((endedAt.getTime() - shift.startedAt.getTime()) / 1000)) });
  }

  public async listShifts(filter: ShiftFilter): Promise<readonly StaffShift[]> {
    return this.shifts
      .filter((shift) => shift.guildId === filter.guildId && (!filter.userId || shift.userId === filter.userId))
      .filter((shift) => !filter.until || shift.startedAt < filter.until)
      .filter((shift) => !filter.since || !shift.endedAt || shift.endedAt > filter.since)
      .sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime())
      .slice(0, filter.limit ?? 50);
  }

  public async listOpenShifts(startedBefore: Date): Promise<readonly StaffShift[]> {
    return this.shifts.filter((shift) => !shift.endedAt && shift.startedAt <= startedBefore);
  }

  private patch<T extends { readonly id: string }>(items: T[], id: string, patch: object): T {
    const index = items.findIndex((item) => item.id === id);
    const current = items[index];
    if (!current) throw new StaffError("NOT_FOUND", "Record was not found.");
    const next: Record<string, unknown> = { ...current };
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) delete next[key];
      else if (value !== undefined) next[key] = value;
    }
    const updated = next as unknown as T;
    items[index] = updated;
    return updated;
  }
}
