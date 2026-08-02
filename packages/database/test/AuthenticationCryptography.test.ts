import {
  authenticationDigest,
  opaqueAuthenticationSecret,
} from "@qbox/authentication";
import { describe, expect, it } from "vitest";

import {
  AuthenticationKeyRing,
  NodeAuthenticationIdGenerator,
} from "../src/index.js";

const keys = () =>
  new AuthenticationKeyRing([
    { purpose: "SESSION_HMAC", version: 2, material: new Uint8Array(32).fill(2), active: true },
    { purpose: "SESSION_HMAC", version: 1, material: new Uint8Array(32).fill(1), active: false },
    { purpose: "CSRF_HMAC", version: 1, material: new Uint8Array(32).fill(3), active: true },
    { purpose: "METADATA_HMAC", version: 1, material: new Uint8Array(32).fill(4), active: true },
    { purpose: "OAUTH_ENCRYPTION", version: 7, material: new Uint8Array(32).fill(5), active: true },
  ]);

describe("native authentication cryptography", () => {
  it("validates key registration and selects active plus bounded retained versions", async () => {
    const ring = keys();
    await expect(ring.active("SESSION_HMAC")).resolves.toMatchObject({ version: 2 });
    await expect(ring.byVersion("SESSION_HMAC", 1)).resolves.toMatchObject({ version: 1 });
    await expect(ring.verificationCandidates("SESSION_HMAC")).resolves.toEqual([
      expect.objectContaining({ version: 2 }),
      expect.objectContaining({ version: 1 }),
    ]);
    expect(JSON.stringify(ring.diagnostics())).not.toContain("material");
  });

  it("rejects invalid lengths, duplicate versions, missing active keys, and unknown versions", async () => {
    expect(
      () =>
        new AuthenticationKeyRing([
          { purpose: "SESSION_HMAC", version: 1, material: new Uint8Array(31), active: true },
        ]),
    ).toThrow("invalid length");
    expect(
      () =>
        new AuthenticationKeyRing([
          { purpose: "SESSION_HMAC", version: 1, material: new Uint8Array(32), active: true },
          { purpose: "SESSION_HMAC", version: 1, material: new Uint8Array(32), active: false },
        ]),
    ).toThrow("duplicated");
    expect(
      () =>
        new AuthenticationKeyRing([
          { purpose: "SESSION_HMAC", version: 1, material: new Uint8Array(32), active: false },
        ]),
    ).toThrow("one active key");
    await expect(keys().byVersion("SESSION_HMAC", 99)).resolves.toBeUndefined();
  });

  it("generates independent opaque secrets of at least 32 random bytes", async () => {
    const crypto = keys().createCrypto();
    const left = await crypto.createOpaqueSecret(32);
    const right = await crypto.createOpaqueSecret(32);
    expect(left).not.toBe(right);
    expect(left.length).toBeGreaterThanOrEqual(43);
    await expect(crypto.createOpaqueSecret(31)).rejects.toThrow("32");
  });

  it("produces deterministic lowercase HMACs with purpose separation", async () => {
    const ring = keys();
    const crypto = ring.createCrypto();
    const secret = opaqueAuthenticationSecret("x".repeat(43));
    const sessionKey = await ring.active("SESSION_HMAC");
    const csrfKey = await ring.active("CSRF_HMAC");
    const first = await crypto.hmac(secret, sessionKey);
    expect(await crypto.hmac(secret, sessionKey)).toBe(first);
    expect(await crypto.hmac(secret, csrfKey)).not.toBe(first);
    expect(first).toMatch(/^[0-9a-f]{64}$/);
    await expect(crypto.constantTimeEqual(first, first)).resolves.toBe(true);
    await expect(
      crypto.constantTimeEqual(first, authenticationDigest("f".repeat(64))),
    ).resolves.toBe(false);
  });

  it("round-trips AES-256-GCM with versioned AAD binding", async () => {
    const ring = keys();
    const crypto = ring.createCrypto();
    const key = await ring.active("OAUTH_ENCRYPTION");
    const plaintext = opaqueAuthenticationSecret("provider-token-" + "x".repeat(32));
    const encrypted = await crypto.encrypt(plaintext, key, "discord:identity:123");
    expect(encrypted.nonce).toHaveLength(12);
    expect(encrypted.authenticationTag).toHaveLength(16);
    expect(encrypted.keyVersion).toBe(7);
    await expect(
      crypto.decrypt(encrypted, key, "discord:identity:123"),
    ).resolves.toBe(plaintext);
  });

  it("fails closed for wrong AAD, nonce, tag, version, and malformed ciphertext", async () => {
    const ring = keys();
    const crypto = ring.createCrypto();
    const key = await ring.active("OAUTH_ENCRYPTION");
    const encrypted = await crypto.encrypt(
      opaqueAuthenticationSecret("provider-token-" + "x".repeat(32)),
      key,
      "correct-aad",
    );
    await expect(crypto.decrypt(encrypted, key, "wrong-aad")).rejects.toMatchObject({
      code: "cryptography-failed",
    });
    await expect(
      crypto.decrypt({ ...encrypted, nonce: new Uint8Array(11) }, key, "correct-aad"),
    ).rejects.toMatchObject({ code: "cryptography-failed" });
    const tag = new Uint8Array(encrypted.authenticationTag);
    tag[0] ^= 1;
    await expect(
      crypto.decrypt({ ...encrypted, authenticationTag: tag }, key, "correct-aad"),
    ).rejects.toMatchObject({ code: "cryptography-failed" });
    await expect(
      crypto.decrypt({ ...encrypted, keyVersion: 8 }, key, "correct-aad"),
    ).rejects.toMatchObject({ code: "cryptography-failed" });
    expect(JSON.stringify(encrypted)).not.toContain("provider-token");
  });

  it("generates canonical non-repeating service identifiers", () => {
    const ids = new NodeAuthenticationIdGenerator();
    expect(ids.browserSessionId()).toMatch(/^[0-9a-f-]{36}$/);
    expect(ids.oauthTransactionId()).not.toBe(ids.oauthTransactionId());
    expect(ids.authenticationAuditEventId()).not.toBe(
      ids.authenticationAuditEventId(),
    );
  });
});
