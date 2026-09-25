import { describe, expect, it } from "vitest";
import { GamesService, InMemoryGamesRepository, type GameServerQueryClient } from "@qbox/game-servers";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { gamesApiFeature } from "../src/games/GamesRoutes.js";

const GUILD = "100000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT", url: string, payload: unknown) => ({ method, url, payload: payload as Record<string, unknown>, headers: { ...host, "content-type": "application/json" } });
const serverInput = { name: "Rust Main", kind: "steam", address: "Play.Example.com:28015", game: "Rust", connectUrl: "steam://connect/1.2.3.4:28015", updateIntervalSeconds: 120, enabled: true };

function setup(allowed: readonly string[]) {
  const queried: string[] = [];
  const query: GameServerQueryClient = {
    query: async (kind, address) => {
      queried.push(`${kind} ${address}`);
      return { online: true, name: "Rusty Shores", players: [{ name: "Amy", score: 1, duration: 30 }], playerCount: 45, maxPlayers: 200, latencyMs: 30, checkedAt: new Date() };
    },
  };
  const context: ApiFeatureContext = {
    guildId: GUILD,
    guard: async (_request, permission) => {
      const name = typeof permission === "string" ? permission : permission.join("|");
      if (!allowed.includes(name)) throw new AuthorizationDeniedApiError();
      return { userId: "300000000000000001", displayName: "Jay", roleIds: [] };
    },
    member: async () => ({ userId: "300000000000000002", displayName: "Sam", roleIds: [] }),
  };
  const service = new GamesService(new InMemoryGamesRepository(), query);
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "games-test" }),
    registerRoutes: (instance) => gamesApiFeature(service).register(instance, context),
  });
  return { server, queried };
}

describe("games routes", () => {
  it("adds a server (querying it once), shows live status and history, updates, and deletes", async () => {
    const { server, queried } = setup(["games.manage"]);
    const created = await server.inject(json("POST", "/api/v1/games/servers", serverInput));
    expect(created.statusCode).toBe(200);
    const { server: saved, status } = created.json().data;
    expect(saved).toMatchObject({ name: "Rust Main", address: "play.example.com:28015", kind: "steam" });
    expect(status).toMatchObject({ online: true, name: "Rusty Shores", playerCount: 45, maxPlayers: 200 });
    expect((await server.inject({ method: "GET", url: `/api/v1/games/servers/${saved.id}/status`, headers: host })).json().data).toMatchObject({ online: true, playerCount: 45 });
    expect((await server.inject(json("POST", "/api/v1/games/test", { kind: "minecraft-java", address: "mc.example.com" }))).json().data.online).toBe(true);
    expect(queried).toEqual(["steam play.example.com:28015", "steam play.example.com:28015", "minecraft-java mc.example.com"]);
    const history = (await server.inject({ method: "GET", url: `/api/v1/games/servers/${saved.id}/history?range=7d`, headers: host })).json().data;
    expect(history).toMatchObject({ range: "7d", peak: 0 });
    expect(history.points).toHaveLength(84);
    const overview = (await server.inject({ method: "GET", url: "/api/v1/games/overview", headers: host })).json().data;
    expect(overview).toMatchObject({ maxServers: 10, can: { manage: true }, settings: { revision: 0 }, defaultPorts: { "minecraft-java": 25565, "minecraft-bedrock": 19132 } });
    expect(overview.servers[0]).toMatchObject({ id: saved.id, name: "Rust Main", players: 0 });
    const updated = await server.inject(json("PUT", `/api/v1/games/servers/${saved.id}`, { ...serverInput, name: "Rust Weekly", enabled: false }));
    expect(updated.json().data).toMatchObject({ name: "Rust Weekly", enabled: false });
    expect((await server.inject(json("PUT", "/api/v1/games/settings", { playerCountTemplate: "Players: {online}/{max}", playerCountOfflineTemplate: "Offline", expectedRevision: 0 }))).json().data.revision).toBe(1);
    expect((await server.inject({ method: "DELETE", url: `/api/v1/games/servers/${saved.id}`, headers: host })).json()).toEqual({ success: true });
    expect((await server.inject({ method: "GET", url: `/api/v1/games/servers/${saved.id}/status`, headers: host })).statusCode).toBe(404);
  });

  it("hides settings from members and rejects their changes", async () => {
    const { server } = setup([]);
    const overview = (await server.inject({ method: "GET", url: "/api/v1/games/overview", headers: host })).json().data;
    expect(overview).toMatchObject({ servers: [], can: { manage: false } });
    expect(overview.settings).toBeUndefined();
    expect((await server.inject(json("POST", "/api/v1/games/servers", serverInput))).statusCode).toBe(403);
    expect((await server.inject(json("POST", "/api/v1/games/test", { kind: "steam", address: "1.2.3.4:28015" }))).statusCode).toBe(403);
    expect((await server.inject(json("PUT", "/api/v1/games/settings", { playerCountTemplate: "x", playerCountOfflineTemplate: "y", expectedRevision: 0 }))).statusCode).toBe(403);
  });

  it("returns readable validation errors", async () => {
    const { server } = setup(["games.manage"]);
    const bad = await server.inject(json("POST", "/api/v1/games/servers", { ...serverInput, address: "1.2.3.4" }));
    expect(bad.statusCode).toBe(400);
    expect(bad.json().errors[0].message).toContain("query port");
    expect((await server.inject(json("POST", "/api/v1/games/servers", { ...serverInput, kind: "quake" }))).statusCode).toBe(400);
    expect((await server.inject(json("POST", "/api/v1/games/test", { kind: "steam", address: "localhost" }))).statusCode).toBe(400);
  });
});
