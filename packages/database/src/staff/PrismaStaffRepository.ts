import {
  StaffError,
  type LeaveCreateData,
  type LeaveFilter,
  type LeavePatch,
  type MemberCreateData,
  type MemberPatch,
  type RankInput,
  type RankPatch,
  type RecordCreateData,
  type ShiftFilter,
  type StaffLeave,
  type StaffMember,
  type StaffRank,
  type StaffRecord,
  type StaffRepository,
  type StaffSettings,
  type StaffSettingsInput,
  type StaffShift,
  type StaffStrike,
  type StrikeCreateData,
} from "@qbox/staff";
import type { Prisma, PrismaClient } from "@qbox/prisma";

type Client = Pick<PrismaClient, "$transaction" | "staffSettings" | "staffRank" | "staffMember" | "staffRecord" | "staffStrike" | "staffLeave" | "staffShift">;
type SettingsRow = Prisma.StaffSettingsGetPayload<object>;
type RankRow = Prisma.StaffRankGetPayload<object>;
type MemberRow = Prisma.StaffMemberGetPayload<object>;
type RecordRow = Prisma.StaffRecordGetPayload<object>;
type StrikeRow = Prisma.StaffStrikeGetPayload<object>;
type LeaveRow = Prisma.StaffLeaveGetPayload<object>;
type ShiftRow = Prisma.StaffShiftGetPayload<object>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** PostgreSQL staff roster, history, leave, and shifts. `guildId` is the Discord guild ID. */
export class PrismaStaffRepository implements StaffRepository {
  public constructor(private readonly client: Client) {}

  public async getSettings(guildId: string): Promise<StaffSettings | undefined> {
    const row = await this.client.staffSettings.findUnique({ where: { guildId } });
    return row ? mapSettings(row) : undefined;
  }

  public async saveSettings(input: StaffSettingsInput & { readonly rosterMessageId?: string | undefined }): Promise<StaffSettings> {
    const data = {
      logChannelId: input.logChannelId ?? null,
      rosterChannelId: input.rosterChannelId ?? null,
      rosterMessageId: input.rosterMessageId ?? null,
      loaRoleId: input.loaRoleId ?? null,
      autoClockOutHours: input.autoClockOutHours,
      maxLeaveDays: input.maxLeaveDays,
    };
    const existing = await this.client.staffSettings.findUnique({ where: { guildId: input.guildId }, select: { revision: true } });
    if (!existing) {
      if (input.expectedRevision !== undefined && input.expectedRevision !== 0)
        throw new StaffError("CONFLICT", "Staff settings changed since they were loaded.", { currentRevision: 0 });
      return mapSettings(await this.client.staffSettings.create({ data: { guildId: input.guildId, ...data } }));
    }
    const result = await this.client.staffSettings.updateMany({
      where: { guildId: input.guildId, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
      data: { ...data, revision: { increment: 1 } },
    });
    if (result.count === 0) throw new StaffError("CONFLICT", "Staff settings changed since they were loaded.", { currentRevision: existing.revision });
    return mapSettings(await this.client.staffSettings.findUniqueOrThrow({ where: { guildId: input.guildId } }));
  }

  public async setRosterMessage(guildId: string, messageId: string | undefined): Promise<void> {
    await this.client.staffSettings.upsert({
      where: { guildId },
      create: { guildId, rosterMessageId: messageId ?? null, revision: 0 },
      update: { rosterMessageId: messageId ?? null },
    });
  }

  public async listRanks(guildId: string): Promise<readonly StaffRank[]> {
    return (await this.client.staffRank.findMany({ where: { guildId }, orderBy: { position: "asc" } })).map(mapRank);
  }

  public async createRank(guildId: string, input: RankInput, position: number): Promise<StaffRank> {
    return mapRank(await this.client.staffRank.create({
      data: { guildId, name: input.name, roleId: input.roleId ?? null, color: input.color, description: input.description ?? null, position },
    }));
  }

  public async updateRank(id: string, patch: RankPatch): Promise<StaffRank> {
    const data: Prisma.StaffRankUpdateInput = {};
    if (patch.name !== undefined) data.name = patch.name;
    if (patch.roleId !== undefined) data.roleId = patch.roleId;
    if (patch.color !== undefined) data.color = patch.color;
    if (patch.description !== undefined) data.description = patch.description;
    return mapRank(await this.client.staffRank.update({ where: { id }, data }));
  }

  public async deleteRank(id: string): Promise<void> {
    await this.client.staffRank.delete({ where: { id } });
  }

  public async setRankPositions(guildId: string, rankIds: readonly string[]): Promise<void> {
    await this.client.$transaction(rankIds.map((id, position) => this.client.staffRank.updateMany({ where: { id, guildId }, data: { position } })));
  }

  public async listMembers(guildId: string): Promise<readonly StaffMember[]> {
    return (await this.client.staffMember.findMany({ where: { guildId }, orderBy: { joinedAt: "asc" } })).map(mapMember);
  }

  public async getMember(guildId: string, userId: string): Promise<StaffMember | undefined> {
    const row = await this.client.staffMember.findUnique({ where: { guildId_userId: { guildId, userId } } });
    return row ? mapMember(row) : undefined;
  }

  public async createMember(input: MemberCreateData): Promise<StaffMember> {
    return mapMember(await this.client.staffMember.create({
      data: {
        guildId: input.guildId,
        userId: input.userId,
        displayName: input.displayName,
        rankId: input.rankId,
        callsign: input.callsign ?? null,
        joinedAt: input.joinedAt,
      },
    }));
  }

  public async updateMember(id: string, patch: MemberPatch): Promise<StaffMember> {
    const data: Prisma.StaffMemberUncheckedUpdateInput = {};
    if (patch.displayName !== undefined) data.displayName = patch.displayName;
    if (patch.rankId !== undefined) data.rankId = patch.rankId;
    if (patch.callsign !== undefined) data.callsign = patch.callsign;
    if (patch.status !== undefined) data.status = patch.status;
    if (patch.notes !== undefined) data.notes = patch.notes;
    if (patch.joinedAt !== undefined) data.joinedAt = patch.joinedAt;
    return mapMember(await this.client.staffMember.update({ where: { id }, data }));
  }

  public async deleteMember(id: string): Promise<void> {
    await this.client.staffMember.delete({ where: { id } });
  }

  public async createRecord(input: RecordCreateData): Promise<StaffRecord> {
    return mapRecord(await this.client.staffRecord.create({
      data: {
        guildId: input.guildId,
        userId: input.userId,
        userName: input.userName,
        type: input.type,
        actorId: input.actorId,
        actorName: input.actorName,
        reason: input.reason ?? null,
        fromRank: input.fromRank ?? null,
        toRank: input.toRank ?? null,
      },
    }));
  }

  public async listRecords(guildId: string, userId: string | undefined, limit: number): Promise<readonly StaffRecord[]> {
    const rows = await this.client.staffRecord.findMany({ where: { guildId, ...(userId ? { userId } : {}) }, orderBy: { createdAt: "desc" }, take: limit });
    return rows.map(mapRecord);
  }

  public async createStrike(input: StrikeCreateData): Promise<StaffStrike> {
    return mapStrike(await this.client.staffStrike.create({
      data: {
        guildId: input.guildId,
        userId: input.userId,
        userName: input.userName,
        reason: input.reason,
        actorId: input.actorId,
        actorName: input.actorName,
        expiresAt: input.expiresAt ?? null,
      },
    }));
  }

  public async getStrike(guildId: string, id: string): Promise<StaffStrike | undefined> {
    if (!UUID.test(id)) return undefined;
    const row = await this.client.staffStrike.findFirst({ where: { id, guildId } });
    return row ? mapStrike(row) : undefined;
  }

  public async revokeStrike(id: string, revokedAt: Date, revokedById: string): Promise<StaffStrike> {
    return mapStrike(await this.client.staffStrike.update({ where: { id }, data: { revokedAt, revokedById } }));
  }

  public async listStrikes(guildId: string, userId: string | undefined, limit: number): Promise<readonly StaffStrike[]> {
    const rows = await this.client.staffStrike.findMany({ where: { guildId, ...(userId ? { userId } : {}) }, orderBy: { createdAt: "desc" }, take: limit });
    return rows.map(mapStrike);
  }

  public async createLeave(input: LeaveCreateData): Promise<StaffLeave> {
    return mapLeave(await this.client.staffLeave.create({ data: { ...input } }));
  }

  public async getLeave(guildId: string, id: string): Promise<StaffLeave | undefined> {
    if (!UUID.test(id)) return undefined;
    const row = await this.client.staffLeave.findFirst({ where: { id, guildId } });
    return row ? mapLeave(row) : undefined;
  }

  public async updateLeave(id: string, patch: LeavePatch): Promise<StaffLeave> {
    const data: Prisma.StaffLeaveUpdateInput = {};
    if (patch.status !== undefined) data.status = patch.status;
    if (patch.endsAt !== undefined) data.endsAt = patch.endsAt;
    if (patch.reviewerId !== undefined) data.reviewerId = patch.reviewerId;
    if (patch.reviewerName !== undefined) data.reviewerName = patch.reviewerName;
    if (patch.reviewNote !== undefined) data.reviewNote = patch.reviewNote;
    if (patch.reviewedAt !== undefined) data.reviewedAt = patch.reviewedAt;
    if (patch.messageId !== undefined) data.messageId = patch.messageId;
    return mapLeave(await this.client.staffLeave.update({ where: { id }, data }));
  }

  public async listLeaves(filter: LeaveFilter): Promise<readonly StaffLeave[]> {
    const rows = await this.client.staffLeave.findMany({
      where: {
        guildId: filter.guildId,
        ...(filter.statuses ? { status: { in: [...filter.statuses] } } : {}),
        ...(filter.userId ? { userId: filter.userId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: filter.limit ?? 50,
    });
    return rows.map(mapLeave);
  }

  public async listDueLeaves(now: Date): Promise<readonly StaffLeave[]> {
    const rows = await this.client.staffLeave.findMany({
      where: { OR: [{ status: "APPROVED", startsAt: { lte: now } }, { status: "ACTIVE", endsAt: { lte: now } }] },
      orderBy: { startsAt: "asc" },
      take: 200,
    });
    return rows.map(mapLeave);
  }

  public async createShift(input: { readonly guildId: string; readonly userId: string; readonly userName: string; readonly startedAt: Date }): Promise<StaffShift> {
    return mapShift(await this.client.staffShift.create({ data: { ...input } }));
  }

  public async getOpenShift(guildId: string, userId: string): Promise<StaffShift | undefined> {
    const row = await this.client.staffShift.findFirst({ where: { guildId, userId, endedAt: null }, orderBy: { startedAt: "desc" } });
    return row ? mapShift(row) : undefined;
  }

  public async endShift(id: string, endedAt: Date, autoEnded: boolean): Promise<StaffShift> {
    const row = await this.client.staffShift.findUniqueOrThrow({ where: { id }, select: { startedAt: true } });
    const durationSeconds = Math.max(0, Math.floor((endedAt.getTime() - row.startedAt.getTime()) / 1000));
    return mapShift(await this.client.staffShift.update({ where: { id }, data: { endedAt, autoEnded, durationSeconds } }));
  }

  public async listShifts(filter: ShiftFilter): Promise<readonly StaffShift[]> {
    const rows = await this.client.staffShift.findMany({
      where: {
        guildId: filter.guildId,
        ...(filter.userId ? { userId: filter.userId } : {}),
        ...(filter.until ? { startedAt: { lt: filter.until } } : {}),
        ...(filter.since ? { OR: [{ endedAt: null }, { endedAt: { gt: filter.since } }] } : {}),
      },
      orderBy: { startedAt: "desc" },
      take: filter.limit ?? 50,
    });
    return rows.map(mapShift);
  }

  public async listOpenShifts(startedBefore: Date): Promise<readonly StaffShift[]> {
    const rows = await this.client.staffShift.findMany({ where: { endedAt: null, startedAt: { lte: startedBefore } }, orderBy: { startedAt: "asc" }, take: 500 });
    return rows.map(mapShift);
  }
}

function mapSettings(row: SettingsRow): StaffSettings {
  return {
    guildId: row.guildId,
    ...(row.logChannelId ? { logChannelId: row.logChannelId } : {}),
    ...(row.rosterChannelId ? { rosterChannelId: row.rosterChannelId } : {}),
    ...(row.rosterMessageId ? { rosterMessageId: row.rosterMessageId } : {}),
    ...(row.loaRoleId ? { loaRoleId: row.loaRoleId } : {}),
    autoClockOutHours: row.autoClockOutHours,
    maxLeaveDays: row.maxLeaveDays,
    revision: row.revision,
  };
}

function mapRank(row: RankRow): StaffRank {
  return {
    id: row.id,
    guildId: row.guildId,
    name: row.name,
    ...(row.roleId ? { roleId: row.roleId } : {}),
    color: row.color,
    ...(row.description ? { description: row.description } : {}),
    position: row.position,
  };
}

function mapMember(row: MemberRow): StaffMember {
  return {
    id: row.id,
    guildId: row.guildId,
    userId: row.userId,
    displayName: row.displayName,
    rankId: row.rankId,
    ...(row.callsign ? { callsign: row.callsign } : {}),
    joinedAt: row.joinedAt,
    status: row.status,
    ...(row.notes ? { notes: row.notes } : {}),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapRecord(row: RecordRow): StaffRecord {
  return {
    id: row.id,
    guildId: row.guildId,
    userId: row.userId,
    userName: row.userName,
    type: row.type,
    actorId: row.actorId,
    actorName: row.actorName,
    ...(row.reason === null ? {} : { reason: row.reason }),
    ...(row.fromRank === null ? {} : { fromRank: row.fromRank }),
    ...(row.toRank === null ? {} : { toRank: row.toRank }),
    createdAt: row.createdAt,
  };
}

function mapStrike(row: StrikeRow): StaffStrike {
  return {
    id: row.id,
    guildId: row.guildId,
    userId: row.userId,
    userName: row.userName,
    reason: row.reason,
    actorId: row.actorId,
    actorName: row.actorName,
    ...(row.expiresAt === null ? {} : { expiresAt: row.expiresAt }),
    ...(row.revokedAt === null ? {} : { revokedAt: row.revokedAt }),
    ...(row.revokedById === null ? {} : { revokedById: row.revokedById }),
    createdAt: row.createdAt,
  };
}

function mapLeave(row: LeaveRow): StaffLeave {
  return {
    id: row.id,
    guildId: row.guildId,
    userId: row.userId,
    userName: row.userName,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    reason: row.reason,
    status: row.status,
    ...(row.reviewerId === null ? {} : { reviewerId: row.reviewerId }),
    ...(row.reviewerName === null ? {} : { reviewerName: row.reviewerName }),
    ...(row.reviewNote === null ? {} : { reviewNote: row.reviewNote }),
    ...(row.reviewedAt === null ? {} : { reviewedAt: row.reviewedAt }),
    ...(row.messageId === null ? {} : { messageId: row.messageId }),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapShift(row: ShiftRow): StaffShift {
  return {
    id: row.id,
    guildId: row.guildId,
    userId: row.userId,
    userName: row.userName,
    startedAt: row.startedAt,
    ...(row.endedAt === null ? {} : { endedAt: row.endedAt }),
    ...(row.durationSeconds === null ? {} : { durationSeconds: row.durationSeconds }),
    autoEnded: row.autoEnded,
  };
}
