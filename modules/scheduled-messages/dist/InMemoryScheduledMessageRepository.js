import { randomUUID } from "node:crypto";
import { ScheduledMessageError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryScheduledMessageRepository {
    now;
    messages = [];
    runsList = [];
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async create(input) {
        const now = this.now();
        const created = { ...input, id: randomUUID(), runCount: 0, createdAt: now, updatedAt: now };
        this.messages.push(created);
        return created;
    }
    async get(guildId, id) {
        return this.messages.find((item) => item.guildId === guildId && item.id === id);
    }
    async findByName(guildId, name) {
        return this.messages.find((item) => item.guildId === guildId && item.name.toLowerCase() === name.toLowerCase());
    }
    async list(guildId) {
        return this.messages.filter((item) => item.guildId === guildId).sort((left, right) => left.name.localeCompare(right.name));
    }
    async count(guildId) {
        return this.messages.filter((item) => item.guildId === guildId).length;
    }
    async update(id, patch) {
        const index = this.messages.findIndex((item) => item.id === id);
        const current = this.messages[index];
        if (!current)
            throw new ScheduledMessageError("NOT_FOUND", "That scheduled message was not found.");
        const next = { ...current, updatedAt: this.now() };
        for (const [key, value] of Object.entries(patch)) {
            if (value === null)
                delete next[key];
            else if (value !== undefined)
                next[key] = value;
        }
        const updated = next;
        this.messages[index] = updated;
        return updated;
    }
    async delete(id) {
        const index = this.messages.findIndex((item) => item.id === id);
        if (index >= 0)
            this.messages.splice(index, 1);
    }
    async listDue(now, limit) {
        return this.messages.filter((item) => item.enabled && item.nextRunAt !== undefined && item.nextRunAt <= now).slice(0, limit);
    }
    async claim(id, expected, next, runCount) {
        const current = this.messages.find((item) => item.id === id);
        if (!current?.nextRunAt || current.nextRunAt.getTime() !== expected.getTime())
            return false;
        await this.update(id, { nextRunAt: next ?? null, runCount });
        return true;
    }
    async addRun(input) {
        const run = { ...input, id: randomUUID() };
        this.runsList.push(run);
        return run;
    }
    async listRuns(guildId, messageId, limit = 50) {
        return this.runsList
            .filter((run) => run.guildId === guildId && (!messageId || run.messageId === messageId))
            .sort((left, right) => right.ranAt.getTime() - left.ranAt.getTime())
            .slice(0, limit);
    }
}
//# sourceMappingURL=InMemoryScheduledMessageRepository.js.map