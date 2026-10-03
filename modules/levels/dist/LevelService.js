import { passthroughTemplates } from "@qbox/shared/messages";
import { defaultCurve, levelForXp, levelProgress, xpForLevel } from "./curve.js";
import { LEVEL_CAP, MAX_XP } from "./types.js";
import { LevelError, invalid, requireRange, requireSnowflake, validateSettings } from "./validation.js";
export const LEADERBOARD_PAGE_SIZE = 10;
const MAX_ADJUST = 10_000_000;
export function defaultLevelSettings(guildId) {
    return {
        guildId,
        enabled: false,
        messageXpMin: 15,
        messageXpMax: 25,
        cooldownSeconds: 60,
        voiceXpPerMinute: 5,
        curve: defaultCurve(),
        roleMultipliers: [],
        channelMultipliers: [],
        noXpRoleIds: [],
        noXpChannelIds: [],
        levelUpMode: "CURRENT",
        levelUpMessage: "GG {user}, you reached level {level}!",
        rewards: [],
        rewardMode: "STACK",
        removeRewardsOnReset: true,
        maxLevel: 0,
        revision: 0,
    };
}
/** Fills `{user}` and `{level}` in a level-up template. */
export function renderLevelUpMessage(template, userId, level) {
    return template.replaceAll("{user}", `<@${userId}>`).replaceAll("{level}", String(level)).slice(0, 2000);
}
/**
 * Levels and rewards: XP from messages and voice, the level curve, level-up
 * messages, and reward roles. Callers check `levels.manage` before staff
 * methods (give, take, set, reset, settings).
 */
export class LevelService {
    repository;
    gateway;
    now;
    random;
    templates;
    cooldowns = new Map();
    constructor(repository, gateway, now = () => new Date(), random = Math.random, templates = passthroughTemplates) {
        this.repository = repository;
        this.gateway = gateway;
        this.now = now;
        this.random = random;
        this.templates = templates;
    }
    async settings(guildId) {
        requireSnowflake("guildId", guildId);
        return (await this.repository.getSettings(guildId)) ?? defaultLevelSettings(guildId);
    }
    async saveSettings(input) {
        validateSettings(input);
        return this.repository.saveSettings({
            ...input,
            levelUpMessage: input.levelUpMessage.trim(),
            rewards: [...input.rewards].sort((left, right) => left.level - right.level),
            ...(input.levelUpMode === "CHANNEL" ? {} : { levelUpChannelId: undefined }),
        });
    }
    /** Awards message XP when the member is off cooldown. Returns the change, or undefined when nothing was awarded. */
    async handleMessage(message) {
        const settings = await this.settings(message.guildId);
        if (!settings.enabled || settings.messageXpMax === 0)
            return undefined;
        if (this.blocked(settings, message.roleIds, message.channelId, message.parentChannelId))
            return undefined;
        const key = `${message.guildId}:${message.userId}`;
        const at = message.at.getTime();
        const last = this.cooldowns.get(key);
        if (last !== undefined && at - last < settings.cooldownSeconds * 1000)
            return undefined;
        this.cooldowns.set(key, at);
        if (this.cooldowns.size > 50_000)
            this.pruneCooldowns(at, settings.cooldownSeconds);
        const base = settings.messageXpMin + Math.floor(this.random() * (settings.messageXpMax - settings.messageXpMin + 1));
        const xp = Math.round(base * this.multiplier(settings, message.roleIds, message.channelId, message.parentChannelId));
        const member = await this.repository.addActivity(message.guildId, message.userId, { xp, messages: 1, lastMessageAt: message.at, displayName: message.displayName });
        return this.afterChange(settings, member, xp, message.roleIds, message.channelId);
    }
    /** Awards voice XP for minutes collected by the voice tracker. */
    async awardVoice(entries) {
        const changes = [];
        const settingsByGuild = new Map();
        for (const entry of entries) {
            const settings = settingsByGuild.get(entry.guildId) ?? (await this.settings(entry.guildId));
            settingsByGuild.set(entry.guildId, settings);
            if (!settings.enabled || this.blocked(settings, entry.roleIds, entry.channelId))
                continue;
            const xp = Math.round(settings.voiceXpPerMinute * entry.minutes * this.multiplier(settings, entry.roleIds, entry.channelId));
            const member = await this.repository.addActivity(entry.guildId, entry.userId, { xp, voiceMinutes: entry.minutes, displayName: entry.displayName });
            changes.push(await this.afterChange(settings, member, xp, entry.roleIds, entry.channelId));
        }
        return changes;
    }
    async profile(guildId, userId) {
        requireSnowflake("member", userId);
        const settings = await this.settings(guildId);
        const member = (await this.repository.getMember(guildId, userId)) ?? emptyMember(guildId, userId, this.now());
        const progress = levelProgress(member.xp, settings.curve, settings.maxLevel);
        return {
            member: { ...member, level: progress.level },
            rank: await this.repository.rank(guildId, userId),
            currentLevelXp: progress.currentLevelXp,
            ...(progress.nextLevelXp === undefined ? {} : { nextLevelXp: progress.nextLevelXp }),
        };
    }
    async leaderboard(guildId, page = 1) {
        requireSnowflake("guildId", guildId);
        requireRange("page", page, 1, 100_000);
        const result = await this.repository.leaderboard(guildId, (page - 1) * LEADERBOARD_PAGE_SIZE, LEADERBOARD_PAGE_SIZE);
        return { ...result, page, pageSize: LEADERBOARD_PAGE_SIZE };
    }
    async search(guildId, query) {
        requireSnowflake("guildId", guildId);
        const text = query.trim();
        if (text.length < 1 || text.length > 100)
            invalid("Search needs 1 to 100 characters.");
        return this.repository.search(guildId, text, 25);
    }
    /** Adds XP (staff). */
    async give(guildId, userId, amount, displayName) {
        requireRange("XP amount", amount, 1, MAX_ADJUST);
        return this.adjust(guildId, userId, amount, displayName);
    }
    /** Removes XP (staff). XP never goes below 0. */
    async take(guildId, userId, amount) {
        requireRange("XP amount", amount, 1, MAX_ADJUST);
        return this.adjust(guildId, userId, -amount);
    }
    /** Sets a member to the start of `level` (staff). */
    async setLevel(guildId, userId, level, displayName) {
        requireSnowflake("member", userId);
        const settings = await this.settings(guildId);
        requireRange("Level", level, 0, settings.maxLevel > 0 ? settings.maxLevel : LEVEL_CAP);
        const previous = await this.repository.getMember(guildId, userId);
        const xp = Math.min(xpForLevel(level, settings.curve), MAX_XP);
        const updated = await this.repository.setXp(guildId, userId, xp, displayName);
        const member = updated.level === level ? updated : await this.repository.setLevel(guildId, userId, level);
        await this.syncRewards(settings, guildId, userId, level);
        return { member, previousLevel: previous?.level ?? 0, xpAdded: xp - (previous?.xp ?? 0) };
    }
    /** Sets a member's XP to an exact amount (staff). */
    async setXp(guildId, userId, xp, displayName) {
        requireSnowflake("member", userId);
        requireRange("XP", xp, 0, MAX_XP);
        const settings = await this.settings(guildId);
        const previous = await this.repository.getMember(guildId, userId);
        const updated = await this.repository.setXp(guildId, userId, xp, displayName);
        const level = levelForXp(xp, settings.curve, settings.maxLevel);
        const member = updated.level === level ? updated : await this.repository.setLevel(guildId, userId, level);
        await this.syncRewards(settings, guildId, userId, level);
        return { member, previousLevel: previous?.level ?? 0, xpAdded: xp - (previous?.xp ?? 0) };
    }
    /** Clears one member's XP (staff). Removes their reward roles when the setting is on. */
    async reset(guildId, userId) {
        requireSnowflake("member", userId);
        const settings = await this.settings(guildId);
        const member = await this.repository.getMember(guildId, userId);
        if (!member)
            throw new LevelError("NOT_FOUND", "That member has no XP yet.");
        await this.repository.deleteMember(guildId, userId);
        if (settings.removeRewardsOnReset)
            await this.syncRewards(settings, guildId, userId, 0);
    }
    /** Clears everyone's XP (staff). Returns how many members had levels. */
    async resetAll(guildId) {
        requireSnowflake("guildId", guildId);
        const settings = await this.settings(guildId);
        const leveled = await this.repository.resetAll(guildId);
        const removeRewards = settings.removeRewardsOnReset && settings.rewards.length > 0 && this.gateway !== undefined;
        if (removeRewards)
            for (const userId of leveled)
                await this.syncRewards(settings, guildId, userId, 0);
        return { members: leveled.length, rewardsRemoved: removeRewards };
    }
    async adjust(guildId, userId, amount, displayName) {
        requireSnowflake("member", userId);
        const settings = await this.settings(guildId);
        const previous = await this.repository.getMember(guildId, userId);
        if (amount < 0 && !previous)
            throw new LevelError("NOT_FOUND", "That member has no XP yet.");
        const member = await this.repository.addActivity(guildId, userId, { xp: amount, ...(displayName ? { displayName } : {}) });
        const change = await this.applyLevel(settings, member, amount);
        await this.syncRewards(settings, guildId, userId, change.member.level);
        return change;
    }
    blocked(settings, roleIds, channelId, parentChannelId) {
        if (settings.noXpChannelIds.includes(channelId) || (parentChannelId !== undefined && settings.noXpChannelIds.includes(parentChannelId)))
            return true;
        return roleIds.some((roleId) => settings.noXpRoleIds.includes(roleId));
    }
    /** Highest matching role multiplier times the channel multiplier. */
    multiplier(settings, roleIds, channelId, parentChannelId) {
        const roles = settings.roleMultipliers.filter((item) => roleIds.includes(item.id)).map((item) => item.multiplier);
        const channel = settings.channelMultipliers.find((item) => item.id === channelId) ?? settings.channelMultipliers.find((item) => item.id === parentChannelId);
        return (roles.length ? Math.max(...roles) : 1) * (channel?.multiplier ?? 1);
    }
    async applyLevel(settings, member, xpAdded) {
        const level = levelForXp(member.xp, settings.curve, settings.maxLevel);
        if (level === member.level)
            return { member, previousLevel: member.level, xpAdded };
        return { member: await this.repository.setLevel(member.guildId, member.userId, level), previousLevel: member.level, xpAdded };
    }
    async afterChange(settings, member, xpAdded, roleIds, channelId) {
        const change = await this.applyLevel(settings, member, xpAdded);
        if (change.member.level > change.previousLevel) {
            await this.syncRewards(settings, member.guildId, member.userId, change.member.level, roleIds);
            await this.announce(settings, change.member, channelId);
        }
        return change;
    }
    /** Gives earned reward roles and removes ones the member should no longer have. */
    async syncRewards(settings, guildId, userId, level, knownRoleIds) {
        if (!this.gateway || settings.rewards.length === 0)
            return;
        const gateway = this.gateway;
        const roleIds = knownRoleIds ?? (await gateway.memberRoleIds(guildId, userId).catch(() => undefined));
        if (!roleIds)
            return;
        const earned = settings.rewards.filter((reward) => reward.level <= level);
        const top = earned.reduce((highest, reward) => Math.max(highest, reward.level), 0);
        const keep = new Set((settings.rewardMode === "HIGHEST" ? earned.filter((reward) => reward.level === top) : earned).map((reward) => reward.roleId));
        const reason = `Level ${level} rewards`;
        for (const roleId of keep)
            if (!roleIds.includes(roleId))
                await gateway.addRole(guildId, userId, roleId, reason).catch(() => undefined);
        for (const reward of settings.rewards)
            if (!keep.has(reward.roleId) && roleIds.includes(reward.roleId))
                await gateway.removeRole(guildId, userId, reward.roleId, reason).catch(() => undefined);
    }
    async announce(settings, member, channelId) {
        if (!this.gateway || settings.levelUpMode === "OFF")
            return;
        const target = settings.levelUpMode === "CHANNEL" ? settings.levelUpChannelId : channelId;
        if (settings.levelUpMode !== "DM" && !target)
            return;
        const { guildId, userId, level } = member;
        const [server, rank] = await Promise.all([this.gateway.guildName(guildId).catch(() => "the server"), this.repository.rank(guildId, userId)]);
        const message = await this.templates.apply(guildId, "levels.level-up", { user: `<@${userId}>`, username: member.displayName, level, xp: member.xp, rank: rank ?? "", server }, { content: renderLevelUpMessage(settings.levelUpMessage, userId, level) });
        if (settings.levelUpMode === "DM") {
            await this.gateway.directMessage(userId, message);
            return;
        }
        if (target)
            await this.gateway.sendMessage(target, message, userId).catch(() => undefined);
    }
    pruneCooldowns(now, cooldownSeconds) {
        const cutoff = now - Math.max(cooldownSeconds, 60) * 1000;
        for (const [key, at] of this.cooldowns)
            if (at < cutoff)
                this.cooldowns.delete(key);
    }
}
function emptyMember(guildId, userId, now) {
    return { guildId, userId, displayName: "", xp: 0, level: 0, messages: 0, voiceMinutes: 0, updatedAt: now };
}
//# sourceMappingURL=LevelService.js.map