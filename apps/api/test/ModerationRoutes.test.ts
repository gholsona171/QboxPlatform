import { describe, expect, it } from "vitest";
import { InMemoryModerationRepository, ModerationService, defaultModerationSettings, type ModerationGateway } from "@qbox/moderation";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { moderationApiFeature } from "../src/moderation/ModerationRoutes.js";

const GUILD = "100000000000000001";
const MEMBER = "200000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT" | "PATCH", url: string, payload: unknown) => ({ method, url, payload: payload as Record<string, unknown>, headers: { ...host, "content-type": "application/json" } });

const gateway: ModerationGateway = {
  guildName: async () => "Qbox",
  checkHierarchy: async () => ({ allowed: true, targetRoleIds: [], targetIsMember: true }),
  timeout: async () => undefined,
  kick: async () => undefined,
  ban: async () => undefined,
  unban: async () => undefined,
  directMessage: async () => true,
  postEmbed: async () => ({ messageId: "700000000000000001" }),
  postMessage: async () => ({ messageId: "700000000000000001" }),
  purge: async (_channel, count) => count,
  setLocked: async () => undefined,
  setSlowmode: async () => undefined,
  deleteMessage: async () => undefined,
};

function setup(allowed: readonly string[]) {
  const calls: { permission: string; mutation: boolean }[] = [];
  const context: ApiFeatureContext = {
    guildId: GUILD,
    guard: async (_request, permission, options) => {
      const name = typeof permission === "string" ? permission : permission.join("|");
      calls.push({ permission: name, mutation: options.mutation });
      if (!allowed.includes(name)) throw new AuthorizationDeniedApiError();
      return { userId: "300000000000000001", displayName: "Jay", roleIds: [] };
    },
    member: async () => ({ userId: "300000000000000001", displayName: "Jay", roleIds: [] }),
  };
  const service = new ModerationService(new InMemoryModerationRepository(), gateway);
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "mod-test" }),
    registerRoutes: (instance) => moderationApiFeature(service).register(instance, context),
  });
  return { server, calls };
}

describe("moderation routes", () => {
  it("returns the overview with what the user can do", async () => {
    const { server } = setup(["moderation.view", "moderation.warn"]);
    const response = await server.inject({ method: "GET", url: "/api/v1/moderation/overview", headers: host });
    expect(response.statusCode).toBe(200);
    expect(response.json().data.can).toEqual({ warn: true, timeout: false, kick: false, ban: false, messages: false, manage: false });
  });

  it("checks the permission for each action with CSRF", async () => {
    const { server, calls } = setup(["moderation.warn"]);
    const warned = await server.inject(json("POST", "/api/v1/moderation/actions", { type: "WARN", userId: MEMBER, displayName: "Alex", reason: "Spam" }));
    expect(warned.json().data).toMatchObject({ number: 1, type: "WARN", source: "WEB", targetName: "Alex" });
    const banned = await server.inject(json("POST", "/api/v1/moderation/actions", { type: "BAN", userId: MEMBER }));
    expect(banned.statusCode).toBe(403);
    expect(calls).toEqual([{ permission: "moderation.warn", mutation: true }, { permission: "moderation.ban", mutation: true }]);
  });

  it("lists, pardons, edits, and returns member history", async () => {
    const { server } = setup(["moderation.view", "moderation.ban", "moderation.manage"]);
    await server.inject(json("POST", "/api/v1/moderation/actions", { type: "BAN", userId: MEMBER, reason: "Cheats", durationMinutes: 60 }));
    expect((await server.inject({ method: "GET", url: "/api/v1/moderation/cases?type=BAN&active=true", headers: host })).json().data).toHaveLength(1);
    expect((await server.inject(json("PATCH", "/api/v1/moderation/cases/1", { reason: "Aimbot" }))).json().data.reason).toBe("Aimbot");
    expect((await server.inject(json("POST", "/api/v1/moderation/cases/1/pardon", { reason: "Appeal" }))).json().data.active).toBe(false);
    const history = (await server.inject({ method: "GET", url: `/api/v1/moderation/members/${MEMBER}`, headers: host })).json().data;
    expect(history.cases).toHaveLength(1);
    expect((await server.inject({ method: "GET", url: "/api/v1/moderation/cases/99", headers: host })).statusCode).toBe(404);
  });

  it("validates settings and actions with readable messages", async () => {
    const { server } = setup(["moderation.manage", "moderation.timeout"]);
    const { guildId: _guild, revision: _revision, ...defaults } = defaultModerationSettings(GUILD);
    const saved = await server.inject(json("PUT", "/api/v1/moderation/settings", { ...defaults, logChannelId: "500000000000000001", expectedRevision: 0 }));
    expect(saved.json().data.revision).toBe(1);
    const bad = await server.inject(json("PUT", "/api/v1/moderation/settings", { ...defaults, warningExpiryDays: -1, expectedRevision: 1 }));
    expect(bad.statusCode).toBe(400);
    expect(bad.json().errors[0].message).toContain("warningExpiryDays");
    const tooLong = await server.inject(json("POST", "/api/v1/moderation/actions", { type: "TIMEOUT", userId: MEMBER, durationMinutes: 100_000 }));
    expect(tooLong.statusCode).toBe(400);
  });

  it("runs channel tools", async () => {
    const { server } = setup(["moderation.messages"]);
    expect((await server.inject(json("POST", "/api/v1/moderation/channels/500000000000000001/purge", { count: 20 }))).json().data.deleted).toBe(20);
    expect((await server.inject(json("POST", "/api/v1/moderation/channels/500000000000000001/lock", { locked: true }))).statusCode).toBe(200);
    expect((await server.inject(json("POST", "/api/v1/moderation/channels/500000000000000001/slowmode", { seconds: 5 }))).statusCode).toBe(200);
  });
});
