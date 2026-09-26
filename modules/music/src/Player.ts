import type { MusicLoopMode, MusicPlayerState, MusicQueueEntry, MusicSession } from "./types.js";
import { MusicError } from "./validation.js";

/** "Previous" restarts the current song when it has played longer than this. */
export const PREVIOUS_RESTART_SECONDS = 5;
/** Played songs kept for "previous". */
export const HISTORY_LIMIT = 50;

/**
 * The queue and playback rules for one server, without any I/O.
 *
 * `queue` holds played, current and upcoming entries; `index` points at the
 * current one. When the queue runs out, `index` equals `queue.length` and
 * there is no current entry. Positions shown to people are 1-based.
 */
export class Player {
  public queue: MusicQueueEntry[] = [];
  public index = 0;
  public state: MusicPlayerState = "idle";
  public positionSeconds = 0;
  public loop: MusicLoopMode = "off";
  public shuffle = false;
  public volume: number;

  public constructor(
    volume: number,
    private readonly random: () => number = Math.random,
  ) {
    this.volume = clampVolume(volume);
  }

  /** A player with a saved session's queue and modes. Playback state starts idle. */
  public static restore(session: MusicSession, random?: () => number): Player {
    const player = new Player(session.volume, random);
    player.queue = [...session.queue];
    player.index = Math.min(Math.max(0, session.index), player.queue.length);
    player.positionSeconds = Math.max(0, session.positionSeconds);
    player.loop = session.loop;
    player.shuffle = session.shuffle;
    return player;
  }

  public get current(): MusicQueueEntry | undefined {
    return this.queue[this.index];
  }

  public get upcoming(): readonly MusicQueueEntry[] {
    return this.queue.slice(this.index + 1);
  }

  public get history(): readonly MusicQueueEntry[] {
    return this.queue.slice(0, Math.min(this.index, this.queue.length));
  }

  /** True when the current entry is a live stream (no seeking). */
  public get live(): boolean {
    const current = this.current;
    return current !== undefined && !current.seekable;
  }

  /**
   * Adds entries. With `now`, they go right after the current song and the
   * first one becomes current. Returns whether playback should (re)start and
   * how many entries fit under `maxQueue` waiting songs.
   */
  public add(entries: readonly MusicQueueEntry[], maxQueue: number, options: { readonly now?: boolean | undefined } = {}): { readonly start: boolean; readonly added: number } {
    if (entries.length === 0) throw new MusicError("NOT_FOUND", "Nothing to add.");
    const room = maxQueue - this.upcoming.length;
    if (room <= 0) throw new MusicError("LIMIT_REACHED", `The queue is full (${maxQueue} songs). Remove some first.`);
    const fitting = entries.slice(0, room);
    const hadCurrent = this.current !== undefined;
    if (options.now || !hadCurrent) {
      const at = hadCurrent ? this.index + 1 : this.index;
      this.queue.splice(at, 0, ...fitting);
      this.index = at;
      this.positionSeconds = 0;
      this.trimHistory();
      return { start: true, added: fitting.length };
    }
    for (const entry of fitting) {
      if (this.shuffle && this.upcoming.length > 0) {
        const offset = Math.floor(this.random() * (this.upcoming.length + 1));
        this.queue.splice(this.index + 1 + offset, 0, entry);
      } else this.queue.push(entry);
    }
    return { start: false, added: fitting.length };
  }

  /**
   * Moves to the next entry. `auto` is true when the song ended on its own,
   * which repeats it in track loop mode. Returns the new current entry, or
   * undefined when the queue ran out.
   */
  public next(auto: boolean): MusicQueueEntry | undefined {
    this.positionSeconds = 0;
    if (auto && this.loop === "track" && this.current) return this.current;
    if (this.index + 1 < this.queue.length) {
      this.index += 1;
      this.trimHistory();
      return this.current;
    }
    if (this.loop === "queue" && this.queue.length > 0) {
      this.index = 0;
      if (this.shuffle) this.shuffleFrom(0);
      return this.current;
    }
    this.index = this.queue.length;
    return undefined;
  }

  /** Restarts the current song after 5 seconds of play, else goes back one. */
  public previous(): MusicQueueEntry {
    if (this.queue.length === 0) throw new MusicError("INVALID_STATE", "Nothing has played yet.");
    if (this.current && (this.positionSeconds > PREVIOUS_RESTART_SECONDS || this.index === 0)) {
      this.positionSeconds = 0;
      return this.current;
    }
    this.index = Math.max(0, this.index - 1);
    this.positionSeconds = 0;
    return this.current as MusicQueueEntry;
  }

  /** Checks and clamps a seek target in seconds. Live streams refuse. */
  public seekTarget(seconds: number): number {
    const current = this.requireCurrent();
    if (!current.seekable) throw new MusicError("INVALID_STATE", "This is a live stream, so it cannot be seeked or rewound.");
    const end = current.durationSeconds === null ? Number.POSITIVE_INFINITY : Math.max(0, current.durationSeconds - 1);
    const target = Math.min(Math.max(0, Math.floor(seconds)), end);
    this.positionSeconds = target;
    return target;
  }

  public setVolume(volume: number): number {
    this.volume = clampVolume(volume);
    return this.volume;
  }

  /** Next loop mode, or the given one. */
  public setLoop(mode?: MusicLoopMode | undefined): MusicLoopMode {
    this.loop = mode ?? (this.loop === "off" ? "queue" : this.loop === "queue" ? "track" : "off");
    return this.loop;
  }

  /** Turns shuffle on (shuffling what is waiting, keeping the current song) or off. */
  public toggleShuffle(): boolean {
    this.shuffle = !this.shuffle;
    if (this.shuffle) this.shuffleFrom(this.index + 1);
    return this.shuffle;
  }

  /** Removes the entry at a 1-based position. The current song cannot be removed. */
  public remove(position: number): MusicQueueEntry {
    const at = this.requirePosition(position);
    if (at === this.index) throw new MusicError("INVALID_STATE", "That song is playing now. Use skip instead.");
    const [removed] = this.queue.splice(at, 1);
    if (at < this.index) this.index -= 1;
    return removed as MusicQueueEntry;
  }

  /** Moves an entry between 1-based positions; the current song stays current. */
  public move(from: number, to: number): MusicQueueEntry {
    const source = this.requirePosition(from);
    const target = this.requirePosition(to);
    const current = this.current;
    const [entry] = this.queue.splice(source, 1);
    this.queue.splice(target, 0, entry as MusicQueueEntry);
    this.index = current ? this.queue.indexOf(current) : this.queue.length;
    return entry as MusicQueueEntry;
  }

  /** Makes the entry at a 1-based position current. */
  public jump(position: number): MusicQueueEntry {
    this.index = this.requirePosition(position);
    this.positionSeconds = 0;
    return this.current as MusicQueueEntry;
  }

  /** Removes everything except the current song. */
  public clear(): number {
    const current = this.current;
    const removed = this.queue.length - (current ? 1 : 0);
    this.queue = current ? [current] : [];
    this.index = 0;
    return removed;
  }

  /** Empties the queue. */
  public stop(): void {
    this.queue = [];
    this.index = 0;
    this.positionSeconds = 0;
    this.state = "idle";
  }

  private requireCurrent(): MusicQueueEntry {
    const current = this.current;
    if (!current) throw new MusicError("INVALID_STATE", "Nothing is playing.");
    return current;
  }

  private requirePosition(position: number): number {
    if (!Number.isInteger(position) || position < 1 || position > this.queue.length)
      throw new MusicError("INVALID_INPUT", this.queue.length ? `Pick a position from 1 to ${this.queue.length}.` : "The queue is empty.");
    return position - 1;
  }

  private shuffleFrom(start: number): void {
    for (let at = this.queue.length - 1; at > start; at -= 1) {
      const swap = start + Math.floor(this.random() * (at - start + 1));
      [this.queue[at], this.queue[swap]] = [this.queue[swap] as MusicQueueEntry, this.queue[at] as MusicQueueEntry];
    }
  }

  private trimHistory(): void {
    const excess = this.index - HISTORY_LIMIT;
    if (excess <= 0) return;
    this.queue.splice(0, excess);
    this.index -= excess;
  }
}

export function clampVolume(volume: number): number {
  if (!Number.isFinite(volume)) throw new MusicError("INVALID_INPUT", "Volume must be a number from 0 to 200.");
  return Math.min(200, Math.max(0, Math.round(volume)));
}
