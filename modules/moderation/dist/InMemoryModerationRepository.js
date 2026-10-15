import { randomUUID } from "node:crypto";
import { defaultModerationSettings } from "./ModerationService.js";
import { ModerationError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryModerationRepository {
    now;
    settingsByGuild = new Map();
    cases = [];
    counters = new Map();
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async getSettings(guildId) {
        return this.settingsByGuild.get(guildId);
    }
    async saveSettings(input) {
        const current = this.settingsByGuild.get(input.guildId) ?? defaultModerationSettings(input.guildId);
        if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
            throw new ModerationError("CONFLICT", "Moderation settings changed since they were loaded.", { currentRevision: current.revision });
        const { expectedRevision: _expected, ...rest } = input;
        const saved = { ...rest, revision: current.revision + 1 };
        this.settingsByGuild.set(input.guildId, saved);
        return saved;
    }
    async allocateCaseNumber(guildId) {
        const next = (this.counters.get(guildId) ?? 0) + 1;
        this.counters.set(guildId, next);
        return next;
    }
    async createCase(input) {
        const now = this.now();
        const created = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
        this.cases.push(created);
        return created;
    }
    async getCase(guildId, number) {
        return this.cases.find((item) => item.guildId === guildId && item.number === number);
    }
    async listCases(filter) {
        const search = filter.search?.toLowerCase();
        return this.cases
            .filter((item) => item.guildId === filter.guildId)
            .filter((item) => !filter.types || filter.types.includes(item.type))
            .filter((item) => !filter.targetId || item.targetId === filter.targetId)
            .filter((item) => !filter.moderatorId || item.moderatorId === filter.moderatorId)
            .filter((item) => filter.active === undefined || item.active === filter.active)
            .filter((item) => !filter.source || item.source === filter.source)
            .filter((item) => !search || `${item.targetName} ${item.reason ?? ""} ${item.number}`.toLowerCase().includes(search))
            .sort((left, right) => right.number - left.number)
            .slice(0, filter.limit ?? 50);
    }
    async updateCase(id, patch) {
        const index = this.cases.findIndex((item) => item.id === id);
        const current = this.cases[index];
        if (!current)
            throw new ModerationError("NOT_FOUND", "Case was not found.");
        const next = { ...current, updatedAt: this.now() };
        for (const [key, value] of Object.entries(patch)) {
            if (value === null)
                delete next[key];
            else if (value !== undefined)
                next[key] = value;
        }
        const updated = next;
        this.cases[index] = updated;
        return updated;
    }
    async listExpired(types, now) {
        return this.cases.filter((item) => types.includes(item.type) && item.active && item.expiresAt !== undefined && item.expiresAt <= now);
    }
    async countActiveWarnings(guildId, targetId, since) {
        return this.cases.filter((item) => item.guildId === guildId && item.targetId === targetId && item.type === "WARN" && item.active && !item.revokedAt && (!since || item.createdAt >= since)).length;
    }
    async stats(guildId, now) {
        const cases = this.cases.filter((item) => item.guildId === guildId);
        const byType = {};
        for (const item of cases)
            byType[item.type] = (byType[item.type] ?? 0) + 1;
        return {
            total: cases.length,
            last7Days: cases.filter((item) => now.getTime() - item.createdAt.getTime() < 7 * 86_400_000).length,
            byType,
            activeBans: cases.filter((item) => item.type === "BAN" && item.active).length,
            activeTimeouts: cases.filter((item) => item.type === "TIMEOUT" && item.active).length,
            topModerators: [],
            automodActions: cases.filter((item) => item.source === "AUTOMOD").length,
        };
    }
}
//# sourceMappingURL=InMemoryModerationRepository.js.map