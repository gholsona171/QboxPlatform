import { randomUUID } from "node:crypto";
import { GiveawayError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryGiveawayRepository {
    now;
    giveaways = [];
    entries = [];
    counters = new Map();
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async allocateNumber(guildId) {
        const next = (this.counters.get(guildId) ?? 0) + 1;
        this.counters.set(guildId, next);
        return next;
    }
    async create(data) {
        const now = this.now();
        const giveaway = { ...data, id: randomUUID(), status: "RUNNING", winnerIds: [], createdAt: now, updatedAt: now };
        this.giveaways.push(giveaway);
        return giveaway;
    }
    async get(guildId, id) {
        return this.giveaways.find((giveaway) => giveaway.guildId === guildId && giveaway.id === id);
    }
    async findById(id) {
        return this.giveaways.find((giveaway) => giveaway.id === id);
    }
    async getByNumber(guildId, number) {
        return this.giveaways.find((giveaway) => giveaway.guildId === guildId && giveaway.number === number);
    }
    async list(filter) {
        return this.giveaways
            .filter((giveaway) => giveaway.guildId === filter.guildId && (!filter.statuses || filter.statuses.includes(giveaway.status)))
            .sort((left, right) => right.number - left.number)
            .slice(0, filter.limit ?? 50);
    }
    async update(id, patch) {
        const index = this.giveaways.findIndex((giveaway) => giveaway.id === id);
        const current = this.giveaways[index];
        if (!current)
            throw new GiveawayError("NOT_FOUND", "That giveaway was not found.");
        const next = { ...current, updatedAt: this.now() };
        for (const [key, value] of Object.entries(patch)) {
            if (value === null)
                delete next[key];
            else if (value !== undefined)
                next[key] = value;
        }
        const updated = next;
        this.giveaways[index] = updated;
        return updated;
    }
    async delete(id) {
        const index = this.giveaways.findIndex((giveaway) => giveaway.id === id);
        if (index >= 0)
            this.giveaways.splice(index, 1);
        for (let at = this.entries.length - 1; at >= 0; at -= 1)
            if (this.entries[at]?.giveawayId === id)
                this.entries.splice(at, 1);
    }
    async listDue(now) {
        return this.giveaways.filter((giveaway) => giveaway.status === "RUNNING" && giveaway.endsAt <= now);
    }
    async addEntry(giveawayId, userId, userName, entries) {
        const existing = this.entries.find((entry) => entry.giveawayId === giveawayId && entry.userId === userId);
        if (existing)
            return existing;
        const entry = { giveawayId, userId, userName, entries, createdAt: this.now() };
        this.entries.push(entry);
        return entry;
    }
    async removeEntry(giveawayId, userId) {
        const index = this.entries.findIndex((entry) => entry.giveawayId === giveawayId && entry.userId === userId);
        if (index < 0)
            return false;
        this.entries.splice(index, 1);
        return true;
    }
    async listEntries(giveawayId) {
        return this.entries.filter((entry) => entry.giveawayId === giveawayId);
    }
    async countEntrants(giveawayIds) {
        return new Map(giveawayIds.map((id) => [id, this.entries.filter((entry) => entry.giveawayId === id).length]));
    }
}
//# sourceMappingURL=InMemoryGiveawayRepository.js.map