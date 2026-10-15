/** Stable, user-safe knowledge base failure. Messages are shown to staff and members. */
export class KnowledgeError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "KnowledgeError";
    }
}
const SNOWFLAKE = /^\d{17,20}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_ARTICLES = 1000;
export const MAX_CATEGORIES = 50;
export function invalid(message) {
    throw new KnowledgeError("INVALID_INPUT", message);
}
export function requireSnowflake(name, value) {
    if (!value || !SNOWFLAKE.test(value))
        invalid(`${name} must be a Discord ID.`);
}
export function requireRange(name, value, min, max) {
    if (!Number.isInteger(value) || value < min || value > max)
        invalid(`${name} must be a whole number between ${min} and ${max}.`);
}
export function requireLength(name, value, min, max) {
    if (value.length < min || value.length > max)
        invalid(`${name} must be between ${min} and ${max} characters.`);
}
export function validateSettings(input) {
    requireSnowflake("guildId", input.guildId);
    if (input.autoAnswerChannelIds.length > 50)
        invalid("You can pick at most 50 auto-answer channels.");
    for (const id of input.autoAnswerChannelIds)
        requireSnowflake("autoAnswerChannelIds", id);
    requireRange("autoAnswerThreshold", input.autoAnswerThreshold, 1, 100);
    requireRange("autoAnswerCooldownSeconds", input.autoAnswerCooldownSeconds, 0, 86_400);
}
export function validateCategory(input) {
    requireLength("Category name", input.name.trim(), 1, 50);
    if (input.emoji !== undefined)
        requireLength("Category emoji", input.emoji.trim(), 1, 64);
    requireRange("Category order", input.order, 0, 1000);
}
export function validateArticle(input) {
    requireLength("Title", input.title.trim(), 3, 150);
    requireLength("Article text", input.body.trim(), 1, 20_000);
    if (input.slug !== undefined && input.slug !== "") {
        requireLength("Slug", input.slug, 1, 80);
        if (!SLUG.test(input.slug))
            invalid("Slug can only use lowercase letters, numbers, and dashes.");
    }
    if (input.tags.length > 20)
        invalid("An article can have at most 20 tags.");
    for (const tag of input.tags)
        requireLength("Tag", tag.trim(), 1, 40);
}
/** "How do I join?" -> "how-do-i-join". */
export function slugify(value) {
    const slug = value
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 70)
        .replace(/-+$/g, "");
    return slug || "article";
}
//# sourceMappingURL=validation.js.map