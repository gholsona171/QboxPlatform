import { type ArticleCreateData, type ArticleFilter, type ArticlePatch, type CategoryInput, type KnowledgeArticle, type KnowledgeCategory, type KnowledgeRepository, type KnowledgeSettings, type KnowledgeSettingsInput } from "@qbox/knowledge-base";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "knowledgeSettings" | "knowledgeCategory" | "knowledgeArticle">;
/** PostgreSQL knowledge base settings, categories, and articles. `guildId` is the Discord guild ID. */
export declare class PrismaKnowledgeRepository implements KnowledgeRepository {
    private readonly client;
    constructor(client: Client);
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
export {};
//# sourceMappingURL=PrismaKnowledgeRepository.d.ts.map