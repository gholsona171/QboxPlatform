import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { LOOP_MODES, type MusicActor, type MusicCommand, type MusicCommandResult, type MusicControl, type MusicLoopMode, type MusicStateSnapshot } from "./types.js";
import { MusicError, isSnowflake, type MusicErrorCode } from "./validation.js";

export const DEFAULT_CONTROL_PORT = 3102;
export const SIGNATURE_HEADER = "x-qbox-signature";
export const TIMESTAMP_HEADER = "x-qbox-timestamp";
/** Requests older or newer than this are refused. */
export const MAX_CLOCK_SKEW_MS = 30_000;
/** Connect, Speak, and View Channel. */
export const VOICE_BOT_PERMISSIONS = "3146752";
export const UNREACHABLE_MESSAGE = "The music player is not running (bot offline).";

/** The HMAC key both processes derive from the bot token they already share. */
export function controlKey(discordToken: string): Buffer {
  return createHash("sha256").update(discordToken).digest();
}

/** Hex HMAC-SHA256 of `<timestamp>.<body>`. */
export function signControlRequest(key: Buffer, timestamp: string, body: string): string {
  return createHmac("sha256", key).update(`${timestamp}.${body}`).digest("hex");
}

export type ControlVerification = { readonly ok: true } | { readonly ok: false; readonly reason: "remote" | "stale" | "signature" };

export interface ControlRequestParts {
  readonly remoteAddress: string | undefined;
  readonly timestamp: string | undefined;
  readonly signature: string | undefined;
  readonly body: string;
}

const LOOPBACK = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

/** Checks that a control request comes from this machine, is fresh, and is signed with the shared key. */
export function verifyControlRequest(key: Buffer, request: ControlRequestParts, now: number = Date.now()): ControlVerification {
  if (!request.remoteAddress || !LOOPBACK.has(request.remoteAddress)) return { ok: false, reason: "remote" };
  const timestamp = Number(request.timestamp);
  if (!request.timestamp || !Number.isInteger(timestamp) || Math.abs(now - timestamp) > MAX_CLOCK_SKEW_MS) return { ok: false, reason: "stale" };
  const expected = Buffer.from(signControlRequest(key, request.timestamp, request.body), "hex");
  const given = Buffer.from(request.signature ?? "", "hex");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return { ok: false, reason: "signature" };
  return { ok: true };
}

/** The bot user ID encoded in the first part of a Discord bot token, if it has one. */
export function botIdFromToken(token: string): string | undefined {
  const first = token.split(".")[0];
  if (!first) return undefined;
  try {
    const id = Buffer.from(first, "base64").toString("utf8");
    return isSnowflake(id) ? id : undefined;
  } catch {
    return undefined;
  }
}

/** Link to invite a voice-only bot with Connect, Speak and View Channel. */
export function voiceBotInviteUrl(botId: string): string {
  return `https://discord.com/oauth2/authorize?client_id=${botId}&scope=bot&permissions=${VOICE_BOT_PERMISSIONS}`;
}

type Body = Readonly<Record<string, unknown>>;

function field<T>(body: Body, name: string, check: (value: unknown) => value is T, required: boolean): T | undefined {
  const value = body[name];
  if (value === undefined || value === null) {
    if (required) throw new MusicError("INVALID_INPUT", `${name} is missing.`);
    return undefined;
  }
  if (!check(value)) throw new MusicError("INVALID_INPUT", `${name} is not valid.`);
  return value;
}

const isText = (limit: number) => (value: unknown): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= limit;
const isInteger = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value);
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const isChannel = (value: unknown): value is string => typeof value === "string" && isSnowflake(value);
const isLoop = (value: unknown): value is MusicLoopMode => typeof value === "string" && (LOOP_MODES as readonly string[]).includes(value);

/** Validates a command from JSON (portal or control request). */
export function parseMusicCommand(value: unknown): MusicCommand {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new MusicError("INVALID_INPUT", "The command is not valid.");
  const body = value as Body;
  const action = body["action"];
  const channelId = () => field(body, "channelId", isChannel, false);
  switch (action) {
    case "play":
      return { action, query: field(body, "query", isText(2000), true) as string, title: field(body, "title", isText(200), false), now: field(body, "now", isBoolean, false), channelId: channelId() };
    case "radio":
      return { action, name: field(body, "name", isText(200), true) as string, channelId: channelId() };
    case "playlist":
      return { action, id: field(body, "id", isText(64), true) as string, shuffle: field(body, "shuffle", isBoolean, false), now: field(body, "now", isBoolean, false), channelId: channelId() };
    case "pause":
    case "resume":
    case "toggle":
    case "stop":
    case "skip":
    case "previous":
    case "restart":
    case "shuffle":
    case "clear":
    case "leave":
      return { action };
    case "seek":
      return { action, seconds: field(body, "seconds", isInteger, true) as number };
    case "rewind":
    case "forward":
      return { action, seconds: field(body, "seconds", isInteger, false) };
    case "volume":
      return { action, volume: field(body, "volume", isNumber, true) as number };
    case "loop":
      return { action, mode: field(body, "mode", isLoop, false) };
    case "remove":
    case "jump":
      return { action, position: field(body, "position", isInteger, true) as number };
    case "move":
      return { action, from: field(body, "from", isInteger, true) as number, to: field(body, "to", isInteger, true) as number };
    case "join":
      return { action, channelId: channelId() };
    default:
      throw new MusicError("INVALID_INPUT", "That is not a music command.");
  }
}

/** Validates the actor sent along with a control command. */
export function parseMusicActor(value: unknown): MusicActor {
  const body = (value && typeof value === "object" ? value : {}) as Body;
  const userId = body["userId"];
  const roleIds = body["roleIds"];
  if (!isChannel(userId)) throw new MusicError("INVALID_INPUT", "The actor is not valid.");
  return {
    userId,
    manager: body["manager"] === true,
    dj: body["dj"] === true,
    roleIds: Array.isArray(roleIds) ? roleIds.filter(isChannel).slice(0, 250) : [],
    ...(isChannel(body["textChannelId"]) ? { textChannelId: body["textChannelId"] } : {}),
  };
}

const ERROR_CODES = new Set<MusicErrorCode>(["INVALID_INPUT", "NOT_FOUND", "FORBIDDEN", "INVALID_STATE", "CONFLICT", "LIMIT_REACHED", "DEPENDENCY_UNAVAILABLE"]);

/** Maps an error code to the HTTP status the control server answers with. */
export function controlStatus(code: MusicErrorCode): number {
  return code === "NOT_FOUND" ? 404 : code === "FORBIDDEN" ? 403 : code === "CONFLICT" ? 409 : code === "DEPENDENCY_UNAVAILABLE" ? 503 : 400;
}

/** Calls the bot's control server over 127.0.0.1 with signed requests. */
export class HttpMusicControlClient implements MusicControl {
  private readonly key: Buffer;

  public constructor(
    discordToken: string,
    private readonly baseUrl: string = `http://127.0.0.1:${DEFAULT_CONTROL_PORT}`,
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly timeoutMs = 28_000,
  ) {
    this.key = controlKey(discordToken);
  }

  public async state(guildId: string): Promise<MusicStateSnapshot> {
    return (await this.call<{ readonly state: MusicStateSnapshot }>("GET", `/music/${guildId}/state`, "")).state;
  }

  public async command(guildId: string, command: MusicCommand, actor: MusicActor): Promise<MusicCommandResult> {
    return this.call<MusicCommandResult>("POST", `/music/${guildId}/command`, JSON.stringify({ ...command, actor }));
  }

  private async call<T>(method: "GET" | "POST", path: string, body: string): Promise<T> {
    const timestamp = String(Date.now());
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method,
        headers: { [TIMESTAMP_HEADER]: timestamp, [SIGNATURE_HEADER]: signControlRequest(this.key, timestamp, body), ...(method === "POST" ? { "content-type": "application/json" } : {}) },
        ...(method === "POST" ? { body } : {}),
        signal: controller.signal,
      });
    } catch {
      throw new MusicError("DEPENDENCY_UNAVAILABLE", UNREACHABLE_MESSAGE);
    } finally {
      clearTimeout(timer);
    }
    const payload = (await response.json().catch(() => undefined)) as { readonly error?: { readonly code?: string; readonly message?: string } } | undefined;
    if (!response.ok) {
      const code = payload?.error?.code;
      if (code && ERROR_CODES.has(code as MusicErrorCode) && payload?.error?.message) throw new MusicError(code as MusicErrorCode, payload.error.message);
      throw new MusicError("DEPENDENCY_UNAVAILABLE", UNREACHABLE_MESSAGE);
    }
    return payload as T;
  }
}
