import { type MessageTemplates, type OutgoingMessage, type TemplateValues } from "@qbox/shared/messages";
import type { GameServerQueryClient, GameServerStatus, GamesGateway, GamesHistory, GamesRepository, GamesServer, GamesServerInput, GamesServerRecord, GamesServerState, GamesSettings, GamesSettingsInput } from "./types.js";
/** Failed polls in a row before a server counts as down. */
export declare const FAILURES_BEFORE_DOWN = 3;
/** Names shown in the status message and `/server players`. */
export declare const PLAYER_LIST_LIMIT = 20;
/** Servers per guild. */
export declare const MAX_SERVERS = 10;
/** Discord allows two channel renames per ten minutes, so the player-count channel changes at most this often. */
export declare const RENAME_MIN_INTERVAL_MS: number;
export declare function defaultGamesSettings(guildId: string): GamesSettings;
export declare function emptyServerState(): GamesServerState;
/** What people call the game: "Minecraft", "Minecraft Bedrock", or the Steam label. */
export declare function gameLabel(server: Pick<GamesServer, "kind" | "game">): string;
/** "2h 5m", "3d 4h". */
export declare function formatDuration(ms: number): string;
/** Player names for Discord, escaped and cut to the list limit. */
export declare function playerLines(status: GameServerStatus, limit?: number): string;
/** Placeholder values shared by every message key. */
export declare function templateValues(server: GamesServer, status: GameServerStatus, state: GamesServerState): TemplateValues;
/** Default status message (`games.status`). */
export declare function statusMessage(server: GamesServer, status: GameServerStatus, onlineSince?: Date): OutgoingMessage;
/** Default down alert (`games.down`). */
export declare function downMessage(server: GamesServer, status: GameServerStatus): OutgoingMessage;
/** Default back-up alert (`games.up`). */
export declare function upMessage(server: GamesServer, status: GameServerStatus, downFor: string): OutgoingMessage;
/**
 * Game server monitoring shared by the bot and the API: live status for
 * Minecraft and Steam-query games, auto-updating status messages, player-count
 * channels, down/up alerts, and player-count history. Permission checks
 * happen before the service is called.
 */
export declare class GamesService {
    private readonly repository;
    private readonly query;
    private readonly gateway?;
    private readonly templates;
    private readonly now;
    private lastPrune;
    constructor(repository: GamesRepository, query: GameServerQueryClient, gateway?: GamesGateway | undefined, templates?: MessageTemplates, now?: () => Date);
    settings(guildId: string): Promise<GamesSettings>;
    saveSettings(input: GamesSettingsInput): Promise<GamesSettings>;
    servers(guildId: string): Promise<readonly GamesServerRecord[]>;
    server(guildId: string, id: string): Promise<GamesServerRecord>;
    /** Finds a server by name (case-insensitive, prefix allowed); the first enabled one when no name is given. */
    findServer(guildId: string, name?: string): Promise<GamesServerRecord>;
    /** Saves a server after querying it once; the status tells the form whether it was reached. */
    createServer(guildId: string, input: GamesServerInput): Promise<{
        readonly server: GamesServer;
        readonly status: GameServerStatus;
    }>;
    updateServer(guildId: string, id: string, input: GamesServerInput): Promise<GamesServer>;
    deleteServer(guildId: string, id: string): Promise<void>;
    /** Queries a saved server now. */
    status(guildId: string, id: string): Promise<GameServerStatus>;
    /** Queries an address without saving it (the portal's test button). */
    test(kind: string, address: string): Promise<GameServerStatus>;
    /** Highest player count per time bucket for a chart, with uptime. */
    history(guildId: string, id: string, range: "24h" | "7d"): Promise<GamesHistory>;
    /** Polls every enabled server whose interval has passed. Called by the bot's timer. */
    tick(): Promise<void>;
    /** Polls one server: records a snapshot, sends down/up alerts, updates the status message and player-count channel. */
    refresh(record: GamesServerRecord): Promise<GameServerStatus>;
    /** The player-count channel name for a status, rendered from the guild's template. */
    playerCountName(server: GamesServer, status: GameServerStatus): Promise<string>;
    private renamePlayerCountChannel;
    private alert;
}
//# sourceMappingURL=GamesService.d.ts.map