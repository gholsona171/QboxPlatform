import { spawn } from "node:child_process";
import { statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { isPrivateHost } from "./sources.js";
import { findExecutable } from "./tools.js";
import type { YoutubeSource, YoutubeStream, YoutubeVideo } from "./types.js";
import { MusicError, TEXT_LIMIT } from "./validation.js";

export const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
/** Longest search text handed to yt-dlp. */
export const YOUTUBE_QUERY_LIMIT = 150;
/** Most search results asked for at once. */
export const YOUTUBE_SEARCH_LIMIT = 10;

export const YOUTUBE_UNAVAILABLE_MESSAGE = "YouTube is not set up on this host. Whoever runs it can install yt-dlp (see the Music guide).";
export const YOUTUBE_PLAYLIST_MESSAGE = "YouTube playlists are not supported yet. Paste a link to one video, or type the song's name.";
export const YOUTUBE_NOT_A_VIDEO_MESSAGE = "That YouTube link is not a video. Paste a link to one video, or type the song's name.";
export const YOUTUBE_SIGN_IN_MESSAGE = "YouTube is asking this host to sign in, which usually means it has blocked the host's address. Whoever runs the host needs to set up a YouTube cookies file (see the Music guide).";
export const YOUTUBE_TIMEOUT_MESSAGE = "YouTube took too long to answer. Try again in a moment.";
export const YOUTUBE_BUSY_MESSAGE = "YouTube is busy with other requests. Try again in a moment.";
export const YOUTUBE_FAILED_MESSAGE = "YouTube could not play that right now. Try again in a moment.";

const DEFAULT_TIMEOUT_MS = 12_000;
const MAX_OUTPUT_BYTES = 512 * 1024;
const DEFAULT_CONCURRENCY = 2;
const DEFAULT_MAX_WAITING = 8;
/** A stream address is not reused in its last 10 minutes. */
const EXPIRY_MARGIN_MS = 10 * 60_000;
/** How long an address without a readable expiry time is kept. */
const FALLBACK_TTL_MS = 5 * 60_000;
const CACHE_LIMIT = 100;
/** How often a missing yt-dlp is looked for again. */
const LOCATE_RETRY_MS = 30_000;
/** After a timeout: time between asking yt-dlp to stop and killing it. */
const KILL_GRACE_MS = 2_000;
/** The only fields read from yt-dlp, printed as one JSON object per video. */
const FIELDS = "%(.{id,title,channel,uploader,duration,is_live,live_status,url})j";
const AUDIO_FORMAT = "bestaudio/best";

const YOUTUBE_HOSTS = new Set(["youtube.com", "music.youtube.com", "youtu.be", "youtube-nocookie.com"]);
const PATH_KINDS = new Set(["shorts", "live", "embed", "v"]);

export type YoutubeLink =
  | { readonly kind: "video"; readonly id: string }
  /** A playlist link without a video in it. */
  | { readonly kind: "playlist" }
  /** A YouTube page that is not a video: a channel, search, or the home page. */
  | { readonly kind: "other" };

/**
 * Reads a YouTube link: `youtube.com/watch`, `youtu.be`, `music.youtube.com`,
 * `/shorts/` and `/live/`, with or without `https://`. Undefined when the text
 * is not a YouTube link at all.
 */
export function parseYoutubeLink(raw: string): YoutubeLink | undefined {
  const text = raw.trim();
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return undefined;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
  const host = url.hostname.toLowerCase().replace(/^(?:www|m)\./, "");
  if (!YOUTUBE_HOSTS.has(host)) return undefined;
  const parts = url.pathname.split("/").filter(Boolean);
  const candidate = host === "youtu.be" ? parts[0] : parts[0] === "watch" ? url.searchParams.get("v") ?? undefined : PATH_KINDS.has(parts[0] ?? "") ? parts[1] : undefined;
  if (candidate && YOUTUBE_ID.test(candidate)) return { kind: "video", id: candidate };
  if (url.searchParams.has("list")) return { kind: "playlist" };
  return { kind: "other" };
}

/** The canonical watch address for a video ID. This is the only link form handed to yt-dlp. */
export function youtubeWatchUrl(id: string): string {
  if (!YOUTUBE_ID.test(id)) throw new MusicError("INVALID_INPUT", "That is not a YouTube video.");
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/** Search text as yt-dlp gets it: one line, no control characters, at most 150 characters. */
export function cleanYoutubeQuery(query: string): string {
  return query.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, YOUTUBE_QUERY_LIMIT).trim();
}

interface YtDlpRow extends YoutubeVideo {
  /** The audio stream address, when yt-dlp was asked for one. */
  readonly url?: string | undefined;
}

/** Maps yt-dlp's JSON lines. Skips anything that is not a video with a valid ID and a title. */
export function parseYoutubeRows(output: string): readonly YtDlpRow[] {
  return output.split(/\r?\n/).flatMap((line) => {
    const text = line.trim();
    if (!text.startsWith("{")) return [];
    let row: Readonly<Record<string, unknown>>;
    try {
      row = JSON.parse(text) as Readonly<Record<string, unknown>>;
    } catch {
      return [];
    }
    const { id, title, url } = row;
    if (typeof id !== "string" || !YOUTUBE_ID.test(id) || typeof title !== "string" || !title.trim()) return [];
    const live = row["is_live"] === true || row["live_status"] === "is_live";
    const duration = typeof row["duration"] === "number" && Number.isFinite(row["duration"]) && row["duration"] > 0 ? Math.round(row["duration"]) : null;
    const channel = [row["channel"], row["uploader"]].find((value): value is string => typeof value === "string" && value.trim().length > 0);
    return [{
      id,
      // yt-dlp adds the date and time to the title of a live stream.
      title: (live ? title.replace(/ \d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, "") : title).trim().slice(0, TEXT_LIMIT),
      ...(channel ? { channel: channel.trim().slice(0, TEXT_LIMIT) } : {}),
      durationSeconds: live ? null : duration,
      thumbnailUrl: youtubeThumbnailUrl(id),
      ...(typeof url === "string" ? { url } : {}),
    }];
  });
}

/** When a stream address stops working, in milliseconds, read from its `expire` value. */
export function youtubeStreamExpiry(url: string): number | undefined {
  const match = /[?&/]expire[=/](\d{9,11})(?:[&/]|$)/.exec(url);
  return match ? Number(match[1]) * 1000 : undefined;
}

/** Turns yt-dlp's error output into a plain sentence. The raw text is logged, never shown. */
export function youtubeError(stderr: string): MusicError {
  const text = stderr.toLowerCase();
  const has = (...needles: readonly string[]) => needles.some((needle) => text.includes(needle));
  if (has("confirm your age", "age-restricted", "age restricted", "inappropriate for some users")) return new MusicError("FORBIDDEN", "That video is age-restricted, so it cannot be played here.");
  if (has("private video", "video is private")) return new MusicError("FORBIDDEN", "That video is private.");
  if (has("members-only", "members only", "join this channel")) return new MusicError("FORBIDDEN", "That video is for channel members only.");
  if (has("not a bot", "sign in to confirm", "use --cookies", "login required")) return new MusicError("DEPENDENCY_UNAVAILABLE", YOUTUBE_SIGN_IN_MESSAGE);
  if (has("http error 429", "too many requests")) return new MusicError("DEPENDENCY_UNAVAILABLE", "YouTube is limiting this host right now. Try again in a few minutes.");
  if (has("available in your country", "blocked it in your country", "geo-restricted", "geo restricted")) return new MusicError("NOT_FOUND", "That video is not available in the host's country.");
  if (has("premieres in", "will begin in", "is upcoming", "live event will begin")) return new MusicError("INVALID_STATE", "That video has not started yet.");
  if (has("video unavailable", "video is unavailable", "has been removed", "no longer available", "account associated with this video has been terminated", "does not exist")) return new MusicError("NOT_FOUND", "That video is not available. It may have been removed or made private.");
  return new MusicError("DEPENDENCY_UNAVAILABLE", YOUTUBE_FAILED_MESSAGE);
}

export interface ProcessResult {
  /** Exit code; null when the process could not start or was killed. */
  readonly code: number | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedOut: boolean;
  /** The output passed the size limit and the process was stopped. */
  readonly truncated: boolean;
}

/** Runs a program with an argument list (never a shell) and collects its output. */
export type ProcessRunner = (file: string, args: readonly string[], limits: { readonly timeoutMs: number; readonly maxBytes: number }) => Promise<ProcessResult>;

/** `spawn` without a shell, stopped after `timeoutMs` or `maxBytes` of output. */
export const runProcess: ProcessRunner = (file, args, limits) => new Promise((resolve) => {
  const chunks: Buffer[] = [];
  let size = 0;
  let stderr = "";
  let timedOut = false;
  let truncated = false;
  let settled = false;
  let killTimer: ReturnType<typeof setTimeout> | undefined;
  const finish = (code: number | null): void => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    if (killTimer) clearTimeout(killTimer);
    resolve({ code, stdout: Buffer.concat(chunks).toString("utf8"), stderr, timedOut, truncated });
  };
  const child = spawn(file, [...args], { stdio: ["ignore", "pipe", "pipe"], windowsHide: true, shell: false });
  // The Linux yt-dlp binary is a launcher with a child process; SIGTERM reaches both, SIGKILL only the launcher.
  const stop = (): void => {
    child.kill("SIGTERM");
    killTimer ??= setTimeout(() => {
      child.kill("SIGKILL");
      finish(null);
    }, KILL_GRACE_MS);
    killTimer.unref?.();
  };
  const timer = setTimeout(() => {
    timedOut = true;
    stop();
  }, limits.timeoutMs);
  timer.unref?.();
  child.stdout.on("data", (chunk: Buffer) => {
    if (truncated) return;
    size += chunk.length;
    if (size > limits.maxBytes) {
      truncated = true;
      stop();
    } else chunks.push(chunk);
  });
  child.stderr.on("data", (chunk: Buffer) => {
    stderr = `${stderr}${chunk.toString("utf8")}`.slice(-4000);
  });
  child.stdout.on("error", () => undefined);
  child.stderr.on("error", () => undefined);
  child.on("error", (error) => {
    stderr = `${stderr}${error.message}`;
    finish(null);
  });
  child.on("close", (code) => finish(code));
});

/**
 * Where yt-dlp lives: `override` (YTDLP_PATH) when set, else PATH, else
 * `~/.local/bin/yt-dlp`, where the host scripts install it.
 */
export function findYtDlp(override?: string | undefined, home: string = homedir()): string | undefined {
  if (override) return findExecutable("yt-dlp", override);
  return findExecutable("yt-dlp") ?? findExecutable("yt-dlp", undefined, join(home, ".local", "bin"));
}

export interface YoutubeLog {
  warn(message: string, details: Readonly<Record<string, unknown>>): void;
}

export interface YtDlpYoutubeOptions {
  /** Path of yt-dlp, or a lookup that is tried again while it finds nothing. */
  readonly binary: string | undefined | (() => string | undefined);
  /** Netscape-format cookies file passed as `--cookies` (YOUTUBE_COOKIES_FILE). */
  readonly cookiesFile?: string | undefined;
  /** yt-dlp needs a JavaScript runtime for YouTube; by default the Node.js that runs this process. Empty to pass none. */
  readonly jsRuntime?: string | undefined;
  /** Extra yt-dlp arguments for local testing. Not read from the environment. */
  readonly extraArgs?: readonly string[] | undefined;
  readonly run?: ProcessRunner | undefined;
  readonly now?: (() => number) | undefined;
  readonly timeoutMs?: number | undefined;
  /** yt-dlp processes running at once; more wait their turn. */
  readonly concurrency?: number | undefined;
  /** Requests that may wait for a turn; more are refused. */
  readonly maxWaiting?: number | undefined;
  readonly log?: YoutubeLog | undefined;
}

interface CachedStream {
  readonly url: string;
  readonly usableUntil: number;
}

/**
 * YouTube through the yt-dlp program on the host. Member text never reaches a
 * shell: searches are one `ytsearchN:<text>` argument, and videos are always
 * the watch address built from a checked 11-character ID.
 */
export class YtDlpYoutubeSource implements YoutubeSource {
  private readonly run: ProcessRunner;
  private readonly now: () => number;
  private readonly timeoutMs: number;
  private readonly concurrency: number;
  private readonly maxWaiting: number;
  private readonly log: YoutubeLog;
  private readonly baseArgs: readonly string[];
  private readonly streams = new Map<string, CachedStream>();
  private readonly resolving = new Map<string, Promise<YoutubeStream>>();
  private readonly waiting: (() => void)[] = [];
  private active = 0;
  private binary: string | undefined;
  private locatedAt = Number.NEGATIVE_INFINITY;

  public constructor(private readonly options: YtDlpYoutubeOptions) {
    this.run = options.run ?? runProcess;
    this.now = options.now ?? Date.now;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.concurrency = Math.max(1, options.concurrency ?? DEFAULT_CONCURRENCY);
    this.maxWaiting = Math.max(0, options.maxWaiting ?? DEFAULT_MAX_WAITING);
    this.log = options.log ?? { warn: () => undefined };
    const jsRuntime = options.jsRuntime ?? `node:${process.execPath}`;
    this.baseArgs = [
      "--ignore-config", "--no-warnings", "--no-playlist", "--socket-timeout", "10",
      ...(jsRuntime ? ["--js-runtimes", jsRuntime] : []),
      ...(options.cookiesFile ? ["--cookies", options.cookiesFile] : []),
      ...(options.extraArgs ?? []),
    ];
  }

  public get available(): boolean {
    return this.locate() !== undefined;
  }

  public async search(query: string, limit = 5): Promise<readonly YoutubeVideo[]> {
    const text = cleanYoutubeQuery(query);
    if (!text) return [];
    const count = Math.min(YOUTUBE_SEARCH_LIMIT, Math.max(1, Math.floor(limit)));
    const result = await this.execute(["--flat-playlist", "--print", FIELDS, "--", `ytsearch${count}:${text}`]);
    const rows = parseYoutubeRows(result.stdout);
    if (rows.length === 0 && result.code !== 0) throw this.failure(result, { query: text });
    return rows.slice(0, count).map(video);
  }

  public async first(query: string): Promise<YoutubeVideo> {
    const text = cleanYoutubeQuery(query);
    if (!text) throw new MusicError("INVALID_INPUT", "Type a song name to search YouTube.");
    const result = await this.execute(["-f", AUDIO_FORMAT, "--print", FIELDS, "--", `ytsearch1:${text}`]);
    const [row] = parseYoutubeRows(result.stdout);
    if (!row) {
      if (result.code !== 0) throw this.failure(result, { query: text });
      throw new MusicError("NOT_FOUND", `YouTube has no results for "${text.slice(0, 80)}".`);
    }
    this.remember(row);
    return video(row);
  }

  public async video(id: string): Promise<YoutubeVideo> {
    const row = await this.lookup(id);
    this.remember(row);
    return video(row);
  }

  public stream(id: string): Promise<YoutubeStream> {
    if (!YOUTUBE_ID.test(id)) return Promise.reject(new MusicError("INVALID_INPUT", "That is not a YouTube video."));
    const cached = this.streams.get(id);
    if (cached && this.now() < cached.usableUntil) return Promise.resolve({ url: cached.url, cached: true });
    this.streams.delete(id);
    const pending = this.resolving.get(id);
    if (pending) return pending;
    const lookup = this.lookup(id)
      .then((row) => {
        const url = this.remember(row);
        if (!url) {
          this.log.warn("yt-dlp did not return a usable stream address.", { videoId: id });
          throw new MusicError("DEPENDENCY_UNAVAILABLE", YOUTUBE_FAILED_MESSAGE);
        }
        return { url, cached: false };
      })
      .finally(() => this.resolving.delete(id));
    this.resolving.set(id, lookup);
    return lookup;
  }

  public forget(id: string): void {
    this.streams.delete(id);
  }

  /** One video with its audio stream address. */
  private async lookup(id: string): Promise<YtDlpRow> {
    const result = await this.execute(["-f", AUDIO_FORMAT, "--print", FIELDS, "--", youtubeWatchUrl(id)]);
    const row = parseYoutubeRows(result.stdout).find((item) => item.id === id);
    if (!row) throw this.failure(result, { videoId: id });
    return row;
  }

  /** Keeps a row's stream address until shortly before it expires. Returns it when it is safe to play. */
  private remember(row: YtDlpRow): string | undefined {
    if (!row.url || !isStreamUrl(row.url)) return undefined;
    const now = this.now();
    const expiry = youtubeStreamExpiry(row.url);
    this.streams.delete(row.id);
    this.streams.set(row.id, { url: row.url, usableUntil: expiry === undefined ? now + FALLBACK_TTL_MS : expiry - EXPIRY_MARGIN_MS });
    for (const [id, stream] of this.streams) {
      if (this.streams.size <= CACHE_LIMIT && stream.usableUntil > now) break;
      if (id !== row.id) this.streams.delete(id);
    }
    return row.url;
  }

  private locate(): string | undefined {
    const source = this.options.binary;
    if (typeof source !== "function") return source;
    if (this.binary && isFile(this.binary)) return this.binary;
    if (this.now() - this.locatedAt < LOCATE_RETRY_MS) return undefined;
    this.locatedAt = this.now();
    this.binary = source();
    return this.binary;
  }

  private async execute(args: readonly string[]): Promise<ProcessResult> {
    const binary = this.locate();
    if (!binary) throw new MusicError("DEPENDENCY_UNAVAILABLE", YOUTUBE_UNAVAILABLE_MESSAGE);
    await this.acquire();
    let result: ProcessResult;
    try {
      result = await this.run(binary, [...this.baseArgs, ...args], { timeoutMs: this.timeoutMs, maxBytes: MAX_OUTPUT_BYTES });
    } catch (error) {
      this.log.warn("yt-dlp could not be started.", { err: error });
      throw new MusicError("DEPENDENCY_UNAVAILABLE", YOUTUBE_FAILED_MESSAGE);
    } finally {
      this.release();
    }
    if (result.timedOut) {
      this.log.warn("yt-dlp timed out.", { timeoutMs: this.timeoutMs });
      throw new MusicError("DEPENDENCY_UNAVAILABLE", YOUTUBE_TIMEOUT_MESSAGE);
    }
    return result;
  }

  private failure(result: ProcessResult, details: Readonly<Record<string, unknown>>): MusicError {
    this.log.warn("yt-dlp failed.", { ...details, exitCode: result.code, truncated: result.truncated, stderr: result.stderr.trim().slice(-1000) });
    return youtubeError(result.stderr);
  }

  private acquire(): Promise<void> {
    if (this.active < this.concurrency) {
      this.active += 1;
      return Promise.resolve();
    }
    if (this.waiting.length >= this.maxWaiting) return Promise.reject(new MusicError("LIMIT_REACHED", YOUTUBE_BUSY_MESSAGE));
    return new Promise((resolve) => this.waiting.push(resolve));
  }

  /** Hands the slot to the next waiting request, or frees it. */
  private release(): void {
    const next = this.waiting.shift();
    if (next) next();
    else this.active -= 1;
  }
}

function video(row: YtDlpRow): YoutubeVideo {
  const { url: _url, ...rest } = row;
  return rest;
}

/** Only public https addresses are handed to ffmpeg. */
function isStreamUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !isPrivateHost(url.hostname);
  } catch {
    return false;
  }
}

function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

export interface YoutubeHostOptions {
  /** YTDLP_PATH. */
  readonly ytDlpPath?: string | undefined;
  /** YOUTUBE_COOKIES_FILE. */
  readonly cookiesFile?: string | undefined;
  readonly concurrency?: number | undefined;
  readonly log?: YoutubeLog | undefined;
}

/** The YouTube source for this host, from its environment settings. */
export function createYoutubeSource(options: YoutubeHostOptions = {}): YtDlpYoutubeSource {
  const cookiesFile = options.cookiesFile?.trim() || undefined;
  const usable = cookiesFile !== undefined && isFile(cookiesFile);
  if (cookiesFile && !usable) options.log?.warn("YOUTUBE_COOKIES_FILE does not point at a file, so YouTube runs without cookies.", { cookiesFile });
  return new YtDlpYoutubeSource({
    binary: () => findYtDlp(options.ytDlpPath?.trim() || undefined),
    cookiesFile: usable ? cookiesFile : undefined,
    concurrency: options.concurrency,
    log: options.log,
  });
}
