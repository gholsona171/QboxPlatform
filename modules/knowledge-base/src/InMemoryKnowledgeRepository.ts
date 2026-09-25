import { randomUUID } from "node:crypto";

import { defaultKnowledgeSettings } from "./KnowledgeService.js";
import type {
  ArticleCreateData,
  ArticleFilter,
  ArticlePatch,
  CategoryInput,
  KnowledgeArticle,
  KnowledgeCategory,
  KnowledgeRepository,
  KnowledgeSettings,
  KnowledgeSettingsInput,
} from "./types.js";
import { KnowledgeError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryKnowledgeRepository implements KnowledgeRepository {
  public readonly settingsByGuild = new Map<string, KnowledgeSettings>();
  public readonly categories: KnowledgeCategory[] = [];
  public readonly articles: KnowledgeArticle[] = [];

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async getSettings(guildId: string): Promise<KnowledgeSettings | undefined> {
    return this.settingsByGuild.get(guildId);
  }

  public async saveSettings(input: KnowledgeSettingsInput): Promise<KnowledgeSettings> {
    const current = this.settingsByGuild.get(input.guildId) ?? defaultKnowledgeSettings(input.guildId);
    if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
      throw new KnowledgeError("CONFLICT", "Knowledge base settings changed since they were loaded.", { currentRevision: current.revision });
    const { expectedRevision: _expected, ...rest } = input;
    const saved = { ...rest, revision: current.revision + 1 };
    this.settingsByGuild.set(input.guildId, saved);
    return saved;
  }

  public async listCategories(guildId: string): Promise<readonly KnowledgeCategory[]> {
    return this.categories.filter((item) => item.guildId === guildId).sort((left, right) => left.order - right.order || left.name.localeCompare(right.name));
  }

  public async getCategory(guildId: string, id: string): Promise<KnowledgeCategory | undefined> {
    return this.categories.find((item) => item.guildId === guildId && item.id === id);
  }

  public async createCategory(guildId: string, input: CategoryInput): Promise<KnowledgeCategory> {
    const now = this.now();
    const created: KnowledgeCategory = { id: randomUUID(), guildId, ...input, createdAt: now, updatedAt: now };
    this.categories.push(created);
    return created;
  }

  public async updateCategory(id: string, input: CategoryInput): Promise<KnowledgeCategory> {
    const index = this.categories.findIndex((item) => item.id === id);
    const current = this.categories[index];
    if (!current) throw new KnowledgeError("NOT_FOUND", "That category was not found.");
    const { emoji: _emoji, ...rest } = current;
    const updated: KnowledgeCategory = { ...rest, ...input, updatedAt: this.now() };
    this.categories[index] = updated;
    return updated;
  }

  public async deleteCategory(id: string): Promise<void> {
    const index = this.categories.findIndex((item) => item.id === id);
    if (index >= 0) this.categories.splice(index, 1);
    this.articles.forEach((article, position) => {
      if (article.categoryId !== id) return;
      const { categoryId: _categoryId, ...rest } = article;
      this.articles[position] = rest;
    });
  }

  public async listArticles(filter: ArticleFilter): Promise<readonly KnowledgeArticle[]> {
    const terms = filter.terms?.map((term) => term.toLowerCase());
    return this.articles
      .filter((item) => item.guildId === filter.guildId)
      .filter((item) => filter.published === undefined || item.published === filter.published)
      .filter((item) => !filter.categoryId || item.categoryId === filter.categoryId)
      .filter((item) => !terms?.length || terms.some((term) => `${item.title}\n${item.body}\n${item.tags.join(" ")}`.toLowerCase().includes(term)))
      .sort((left, right) => Number(right.pinned) - Number(left.pinned) || right.updatedAt.getTime() - left.updatedAt.getTime())
      .slice(0, filter.limit ?? 200);
  }

  public async getArticle(guildId: string, id: string): Promise<KnowledgeArticle | undefined> {
    return this.articles.find((item) => item.guildId === guildId && item.id === id);
  }

  public async getArticleBySlug(guildId: string, slug: string): Promise<KnowledgeArticle | undefined> {
    return this.articles.find((item) => item.guildId === guildId && item.slug === slug);
  }

  public async createArticle(input: ArticleCreateData): Promise<KnowledgeArticle> {
    const now = this.now();
    const created: KnowledgeArticle = { ...input, id: randomUUID(), views: 0, createdAt: now, updatedAt: now };
    this.articles.push(created);
    return created;
  }

  public async updateArticle(id: string, patch: ArticlePatch): Promise<KnowledgeArticle> {
    const index = this.articles.findIndex((item) => item.id === id);
    const current = this.articles[index];
    if (!current) throw new KnowledgeError("NOT_FOUND", "That article was not found.");
    const next: Record<string, unknown> = { ...current, updatedAt: this.now() };
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) delete next[key];
      else if (value !== undefined) next[key] = value;
    }
    const updated = next as unknown as KnowledgeArticle;
    this.articles[index] = updated;
    return updated;
  }

  public async deleteArticle(id: string): Promise<void> {
    const index = this.articles.findIndex((item) => item.id === id);
    if (index >= 0) this.articles.splice(index, 1);
  }

  public async incrementViews(id: string): Promise<void> {
    const index = this.articles.findIndex((item) => item.id === id);
    const current = this.articles[index];
    if (current) this.articles[index] = { ...current, views: current.views + 1 };
  }
}
