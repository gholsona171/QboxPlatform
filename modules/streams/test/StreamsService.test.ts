import { describe, expect, it } from "vitest";
import type { MessageTemplates, OutgoingMessage } from "@qbox/shared/messages";

import {
  InMemoryStreamsRepository,
  MAX_SUBSCRIPTIONS,
  StreamsService,
  checkWaitMs,
  defaultStreamsSettings,
  formatDuration,
  normalizeHandle,
  type LiveCheck,
  type LiveStream,
  type StreamCreator,
  type StreamPlatform,
  type StreamPlatformClient,
  type StreamsGateway,
  type StreamsPostOptions,
  type StreamsSubscriptionInput,
} from "../src/index.js";

const GUILD = "100000000000000001";
const CHANNEL = "500000000000000001";
const ROLE = "400000000000000001";

class FakeGateway implements StreamsGateway {
  public readonly posts: { channelId: string; message: OutgoingMessage; options: StreamsPostOptions }[] = [];
  public readonly edits: { messageId: string; message: OutgoingMessage }[] = [];
  public readonly deletes: string[] = [];
  public failNext = false;
  private sequence = 0;
  public async post(channelId: string, message: OutgoingMessage, options: StreamsPostOptions): Promise<string> {
    if (this.failNext) {
      this.failNext = false;
      throw new Error("Missing Access");
    }
    this.posts.push({ channelId, message, options });
    this.sequence += 1;
    return `70000000000000000${this.sequence}`;
  }
  public async edit(_channelId: string, messageId: string, message: OutgoingMessage): Promise<void> { this.edits.push({ messageId, message }); }
  public async deleteMessage(_channelId: string, messageId: string): Promise<void> { this.deletes.push(messageId); }
  public async guildName(): Promise<string | undefined> { return "Test Server"; }
}

class FakeClient implements StreamPlatformClient {
  public readonly checks = new Map<string, LiveCheck>();
  public videos = new Map<string, { id: string; title: string }[]>();
  public calls: string[][] = [];
  public constructor(public readonly platform: StreamPlatform, public readonly available = true) {}
  public async resolve(handle: string): Promise<StreamCreator> {
    return { platform: this.platform, platformId: `${this.platform}-${handle}`, handle, displayName: handle.toUpperCase(), avatarUrl: `https://cdn.example/${handle}.png`, url: `https://${this.platform}.example/${handle}` };
  }
  public async liveStatus(ids: readonly string[]): Promise<ReadonlyMap<string, LiveCheck>> {
    this.calls.push([...ids]);
    return new Map(ids.flatMap((id) => (this.checks.has(id) ? [[id, this.checks.get(id) as LiveCheck]] : [])));
  }
  public async latestVideos(id: string) {
    return (this.videos.get(id) ?? []).map((video, index) => ({ ...video, url: `https://youtube.example/watch?v=${video.id}`, publishedAt: new Date(Date.UTC(2026, 8, 25 - index)) }));
  }
}

function stream(id: string, overrides: Partial<LiveStream> = {}): LiveStream {
  return { id, title: `Stream ${id}`, game: "Just Chatting", viewers: 42, thumbnailUrl: `https://thumb.example/${id}.jpg`, startedAt: new Date("2026-09-25T12:00:00Z"), url: "https://twitch.example/amy", ...overrides };
}

function input(overrides: Partial<StreamsSubscriptionInput> = {}): StreamsSubscriptionInput {
  return { guildId: GUILD, platform: "twitch", handle: "amy", announceChannelId: CHANNEL, pingRoleId: ROLE, announceVideos: false, enabled: true, ...overrides };
}

function setup(options: { twitchAvailable?: boolean; templates?: MessageTemplates } = {}) {
  let clock = new Date("2026-09-25T12:00:00.000Z");
  const now = () => clock;
  const repository = new InMemoryStreamsRepository(now);
  const gateway = new FakeGateway();
  const twitch = new FakeClient("twitch", options.twitchAvailable ?? true);
  const youtube = new FakeClient("youtube");
  const warnings: string[] = [];
  const service = new StreamsService(repository, [twitch, youtube], gateway, { now, templates: options.templates, log: { warn: (message) => warnings.push(message) } });
  return { service, repository, gateway, twitch, youtube, warnings, advance: (seconds: number) => { clock = new Date(clock.getTime() + seconds * 1000); } };
}

describe("StreamsService creators", () => {
  it("resolves the creator on add, dedupes, and enforces the limit", async () => {
    const { service } = setup();
    const added = await service.add(input({ handle: " https://twitch.tv/Amy/ " }));
    expect(added).toMatchObject({ handle: "amy", displayName: "AMY", platformId: "twitch-amy", avatarUrl: "https://cdn.example/amy.png", pingRoleId: ROLE });
    await expect(service.add(input())).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(service.add(input({ handle: "a b" }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.add(input({ platform: "kick", handle: "amy" }))).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE" });
    for (let index = 1; index < MAX_SUBSCRIPTIONS; index += 1) await service.add(input({ handle: `user${index}` }));
    await expect(service.add(input({ handle: "onemore" }))).rejects.toMatchObject({ code: "LIMIT_REACHED" });
  });

  it("refuses Twitch without host credentials", async () => {
    const { service } = setup({ twitchAvailable: false });
    expect(service.availability()).toEqual({ twitch: false, kick: false, youtube: true });
    await expect(service.add(input())).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: expect.stringContaining("credentials") });
  });

  it("updates, removes, and validates settings", async () => {
    const { service } = setup();
    const added = await service.add(input({ platform: "youtube", handle: "@MKBHD", announceVideos: true }));
    expect(added.announceVideos).toBe(true);
    const updated = await service.update(GUILD, added.id, { announceVideos: false, enabled: false, messageText: "{creator} live: {url}" });
    expect(updated).toMatchObject({ enabled: false, messageText: "{creator} live: {url}" });
    expect(updated.announceChannelId).toBeUndefined();
    await expect(service.update(GUILD, added.id, { announceVideos: false, enabled: true, messageText: "   " })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.update(GUILD, "missing", { announceVideos: false, enabled: true })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await service.remove(GUILD, added.id);
    expect(await service.list(GUILD)).toHaveLength(0);
    const { revision: _revision, ...defaults } = defaultStreamsSettings(GUILD);
    const saved = await service.saveSettings({ ...defaults, checkIntervalSeconds: 120, endedBehavior: "delete", expectedRevision: 0 });
    expect(saved).toMatchObject({ revision: 1, checkIntervalSeconds: 120 });
    await expect(service.saveSettings({ ...defaults, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(service.saveSettings({ ...defaults, checkIntervalSeconds: 10 })).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });
});

describe("StreamsService checks", () => {
  it("announces once per stream, marks it ended after two offline polls, and announces the next stream", async () => {
    const { service, repository, gateway, twitch, advance } = setup();
    const sub = await service.add(input());
    twitch.checks.set(sub.platformId, { status: "live", stream: stream("s1") });
    await service.tick();
    expect(gateway.posts).toHaveLength(1);
    const post = gateway.posts[0];
    expect(post?.channelId).toBe(CHANNEL);
    expect(post?.message.content).toBe(`<@&${ROLE}> **AMY** is live on Twitch!`);
    expect(post?.message.embeds?.[0]).toMatchObject({ title: "Stream s1", color: 0x9146ff, author: { name: "AMY" }, fields: [{ name: "Game", value: "Just Chatting" }, { name: "Viewers", value: "42" }] });
    expect(post?.message.embeds?.[0]?.image?.url).toMatch(/^https:\/\/thumb\.example\/s1\.jpg\?t=\d+$/);
    expect(post?.options).toEqual({ watchUrl: "https://twitch.example/amy", pingRoleId: ROLE });
    expect((await repository.getSubscription(GUILD, sub.id))?.state).toMatchObject({ lastStreamId: "s1", lastAnnouncementMessageId: "700000000000000001", failureStreak: 0 });

    // Same stream again: nothing new. Not due yet, then due.
    await service.tick();
    advance(90);
    await service.tick();
    expect(gateway.posts).toHaveLength(1);
    expect(twitch.calls).toHaveLength(2);

    // One offline poll is tolerated; the second ends the stream and edits the announcement.
    twitch.checks.set(sub.platformId, { status: "offline" });
    advance(90);
    await service.tick();
    expect(gateway.edits).toHaveLength(0);
    advance(90);
    await service.tick();
    expect(gateway.edits).toHaveLength(1);
    expect(gateway.edits[0]?.message.embeds?.[0]?.description).toBe("Live for 5m.");
    expect((await repository.getSubscription(GUILD, sub.id))?.state).toMatchObject({ offlineStreak: 0 });
    expect((await repository.getSubscription(GUILD, sub.id))?.state.lastStreamId).toBeUndefined();

    // A new stream is announced again; a repeat of the old ID counts as new after the ended state.
    twitch.checks.set(sub.platformId, { status: "live", stream: stream("s2") });
    advance(90);
    await service.tick();
    expect(gateway.posts).toHaveLength(2);
  });

  it("deletes or keeps the announcement as the settings say", async () => {
    const { service, gateway, twitch, advance } = setup();
    const { revision: _revision, ...defaults } = defaultStreamsSettings(GUILD);
    await service.saveSettings({ ...defaults, endedBehavior: "delete" });
    const sub = await service.add(input());
    twitch.checks.set(sub.platformId, { status: "live", stream: stream("s1") });
    await service.tick();
    twitch.checks.set(sub.platformId, { status: "offline" });
    for (let index = 0; index < 2; index += 1) {
      advance(90);
      await service.tick();
    }
    expect(gateway.deletes).toEqual(["700000000000000001"]);
    await service.saveSettings({ ...defaults, endedBehavior: "keep", expectedRevision: 1 });
    twitch.checks.set(sub.platformId, { status: "live", stream: stream("s2") });
    advance(90);
    await service.tick();
    twitch.checks.set(sub.platformId, { status: "offline" });
    for (let index = 0; index < 2; index += 1) {
      advance(90);
      await service.tick();
    }
    expect(gateway.deletes).toHaveLength(1);
    expect(gateway.edits).toHaveLength(0);
  });

  it("backs off after failures and recovers", async () => {
    const { service, repository, twitch, warnings, advance } = setup();
    const sub = await service.add(input());
    twitch.checks.set(sub.platformId, { status: "error", error: "Twitch did not answer in time." });
    await service.tick();
    let state = (await repository.getSubscription(GUILD, sub.id))?.state;
    expect(state).toMatchObject({ failureStreak: 1, lastError: "Twitch did not answer in time." });
    expect(warnings).toHaveLength(1);
    advance(90);
    await service.tick();
    expect(twitch.calls).toHaveLength(1);
    advance(90);
    await service.tick();
    expect(twitch.calls).toHaveLength(2);
    state = (await repository.getSubscription(GUILD, sub.id))?.state;
    expect(state?.failureStreak).toBe(2);
    expect(warnings).toHaveLength(1);
    const settings = await service.settings(GUILD);
    expect(checkWaitMs(settings, { failureStreak: 2, offlineStreak: 0 })).toBe(360_000);
    expect(checkWaitMs(settings, { failureStreak: 20, offlineStreak: 0 })).toBe(30 * 60_000);
    twitch.checks.set(sub.platformId, { status: "offline" });
    advance(360);
    await service.tick();
    state = (await repository.getSubscription(GUILD, sub.id))?.state;
    expect(state?.failureStreak).toBe(0);
    expect(state?.lastError).toBeUndefined();
  });

  it("records an error when the channel is missing and when Discord rejects the post, without re-announcing", async () => {
    const { service, repository, gateway, twitch, advance } = setup();
    const sub = await service.add(input({ announceChannelId: undefined }));
    twitch.checks.set(sub.platformId, { status: "live", stream: stream("s1") });
    await service.tick();
    expect(gateway.posts).toHaveLength(0);
    expect((await repository.getSubscription(GUILD, sub.id))?.state).toMatchObject({ lastStreamId: "s1", lastError: "Choose a channel for announcements." });
    advance(90);
    await service.tick();
    expect(gateway.posts).toHaveLength(0);
    const other = await service.add(input({ handle: "bob" }));
    twitch.checks.set(other.platformId, { status: "live", stream: stream("b1") });
    gateway.failNext = true;
    await service.tick();
    expect((await repository.getSubscription(GUILD, other.id))?.state).toMatchObject({ lastStreamId: "b1", lastError: "Could not post in the channel: Missing Access" });
  });

  it("groups platform lookups, skips disabled creators and paused servers", async () => {
    const { service, twitch, advance } = setup();
    const amy = await service.add(input());
    const bob = await service.add(input({ handle: "bob" }));
    await service.add(input({ handle: "cat", enabled: false }));
    await service.add(input({ guildId: "100000000000000002", handle: "dan" }));
    for (const id of [amy.platformId, bob.platformId, "twitch-dan"]) twitch.checks.set(id, { status: "offline" });
    await service.tick();
    expect(twitch.calls).toEqual([expect.arrayContaining([amy.platformId, bob.platformId, "twitch-dan"])]);
    expect(twitch.calls[0]).toHaveLength(3);
    const { revision: _revision, ...defaults } = defaultStreamsSettings(GUILD);
    await service.saveSettings({ ...defaults, enabled: false });
    advance(90);
    await service.tick();
    expect(twitch.calls[1]).toEqual(["twitch-dan"]);
  });

  it("announces new YouTube uploads after the first check, never the live stream itself", async () => {
    const { service, gateway, youtube, advance } = setup();
    const sub = await service.add(input({ platform: "youtube", handle: "mkbhd", announceVideos: true, pingRoleId: undefined }));
    youtube.checks.set(sub.platformId, { status: "offline" });
    youtube.videos.set(sub.platformId, [{ id: "v1", title: "First" }]);
    await service.tick();
    expect(gateway.posts).toHaveLength(0);
    youtube.videos.set(sub.platformId, [{ id: "v4", title: "Fourth" }, { id: "v3", title: "Third" }, { id: "v2", title: "Second" }, { id: "v1", title: "First" }]);
    youtube.checks.set(sub.platformId, { status: "live", stream: stream("v4", { url: "https://youtube.example/watch?v=v4" }) });
    advance(90);
    await service.tick();
    expect(gateway.posts.map((post) => post.message.embeds?.[0]?.title)).toEqual(["Stream v4", "Second", "Third"]);
    expect(gateway.posts[1]?.message.content).toBe("**MKBHD** uploaded a new video!");
    expect(gateway.posts[1]?.message.embeds?.[0]?.image?.url).toBe("https://i.ytimg.com/vi/v2/hqdefault.jpg");
    advance(90);
    await service.tick();
    expect(gateway.posts).toHaveLength(3);
  });

  it("uses custom text and the server's message templates", async () => {
    const applied: string[] = [];
    const templates: MessageTemplates = {
      apply: async (_guildId, key, values, fallback) => {
        applied.push(key);
        return key === "streams.live" ? { content: `custom ${values["creator"]} in ${values["server"]}` } : fallback;
      },
    };
    const { service, gateway, twitch } = setup({ templates });
    const sub = await service.add(input({ messageText: "{ping} {creator} plays {game}: {url}" }));
    twitch.checks.set(sub.platformId, { status: "live", stream: stream("s1") });
    await service.tick();
    expect(applied).toEqual(["streams.live"]);
    expect(gateway.posts[0]?.message).toEqual({ content: "custom AMY in Test Server" });
    const plain = setup();
    const subscription = await plain.service.add(input({ messageText: "{ping} {creator} plays {game}: {url}" }));
    plain.twitch.checks.set(subscription.platformId, { status: "live", stream: stream("s1") });
    await plain.service.tick();
    expect(plain.gateway.posts[0]?.message.content).toBe(`<@&${ROLE}> AMY plays Just Chatting: https://twitch.example/amy`);
  });

  it("posts a test announcement with the current stream or a sample", async () => {
    const { service, gateway, twitch } = setup();
    const sub = await service.add(input());
    expect(await service.test(GUILD, sub.id)).toEqual({ live: false, messageId: "700000000000000001" });
    expect(gateway.posts[0]?.message.embeds?.[0]?.title).toContain("Testing the live announcement");
    twitch.checks.set(sub.platformId, { status: "live", stream: stream("s1") });
    expect(await service.test(GUILD, sub.id)).toMatchObject({ live: true });
    expect(gateway.posts[1]?.message.embeds?.[0]?.title).toBe("Stream s1");
    const noChannel = await service.add(input({ handle: "bob", announceChannelId: undefined }));
    await expect(service.test(GUILD, noChannel.id)).rejects.toMatchObject({ code: "INVALID_STATE" });
  });
});

describe("helpers", () => {
  it("normalizes handles and formats durations", () => {
    expect(normalizeHandle("twitch", "https://www.twitch.tv/Shroud?ref=x")).toBe("shroud");
    expect(normalizeHandle("kick", "@XQC")).toBe("xqc");
    expect(normalizeHandle("youtube", "https://youtube.com/@MKBHD/videos")).toBe("MKBHD");
    expect(normalizeHandle("youtube", "https://www.youtube.com/channel/UCBJycsmduvYEL83R_U4JriQ")).toBe("UCBJycsmduvYEL83R_U4JriQ");
    expect(() => normalizeHandle("twitch", "ab")).toThrow(/Twitch name/);
    expect(formatDuration(125 * 60_000)).toBe("2h 5m");
    expect(formatDuration(30_000)).toBe("1m");
  });
});
