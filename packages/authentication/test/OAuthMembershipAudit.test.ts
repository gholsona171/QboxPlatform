import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  authenticationAuditEventId,
  authenticationCorrelationId,
  authenticationDigest,
  authenticationRequestId,
  cancelOAuthTransaction,
  claimOAuthTransaction,
  completeOAuthTransaction,
  expireOAuthTransaction,
  failOAuthTransaction,
  isAuthorizationPositiveMembership,
  validateAuthenticationAuditEvent,
  validateAuthenticationAuditMetadata,
  validateDiscordGuildMembership,
  validateOAuthCredential,
  validateOAuthTransaction,
  type AuthenticationAuditEvent,
} from "../src/index.js";
import {
  BASE_TIME,
  UUIDS,
  membership,
  oauthCredential,
  oauthTransaction,
} from "./fixtures.js";

describe("OAuth transaction state machine", () => {
  it("claims and completes one pending transaction", () => {
    const claimedAt = new Date(BASE_TIME.getTime() + 1_000);
    const claimed = claimOAuthTransaction(oauthTransaction(), claimedAt, 30_000);
    expect(claimed.state).toBe("CLAIMED");
    expect(claimed.claimExpiresAt).toEqual(
      new Date(claimedAt.getTime() + 30_000),
    );
    const completed = completeOAuthTransaction(
      claimed,
      new Date(claimedAt.getTime() + 1_000),
    );
    expect(completed.state).toBe("COMPLETED");
    expect(() => claimOAuthTransaction(completed, claimedAt, 30_000)).toThrow(
      /terminal/i,
    );
  });

  it("rejects concurrent claims while the lease remains active", () => {
    const now = new Date(BASE_TIME.getTime() + 1_000);
    const claimed = claimOAuthTransaction(oauthTransaction(), now, 30_000);
    expect(() =>
      claimOAuthTransaction(claimed, new Date(now.getTime() + 1_000), 30_000),
    ).toThrow(/active claim/);
  });

  it("allows safe reclaim only after a claim lease expires", () => {
    const firstClaim = claimOAuthTransaction(
      oauthTransaction(),
      new Date(BASE_TIME.getTime() + 1_000),
      1_000,
    );
    const reclaimedAt = new Date(BASE_TIME.getTime() + 2_000);
    const reclaimed = claimOAuthTransaction(firstClaim, reclaimedAt, 2_000);
    expect(reclaimed.claimedAt).toEqual(reclaimedAt);
    expect(reclaimed.claimExpiresAt).toEqual(
      new Date(reclaimedAt.getTime() + 2_000),
    );
  });

  it("rejects claims after absolute expiry", () => {
    const transaction = oauthTransaction();
    expect(() =>
      claimOAuthTransaction(transaction, transaction.expiresAt, 30_000),
    ).toThrow(/expired/);
  });

  it("supports claimed failure and active cancellation", () => {
    const claimed = claimOAuthTransaction(
      oauthTransaction(),
      new Date(BASE_TIME.getTime() + 1_000),
      30_000,
    );
    expect(
      failOAuthTransaction(
        claimed,
        "PROVIDER_REJECTED",
        new Date(BASE_TIME.getTime() + 2_000),
      ).state,
    ).toBe("FAILED");
    expect(
      cancelOAuthTransaction(
        oauthTransaction(),
        new Date(BASE_TIME.getTime() + 1_000),
      ).state,
    ).toBe("CANCELLED");
  });

  it("expires only active transactions at their deadline", () => {
    const transaction = oauthTransaction();
    expect(() =>
      expireOAuthTransaction(
        transaction,
        new Date(transaction.expiresAt.getTime() - 1),
      ),
    ).toThrow(/before expiresAt/);
    expect(expireOAuthTransaction(transaction, transaction.expiresAt).state).toBe(
      "EXPIRED",
    );
  });

  it("requires account/session binding for link and reauthentication", () => {
    expect(() =>
      validateOAuthTransaction(oauthTransaction({ purpose: "LINK" })),
    ).toThrow(/require a verified account/);
    expect(
      validateOAuthTransaction(
        oauthTransaction({
          purpose: "LINK",
          platformUserId: UUIDS.platformUser,
          initiatingSessionId: UUIDS.session,
        }),
      ),
    ).toBeDefined();
  });

  it("rejects inconsistent terminal timestamps", () => {
    expect(() =>
      validateOAuthTransaction(
        oauthTransaction({ state: "COMPLETED", completedAt: BASE_TIME }),
      ),
    ).toThrow(/Completed/);
  });
});

describe("encrypted OAuth credentials", () => {
  it("accepts only encrypted envelopes and normalized scopes", () => {
    expect(validateOAuthCredential(oauthCredential())).toBeDefined();
    expect(() =>
      validateOAuthCredential(oauthCredential({ scopes: ["identify", "email"] })),
    ).toThrow(/unique, sorted/);
    expect(() =>
      validateOAuthCredential(oauthCredential({ refreshVersion: 0 })),
    ).toThrow(/positive/);
  });

  it("requires consistent revocation metadata", () => {
    expect(() =>
      validateOAuthCredential(oauthCredential({ revokedAt: BASE_TIME })),
    ).toThrow(/stored together/);
  });
});

describe("Discord membership snapshots", () => {
  it("treats only fresh PRESENT membership as authorization-positive", () => {
    const snapshot = membership();
    expect(validateDiscordGuildMembership(snapshot)).toBe(snapshot);
    expect(isAuthorizationPositiveMembership(snapshot, BASE_TIME)).toBe(true);
    expect(
      isAuthorizationPositiveMembership(snapshot, snapshot.validUntil!),
    ).toBe(false);
  });

  it("keeps UNKNOWN non-positive and role-free", () => {
    const unknown = membership({
      status: "UNKNOWN",
      verifiedAt: undefined,
      validUntil: undefined,
      roles: [],
    });
    expect(isAuthorizationPositiveMembership(unknown, BASE_TIME)).toBe(false);
    expect(() =>
      validateDiscordGuildMembership(
        membership({ status: "UNKNOWN", verifiedAt: undefined, validUntil: undefined }),
      ),
    ).toThrow(/roles/);
  });

  it("requires departure metadata for ABSENT membership", () => {
    expect(() =>
      validateDiscordGuildMembership(
        membership({ status: "ABSENT", validUntil: undefined, roles: [] }),
      ),
    ).toThrow(/departure/);
  });
});

describe("authentication audit", () => {
  const auditEvent = (
    overrides: Partial<AuthenticationAuditEvent> = {},
  ): AuthenticationAuditEvent => ({
    id: authenticationAuditEventId(randomUUID()),
    action: "LOGIN_SUCCESS",
    outcome: "SUCCESS",
    reasonCode: "COMPLETED",
    requestId: authenticationRequestId(randomUUID()),
    correlationId: authenticationCorrelationId(randomUUID()),
    target: { platformUserId: UUIDS.platformUser },
    metadata: { provider_latency_ms: 12, retry: false },
    occurredAt: BASE_TIME,
    createdAt: BASE_TIME,
    ...overrides,
  });

  it("accepts bounded scalar metadata and keyed device HMACs", () => {
    const event = auditEvent({
      ipHmac: authenticationDigest("e".repeat(64)),
      metadataKeyVersion: 1,
    });
    expect(validateAuthenticationAuditEvent(event)).toBe(event);
  });

  it.each([
    { token: "value" },
    { session_digest: "value" },
    { oauth_state: "value" },
    { request_body: "value" },
  ])("rejects secret-like audit metadata %#", (metadata) => {
    expect(() => validateAuthenticationAuditMetadata(metadata)).toThrow(
      /unsafe key/,
    );
  });

  it("rejects unbounded or non-finite audit values", () => {
    expect(() =>
      validateAuthenticationAuditMetadata({ note: "x".repeat(257) }),
    ).toThrow(/unsafe string/);
    expect(() =>
      validateAuthenticationAuditMetadata({ duration: Number.NaN }),
    ).toThrow(/finite/);
  });

  it("requires HMAC key versions when device metadata is present", () => {
    expect(() =>
      validateAuthenticationAuditEvent(
        auditEvent({ deviceHmac: authenticationDigest("f".repeat(64)) }),
      ),
    ).toThrow(/key version/);
  });
});
