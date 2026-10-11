import { describe, expect, it } from "vitest";
import {
  InMemoryMusicRepository,
  MusicError,
  MusicService,
  UNREACHABLE_MESSAGE,
  type MusicActor,
  type MusicCommand,
  type MusicControl,
  type MusicStateSnapshot,
  type MusicStorage,
  type YoutubeSource,
} from "@qbox/music";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { musicApiFeature, type MusicHostInfo } from "../src/music/MusicRoutes.js";

const GUILD = "100000000000000001";
const USER = "300000000000000001";
const ROLE = "400000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT" | "PATCH" | "DELETE", url: string, payload?: unknown) => ({ method, url, ...(payload === undefined ? {} : { payload: payload as Record<string, unknown> }), headers: payload === undefined ? host : { ...host, "content-type": "application/json" } });
const upload = (data: Buffer, name: string, type = "audio/mpeg") => ({ method: "POST" as const, url: "/api/v1/music/library", payload: data, headers: { ...host, "content-type": type, "x-file-name": encodeURIComponent(name) } });

const state: MusicStateSnapshot = { guildId: GUILD, connected: false, state: "idle", index: 0, queue: [], positionSeconds: 0, durationSeconds: null, live: false, loop: "off", shuffle: false, volume: 60, stayConnected: false, ffmpeg: true };

function setup(allowed: readonly string[], options: { offline?: boolean; host?: MusicHostInfo; youtube?: YoutubeSource } = {}) {
  const calls: { permission: string; mutation: boolean }[] = [];
  const commands: { command: MusicCommand; actor: MusicActor }[] = [];
  const files = new Map<string, Buffer>();
  const context: ApiFeatureContext = {
    guildId: GUILD,
    guard: async (_request, permission, options) => {
      const names = typeof permission === "string" ? [permission] : [...permission];
      calls.push({ permission: names.join("|"), mutation: options.mutation });
      if (!names.some((name) => allowed.includes(name))) throw new AuthorizationDeniedApiError();
      return { userId: USER, displayName: "Jay", roleIds: [ROLE] };
    },
    member: async () => ({ userId: USER, displayName: "Jay", roleIds: [] }),
  };
  const storage: MusicStorage = {
    path: (guildId, fileName) => `/music/${guildId}/${fileName}`,
    write: async (guildId, fileName, data) => { files.set(`${guildId}/${fileName}`, data); },
    read: async (guildId, fileName) => {
      const data = files.get(`${guildId}/${fileName}`);
      if (!data) throw new Error("ENOENT");
      return data;
    },
    remove: async (guildId, fileName) => { files.delete(`${guildId}/${fileName}`); },
  };
  const service = new MusicService(new InMemoryMusicRepository(), {
    storage,
    probe: {
      probe: async () => ({ title: "Tagged", artist: "Singer", durationSeconds: 100, cover: { streamIndex: 1, extension: "jpg" } }),
      extractCover: async (_input, _stream, output) => { files.set(output.replace("/music/", ""), Buffer.from("jpeg-bytes")); return true; },
    },
    radio: { search: async (name) => [{ id: "u1", name: `${name} FM`, url: "https://radio.example/stream", tags: [] }] },
    youtube: options.youtube,
    quotaBytes: 1024 * 1024 * 1024,
  });
  const control: MusicControl = {
    state: async () => {
      if (options.offline) throw new MusicError("DEPENDENCY_UNAVAILABLE", UNREACHABLE_MESSAGE);
      return state;
    },
    command: async (_guildId, command, actor) => {
      if (options.offline) throw new MusicError("DEPENDENCY_UNAVAILABLE", UNREACHABLE_MESSAGE);
      commands.push({ command, actor });
      if (command.action === "seek") throw new MusicError("INVALID_STATE", "This is a live stream, so it cannot be seeked or rewound.");
      return { message: "Paused.", state };
    },
  };
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "music-test" }),
    registerRoutes: (instance) => musicApiFeature(service, control, options.host ?? { ffmpeg: false }).register(instance, context),
  });
  return { server, calls, commands, files };
}

describe("music routes", () => {
  it("reports the overview and forwards player commands with the actor", async () => {
    const secondBot: MusicHostInfo = { ffmpeg: true, secondBot: { inviteUrl: "https://discord.com/oauth2/authorize?client_id=1", inGuild: async () => true } };
    const { server, commands } = setup(["music.manage"], { host: secondBot });
    const overview = (await server.inject({ method: "GET", url: "/api/v1/music/overview", headers: host })).json().data;
    expect(overview).toMatchObject({ settings: { enabled: false, revision: 0 }, canManage: true, ffmpeg: true, jamendo: false, secondBot: true, secondBotInGuild: true, secondBotInviteUrl: "https://discord.com/oauth2/authorize?client_id=1", library: { tracks: 0, bytes: 0, quotaBytes: 1024 ** 3, maxFileBytes: 50 * 1024 * 1024 } });

    expect((await server.inject({ method: "GET", url: "/api/v1/music/state", headers: host })).json().data).toMatchObject({ state: "idle" });
    expect((await server.inject(json("POST", "/api/v1/music/command", { action: "pause" }))).json().data.message).toBe("Paused.");
    expect(commands[0]).toEqual({ command: { action: "pause" }, actor: { userId: USER, manager: true, dj: true, roleIds: [ROLE] } });
    const refused = await server.inject(json("POST", "/api/v1/music/command", { action: "seek", seconds: 5 }));
    expect(refused.statusCode).toBe(400);
    expect(refused.json().errors[0].message).toContain("live stream");
    expect((await server.inject(json("POST", "/api/v1/music/command", { action: "explode" }))).statusCode).toBe(400);
  });

  it("lets DJs play but not manage, and says when the bot is offline", async () => {
    const dj = setup(["music.dj"]);
    expect((await dj.server.inject({ method: "GET", url: "/api/v1/music/overview", headers: host })).json().data.canManage).toBe(false);
    await dj.server.inject(json("POST", "/api/v1/music/command", { action: "skip" }));
    expect(dj.commands[0]?.actor).toMatchObject({ manager: false, dj: true });
    expect((await dj.server.inject(json("PUT", "/api/v1/music/settings", { enabled: true }))).statusCode).toBe(403);
    expect((await dj.server.inject(upload(Buffer.from("x"), "a.mp3"))).statusCode).toBe(403);

    const nobody = setup([]);
    expect((await nobody.server.inject({ method: "GET", url: "/api/v1/music/state", headers: host })).statusCode).toBe(403);

    const offline = setup(["music.manage"], { offline: true });
    const response = await offline.server.inject({ method: "GET", url: "/api/v1/music/state", headers: host });
    expect(response.statusCode).toBe(503);
    expect(response.json().errors[0].message).toBe("The music player is not running (bot offline).");
  });

  it("uploads raw audio, skips duplicates, serves covers, edits and deletes", async () => {
    const { server, files } = setup(["music.manage"]);
    const created = await server.inject(upload(Buffer.from("song-bytes"), "Singer - Song.mp3"));
    expect(created.statusCode).toBe(201);
    const track = created.json().data.track;
    expect(track).toMatchObject({ title: "Tagged", artist: "Singer", originalName: "Singer - Song.mp3", sizeBytes: 10, coverFileName: `${track.id}.jpg` });
    expect(files.get(`${GUILD}/${track.id}.mp3`)?.toString()).toBe("song-bytes");
    const again = await server.inject(upload(Buffer.from("song-bytes"), "copy.mp3"));
    expect(again.statusCode).toBe(200);
    expect(again.json().data).toMatchObject({ duplicate: true, track: { id: track.id } });

    const cover = await server.inject({ method: "GET", url: `/api/v1/music/library/${track.id}/cover`, headers: host });
    expect(cover.statusCode).toBe(200);
    expect(cover.headers["content-type"]).toBe("image/jpeg");
    expect(cover.body).toBe("jpeg-bytes");

    expect((await server.inject(upload(Buffer.from("x"), "notes.txt", "text/plain"))).statusCode).toBe(415);
    expect((await server.inject(upload(Buffer.from("x"), "tool.exe", "application/octet-stream"))).json().errors[0].message).toContain("not supported");
    expect((await server.inject({ ...upload(Buffer.from("x"), "a.mp3"), headers: { ...host, "content-type": "audio/mpeg" } })).statusCode).toBe(400);
    expect((await server.inject(upload(Buffer.alloc(50 * 1024 * 1024 + 1), "big.mp3"))).statusCode).toBe(413);
    expect((await server.inject({ method: "POST", url: "/api/v1/music/playlists", payload: Buffer.from("x"), headers: { ...host, "content-type": "audio/mpeg" } })).statusCode).toBe(415);

    const edited = await server.inject(json("PATCH", `/api/v1/music/library/${track.id}`, { title: "Better", album: "LP" }));
    expect(edited.json().data).toMatchObject({ title: "Better", album: "LP" });
    const library = (await server.inject({ method: "GET", url: "/api/v1/music/library", headers: host })).json().data;
    expect(library.tracks).toHaveLength(1);
    expect((await server.inject(json("DELETE", `/api/v1/music/library/${track.id}`))).json().data).toEqual({ deleted: true });
    expect(files.size).toBe(0);
    expect((await server.inject({ method: "GET", url: `/api/v1/music/library/${track.id}/cover`, headers: host })).statusCode).toBe(404);
  });

  it("manages playlists, stations, settings and radio search", async () => {
    const { server } = setup(["music.manage"]);
    const a = (await server.inject(upload(Buffer.from("a"), "A.mp3"))).json().data.track;
    const b = (await server.inject(upload(Buffer.from("b"), "B.mp3"))).json().data.track;
    const playlist = (await server.inject(json("POST", "/api/v1/music/playlists", { name: "Mix", description: "Good" }))).json().data;
    expect((await server.inject(json("POST", "/api/v1/music/playlists", { name: "mix" }))).statusCode).toBe(409);
    await server.inject(json("POST", `/api/v1/music/playlists/${playlist.id}/tracks`, { trackIds: [a.id] }));
    const reordered = await server.inject(json("PUT", `/api/v1/music/playlists/${playlist.id}/tracks`, { trackIds: [b.id, a.id] }));
    expect(reordered.json().data.trackIds).toEqual([b.id, a.id]);
    expect((await server.inject(json("PATCH", `/api/v1/music/playlists/${playlist.id}`, { name: "Road" }))).json().data.name).toBe("Road");
    const playlists = (await server.inject({ method: "GET", url: "/api/v1/music/playlists", headers: host })).json().data;
    expect(playlists[0]).toMatchObject({ name: "Road", coverTrackId: b.id, durationSeconds: 200 });
    expect((await server.inject(json("DELETE", `/api/v1/music/playlists/${playlist.id}`))).json().data).toEqual({ deleted: true });

    const station = (await server.inject(json("POST", "/api/v1/music/stations", { name: "Lofi", url: "https://lofi.example/stream", tags: ["chill"] }))).json().data;
    expect(station).toMatchObject({ name: "Lofi", tags: ["chill"] });
    expect((await server.inject(json("POST", "/api/v1/music/stations", { name: "Bad", url: "https://www.youtube.com/watch?v=1" }))).json().errors[0].message).toContain("A YouTube link is not a direct audio link");
    expect((await server.inject(json("POST", "/api/v1/music/stations", { name: "Bad", url: "https://open.spotify.com/track/1" }))).json().errors[0].message).toContain("Spotify and Apple Music do not allow bots");
    const saved = await server.inject(json("PUT", "/api/v1/music/settings", { enabled: true, djRoleIds: [ROLE], defaultVolume: 80, maxQueue: 50, nowPlayingPanel: true, stayConnected247: true, homeChannelId: "200000000000000001", autoLeaveMinutes: 0, idleRadioStationId: station.id, expectedRevision: 0 }));
    expect(saved.json().data).toMatchObject({ revision: 1, stayConnected247: true, idleRadioStationId: station.id });
    expect((await server.inject(json("PUT", "/api/v1/music/settings", { enabled: true, djRoleIds: [], defaultVolume: 300, maxQueue: 50, nowPlayingPanel: true, stayConnected247: false, autoLeaveMinutes: 5, expectedRevision: 1 }))).statusCode).toBe(400);
    expect((await server.inject(json("DELETE", `/api/v1/music/stations/${station.id}`))).json().data).toEqual({ deleted: true });

    expect((await server.inject({ method: "GET", url: "/api/v1/music/radio/search?q=jazz", headers: host })).json().data).toEqual([{ id: "u1", name: "jazz FM", url: "https://radio.example/stream", tags: [] }]);
    expect((await server.inject({ method: "GET", url: "/api/v1/music/jamendo/search?q=rock", headers: host })).statusCode).toBe(503);
  });

  it("searches YouTube for DJs and managers, and plays a result through the player command", async () => {
    const searches: { query: string; limit: number | undefined }[] = [];
    const video = { id: "dQw4w9WgXcQ", title: "Never Gonna Give You Up", channel: "Rick Astley", durationSeconds: 213, thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" };
    const youtube: YoutubeSource = {
      available: true,
      search: async (query, limit) => {
        searches.push({ query, limit });
        if (query === "blocked") throw new MusicError("DEPENDENCY_UNAVAILABLE", "YouTube is asking this host to sign in.");
        if (query === "busy") throw new MusicError("LIMIT_REACHED", "YouTube is busy with other requests. Try again in a moment.");
        return [video];
      },
      first: async () => video,
      video: async () => video,
      stream: async () => ({ url: "https://rr1.googlevideo.com/videoplayback", cached: false }),
      forget: () => undefined,
    };
    const search = (query: string) => ({ method: "GET" as const, url: `/api/v1/music/youtube/search${query}`, headers: host });

    const dj = setup(["music.dj"], { youtube });
    const found = await dj.server.inject(search("?q=never%20gonna%20give%20you%20up"));
    expect(found.statusCode).toBe(200);
    expect(found.headers["cache-control"]).toBe("no-store");
    expect(found.json().data).toEqual([video]);
    expect(searches).toEqual([{ query: "never gonna give you up", limit: 8 }]);
    expect(dj.calls.at(-1)).toEqual({ permission: "music.dj|music.manage", mutation: false });
    expect((await dj.server.inject({ method: "GET", url: "/api/v1/music/overview", headers: host })).json().data).toMatchObject({ youtube: true, canManage: false });

    for (const bad of ["", "?q=", "?q=%20%20", `?q=${"x".repeat(101)}`]) expect((await dj.server.inject(search(bad))).statusCode, bad).toBe(400);
    expect(searches).toHaveLength(1);
    const blocked = await dj.server.inject(search("?q=blocked"));
    expect(blocked.statusCode).toBe(503);
    expect(JSON.stringify(blocked.json())).toContain("YouTube is asking this host to sign in.");
    const busy = await dj.server.inject(search("?q=busy"));
    expect(busy.statusCode).toBe(400);
    expect(busy.json().errors[0].message).toBe("YouTube is busy with other requests. Try again in a moment.");

    const played = await dj.server.inject(json("POST", "/api/v1/music/command", { action: "play", query: "youtube:dQw4w9WgXcQ", now: true }));
    expect(played.statusCode).toBe(200);
    expect(dj.commands.at(-1)).toEqual({ command: { action: "play", query: "youtube:dQw4w9WgXcQ", now: true }, actor: { userId: USER, manager: false, dj: true, roleIds: [ROLE] } });
    expect(dj.calls.at(-1)).toEqual({ permission: "music.dj", mutation: true });

    const stranger = setup([], { youtube });
    expect((await stranger.server.inject(search("?q=song"))).statusCode).toBe(403);
    expect((await stranger.server.inject(json("POST", "/api/v1/music/command", { action: "play", query: "youtube:dQw4w9WgXcQ" }))).statusCode).toBe(403);
    expect(searches).toHaveLength(3);
  });

  it("hides YouTube and refuses its search when yt-dlp is not installed", async () => {
    const { server } = setup(["music.manage"]);
    expect((await server.inject({ method: "GET", url: "/api/v1/music/overview", headers: host })).json().data.youtube).toBe(false);
    const response = await server.inject({ method: "GET", url: "/api/v1/music/youtube/search?q=song", headers: host });
    expect(response.statusCode).toBe(503);
    expect(JSON.stringify(response.json())).toContain("YouTube is not set up on this host");
  });
});
