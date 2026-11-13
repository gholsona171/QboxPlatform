import { randomUUID } from "node:crypto";
import { BuilderError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryBuilderRepository {
    now;
    drafts = new Map();
    runList = [];
    items = [];
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async getDraft(guildId) {
        return this.drafts.get(guildId);
    }
    async saveDraft(input) {
        const current = this.drafts.get(input.guildId);
        const revision = current?.revision ?? 0;
        if (input.expectedRevision !== undefined && input.expectedRevision !== revision)
            throw new BuilderError("CONFLICT", "The blueprint changed since it was loaded.", { currentRevision: revision });
        const saved = { guildId: input.guildId, answers: input.answers, blueprint: input.blueprint, revision: revision + 1, updatedAt: this.now(), ...(input.updatedById ? { updatedById: input.updatedById } : {}) };
        this.drafts.set(input.guildId, saved);
        return saved;
    }
    async createRun(input) {
        const now = this.now();
        const run = { ...input, id: randomUUID(), status: "QUEUED", done: 0, skipped: 0, failed: 0, warnings: [], createdAt: now, updatedAt: now };
        this.runList.push(run);
        return run;
    }
    async updateRun(id, patch) {
        const index = this.runList.findIndex((run) => run.id === id);
        const current = this.runList[index];
        if (!current)
            throw new BuilderError("NOT_FOUND", "That build was not found.");
        const next = { ...current, updatedAt: this.now() };
        for (const [key, value] of Object.entries(patch)) {
            if (value === null)
                delete next[key];
            else if (value !== undefined)
                next[key] = value;
        }
        const updated = next;
        this.runList[index] = updated;
        return updated;
    }
    async getRun(guildId, id) {
        return this.runList.find((run) => run.guildId === guildId && run.id === id);
    }
    async listRuns(guildId, limit) {
        return this.runList.filter((run) => run.guildId === guildId).reverse().slice(0, limit);
    }
    async findActiveRun(guildId) {
        return this.runList.find((run) => run.guildId === guildId && (run.status === "QUEUED" || run.status === "RUNNING"));
    }
    async addItem(input) {
        const item = { ...input, id: randomUUID(), createdAt: this.now() };
        this.items.push(item);
        return item;
    }
    async updateItem(id, patch) {
        const index = this.items.findIndex((item) => item.id === id);
        const current = this.items[index];
        if (!current)
            throw new BuilderError("NOT_FOUND", "That build item was not found.");
        const next = { ...current };
        for (const [key, value] of Object.entries(patch)) {
            if (value === null)
                delete next[key];
            else if (value !== undefined)
                next[key] = value;
        }
        const updated = next;
        this.items[index] = updated;
        return updated;
    }
    async listItems(runId) {
        return this.items.filter((item) => item.runId === runId);
    }
    async failActiveRuns(message, now) {
        const active = this.runList.filter((run) => run.status === "QUEUED" || run.status === "RUNNING");
        for (const run of active)
            await this.updateRun(run.id, { status: "FAILED", error: message, finishedAt: now });
        return active.length;
    }
}
//# sourceMappingURL=InMemoryBuilderRepository.js.map