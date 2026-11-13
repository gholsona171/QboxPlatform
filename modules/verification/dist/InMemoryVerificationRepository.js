import { randomUUID } from "node:crypto";
import { defaultVerificationSettings } from "./VerificationService.js";
import { VerificationError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryVerificationRepository {
    settingsByGuild = new Map();
    attemptList = [];
    pending = new Map();
    async getSettings(guildId) {
        return this.settingsByGuild.get(guildId);
    }
    async saveSettings(input) {
        const current = this.settingsByGuild.get(input.guildId) ?? defaultVerificationSettings(input.guildId);
        if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
            throw new VerificationError("CONFLICT", "Verification settings changed since they were loaded.", { currentRevision: current.revision });
        const { expectedRevision: _expected, ...rest } = input;
        const saved = {
            ...rest,
            ...(current.panelChannelId ? { panelChannelId: current.panelChannelId } : {}),
            ...(current.panelMessageId ? { panelMessageId: current.panelMessageId } : {}),
            revision: current.revision + 1,
        };
        this.settingsByGuild.set(input.guildId, saved);
        return saved;
    }
    async setPanelMessage(guildId, channelId, messageId) {
        const current = this.settingsByGuild.get(guildId);
        if (current)
            this.settingsByGuild.set(guildId, { ...current, panelChannelId: channelId, panelMessageId: messageId });
    }
    async listKickEnabled() {
        return [...this.settingsByGuild.values()].filter((item) => item.enabled && item.kickUnverifiedMinutes > 0);
    }
    async recordAttempt(input) {
        const created = { ...input, id: randomUUID() };
        this.attemptList.push(created);
        return created;
    }
    async listAttempts(filter) {
        const search = filter.search?.toLowerCase();
        return this.attemptList
            .filter((item) => item.guildId === filter.guildId)
            .filter((item) => !filter.results || filter.results.includes(item.result))
            .filter((item) => !filter.userId || item.userId === filter.userId)
            .filter((item) => !search || `${item.userName} ${item.userId} ${item.reason ?? ""}`.toLowerCase().includes(search))
            .reverse()
            .slice(0, filter.limit ?? 50);
    }
    async failuresSince(guildId, userId, since) {
        return this.attemptList
            .filter((item) => item.guildId === guildId && item.userId === userId && item.result === "FAILED" && item.createdAt >= since)
            .map((item) => item.createdAt);
    }
    async upsertPending(member) {
        this.pending.set(`${member.guildId}:${member.userId}`, member);
    }
    async getPending(guildId, userId) {
        return this.pending.get(`${guildId}:${userId}`);
    }
    async deletePending(guildId, userId) {
        this.pending.delete(`${guildId}:${userId}`);
    }
    async listPendingBefore(guildId, before, limit) {
        return [...this.pending.values()]
            .filter((item) => item.guildId === guildId && item.joinedAt <= before)
            .sort((left, right) => left.joinedAt.getTime() - right.joinedAt.getTime())
            .slice(0, limit);
    }
    async stats(guildId, since) {
        const attempts = this.attemptList.filter((item) => item.guildId === guildId);
        const recent = attempts.filter((item) => item.createdAt >= since);
        const count = (list, ...results) => list.filter((item) => results.includes(item.result)).length;
        return {
            verified24h: count(recent, "PASSED", "MANUAL"),
            failed24h: count(recent, "FAILED"),
            deniedAge24h: count(recent, "DENIED_AGE"),
            kicked24h: count(recent, "KICKED"),
            verifiedTotal: count(attempts, "PASSED", "MANUAL"),
            pending: [...this.pending.values()].filter((item) => item.guildId === guildId).length,
        };
    }
}
//# sourceMappingURL=InMemoryVerificationRepository.js.map