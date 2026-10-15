import { randomUUID } from "node:crypto";
import { defaultStaffSettings } from "./StaffService.js";
import { StaffError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryStaffRepository {
    now;
    settingsByGuild = new Map();
    ranks = [];
    members = [];
    records = [];
    strikes = [];
    leaves = [];
    shifts = [];
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async getSettings(guildId) {
        return this.settingsByGuild.get(guildId);
    }
    async saveSettings(input) {
        const current = this.settingsByGuild.get(input.guildId) ?? defaultStaffSettings(input.guildId);
        if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
            throw new StaffError("CONFLICT", "Staff settings changed since they were loaded.", { currentRevision: current.revision });
        const { expectedRevision: _expected, ...rest } = input;
        const saved = { ...rest, revision: current.revision + 1 };
        this.settingsByGuild.set(input.guildId, saved);
        return saved;
    }
    async setRosterMessage(guildId, messageId) {
        const current = this.settingsByGuild.get(guildId) ?? defaultStaffSettings(guildId);
        this.settingsByGuild.set(guildId, { ...current, rosterMessageId: messageId });
    }
    async listRanks(guildId) {
        return this.ranks.filter((rank) => rank.guildId === guildId).sort((left, right) => left.position - right.position);
    }
    async createRank(guildId, input, position) {
        const rank = { ...input, id: randomUUID(), guildId, position };
        this.ranks.push(rank);
        return rank;
    }
    async updateRank(id, patch) {
        return this.patch(this.ranks, id, patch);
    }
    async deleteRank(id) {
        this.ranks = this.ranks.filter((rank) => rank.id !== id);
    }
    async setRankPositions(guildId, rankIds) {
        this.ranks = this.ranks.map((rank) => (rank.guildId === guildId && rankIds.includes(rank.id) ? { ...rank, position: rankIds.indexOf(rank.id) } : rank));
    }
    async listMembers(guildId) {
        return this.members.filter((member) => member.guildId === guildId);
    }
    async getMember(guildId, userId) {
        return this.members.find((member) => member.guildId === guildId && member.userId === userId);
    }
    async createMember(input) {
        const now = this.now();
        const member = { ...input, id: randomUUID(), status: "ACTIVE", createdAt: now, updatedAt: now };
        this.members.push(member);
        return member;
    }
    async updateMember(id, patch) {
        return this.patch(this.members, id, { ...patch, updatedAt: this.now() });
    }
    async deleteMember(id) {
        this.members = this.members.filter((member) => member.id !== id);
    }
    async createRecord(input) {
        const record = { ...input, id: randomUUID(), createdAt: this.now() };
        this.records.push(record);
        return record;
    }
    async listRecords(guildId, userId, limit) {
        return this.records.filter((record) => record.guildId === guildId && (!userId || record.userId === userId)).reverse().slice(0, limit);
    }
    async createStrike(input) {
        const strike = { ...input, id: randomUUID(), createdAt: this.now() };
        this.strikes.push(strike);
        return strike;
    }
    async getStrike(guildId, id) {
        return this.strikes.find((strike) => strike.guildId === guildId && strike.id === id);
    }
    async revokeStrike(id, revokedAt, revokedById) {
        return this.patch(this.strikes, id, { revokedAt, revokedById });
    }
    async listStrikes(guildId, userId, limit) {
        return this.strikes.filter((strike) => strike.guildId === guildId && (!userId || strike.userId === userId)).reverse().slice(0, limit);
    }
    async createLeave(input) {
        const now = this.now();
        const leave = { ...input, id: randomUUID(), status: "PENDING", createdAt: now, updatedAt: now };
        this.leaves.push(leave);
        return leave;
    }
    async getLeave(guildId, id) {
        return this.leaves.find((leave) => leave.guildId === guildId && leave.id === id);
    }
    async updateLeave(id, patch) {
        return this.patch(this.leaves, id, { ...patch, updatedAt: this.now() });
    }
    async listLeaves(filter) {
        return this.leaves
            .filter((leave) => leave.guildId === filter.guildId)
            .filter((leave) => !filter.statuses || filter.statuses.includes(leave.status))
            .filter((leave) => !filter.userId || leave.userId === filter.userId)
            .reverse()
            .slice(0, filter.limit ?? 50);
    }
    async listDueLeaves(now) {
        return this.leaves.filter((leave) => (leave.status === "APPROVED" && leave.startsAt <= now) || (leave.status === "ACTIVE" && leave.endsAt <= now));
    }
    async createShift(input) {
        const shift = { ...input, id: randomUUID(), autoEnded: false };
        this.shifts.push(shift);
        return shift;
    }
    async getOpenShift(guildId, userId) {
        return this.shifts.find((shift) => shift.guildId === guildId && shift.userId === userId && !shift.endedAt);
    }
    async endShift(id, endedAt, autoEnded) {
        const shift = this.shifts.find((item) => item.id === id);
        if (!shift)
            throw new StaffError("NOT_FOUND", "Shift was not found.");
        return this.patch(this.shifts, id, { endedAt, autoEnded, durationSeconds: Math.max(0, Math.floor((endedAt.getTime() - shift.startedAt.getTime()) / 1000)) });
    }
    async listShifts(filter) {
        return this.shifts
            .filter((shift) => shift.guildId === filter.guildId && (!filter.userId || shift.userId === filter.userId))
            .filter((shift) => !filter.until || shift.startedAt < filter.until)
            .filter((shift) => !filter.since || !shift.endedAt || shift.endedAt > filter.since)
            .sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime())
            .slice(0, filter.limit ?? 50);
    }
    async listOpenShifts(startedBefore) {
        return this.shifts.filter((shift) => !shift.endedAt && shift.startedAt <= startedBefore);
    }
    patch(items, id, patch) {
        const index = items.findIndex((item) => item.id === id);
        const current = items[index];
        if (!current)
            throw new StaffError("NOT_FOUND", "Record was not found.");
        const next = { ...current };
        for (const [key, value] of Object.entries(patch)) {
            if (value === null)
                delete next[key];
            else if (value !== undefined)
                next[key] = value;
        }
        const updated = next;
        items[index] = updated;
        return updated;
    }
}
//# sourceMappingURL=InMemoryStaffRepository.js.map