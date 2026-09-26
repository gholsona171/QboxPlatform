import { readFile } from "node:fs/promises";

import { passthroughTemplates, type MessageTemplates, type OutgoingMessage } from "@qbox/shared/messages";

import { COVER_ATTACHMENT, MUSIC_COLOR, nowPlayingMessage, nowPlayingValues, panelComponents } from "./announcements.js";
import type { MusicService } from "./MusicService.js";
import { Player } from "./Player.js";
import type {
  AudioEngine,
  AudioEngineFactory,
  MusicActor,
  MusicAttachment,
  MusicCommand,
  MusicCommandResult,
  MusicGateway,
  MusicPresence,
  MusicQueueEntry,
  MusicRepository,
  MusicSessionSave,
  MusicSettings,
  MusicStateSnapshot,
} from "./types.js";
import { MusicError, formatTime } from "./validation.js";

/** Seconds `/music rewind` and `/music forward` move by default. */
export const DEFAULT_SKIP_SECONDS = 10;
/** Delay before a change is saved, so bursts of changes save once. */
export const SAVE_DELAY_MS = 2_000;
/** The panel is edited at most this often while playing. */
export const PANEL_EDIT_MS = 15_000;
/** Failed songs in a row before playback stops. */
const MAX_ERROR_STREAK = 3;
/** Wait before trying the 24/7 home channel again after a failed join. */
const STAY_RETRY_MS = 5 * 60_000;

export interface MusicControllerLog {
  warn(message: string, details: Readonly<Record<string, unknown>>): void;
}

export interface MusicControllerOptions {
  readonly engines: AudioEngineFactory;
  readonly gateway?: MusicGateway | undefined;
  readonly presence?: MusicPresence | undefined;
  readonly templates?: MessageTemplates | undefined;
  /** Whether ffmpeg is installed; reported in the state. */
  readonly ffmpeg: boolean;
  readonly now?: (() => number) | undefined;
  readonly random?: (() => number) | undefined;
  readonly log?: MusicControllerLog | undefined;
  readonly readFile?: ((path: string) => Promise<Buffer>) | undefined;
  readonly saveDelayMs?: number | undefined;
}

interface GuildMusic {
  readonly guildId: string;
  readonly player: Player;
  engine?: AudioEngine | undefined;
  connected: boolean;
  channelId?: string | undefined;
  textChannelId?: string | undefined;
  panel?: { readonly channelId: string; readonly messageId: string; readonly thumbnail?: string | undefined } | undefined;
  lastPanelEdit: number;
  announcedEntryId?: string | undefined;
  /** Position at `anchorAt` while playing. */
  anchorSeconds: number;
  anchorAt: number;
  /** When the current song started playing. */
  startedAt: number;
  idleSince?: number | undefined;
  aloneSince?: number | undefined;
  lastError?: string | undefined;
  errorStreak: number;
  saveTimer?: ReturnType<typeof setTimeout> | undefined;
  lock: Promise<unknown>;
}

/**
 * Whether `actor` may control playback: music must be on; managers always
 * can; others need music.dj, a DJ role, or an empty DJ role list, and must be
 * in the bot's voice channel when it is in one.
 */
export function checkControl(settings: MusicSettings, actor: MusicActor, botChannelId: string | undefined, actorChannelId: string | undefined): void {
  if (!settings.enabled) throw new MusicError("INVALID_STATE", "Music is turned off. A manager can turn it on in the portal (Music).");
  if (actor.manager) return;
  const dj = actor.dj || settings.djRoleIds.length === 0 || actor.roleIds.some((roleId) => settings.djRoleIds.includes(roleId));
  if (!dj) throw new MusicError("FORBIDDEN", "Only DJs can control the music here.");
  if (botChannelId && actorChannelId !== botChannelId) throw new MusicError("FORBIDDEN", `Join <#${botChannelId}> to control the music.`);
}

/**
 * Playback for every server in the bot process: one `Player` and one audio
 * engine per server, persistence across restarts, now-playing messages, and
 * auto-leave / 24-7 rules. Commands for one server run one at a time.
 */
export class MusicController {
  private readonly guilds = new Map<string, GuildMusic>();
  /** 24/7 servers whose home channel could not be joined, and when to try again. */
  private readonly stayRetryAt = new Map<string, number>();
  private readonly templates: MessageTemplates;
  private readonly now: () => number;
  private readonly log: MusicControllerLog;
  private readonly read: (path: string) => Promise<Buffer>;
  private readonly saveDelayMs: number;
  private stopped = false;

  public constructor(
    private readonly service: MusicService,
    private readonly repository: MusicRepository,
    private readonly options: MusicControllerOptions,
  ) {
    this.templates = options.templates ?? passthroughTemplates;
    this.now = options.now ?? Date.now;
    this.log = options.log ?? { warn: () => undefined };
    this.read = options.readFile ?? ((path) => readFile(path));
    this.saveDelayMs = options.saveDelayMs ?? SAVE_DELAY_MS;
  }

  public async state(guildId: string): Promise<MusicStateSnapshot> {
    const settings = await this.service.settings(guildId);
    return this.snapshot(await this.runtime(guildId, settings), settings);
  }

  /** Runs one command for `actor` after the permission check. */
  public async command(guildId: string, command: MusicCommand, actor: MusicActor): Promise<MusicCommandResult> {
    const settings = await this.service.settings(guildId);
    const guild = await this.runtime(guildId, settings);
    return this.serialize(guild, async () => {
      const actorChannel = this.options.presence?.memberChannel(guildId, actor.userId);
      checkControl(settings, actor, guild.connected ? guild.channelId : undefined, actorChannel);
      if (actor.textChannelId) guild.textChannelId = actor.textChannelId;
      const message = await this.apply(guild, settings, command, actor, actorChannel);
      this.scheduleSave(guild);
      return { message, state: this.snapshot(guild, settings) };
    });
  }

  /** The now-playing panel as it should look now, for button presses that update it in place. */
  public async panelView(guildId: string): Promise<{ readonly message: OutgoingMessage; readonly components: readonly unknown[] } | undefined> {
    const guild = this.guilds.get(guildId);
    if (!guild) return undefined;
    const settings = await this.service.settings(guildId);
    return this.panelContent(guild, settings, guild.panel?.thumbnail);
  }

  /** Resumes sessions that were playing before a restart, and 24/7 servers. */
  public async resume(): Promise<void> {
    for (const session of await this.repository.listActiveSessions()) {
      const settings = await this.service.settings(session.guildId).catch(() => undefined);
      if (!settings?.enabled || !session.channelId) continue;
      const guild = await this.runtime(session.guildId, settings);
      await this.serialize(guild, async () => {
        const current = guild.player.current;
        if (!current) return;
        await this.join(guild, session.channelId as string);
        await this.start(guild, settings, current.seekable ? session.positionSeconds : 0);
      }).catch((error: unknown) => this.log.warn("Could not resume music.", { err: error, guildId: session.guildId }));
    }
    await this.keepStayConnected();
  }

  /**
   * Runs every 15 seconds: saves positions, edits panels, leaves when alone
   * or idle, and brings 24/7 servers back to their home channel.
   */
  public async tick(): Promise<void> {
    const now = this.now();
    for (const guild of this.guilds.values()) {
      const settings = await this.service.settings(guild.guildId).catch(() => undefined);
      if (!settings) continue;
      await this.serialize(guild, async () => {
        guild.player.positionSeconds = this.position(guild);
        if (guild.player.state === "playing") {
          await this.save(guild);
          if (settings.nowPlayingPanel && guild.panel && now - guild.lastPanelEdit >= PANEL_EDIT_MS) await this.editPanel(guild, settings);
        }
        if (!guild.connected || settings.stayConnected247 || settings.autoLeaveMinutes === 0) {
          guild.aloneSince = undefined;
          return;
        }
        const alone = this.options.presence && guild.channelId ? this.options.presence.listeners(guild.guildId, guild.channelId) === 0 : false;
        guild.aloneSince = alone ? guild.aloneSince ?? now : undefined;
        const limit = settings.autoLeaveMinutes * 60_000;
        const idleTooLong = guild.player.state !== "playing" && guild.player.state !== "buffering" && guild.idleSince !== undefined && now - guild.idleSince >= limit;
        if ((guild.aloneSince !== undefined && now - guild.aloneSince >= limit) || idleTooLong) this.disconnect(guild);
      }).catch((error: unknown) => this.log.warn("Music check failed.", { err: error, guildId: guild.guildId }));
    }
    await this.keepStayConnected();
  }

  /** Saves every session as it is (so playback resumes after the restart) and leaves voice. */
  public async shutdown(): Promise<void> {
    this.stopped = true;
    const sessions = [...this.guilds.values()].map((guild) => {
      if (guild.saveTimer) clearTimeout(guild.saveTimer);
      guild.saveTimer = undefined;
      const session = this.sessionOf(guild);
      guild.engine?.leave();
      return session;
    });
    await Promise.all(sessions.map((session) => this.repository.saveSession(session).catch((error: unknown) => this.log.warn("Could not save the music session.", { err: error, guildId: session.guildId }))));
  }

  /* ---------- Commands ---------- */

  private async apply(guild: GuildMusic, settings: MusicSettings, command: MusicCommand, actor: MusicActor, actorChannel: string | undefined): Promise<string> {
    const player = guild.player;
    switch (command.action) {
      case "play": {
        const entries = await this.service.resolve(guild.guildId, command.query, { requestedBy: actor.userId, title: command.title });
        return this.enqueue(guild, settings, entries, command.now ?? false, command.channelId ?? actorChannel);
      }
      case "radio":
        return this.enqueue(guild, settings, [await this.service.radioEntry(guild.guildId, command.name, actor.userId)], false, command.channelId ?? actorChannel);
      case "playlist": {
        const entries = [...(await this.service.playlistEntries(guild.guildId, command.id, actor.userId))];
        if (command.shuffle) shuffleInPlace(entries, this.options.random ?? Math.random);
        return this.enqueue(guild, settings, entries, command.now ?? false, command.channelId ?? actorChannel);
      }
      case "pause":
        return this.pause(guild);
      case "resume":
        return this.resumePlayback(guild, settings, actorChannel);
      case "toggle":
        return player.state === "playing" ? this.pause(guild) : this.resumePlayback(guild, settings, actorChannel);
      case "stop": {
        player.stop();
        guild.engine?.stop();
        guild.idleSince = this.now();
        await this.showIdle(guild, settings);
        if (settings.stayConnected247) return "Stopped and cleared the queue.";
        this.disconnect(guild);
        return "Stopped, cleared the queue, and left the voice channel.";
      }
      case "skip": {
        const skipped = this.requireCurrent(guild);
        await this.advance(guild, settings, false);
        const next = player.current;
        return next ? `Skipped **${skipped.title}**. Now playing **${next.title}**.` : `Skipped **${skipped.title}**. The queue is empty now.`;
      }
      case "previous": {
        const entry = player.previous();
        await this.ensureConnected(guild, settings, actorChannel);
        await this.start(guild, settings, 0);
        return `Playing **${entry.title}**.`;
      }
      case "restart": {
        const entry = this.requireCurrent(guild);
        await this.ensureConnected(guild, settings, actorChannel);
        await this.start(guild, settings, 0);
        return `Restarted **${entry.title}**.`;
      }
      case "seek":
        return this.seekTo(guild, settings, command.seconds);
      case "rewind":
      case "forward": {
        this.requireCurrent(guild);
        const step = command.seconds ?? DEFAULT_SKIP_SECONDS;
        if (!Number.isInteger(step) || step < 1 || step > 3600) throw new MusicError("INVALID_INPUT", "Pick a number of seconds from 1 to 3600.");
        return this.seekTo(guild, settings, this.position(guild) + (command.action === "rewind" ? -step : step));
      }
      case "volume": {
        const volume = player.setVolume(command.volume);
        guild.engine?.setVolume(volume);
        return `Volume set to ${volume}%.`;
      }
      case "loop": {
        const mode = player.setLoop(command.mode);
        return mode === "off" ? "Loop is off." : mode === "track" ? "Looping this song." : "Looping the whole queue.";
      }
      case "shuffle":
        return player.toggleShuffle() ? "Shuffle is on. The songs waiting were shuffled." : "Shuffle is off.";
      case "remove":
        return `Removed **${player.remove(command.position).title}** from the queue.`;
      case "move": {
        const entry = player.move(command.from, command.to);
        return `Moved **${entry.title}** to position ${command.to}.`;
      }
      case "jump": {
        const entry = player.jump(command.position);
        await this.ensureConnected(guild, settings, actorChannel);
        await this.start(guild, settings, 0);
        return `Playing **${entry.title}**.`;
      }
      case "clear": {
        const removed = player.clear();
        return removed === 0 ? "The queue was already empty." : `Cleared ${removed} song${removed === 1 ? "" : "s"} from the queue.`;
      }
      case "join": {
        const channelId = command.channelId ?? actorChannel ?? settings.homeChannelId;
        if (!channelId) throw new MusicError("INVALID_STATE", "Join a voice channel first, or pick one.");
        await this.join(guild, channelId);
        if (player.current && player.state !== "playing") await this.start(guild, settings, player.current.seekable ? player.positionSeconds : 0);
        return `Joined <#${channelId}>.`;
      }
      case "leave": {
        if (settings.stayConnected247) throw new MusicError("INVALID_STATE", "24/7 mode is on, so I stay. A manager can turn it off in the portal.");
        if (!guild.connected) return "I am not in a voice channel.";
        guild.player.positionSeconds = this.position(guild);
        this.disconnect(guild);
        return "Left the voice channel. The queue is kept.";
      }
    }
  }

  private async enqueue(guild: GuildMusic, settings: MusicSettings, entries: readonly MusicQueueEntry[], now: boolean, channelId: string | undefined): Promise<string> {
    const target = channelId ?? settings.homeChannelId;
    if (!guild.connected && target) await this.join(guild, target);
    const { start, added } = guild.player.add(entries, settings.maxQueue, { now });
    const first = entries[0] as MusicQueueEntry;
    const partial = added < entries.length ? ` The queue is full, so ${entries.length - added} did not fit.` : "";
    const what = entries.length > 1 ? `${added} song${added === 1 ? "" : "s"}` : `**${first.title}**`;
    if (start && !guild.connected) return `Queued ${what}. Join a voice channel and use Join (or /music join) to start.${partial}`;
    if (start) await this.start(guild, settings, 0);
    if (entries.length > 1) return `${start ? "Playing" : "Added"} ${what}${start ? `, starting with **${first.title}**` : " to the queue"}.${partial}`;
    if (start) return `Playing ${what}.`;
    return `Added ${what} to the queue (position ${guild.player.queue.indexOf(first) + 1}).`;
  }

  private pause(guild: GuildMusic): string {
    const entry = this.requireCurrent(guild);
    if (guild.player.state !== "playing") return "Nothing is playing right now.";
    guild.player.positionSeconds = this.position(guild);
    guild.engine?.pause();
    guild.player.state = "paused";
    guild.idleSince = this.now();
    return `Paused **${entry.title}**.`;
  }

  private async resumePlayback(guild: GuildMusic, settings: MusicSettings, actorChannel: string | undefined): Promise<string> {
    const entry = this.requireCurrent(guild);
    if (guild.player.state === "paused" && guild.connected) {
      guild.engine?.resume();
      guild.player.state = "playing";
      guild.anchorSeconds = guild.player.positionSeconds;
      guild.anchorAt = this.now();
      guild.idleSince = undefined;
      return `Resumed **${entry.title}**.`;
    }
    if (guild.player.state === "playing") return "Already playing.";
    await this.ensureConnected(guild, settings, actorChannel);
    await this.start(guild, settings, entry.seekable ? guild.player.positionSeconds : 0);
    return `Playing **${entry.title}**.`;
  }

  private async seekTo(guild: GuildMusic, settings: MusicSettings, seconds: number): Promise<string> {
    const target = guild.player.seekTarget(seconds);
    if (!guild.connected) return `Moved to ${formatTime(target)}. It plays from there when I join.`;
    await this.start(guild, settings, target);
    return `Moved to ${formatTime(target)}.`;
  }

  private requireCurrent(guild: GuildMusic): MusicQueueEntry {
    const current = guild.player.current;
    if (!current) throw new MusicError("INVALID_STATE", "Nothing is playing.");
    return current;
  }

  /* ---------- Playback ---------- */

  private async ensureConnected(guild: GuildMusic, settings: MusicSettings, channelId: string | undefined): Promise<void> {
    if (guild.connected) return;
    const target = channelId ?? settings.homeChannelId;
    if (!target) throw new MusicError("INVALID_STATE", "Join a voice channel first (or pick one in the portal), then try again.");
    await this.join(guild, target);
  }

  private async join(guild: GuildMusic, channelId: string): Promise<void> {
    guild.engine ??= this.options.engines(guild.guildId, {
      finished: () => void this.serialize(guild, () => this.onFinished(guild)).catch((error: unknown) => this.log.warn("Could not play the next song.", { err: error, guildId: guild.guildId })),
      error: (message) => void this.serialize(guild, () => this.onError(guild, message)).catch((error: unknown) => this.log.warn("Could not recover from a playback error.", { err: error, guildId: guild.guildId })),
      position: (seconds) => {
        guild.anchorSeconds = seconds;
        guild.anchorAt = this.now();
      },
      disconnected: () => {
        guild.player.positionSeconds = this.position(guild);
        guild.connected = false;
        guild.player.state = "idle";
        this.scheduleSave(guild);
      },
    });
    try {
      await guild.engine.join(channelId);
    } catch (error) {
      if (error instanceof MusicError) throw error;
      throw new MusicError("DEPENDENCY_UNAVAILABLE", "I could not join that voice channel. Check that I can see it, connect, and speak there.");
    }
    guild.connected = true;
    guild.channelId = channelId;
    guild.aloneSince = undefined;
    guild.idleSince = guild.player.state === "playing" ? undefined : this.now();
  }

  /** Plays the current entry from `seekSeconds` and announces it when it is a new song. */
  private async start(guild: GuildMusic, settings: MusicSettings, seekSeconds: number): Promise<void> {
    const entry = guild.player.current;
    if (!entry) return this.finish(guild, settings);
    if (!guild.connected || !guild.engine) throw new MusicError("INVALID_STATE", "I am not in a voice channel. Use /music join first.");
    guild.player.state = "buffering";
    guild.player.positionSeconds = seekSeconds;
    try {
      await guild.engine.play(entry, { seekSeconds, volume: guild.player.volume });
    } catch (error) {
      guild.player.state = "idle";
      guild.idleSince = this.now();
      guild.lastError = error instanceof Error ? error.message : "The song could not be played.";
      if (error instanceof MusicError) throw error;
      throw new MusicError("DEPENDENCY_UNAVAILABLE", `Could not play **${entry.title}**.`);
    }
    guild.player.state = "playing";
    guild.anchorSeconds = seekSeconds;
    guild.anchorAt = this.now();
    guild.startedAt = this.now();
    guild.idleSince = undefined;
    guild.lastError = undefined;
    if (guild.announcedEntryId !== entry.id) {
      guild.announcedEntryId = entry.id;
      await this.announce(guild, settings, entry).catch((error: unknown) => this.log.warn("Could not post the now-playing message.", { err: error, guildId: guild.guildId }));
    }
  }

  private async advance(guild: GuildMusic, settings: MusicSettings, auto: boolean): Promise<void> {
    const next = guild.player.next(auto);
    if (!next) return this.finish(guild, settings);
    if (auto && guild.player.loop === "track") guild.announcedEntryId = next.id;
    await this.start(guild, settings, 0);
  }

  /** The queue ran out: play the idle radio station when one is set, else go idle. */
  private async finish(guild: GuildMusic, settings: MusicSettings): Promise<void> {
    const stationId = settings.idleRadioStationId;
    const last = guild.player.queue[guild.player.queue.length - 1];
    const droppedAtOnce = last?.source === "radio" && last.ref === stationId && this.now() - guild.startedAt < 10_000;
    if (stationId && guild.connected && guild.errorStreak === 0 && !droppedAtOnce) {
      const station = await this.service.station(guild.guildId, stationId).catch(() => undefined);
      if (station) {
        guild.player.add([this.service.stationEntry(station)], Number.MAX_SAFE_INTEGER);
        await this.start(guild, settings, 0);
        return;
      }
    }
    guild.player.state = "idle";
    guild.player.positionSeconds = 0;
    guild.engine?.stop();
    guild.idleSince = this.now();
    await this.showIdle(guild, settings);
  }

  private async onFinished(guild: GuildMusic): Promise<void> {
    guild.errorStreak = 0;
    const settings = await this.service.settings(guild.guildId);
    await this.advance(guild, settings, true);
    this.scheduleSave(guild);
  }

  private async onError(guild: GuildMusic, message: string): Promise<void> {
    guild.lastError = message;
    guild.errorStreak += 1;
    this.log.warn("A song failed to play.", { guildId: guild.guildId, error: message, title: guild.player.current?.title });
    const settings = await this.service.settings(guild.guildId);
    if (guild.errorStreak >= MAX_ERROR_STREAK) {
      guild.player.state = "idle";
      guild.idleSince = this.now();
      guild.engine?.stop();
    } else await this.advance(guild, settings, false).catch(async (error: unknown) => this.onError(guild, error instanceof Error ? error.message : "Playback failed."));
    this.scheduleSave(guild);
  }

  private disconnect(guild: GuildMusic): void {
    guild.engine?.leave();
    guild.connected = false;
    if (guild.player.state !== "idle") guild.player.positionSeconds = this.position(guild);
    guild.player.state = "idle";
    guild.aloneSince = undefined;
    guild.idleSince = undefined;
    this.scheduleSave(guild);
  }

  private async keepStayConnected(): Promise<void> {
    if (this.stopped) return;
    for (const settings of await this.repository.listStayConnected()) {
      if (!settings.enabled || !settings.homeChannelId || (this.stayRetryAt.get(settings.guildId) ?? 0) > this.now()) continue;
      const guild = await this.runtime(settings.guildId, settings);
      if (guild.connected) continue;
      await this.serialize(guild, async () => {
        await this.join(guild, settings.homeChannelId as string);
        this.stayRetryAt.delete(settings.guildId);
        const current = guild.player.current;
        await this.start(guild, settings, current?.seekable ? guild.player.positionSeconds : 0);
        this.scheduleSave(guild);
      }).catch((error: unknown) => {
        if (!guild.connected) this.stayRetryAt.set(settings.guildId, this.now() + STAY_RETRY_MS);
        this.log.warn("Could not return to the 24/7 channel.", { err: error, guildId: settings.guildId });
      });
    }
  }

  /* ---------- Announcements ---------- */

  private async announce(guild: GuildMusic, settings: MusicSettings, entry: MusicQueueEntry): Promise<void> {
    const gateway = this.options.gateway;
    const channelId = settings.announceChannelId ?? guild.textChannelId;
    if (!gateway || !channelId) return;
    const attachment = await this.cover(entry);
    const thumbnail = attachment ? `attachment://${attachment.name}` : entry.artworkUrl;
    const content = await this.panelContent(guild, settings, thumbnail);
    if (!content) return;
    if (!settings.nowPlayingPanel) {
      await gateway.post(channelId, content.message, { components: [], attachment });
      return;
    }
    if (guild.panel?.channelId === channelId) {
      try {
        await gateway.edit(channelId, guild.panel.messageId, content.message, { components: content.components, attachment });
        guild.panel = { ...guild.panel, thumbnail };
        guild.lastPanelEdit = this.now();
        return;
      } catch {
        guild.panel = undefined;
      }
    }
    if (guild.panel) await gateway.deleteMessage(guild.panel.channelId, guild.panel.messageId).catch(() => undefined);
    const messageId = await gateway.post(channelId, content.message, { components: content.components, attachment });
    guild.panel = { channelId, messageId, thumbnail };
    guild.lastPanelEdit = this.now();
  }

  private async editPanel(guild: GuildMusic, settings: MusicSettings): Promise<void> {
    const panel = guild.panel;
    const content = await this.panelContent(guild, settings, panel?.thumbnail);
    if (!panel || !content || !this.options.gateway) return;
    guild.lastPanelEdit = this.now();
    await this.options.gateway.edit(panel.channelId, panel.messageId, content.message, { components: content.components, keepAttachments: true }).catch(() => {
      guild.panel = undefined;
    });
  }

  /** Turns the panel into a "nothing playing" message when the queue ends. */
  private async showIdle(guild: GuildMusic, settings: MusicSettings): Promise<void> {
    const panel = guild.panel;
    guild.announcedEntryId = undefined;
    if (!panel || !settings.nowPlayingPanel || !this.options.gateway) return;
    const message: OutgoingMessage = { embeds: [{ title: "Nothing is playing", description: "Add songs with /music play or in the portal.", color: MUSIC_COLOR }] };
    guild.panel = { channelId: panel.channelId, messageId: panel.messageId };
    await this.options.gateway.edit(panel.channelId, panel.messageId, message, { components: panelComponents(true) }).catch(() => {
      guild.panel = undefined;
    });
  }

  private async panelContent(guild: GuildMusic, settings: MusicSettings, thumbnail: string | undefined): Promise<{ readonly message: OutgoingMessage; readonly components: readonly unknown[] } | undefined> {
    const entry = guild.player.current;
    if (!entry) return undefined;
    const snapshot = this.snapshot(guild, settings);
    const server = await this.options.gateway?.guildName(guild.guildId).catch(() => undefined);
    const message = await this.templates.apply(guild.guildId, "music.now-playing", nowPlayingValues(snapshot, entry, server), nowPlayingMessage(snapshot, entry, thumbnail));
    return { message, components: panelComponents(!entry.seekable) };
  }

  private async cover(entry: MusicQueueEntry): Promise<MusicAttachment | undefined> {
    if (!entry.coverPath) return undefined;
    try {
      return { name: `${COVER_ATTACHMENT}.${entry.coverPath.endsWith(".png") ? "png" : "jpg"}`, data: await this.read(entry.coverPath) };
    } catch {
      return undefined;
    }
  }

  /* ---------- State ---------- */

  private async runtime(guildId: string, settings: MusicSettings): Promise<GuildMusic> {
    const existing = this.guilds.get(guildId);
    if (existing) return existing;
    const session = await this.repository.getSession(guildId);
    const raced = this.guilds.get(guildId);
    if (raced) return raced;
    const player = session ? Player.restore(session, this.options.random) : new Player(settings.defaultVolume, this.options.random);
    const guild: GuildMusic = {
      guildId,
      player,
      connected: false,
      channelId: session?.channelId,
      textChannelId: session?.textChannelId,
      panel: session?.panelChannelId && session.panelMessageId ? { channelId: session.panelChannelId, messageId: session.panelMessageId } : undefined,
      lastPanelEdit: 0,
      anchorSeconds: player.positionSeconds,
      anchorAt: this.now(),
      startedAt: 0,
      errorStreak: 0,
      lock: Promise.resolve(),
    };
    this.guilds.set(guildId, guild);
    return guild;
  }

  private position(guild: GuildMusic): number {
    if (guild.player.state !== "playing") return guild.player.positionSeconds;
    const seconds = guild.anchorSeconds + (this.now() - guild.anchorAt) / 1000;
    const duration = guild.player.current?.durationSeconds;
    return Math.floor(duration ? Math.min(seconds, duration) : seconds);
  }

  private snapshot(guild: GuildMusic, settings: MusicSettings): MusicStateSnapshot {
    const current = guild.player.current;
    return {
      guildId: guild.guildId,
      connected: guild.connected,
      channelId: guild.connected ? guild.channelId : undefined,
      state: guild.player.state,
      current,
      index: guild.player.index,
      queue: [...guild.player.queue],
      positionSeconds: this.position(guild),
      durationSeconds: current?.durationSeconds ?? null,
      live: current !== undefined && !current.seekable,
      loop: guild.player.loop,
      shuffle: guild.player.shuffle,
      volume: guild.player.volume,
      stayConnected: settings.stayConnected247,
      ffmpeg: this.options.ffmpeg,
      lastError: guild.lastError,
    };
  }

  private scheduleSave(guild: GuildMusic): void {
    if (this.stopped) return;
    if (guild.saveTimer) clearTimeout(guild.saveTimer);
    guild.saveTimer = setTimeout(() => {
      guild.saveTimer = undefined;
      void this.save(guild).catch((error: unknown) => this.log.warn("Could not save the music session.", { err: error, guildId: guild.guildId }));
    }, this.saveDelayMs);
    guild.saveTimer.unref?.();
  }

  private async save(guild: GuildMusic): Promise<void> {
    await this.repository.saveSession(this.sessionOf(guild));
  }

  private sessionOf(guild: GuildMusic): MusicSessionSave {
    const player = guild.player;
    return {
      guildId: guild.guildId,
      channelId: guild.channelId,
      textChannelId: guild.textChannelId,
      panelChannelId: guild.panel?.channelId,
      panelMessageId: guild.panel?.messageId,
      queue: [...player.queue],
      index: player.index,
      positionSeconds: this.position(guild),
      state: guild.connected ? player.state : "idle",
      loop: player.loop,
      shuffle: player.shuffle,
      volume: player.volume,
    };
  }

  private serialize<T>(guild: GuildMusic, operation: () => Promise<T>): Promise<T> {
    const result = guild.lock.then(operation, operation);
    guild.lock = result.catch(() => undefined);
    return result;
  }
}

function shuffleInPlace<T>(items: T[], random: () => number): void {
  for (let at = items.length - 1; at > 0; at -= 1) {
    const swap = Math.floor(random() * (at + 1));
    [items[at], items[swap]] = [items[swap] as T, items[at] as T];
  }
}
