import { describe, expect, it } from "vitest";
import { GiveawayService, InMemoryGiveawayRepository, type GiveawayGateway } from "@qbox/giveaways";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { giveawaysApiFeature } from "../src/giveaways/GiveawayRoutes.js";

const GUILD = "100000000000000001";
const CHANNEL = "500000000000000001";
const ROLE = "400000000000000001";
const host = { host: "127.0.0.1:3000" };
const post = (url: string, payload: unknown = {}) => ({ method: "POST" as const, url, payload: payload as Record<string, unknown>, headers: { ...host, "content-type": "application/json" } });

const gateway: GiveawayGateway = {
  guildName: async () => "Qbox",
  postMessage: async () => ({ messageId: "700000000000000001" }),
  editMessage: async () => undefined,
  directMessage: async () => true,
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
  const service = new GiveawayService(new InMemoryGiveawayRepository(), gateway, undefined, { refreshDelayMs: 0 });
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "giveaways-test" }),
    registerRoutes: (instance) => giveawaysApiFeature(service).register(instance, context),
  });
  return { server, calls, service };
}

const start = { prize: "Nitro", channelId: CHANNEL, winnerCount: 1, durationMinutes: 60, bonusEntries: [{ roleId: ROLE, entries: 2 }], requiredRoleIds: [ROLE] };

describe("giveaway routes", () => {
  it("requires giveaways.manage with CSRF for changes", async () => {
    const denied = setup([]);
    expect((await denied.server.inject(post("/api/v1/giveaways", start))).statusCode).toBe(403);
    expect(denied.calls).toEqual([{ permission: "giveaways.manage", mutation: true }]);
  });

  it("starts, lists, pauses, resumes, ends, rerolls, and shows entries", async () => {
    const { server, service } = setup(["giveaways.manage"]);
    const created = (await server.inject(post("/api/v1/giveaways", start))).json().data;
    expect(created).toMatchObject({ number: 1, status: "RUNNING", hostId: "300000000000000001", bonusEntries: [{ roleId: ROLE, entries: 2 }] });
    for (const userId of ["200000000000000001", "200000000000000002"]) await service.toggleEntry(GUILD, created.id, { userId, displayName: userId, roleIds: [ROLE], joinedAt: new Date(0) });
    const overview = (await server.inject({ method: "GET", url: "/api/v1/giveaways/overview", headers: host })).json().data;
    expect(overview.active[0]).toMatchObject({ number: 1, entrantCount: 2 });
    expect((await server.inject(post(`/api/v1/giveaways/${created.id}/pause`))).json().data.status).toBe("PAUSED");
    expect((await server.inject(post("/api/v1/giveaways/1/resume"))).json().data.status).toBe("RUNNING");
    const ended = (await server.inject(post(`/api/v1/giveaways/${created.id}/end`))).json().data;
    expect(ended.winnerIds).toHaveLength(1);
    const rerolled = (await server.inject(post(`/api/v1/giveaways/${created.id}/reroll`, { winners: 1 }))).json().data;
    expect(rerolled.winnerIds).toHaveLength(1);
    expect(rerolled.winnerIds[0]).not.toBe(ended.winnerIds[0]);
    const detail = (await server.inject({ method: "GET", url: `/api/v1/giveaways/${created.id}`, headers: host })).json().data;
    expect(detail).toMatchObject({ totalEntries: 6 });
    expect(detail.entries).toHaveLength(2);
    expect((await server.inject({ method: "GET", url: "/api/v1/giveaways?state=ended", headers: host })).json().data).toHaveLength(1);
  });

  it("validates input and state with readable messages", async () => {
    const { server } = setup(["giveaways.manage"]);
    const noEnd = await server.inject(post("/api/v1/giveaways", { prize: "Nitro", channelId: CHANNEL }));
    expect(noEnd.json().errors[0].message).toContain("end time or a duration");
    const id = (await server.inject(post("/api/v1/giveaways", start))).json().data.id as string;
    expect((await server.inject(post(`/api/v1/giveaways/${id}/cancel`))).json().data.status).toBe("CANCELLED");
    expect((await server.inject(post(`/api/v1/giveaways/${id}/end`))).json().errors[0].message).toContain("cancelled");
    expect((await server.inject({ method: "GET", url: "/api/v1/giveaways/99", headers: host })).statusCode).toBe(404);
  });
});
