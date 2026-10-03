import type { KnowledgeArticle, SearchResult } from "./types.js";
/** Lowercase search words from free text, without stop words and duplicates. */
export declare function searchTerms(query: string): readonly string[];
/**
 * Ranks one article for the query words. Title matches count most, then tags,
 * then the body. Returns undefined when nothing matches.
 */
export declare function scoreArticle(article: KnowledgeArticle, terms: readonly string[], phrase?: string): SearchResult | undefined;
/** Scores and sorts articles for a free-text query, best first. */
export declare function rankArticles(articles: readonly KnowledgeArticle[], query: string): readonly SearchResult[];
//# sourceMappingURL=search.d.ts.map