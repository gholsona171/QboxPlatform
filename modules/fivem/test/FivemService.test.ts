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
} from "../src/index.js";

const GUILD = "100000000000000001";
const STATUS_CHANNEL = "500000000000000001";
const ALERT_CHANNEL = "500000000000000002";
const ROLE = "400000000000000001";

class FakeGateway implements FivemGateway {
  public readonly upserts: { messageId: string | undefined; embed: FivemEmbed }[] = [];
  public readonly alerts: { content: string; roleId: string | undefined }[] = [];
  public async upsertStatusMessage(_channelId: string, messageId: string | undefined, embed: FivemEmbed) { this.upserts.push({ messageId, embed }); return messageId ?? "700000000000000001"; }
  public async postAlert(_channelId: string, content: string, _embed: FivemEmbed, roleId: string | undefined) { this.alerts.push({ content, roleId }); }
}

class FakeQuery implements FivemQueryClient {
  public online = true;
  public players = 3;
  public constructor(private readonly now: () => Date) {}
  public async query(): Promise<FivemServerStatus> {
    return this.online
      ? { online: true, hostname: "Qbox RP", players: Array.from({ length: this.players }, (_, index) => ({ id: index + 1, name: `P${index + 1}`, ping: 40 })), playerCount: this.players, maxPlayers: 64, checkedAt: this.now() }
      : { online: false, players: [], playerCount: 0, maxPlayers: 0, error: "The server could not be reached.", checkedAt: this.now() };
  }
}

function settings(overrides: Partial<FivemSettingsInput> = {}): FivemSettingsInput {
  const { revision: _revision, ...defaults } = defaultFivemSettings(GUILD);
  return { ...defaults, serverAddress: "127.0.0.1:30120", statusChannelId: STATUS_CHANNEL, alertChannelId: ALERT_CHANNEL, alertRoleId: ROLE, ...overrides };
}

async function setup(overrides: Partial<FivemSettingsInput> = {}) {
  let clock = new Date("2026-09-25T05:40:00.000Z");
  const now = () => clock;
  const repository = new InMemoryFivemRepository();
  const gateway = new FakeGateway();
  const query = new FakeQuery(now);
  const service = new FivemService(repository, query, gateway, now);
  await service.saveSettings(settings(overrides));
  return { service, repository, gateway, query, advance: (seconds: number) => { clock = new Date(clock.getTime() + seconds * 1000); } };
}

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

describe("FivemService monitoring", () => {
  it("posts and then edits the status message, recording snapshots", async () => {
    const { service, gateway, repository, advance } = await setup();
    await service.tick();
    expect(gateway.upserts[0]?.messageId).toBeUndefined();
    expect(gateway.upserts[0]?.embed.description).toContain("3/64 players");
    await service.tick();
    expect(gateway.upserts).toHaveLength(1);
    advance(60);
    await service.tick();
    expect(gateway.upserts[1]?.messageId).toBe("700000000000000001");
    expect(repository.snapshots).toHaveLength(2);
    expect(gateway.alerts).toHaveLength(0);
  });

  it("alerts after two failed polls and when the server returns", async () => {
    const { service, gateway, query, advance, repository } = await setup();
    await service.tick();
    query.online = false;
    advance(60);
    await service.tick();
    expect(gateway.alerts).toHaveLength(0);
    expect(gateway.upserts).toHaveLength(1);
    advance(60);
    await service.tick();
    expect(gateway.alerts).toEqual([{ content: "🔴 The FiveM server is down.", roleId: ROLE }]);
    expect(gateway.upserts.at(-1)?.embed.description).toContain("Offline");
    query.online = true;
    advance(60);
    await service.tick();
    expect(gateway.alerts[1]?.content).toBe("🟢 The FiveM server is back online.");
    expect((await repository.get(GUILD))?.state).toMatchObject({ lastOnline: true, failureStreak: 0 });
  });

  it("sends each restart warning once, in the configured time zone", async () => {
    // 05:40 UTC is 07:40 in Berlin (summer time); restart at 07:55 Berlin.
    const { service, gateway, advance } = await setup({ restartTimes: ["07:55"], timeZone: "Europe/Berlin", restartWarningMinutes: [15, 5, 0], statusChannelId: undefined });
    await service.tick();
    await service.tick();
    expect(gateway.alerts.map((alert) => alert.content)).toEqual(["⚠️ Server restart in **15 minutes** (07:55 Europe/Berlin)."]);
    advance(10 * 60);
    await service.tick();
    advance(5 * 60);
    await service.tick();
    expect(gateway.alerts.map((alert) => alert.content).slice(1)).toEqual(["⚠️ Server restart in **5 minutes** (07:55 Europe/Berlin).", "🔄 The server is restarting now."]);
  });

  it("buckets player history and uptime", async () => {
    const { service, query, advance } = await setup();
    for (let index = 0; index < 4; index += 1) {
      query.players = index * 2;
      query.online = index !== 2;
      await service.tick();
      advance(60);
    }
    const history = await service.history(GUILD, "24h");
    expect(history.points).toHaveLength(96);
    expect(history.peak).toBe(6);
    expect(history.uptimePercent).toBe(75);
    expect(history.points.at(-1)).toMatchObject({ players: 6, online: false });
  });

  it("prunes old snapshots", async () => {
    const { service, repository, advance } = await setup();
    await service.tick();
    advance(9 * 86_400);
    await service.tick();
    expect(repository.snapshots).toHaveLength(1);
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
    expect(statusEmbed({ ...defaultFivemSettings(GUILD), connectUrl: "https://cfx.re/join/abc" }, status).fields?.some((field) => field.name === "Connect")).toBe(true);
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
