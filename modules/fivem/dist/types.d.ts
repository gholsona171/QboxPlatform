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
    readonly revision: number;
}
export interface FivemSettingsInput extends Omit<FivemSettings, "revision"> {
    readonly expectedRevision?: number | undefined;
}
/** Monitoring state stored next to the settings. Not part of the settings revision. */
export interface FivemMonitorState {
    readonly statusMessageId?: string | undefined;
    readonly lastOnline?: boolean | undefined;
    readonly onlineSince?: Date | undefined;
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
    readonly footer?: string | undefined;
    readonly timestamp?: Date | undefined;
}
/** Discord operations the FiveM feature needs. */
export interface FivemGateway {
    /** Edits the status message, or posts a new one when it is missing. Returns the message ID. */
    upsertStatusMessage(channelId: string, messageId: string | undefined, embed: FivemEmbed, connectUrl: string | undefined): Promise<string>;
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
//# sourceMappingURL=types.d.ts.map