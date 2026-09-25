import type { VoiceHubInput } from "./types.js";

export type VoiceErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";

/** Stable, user-safe voice room failure. Messages are shown to members and staff. */
export class VoiceError extends Error {
  public constructor(
    public readonly code: VoiceErrorCode,
    message: string,
    public readonly details?: Readonly<Record<string, string | number>> | undefined,
  ) {
    super(message);
    this.name = "VoiceError";
  }
}

const SNOWFLAKE = /^\d{17,20}$/;

export function invalid(message: string): never {
  throw new VoiceError("INVALID_INPUT", message);
}

export function requireSnowflake(name: string, value: string | undefined): void {
  if (!value || !SNOWFLAKE.test(value)) invalid(`${name} must be a Discord ID.`);
}

export function requireRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) invalid(`${name} must be a whole number between ${min} and ${max}.`);
}

/** Checks a room name: 1-100 characters after trimming. */
export function requireRoomName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 100) invalid("Room name must be between 1 and 100 characters.");
  return trimmed;
}

export function validateHub(input: VoiceHubInput): void {
  const name = input.name.trim();
  if (name.length < 1 || name.length > 60) invalid("Hub name must be between 1 and 60 characters.");
  requireSnowflake("Hub channel", input.channelId);
  if (input.categoryId !== undefined) requireSnowflake("Category", input.categoryId);
  const template = input.nameTemplate.trim();
  if (template.length < 1 || template.length > 100) invalid("Room name template must be between 1 and 100 characters.");
  requireRange("User limit", input.userLimit, 0, 99);
  requireRange("Bitrate", input.bitrateKbps, 8, 384);
  requireRange("Delete delay", input.deleteDelaySeconds, 0, 3600);
  if (input.allowedRoleIds.length > 25) invalid("You can allow at most 25 roles.");
  if (new Set(input.allowedRoleIds).size !== input.allowedRoleIds.length) invalid("Allowed roles lists the same role twice.");
  for (const roleId of input.allowedRoleIds) requireSnowflake("Allowed role", roleId);
}
