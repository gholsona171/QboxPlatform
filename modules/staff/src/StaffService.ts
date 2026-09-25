import type {
  Leaderboard,
  LeaveFilter,
  RankInput,
  ShiftFilter,
  StaffButton,
  StaffActor,
  StaffEmbed,
  StaffGateway,
  StaffLeave,
  StaffMember,
  StaffProfile,
  StaffRank,
  StaffRecord,
  StaffRecordType,
  StaffRepository,
  StaffRoster,
  StaffSettings,
  StaffSettingsInput,
  StaffShift,
  StaffStatus,
  StaffStrike,
  StaffStrikeView,
  StaffTarget,
} from "./types.js";
import { MAX_RANKS, STAFF_CUSTOM_ID } from "./types.js";
import { StaffError, invalid, optionalText, requireLength, requireRange, requireSnowflake, validateRank, validateSettings } from "./validation.js";

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

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const SYSTEM: StaffActor = { userId: "0", displayName: "Qbox", source: "SYSTEM" };
const ROLE_FAILURE = "Discord would not change their roles. Make sure they are in the server and the Qbox role is above the staff roles.";

const RECORD_LABELS: Readonly<Record<StaffRecordType, string>> = {
  HIRE: "Hired",
  PROMOTE: "Promoted",
  DEMOTE: "Demoted",
  FIRE: "Removed from staff",
  LOA_START: "Leave started",
  LOA_END: "Leave ended",
  NOTE: "Note",
  STRIKE: "Strike",
};

const RECORD_COLORS: Readonly<Record<StaffRecordType, string>> = {
  HIRE: "#57F287",
  PROMOTE: "#57F287",
  DEMOTE: "#E67E22",
  FIRE: "#ED4245",
  LOA_START: "#FEE75C",
  LOA_END: "#5865F2",
  NOTE: "#5865F2",
  STRIKE: "#ED4245",
};

const STATUS_LABELS: Readonly<Record<StaffStatus, string>> = {
  ACTIVE: "Active",
  LOA: "On leave",
  SUSPENDED: "Suspended",
  RETIRED: "Retired",
};

export function defaultStaffSettings(guildId: string): StaffSettings {
  return { guildId, autoClockOutHours: 12, maxLeaveDays: 60, revision: 0 };
}

export function recordLabel(type: StaffRecordType): string {
  return RECORD_LABELS[type];
}

export function statusLabel(status: StaffStatus): string {
  return STATUS_LABELS[status];
}

/** Monday 00:00 UTC of the week containing `date`. */
export function weekStart(date: Date): Date {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const offset = (day.getUTCDay() + 6) % 7;
  return new Date(day.getTime() - offset * DAY_MS);
}

/** `3h 20m` style duration. */
export function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

/** Seconds of `shift` that fall inside [since, until). Open shifts run until `now`. */
export function secondsWithin(shift: StaffShift, since: Date, until: Date, now: Date): number {
  const end = Math.min((shift.endedAt ?? now).getTime(), until.getTime());
  const start = Math.max(shift.startedAt.getTime(), since.getTime());
  return Math.max(0, Math.floor((end - start) / 1000));
}

/** Roster message body: every rank, highest first, with its members. */
export function rosterEmbed(ranks: readonly StaffRank[], members: readonly StaffMember[]): StaffEmbed {
  const sections = [...ranks].sort((left, right) => left.position - right.position).map((rank) => {
    const inRank = members.filter((member) => member.rankId === rank.id).sort((left, right) => left.joinedAt.getTime() - right.joinedAt.getTime());
    const lines = inRank.map((member) => `<@${member.userId}>${member.callsign ? ` · ${member.callsign}` : ""}${member.status === "ACTIVE" ? "" : ` · ${STATUS_LABELS[member.status]}`}`);
    return [`**${rank.name}** (${inRank.length})`, ...(lines.length ? lines : ["_No members_"])].join("\n");
  });
  let description = sections.join("\n\n") || "No ranks yet.";
  if (description.length > 4000) description = `${description.slice(0, description.lastIndexOf("\n", 3990))}\n…`;
  return {
    title: "Staff roster",
    description,
    color: ranks.find((rank) => rank.position === 0)?.color ?? "#5865F2",
    footer: `${members.length} staff member${members.length === 1 ? "" : "s"} · updates automatically`,
  };
}

/**
 * Staff roster, ranks, history, strikes, leave, and shifts. Shared by the bot
 * and the API. The caller checks permissions before calling; the service
 * validates input, changes Discord roles, keeps the history, posts to the
 * staff log, and keeps the roster message up to date.
 */
export class StaffService {
  public constructor(
    private readonly repository: StaffRepository,
    private readonly gateway?: StaffGateway,
    private readonly now: () => Date = () => new Date(),
  ) {}

  /* ---------- Settings ---------- */

  public async settings(guildId: string): Promise<StaffSettings> {
    requireSnowflake("guildId", guildId);
    return (await this.repository.getSettings(guildId)) ?? defaultStaffSettings(guildId);
  }

  public async saveSettings(input: StaffSettingsInput): Promise<StaffSettings> {
    validateSettings(input);
    const current = await this.settings(input.guildId);
    const moved = input.rosterChannelId !== current.rosterChannelId;
    const saved = await this.repository.saveSettings({ ...input, rosterMessageId: moved ? undefined : current.rosterMessageId });
    if (moved && saved.rosterChannelId) {
      await this.refreshRoster(input.guildId);
      return this.settings(input.guildId);
    }
    return saved;
  }

  /* ---------- Ranks ---------- */

  public async ranks(guildId: string): Promise<readonly StaffRank[]> {
    requireSnowflake("guildId", guildId);
    return [...(await this.repository.listRanks(guildId))].sort((left, right) => left.position - right.position);
  }

  /** Adds a rank below the current lowest rank. */
  public async createRank(guildId: string, input: RankInput): Promise<StaffRank> {
    const clean = cleanRank(input);
    const ranks = await this.ranks(guildId);
    if (ranks.length >= MAX_RANKS) throw new StaffError("LIMIT_REACHED", `You can have at most ${MAX_RANKS} ranks.`);
    if (ranks.some((rank) => rank.name.toLowerCase() === clean.name.toLowerCase())) invalid(`A rank named "${clean.name}" already exists.`);
    const created = await this.repository.createRank(guildId, clean, ranks.length);
    await this.refreshRoster(guildId);
    return created;
  }

  /** Changes a rank. A new Discord role is given to everyone in the rank. */
  public async updateRank(guildId: string, rankId: string, input: RankInput): Promise<StaffRank> {
    const clean = cleanRank(input);
    const ranks = await this.ranks(guildId);
    const rank = findRank(ranks, rankId);
    if (ranks.some((other) => other.id !== rankId && other.name.toLowerCase() === clean.name.toLowerCase())) invalid(`A rank named "${clean.name}" already exists.`);
    const updated = await this.repository.updateRank(rankId, {
      name: clean.name,
      color: clean.color,
      roleId: clean.roleId ?? null,
      description: clean.description ?? null,
    });
    if (rank.roleId !== clean.roleId && this.gateway) {
      const reason = `Rank "${clean.name}" role changed`;
      for (const member of (await this.repository.listMembers(guildId)).filter((item) => item.rankId === rankId)) {
        if (clean.roleId) await this.gateway.addRole(guildId, member.userId, clean.roleId, reason).catch(() => undefined);
        if (rank.roleId) await this.gateway.removeRole(guildId, member.userId, rank.roleId, reason).catch(() => undefined);
      }
    }
    await this.refreshRoster(guildId);
    return updated;
  }

  public async deleteRank(guildId: string, rankId: string): Promise<void> {
    const ranks = await this.ranks(guildId);
    findRank(ranks, rankId);
    const count = (await this.repository.listMembers(guildId)).filter((member) => member.rankId === rankId).length;
    if (count > 0) throw new StaffError("INVALID_STATE", `Move or remove the ${count} member${count === 1 ? "" : "s"} in this rank first.`);
    await this.repository.deleteRank(rankId);
    await this.repository.setRankPositions(guildId, ranks.filter((rank) => rank.id !== rankId).map((rank) => rank.id));
    await this.refreshRoster(guildId);
  }

  /** Reorders ranks; `rankIds` lists every rank, highest first. */
  public async reorderRanks(guildId: string, rankIds: readonly string[]): Promise<readonly StaffRank[]> {
    const ranks = await this.ranks(guildId);
    if (rankIds.length !== ranks.length || new Set(rankIds).size !== rankIds.length || !rankIds.every((id) => ranks.some((rank) => rank.id === id)))
      invalid("The new order must list every rank once.");
    await this.repository.setRankPositions(guildId, rankIds);
    await this.refreshRoster(guildId);
    return this.ranks(guildId);
  }

  /* ---------- Roster ---------- */

  public async roster(guildId: string): Promise<StaffRoster> {
    const ranks = await this.ranks(guildId);
    const order = new Map(ranks.map((rank) => [rank.id, rank.position]));
    const members = [...(await this.repository.listMembers(guildId))].sort(
      (left, right) => (order.get(left.rankId) ?? 0) - (order.get(right.rankId) ?? 0) || left.joinedAt.getTime() - right.joinedAt.getTime(),
    );
    return { ranks, members };
  }

  /** Roster entry for a user, or undefined when they are not on staff. */
  public async member(guildId: string, userId: string): Promise<StaffMember | undefined> {
    requireSnowflake("guildId", guildId);
    requireSnowflake("member", userId);
    return this.repository.getMember(guildId, userId);
  }

  public async profile(guildId: string, userId: string): Promise<StaffProfile> {
    const member = await this.requireMember(guildId, userId);
    const now = this.now();
    const since = weekStart(now);
    const until = new Date(since.getTime() + WEEK_MS);
    const [ranks, records, strikes, leaves, shifts, openShift, week] = await Promise.all([
      this.ranks(guildId),
      this.repository.listRecords(guildId, userId, 50),
      this.repository.listStrikes(guildId, userId, 50),
      this.repository.listLeaves({ guildId, userId, limit: 20 }),
      this.repository.listShifts({ guildId, userId, limit: 20 }),
      this.repository.getOpenShift(guildId, userId),
      this.repository.listShifts({ guildId, userId, since, until, limit: 500 }),
    ]);
    const strikeViews = strikes.map((strike) => this.strikeView(strike));
    return {
      member,
      rank: findRank(ranks, member.rankId),
      records,
      strikes: strikeViews,
      activeStrikes: strikeViews.filter((strike) => strike.active).length,
      leaves,
      shifts,
      openShift,
      weekSeconds: week.reduce((total, shift) => total + secondsWithin(shift, since, until, now), 0),
    };
  }

  /** Adds someone to the roster (lowest rank unless given) and gives them the rank role. */
  public async hire(guildId: string, target: StaffTarget, actor: StaffActor, input: HireInput = {}): Promise<StaffMember> {
    requireSnowflake("guildId", guildId);
    requireSnowflake("member", target.userId);
    const displayName = cleanName(target.displayName);
    const callsign = optionalText("Callsign", input.callsign, 32);
    const reason = optionalText("Reason", input.reason, 1000);
    if (await this.repository.getMember(guildId, target.userId)) throw new StaffError("INVALID_STATE", `${displayName} is already on the staff roster.`);
    const ranks = await this.ranks(guildId);
    if (ranks.length === 0) throw new StaffError("INVALID_STATE", "Add at least one rank before hiring staff.");
    const rank = input.rankId ? findRank(ranks, input.rankId) : (ranks[ranks.length - 1] as StaffRank);
    if (rank.roleId) await this.changeRoles(() => this.requireGateway().addRole(guildId, target.userId, rank.roleId as string, audit("Hired", actor, reason)));
    const member = await this.repository.createMember({
      guildId,
      userId: target.userId,
      displayName,
      rankId: rank.id,
      ...(callsign ? { callsign } : {}),
      joinedAt: input.joinedAt ?? this.now(),
    });
    await this.record(member, "HIRE", actor, reason, { toRank: rank.name });
    await this.refreshRoster(guildId);
    return member;
  }

  public async promote(guildId: string, userId: string, actor: StaffActor, rankId?: string, reason?: string): Promise<StaffMember> {
    return this.changeRank(guildId, userId, actor, "PROMOTE", rankId, reason);
  }

  public async demote(guildId: string, userId: string, actor: StaffActor, rankId?: string, reason?: string): Promise<StaffMember> {
    return this.changeRank(guildId, userId, actor, "DEMOTE", rankId, reason);
  }

  /** Removes someone from the roster and takes away their rank and leave roles. History is kept. */
  public async fire(guildId: string, userId: string, actor: StaffActor, reason?: string): Promise<void> {
    const member = await this.requireMember(guildId, userId);
    if (member.userId === actor.userId) invalid("You cannot remove yourself from staff.");
    const text = optionalText("Reason", reason, 1000);
    const settings = await this.settings(guildId);
    const rank = findRank(await this.ranks(guildId), member.rankId);
    const auditReason = audit("Removed from staff", actor, text);
    if (this.gateway) {
      if (rank.roleId) await this.gateway.removeRole(guildId, userId, rank.roleId, auditReason).catch(() => undefined);
      if (settings.loaRoleId && member.status === "LOA") await this.gateway.removeRole(guildId, userId, settings.loaRoleId, auditReason).catch(() => undefined);
    }
    const open = await this.repository.getOpenShift(guildId, userId);
    if (open) await this.repository.endShift(open.id, this.now(), true);
    for (const leave of await this.repository.listLeaves({ guildId, userId, statuses: ["PENDING", "APPROVED", "ACTIVE"] }))
      await this.repository.updateLeave(leave.id, { status: leave.status === "ACTIVE" ? "ENDED" : "CANCELLED", ...(leave.status === "ACTIVE" ? { endsAt: this.now() } : {}) });
    await this.repository.deleteMember(member.id);
    await this.record(member, "FIRE", actor, text, { fromRank: rank.name });
    await this.refreshRoster(guildId);
  }

  /** Changes callsign, notes, join date, or status (active, suspended, retired). */
  public async updateMember(guildId: string, userId: string, actor: StaffActor, input: MemberUpdateInput): Promise<StaffMember> {
    const member = await this.requireMember(guildId, userId);
    const callsign = input.callsign === null ? null : optionalText("Callsign", input.callsign, 32);
    const notes = input.notes === null ? null : optionalText("Notes", input.notes, 1000);
    if (input.joinedAt && Number.isNaN(input.joinedAt.getTime())) invalid("Join date is not a valid date.");
    const status = input.status;
    if (status !== undefined && status !== member.status) {
      if (status === "LOA") invalid("Leave starts through a leave request.");
      if (member.status === "LOA") invalid("End their leave first.");
    }
    const updated = await this.repository.updateMember(member.id, {
      ...(input.displayName ? { displayName: cleanName(input.displayName) } : {}),
      ...(input.callsign !== undefined ? { callsign: callsign ?? null } : {}),
      ...(input.notes !== undefined ? { notes: notes ?? null } : {}),
      ...(input.joinedAt ? { joinedAt: input.joinedAt } : {}),
      ...(status ? { status } : {}),
    });
    if (status !== undefined && status !== member.status) {
      await this.record(updated, "NOTE", actor, `Status changed from ${STATUS_LABELS[member.status]} to ${STATUS_LABELS[status]}.`);
      if (status !== "ACTIVE") {
        const open = await this.repository.getOpenShift(guildId, userId);
        if (open) await this.repository.endShift(open.id, this.now(), true);
      }
    }
    await this.refreshRoster(guildId);
    return updated;
  }

  public async note(guildId: string, userId: string, actor: StaffActor, text: string): Promise<void> {
    const member = await this.requireMember(guildId, userId);
    requireLength("Note", text.trim(), 1, 1000);
    await this.record(member, "NOTE", actor, text.trim(), undefined, false);
  }

  /** Gives a strike. `expiresInDays` makes it stop counting after that many days. */
  public async strike(guildId: string, userId: string, actor: StaffActor, reason: string, expiresInDays?: number): Promise<StaffStrikeView> {
    const member = await this.requireMember(guildId, userId);
    if (member.userId === actor.userId) invalid("You cannot strike yourself.");
    requireLength("Reason", reason.trim(), 1, 1000);
    if (expiresInDays !== undefined) requireRange("Expiry (days)", expiresInDays, 1, 3650);
    const strike = await this.repository.createStrike({
      guildId,
      userId,
      userName: member.displayName,
      reason: reason.trim(),
      actorId: actor.userId,
      actorName: actor.displayName,
      ...(expiresInDays ? { expiresAt: new Date(this.now().getTime() + expiresInDays * DAY_MS) } : {}),
    });
    const active = (await this.repository.listStrikes(guildId, userId, 200)).filter((item) => this.strikeView(item).active).length;
    await this.record(member, "STRIKE", actor, `${reason.trim()}${expiresInDays ? ` (expires in ${expiresInDays} days)` : ""}`, undefined, true, [
      { name: "Active strikes", value: String(active), inline: true },
    ]);
    return this.strikeView(strike);
  }

  public async revokeStrike(guildId: string, strikeId: string, actor: StaffActor): Promise<StaffStrikeView> {
    requireSnowflake("guildId", guildId);
    const strike = await this.repository.getStrike(guildId, strikeId);
    if (!strike) throw new StaffError("NOT_FOUND", "Strike was not found.");
    if (strike.revokedAt) throw new StaffError("INVALID_STATE", "This strike is already removed.");
    const revoked = await this.repository.revokeStrike(strike.id, this.now(), actor.userId);
    await this.post(await this.settings(guildId), {
      title: "Strike removed",
      description: `Strike for <@${strike.userId}> removed by ${mention(actor)}.\n**Strike:** ${strike.reason}`,
      color: "#57F287",
    });
    return this.strikeView(revoked);
  }

  public async strikes(guildId: string, userId?: string): Promise<readonly StaffStrikeView[]> {
    requireSnowflake("guildId", guildId);
    return (await this.repository.listStrikes(guildId, userId, 200)).map((strike) => this.strikeView(strike));
  }

  public async records(guildId: string, userId?: string, limit = 50): Promise<readonly StaffRecord[]> {
    requireSnowflake("guildId", guildId);
    return this.repository.listRecords(guildId, userId, Math.min(Math.max(limit, 1), 200));
  }

  /* ---------- Leave ---------- */

  public async leaves(filter: LeaveFilter): Promise<readonly StaffLeave[]> {
    requireSnowflake("guildId", filter.guildId);
    return this.repository.listLeaves({ ...filter, limit: Math.min(Math.max(filter.limit ?? 50, 1), 200) });
  }

  /** A staff member asks for leave. Managers approve or deny it. */
  public async requestLeave(guildId: string, requester: StaffTarget, input: LeaveRequestInput): Promise<StaffLeave> {
    const member = await this.repository.getMember(guildId, requester.userId);
    if (!member) throw new StaffError("FORBIDDEN", "Only staff on the roster can request leave.");
    if (member.status !== "ACTIVE") throw new StaffError("INVALID_STATE", `You can't request leave while ${STATUS_LABELS[member.status].toLowerCase()}.`);
    const reason = input.reason.trim();
    requireLength("Reason", reason, 1, 500);
    const settings = await this.settings(guildId);
    const now = this.now();
    const { startsAt, endsAt } = input;
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) invalid("Leave dates are not valid.");
    if (startsAt.getTime() < now.getTime() - DAY_MS) invalid("Leave can't start in the past.");
    if (startsAt.getTime() > now.getTime() + 365 * DAY_MS) invalid("Leave must start within a year.");
    if (endsAt.getTime() <= startsAt.getTime() + HOUR_MS) invalid("Leave must end at least an hour after it starts.");
    if (endsAt.getTime() - startsAt.getTime() > settings.maxLeaveDays * DAY_MS) invalid(`Leave can be at most ${settings.maxLeaveDays} days.`);
    const open = await this.repository.listLeaves({ guildId, userId: member.userId, statuses: ["PENDING", "APPROVED", "ACTIVE"], limit: 1 });
    if (open.length) throw new StaffError("INVALID_STATE", "You already have a leave request that is pending or approved.");
    const leave = await this.repository.createLeave({ guildId, userId: member.userId, userName: member.displayName, startsAt, endsAt, reason });
    const message = await this.post(settings, leaveEmbed(leave), [
      { customId: `${STAFF_CUSTOM_ID.approveLeave}${leave.id}`, label: "Approve", style: "success" },
      { customId: `${STAFF_CUSTOM_ID.denyLeave}${leave.id}`, label: "Deny", style: "danger" },
    ]);
    return message ? this.repository.updateLeave(leave.id, { messageId: message.messageId }) : leave;
  }

  public async reviewLeave(guildId: string, leaveId: string, actor: StaffActor, approve: boolean, note?: string): Promise<StaffLeave> {
    const leave = await this.requireLeave(guildId, leaveId);
    if (leave.status !== "PENDING") throw new StaffError("INVALID_STATE", `This leave request is already ${leave.status.toLowerCase()}.`);
    if (leave.userId === actor.userId) invalid("You cannot review your own leave request.");
    const reviewNote = optionalText("Note", note, 500);
    let updated = await this.repository.updateLeave(leave.id, {
      status: approve ? "APPROVED" : "DENIED",
      reviewerId: actor.userId,
      reviewerName: actor.displayName,
      reviewedAt: this.now(),
      ...(reviewNote ? { reviewNote } : {}),
    });
    const settings = await this.settings(guildId);
    if (approve && updated.startsAt.getTime() <= this.now().getTime()) updated = await this.startLeave(updated, settings);
    await this.updateLeaveMessage(settings, updated);
    return updated;
  }

  /** The member withdraws a pending or approved request, or ends their leave early. */
  public async cancelLeave(guildId: string, leaveId: string, userId: string): Promise<StaffLeave> {
    const leave = await this.requireLeave(guildId, leaveId);
    if (leave.userId !== userId) throw new StaffError("FORBIDDEN", "You can only cancel your own leave.");
    if (leave.status === "ACTIVE") return this.finishLeave(leave, { userId, displayName: leave.userName, source: "DISCORD" }, true);
    if (leave.status !== "PENDING" && leave.status !== "APPROVED") throw new StaffError("INVALID_STATE", `This leave is already ${leave.status.toLowerCase()}.`);
    const updated = await this.repository.updateLeave(leave.id, { status: "CANCELLED" });
    await this.updateLeaveMessage(await this.settings(guildId), updated);
    return updated;
  }

  /** The member's own leave that is pending, approved, or active. */
  public async currentLeave(guildId: string, userId: string): Promise<StaffLeave | undefined> {
    return (await this.repository.listLeaves({ guildId, userId, statuses: ["PENDING", "APPROVED", "ACTIVE"], limit: 1 }))[0];
  }

  /** A manager ends someone's active leave now, or cancels an approved one. */
  public async endLeave(guildId: string, leaveId: string, actor: StaffActor): Promise<StaffLeave> {
    const leave = await this.requireLeave(guildId, leaveId);
    if (leave.status === "APPROVED") {
      const updated = await this.repository.updateLeave(leave.id, { status: "CANCELLED" });
      await this.updateLeaveMessage(await this.settings(guildId), updated);
      return updated;
    }
    if (leave.status !== "ACTIVE") throw new StaffError("INVALID_STATE", "Only approved or active leave can be ended.");
    return this.finishLeave(leave, actor, true);
  }

  /* ---------- Shifts ---------- */

  public async clockIn(guildId: string, target: StaffTarget): Promise<StaffShift> {
    const member = await this.repository.getMember(guildId, target.userId);
    if (!member) throw new StaffError("FORBIDDEN", "Only staff on the roster can clock in.");
    if (member.status !== "ACTIVE") throw new StaffError("INVALID_STATE", `You can't clock in while ${STATUS_LABELS[member.status].toLowerCase()}.`);
    const open = await this.repository.getOpenShift(guildId, member.userId);
    if (open) throw new StaffError("INVALID_STATE", `You are already clocked in (since <t:${Math.floor(open.startedAt.getTime() / 1000)}:t>).`);
    return this.repository.createShift({ guildId, userId: member.userId, userName: member.displayName, startedAt: this.now() });
  }

  public async clockOut(guildId: string, userId: string): Promise<StaffShift> {
    requireSnowflake("guildId", guildId);
    const open = await this.repository.getOpenShift(guildId, userId);
    if (!open) throw new StaffError("INVALID_STATE", "You are not clocked in.");
    return this.repository.endShift(open.id, this.now(), false);
  }

  public async shifts(filter: ShiftFilter): Promise<readonly StaffShift[]> {
    requireSnowflake("guildId", filter.guildId);
    return this.repository.listShifts({ ...filter, limit: Math.min(Math.max(filter.limit ?? 50, 1), 500) });
  }

  /** Time on shift per member for a week (Monday to Monday, UTC). `weeksAgo` 0 is this week. */
  public async leaderboard(guildId: string, weeksAgo = 0): Promise<Leaderboard> {
    requireSnowflake("guildId", guildId);
    requireRange("weeksAgo", weeksAgo, 0, 520);
    const now = this.now();
    const since = new Date(weekStart(now).getTime() - weeksAgo * WEEK_MS);
    const until = new Date(since.getTime() + WEEK_MS);
    const totals = new Map<string, { userId: string; userName: string; seconds: number; shifts: number }>();
    for (const shift of await this.repository.listShifts({ guildId, since, until, limit: 10_000 })) {
      const entry = totals.get(shift.userId) ?? { userId: shift.userId, userName: shift.userName, seconds: 0, shifts: 0 };
      entry.seconds += secondsWithin(shift, since, until, now);
      entry.shifts += 1;
      totals.set(shift.userId, entry);
    }
    return { since, until, entries: [...totals.values()].sort((left, right) => right.seconds - left.seconds) };
  }

  /* ---------- Timer ---------- */

  /** Ends shifts past the auto clock-out limit, and starts and ends leave on schedule. */
  public async sweep(): Promise<SweepResult> {
    const now = this.now();
    const settingsCache = new Map<string, StaffSettings>();
    const settingsFor = async (guildId: string) => {
      const cached = settingsCache.get(guildId) ?? (await this.settings(guildId));
      settingsCache.set(guildId, cached);
      return cached;
    };
    let clockedOut = 0;
    for (const shift of await this.repository.listOpenShifts(new Date(now.getTime() - HOUR_MS))) {
      const hours = (await settingsFor(shift.guildId)).autoClockOutHours;
      if (hours === 0) continue;
      const limit = shift.startedAt.getTime() + hours * HOUR_MS;
      if (limit > now.getTime()) continue;
      await this.repository.endShift(shift.id, new Date(limit), true);
      clockedOut += 1;
    }
    let leavesStarted = 0;
    let leavesEnded = 0;
    for (const leave of await this.repository.listDueLeaves(now)) {
      if (leave.status === "APPROVED") {
        await this.startLeave(leave, await settingsFor(leave.guildId));
        leavesStarted += 1;
      } else if (leave.status === "ACTIVE") {
        await this.finishLeave(leave, SYSTEM, false);
        leavesEnded += 1;
      }
    }
    return { clockedOut, leavesStarted, leavesEnded };
  }

  /* ---------- Roster message ---------- */

  /** Posts or updates the roster message. Throws when no roster channel is set. */
  public async publishRoster(guildId: string): Promise<{ readonly messageId: string }> {
    const settings = await this.settings(guildId);
    if (!settings.rosterChannelId) throw new StaffError("INVALID_STATE", "Choose a roster channel in staff settings first.");
    const gateway = this.requireGateway();
    const roster = await this.roster(guildId);
    const embed = rosterEmbed(roster.ranks, roster.members);
    if (settings.rosterMessageId) {
      try {
        await gateway.editEmbed(settings.rosterChannelId, settings.rosterMessageId, embed);
        return { messageId: settings.rosterMessageId };
      } catch {
        // The message was deleted; post a new one below.
      }
    }
    const posted = await gateway.postEmbed(settings.rosterChannelId, embed).catch(() => {
      throw new StaffError("INVALID_STATE", "Could not post in the roster channel. Check that Qbox can send messages there.");
    });
    await this.repository.setRosterMessage(guildId, posted.messageId);
    return posted;
  }

  /* ---------- Internals ---------- */

  private async refreshRoster(guildId: string): Promise<void> {
    const settings = await this.settings(guildId);
    if (!settings.rosterChannelId || !this.gateway) return;
    await this.publishRoster(guildId).catch(() => undefined);
  }

  private async changeRank(guildId: string, userId: string, actor: StaffActor, type: "PROMOTE" | "DEMOTE", rankId?: string, reason?: string): Promise<StaffMember> {
    const member = await this.requireMember(guildId, userId);
    if (member.userId === actor.userId) invalid(`You cannot ${type === "PROMOTE" ? "promote" : "demote"} yourself.`);
    const text = optionalText("Reason", reason, 1000);
    const ranks = await this.ranks(guildId);
    const index = ranks.findIndex((rank) => rank.id === member.rankId);
    const current = ranks[index] as StaffRank;
    const target = rankId ? findRank(ranks, rankId) : ranks[type === "PROMOTE" ? index - 1 : index + 1];
    if (!target) throw new StaffError("INVALID_STATE", `${member.displayName} is already at the ${type === "PROMOTE" ? "highest" : "lowest"} rank.`);
    const targetIndex = ranks.indexOf(target);
    if (type === "PROMOTE" ? targetIndex >= index : targetIndex <= index) invalid(`Pick a ${type === "PROMOTE" ? "higher" : "lower"} rank than ${current.name}.`);
    if (target.roleId !== current.roleId) {
      const auditReason = audit(`${RECORD_LABELS[type]} to ${target.name}`, actor, text);
      if (target.roleId) await this.changeRoles(() => this.requireGateway().addRole(guildId, userId, target.roleId as string, auditReason));
      if (current.roleId && this.gateway) await this.gateway.removeRole(guildId, userId, current.roleId, auditReason).catch(() => undefined);
    }
    const updated = await this.repository.updateMember(member.id, { rankId: target.id });
    await this.record(updated, type, actor, text, { fromRank: current.name, toRank: target.name });
    await this.refreshRoster(guildId);
    return updated;
  }

  private async startLeave(leave: StaffLeave, settings: StaffSettings): Promise<StaffLeave> {
    const member = await this.repository.getMember(leave.guildId, leave.userId);
    if (!member || member.status !== "ACTIVE") return this.repository.updateLeave(leave.id, { status: "CANCELLED" });
    const updated = await this.repository.updateLeave(leave.id, { status: "ACTIVE" });
    const onLeave = await this.repository.updateMember(member.id, { status: "LOA" });
    if (settings.loaRoleId && this.gateway)
      await this.gateway.addRole(leave.guildId, leave.userId, settings.loaRoleId, "Leave of absence started").catch(() => undefined);
    const open = await this.repository.getOpenShift(leave.guildId, leave.userId);
    if (open) await this.repository.endShift(open.id, this.now(), true);
    await this.record(onLeave, "LOA_START", SYSTEM, `${leave.reason} (until <t:${Math.floor(leave.endsAt.getTime() / 1000)}:D>)`);
    await this.refreshRoster(leave.guildId);
    return updated;
  }

  private async finishLeave(leave: StaffLeave, actor: StaffActor, early: boolean): Promise<StaffLeave> {
    const updated = await this.repository.updateLeave(leave.id, { status: "ENDED", ...(early ? { endsAt: this.now() } : {}) });
    const member = await this.repository.getMember(leave.guildId, leave.userId);
    if (member?.status === "LOA") {
      const back = await this.repository.updateMember(member.id, { status: "ACTIVE" });
      const settings = await this.settings(leave.guildId);
      if (settings.loaRoleId && this.gateway)
        await this.gateway.removeRole(leave.guildId, leave.userId, settings.loaRoleId, "Leave of absence ended").catch(() => undefined);
      await this.record(back, "LOA_END", actor, early ? "Ended early." : "Leave finished.");
      await this.refreshRoster(leave.guildId);
    }
    return updated;
  }

  private async updateLeaveMessage(settings: StaffSettings, leave: StaffLeave): Promise<void> {
    if (!leave.messageId || !settings.logChannelId || !this.gateway) return;
    await this.gateway.editEmbed(settings.logChannelId, leave.messageId, leaveEmbed(leave), []).catch(() => undefined);
  }

  private async record(
    member: StaffMember,
    type: StaffRecordType,
    actor: StaffActor,
    reason: string | undefined,
    ranks?: { readonly fromRank?: string; readonly toRank?: string },
    announce = true,
    fields: readonly { readonly name: string; readonly value: string; readonly inline?: boolean }[] = [],
  ): Promise<void> {
    await this.repository.createRecord({
      guildId: member.guildId,
      userId: member.userId,
      userName: member.displayName,
      type,
      actorId: actor.userId,
      actorName: actor.displayName,
      ...(reason ? { reason } : {}),
      ...(ranks?.fromRank ? { fromRank: ranks.fromRank } : {}),
      ...(ranks?.toRank ? { toRank: ranks.toRank } : {}),
    });
    if (!announce) return;
    const rankLine = ranks?.fromRank && ranks.toRank ? `**Rank:** ${ranks.fromRank} → ${ranks.toRank}` : ranks?.toRank ? `**Rank:** ${ranks.toRank}` : ranks?.fromRank ? `**Was:** ${ranks.fromRank}` : undefined;
    await this.post(await this.settings(member.guildId), {
      title: RECORD_LABELS[type],
      description: [
        `**Member:** <@${member.userId}> (${member.displayName})`,
        ...(rankLine ? [rankLine] : []),
        ...(reason ? [`**Reason:** ${reason}`] : []),
        `**By:** ${mention(actor)}`,
      ].join("\n"),
      color: RECORD_COLORS[type],
      fields,
      footer: `Member ID ${member.userId}`,
    });
  }

  private async post(settings: StaffSettings, embed: StaffEmbed, buttons?: readonly StaffButton[]): Promise<{ readonly messageId: string } | undefined> {
    if (!settings.logChannelId || !this.gateway) return undefined;
    return this.gateway.postEmbed(settings.logChannelId, embed, buttons).catch(() => undefined);
  }

  private strikeView(strike: StaffStrike): StaffStrikeView {
    return { ...strike, active: !strike.revokedAt && (!strike.expiresAt || strike.expiresAt > this.now()) };
  }

  private async requireMember(guildId: string, userId: string): Promise<StaffMember> {
    const member = await this.member(guildId, userId);
    if (!member) throw new StaffError("NOT_FOUND", "That person is not on the staff roster.");
    return member;
  }

  private async requireLeave(guildId: string, leaveId: string): Promise<StaffLeave> {
    requireSnowflake("guildId", guildId);
    const leave = await this.repository.getLeave(guildId, leaveId);
    if (!leave) throw new StaffError("NOT_FOUND", "Leave request was not found.");
    return leave;
  }

  private async changeRoles(action: () => Promise<void>): Promise<void> {
    try {
      await action();
    } catch (error) {
      if (error instanceof StaffError) throw error;
      throw new StaffError("INVALID_STATE", ROLE_FAILURE);
    }
  }

  private requireGateway(): StaffGateway {
    if (!this.gateway) throw new StaffError("DEPENDENCY_UNAVAILABLE", "Discord is not connected.");
    return this.gateway;
  }
}

function cleanRank(input: RankInput): RankInput {
  const clean = {
    name: input.name.trim(),
    color: input.color.toUpperCase(),
    ...(input.roleId ? { roleId: input.roleId } : {}),
    ...(input.description?.trim() ? { description: input.description.trim() } : {}),
  };
  validateRank(clean);
  return clean;
}

function cleanName(value: string): string {
  const name = value.trim().slice(0, 100);
  return name || "Unknown";
}

function findRank(ranks: readonly StaffRank[], rankId: string): StaffRank {
  const rank = ranks.find((item) => item.id === rankId);
  if (!rank) throw new StaffError("NOT_FOUND", "Rank was not found.");
  return rank;
}

function mention(actor: StaffActor): string {
  if (actor.source === "SYSTEM") return actor.displayName;
  return `<@${actor.userId}>${actor.source === "WEB" ? " via portal" : ""}`;
}

function audit(action: string, actor: StaffActor, reason: string | undefined): string {
  return `${action} by ${actor.displayName}${reason ? `: ${reason}` : ""}`.slice(0, 512);
}

function leaveEmbed(leave: StaffLeave): StaffEmbed {
  const status: Readonly<Record<StaffLeave["status"], string>> = {
    PENDING: "Waiting for review",
    APPROVED: "Approved",
    ACTIVE: "On leave",
    ENDED: "Ended",
    DENIED: "Denied",
    CANCELLED: "Cancelled",
  };
  const color: Readonly<Record<StaffLeave["status"], string>> = {
    PENDING: "#FEE75C",
    APPROVED: "#57F287",
    ACTIVE: "#57F287",
    ENDED: "#5865F2",
    DENIED: "#ED4245",
    CANCELLED: "#99AAB5",
  };
  return {
    title: "Leave request",
    description: [
      `**Member:** <@${leave.userId}> (${leave.userName})`,
      `**From:** <t:${Math.floor(leave.startsAt.getTime() / 1000)}:f>`,
      `**Until:** <t:${Math.floor(leave.endsAt.getTime() / 1000)}:f>`,
      `**Reason:** ${leave.reason}`,
      `**Status:** ${status[leave.status]}${leave.reviewerId ? ` by <@${leave.reviewerId}>` : ""}`,
      ...(leave.reviewNote ? [`**Note:** ${leave.reviewNote}`] : []),
    ].join("\n"),
    color: color[leave.status],
    footer: `Leave ${leave.id}`,
  };
}
