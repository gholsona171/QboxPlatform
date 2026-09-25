import { describe, expect, it } from "vitest";
import { InMemoryStreamsRepository, StreamsService, type LiveCheck, type StreamPlatformClient, type StreamsGateway } from "@qbox/streams";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { streamsApiFeature } from "../src/streams/StreamsRoutes.js";

const GUILD = "100000000000000001";
const CHANNEL = "500000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT" | "DELETE", url: string, payload?: unknown) => ({ method, url, ...(payload === undefined ? {} : { payload: payload as Record<string, unknown> }), headers: payload === undefined ? host : { ...host, "content-type": "application/json" } });

function client(platform: "twitch" | "youtube", available: boolean, live: ReadonlyMap<string, LiveCheck> = new Map()): StreamPlatformClient {
  return {
    platform,
    available,
    resolve: async (handle) => {
      if (handle === "nobody") throw Object.assign(new Error("not found"), { name: "StreamsError", code: "NOT_FOUND" });
      return { platform, platformId: `${platform}-${handle}`, handle, displayName: handle.toUpperCase(), avatarUrl: "https://cdn/a.png", url: `https://${platform}.example/${handle}` };
    },
    liveStatus: async (ids) => new Map(ids.map((id) => [id, live.get(id) ?? { status: "offline" }])),
  };
}

function setup(allowed: readonly string[]) {
  const calls: { permission: string; mutation: boolean }[] = [];
  const posted: string[] = [];
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
  const gateway: StreamsGateway = {
    post: async (channelId) => { posted.push(channelId); return "700000000000000001"; },
    edit: async () => undefined,
    deleteMessage: async () => undefined,
    guildName: async () => "Test",
  };
  const service = new StreamsService(new InMemoryStreamsRepository(), [client("twitch", false), client("youtube", true)], gateway, { now: () => new Date("2026-09-25T12:00:00.000Z") });
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "streams-test" }),
    registerRoutes: (instance) => streamsApiFeature(service).register(instance, context),
  });
  return { server, calls, posted };
}

const creator = { platform: "youtube", handle: "@mkbhd", announceChannelId: CHANNEL, announceVideos: true, enabled: true };

describe("streams routes", () => {
  it("manages creators and settings", async () => {
    const { server, calls, posted } = setup(["streams.manage"]);
    let overview = (await server.inject({ method: "GET", url: "/api/v1/streams/overview", headers: host })).json().data;
    expect(overview).toMatchObject({ settings: { revision: 0, checkIntervalSeconds: 90, endedBehavior: "edit" }, subscriptions: [], platforms: { twitch: false, kick: false, youtube: true } });

    const resolved = await server.inject(json("POST", "/api/v1/streams/resolve", { platform: "youtube", handle: "@mkbhd" }));
    expect(resolved.json().data).toMatchObject({ platformId: "youtube-mkbhd", displayName: "MKBHD", avatarUrl: "https://cdn/a.png" });
    expect((await server.inject(json("POST", "/api/v1/streams/resolve", { platform: "twitch", handle: "amy" }))).statusCode).toBe(503);

    const created = await server.inject(json("POST", "/api/v1/streams/subscriptions", creator));
    expect(created.statusCode).toBe(201);
    const id = created.json().data.id as string;
    expect(created.json().data).toMatchObject({ handle: "mkbhd", displayName: "MKBHD", announceVideos: true, state: { failureStreak: 0 } });
    expect((await server.inject(json("POST", "/api/v1/streams/subscriptions", creator))).statusCode).toBe(409);

    const updated = await server.inject(json("PUT", `/api/v1/streams/subscriptions/${id}`, { announceChannelId: CHANNEL, pingRoleId: "400000000000000001", messageText: "{ping} {creator} live", announceVideos: false, enabled: false }));
    expect(updated.json().data).toMatchObject({ pingRoleId: "400000000000000001", messageText: "{ping} {creator} live", announceVideos: false, enabled: false });
    expect((await server.inject(json("PUT", "/api/v1/streams/subscriptions/missing", { announceVideos: false, enabled: true }))).statusCode).toBe(404);

    const test = await server.inject(json("POST", `/api/v1/streams/subscriptions/${id}/test`, {}));
    expect(test.json().data).toEqual({ live: false, messageId: "700000000000000001" });
    expect(posted).toEqual([CHANNEL]);

    const saved = await server.inject(json("PUT", "/api/v1/streams/settings", { enabled: true, defaultChannelId: CHANNEL, endedBehavior: "delete", checkIntervalSeconds: 120, expectedRevision: 0 }));
    expect(saved.json().data).toMatchObject({ revision: 1, endedBehavior: "delete", checkIntervalSeconds: 120 });
    expect((await server.inject(json("PUT", "/api/v1/streams/settings", { enabled: true, endedBehavior: "keep", checkIntervalSeconds: 120, expectedRevision: 0 }))).statusCode).toBe(409);

    expect((await server.inject(json("DELETE", `/api/v1/streams/subscriptions/${id}`))).json().data).toEqual({ deleted: true });
    overview = (await server.inject({ method: "GET", url: "/api/v1/streams/overview", headers: host })).json().data;
    expect(overview.subscriptions).toHaveLength(0);
    expect(calls.every((call) => call.permission === "streams.manage")).toBe(true);
    expect(calls.filter((call) => !call.mutation)).toHaveLength(2);
  });

  it("rejects members without the permission and bad input", async () => {
    const denied = setup([]);
    expect((await denied.server.inject({ method: "GET", url: "/api/v1/streams/overview", headers: host })).statusCode).toBe(403);
    expect((await denied.server.inject(json("POST", "/api/v1/streams/subscriptions", creator))).statusCode).toBe(403);
    const { server } = setup(["streams.manage"]);
    expect((await server.inject(json("POST", "/api/v1/streams/subscriptions", { ...creator, platform: "mixer" }))).statusCode).toBe(400);
    const bad = await server.inject(json("POST", "/api/v1/streams/subscriptions", { ...creator, handle: "not a handle" }));
    expect(bad.statusCode).toBe(400);
    expect(bad.json().errors[0].message).toContain("YouTube handle");
    expect((await server.inject(json("PUT", "/api/v1/streams/settings", { enabled: true, endedBehavior: "edit", checkIntervalSeconds: 5, expectedRevision: 0 }))).statusCode).toBe(400);
  });
});
