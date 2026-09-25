import { describe, expect, it } from "vitest";
import { InMemoryVoiceRepository, VoiceRoomService, type VoiceGateway } from "@qbox/voice-rooms";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { voiceRoomsApiFeature } from "../src/voiceRooms/VoiceRoutes.js";

const GUILD = "100000000000000001";
const HUB_CHANNEL = "500000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT", url: string, payload: unknown) => ({ method, url, payload: payload as Record<string, unknown>, headers: { ...host, "content-type": "application/json" } });
const hub = { name: "Gaming", enabled: true, channelId: HUB_CHANNEL, nameTemplate: "{user}'s room", userLimit: 0, bitrateKbps: 64, privateByDefault: false, deleteDelaySeconds: 0, allowedRoleIds: [] };

const deleted: string[] = [];
const gateway: VoiceGateway = {
  channelParentId: async () => undefined,
  createRoomChannel: async () => ({ channelId: "600000000000000001" }),
  deleteChannel: async (channelId) => void deleted.push(channelId),
  renameChannel: async () => undefined,
  setUserLimit: async () => undefined,
  setLocked: async () => undefined,
  setHidden: async () => undefined,
  setMemberAccess: async () => undefined,
  setOwner: async () => undefined,
  moveMember: async () => undefined,
  memberVoiceChannel: async () => undefined,
  sendPanel: async () => ({ messageId: "700000000000000001" }),
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
  const service = new VoiceRoomService(new InMemoryVoiceRepository(), gateway);
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "voice-test" }),
    registerRoutes: (instance) => voiceRoomsApiFeature(service).register(instance, context),
  });
  return { server, calls, service };
}

describe("voice routes", () => {
  it("requires voice.manage", async () => {
    const { server } = setup([]);
    expect((await server.inject({ method: "GET", url: "/api/v1/voice/overview", headers: host })).statusCode).toBe(403);
  });

  it("creates, edits, and deletes hubs with readable errors", async () => {
    const { server, calls } = setup(["voice.manage"]);
    const created = (await server.inject(json("POST", "/api/v1/voice/hubs", hub))).json().data;
    expect(created).toMatchObject({ name: "Gaming", channelId: HUB_CHANNEL });
    const duplicate = await server.inject(json("POST", "/api/v1/voice/hubs", hub));
    expect(duplicate.statusCode).toBe(400);
    expect(duplicate.json().errors[0].message).toContain("already a hub");
    expect((await server.inject(json("PUT", `/api/v1/voice/hubs/${created.id}`, { ...hub, userLimit: 5 }))).json().data.userLimit).toBe(5);
    expect((await server.inject(json("PUT", `/api/v1/voice/hubs/${created.id}`, { ...hub, bitrateKbps: 1000 }))).statusCode).toBe(400);
    expect((await server.inject({ method: "DELETE", url: `/api/v1/voice/hubs/${created.id}`, headers: host })).statusCode).toBe(200);
    expect((await server.inject({ method: "DELETE", url: `/api/v1/voice/hubs/${created.id}`, headers: host })).statusCode).toBe(404);
    expect(calls.every((call) => call.permission === "voice.manage")).toBe(true);
  });

  it("lists and force-deletes active rooms and saves settings", async () => {
    const { server, service } = setup(["voice.manage"]);
    await service.createHub(GUILD, hub);
    const room = await service.handleJoin({ guildId: GUILD, channelId: HUB_CHANNEL, userId: "200000000000000001", displayName: "Alex", roleIds: [] });
    const overview = (await server.inject({ method: "GET", url: "/api/v1/voice/overview", headers: host })).json().data;
    expect(overview.rooms).toHaveLength(1);
    expect(overview.settings.revision).toBe(0);
    expect((await server.inject({ method: "DELETE", url: `/api/v1/voice/rooms/${room?.id}`, headers: host })).statusCode).toBe(200);
    expect(deleted).toContain("600000000000000001");
    const saved = await server.inject(json("PUT", "/api/v1/voice/settings", { enabled: true, controlPanel: false, allowClaim: true, expectedRevision: 0 }));
    expect(saved.json().data).toMatchObject({ controlPanel: false, revision: 1 });
    expect((await server.inject(json("PUT", "/api/v1/voice/settings", { enabled: true, controlPanel: false, allowClaim: true, expectedRevision: 0 }))).statusCode).toBe(409);
  });
});
