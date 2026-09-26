import { describe, expect, it } from "vitest";
import { opaqueAuthenticationSecret } from "@qbox/authentication";
import type { BotStatus, BuilderGateway } from "@qbox/server-builder";

import { CachedBuilderGateway } from "../src/builder/CachedBuilderGateway.js";
import { TtlCache } from "../src/cache/TtlCache.js";
import { SessionVerificationCache } from "../src/auth/SessionVerificationCache.js";
import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { DirectoryCache, directoryApiFeature } from "../src/directory/DirectoryRoutes.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import type { ApiLogFields, ApiLogger } from "../src/logging/ApiLogger.js";
import { installDiscordCallTiming, recordDatabaseQuery, serverTimingHeader } from "../src/metrics/RequestTimings.js";

describe("TtlCache", () => {
  it("serves entries until they expire and keeps at most maxEntries", () => {
    let now = 0;
    const cache = new TtlCache<string, number>({ ttlMs: 100, maxEntries: 2, now: () => now });
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe(2);
    now = 100;
    expect(cache.get("b")).toBeUndefined();
    cache.set("d", 4, 50);
    expect(cache.get("d")).toBeUndefined();
  });

  it("shares one load between callers, stores only successes, and lets delete win over a pending load", async () => {
    const cache = new TtlCache<string, number>({ ttlMs: 1_000, maxEntries: 10 });
    let loads = 0;
    const load = async () => {
      loads += 1;
      return loads;
    };
    expect(await Promise.all([cache.getOrLoad("a", load), cache.getOrLoad("a", load)])).toEqual([1, 1]);
    expect(loads).toBe(1);
    await expect(cache.getOrLoad("b", async () => { throw new Error("down"); })).rejects.toThrow("down");
    expect(await cache.getOrLoad("b", load)).toBe(2);
    let release!: (value: number) => void;
    const pending = cache.getOrLoad("c", () => new Promise<number>((resolve) => { release = resolve; }));
    cache.delete("c");
    release(9);
    expect(await pending).toBe(9);
    expect(cache.get("c")).toBeUndefined();
  });
});

describe("SessionVerificationCache", () => {
  const secret = opaqueAuthenticationSecret("session-secret-value-000000000000000000");
  const csrf = opaqueAuthenticationSecret("csrf-secret-value-000000000000000000000");
  const verified = (idleExpiresAt = 1_000_000) => ({
    actor: { type: "platform-user", platformUserId: "user-1" },
    session: { idleExpiresAt: new Date(idleExpiresAt), absoluteExpiresAt: new Date(10_000_000) },
  }) as never;

  it("reuses a successful verification for 10 seconds at most and never a failure", async () => {
    let now = 0;
    let calls = 0;
    let fail = true;
    const cache = new SessionVerificationCache({
      verifySession: async () => {
        calls += 1;
        if (fail) throw new Error("revoked");
        return verified();
      },
      verifySessionCsrf: async () => verified(),
    }, { now: () => now });
    await expect(cache.verifySession(secret)).rejects.toThrow("revoked");
    fail = false;
    await cache.verifySession(secret);
    await cache.verifySession(secret);
    expect(calls).toBe(2);
    now = 10_000;
    await cache.verifySession(secret);
    expect(calls).toBe(3);
  });

  it("never outlives the session's own expiry and forgets a session or an account at once", async () => {
    let now = 0;
    let calls = 0;
    const cache = new SessionVerificationCache({
      verifySession: async () => {
        calls += 1;
        return verified(5_000);
      },
      verifySessionCsrf: async () => {
        calls += 1;
        return verified();
      },
    }, { now: () => now });
    await cache.verifySession(secret);
    now = 5_000;
    await cache.verifySession(secret);
    expect(calls).toBe(2);
    await cache.verifySessionCsrf(secret, csrf);
    await cache.verifySessionCsrf(secret, csrf);
    expect(calls).toBe(3);
    cache.forget(secret);
    await cache.verifySession(secret);
    await cache.verifySessionCsrf(secret, csrf);
    expect(calls).toBe(5);
    cache.forgetAccount("user-1");
    await cache.verifySessionCsrf(secret, csrf);
    expect(calls).toBe(6);
  });
});

describe("directory route cache", () => {
  const GUILD = "1300000000000000001";

  function server(cache: DirectoryCache, calls: string[]) {
    const rest = {
      get: async (route: string) => {
        calls.push(route);
        if (route.endsWith("/channels")) return [{ id: "1300000000000000010", name: "general", type: 0, position: 0 }];
        return [{ id: "1300000000000000020", name: "Staff", color: 0, position: 1, managed: false }];
      },
    };
    const context: ApiFeatureContext = {
      guildId: GUILD,
      guard: async () => ({ userId: "1", displayName: "x", roleIds: [] }),
      member: async () => ({ userId: "1", displayName: "x", roleIds: [] }),
    };
    const app = createApiServer({
      configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000" }),
      logger: silentLogger(),
      registerRoutes: (instance) => directoryApiFeature(rest as never, cache).register(instance, context),
    });
    return (url: string) => app.inject({ method: "GET", url, headers: { host: "127.0.0.1:3000" } });
  }

  it("reads channels and roles once per 15 seconds per server, again on ?refresh=1 or after forget", async () => {
    let now = 0;
    const calls: string[] = [];
    const cache = new DirectoryCache({ now: () => now });
    const get = server(cache, calls);
    const first = await get("/api/v1/directory");
    expect(first.statusCode).toBe(200);
    expect(first.headers["cache-control"]).toBe("no-store");
    expect(first.json().data.channels).toHaveLength(1);
    await get("/api/v1/directory");
    expect(calls).toHaveLength(2);
    await get("/api/v1/directory?refresh=1");
    expect(calls).toHaveLength(4);
    cache.forget(GUILD);
    await get("/api/v1/directory");
    expect(calls).toHaveLength(6);
    now = 15_000;
    await get("/api/v1/directory");
    expect(calls).toHaveLength(8);
  });
});

describe("CachedBuilderGateway", () => {
  it("reuses the bot status for a minute and drops it when the builder changes roles or a run finishes", async () => {
    let now = 0;
    let reads = 0;
    const status = { userId: "1", permissions: 8n, topRolePosition: 1, highestRolePosition: 1, community: false } as BotStatus;
    const inner = {
      botStatus: async () => {
        reads += 1;
        return status;
      },
      createRole: async () => "role",
      createChannel: async () => "channel",
    } as unknown as BuilderGateway;
    const gateway = new CachedBuilderGateway(inner, { now: () => now });
    await gateway.botStatus("g");
    await gateway.botStatus("g");
    expect(reads).toBe(1);
    await gateway.createChannel("g", {} as never, "reason");
    await gateway.botStatus("g");
    expect(reads).toBe(1);
    await gateway.createRole("g", {} as never, "reason");
    await gateway.botStatus("g");
    expect(reads).toBe(2);
    gateway.forget("g");
    await gateway.botStatus("g");
    expect(reads).toBe(3);
    now = 60_000;
    await gateway.botStatus("g");
    expect(reads).toBe(4);
  });
});

describe("request timing", () => {
  it("adds Server-Timing to API responses and logs slow requests with database and Discord counts", async () => {
    const entries: { level: string; fields: ApiLogFields }[] = [];
    let clock = 0;
    const rest = { request: async (route: string) => route };
    installDiscordCallTiming(rest as never);
    const app = createApiServer({
      configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000" }),
      logger: capturingLogger(entries),
      monotonicNow: () => clock,
      registerRoutes: (instance) => {
        instance.get("/api/v1/slow", async () => {
          recordDatabaseQuery(30);
          recordDatabaseQuery(20);
          await rest.request("/guilds/1");
          clock += 900;
          return { ok: true };
        });
        instance.get("/plain", async () => ({ ok: true }));
      },
    });
    const response = await app.inject({ method: "GET", url: "/api/v1/slow", headers: { host: "127.0.0.1:3000" } });
    expect(response.statusCode).toBe(200);
    expect(response.headers["server-timing"]).toMatch(/^db;dur=50;desc="2 queries", discord;dur=[\d.]+;desc="1 calls", total;dur=900$/);
    const slow = entries.find((entry) => entry.fields.event === "api.request.slow");
    expect(slow).toMatchObject({ level: "warn", fields: { route: "/api/v1/slow", dbQueries: 2, dbMs: 50, discordCalls: 1 } });
    const plain = await app.inject({ method: "GET", url: "/plain", headers: { host: "127.0.0.1:3000" } });
    expect(plain.headers["server-timing"]).toBeUndefined();
    await app.close();
  });

  it("formats the Server-Timing value", () => {
    expect(serverTimingHeader({ dbQueries: 3, dbMs: 12.345, discordCalls: 0, discordMs: 0 }, 40)).toBe(
      'db;dur=12.3;desc="3 queries", discord;dur=0;desc="0 calls", total;dur=40',
    );
  });
});

function silentLogger(): ApiLogger {
  const logger: ApiLogger = { child: () => logger, info: () => undefined, warn: () => undefined, error: () => undefined };
  return logger;
}

function capturingLogger(entries: { level: string; fields: ApiLogFields }[], bindings: ApiLogFields = {}): ApiLogger {
  return {
    child: (more) => capturingLogger(entries, { ...bindings, ...more }),
    info: (fields) => void entries.push({ level: "info", fields: { ...bindings, ...fields } }),
    warn: (fields) => void entries.push({ level: "warn", fields: { ...bindings, ...fields } }),
    error: (fields) => void entries.push({ level: "error", fields: { ...bindings, ...fields } }),
  };
}
