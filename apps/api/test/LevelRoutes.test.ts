import { describe, expect, it } from "vitest";
import { InMemoryLevelRepository, LevelService, defaultLevelSettings } from "@qbox/levels";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthenticationRequiredApiError, AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { levelsApiFeature } from "../src/levels/LevelRoutes.js";

const GUILD = "100000000000000001";
const VIEWER = "300000000000000001";
const MEMBER = "200000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT", url: string, payload: unknown) => ({ method, url, payload: payload as Record<string, unknown>, headers: { ...host, "content-type": "application/json" } });

function setup(allowed: readonly string[], signedIn = true) {
  const calls: { permission: string; mutation: boolean }[] = [];
  const context: ApiFeatureContext = {
    guildId: GUILD,
    guard: async (_request, permission, options) => {
      const name = typeof permission === "string" ? permission : permission.join("|");
      calls.push({ permission: name, mutation: options.mutation });
      if (!allowed.includes(name)) throw new AuthorizationDeniedApiError();
      return { userId: VIEWER, displayName: "Jay", roleIds: [] };
    },
    member: async () => {
      if (!signedIn) throw new AuthenticationRequiredApiError();
      return { userId: VIEWER, displayName: "Jay", roleIds: [] };
    },
  };
  const service = new LevelService(new InMemoryLevelRepository());
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "levels-test" }),
    registerRoutes: (instance) => levelsApiFeature(service).register(instance, context),
  });
  return { server, calls, service };
}

describe("level routes", () => {
  it("shows the leaderboard and the viewer's rank to any signed-in member", async () => {
    const { server, service } = setup([]);
    await service.give(GUILD, MEMBER, 500, "Alex");
    await service.give(GUILD, VIEWER, 50, "Jay");
    const response = await server.inject({ method: "GET", url: "/api/v1/levels/leaderboard?page=1", headers: host });
    expect(response.statusCode).toBe(200);
    const data = response.json().data;
    expect(data.members.map((member: { displayName: string }) => member.displayName)).toEqual(["Alex", "Jay"]);
    expect(data).toMatchObject({ total: 2, canManage: false, me: { rank: 2, member: { xp: 50 } } });
    expect((await server.inject({ method: "GET", url: "/api/v1/levels/overview", headers: host })).statusCode).toBe(403);
  });

  it("requires sign-in for the leaderboard", async () => {
    const { server } = setup([], false);
    expect((await server.inject({ method: "GET", url: "/api/v1/levels/leaderboard", headers: host })).statusCode).toBe(401);
  });

  it("lets staff adjust members with CSRF and search them", async () => {
    const { server, calls } = setup(["levels.manage"]);
    const given = await server.inject(json("POST", `/api/v1/levels/members/${MEMBER}`, { action: "give", xp: 300, displayName: "Alex" }));
    expect(given.json().data.member).toMatchObject({ xp: 300, level: 2 });
    expect((await server.inject(json("POST", `/api/v1/levels/members/${MEMBER}`, { action: "set-level", level: 1 }))).json().data.member.xp).toBe(100);
    expect((await server.inject(json("POST", `/api/v1/levels/members/${MEMBER}`, { action: "take", xp: 40 }))).json().data.member.xp).toBe(60);
    expect((await server.inject({ method: "GET", url: "/api/v1/levels/members?search=ale", headers: host })).json().data[0].userId).toBe(MEMBER);
    expect((await server.inject({ method: "GET", url: `/api/v1/levels/members/${MEMBER}`, headers: host })).json().data.member.xp).toBe(60);
    expect((await server.inject(json("POST", `/api/v1/levels/members/${MEMBER}`, { action: "reset" }))).statusCode).toBe(200);
    expect((await server.inject(json("POST", `/api/v1/levels/members/${MEMBER}`, { action: "reset" }))).statusCode).toBe(404);
    expect(calls.filter((call) => call.mutation).length).toBe(5);
  });

  it("saves settings and resets everyone only with confirmation", async () => {
    const { server, service } = setup(["levels.manage"]);
    const { guildId: _guild, revision: _revision, ...defaults } = defaultLevelSettings(GUILD);
    const saved = await server.inject(json("PUT", "/api/v1/levels/settings", { ...defaults, enabled: true, expectedRevision: 0 }));
    expect(saved.json().data).toMatchObject({ enabled: true, revision: 1 });
    const bad = await server.inject(json("PUT", "/api/v1/levels/settings", { ...defaults, messageXpMin: 50, messageXpMax: 10, expectedRevision: 1 }));
    expect(bad.statusCode).toBe(400);
    expect(bad.json().errors[0].message).toContain("at least the minimum");
    const stale = await server.inject(json("PUT", "/api/v1/levels/settings", { ...defaults, expectedRevision: 0 }));
    expect(stale.statusCode).toBe(409);
    await service.setLevel(GUILD, MEMBER, 2);
    expect((await server.inject(json("POST", "/api/v1/levels/reset", {}))).statusCode).toBe(400);
    expect((await server.inject(json("POST", "/api/v1/levels/reset", { confirm: "RESET" }))).json().data.members).toBe(1);
  });
});
