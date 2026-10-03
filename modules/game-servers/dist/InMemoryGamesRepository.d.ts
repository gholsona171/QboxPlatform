import type { GamesRepository, GamesServer, GamesServerInput, GamesServerRecord, GamesServerState, GamesSettings, GamesSettingsInput, GamesSnapshot } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryGamesRepository implements GamesRepository {
    readonly settings: Map<string, GamesSettings>;
    readonly servers: Map<string, GamesServerRecord>;
    readonly snapshots: (GamesSnapshot & {
        readonly serverId: string;
    })[];
    private nextId;
    getSettings(guildId: string): Promise<GamesSettings | undefined>;
    saveSettings(input: GamesSettingsInput): Promise<GamesSettings>;
    listServers(guildId: string): Promise<readonly GamesServerRecord[]>;
    getServer(guildId: string, id: string): Promise<GamesServerRecord | undefined>;
    createServer(guildId: string, input: GamesServerInput): Promise<GamesServer>;
    updateServer(guildId: string, id: string, input: GamesServerInput): Promise<GamesServer>;
    deleteServer(guildId: string, id: string): Promise<void>;
    saveState(id: string, state: Partial<GamesServerState>): Promise<void>;
    listMonitored(): Promise<readonly GamesServerRecord[]>;
    addSnapshot(serverId: string, snapshot: GamesSnapshot): Promise<void>;
    listSnapshots(serverId: string, since: Date): Promise<readonly GamesSnapshot[]>;
    pruneSnapshots(before: Date): Promise<number>;
}
//# sourceMappingURL=InMemoryGamesRepository.d.ts.map