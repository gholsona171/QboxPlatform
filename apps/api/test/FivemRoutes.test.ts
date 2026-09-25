import { describe, expect, it } from "vitest";
import { FivemService, InMemoryFivemRepository, defaultFivemSettings, type FivemQueryClient } from "@qbox/fivem";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { fivemApiFeature } from "../src/fivem/FivemRoutes.js";

const GUILD = "100000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT", url: string, payload: unknown) => ({ method, url, payload: payload as Record<string, unknown>, headers: { ...host, "content-type": "application/json" } });

function setup(allowed: readonly string[]) {
  const queried: string[] = [];
  const query: FivemQueryClient = {
    query: async (address) => {
      queried.push(address);
      return { online: true, hostname: "Qbox", players: [{ id: 1, name: "Amy", ping: 30 }], playerCount: 1, maxPlayers: 48, checkedAt: new Date() };
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
  const service = new FivemService(new InMemoryFivemRepository(), query);
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "fivem-test" }),
    registerRoutes: (instance) => fivemApiFeature(service).register(instance, context),
  });
  return { server, queried };
}

const { guildId: _guild, revision: _revision, ...defaults } = defaultFivemSettings(GUILD);

describe("fivem routes", () => {
  it("saves settings, tests a connection, and shows live status", async () => {
    const { server, queried } = setup(["fivem.manage"]);
    expect((await server.inject({ method: "GET", url: "/api/v1/fivem/status", headers: host })).statusCode).toBe(400);
    const saved = await server.inject(json("PUT", "/api/v1/fivem/settings", { ...defaults, serverAddress: "Play.Example.com:30120", connectUrl: "https://cfx.re/join/abc123", expectedRevision: 0 }));
    expect(saved.json().data).toMatchObject({ serverAddress: "play.example.com:30120", revision: 1 });
    expect((await server.inject({ method: "GET", url: "/api/v1/fivem/status", headers: host })).json().data).toMatchObject({ online: true, playerCount: 1 });
    expect((await server.inject(json("POST", "/api/v1/fivem/test", { serverAddress: "1.2.3.4:30120" }))).json().data.online).toBe(true);
    expect(queried).toEqual(["play.example.com:30120", "1.2.3.4:30120"]);
    const overview = (await server.inject({ method: "GET", url: "/api/v1/fivem/overview", headers: host })).json().data;
    expect(overview).toMatchObject({ configured: true, connectUrl: "https://cfx.re/join/abc123", can: { manage: true }, settings: { revision: 1 } });
  });

  it("hides settings from members and rejects their changes", async () => {
    const { server } = setup([]);
    const overview = (await server.inject({ method: "GET", url: "/api/v1/fivem/overview", headers: host })).json().data;
    expect(overview).toMatchObject({ configured: false, can: { manage: false } });
    expect(overview.settings).toBeUndefined();
    expect((await server.inject(json("PUT", "/api/v1/fivem/settings", { ...defaults, expectedRevision: 0 }))).statusCode).toBe(403);
    expect((await server.inject(json("POST", "/api/v1/fivem/test", { serverAddress: "1.2.3.4:30120" }))).statusCode).toBe(403);
    const history = (await server.inject({ method: "GET", url: "/api/v1/fivem/history?range=7d", headers: host })).json().data;
    expect(history).toMatchObject({ range: "7d", peak: 0 });
    expect(history.points).toHaveLength(84);
  });

  it("returns readable validation errors", async () => {
    const { server } = setup(["fivem.manage"]);
    const bad = await server.inject(json("PUT", "/api/v1/fivem/settings", { ...defaults, timeZone: "Nowhere/City", expectedRevision: 0 }));
    expect(bad.statusCode).toBe(400);
    expect(bad.json().errors[0].message).toContain("time zone");
    expect((await server.inject(json("POST", "/api/v1/fivem/test", { serverAddress: "localhost" }))).statusCode).toBe(400);
  });
});
