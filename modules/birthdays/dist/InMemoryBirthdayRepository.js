import { randomUUID } from "node:crypto";
import { defaultBirthdaySettings } from "./BirthdayService.js";
import { BirthdayError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryBirthdayRepository {
    now;
    settingsByGuild = new Map();
    birthdays = [];
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async getSettings(guildId) {
        return this.settingsByGuild.get(guildId);
    }
    async saveSettings(input) {
        const current = this.settingsByGuild.get(input.guildId) ?? defaultBirthdaySettings(input.guildId);
        if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
            throw new BirthdayError("CONFLICT", "Birthday settings changed since they were loaded.", { currentRevision: current.revision });
        const { expectedRevision: _expected, ...rest } = input;
        const saved = { ...rest, revision: current.revision + 1 };
        this.settingsByGuild.set(input.guildId, saved);
        return saved;
    }
    async listEnabledSettings() {
        return [...this.settingsByGuild.values()].filter((settings) => settings.enabled);
    }
    async upsert(input) {
        const index = this.birthdays.findIndex((item) => item.guildId === input.guildId && item.userId === input.userId);
        const current = this.birthdays[index];
        const now = this.now();
        const sameDate = current && current.month === input.month && current.day === input.day;
        const saved = {
            id: current?.id ?? randomUUID(),
            createdAt: current?.createdAt ?? now,
            ...input,
            ...(sameDate && current.lastAnnouncedYear !== undefined ? { lastAnnouncedYear: current.lastAnnouncedYear } : {}),
            ...(current?.grantedRoleId ? { grantedRoleId: current.grantedRoleId } : {}),
            ...(current?.roleRemoveAt ? { roleRemoveAt: current.roleRemoveAt } : {}),
            updatedAt: now,
        };
        if (current)
            this.birthdays[index] = saved;
        else
            this.birthdays.push(saved);
        return saved;
    }
    async get(guildId, userId) {
        return this.birthdays.find((item) => item.guildId === guildId && item.userId === userId);
    }
    async remove(guildId, userId) {
        const index = this.birthdays.findIndex((item) => item.guildId === guildId && item.userId === userId);
        return index < 0 ? undefined : this.birthdays.splice(index, 1)[0];
    }
    async list(guildId, search) {
        const term = search?.toLowerCase();
        return this.birthdays.filter((item) => item.guildId === guildId && (!term || item.displayName.toLowerCase().includes(term) || item.userId === term));
    }
    async listOnDates(guildId, dates) {
        return this.birthdays.filter((item) => item.guildId === guildId && dates.some((date) => date.month === item.month && date.day === item.day));
    }
    async listRoleExpired(now) {
        return this.birthdays.filter((item) => item.roleRemoveAt !== undefined && item.roleRemoveAt <= now);
    }
    async update(id, patch) {
        const index = this.birthdays.findIndex((item) => item.id === id);
        const current = this.birthdays[index];
        if (!current)
            throw new BirthdayError("NOT_FOUND", "Birthday was not found.");
        const next = { ...current, updatedAt: this.now() };
        for (const [key, value] of Object.entries(patch)) {
            if (value === null)
                delete next[key];
            else if (value !== undefined)
                next[key] = value;
        }
        const updated = next;
        this.birthdays[index] = updated;
        return updated;
    }
}
//# sourceMappingURL=InMemoryBirthdayRepository.js.map