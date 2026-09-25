import { describe, expect, it } from "vitest";

import {
  InMemoryLevelRepository,
  LevelService,
  VoiceTracker,
  defaultLevelSettings,
  eligibleVoiceMembers,
  levelForXp,
  levelProgress,
  renderLevelUpMessage,
  xpForLevel,
  type LevelGateway,
  type LevelMessage,
  type LevelSettingsInput,
  type VoiceParticipant,
} from "../src/index.js";

const GUILD = "100000000000000001";
const ALEX = "200000000000000001";
const SAM = "200000000000000002";
const CHANNEL = "500000000000000001";
const ANNOUNCE = "500000000000000002";
const QUIET = "500000000000000003";
const BOOSTER = "400000000000000001";
const MUTED_ROLE = "400000000000000002";
const REWARD_2 = "400000000000000010";
const REWARD_3 = "400000000000000011";

class FakeGateway implements LevelGateway {
  public readonly roles = new Map<string, Set<string>>();
  public readonly messages: { channelId: string; content: string }[] = [];
  public readonly dms: string[] = [];

  public async memberRoleIds(_guildId: string, userId: string) { return [...(this.roles.get(userId) ?? [])]; }
  public async addRole(_guildId: string, userId: string, roleId: string) { this.roleSet(userId).add(roleId); }
  public async removeRole(_guildId: string, userId: string, roleId: string) { this.roleSet(userId).delete(roleId); }
  public async sendMessage(channelId: string, content: string) { this.messages.push({ channelId, content }); }
  public async directMessage(_userId: string, content: string) { this.dms.push(content); return true; }

  public roleSet(userId: string): Set<string> {
    const set = this.roles.get(userId) ?? new Set<string>();
    this.roles.set(userId, set);
    return set;
  }
}

function settings(overrides: Partial<LevelSettingsInput> = {}): LevelSettingsInput {
  const { revision: _revision, ...defaults } = defaultLevelSettings(GUILD);
  return { ...defaults, enabled: true, messageXpMin: 20, messageXpMax: 20, cooldownSeconds: 60, curve: { base: 50, exponent: 2, linear: 50 }, ...overrides };
}

async function setup(overrides: Partial<LevelSettingsInput> = {}) {
  let clock = new Date("2026-09-25T12:00:00.000Z");
  const gateway = new FakeGateway();
  const repository = new InMemoryLevelRepository(() => clock);
  const service = new LevelService(repository, gateway, () => clock, () => 0);
  await service.saveSettings(settings(overrides));
  const message = (userId = ALEX, extra: Partial<LevelMessage> = {}): LevelMessage => ({ guildId: GUILD, channelId: CHANNEL, userId, displayName: "Alex", roleIds: [...gateway.roleSet(userId)], at: clock, ...extra });
  return { service, gateway, repository, message, advance: (seconds: number) => { clock = new Date(clock.getTime() + seconds * 1000); } };
}

describe("level curve", () => {
  it("follows base * n^exponent + linear * n", () => {
    const curve = { base: 50, exponent: 2, linear: 50 };
    expect([0, 1, 2, 3, 10].map((level) => xpForLevel(level, curve))).toEqual([0, 100, 300, 600, 5500]);
    expect(xpForLevel(4, { base: 100, exponent: 1.5, linear: 0 })).toBe(800);
  });

  it("finds the level for any XP and respects the max level", () => {
    const curve = { base: 50, exponent: 2, linear: 50 };
    expect(levelForXp(0, curve)).toBe(0);
    expect(levelForXp(99, curve)).toBe(0);
    expect(levelForXp(100, curve)).toBe(1);
    expect(levelForXp(599, curve)).toBe(2);
    expect(levelForXp(600, curve)).toBe(3);
    expect(levelForXp(1_000_000_000, curve, 5)).toBe(5);
    expect(levelProgress(350, curve)).toEqual({ level: 2, currentLevelXp: 300, nextLevelXp: 600 });
    expect(levelProgress(10_000, curve, 3).nextLevelXp).toBeUndefined();
  });

  it("is always increasing for every allowed curve", () => {
    for (const curve of [{ base: 1, exponent: 1, linear: 0 }, { base: 10_000, exponent: 4, linear: 10_000 }, { base: 3, exponent: 1.2, linear: 1 }])
      for (let level = 1; level < 200; level += 1) expect(xpForLevel(level + 1, curve)).toBeGreaterThan(xpForLevel(level, curve));
  });
});

describe("LevelService XP", () => {
  it("awards message XP once per cooldown and levels up with a message", async () => {
    const { service, gateway, message, advance } = await setup({ levelUpMessage: "{user} is now level {level}" });
    expect((await service.handleMessage(message()))?.xpAdded).toBe(20);
    expect(await service.handleMessage(message())).toBeUndefined();
    for (let index = 0; index < 4; index += 1) {
      advance(61);
      await service.handleMessage(message());
    }
    const profile = await service.profile(GUILD, ALEX);
    expect(profile.member).toMatchObject({ xp: 100, level: 1, messages: 5 });
    expect(profile.rank).toBe(1);
    expect(gateway.messages).toEqual([{ channelId: CHANNEL, content: `<@${ALEX}> is now level 1` }]);
  });

  it("applies role and channel multipliers and skips no-XP roles and channels", async () => {
    const { service, gateway, message, advance } = await setup({
      roleMultipliers: [{ id: BOOSTER, multiplier: 2 }],
      channelMultipliers: [{ id: CHANNEL, multiplier: 1.5 }],
      noXpRoleIds: [MUTED_ROLE],
      noXpChannelIds: [QUIET],
    });
    gateway.roleSet(ALEX).add(BOOSTER);
    expect((await service.handleMessage(message()))?.xpAdded).toBe(60);
    advance(61);
    expect(await service.handleMessage(message(ALEX, { channelId: "500000000000000009", parentChannelId: QUIET }))).toBeUndefined();
    gateway.roleSet(SAM).add(MUTED_ROLE);
    expect(await service.handleMessage(message(SAM))).toBeUndefined();
  });

  it("does nothing while disabled", async () => {
    const { service, message } = await setup({ enabled: false });
    expect(await service.handleMessage(message())).toBeUndefined();
  });

  it("awards voice minutes", async () => {
    const { service } = await setup({ voiceXpPerMinute: 10 });
    const [change] = await service.awardVoice([{ guildId: GUILD, channelId: CHANNEL, userId: ALEX, displayName: "Alex", roleIds: [], minutes: 12 }]);
    expect(change?.member).toMatchObject({ xp: 120, voiceMinutes: 12, level: 1 });
  });

  it("sends level-up messages to a channel or DM", async () => {
    const channel = await setup({ levelUpMode: "CHANNEL", levelUpChannelId: ANNOUNCE });
    await channel.service.give(GUILD, ALEX, 100);
    await channel.service.awardVoice([{ guildId: GUILD, channelId: CHANNEL, userId: SAM, displayName: "Sam", roleIds: [], minutes: 30 }]);
    expect(channel.gateway.messages[0]?.channelId).toBe(ANNOUNCE);
    const dm = await setup({ levelUpMode: "DM" });
    await dm.service.handleMessage(dm.message(ALEX, { at: new Date("2026-09-25T12:00:00.000Z") }));
    await dm.service.give(GUILD, ALEX, 500);
    expect(dm.gateway.dms).toHaveLength(0);
    await dm.service.awardVoice([{ guildId: GUILD, channelId: CHANNEL, userId: ALEX, displayName: "Alex", roleIds: [], minutes: 100 }]);
    expect(dm.gateway.dms).toHaveLength(1);
  });

  it("validates settings with readable messages", async () => {
    const { service } = await setup();
    await expect(service.saveSettings(settings({ messageXpMin: 30, messageXpMax: 10 }))).rejects.toThrow(/at least the minimum/);
    await expect(service.saveSettings(settings({ levelUpMode: "CHANNEL" }))).rejects.toThrow(/Choose a channel/);
    await expect(service.saveSettings(settings({ rewards: [{ level: 2, roleId: REWARD_2 }, { level: 3, roleId: REWARD_2 }] }))).rejects.toThrow(/once/);
    await expect(service.saveSettings(settings({ curve: { base: 50, exponent: 9, linear: 0 } }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.saveSettings({ ...settings(), expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("LevelService rewards and staff tools", () => {
  const rewards = [{ level: 3, roleId: REWARD_3 }, { level: 2, roleId: REWARD_2 }];

  it("stacks reward roles", async () => {
    const { service, gateway } = await setup({ rewards });
    await service.setLevel(GUILD, ALEX, 3);
    expect([...gateway.roleSet(ALEX)].sort()).toEqual([REWARD_2, REWARD_3]);
    await service.take(GUILD, ALEX, 200);
    expect([...gateway.roleSet(ALEX)]).toEqual([REWARD_2]);
  });

  it("keeps only the highest reward role", async () => {
    const { service, gateway } = await setup({ rewards, rewardMode: "HIGHEST" });
    await service.give(GUILD, ALEX, 300);
    expect([...gateway.roleSet(ALEX)]).toEqual([REWARD_2]);
    await service.give(GUILD, ALEX, 300);
    expect([...gateway.roleSet(ALEX)]).toEqual([REWARD_3]);
  });

  it("removes rewards on reset when enabled, and resets everyone", async () => {
    const { service, gateway, repository } = await setup({ rewards });
    await service.setLevel(GUILD, ALEX, 3);
    await service.reset(GUILD, ALEX);
    expect(gateway.roleSet(ALEX).size).toBe(0);
    await expect(service.reset(GUILD, ALEX)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await service.setLevel(GUILD, ALEX, 2);
    await service.give(GUILD, SAM, 5);
    expect(await service.resetAll(GUILD)).toEqual({ members: 1, rewardsRemoved: true });
    expect(repository.members.size).toBe(0);
    expect(gateway.roleSet(ALEX).size).toBe(0);
  });

  it("keeps rewards on reset when disabled", async () => {
    const { service, gateway } = await setup({ rewards, removeRewardsOnReset: false });
    await service.setLevel(GUILD, ALEX, 2);
    await service.reset(GUILD, ALEX);
    expect([...gateway.roleSet(ALEX)]).toEqual([REWARD_2]);
  });

  it("caps levels at the max level and pages the leaderboard", async () => {
    const { service } = await setup({ maxLevel: 2 });
    expect((await service.give(GUILD, ALEX, 100_000)).member.level).toBe(2);
    await expect(service.setLevel(GUILD, ALEX, 3)).rejects.toMatchObject({ code: "INVALID_INPUT" });
    for (let index = 0; index < 12; index += 1) await service.give(GUILD, `3000000000000000${10 + index}`, index + 1);
    const second = await service.leaderboard(GUILD, 2);
    expect(second).toMatchObject({ total: 13, page: 2, pageSize: 10 });
    expect(second.members).toHaveLength(3);
    expect((await service.leaderboard(GUILD, 1)).members[0]?.userId).toBe(ALEX);
    expect(await service.take(GUILD, ALEX, 10_000_000)).toMatchObject({ member: { xp: 0, level: 0 } });
  });

  it("renders templates", () => {
    expect(renderLevelUpMessage("{user} reached {level}! {level}", ALEX, 4)).toBe(`<@${ALEX}> reached 4! 4`);
  });
});

describe("voice tracking", () => {
  const person = (userId: string, extra: Partial<VoiceParticipant> = {}): VoiceParticipant => ({ userId, displayName: userId, roleIds: [], bot: false, muted: false, deafened: false, ...extra });

  it("only counts people who are not alone, muted, or deafened", () => {
    expect(eligibleVoiceMembers([person(ALEX), person("bot", { bot: true })])).toEqual([]);
    expect(eligibleVoiceMembers([person(ALEX), person(SAM, { muted: true })]).map((item) => item.userId)).toEqual([ALEX]);
  });

  it("collects whole minutes and keeps the remainder", () => {
    const tracker = new VoiceTracker();
    tracker.syncChannel(GUILD, CHANNEL, [person(ALEX)], 0);
    tracker.syncChannel(GUILD, CHANNEL, [person(ALEX), person(SAM)], 30_000);
    expect(tracker.flush(120_000)).toEqual([
      { guildId: GUILD, channelId: CHANNEL, userId: ALEX, displayName: ALEX, roleIds: [], minutes: 1 },
      { guildId: GUILD, channelId: CHANNEL, userId: SAM, displayName: SAM, roleIds: [], minutes: 1 },
    ]);
    tracker.syncChannel(GUILD, CHANNEL, [person(ALEX)], 150_000);
    const next = tracker.flush(400_000);
    expect(next.map((item) => [item.userId, item.minutes])).toEqual([[ALEX, 1], [SAM, 1]]);
    expect(tracker.flush(1_000_000)).toEqual([]);
    expect(tracker.size).toBe(0);
  });
});
