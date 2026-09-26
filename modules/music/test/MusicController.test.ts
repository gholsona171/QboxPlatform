import { describe, expect, it } from "vitest";
import type { OutgoingMessage } from "@qbox/shared/messages";

import {
  InMemoryMusicRepository,
  MusicController,
  MusicError,
  MusicService,
  defaultMusicSettings,
  type AudioEngine,
  type AudioEngineEvents,
  type AudioPlayOptions,
  type MusicActor,
  type MusicGateway,
  type MusicPostOptions,
  type MusicPresence,
  type MusicSettingsInput,
  type MusicStorage,
  type PlayableSource,
} from "../src/index.js";

const GUILD = "100000000000000001";
const VOICE = "200000000000000001";
const OTHER_VOICE = "200000000000000002";
const TEXT = "500000000000000001";
const DJ_ROLE = "400000000000000001";
const manager: MusicActor = { userId: "300000000000000001", manager: true, dj: false, roleIds: [], textChannelId: TEXT };
const member: MusicActor = { userId: "300000000000000002", manager: false, dj: false, roleIds: [] };

class FakeEngine implements AudioEngine {
  public channelId: string | undefined;
  public readonly plays: { source: PlayableSource; options: AudioPlayOptions }[] = [];
  public readonly calls: string[] = [];
  public failNext: Error | undefined;
  public constructor(public readonly events: AudioEngineEvents) {}
  public async join(channelId: string): Promise<void> {
    this.channelId = channelId;
    this.calls.push(`join:${channelId}`);
  }
  public leave(): void {
    this.channelId = undefined;
    this.calls.push("leave");
  }
  public async play(source: PlayableSource, options: AudioPlayOptions): Promise<void> {
    if (this.failNext) {
      const error = this.failNext;
      this.failNext = undefined;
      throw error;
    }
    this.plays.push({ source, options });
  }
  public pause(): void { this.calls.push("pause"); }
  public resume(): void { this.calls.push("resume"); }
  public setVolume(volume: number): void { this.calls.push(`volume:${volume}`); }
  public stop(): void { this.calls.push("stop"); }
}

class FakeGateway implements MusicGateway {
  public readonly posts: { channelId: string; message: OutgoingMessage; options: MusicPostOptions }[] = [];
  public readonly edits: { messageId: string; message: OutgoingMessage; options: MusicPostOptions }[] = [];
  public readonly deleted: string[] = [];
  public async post(channelId: string, message: OutgoingMessage, options: MusicPostOptions): Promise<string> {
    this.posts.push({ channelId, message, options });
    return `70000000000000000${this.posts.length}`;
  }
  public async edit(_channelId: string, messageId: string, message: OutgoingMessage, options: MusicPostOptions): Promise<void> {
    this.edits.push({ messageId, message, options });
  }
  public async deleteMessage(_channelId: string, messageId: string): Promise<void> {
    this.deleted.push(messageId);
  }
  public async guildName(): Promise<string> {
    return "Test";
  }
}

const storage: MusicStorage = {
  path: (guildId, fileName) => `/music/${guildId}/${fileName}`,
  write: async () => undefined,
  read: async () => Buffer.from(""),
  remove: async () => undefined,
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 5));

function setup(options: { repository?: InMemoryMusicRepository; settings?: Partial<MusicSettingsInput>; clock?: { now: number } } = {}) {
  const repository = options.repository ?? new InMemoryMusicRepository();
  let id = 0;
  const service = new MusicService(repository, { storage, newId: () => `00000000-0000-4000-9000-${String(++id).padStart(12, "0")}` });
  const engines: FakeEngine[] = [];
  const gateway = new FakeGateway();
  const voice = new Map<string, string>([[manager.userId, VOICE]]);
  const listeners = new Map<string, number>([[VOICE, 1]]);
  const presence: MusicPresence = { listeners: (_guild, channelId) => listeners.get(channelId) ?? 0, memberChannel: (_guild, userId) => voice.get(userId) };
  const clock = options.clock ?? { now: 1_000_000 };
  const controller = new MusicController(service, repository, {
    engines: (_guildId, events) => {
      const engine = new FakeEngine(events);
      engines.push(engine);
      return engine;
    },
    gateway,
    presence,
    ffmpeg: true,
    now: () => clock.now,
    random: () => 0,
    saveDelayMs: 0,
    readFile: async () => Buffer.from("cover"),
  });
  const ready = (async () => {
    if (options.settings === undefined && options.repository) return;
    const { revision: _revision, ...defaults } = defaultMusicSettings(GUILD);
    await service.saveSettings({ ...defaults, enabled: true, ...options.settings });
  })();
  return { repository, service, controller, engines, gateway, voice, listeners, clock, ready };
}

async function track(service: MusicService, repository: InMemoryMusicRepository, title: string, cover = false) {
  const id = `00000000-0000-4000-8000-${String(repository.tracks.size + 1).padStart(12, "0")}`;
  return repository.createTrack({ id, guildId: GUILD, title, durationSeconds: 200, fileName: `${id}.mp3`, coverFileName: cover ? `${id}.jpg` : undefined, contentType: "audio/mpeg", sizeBytes: 10, sha256: id, originalName: `${title}.mp3` });
}

describe("music controller", () => {
  it("joins the member's channel, plays, queues, and announces with a panel", async () => {
    const { controller, service, repository, engines, gateway, ready } = setup();
    await ready;
    const a = await track(service, repository, "Alpha", true);
    const b = await track(service, repository, "Beta");
    const first = await controller.command(GUILD, { action: "play", query: `library:${a.id}` }, manager);
    expect(first.message).toBe("Playing **Alpha**.");
    expect(first.state).toMatchObject({ connected: true, channelId: VOICE, state: "playing", volume: 60 });
    const engine = engines[0] as FakeEngine;
    expect(engine.calls).toEqual([`join:${VOICE}`]);
    expect(engine.plays[0]).toMatchObject({ source: { filePath: `/music/${GUILD}/${a.id}.mp3` }, options: { seekSeconds: 0, volume: 60 } });
    expect(gateway.posts).toHaveLength(1);
    expect(gateway.posts[0]).toMatchObject({ channelId: TEXT, options: { attachment: { name: "cover.jpg" } } });
    expect(gateway.posts[0]?.message.embeds?.[0]).toMatchObject({ title: "Alpha", thumbnail: { url: "attachment://cover.jpg" } });
    expect((gateway.posts[0]?.options.components as { components: unknown[] }[])).toHaveLength(2);

    expect((await controller.command(GUILD, { action: "play", query: "Beta" }, manager)).message).toBe("Added **Beta** to the queue (position 2).");
    engine.events.finished();
    await flush();
    const state = await controller.state(GUILD);
    expect(state.current?.ref).toBe(b.id);
    expect(gateway.edits.at(-1)).toMatchObject({ messageId: "700000000000000001", options: { attachment: undefined } });
    expect(gateway.edits.at(-1)?.message.embeds?.[0]?.title).toBe("Beta");

    engine.events.finished();
    await flush();
    expect(await controller.state(GUILD)).toMatchObject({ state: "idle", current: undefined });
    expect(gateway.edits.at(-1)?.message.embeds?.[0]?.title).toBe("Nothing is playing");
  });

  it("checks who may control playback", async () => {
    const { controller, service, repository, voice, ready } = setup({ settings: { djRoleIds: [DJ_ROLE] } });
    await ready;
    const a = await track(service, repository, "Alpha");
    await expect(controller.command(GUILD, { action: "play", query: `library:${a.id}` }, member)).rejects.toThrow("Only DJs can control the music here.");
    await controller.command(GUILD, { action: "play", query: `library:${a.id}` }, manager);
    const dj = { ...member, roleIds: [DJ_ROLE] };
    voice.set(dj.userId, OTHER_VOICE);
    await expect(controller.command(GUILD, { action: "pause" }, dj)).rejects.toThrow(`Join <#${VOICE}> to control the music.`);
    voice.set(dj.userId, VOICE);
    expect((await controller.command(GUILD, { action: "pause" }, dj)).message).toBe("Paused **Alpha**.");
    expect((await controller.command(GUILD, { action: "pause" }, { ...member, dj: true })).message).toBe("Nothing is playing right now.");

    const off = setup({ settings: { enabled: false } });
    await off.ready;
    await expect(off.controller.command(GUILD, { action: "skip" }, manager)).rejects.toThrow(/Music is turned off/);
  });

  it("seeks, rewinds and refuses live streams", async () => {
    const { controller, service, repository, engines, clock, ready } = setup();
    await ready;
    const a = await track(service, repository, "Alpha");
    await controller.command(GUILD, { action: "play", query: `library:${a.id}` }, manager);
    clock.now += 30_000;
    expect((await controller.command(GUILD, { action: "rewind" }, manager)).message).toBe("Moved to 0:20.");
    expect((await controller.command(GUILD, { action: "seek", seconds: 500 }, manager)).message).toBe("Moved to 3:19.");
    expect(engines[0]?.plays.map((play) => play.options.seekSeconds)).toEqual([0, 20, 199]);
    await controller.command(GUILD, { action: "play", query: "radio:https://radio.example/live", title: "Live FM", now: true }, manager);
    await expect(controller.command(GUILD, { action: "forward", seconds: 10 }, manager)).rejects.toThrow(/live stream/);
    expect((await controller.command(GUILD, { action: "volume", volume: 250 }, manager)).message).toBe("Volume set to 200%.");
    expect(engines[0]?.calls).toContain("volume:200");
  });

  it("shows plain errors when a song cannot play", async () => {
    const { controller, service, repository, engines, ready } = setup();
    await ready;
    const a = await track(service, repository, "Alpha");
    await controller.command(GUILD, { action: "join" }, manager);
    (engines[0] as FakeEngine).failNext = new MusicError("DEPENDENCY_UNAVAILABLE", "Music needs ffmpeg on the host.");
    await expect(controller.command(GUILD, { action: "play", query: `library:${a.id}` }, manager)).rejects.toThrow("Music needs ffmpeg on the host.");
    expect(await controller.state(GUILD)).toMatchObject({ state: "idle", lastError: "Music needs ffmpeg on the host." });
  });

  it("stop leaves unless 24/7; leave is refused in 24/7", async () => {
    const plain = setup();
    await plain.ready;
    const a = await track(plain.service, plain.repository, "Alpha");
    await plain.controller.command(GUILD, { action: "play", query: `library:${a.id}` }, manager);
    expect((await plain.controller.command(GUILD, { action: "stop" }, manager)).message).toContain("left the voice channel");
    expect(plain.engines[0]?.calls).toContain("leave");
    expect(await plain.controller.state(GUILD)).toMatchObject({ connected: false, queue: [] });

    const always = setup({ settings: { stayConnected247: true, homeChannelId: VOICE } });
    await always.ready;
    await always.controller.command(GUILD, { action: "join" }, manager);
    expect((await always.controller.command(GUILD, { action: "stop" }, manager)).message).toBe("Stopped and cleared the queue.");
    await expect(always.controller.command(GUILD, { action: "leave" }, manager)).rejects.toThrow(/24\/7 mode is on/);
  });

  it("plays the idle radio station when the queue ends", async () => {
    const { controller, service, repository, engines, ready } = setup();
    await ready;
    const station = await service.saveStation(GUILD, { name: "Lofi", url: "https://lofi.example/stream" });
    const { revision: _revision, ...current } = await service.settings(GUILD);
    await service.saveSettings({ ...current, idleRadioStationId: station.id });
    const a = await track(service, repository, "Alpha");
    await controller.command(GUILD, { action: "play", query: `library:${a.id}` }, manager);
    engines[0]?.events.finished();
    await flush();
    expect(await controller.state(GUILD)).toMatchObject({ state: "playing", live: true, current: { title: "Lofi", source: "radio" } });
  });

  it("saves the session and resumes at the same position after a restart", async () => {
    const clock = { now: 1_000_000 };
    const first = setup({ clock });
    await first.ready;
    const a = await track(first.service, first.repository, "Alpha");
    const b = await track(first.service, first.repository, "Beta");
    await first.controller.command(GUILD, { action: "play", query: `library:${a.id}` }, manager);
    await first.controller.command(GUILD, { action: "play", query: `library:${b.id}` }, manager);
    await first.controller.command(GUILD, { action: "loop", mode: "queue" }, manager);
    await flush();
    expect(first.repository.sessions.get(GUILD)).toMatchObject({ channelId: VOICE, state: "playing", index: 0, loop: "queue" });
    clock.now += 42_000;
    await first.controller.tick();
    expect(first.repository.sessions.get(GUILD)?.positionSeconds).toBe(42);
    clock.now += 3_000;
    await first.controller.shutdown();
    expect(first.repository.sessions.get(GUILD)).toMatchObject({ state: "playing", positionSeconds: 45, textChannelId: TEXT, panelMessageId: "700000000000000001" });
    expect(first.engines[0]?.calls.at(-1)).toBe("leave");

    const second = setup({ repository: first.repository, clock });
    await second.controller.resume();
    const engine = second.engines[0] as FakeEngine;
    expect(engine.calls).toEqual([`join:${VOICE}`]);
    expect(engine.plays[0]).toMatchObject({ source: { filePath: `/music/${GUILD}/${a.id}.mp3` }, options: { seekSeconds: 45 } });
    expect(await second.controller.state(GUILD)).toMatchObject({ state: "playing", loop: "queue", queue: [{ ref: a.id }, { ref: b.id }] });
    expect(second.gateway.edits[0]).toMatchObject({ messageId: "700000000000000001" });
  });

  it("does not resume sessions that were idle", async () => {
    const repository = new InMemoryMusicRepository();
    const first = setup({ repository, settings: {} });
    await first.ready;
    await repository.saveSession({ guildId: GUILD, channelId: VOICE, queue: [], index: 0, positionSeconds: 0, state: "idle", loop: "off", shuffle: false, volume: 60 });
    await first.controller.resume();
    expect(first.engines).toHaveLength(0);
  });

  it("leaves after the auto-leave time alone, and edits the panel every 15 seconds", async () => {
    const { controller, service, repository, engines, gateway, listeners, clock, ready } = setup();
    await ready;
    const a = await track(service, repository, "Alpha");
    await controller.command(GUILD, { action: "play", query: `library:${a.id}` }, manager);
    clock.now += 10_000;
    await controller.tick();
    expect(gateway.edits).toHaveLength(0);
    clock.now += 6_000;
    await controller.tick();
    expect(gateway.edits).toHaveLength(1);
    expect(gateway.edits[0]?.options.keepAttachments).toBe(true);
    listeners.set(VOICE, 0);
    await controller.tick();
    clock.now += 4 * 60_000;
    await controller.tick();
    expect(engines[0]?.calls).not.toContain("leave");
    clock.now += 60_000;
    await controller.tick();
    expect(engines[0]?.calls).toContain("leave");
    expect(await controller.state(GUILD)).toMatchObject({ connected: false, state: "idle", queue: [{ ref: a.id }] });
  });

  it("brings 24/7 servers back to their home channel with the idle radio", async () => {
    const { controller, service, engines, ready } = setup();
    await ready;
    const station = await service.saveStation(GUILD, { name: "Lofi", url: "https://lofi.example/stream" });
    const { revision: _revision, ...current } = await service.settings(GUILD);
    await service.saveSettings({ ...current, stayConnected247: true, homeChannelId: VOICE, idleRadioStationId: station.id });
    await controller.tick();
    expect(engines[0]?.calls).toEqual([`join:${VOICE}`]);
    expect(await controller.state(GUILD)).toMatchObject({ connected: true, state: "playing", current: { title: "Lofi" }, stayConnected: true });
    engines[0]?.events.disconnected();
    await controller.tick();
    expect(engines[0]?.calls).toEqual([`join:${VOICE}`, `join:${VOICE}`]);
  });

  it("queues playlists, shuffled when asked", async () => {
    const { controller, service, repository, ready } = setup();
    await ready;
    const ids = [(await track(service, repository, "A")).id, (await track(service, repository, "B")).id, (await track(service, repository, "C")).id];
    const playlist = await service.createPlaylist(GUILD, "Mix");
    await service.setPlaylistTracks(GUILD, playlist.id, ids);
    const result = await controller.command(GUILD, { action: "playlist", id: playlist.id, shuffle: true }, manager);
    expect(result.message).toBe("Playing 3 songs, starting with **B**.");
    expect(result.state.queue.map((entry) => entry.title)).toEqual(["B", "C", "A"]);
  });
});
