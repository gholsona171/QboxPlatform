import { describe, expect, it } from "vitest";

import {
  FivemService,
  HttpFivemQueryClient,
  InMemoryFivemRepository,
  defaultFivemSettings,
  formatUptime,
  localTime,
  playerLines,
  statusEmbed,
  type FivemEmbed,
  type FivemGateway,
  type FivemQueryClient,
  type FivemServerStatus,
  type FivemSettingsInput,
  type FivemImage,
  type FivemLogger,
  type FivemStatusMessageOptions,
  DiscordRestFivemGateway,
  decidePhase,
  nextRestart,
  parseUptime,
  presenceText,
  renderPlayerGraph,
  restartWindow,
  zonedInstant,
} from "../src/index.js";

const GUILD = "100000000000000001";
const STATUS_CHANNEL = "500000000000000001";
const ALERT_CHANNEL = "500000000000000002";
const ROLE = "400000000000000001";

class FakeGateway implements FivemGateway {
  public readonly upserts: { messageId: string | undefined; embed: FivemEmbed; image: FivemImage | undefined; refreshImage: boolean }[] = [];
  public readonly alerts: { content: string; roleId: string | undefined; embed: FivemEmbed }[] = [];
  public failEdits = false;
  public async upsertStatusMessage(_channelId: string, messageId: string | undefined, embed: FivemEmbed, _connectUrl: string | undefined, options: FivemStatusMessageOptions = {}) {
    if (this.failEdits) throw Object.assign(new Error("rate limited"), { status: 429 });
    this.upserts.push({ messageId, embed, image: options.image, refreshImage: options.refreshImage ?? false });
    return messageId ?? "700000000000000001";
  }
  public async postAlert(_channelId: string, content: string, embed: FivemEmbed, roleId: string | undefined) { this.alerts.push({ content, roleId, embed }); }
}

class FakeQuery implements FivemQueryClient {
  public online = true;
  public partial = false;
  public players = 3;
  public startedAt: Date | undefined;
  public constructor(private readonly now: () => Date) {}
  public async query(): Promise<FivemServerStatus> {
    return this.online
      ? {
          online: true,
          hostname: "Qbox RP",
          players: Array.from({ length: this.players }, (_, index) => ({ id: index + 1, name: `P${index + 1}`, ping: 40 })),
          playerCount: this.players,
          maxPlayers: 64,
          ...(this.partial ? { partial: true } : {}),
          ...(this.startedAt ? { startedAt: this.startedAt } : {}),
          checkedAt: this.now(),
        }
      : { online: false, players: [], playerCount: 0, maxPlayers: 0, error: "The server could not be reached.", checkedAt: this.now() };
  }
}

class MemoryLogger implements FivemLogger {
  public readonly infos: Record<string, unknown>[] = [];
  public readonly warnings: string[] = [];
  public info(fields: Record<string, unknown>) { this.infos.push(fields); }
  public warn(_fields: Record<string, unknown>, message: string) { this.warnings.push(message); }
}

function settings(overrides: Partial<FivemSettingsInput> = {}): FivemSettingsInput {
  const { revision: _revision, ...defaults } = defaultFivemSettings(GUILD);
  return { ...defaults, serverAddress: "127.0.0.1:30120", statusChannelId: STATUS_CHANNEL, alertChannelId: ALERT_CHANNEL, alertRoleId: ROLE, ...overrides };
}

async function setup(overrides: Partial<FivemSettingsInput> = {}, start = "2026-09-25T05:40:00.000Z") {
  let clock = new Date(start);
  const now = () => clock;
  const repository = new InMemoryFivemRepository();
  const gateway = new FakeGateway();
  const query = new FakeQuery(now);
  const logger = new MemoryLogger();
  const service = new FivemService(repository, query, gateway, now, logger);
  await service.saveSettings(settings(overrides));
  const advance = (seconds: number) => { clock = new Date(clock.getTime() + seconds * 1000); };
  /** Runs the 15-second check loop for `seconds`. */
  const run = async (seconds: number) => {
    for (let elapsed = 0; elapsed < seconds; elapsed += 15) {
      advance(15);
      await service.tick();
    }
  };
  const state = async () => (await repository.get(GUILD))!.state;
  return { service, repository, gateway, query, logger, advance, run, state, now };
}

const contents = (gateway: FakeGateway) => gateway.alerts.map((alert) => alert.content);

describe("FivemService settings", () => {
  it("validates and normalizes settings", async () => {
    const { service } = await setup();
    const saved = await service.saveSettings(settings({ serverAddress: " Play.Example.com:30120 ", restartTimes: ["18:00", "06:00", "06:00"], restartWarningMinutes: [1, 15, 5], expectedRevision: 1 }));
    expect(saved).toMatchObject({ serverAddress: "play.example.com:30120", restartTimes: ["06:00", "18:00"], restartWarningMinutes: [15, 5, 1], revision: 2 });
    await expect(service.saveSettings(settings({ expectedRevision: 1 }))).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(service.saveSettings(settings({ serverAddress: "no-port" }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.saveSettings(settings({ timeZone: "Mars/Base" }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.saveSettings(settings({ restartTimes: ["25:00"] }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.saveSettings(settings({ connectUrl: "https://evil.example/join" }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.saveSettings(settings({ updateIntervalSeconds: 5 }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });

  it("needs an address for live status", async () => {
    const { service } = await setup({ serverAddress: undefined });
    await expect(service.status(GUILD)).rejects.toMatchObject({ code: "INVALID_STATE" });
  });
});

// Cloud Nine's schedule as the example: 00:00, 08:00, 16:00 Los Angeles time, warned 15 and 5 minutes before.
const CLOUD_NINE = { restartTimes: ["00:00", "08:00", "16:00"], timeZone: "America/Los_Angeles", restartWarningMinutes: [15, 5] };
// 14:44 UTC is 07:44 in Los Angeles (summer time).
const BEFORE_EIGHT = "2026-09-25T14:44:00.000Z";

describe("FivemService status message", () => {
  it("checks every 15 seconds but edits the message and stores snapshots at the update interval", async () => {
    const { gateway, repository, run } = await setup();
    await run(15);
    expect(gateway.upserts).toHaveLength(1);
    expect(gateway.upserts[0]).toMatchObject({ messageId: undefined, embed: { image: "attachment://players.png", color: "#57F287" } });
    expect(gateway.upserts[0]?.image?.name).toBe("players.png");
    expect(gateway.upserts[0]?.embed.description).toContain("3/64");
    await run(45);
    expect(gateway.upserts).toHaveLength(1);
    expect(repository.snapshots).toHaveLength(1);
    await run(15);
    expect(gateway.upserts).toHaveLength(2);
    expect(gateway.upserts[1]).toMatchObject({ messageId: "700000000000000001", refreshImage: false });
    expect(repository.snapshots).toHaveLength(2);
    expect(gateway.alerts).toHaveLength(0);
  });

  it("redraws the player graph every 10 minutes", async () => {
    const { gateway, run } = await setup();
    await run(15);
    await run(600);
    expect(gateway.upserts[0]?.refreshImage).toBe(true);
    expect(gateway.upserts.slice(1).filter((upsert) => upsert.refreshImage)).toHaveLength(1);
    await run(60);
    expect(gateway.upserts.at(-1)?.refreshImage).toBe(false);
  });

  it("keeps the same message and retries when an edit fails, and logs the failure", async () => {
    const { gateway, logger, run, state } = await setup();
    await run(15);
    gateway.failEdits = true;
    await run(60);
    expect(logger.warnings.some((message) => message.includes("status message"))).toBe(true);
    const failedAt = (await state()).lastMessageAt;
    gateway.failEdits = false;
    await run(15);
    expect(gateway.upserts.at(-1)?.messageId).toBe("700000000000000001");
    expect((await state()).lastMessageAt?.getTime()).toBeGreaterThan(failedAt!.getTime());
  });
});

describe("FivemService state machine", () => {
  it("warns 15 and 5 minutes before a scheduled restart and never pings or says down during it", async () => {
    const { gateway, query, run, state } = await setup(CLOUD_NINE, BEFORE_EIGHT);
    await run(60);
    expect(contents(gateway)).toEqual(["⚠️ **Restarting in 15 minutes**"]);
    await run(600);
    expect(contents(gateway).at(-1)).toBe("⚠️ **Restarting in 5 minutes**");
    await run(300);
    query.online = false;
    await run(240);
    expect(contents(gateway).slice(2)).toEqual(["🔄 **Restarting now**"]);
    expect((await state()).phase).toBe("restarting");
    const yellow = gateway.upserts.at(-1)?.embed;
    expect(yellow).toMatchObject({ color: "#FEE75C" });
    expect(yellow?.description).toContain("Restarting");
    query.online = true;
    await run(15);
    expect(contents(gateway)).toEqual(["⚠️ **Restarting in 15 minutes**", "⚠️ **Restarting in 5 minutes**", "🔄 **Restarting now**", "🟢 **Back online**"]);
    expect(gateway.alerts.every((alert) => alert.roleId === undefined)).toBe(true);
    expect(gateway.alerts.at(-1)?.embed.description).toContain("scheduled restart is done");
    const after = await state();
    expect(after).toMatchObject({ phase: "online", downAlertSent: false });
    expect(after.onlineSince?.toISOString()).toBe("2026-09-25T15:04:15.000Z");
    expect(after.downSince).toBeUndefined();
  });

  it("treats a server still down after the restart window as a real outage", async () => {
    const { gateway, query, run } = await setup(CLOUD_NINE, BEFORE_EIGHT);
    await run(900);
    query.online = false;
    await run(15 * 60);
    expect(contents(gateway).filter((content) => content.includes("down"))).toEqual([]);
    await run(120);
    expect(gateway.alerts.filter((alert) => alert.content === "🔴 **Server is down**")).toEqual([expect.objectContaining({ roleId: ROLE })]);
  });

  it("shows Restarting on the first failed check and alerts once when the outage lasts", async () => {
    const { gateway, query, run, state } = await setup();
    await run(15);
    query.online = false;
    await run(15);
    expect(gateway.alerts).toHaveLength(0);
    expect((await state()).phase).toBe("restarting");
    expect(gateway.upserts.at(-1)?.embed.color).toBe("#FEE75C");
    await run(165);
    expect(gateway.alerts).toHaveLength(0);
    await run(15);
    expect(gateway.alerts).toEqual([expect.objectContaining({ content: "🔴 **Server is down**", roleId: ROLE })]);
    expect(gateway.upserts.at(-1)?.embed).toMatchObject({ color: "#ED4245" });
    await run(300);
    expect(gateway.alerts).toHaveLength(1);
    query.online = true;
    await run(15);
    expect(gateway.alerts[1]).toMatchObject({ content: "🟢 **Back online**", roleId: ROLE });
    expect(gateway.alerts[1]?.embed.description).toContain("was down for");
    expect(await state()).toMatchObject({ phase: "online", downAlertSent: false, lastOnline: true, failureStreak: 0 });
  });

  it("spots an unscheduled restart shorter than the outage threshold and resets the uptime", async () => {
    const { gateway, query, run, state, now } = await setup();
    await run(15);
    const firstSeen = (await state()).onlineSince;
    await run(600);
    query.online = false;
    await run(30);
    query.online = true;
    await run(15);
    expect(contents(gateway)).toEqual(["🟢 **Back online**"]);
    expect(gateway.alerts[0]).toMatchObject({ roleId: undefined });
    expect(gateway.alerts[0]?.embed.description).toContain("restarted");
    const after = await state();
    expect(after.onlineSince?.getTime()).toBe(now().getTime());
    expect(after.onlineSince?.getTime()).toBeGreaterThan(firstSeen!.getTime());
  });

  it("uses the start time the server reports and spots a restart between checks", async () => {
    const { gateway, query, run, state, now } = await setup();
    query.startedAt = new Date("2026-09-25T01:00:00.000Z");
    await run(15);
    expect((await state()).onlineSince?.toISOString()).toBe("2026-09-25T01:00:00.000Z");
    expect(gateway.upserts[0]?.embed.fields?.find((field) => field.name === "Uptime")?.value).toBe("4h 40m");
    query.startedAt = new Date(now().getTime() + 5_000);
    await run(15);
    expect(contents(gateway)).toEqual(["🟢 **Back online**"]);
  });

  it("shows Starting up while the server answers only partly, then Back online", async () => {
    const { gateway, query, run, state } = await setup();
    await run(15);
    query.online = false;
    await run(240);
    query.online = true;
    query.partial = true;
    await run(30);
    expect((await state()).phase).toBe("starting");
    expect(gateway.upserts.at(-1)?.embed.description).toContain("Starting up");
    expect(contents(gateway)).toEqual(["🔴 **Server is down**"]);
    query.partial = false;
    await run(15);
    expect(contents(gateway)).toEqual(["🔴 **Server is down**", "🟢 **Back online**"]);
  });

  it("counts a server that keeps answering only partly as up after a few minutes", async () => {
    const { query, run, state } = await setup();
    await run(15);
    query.online = false;
    await run(30);
    query.online = true;
    query.partial = true;
    await run(150);
    expect((await state()).phase).toBe("starting");
    await run(60);
    expect((await state()).phase).toBe("online");
  });

  it("logs each decision only while debug is on", async () => {
    const quiet = await setup();
    await quiet.run(30);
    expect(quiet.logger.infos).toHaveLength(0);
    const loud = await setup({ debug: true });
    await loud.run(15);
    loud.query.online = false;
    await loud.run(15);
    expect(loud.logger.infos.at(-1)).toMatchObject({ operation: "fivem-check", from: "online", to: "restarting", answered: false });
    expect(String(loud.logger.infos.at(-1)?.reason)).toContain("no alert yet");
  });

  it("decides nothing alarming on the very first check", () => {
    const now = new Date("2026-09-25T12:00:00Z");
    const down = decidePhase({ state: { failureStreak: 0, sentRestartWarnings: [] }, status: { online: false, players: [], playerCount: 0, maxPlayers: 0, checkedAt: now }, now, downAfterMinutes: 3 });
    expect(down).toMatchObject({ phase: "offline", posts: [] });
    const legacy = decidePhase({ state: { failureStreak: 0, sentRestartWarnings: [], lastOnline: true }, status: { online: false, players: [], playerCount: 0, maxPlayers: 0, checkedAt: now }, now, downAfterMinutes: 3 });
    expect(legacy).toMatchObject({ phase: "restarting", posts: [] });
  });

  it("buckets player history and uptime", async () => {
    const { service, query, run } = await setup();
    for (let index = 0; index < 4; index += 1) {
      query.players = index * 2;
      query.online = index !== 2;
      await run(60);
    }
    const history = await service.history(GUILD, "24h");
    expect(history.points).toHaveLength(96);
    expect(history.peak).toBe(6);
    expect(history.uptimePercent).toBe(75);
  });

  it("prunes old snapshots", async () => {
    const { service, repository, advance, run } = await setup();
    await run(15);
    advance(9 * 86_400);
    await service.tick();
    expect(repository.snapshots).toHaveLength(1);
  });
});

describe("restart schedule", () => {
  it("finds the next restart and the window around it, across time zones and DST", () => {
    const now = new Date(BEFORE_EIGHT);
    expect(nextRestart(now, CLOUD_NINE)?.toISOString()).toBe("2026-09-25T15:00:00.000Z");
    expect(restartWindow(now, CLOUD_NINE)).toBeUndefined();
    expect(restartWindow(new Date("2026-09-25T14:46:00Z"), CLOUD_NINE)?.key).toBe("2026-09-25 08:00|0");
    expect(restartWindow(new Date("2026-09-25T15:14:00Z"), CLOUD_NINE)).toBeDefined();
    expect(restartWindow(new Date("2026-09-25T15:16:00Z"), CLOUD_NINE)).toBeUndefined();
    expect(zonedInstant("2026-11-01", "16:00", "America/Los_Angeles").toISOString()).toBe("2026-11-02T00:00:00.000Z");
    expect(zonedInstant("2026-01-02", "00:30", "Europe/Berlin").toISOString()).toBe("2026-01-01T23:30:00.000Z");
    expect(nextRestart(now, { restartTimes: [], timeZone: "UTC" })).toBeUndefined();
  });
});

describe("status embed", () => {
  const many: FivemServerStatus = {
    online: true,
    hostname: "Cloud Nine RP",
    players: Array.from({ length: 64 }, (_, index) => ({ id: index + 1, name: index === 0 ? "*bold*" : `A rather long player name ${index}`, ping: 1 })),
    playerCount: 64,
    maxPlayers: 64,
    bannerUrl: "https://example.com/banner.png",
    checkedAt: new Date("2026-09-25T14:44:00Z"),
  };
  const base = { ...defaultFivemSettings(GUILD), serverAddress: "1.2.3.4:30120", connectUrl: "https://cfx.re/join/abc123" };

  it("hides names by default and shows join help, next restart, the graph and the banner", () => {
    const embed = statusEmbed(base, many, { phase: "online", nextRestart: new Date("2026-09-25T15:00:00Z"), graph: { peak: 70 }, onlineSince: new Date("2026-09-25T12:44:00Z") });
    expect(embed.fields?.some((field) => field.name === "Online now")).toBe(false);
    expect(embed.fields?.some((field) => field.name === "Connect")).toBe(false);
    expect(embed.fields?.find((field) => field.name === "How to join")?.value).toContain("```\nconnect cfx.re/join/abc123\n```");
    expect(embed.fields?.find((field) => field.name === "Next restart")?.value).toContain("<t:1790348400:R>");
    expect(embed.fields?.find((field) => field.name === "Uptime")?.value).toBe("2h 0m");
    expect(embed).toMatchObject({ image: "attachment://players.png", thumbnail: "https://example.com/banner.png" });
    expect(embed.footer).toContain("peak 70");
  });

  it("lists names when turned on, cut to fit with ...and N more", () => {
    const field = statusEmbed(base, many, { phase: "online", showPlayerNames: true }).fields?.find((item) => item.name === "Online now");
    expect(field?.value.length).toBeLessThanOrEqual(1024);
    expect(field?.value).toContain("\\*bold\\*");
    expect(field?.value).toMatch(/…and \d+ more$/);
  });

  it("colours each phase", () => {
    const down: FivemServerStatus = { online: false, players: [], playerCount: 0, maxPlayers: 0, checkedAt: new Date() };
    expect(statusEmbed(base, down, { phase: "restarting", scheduled: true }).color).toBe("#FEE75C");
    expect(statusEmbed(base, down, { phase: "offline" }).color).toBe("#ED4245");
    expect(statusEmbed(base, many, { phase: "starting" }).description).toContain("Starting up");
  });

  it("says what the bot is watching", () => {
    expect(presenceText({ phase: "online", status: many })).toBe("64/64 on Cloud Nine RP");
    expect(presenceText({ phase: "restarting", status: { ...many, online: false } })).toBe("Cloud Nine RP: restarting");
  });
});

describe("player graph", () => {
  it("renders a PNG of the last 24 hours, with or without data", async () => {
    const { service, run } = await setup();
    await run(120);
    const png = renderPlayerGraph(await service.history(GUILD, "24h"));
    expect(png.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    expect(png.readUInt32BE(16)).toBe(800);
    expect(png.readUInt32BE(20)).toBe(260);
    const empty = renderPlayerGraph({ range: "24h", points: [], peak: 0 });
    expect(empty.subarray(1, 4).toString()).toBe("PNG");
  });
});

describe("DiscordRestFivemGateway", () => {
  const embed: FivemEmbed = { title: "T", description: "D", color: "#57F287", image: "attachment://players.png" };
  const image = { name: "players.png", data: Buffer.from([1, 2, 3]) };
  function rest(patchError?: unknown) {
    const calls: { method: string; route: string; options: { body?: unknown; files?: unknown[] } | undefined }[] = [];
    const client = {
      get: async () => ({}),
      put: async () => ({}),
      delete: async () => ({}),
      post: async (route: string, options?: { body?: unknown; files?: unknown[] }) => { calls.push({ method: "post", route, options }); return { id: "800000000000000001" }; },
      patch: async (route: string, options?: { body?: unknown; files?: unknown[] }) => { calls.push({ method: "patch", route, options }); if (patchError) throw patchError; return {}; },
    };
    return { calls, gateway: new DiscordRestFivemGateway(client as never) };
  }

  it("keeps the attached graph on plain edits and replaces it on refresh", async () => {
    const { calls, gateway } = rest();
    await gateway.upsertStatusMessage("1", "2", embed, undefined, { image });
    expect(calls[0]?.options?.files).toBeUndefined();
    expect(calls[0]?.options?.body).not.toHaveProperty("attachments");
    await gateway.upsertStatusMessage("1", "2", embed, undefined, { image, refreshImage: true });
    expect(calls[1]?.options?.files).toHaveLength(1);
  });

  it("posts a new message only when the old one was deleted", async () => {
    const deleted = rest({ code: 10008 });
    expect(await deleted.gateway.upsertStatusMessage("1", "2", embed, undefined, { image })).toBe("800000000000000001");
    expect(deleted.calls.at(-1)).toMatchObject({ method: "post" });
    expect(deleted.calls.at(-1)?.options?.files).toHaveLength(1);
    const limited = rest({ status: 429, code: 0 });
    await expect(limited.gateway.upsertStatusMessage("1", "2", embed, undefined, { image })).rejects.toBeDefined();
    expect(limited.calls.map((call) => call.method)).toEqual(["patch"]);
  });
});

describe("helpers", () => {
  it("formats uptime, local time, and player lists", () => {
    expect(formatUptime(125 * 60_000)).toBe("2h 5m");
    expect(formatUptime(3 * 86_400_000 + 4 * 3_600_000)).toBe("3d 4h");
    expect(localTime(new Date("2026-01-01T23:30:00Z"), "Europe/Berlin")).toEqual({ date: "2026-01-02", time: "00:30" });
    const status: FivemServerStatus = { online: true, players: Array.from({ length: 45 }, (_, index) => ({ id: index + 1, name: index === 0 ? "*bold*" : "x", ping: 1 })), playerCount: 45, maxPlayers: 64, checkedAt: new Date() };
    expect(playerLines(status)).toContain("\\*bold\\*");
    expect(playerLines(status)).toContain("and 5 more");
  });

  it("reads uptimes servers share", () => {
    expect(parseUptime("2h 05m")).toBe(125 * 60_000);
    expect(parseUptime("1d 3h 20m")).toBe(((24 + 3) * 60 + 20) * 60_000);
    expect(parseUptime("125 minutes")).toBe(125 * 60_000);
    expect(parseUptime("01:02:03")).toBe(3_723_000);
    expect(parseUptime("soon")).toBeUndefined();
  });
});

describe("HttpFivemQueryClient", () => {
  const now = () => new Date("2026-09-25T12:00:00Z");
  const respond = (routes: Record<string, unknown>) => (async (url: string) => {
    const path = new URL(url).pathname.slice(1);
    return path in routes ? new Response(JSON.stringify(routes[path]), { status: 200 }) : new Response("no", { status: 404 });
  }) as typeof fetch;

  it("reads info, players, and dynamic data", async () => {
    const client = new HttpFivemQueryClient(respond({
      "info.json": { server: "FXServer-master v1.0.0.1", vars: { sv_maxClients: "48", sv_projectName: "^1Qbox ^7RP" } },
      "players.json": [{ id: 7, name: "Zed", ping: 60 }, { id: 2, name: "Amy", ping: 30 }],
      "dynamic.json": { clients: 2, sv_maxclients: "64", hostname: "^2Qbox^7 Roleplay", gametype: "Freeroam", mapname: "Los Santos" },
    }), 1000, now);
    const status = await client.query("127.0.0.1:30120");
    expect(status).toMatchObject({ online: true, hostname: "Qbox Roleplay", playerCount: 2, maxPlayers: 64, version: "FXServer-master v1.0.0.1" });
    expect(status.players.map((player) => player.name)).toEqual(["Amy", "Zed"]);
  });

  it("falls back to dynamic counts when the player list fails", async () => {
    const status = await new HttpFivemQueryClient(respond({ "dynamic.json": { clients: 5, sv_maxclients: 32, hostname: "Srv" } }), 1000, now).query("127.0.0.1:30120");
    expect(status).toMatchObject({ online: true, playerCount: 5, maxPlayers: 32, players: [] });
  });

  it("reports offline on errors and timeouts", async () => {
    const refused = (async () => { throw new TypeError("fetch failed"); }) as typeof fetch;
    expect(await new HttpFivemQueryClient(refused, 1000, now).query("127.0.0.1:1")).toMatchObject({ online: false, error: "The server could not be reached." });
    const hanging = ((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal?.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
    })) as typeof fetch;
    expect(await new HttpFivemQueryClient(hanging, 20, now).query("127.0.0.1:1")).toMatchObject({ online: false, error: "The server did not answer in time." });
  });
});
