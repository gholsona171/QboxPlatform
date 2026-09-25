import { rankArticles, searchTerms } from "./search.js";
import type {
  ArticleInput,
  CategoryInput,
  KnowledgeAnswer,
  KnowledgeAnswerer,
  KnowledgeArticle,
  KnowledgeCategory,
  KnowledgeEditor,
  KnowledgeEmbed,
  KnowledgeGateway,
  KnowledgeMessage,
  KnowledgeRepository,
  KnowledgeSettings,
  KnowledgeSettingsInput,
  SearchResult,
} from "./types.js";
import {
  KnowledgeError,
  MAX_ARTICLES,
  MAX_CATEGORIES,
  invalid,
  requireLength,
  requireSnowflake,
  slugify,
  validateArticle,
  validateCategory,
  validateSettings,
} from "./validation.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COLOR = "#5865F2";
const DESCRIPTION_LIMIT = 4000;
/** Auto-answers need at least this many search words, so "hi" or "ok" never match. */
const MIN_AUTO_ANSWER_TERMS = 2;

export interface SearchOptions {
  /** Include drafts (staff only). */
  readonly includeDrafts?: boolean | undefined;
  readonly categoryId?: string | undefined;
  readonly limit?: number | undefined;
}

export function defaultKnowledgeSettings(guildId: string): KnowledgeSettings {
  return { guildId, autoAnswerEnabled: false, autoAnswerChannelIds: [], autoAnswerThreshold: 70, autoAnswerCooldownSeconds: 300, revision: 0 };
}

/** Discord embed for an article. Long articles are cut with a note. */
export function articleEmbed(article: KnowledgeArticle, category?: KnowledgeCategory): KnowledgeEmbed {
  const body = article.body.length > DESCRIPTION_LIMIT ? `${article.body.slice(0, DESCRIPTION_LIMIT - 40).trimEnd()}\n\n*…read the rest in the portal.*` : article.body;
  return {
    title: article.title.slice(0, 256),
    description: body,
    color: COLOR,
    ...(article.tags.length ? { fields: [{ name: "Tags", value: article.tags.map((tag) => `\`${tag}\``).join(" ").slice(0, 1024), inline: true }] } : {}),
    footer: `${category ? `${category.emoji ? `${category.emoji} ` : ""}${category.name} · ` : ""}Updated ${article.updatedAt.toISOString().slice(0, 10)}`,
  };
}

/**
 * Knowledge base rules shared by the bot and the API: categories, articles,
 * ranked keyword search, automatic answers, and optional AI answers.
 * Permission checks happen before the service is called.
 */
export class KnowledgeService {
  private readonly lastAutoAnswer = new Map<string, number>();

  public constructor(
    private readonly repository: KnowledgeRepository,
    private readonly gateway?: KnowledgeGateway,
    private readonly answerer?: KnowledgeAnswerer,
    private readonly now: () => Date = () => new Date(),
  ) {}

  public async settings(guildId: string): Promise<KnowledgeSettings> {
    requireSnowflake("guildId", guildId);
    return (await this.repository.getSettings(guildId)) ?? defaultKnowledgeSettings(guildId);
  }

  public async saveSettings(input: KnowledgeSettingsInput): Promise<KnowledgeSettings> {
    validateSettings(input);
    return this.repository.saveSettings({ ...input, autoAnswerChannelIds: [...new Set(input.autoAnswerChannelIds)] });
  }

  /* ---------- Categories ---------- */

  public async categories(guildId: string): Promise<readonly KnowledgeCategory[]> {
    requireSnowflake("guildId", guildId);
    return this.repository.listCategories(guildId);
  }

  public async createCategory(guildId: string, input: CategoryInput): Promise<KnowledgeCategory> {
    requireSnowflake("guildId", guildId);
    validateCategory(input);
    if ((await this.repository.listCategories(guildId)).length >= MAX_CATEGORIES)
      throw new KnowledgeError("LIMIT_REACHED", `You can have at most ${MAX_CATEGORIES} categories.`);
    return this.repository.createCategory(guildId, cleanCategory(input));
  }

  public async updateCategory(guildId: string, id: string, input: CategoryInput): Promise<KnowledgeCategory> {
    validateCategory(input);
    const category = await this.category(guildId, id);
    return this.repository.updateCategory(category.id, cleanCategory(input));
  }

  public async deleteCategory(guildId: string, id: string): Promise<void> {
    const category = await this.category(guildId, id);
    await this.repository.deleteCategory(category.id);
  }

  /* ---------- Articles ---------- */

  /** Articles, pinned first then newest. Members only see published ones. */
  public async list(guildId: string, options: SearchOptions = {}): Promise<readonly KnowledgeArticle[]> {
    requireSnowflake("guildId", guildId);
    return this.repository.listArticles({
      guildId,
      ...(options.includeDrafts ? {} : { published: true }),
      ...(options.categoryId ? { categoryId: options.categoryId } : {}),
      limit: Math.min(Math.max(options.limit ?? 200, 1), 500),
    });
  }

  /** Ranked keyword search: title matches beat tag matches beat body matches. */
  public async search(guildId: string, query: string, options: SearchOptions = {}): Promise<readonly SearchResult[]> {
    requireSnowflake("guildId", guildId);
    const terms = searchTerms(query);
    if (terms.length === 0) return [];
    const candidates = await this.repository.listArticles({
      guildId,
      ...(options.includeDrafts ? {} : { published: true }),
      ...(options.categoryId ? { categoryId: options.categoryId } : {}),
      // Shorten long words so "restarts" also finds "restart" in the database prefilter.
      terms: terms.map((term) => (term.length > 5 ? term.slice(0, -2) : term)),
      limit: 300,
    });
    return rankArticles(candidates, query).slice(0, Math.min(Math.max(options.limit ?? 25, 1), 100));
  }

  /** Article by ID or slug. Drafts are hidden unless `includeDrafts`. */
  public async article(guildId: string, idOrSlug: string, includeDrafts = false): Promise<KnowledgeArticle> {
    requireSnowflake("guildId", guildId);
    const found = UUID.test(idOrSlug) ? await this.repository.getArticle(guildId, idOrSlug) : await this.repository.getArticleBySlug(guildId, idOrSlug.toLowerCase());
    if (!found || (!found.published && !includeDrafts)) throw new KnowledgeError("NOT_FOUND", "That article was not found.");
    return found;
  }

  /**
   * Finds the article a member asked for: an exact ID or slug, otherwise the
   * best search match. With `countView`, records a view.
   */
  public async find(guildId: string, query: string, countView = false): Promise<KnowledgeArticle> {
    const text = query.trim();
    if (!text) invalid("Type what you are looking for.");
    const found = (await this.article(guildId, text).catch(() => undefined)) ?? (await this.search(guildId, text, { limit: 1 }))[0]?.article;
    if (!found) throw new KnowledgeError("NOT_FOUND", `No article matches "${text.slice(0, 100)}".`);
    if (!countView) return found;
    await this.repository.incrementViews(found.id);
    return { ...found, views: found.views + 1 };
  }

  /** Records a view of a published article and returns it. */
  public async view(guildId: string, idOrSlug: string): Promise<KnowledgeArticle> {
    const found = await this.article(guildId, idOrSlug);
    await this.repository.incrementViews(found.id);
    return { ...found, views: found.views + 1 };
  }

  /** Up to 25 title suggestions for Discord autocomplete. */
  public async suggest(guildId: string, query: string, includeDrafts = false): Promise<readonly KnowledgeArticle[]> {
    if (!query.trim()) return (await this.list(guildId, { includeDrafts, limit: 25 })).slice(0, 25);
    return (await this.search(guildId, query, { includeDrafts, limit: 25 })).map((result) => result.article);
  }

  public async createArticle(guildId: string, input: ArticleInput, editor: KnowledgeEditor): Promise<KnowledgeArticle> {
    requireSnowflake("guildId", guildId);
    validateArticle(input);
    if ((await this.repository.listArticles({ guildId, limit: MAX_ARTICLES })).length >= MAX_ARTICLES)
      throw new KnowledgeError("LIMIT_REACHED", `You can have at most ${MAX_ARTICLES} articles.`);
    if (input.categoryId) await this.category(guildId, input.categoryId);
    const slug = await this.uniqueSlug(guildId, input.slug || slugify(input.title));
    return this.repository.createArticle({
      guildId,
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      title: input.title.trim(),
      slug,
      body: input.body.trim(),
      tags: cleanTags(input.tags),
      published: input.published,
      pinned: input.pinned,
      authorId: editor.userId,
      authorName: editor.displayName,
    });
  }

  public async updateArticle(guildId: string, id: string, input: ArticleInput, editor: KnowledgeEditor): Promise<KnowledgeArticle> {
    validateArticle(input);
    const current = await this.article(guildId, id, true);
    if (input.categoryId) await this.category(guildId, input.categoryId);
    const wanted = input.slug || current.slug;
    const slug = wanted === current.slug ? current.slug : await this.uniqueSlug(guildId, wanted);
    return this.repository.updateArticle(current.id, {
      categoryId: input.categoryId ?? null,
      title: input.title.trim(),
      slug,
      body: input.body.trim(),
      tags: cleanTags(input.tags),
      published: input.published,
      pinned: input.pinned,
      updatedById: editor.userId,
      updatedByName: editor.displayName,
    });
  }

  public async deleteArticle(guildId: string, id: string): Promise<void> {
    const current = await this.article(guildId, id, true);
    await this.repository.deleteArticle(current.id);
  }

  /** Posts a published article publicly in a channel. */
  public async post(guildId: string, idOrSlug: string, channelId: string): Promise<{ readonly messageId: string }> {
    requireSnowflake("channelId", channelId);
    const found = await this.article(guildId, idOrSlug);
    if (!this.gateway) throw new KnowledgeError("DEPENDENCY_UNAVAILABLE", "Discord is not connected.");
    const category = found.categoryId ? await this.repository.getCategory(guildId, found.categoryId) : undefined;
    return this.gateway.postEmbed(channelId, articleEmbed(found, category));
  }

  public async categoryOf(article: KnowledgeArticle): Promise<KnowledgeCategory | undefined> {
    return article.categoryId ? this.repository.getCategory(article.guildId, article.categoryId) : undefined;
  }

  /**
   * Answers a question. With AI configured, the top 3 matching articles are
   * sent as context; otherwise (or if the AI call fails) the best article is
   * returned as the answer.
   */
  public async ask(guildId: string, question: string): Promise<KnowledgeAnswer> {
    requireLength("Question", question.trim(), 3, 500);
    const sources = (await this.search(guildId, question, { limit: 3 })).map((result) => result.article);
    if (sources.length === 0) return { sources: [], ai: false };
    if (this.answerer) {
      try {
        return { text: await this.answerer.answer(question.trim(), sources), sources, ai: true };
      } catch {
        // Fall back to the best article below.
      }
    }
    return { sources: sources.slice(0, 1), ai: false };
  }

  /**
   * Replies with a suggested article when a message in an auto-answer channel
   * closely matches one. Returns the suggestion, if any.
   */
  public async handleMessage(message: KnowledgeMessage): Promise<SearchResult | undefined> {
    if (!this.gateway || message.content.length < 8) return undefined;
    const settings = await this.settings(message.guildId);
    if (!settings.autoAnswerEnabled || !settings.autoAnswerChannelIds.includes(message.channelId)) return undefined;
    if (searchTerms(message.content).length < MIN_AUTO_ANSWER_TERMS) return undefined;
    const now = this.now().getTime();
    const last = this.lastAutoAnswer.get(message.channelId);
    if (last !== undefined && now - last < settings.autoAnswerCooldownSeconds * 1000) return undefined;
    const best = (await this.search(message.guildId, message.content, { limit: 1 }))[0];
    if (!best || best.match < settings.autoAnswerThreshold) return undefined;
    this.lastAutoAnswer.set(message.channelId, now);
    await this.repository.incrementViews(best.article.id);
    await this.gateway.replyEmbed(message.channelId, message.messageId, "This article might help:", articleEmbed(best.article, await this.categoryOf(best.article)));
    return best;
  }

  private async category(guildId: string, id: string): Promise<KnowledgeCategory> {
    requireSnowflake("guildId", guildId);
    const found = UUID.test(id) ? await this.repository.getCategory(guildId, id) : undefined;
    if (!found) throw new KnowledgeError("NOT_FOUND", "That category was not found.");
    return found;
  }

  private async uniqueSlug(guildId: string, base: string): Promise<string> {
    for (let attempt = 1; attempt <= 50; attempt += 1) {
      const candidate = attempt === 1 ? base : `${base.slice(0, 75)}-${attempt}`;
      if (!(await this.repository.getArticleBySlug(guildId, candidate))) return candidate;
    }
    throw new KnowledgeError("CONFLICT", "Choose a different slug; this one is taken.");
  }
}

function cleanCategory(input: CategoryInput): CategoryInput {
  const emoji = input.emoji?.trim();
  return { name: input.name.trim(), ...(emoji ? { emoji } : {}), order: input.order };
}

function cleanTags(tags: readonly string[]): readonly string[] {
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}
