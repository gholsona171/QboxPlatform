import { describe, expect, it } from "vitest";
import { InMemoryVerificationRepository, VerificationService, defaultVerificationSettings, type GuildMemberInfo, type VerificationGateway } from "@qbox/verification";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { verificationApiFeature } from "../src/verification/VerificationRoutes.js";

const GUILD = "100000000000000001";
const MEMBER = "200000000000000001";
const VERIFIED = "400000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT", url: string, payload: unknown) => ({ method, url, payload: payload as Record<string, unknown>, headers: { ...host, "content-type": "application/json" } });

function setup(allowed: readonly string[]) {
  const members = new Map<string, GuildMemberInfo>([[MEMBER, { userId: MEMBER, displayName: "Alex", roleIds: [] }]]);
  const gateway: VerificationGateway = {
    member: async (_guild, userId) => members.get(userId),
    guildName: async () => "Qbox",
    addRole: async (_guild, userId, roleId) => {
      const member = members.get(userId);
      if (member) members.set(userId, { ...member, roleIds: [...member.roleIds, roleId] });
    },
    removeRole: async (_guild, userId, roleId) => {
      const member = members.get(userId);
      if (member) members.set(userId, { ...member, roleIds: member.roleIds.filter((id) => id !== roleId) });
    },
    kick: async () => undefined,
    directMessage: async () => true,
    sendMessage: async () => undefined,
    postEmbed: async () => undefined,
    publishPanel: async () => ({ messageId: "700000000000000001" }),
  };
  const calls: { permission: string; mutation: boolean }[] = [];
  const context: ApiFeatureContext = {
    guildId: GUILD,
    guard: async (_request, permission, options) => {
      const names = typeof permission === "string" ? [permission] : [...permission];
      calls.push({ permission: names.join("|"), mutation: options.mutation });
      if (!names.some((name) => allowed.includes(name))) throw new AuthorizationDeniedApiError();
      return { userId: "300000000000000001", displayName: "Jay", roleIds: [] };
    },
    member: async () => ({ userId: "300000000000000001", displayName: "Jay", roleIds: [] }),
  };
  const service = new VerificationService(new InMemoryVerificationRepository(), gateway);
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "verification-test" }),
    registerRoutes: (instance) => verificationApiFeature(service).register(instance, context),
  });
  return { server, calls };
}

function settingsBody(overrides: Record<string, unknown> = {}) {
  const { guildId: _guild, revision: _revision, ...defaults } = defaultVerificationSettings(GUILD);
  return { ...defaults, enabled: true, verifiedRoleIds: [VERIFIED], channelId: "500000000000000001", expectedRevision: 0, ...overrides };
}

describe("verification routes", () => {
  it("returns the overview to either permission with what the user can do", async () => {
    const { server } = setup(["verification.members"]);
    const response = await server.inject({ method: "GET", url: "/api/v1/verification/overview", headers: host });
    expect(response.statusCode).toBe(200);
    expect(response.json().data.can).toEqual({ manage: false, members: true });
    expect(response.json().data.stats).toMatchObject({ pending: 0, verified24h: 0 });
    expect((await setup([]).server.inject({ method: "GET", url: "/api/v1/verification/overview", headers: host })).statusCode).toBe(403);
  });

  it("saves settings, validates them, and posts the panel", async () => {
    const { server, calls } = setup(["verification.manage"]);
    const saved = await server.inject(json("PUT", "/api/v1/verification/settings", settingsBody()));
    expect(saved.json().data.revision).toBe(1);
    const bad = await server.inject(json("PUT", "/api/v1/verification/settings", settingsBody({ mode: "QUESTION", expectedRevision: 1 })));
    expect(bad.statusCode).toBe(400);
    expect(bad.json().errors[0].message).toContain("at least one question");
    const stale = await server.inject(json("PUT", "/api/v1/verification/settings", settingsBody({ expectedRevision: 0 })));
    expect(stale.statusCode).toBe(409);
    const panel = await server.inject(json("POST", "/api/v1/verification/panel", {}));
    expect(panel.json().data).toEqual({ channelId: "500000000000000001", messageId: "700000000000000001" });
    expect(calls.at(-1)).toEqual({ permission: "verification.manage", mutation: true });
  });

  it("verifies and unverifies members, and lists attempts with filters", async () => {
    const { server } = setup(["verification.members", "verification.manage"]);
    await server.inject(json("PUT", "/api/v1/verification/settings", settingsBody()));
    const verified = await server.inject(json("POST", `/api/v1/verification/members/${MEMBER}/verify`, { reason: "Known member" }));
    expect(verified.json().data).toMatchObject({ result: "MANUAL", source: "WEB", reason: "Known member" });
    expect((await server.inject({ method: "GET", url: `/api/v1/verification/members/${MEMBER}`, headers: host })).json().data).toMatchObject({ verified: true, inServer: true });
    expect((await server.inject(json("POST", `/api/v1/verification/members/${MEMBER}/verify`, {}))).statusCode).toBe(400);
    expect((await server.inject(json("POST", `/api/v1/verification/members/${MEMBER}/unverify`, {}))).json().data.result).toBe("REVOKED");
    const manual = await server.inject({ method: "GET", url: "/api/v1/verification/attempts?result=MANUAL", headers: host });
    expect(manual.json().data).toHaveLength(1);
    expect((await server.inject({ method: "GET", url: "/api/v1/verification/attempts?search=alex", headers: host })).json().data).toHaveLength(2);
    expect((await server.inject(json("POST", "/api/v1/verification/members/200000000000000009/verify", {}))).statusCode).toBe(404);
  });

  it("needs verification.members to act on members", async () => {
    const { server } = setup(["verification.manage"]);
    expect((await server.inject(json("POST", `/api/v1/verification/members/${MEMBER}/verify`, {}))).statusCode).toBe(403);
  });
});
