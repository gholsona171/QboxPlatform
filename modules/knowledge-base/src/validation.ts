import type { ArticleInput, CategoryInput, KnowledgeSettingsInput } from "./types.js";

export type KnowledgeErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";

/** Stable, user-safe knowledge base failure. Messages are shown to staff and members. */
export class KnowledgeError extends Error {
  public constructor(
    public readonly code: KnowledgeErrorCode,
    message: string,
    public readonly details?: Readonly<Record<string, string | number>> | undefined,
  ) {
    super(message);
    this.name = "KnowledgeError";
  }
}

const SNOWFLAKE = /^\d{17,20}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_ARTICLES = 1000;
export const MAX_CATEGORIES = 50;

export function invalid(message: string): never {
  throw new KnowledgeError("INVALID_INPUT", message);
}

export function requireSnowflake(name: string, value: string | undefined): void {
  if (!value || !SNOWFLAKE.test(value)) invalid(`${name} must be a Discord ID.`);
}

export function requireRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) invalid(`${name} must be a whole number between ${min} and ${max}.`);
}

export function requireLength(name: string, value: string, min: number, max: number): void {
  if (value.length < min || value.length > max) invalid(`${name} must be between ${min} and ${max} characters.`);
}

export function validateSettings(input: KnowledgeSettingsInput): void {
  requireSnowflake("guildId", input.guildId);
  if (input.autoAnswerChannelIds.length > 50) invalid("You can pick at most 50 auto-answer channels.");
  for (const id of input.autoAnswerChannelIds) requireSnowflake("autoAnswerChannelIds", id);
  requireRange("autoAnswerThreshold", input.autoAnswerThreshold, 1, 100);
  requireRange("autoAnswerCooldownSeconds", input.autoAnswerCooldownSeconds, 0, 86_400);
}

export function validateCategory(input: CategoryInput): void {
  requireLength("Category name", input.name.trim(), 1, 50);
  if (input.emoji !== undefined) requireLength("Category emoji", input.emoji.trim(), 1, 64);
  requireRange("Category order", input.order, 0, 1000);
}

export function validateArticle(input: ArticleInput): void {
  requireLength("Title", input.title.trim(), 3, 150);
  requireLength("Article text", input.body.trim(), 1, 20_000);
  if (input.slug !== undefined && input.slug !== "") {
    requireLength("Slug", input.slug, 1, 80);
    if (!SLUG.test(input.slug)) invalid("Slug can only use lowercase letters, numbers, and dashes.");
  }
  if (input.tags.length > 20) invalid("An article can have at most 20 tags.");
  for (const tag of input.tags) requireLength("Tag", tag.trim(), 1, 40);
}

/** "How do I join?" -> "how-do-i-join". */
export function slugify(value: string): string {
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
