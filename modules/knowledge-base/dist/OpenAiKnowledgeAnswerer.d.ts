import type { KnowledgeAnswerer, KnowledgeArticle } from "./types.js";
export declare const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
type Fetch = typeof fetch;
/** Answers questions from knowledge base articles with the OpenAI chat completions API. */
export declare class OpenAiKnowledgeAnswerer implements KnowledgeAnswerer {
    private readonly apiKey;
    private readonly model;
    private readonly fetchImpl;
    private readonly timeoutMs;
    constructor(apiKey: string, model?: string, fetchImpl?: Fetch, timeoutMs?: number);
    answer(question: string, articles: readonly KnowledgeArticle[]): Promise<string>;
}
export {};
//# sourceMappingURL=OpenAiKnowledgeAnswerer.d.ts.map