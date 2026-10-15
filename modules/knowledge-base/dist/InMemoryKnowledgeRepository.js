import { randomUUID } from "node:crypto";
import { defaultKnowledgeSettings } from "./KnowledgeService.js";
import { KnowledgeError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryKnowledgeRepository {
    now;
    settingsByGuild = new Map();
    categories = [];
    articles = [];
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async getSettings(guildId) {
        return this.settingsByGuild.get(guildId);
    }
    async saveSettings(input) {
        const current = this.settingsByGuild.get(input.guildId) ?? defaultKnowledgeSettings(input.guildId);
        if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
            throw new KnowledgeError("CONFLICT", "Knowledge base settings changed since they were loaded.", { currentRevision: current.revision });
        const { expectedRevision: _expected, ...rest } = input;
        const saved = { ...rest, revision: current.revision + 1 };
        this.settingsByGuild.set(input.guildId, saved);
        return saved;
    }
    async listCategories(guildId) {
        return this.categories.filter((item) => item.guildId === guildId).sort((left, right) => left.order - right.order || left.name.localeCompare(right.name));
    }
    async getCategory(guildId, id) {
        return this.categories.find((item) => item.guildId === guildId && item.id === id);
    }
    async createCategory(guildId, input) {
        const now = this.now();
        const created = { id: randomUUID(), guildId, ...input, createdAt: now, updatedAt: now };
        this.categories.push(created);
        return created;
    }
    async updateCategory(id, input) {
        const index = this.categories.findIndex((item) => item.id === id);
        const current = this.categories[index];
        if (!current)
            throw new KnowledgeError("NOT_FOUND", "That category was not found.");
        const { emoji: _emoji, ...rest } = current;
        const updated = { ...rest, ...input, updatedAt: this.now() };
        this.categories[index] = updated;
        return updated;
    }
    async deleteCategory(id) {
        const index = this.categories.findIndex((item) => item.id === id);
        if (index >= 0)
            this.categories.splice(index, 1);
        this.articles.forEach((article, position) => {
            if (article.categoryId !== id)
                return;
            const { categoryId: _categoryId, ...rest } = article;
            this.articles[position] = rest;
        });
    }
    async listArticles(filter) {
        const terms = filter.terms?.map((term) => term.toLowerCase());
        return this.articles
            .filter((item) => item.guildId === filter.guildId)
            .filter((item) => filter.published === undefined || item.published === filter.published)
            .filter((item) => !filter.categoryId || item.categoryId === filter.categoryId)
            .filter((item) => !terms?.length || terms.some((term) => `${item.title}\n${item.body}\n${item.tags.join(" ")}`.toLowerCase().includes(term)))
            .sort((left, right) => Number(right.pinned) - Number(left.pinned) || right.updatedAt.getTime() - left.updatedAt.getTime())
            .slice(0, filter.limit ?? 200);
    }
    async getArticle(guildId, id) {
        return this.articles.find((item) => item.guildId === guildId && item.id === id);
    }
    async getArticleBySlug(guildId, slug) {
        return this.articles.find((item) => item.guildId === guildId && item.slug === slug);
    }
    async createArticle(input) {
        const now = this.now();
        const created = { ...input, id: randomUUID(), views: 0, createdAt: now, updatedAt: now };
        this.articles.push(created);
        return created;
    }
    async updateArticle(id, patch) {
        const index = this.articles.findIndex((item) => item.id === id);
        const current = this.articles[index];
        if (!current)
            throw new KnowledgeError("NOT_FOUND", "That article was not found.");
        const next = { ...current, updatedAt: this.now() };
        for (const [key, value] of Object.entries(patch)) {
            if (value === null)
                delete next[key];
            else if (value !== undefined)
                next[key] = value;
        }
        const updated = next;
        this.articles[index] = updated;
        return updated;
    }
    async deleteArticle(id) {
        const index = this.articles.findIndex((item) => item.id === id);
        if (index >= 0)
            this.articles.splice(index, 1);
    }
    async incrementViews(id) {
        const index = this.articles.findIndex((item) => item.id === id);
        const current = this.articles[index];
        if (current)
            this.articles[index] = { ...current, views: current.views + 1 };
    }
}
//# sourceMappingURL=InMemoryKnowledgeRepository.js.map