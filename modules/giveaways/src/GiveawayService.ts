import { accountCreatedAt, cryptoRandomInt, drawWinners, type RandomInt } from "./draw.js";
import { giveawayMessage, winnerDirectMessage, winnersMessage } from "./render.js";
import type {
  Giveaway,
  GiveawayActor,
  GiveawayBonusEntry,
  GiveawayDetail,
  GiveawayEntrant,
  GiveawayGateway,
  GiveawayMessage,
  GiveawayRepository,
  GiveawayStartInput,
  GiveawayStatus,
  GiveawaySummary,
} from "./types.js";
import { MAX_GIVEAWAY_MINUTES, MAX_GIVEAWAY_WINNERS } from "./types.js";
import { GiveawayError, invalid, requireIds, requireLength, requireRange, requireSnowflake } from "./validation.js";
import { BRAND } from "@qbox/shared/brand";
import { passthroughTemplates, type MessageTemplates, type OutgoingMessage, type TemplateValues } from "@qbox/shared/messages";

export interface GiveawayServiceOptions {
  /** Delay before the entry count on the message is refreshed. 0 refreshes right away. */
  readonly refreshDelayMs?: number | undefined;
  readonly random?: RandomInt | undefined;
  readonly templates?: MessageTemplates | undefined;
}

export interface EntryResult {
  /** True when the member is now entered, false when they left. */
  readonly entered: boolean;
  readonly entries: number;
}

/** "active" is running or paused; "ended" is ended or cancelled. */
export type GiveawayListState = "active" | "ended";

const QBOX: GiveawayActor = { userId: "0", displayName: BRAND.name };
const DAY_MS = 86_400_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATES: Readonly<Record<GiveawayListState, readonly GiveawayStatus[]>> = { active: ["RUNNING", "PAUSED"], ended: ["ENDED", "CANCELLED"] };

/** Just the text and embeds of a rendered message, so pings and buttons come from the built-in one. */
function pick(message: OutgoingMessage): OutgoingMessage {
  return { content: message.content, embeds: message.embeds };
}

/**
 * Giveaway rules shared by the bot and the API. The caller checks
 * `giveaways.manage` before staff actions; any member can enter.
 * Giveaways are referred to by ID or by number.
 */
export class GiveawayService {
  private readonly pending = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly refreshDelayMs: number;
  private readonly random: RandomInt;
  private readonly templates: MessageTemplates;

  public constructor(
    private readonly repository: GiveawayRepository,
    private readonly gateway?: GiveawayGateway,
    private readonly now: () => Date = () => new Date(),
    options: GiveawayServiceOptions = {},
  ) {
    this.refreshDelayMs = options.refreshDelayMs ?? 2000;
    this.random = options.random ?? cryptoRandomInt;
    this.templates = options.templates ?? passthroughTemplates;
  }

  public async start(input: GiveawayStartInput, actor: GiveawayActor): Promise<Giveaway> {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("Channel", input.channelId);
    const prize = input.prize.trim();
    requireLength("Prize", prize, 1, 200);
    const description = input.description?.trim() || undefined;
    if (description) requireLength("Description", description, 1, 1000);
    const winnerCount = input.winnerCount ?? 1;
    requireRange("Winners", winnerCount, 1, MAX_GIVEAWAY_WINNERS);
    const hostId = input.hostId ?? actor.userId;
    requireSnowflake("Host", hostId);
    const requiredRoleIds = [...new Set(input.requiredRoleIds ?? [])];
    const blockedRoleIds = [...new Set(input.blockedRoleIds ?? [])];
    requireIds("Required roles", requiredRoleIds, 20);
    requireIds("Blocked roles", blockedRoleIds, 20);
    if (requiredRoleIds.some((id) => blockedRoleIds.includes(id))) invalid("A role cannot be both required and blocked.");
    const minAccountAgeDays = input.minAccountAgeDays ?? 0;
    const minServerDays = input.minServerDays ?? 0;
    requireRange("Minimum account age (days)", minAccountAgeDays, 0, 3650);
    requireRange("Minimum days in the server", minServerDays, 0, 3650);
    const bonusEntries = this.bonus(input.bonusEntries ?? []);
    if (input.pingRoleId !== undefined) requireSnowflake("Ping role", input.pingRoleId);
    const endsAt = this.endTime(input.endsAt, input.durationMinutes);
    const gateway = this.requireGateway();

    const giveaway = await this.repository.create({
      guildId: input.guildId,
      number: await this.repository.allocateNumber(input.guildId),
      prize,
      ...(description ? { description } : {}),
      winnerCount,
      channelId: input.channelId,
      hostId,
      requiredRoleIds,
      blockedRoleIds,
      minAccountAgeDays,
      minServerDays,
      bonusEntries,
      ...(input.pingRoleId ? { pingRoleId: input.pingRoleId } : {}),
      dmWinners: input.dmWinners ?? true,
      endsAt,
      createdById: actor.userId,
      createdByName: actor.displayName,
    });
    try {
      const posted = await gateway.postMessage(giveaway.channelId, await this.runningMessage(giveaway, 0));
      return await this.repository.update(giveaway.id, { messageId: posted.messageId });
    } catch {
      await this.repository.delete(giveaway.id);
      throw new GiveawayError("INVALID_STATE", `Could not post the giveaway in <#${giveaway.channelId}>. Check that ${BRAND.name} can see and send messages there.`);
    }
  }

  public async list(guildId: string, state?: GiveawayListState, limit = 50): Promise<readonly GiveawaySummary[]> {
    requireSnowflake("guildId", guildId);
    const giveaways = await this.repository.list({ guildId, ...(state ? { statuses: STATES[state] } : {}), limit: Math.min(Math.max(limit, 1), 200) });
    const counts = await this.repository.countEntrants(giveaways.map((giveaway) => giveaway.id));
    return giveaways.map((giveaway) => ({ ...giveaway, entrantCount: counts.get(giveaway.id) ?? 0 }));
  }

  /** Finds a giveaway by ID or by number (`7` or `#7`). */
  public async get(guildId: string, ref: string): Promise<Giveaway> {
    requireSnowflake("guildId", guildId);
    const text = ref.trim().replace(/^#/, "");
    const found = /^\d{1,9}$/.test(text)
      ? await this.repository.getByNumber(guildId, Number(text))
      : UUID.test(text)
        ? await this.repository.get(guildId, text)
        : undefined;
    if (!found) throw new GiveawayError("NOT_FOUND", /^\d+$/.test(text) ? `Giveaway #${text} was not found.` : "That giveaway was not found.");
    return found;
  }

  public async detail(guildId: string, ref: string): Promise<GiveawayDetail> {
    const giveaway = await this.get(guildId, ref);
    const entries = await this.repository.listEntries(giveaway.id);
    return { giveaway, entries, totalEntries: entries.reduce((sum, entry) => sum + entry.entries, 0) };
  }

  /** Enter button: joins the giveaway, or leaves it when already entered. */
  public async toggleEntry(guildId: string, ref: string, entrant: GiveawayEntrant): Promise<EntryResult> {
    const giveaway = await this.get(guildId, ref);
    if (giveaway.status === "PAUSED") throw new GiveawayError("INVALID_STATE", "This giveaway is paused. Try again later.");
    if (giveaway.status !== "RUNNING" || giveaway.endsAt <= this.now()) throw new GiveawayError("INVALID_STATE", "This giveaway has ended.");
    if (await this.repository.removeEntry(giveaway.id, entrant.userId)) {
      await this.scheduleRefresh(giveaway.id);
      return { entered: false, entries: 0 };
    }
    this.checkRequirements(giveaway, entrant);
    const entries = 1 + giveaway.bonusEntries.filter((bonus) => entrant.roleIds.includes(bonus.roleId)).reduce((sum, bonus) => sum + bonus.entries, 0);
    await this.repository.addEntry(giveaway.id, entrant.userId, entrant.displayName.slice(0, 100), entries);
    await this.scheduleRefresh(giveaway.id);
    return { entered: true, entries };
  }

  /** Ends a running or paused giveaway now and draws winners. */
  public async end(guildId: string, ref: string, actor: GiveawayActor): Promise<Giveaway> {
    const giveaway = await this.get(guildId, ref);
    if (giveaway.status !== "RUNNING" && giveaway.status !== "PAUSED") throw new GiveawayError("INVALID_STATE", `Giveaway #${giveaway.number} has already ${giveaway.status === "ENDED" ? "ended" : "been cancelled"}.`);
    return this.finish(giveaway, actor);
  }

  /** Draws new winners for an ended giveaway, skipping the current winners. */
  public async reroll(guildId: string, ref: string, count?: number): Promise<Giveaway> {
    const giveaway = await this.get(guildId, ref);
    if (giveaway.status !== "ENDED") throw new GiveawayError("INVALID_STATE", "Only ended giveaways can be rerolled.");
    const winners = count ?? giveaway.winnerCount;
    requireRange("Winners", winners, 1, MAX_GIVEAWAY_WINNERS);
    const pool = (await this.repository.listEntries(giveaway.id)).filter((entry) => !giveaway.winnerIds.includes(entry.userId));
    if (pool.length === 0) throw new GiveawayError("INVALID_STATE", "There is nobody else to pick.");
    const picked = drawWinners(pool, winners, this.random);
    const updated = await this.repository.update(giveaway.id, { winnerIds: picked });
    await this.announce(updated, picked, true);
    return updated;
  }

  public async cancel(guildId: string, ref: string, actor: GiveawayActor): Promise<Giveaway> {
    const giveaway = await this.get(guildId, ref);
    if (giveaway.status !== "RUNNING" && giveaway.status !== "PAUSED") throw new GiveawayError("INVALID_STATE", "Only running or paused giveaways can be cancelled.");
    this.cancelRefresh(giveaway.id);
    const cancelled = await this.repository.update(giveaway.id, { status: "CANCELLED", endedAt: this.now(), endedById: actor.userId, pausedAt: null });
    await this.refreshMessage(cancelled);
    return cancelled;
  }

  /** Stops entries and the timer until resumed. */
  public async pause(guildId: string, ref: string): Promise<Giveaway> {
    const giveaway = await this.get(guildId, ref);
    if (giveaway.status !== "RUNNING") throw new GiveawayError("INVALID_STATE", "Only running giveaways can be paused.");
    const paused = await this.repository.update(giveaway.id, { status: "PAUSED", pausedAt: this.now() });
    await this.refreshMessage(paused);
    return paused;
  }

  /** Resumes entries and pushes the end time back by the time spent paused. */
  public async resume(guildId: string, ref: string): Promise<Giveaway> {
    const giveaway = await this.get(guildId, ref);
    if (giveaway.status !== "PAUSED") throw new GiveawayError("INVALID_STATE", "This giveaway is not paused.");
    const pausedFor = this.now().getTime() - (giveaway.pausedAt ?? this.now()).getTime();
    const resumed = await this.repository.update(giveaway.id, { status: "RUNNING", pausedAt: null, endsAt: new Date(giveaway.endsAt.getTime() + Math.max(pausedFor, 0)) });
    await this.refreshMessage(resumed);
    return resumed;
  }

  /** Ends running giveaways whose time is up. Returns how many ended. */
  public async sweepDue(): Promise<number> {
    let ended = 0;
    for (const giveaway of await this.repository.listDue(this.now())) {
      await this.finish(giveaway, QBOX);
      ended += 1;
    }
    return ended;
  }

  private checkRequirements(giveaway: Giveaway, entrant: GiveawayEntrant): void {
    const deny = (message: string): never => {
      throw new GiveawayError("FORBIDDEN", message);
    };
    if (giveaway.blockedRoleIds.some((id) => entrant.roleIds.includes(id))) deny("You have a role that cannot enter this giveaway.");
    if (giveaway.requiredRoleIds.length && !giveaway.requiredRoleIds.some((id) => entrant.roleIds.includes(id))) deny("You don't have a role needed to enter this giveaway.");
    const now = this.now().getTime();
    if (giveaway.minAccountAgeDays > 0 && now - accountCreatedAt(entrant.userId).getTime() < giveaway.minAccountAgeDays * DAY_MS)
      deny(`Your Discord account must be at least ${giveaway.minAccountAgeDays} days old to enter.`);
    if (giveaway.minServerDays > 0 && (!entrant.joinedAt || now - entrant.joinedAt.getTime() < giveaway.minServerDays * DAY_MS))
      deny(`You must be in the server for at least ${giveaway.minServerDays} days to enter.`);
  }

  private async finish(giveaway: Giveaway, actor: GiveawayActor): Promise<Giveaway> {
    this.cancelRefresh(giveaway.id);
    const winners = drawWinners(await this.repository.listEntries(giveaway.id), giveaway.winnerCount, this.random);
    const ended = await this.repository.update(giveaway.id, { status: "ENDED", endedAt: this.now(), endedById: actor.userId, pausedAt: null, winnerIds: winners });
    await this.announce(ended, winners, false);
    return ended;
  }

  private async announce(giveaway: Giveaway, winners: readonly string[], reroll: boolean): Promise<void> {
    if (!this.gateway) return;
    const entries = await this.refreshMessage(giveaway);
    const fallback = winnersMessage(giveaway, winners, reroll);
    const rendered = await this.templates.apply(giveaway.guildId, "giveaways.ended", {
      ...(await this.values(giveaway, entries)),
      winners: winners.length ? winners.map((id) => `<@${id}>`).join(", ") : "No valid entries",
      endsAt: giveaway.endedAt ?? giveaway.endsAt,
    }, fallback);
    await this.gateway.postMessage(giveaway.channelId, { ...fallback, ...pick(rendered) }, giveaway.messageId).catch(() => undefined);
    if (giveaway.dmWinners) for (const userId of winners) await this.gateway.directMessage(userId, winnerDirectMessage(giveaway));
  }

  /** The giveaway post (`giveaways.started`) while it runs; other states keep the built-in message. */
  private async runningMessage(giveaway: Giveaway, entries: number): Promise<GiveawayMessage> {
    const fallback = giveawayMessage(giveaway, entries);
    if (giveaway.status !== "RUNNING") return fallback;
    const rendered = await this.templates.apply(giveaway.guildId, "giveaways.started", { ...(await this.values(giveaway, entries)), winners: giveaway.winnerCount, endsAt: giveaway.endsAt }, fallback);
    return { ...fallback, ...pick(rendered) };
  }

  private async values(giveaway: Giveaway, entries: number): Promise<TemplateValues> {
    const server = this.gateway ? await this.gateway.guildName(giveaway.guildId).catch(() => "the server") : "the server";
    return { prize: giveaway.prize, host: `<@${giveaway.hostId}>`, entries, server };
  }

  private async scheduleRefresh(giveawayId: string): Promise<void> {
    if (!this.gateway) return;
    if (this.refreshDelayMs <= 0) {
      await this.refreshById(giveawayId);
      return;
    }
    if (this.pending.has(giveawayId)) return;
    const timer = setTimeout(() => {
      this.pending.delete(giveawayId);
      void this.refreshById(giveawayId);
    }, this.refreshDelayMs);
    timer.unref?.();
    this.pending.set(giveawayId, timer);
  }

  private cancelRefresh(giveawayId: string): void {
    const timer = this.pending.get(giveawayId);
    if (timer) clearTimeout(timer);
    this.pending.delete(giveawayId);
  }

  private async refreshById(giveawayId: string): Promise<void> {
    const giveaway = await this.repository.findById(giveawayId).catch(() => undefined);
    if (giveaway) await this.refreshMessage(giveaway);
  }

  /** Updates the giveaway post and returns the entry count. */
  private async refreshMessage(giveaway: Giveaway): Promise<number> {
    const count = (await this.repository.countEntrants([giveaway.id])).get(giveaway.id) ?? 0;
    if (!this.gateway || !giveaway.messageId) return count;
    await this.gateway.editMessage(giveaway.channelId, giveaway.messageId, await this.runningMessage(giveaway, count)).catch(() => undefined);
    return count;
  }

  private bonus(input: readonly GiveawayBonusEntry[]): readonly GiveawayBonusEntry[] {
    if (input.length > 20) invalid("You can add at most 20 bonus entry roles.");
    const seen = new Set<string>();
    return input.map((bonus) => {
      requireSnowflake("Bonus role", bonus.roleId);
      requireRange("Bonus entries", bonus.entries, 1, 100);
      if (seen.has(bonus.roleId)) invalid("Each bonus role can only be listed once.");
      seen.add(bonus.roleId);
      return { roleId: bonus.roleId, entries: bonus.entries };
    });
  }

  private endTime(endsAt: Date | undefined, durationMinutes: number | undefined): Date {
    if (endsAt && durationMinutes !== undefined) invalid("Give either an end time or a duration, not both.");
    const now = this.now().getTime();
    if (durationMinutes !== undefined) {
      requireRange("Duration (minutes)", durationMinutes, 1, MAX_GIVEAWAY_MINUTES);
      return new Date(now + durationMinutes * 60_000);
    }
    if (!endsAt) return invalid("Give an end time or a duration.");
    if (Number.isNaN(endsAt.getTime()) || endsAt.getTime() < now + 60_000) invalid("The end time must be at least a minute from now.");
    if (endsAt.getTime() > now + MAX_GIVEAWAY_MINUTES * 60_000) invalid("Giveaways can run for at most 90 days.");
    return endsAt;
  }

  private requireGateway(): GiveawayGateway {
    if (!this.gateway) throw new GiveawayError("DEPENDENCY_UNAVAILABLE", "Discord is not connected.");
    return this.gateway;
  }
}
