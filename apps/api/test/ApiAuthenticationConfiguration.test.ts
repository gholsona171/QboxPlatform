import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";

import { ApiAuthenticationConfiguration } from "../src/auth/ApiAuthenticationConfiguration.js";
import { apiConfigurationFromEnvironment } from "../src/main.js";

const key = Buffer.alloc(32, 7).toString("base64url");
const base = {
  environment: "test",
  publicBaseUrl: "http://127.0.0.1:3000",
  discordClientId: "1432071570645455029",
  discordClientSecret: "test-client-secret",
  discordRedirectUri: "http://127.0.0.1:3000/auth/discord/callback",
  sessionHmacKey: key,
  csrfHmacKey: key,
  metadataHmacKey: key,
  oauthEncryptionKey: key,
  keyVersion: "1",
} as const;

describe("ApiAuthenticationConfiguration", () => {
  it("treats DISCORD_GUILD_ID as an optional default server", () => {
    const withDefault = ApiAuthenticationConfiguration.from({ ...base, discordGuildId: "1257928923048837201" });
    expect(withDefault.diagnostics().defaultGuildId).toBe("1257928923048837201");
    expect(withDefault.defaultDiscordGuildId()).toBe("1257928923048837201");
    expect(withDefault.discord().defaultGuildId).toBe("1257928923048837201");

    const withoutDefault = ApiAuthenticationConfiguration.from(base);
    expect(withoutDefault.diagnostics().defaultGuildId).toBeUndefined();
    expect(withoutDefault.defaultDiscordGuildId()).toBeUndefined();
    expect(withoutDefault.discord().defaultGuildId).toBeUndefined();
    expect(withoutDefault.diagnostics().discord.scopes).toEqual(["guilds", "guilds.members.read", "identify"]);
  });

  it("still rejects a malformed default server", () => {
    expect(() => ApiAuthenticationConfiguration.from({ ...base, discordGuildId: "not-a-snowflake" })).toThrow(/discordGuildId/u);
  });

  it("keeps the redirect check without a default server", () => {
    expect(() =>
      ApiAuthenticationConfiguration.from({ ...base, discordRedirectUri: "http://127.0.0.1:3000/elsewhere" }),
    ).toThrow(/redirect URI/u);
  });

  it("does not need DISCORD_GUILD_ID in the process environment", () => {
    expect(apiConfigurationFromEnvironment({ NODE_ENV: "test", API_PUBLIC_BASE_URL: "http://127.0.0.1:3000" })).toMatchObject({
      environment: "test",
      publicBaseUrl: "http://127.0.0.1:3000",
    });
  });
});
