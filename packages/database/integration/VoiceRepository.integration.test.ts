import { PrismaClientFactory } from "@qbox/prisma";
import { VoiceRoomService, type VoiceGateway, type VoiceHubInput } from "@qbox/voice-rooms";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaVoiceRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for voice repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing voice cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaVoiceRepository(client);
const guildId = "1257928923048837201";
const alex = "804859666655739996";
const sam = "804859666655739997";
const hubChannel = "1262656532902842425";
let nextChannel = 1432100000000000001n;
const voice = new Map<string, string>();

const gateway: VoiceGateway = {
  channelParentId: async () => undefined,
  createRoomChannel: async () => ({ channelId: String(nextChannel++) }),
  deleteChannel: async () => undefined,
  renameChannel: async () => undefined,
  setUserLimit: async () => undefined,
  setLocked: async () => undefined,
  setHidden: async () => undefined,
  setMemberAccess: async () => undefined,
  setOwner: async () => undefined,
  moveMember: async (_guild, userId, channelId) => void (channelId ? voice.set(userId, channelId) : voice.delete(userId)),
  memberVoiceChannel: async (_guild, userId) => voice.get(userId),
  sendPanel: async () => ({ messageId: "1432100000000009999" }),
};

const service = new VoiceRoomService(repository, gateway);
const hubInput: VoiceHubInput = {
  name: "Gaming",
  enabled: true,
  channelId: hubChannel,
  nameTemplate: "{user} #{count}",
  userLimit: 4,
  bitrateKbps: 64,
  privateByDefault: false,
  deleteDelaySeconds: 10,
  allowedRoleIds: [],
};

beforeAll(async () => client.$connect());
beforeEach(async () => {
  voice.clear();
  await client.$executeRawUnsafe('TRUNCATE TABLE "voice_rooms", "voice_hubs", "voice_settings"');
});
afterAll(async () => client.$disconnect());

describe("PrismaVoiceRepository", () => {
  it("stores settings with revisions and hubs with unique channels", async () => {
    expect((await service.saveSettings({ guildId, enabled: true, controlPanel: false, allowClaim: true, expectedRevision: 0 })).revision).toBe(1);
    await expect(service.saveSettings({ guildId, enabled: true, controlPanel: true, allowClaim: true, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
    const hub = await service.createHub(guildId, hubInput);
    await expect(service.createHub(guildId, hubInput)).rejects.toThrow(/already a hub/);
    const updated = await service.updateHub(guildId, hub.id, { ...hubInput, categoryId: "1262656532902842426", allowedRoleIds: ["1262656532902842427"] });
    expect(updated).toMatchObject({ categoryId: "1262656532902842426", allowedRoleIds: ["1262656532902842427"] });
    await expect(service.deleteHub(guildId, "not-a-uuid")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("creates, transfers, and cleans up rooms, keeping rooms when a hub is deleted", async () => {
    const hub = await service.createHub(guildId, hubInput);
    const room = await service.handleJoin({ guildId, channelId: hubChannel, userId: alex, displayName: "Alex", roleIds: [] });
    expect(room).toMatchObject({ ownerId: alex, name: "Alex #1", panelMessageId: "1432100000000009999" });
    if (!room) throw new Error("room not created");
    expect((await service.handleJoin({ guildId, channelId: hubChannel, userId: alex, displayName: "Alex", roleIds: [] }))?.id).toBe(room.id);
    voice.set(sam, room.channelId);
    const transferred = await service.transfer(room, { userId: alex, displayName: "Alex", elevated: false }, sam);
    expect((await repository.findRoomByOwner(guildId, sam))?.id).toBe(transferred.id);
    expect(await service.roomEmptied(room.channelId)).toMatchObject({ delaySeconds: 10 });
    await service.deleteHub(guildId, hub.id);
    expect((await service.rooms(guildId))[0]?.hubId).toBeUndefined();
    expect(await service.cleanup(() => 0)).toBe(1);
    expect(await service.rooms(guildId)).toEqual([]);
  });
});
