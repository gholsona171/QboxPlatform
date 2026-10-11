import { describe, expect, it } from "vitest";
import type { OutgoingMessage } from "@qbox/shared/messages";

import {
  InMemoryMusicRepository,
  MusicController,
  MusicError,
  MusicService,
  YOUTUBE_NOT_A_VIDEO_MESSAGE,
  YOUTUBE_NOT_DIRECT_MESSAGE,
  YOUTUBE_PLAYLIST_MESSAGE,
  YOUTUBE_SIGN_IN_MESSAGE,
  YOUTUBE_UNAVAILABLE_MESSAGE,
  defaultMusicSettings,
  type AudioEngine,
  type AudioEngineEvents,
  type AudioPlayOptions,
  type MusicActor,
  type MusicGateway,
  type MusicQueueEntry,
  type MusicStorage,
  type PlayableSource,
  type YoutubeSource,
  type YoutubeStream,
  type YoutubeVideo,
} from "../src/index.js";

const GUILD = "100000000000000001";
const VOICE = "200000000000000001";
const TEXT = "500000000000000001";
const ID = "dQw4w9WgXcQ";
const LIVE_ID = "rFZHOHl-L8A";
const THUMBNAIL = `https://i.ytimg.com/vi/${ID}/hqdefault.jpg`;
const manager: MusicActor = { userId: "300000000000000001", manager: true, dj: false, roleIds: [], textChannelId: TEXT };

const videos: Readonly<Record<string, YoutubeVideo>> = {
  [ID]: { id: ID, title: "Never Gonna Give You Up", channel: "Rick Astley", durationSeconds: 213, thumbnailUrl: THUMBNAIL },
  [LIVE_ID]: { id: LIVE_ID, title: "lofi radio", channel: "Lofi Girl", durationSeconds: null, thumbnailUrl: `https://i.ytimg.com/vi/${LIVE_ID}/hqdefault.jpg` },
};

/** A YouTube source that remembers stream addresses the way the real one does, without yt-dlp. */
class FakeYoutube implements YoutubeSource {
  public available = true;
  public readonly calls: string[] = [];
  public failStream: MusicError | undefined;
  private readonly remembered = new Map<string, string>();
  private lookups = 0;

  public async search(query: string): Promise<readonly YoutubeVideo[]> {
    this.calls.push(`search:${query}`);
    return [videos[ID] as YoutubeVideo];
  }
  public async first(query: string): Promise<YoutubeVideo> {
    this.calls.push(`first:${query}`);
    if (query === "nothing like this") throw new MusicError("NOT_FOUND", 'YouTube has no results for "nothing like this".');
    this.lookup(ID);
    return videos[ID] as YoutubeVideo;
  }
  public async video(id: string): Promise<YoutubeVideo> {
    this.calls.push(`video:${id}`);
    const video = videos[id];
    if (!video) throw new MusicError("NOT_FOUND", "That video is not available. It may have been removed or made private.");
    this.lookup(id);
    return video;
  }
  public async stream(id: string): Promise<YoutubeStream> {
    if (this.failStream) throw this.failStream;
    const cached = this.remembered.get(id);
    this.calls.push(`stream:${id}:${cached ? "remembered" : "fresh"}`);
    return { url: cached ?? this.lookup(id), cached: cached !== undefined };
  }
  public forget(id: string): void {
    this.calls.push(`forget:${id}`);
    this.remembered.delete(id);
  }
  private lookup(id: string): string {
    this.lookups += 1;
    const url = `https://rr1---sn-test.googlevideo.com/videoplayback?expire=1791756896&id=${id}&lookup=${this.lookups}`;
    this.remembered.set(id, url);
    return url;
  }
}

class FakeEngine implements AudioEngine {
  public readonly plays: { source: PlayableSource; options: AudioPlayOptions }[] = [];
  public readonly calls: string[] = [];
  public constructor(public readonly events: AudioEngineEvents) {}
  public async join(channelId: string): Promise<void> { this.calls.push(`join:${channelId}`); }
  public leave(): void { this.calls.push("leave"); }
  public async play(source: PlayableSource, options: AudioPlayOptions): Promise<void> { this.plays.push({ source, options }); }
  public pause(): void { this.calls.push("pause"); }
  public resume(): void { this.calls.push("resume"); }
  public setVolume(): void { this.calls.push("volume"); }
  public stop(): void { this.calls.push("stop"); }
}

const storage: MusicStorage = { path: (guildId, fileName) => `/music/${guildId}/${fileName}`, write: async () => undefined, read: async () => Buffer.from(""), remove: async () => undefined };
const flush = () => new Promise((resolve) => setTimeout(resolve, 5));
const url = (id: string, lookup: number) => `https://rr1---sn-test.googlevideo.com/videoplayback?expire=1791756896&id=${id}&lookup=${lookup}`;

async function setup(options: { repository?: InMemoryMusicRepository; youtube?: FakeYoutube | null } = {}) {
  const repository = options.repository ?? new InMemoryMusicRepository();
  const youtube = options.youtube === null ? undefined : options.youtube ?? new FakeYoutube();
  let id = 0;
  const service = new MusicService(repository, { storage, youtube, newId: () => `00000000-0000-4000-9000-${String(++id).padStart(12, "0")}` });
  const engines: FakeEngine[] = [];
  const posts: OutgoingMessage[] = [];
  const gateway: MusicGateway = {
    post: async (_channelId, message) => {
      posts.push(message);
      return "700000000000000001";
    },
    edit: async (_channelId, _messageId, message) => { posts.push(message); },
    deleteMessage: async () => undefined,
    guildName: async () => "Test",
  };
  const controller = new MusicController(service, repository, {
    engines: (_guildId, events) => {
      const engine = new FakeEngine(events);
      engines.push(engine);
      return engine;
    },
    gateway,
    presence: { listeners: () => 1, memberChannel: () => VOICE },
    ffmpeg: true,
    now: () => 1_000_000,
    random: () => 0,
    saveDelayMs: 0,
  });
  const { revision: _revision, ...defaults } = defaultMusicSettings(GUILD);
  if (!options.repository) await service.saveSettings({ ...defaults, enabled: true });
  const track = (title: string) => repository.createTrack({ id: `00000000-0000-4000-8000-${String(repository.tracks.size + 1).padStart(12, "0")}`, guildId: GUILD, title, durationSeconds: 200, fileName: `${title}.mp3`, contentType: "audio/mpeg", sizeBytes: 10, sha256: title, originalName: `${title}.mp3` });
  return { repository, service, controller, engines, posts, youtube: youtube ?? new FakeYoutube(), track };
}

describe("playing from YouTube", () => {
  it("searches YouTube for typed text, plays the top result, and queues the next one", async () => {
    const { controller, engines, posts, youtube, repository } = await setup();
    const first = await controller.command(GUILD, { action: "play", query: "never gonna give you up" }, manager);
    expect(first.message).toBe("Playing **Never Gonna Give You Up**.");
    expect(youtube.calls).toEqual(["first:never gonna give you up", `stream:${ID}:remembered`]);
    const engine = engines[0] as FakeEngine;
    expect(engine.calls).toEqual([`join:${VOICE}`]);
    expect(engine.plays[0]).toEqual({ source: { url: url(ID, 1), seekable: true }, options: { seekSeconds: 0, volume: 60 } });
    expect(first.state.current).toEqual({ id: "00000000-0000-4000-9000-000000000001", source: "youtube", ref: ID, title: "Never Gonna Give You Up", artist: "Rick Astley", durationSeconds: 213, seekable: true, artworkUrl: THUMBNAIL, requestedBy: manager.userId });
    expect(first.state).toMatchObject({ state: "playing", live: false, durationSeconds: 213 });

    const embed = posts[0]?.embeds?.[0];
    expect(embed).toMatchObject({ title: "Never Gonna Give You Up", author: { name: "▶ Now playing · YouTube" }, thumbnail: { url: THUMBNAIL } });
    expect(embed?.description).toContain("Rick Astley");

    const second = await controller.command(GUILD, { action: "play", query: "another song" }, manager);
    expect(second.message).toBe("Added **Never Gonna Give You Up** to the queue (position 2).");
    expect(engine.plays).toHaveLength(1);

    await flush();
    const saved = await repository.getSession(GUILD);
    expect(saved?.queue.map((entry) => ({ source: entry.source, ref: entry.ref, url: entry.url }))).toEqual([{ source: "youtube", ref: ID, url: undefined }, { source: "youtube", ref: ID, url: undefined }]);
    expect(JSON.stringify(saved)).not.toContain("googlevideo");
  });

  it("plays a YouTube link as that video", async () => {
    const { controller, engines, youtube } = await setup();
    for (const link of [`https://www.youtube.com/watch?v=${ID}&list=PL1234567890`, `https://youtu.be/${ID}`, `https://music.youtube.com/watch?v=${ID}`, `https://www.youtube.com/shorts/${ID}`, `https://www.youtube.com/live/${ID}`, `youtube.com/watch?v=${ID}`])
      await controller.command(GUILD, { action: "play", query: link }, manager);
    expect(youtube.calls.filter((call) => call.startsWith("video:"))).toEqual(Array.from({ length: 6 }, () => `video:${ID}`));
    expect(youtube.calls.some((call) => call.startsWith("first:"))).toBe(false);
    expect(engines[0]?.plays[0]?.source).toEqual({ url: url(ID, 1), seekable: true });
    expect((await controller.state(GUILD)).queue).toHaveLength(6);
    expect((await controller.command(GUILD, { action: "play", query: `youtube:${ID}`, now: true }, manager)).message).toBe("Playing **Never Gonna Give You Up**.");
  });

  it("explains playlist links and other YouTube pages without calling yt-dlp", async () => {
    const { controller, youtube, service } = await setup();
    await expect(controller.command(GUILD, { action: "play", query: "https://www.youtube.com/playlist?list=PL1234567890" }, manager)).rejects.toMatchObject({ code: "INVALID_INPUT", message: YOUTUBE_PLAYLIST_MESSAGE });
    await expect(controller.command(GUILD, { action: "play", query: "https://www.youtube.com/@LofiGirl" }, manager)).rejects.toMatchObject({ message: YOUTUBE_NOT_A_VIDEO_MESSAGE });
    await expect(controller.command(GUILD, { action: "play", query: "youtube:not-an-id" }, manager)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(youtube.calls).toEqual(["video:not-an-id"]);
    await expect(service.saveStation(GUILD, { name: "Video", url: `https://www.youtube.com/watch?v=${ID}` })).rejects.toMatchObject({ message: YOUTUBE_NOT_DIRECT_MESSAGE });
    await expect(controller.command(GUILD, { action: "play", query: "https://open.spotify.com/track/1" }, manager)).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: "Links cannot be played right now." });
  });

  it("keeps today's behavior when yt-dlp is not installed", async () => {
    const youtube = new FakeYoutube();
    youtube.available = false;
    for (const context of [await setup({ youtube }), await setup({ youtube: null })]) {
      const { controller, track, service } = context;
      await track("Alpha Song");
      await expect(controller.command(GUILD, { action: "play", query: "never gonna give you up" }, manager)).rejects.toMatchObject({ code: "NOT_FOUND", message: expect.stringContaining("Nothing in the library, playlists or saved stations matches") });
      expect((await controller.command(GUILD, { action: "play", query: "alpha" }, manager)).message).toBe("Playing **Alpha Song**.");
      await expect(controller.command(GUILD, { action: "play", query: `https://youtu.be/${ID}` }, manager)).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: YOUTUBE_UNAVAILABLE_MESSAGE });
      await expect(controller.command(GUILD, { action: "play", query: `youtube:${ID}` }, manager)).rejects.toMatchObject({ message: YOUTUBE_UNAVAILABLE_MESSAGE });
      await expect(service.searchYoutube("song")).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: YOUTUBE_UNAVAILABLE_MESSAGE });
      expect(service.youtubeAvailable).toBe(false);
    }
    expect(youtube.calls).toEqual([]);
  });

  it("still plays autocomplete picks and exact names from the server, and sends other text to YouTube", async () => {
    const { controller, repository, youtube, track, service } = await setup();
    const alpha = await track("Alpha Song");
    await repository.createStation({ guildId: GUILD, name: "Lofi Radio", url: "https://lofi.example/stream", tags: [] });
    expect((await controller.command(GUILD, { action: "play", query: `library:${alpha.id}` }, manager)).message).toBe("Playing **Alpha Song**.");
    expect((await controller.command(GUILD, { action: "play", query: "ALPHA song" }, manager)).message).toBe("Added **Alpha Song** to the queue (position 2).");
    expect((await controller.command(GUILD, { action: "play", query: "lofi radio" }, manager)).message).toBe("Added **Lofi Radio** to the queue (position 3).");
    expect(youtube.calls).toEqual([]);
    expect((await controller.command(GUILD, { action: "play", query: "alpha" }, manager)).message).toBe("Added **Never Gonna Give You Up** to the queue (position 4).");
    expect((await controller.command(GUILD, { action: "play", query: "lofi" }, manager)).message).toBe("Added **Never Gonna Give You Up** to the queue (position 5).");
    expect(youtube.calls).toEqual(["first:alpha", "first:lofi"]);
    await expect(controller.command(GUILD, { action: "play", query: "nothing like this" }, manager)).rejects.toMatchObject({ code: "NOT_FOUND", message: 'YouTube has no results for "nothing like this".' });
    expect(await service.suggest(GUILD, "alpha")).toEqual([{ name: "Alpha Song", value: `library:${alpha.id}` }]);
    expect(youtube.calls).toHaveLength(3);
  });
});

describe("YouTube stream addresses at play time", () => {
  const entry: MusicQueueEntry = { id: "entry-1", source: "youtube", ref: ID, title: "Never Gonna Give You Up", artist: "Rick Astley", durationSeconds: 213, seekable: true, artworkUrl: THUMBNAIL };

  async function restored(queue: readonly MusicQueueEntry[] = [entry]) {
    const repository = new InMemoryMusicRepository();
    const { revision: _revision, ...defaults } = defaultMusicSettings(GUILD);
    await repository.saveSettings({ ...defaults, enabled: true });
    await repository.saveSession({ guildId: GUILD, channelId: VOICE, textChannelId: TEXT, queue, index: 0, positionSeconds: 42, state: "playing", loop: "off", shuffle: false, volume: 80 });
    return setup({ repository });
  }

  it("looks up a fresh address when a saved session is restored after a restart", async () => {
    const { controller, engines, youtube } = await restored();
    await controller.resume();
    expect(youtube.calls).toEqual([`stream:${ID}:fresh`]);
    const engine = engines[0] as FakeEngine;
    expect(engine.calls).toEqual([`join:${VOICE}`]);
    expect(engine.plays).toEqual([{ source: { url: url(ID, 1), seekable: true }, options: { seekSeconds: 42, volume: 80 } }]);
    expect(await controller.state(GUILD)).toMatchObject({ state: "playing", positionSeconds: 42, current: { source: "youtube", ref: ID } });
  });

  it("reuses the remembered address for pause, seek, and a looping song", async () => {
    const { controller, engines, youtube } = await setup();
    await controller.command(GUILD, { action: "play", query: `https://youtu.be/${ID}` }, manager);
    await controller.command(GUILD, { action: "loop", mode: "track" }, manager);
    await controller.command(GUILD, { action: "pause" }, manager);
    await controller.command(GUILD, { action: "resume" }, manager);
    expect((await controller.command(GUILD, { action: "seek", seconds: 90 }, manager)).message).toBe("Moved to 1:30.");
    const engine = engines[0] as FakeEngine;
    engine.events.finished();
    await flush();
    expect(engine.plays.map((play) => [play.source.url, play.options.seekSeconds])).toEqual([[url(ID, 1), 0], [url(ID, 1), 90], [url(ID, 1), 0]]);
    expect(youtube.calls).toEqual([`video:${ID}`, `stream:${ID}:remembered`, `stream:${ID}:remembered`, `stream:${ID}:remembered`]);
  });

  it("looks the address up once more when a remembered one fails at once", async () => {
    const { controller, engines, youtube } = await setup();
    await controller.command(GUILD, { action: "play", query: "never gonna give you up" }, manager);
    await controller.command(GUILD, { action: "seek", seconds: 30 }, manager);
    const engine = engines[0] as FakeEngine;
    engine.events.error("Server returned 403 Forbidden (access denied)");
    await flush();
    expect(youtube.calls.slice(-2)).toEqual([`forget:${ID}`, `stream:${ID}:fresh`]);
    expect(engine.plays.at(-1)).toEqual({ source: { url: url(ID, 2), seekable: true }, options: { seekSeconds: 30, volume: 60 } });
    expect(await controller.state(GUILD)).toMatchObject({ state: "playing", lastError: undefined, current: { ref: ID } });

    engine.events.error("Server returned 403 Forbidden (access denied)");
    await flush();
    expect(youtube.calls.filter((call) => call.startsWith("forget:"))).toHaveLength(1);
    expect(engine.plays).toHaveLength(3);
    expect(await controller.state(GUILD)).toMatchObject({ state: "idle", lastError: "Server returned 403 Forbidden (access denied)" });
  });

  it("does not retry an address that was just looked up", async () => {
    const { controller, engines, youtube } = await restored();
    await controller.resume();
    (engines[0] as FakeEngine).events.error("Invalid data found when processing input");
    await flush();
    expect(youtube.calls).toEqual([`stream:${ID}:fresh`]);
    expect(engines[0]?.plays).toHaveLength(1);
    expect(await controller.state(GUILD)).toMatchObject({ state: "idle", lastError: "Invalid data found when processing input" });
  });

  it("plays live videos like radio: no seeking", async () => {
    const { controller, engines } = await setup();
    const result = await controller.command(GUILD, { action: "play", query: `https://www.youtube.com/live/${LIVE_ID}` }, manager);
    expect(result.state).toMatchObject({ live: true, durationSeconds: null, current: { source: "youtube", ref: LIVE_ID, seekable: false } });
    expect(engines[0]?.plays[0]).toEqual({ source: { url: url(LIVE_ID, 1), seekable: false }, options: { seekSeconds: 0, volume: 60 } });
    await expect(controller.command(GUILD, { action: "seek", seconds: 30 }, manager)).rejects.toThrow(/live stream/);
  });

  it("tells the member in plain words when YouTube refuses the host", async () => {
    const { controller, engines, youtube } = await restored();
    youtube.failStream = new MusicError("DEPENDENCY_UNAVAILABLE", YOUTUBE_SIGN_IN_MESSAGE);
    await controller.resume();
    expect(engines[0]?.plays).toEqual([]);
    expect(await controller.state(GUILD)).toMatchObject({ state: "idle", lastError: YOUTUBE_SIGN_IN_MESSAGE });
    await expect(controller.command(GUILD, { action: "resume" }, manager)).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: YOUTUBE_SIGN_IN_MESSAGE });
    youtube.failStream = undefined;
    expect((await controller.command(GUILD, { action: "resume" }, manager)).message).toBe("Playing **Never Gonna Give You Up**.");
    expect(engines[0]?.plays[0]?.options.seekSeconds).toBe(42);
  });
});
