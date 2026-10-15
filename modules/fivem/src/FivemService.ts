import type {
  FivemEmbed,
  FivemGateway,
  FivemGuildConfig,
  FivemImage,
  FivemLogger,
  FivemMonitorState,
  FivemPhase,
  FivemQueryClient,
  FivemRepository,
  FivemServerStatus,
  FivemSettings,
  FivemSettingsInput,
  FivemTickResult,
  PlayerHistory,
  PlayerHistoryPoint,
} from "./types.js";
import { renderPlayerGraph } from "./playerGraph.js";
import { FivemError, normalizeAddress, requireSnowflake, validateSettings } from "./validation.js";

/** How often the server is checked, whatever the status message interval (short txAdmin restarts take well under a minute). */
export const CHECK_INTERVAL_MS = 15_000;
/** Kept for older readers: failed checks are now judged by time (`downAfterMinutes`). */
export const FAILURES_BEFORE_DOWN = 2;
/** Players listed in `/fivem players`, the portal, and (when turned on) the status message. */
export const PLAYER_LIST_LIMIT = 40;
/** A scheduled restart window opens with the first warning (at most this many minutes, at least 2) ... */
export const RESTART_WINDOW_BEFORE_MAX_MINUTES = 15;
/** ... and closes this many minutes after the scheduled time. */
export const RESTART_WINDOW_AFTER_MINUTES = 15;
/** A server that answers only partly counts as up after this long. */
export const STARTING_MAX_MS = 3 * 60_000;
/** The player graph in the status message is redrawn this often. */
export const GRAPH_REFRESH_MS = 10 * 60_000;
export const GRAPH_FILE_NAME = "players.png";
const SNAPSHOT_RETENTION_MS = 8 * 86_400_000;
const PRUNE_EVERY_MS = 3_600_000;
const HOUR_MS = 3_600_000;
const RANGES = { "24h": { spanMs: 24 * HOUR_MS, buckets: 96 }, "7d": { spanMs: 7 * 24 * HOUR_MS, buckets: 84 } } as const;
const GREEN = "#57F287";
const YELLOW = "#FEE75C";
const RED = "#ED4245";

export function defaultFivemSettings(guildId: string): FivemSettings {
  return {
    guildId,
    updateIntervalSeconds: 60,
    restartTimes: [],
    timeZone: "UTC",
    restartWarningMinutes: [15, 5],
    showPlayerNames: false,
    downAfterMinutes: 3,
    debug: false,
    revision: 0,
  };
}

export function emptyMonitorState(): FivemMonitorState {
  return { failureStreak: 0, sentRestartWarnings: [] };
}

/** "2h 5m", "3d 4h". */
export function formatUptime(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const rest = minutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${rest}m`;
  return `${rest}m`;
}

/** Date and `HH:MM` for an instant in a time zone. */
export function localTime(at: Date, timeZone: string): { readonly date: string; readonly time: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(at)
      .map((part) => [part.type, part.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

/** The instant a local `YYYY-MM-DD` + `HH:MM` happens in a time zone (DST-aware). */
export function zonedInstant(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split("-").map(Number) as [number, number, number];
  const [hour, minute] = time.split(":").map(Number) as [number, number];
  const wanted = Date.UTC(year, month - 1, day, hour, minute);
  let guess = wanted;
  for (let pass = 0; pass < 3; pass += 1) {
    const local = localTime(new Date(guess), timeZone);
    const [ly, lm, ld] = local.date.split("-").map(Number) as [number, number, number];
    const [lh, lmin] = local.time.split(":").map(Number) as [number, number];
    const shown = Date.UTC(ly, lm - 1, ld, lh, lmin);
    if (shown === wanted) break;
    guess += wanted - shown;
  }
  return new Date(guess);
}

/** Scheduled restart instants from yesterday to tomorrow (local), sorted. */
export function scheduledRestarts(now: Date, settings: Pick<FivemSettings, "restartTimes" | "timeZone">): readonly { readonly at: Date; readonly date: string; readonly time: string }[] {
  const result: { at: Date; date: string; time: string }[] = [];
  for (const offset of [-1, 0, 1, 2]) {
    const { date } = localTime(new Date(now.getTime() + offset * 86_400_000), settings.timeZone);
    for (const time of settings.restartTimes) result.push({ at: zonedInstant(date, time, settings.timeZone), date, time });
  }
  const seen = new Set<number>();
  return result.filter((item) => !seen.has(item.at.getTime()) && seen.add(item.at.getTime())).sort((left, right) => left.at.getTime() - right.at.getTime());
}

/** The next scheduled restart after `now`, if there is a schedule. */
export function nextRestart(now: Date, settings: Pick<FivemSettings, "restartTimes" | "timeZone">): Date | undefined {
  return scheduledRestarts(now, settings).find((item) => item.at.getTime() > now.getTime())?.at;
}

/**
 * The scheduled restart whose window contains `now`: from the first warning
 * (2 to 15 minutes before) until 15 minutes after the scheduled time.
 */
export function restartWindow(now: Date, settings: Pick<FivemSettings, "restartTimes" | "timeZone" | "restartWarningMinutes">): { readonly at: Date; readonly key: string } | undefined {
  const before = Math.min(RESTART_WINDOW_BEFORE_MAX_MINUTES, Math.max(2, ...settings.restartWarningMinutes)) * 60_000;
  const time = now.getTime();
  const hit = scheduledRestarts(now, settings).find((item) => time >= item.at.getTime() - before && time <= item.at.getTime() + RESTART_WINDOW_AFTER_MINUTES * 60_000);
  return hit ? { at: hit.at, key: `${hit.date} ${hit.time}|0` } : undefined;
}

/** Player names for Discord, escaped, cut to the list limit and to `maxLength` with "...and N more". */
export function playerLines(status: FivemServerStatus, limit = PLAYER_LIST_LIMIT, maxLength = 4000): string {
  if (status.players.length === 0) return status.playerCount > 0 ? "The player list is hidden on this server." : "Nobody is online.";
  const lines: string[] = [];
  const total = status.players.length;
  for (const player of status.players.slice(0, limit)) {
    const line = `\`${String(player.id).padStart(3, " ")}\` ${player.name.replace(/([*_`~|>\\])/g, "\\$1")}`;
    const more = total - lines.length - 1;
    const suffix = more > 0 ? `\n…and ${more} more` : "";
    if ([...lines, line].join("\n").length + suffix.length > maxLength) break;
    lines.push(line);
  }
  const more = total - lines.length;
  return `${lines.join("\n")}${more > 0 ? `${lines.length ? "\n" : ""}…and ${more} more` : ""}`;
}

/** What the status message shows besides the live answer. */
export interface FivemStatusView {
  readonly phase: FivemPhase;
  readonly phaseSince?: Date | undefined;
  readonly downSince?: Date | undefined;
  readonly onlineSince?: Date | undefined;
  /** Inside a scheduled restart window. */
  readonly scheduled?: boolean | undefined;
  readonly nextRestart?: Date | undefined;
  /** Attach the player graph (`attachment://players.png`). */
  readonly graph?: { readonly peak: number } | undefined;
  /** List player names (the setting for the channel message; `/fivem players` always does). */
  readonly showPlayerNames?: boolean | undefined;
}

const stamp = (at: Date, style: "R" | "t" | "f" = "R") => `<t:${Math.floor(at.getTime() / 1000)}:${style}>`;

/** The F8 console line for joining: the cfx.re link when set, else the address. */
export function connectCommand(settings: Pick<FivemSettings, "connectUrl" | "serverAddress">): string | undefined {
  const target = settings.connectUrl?.replace(/^https:\/\//i, "") ?? settings.serverAddress;
  return target ? `connect ${target}` : undefined;
}

/** Embed for the status message and `/fivem status`. */
export function statusEmbed(settings: FivemSettings, status: FivemServerStatus, view: FivemStatusView = { phase: status.online ? "online" : "offline" }): FivemEmbed {
  const title = status.hostname || "FiveM server";
  const fields: { name: string; value: string; inline?: boolean }[] = [];
  let description: string;
  let color: string;
  if (view.phase === "online") {
    color = GREEN;
    description = `🟢 **Online** · **${status.playerCount}/${status.maxPlayers}** players`;
  } else if (view.phase === "starting") {
    color = YELLOW;
    description = "🟡 **Starting up** · the server is answering but is not fully up yet.";
  } else if (view.phase === "restarting") {
    color = YELLOW;
    description = view.scheduled
      ? "🟡 **Restarting** · scheduled restart, back in a few minutes."
      : `🟡 **Restarting** · not answering${view.downSince ? ` since ${stamp(view.downSince)}` : ""}. Back soon.`;
  } else {
    color = RED;
    description = `🔴 **Offline**${view.downSince ? ` since ${stamp(view.downSince)}` : ""}\n${status.error ?? "The server is not answering."}`;
  }
  if (status.online) fields.push({ name: "Players", value: `${status.playerCount}/${status.maxPlayers}`, inline: true });
  if (view.phase === "online" && view.onlineSince) fields.push({ name: "Uptime", value: formatUptime(status.checkedAt.getTime() - view.onlineSince.getTime()), inline: true });
  if (view.nextRestart) fields.push({ name: "Next restart", value: `${stamp(view.nextRestart)} (${stamp(view.nextRestart, "t")})`, inline: true });
  const command = connectCommand(settings);
  if (command) fields.push({ name: "How to join", value: `${settings.connectUrl ? "Press **Connect**, or press" : "Press"} **F8** in FiveM and type:\n\`\`\`\n${command}\n\`\`\`` });
  if (view.showPlayerNames && status.online && status.players.length) fields.push({ name: "Online now", value: playerLines(status, PLAYER_LIST_LIMIT, 1024) });
  return {
    title,
    description,
    color,
    fields,
    ...(view.graph ? { image: `attachment://${GRAPH_FILE_NAME}` } : {}),
    ...(status.bannerUrl ? { thumbnail: status.bannerUrl } : {}),
    footer: view.graph ? `Players over the last 24 hours (peak ${view.graph.peak}) · Last checked` : "Last checked",
    timestamp: status.checkedAt,
  };
}

/** The bot's presence line for one server, for example "12/64 on Cloud Nine RP". */
export function presenceText(result: Pick<FivemTickResult, "phase" | "status">): string {
  const name = (result.status.hostname || "the server").slice(0, 80);
  if (result.phase === "online") return `${result.status.playerCount}/${result.status.maxPlayers} on ${name}`;
  if (result.phase === "offline") return `${name}: offline`;
  return `${name}: restarting`;
}

export type FivemPost = { readonly kind: "down" | "back" | "restarting"; readonly ping: boolean; readonly detail: string };

export interface FivemDecision {
  readonly phase: FivemPhase;
  readonly phaseSince: Date;
  readonly onlineSince?: Date | undefined;
  readonly downSince?: Date | undefined;
  readonly downAlertSent: boolean;
  readonly posts: readonly FivemPost[];
  /** Plain words for the debug log. */
  readonly reason: string;
}

/** The phase the bot remembers, reading rows saved before phases existed. */
export function previousPhase(state: FivemMonitorState): FivemPhase | undefined {
  return state.phase ?? (state.lastOnline === true ? "online" : state.lastOnline === false ? "offline" : undefined);
}

/**
 * The state machine. Pure: given what the bot remembered, the check's answer,
 * and whether a scheduled restart window is open, decides the phase and the
 * posts. A scheduled restart never produces the "down" post or a ping.
 */
export function decidePhase(input: {
  readonly state: FivemMonitorState;
  readonly status: FivemServerStatus;
  readonly now: Date;
  readonly window?: { readonly at: Date; readonly key: string } | undefined;
  readonly downAfterMinutes: number;
}): FivemDecision {
  const { state, status, now, window } = input;
  const before = previousPhase(state);
  const since = (phase: FivemPhase) => (phase === before && state.phaseSince ? state.phaseSince : now);
  const downAlertSent = state.downAlertSent ?? false;

  if (status.online) {
    const reported = status.startedAt;
    if (before === undefined) {
      const phase: FivemPhase = status.partial ? "starting" : "online";
      return { phase, phaseSince: now, onlineSince: reported ?? now, downAlertSent: false, posts: [], reason: `first check: server answers${status.partial ? " (partly)" : ""}` };
    }
    if (before === "online") {
      const previous = state.onlineSince;
      if (reported && previous && reported.getTime() - previous.getTime() > 120_000)
        return {
          phase: "online",
          phaseSince: now,
          onlineSince: reported,
          downAlertSent: false,
          posts: [{ kind: "back", ping: false, detail: "The server restarted." }],
          reason: "server reports a newer start time: it restarted between checks",
        };
      return { phase: "online", phaseSince: since("online"), onlineSince: reported ?? previous ?? now, downAlertSent: false, posts: [], reason: "server answers" };
    }
    // Coming back from restarting / starting / offline.
    const startingFor = before === "starting" ? now.getTime() - (state.phaseSince ?? now).getTime() : 0;
    if (status.partial && startingFor < STARTING_MAX_MS)
      return { phase: "starting", phaseSince: since("starting"), downSince: state.downSince, onlineSince: reported, downAlertSent, posts: [], reason: "server answers but not every endpoint yet: starting up" };
    const downFor = state.downSince ? formatUptime(now.getTime() - state.downSince.getTime()) : undefined;
    return {
      phase: "online",
      phaseSince: now,
      onlineSince: reported ?? now,
      downAlertSent: false,
      posts: [{ kind: "back", ping: downAlertSent, detail: downAlertSent ? `The server was down for ${downFor ?? "a while"}.` : window ? "The scheduled restart is done." : "The server restarted." }],
      reason: `server answers again after ${before}${downAlertSent ? " (outage: role pinged)" : ""}`,
    };
  }

  const downSince = state.downSince ?? now;
  if (before === "offline")
    return { phase: "offline", phaseSince: since("offline"), downSince, downAlertSent, posts: [], reason: "still not answering (outage)" };
  if (window) {
    // "Restarting now" is posted once per scheduled restart (the service keys it by the restart).
    return { phase: "restarting", phaseSince: since("restarting"), downSince, downAlertSent: false, posts: [{ kind: "restarting", ping: false, detail: window.key }], reason: "not answering inside a scheduled restart window: down alert suppressed" };
  }
  if (before === undefined)
    return { phase: "offline", phaseSince: now, downSince, downAlertSent: false, posts: [], reason: "first check: not answering (no alert on the first check)" };
  const downMs = now.getTime() - downSince.getTime();
  if (downMs >= input.downAfterMinutes * 60_000)
    return {
      phase: "offline",
      phaseSince: now,
      downSince,
      downAlertSent: true,
      posts: [{ kind: "down", ping: true, detail: `Not answering since ${stamp(downSince, "t")}.` }],
      reason: `not answering for ${formatUptime(downMs)} outside a restart window: outage, alert sent`,
    };
  return {
    phase: "restarting",
    phaseSince: since("restarting"),
    downSince,
    downAlertSent: false,
    posts: [],
    reason: `not answering for ${Math.round(downMs / 1000)}s (down after ${input.downAfterMinutes}m): restarting, no alert yet`,
  };
}

type MutableState = { -readonly [K in keyof FivemMonitorState]?: FivemMonitorState[K] };

/**
 * FiveM server monitoring shared by the bot and the API: live status,
 * the auto-updating status message with a player graph, restart / down /
 * back-online posts, and player-count history. Permission checks happen
 * before the service is called.
 */
export class FivemService {
  private lastPrune = 0;
  private readonly graphs = new Map<string, { readonly image: FivemImage; readonly peak: number; readonly at: number }>();

  public constructor(
    private readonly repository: FivemRepository,
    private readonly query: FivemQueryClient,
    private readonly gateway?: FivemGateway,
    private readonly now: () => Date = () => new Date(),
    private readonly logger?: FivemLogger,
  ) {}

  public async config(guildId: string): Promise<FivemGuildConfig> {
    requireSnowflake("guildId", guildId);
    return (await this.repository.get(guildId)) ?? { settings: defaultFivemSettings(guildId), state: emptyMonitorState() };
  }

  public async settings(guildId: string): Promise<FivemSettings> {
    return (await this.config(guildId)).settings;
  }

  public async saveSettings(input: FivemSettingsInput): Promise<FivemSettings> {
    validateSettings(input);
    const before = await this.config(input.guildId);
    const saved = await this.repository.saveSettings({
      ...input,
      ...(input.serverAddress === undefined ? {} : { serverAddress: normalizeAddress(input.serverAddress) }),
      restartTimes: [...new Set(input.restartTimes)].sort(),
      restartWarningMinutes: [...new Set(input.restartWarningMinutes)].sort((left, right) => right - left),
      showPlayerNames: input.showPlayerNames ?? before.settings.showPlayerNames,
      downAfterMinutes: input.downAfterMinutes ?? before.settings.downAfterMinutes,
      debug: input.debug ?? before.settings.debug,
    });
    const moved = before.settings.statusChannelId !== saved.statusChannelId;
    const newServer = before.settings.serverAddress !== saved.serverAddress;
    if (moved || newServer) {
      this.graphs.delete(input.guildId);
      await this.repository.saveState(input.guildId, {
        ...(moved ? { statusMessageId: undefined, lastMessageAt: undefined } : {}),
        ...(newServer
          ? { lastOnline: undefined, phase: undefined, phaseSince: undefined, downSince: undefined, downAlertSent: false, onlineSince: undefined, failureStreak: 0, lastPolledAt: undefined }
          : {}),
      });
    }
    return saved;
  }

  /** Queries the configured server now. */
  public async status(guildId: string): Promise<FivemServerStatus> {
    const { settings } = await this.config(guildId);
    if (!settings.serverAddress) throw new FivemError("INVALID_STATE", "The FiveM server address is not set yet.");
    return this.query.query(settings.serverAddress);
  }

  /** Queries an address without saving it (the portal's test button). */
  public async test(address: string): Promise<FivemServerStatus> {
    return this.query.query(normalizeAddress(address));
  }

  /** The live status as `/fivem status` shows it: phase, next restart, uptime, and the player graph. */
  public async liveStatus(guildId: string): Promise<{ readonly status: FivemServerStatus; readonly embed: FivemEmbed; readonly image?: FivemImage | undefined }> {
    const config = await this.config(guildId);
    const status = await this.status(guildId);
    const now = status.checkedAt;
    const remembered = previousPhase(config.state);
    const window = restartWindow(now, config.settings);
    const phase: FivemPhase = status.online
      ? status.partial && remembered !== "online" ? "starting" : "online"
      : remembered === "offline" ? "offline" : window || remembered === "restarting" ? "restarting" : "offline";
    const graph = await this.graph(guildId).catch((error: unknown) => this.warn(config.settings, error, "FiveM player graph failed."));
    const embed = statusEmbed(config.settings, status, {
      phase,
      downSince: status.online ? undefined : config.state.downSince,
      onlineSince: phase === "online" && remembered === "online" ? (status.startedAt ?? config.state.onlineSince) : status.startedAt,
      scheduled: window !== undefined,
      nextRestart: nextRestart(now, config.settings),
      graph: graph ? { peak: graph.peak } : undefined,
      showPlayerNames: config.settings.showPlayerNames,
    });
    return { status, embed, ...(graph ? { image: graph.image } : {}) };
  }

  /** Highest player count per time bucket for a chart, with uptime. */
  public async history(guildId: string, range: "24h" | "7d"): Promise<PlayerHistory> {
    requireSnowflake("guildId", guildId);
    const { spanMs, buckets } = RANGES[range];
    const end = this.now().getTime();
    const start = end - spanMs;
    const size = spanMs / buckets;
    const snapshots = await this.repository.listSnapshots(guildId, new Date(start));
    const grouped = Array.from({ length: buckets }, () => ({ players: -1, maxPlayers: 0, online: 0, total: 0 }));
    for (const snapshot of snapshots) {
      const bucket = grouped[Math.min(buckets - 1, Math.max(0, Math.floor((snapshot.at.getTime() - start) / size)))];
      if (!bucket) continue;
      bucket.players = Math.max(bucket.players, snapshot.players);
      bucket.maxPlayers = Math.max(bucket.maxPlayers, snapshot.maxPlayers);
      bucket.total += 1;
      if (snapshot.online) bucket.online += 1;
    }
    const points: PlayerHistoryPoint[] = grouped.map((bucket, index) => ({
      at: new Date(start + index * size),
      ...(bucket.total > 0 ? { players: bucket.players, maxPlayers: bucket.maxPlayers, online: bucket.online === bucket.total } : {}),
    }));
    const online = snapshots.filter((snapshot) => snapshot.online).length;
    return {
      range,
      points,
      peak: snapshots.reduce((peak, snapshot) => Math.max(peak, snapshot.players), 0),
      ...(snapshots.length ? { uptimePercent: Math.round((online / snapshots.length) * 1000) / 10 } : {}),
    };
  }

  /** The 24-hour player graph as a PNG, redrawn at most every 10 minutes (or when `force`). */
  public async graph(guildId: string, force = false): Promise<{ readonly image: FivemImage; readonly peak: number; readonly fresh: boolean }> {
    const cached = this.graphs.get(guildId);
    const now = this.now().getTime();
    if (cached && !force && now - cached.at < GRAPH_REFRESH_MS) return { image: cached.image, peak: cached.peak, fresh: false };
    const history = await this.history(guildId, "24h");
    const image = { name: GRAPH_FILE_NAME, data: renderPlayerGraph(history) };
    this.graphs.set(guildId, { image, peak: history.peak, at: now });
    return { image, peak: history.peak, fresh: true };
  }

  /**
   * Runs due work for every monitored server: checks every 15 seconds, posts
   * restart warnings, and edits the status message. Called by the bot's timer.
   * Returns the servers checked this time (for the bot's presence).
   */
  public async tick(): Promise<readonly FivemTickResult[]> {
    const now = this.now();
    const results: FivemTickResult[] = [];
    for (const config of await this.repository.listMonitored()) {
      const last = config.state.lastPolledAt?.getTime();
      if (last === undefined || now.getTime() - last >= CHECK_INTERVAL_MS - 1000) {
        const result = await this.refresh(config).catch((error: unknown) => this.warn(config.settings, error, "FiveM check failed."));
        if (result) results.push(result);
      }
      const fresh = (await this.repository.get(config.settings.guildId).catch(() => undefined)) ?? config;
      await this.restartWarnings(fresh).catch((error: unknown) => this.warn(config.settings, error, "FiveM restart warning failed."));
    }
    if (now.getTime() - this.lastPrune >= PRUNE_EVERY_MS) {
      this.lastPrune = now.getTime();
      await this.repository.pruneSnapshots(new Date(now.getTime() - SNAPSHOT_RETENTION_MS));
    }
    return results;
  }

  /** Checks one server: decides the phase, records a snapshot, posts alerts, and updates the status message. */
  public async refresh(config: FivemGuildConfig): Promise<FivemTickResult | undefined> {
    const { settings, state } = config;
    if (!settings.serverAddress) return undefined;
    const status = await this.query.query(settings.serverAddress);
    const now = status.checkedAt;
    const window = restartWindow(now, settings);
    const before = previousPhase(state);
    const decision = decidePhase({ state, status, now, window, downAfterMinutes: settings.downAfterMinutes });
    const intervalMs = settings.updateIntervalSeconds * 1000 - 1000;

    const next: MutableState = {
      lastPolledAt: now,
      phase: decision.phase,
      phaseSince: decision.phaseSince,
      lastOnline: decision.phase === "online",
      failureStreak: status.online ? 0 : state.failureStreak + 1,
      downSince: decision.downSince,
      downAlertSent: decision.downAlertSent,
      onlineSince: decision.onlineSince,
    };
    if (!state.lastSnapshotAt || now.getTime() - state.lastSnapshotAt.getTime() >= intervalMs) {
      await this.repository.addSnapshot(settings.guildId, { online: status.online, players: status.playerCount, maxPlayers: status.maxPlayers, at: now });
      next.lastSnapshotAt = now;
    }

    const sentKeys = [...state.sentRestartWarnings];
    const posted: string[] = [];
    const suppressed: string[] = [];
    for (const post of decision.posts) {
      if (!this.gateway || !settings.alertChannelId) {
        suppressed.push(`${post.kind} (no alert channel)`);
        continue;
      }
      if (post.kind === "restarting") {
        if (sentKeys.includes(post.detail)) {
          suppressed.push("restarting now (already posted for this restart)");
          continue;
        }
        sentKeys.unshift(post.detail);
        next.sentRestartWarnings = sentKeys.slice(0, 20);
      }
      const message = alertMessage(post, status);
      await this.gateway
        .postAlert(settings.alertChannelId, message.content, message.embed, post.ping ? settings.alertRoleId : undefined)
        .then(() => posted.push(`${post.kind}${post.ping && settings.alertRoleId ? " (role pinged)" : ""}`))
        .catch((error: unknown) => this.warn(settings, error, "FiveM alert failed."));
    }

    if (this.gateway && settings.statusChannelId) {
      const graph = await this.graph(settings.guildId).catch((error: unknown) => this.warn(settings, error, "FiveM player graph failed."));
      const due =
        decision.phase !== before ||
        !state.statusMessageId ||
        !state.lastMessageAt ||
        now.getTime() - state.lastMessageAt.getTime() >= intervalMs ||
        graph?.fresh === true;
      if (due) {
        const embed = statusEmbed(settings, status, {
          phase: decision.phase,
          phaseSince: decision.phaseSince,
          downSince: decision.downSince,
          onlineSince: decision.onlineSince,
          scheduled: window !== undefined,
          nextRestart: nextRestart(now, settings),
          graph: graph ? { peak: graph.peak } : undefined,
          showPlayerNames: settings.showPlayerNames,
        });
        const messageId = await this.gateway
          .upsertStatusMessage(settings.statusChannelId, state.statusMessageId, embed, settings.connectUrl, { image: graph?.image, refreshImage: graph?.fresh === true })
          .catch((error: unknown) => this.warn(settings, error, "FiveM status message update failed; trying again on the next check."));
        if (messageId) {
          next.lastMessageAt = now;
          if (messageId !== state.statusMessageId) next.statusMessageId = messageId;
        }
      }
    }
    await this.repository.saveState(settings.guildId, next);
    if (settings.debug)
      this.logger?.info(
        {
          operation: "fivem-check",
          guildId: settings.guildId,
          answered: status.online,
          partial: status.partial ?? false,
          players: status.online ? `${status.playerCount}/${status.maxPlayers}` : undefined,
          error: status.error,
          restartWindow: window ? window.at.toISOString() : undefined,
          from: before ?? "unknown",
          to: decision.phase,
          reason: decision.reason,
          posted,
          suppressed,
        },
        `FiveM debug: ${before ?? "unknown"} -> ${decision.phase} (${decision.reason})`,
      );
    return { guildId: settings.guildId, phase: decision.phase, status };
  }

  /** Posts restart warnings that are due now. Returns the keys it sent. */
  public async restartWarnings(config: FivemGuildConfig): Promise<readonly string[]> {
    const { settings, state } = config;
    if (!this.gateway || !settings.alertChannelId || settings.restartTimes.length === 0) return [];
    const now = this.now().getTime();
    const sent: string[] = [];
    for (const minutes of settings.restartWarningMinutes) {
      const local = localTime(new Date(now + minutes * 60_000), settings.timeZone);
      if (!settings.restartTimes.includes(local.time)) continue;
      const key = `${local.date} ${local.time}|${minutes}`;
      if (state.sentRestartWarnings.includes(key) || sent.includes(key)) continue;
      const content = minutes === 0 ? "🔄 **Restarting now**" : `⚠️ **Restarting in ${minutes} minute${minutes === 1 ? "" : "s"}**`;
      await this.gateway.postAlert(
        settings.alertChannelId,
        content,
        {
          title: "Scheduled restart",
          description: minutes === 0 ? "The server is restarting. Reconnect in a few minutes." : `At ${local.time} (${settings.timeZone}). Finish what you are doing and find a safe spot.`,
          color: YELLOW,
        },
        undefined,
      );
      sent.push(key);
      if (settings.debug) this.logger?.info({ operation: "fivem-restart-warning", guildId: settings.guildId, key }, `FiveM debug: restart warning posted (${key}).`);
    }
    if (sent.length) await this.repository.saveState(settings.guildId, { sentRestartWarnings: [...sent, ...state.sentRestartWarnings].slice(0, 20) });
    return sent;
  }

  private warn(settings: FivemSettings, error: unknown, message: string): undefined {
    this.logger?.warn(
      { err: error, stack: error instanceof Error ? error.stack : undefined, operation: "fivem", guildId: settings.guildId, ...(settings.debug ? { debug: true } : {}) },
      message,
    );
    return undefined;
  }
}

/** Text and embed for a phase-change post in the alert channel. */
export function alertMessage(post: FivemPost, status: FivemServerStatus): { readonly content: string; readonly embed: FivemEmbed } {
  const title = status.hostname || "FiveM server";
  if (post.kind === "restarting")
    return { content: "🔄 **Restarting now**", embed: { title, description: "The server is restarting. Reconnect in a few minutes.", color: YELLOW } };
  if (post.kind === "down")
    return { content: "🔴 **Server is down**", embed: { title, description: `${post.detail}\n${status.error ?? "The server is not answering."}`, color: RED, timestamp: status.checkedAt } };
  return {
    content: "🟢 **Back online**",
    embed: { title, description: `${post.detail}${status.online ? ` ${status.playerCount}/${status.maxPlayers} players.` : ""}`, color: GREEN, timestamp: status.checkedAt },
  };
}
