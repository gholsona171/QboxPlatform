import { randomUUID } from "node:crypto";
import { ApplicationError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryApplicationRepository {
    now;
    forms = [];
    panels = [];
    applications = [];
    counters = new Map();
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async listForms(guildId) {
        return this.forms.filter((form) => form.guildId === guildId);
    }
    async getForm(guildId, id) {
        return this.forms.find((form) => form.guildId === guildId && form.id === id);
    }
    async createForm(input) {
        const { expectedRevision: _expected, ...rest } = input;
        const now = this.now();
        const form = { ...rest, id: randomUUID(), revision: 1, createdAt: now, updatedAt: now };
        this.forms.push(form);
        return form;
    }
    async updateForm(id, input) {
        const index = this.forms.findIndex((form) => form.id === id);
        const current = this.forms[index];
        if (!current)
            throw new ApplicationError("NOT_FOUND", "That application form was not found.");
        if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
            throw new ApplicationError("CONFLICT", "This form changed since it was loaded.", { currentRevision: current.revision });
        const { expectedRevision: _expected, ...rest } = input;
        const updated = { ...rest, id, revision: current.revision + 1, createdAt: current.createdAt, updatedAt: this.now() };
        this.forms[index] = updated;
        return updated;
    }
    async deleteForm(guildId, id) {
        const index = this.forms.findIndex((form) => form.guildId === guildId && form.id === id);
        if (index >= 0)
            this.forms.splice(index, 1);
        for (const [position, application] of this.applications.entries())
            if (application.formId === id)
                this.applications[position] = { ...application, formId: undefined };
    }
    async listPanels(guildId) {
        return this.panels.filter((panel) => panel.guildId === guildId);
    }
    async getPanel(guildId, id) {
        return this.panels.find((panel) => panel.guildId === guildId && panel.id === id);
    }
    async createPanel(input) {
        const now = this.now();
        const panel = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
        this.panels.push(panel);
        return panel;
    }
    async updatePanel(id, input) {
        return this.patchPanel(id, { ...input });
    }
    async setPanelMessage(id, messageId) {
        return this.patchPanel(id, { messageId: messageId ?? undefined });
    }
    async deletePanel(guildId, id) {
        const index = this.panels.findIndex((panel) => panel.guildId === guildId && panel.id === id);
        if (index >= 0)
            this.panels.splice(index, 1);
    }
    async allocateNumber(guildId) {
        const next = (this.counters.get(guildId) ?? 0) + 1;
        this.counters.set(guildId, next);
        return next;
    }
    async createApplication(input) {
        const now = this.now();
        const created = { ...input, id: randomUUID(), status: "PENDING", votes: [], notes: [], createdAt: now, updatedAt: now };
        this.applications.push(created);
        return created;
    }
    async getApplication(guildId, id) {
        return this.applications.find((item) => item.guildId === guildId && item.id === id);
    }
    async getApplicationByNumber(guildId, number) {
        return this.applications.find((item) => item.guildId === guildId && item.number === number);
    }
    async listApplications(filter) {
        const search = filter.search?.toLowerCase().replace(/^#/, "");
        return this.applications
            .filter((item) => item.guildId === filter.guildId)
            .filter((item) => !filter.statuses || filter.statuses.includes(item.status))
            .filter((item) => !filter.formIds || (item.formId !== undefined && filter.formIds.includes(item.formId)))
            .filter((item) => !filter.applicantId || item.applicantId === filter.applicantId)
            .filter((item) => !search || `${item.applicantName} ${item.applicantId} ${item.formName} ${item.number}`.toLowerCase().includes(search))
            .sort((left, right) => right.number - left.number)
            .slice(0, filter.limit ?? 50);
    }
    async updateApplication(id, patch) {
        const index = this.applications.findIndex((item) => item.id === id);
        const current = this.applications[index];
        if (!current)
            throw new ApplicationError("NOT_FOUND", "That application was not found.");
        const next = { ...current, updatedAt: this.now() };
        for (const [key, value] of Object.entries(patch)) {
            if (value === null)
                delete next[key];
            else if (value !== undefined)
                next[key] = value;
        }
        const updated = next;
        this.applications[index] = updated;
        return updated;
    }
    async setVote(applicationId, userId, vote) {
        return this.replace(applicationId, (current) => ({
            ...current,
            votes: [...current.votes.filter((item) => item.userId !== userId), ...(vote ? [{ userId, vote, createdAt: this.now() }] : [])],
        }));
    }
    async addNote(applicationId, authorId, authorName, body) {
        return this.replace(applicationId, (current) => ({
            ...current,
            notes: [...current.notes, { id: randomUUID(), authorId, authorName, body, createdAt: this.now() }],
        }));
    }
    async listForApplicant(guildId, formId, applicantId) {
        return this.applications
            .filter((item) => item.guildId === guildId && item.formId === formId && item.applicantId === applicantId)
            .sort((left, right) => right.number - left.number);
    }
    async stats(guildId, now) {
        const items = this.applications.filter((item) => item.guildId === guildId);
        const count = (status, list = items) => list.filter((item) => item.status === status).length;
        const byForm = new Map();
        for (const item of items)
            byForm.set(item.formName, [...(byForm.get(item.formName) ?? []), item]);
        const decided = items.filter((item) => item.decidedAt && (item.status === "ACCEPTED" || item.status === "DENIED"));
        return {
            total: items.length,
            last7Days: items.filter((item) => now.getTime() - item.createdAt.getTime() < 7 * 86_400_000).length,
            byStatus: { PENDING: count("PENDING"), ACCEPTED: count("ACCEPTED"), DENIED: count("DENIED"), WITHDRAWN: count("WITHDRAWN") },
            byForm: [...byForm.entries()].map(([formName, list]) => ({
                formId: list[0]?.formId,
                formName,
                total: list.length,
                pending: count("PENDING", list),
                accepted: count("ACCEPTED", list),
                denied: count("DENIED", list),
            })),
            averageReviewMinutes: decided.length
                ? Math.round(decided.reduce((sum, item) => sum + ((item.decidedAt?.getTime() ?? 0) - item.createdAt.getTime()), 0) / decided.length / 60_000)
                : undefined,
        };
    }
    patchPanel(id, patch) {
        const index = this.panels.findIndex((panel) => panel.id === id);
        const current = this.panels[index];
        if (!current)
            throw new ApplicationError("NOT_FOUND", "That panel was not found.");
        const next = { ...current, ...patch, updatedAt: this.now() };
        if (next.messageId === undefined)
            delete next.messageId;
        const updated = next;
        this.panels[index] = updated;
        return updated;
    }
    replace(id, change) {
        const index = this.applications.findIndex((item) => item.id === id);
        const current = this.applications[index];
        if (!current)
            throw new ApplicationError("NOT_FOUND", "That application was not found.");
        const updated = { ...change(current), updatedAt: this.now() };
        this.applications[index] = updated;
        return updated;
    }
}
//# sourceMappingURL=InMemoryApplicationRepository.js.map