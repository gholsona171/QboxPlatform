import { daysInMonth, normalizeTimeZone } from "@qbox/shared/time-zones";

import type { BirthdaySettingsInput } from "./types.js";

export type BirthdayErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";

/** Stable, user-safe birthday failure. Messages are shown to members and staff. */
export class BirthdayError extends Error {
  public constructor(
    public readonly code: BirthdayErrorCode,
    message: string,
    public readonly details?: Readonly<Record<string, string | number>> | undefined,
  ) {
    super(message);
    this.name = "BirthdayError";
  }
}

const SNOWFLAKE = /^\d{17,20}$/;
export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;

export function invalid(message: string): never {
  throw new BirthdayError("INVALID_INPUT", message);
}

export function requireSnowflake(name: string, value: string | undefined): void {
  if (!value || !SNOWFLAKE.test(value)) invalid(`${name} must be a Discord ID.`);
}

export function requireRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) invalid(`${name} must be a whole number between ${min} and ${max}.`);
}

/** Canonical IANA time zone name, or an INVALID_INPUT error. */
export function requireTimeZone(value: string): string {
  const zone = normalizeTimeZone(value);
  if (!zone) invalid(`"${value}" is not a time zone. Use a name like Europe/London or America/New_York.`);
  return zone;
}

/** Checks a month and day (February 29 is allowed), and the year when given. */
export function requireDate(month: number, day: number, year: number | undefined, currentYear: number): void {
  requireRange("Month", month, 1, 12);
  requireRange("Day", day, 1, daysInMonth(2000, month));
  if (year === undefined) return;
  requireRange("Year", year, 1900, currentYear);
  if (day > daysInMonth(year, month)) invalid(`${MONTH_NAMES[month - 1]} ${day} did not exist in ${year}.`);
}

export function validateSettings(input: BirthdaySettingsInput): void {
  requireSnowflake("guildId", input.guildId);
  if (input.channelId !== undefined) requireSnowflake("Announcement channel", input.channelId);
  if (input.roleId !== undefined) requireSnowflake("Birthday role", input.roleId);
  if (input.pingRoleId !== undefined) requireSnowflake("Ping role", input.pingRoleId);
  if (input.message.trim().length < 1 || input.message.length > 2000) invalid("The message must be between 1 and 2000 characters.");
  if (!/^#[0-9a-f]{6}$/i.test(input.embedColor)) invalid("Color must be a hex color like #F47FFF.");
  requireRange("Announce hour", input.announceHour, 0, 23);
  if (input.enabled && !input.channelId && !input.roleId) invalid("Choose an announcement channel or a birthday role before turning birthdays on.");
}
