import type { AutomodRule, ModerationSettingsInput } from "./types.js";
import { MAX_TIMEOUT_MINUTES } from "./types.js";

export type ModerationErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "DEPENDENCY_UNAVAILABLE";

/** Stable, user-safe moderation failure. Messages are shown to staff. */
export class ModerationError extends Error {
  public constructor(
    public readonly code: ModerationErrorCode,
    message: string,
    public readonly details?: Readonly<Record<string, string | number>> | undefined,
  ) {
    super(message);
    this.name = "ModerationError";
  }
}

const SNOWFLAKE = /^\d{17,20}$/;

export function invalid(message: string): never {
  throw new ModerationError("INVALID_INPUT", message);
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

function requireIds(name: string, values: readonly string[], max = 100): void {
  if (values.length > max) invalid(`${name} can contain at most ${max} entries.`);
  for (const value of values) requireSnowflake(name, value);
}

function requireRule(name: string, rule: AutomodRule): void {
  if (!["DELETE", "WARN", "TIMEOUT"].includes(rule.action)) invalid(`${name} action is not supported.`);
  requireRange(`${name} timeout`, rule.timeoutMinutes, 1, MAX_TIMEOUT_MINUTES);
}

export function validateSettings(input: ModerationSettingsInput): void {
  requireSnowflake("guildId", input.guildId);
  if (input.logChannelId !== undefined) requireSnowflake("logChannelId", input.logChannelId);
  if (input.appealMessage !== undefined) requireLength("appealMessage", input.appealMessage, 1, 500);
  requireRange("defaultTimeoutMinutes", input.defaultTimeoutMinutes, 1, MAX_TIMEOUT_MINUTES);
  requireRange("banDeleteMessageHours", input.banDeleteMessageHours, 0, 168);
  requireRange("warningExpiryDays", input.warningExpiryDays, 0, 3650);
  requireIds("protectedRoleIds", input.protectedRoleIds, 25);
  if (input.escalation.length > 10) invalid("You can have at most 10 escalation steps.");
  const counts = new Set<number>();
  for (const step of input.escalation) {
    requireRange("escalation warnings", step.warnings, 1, 100);
    if (counts.has(step.warnings)) invalid("Each escalation step needs a different warning count.");
    counts.add(step.warnings);
    if (!["TIMEOUT", "KICK", "BAN"].includes(step.action)) invalid("Escalation action must be TIMEOUT, KICK, or BAN.");
    requireRange("escalation duration", step.durationMinutes, 0, step.action === "TIMEOUT" ? MAX_TIMEOUT_MINUTES : 525_600);
    if (step.action === "TIMEOUT" && step.durationMinutes < 1) invalid("Escalation timeouts need a duration.");
  }
  const automod = input.automod;
  requireIds("exemptRoleIds", automod.exemptRoleIds, 50);
  requireIds("exemptChannelIds", automod.exemptChannelIds, 100);
  requireRule("Spam", automod.spam);
  requireRange("spam messages", automod.spam.maxMessages, 2, 50);
  requireRange("spam seconds", automod.spam.perSeconds, 1, 120);
  requireRule("Invites", automod.invites);
  requireRule("Links", automod.links);
  if (automod.links.allowedDomains.length > 100) invalid("You can allow at most 100 link domains.");
  for (const domain of automod.links.allowedDomains) if (!/^[a-z0-9.-]{1,253}$/i.test(domain)) invalid(`"${domain}" is not a valid domain.`);
  requireRule("Blocked words", automod.words);
  if (automod.words.words.length > 500) invalid("You can block at most 500 words.");
  for (const word of automod.words.words) requireLength("blocked word", word.trim(), 1, 64);
  requireRule("Mentions", automod.mentions);
  requireRange("mention limit", automod.mentions.maxMentions, 1, 50);
  requireRule("Caps", automod.caps);
  requireRange("caps minimum length", automod.caps.minLength, 1, 2000);
  requireRange("caps percent", automod.caps.percent, 50, 100);
}
