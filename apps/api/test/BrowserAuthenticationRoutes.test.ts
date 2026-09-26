import { Buffer } from "node:buffer";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  authenticationCorrelationId,
  browserSessionId,
  externalIdentityId,
  opaqueAuthenticationSecret,
  platformUserId,
} from "@qbox/authentication";
import { ApiAuthenticationConfiguration } from "../src/auth/ApiAuthenticationConfiguration.js";
import { chooseStartingGuild, registerBrowserAuthenticationRoutes } from "../src/auth/BrowserAuthenticationRoutes.js";
import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { AuthenticationCaches } from "../src/auth/AuthenticationCaches.js";
import { createApiServer } from "../src/createApiServer.js";
import { registerPortalStaticRoutes } from "../src/portal/PortalStaticRoutes.js";
import type { ApiFeature } from "../src/features/ApiFeature.js";
import type { GuildListing } from "../src/auth/GuildDirectory.js";
import type { ApiLogger } from "../src/logging/ApiLogger.js";

const logger: ApiLogger = {
  child: () => logger,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

const DEFAULT_GUILD = "1257928923048837201";
const OTHER_GUILD = "1300000000000000002";
const session = { host: "127.0.0.1:3000", cookie: "qbox_session=session-secret-value-000000000000000000" };
const csrf = {
  ...session,
  cookie: `${session.cookie}; qbox_csrf=csrf-secret-value-000000000000000000000`,
  origin: "http://127.0.0.1:3000",
  "x-csrf-token": "csrf-secret-value-000000000000000000000",
  "content-type": "application/json",
};
const unmanagedGuilds: GuildListing = {
  guilds: [
    { id: OTHER_GUILD, name: "Other Server", icon: null, owner: false, canManage: false },
    { id: "1300000000000000003", name: "Third Server", icon: null, owner: false, canManage: false },
  ],
  reauthRequired: false,
};
const sharedGuilds: GuildListing = {
  guilds: [
    { id: OTHER_GUILD, name: "Other Server", icon: null, owner: false, canManage: true },
    { id: DEFAULT_GUILD, name: "Qbox HQ", icon: "icon", owner: true, canManage: true },
  ],
  reauthRequired: false,
};

describe("browser authentication routes", () => {
  it("lets the portal own / when it is served alongside the authentication routes", async () => {
    const directory = mkdtempSync(join(tmpdir(), "qbox-portal-"));
    writeFileSync(join(directory, "index.html"), "<!doctype html><title>Qbox portal</title>");
    try {
      const server = serverWithRoutes({ portalDirectory: directory });
      const page = await server.inject({ method: "GET", url: "/", headers: { host: "127.0.0.1:3000" } });
      expect(page.statusCode).toBe(200);
      expect(page.body).toContain("Qbox portal");
      const start = await server.inject({ method: "GET", url: "/auth/discord/start", headers: { host: "127.0.0.1:3000" } });
      expect(start.statusCode).toBe(302);
      await server.close();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("serves the dashboard and starts Discord OAuth through a browser binding cookie", async () => {
    const server = serverWithRoutes();
    const page = await server.inject({ method: "GET", url: "/", headers: { host: "127.0.0.1:3000" } });
    expect(page.statusCode).toBe(200);
    expect(page.body).toContain("Local proof of concept");

    const start = await server.inject({ method: "GET", url: "/auth/discord/start", headers: { host: "127.0.0.1:3000" } });
    expect(start.statusCode).toBe(302);
    expect(start.headers.location).toContain("https://discord.example/authorize");
    expect(start.headers["set-cookie"]).toContain("qbox_oauth=");
    await server.close();
  });

  it("returns safe /me data for a verified browser session", async () => {
    const server = serverWithRoutes();
    const response = await server.inject({ method: "GET", url: "/api/v1/me", headers: session });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.account.discordUserId).toBe("804859666655739996");
    expect(body.membership.roleIds).toEqual(["1262656532902842423"]);
    expect(body.membership.guildId).toBe(DEFAULT_GUILD);
    expect(body.guild).toEqual({ id: DEFAULT_GUILD, name: "Qbox HQ", icon: "icon", canManage: true });
    expect(body.guilds).toEqual(sharedGuilds.guilds);
    expect(body.inviteUrl).toBe("https://discord.com/oauth2/authorize?client_id=1432071570645455029&scope=bot%20applications.commands&permissions=8");
    expect(body.reauthRequired).toBe(false);
    expect(JSON.stringify(body)).not.toContain("session-secret-value");
    await server.close();
  });

  it("reports no current server and asks for a new sign-in when the stored grant is too old", async () => {
    const server = serverWithRoutes({ defaultGuild: false, listing: { guilds: [], reauthRequired: true } });
    const me = await server.inject({ method: "GET", url: "/api/v1/me", headers: session });
    expect(me.statusCode).toBe(200);
    expect(me.json()).toMatchObject({ guild: null, guilds: [], reauthRequired: true, membership: { guildId: null, status: "UNKNOWN" } });
    expect(me.json().permissions.platformAdmin.reason).toBe("missing-guild-context");
    await server.close();
  });

  it("answers GUILD_REQUIRED when no server is selected, none is configured, and none can be chosen", async () => {
    const server = serverWithRoutes({ defaultGuild: false, listing: unmanagedGuilds });
    const response = await server.inject({ method: "GET", url: "/api/v1/discord/role-menus", headers: session });
    expect(response.statusCode).toBe(409);
    expect(response.headers["content-type"]).toContain("application/problem+json");
    expect(response.json()).toMatchObject({
      type: "https://qbox.invalid/problems/guild-required",
      title: "Server selection required",
      status: 409,
      code: "GUILD_REQUIRED",
    });
    const feature = await server.inject({ method: "GET", url: "/api/v1/echo-guild", headers: session });
    expect(feature.statusCode).toBe(409);
    expect(feature.json().code).toBe("GUILD_REQUIRED");
    await server.close();
  });

  it("opens a server the member owns instead of a default server they do not manage", async () => {
    const listing: GuildListing = {
      guilds: [
        { id: DEFAULT_GUILD, name: "Host Server", icon: null, owner: false, canManage: false },
        { id: OTHER_GUILD, name: "Their Server", icon: null, owner: true, canManage: true },
      ],
      reauthRequired: false,
    };
    const server = serverWithRoutes({ listing });
    const echoed = await server.inject({ method: "GET", url: "/api/v1/echo-guild", headers: session });
    expect(echoed.statusCode).toBe(200);
    expect(echoed.json()).toEqual({ guildId: OTHER_GUILD });
    expect(String(echoed.headers["set-cookie"])).toContain(`qbox_guild=${OTHER_GUILD}`);
    await server.close();
  });

  it("keeps the default server when the member manages it", async () => {
    const server = serverWithRoutes();
    const echoed = await server.inject({ method: "GET", url: "/api/v1/echo-guild", headers: session });
    expect(echoed.json()).toEqual({ guildId: DEFAULT_GUILD });
    await server.close();
  });

  it("opens the only shared server when the member shares just one", async () => {
    const listing: GuildListing = { guilds: [{ id: OTHER_GUILD, name: "Only", icon: null, owner: false, canManage: false }], reauthRequired: false };
    const server = serverWithRoutes({ defaultGuild: false, listing });
    const echoed = await server.inject({ method: "GET", url: "/api/v1/echo-guild", headers: session });
    expect(echoed.json()).toEqual({ guildId: OTHER_GUILD });
    await server.close();
  });

  it("lists shared servers and re-reads Discord on refresh", async () => {
    const refreshes: boolean[] = [];
    const server = serverWithRoutes({ onList: (refresh) => refreshes.push(refresh) });
    const cached = await server.inject({ method: "GET", url: "/api/v1/guilds", headers: session });
    expect(cached.statusCode).toBe(200);
    expect(cached.json()).toEqual({ data: sharedGuilds.guilds, reauthRequired: false });
    const fresh = await server.inject({ method: "GET", url: "/api/v1/guilds?refresh=1", headers: session });
    expect(fresh.statusCode).toBe(200);
    expect(refreshes).toContain(true);
    const anonymous = await server.inject({ method: "GET", url: "/api/v1/guilds", headers: { host: "127.0.0.1:3000" } });
    expect(anonymous.statusCode).toBe(401);
    await server.close();
  });

  it("selects a shared server into an httpOnly cookie after verifying membership there", async () => {
    const verified: string[] = [];
    const server = serverWithRoutes({ onVerify: (guildId) => verified.push(guildId) });
    const selected = await server.inject({ method: "POST", url: "/api/v1/guilds/select", headers: csrf, payload: { guildId: OTHER_GUILD } });
    expect(selected.statusCode).toBe(200);
    expect(selected.json().data).toEqual(sharedGuilds.guilds[0]);
    expect(verified).toEqual([OTHER_GUILD]);
    const cookie = String(selected.headers["set-cookie"]);
    expect(cookie).toContain(`qbox_guild=${OTHER_GUILD}`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("Max-Age=2592000");
    await server.close();
  });

  it("refuses to select a server the member and the bot do not share, and requires CSRF", async () => {
    const server = serverWithRoutes();
    const outside = await server.inject({ method: "POST", url: "/api/v1/guilds/select", headers: csrf, payload: { guildId: "1300000000000000099" } });
    expect(outside.statusCode).toBe(403);
    const malformed = await server.inject({ method: "POST", url: "/api/v1/guilds/select", headers: csrf, payload: { guildId: "nope" } });
    expect(malformed.statusCode).toBe(400);
    const noCsrf = await server.inject({
      method: "POST",
      url: "/api/v1/guilds/select",
      headers: { ...session, "content-type": "application/json" },
      payload: { guildId: OTHER_GUILD },
    });
    expect(noCsrf.statusCode).toBe(401);
    await server.close();
  });

  it("clears the selected server", async () => {
    const server = serverWithRoutes();
    const cleared = await server.inject({ method: "POST", url: "/api/v1/guilds/clear", headers: { ...csrf, cookie: `${csrf.cookie}; qbox_guild=${OTHER_GUILD}` }, payload: {} });
    expect(cleared.statusCode).toBe(200);
    expect(cleared.json()).toEqual({ success: true });
    expect(String(cleared.headers["set-cookie"])).toMatch(/qbox_guild=;.*(Max-Age=0|Expires=)/u);
    await server.close();
  });

  it("applies the cookie's server to every route, falling back to the default", async () => {
    const listed: string[] = [];
    const server = serverWithRoutes({ onListByGuild: (guildId) => listed.push(guildId) });
    const chosen = await server.inject({ method: "GET", url: "/api/v1/discord/role-menus", headers: { ...session, cookie: `${session.cookie}; qbox_guild=${OTHER_GUILD}` } });
    expect(chosen.statusCode).toBe(200);
    const echoed = await server.inject({ method: "GET", url: "/api/v1/echo-guild", headers: { ...session, cookie: `${session.cookie}; qbox_guild=${OTHER_GUILD}` } });
    expect(echoed.json()).toEqual({ guildId: OTHER_GUILD });
    const me = await server.inject({ method: "GET", url: "/api/v1/me", headers: { ...session, cookie: `${session.cookie}; qbox_guild=${OTHER_GUILD}` } });
    expect(me.json().guild).toMatchObject({ id: OTHER_GUILD, name: "Other Server" });
    const fallback = await server.inject({ method: "GET", url: "/api/v1/discord/role-menus", headers: session });
    expect(fallback.statusCode).toBe(200);
    expect(listed).toEqual([OTHER_GUILD, DEFAULT_GUILD]);
    await server.close();
  });

  it("ignores and clears a cookie for a server the member no longer shares", async () => {
    const listed: string[] = [];
    const server = serverWithRoutes({ onListByGuild: (guildId) => listed.push(guildId) });
    const response = await server.inject({ method: "GET", url: "/api/v1/discord/role-menus", headers: { ...session, cookie: `${session.cookie}; qbox_guild=1300000000000000099` } });
    expect(response.statusCode).toBe(200);
    expect(listed).toEqual([DEFAULT_GUILD]);
    expect(String(response.headers["set-cookie"])).toContain(`qbox_guild=${DEFAULT_GUILD}`);
    const none = serverWithRoutes({ defaultGuild: false, listing: unmanagedGuilds });
    const rejected = await none.inject({ method: "GET", url: "/api/v1/discord/role-menus", headers: { ...session, cookie: `${session.cookie}; qbox_guild=1300000000000000099` } });
    expect(rejected.statusCode).toBe(409);
    await server.close();
    await none.close();
  });

  it("keeps the cookie's server when Discord is down but the stored membership is present", async () => {
    const server = serverWithRoutes({
      listing: () => {
        throw Object.freeze({ code: "PROVIDER_UNAVAILABLE", retryable: true });
      },
    });
    const echoed = await server.inject({ method: "GET", url: "/api/v1/echo-guild", headers: { ...session, cookie: `${session.cookie}; qbox_guild=${OTHER_GUILD}` } });
    expect(echoed.statusCode).toBe(200);
    expect(echoed.json()).toEqual({ guildId: OTHER_GUILD });
    const me = await server.inject({ method: "GET", url: "/api/v1/me", headers: session });
    expect(me.statusCode).toBe(503);
    await server.close();
  });

  it("keeps concurrent requests on their own servers", async () => {
    const server = serverWithRoutes();
    const [slow, fast] = await Promise.all([
      server.inject({ method: "GET", url: "/api/v1/echo-guild?delay=40", headers: { ...session, cookie: `${session.cookie}; qbox_guild=${OTHER_GUILD}` } }),
      server.inject({ method: "GET", url: "/api/v1/echo-guild?delay=5", headers: session }),
    ]);
    expect(slow.json()).toEqual({ guildId: OTHER_GUILD });
    expect(fast.json()).toEqual({ guildId: DEFAULT_GUILD });
    await server.close();
  });

  it("denies admin-check through the permission authorizer result", async () => {
    const server = serverWithRoutes({ adminAllowed: false });
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/admin-check",
      headers: { host: "127.0.0.1:3000", cookie: "qbox_session=session-secret-value-000000000000000000" },
    });
    expect(response.statusCode).toBe(403);
    await server.close();
  });

  it("allows role-menu management routes through the existing permission authorizer", async () => {
    const server = serverWithRoutes();
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/discord/role-menus",
      headers: { host: "127.0.0.1:3000", cookie: "qbox_session=session-secret-value-000000000000000000" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual([{ id: "menu-1", title: "Community Roles", status: "PUBLISHED" }]);
    await server.close();
  });

  it("lets Discord owners and administrators manage everything without Qbox permissions", async () => {
    const server = serverWithRoutes({ roleMenuAllowed: false, discordManager: true });
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/discord/role-menus",
      headers: { host: "127.0.0.1:3000", cookie: "qbox_session=session-secret-value-000000000000000000" },
    });
    expect(response.statusCode).toBe(200);
    const me = await server.inject({
      method: "GET",
      url: "/api/v1/me",
      headers: { host: "127.0.0.1:3000", cookie: "qbox_session=session-secret-value-000000000000000000" },
    });
    expect(me.json()).toMatchObject({ permissions: { discordManager: true } });
  });

  it("still requires Qbox permissions for members who do not run the server in Discord", async () => {
    const server = serverWithRoutes({ roleMenuAllowed: false, discordManager: false });
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/discord/role-menus",
      headers: { host: "127.0.0.1:3000", cookie: "qbox_session=session-secret-value-000000000000000000" },
    });
    expect(response.statusCode).toBe(403);
  });

  it("denies role-menu management routes when permission authorization fails", async () => {
    const server = serverWithRoutes({ roleMenuAllowed: false });
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/discord/role-menus",
      headers: { host: "127.0.0.1:3000", cookie: "qbox_session=session-secret-value-000000000000000000" },
    });
    expect(response.statusCode).toBe(403);
    await server.close();
  });

  it("requires CSRF for logout while health remains public", async () => {
    const server = serverWithRoutes();
    const health = await server.inject({ method: "GET", url: "/health/live", headers: { host: "127.0.0.1:3000" } });
    expect(health.statusCode).toBe(200);
    const rejected = await server.inject({
      method: "POST",
      url: "/auth/logout",
      headers: {
        host: "127.0.0.1:3000",
        origin: "http://127.0.0.1:3000",
        cookie: "qbox_session=session-secret-value-000000000000000000",
      },
    });
    expect(rejected.statusCode).toBe(401);
    await server.close();
  });
});

interface ServerOptions {
  readonly adminAllowed?: boolean;
  readonly roleMenuAllowed?: boolean;
  readonly portalDirectory?: string;
  readonly discordManager?: boolean;
  /** Configure DISCORD_GUILD_ID (default true). */
  readonly defaultGuild?: boolean;
  readonly listing?: GuildListing | (() => GuildListing);
  readonly onList?: (refresh: boolean) => void;
  readonly onVerify?: (guildId: string) => void;
  readonly onListByGuild?: (guildId: string) => void;
  /** Counts reads the caches should save. */
  readonly counts?: ReadCounts;
  /** Clock for the in-process caches. */
  readonly now?: () => number;
}

interface ReadCounts {
  sessions: number;
  csrf: number;
  accounts: number;
  memberships: number;
  guildRows: number;
}

const newCounts = (): ReadCounts => ({ sessions: 0, csrf: 0, accounts: 0, memberships: 0, guildRows: 0 });

/** Test feature that reports the request's current server after an optional delay. */
const echoGuildFeature: ApiFeature = {
  name: "echo-guild",
  register: (server, context) => {
    server.get("/api/v1/echo-guild", async (request) => {
      await context.member(request, { mutation: false });
      const delay = Number(Reflect.get(request.query as object, "delay") ?? 0);
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
      return { guildId: context.guildId };
    });
  },
};

function serverWithRoutes(options: ServerOptions = {}) {
  const auth = authenticationConfiguration(options.defaultGuild !== false);
  const counts = options.counts ?? newCounts();
  const sessions = {
    verifySession: async () => {
      counts.sessions += 1;
      return verifiedSession();
    },
    verifySessionCsrf: async () => {
      counts.csrf += 1;
      return verifiedSession();
    },
    createSession: async () => ({
      session: verifiedSession().session,
      sessionSecret: opaqueAuthenticationSecret("session-secret-value-000000000000000000"),
      csrfSecret: opaqueAuthenticationSecret("csrf-secret-value-000000000000000000000"),
    }),
    revokeCurrentSession: async () => undefined,
  } as never;
  return createApiServer({
    configuration: ApiConfiguration.from({
      environment: "test",
      publicBaseUrl: "http://127.0.0.1:3000",
    }),
    logger,
    registerRoutes: (instance) => {
      if (options.portalDirectory !== undefined)
        registerPortalStaticRoutes(instance, { directory: options.portalDirectory });
      return registerBrowserAuthenticationRoutes(instance, {
        serveDashboard: options.portalDirectory === undefined,
        ...(options.discordManager === undefined ? {} : { guildAuthority: { isManager: async () => options.discordManager === true } }),
        configuration: auth,
        provider: fakeProvider(),
        directory: {
          list: async (_identity, _context, _signal, listOptions) => {
            options.onList?.(listOptions?.refresh === true);
            const listing = options.listing ?? sharedGuilds;
            return typeof listing === "function" ? listing() : listing;
          },
          forget: () => undefined,
        },
        features: [echoGuildFeature],
        oauthTransactions: {
          createTransaction: async () => ({
            transactionId: "11111111-1111-4111-8111-111111111111",
            state: opaqueAuthenticationSecret("state-secret-value-0000000000000000000"),
            browserBinding: opaqueAuthenticationSecret("binding-secret-value-0000000000000000"),
            expiresAt: new Date("2026-08-01T00:10:00.000Z"),
          }),
          claimTransaction: async () => ({
            transaction: {
              id: "11111111-1111-4111-8111-111111111111",
              provider: "DISCORD",
              purpose: "LOGIN",
              state: "CLAIMED",
              stateDigest: "0".repeat(64),
              browserBindingDigest: "1".repeat(64),
              redirectKey: "discord-login",
              returnTargetKey: "dashboard",
              pkceMode: "DISABLED_UNVERIFIED",
              expiresAt: new Date("2026-08-01T00:10:00.000Z"),
              claimedAt: new Date("2026-08-01T00:00:00.000Z"),
              claimExpiresAt: new Date("2026-08-01T00:01:00.000Z"),
              createdAt: new Date("2026-08-01T00:00:00.000Z"),
              updatedAt: new Date("2026-08-01T00:00:00.000Z"),
            },
            reclaimed: false,
          }),
          completeTransaction: async () => undefined,
          failTransaction: async () => undefined,
        } as never,
        login: {
          resolveLogin: async () => ({
            platformUser: platformUser(),
            externalIdentity: externalIdentity(),
            created: true,
          }),
        } as never,
        credentials: { persistLoginGrant: async () => undefined } as never,
        sessions,
        caches: new AuthenticationCaches(sessions, options.now ? { now: options.now } : {}),
        memberships: {
          verifyCurrentMembership: async (input: { readonly discordGuildId: string }) => {
            options.onVerify?.(input.discordGuildId);
            return membership();
          },
        } as never,
        guilds: {
          findByDiscordId: async () => (counts.guildRows += 1, { id: "44444444-4444-4444-8444-444444444444", discordGuildId: "1257928923048837201", enabled: true, metadata: {}, createdAt: new Date(), updatedAt: new Date() }),
          create: async () => ({ id: "44444444-4444-4444-8444-444444444444", discordGuildId: "1257928923048837201", enabled: true, metadata: {}, createdAt: new Date(), updatedAt: new Date() }),
        },
        authorizer: {
          authorize: async (request) => ({
            allowed: request.required.includes("discord.role-menus.manage")
              ? options.roleMenuAllowed ?? true
              : request.required.includes("platform.admin")
                ? options.adminAllowed ?? true
                : true,
            reason: "permissions-satisfied",
            effectivePermissions: request.required,
            deniedPermissions: [],
            usedCache: false,
            degraded: false,
          }),
        },
        unitOfWork: {
          run: async (operation) =>
            operation({
              externalIdentities: {
                findById: async () => {
                  counts.accounts += 1;
                  return externalIdentity();
                },
              },
              guildMemberships: {
                find: async () => {
                  counts.memberships += 1;
                  return membership();
                },
              },
          } as never),
        },
        roleMenus: {
          listByGuild: async (guildId: string) => {
            options.onListByGuild?.(guildId);
            return [{ id: "menu-1", title: "Community Roles", status: "PUBLISHED" }];
          },
        } as never,
        logger,
      });
    },
  });
}

function authenticationConfiguration(withDefaultGuild = true) {
  const key = Buffer.alloc(32, 7).toString("base64url");
  return ApiAuthenticationConfiguration.from({
    environment: "test",
    publicBaseUrl: "http://127.0.0.1:3000",
    discordClientId: "1432071570645455029",
    discordClientSecret: "test-client-secret",
    discordRedirectUri: "http://127.0.0.1:3000/auth/discord/callback",
    ...(withDefaultGuild ? { discordGuildId: DEFAULT_GUILD } : {}),
    sessionHmacKey: key,
    csrfHmacKey: key,
    metadataHmacKey: key,
    oauthEncryptionKey: key,
    keyVersion: "1",
  });
}

function fakeProvider() {
  return {
    createAuthorizationUrl: () => new URL("https://discord.example/authorize?client_id=1432071570645455029"),
    exchangeCode: async () => ({
      accessToken: opaqueAuthenticationSecret("access-secret-value-0000000000000000000"),
      refreshToken: opaqueAuthenticationSecret("refresh-secret-value-000000000000000000"),
      scopes: ["guilds", "guilds.members.read", "identify"],
      expiresAt: new Date("2026-08-01T01:00:00.000Z"),
    }),
    refreshToken: async () => {
      throw new Error("not-used");
    },
    revokeCredential: async () => ({ attempted: true, succeeded: true }),
    inspectAuthorization: async () => ({
      applicationId: "1432071570645455029",
      scopes: ["guilds", "guilds.members.read", "identify"],
    }),
    fetchGuilds: async () => [
      { id: DEFAULT_GUILD, name: "Qbox HQ", icon: "icon", owner: true, permissions: "8" },
      { id: OTHER_GUILD, name: "Other Server", icon: null, owner: false, permissions: "32" },
    ],
    fetchIdentity: async () => ({
      userId: "804859666655739996",
      username: "qbox",
      globalName: "Qbox User",
      avatar: "avatarhash",
    }),
    verify: async () => ({
      status: "PRESENT",
      guildId: "1257928923048837201",
      verifiedAt: new Date("2026-08-01T00:00:00.000Z"),
      validUntil: new Date("2026-08-01T00:05:00.000Z"),
      roleIds: ["1262656532902842423"],
    }),
  } as never;
}

function platformUser() {
  return {
    id: platformUserId("22222222-2222-4222-8222-222222222222"),
    status: "ACTIVE",
    authenticationRevision: 1,
    statusReasonCode: "ACCOUNT_CREATED",
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
  } as const;
}

function externalIdentity() {
  return {
    id: externalIdentityId("33333333-3333-4333-8333-333333333333"),
    platformUserId: platformUser().id,
    provider: "DISCORD",
    providerSubjectId: "804859666655739996",
    profile: { username: "qbox", globalName: "Qbox User", avatar: "avatarhash" },
    enabled: true,
    linkedAt: new Date("2026-08-01T00:00:00.000Z"),
    verifiedAt: new Date("2026-08-01T00:00:00.000Z"),
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
  } as const;
}

function verifiedSession() {
  return {
    actor: {
      type: "platform-user",
      platformUserId: platformUser().id,
      authentication: {
        method: "discord-oauth",
        sessionId: browserSessionId("55555555-5555-4555-8555-555555555555"),
        loginIdentityId: externalIdentity().id,
        authenticationRevision: 1,
        authenticatedAt: "2026-08-01T00:00:00.000Z",
      },
    },
    session: {
      id: browserSessionId("55555555-5555-4555-8555-555555555555"),
      status: "ACTIVE",
      authenticatedAt: new Date("2026-08-01T00:00:00.000Z"),
      lastSeenAt: new Date("2026-08-01T00:00:00.000Z"),
      idleExpiresAt: new Date("2026-08-01T08:00:00.000Z"),
      absoluteExpiresAt: new Date("2026-08-08T00:00:00.000Z"),
    },
  } as const;
}

function membership() {
  return {
    id: "66666666-6666-4666-8666-666666666666",
    externalIdentityId: externalIdentity().id,
    guildId: "44444444-4444-4444-8444-444444444444",
    status: "PRESENT",
    source: "DISCORD_OAUTH",
    verifiedAt: new Date("2026-08-01T00:00:00.000Z"),
    validUntil: new Date("2026-08-01T00:05:00.000Z"),
    roles: [
      {
        membershipId: "66666666-6666-4666-8666-666666666666",
        roleId: "1262656532902842423",
        createdAt: new Date("2026-08-01T00:00:00.000Z"),
      },
    ],
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
  } as const;
}

describe("request and short cross-request caching", () => {
  const cookie = "qbox_session=session-secret-value-000000000000000000; qbox_guild=1257928923048837201";
  const headers = { host: "127.0.0.1:3000", cookie };

  it("reads the session, account, and membership once per request although the guard, server lookup, and handler all need them", async () => {
    const counts = newCounts();
    const server = serverWithRoutes({ counts, discordManager: false });
    const response = await server.inject({ method: "GET", url: "/api/v1/echo-guild", headers });
    expect(response.statusCode).toBe(200);
    expect(counts).toMatchObject({ sessions: 1, accounts: 1, memberships: 1 });
    const me = await server.inject({ method: "GET", url: "/api/v1/me", headers });
    expect(me.statusCode).toBe(200);
    await server.close();
  });

  it("reuses a verified session for 10 seconds, the account for 60, and the membership for 30", async () => {
    let clock = 1_000_000;
    const counts = newCounts();
    const server = serverWithRoutes({ counts, now: () => clock });
    const get = async () => expect((await server.inject({ method: "GET", url: "/api/v1/echo-guild", headers })).statusCode).toBe(200);
    await get();
    await get();
    expect(counts).toMatchObject({ sessions: 1, accounts: 1, memberships: 1 });
    clock += 10_001;
    await get();
    expect(counts).toMatchObject({ sessions: 2, accounts: 1, memberships: 1 });
    clock += 20_000;
    await get();
    expect(counts).toMatchObject({ sessions: 3, accounts: 1, memberships: 2 });
    clock += 30_000;
    await get();
    expect(counts).toMatchObject({ sessions: 4, accounts: 2, memberships: 3 });
    await server.close();
  });

  it("verifies a CSRF pair once for repeated changes and never caches a failed check", async () => {
    const counts = newCounts();
    // Cached verifications never outlive the session's idle expiry, so the clock sits inside the fixture session.
    const server = serverWithRoutes({ counts, now: () => Date.parse("2026-08-01T00:00:00.000Z") });
    const csrfHeaders = { ...csrf, cookie: `${csrf.cookie}; qbox_guild=1257928923048837201` };
    for (let index = 0; index < 2; index += 1) {
      const response = await server.inject({ method: "POST", url: "/api/v1/guilds/clear", headers: csrfHeaders, payload: {} });
      expect(response.statusCode).toBe(200);
    }
    expect(counts.csrf).toBe(1);
    await server.close();
  });

  it("forgets the session at logout so the next request checks the database again", async () => {
    const counts = newCounts();
    const server = serverWithRoutes({ counts, now: () => Date.parse("2026-08-01T00:00:00.000Z") });
    await server.inject({ method: "GET", url: "/api/v1/echo-guild", headers });
    await server.inject({ method: "GET", url: "/api/v1/echo-guild", headers });
    expect(counts.sessions).toBe(1);
    const logout = await server.inject({ method: "POST", url: "/auth/logout", headers: { ...csrf, "content-type": "application/json" }, payload: {} });
    expect(logout.statusCode).toBe(200);
    await server.inject({ method: "GET", url: "/api/v1/echo-guild", headers });
    expect(counts.sessions).toBe(2);
    await server.close();
  });

  it("stores a fresh membership check and reuses the guild row for later checks", async () => {
    const counts = newCounts();
    const server = serverWithRoutes({ counts });
    for (let index = 0; index < 2; index += 1) {
      const selected = await server.inject({ method: "POST", url: "/api/v1/guilds/select", headers: csrf, payload: { guildId: DEFAULT_GUILD } });
      expect(selected.statusCode).toBe(200);
    }
    expect(counts.guildRows).toBe(1);
    const readsBefore = counts.memberships;
    const response = await server.inject({ method: "GET", url: "/api/v1/echo-guild", headers });
    expect(response.statusCode).toBe(200);
    expect(counts.memberships).toBe(readsBefore);
    await server.close();
  });

  it("does not look up the current server for portal files", async () => {
    const directory = mkdtempSync(join(tmpdir(), "qbox-portal-"));
    writeFileSync(join(directory, "index.html"), "<!doctype html><title>Qbox portal</title>");
    try {
      const counts = newCounts();
      const server = serverWithRoutes({ counts, portalDirectory: directory });
      const page = await server.inject({ method: "GET", url: "/tickets", headers });
      expect(page.statusCode).toBe(200);
      expect(counts).toMatchObject({ sessions: 0, accounts: 0, memberships: 0 });
      await server.close();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

describe("chooseStartingGuild", () => {
  const guild = (id: string, name: string, owner: boolean, canManage: boolean) => ({ id, name, icon: null, owner, canManage });
  it("prefers the default when managed, then owned, then managed, then the default, then a single server", () => {
    expect(chooseStartingGuild([guild("1", "B", true, true), guild("2", "A", false, true)], "2")).toBe("2");
    expect(chooseStartingGuild([guild("1", "B", false, true), guild("2", "A", true, true), guild("3", "C", false, false)], "3")).toBe("2");
    expect(chooseStartingGuild([guild("1", "B", false, true), guild("2", "A", false, true)], undefined)).toBe("2");
    expect(chooseStartingGuild([guild("1", "B", false, false), guild("2", "A", false, false)], "1")).toBe("1");
    expect(chooseStartingGuild([guild("1", "B", false, false)], undefined)).toBe("1");
    expect(chooseStartingGuild([guild("1", "B", false, false), guild("2", "A", false, false)], undefined)).toBeUndefined();
    expect(chooseStartingGuild([], "9")).toBeUndefined();
  });
});
