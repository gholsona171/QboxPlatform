import type { FivemSettingsInput } from "./types.js";

export type FivemErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";

/** Stable, user-safe FiveM failure. Messages are shown to staff and members. */
export class FivemError extends Error {
  public constructor(
    public readonly code: FivemErrorCode,
    message: string,
    public readonly details?: Readonly<Record<string, string | number>> | undefined,
  ) {
    super(message);
    this.name = "FivemError";
  }
}

const SNOWFLAKE = /^\d{17,20}$/;
const HOST = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;
const CONNECT_URL = /^https:\/\/cfx\.re\/join\/[a-z0-9]{1,20}$/i;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function invalid(message: string): never {
  throw new FivemError("INVALID_INPUT", message);
}

export function requireSnowflake(name: string, value: string | undefined): void {
  if (!value || !SNOWFLAKE.test(value)) invalid(`${name} must be a Discord ID.`);
}

export function requireRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) invalid(`${name} must be a whole number between ${min} and ${max}.`);
}

/** Checks `host:port` and returns it trimmed and lowercased. */
export function normalizeAddress(value: string): string {
  const address = value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const match = /^(.+):(\d{1,5})$/.exec(address);
  const port = match ? Number(match[2]) : NaN;
  if (!match || !HOST.test(match[1] as string) || port < 1 || port > 65_535)
    invalid("Server address must look like 123.45.67.89:30120 or play.example.com:30120.");
  return address;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function validateSettings(input: FivemSettingsInput): void {
  requireSnowflake("guildId", input.guildId);
  if (input.serverAddress !== undefined) normalizeAddress(input.serverAddress);
  if (input.connectUrl !== undefined && !CONNECT_URL.test(input.connectUrl)) invalid("Connect link must look like https://cfx.re/join/abc123.");
  if (input.statusChannelId !== undefined) requireSnowflake("statusChannelId", input.statusChannelId);
  if (input.alertChannelId !== undefined) requireSnowflake("alertChannelId", input.alertChannelId);
  if (input.alertRoleId !== undefined) requireSnowflake("alertRoleId", input.alertRoleId);
  requireRange("updateIntervalSeconds", input.updateIntervalSeconds, 30, 3600);
  if (input.restartTimes.length > 24) invalid("You can have at most 24 restart times.");
  for (const time of input.restartTimes) if (!TIME.test(time)) invalid(`"${time}" is not a time. Use HH:MM, for example 06:00.`);
  if (!isValidTimeZone(input.timeZone)) invalid(`"${input.timeZone}" is not a time zone. Use a name like Europe/Berlin or UTC.`);
  if (input.restartWarningMinutes.length > 6) invalid("You can have at most 6 restart warnings.");
  for (const minutes of input.restartWarningMinutes) requireRange("restart warning minutes", minutes, 0, 120);
  if (input.restartTimes.length && !input.alertChannelId) invalid("Choose an alert channel for restart warnings.");
}
