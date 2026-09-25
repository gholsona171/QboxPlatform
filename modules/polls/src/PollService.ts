import { optionText, pollMessage, resultsMessage, resultsVisible } from "./render.js";
import type {
  Poll,
  PollActor,
  PollCreateInput,
  PollGateway,
  PollOption,
  PollRepository,
  PollResults,
  PollStatus,
  PollSummary,
  PollTally,
  PollVote,
  PollVoter,
} from "./types.js";
import { MAX_POLL_MINUTES, MAX_POLL_OPTIONS, MIN_POLL_OPTIONS } from "./types.js";
import { PollError, invalid, requireEmoji, requireIds, requireLength, requireRange, requireSnowflake } from "./validation.js";

export interface PollServiceOptions {
  /** Delay before the poll message is refreshed after votes. 0 refreshes right away. */
  readonly refreshDelayMs?: number | undefined;
}

export interface PollExport {
  readonly fileName: string;
  readonly content: string;
}

const QBOX: PollActor = { userId: "0", displayName: "Qbox", canManage: true };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Poll rules shared by the bot and the API.
 *
 * The caller checks `polls.create` before `create` and sets `canManage` from
 * `polls.manage`. Creators can close and reopen their own polls; deleting and
 * exporting need `polls.manage`. Polls are referred to by ID or by number.
 */
export class PollService {
  private readonly pending = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly refreshDelayMs: number;

  public constructor(
    private readonly repository: PollRepository,
    private readonly gateway?: PollGateway,
    private readonly now: () => Date = () => new Date(),
    options: PollServiceOptions = {},
  ) {
    this.refreshDelayMs = options.refreshDelayMs ?? 2000;
  }

  public async create(input: PollCreateInput, actor: PollActor): Promise<Poll> {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("Channel", input.channelId);
    const question = input.question.trim();
    requireLength("Question", question, 1, 200);
    const options = this.options(input.options);
    const maxChoices = input.maxChoices ?? 1;
    requireRange("Max choices", maxChoices, 1, options.length);
    const allowedRoleIds = [...new Set(input.allowedRoleIds ?? [])];
    requireIds("Allowed roles", allowedRoleIds, 25);
    if (input.pingRoleId !== undefined) requireSnowflake("Ping role", input.pingRoleId);
    const endsAt = this.endTime(input.endsAt, input.durationMinutes);
    const gateway = this.requireGateway();

    const number = await this.repository.allocateNumber(input.guildId);
    const poll = await this.repository.create({
      guildId: input.guildId,
      number,
      question,
      options,
      maxChoices,
      anonymous: input.anonymous ?? false,
      resultsVisibility: input.resultsVisibility ?? "LIVE",
      allowVoteChange: input.allowVoteChange ?? true,
      allowedRoleIds,
      channelId: input.channelId,
      ...(input.pingRoleId ? { pingRoleId: input.pingRoleId } : {}),
      ...(endsAt ? { endsAt } : {}),
      createdById: actor.userId,
      createdByName: actor.displayName,
    });
    try {
      const posted = await gateway.postMessage(poll.channelId, pollMessage(poll, { voters: 0, counts: {} }));
      return await this.repository.update(poll.id, { messageId: posted.messageId });
    } catch {
      await this.repository.delete(poll.id);
      throw new PollError("INVALID_STATE", `Could not post the poll in <#${poll.channelId}>. Check that Qbox can see and send messages there.`);
    }
  }

  public async list(guildId: string, status?: PollStatus, limit = 50): Promise<readonly PollSummary[]> {
    requireSnowflake("guildId", guildId);
    const polls = await this.repository.list({ guildId, ...(status ? { status } : {}), limit: Math.min(Math.max(limit, 1), 200) });
    const counts = await this.repository.countVoters(polls.map((poll) => poll.id));
    return polls.map((poll) => ({ ...poll, voterCount: counts.get(poll.id) ?? 0 }));
  }

  /** Finds a poll by ID or by number (`7` or `#7`). */
  public async get(guildId: string, ref: string): Promise<Poll> {
    requireSnowflake("guildId", guildId);
    const text = ref.trim().replace(/^#/, "");
    const found = /^\d{1,9}$/.test(text)
      ? await this.repository.getByNumber(guildId, Number(text))
      : UUID.test(text)
        ? await this.repository.get(guildId, text)
        : undefined;
    if (!found) throw new PollError("NOT_FOUND", /^\d+$/.test(text) ? `Poll #${text} was not found.` : "That poll was not found.");
    return found;
  }

  /**
   * Counts and, for public polls, who voted for what. Only the creator and
   * members with `polls.manage` see counts of open polls that hide results.
   */
  public async results(guildId: string, ref: string, viewer: Pick<PollActor, "userId" | "canManage">): Promise<PollResults> {
    const poll = await this.get(guildId, ref);
    if (!viewer.canManage && viewer.userId !== poll.createdById && !resultsVisible(poll)) throw new PollError("FORBIDDEN", "Results are shown when this poll closes.");
    const votes = await this.repository.listVotes(poll.id);
    const votersByOption: Record<string, { userId: string; userName: string }[]> = {};
    if (!poll.anonymous)
      for (const option of poll.options)
        votersByOption[option.id] = votes.filter((vote) => vote.optionIds.includes(option.id)).map((vote) => ({ userId: vote.userId, userName: vote.userName }));
    return { poll, ...tally(poll, votes), votersByOption };
  }

  /** Records a member's choice, replacing their earlier vote when changes are allowed. */
  public async vote(guildId: string, ref: string, voter: PollVoter, optionIds: readonly string[]): Promise<PollVote> {
    const poll = await this.get(guildId, ref);
    this.requireOpen(poll);
    if (poll.allowedRoleIds.length > 0 && !voter.roleIds.some((roleId) => poll.allowedRoleIds.includes(roleId)))
      throw new PollError("FORBIDDEN", "You don't have a role that can vote in this poll.");
    const chosen = [...new Set(optionIds)];
    if (chosen.length === 0) invalid("Pick at least one option.");
    if (chosen.length > poll.maxChoices) invalid(poll.maxChoices === 1 ? "You can pick only one option." : `You can pick up to ${poll.maxChoices} options.`);
    for (const optionId of chosen) if (!poll.options.some((option) => option.id === optionId)) invalid("That option is not part of this poll.");
    const existing = await this.repository.getVote(poll.id, voter.userId);
    if (existing && !poll.allowVoteChange) throw new PollError("INVALID_STATE", "You already voted, and this poll does not allow changing votes.");
    const ordered = poll.options.map((option) => option.id).filter((id) => chosen.includes(id));
    const saved = await this.repository.saveVote(poll.id, voter.userId, voter.displayName.slice(0, 100), ordered);
    await this.scheduleRefresh(poll.id);
    return saved;
  }

  public async removeVote(guildId: string, ref: string, userId: string): Promise<void> {
    const poll = await this.get(guildId, ref);
    this.requireOpen(poll);
    if (!poll.allowVoteChange) throw new PollError("INVALID_STATE", "This poll does not allow changing votes.");
    if (!(await this.repository.deleteVote(poll.id, userId))) throw new PollError("INVALID_STATE", "You have not voted in this poll.");
    await this.scheduleRefresh(poll.id);
  }

  /** Closes a poll, shows final results on its message, and posts them in the channel. */
  public async close(guildId: string, ref: string, actor: PollActor): Promise<Poll> {
    const poll = await this.get(guildId, ref);
    this.requireOwnerOrManager(poll, actor);
    if (poll.status === "CLOSED") throw new PollError("INVALID_STATE", `Poll #${poll.number} is already closed.`);
    return this.finish(poll, actor);
  }

  /** Reopens a closed poll. A past end time is cleared unless a new one is given. */
  public async reopen(guildId: string, ref: string, actor: PollActor, endsAt?: Date, durationMinutes?: number): Promise<Poll> {
    const poll = await this.get(guildId, ref);
    this.requireOwnerOrManager(poll, actor);
    if (poll.status === "OPEN") throw new PollError("INVALID_STATE", `Poll #${poll.number} is already open.`);
    const newEnd = this.endTime(endsAt, durationMinutes);
    const keepEnd = !newEnd && poll.endsAt && poll.endsAt > this.now() ? poll.endsAt : undefined;
    const reopened = await this.repository.update(poll.id, { status: "OPEN", closedAt: null, closedById: null, endsAt: newEnd ?? keepEnd ?? null });
    await this.refreshMessage(reopened);
    return reopened;
  }

  public async delete(guildId: string, ref: string, actor: PollActor): Promise<void> {
    const poll = await this.get(guildId, ref);
    if (!actor.canManage) throw new PollError("FORBIDDEN", "You need the polls.manage permission to delete polls.");
    if (poll.messageId && this.gateway) await this.gateway.deleteMessage(poll.channelId, poll.messageId).catch(() => undefined);
    this.cancelRefresh(poll.id);
    await this.repository.delete(poll.id);
  }

  /** CSV with totals and, for public polls, one row per voter. */
  public async exportCsv(guildId: string, ref: string, actor: PollActor): Promise<PollExport> {
    if (!actor.canManage) throw new PollError("FORBIDDEN", "You need the polls.manage permission to export results.");
    const poll = await this.get(guildId, ref);
    const votes = await this.repository.listVotes(poll.id);
    const counts = tally(poll, votes);
    const lines = [
      ["option", "label", "votes"].join(","),
      ...poll.options.map((option) => [option.id, csv(optionText(poll, option.id)), String(counts.counts[option.id] ?? 0)].join(",")),
    ];
    if (!poll.anonymous) {
      lines.push("", ["user_id", "user_name", "choices", "voted_at"].join(","));
      for (const vote of votes)
        lines.push([vote.userId, csv(vote.userName), csv(vote.optionIds.map((id) => optionText(poll, id)).join("; ")), vote.updatedAt.toISOString()].join(","));
    }
    return { fileName: `poll-${poll.number}-results.csv`, content: `${lines.join("\n")}\n` };
  }

  /** Closes open polls whose end time has passed. Returns how many closed. */
  public async sweepEnded(): Promise<number> {
    let closed = 0;
    for (const poll of await this.repository.listEnded(this.now())) {
      await this.finish(poll, QBOX);
      closed += 1;
    }
    return closed;
  }

  private async finish(poll: Poll, actor: PollActor): Promise<Poll> {
    this.cancelRefresh(poll.id);
    const closed = await this.repository.update(poll.id, { status: "CLOSED", closedAt: this.now(), closedById: actor.userId });
    const counts = tally(closed, await this.repository.listVotes(closed.id));
    if (this.gateway) {
      if (closed.messageId) await this.gateway.editMessage(closed.channelId, closed.messageId, pollMessage(closed, counts)).catch(() => undefined);
      await this.gateway.postMessage(closed.channelId, resultsMessage(closed, counts), closed.messageId).catch(() => undefined);
    }
    return closed;
  }

  private async scheduleRefresh(pollId: string): Promise<void> {
    if (!this.gateway) return;
    if (this.refreshDelayMs <= 0) {
      await this.refreshById(pollId);
      return;
    }
    if (this.pending.has(pollId)) return;
    const timer = setTimeout(() => {
      this.pending.delete(pollId);
      void this.refreshById(pollId);
    }, this.refreshDelayMs);
    timer.unref?.();
    this.pending.set(pollId, timer);
  }

  private cancelRefresh(pollId: string): void {
    const timer = this.pending.get(pollId);
    if (timer) clearTimeout(timer);
    this.pending.delete(pollId);
  }

  private async refreshById(pollId: string): Promise<void> {
    const poll = await this.repository.findById(pollId).catch(() => undefined);
    if (poll) await this.refreshMessage(poll);
  }

  private async refreshMessage(poll: Poll): Promise<void> {
    if (!this.gateway || !poll.messageId) return;
    const counts = tally(poll, await this.repository.listVotes(poll.id));
    await this.gateway.editMessage(poll.channelId, poll.messageId, pollMessage(poll, counts)).catch(() => undefined);
  }

  private options(input: PollCreateInput["options"]): readonly PollOption[] {
    if (input.length < MIN_POLL_OPTIONS || input.length > MAX_POLL_OPTIONS) invalid(`A poll needs between ${MIN_POLL_OPTIONS} and ${MAX_POLL_OPTIONS} options.`);
    const seen = new Set<string>();
    return input.map((option, index) => {
      const label = option.label.trim();
      requireLength(`Option ${index + 1}`, label, 1, 80);
      if (seen.has(label.toLowerCase())) invalid(`Option "${label}" is listed twice.`);
      seen.add(label.toLowerCase());
      const emoji = option.emoji?.trim() || undefined;
      if (emoji) requireEmoji(emoji);
      return { id: String(index + 1), label, ...(emoji ? { emoji } : {}) };
    });
  }

  private endTime(endsAt: Date | undefined, durationMinutes: number | undefined): Date | undefined {
    if (endsAt && durationMinutes !== undefined) invalid("Give either an end time or a duration, not both.");
    const now = this.now().getTime();
    if (durationMinutes !== undefined) {
      requireRange("Duration (minutes)", durationMinutes, 1, MAX_POLL_MINUTES);
      return new Date(now + durationMinutes * 60_000);
    }
    if (!endsAt) return undefined;
    if (Number.isNaN(endsAt.getTime()) || endsAt.getTime() < now + 60_000) invalid("The end time must be at least a minute from now.");
    if (endsAt.getTime() > now + MAX_POLL_MINUTES * 60_000) invalid("Polls can run for at most 90 days.");
    return endsAt;
  }

  private requireOpen(poll: Poll): void {
    if (poll.status !== "OPEN" || (poll.endsAt && poll.endsAt <= this.now())) throw new PollError("INVALID_STATE", "This poll is closed.");
  }

  private requireOwnerOrManager(poll: Poll, actor: PollActor): void {
    if (!actor.canManage && actor.userId !== poll.createdById) throw new PollError("FORBIDDEN", "Only the poll's creator or staff with polls.manage can do that.");
  }

  private requireGateway(): PollGateway {
    if (!this.gateway) throw new PollError("DEPENDENCY_UNAVAILABLE", "Discord is not connected.");
    return this.gateway;
  }
}

function tally(poll: Poll, votes: readonly PollVote[]): PollTally {
  const counts: Record<string, number> = Object.fromEntries(poll.options.map((option) => [option.id, 0]));
  for (const vote of votes) for (const optionId of vote.optionIds) if (optionId in counts) counts[optionId] = (counts[optionId] ?? 0) + 1;
  return { voters: votes.length, counts };
}

function csv(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}
