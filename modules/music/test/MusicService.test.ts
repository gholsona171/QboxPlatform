import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  InMemoryMusicRepository,
  LocalMusicStorage,
  MusicService,
  STREAMING_SERVICE_MESSAGE,
  defaultMusicSettings,
  parseTime,
  formatTime,
  type LinkResolver,
  type MusicFileTags,
  type MusicProbe,
  type MusicStorage,
  type RadioDirectory,
} from "../src/index.js";

const GUILD = "100000000000000001";
const USER = "300000000000000001";

class MemoryStorage implements MusicStorage {
  public readonly files = new Map<string, Buffer>();
  public path(guildId: string, fileName: string): string {
    return `/music/${guildId}/${fileName}`;
  }
  public async write(guildId: string, fileName: string, data: Buffer): Promise<void> {
    this.files.set(this.path(guildId, fileName), data);
  }
  public async read(guildId: string, fileName: string): Promise<Buffer> {
    const data = this.files.get(this.path(guildId, fileName));
    if (!data) throw new Error("ENOENT");
    return data;
  }
  public async remove(guildId: string, fileName: string): Promise<void> {
    this.files.delete(this.path(guildId, fileName));
  }
}

class FakeProbe implements MusicProbe {
  public tags: MusicFileTags | undefined = { title: "Tagged", artist: "Singer", album: "Album", trackNumber: 2, durationSeconds: 180, cover: { streamIndex: 1, extension: "png" } };
  public constructor(private readonly storage: MemoryStorage) {}
  public async probe(): Promise<MusicFileTags | undefined> {
    return this.tags;
  }
  public async extractCover(_input: string, _stream: number, output: string): Promise<boolean> {
    this.storage.files.set(output, Buffer.from("png"));
    return true;
  }
}

const links: LinkResolver = {
  resolve: async (url) => {
    if (url.includes("spotify")) throw Object.assign(new Error(STREAMING_SERVICE_MESSAGE), { code: "INVALID_INPUT" });
    return { url, title: "Remote", durationSeconds: 120, seekable: true };
  },
};
const radio: RadioDirectory = { search: async (name) => (name === "jazz" ? [{ id: "u1", name: "Jazz FM", url: "https://jazz.example/stream", tags: [] }] : []) };

function setup(quotaBytes?: number) {
  const repository = new InMemoryMusicRepository();
  const storage = new MemoryStorage();
  const probe = new FakeProbe(storage);
  let sequence = 0;
  const service = new MusicService(repository, { storage, probe, links, radio, quotaBytes, newId: () => `00000000-0000-4000-9000-${String(++sequence).padStart(12, "0")}` });
  return { repository, storage, probe, service };
}

const mp3 = (text = "audio") => ({ guildId: GUILD, fileName: "Artist - Name.mp3", contentType: "audio/mpeg", data: Buffer.from(text), uploadedBy: USER });

describe("music settings", () => {
  it("validates and saves with revisions", async () => {
    const { service } = setup();
    const { revision: _revision, ...defaults } = defaultMusicSettings(GUILD);
    expect(await service.settings(GUILD)).toMatchObject({ enabled: false, defaultVolume: 60, maxQueue: 100, autoLeaveMinutes: 5, nowPlayingPanel: true });
    await expect(service.saveSettings({ ...defaults, defaultVolume: 250 })).rejects.toThrow(/Default volume/);
    await expect(service.saveSettings({ ...defaults, maxQueue: 0 })).rejects.toThrow(/Queue size/);
    await expect(service.saveSettings({ ...defaults, stayConnected247: true })).rejects.toThrow(/home voice channel/);
    await expect(service.saveSettings({ ...defaults, djRoleIds: ["nope"] })).rejects.toThrow(/Discord ID/);
    await expect(service.saveSettings({ ...defaults, idleRadioStationId: "00000000-0000-4000-8000-000000000009" })).rejects.toThrow(/idle radio/);
    const saved = await service.saveSettings({ ...defaults, enabled: true, djRoleIds: ["400000000000000001", "400000000000000001"], expectedRevision: 0 });
    expect(saved).toMatchObject({ revision: 1, enabled: true, djRoleIds: ["400000000000000001"] });
    await expect(service.saveSettings({ ...defaults, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("parses and formats times", () => {
    expect(parseTime("1:30")).toBe(90);
    expect(parseTime("1:02:03")).toBe(3723);
    expect(parseTime("45")).toBe(45);
    expect(() => parseTime("1:75")).toThrow(/mm:ss/);
    expect(() => parseTime("soon")).toThrow(/mm:ss/);
    expect(formatTime(3723)).toBe("1:02:03");
    expect(formatTime(65)).toBe("1:05");
  });
});

describe("library", () => {
  it("stores uploads with tags and cover art, and skips duplicates", async () => {
    const { service, storage } = setup();
    const first = await service.upload(mp3());
    expect(first.duplicate).toBe(false);
    expect(first.track).toMatchObject({ title: "Tagged", artist: "Singer", album: "Album", trackNumber: 2, durationSeconds: 180, fileName: `${first.track.id}.mp3`, coverFileName: `${first.track.id}.png`, sizeBytes: 5, originalName: "Artist - Name.mp3", uploadedBy: USER });
    expect(storage.files.has(`/music/${GUILD}/${first.track.id}.mp3`)).toBe(true);
    expect(await service.cover(GUILD, first.track.id)).toEqual({ data: Buffer.from("png"), contentType: "image/png" });
    const again = await service.upload({ ...mp3(), fileName: "copy.mp3" });
    expect(again).toEqual({ track: first.track, duplicate: true });
    expect(storage.files.size).toBe(2);
    expect(await service.usage(GUILD)).toEqual({ tracks: 1, bytes: 5 });
  });

  it("falls back to the file name without ffprobe", async () => {
    const { service, probe } = setup();
    probe.tags = undefined;
    const { track } = await service.upload({ ...mp3(), fileName: "C:\\music\\Daft Punk - Around.flac", contentType: "" });
    expect(track).toMatchObject({ title: "Around", artist: "Daft Punk", fileName: `${track.id}.flac`, originalName: "Daft Punk - Around.flac" });
    expect(track.durationSeconds).toBeUndefined();
    expect(track.coverFileName).toBeUndefined();
    await expect(service.cover(GUILD, track.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("enforces file type, size and the server quota", async () => {
    const { service } = setup(8);
    await expect(service.upload({ ...mp3(), fileName: "evil.exe", contentType: "application/x-msdownload" })).rejects.toThrow(/not supported/);
    await expect(service.upload({ ...mp3(), data: Buffer.alloc(0) })).rejects.toThrow(/empty/);
    await expect(service.upload({ ...mp3(), data: Buffer.alloc(50 * 1024 * 1024 + 1) })).rejects.toMatchObject({ code: "LIMIT_REACHED" });
    await service.upload(mp3("12345"));
    await expect(service.upload(mp3("6789"))).rejects.toThrow(/library is full/);
  });

  it("edits and deletes tracks, removing files and playlist entries", async () => {
    const { service, storage } = setup();
    const { track } = await service.upload(mp3());
    expect(await service.updateTrack(GUILD, track.id, { title: " New ", artist: "", album: "LP" })).toMatchObject({ title: "New", album: "LP", artist: undefined });
    await expect(service.updateTrack(GUILD, track.id, { title: " " })).rejects.toThrow(/Title cannot be empty/);
    const playlist = await service.createPlaylist(GUILD, "Mix");
    await service.setPlaylistTracks(GUILD, playlist.id, [track.id]);
    await service.deleteTrack(GUILD, track.id);
    expect(storage.files.size).toBe(0);
    expect((await service.playlist(GUILD, playlist.id)).trackIds).toEqual([]);
    await expect(service.track(GUILD, track.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("writes real files under <guildId>/<uuid>.<ext> and never trusts client names", async () => {
    const root = await mkdtemp(join(tmpdir(), "qbox-music-"));
    try {
      const storage = new LocalMusicStorage(root);
      const service = new MusicService(new InMemoryMusicRepository(), { storage });
      const { track } = await service.upload({ ...mp3(), fileName: "../../etc/passwd.mp3" });
      expect(await readdir(join(root, GUILD))).toEqual([`${track.id}.mp3`]);
      expect(() => storage.path(GUILD, "../x.mp3")).toThrow(/not valid/);
      expect(() => storage.path("../..", `${track.id}.mp3`)).toThrow(/not valid/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("playlists and stations", () => {
  it("creates, fills, reorders and deletes playlists", async () => {
    const { service } = setup();
    const a = (await service.upload(mp3("a"))).track;
    const b = (await service.upload(mp3("b"))).track;
    const playlist = await service.createPlaylist(GUILD, "Road trip", "For driving");
    await expect(service.createPlaylist(GUILD, "road TRIP")).rejects.toMatchObject({ code: "CONFLICT" });
    await service.addToPlaylist(GUILD, playlist.id, [a.id, b.id, a.id]);
    expect((await service.playlist(GUILD, playlist.id)).trackIds).toEqual([a.id, b.id]);
    await service.setPlaylistTracks(GUILD, playlist.id, [b.id, a.id]);
    const detail = await service.playlist(GUILD, playlist.id);
    expect(detail).toMatchObject({ trackIds: [b.id, a.id], coverTrackId: b.id, durationSeconds: 360 });
    await expect(service.setPlaylistTracks(GUILD, playlist.id, ["00000000-0000-4000-8000-000000000099"])).rejects.toThrow(/not in the library/);
    expect(await service.updatePlaylist(GUILD, playlist.id, "Trip", "")).toMatchObject({ name: "Trip", description: undefined });
    const entries = await service.resolve(GUILD, `playlist:${playlist.id}`, { requestedBy: USER });
    expect(entries.map((entry) => entry.ref)).toEqual([b.id, a.id]);
    await service.deletePlaylist(GUILD, playlist.id);
    await expect(service.playlist(GUILD, playlist.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("saves stations with checked links", async () => {
    const { service } = setup();
    const station = await service.saveStation(GUILD, { name: "Jazz FM", url: "https://jazz.example/stream", faviconUrl: "http://insecure/icon.png", tags: ["jazz", " "] });
    expect(station).toMatchObject({ name: "Jazz FM", url: "https://jazz.example/stream", tags: ["jazz"] });
    expect(station.faviconUrl).toBeUndefined();
    await expect(service.saveStation(GUILD, { name: "Again", url: "https://jazz.example/stream" })).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(service.saveStation(GUILD, { name: "Local", url: "http://localhost/stream" })).rejects.toThrow(/private/);
    await expect(service.saveStation(GUILD, { name: "Spot", url: "https://open.spotify.com/x" })).rejects.toThrow(/Spotify/);
    await service.deleteStation(GUILD, station.id);
    await expect(service.deleteStation(GUILD, station.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("play requests", () => {
  it("resolves references, links, and words", async () => {
    const { service } = setup();
    const track = (await service.upload(mp3())).track;
    const station = await service.saveStation(GUILD, { name: "Lofi Radio", url: "https://lofi.example/stream" });
    expect(await service.resolve(GUILD, `library:${track.id}`, { requestedBy: USER })).toMatchObject([{ source: "library", ref: track.id, title: "Tagged", filePath: `/music/${GUILD}/${track.id}.mp3`, coverPath: `/music/${GUILD}/${track.id}.png`, seekable: true, durationSeconds: 180, requestedBy: USER }]);
    expect(await service.resolve(GUILD, `station:${station.id}`)).toMatchObject([{ source: "radio", title: "Lofi Radio", seekable: false, durationSeconds: null }]);
    expect(await service.resolve(GUILD, "radio:https://any.example/live", { title: "Any FM" })).toMatchObject([{ source: "radio", title: "Any FM", url: "https://any.example/live" }]);
    expect(await service.resolve(GUILD, "https://cdn.example/a.mp3")).toMatchObject([{ source: "link", title: "Remote", durationSeconds: 120 }]);
    await expect(service.resolve(GUILD, "https://open.spotify.com/track/1")).rejects.toThrow(STREAMING_SERVICE_MESSAGE);
    expect(await service.resolve(GUILD, "tagg")).toMatchObject([{ ref: track.id }]);
    expect(await service.resolve(GUILD, "lofi")).toMatchObject([{ title: "Lofi Radio" }]);
    await expect(service.resolve(GUILD, "nothing like this")).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(service.resolve(GUILD, "jamendo:12")).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE" });
    await expect(service.resolve(GUILD, "  ")).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });

  it("finds radio by saved name first, then Radio Browser", async () => {
    const { service } = setup();
    await service.saveStation(GUILD, { name: "My Jazz", url: "https://mine.example/stream" });
    expect((await service.radioEntry(GUILD, "jazz")).url).toBe("https://mine.example/stream");
    const other = setup().service;
    expect((await other.radioEntry(GUILD, "jazz")).title).toBe("Jazz FM");
    await expect(other.radioEntry(GUILD, "polka")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("suggests playlists, stations and songs for autocomplete", async () => {
    const { service } = setup();
    const track = (await service.upload(mp3())).track;
    const playlist = await service.createPlaylist(GUILD, "Tagged hits");
    expect(await service.suggest(GUILD, "tag")).toEqual([
      { name: "Playlist: Tagged hits", value: `playlist:${playlist.id}` },
      { name: "Tagged - Singer", value: `library:${track.id}` },
    ]);
    expect(await service.suggest(GUILD, "", ["playlist"])).toHaveLength(1);
  });
});

