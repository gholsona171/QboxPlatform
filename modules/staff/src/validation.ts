import type { RankInput, StaffSettingsInput } from "./types.js";

export type StaffErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";

/** Stable, user-safe staff failure. Messages are shown to staff and members. */
export class StaffError extends Error {
  public constructor(
    public readonly code: StaffErrorCode,
    message: string,
    public readonly details?: Readonly<Record<string, string | number>> | undefined,
  ) {
    super(message);
    this.name = "StaffError";
  }
}

const SNOWFLAKE = /^\d{17,20}$/;
const COLOR = /^#[0-9a-f]{6}$/i;

export function invalid(message: string): never {
  throw new StaffError("INVALID_INPUT", message);
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

/** Trims optional text, returning undefined when empty, and checks its length. */
export function optionalText(name: string, value: string | undefined, max: number): string | undefined {
  const text = value?.trim() || undefined;
  if (text !== undefined) requireLength(name, text, 1, max);
  return text;
}

export function validateSettings(input: StaffSettingsInput): void {
  requireSnowflake("guildId", input.guildId);
  if (input.logChannelId !== undefined) requireSnowflake("logChannelId", input.logChannelId);
  if (input.rosterChannelId !== undefined) requireSnowflake("rosterChannelId", input.rosterChannelId);
  if (input.loaRoleId !== undefined) requireSnowflake("loaRoleId", input.loaRoleId);
  requireRange("autoClockOutHours", input.autoClockOutHours, 0, 72);
  requireRange("maxLeaveDays", input.maxLeaveDays, 1, 365);
}

export function validateRank(input: RankInput): void {
  requireLength("Rank name", input.name.trim(), 1, 50);
  if (input.roleId !== undefined) requireSnowflake("roleId", input.roleId);
  if (!COLOR.test(input.color)) invalid("Color must look like #5865F2.");
  if (input.description !== undefined) requireLength("Description", input.description.trim(), 1, 200);
}
