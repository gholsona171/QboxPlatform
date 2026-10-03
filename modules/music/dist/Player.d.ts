import type { MusicLoopMode, MusicPlayerState, MusicQueueEntry, MusicSession } from "./types.js";
/** "Previous" restarts the current song when it has played longer than this. */
export declare const PREVIOUS_RESTART_SECONDS = 5;
/** Played songs kept for "previous". */
export declare const HISTORY_LIMIT = 50;
/**
 * The queue and playback rules for one server, without any I/O.
 *
 * `queue` holds played, current and upcoming entries; `index` points at the
 * current one. When the queue runs out, `index` equals `queue.length` and
 * there is no current entry. Positions shown to people are 1-based.
 */
export declare class Player {
    private readonly random;
    queue: MusicQueueEntry[];
    index: number;
    state: MusicPlayerState;
    positionSeconds: number;
    loop: MusicLoopMode;
    shuffle: boolean;
    volume: number;
    constructor(volume: number, random?: () => number);
    /** A player with a saved session's queue and modes. Playback state starts idle. */
    static restore(session: MusicSession, random?: () => number): Player;
    get current(): MusicQueueEntry | undefined;
    get upcoming(): readonly MusicQueueEntry[];
    get history(): readonly MusicQueueEntry[];
    /** True when the current entry is a live stream (no seeking). */
    get live(): boolean;
    /**
     * Adds entries. With `now`, they go right after the current song and the
     * first one becomes current. Returns whether playback should (re)start and
     * how many entries fit under `maxQueue` waiting songs.
     */
    add(entries: readonly MusicQueueEntry[], maxQueue: number, options?: {
        readonly now?: boolean | undefined;
    }): {
        readonly start: boolean;
        readonly added: number;
    };
    /**
     * Moves to the next entry. `auto` is true when the song ended on its own,
     * which repeats it in track loop mode. Returns the new current entry, or
     * undefined when the queue ran out.
     */
    next(auto: boolean): MusicQueueEntry | undefined;
    /** Restarts the current song after 5 seconds of play, else goes back one. */
    previous(): MusicQueueEntry;
    /** Checks and clamps a seek target in seconds. Live streams refuse. */
    seekTarget(seconds: number): number;
    setVolume(volume: number): number;
    /** Next loop mode, or the given one. */
    setLoop(mode?: MusicLoopMode | undefined): MusicLoopMode;
    /** Turns shuffle on (shuffling what is waiting, keeping the current song) or off. */
    toggleShuffle(): boolean;
    /** Removes the entry at a 1-based position. The current song cannot be removed. */
    remove(position: number): MusicQueueEntry;
    /** Moves an entry between 1-based positions; the current song stays current. */
    move(from: number, to: number): MusicQueueEntry;
    /** Makes the entry at a 1-based position current. */
    jump(position: number): MusicQueueEntry;
    /** Removes everything except the current song. */
    clear(): number;
    /** Empties the queue. */
    stop(): void;
    private requireCurrent;
    private requirePosition;
    private shuffleFrom;
    private trimHistory;
}
export declare function clampVolume(volume: number): number;
//# sourceMappingURL=Player.d.ts.map