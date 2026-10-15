export interface FivemSettings {
    readonly guildId: string;
    /** `host:port` of the FiveM server. */
    readonly serverAddress?: string | undefined;
    /** `https://cfx.re/join/...` link shown on the Connect button. */
    readonly connectUrl?: string | undefined;
    /** Channel with the auto-updating status message. */
    readonly statusChannelId?: string | undefined;
    readonly updateIntervalSeconds: number;
    /** Channel for down/up alerts and restart warnings. */
    readonly alertChannelId?: string | undefined;
    /** Role pinged when the server goes down or comes back. */
    readonly alertRoleId?: string | undefined;
    /** Daily restart times, `HH:MM` in `timeZone`. */
    readonly restartTimes: readonly string[];
    /** IANA time zone, for example `Europe/Berlin`. */
    readonly timeZone: string;
    /** Minutes before each restart to post a warning (0 = "restarting now"). */
    readonly restartWarningMinutes: readonly number[];
    /** List player names in the channel status message (`/fivem players` and the portal always do). */
    readonly showPlayerNames: boolean;
    /** Minutes the server may be unreachable outside a restart window before it counts as down. */
    readonly downAfterMinutes: number;
    /** Log every check and state decision (live, no restart). */
    readonly debug: boolean;
    readonly revision: number;
}
export interface FivemSettingsInput extends Omit<FivemSettings, "revision" | "showPlayerNames" | "downAfterMinutes" | "debug"> {
    readonly showPlayerNames?: boolean | undefined;
    readonly downAfterMinutes?: number | undefined;
    readonly debug?: boolean | undefined;
    readonly expectedRevision?: number | undefined;
}
/**
 * What the bot thinks the server is doing:
 * `online` (green), `restarting` (yellow: not answering, either inside a
 * scheduled restart window or for less than `downAfterMinutes`), `starting`
 * (yellow: answering but not fully up yet), `offline` (red: a real outage).
 */
export type FivemPhase = "online" | "restarting" | "starting" | "offline";
/** Monitoring state stored next to the settings. Not part of the settings revision. */
export interface FivemMonitorState {
    readonly statusMessageId?: string | undefined;
    /** `phase === "online"`, kept for older readers. */
    readonly lastOnline?: boolean | undefined;
    readonly phase?: FivemPhase | undefined;
    /** When the current phase began. */
    readonly phaseSince?: Date | undefined;
    /** First failed check of the current down spell. */
    readonly downSince?: Date | undefined;
    /** The "Server is down" alert was sent for the current down spell (the "Back online" post pings the role). */
    readonly downAlertSent?: boolean | undefined;
    /** When the server last (re)started: reported by the server when it shares an uptime, otherwise detected by the bot. */
    readonly onlineSince?: Date | undefined;
    /** Last edit of the status message. */
    readonly lastMessageAt?: Date | undefined;
    /** Last stored player-count snapshot. */
    readonly lastSnapshotAt?: Date | undefined;
    /** Failed polls in a row. */
    readonly failureStreak: number;
    readonly lastPolledAt?: Date | undefined;
    /** Recently sent restart warning keys, so each is sent once. */
    readonly sentRestartWarnings: readonly string[];
}
export interface FivemGuildConfig {
    readonly settings: FivemSettings;
    readonly state: FivemMonitorState;
}
export interface FivemPlayer {
    readonly id: number;
    readonly name: string;
    readonly ping: number;
}
export interface FivemServerStatus {
    readonly online: boolean;
    readonly hostname?: string | undefined;
    readonly players: readonly FivemPlayer[];
    readonly playerCount: number;
    readonly maxPlayers: number;
    readonly gametype?: string | undefined;
    readonly mapname?: string | undefined;
    readonly version?: string | undefined;
    /** Answers, but not every endpoint yet (or no slots): still starting up. */
    readonly partial?: boolean | undefined;
    /** When the server says it started (from an `Uptime` server var), if it shares one. */
    readonly startedAt?: Date | undefined;
    /** `banner_detail` from the server vars, when it is an https URL. */
    readonly bannerUrl?: string | undefined;
    /** Why the server could not be reached. */
    readonly error?: string | undefined;
    readonly checkedAt: Date;
}
export interface FivemSnapshot {
    readonly online: boolean;
    readonly players: number;
    readonly maxPlayers: number;
    readonly at: Date;
}
export interface FivemRepository {
    get(guildId: string): Promise<FivemGuildConfig | undefined>;
    saveSettings(input: FivemSettingsInput): Promise<FivemSettings>;
    saveState(guildId: string, state: Partial<FivemMonitorState>): Promise<void>;
    /** Guilds with a server address. */
    listMonitored(): Promise<readonly FivemGuildConfig[]>;
    addSnapshot(guildId: string, snapshot: FivemSnapshot): Promise<void>;
    listSnapshots(guildId: string, since: Date): Promise<readonly FivemSnapshot[]>;
    /** Deletes snapshots older than `before` across all guilds. Returns the number deleted. */
    pruneSnapshots(before: Date): Promise<number>;
}
/** Reads a FiveM server's public HTTP endpoints. */
export interface FivemQueryClient {
    query(address: string): Promise<FivemServerStatus>;
}
export interface FivemEmbed {
    readonly title: string;
    readonly description: string;
    readonly color: string;
    readonly fields?: readonly {
        readonly name: string;
        readonly value: string;
        readonly inline?: boolean;
    }[] | undefined;
    /** Large image, for example `attachment://players.png`. */
    readonly image?: string | undefined;
    readonly thumbnail?: string | undefined;
    readonly footer?: string | undefined;
    readonly timestamp?: Date | undefined;
}
/** A PNG attached to a message. */
export interface FivemImage {
    readonly name: string;
    readonly data: Buffer;
}
export interface FivemStatusMessageOptions {
    readonly image?: FivemImage | undefined;
    readonly refreshImage?: boolean | undefined;
}
/** Discord operations the FiveM feature needs. */
export interface FivemGateway {
    /**
     * Edits the status message, or posts a new one when there is none or it was
     * deleted (Unknown Message). Any other failure is thrown, so the next check
     * edits the same message instead of posting a duplicate. A new post always
     * carries `image`; an edit replaces the attachment only with
     * `refreshImage`, otherwise the attached graph is kept. Returns the message ID.
     */
    upsertStatusMessage(channelId: string, messageId: string | undefined, embed: FivemEmbed, connectUrl: string | undefined, options?: FivemStatusMessageOptions): Promise<string>;
    /** Posts an alert; `roleId` is pinged when given. */
    postAlert(channelId: string, content: string, embed: FivemEmbed, roleId: string | undefined): Promise<void>;
}
export interface PlayerHistoryPoint {
    readonly at: Date;
    /** Highest player count in the bucket, or undefined when there was no data. */
    readonly players?: number | undefined;
    readonly maxPlayers?: number | undefined;
    /** Whether the server was up for the whole bucket. */
    readonly online?: boolean | undefined;
}
export interface PlayerHistory {
    readonly range: "24h" | "7d";
    readonly points: readonly PlayerHistoryPoint[];
    readonly peak: number;
    readonly uptimePercent?: number | undefined;
}
/** Structured log sink (pino-compatible). */
export interface FivemLogger {
    info(fields: Record<string, unknown>, message: string): void;
    warn(fields: Record<string, unknown>, message: string): void;
}
/** One server's result from a tick, for the bot's presence. */
export interface FivemTickResult {
    readonly guildId: string;
    readonly phase: FivemPhase;
    readonly status: FivemServerStatus;
}
//# sourceMappingURL=types.d.ts.map