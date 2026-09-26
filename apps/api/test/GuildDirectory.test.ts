import { describe, expect, it } from "vitest";
import {
  AuthenticationServiceError,
  authenticationCorrelationId,
  externalIdentityId,
  opaqueAuthenticationSecret,
  platformUserId,
  type ExternalIdentity,
} from "@qbox/authentication";

import {
  DiscordGuildDirectory,
  DiscordRestBotGuildSource,
  type DiscordGuildDirectoryDependencies,
  type DiscordUserGuild,
} from "../src/auth/GuildDirectory.js";

const ADMINISTRATOR = String(1n << 3n);
const MANAGE_GUILD = String(1n << 5n);
const VIEW_CHANNEL = String(1n << 10n);

const memberGuilds: readonly DiscordUserGuild[] = [
  { id: "1300000000000000001", name: "Owned", icon: "a", owner: true, permissions: VIEW_CHANNEL },
  { id: "1300000000000000002", name: "Admin", icon: null, owner: false, permissions: ADMINISTRATOR },
  { id: "1300000000000000003", name: "Manager", icon: null, owner: false, permissions: MANAGE_GUILD },
  { id: "1300000000000000004", name: "Plain", icon: null, owner: false, permissions: VIEW_CHANNEL },
  { id: "1300000000000000005", name: "Without bot", icon: null, owner: true, permissions: VIEW_CHANNEL },
];

const botGuilds = [
  { id: "1300000000000000001", name: "Owned (bot name)", icon: "bot-icon" },
  { id: "1300000000000000002", name: "Admin", icon: null },
  { id: "1300000000000000003", name: "Manager", icon: null },
  { id: "1300000000000000004", name: "Plain", icon: null },
  { id: "1300000000000000009", name: "Bot only", icon: null },
];

const identity: ExternalIdentity = {
  id: externalIdentityId("33333333-3333-4333-8333-333333333333"),
  platformUserId: platformUserId("22222222-2222-4222-8222-222222222222"),
  provider: "DISCORD",
  providerSubjectId: "804859666655739996",
  profile: { username: "qbox" },
  enabled: true,
  linkedAt: new Date("2026-08-01T00:00:00.000Z"),
  verifiedAt: new Date("2026-08-01T00:00:00.000Z"),
  createdAt: new Date("2026-08-01T00:00:00.000Z"),
  updatedAt: new Date("2026-08-01T00:00:00.000Z"),
} as ExternalIdentity;

const context = { correlationId: authenticationCorrelationId("11111111-1111-4111-8111-111111111111") };
const signal = new AbortController().signal;

function dependencies(overrides: Partial<DiscordGuildDirectoryDependencies> & { readonly scopes?: readonly string[]; readonly calls?: string[] } = {}): DiscordGuildDirectoryDependencies {
  const scopes = overrides.scopes ?? ["guilds", "guilds.members.read", "identify"];
  return {
    credentials: {
      loadUsableAccessCredential: async () => {
        overrides.calls?.push("credential");
        return { accessToken: opaqueAuthenticationSecret("access-" + "x".repeat(32)) };
      },
    },
    unitOfWork: {
      run: async (operation) =>
        operation({
          oauthCredentials: { findByExternalIdentity: async () => ({ scopes, revokedAt: undefined }) },
        } as never),
    },
    provider: {
      fetchGuilds: async () => {
        overrides.calls?.push("member-guilds");
        return memberGuilds;
      },
    },
    bot: { listGuilds: async () => botGuilds },
    ...overrides,
  };
}

describe("DiscordGuildDirectory", () => {
  it("lists the servers the member and the bot share with Discord-derived canManage", async () => {
    const directory = new DiscordGuildDirectory(dependencies());
    const listing = await directory.list(identity, context, signal);
    expect(listing.reauthRequired).toBe(false);
    expect(listing.guilds).toEqual([
      { id: "1300000000000000002", name: "Admin", icon: null, owner: false, canManage: true },
      { id: "1300000000000000003", name: "Manager", icon: null, owner: false, canManage: true },
      { id: "1300000000000000001", name: "Owned (bot name)", icon: "bot-icon", owner: true, canManage: true },
      { id: "1300000000000000004", name: "Plain", icon: null, owner: false, canManage: false },
    ]);
  });

  it("adds servers where the member holds a Qbox permission", async () => {
    const directory = new DiscordGuildDirectory(
      dependencies({ qboxAccess: async (_identity, guildId) => guildId === "1300000000000000004" }),
    );
    const listing = await directory.list(identity, context, signal);
    expect(listing.guilds.find((guild) => guild.id === "1300000000000000004")?.canManage).toBe(true);
  });

  it("reads the bot's servers while the member's are still loading", async () => {
    let botStarted = false;
    let botStartedBeforeMember = false;
    const directory = new DiscordGuildDirectory(
      dependencies({
        provider: {
          fetchGuilds: async () => {
            botStartedBeforeMember = botStarted;
            return memberGuilds;
          },
        },
        bot: {
          listGuilds: async () => {
            botStarted = true;
            return botGuilds;
          },
        },
      }),
    );
    expect((await directory.list(identity, context, signal)).guilds).toHaveLength(4);
    expect(botStartedBeforeMember).toBe(true);
  });

  it("caches per identity for a minute and re-reads on refresh", async () => {
    const calls: string[] = [];
    let now = 0;
    const directory = new DiscordGuildDirectory(dependencies({ calls, now: () => now, ttlMs: 60_000 }));
    await directory.list(identity, context, signal);
    await directory.list(identity, context, signal);
    expect(calls.filter((call) => call === "member-guilds")).toHaveLength(1);
    await directory.list(identity, context, signal, { refresh: true });
    expect(calls.filter((call) => call === "member-guilds")).toHaveLength(2);
    now = 60_000;
    await directory.list(identity, context, signal);
    expect(calls.filter((call) => call === "member-guilds")).toHaveLength(3);
    directory.forget(identity.id);
    await directory.list(identity, context, signal);
    expect(calls.filter((call) => call === "member-guilds")).toHaveLength(4);
  });

  it("asks for a new sign-in when the stored grant predates the guilds scope", async () => {
    const calls: string[] = [];
    const directory = new DiscordGuildDirectory(dependencies({ calls, scopes: ["guilds.members.read", "identify"] }));
    expect(await directory.list(identity, context, signal)).toEqual({ guilds: [], reauthRequired: true });
    expect(calls).toEqual([]);
  });

  it("asks for a new sign-in when Discord rejects the token or no credential exists", async () => {
    const rejected = new DiscordGuildDirectory(
      dependencies({
        provider: {
          fetchGuilds: async () => {
            throw Object.freeze({ code: "MISSING_REQUIRED_SCOPE", retryable: false, operation: "token.refresh" });
          },
        },
      }),
    );
    expect(await rejected.list(identity, context, signal)).toMatchObject({ reauthRequired: true });
    const missing = new DiscordGuildDirectory(
      dependencies({
        credentials: {
          loadUsableAccessCredential: async () => {
            throw new AuthenticationServiceError("identity-unavailable", "The OAuth credential is unavailable.");
          },
        },
      }),
    );
    expect(await missing.list(identity, context, signal)).toMatchObject({ reauthRequired: true });
  });

  it("propagates outages instead of reporting an empty list", async () => {
    const directory = new DiscordGuildDirectory(
      dependencies({
        provider: {
          fetchGuilds: async () => {
            throw Object.freeze({ code: "PROVIDER_UNAVAILABLE", retryable: true });
          },
        },
      }),
    );
    await expect(directory.list(identity, context, signal)).rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
  });

  it("offers only the default server when the bot token is not configured", async () => {
    const directory = new DiscordGuildDirectory(dependencies({ bot: undefined, defaultGuildId: "1300000000000000005" }));
    const listing = await directory.list(identity, context, signal);
    expect(listing.guilds).toEqual([
      { id: "1300000000000000005", name: "Without bot", icon: null, owner: true, canManage: true },
    ]);
    const none = new DiscordGuildDirectory(dependencies({ bot: undefined }));
    expect((await none.list(identity, context, signal)).guilds).toEqual([]);
  });
});

describe("DiscordRestBotGuildSource", () => {
  it("pages through the bot's servers with `after` and caches the result", async () => {
    const routes: string[] = [];
    const page = (start: number, count: number) =>
      Array.from({ length: count }, (_, index) => ({ id: String(1300000000000000000n + BigInt(start + index)), name: `Server ${start + index}`, icon: null }));
    const rest = {
      get: async (route: string) => {
        routes.push(route);
        return route.includes("after=") ? page(200, 5) : page(0, 200);
      },
    };
    let now = 0;
    const source = new DiscordRestBotGuildSource(rest as never, { ttlMs: 60_000, now: () => now });
    const guilds = await source.listGuilds();
    expect(guilds).toHaveLength(205);
    expect(routes).toEqual([
      "/users/@me/guilds?limit=200",
      "/users/@me/guilds?limit=200&after=1300000000000000199",
    ]);
    await source.listGuilds();
    expect(routes).toHaveLength(2);
    now = 60_000;
    await source.listGuilds();
    expect(routes).toHaveLength(4);
  });

  it("keeps the last good list when Discord fails", async () => {
    let fail = false;
    const rest = {
      get: async () => {
        if (fail) throw new Error("Discord unavailable");
        return [{ id: "1300000000000000001", name: "Alpha", icon: null }];
      },
    };
    let now = 0;
    const source = new DiscordRestBotGuildSource(rest as never, { ttlMs: 1_000, now: () => now });
    expect(await source.listGuilds()).toHaveLength(1);
    fail = true;
    now = 5_000;
    expect(await source.listGuilds()).toHaveLength(1);
    const cold = new DiscordRestBotGuildSource(rest as never);
    await expect(cold.listGuilds()).rejects.toThrow("Discord unavailable");
  });
});
