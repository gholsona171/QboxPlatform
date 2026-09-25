import { describe, expect, it } from "vitest";
import { BirthdayService, InMemoryBirthdayRepository, defaultBirthdaySettings, type BirthdayGateway } from "@qbox/birthdays";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { birthdaysApiFeature } from "../src/birthdays/BirthdayRoutes.js";

const GUILD = "100000000000000001";
const ME = "300000000000000001";
const OTHER = "200000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT" | "DELETE", url: string, payload?: unknown) => ({ method, url, ...(payload === undefined ? {} : { payload: payload as Record<string, unknown> }), headers: payload === undefined ? host : { ...host, "content-type": "application/json" } });

const gateway: BirthdayGateway = {
  guildName: async () => "Qbox",
  post: async () => ({ messageId: "700000000000000001" }),
  addRole: async () => undefined,
  removeRole: async () => undefined,
};

function setup(allowed: readonly string[]) {
  const calls: { kind: string; mutation: boolean }[] = [];
  const context: ApiFeatureContext = {
    guildId: GUILD,
    guard: async (_request, permission, options) => {
      const name = typeof permission === "string" ? permission : permission.join("|");
      calls.push({ kind: name, mutation: options.mutation });
      if (!allowed.includes(name)) throw new AuthorizationDeniedApiError();
      return { userId: ME, displayName: "Jay", roleIds: [] };
    },
    member: async (_request, options) => {
      calls.push({ kind: "member", mutation: options.mutation });
      return { userId: ME, displayName: "Jay", roleIds: [] };
    },
  };
  const service = new BirthdayService(new InMemoryBirthdayRepository(), gateway, () => new Date("2026-09-25T12:00:00.000Z"));
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "birthday-test" }),
    registerRoutes: (instance) => birthdaysApiFeature(service).register(instance, context),
  });
  return { server, calls, service };
}

describe("birthday routes", () => {
  it("lets any member save and remove their own birthday with CSRF", async () => {
    const { server, calls } = setup([]);
    const saved = await server.inject(json("PUT", "/api/v1/birthdays/me", { month: 10, day: 1, year: 1995, showAge: false, timeZone: "Europe/London" }));
    expect(saved.json().data).toMatchObject({ userId: ME, displayName: "Jay", month: 10, day: 1, year: 1995, timeZone: "Europe/London" });
    const overview = (await server.inject({ method: "GET", url: "/api/v1/birthdays/overview", headers: host })).json().data;
    expect(overview.me).toMatchObject({ month: 10, day: 1 });
    expect(overview.can).toEqual({ manage: false });
    expect(overview.settings).toEqual({ enabled: false, allowYear: true, requireConfirmation: false, announceHour: 9 });
    expect(overview.upcoming[0]).toMatchObject({ userId: ME, date: "2026-10-01", daysUntil: 6 });
    expect((await server.inject(json("DELETE", "/api/v1/birthdays/me"))).statusCode).toBe(200);
    expect(calls.filter((call) => call.kind === "member").map((call) => call.mutation)).toEqual([true, false, true]);
  });

  it("hides birth years of other members unless they show their age", async () => {
    const { server, service } = setup([]);
    await service.set({ guildId: GUILD, userId: OTHER, displayName: "Alex", month: 11, day: 2, year: 1990 }, { userId: OTHER, displayName: "Alex", manager: false });
    const list = (await server.inject({ method: "GET", url: "/api/v1/birthdays?search=ale", headers: host })).json().data;
    expect(list).toHaveLength(1);
    expect(list[0].year).toBeUndefined();
  });

  it("requires birthdays.manage for other members, settings, and test messages", async () => {
    const denied = setup([]);
    expect((await denied.server.inject(json("PUT", `/api/v1/birthdays/members/${OTHER}`, { month: 1, day: 1 }))).statusCode).toBe(403);
    const { server } = setup(["birthdays.manage"]);
    const saved = await server.inject(json("PUT", `/api/v1/birthdays/members/${OTHER}`, { month: 2, day: 29, displayName: "Alex" }));
    expect(saved.json().data).toMatchObject({ userId: OTHER, displayName: "Alex", month: 2, day: 29 });
    const { guildId: _guild, revision: _revision, ...defaults } = defaultBirthdaySettings(GUILD);
    const settings = await server.inject(json("PUT", "/api/v1/birthdays/settings", { ...defaults, enabled: true, channelId: "500000000000000001", expectedRevision: 0 }));
    expect(settings.json().data).toMatchObject({ enabled: true, revision: 1 });
    expect((await server.inject(json("POST", "/api/v1/birthdays/test", {}))).json().data.messageId).toBe("700000000000000001");
    expect((await server.inject(json("DELETE", `/api/v1/birthdays/members/${OTHER}`))).statusCode).toBe(200);
    expect((await server.inject(json("DELETE", `/api/v1/birthdays/members/${OTHER}`))).statusCode).toBe(404);
  });

  it("returns readable validation errors", async () => {
    const { server } = setup([]);
    const bad = await server.inject(json("PUT", "/api/v1/birthdays/me", { month: 2, day: 30 }));
    expect(bad.statusCode).toBe(400);
    expect(bad.json().errors[0].message).toContain("Day");
    const zone = await server.inject(json("PUT", "/api/v1/birthdays/me", { month: 2, day: 3, timeZone: "Moon/Base" }));
    expect(zone.json().errors[0].message).toContain("not a time zone");
  });
});
