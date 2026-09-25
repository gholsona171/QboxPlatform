import { PrismaClientFactory } from "@qbox/prisma";
import { StreamsService, defaultStreamsSettings, type LiveCheck, type StreamPlatformClient, type StreamsGateway } from "@qbox/streams";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaStreamsRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for streams repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing streams cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaStreamsRepository(client);
const guildId = "1257928923048837201";
const channelId = "1262656532902842425";

let clock = new Date("2026-09-25T12:00:00.000Z");
const checks = new Map<string, LiveCheck>();
const twitch: StreamPlatformClient = {
  platform: "twitch",
  available: true,
  resolve: async (handle) => ({ platform: "twitch", platformId: `id-${handle}`, handle, displayName: handle.toUpperCase(), url: `https://www.twitch.tv/${handle}` }),
  liveStatus: async (ids) => new Map(ids.map((id) => [id, checks.get(id) ?? { status: "offline" }])),
};
const posts: string[] = [];
const edits: string[] = [];
const gateway: StreamsGateway = {
  post: async (channel) => { posts.push(channel); return `14321000000000000${String(posts.length).padStart(2, "0")}`; },
  edit: async (_channel, messageId) => { edits.push(messageId); },
  deleteMessage: async () => undefined,
  guildName: async () => "Integration",
};
const service = new StreamsService(repository, [twitch], gateway, { now: () => clock });

beforeAll(async () => client.$connect());
beforeEach(async () => {
  clock = new Date("2026-09-25T12:00:00.000Z");
  checks.clear();
  posts.length = 0;
  edits.length = 0;
  await client.$executeRawUnsafe('TRUNCATE TABLE "streams_subscriptions", "streams_settings"');
});
afterAll(async () => client.$disconnect());

describe("PrismaStreamsRepository", () => {
  it("round-trips settings with revisions", async () => {
    const { revision: _revision, ...defaults } = defaultStreamsSettings(guildId);
    const saved = await service.saveSettings({ ...defaults, defaultChannelId: channelId, endedBehavior: "delete", checkIntervalSeconds: 120, expectedRevision: 0 });
    expect(saved).toMatchObject({ revision: 1, defaultChannelId: channelId, endedBehavior: "delete", checkIntervalSeconds: 120 });
    expect(await service.settings(guildId)).toEqual(saved);
    await expect(service.saveSettings({ ...defaults, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
    expect((await service.saveSettings({ ...defaults, expectedRevision: 1 })).revision).toBe(2);
  });

  it("stores subscriptions, edits them, and keeps polling state out of the edit", async () => {
    const added = await service.add({ guildId, platform: "twitch", handle: "amy", announceChannelId: channelId, pingRoleId: "1262656532902842499", messageText: "{creator} is on!", announceVideos: false, enabled: true });
    expect(added).toMatchObject({ platform: "twitch", handle: "amy", displayName: "AMY", platformId: "id-amy", state: { failureStreak: 0, offlineStreak: 0 } });
    expect(await repository.getSubscription(guildId, added.id)).toEqual(added);
    expect(await repository.getSubscription("1257928923048837202", added.id)).toBeUndefined();
    expect(await repository.getSubscription(guildId, "not-a-uuid")).toBeUndefined();
    await expect(service.add({ guildId, platform: "twitch", handle: "amy", announceVideos: false, enabled: true })).rejects.toMatchObject({ code: "CONFLICT" });

    checks.set("id-amy", { status: "live", stream: { id: "s1", title: "Hi", url: "https://www.twitch.tv/amy", startedAt: clock } });
    await service.tick();
    expect(posts).toEqual([channelId]);
    let stored = await service.get(guildId, added.id);
    expect(stored.state).toMatchObject({ lastStreamId: "s1", lastAnnouncementChannelId: channelId, lastAnnouncementMessageId: "1432100000000000001", lastCheckedAt: clock });

    const updated = await service.update(guildId, added.id, { announceVideos: false, enabled: true, pingRoleId: undefined });
    expect(updated.pingRoleId).toBeUndefined();
    expect(updated.messageText).toBeUndefined();
    expect(updated.state.lastStreamId).toBe("s1");

    checks.set("id-amy", { status: "offline" });
    for (let index = 0; index < 2; index += 1) {
      clock = new Date(clock.getTime() + 90_000);
      await service.tick();
    }
    expect(edits).toEqual(["1432100000000000001"]);
    stored = await service.get(guildId, added.id);
    expect(stored.state.lastStreamId).toBeUndefined();
    expect(stored.state.lastAnnouncementMessageId).toBeUndefined();

    await service.remove(guildId, added.id);
    expect(await repository.countSubscriptions(guildId)).toBe(0);
    expect(await repository.deleteSubscription(guildId, added.id)).toBe(false);
  });

  it("lists active subscriptions per guild with default settings when none are saved", async () => {
    const other = "1257928923048837202";
    await service.add({ guildId, platform: "twitch", handle: "amy", announceVideos: false, enabled: true });
    await service.add({ guildId, platform: "twitch", handle: "bob", announceVideos: false, enabled: false });
    await service.add({ guildId: other, platform: "twitch", handle: "cat", announceVideos: false, enabled: true });
    const { revision: _revision, ...defaults } = defaultStreamsSettings(other);
    await service.saveSettings({ ...defaults, checkIntervalSeconds: 300 });
    const active = await repository.listActive();
    expect(active.map((config) => [config.settings.guildId, config.settings.checkIntervalSeconds, config.subscriptions.map((item) => item.handle)])).toEqual([
      [guildId, 90, ["amy"]],
      [other, 300, ["cat"]],
    ]);
  });
});
