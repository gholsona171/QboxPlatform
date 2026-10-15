import { type LevelActivity, type LevelMember, type LevelRepository, type LevelSettings, type LevelSettingsInput } from "@qbox/levels";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "levelSettings" | "levelMember" | "$transaction">;
/** PostgreSQL level settings and member XP. `guildId` is the Discord guild ID. */
export declare class PrismaLevelRepository implements LevelRepository {
    private readonly client;
    constructor(client: Client);
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
}
export {};
//# sourceMappingURL=PrismaLevelRepository.d.ts.map