import type { OutgoingMessage } from "@qbox/shared/messages";
/** How a server is queried. Minecraft has its own protocols; every Source-engine game uses Steam A2S. */
export type GamesServerKind = "minecraft-java" | "minecraft-bedrock" | "steam";
export declare const GAMES_SERVER_KINDS: readonly GamesServerKind[];
/** Guild-wide settings: how player-count channels are named. */
export interface GamesSettings {
    readonly guildId: string;
    /** Channel name while a server is up; `{online}`, `{max}`, `{name}`, and `{game}` are replaced. */
    readonly playerCountTemplate: string;
    /** Channel name while a server is down. */
    readonly playerCountOfflineTemplate: string;
    readonly revision: number;
}
export interface GamesSettingsInput extends Omit<GamesSettings, "revision"> {
    readonly expectedRevision?: number | undefined;
}
/** Fields staff edit for one server. */
export interface GamesServerInput {
    readonly name: string;
    readonly kind: GamesServerKind;
    /** `host` or `host:port`. Minecraft kinds fall back to their default port; Steam needs the query port. */
    readonly address: string;
    /** Game label for Steam servers, for example `Rust`. */
    readonly game?: string | undefined;
    /** Link shown on the Connect button (`https://...`) or in the status message (`steam://connect/...`). */
    readonly connectUrl?: string | undefined;
    /** Channel with the auto-updating status message. */
    readonly statusChannelId?: string | undefined;
    readonly updateIntervalSeconds: number;
    /** Channel renamed to the player count. */
    readonly playerCountChannelId?: string | undefined;
    /** Channel for down and back-up alerts. */
    readonly alertChannelId?: string | undefined;
    /** Role pinged with alerts. */
    readonly alertRoleId?: string | undefined;
    readonly enabled: boolean;
}
export interface GamesServer extends GamesServerInput {
    readonly id: string;
    readonly guildId: string;
    readonly createdAt: Date;
}
/** Monitoring state stored next to a server. */
export interface GamesServerState {
    readonly statusMessageId?: string | undefined;
    readonly lastOnline?: boolean | undefined;
    readonly onlineSince?: Date | undefined;
    readonly offlineSince?: Date | undefined;
    /** Failed polls in a row. */
    readonly failureStreak: number;
    readonly lastPolledAt?: Date | undefined;
    readonly lastError?: string | undefined;
    readonly lastPlayerCount: number;
    readonly lastMaxPlayers: number;
    /** When the player-count channel was last renamed (Discord allows 2 renames per 10 minutes). */
    readonly lastRenamedAt?: Date | undefined;
    readonly lastChannelName?: string | undefined;
}
export interface GamesServerRecord {
    readonly server: GamesServer;
    readonly state: GamesServerState;
}
export interface GameServerPlayer {
    readonly name: string;
    readonly score?: number | undefined;
    /** Seconds connected. */
    readonly duration?: number | undefined;
}
/** What every protocol client returns. */
export interface GameServerStatus {
    readonly online: boolean;
    readonly name?: string | undefined;
    readonly map?: string | undefined;
    readonly version?: string | undefined;
    readonly players: readonly GameServerPlayer[];
    readonly playerCount: number;
    readonly maxPlayers: number;
    readonly latencyMs: number;
    /** Why the server could not be reached. */
    readonly error?: string | undefined;
    readonly checkedAt: Date;
}
export interface GamesSnapshot {
    readonly online: boolean;
    readonly players: number;
    readonly maxPlayers: number;
    readonly at: Date;
}
export interface GamesRepository {
    getSettings(guildId: string): Promise<GamesSettings | undefined>;
    saveSettings(input: GamesSettingsInput): Promise<GamesSettings>;
    listServers(guildId: string): Promise<readonly GamesServerRecord[]>;
    getServer(guildId: string, id: string): Promise<GamesServerRecord | undefined>;
    createServer(guildId: string, input: GamesServerInput): Promise<GamesServer>;
    updateServer(guildId: string, id: string, input: GamesServerInput): Promise<GamesServer>;
    deleteServer(guildId: string, id: string): Promise<void>;
    saveState(id: string, state: Partial<GamesServerState>): Promise<void>;
    /** Enabled servers across all guilds. */
    listMonitored(): Promise<readonly GamesServerRecord[]>;
    addSnapshot(serverId: string, snapshot: GamesSnapshot): Promise<void>;
    listSnapshots(serverId: string, since: Date): Promise<readonly GamesSnapshot[]>;
    /** Deletes snapshots older than `before` across all servers. Returns the number deleted. */
    pruneSnapshots(before: Date): Promise<number>;
}
/** Queries a game server with the protocol its kind uses. Never throws. */
export interface GameServerQueryClient {
    query(kind: GamesServerKind, address: string): Promise<GameServerStatus>;
}
/** Discord operations the feature needs. */
export interface GamesGateway {
    /** Edits the status message, or posts a new one when it is missing. Returns the message ID. */
    upsertStatusMessage(channelId: string, messageId: string | undefined, message: OutgoingMessage, connectUrl: string | undefined): Promise<string>;
    /** Posts an alert; `roleId` is pinged when given. */
    postAlert(channelId: string, message: OutgoingMessage, roleId: string | undefined): Promise<void>;
    renameChannel(channelId: string, name: string): Promise<void>;
}
export interface GamesHistoryPoint {
    readonly at: Date;
    /** Highest player count in the bucket, or undefined when there was no data. */
    readonly players?: number | undefined;
    readonly maxPlayers?: number | undefined;
    /** Whether the server was up for the whole bucket. */
    readonly online?: boolean | undefined;
}
export interface GamesHistory {
    readonly range: "24h" | "7d";
    readonly points: readonly GamesHistoryPoint[];
    readonly peak: number;
    readonly uptimePercent?: number | undefined;
}
//# sourceMappingURL=types.d.ts.map