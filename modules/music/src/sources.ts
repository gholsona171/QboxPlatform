import { BRAND } from "@qbox/shared/brand";

import type { JamendoCatalog, JamendoTrack, LinkResolver, MusicProbe, RadioDirectory, RadioStation, ResolvedLink } from "./types.js";
import { MusicError, TEXT_LIMIT, extensionOf } from "./validation.js";

export type Fetch = typeof fetch;

const TIMEOUT_MS = 8_000;
const PLAYLIST_BYTES = 64 * 1024;
export const USER_AGENT = `${BRAND.name}/1.0`;
export const RADIO_BROWSER_URL = "https://de1.api.radio-browser.info";
export const JAMENDO_URL = "https://api.jamendo.com/v3.0";

/** Shown for Spotify, Apple Music and YouTube links. */
export const STREAMING_SERVICE_MESSAGE = "Spotify, Apple Music and YouTube do not allow bots to play their music. Use Discord's Listen Along for Spotify, or upload the file.";
/** Shown for web pages and anything else that is not audio. */
export const NOT_AUDIO_MESSAGE = "That link is a web page, not audio. Only direct audio links work: a link to an .mp3, .ogg, .m4a, .flac or .wav file, or to a radio stream.";

const AUDIO_EXTENSIONS = new Set(["mp3", "ogg", "oga", "opus", "m4a", "aac", "flac", "wav"]);
const PLAYLIST_TYPES = new Set(["audio/x-mpegurl", "audio/mpegurl", "audio/x-scpls", "application/pls+xml"]);
const HLS_TYPES = new Set(["application/vnd.apple.mpegurl", "application/x-mpegurl"]);

const SERVICES: readonly { readonly hosts: RegExp; readonly name?: string }[] = [
  { hosts: /(^|\.)(spotify\.com|spotify\.link|spoti\.fi)$/ },
  { hosts: /(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/ },
  { hosts: /(^|\.)(music\.apple\.com|itunes\.apple\.com)$/ },
  { hosts: /(^|\.)(soundcloud\.com|snd\.sc)$/, name: "SoundCloud" },
  { hosts: /(^|\.)deezer\.(com|page\.link)$/, name: "Deezer" },
  { hosts: /(^|\.)tidal\.com$/, name: "TIDAL" },
  { hosts: /(^|\.)music\.amazon\.[a-z.]+$/, name: "Amazon Music" },
];

/** The plain explanation for a streaming-service link, or undefined for any other link. */
export function streamingServiceMessage(url: URL): string | undefined {
  const host = url.hostname.toLowerCase();
  const service = SERVICES.find((item) => item.hosts.test(host));
  if (!service) return undefined;
  return service.name ? `${service.name} does not allow bots to play its music. Upload the file instead.` : STREAMING_SERVICE_MESSAGE;
}

/** True for localhost and private, link-local, or loopback address literals. */
export function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  if (host.includes(":")) return host === "::" || host === "::1" || /^f[cd]/.test(host) || /^fe[89ab]/.test(host) || host.startsWith("::ffff:");
  return false;
}

/** Parses a link typed by a member. Throws a plain MusicError for anything that cannot be played. */
export function parseAudioUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new MusicError("INVALID_INPUT", "That is not a valid link.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new MusicError("INVALID_INPUT", "Only http and https links work.");
  const service = streamingServiceMessage(url);
  if (service) throw new MusicError("INVALID_INPUT", service);
  if (isPrivateHost(url.hostname)) throw new MusicError("INVALID_INPUT", "Links to local or private addresses are not allowed.");
  return url;
}

/** First entry of an .m3u or .pls playlist, resolved against the playlist's own URL. */
export function firstPlaylistEntry(text: string, base: string): string | undefined {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const pls = lines.find((line) => /^file\d+\s*=/i.test(line));
  const entry = pls ? pls.replace(/^file\d+\s*=\s*/i, "") : lines.find((line) => !line.startsWith("#") && !line.startsWith("["));
  if (!entry) return undefined;
  try {
    return new URL(entry, base).toString();
  } catch {
    return undefined;
  }
}

/** A readable title from a link: the file name without its extension, else the host. */
export function titleFromUrl(url: URL): string {
  const last = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() ?? "").replace(/\.[a-z0-9]{1,5}$/i, "").replace(/[_+]/g, " ").trim();
  return (last || url.hostname).slice(0, TEXT_LIMIT);
}

async function timed(fetchImpl: Fetch, url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetchImpl(url, { ...init, redirect: "follow", signal: controller.signal, headers: { "user-agent": USER_AGENT, ...(init.headers as Record<string, string> | undefined) } });
  } catch (error) {
    if (error instanceof MusicError) throw error;
    throw new MusicError("DEPENDENCY_UNAVAILABLE", `Could not reach ${new URL(url).hostname}.`);
  } finally {
    clearTimeout(timer);
  }
}

async function limitedText(response: Response, limit: number): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return response.text();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < limit) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
  }
  await reader.cancel().catch(() => undefined);
  return Buffer.concat(chunks).toString("utf8").slice(0, limit);
}

/**
 * Direct links: audio files by extension, anything served as audio, and the
 * first entry of .m3u/.pls playlists. Web pages are refused.
 */
export class HttpLinkResolver implements LinkResolver {
  public constructor(
    private readonly fetchImpl: Fetch = fetch,
    private readonly probe?: MusicProbe | undefined,
  ) {}

  public async resolve(raw: string): Promise<ResolvedLink> {
    return this.resolveUrl(parseAudioUrl(raw), 0);
  }

  private async resolveUrl(url: URL, depth: number): Promise<ResolvedLink> {
    const extension = extensionOf(url.pathname);
    if (extension === "m3u" || extension === "pls") return this.fromPlaylist(url, await timed(this.fetchImpl, url.toString()), depth);
    if (extension === "m3u8") return { url: url.toString(), title: titleFromUrl(url), durationSeconds: null, seekable: false };
    if (AUDIO_EXTENSIONS.has(extension)) return this.file(url, titleFromUrl(url));
    const response = await timed(this.fetchImpl, url.toString());
    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      throw new MusicError("INVALID_INPUT", `That link answered with an error (${response.status}).`);
    }
    const type = (response.headers.get("content-type") ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
    if (PLAYLIST_TYPES.has(type)) return this.fromPlaylist(url, response, depth);
    await response.body?.cancel().catch(() => undefined);
    if (HLS_TYPES.has(type)) return { url: url.toString(), title: titleFromUrl(url), durationSeconds: null, seekable: false };
    if (!type.startsWith("audio/") && type !== "application/ogg") throw new MusicError("INVALID_INPUT", NOT_AUDIO_MESSAGE);
    const stationName = response.headers.get("icy-name")?.trim();
    const live = stationName !== undefined || response.headers.get("content-length") === null;
    if (live) return { url: url.toString(), title: (stationName || url.hostname).slice(0, TEXT_LIMIT), durationSeconds: null, seekable: false };
    return this.file(url, titleFromUrl(url));
  }

  private async fromPlaylist(url: URL, response: Response, depth: number): Promise<ResolvedLink> {
    if (!response.ok) throw new MusicError("INVALID_INPUT", `That playlist answered with an error (${response.status}).`);
    const first = firstPlaylistEntry(await limitedText(response, PLAYLIST_BYTES), url.toString());
    if (!first) throw new MusicError("INVALID_INPUT", "That playlist has no entries.");
    if (depth > 0) throw new MusicError("INVALID_INPUT", "That playlist only points to another playlist.");
    const entry = await this.resolveUrl(parseAudioUrl(first), depth + 1);
    return { ...entry, title: entry.title === new URL(entry.url).hostname ? titleFromUrl(url) : entry.title };
  }

  /** A remote file: ffprobe gives the length when available; unknown lengths play as live. */
  private async file(url: URL, title: string): Promise<ResolvedLink> {
    const tags = await this.probe?.probe(url.toString());
    const duration = tags?.durationSeconds ?? null;
    return { url: url.toString(), title: tags?.title ?? title, durationSeconds: duration, seekable: duration !== null };
  }
}

interface RadioBrowserRow {
  readonly stationuuid?: string;
  readonly name?: string;
  readonly url?: string;
  readonly url_resolved?: string;
  readonly favicon?: string;
  readonly tags?: string;
  readonly countrycode?: string;
  readonly codec?: string;
  readonly bitrate?: number;
}

/** Maps Radio Browser station JSON. Skips rows without a name or a usable stream URL. */
export function parseRadioStations(rows: unknown): readonly RadioStation[] {
  if (!Array.isArray(rows)) return [];
  return (rows as RadioBrowserRow[]).flatMap((row) => {
    const url = (row.url_resolved || row.url || "").trim();
    const name = (row.name ?? "").trim();
    if (!row.stationuuid || !name || !/^https?:\/\//i.test(url)) return [];
    return [{
      id: row.stationuuid,
      name: name.slice(0, TEXT_LIMIT),
      url,
      ...(row.favicon && /^https?:\/\//i.test(row.favicon) ? { faviconUrl: row.favicon } : {}),
      tags: (row.tags ?? "").split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 10),
      ...(row.countrycode ? { country: row.countrycode } : {}),
      ...(row.codec ? { codec: row.codec } : {}),
      ...(row.bitrate ? { bitrate: row.bitrate } : {}),
    }];
  });
}

/** The free Radio Browser directory (radio-browser.info). */
export class RadioBrowserDirectory implements RadioDirectory {
  public constructor(
    private readonly fetchImpl: Fetch = fetch,
    private readonly baseUrl = RADIO_BROWSER_URL,
  ) {}

  public async search(name: string): Promise<readonly RadioStation[]> {
    const query = name.trim();
    if (!query) return [];
    const url = `${this.baseUrl}/json/stations/search?name=${encodeURIComponent(query.slice(0, 100))}&limit=20&hidebroken=true`;
    const response = await timed(this.fetchImpl, url, { headers: { accept: "application/json" } });
    if (!response.ok) throw new MusicError("DEPENDENCY_UNAVAILABLE", "The radio directory is not answering right now.");
    return parseRadioStations(await response.json());
  }
}

interface JamendoRow {
  readonly id?: string | number;
  readonly name?: string;
  readonly artist_name?: string;
  readonly album_name?: string;
  readonly duration?: number | string;
  readonly audio?: string;
  readonly image?: string;
}

/** Maps Jamendo `tracks` JSON. */
export function parseJamendoTracks(body: unknown): readonly JamendoTrack[] {
  const rows = body && typeof body === "object" && Array.isArray((body as { results?: unknown }).results) ? ((body as { results: JamendoRow[] }).results) : [];
  return rows.flatMap((row) => {
    if (row.id === undefined || !row.name || !row.audio) return [];
    return [{
      id: String(row.id),
      title: row.name.slice(0, TEXT_LIMIT),
      artist: (row.artist_name ?? "Unknown artist").slice(0, TEXT_LIMIT),
      ...(row.album_name ? { album: row.album_name.slice(0, TEXT_LIMIT) } : {}),
      durationSeconds: Number(row.duration) || 0,
      url: row.audio,
      ...(row.image ? { imageUrl: row.image } : {}),
    }];
  });
}

/** Jamendo's Creative Commons catalog. Unavailable without a client ID. */
export class JamendoApiCatalog implements JamendoCatalog {
  public readonly available: boolean;

  public constructor(
    private readonly clientId: string,
    private readonly fetchImpl: Fetch = fetch,
    private readonly baseUrl = JAMENDO_URL,
  ) {
    this.available = clientId.trim().length > 0;
  }

  public async search(query: string): Promise<readonly JamendoTrack[]> {
    if (!query.trim()) return [];
    return this.tracks(`search=${encodeURIComponent(query.trim().slice(0, 100))}&limit=20`);
  }

  public async track(id: string): Promise<JamendoTrack | undefined> {
    if (!/^\d{1,12}$/.test(id)) return undefined;
    return (await this.tracks(`id=${id}`))[0];
  }

  private async tracks(filter: string): Promise<readonly JamendoTrack[]> {
    if (!this.available) throw new MusicError("DEPENDENCY_UNAVAILABLE", "Jamendo is not set up on this host.");
    const url = `${this.baseUrl}/tracks/?client_id=${encodeURIComponent(this.clientId)}&format=json&audioformat=mp32&${filter}`;
    const response = await timed(this.fetchImpl, url, { headers: { accept: "application/json" } });
    if (!response.ok) throw new MusicError("DEPENDENCY_UNAVAILABLE", "Jamendo is not answering right now.");
    return parseJamendoTracks(await response.json());
  }
}
