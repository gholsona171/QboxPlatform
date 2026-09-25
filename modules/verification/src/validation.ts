import type { VerificationSettingsInput } from "./types.js";
import { MAX_VERIFICATION_QUESTIONS, VERIFICATION_AGE_ACTIONS, VERIFICATION_MODES } from "./types.js";

export type VerificationErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";

/** Stable, user-safe verification failure. Messages are shown to members and staff. */
export class VerificationError extends Error {
  public constructor(
    public readonly code: VerificationErrorCode,
    message: string,
    public readonly details?: Readonly<Record<string, string | number>> | undefined,
  ) {
    super(message);
    this.name = "VerificationError";
  }
}

const SNOWFLAKE = /^\d{17,20}$/;

export function invalid(message: string): never {
  throw new VerificationError("INVALID_INPUT", message);
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

export function validateSettings(input: VerificationSettingsInput): void {
  requireSnowflake("guildId", input.guildId);
  if (!VERIFICATION_MODES.includes(input.mode)) invalid("Mode must be BUTTON, CAPTCHA, or QUESTION.");
  if (!VERIFICATION_AGE_ACTIONS.includes(input.ageAction)) invalid("Account age action must be DENY, KICK, or FLAG.");
  if (input.verifiedRoleIds.length > 10) invalid("You can give at most 10 verified roles.");
  for (const roleId of input.verifiedRoleIds) requireSnowflake("verifiedRoleIds", roleId);
  if (new Set(input.verifiedRoleIds).size !== input.verifiedRoleIds.length) invalid("Each verified role can only be listed once.");
  if (input.unverifiedRoleId !== undefined) {
    requireSnowflake("unverifiedRoleId", input.unverifiedRoleId);
    if (input.verifiedRoleIds.includes(input.unverifiedRoleId)) invalid("The unverified role cannot also be a verified role.");
  }
  if (input.enabled && input.verifiedRoleIds.length === 0) invalid("Choose at least one verified role before turning verification on.");
  for (const [name, value] of [["channelId", input.channelId], ["logChannelId", input.logChannelId], ["welcomeChannelId", input.welcomeChannelId]] as const)
    if (value !== undefined) requireSnowflake(name, value);

  requireLength("Panel title", input.panel.title.trim(), 1, 256);
  requireLength("Panel description", input.panel.description.trim(), 1, 4000);
  requireLength("Button label", input.panel.buttonLabel.trim(), 1, 80);
  if (!/^#[0-9a-f]{6}$/i.test(input.panel.color)) invalid("Panel color must be a hex color like #5865F2.");

  if (input.questions.length > MAX_VERIFICATION_QUESTIONS) invalid(`You can ask at most ${MAX_VERIFICATION_QUESTIONS} questions.`);
  if (input.mode === "QUESTION" && input.questions.length === 0) invalid("Question mode needs at least one question.");
  const ids = new Set<string>();
  for (const question of input.questions) {
    if (!/^[a-z0-9-]{1,40}$/.test(question.id) || ids.has(question.id)) invalid("Each question needs a unique ID.");
    ids.add(question.id);
    requireLength("Question", question.prompt.trim(), 1, 45);
    if (question.answers.length === 0 || question.answers.length > 20) invalid(`"${question.prompt}" needs between 1 and 20 accepted answers.`);
    for (const answer of question.answers) requireLength("Accepted answer", answer.trim(), 1, 100);
  }

  requireRange("Minimum account age (days)", input.minAccountAgeDays, 0, 365);
  requireRange("Kick unverified after (minutes)", input.kickUnverifiedMinutes, 0, 43_200);
  requireRange("Attempts before cooldown", input.maxAttempts, 0, 20);
  requireRange("Cooldown (minutes)", input.cooldownMinutes, 1, 1440);
  if (input.successMessage !== undefined) requireLength("Success DM", input.successMessage, 1, 1000);
  if (input.welcomeMessage !== undefined) requireLength("Welcome message", input.welcomeMessage, 1, 2000);
  if (input.welcomeChannelId !== undefined && input.welcomeMessage === undefined) invalid("Write a welcome message or clear the welcome channel.");
}
