import type { FivemEmbed, FivemGateway, FivemGuildConfig, FivemMonitorState, FivemQueryClient, FivemRepository, FivemServerStatus, FivemSettings, FivemSettingsInput, PlayerHistory } from "./types.js";
/** Failed polls in a row before the server counts as down (avoids alerts on one slow answer). */
export declare const FAILURES_BEFORE_DOWN = 2;
/** Players listed in the status message and `/fivem players`. */
export declare const PLAYER_LIST_LIMIT = 40;
export declare function defaultFivemSettings(guildId: string): FivemSettings;
export declare function emptyMonitorState(): FivemMonitorState;
/** "2h 5m", "3d 4h". */
export declare function formatUptime(ms: number): string;
/** Date and `HH:MM` for an instant in a time zone. */
export declare function localTime(at: Date, timeZone: string): {
    readonly date: string;
    readonly time: string;
};
/** Player names for Discord, escaped and cut to the list limit. */
export declare function playerLines(status: FivemServerStatus, limit?: number): string;
/** Embed for the status message and `/fivem status`. */
export declare function statusEmbed(settings: FivemSettings, status: FivemServerStatus, onlineSince?: Date): FivemEmbed;
/**
 * FiveM server monitoring shared by the bot and the API: live status,
 * the auto-updating status message, down/up alerts, restart warnings, and
 * player-count history. Permission checks happen before the service is called.
 */
export declare class FivemService {
    private readonly repository;
    private readonly query;
    private readonly gateway?;
    private readonly now;
    private lastPrune;
    constructor(repository: FivemRepository, query: FivemQueryClient, gateway?: FivemGateway | undefined, now?: () => Date);
    config(guildId: string): Promise<FivemGuildConfig>;
    settings(guildId: string): Promise<FivemSettings>;
    saveSettings(input: FivemSettingsInput): Promise<FivemSettings>;
    /** Queries the configured server now. */
    status(guildId: string): Promise<FivemServerStatus>;
    /** Queries an address without saving it (the portal's test button). */
    test(address: string): Promise<FivemServerStatus>;
    /** Highest player count per time bucket for a chart, with uptime. */
    history(guildId: string, range: "24h" | "7d"): Promise<PlayerHistory>;
    /**
     * Runs due work for every monitored server: polls when the update interval
     * has passed, and posts restart warnings. Called by the bot's timer.
     */
    tick(): Promise<void>;
    /** Polls one server: records a snapshot, sends down/up alerts, and updates the status message. */
    refresh(config: FivemGuildConfig): Promise<FivemServerStatus | undefined>;
    /** Posts restart warnings that are due now. Returns the keys it sent. */
    restartWarnings(config: FivemGuildConfig): Promise<readonly string[]>;
    private alert;
}
//# sourceMappingURL=FivemService.d.ts.map