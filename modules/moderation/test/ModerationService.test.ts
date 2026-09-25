import { describe, expect, it } from "vitest";

import {
  DiscordRestModerationGateway,
  InMemoryModerationRepository,
  ModerationService,
  SpamTracker,
  defaultAutomod,
  defaultModerationSettings,
  evaluateAutomod,
  formatDuration,
  parseDuration,
  type AutomodMessage,
  type HierarchyCheck,
  type ModerationEmbed,
  type ModerationGateway,
  type ModerationSettingsInput,
  type Moderator,
} from "../src/index.js";

const GUILD = "100000000000000001";
const MEMBER = { userId: "200000000000000001", displayName: "Alex" };
const OTHER = { userId: "200000000000000002", displayName: "Sam" };
const MOD: Moderator = { userId: "300000000000000001", displayName: "Jay", source: "DISCORD" };
const LOGS = "500000000000000001";
const PROTECTED = "400000000000000009";

class FakeGateway implements ModerationGateway {
  public readonly calls: string[] = [];
  public readonly dms: ModerationEmbed[] = [];
  public readonly posts: ModerationEmbed[] = [];
  public hierarchy: HierarchyCheck = { allowed: true, targetRoleIds: [], targetIsMember: true };
  public dmWorks = true;

  public async checkHierarchy() { return this.hierarchy; }
  public async timeout(_g: string, userId: string, until: Date | undefined) { this.calls.push(`timeout ${userId} ${until ? "set" : "clear"}`); }
  public async kick(_g: string, userId: string) { this.calls.push(`kick ${userId}`); }
  public async ban(_g: string, userId: string, seconds: number) { this.calls.push(`ban ${userId} ${seconds}`); }
  public async unban(_g: string, userId: string) { this.calls.push(`unban ${userId}`); }
  public async directMessage(_u: string, embed: ModerationEmbed) { this.calls.push("dm"); this.dms.push(embed); return this.dmWorks; }
  public async postEmbed(_c: string, embed: ModerationEmbed) { this.posts.push(embed); return { messageId: "700000000000000001" }; }
  public async purge(_c: string, count: number) { this.calls.push(`purge ${count}`); return count; }
  public async setLocked(_g: string, _c: string, locked: boolean) { this.calls.push(locked ? "lock" : "unlock"); }
  public async setSlowmode(_c: string, seconds: number) { this.calls.push(`slowmode ${seconds}`); }
  public async deleteMessage() { this.calls.push("delete-message"); }
}

function settings(overrides: Partial<ModerationSettingsInput> = {}): ModerationSettingsInput {
  const { revision: _revision, ...defaults } = defaultModerationSettings(GUILD);
  return { ...defaults, logChannelId: LOGS, ...overrides };
}

async function setup(overrides: Partial<ModerationSettingsInput> = {}) {
  let clock = new Date("2026-09-25T12:00:00.000Z");
  const now = () => clock;
  const gateway = new FakeGateway();
  const repository = new InMemoryModerationRepository(now);
  const service = new ModerationService(repository, gateway, now);
  await service.saveSettings(settings(overrides));
  return { service, gateway, repository, advance: (minutes: number) => { clock = new Date(clock.getTime() + minutes * 60_000); } };
}

describe("ModerationService actions", () => {
  it("warns with a numbered case, DM, and log entry", async () => {
    const { service, gateway } = await setup({ appealMessage: "Appeal at example.com" });
    const warning = await service.act({ guildId: GUILD, type: "WARN", target: MEMBER, moderator: MOD, reason: "Spamming" });
    expect(warning).toMatchObject({ number: 1, type: "WARN", active: true, dmDelivered: true, logMessageId: "700000000000000001" });
    expect(gateway.dms[0]?.title).toBe("You received a warning");
    expect(gateway.posts[0]?.title).toBe("Warning | Case #1");
    expect((await service.act({ guildId: GUILD, type: "NOTE", target: MEMBER, moderator: MOD, reason: "Watch" })).number).toBe(2);
  });

  it("DMs before kicks and bans, and records failed DMs", async () => {
    const { service, gateway } = await setup({ appealMessage: "Appeal at example.com" });
    gateway.dmWorks = false;
    const ban = await service.act({ guildId: GUILD, type: "BAN", target: MEMBER, moderator: MOD, reason: "Cheating", deleteMessageHours: 24 });
    expect(gateway.calls.slice(0, 2)).toEqual(["dm", `ban ${MEMBER.userId} 86400`]);
    expect(ban.dmDelivered).toBe(false);
    expect(gateway.dms[0]?.fields?.some((field) => field.name === "Appeal")).toBe(true);
  });

  it("enforces reasons, self-moderation, hierarchy, and protected roles", async () => {
    const { service, gateway } = await setup({ requireReason: true, protectedRoleIds: [PROTECTED] });
    await expect(service.act({ guildId: GUILD, type: "KICK", target: MEMBER, moderator: MOD })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.act({ guildId: GUILD, type: "WARN", target: { userId: MOD.userId, displayName: "Jay" }, moderator: MOD, reason: "x" })).rejects.toThrow(/yourself/);
    gateway.hierarchy = { allowed: false, reason: "Your highest role must be above theirs.", targetRoleIds: [], targetIsMember: true };
    await expect(service.act({ guildId: GUILD, type: "BAN", target: MEMBER, moderator: MOD, reason: "x" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    gateway.hierarchy = { allowed: true, targetRoleIds: [PROTECTED], targetIsMember: true };
    await expect(service.act({ guildId: GUILD, type: "TIMEOUT", target: MEMBER, moderator: MOD, reason: "x" })).rejects.toThrow(/protected/);
    gateway.hierarchy = { allowed: true, targetRoleIds: [], targetIsMember: false };
    await expect(service.act({ guildId: GUILD, type: "KICK", target: MEMBER, moderator: MOD, reason: "x" })).rejects.toThrow(/not in the server/);
    expect((await service.act({ guildId: GUILD, type: "BAN", target: MEMBER, moderator: MOD, reason: "Ban evader" })).type).toBe("BAN");
  });

  it("times out with the default length and validates limits", async () => {
    const { service, gateway } = await setup({ defaultTimeoutMinutes: 30 });
    const timeout = await service.act({ guildId: GUILD, type: "TIMEOUT", target: MEMBER, moderator: MOD });
    expect(timeout).toMatchObject({ durationMinutes: 30, active: true });
    expect(timeout.expiresAt?.toISOString()).toBe("2026-09-25T12:30:00.000Z");
    await expect(service.act({ guildId: GUILD, type: "TIMEOUT", target: MEMBER, moderator: MOD, durationMinutes: 50_000 })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await service.act({ guildId: GUILD, type: "UNTIMEOUT", target: MEMBER, moderator: MOD });
    expect(gateway.calls).toContain(`timeout ${MEMBER.userId} clear`);
    expect((await service.history(GUILD, MEMBER.userId)).activeTimeout).toBeUndefined();
  });

  it("softbans by banning then unbanning", async () => {
    const { service, gateway } = await setup();
    await service.act({ guildId: GUILD, type: "SOFTBAN", target: MEMBER, moderator: MOD, reason: "Raid" });
    expect(gateway.calls.filter((call) => call.startsWith("ban") || call.startsWith("unban"))).toEqual([`ban ${MEMBER.userId} 86400`, `unban ${MEMBER.userId}`]);
  });
});

describe("ModerationService escalation, pardons, and expiry", () => {
  it("escalates at each warning threshold and ignores expired or pardoned warnings", async () => {
    const { service, gateway, advance } = await setup({
      warningExpiryDays: 30,
      escalation: [
        { warnings: 3, action: "BAN", durationMinutes: 1440 },
        { warnings: 2, action: "TIMEOUT", durationMinutes: 60 },
      ],
    });
    const first = await service.act({ guildId: GUILD, type: "WARN", target: MEMBER, moderator: MOD, reason: "1" });
    advance(60 * 24 * 31);
    await service.act({ guildId: GUILD, type: "WARN", target: MEMBER, moderator: MOD, reason: "2" });
    expect(gateway.calls.some((call) => call.startsWith("timeout"))).toBe(false);
    await service.act({ guildId: GUILD, type: "WARN", target: MEMBER, moderator: MOD, reason: "3" });
    expect(gateway.calls).toContain(`timeout ${MEMBER.userId} set`);
    await service.revoke(GUILD, first.number, MOD, "Mistake");
    await expect(service.revoke(GUILD, first.number, MOD)).rejects.toMatchObject({ code: "INVALID_STATE" });
    await service.act({ guildId: GUILD, type: "WARN", target: MEMBER, moderator: MOD, reason: "4" });
    const history = await service.history(GUILD, MEMBER.userId);
    expect(history.activeWarnings).toBe(3);
    expect(history.activeBan).toMatchObject({ source: "AUTOMOD", durationMinutes: 1440 });
  });

  it("lifts expired temporary bans and records an unban case", async () => {
    const { service, gateway, advance } = await setup();
    await service.act({ guildId: GUILD, type: "BAN", target: MEMBER, moderator: MOD, reason: "Cool off", durationMinutes: 60 });
    await service.act({ guildId: GUILD, type: "BAN", target: OTHER, moderator: MOD, reason: "Permanent" });
    advance(61);
    expect(await service.sweepExpired()).toEqual({ unbanned: 1, timeoutsEnded: 0 });
    expect(gateway.calls).toContain(`unban ${MEMBER.userId}`);
    const cases = await service.list({ guildId: GUILD });
    expect(cases[0]).toMatchObject({ type: "UNBAN", targetId: MEMBER.userId, source: "AUTOMOD" });
    expect((await service.history(GUILD, OTHER.userId)).activeBan).toBeDefined();
  });

  it("pardoning an active ban lifts it in Discord", async () => {
    const { service, gateway } = await setup();
    const ban = await service.act({ guildId: GUILD, type: "BAN", target: MEMBER, moderator: MOD, reason: "x" });
    const pardoned = await service.revoke(GUILD, ban.number, MOD, "Appeal accepted");
    expect(pardoned).toMatchObject({ active: false, revokeReason: "Appeal accepted" });
    expect(gateway.calls).toContain(`unban ${MEMBER.userId}`);
  });

  it("records bans done in Discord unless turned off", async () => {
    const { service } = await setup();
    const recorded = await service.recordExternal({ guildId: GUILD, type: "BAN", target: MEMBER, moderatorId: MOD.userId, moderatorName: "Jay", reason: "Manual" });
    expect(recorded).toMatchObject({ source: "EXTERNAL", active: true });
    await service.saveSettings(settings({ recordExternalActions: false, expectedRevision: 1 }));
    expect(await service.recordExternal({ guildId: GUILD, type: "UNBAN", target: MEMBER })).toBeUndefined();
  });

  it("edits reasons, adds evidence, purges, locks, and sets slowmode", async () => {
    const { service, gateway } = await setup();
    const warning = await service.act({ guildId: GUILD, type: "WARN", target: MEMBER, moderator: MOD });
    expect((await service.updateReason(GUILD, warning.number, MOD, "Toxic language")).reason).toBe("Toxic language");
    expect((await service.addEvidence(GUILD, warning.number, "https://cdn.example/shot.png")).evidence).toHaveLength(1);
    await expect(service.addEvidence(GUILD, warning.number, "javascript:alert(1)")).rejects.toMatchObject({ code: "INVALID_INPUT" });
    expect(await service.purge(GUILD, LOGS, 25, MOD)).toBe(25);
    await service.lock(GUILD, LOGS, true, MOD);
    await service.slowmode(GUILD, LOGS, 10, MOD);
    expect(gateway.calls).toEqual(expect.arrayContaining(["purge 25", "lock", "slowmode 10"]));
    await expect(service.getCase(GUILD, 99)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("automod", () => {
  const base: AutomodMessage = { guildId: GUILD, channelId: "600000000000000001", messageId: "610000000000000001", authorId: MEMBER.userId, authorName: "Alex", authorRoleIds: [], content: "", mentionCount: 0, createdAt: new Date("2026-09-25T12:00:00.000Z") };
  const on = <T extends object>(rule: T) => ({ ...rule, enabled: true });

  it("detects invites, links, words, mentions, and caps", () => {
    const automod = { ...defaultAutomod(), enabled: true, invites: on(defaultAutomod().invites), links: on(defaultAutomod().links), words: { ...on(defaultAutomod().words), words: ["badword", "scam*"] }, mentions: on(defaultAutomod().mentions), caps: on(defaultAutomod().caps) };
    const check = (content: string, mentionCount = 0) => evaluateAutomod(automod, { ...base, content, mentionCount }, new SpamTracker())?.rule;
    expect(check("join discord.gg/abc")).toBe("invites");
    expect(check("see https://evil.example/x")).toBe("links");
    expect(check("clip https://www.youtube.com/watch?v=1")).toBeUndefined();
    expect(check("you BADWORD")).toBe("words");
    expect(check("free scamcoins here")).toBe("words");
    expect(check("classic badwording is fine")).toBeUndefined();
    expect(check("hi", 9)).toBe("mentions");
    expect(check("WHY IS NOBODY ANSWERING ME")).toBe("caps");
    expect(check("Hello there, friend")).toBeUndefined();
  });

  it("skips exempt roles and channels, and detects spam bursts", () => {
    const automod = { ...defaultAutomod(), enabled: true, exemptRoleIds: [PROTECTED], spam: { ...on(defaultAutomod().spam), maxMessages: 3, perSeconds: 5 } };
    const tracker = new SpamTracker();
    const at = (ms: number) => ({ ...base, content: "hi", createdAt: new Date(base.createdAt.getTime() + ms) });
    expect([0, 500, 1000].map((ms) => evaluateAutomod(automod, at(ms), tracker))).toEqual([undefined, undefined, undefined]);
    expect(evaluateAutomod(automod, at(1500), tracker)?.rule).toBe("spam");
    expect(evaluateAutomod(automod, { ...at(1600), authorRoleIds: [PROTECTED] }, tracker)).toBeUndefined();
  });

  it("deletes the message and applies the rule's action", async () => {
    const { service, gateway } = await setup({ automod: { ...defaultAutomod(), enabled: true, invites: { enabled: true, action: "TIMEOUT", timeoutMinutes: 15 } } });
    const violation = await service.handleMessage({ ...base, content: "discord.gg/raid" });
    expect(violation?.rule).toBe("invites");
    expect(gateway.calls).toEqual(expect.arrayContaining(["delete-message", `timeout ${MEMBER.userId} set`]));
    expect((await service.list({ guildId: GUILD, source: "AUTOMOD" }))[0]).toMatchObject({ type: "TIMEOUT", durationMinutes: 15 });
  });

  it("parses and formats durations", () => {
    expect(["10m", "2h", "3 days", "1w", "45", "0", "soon"].map(parseDuration)).toEqual([10, 120, 4320, 10080, 45, undefined, undefined]);
    expect([1, 90, 1440, 10080].map(formatDuration)).toEqual(["1 minute", "90 minutes", "1 day", "1 week"]);
  });
});

describe("settings validation", () => {
  it("rejects duplicate escalation thresholds and bad automod values", async () => {
    const { service } = await setup();
    await expect(service.saveSettings(settings({ escalation: [{ warnings: 2, action: "KICK", durationMinutes: 0 }, { warnings: 2, action: "BAN", durationMinutes: 0 }] }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.saveSettings(settings({ automod: { ...defaultAutomod(), caps: { ...defaultAutomod().caps, percent: 20 } } }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.saveSettings(settings({ expectedRevision: 0 }))).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("DiscordRestModerationGateway", () => {
  const rest = (responses: Record<string, unknown>) => {
    const calls: string[] = [];
    const handle = (method: string) => async (route: string, options?: { body?: unknown }) => {
      calls.push(`${method} ${route} ${options?.body ? JSON.stringify(options.body) : ""}`.trim());
      if (route in responses) return responses[route];
      if (route.includes("/members/")) throw new Error("Unknown Member");
      return { id: "900000000000000001" };
    };
    return { calls, client: { get: handle("GET"), post: handle("POST"), patch: handle("PATCH"), put: handle("PUT"), delete: handle("DELETE") } };
  };
  const guild = { owner_id: "999", roles: [{ id: "r-low", position: 1 }, { id: "r-mod", position: 5 }, { id: "r-bot", position: 10 }, { id: "r-high", position: 20 }] };

  it("blocks targets above the moderator or the bot, and the owner", async () => {
    const { client } = rest({
      [`/guilds/${GUILD}`]: guild,
      "/users/@me": { id: "bot" },
      [`/guilds/${GUILD}/members/bot`]: { roles: ["r-bot"], user: { id: "bot" } },
      [`/guilds/${GUILD}/members/mod`]: { roles: ["r-mod"], user: { id: "mod" } },
      [`/guilds/${GUILD}/members/low`]: { roles: ["r-low"], user: { id: "low" } },
      [`/guilds/${GUILD}/members/peer`]: { roles: ["r-mod"], user: { id: "peer" } },
      [`/guilds/${GUILD}/members/high`]: { roles: ["r-high"], user: { id: "high" } },
      [`/guilds/${GUILD}/members/999`]: { roles: [], user: { id: "999" } },
    });
    const gateway = new DiscordRestModerationGateway(client);
    expect((await gateway.checkHierarchy(GUILD, "mod", "low")).allowed).toBe(true);
    expect((await gateway.checkHierarchy(GUILD, "mod", "peer")).reason).toMatch(/Your highest role/);
    expect((await gateway.checkHierarchy(GUILD, undefined, "high")).reason).toMatch(/My highest role/);
    expect((await gateway.checkHierarchy(GUILD, "mod", "999")).reason).toMatch(/owner/);
    expect(await gateway.checkHierarchy(GUILD, "mod", "gone")).toMatchObject({ allowed: true, targetIsMember: false });
  });

  it("bulk-deletes only recent messages from the chosen user", async () => {
    const now = Date.parse("2026-09-25T12:00:00.000Z");
    const { client, calls } = rest({
      "/channels/c/messages?limit=100": [
        { id: "1", timestamp: "2026-09-25T11:00:00.000Z", author: { id: "u" } },
        { id: "2", timestamp: "2026-09-25T11:00:00.000Z", author: { id: "x" } },
        { id: "3", timestamp: "2026-09-24T11:00:00.000Z", author: { id: "u" } },
        { id: "4", timestamp: "2026-08-01T11:00:00.000Z", author: { id: "u" } },
      ],
    });
    expect(await new DiscordRestModerationGateway(client, () => now).purge("c", 10, "u")).toBe(2);
    expect(calls.at(-1)).toBe('POST /channels/c/messages/bulk-delete {"messages":["1","3"]}');
  });

  it("locks by denying send permissions for @everyone and unlocks by removing them", async () => {
    const { client, calls } = rest({ "/channels/c": { permission_overwrites: [{ id: GUILD, type: 0, allow: "2048", deny: "1024" }] } });
    const gateway = new DiscordRestModerationGateway(client);
    await gateway.setLocked(GUILD, "c", true, "raid");
    const locked = JSON.parse(calls.at(-1)?.split(" ").slice(2).join(" ") ?? "{}") as { allow: string; deny: string };
    expect(BigInt(locked.allow) & 2048n).toBe(0n);
    expect(BigInt(locked.deny) & 2048n).toBe(2048n);
    expect(BigInt(locked.deny) & 1024n).toBe(1024n);
  });
});
