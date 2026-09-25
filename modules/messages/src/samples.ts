import { BRAND } from "@qbox/shared/brand";
import type { MessagePlaceholder } from "@qbox/shared/messages";

const SAMPLE_USER = "<@123456789012345678>";
const SAMPLE_MODERATOR = "<@234567890123456789>";

/** Sample values for previews, by placeholder name. */
export const PLACEHOLDER_SAMPLES: Readonly<Record<string, string>> = {
  user: SAMPLE_USER,
  username: "Alex",
  server: "Your Server",
  brand: BRAND.name,
  number: "12",
  reason: "General support",
  reasonNumber: "3",
  subject: "I need help with my account",
  moderator: SAMPLE_MODERATOR,
  caseNumber: "42",
  action: "Warning",
  duration: "1 hour",
  rule: "No spam",
  level: "5",
  xp: "1,250",
  rank: "3",
  prize: "A month of Nitro",
  winners: SAMPLE_USER,
  host: SAMPLE_MODERATOR,
  endsAt: "<t:1790000000:R>",
  memberCount: "1,024",
  age: "21",
  date: "September 25",
};

/** A sensible sample for a placeholder the map does not know, from its name. */
export function sampleFor(name: string): string {
  const known = PLACEHOLDER_SAMPLES[name];
  if (known !== undefined) return known;
  const lower = name.toLowerCase();
  if (lower.endsWith("user") || lower.endsWith("member") || lower.endsWith("id")) return SAMPLE_USER;
  if (lower.endsWith("count") || lower.endsWith("number") || lower.endsWith("total")) return "12";
  if (lower.endsWith("url") || lower.endsWith("link")) return "https://example.com";
  if (lower.endsWith("at") || lower.endsWith("date") || lower.endsWith("time")) return "<t:1790000000:f>";
  if (lower.endsWith("channel")) return "<#345678901234567890>";
  if (lower.endsWith("role")) return "<@&456789012345678901>";
  return `Sample ${name}`;
}

/** Sample values for every placeholder of a message key. `server` uses the real server name when known. */
export function sampleValues(placeholders: readonly MessagePlaceholder[], guildName?: string): Readonly<Record<string, string>> {
  return Object.fromEntries(placeholders.map((placeholder) => [placeholder.name, placeholder.name === "server" && guildName ? guildName : sampleFor(placeholder.name)]));
}
