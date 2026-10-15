import { KnowledgeError } from "./validation.js";
export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const ENDPOINT = "https://api.openai.com/v1/chat/completions";
const TIMEOUT_MS = 20_000;
const ARTICLE_CHARS = 4000;
/** Answers questions from knowledge base articles with the OpenAI chat completions API. */
export class OpenAiKnowledgeAnswerer {
    apiKey;
    model;
    fetchImpl;
    timeoutMs;
    constructor(apiKey, model = DEFAULT_OPENAI_MODEL, fetchImpl = fetch, timeoutMs = TIMEOUT_MS) {
        this.apiKey = apiKey;
        this.model = model;
        this.fetchImpl = fetchImpl;
        this.timeoutMs = timeoutMs;
    }
    async answer(question, articles) {
        const context = articles.map((article, index) => `Article ${index + 1}: ${article.title}\n${article.body.slice(0, ARTICLE_CHARS)}`).join("\n\n---\n\n");
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await this.fetchImpl(ENDPOINT, {
                method: "POST",
                signal: controller.signal,
                headers: { "content-type": "application/json", authorization: `Bearer ${this.apiKey}` },
                body: JSON.stringify({
                    model: this.model,
                    temperature: 0.2,
                    max_tokens: 500,
                    messages: [
                        {
                            role: "system",
                            content: "You answer questions for a Discord community using only the articles provided. Be short and friendly. Use Discord markdown. If the articles do not answer the question, say you are not sure and suggest asking staff. Never invent rules, links, or commands.",
                        },
                        { role: "user", content: `Articles:\n\n${context}\n\nQuestion: ${question}` },
                    ],
                }),
            });
            if (!response.ok)
                throw new KnowledgeError("DEPENDENCY_UNAVAILABLE", `The AI service answered with status ${response.status}.`);
            const data = (await response.json());
            const text = data.choices?.[0]?.message?.content?.trim();
            if (!text)
                throw new KnowledgeError("DEPENDENCY_UNAVAILABLE", "The AI service returned an empty answer.");
            return text;
        }
        finally {
            clearTimeout(timer);
        }
    }
}
//# sourceMappingURL=OpenAiKnowledgeAnswerer.js.map