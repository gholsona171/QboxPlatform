export interface KnowledgeSettings {
  readonly guildId: string;
  /** Reply to messages in `autoAnswerChannelIds` that closely match an article. */
  readonly autoAnswerEnabled: boolean;
  readonly autoAnswerChannelIds: readonly string[];
  /** Minimum match score (1-100) before a suggestion is posted. */
  readonly autoAnswerThreshold: number;
  /** Quiet time per channel after a suggestion. */
  readonly autoAnswerCooldownSeconds: number;
  readonly revision: number;
}

export interface KnowledgeSettingsInput extends Omit<KnowledgeSettings, "revision"> {
  readonly expectedRevision?: number | undefined;
}

export interface KnowledgeCategory {
  readonly id: string;
  readonly guildId: string;
  readonly name: string;
  readonly emoji?: string | undefined;
  readonly order: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CategoryInput {
  readonly name: string;
  readonly emoji?: string | undefined;
  readonly order: number;
}

export interface KnowledgeArticle {
  readonly id: string;
  readonly guildId: string;
  readonly categoryId?: string | undefined;
  readonly title: string;
  readonly slug: string;
  /** Markdown. */
  readonly body: string;
  /** Lowercase tags. */
  readonly tags: readonly string[];
  readonly published: boolean;
  readonly pinned: boolean;
  readonly views: number;
  readonly authorId: string;
  readonly authorName: string;
  readonly updatedById?: string | undefined;
  readonly updatedByName?: string | undefined;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ArticleInput {
  readonly title: string;
  /** Generated from the title when empty. */
  readonly slug?: string | undefined;
  readonly body: string;
  readonly tags: readonly string[];
  readonly categoryId?: string | undefined;
  readonly published: boolean;
  readonly pinned: boolean;
}

export interface ArticleCreateData {
  readonly guildId: string;
  readonly categoryId?: string | undefined;
  readonly title: string;
  readonly slug: string;
  readonly body: string;
  readonly tags: readonly string[];
  readonly published: boolean;
  readonly pinned: boolean;
  readonly authorId: string;
  readonly authorName: string;
}

export interface ArticlePatch {
  readonly categoryId?: string | null;
  readonly title?: string;
  readonly slug?: string;
  readonly body?: string;
  readonly tags?: readonly string[];
  readonly published?: boolean;
  readonly pinned?: boolean;
  readonly updatedById?: string;
  readonly updatedByName?: string;
}

export interface ArticleFilter {
  readonly guildId: string;
  readonly categoryId?: string | undefined;
  readonly published?: boolean | undefined;
  /** Articles whose title, body, or tags contain any of these words (case-insensitive). */
  readonly terms?: readonly string[] | undefined;
  readonly limit?: number | undefined;
}

export interface KnowledgeRepository {
  getSettings(guildId: string): Promise<KnowledgeSettings | undefined>;
  saveSettings(input: KnowledgeSettingsInput): Promise<KnowledgeSettings>;
  listCategories(guildId: string): Promise<readonly KnowledgeCategory[]>;
  getCategory(guildId: string, id: string): Promise<KnowledgeCategory | undefined>;
  createCategory(guildId: string, input: CategoryInput): Promise<KnowledgeCategory>;
  updateCategory(id: string, input: CategoryInput): Promise<KnowledgeCategory>;
  /** Deletes the category; its articles become uncategorized. */
  deleteCategory(id: string): Promise<void>;
  /** Pinned first, then most recently updated. */
  listArticles(filter: ArticleFilter): Promise<readonly KnowledgeArticle[]>;
  getArticle(guildId: string, id: string): Promise<KnowledgeArticle | undefined>;
  getArticleBySlug(guildId: string, slug: string): Promise<KnowledgeArticle | undefined>;
  createArticle(input: ArticleCreateData): Promise<KnowledgeArticle>;
  updateArticle(id: string, patch: ArticlePatch): Promise<KnowledgeArticle>;
  deleteArticle(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
}

export interface KnowledgeEmbed {
  readonly title: string;
  readonly description: string;
  readonly color: string;
  readonly url?: string | undefined;
  readonly fields?: readonly { readonly name: string; readonly value: string; readonly inline?: boolean }[] | undefined;
  readonly footer?: string | undefined;
}

/** Discord operations the knowledge base needs. */
export interface KnowledgeGateway {
  postEmbed(channelId: string, embed: KnowledgeEmbed): Promise<{ readonly messageId: string }>;
  /** Replies to a message without pinging its author. */
  replyEmbed(channelId: string, messageId: string, content: string, embed: KnowledgeEmbed): Promise<void>;
}

/** Writes an answer from the given articles (for example with OpenAI). */
export interface KnowledgeAnswerer {
  answer(question: string, articles: readonly KnowledgeArticle[]): Promise<string>;
}

export interface KnowledgeEditor {
  readonly userId: string;
  readonly displayName: string;
}

export interface SearchResult {
  readonly article: KnowledgeArticle;
  /** Ranking score; higher is better. */
  readonly score: number;
  /** How well the query is covered, 0-100. Title matches count most. */
  readonly match: number;
}

export interface KnowledgeAnswer {
  /** AI-written answer, when AI answers are configured and worked. */
  readonly text?: string | undefined;
  readonly sources: readonly KnowledgeArticle[];
  readonly ai: boolean;
}

/** A message checked for an automatic answer. */
export interface KnowledgeMessage {
  readonly guildId: string;
  readonly channelId: string;
  readonly messageId: string;
  readonly content: string;
}
