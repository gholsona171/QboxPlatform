import { type MessageTemplates } from "@qbox/shared/messages";
import type { LeaderboardPage, LevelChange, LevelGateway, LevelMember, LevelMessage, LevelProfile, LevelRepository, LevelSettings, LevelSettingsInput, VoiceMinutes } from "./types.js";
export declare const LEADERBOARD_PAGE_SIZE = 10;
export declare function defaultLevelSettings(guildId: string): LevelSettings;
/** Fills `{user}` and `{level}` in a level-up template. */
export declare function renderLevelUpMessage(template: string, userId: string, level: number): string;
/**
 * Levels and rewards: XP from messages and voice, the level curve, level-up
 * messages, and reward roles. Callers check `levels.manage` before staff
 * methods (give, take, set, reset, settings).
 */
export declare class LevelService {
    private readonly repository;
    private readonly gateway?;
    private readonly now;
    private readonly random;
    private readonly templates;
    private readonly cooldowns;
    constructor(repository: LevelRepository, gateway?: LevelGateway | undefined, now?: () => Date, random?: () => number, templates?: MessageTemplates);
    settings(guildId: string): Promise<LevelSettings>;
    saveSettings(input: LevelSettingsInput): Promise<LevelSettings>;
    /** Awards message XP when the member is off cooldown. Returns the change, or undefined when nothing was awarded. */
    handleMessage(message: LevelMessage): Promise<LevelChange | undefined>;
    /** Awards voice XP for minutes collected by the voice tracker. */
    awardVoice(entries: readonly VoiceMinutes[]): Promise<readonly LevelChange[]>;
    profile(guildId: string, userId: string): Promise<LevelProfile>;
    leaderboard(guildId: string, page?: number): Promise<LeaderboardPage>;
    search(guildId: string, query: string): Promise<readonly LevelMember[]>;
    /** Adds XP (staff). */
    give(guildId: string, userId: string, amount: number, displayName?: string): Promise<LevelChange>;
    /** Removes XP (staff). XP never goes below 0. */
    take(guildId: string, userId: string, amount: number): Promise<LevelChange>;
    /** Sets a member to the start of `level` (staff). */
    setLevel(guildId: string, userId: string, level: number, displayName?: string): Promise<LevelChange>;
    /** Sets a member's XP to an exact amount (staff). */
    setXp(guildId: string, userId: string, xp: number, displayName?: string): Promise<LevelChange>;
    /** Clears one member's XP (staff). Removes their reward roles when the setting is on. */
    reset(guildId: string, userId: string): Promise<void>;
    /** Clears everyone's XP (staff). Returns how many members had levels. */
    resetAll(guildId: string): Promise<{
        readonly members: number;
        readonly rewardsRemoved: boolean;
    }>;
    private adjust;
    private blocked;
    /** Highest matching role multiplier times the channel multiplier. */
    private multiplier;
    private applyLevel;
    private afterChange;
    /** Gives earned reward roles and removes ones the member should no longer have. */
    private syncRewards;
    private announce;
    private pruneCooldowns;
}
//# sourceMappingURL=LevelService.d.ts.map