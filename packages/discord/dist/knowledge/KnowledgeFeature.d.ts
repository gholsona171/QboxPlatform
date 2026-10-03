import { type KnowledgeRepository } from "@qbox/knowledge-base";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
export interface KnowledgeFeatureOptions {
    /** Enables AI answers for `/ask` through the OpenAI chat completions API. */
    readonly openAiApiKey?: string | undefined;
    readonly openAiModel?: string | undefined;
}
/**
 * Knowledge base: `/faq`, `/kb`, `/ask`, title autocomplete, and automatic
 * answers in chosen channels (needs the Message Content intent).
 */
export declare function knowledgeFeature(repository: KnowledgeRepository, options?: KnowledgeFeatureOptions): DiscordFeatureFactory;
//# sourceMappingURL=KnowledgeFeature.d.ts.map