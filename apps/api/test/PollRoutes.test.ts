import { describe, expect, it } from "vitest";
import { InMemoryPollRepository, PollService, type PollGateway } from "@qbox/polls";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { pollsApiFeature } from "../src/polls/PollRoutes.js";

const GUILD = "100000000000000001";
const CHANNEL = "500000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "DELETE", url: string, payload: unknown) => ({ method, url, payload: payload as Record<string, unknown>, headers: { ...host, "content-type": "application/json" } });

const gateway: PollGateway = {
  postMessage: async () => ({ messageId: "700000000000000001" }),
  editMessage: async () => undefined,
  deleteMessage: async () => undefined,
};

function setup(allowed: readonly string[]) {
  const calls: { permission: string; mutation: boolean }[] = [];
  const context: ApiFeatureContext = {
    guildId: GUILD,
    guard: async (_request, permission, options) => {
      const names = typeof permission === "string" ? [permission] : permission;
      calls.push({ permission: names.join("|"), mutation: options.mutation });
      if (!names.some((name) => allowed.includes(name))) throw new AuthorizationDeniedApiError();
      return { userId: "300000000000000001", displayName: "Jay", roleIds: [] };
    },
    member: async () => ({ userId: "300000000000000001", displayName: "Jay", roleIds: [] }),
  };
  const service = new PollService(new InMemoryPollRepository(), gateway, undefined, { refreshDelayMs: 0 });
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "polls-test" }),
    registerRoutes: (instance) => pollsApiFeature(service).register(instance, context),
  });
  return { server, calls, service };
}

const poll = { question: "Pizza or tacos?", options: [{ label: "Pizza", emoji: "🍕" }, { label: "Tacos" }], channelId: CHANNEL, durationMinutes: 60 };

describe("poll routes", () => {
  it("creates polls with polls.create and reports what the user can do", async () => {
    const { server, calls } = setup(["polls.create"]);
    const created = await server.inject(json("POST", "/api/v1/polls", poll));
    expect(created.json().data).toMatchObject({ number: 1, status: "OPEN", messageId: "700000000000000001", createdByName: "Jay" });
    expect(calls[0]).toEqual({ permission: "polls.create", mutation: true });
    const overview = (await server.inject({ method: "GET", url: "/api/v1/polls/overview", headers: host })).json().data;
    expect(overview.can).toEqual({ create: true, manage: false });
    expect(overview.open).toHaveLength(1);
  });

  it("validates input with readable messages", async () => {
    const { server } = setup(["polls.create"]);
    const tooFew = await server.inject(json("POST", "/api/v1/polls", { ...poll, options: [{ label: "Only" }] }));
    expect(tooFew.statusCode).toBe(400);
    const both = await server.inject(json("POST", "/api/v1/polls", { ...poll, endsAt: "2099-01-01T00:00:00.000Z" }));
    expect(both.json().errors[0].message).toContain("not both");
  });

  it("closes, reopens, shows results, exports CSV, and deletes with polls.manage", async () => {
    const { server, service } = setup(["polls.create", "polls.manage"]);
    const id = (await server.inject(json("POST", "/api/v1/polls", poll))).json().data.id as string;
    await service.vote(GUILD, id, { userId: "200000000000000001", displayName: "Alex", roleIds: [] }, ["1"]);
    const results = (await server.inject({ method: "GET", url: `/api/v1/polls/${id}`, headers: host })).json().data;
    expect(results).toMatchObject({ voters: 1, counts: { "1": 1, "2": 0 } });
    expect((await server.inject(json("POST", `/api/v1/polls/${id}/close`, {}))).json().data.status).toBe("CLOSED");
    expect((await server.inject(json("POST", "/api/v1/polls/1/reopen", { durationMinutes: 10 }))).json().data.status).toBe("OPEN");
    const csv = await server.inject({ method: "GET", url: `/api/v1/polls/${id}/export`, headers: host });
    expect(csv.headers["content-type"]).toContain("text/csv");
    expect(csv.headers["content-disposition"]).toContain("poll-1-results.csv");
    expect(csv.body).toContain("200000000000000001,Alex,🍕 Pizza");
    expect((await server.inject({ method: "DELETE", url: `/api/v1/polls/${id}`, headers: host })).statusCode).toBe(200);
    expect((await server.inject({ method: "GET", url: `/api/v1/polls/${id}`, headers: host })).statusCode).toBe(404);
  });

  it("keeps export and delete to polls.manage", async () => {
    const { server } = setup(["polls.create"]);
    const id = (await server.inject(json("POST", "/api/v1/polls", poll))).json().data.id as string;
    expect((await server.inject({ method: "GET", url: `/api/v1/polls/${id}/export`, headers: host })).statusCode).toBe(400);
    expect((await server.inject({ method: "DELETE", url: `/api/v1/polls/${id}`, headers: host })).json().errors[0].message).toContain("polls.manage");
    expect((await setup([]).server.inject({ method: "GET", url: "/api/v1/polls/overview", headers: host })).statusCode).toBe(403);
  });
});
