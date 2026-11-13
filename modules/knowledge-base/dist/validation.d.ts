import type { ArticleInput, CategoryInput, KnowledgeSettingsInput } from "./types.js";
export type KnowledgeErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe knowledge base failure. Messages are shown to staff and members. */
export declare class KnowledgeError extends Error {
    readonly code: KnowledgeErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: KnowledgeErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
export declare const MAX_ARTICLES = 1000;
export declare const MAX_CATEGORIES = 50;
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
export declare function requireRange(name: string, value: number, min: number, max: number): void;
export declare function requireLength(name: string, value: string, min: number, max: number): void;
export declare function validateSettings(input: KnowledgeSettingsInput): void;
export declare function validateCategory(input: CategoryInput): void;
export declare function validateArticle(input: ArticleInput): void;
/** "How do I join?" -> "how-do-i-join". */
export declare function slugify(value: string): string;
//# sourceMappingURL=validation.d.ts.map