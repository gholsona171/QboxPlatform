import { type FivemGuildConfig, type FivemMonitorState, type FivemRepository, type FivemSettings, type FivemSettingsInput, type FivemSnapshot } from "@qbox/fivem";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "fivemSettings" | "fivemStatusSnapshot">;
/** PostgreSQL FiveM settings, monitor state, and status snapshots. `guildId` is the Discord guild ID. */
export declare class PrismaFivemRepository implements FivemRepository {
    private readonly client;
    constructor(client: Client);
    get(guildId: string): Promise<FivemGuildConfig | undefined>;
    saveSettings(input: FivemSettingsInput): Promise<FivemSettings>;
    saveState(guildId: string, state: Partial<FivemMonitorState>): Promise<void>;
    listMonitored(): Promise<readonly FivemGuildConfig[]>;
    addSnapshot(guildId: string, snapshot: FivemSnapshot): Promise<void>;
    listSnapshots(guildId: string, since: Date): Promise<readonly FivemSnapshot[]>;
    pruneSnapshots(before: Date): Promise<number>;
}
export {};
//# sourceMappingURL=PrismaFivemRepository.d.ts.map