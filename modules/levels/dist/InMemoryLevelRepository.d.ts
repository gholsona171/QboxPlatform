import type { LevelActivity, LevelMember, LevelRepository, LevelSettings, LevelSettingsInput } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryLevelRepository implements LevelRepository {
    private readonly now;
    readonly settingsByGuild: Map<string, LevelSettings>;
    readonly members: Map<string, LevelMember>;
    constructor(now?: () => Date);
    getSettings(guildId: string): Promise<LevelSettings | undefined>;
    saveSettings(input: LevelSettingsInput): Promise<LevelSettings>;
    getMember(guildId: string, userId: string): Promise<LevelMember | undefined>;
    addActivity(guildId: string, userId: string, activity: LevelActivity): Promise<LevelMember>;
    setXp(guildId: string, userId: string, xp: number, displayName?: string): Promise<LevelMember>;
    setLevel(guildId: string, userId: string, level: number): Promise<LevelMember>;
    deleteMember(guildId: string, userId: string): Promise<void>;
    resetAll(guildId: string): Promise<readonly string[]>;
    leaderboard(guildId: string, offset: number, limit: number): Promise<{
        readonly members: readonly LevelMember[];
        readonly total: number;
    }>;
    rank(guildId: string, userId: string): Promise<number | undefined>;
    search(guildId: string, query: string, limit: number): Promise<readonly LevelMember[]>;
    private ranked;
    private blank;
    private store;
}
//# sourceMappingURL=InMemoryLevelRepository.d.ts.map