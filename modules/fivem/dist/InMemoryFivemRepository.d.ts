import type { FivemGuildConfig, FivemMonitorState, FivemRepository, FivemSettings, FivemSettingsInput, FivemSnapshot } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryFivemRepository implements FivemRepository {
    readonly configs: Map<string, FivemGuildConfig>;
    readonly snapshots: (FivemSnapshot & {
        readonly guildId: string;
    })[];
    get(guildId: string): Promise<FivemGuildConfig | undefined>;
    saveSettings(input: FivemSettingsInput): Promise<FivemSettings>;
    saveState(guildId: string, state: Partial<FivemMonitorState>): Promise<void>;
    listMonitored(): Promise<readonly FivemGuildConfig[]>;
    addSnapshot(guildId: string, snapshot: FivemSnapshot): Promise<void>;
    listSnapshots(guildId: string, since: Date): Promise<readonly FivemSnapshot[]>;
    pruneSnapshots(before: Date): Promise<number>;
}
//# sourceMappingURL=InMemoryFivemRepository.d.ts.map