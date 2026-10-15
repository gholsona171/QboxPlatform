import type { OutgoingMessage } from "@qbox/shared/messages";
export type LevelUpMode = "CURRENT" | "CHANNEL" | "DM" | "OFF";
export type LevelRewardMode = "STACK" | "HIGHEST";
export declare const LEVEL_UP_MODES: readonly LevelUpMode[];
export declare const LEVEL_REWARD_MODES: readonly LevelRewardMode[];
/** Highest level the curve is evaluated to. */
export declare const LEVEL_CAP = 1000;
/** Most XP a member can hold. */
export declare const MAX_XP = 2000000000;
/** Total XP needed to reach level n: `base * n^exponent + linear * n`. */
export interface LevelCurve {
    readonly base: number;
    readonly exponent: number;
    readonly linear: number;
}
/** XP multiplier for a role or channel. */
export interface XpMultiplier {
    readonly id: string;
    readonly multiplier: number;
}
/** Role given when a member reaches `level`. */
export interface LevelReward {
    readonly level: number;
    readonly roleId: string;
}
export interface LevelSettings {
    readonly guildId: string;
    readonly enabled: boolean;
    readonly messageXpMin: number;
    readonly messageXpMax: number;
    /** Seconds between messages that earn XP. */
    readonly cooldownSeconds: number;
    /** XP per minute in voice with at least one other person, not muted or deafened. */
    readonly voiceXpPerMinute: number;
    readonly curve: LevelCurve;
    readonly roleMultipliers: readonly XpMultiplier[];
    readonly channelMultipliers: readonly XpMultiplier[];
    readonly noXpRoleIds: readonly string[];
    readonly noXpChannelIds: readonly string[];
    readonly levelUpMode: LevelUpMode;
    /** Used when `levelUpMode` is CHANNEL. */
    readonly levelUpChannelId?: string | undefined;
    /** Template with `{user}` and `{level}`. */
    readonly levelUpMessage: string;
    readonly rewards: readonly LevelReward[];
    /** STACK keeps every earned reward role; HIGHEST keeps only the highest one. */
    readonly rewardMode: LevelRewardMode;
    readonly removeRewardsOnReset: boolean;
    /** 0 = no maximum. */
    readonly maxLevel: number;
    readonly revision: number;
}
export interface LevelSettingsInput extends Omit<LevelSettings, "revision"> {
    readonly expectedRevision?: number | undefined;
}
export interface LevelMember {
    readonly guildId: string;
    readonly userId: string;
    readonly displayName: string;
    readonly xp: number;
    readonly level: number;
    /** Messages that earned XP. */
    readonly messages: number;
    readonly voiceMinutes: number;
    readonly lastMessageAt?: Date | undefined;
    readonly updatedAt: Date;
}
/** Atomic change to a member's totals. */
export interface LevelActivity {
    readonly xp: number;
    readonly messages?: number | undefined;
    readonly voiceMinutes?: number | undefined;
    readonly lastMessageAt?: Date | undefined;
    readonly displayName?: string | undefined;
}
export interface LeaderboardPage {
    readonly members: readonly LevelMember[];
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
}
export interface LevelRepository {
    getSettings(guildId: string): Promise<LevelSettings | undefined>;
    saveSettings(input: LevelSettingsInput): Promise<LevelSettings>;
    getMember(guildId: string, userId: string): Promise<LevelMember | undefined>;
    /** Atomically adds XP and counters, creating the member when needed. XP never drops below 0. */
    addActivity(guildId: string, userId: string, activity: LevelActivity): Promise<LevelMember>;
    /** Sets XP (and optionally the stored name), creating the member when needed. */
    setXp(guildId: string, userId: string, xp: number, displayName?: string): Promise<LevelMember>;
    setLevel(guildId: string, userId: string, level: number): Promise<LevelMember>;
    deleteMember(guildId: string, userId: string): Promise<void>;
    /** Deletes every member; returns the IDs of members who had reached level 1 or higher. */
    resetAll(guildId: string): Promise<readonly string[]>;
    /** Members ordered by XP (highest first). */
    leaderboard(guildId: string, offset: number, limit: number): Promise<{
        readonly members: readonly LevelMember[];
        readonly total: number;
    }>;
    /** 1-based leaderboard position, or undefined when the member has no XP row. */
    rank(guildId: string, userId: string): Promise<number | undefined>;
    /** Members whose name contains `query` or whose ID equals it. */
    search(guildId: string, query: string, limit: number): Promise<readonly LevelMember[]>;
}
/** Discord operations levels need. */
export interface LevelGateway {
    /** Role IDs the member holds, or undefined when they are not in the server. */
    memberRoleIds(guildId: string, userId: string): Promise<readonly string[] | undefined>;
    addRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
    removeRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
    guildName(guildId: string): Promise<string>;
    /** Posts the rendered `levels.level-up` message; it may ping `mentionUserId`. */
    sendMessage(channelId: string, message: OutgoingMessage, mentionUserId: string): Promise<void>;
    directMessage(userId: string, message: OutgoingMessage): Promise<boolean>;
}
/** A message that may earn XP. */
export interface LevelMessage {
    readonly guildId: string;
    readonly channelId: string;
    /** Parent channel for threads, so channel rules apply inside threads. */
    readonly parentChannelId?: string | undefined;
    readonly userId: string;
    readonly displayName: string;
    readonly roleIds: readonly string[];
    readonly at: Date;
}
/** Whole voice minutes a member earned since the last flush. */
export interface VoiceMinutes {
    readonly guildId: string;
    readonly channelId: string;
    readonly userId: string;
    readonly displayName: string;
    readonly roleIds: readonly string[];
    readonly minutes: number;
}
/** A member's result after XP changed. */
export interface LevelChange {
    readonly member: LevelMember;
    readonly previousLevel: number;
    readonly xpAdded: number;
}
/** Rank card data. */
export interface LevelProfile {
    readonly member: LevelMember;
    readonly rank?: number | undefined;
    /** XP needed for the current level and the next one. */
    readonly currentLevelXp: number;
    readonly nextLevelXp?: number | undefined;
}
export interface LevelStaff {
    readonly userId: string;
    readonly displayName: string;
}
//# sourceMappingURL=types.d.ts.map