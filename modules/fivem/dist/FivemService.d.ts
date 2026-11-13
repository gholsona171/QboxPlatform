import type { FivemEmbed, FivemGateway, FivemGuildConfig, FivemImage, FivemLogger, FivemMonitorState, FivemPhase, FivemQueryClient, FivemRepository, FivemServerStatus, FivemSettings, FivemSettingsInput, FivemTickResult, PlayerHistory } from "./types.js";
/** How often the server is checked, whatever the status message interval (short txAdmin restarts take well under a minute). */
export declare const CHECK_INTERVAL_MS = 15000;
/** Kept for older readers: failed checks are now judged by time (`downAfterMinutes`). */
export declare const FAILURES_BEFORE_DOWN = 2;
/** Players listed in `/fivem players`, the portal, and (when turned on) the status message. */
export declare const PLAYER_LIST_LIMIT = 40;
/** A scheduled restart window opens with the first warning (at most this many minutes, at least 2) ... */
export declare const RESTART_WINDOW_BEFORE_MAX_MINUTES = 15;
/** ... and closes this many minutes after the scheduled time. */
export declare const RESTART_WINDOW_AFTER_MINUTES = 15;
/** A server that answers only partly counts as up after this long. */
export declare const STARTING_MAX_MS: number;
/** The player graph in the status message is redrawn this often. */
export declare const GRAPH_REFRESH_MS: number;
export declare const GRAPH_FILE_NAME = "players.png";
export declare function defaultFivemSettings(guildId: string): FivemSettings;
export declare function emptyMonitorState(): FivemMonitorState;
/** "2h 5m", "3d 4h". */
export declare function formatUptime(ms: number): string;
/** Date and `HH:MM` for an instant in a time zone. */
export declare function localTime(at: Date, timeZone: string): {
    readonly date: string;
    readonly time: string;
};
/** The instant a local `YYYY-MM-DD` + `HH:MM` happens in a time zone (DST-aware). */
export declare function zonedInstant(date: string, time: string, timeZone: string): Date;
/** Scheduled restart instants from yesterday to tomorrow (local), sorted. */
export declare function scheduledRestarts(now: Date, settings: Pick<FivemSettings, "restartTimes" | "timeZone">): readonly {
    readonly at: Date;
    readonly date: string;
    readonly time: string;
}[];
/** The next scheduled restart after `now`, if there is a schedule. */
export declare function nextRestart(now: Date, settings: Pick<FivemSettings, "restartTimes" | "timeZone">): Date | undefined;
/**
 * The scheduled restart whose window contains `now`: from the first warning
 * (2 to 15 minutes before) until 15 minutes after the scheduled time.
 */
export declare function restartWindow(now: Date, settings: Pick<FivemSettings, "restartTimes" | "timeZone" | "restartWarningMinutes">): {
    readonly at: Date;
    readonly key: string;
} | undefined;
/** Player names for Discord, escaped, cut to the list limit and to `maxLength` with "...and N more". */
export declare function playerLines(status: FivemServerStatus, limit?: number, maxLength?: number): string;
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
    readonly graph?: {
        readonly peak: number;
    } | undefined;
    /** List player names (the setting for the channel message; `/fivem players` always does). */
    readonly showPlayerNames?: boolean | undefined;
}
/** The F8 console line for joining: the cfx.re link when set, else the address. */
export declare function connectCommand(settings: Pick<FivemSettings, "connectUrl" | "serverAddress">): string | undefined;
/** Embed for the status message and `/fivem status`. */
export declare function statusEmbed(settings: FivemSettings, status: FivemServerStatus, view?: FivemStatusView): FivemEmbed;
/** The bot's presence line for one server, for example "12/64 on Cloud Nine RP". */
export declare function presenceText(result: Pick<FivemTickResult, "phase" | "status">): string;
export type FivemPost = {
    readonly kind: "down" | "back" | "restarting";
    readonly ping: boolean;
    readonly detail: string;
};
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
export declare function previousPhase(state: FivemMonitorState): FivemPhase | undefined;
/**
 * The state machine. Pure: given what the bot remembered, the check's answer,
 * and whether a scheduled restart window is open, decides the phase and the
 * posts. A scheduled restart never produces the "down" post or a ping.
 */
export declare function decidePhase(input: {
    readonly state: FivemMonitorState;
    readonly status: FivemServerStatus;
    readonly now: Date;
    readonly window?: {
        readonly at: Date;
        readonly key: string;
    } | undefined;
    readonly downAfterMinutes: number;
}): FivemDecision;
/**
 * FiveM server monitoring shared by the bot and the API: live status,
 * the auto-updating status message with a player graph, restart / down /
 * back-online posts, and player-count history. Permission checks happen
 * before the service is called.
 */
export declare class FivemService {
    private readonly repository;
    private readonly query;
    private readonly gateway?;
    private readonly now;
    private readonly logger?;
    private lastPrune;
    private readonly graphs;
    constructor(repository: FivemRepository, query: FivemQueryClient, gateway?: FivemGateway | undefined, now?: () => Date, logger?: FivemLogger | undefined);
    config(guildId: string): Promise<FivemGuildConfig>;
    settings(guildId: string): Promise<FivemSettings>;
    saveSettings(input: FivemSettingsInput): Promise<FivemSettings>;
    /** Queries the configured server now. */
    status(guildId: string): Promise<FivemServerStatus>;
    /** Queries an address without saving it (the portal's test button). */
    test(address: string): Promise<FivemServerStatus>;
    /** The live status as `/fivem status` shows it: phase, next restart, uptime, and the player graph. */
    liveStatus(guildId: string): Promise<{
        readonly status: FivemServerStatus;
        readonly embed: FivemEmbed;
        readonly image?: FivemImage | undefined;
    }>;
    /** Highest player count per time bucket for a chart, with uptime. */
    history(guildId: string, range: "24h" | "7d"): Promise<PlayerHistory>;
    /** The 24-hour player graph as a PNG, redrawn at most every 10 minutes (or when `force`). */
    graph(guildId: string, force?: boolean): Promise<{
        readonly image: FivemImage;
        readonly peak: number;
        readonly fresh: boolean;
    }>;
    /**
     * Runs due work for every monitored server: checks every 15 seconds, posts
     * restart warnings, and edits the status message. Called by the bot's timer.
     * Returns the servers checked this time (for the bot's presence).
     */
    tick(): Promise<readonly FivemTickResult[]>;
    /** Checks one server: decides the phase, records a snapshot, posts alerts, and updates the status message. */
    refresh(config: FivemGuildConfig): Promise<FivemTickResult | undefined>;
    /** Posts restart warnings that are due now. Returns the keys it sent. */
    restartWarnings(config: FivemGuildConfig): Promise<readonly string[]>;
    private warn;
}
/** Text and embed for a phase-change post in the alert channel. */
export declare function alertMessage(post: FivemPost, status: FivemServerStatus): {
    readonly content: string;
    readonly embed: FivemEmbed;
};
//# sourceMappingURL=FivemService.d.ts.map