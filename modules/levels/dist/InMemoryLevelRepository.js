import { defaultLevelSettings } from "./LevelService.js";
import { LevelError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryLevelRepository {
    now;
    settingsByGuild = new Map();
    members = new Map();
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async getSettings(guildId) {
        return this.settingsByGuild.get(guildId);
    }
    async saveSettings(input) {
        const current = this.settingsByGuild.get(input.guildId) ?? defaultLevelSettings(input.guildId);
        if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
            throw new LevelError("CONFLICT", "Level settings changed since they were loaded.", { currentRevision: current.revision });
        const { expectedRevision: _expected, levelUpChannelId, ...rest } = input;
        const saved = { ...rest, ...(levelUpChannelId ? { levelUpChannelId } : {}), revision: current.revision + 1 };
        this.settingsByGuild.set(input.guildId, saved);
        return saved;
    }
    async getMember(guildId, userId) {
        return this.members.get(`${guildId}:${userId}`);
    }
    async addActivity(guildId, userId, activity) {
        const current = this.members.get(`${guildId}:${userId}`) ?? this.blank(guildId, userId);
        return this.store({
            ...current,
            xp: Math.max(0, current.xp + activity.xp),
            messages: current.messages + (activity.messages ?? 0),
            voiceMinutes: current.voiceMinutes + (activity.voiceMinutes ?? 0),
            ...(activity.lastMessageAt ? { lastMessageAt: activity.lastMessageAt } : {}),
            ...(activity.displayName ? { displayName: activity.displayName } : {}),
        });
    }
    async setXp(guildId, userId, xp, displayName) {
        const current = this.members.get(`${guildId}:${userId}`) ?? this.blank(guildId, userId);
        return this.store({ ...current, xp, ...(displayName ? { displayName } : {}) });
    }
    async setLevel(guildId, userId, level) {
        const current = this.members.get(`${guildId}:${userId}`);
        if (!current)
            throw new LevelError("NOT_FOUND", "That member has no XP yet.");
        return this.store({ ...current, level });
    }
    async deleteMember(guildId, userId) {
        this.members.delete(`${guildId}:${userId}`);
    }
    async resetAll(guildId) {
        const leveled = [];
        for (const [key, member] of this.members) {
            if (member.guildId !== guildId)
                continue;
            if (member.level > 0)
                leveled.push(member.userId);
            this.members.delete(key);
        }
        return leveled;
    }
    async leaderboard(guildId, offset, limit) {
        const ranked = this.ranked(guildId);
        return { members: ranked.slice(offset, offset + limit), total: ranked.length };
    }
    async rank(guildId, userId) {
        const index = this.ranked(guildId).findIndex((member) => member.userId === userId);
        return index < 0 ? undefined : index + 1;
    }
    async search(guildId, query, limit) {
        const text = query.toLowerCase();
        return this.ranked(guildId).filter((member) => member.userId === query || member.displayName.toLowerCase().includes(text)).slice(0, limit);
    }
    ranked(guildId) {
        return [...this.members.values()]
            .filter((member) => member.guildId === guildId)
            .sort((left, right) => right.xp - left.xp || left.userId.localeCompare(right.userId));
    }
    blank(guildId, userId) {
        return { guildId, userId, displayName: "", xp: 0, level: 0, messages: 0, voiceMinutes: 0, updatedAt: this.now() };
    }
    store(member) {
        const updated = { ...member, updatedAt: this.now() };
        this.members.set(`${member.guildId}:${member.userId}`, updated);
        return updated;
    }
}
//# sourceMappingURL=InMemoryLevelRepository.js.map