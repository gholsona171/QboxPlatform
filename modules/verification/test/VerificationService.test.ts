import { describe, expect, it } from "vitest";

import {
  DiscordRestVerificationGateway,
  InMemoryVerificationRepository,
  VerificationService,
  accountCreatedAt,
  defaultVerificationSettings,
  fillTemplate,
  type GuildMemberInfo,
  type VerificationEmbed,
  type VerificationGateway,
  type VerificationMember,
  type VerificationPanel,
  type VerificationSettingsInput,
  type VerificationStaff,
} from "../src/index.js";

const GUILD = "100000000000000001";
const VERIFIED = "400000000000000001";
const UNVERIFIED = "400000000000000002";
const LOGS = "500000000000000001";
const PANEL_CHANNEL = "500000000000000002";
const WELCOME = "500000000000000003";
const NOW = new Date("2026-09-25T12:00:00.000Z");
const STAFF: VerificationStaff = { userId: "300000000000000001", displayName: "Jay", source: "DISCORD" };

/** A user ID whose account was created `days` before NOW. */
function userCreatedDaysAgo(days: number): string {
  return String((BigInt(NOW.getTime() - days * 86_400_000) - 1_420_070_400_000n) << 22n);
}

const OLD = userCreatedDaysAgo(400);
const NEW = userCreatedDaysAgo(2);

class FakeGateway implements VerificationGateway {
  public readonly calls: string[] = [];
  public readonly dms: string[] = [];
  public readonly messages: string[] = [];
  public readonly logs: VerificationEmbed[] = [];
  public readonly members = new Map<string, GuildMemberInfo>();
  public failRoles = false;

  public async member(_guildId: string, userId: string) { return this.members.get(userId); }
  public async guildName() { return "Qbox City"; }
  public async addRole(_g: string, userId: string, roleId: string) {
    if (this.failRoles) throw new Error("Missing Permissions");
    this.calls.push(`add ${userId} ${roleId}`);
    const member = this.members.get(userId);
    if (member) this.members.set(userId, { ...member, roleIds: [...member.roleIds, roleId] });
  }
  public async removeRole(_g: string, userId: string, roleId: string) {
    this.calls.push(`remove ${userId} ${roleId}`);
    const member = this.members.get(userId);
    if (member) this.members.set(userId, { ...member, roleIds: member.roleIds.filter((id) => id !== roleId) });
  }
  public async kick(_g: string, userId: string) { this.calls.push(`kick ${userId}`); this.members.delete(userId); }
  public async directMessage(_userId: string, content: string) { this.dms.push(content); return true; }
  public async sendMessage(channelId: string, content: string) { this.messages.push(`${channelId} ${content}`); }
  public async postEmbed(_channelId: string, embed: VerificationEmbed) { this.logs.push(embed); }
  public async publishPanel(_channelId: string, _panel: VerificationPanel, existing?: string) { this.calls.push(`panel ${existing ?? "new"}`); return { messageId: existing ?? "600000000000000001" }; }
}

function settings(overrides: Partial<VerificationSettingsInput> = {}): VerificationSettingsInput {
  const { revision: _revision, ...defaults } = defaultVerificationSettings(GUILD);
  return { ...defaults, enabled: true, verifiedRoleIds: [VERIFIED], unverifiedRoleId: UNVERIFIED, logChannelId: LOGS, channelId: PANEL_CHANNEL, ...overrides };
}

async function setup(overrides: Partial<VerificationSettingsInput> = {}) {
  let clock = NOW;
  const now = () => clock;
  const gateway = new FakeGateway();
  const repository = new InMemoryVerificationRepository();
  const service = new VerificationService(repository, gateway, now);
  await service.saveSettings(settings(overrides));
  const member = (userId = OLD, roleIds: string[] = [UNVERIFIED]): VerificationMember => {
    gateway.members.set(userId, { userId, displayName: "Alex", roleIds });
    return { userId, displayName: "Alex", roleIds };
  };
  return { service, gateway, repository, member, advance: (minutes: number) => { clock = new Date(clock.getTime() + minutes * 60_000); } };
}

describe("VerificationService settings", () => {
  it("validates settings with readable messages", async () => {
    const { service } = await setup();
    await expect(service.saveSettings(settings({ verifiedRoleIds: [] }))).rejects.toThrow("Choose at least one verified role");
    await expect(service.saveSettings(settings({ mode: "QUESTION" }))).rejects.toThrow("at least one question");
    await expect(service.saveSettings(settings({ unverifiedRoleId: VERIFIED }))).rejects.toThrow("cannot also be a verified role");
    await expect(service.saveSettings(settings({ panel: { title: "Hi", description: "x", color: "blue", buttonLabel: "Go" } }))).rejects.toThrow("hex color");
    await expect(service.saveSettings(settings({ welcomeChannelId: WELCOME }))).rejects.toThrow("welcome message");
    await expect(service.saveSettings({ ...settings(), expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("normalizes accepted answers", async () => {
    const { service } = await setup();
    const saved = await service.saveSettings(settings({ mode: "QUESTION", questions: [{ id: "rules", prompt: " Secret word? ", answers: ["  Pineapple ", "pineapple", "PINE  apple"] }] }));
    expect(saved.questions).toEqual([{ id: "rules", prompt: "Secret word?", answers: ["pineapple", "pine apple"] }]);
  });

  it("reads account age from the user ID and fills templates", () => {
    expect(accountCreatedAt(NEW).getTime()).toBe(NOW.getTime() - 2 * 86_400_000);
    expect(fillTemplate("Hi {user}, welcome to {server}!", OLD, "Qbox")).toBe(`Hi <@${OLD}>, welcome to Qbox!`);
  });
});

describe("VerificationService flows", () => {
  it("verifies with a button: adds roles, removes the unverified role, DMs, welcomes, and logs", async () => {
    const { service, gateway, repository, member } = await setup({ dmOnSuccess: true, welcomeChannelId: WELCOME, welcomeMessage: "Welcome {user} to {server}!" });
    await service.memberJoined(GUILD, member(OLD, []));
    expect(gateway.calls).toEqual([`add ${OLD} ${UNVERIFIED}`]);
    expect(await repository.getPending(GUILD, OLD)).toMatchObject({ flagged: false });
    const outcome = await service.verifyByButton(GUILD, member(OLD, [UNVERIFIED]));
    expect(outcome.passed).toBe(true);
    expect(gateway.calls.slice(1)).toEqual([`add ${OLD} ${VERIFIED}`, `remove ${OLD} ${UNVERIFIED}`]);
    expect(gateway.dms).toEqual(["You are now verified in Qbox City. Welcome!"]);
    expect(gateway.messages).toEqual([`${WELCOME} Welcome <@${OLD}> to Qbox City!`]);
    expect(gateway.logs.at(-1)?.title).toBe("Member verified");
    expect(await repository.getPending(GUILD, OLD)).toBeUndefined();
    expect((await service.attempts({ guildId: GUILD }))[0]).toMatchObject({ result: "PASSED", userId: OLD });
    await expect(service.verifyByButton(GUILD, member(OLD, [VERIFIED]))).rejects.toThrow("already verified");
  });

  it("refuses when verification is off", async () => {
    const { service, member } = await setup({ enabled: false });
    await expect(service.verifyByButton(GUILD, member())).rejects.toMatchObject({ code: "INVALID_STATE" });
  });

  it("checks captcha codes without case or spaces and cools down after too many wrong codes", async () => {
    const { service, member, advance } = await setup({ mode: "CAPTCHA", maxAttempts: 2, cooldownMinutes: 10 });
    const first = await service.startCaptcha(GUILD, member());
    expect(first.code).toMatch(/^[A-Z2-9]{6}$/);
    expect(first.display).toBe(first.code.split("").join(" "));
    const wrong = await service.submitCaptcha(GUILD, member(), "nope");
    expect(wrong).toMatchObject({ passed: false });
    expect(wrong.message).toContain("1 try left");
    await expect(service.submitCaptcha(GUILD, member(), first.code)).rejects.toThrow("expired");
    await service.startCaptcha(GUILD, member());
    expect((await service.submitCaptcha(GUILD, member(), "wrong")).message).toContain("out of tries");
    await expect(service.startCaptcha(GUILD, member())).rejects.toMatchObject({ code: "LIMIT_REACHED", message: "Too many wrong tries. Try again in 10 minutes." });
    advance(11);
    const next = await service.startCaptcha(GUILD, member());
    expect(await service.submitCaptcha(GUILD, member(), next.display.toLowerCase())).toMatchObject({ passed: true });
  });

  it("expires captcha codes after five minutes", async () => {
    const { service, member, advance } = await setup({ mode: "CAPTCHA" });
    const challenge = await service.startCaptcha(GUILD, member());
    advance(6);
    await expect(service.submitCaptcha(GUILD, member(), challenge.code)).rejects.toThrow("expired");
  });

  it("checks question answers case-insensitively", async () => {
    const { service, member } = await setup({ mode: "QUESTION", questions: [{ id: "word", prompt: "Secret word?", answers: ["Pineapple"] }, { id: "age", prompt: "Are you 16+?", answers: ["yes", "y"] }] });
    expect((await service.questions(GUILD, member())).map((question) => question.id)).toEqual(["word", "age"]);
    const failed = await service.submitAnswers(GUILD, member(), { word: "apple", age: "yes" });
    expect(failed).toMatchObject({ passed: false });
    expect((await service.attempts({ guildId: GUILD, results: ["FAILED"] }))[0]?.reason).toContain("Secret word?");
    expect(await service.submitAnswers(GUILD, member(), { word: "  PINEAPPLE ", age: "Y" })).toMatchObject({ passed: true });
  });

  it("denies, kicks, or flags accounts that are too new", async () => {
    const deny = await setup({ minAccountAgeDays: 7, ageAction: "DENY" });
    await expect(deny.service.verifyByButton(GUILD, deny.member(NEW))).rejects.toThrow("at least 7 days old");
    expect((await deny.service.attempts({ guildId: GUILD }))[0]?.result).toBe("DENIED_AGE");

    const kick = await setup({ minAccountAgeDays: 7, ageAction: "KICK" });
    await kick.service.memberJoined(GUILD, kick.member(NEW, []));
    expect(kick.gateway.calls).toEqual([`kick ${NEW}`]);
    expect(kick.gateway.dms[0]).toContain("newer than 7 days");
    expect((await kick.service.attempts({ guildId: GUILD }))[0]?.result).toBe("KICKED");

    const flag = await setup({ minAccountAgeDays: 7, ageAction: "FLAG" });
    await flag.service.memberJoined(GUILD, flag.member(NEW, []));
    expect(await flag.repository.getPending(GUILD, NEW)).toMatchObject({ flagged: true });
    expect(flag.gateway.logs[0]?.title).toBe("New account flagged");
    expect((await flag.service.verifyByButton(GUILD, flag.member(NEW))).passed).toBe(true);
    expect((await flag.service.attempts({ guildId: GUILD }))[0]?.reason).toContain("flagged");
  });

  it("lets staff verify and unverify members", async () => {
    const { service, gateway, repository, member } = await setup();
    member(OLD, [UNVERIFIED]);
    const verified = await service.manualVerify(GUILD, OLD, STAFF);
    expect(verified).toMatchObject({ result: "MANUAL", staffId: STAFF.userId, source: "DISCORD" });
    expect((await service.status(GUILD, OLD)).verified).toBe(true);
    await expect(service.manualVerify(GUILD, OLD, STAFF)).rejects.toThrow("already verified");
    const revoked = await service.unverify(GUILD, OLD, STAFF, "Alt account");
    expect(revoked).toMatchObject({ result: "REVOKED", reason: "Alt account" });
    expect(gateway.members.get(OLD)?.roleIds).toEqual([UNVERIFIED]);
    expect(await repository.getPending(GUILD, OLD)).toBeDefined();
    await expect(service.unverify(GUILD, OLD, STAFF)).rejects.toThrow("not verified");
    await expect(service.manualVerify(GUILD, NEW, STAFF)).rejects.toMatchObject({ code: "NOT_FOUND" });
    const status = await service.status(GUILD, OLD);
    expect(status).toMatchObject({ inServer: true, verified: false });
    expect(status.attempts.map((attempt) => attempt.result)).toEqual(["REVOKED", "MANUAL"]);
  });

  it("explains role problems", async () => {
    const { service, gateway, member } = await setup();
    gateway.failRoles = true;
    await expect(service.verifyByButton(GUILD, member())).rejects.toThrow("Guildhall role (the bot's role) is above");
  });

  it("kicks members who stay unverified and reports stats", async () => {
    const { service, gateway, member, advance } = await setup({ kickUnverifiedMinutes: 30 });
    const other = userCreatedDaysAgo(300);
    await service.memberJoined(GUILD, member(OLD, []));
    await service.memberJoined(GUILD, member(other, []));
    await service.verifyByButton(GUILD, member(other, [UNVERIFIED]));
    expect(await service.sweepUnverified()).toEqual({ kicked: 0 });
    advance(31);
    expect(await service.sweepUnverified()).toEqual({ kicked: 1 });
    expect(gateway.calls).toContain(`kick ${OLD}`);
    expect(gateway.dms.at(-1)).toContain("did not verify within 30 minutes");
    expect(await service.stats(GUILD)).toEqual({ verified24h: 1, failed24h: 0, deniedAge24h: 0, kicked24h: 1, verifiedTotal: 1, pending: 0 });
  });

  it("posts the panel and updates it in place later", async () => {
    const { service, gateway } = await setup();
    expect(await service.publishPanel(GUILD)).toEqual({ channelId: PANEL_CHANNEL, messageId: "600000000000000001" });
    await service.publishPanel(GUILD);
    expect(gateway.calls).toEqual(["panel new", "panel 600000000000000001"]);
  });
});

describe("DiscordRestVerificationGateway", () => {
  it("posts a panel with the verify button and falls back to a new message", async () => {
    const requests: string[] = [];
    const rest = {
      get: async () => ({}),
      post: async (route: string, options?: { body?: unknown }) => {
        requests.push(`POST ${route} ${JSON.stringify(options?.body)}`);
        return { id: "600000000000000009" };
      },
      patch: async () => {
        throw new Error("Unknown Message");
      },
      put: async () => ({}),
      delete: async () => ({}),
    };
    const gateway = new DiscordRestVerificationGateway(rest);
    const result = await gateway.publishPanel(PANEL_CHANNEL, { title: "Verify", description: "Click", color: "#5865F2", buttonLabel: "Verify" }, "600000000000000001");
    expect(result.messageId).toBe("600000000000000009");
    expect(requests[0]).toContain("qbox:verification:start");
  });
});
