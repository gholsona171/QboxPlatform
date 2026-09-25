import { GAMES_SERVER_KINDS, type GamesServerInput, type GamesServerKind, type GamesSettingsInput } from "./types.js";

export type GamesErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";

/** Stable, user-safe game server failure. Messages are shown to staff and members. */
export class GamesError extends Error {
  public constructor(
    public readonly code: GamesErrorCode,
    message: string,
    public readonly details?: Readonly<Record<string, string | number>> | undefined,
  ) {
    super(message);
    this.name = "GamesError";
  }
}

const SNOWFLAKE = /^\d{17,20}$/;
const HOST = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;
const CONNECT_URL = /^(https?|steam):\/\/[^\s<>]{1,190}$/i;

/** Default query ports for the Minecraft kinds; Steam games differ, so their port is required. */
export const DEFAULT_PORTS: Readonly<Record<GamesServerKind, number | undefined>> = {
  "minecraft-java": 25_565,
  "minecraft-bedrock": 19_132,
  steam: undefined,
};

export function invalid(message: string): never {
  throw new GamesError("INVALID_INPUT", message);
}

export function requireSnowflake(name: string, value: string | undefined): void {
  if (!value || !SNOWFLAKE.test(value)) invalid(`${name} must be a Discord ID.`);
}

export function requireRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) invalid(`${name} must be a whole number between ${min} and ${max}.`);
}

export function isServerKind(value: string): value is GamesServerKind {
  return (GAMES_SERVER_KINDS as readonly string[]).includes(value);
}

/** Splits `host:port` into its parts, using the kind's default port when none is given. */
export function splitAddress(kind: GamesServerKind, address: string): { readonly host: string; readonly port: number | undefined } {
  const match = /^(.+):(\d{1,5})$/.exec(address);
  if (match) return { host: match[1] as string, port: Number(match[2]) };
  return { host: address, port: DEFAULT_PORTS[kind] };
}

/** Checks `host` or `host:port` for the kind and returns it trimmed and lowercased. */
export function normalizeAddress(kind: GamesServerKind, value: string): string {
  if (!isServerKind(kind)) invalid("Choose a server kind: Minecraft (Java), Minecraft (Bedrock), or Steam.");
  const address = value.trim().toLowerCase().replace(/^[a-z]+:\/\//, "").replace(/\/+$/, "");
  const match = /^(.+):(\d{1,5})$/.exec(address);
  const host = match ? (match[1] as string) : address;
  const port = match ? Number(match[2]) : undefined;
  if (!HOST.test(host) || (port !== undefined && (port < 1 || port > 65_535)))
    invalid("Server address must look like 123.45.67.89:28015 or play.example.com.");
  if (port === undefined && DEFAULT_PORTS[kind] === undefined)
    invalid("Steam servers need the query port, for example 123.45.67.89:28015.");
  return address;
}

export function validateServerInput(input: GamesServerInput): void {
  const name = input.name.trim();
  if (name.length < 1 || name.length > 50) invalid("Server name must be 1 to 50 characters.");
  normalizeAddress(input.kind, input.address);
  if (input.game !== undefined && input.game.trim().length > 40) invalid("Game label must be at most 40 characters.");
  if (input.connectUrl !== undefined && !CONNECT_URL.test(input.connectUrl.trim()))
    invalid("Connect link must start with https://, http://, or steam:// and have no spaces.");
  if (input.statusChannelId !== undefined) requireSnowflake("statusChannelId", input.statusChannelId);
  if (input.playerCountChannelId !== undefined) requireSnowflake("playerCountChannelId", input.playerCountChannelId);
  if (input.alertChannelId !== undefined) requireSnowflake("alertChannelId", input.alertChannelId);
  if (input.alertRoleId !== undefined) requireSnowflake("alertRoleId", input.alertRoleId);
  requireRange("updateIntervalSeconds", input.updateIntervalSeconds, 60, 600);
}

export function validateSettings(input: GamesSettingsInput): void {
  requireSnowflake("guildId", input.guildId);
  for (const [label, value] of [["Player-count channel name", input.playerCountTemplate], ["Offline channel name", input.playerCountOfflineTemplate]] as const)
    if (value.trim().length < 1 || value.trim().length > 90) invalid(`${label} must be 1 to 90 characters.`);
}
