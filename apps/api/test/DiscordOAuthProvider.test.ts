import { describe, expect, it } from "vitest";

import {
  opaqueAuthenticationSecret,
  discordGuildId,
  type DiscordUserId,
} from "@qbox/authentication";

import {
  createS256PkceChallenge,
  type DiscordOAuthFetch,
  DiscordOAuthConfiguration,
  NativeDiscordOAuthProvider,
} from "../src/index.js";

const base = Object.freeze({
  environment: "test" as const,
  clientId: "1432071570645455029",
  clientSecret: "test-client-secret",
  redirectUri: "http://127.0.0.1:3000/auth/discord/callback",
  guildId: "1257928923048837201",
});

describe("DiscordOAuthConfiguration", () => {
  it("validates exact provider policy and redacts secrets from diagnostics", () => {
    const configuration = DiscordOAuthConfiguration.from(base);
    expect(configuration.scopes).toEqual(["guilds.members.read", "identify"]);
    expect(configuration.diagnostics()).toMatchObject({
      clientId: base.clientId,
      redirectOrigin: "http://127.0.0.1:3000",
      redirectPath: "/auth/discord/callback",
      pkceCapability: "DISABLED_UNVERIFIED",
      guildId: base.guildId,
    });
    expect(JSON.stringify(configuration.diagnostics())).not.toContain(base.clientSecret);
  });

  it("requires HTTPS redirects in production and loopback for HTTP test redirects", () => {
    expect(() =>
      DiscordOAuthConfiguration.from({
        ...base,
        environment: "production",
      }),
    ).toThrow();
    expect(() =>
      DiscordOAuthConfiguration.from({
        ...base,
        redirectUri: "http://example.com/auth/discord/callback",
      }),
    ).toThrow();
  });
});

describe("NativeDiscordOAuthProvider", () => {
  it("creates authorization URLs with state and without PKCE by default", () => {
    const provider = new NativeDiscordOAuthProvider(DiscordOAuthConfiguration.from(base), unusedFetch);
    const url = provider.createAuthorizationUrl({
      state: opaqueAuthenticationSecret("state-" + "x".repeat(32)),
    });
    expect(url.origin).toBe("https://discord.com");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe(base.clientId);
    expect(url.searchParams.get("scope")).toBe("guilds.members.read identify");
    expect(url.searchParams.get("state")).toBe("state-" + "x".repeat(32));
    expect(url.searchParams.has("code_challenge")).toBe(false);
  });

  it("requires explicit S256 verification before emitting PKCE parameters", () => {
    const verifier = opaqueAuthenticationSecret("verifier-" + "x".repeat(32));
    const provider = new NativeDiscordOAuthProvider(
      DiscordOAuthConfiguration.from({ ...base, pkceCapability: "S256_VERIFIED" }),
      unusedFetch,
    );
    const url = provider.createAuthorizationUrl({
      state: opaqueAuthenticationSecret("state-" + "x".repeat(32)),
      pkceChallenge: createS256PkceChallenge(verifier),
    });
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toBe(createS256PkceChallenge(verifier));
    expect(() =>
      new NativeDiscordOAuthProvider(DiscordOAuthConfiguration.from(base), unusedFetch)
        .createAuthorizationUrl({
          state: opaqueAuthenticationSecret("state-" + "x".repeat(32)),
          pkceChallenge: "challenge",
        }),
    ).toThrow();
  });

  it("exchanges authorization codes with form encoding and validates token responses", async () => {
    const requests: RequestInit[] = [];
    const provider = new NativeDiscordOAuthProvider(
      DiscordOAuthConfiguration.from(base),
      async (_url, init) => {
        requests.push(init);
        return json({
          access_token: "access-" + "x".repeat(32),
          refresh_token: "refresh-" + "x".repeat(32),
          token_type: "Bearer",
          expires_in: 3600,
          scope: "identify guilds.members.read",
        });
      },
    );
    await expect(
      provider.exchangeCode({
        authorizationCode: opaqueAuthenticationSecret("code-" + "x".repeat(32)),
        redirectUri: new URL(base.redirectUri),
        signal: new AbortController().signal,
      }),
    ).resolves.toMatchObject({ scopes: ["guilds.members.read", "identify"] });
    expect(String(requests[0]?.body)).toContain("grant_type=authorization_code");
    expect(requests[0]?.headers).toMatchObject({
      "content-type": "application/x-www-form-urlencoded",
    });
    expect(JSON.stringify(requests)).not.toContain(base.clientSecret);
  });

  it("rejects redirects, malformed responses, and scope mismatches", async () => {
    const configuration = DiscordOAuthConfiguration.from(base);
    await expect(
      new NativeDiscordOAuthProvider(configuration, async () =>
        new Response(null, { status: 302, headers: { location: "https://example.com" } }),
      ).fetchIdentity(opaqueAuthenticationSecret("access-" + "x".repeat(32)), new AbortController().signal),
    ).rejects.toMatchObject({ code: "MALFORMED_PROVIDER_RESPONSE" });
    await expect(
      new NativeDiscordOAuthProvider(configuration, async () =>
        json({
          access_token: "access-" + "x".repeat(32),
          refresh_token: "refresh-" + "x".repeat(32),
          token_type: "Bearer",
          expires_in: 3600,
          scope: "identify",
        }),
      ).refreshToken({
        refreshToken: opaqueAuthenticationSecret("refresh-" + "x".repeat(32)),
        signal: new AbortController().signal,
      }),
    ).rejects.toMatchObject({ code: "MISSING_REQUIRED_SCOPE" });
  });

  it("parses identity and membership without using display names as identity keys", async () => {
    const provider = new NativeDiscordOAuthProvider(
      DiscordOAuthConfiguration.from(base),
      async (url) => {
        const value = String(url);
        if (value.endsWith("/users/@me"))
          return json({ id: "804859666655739996", username: "name", global_name: "Global", avatar: null });
        return json({ user: { id: "804859666655739996" }, roles: ["1262656532902842423", "1262656532902842423"] });
      },
    );
    const accessToken = opaqueAuthenticationSecret("access-" + "x".repeat(32));
    const identity = await provider.fetchIdentity(accessToken, new AbortController().signal);
    expect(identity).toEqual({
      userId: "804859666655739996",
      username: "name",
      globalName: "Global",
    });
    await expect(
      provider.verify({
        identity,
        accessToken,
        guildId: "1257928923048837201",
        signal: new AbortController().signal,
      }),
    ).resolves.toMatchObject({
      status: "PRESENT",
      roleIds: ["1262656532902842423"],
    });
  });

  it("maps not-member and pending membership without fabricating authorization", async () => {
    const configuration = DiscordOAuthConfiguration.from(base);
    const absent = new NativeDiscordOAuthProvider(configuration, async () =>
      new Response("{}", { status: 404, headers: { "content-type": "application/json" } }),
    );
    const identity = { userId: "804859666655739996" as DiscordUserId };
    await expect(
      absent.verify({
        identity,
        accessToken: opaqueAuthenticationSecret("access-" + "x".repeat(32)),
        guildId: discordGuildId("1257928923048837201"),
        signal: new AbortController().signal,
      }),
    ).resolves.toMatchObject({ status: "ABSENT", roleIds: [] });

    const pending = new NativeDiscordOAuthProvider(configuration, async () =>
      json({ user: { id: "804859666655739996" }, roles: ["1262656532902842423"], pending: true }),
    );
    await expect(
      pending.verify({
        identity,
        accessToken: opaqueAuthenticationSecret("access-" + "x".repeat(32)),
        guildId: discordGuildId("1257928923048837201"),
        signal: new AbortController().signal,
      }),
    ).resolves.toMatchObject({ status: "UNKNOWN", roleIds: [] });
  });
});

const unusedFetch: DiscordOAuthFetch = async () => {
  throw new Error("unexpected fetch");
};

function json(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
