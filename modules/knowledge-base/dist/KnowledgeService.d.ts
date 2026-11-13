import type { ArticleInput, CategoryInput, KnowledgeAnswer, KnowledgeAnswerer, KnowledgeArticle, KnowledgeCategory, KnowledgeEditor, KnowledgeEmbed, KnowledgeGateway, KnowledgeMessage, KnowledgeRepository, KnowledgeSettings, KnowledgeSettingsInput, SearchResult } from "./types.js";
export interface SearchOptions {
    /** Include drafts (staff only). */
    readonly includeDrafts?: boolean | undefined;
    readonly categoryId?: string | undefined;
    readonly limit?: number | undefined;
}
export declare function defaultKnowledgeSettings(guildId: string): KnowledgeSettings;
/** Discord embed for an article. Long articles are cut with a note. */
export declare function articleEmbed(article: KnowledgeArticle, category?: KnowledgeCategory): KnowledgeEmbed;
/**
 * Knowledge base rules shared by the bot and the API: categories, articles,
 * ranked keyword search, automatic answers, and optional AI answers.
 * Permission checks happen before the service is called.
 */
export declare class KnowledgeService {
    private readonly repository;
    private readonly gateway?;
    private readonly answerer?;
    private readonly now;
    private readonly lastAutoAnswer;
    constructor(repository: KnowledgeRepository, gateway?: KnowledgeGateway | undefined, answerer?: KnowledgeAnswerer | undefined, now?: () => Date);
    settings(guildId: string): Promise<KnowledgeSettings>;
    saveSettings(input: KnowledgeSettingsInput): Promise<KnowledgeSettings>;
    categories(guildId: string): Promise<readonly KnowledgeCategory[]>;
    createCategory(guildId: string, input: CategoryInput): Promise<KnowledgeCategory>;
    updateCategory(guildId: string, id: string, input: CategoryInput): Promise<KnowledgeCategory>;
    deleteCategory(guildId: string, id: string): Promise<void>;
    /** Articles, pinned first then newest. Members only see published ones. */
    list(guildId: string, options?: SearchOptions): Promise<readonly KnowledgeArticle[]>;
    /** Ranked keyword search: title matches beat tag matches beat body matches. */
    search(guildId: string, query: string, options?: SearchOptions): Promise<readonly SearchResult[]>;
    /** Article by ID or slug. Drafts are hidden unless `includeDrafts`. */
    article(guildId: string, idOrSlug: string, includeDrafts?: boolean): Promise<KnowledgeArticle>;
    /**
     * Finds the article a member asked for: an exact ID or slug, otherwise the
     * best search match. With `countView`, records a view.
     */
    find(guildId: string, query: string, countView?: boolean): Promise<KnowledgeArticle>;
    /** Records a view of a published article and returns it. */
    view(guildId: string, idOrSlug: string): Promise<KnowledgeArticle>;
    /** Up to 25 title suggestions for Discord autocomplete. */
    suggest(guildId: string, query: string, includeDrafts?: boolean): Promise<readonly KnowledgeArticle[]>;
    createArticle(guildId: string, input: ArticleInput, editor: KnowledgeEditor): Promise<KnowledgeArticle>;
    updateArticle(guildId: string, id: string, input: ArticleInput, editor: KnowledgeEditor): Promise<KnowledgeArticle>;
    deleteArticle(guildId: string, id: string): Promise<void>;
    /** Posts a published article publicly in a channel. */
    post(guildId: string, idOrSlug: string, channelId: string): Promise<{
        readonly messageId: string;
    }>;
    categoryOf(article: KnowledgeArticle): Promise<KnowledgeCategory | undefined>;
    /**
     * Answers a question. With AI configured, the top 3 matching articles are
     * sent as context; otherwise (or if the AI call fails) the best article is
     * returned as the answer.
     */
    ask(guildId: string, question: string): Promise<KnowledgeAnswer>;
    /**
     * Replies with a suggested article when a message in an auto-answer channel
     * closely matches one. Returns the suggestion, if any.
     */
    handleMessage(message: KnowledgeMessage): Promise<SearchResult | undefined>;
    private category;
    private uniqueSlug;
}
//# sourceMappingURL=KnowledgeService.d.ts.map