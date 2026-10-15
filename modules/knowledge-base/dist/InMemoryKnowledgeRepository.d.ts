import type { ArticleCreateData, ArticleFilter, ArticlePatch, CategoryInput, KnowledgeArticle, KnowledgeCategory, KnowledgeRepository, KnowledgeSettings, KnowledgeSettingsInput } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryKnowledgeRepository implements KnowledgeRepository {
    private readonly now;
    readonly settingsByGuild: Map<string, KnowledgeSettings>;
    readonly categories: KnowledgeCategory[];
    readonly articles: KnowledgeArticle[];
    constructor(now?: () => Date);
    getSettings(guildId: string): Promise<KnowledgeSettings | undefined>;
    saveSettings(input: KnowledgeSettingsInput): Promise<KnowledgeSettings>;
    listCategories(guildId: string): Promise<readonly KnowledgeCategory[]>;
    getCategory(guildId: string, id: string): Promise<KnowledgeCategory | undefined>;
    createCategory(guildId: string, input: CategoryInput): Promise<KnowledgeCategory>;
    updateCategory(id: string, input: CategoryInput): Promise<KnowledgeCategory>;
    deleteCategory(id: string): Promise<void>;
    listArticles(filter: ArticleFilter): Promise<readonly KnowledgeArticle[]>;
    getArticle(guildId: string, id: string): Promise<KnowledgeArticle | undefined>;
    getArticleBySlug(guildId: string, slug: string): Promise<KnowledgeArticle | undefined>;
    createArticle(input: ArticleCreateData): Promise<KnowledgeArticle>;
    updateArticle(id: string, patch: ArticlePatch): Promise<KnowledgeArticle>;
    deleteArticle(id: string): Promise<void>;
    incrementViews(id: string): Promise<void>;
}
//# sourceMappingURL=InMemoryKnowledgeRepository.d.ts.map