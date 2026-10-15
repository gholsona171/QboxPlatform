import { type GamesRepository, type GamesServer, type GamesServerInput, type GamesServerRecord, type GamesServerState, type GamesSettings, type GamesSettingsInput, type GamesSnapshot } from "@qbox/game-servers";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "gamesSettings" | "gamesServer" | "gamesStatusSnapshot">;
/** PostgreSQL game server settings, servers with monitor state, and status snapshots. `guildId` is the Discord guild ID. */
export declare class PrismaGamesRepository implements GamesRepository {
    private readonly client;
    constructor(client: Client);
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
export {};
//# sourceMappingURL=PrismaGamesRepository.d.ts.map