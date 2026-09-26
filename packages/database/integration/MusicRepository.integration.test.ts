import { MusicService, defaultMusicSettings, type MusicQueueEntry, type MusicStorage } from "@qbox/music";
import { PrismaClientFactory } from "@qbox/prisma";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaMusicRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for music repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing music cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaMusicRepository(client);
const guildId = "1257928923048837201";
const otherGuild = "1257928923048837202";
const channelId = "1262656532902842425";

const files = new Map<string, Buffer>();
const storage: MusicStorage = {
  path: (guild, fileName) => `/music/${guild}/${fileName}`,
  write: async (guild, fileName, data) => { files.set(`${guild}/${fileName}`, data); },
  read: async (guild, fileName) => files.get(`${guild}/${fileName}`) ?? Buffer.alloc(0),
  remove: async (guild, fileName) => { files.delete(`${guild}/${fileName}`); },
};
const service = new MusicService(repository, { storage, quotaBytes: 1024 });
const upload = (text: string, name = "Artist - Title.mp3", guild = guildId) => service.upload({ guildId: guild, fileName: name, contentType: "audio/mpeg", data: Buffer.from(text), uploadedBy: "300000000000000001" });

beforeAll(async () => client.$connect());
beforeEach(async () => {
  files.clear();
  await client.$executeRawUnsafe('TRUNCATE TABLE "music_playlist_tracks", "music_playlists", "music_tracks", "music_stations", "music_sessions", "music_settings"');
});
afterAll(async () => client.$disconnect());

describe("PrismaMusicRepository", () => {
  it("round-trips settings with revisions and lists 24/7 servers", async () => {
    const { revision: _revision, ...defaults } = defaultMusicSettings(guildId);
    const station = await service.saveStation(guildId, { name: "Lofi", url: "https://lofi.example/stream", faviconUrl: "https://lofi.example/icon.png", tags: ["chill"] });
    const saved = await service.saveSettings({ ...defaults, enabled: true, djRoleIds: ["1262656532902842499"], announceChannelId: channelId, stayConnected247: true, homeChannelId: channelId, idleRadioStationId: station.id, expectedRevision: 0 });
    expect(saved).toMatchObject({ revision: 1, djRoleIds: ["1262656532902842499"], homeChannelId: channelId, idleRadioStationId: station.id, stayConnected247: true });
    expect(await service.settings(guildId)).toEqual(saved);
    await expect(service.saveSettings({ ...defaults, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
    expect((await repository.listStayConnected()).map((item) => item.guildId)).toEqual([guildId]);
    const cleared = await service.saveSettings({ ...defaults, expectedRevision: 1 });
    expect(cleared.revision).toBe(2);
    expect(cleared.homeChannelId).toBeUndefined();
    expect(await repository.listStayConnected()).toEqual([]);
  });

  it("stores tracks, finds duplicates per server, sums usage, and edits tags", async () => {
    const first = await upload("one");
    expect(first.duplicate).toBe(false);
    expect(first.track).toMatchObject({ title: "Title", artist: "Artist", sizeBytes: 3, contentType: "audio/mpeg" });
    expect(await repository.getTrack(guildId, first.track.id)).toEqual(first.track);
    expect(await repository.getTrack(otherGuild, first.track.id)).toBeUndefined();
    expect(await repository.getTrack(guildId, "not-a-uuid")).toBeUndefined();
    expect((await upload("one", "again.mp3")).duplicate).toBe(true);
    expect((await upload("one", "x.mp3", otherGuild)).duplicate).toBe(false);
    await upload("second");
    expect(await repository.libraryUsage(guildId)).toEqual({ tracks: 2, bytes: 9 });
    const edited = await service.updateTrack(guildId, first.track.id, { title: "Renamed", album: "LP" });
    expect(edited).toMatchObject({ title: "Renamed", album: "LP" });
    expect(edited.artist).toBeUndefined();
    await expect(upload("x".repeat(1100))).rejects.toMatchObject({ code: "LIMIT_REACHED" });
  });

  it("keeps playlist order, and renumbers when a track is deleted", async () => {
    const a = (await upload("a", "A.mp3")).track;
    const b = (await upload("b", "B.mp3")).track;
    const c = (await upload("c", "C.mp3")).track;
    const playlist = await service.createPlaylist(guildId, "Mix", "Good songs");
    await service.setPlaylistTracks(guildId, playlist.id, [c.id, a.id, b.id]);
    await service.addToPlaylist(guildId, playlist.id, [a.id]);
    expect((await repository.getPlaylist(guildId, playlist.id))?.trackIds).toEqual([c.id, a.id, b.id]);
    await service.deleteTrack(guildId, a.id);
    expect((await repository.getPlaylist(guildId, playlist.id))?.trackIds).toEqual([c.id, b.id]);
    await service.setPlaylistTracks(guildId, playlist.id, [b.id, c.id, b.id]);
    expect((await service.playlist(guildId, playlist.id)).tracks.map((track) => track.title)).toEqual(["B", "C", "B"]);
    expect(await service.updatePlaylist(guildId, playlist.id, "Mix 2")).toMatchObject({ name: "Mix 2" });
    expect(await repository.getPlaylist(otherGuild, playlist.id)).toBeUndefined();
    await service.deletePlaylist(guildId, playlist.id);
    expect(await repository.listPlaylists(guildId)).toEqual([]);
  });

  it("stores stations per server", async () => {
    const station = await service.saveStation(guildId, { name: "Jazz", url: "https://jazz.example/stream", tags: ["jazz"] });
    expect(await repository.listStations(guildId)).toEqual([station]);
    await expect(service.saveStation(guildId, { name: "Jazz again", url: "https://jazz.example/stream" })).rejects.toMatchObject({ code: "CONFLICT" });
    expect(await repository.deleteStation(otherGuild, station.id)).toBe(false);
    await service.deleteStation(guildId, station.id);
    expect(await repository.listStations(guildId)).toEqual([]);
  });

  it("saves sessions and lists the ones that were playing", async () => {
    const queue: MusicQueueEntry[] = [{ id: "e1", source: "library", ref: "t1", title: "Song", durationSeconds: 200, seekable: true, filePath: "/music/a.mp3", requestedBy: "300000000000000001" }];
    await repository.saveSession({ guildId, channelId, textChannelId: channelId, panelChannelId: channelId, panelMessageId: "1432100000000000001", queue, index: 0, positionSeconds: 42.7, state: "playing", loop: "queue", shuffle: true, volume: 80 });
    await repository.saveSession({ guildId: otherGuild, queue: [], index: 0, positionSeconds: 0, state: "paused", loop: "off", shuffle: false, volume: 60 });
    const session = await repository.getSession(guildId);
    expect(session).toMatchObject({ channelId, panelMessageId: "1432100000000000001", queue, index: 0, positionSeconds: 42, state: "playing", loop: "queue", shuffle: true, volume: 80 });
    expect((await repository.listActiveSessions()).map((item) => item.guildId)).toEqual([guildId]);
    await repository.saveSession({ guildId, queue: [], index: 0, positionSeconds: 0, state: "idle", loop: "off", shuffle: false, volume: 60 });
    expect(await repository.listActiveSessions()).toEqual([]);
    expect((await repository.getSession(guildId))?.channelId).toBeUndefined();
  });
});
