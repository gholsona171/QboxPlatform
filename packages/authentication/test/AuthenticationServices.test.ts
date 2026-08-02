import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  AuthenticationServiceError,
  BrowserSessionService,
  MetadataHashingService,
  OAuthTransactionService,
  authenticationCorrelationId,
  opaqueAuthenticationSecret,
} from "../src/index.js";
import { BASE_TIME, externalIdentity, platformUser } from "./fixtures.js";
import {
  FakeCrypto,
  FakeIds,
  FakeKeys,
  FixedClock,
  MemoryUnitOfWork,
  memoryState,
} from "./serviceFixtures.js";

function setup(policy: { maximumActiveSessions?: number } = {}) {
  const state = memoryState();
  const user = platformUser();
  const identity = externalIdentity();
  state.users.set(user.id, user);
  state.identities.set(identity.id, identity);
  const unitOfWork = new MemoryUnitOfWork(state);
  const clock = new FixedClock(BASE_TIME);
  const crypto = new FakeCrypto();
  const keys = new FakeKeys();
  const ids = new FakeIds();
  const metadata = new MetadataHashingService(crypto, keys);
  const sessions = new BrowserSessionService({
    unitOfWork,
    clock,
    crypto,
    keys,
    ids,
    metadata,
    policy,
    touchIntervalMs: 0,
  });
  const oauth = new OAuthTransactionService({
    unitOfWork,
    clock,
    crypto,
    keys,
    ids,
    claimLeaseMs: 60_000,
  });
  return { state, user, identity, unitOfWork, clock, crypto, keys, ids, metadata, sessions, oauth };
}

function context() {
  return { correlationId: authenticationCorrelationId(randomUUID()) };
}

describe("browser session lifecycle service", () => {
  it("creates digest-only state and returns independent ephemeral secrets", async () => {
    const fixture = setup();
    const issued = await fixture.sessions.createSession({
      platformUserId: fixture.user.id,
      loginIdentityId: fixture.identity.id,
      context: context(),
      clientMetadata: {
        clientIp: "127.0.0.1",
        userAgent: "test-agent",
        device: "test-device",
      },
    });
    const persisted = fixture.state.sessions.get(issued.session.id)!;
    expect(issued.sessionSecret).not.toBe(issued.csrfSecret);
    expect(persisted.tokenDigest).not.toContain(issued.sessionSecret);
    expect(persisted.csrfDigest).not.toContain(issued.csrfSecret);
    expect(persisted.metadataKeyVersion).toBe(1);
    expect(fixture.state.audits.size).toBe(1);
  });

  it("verifies an active session into an immutable trusted actor", async () => {
    const fixture = setup();
    const issued = await fixture.sessions.createSession({
      platformUserId: fixture.user.id,
      loginIdentityId: fixture.identity.id,
      context: context(),
    });
    const verified = await fixture.sessions.verifySession(issued.sessionSecret);
    expect(verified.actor).toMatchObject({
      type: "platform-user",
      platformUserId: fixture.user.id,
    });
    expect(Object.isFrozen(verified.actor)).toBe(true);
    expect(JSON.stringify(verified)).not.toContain(issued.sessionSecret);
  });

  it("rejects idle expiry, absolute expiry, revision mismatch, disabled account, and unlinked identity", async () => {
    const cases = [
      (fixture: ReturnType<typeof setup>) => {
        fixture.clock.current = new Date(BASE_TIME.getTime() + 8 * 60 * 60_000 + 1);
      },
      (fixture: ReturnType<typeof setup>) => {
        fixture.clock.current = new Date(BASE_TIME.getTime() + 7 * 24 * 60 * 60_000 + 1);
      },
      (fixture: ReturnType<typeof setup>) => {
        fixture.state.users.set(fixture.user.id, {
          ...fixture.user,
          authenticationRevision: 2,
        });
      },
      (fixture: ReturnType<typeof setup>) => {
        fixture.state.users.set(fixture.user.id, {
          ...fixture.user,
          status: "DISABLED",
          disabledAt: BASE_TIME,
        });
      },
      (fixture: ReturnType<typeof setup>) => {
        fixture.state.identities.set(fixture.identity.id, {
          ...fixture.identity,
          enabled: false,
          unlinkedAt: BASE_TIME,
        });
      },
    ];
    for (const alter of cases) {
      const fixture = setup();
      const issued = await fixture.sessions.createSession({
        platformUserId: fixture.user.id,
        loginIdentityId: fixture.identity.id,
        context: context(),
      });
      alter(fixture);
      await expect(fixture.sessions.verifySession(issued.sessionSecret)).rejects.toBeInstanceOf(
        AuthenticationServiceError,
      );
    }
  });

  it("evicts the deterministic least-recently-used session at the active limit", async () => {
    const fixture = setup({ maximumActiveSessions: 2 });
    const first = await fixture.sessions.createSession({
      platformUserId: fixture.user.id,
      loginIdentityId: fixture.identity.id,
      context: context(),
    });
    fixture.clock.current = new Date(BASE_TIME.getTime() + 1_000);
    await fixture.sessions.createSession({
      platformUserId: fixture.user.id,
      loginIdentityId: fixture.identity.id,
      context: context(),
    });
    fixture.clock.current = new Date(BASE_TIME.getTime() + 2_000);
    await fixture.sessions.createSession({
      platformUserId: fixture.user.id,
      loginIdentityId: fixture.identity.id,
      context: context(),
    });
    expect(fixture.state.sessions.get(first.session.id)?.revocationReason).toBe(
      "SESSION_LIMIT",
    );
    expect(await fixture.sessions.listActiveSessions(fixture.user.id)).toHaveLength(2);
  });

  it("rotates atomically and rejects old secrets and concurrent double rotation", async () => {
    const fixture = setup();
    const issued = await fixture.sessions.createSession({
      platformUserId: fixture.user.id,
      loginIdentityId: fixture.identity.id,
      context: context(),
    });
    fixture.clock.current = new Date(BASE_TIME.getTime() + 1_000);
    const results = await Promise.allSettled([
      fixture.sessions.rotateSession(issued.sessionSecret, context()),
      fixture.sessions.rotateSession(issued.sessionSecret, context()),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rotated = results.find((result) => result.status === "fulfilled");
    if (!rotated || rotated.status !== "fulfilled") throw new Error("rotation missing");
    await expect(fixture.sessions.verifySession(issued.sessionSecret)).rejects.toBeInstanceOf(
      AuthenticationServiceError,
    );
    await expect(
      fixture.sessions.verifySession(rotated.value.sessionSecret),
    ).resolves.toMatchObject({ actor: { platformUserId: fixture.user.id } });
  });

  it("supports individual and global revocation with revision invalidation", async () => {
    const fixture = setup();
    const first = await fixture.sessions.createSession({
      platformUserId: fixture.user.id,
      loginIdentityId: fixture.identity.id,
      context: context(),
    });
    const second = await fixture.sessions.createSession({
      platformUserId: fixture.user.id,
      loginIdentityId: fixture.identity.id,
      context: context(),
    });
    await fixture.sessions.revokeSession(fixture.user.id, first.session.id, context());
    await expect(fixture.sessions.verifySession(first.sessionSecret)).rejects.toBeInstanceOf(
      AuthenticationServiceError,
    );
    await expect(fixture.sessions.revokeAllSessions(fixture.user.id, context())).resolves.toBe(1);
    await expect(fixture.sessions.verifySession(second.sessionSecret)).rejects.toBeInstanceOf(
      AuthenticationServiceError,
    );
    expect(fixture.state.users.get(fixture.user.id)?.authenticationRevision).toBe(2);
  });

  it("rolls back session creation when mandatory audit persistence fails", async () => {
    const fixture = setup();
    fixture.unitOfWork.failAudit = true;
    await expect(
      fixture.sessions.createSession({
        platformUserId: fixture.user.id,
        loginIdentityId: fixture.identity.id,
        context: context(),
      }),
    ).rejects.toThrow("audit-failed");
    expect(fixture.state.sessions.size).toBe(0);
  });

  it("hashes bounded metadata and rejects raw oversized values", async () => {
    const fixture = setup();
    const hashes = await fixture.metadata.hash({
      clientIp: "127.0.0.1",
      userAgent: "browser",
    });
    expect(hashes.ipHmac).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(hashes)).not.toContain("127.0.0.1");
    await expect(
      fixture.metadata.hash({ userAgent: "x".repeat(513) }),
    ).rejects.toBeInstanceOf(AuthenticationServiceError);
  });
});
describe("OAuth transaction lifecycle service", () => {
  it("creates independent state and binding secrets without provider calls", async () => {
    const fixture = setup();
    const issued = await fixture.oauth.createTransaction({
      purpose: "LOGIN",
      redirectKey: "web-login",
      returnTargetKey: "dashboard",
      context: context(),
    });
    expect(issued.state).not.toBe(issued.browserBinding);
    const persisted = fixture.state.transactions.get(issued.transactionId)!;
    expect(persisted.stateDigest).not.toContain(issued.state);
    expect(persisted.browserBindingDigest).not.toContain(issued.browserBinding);
  });

  it("claims, safely reclaims a stale lease, completes, and rejects terminal replay", async () => {
    const fixture = setup();
    const issued = await fixture.oauth.createTransaction({
      purpose: "LOGIN",
      redirectKey: "web-login",
      returnTargetKey: "dashboard",
      context: context(),
    });
    const claimed = await fixture.oauth.claimTransaction(
      issued.state,
      issued.browserBinding,
      context(),
    );
    expect(claimed.reclaimed).toBe(false);
    fixture.clock.current = new Date(BASE_TIME.getTime() + 60_001);
    const reclaimed = await fixture.oauth.claimTransaction(
      issued.state,
      issued.browserBinding,
      context(),
    );
    expect(reclaimed.reclaimed).toBe(true);
    await expect(
      fixture.oauth.completeTransaction(issued.transactionId, context()),
    ).resolves.toMatchObject({ state: "COMPLETED" });
    await expect(
      fixture.oauth.claimTransaction(issued.state, issued.browserBinding, context()),
    ).rejects.toMatchObject({ code: "oauth-transaction-terminal" });
  });

  it("rejects wrong browser binding without exposing either raw value", async () => {
    const fixture = setup();
    const issued = await fixture.oauth.createTransaction({
      purpose: "LOGIN",
      redirectKey: "web-login",
      returnTargetKey: "dashboard",
      context: context(),
    });
    const wrong = opaqueAuthenticationSecret("wrong-binding-" + "x".repeat(32));
    const error = await fixture.oauth
      .claimTransaction(issued.state, wrong, context())
      .catch((failure: unknown) => failure);
    expect(error).toMatchObject({ code: "oauth-browser-binding-invalid" });
    expect(String(error)).not.toContain(wrong);
    expect(String(error)).not.toContain(issued.state);
  });

  it("audits and rolls back terminal transition failures", async () => {
    const fixture = setup();
    const issued = await fixture.oauth.createTransaction({
      purpose: "LOGIN",
      redirectKey: "web-login",
      returnTargetKey: "dashboard",
      context: context(),
    });
    await fixture.oauth.claimTransaction(issued.state, issued.browserBinding, context());
    fixture.unitOfWork.failAudit = true;
    await expect(
      fixture.oauth.completeTransaction(issued.transactionId, context()),
    ).rejects.toThrow("audit-failed");
    expect(fixture.state.transactions.get(issued.transactionId)?.state).toBe("CLAIMED");
  });
});
