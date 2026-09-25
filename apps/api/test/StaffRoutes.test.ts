import { describe, expect, it } from "vitest";
import { InMemoryStaffRepository, StaffService, type StaffGateway } from "@qbox/staff";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { staffApiFeature } from "../src/staff/StaffRoutes.js";

const GUILD = "100000000000000001";
const MEMBER = "200000000000000001";
const MANAGER = "300000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT" | "PATCH" | "DELETE", url: string, payload: unknown) => ({ method, url, payload: payload as Record<string, unknown>, headers: { ...host, "content-type": "application/json" } });

const gateway: StaffGateway = {
  addRole: async () => undefined,
  removeRole: async () => undefined,
  postEmbed: async () => ({ messageId: "700000000000000001" }),
  editEmbed: async () => undefined,
};

function setup(allowed: readonly string[], userId = MANAGER) {
  const calls: { permission: string; mutation: boolean }[] = [];
  const identity = { userId, displayName: userId === MANAGER ? "Jay" : "Alex", roleIds: [] };
  const context: ApiFeatureContext = {
    guildId: GUILD,
    guard: async (_request, permission, options) => {
      const name = typeof permission === "string" ? permission : permission.join("|");
      calls.push({ permission: name, mutation: options.mutation });
      if (!allowed.includes(name)) throw new AuthorizationDeniedApiError();
      return identity;
    },
    member: async () => identity,
  };
  const service = new StaffService(new InMemoryStaffRepository(), gateway);
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "staff-test" }),
    registerRoutes: (instance) => staffApiFeature(service).register(instance, context),
  });
  return { server, calls, service };
}

describe("staff routes", () => {
  it("requires staff.view for the overview and reports what the user can do", async () => {
    const denied = setup([]);
    expect((await denied.server.inject({ method: "GET", url: "/api/v1/staff/overview", headers: host })).statusCode).toBe(403);
    const { server } = setup(["staff.view", "staff.shifts"]);
    const response = await server.inject({ method: "GET", url: "/api/v1/staff/overview", headers: host });
    expect(response.statusCode).toBe(200);
    expect(response.json().data).toMatchObject({ can: { manage: false, shifts: true }, ranks: [], members: [], pendingLeaves: 0 });
  });

  it("manages ranks and the roster with CSRF-checked staff.manage", async () => {
    const { server, calls } = setup(["staff.view", "staff.manage"]);
    const officer = (await server.inject(json("POST", "/api/v1/staff/ranks", { name: "Officer", color: "#0000FF" }))).json().data;
    const chief = (await server.inject(json("POST", "/api/v1/staff/ranks", { name: "Chief", color: "#FF0000", roleId: "400000000000000001" }))).json().data;
    const order = await server.inject(json("PUT", "/api/v1/staff/ranks/order", { rankIds: [chief.id, officer.id] }));
    expect(order.json().data.map((rank: { name: string }) => rank.name)).toEqual(["Chief", "Officer"]);
    expect(calls.every((call) => call.permission === "staff.manage" && call.mutation)).toBe(true);

    const hired = await server.inject(json("POST", "/api/v1/staff/members", { userId: MEMBER, displayName: "Alex", callsign: "1A" }));
    expect(hired.json().data).toMatchObject({ rankId: officer.id, callsign: "1A" });
    expect((await server.inject(json("POST", `/api/v1/staff/members/${MEMBER}/promote`, { reason: "Good" }))).json().data.rankId).toBe(chief.id);
    expect((await server.inject(json("POST", `/api/v1/staff/members/${MEMBER}/promote`, {}))).statusCode).toBe(400);
    expect((await server.inject(json("PATCH", `/api/v1/staff/members/${MEMBER}`, { status: "SUSPENDED", callsign: null }))).json().data.status).toBe("SUSPENDED");
    const strike = (await server.inject(json("POST", `/api/v1/staff/members/${MEMBER}/strikes`, { reason: "Late", expiresInDays: 30 }))).json().data;
    expect(strike.active).toBe(true);
    expect((await server.inject(json("POST", `/api/v1/staff/strikes/${strike.id}/revoke`, {}))).json().data.active).toBe(false);
    expect((await server.inject(json("POST", `/api/v1/staff/members/${MEMBER}/notes`, { text: "Hi" }))).statusCode).toBe(200);
    const profile = (await server.inject({ method: "GET", url: `/api/v1/staff/members/${MEMBER}`, headers: host })).json().data;
    expect(profile.records.map((record: { type: string }) => record.type)).toEqual(["NOTE", "STRIKE", "NOTE", "PROMOTE", "HIRE"]);
    expect((await server.inject(json("DELETE", `/api/v1/staff/ranks/${chief.id}`, {}))).statusCode).toBe(400);
    expect((await server.inject(json("POST", `/api/v1/staff/members/${MEMBER}/fire`, { reason: "Bye" }))).statusCode).toBe(200);
    expect((await server.inject({ method: "GET", url: `/api/v1/staff/members/${MEMBER}`, headers: host })).statusCode).toBe(404);
  });

  it("lets members see their profile, clock in, and request leave; managers review", async () => {
    const manager = setup(["staff.view", "staff.manage"]);
    await manager.service.createRank(GUILD, { name: "Officer", color: "#0000FF" });
    await manager.service.hire(GUILD, { userId: MEMBER, displayName: "Alex" }, { userId: MANAGER, displayName: "Jay", source: "WEB" });

    const memberServer = createApiServer({
      configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "staff-test" }),
      registerRoutes: (instance) => staffApiFeature(manager.service).register(instance, {
        guildId: GUILD,
        guard: async (_request, permission) => {
          if (permission !== "staff.shifts") throw new AuthorizationDeniedApiError();
          return { userId: MEMBER, displayName: "Alex", roleIds: [] };
        },
        member: async () => ({ userId: MEMBER, displayName: "Alex", roleIds: [] }),
      }),
    });
    const me = (await memberServer.inject({ method: "GET", url: "/api/v1/staff/me", headers: host })).json().data;
    expect(me).toMatchObject({ profile: { member: { userId: MEMBER } }, can: { view: false, shifts: true } });
    expect((await memberServer.inject(json("POST", "/api/v1/staff/me/clock", { action: "in" }))).json().data.userId).toBe(MEMBER);
    expect((await memberServer.inject(json("POST", "/api/v1/staff/me/clock", { action: "in" }))).statusCode).toBe(400);
    expect((await memberServer.inject(json("POST", "/api/v1/staff/me/clock", { action: "out" }))).json().data.endedAt).toBeDefined();

    const start = new Date(Date.now() + 86_400_000);
    const leave = (await memberServer.inject(json("POST", "/api/v1/staff/me/leaves", { startsAt: start.toISOString(), endsAt: new Date(start.getTime() + 86_400_000).toISOString(), reason: "Trip" }))).json().data;
    expect(leave.status).toBe("PENDING");
    expect((await memberServer.inject({ method: "GET", url: "/api/v1/staff/leaves", headers: host })).statusCode).toBe(403);

    const pending = (await manager.server.inject({ method: "GET", url: "/api/v1/staff/leaves?status=PENDING", headers: host })).json().data;
    expect(pending).toHaveLength(1);
    expect((await manager.server.inject(json("POST", `/api/v1/staff/leaves/${leave.id}/review`, { approve: true }))).json().data.status).toBe("APPROVED");
    expect((await memberServer.inject(json("POST", `/api/v1/staff/me/leaves/${leave.id}/cancel`, {}))).json().data.status).toBe("CANCELLED");
    expect((await manager.server.inject({ method: "GET", url: "/api/v1/staff/leaderboard", headers: host })).json().data.entries).toHaveLength(1);
    expect((await manager.server.inject({ method: "GET", url: `/api/v1/staff/shifts?userId=${MEMBER}`, headers: host })).json().data).toHaveLength(1);
  });

  it("validates settings with readable messages and detects stale saves", async () => {
    const { server } = setup(["staff.manage"]);
    const saved = await server.inject(json("PUT", "/api/v1/staff/settings", { logChannelId: "500000000000000001", autoClockOutHours: 8, maxLeaveDays: 30, expectedRevision: 0 }));
    expect(saved.json().data).toMatchObject({ revision: 1, autoClockOutHours: 8 });
    const bad = await server.inject(json("PUT", "/api/v1/staff/settings", { autoClockOutHours: 100, maxLeaveDays: 30, expectedRevision: 1 }));
    expect(bad.statusCode).toBe(400);
    expect(bad.json().errors[0].message).toContain("autoClockOutHours");
    expect((await server.inject(json("PUT", "/api/v1/staff/settings", { autoClockOutHours: 8, maxLeaveDays: 30, expectedRevision: 0 }))).statusCode).toBe(409);
    expect((await server.inject(json("POST", "/api/v1/staff/roster/publish", {}))).statusCode).toBe(400);
  });
});
