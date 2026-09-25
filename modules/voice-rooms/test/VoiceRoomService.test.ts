import { describe, expect, it } from "vitest";

import {
  InMemoryVoiceRepository,
  VoiceRoomService,
  renderRoomName,
  type VoiceAccess,
  type VoiceActor,
  type VoiceChannelSpec,
  type VoiceGateway,
  type VoiceHubInput,
  type VoiceJoin,
} from "../src/index.js";

const GUILD = "100000000000000001";
const HUB_CHANNEL = "500000000000000001";
const CATEGORY = "500000000000000002";
const ALEX = "200000000000000001";
const SAM = "200000000000000002";
const KIM = "200000000000000003";
const VIP = "400000000000000001";

class FakeGateway implements VoiceGateway {
  public readonly calls: string[] = [];
  public readonly specs: VoiceChannelSpec[] = [];
  public readonly voice = new Map<string, string>();
  private next = 600000000000000001n;

  public async channelParentId() { return CATEGORY; }
  public async createRoomChannel(_guildId: string, spec: VoiceChannelSpec) {
    this.specs.push(spec);
    const channelId = String(this.next++);
    this.calls.push(`create ${spec.name}`);
    return { channelId };
  }
  public async deleteChannel(channelId: string) { this.calls.push(`delete ${channelId}`); }
  public async renameChannel(_channelId: string, name: string) { this.calls.push(`rename ${name}`); }
  public async setUserLimit(_channelId: string, limit: number) { this.calls.push(`limit ${limit}`); }
  public async setLocked(_guildId: string, _channelId: string, locked: boolean) { this.calls.push(locked ? "lock" : "unlock"); }
  public async setHidden(_guildId: string, _channelId: string, hidden: boolean) { this.calls.push(hidden ? "hide" : "unhide"); }
  public async setMemberAccess(_channelId: string, userId: string, access: VoiceAccess) { this.calls.push(`${access.toLowerCase()} ${userId}`); }
  public async setOwner(_channelId: string, userId: string) { this.calls.push(`owner ${userId}`); }
  public async moveMember(_guildId: string, userId: string, channelId: string | undefined) {
    this.calls.push(channelId ? `move ${userId} ${channelId}` : `disconnect ${userId}`);
    if (channelId) this.voice.set(userId, channelId);
    else this.voice.delete(userId);
  }
  public async memberVoiceChannel(_guildId: string, userId: string) { return this.voice.get(userId); }
  public async sendPanel() { this.calls.push("panel"); return { messageId: "700000000000000001" }; }
}

function hubInput(overrides: Partial<VoiceHubInput> = {}): VoiceHubInput {
  return {
    name: "Gaming",
    enabled: true,
    channelId: HUB_CHANNEL,
    nameTemplate: "{user}'s {game} #{count}",
    userLimit: 5,
    bitrateKbps: 64,
    privateByDefault: false,
    deleteDelaySeconds: 30,
    allowedRoleIds: [],
    ...overrides,
  };
}

const join = (userId: string, extra: Partial<VoiceJoin> = {}): VoiceJoin => ({ guildId: GUILD, channelId: HUB_CHANNEL, userId, displayName: userId === ALEX ? "Alex" : "Sam", roleIds: [], ...extra });
const actor = (userId: string, elevated = false): VoiceActor => ({ userId, displayName: userId, elevated });

async function setup(overrides: Partial<VoiceHubInput> = {}) {
  const gateway = new FakeGateway();
  const repository = new InMemoryVoiceRepository();
  const service = new VoiceRoomService(repository, gateway);
  const hub = await service.createHub(GUILD, hubInput(overrides));
  return { service, gateway, repository, hub };
}

describe("hubs", () => {
  it("validates hubs and prevents duplicates", async () => {
    const { service, hub } = await setup();
    await expect(service.createHub(GUILD, hubInput())).rejects.toThrow(/already a hub/);
    await expect(service.createHub(GUILD, hubInput({ channelId: "500000000000000009", userLimit: 100 }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    const updated = await service.updateHub(GUILD, hub.id, hubInput({ name: "Chill", categoryId: CATEGORY }));
    expect(updated).toMatchObject({ name: "Chill", categoryId: CATEGORY });
    await service.deleteHub(GUILD, hub.id);
    expect(await service.hubs(GUILD)).toEqual([]);
    await expect(service.deleteHub(GUILD, hub.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("renders room names", () => {
    expect(renderRoomName("{user} - {game} {count}", { user: "Alex", count: 2 })).toBe("Alex - Voice 2");
    expect(renderRoomName("{game}", { user: "Alex", count: 1, game: "Valorant" })).toBe("Valorant");
  });
});

describe("room lifecycle", () => {
  it("creates a room in the hub's category and moves the owner", async () => {
    const { service, gateway } = await setup({ privateByDefault: true });
    const room = await service.handleJoin(join(ALEX, { activity: "Minecraft" }));
    expect(room).toMatchObject({ ownerId: ALEX, name: "Alex's Minecraft #1", locked: true, hidden: true, panelMessageId: "700000000000000001" });
    expect(gateway.specs[0]).toMatchObject({ parentId: CATEGORY, userLimit: 5, bitrateKbps: 64, ownerId: ALEX, private: true });
    expect(gateway.voice.get(ALEX)).toBe(room?.channelId);
    const again = await service.handleJoin(join(ALEX));
    expect(again?.id).toBe(room?.id);
    expect(gateway.specs).toHaveLength(1);
  });

  it("ignores disabled hubs, disabled settings, and members without an allowed role", async () => {
    const { service, gateway, hub } = await setup({ allowedRoleIds: [VIP] });
    expect(await service.handleJoin(join(ALEX))).toBeUndefined();
    expect(gateway.calls).toContain(`disconnect ${ALEX}`);
    expect(await service.handleJoin(join(ALEX, { roleIds: [VIP] }))).toBeDefined();
    await service.updateHub(GUILD, hub.id, hubInput({ enabled: false }));
    expect(await service.handleJoin(join(SAM))).toBeUndefined();
    await service.updateHub(GUILD, hub.id, hubInput());
    await service.saveSettings({ guildId: GUILD, enabled: false, controlPanel: true, allowClaim: true, expectedRevision: 0 });
    expect(await service.handleJoin(join(SAM))).toBeUndefined();
  });

  it("deletes empty rooms after the hub's delay and cleans up stale rooms", async () => {
    const { service, gateway, repository } = await setup();
    const alex = await service.handleJoin(join(ALEX));
    const sam = await service.handleJoin(join(SAM));
    if (!alex || !sam) throw new Error("rooms not created");
    expect(await service.roomEmptied(alex.channelId)).toMatchObject({ room: { id: alex.id }, delaySeconds: 30 });
    await service.deleteRoom(GUILD, alex.id, "Empty");
    expect(gateway.calls).toContain(`delete ${alex.channelId}`);
    await service.handleJoin(join(KIM));
    const removed = await service.cleanup((room) => (room.ownerId === SAM ? undefined : room.ownerId === KIM ? 0 : 2));
    expect(removed).toBe(2);
    expect(repository.roomList).toHaveLength(0);
  });
});

describe("owner controls", () => {
  async function withRoom() {
    const context = await setup();
    const room = await context.service.handleJoin(join(ALEX));
    if (!room) throw new Error("room not created");
    return { ...context, room };
  }

  it("lets the owner rename, limit, lock, hide, and permit", async () => {
    const { service, gateway, room } = await withRoom();
    expect((await service.rename(room, actor(ALEX), "  Squad  ")).name).toBe("Squad");
    await service.limit(room, actor(ALEX), 3);
    expect((await service.lock(room, actor(ALEX), true)).locked).toBe(true);
    expect((await service.hide(room, actor(ALEX), true)).hidden).toBe(true);
    await service.permit(room, actor(ALEX), SAM);
    expect(gateway.calls).toEqual(expect.arrayContaining(["rename Squad", "limit 3", "lock", "hide", `permit ${SAM}`]));
    await expect(service.limit(room, actor(ALEX), 100)).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });

  it("blocks non-owners unless elevated", async () => {
    const { service, room } = await withRoom();
    await expect(service.lock(room, actor(SAM), true)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect((await service.lock(room, actor(SAM, true), true)).locked).toBe(true);
  });

  it("rejects and kicks members in the room", async () => {
    const { service, gateway, room } = await withRoom();
    await expect(service.kick(room, actor(ALEX), SAM)).rejects.toMatchObject({ code: "INVALID_STATE" });
    gateway.voice.set(SAM, room.channelId);
    await service.kick(room, actor(ALEX), SAM);
    gateway.voice.set(KIM, room.channelId);
    await service.reject(room, actor(ALEX), KIM);
    expect(gateway.calls).toEqual(expect.arrayContaining([`disconnect ${SAM}`, `reject ${KIM}`, `disconnect ${KIM}`]));
    await expect(service.reject(room, actor(ALEX), ALEX)).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });

  it("transfers ownership and lets others claim after the owner leaves", async () => {
    const { service, gateway, room } = await withRoom();
    await expect(service.transfer(room, actor(ALEX), SAM)).rejects.toThrow(/must be in the room/);
    gateway.voice.set(SAM, room.channelId);
    const transferred = await service.transfer(room, actor(ALEX), SAM);
    expect(transferred.ownerId).toBe(SAM);
    expect(gateway.calls).toEqual(expect.arrayContaining([`owner ${SAM}`, `clear ${ALEX}`]));
    gateway.voice.delete(ALEX);
    await expect(service.claim(transferred, actor(ALEX))).rejects.toThrow(/Join the room/);
    gateway.voice.set(ALEX, room.channelId);
    await expect(service.claim(transferred, actor(ALEX))).rejects.toThrow(/still in the room/);
    gateway.voice.delete(SAM);
    expect((await service.claim(transferred, actor(ALEX))).ownerId).toBe(ALEX);
  });

  it("respects the claim setting", async () => {
    const { service, gateway, room } = await withRoom();
    await service.saveSettings({ guildId: GUILD, enabled: true, controlPanel: true, allowClaim: false });
    gateway.voice.delete(ALEX);
    gateway.voice.set(SAM, room.channelId);
    await expect(service.claim(room, actor(SAM))).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("finds the room for a channel", async () => {
    const { service, room } = await withRoom();
    expect((await service.roomForChannel(room.channelId)).id).toBe(room.id);
    await expect(service.roomForChannel(undefined)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
