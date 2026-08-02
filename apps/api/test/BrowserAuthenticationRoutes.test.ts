import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import {
  authenticationCorrelationId,
  browserSessionId,
  externalIdentityId,
  opaqueAuthenticationSecret,
  platformUserId,
} from "@qbox/authentication";
import { ApiAuthenticationConfiguration } from "../src/auth/ApiAuthenticationConfiguration.js";
import { registerBrowserAuthenticationRoutes } from "../src/auth/BrowserAuthenticationRoutes.js";
import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import type { ApiLogger } from "../src/logging/ApiLogger.js";

const logger: ApiLogger = {
  child: () => logger,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

describe("browser authentication routes", () => {
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
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/me",
      headers: { host: "127.0.0.1:3000", cookie: "qbox_session=session-secret-value-000000000000000000" },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.account.discordUserId).toBe("804859666655739996");
    expect(body.membership.roleIds).toEqual(["1262656532902842423"]);
    expect(JSON.stringify(body)).not.toContain("session-secret-value");
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

function serverWithRoutes(options: { readonly adminAllowed?: boolean; readonly roleMenuAllowed?: boolean } = {}) {
  const auth = authenticationConfiguration();
  return createApiServer({
    configuration: ApiConfiguration.from({
      environment: "test",
      publicBaseUrl: "http://127.0.0.1:3000",
    }),
    logger,
    registerRoutes: (instance) =>
      registerBrowserAuthenticationRoutes(instance, {
        configuration: auth,
        provider: fakeProvider(),
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
        sessions: {
          verifySession: async () => verifiedSession(),
          verifySessionCsrf: async () => verifiedSession(),
          createSession: async () => ({
            session: verifiedSession().session,
            sessionSecret: opaqueAuthenticationSecret("session-secret-value-000000000000000000"),
            csrfSecret: opaqueAuthenticationSecret("csrf-secret-value-000000000000000000000"),
          }),
          revokeCurrentSession: async () => undefined,
        } as never,
        memberships: {
          verifyCurrentMembership: async () => membership(),
        } as never,
        guilds: {
          findByDiscordId: async () => ({ id: "44444444-4444-4444-8444-444444444444", discordGuildId: "1257928923048837201", enabled: true, metadata: {}, createdAt: new Date(), updatedAt: new Date() }),
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
              externalIdentities: { findById: async () => externalIdentity() },
              guildMemberships: { find: async () => membership() },
          } as never),
        },
        roleMenus: {
          listByGuild: async () => [{ id: "menu-1", title: "Community Roles", status: "PUBLISHED" }],
        } as never,
        logger,
      }),
  });
}

function authenticationConfiguration() {
  const key = Buffer.alloc(32, 7).toString("base64url");
  return ApiAuthenticationConfiguration.from({
    environment: "test",
    publicBaseUrl: "http://127.0.0.1:3000",
    discordClientId: "1432071570645455029",
    discordClientSecret: "test-client-secret",
    discordRedirectUri: "http://127.0.0.1:3000/auth/discord/callback",
    discordGuildId: "1257928923048837201",
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
      scopes: ["guilds.members.read", "identify"],
      expiresAt: new Date("2026-08-01T01:00:00.000Z"),
    }),
    refreshToken: async () => {
      throw new Error("not-used");
    },
    revokeCredential: async () => ({ attempted: true, succeeded: true }),
    inspectAuthorization: async () => ({
      applicationId: "1432071570645455029",
      scopes: ["guilds.members.read", "identify"],
    }),
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
