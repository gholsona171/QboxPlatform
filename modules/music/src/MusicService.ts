import { createHash, randomUUID } from "node:crypto";

import { parseAudioUrl } from "./sources.js";
import type {
  JamendoCatalog,
  JamendoTrack,
  LinkResolver,
  MusicLibraryUsage,
  MusicPlaylist,
  MusicProbe,
  MusicQueueEntry,
  MusicRepository,
  MusicSettings,
  MusicSettingsInput,
  MusicStation,
  MusicStorage,
  MusicTrack,
  MusicTrackPatch,
  RadioDirectory,
  RadioStation,
} from "./types.js";
import {
  DESCRIPTION_LIMIT,
  MAX_FILE_BYTES,
  MAX_PLAYLISTS,
  MAX_PLAYLIST_TRACKS,
  MAX_STATIONS,
  MusicError,
  isUuid,
  optionalText,
  requireSnowflake,
  requiredText,
  tagsFromFileName,
  uploadExtension,
  validateSettings,
} from "./validation.js";

export const DEFAULT_QUOTA_BYTES = 2048 * 1024 * 1024;

export function defaultMusicSettings(guildId: string): MusicSettings {
  return {
    guildId,
    enabled: false,
    djRoleIds: [],
    defaultVolume: 60,
    maxQueue: 100,
    nowPlayingPanel: true,
    stayConnected247: false,
    autoLeaveMinutes: 5,
    revision: 0,
  };
}

export interface MusicUpload {
  readonly guildId: string;
  /** File name as the browser sent it; used for the extension and fallback title only. */
  readonly fileName: string;
  readonly contentType: string;
  readonly data: Buffer;
  readonly uploadedBy?: string | undefined;
}

export interface MusicUploadResult {
  readonly track: MusicTrack;
  /** The same file was already in the library; nothing new was stored. */
  readonly duplicate: boolean;
}

export interface MusicServiceOptions {
  readonly storage: MusicStorage;
  readonly probe?: MusicProbe | undefined;
  readonly links?: LinkResolver | undefined;
  readonly radio?: RadioDirectory | undefined;
  readonly jamendo?: JamendoCatalog | undefined;
  /** Library size limit per server. */
  readonly quotaBytes?: number | undefined;
  readonly newId?: (() => string) | undefined;
}

/** One autocomplete choice: the value is a `library:`, `playlist:` or `station:` reference. */
export interface MusicSuggestion {
  readonly name: string;
  readonly value: string;
}

export interface MusicPlaylistDetail extends MusicPlaylist {
  readonly tracks: readonly MusicTrack[];
  /** Library track whose cover stands for the playlist. */
  readonly coverTrackId?: string | undefined;
  readonly durationSeconds: number;
}

/**
 * Music rules: settings, the uploaded library, playlists, saved stations, and
 * turning what a member asks for into playable queue entries. Playback lives
 * in `MusicController`; permission checks happen before the service is called.
 */
export class MusicService {
  public readonly quotaBytes: number;
  private readonly storage: MusicStorage;
  private readonly probe: MusicProbe | undefined;
  private readonly links: LinkResolver | undefined;
  private readonly radio: RadioDirectory | undefined;
  private readonly jamendo: JamendoCatalog | undefined;
  private readonly newId: () => string;

  public constructor(
    private readonly repository: MusicRepository,
    options: MusicServiceOptions,
  ) {
    this.storage = options.storage;
    this.probe = options.probe;
    this.links = options.links;
    this.radio = options.radio;
    this.jamendo = options.jamendo;
    this.quotaBytes = options.quotaBytes ?? DEFAULT_QUOTA_BYTES;
    this.newId = options.newId ?? randomUUID;
  }

  public get jamendoAvailable(): boolean {
    return this.jamendo?.available ?? false;
  }

  /* ---------- Settings ---------- */

  public async settings(guildId: string): Promise<MusicSettings> {
    requireSnowflake("guildId", guildId);
    return (await this.repository.getSettings(guildId)) ?? defaultMusicSettings(guildId);
  }

  public async saveSettings(input: MusicSettingsInput): Promise<MusicSettings> {
    validateSettings(input);
    if (input.idleRadioStationId && !(await this.repository.getStation(input.guildId, input.idleRadioStationId)))
      throw new MusicError("INVALID_INPUT", "The idle radio station is not saved any more. Pick another one.");
    return this.repository.saveSettings({ ...input, djRoleIds: [...new Set(input.djRoleIds)] });
  }

  /* ---------- Library ---------- */

  public async library(guildId: string): Promise<readonly MusicTrack[]> {
    requireSnowflake("guildId", guildId);
    return this.repository.listTracks(guildId);
  }

  public async usage(guildId: string): Promise<MusicLibraryUsage> {
    requireSnowflake("guildId", guildId);
    return this.repository.libraryUsage(guildId);
  }

  public async track(guildId: string, id: string): Promise<MusicTrack> {
    requireSnowflake("guildId", guildId);
    const track = isUuid(id) ? await this.repository.getTrack(guildId, id) : undefined;
    if (!track) throw new MusicError("NOT_FOUND", "That song is not in the library.");
    return track;
  }

  /** Stores an upload, reading tags and cover art when ffprobe is available. Duplicates are not stored twice. */
  public async upload(input: MusicUpload): Promise<MusicUploadResult> {
    requireSnowflake("guildId", input.guildId);
    if (input.data.length === 0) throw new MusicError("INVALID_INPUT", "That file is empty.");
    if (input.data.length > MAX_FILE_BYTES) throw new MusicError("LIMIT_REACHED", "Files can be at most 50 MB.");
    const extension = uploadExtension(input.fileName, input.contentType);
    const sha256 = createHash("sha256").update(input.data).digest("hex");
    const existing = await this.repository.findTrackByHash(input.guildId, sha256);
    if (existing) return { track: existing, duplicate: true };
    const usage = await this.repository.libraryUsage(input.guildId);
    if (usage.bytes + input.data.length > this.quotaBytes)
      throw new MusicError("LIMIT_REACHED", `The library is full (${formatBytes(this.quotaBytes)} per server). Delete some songs first.`);

    const id = this.newId();
    const fileName = `${id}.${extension}`;
    await this.storage.write(input.guildId, fileName, input.data);
    let coverFileName: string | undefined;
    try {
      const path = this.storage.path(input.guildId, fileName);
      const tags = await this.probe?.probe(path);
      if (tags?.cover) {
        const name = `${id}.${tags.cover.extension}`;
        if (await this.probe?.extractCover(path, tags.cover.streamIndex, this.storage.path(input.guildId, name))) coverFileName = name;
      }
      const fallback = tagsFromFileName(input.fileName);
      const track = await this.repository.createTrack({
        id,
        guildId: input.guildId,
        title: tags?.title ?? fallback.title,
        artist: tags?.artist ?? fallback.artist,
        album: tags?.album,
        trackNumber: tags?.trackNumber,
        durationSeconds: tags?.durationSeconds,
        fileName,
        coverFileName,
        contentType: input.contentType.split(";")[0]?.trim().toLowerCase() || "application/octet-stream",
        sizeBytes: input.data.length,
        sha256,
        originalName: input.fileName.replace(/^.*[\\/]/, "").slice(0, 255) || fileName,
        uploadedBy: input.uploadedBy,
      });
      return { track, duplicate: false };
    } catch (error) {
      await this.storage.remove(input.guildId, fileName).catch(() => undefined);
      if (coverFileName) await this.storage.remove(input.guildId, coverFileName).catch(() => undefined);
      throw error;
    }
  }

  public async updateTrack(guildId: string, id: string, patch: MusicTrackPatch): Promise<MusicTrack> {
    const track = await this.track(guildId, id);
    return this.repository.updateTrack(guildId, track.id, {
      title: requiredText("Title", patch.title),
      artist: optionalText("Artist", patch.artist),
      album: optionalText("Album", patch.album),
    });
  }

  public async deleteTrack(guildId: string, id: string): Promise<void> {
    const track = await this.track(guildId, id);
    await this.repository.deleteTrack(guildId, track.id);
    await this.storage.remove(guildId, track.fileName).catch(() => undefined);
    if (track.coverFileName) await this.storage.remove(guildId, track.coverFileName).catch(() => undefined);
  }

  /** The cover image of a library track. */
  public async cover(guildId: string, id: string): Promise<{ readonly data: Buffer; readonly contentType: string }> {
    const track = await this.track(guildId, id);
    if (!track.coverFileName) throw new MusicError("NOT_FOUND", "That song has no cover art.");
    const data = await this.storage.read(guildId, track.coverFileName).catch(() => {
      throw new MusicError("NOT_FOUND", "That song has no cover art.");
    });
    return { data, contentType: track.coverFileName.endsWith(".png") ? "image/png" : "image/jpeg" };
  }

  /* ---------- Playlists ---------- */

  public async playlists(guildId: string): Promise<readonly MusicPlaylistDetail[]> {
    requireSnowflake("guildId", guildId);
    const [playlists, tracks] = await Promise.all([this.repository.listPlaylists(guildId), this.repository.listTracks(guildId)]);
    const byId = new Map(tracks.map((track) => [track.id, track]));
    return playlists.map((playlist) => detail(playlist, byId));
  }

  public async playlist(guildId: string, id: string): Promise<MusicPlaylistDetail> {
    requireSnowflake("guildId", guildId);
    const playlist = isUuid(id) ? await this.repository.getPlaylist(guildId, id) : undefined;
    if (!playlist) throw new MusicError("NOT_FOUND", "That playlist does not exist.");
    const tracks = await this.repository.listTracks(guildId);
    return detail(playlist, new Map(tracks.map((track) => [track.id, track])));
  }

  public async createPlaylist(guildId: string, name: string, description?: string | undefined): Promise<MusicPlaylist> {
    requireSnowflake("guildId", guildId);
    const clean = requiredText("Playlist name", name, 100);
    const existing = await this.repository.listPlaylists(guildId);
    if (existing.length >= MAX_PLAYLISTS) throw new MusicError("LIMIT_REACHED", `You can have up to ${MAX_PLAYLISTS} playlists.`);
    if (existing.some((item) => item.name.toLowerCase() === clean.toLowerCase())) throw new MusicError("CONFLICT", `There is already a playlist called ${clean}.`);
    return this.repository.createPlaylist({ guildId, name: clean, description: optionalText("Description", description, DESCRIPTION_LIMIT) });
  }

  public async updatePlaylist(guildId: string, id: string, name: string, description?: string | undefined): Promise<MusicPlaylist> {
    const playlist = await this.playlist(guildId, id);
    const clean = requiredText("Playlist name", name, 100);
    const existing = await this.repository.listPlaylists(guildId);
    if (existing.some((item) => item.id !== playlist.id && item.name.toLowerCase() === clean.toLowerCase())) throw new MusicError("CONFLICT", `There is already a playlist called ${clean}.`);
    return this.repository.updatePlaylist(guildId, playlist.id, { guildId, name: clean, description: optionalText("Description", description, DESCRIPTION_LIMIT) });
  }

  /** Replaces a playlist's songs, in order. Every ID must be in the library. */
  public async setPlaylistTracks(guildId: string, id: string, trackIds: readonly string[]): Promise<MusicPlaylist> {
    const playlist = await this.playlist(guildId, id);
    if (trackIds.length > MAX_PLAYLIST_TRACKS) throw new MusicError("LIMIT_REACHED", `A playlist can hold up to ${MAX_PLAYLIST_TRACKS} songs.`);
    const library = new Set((await this.repository.listTracks(guildId)).map((track) => track.id));
    if (trackIds.some((trackId) => !library.has(trackId))) throw new MusicError("INVALID_INPUT", "Some of those songs are not in the library any more. Reload and try again.");
    return this.repository.setPlaylistTracks(guildId, playlist.id, trackIds);
  }

  /** Adds songs to the end of a playlist, skipping ones already on it. */
  public async addToPlaylist(guildId: string, id: string, trackIds: readonly string[]): Promise<MusicPlaylist> {
    const playlist = await this.playlist(guildId, id);
    return this.setPlaylistTracks(guildId, playlist.id, [...playlist.trackIds, ...trackIds.filter((trackId, at) => !playlist.trackIds.includes(trackId) && trackIds.indexOf(trackId) === at)]);
  }

  public async deletePlaylist(guildId: string, id: string): Promise<void> {
    const playlist = await this.playlist(guildId, id);
    await this.repository.deletePlaylist(guildId, playlist.id);
  }

  /* ---------- Stations ---------- */

  public async stations(guildId: string): Promise<readonly MusicStation[]> {
    requireSnowflake("guildId", guildId);
    return this.repository.listStations(guildId);
  }

  public async saveStation(guildId: string, input: { readonly name: string; readonly url: string; readonly faviconUrl?: string | undefined; readonly tags?: readonly string[] | undefined }): Promise<MusicStation> {
    requireSnowflake("guildId", guildId);
    const url = parseAudioUrl(input.url).toString();
    const existing = await this.repository.listStations(guildId);
    if (existing.length >= MAX_STATIONS) throw new MusicError("LIMIT_REACHED", `You can save up to ${MAX_STATIONS} stations.`);
    const duplicate = existing.find((station) => station.url === url);
    if (duplicate) throw new MusicError("CONFLICT", `${duplicate.name} is already saved.`);
    const favicon = input.faviconUrl && /^https:\/\//i.test(input.faviconUrl) && input.faviconUrl.length <= 500 ? input.faviconUrl : undefined;
    return this.repository.createStation({
      guildId,
      name: requiredText("Station name", input.name),
      url,
      faviconUrl: favicon,
      tags: (input.tags ?? []).map((tag) => tag.trim().slice(0, 40)).filter(Boolean).slice(0, 10),
    });
  }

  public async deleteStation(guildId: string, id: string): Promise<void> {
    requireSnowflake("guildId", guildId);
    if (!isUuid(id) || !(await this.repository.deleteStation(guildId, id))) throw new MusicError("NOT_FOUND", "That station is not saved.");
  }

  public async station(guildId: string, id: string): Promise<MusicStation> {
    const station = isUuid(id) ? await this.repository.getStation(guildId, id) : undefined;
    if (!station) throw new MusicError("NOT_FOUND", "That station is not saved.");
    return station;
  }

  /* ---------- Search ---------- */

  public async searchRadio(name: string): Promise<readonly RadioStation[]> {
    if (!this.radio) throw new MusicError("DEPENDENCY_UNAVAILABLE", "Radio search is not available right now.");
    return this.radio.search(name);
  }

  public async searchJamendo(query: string): Promise<readonly JamendoTrack[]> {
    if (!this.jamendo?.available) throw new MusicError("DEPENDENCY_UNAVAILABLE", "Jamendo is not set up on this host.");
    return this.jamendo.search(query);
  }

  /** Autocomplete choices for `/music play` and `/music playlist`. */
  public async suggest(guildId: string, text: string, kinds: readonly ("library" | "playlist" | "station")[] = ["library", "playlist", "station"]): Promise<readonly MusicSuggestion[]> {
    const needle = text.trim().toLowerCase();
    const matches = (value: string) => !needle || value.toLowerCase().includes(needle);
    const results: MusicSuggestion[] = [];
    if (kinds.includes("playlist"))
      for (const playlist of await this.repository.listPlaylists(guildId)) if (matches(playlist.name)) results.push({ name: `Playlist: ${playlist.name}`, value: `playlist:${playlist.id}` });
    if (kinds.includes("station"))
      for (const station of await this.repository.listStations(guildId)) if (matches(station.name)) results.push({ name: `Radio: ${station.name}`, value: `station:${station.id}` });
    if (kinds.includes("library"))
      for (const track of await this.repository.listTracks(guildId))
        if (matches(`${track.title} ${track.artist ?? ""} ${track.album ?? ""}`)) results.push({ name: track.artist ? `${track.title} - ${track.artist}` : track.title, value: `library:${track.id}` });
    return results.slice(0, 25).map((item) => ({ name: item.name.slice(0, 100), value: item.value }));
  }

  /**
   * Turns a play request into queue entries: `library:`, `playlist:`,
   * `station:`, `radio:` and `jamendo:` references, direct links, or words
   * matched against the library, playlists and saved stations.
   */
  public async resolve(guildId: string, query: string, options: { readonly requestedBy?: string | undefined; readonly title?: string | undefined } = {}): Promise<readonly MusicQueueEntry[]> {
    requireSnowflake("guildId", guildId);
    const text = query.trim();
    if (!text) throw new MusicError("INVALID_INPUT", "Tell me what to play: a song from the library, a playlist, a station, or a direct audio link.");
    const requestedBy = options.requestedBy;
    const reference = /^(library|playlist|station|radio|jamendo):(.+)$/.exec(text);
    if (reference) {
      const [, kind, value] = reference as unknown as [string, string, string];
      if (kind === "library") return [this.trackEntry(await this.track(guildId, value), requestedBy)];
      if (kind === "playlist") return this.playlistEntries(guildId, value, requestedBy);
      if (kind === "station") return [this.stationEntry(await this.station(guildId, value), requestedBy)];
      if (kind === "jamendo") return [this.jamendoEntry(await this.jamendoTrack(value), requestedBy)];
      const url = parseAudioUrl(value).toString();
      return [this.stationEntry({ name: optionalText("Station name", options.title) ?? new URL(url).hostname, url }, requestedBy)];
    }
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(text) || /^www\./i.test(text)) {
      if (!this.links) throw new MusicError("DEPENDENCY_UNAVAILABLE", "Links cannot be played right now.");
      const link = await this.links.resolve(/^www\./i.test(text) ? `https://${text}` : text);
      return [{
        id: this.newId(),
        source: "link",
        title: optionalText("Title", options.title) ?? link.title,
        durationSeconds: link.durationSeconds,
        seekable: link.seekable,
        url: link.url,
        requestedBy,
      }];
    }
    const needle = text.toLowerCase();
    const tracks = await this.repository.listTracks(guildId);
    const score = (track: MusicTrack) => {
      const title = track.title.toLowerCase();
      const full = `${title} ${track.artist?.toLowerCase() ?? ""} ${track.album?.toLowerCase() ?? ""}`;
      return title === needle ? 3 : title.startsWith(needle) ? 2 : full.includes(needle) ? 1 : 0;
    };
    const best = tracks.map((track) => ({ track, score: score(track) })).filter((item) => item.score > 0).sort((left, right) => right.score - left.score)[0];
    if (best) return [this.trackEntry(best.track, requestedBy)];
    const playlist = (await this.repository.listPlaylists(guildId)).find((item) => item.name.toLowerCase() === needle);
    if (playlist) return this.playlistEntries(guildId, playlist.id, requestedBy);
    const station = (await this.repository.listStations(guildId)).find((item) => item.name.toLowerCase().includes(needle));
    if (station) return [this.stationEntry(station, requestedBy)];
    throw new MusicError("NOT_FOUND", `Nothing in the library, playlists or saved stations matches "${text.slice(0, 80)}". Paste a direct audio link, or use /music radio to search internet radio.`);
  }

  /** The first saved station matching a name, else the first Radio Browser result. */
  public async radioEntry(guildId: string, name: string, requestedBy?: string | undefined): Promise<MusicQueueEntry> {
    const needle = requiredText("Station name", name).toLowerCase();
    const saved = (await this.repository.listStations(guildId)).find((station) => station.name.toLowerCase().includes(needle));
    if (saved) return this.stationEntry(saved, requestedBy);
    const [first] = await this.searchRadio(needle);
    if (!first) throw new MusicError("NOT_FOUND", `No radio station matches "${name.trim().slice(0, 80)}".`);
    return this.stationEntry({ name: first.name, url: first.url, faviconUrl: first.faviconUrl }, requestedBy);
  }

  public async playlistEntries(guildId: string, id: string, requestedBy?: string | undefined): Promise<readonly MusicQueueEntry[]> {
    const playlist = await this.playlist(guildId, id);
    if (playlist.tracks.length === 0) throw new MusicError("INVALID_STATE", `The playlist ${playlist.name} is empty.`);
    return playlist.tracks.map((track) => this.trackEntry(track, requestedBy));
  }

  public trackEntry(track: MusicTrack, requestedBy?: string | undefined): MusicQueueEntry {
    return {
      id: this.newId(),
      source: "library",
      ref: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      durationSeconds: track.durationSeconds ?? null,
      seekable: true,
      filePath: this.storage.path(track.guildId, track.fileName),
      coverPath: track.coverFileName ? this.storage.path(track.guildId, track.coverFileName) : undefined,
      requestedBy,
    };
  }

  public stationEntry(station: { readonly id?: string | undefined; readonly name: string; readonly url: string; readonly faviconUrl?: string | undefined }, requestedBy?: string | undefined): MusicQueueEntry {
    return { id: this.newId(), source: "radio", ref: station.id, title: station.name, durationSeconds: null, seekable: false, url: station.url, artworkUrl: station.faviconUrl, requestedBy };
  }

  private jamendoEntry(track: JamendoTrack, requestedBy?: string | undefined): MusicQueueEntry {
    return {
      id: this.newId(),
      source: "jamendo",
      ref: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      durationSeconds: track.durationSeconds || null,
      seekable: track.durationSeconds > 0,
      url: track.url,
      artworkUrl: track.imageUrl,
      requestedBy,
    };
  }

  private async jamendoTrack(id: string): Promise<JamendoTrack> {
    if (!this.jamendo?.available) throw new MusicError("DEPENDENCY_UNAVAILABLE", "Jamendo is not set up on this host.");
    const track = await this.jamendo.track(id);
    if (!track) throw new MusicError("NOT_FOUND", "That Jamendo track was not found.");
    return track;
  }
}

function detail(playlist: MusicPlaylist, byId: ReadonlyMap<string, MusicTrack>): MusicPlaylistDetail {
  const tracks = playlist.trackIds.flatMap((id) => {
    const track = byId.get(id);
    return track ? [track] : [];
  });
  return {
    ...playlist,
    tracks,
    coverTrackId: tracks.find((track) => track.coverFileName)?.id,
    durationSeconds: tracks.reduce((total, track) => total + (track.durationSeconds ?? 0), 0),
  };
}

/** "2 GB", "512 MB". */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${Number((bytes / 1024 ** 3).toFixed(1))} GB`;
  if (bytes >= 1024 ** 2) return `${Number((bytes / 1024 ** 2).toFixed(1))} MB`;
  return `${Math.ceil(bytes / 1024)} KB`;
}
