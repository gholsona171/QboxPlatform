import { type MessageTemplates, type OutgoingMessage } from "@qbox/shared/messages";
import type { MusicService } from "./MusicService.js";
import type { AudioEngineFactory, MusicActor, MusicCommand, MusicCommandResult, MusicGateway, MusicPresence, MusicRepository, MusicSettings, MusicStateSnapshot } from "./types.js";
/** Seconds `/music rewind` and `/music forward` move by default. */
export declare const DEFAULT_SKIP_SECONDS = 10;
/** Delay before a change is saved, so bursts of changes save once. */
export declare const SAVE_DELAY_MS = 2000;
/** The panel is edited at most this often while playing. */
export declare const PANEL_EDIT_MS = 15000;
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
/**
 * Whether `actor` may control playback: music must be on; managers always
 * can; others need music.dj, a DJ role, or an empty DJ role list, and must be
 * in the bot's voice channel when it is in one.
 */
export declare function checkControl(settings: MusicSettings, actor: MusicActor, botChannelId: string | undefined, actorChannelId: string | undefined): void;
/**
 * Playback for every server in the bot process: one `Player` and one audio
 * engine per server, persistence across restarts, now-playing messages, and
 * auto-leave / 24-7 rules. Commands for one server run one at a time.
 */
export declare class MusicController {
    private readonly service;
    private readonly repository;
    private readonly options;
    private readonly guilds;
    /** 24/7 servers whose home channel could not be joined, and when to try again. */
    private readonly stayRetryAt;
    private readonly templates;
    private readonly now;
    private readonly log;
    private readonly read;
    private readonly saveDelayMs;
    private stopped;
    constructor(service: MusicService, repository: MusicRepository, options: MusicControllerOptions);
    state(guildId: string): Promise<MusicStateSnapshot>;
    /** Runs one command for `actor` after the permission check. */
    command(guildId: string, command: MusicCommand, actor: MusicActor): Promise<MusicCommandResult>;
    /** The now-playing panel as it should look now, for button presses that update it in place. */
    panelView(guildId: string): Promise<{
        readonly message: OutgoingMessage;
        readonly components: readonly unknown[];
    } | undefined>;
    /** Resumes sessions that were playing before a restart, and 24/7 servers. */
    resume(): Promise<void>;
    /**
     * Runs every 15 seconds: saves positions, edits panels, leaves when alone
     * or idle, and brings 24/7 servers back to their home channel.
     */
    tick(): Promise<void>;
    /** Saves every session as it is (so playback resumes after the restart) and leaves voice. */
    shutdown(): Promise<void>;
    private apply;
    private enqueue;
    private pause;
    private resumePlayback;
    private seekTo;
    private requireCurrent;
    private ensureConnected;
    private join;
    /** Plays the current entry from `seekSeconds` and announces it when it is a new song. */
    private start;
    private advance;
    /** The queue ran out: play the idle radio station when one is set, else go idle. */
    private finish;
    private onFinished;
    private onError;
    private disconnect;
    private keepStayConnected;
    private announce;
    private editPanel;
    /** Turns the panel into a "nothing playing" message when the queue ends. */
    private showIdle;
    private panelContent;
    private cover;
    private runtime;
    private position;
    private snapshot;
    private scheduleSave;
    private save;
    private sessionOf;
    private serialize;
}
//# sourceMappingURL=MusicController.d.ts.map