import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  authenticationDigest,
  browserSessionId,
  createPlatformUserActor,
  createUnauthenticatedActor,
  discordGuildId,
  discordRoleId,
  discordUserId,
  externalIdentityId,
  opaqueAuthenticationSecret,
  platformUserId,
} from "../src/index.js";

describe("authentication identifiers", () => {
  it("accepts canonical UUIDs and Discord snowflakes", () => {
    expect(platformUserId(randomUUID())).toHaveLength(36);
    expect(externalIdentityId(randomUUID())).toHaveLength(36);
    expect(browserSessionId(randomUUID())).toHaveLength(36);
    expect(discordUserId("804859666655739996")).toBe("804859666655739996");
    expect(discordGuildId("1257928923048837201")).toBe("1257928923048837201");
    expect(discordRoleId("1262656532902842423")).toBe("1262656532902842423");
  });

  it.each([
    "",
    "NOT-A-UUID",
    "550E8400-E29B-41D4-A716-446655440000",
    "550e8400-e29b-41d4-0716-446655440000",
  ])("rejects invalid internal identifier %j", (value) => {
    expect(() => platformUserId(value)).toThrow(/canonical lowercase UUID/);
  });

  it.each(["123", "01234567890123456", "1234567890123456x", "1".repeat(21)])(
    "rejects invalid Discord snowflake %j",
    (value) => expect(() => discordUserId(value)).toThrow(/Discord snowflakes/),
  );

  it("requires canonical HMAC digests and bounded opaque secrets", () => {
    expect(authenticationDigest("a".repeat(64))).toHaveLength(64);
    expect(() => authenticationDigest("A".repeat(64))).toThrow(/lowercase/);
    expect(opaqueAuthenticationSecret("x".repeat(32))).toHaveLength(32);
    expect(() => opaqueAuthenticationSecret("short")).toThrow(/bounded/);
  });
});

describe("authentication actors", () => {
  it("creates immutable actors containing only trusted internal metadata", () => {
    const actor = createPlatformUserActor({
      platformUserId: platformUserId(randomUUID()),
      sessionId: browserSessionId(randomUUID()),
      loginIdentityId: externalIdentityId(randomUUID()),
      authenticationRevision: 1,
      authenticatedAt: new Date(),
    });
    expect(Object.isFrozen(actor)).toBe(true);
    expect(Object.isFrozen(actor.authentication)).toBe(true);
    expect(actor.authentication.authenticatedAt).toBeTypeOf("string");
    expect(actor).not.toHaveProperty("token");
    expect(actor).not.toHaveProperty("permissions");
    expect(actor).not.toHaveProperty("username");
  });

  it("creates an unauthenticated actor without implied authority", () => {
    expect(createUnauthenticatedActor()).toEqual({ type: "unauthenticated" });
  });

  it("rejects invalid actor authentication revisions", () => {
    expect(() =>
      createPlatformUserActor({
        platformUserId: platformUserId(randomUUID()),
        sessionId: browserSessionId(randomUUID()),
        loginIdentityId: externalIdentityId(randomUUID()),
        authenticationRevision: 0,
        authenticatedAt: new Date(),
      }),
    ).toThrow(/positive integer/);
  });
});
