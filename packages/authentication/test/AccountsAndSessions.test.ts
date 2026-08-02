import { describe, expect, it } from "vitest";

import {
  AUTHENTICATION_SESSION_DEFAULTS,
  createBrowserSessionPolicy,
  isBrowserSessionActive,
  transitionPlatformUser,
  validateBrowserSession,
  validateExternalIdentity,
  validateExternalIdentityOwnership,
  validatePlatformUser,
  validateSessionRotation,
} from "../src/index.js";
import {
  BASE_TIME,
  DISCORD_IDS,
  UUIDS,
  browserSession,
  externalIdentity,
  platformUser,
} from "./fixtures.js";

describe("platform accounts and identities", () => {
  it.each([
    ["ACTIVE", undefined],
    ["SUSPENDED", "suspendedAt"],
    ["DISABLED", "disabledAt"],
    ["DELETED", "deletedAt"],
  ] as const)("validates %s lifecycle timestamps", (status, timestamp) => {
    const user = platformUser({
      status,
      statusReasonCode: status === "ACTIVE" ? "ACCOUNT_CREATED" : "ADMINISTRATOR_ACTION",
      ...(timestamp ? { [timestamp]: BASE_TIME } : {}),
    });
    expect(validatePlatformUser(user)).toBe(user);
  });

  it("increments authentication revision on a status transition", () => {
    const next = transitionPlatformUser(
      platformUser(),
      "SUSPENDED",
      "SECURITY_RESPONSE",
      new Date(BASE_TIME.getTime() + 1_000),
    );
    expect(next.authenticationRevision).toBe(2);
    expect(next.suspendedAt).toEqual(new Date(BASE_TIME.getTime() + 1_000));
  });

  it("keeps deleted accounts terminal and revisions positive", () => {
    expect(() => validatePlatformUser(platformUser({ authenticationRevision: 0 }))).toThrow(/positive/);
    const deleted = platformUser({
      status: "DELETED",
      statusReasonCode: "USER_REQUEST",
      deletedAt: BASE_TIME,
    });
    expect(() =>
      transitionPlatformUser(deleted, "ACTIVE", "RECOVERY", BASE_TIME),
    ).toThrow(/Deleted/);
  });

  it("validates identity lifecycle and display-only profile bounds", () => {
    expect(validateExternalIdentity(externalIdentity())).toBeDefined();
    expect(() =>
      validateExternalIdentity(
        externalIdentity({ enabled: false, unlinkedAt: undefined }),
      ),
    ).toThrow(/inconsistent/);
    expect(() =>
      validateExternalIdentity(
        externalIdentity({ profile: { username: "x".repeat(81) } }),
      ),
    ).toThrow(/bounded/);
  });

  it("prevents duplicate provider ownership and one-account Discord ambiguity", () => {
    expect(() =>
      validateExternalIdentityOwnership([
        externalIdentity(),
        externalIdentity({
          id: UUIDS.identityTwo,
          platformUserId: UUIDS.platformUserTwo,
        }),
      ]),
    ).toThrow(/provider subject/);
    expect(() =>
      validateExternalIdentityOwnership([
        externalIdentity(),
        externalIdentity({
          id: UUIDS.identityTwo,
          providerSubjectId: DISCORD_IDS.userTwo,
        }),
      ]),
    ).toThrow(/only one Discord identity/);
  });

  it("retains unlinked identity ownership in uniqueness evaluation", () => {
    expect(() =>
      validateExternalIdentityOwnership([
        externalIdentity({ enabled: false, unlinkedAt: BASE_TIME }),
        externalIdentity({
          id: UUIDS.identityTwo,
          platformUserId: UUIDS.platformUserTwo,
        }),
      ]),
    ).toThrow(/provider subject/);
  });
});

describe("browser sessions", () => {
  it("uses the approved defaults and accepts reviewed overrides", () => {
    expect(createBrowserSessionPolicy()).toEqual(AUTHENTICATION_SESSION_DEFAULTS);
    expect(createBrowserSessionPolicy({ maximumActiveSessions: 3 })).toMatchObject({
      maximumActiveSessions: 3,
    });
  });

  it.each([
    { idleTimeoutMs: 1 },
    { absoluteTimeoutMs: 31 * 24 * 60 * 60_000 },
    { maximumActiveSessions: 0 },
    { maximumActiveSessions: 21 },
  ])("rejects unsafe session policy %#", (policy) => {
    expect(() => createBrowserSessionPolicy(policy)).toThrow(/bounds/);
  });

  it("validates active, revoked, and expired session states", () => {
    expect(validateBrowserSession(browserSession())).toBeDefined();
    expect(
      validateBrowserSession(
        browserSession({
          status: "REVOKED",
          revokedAt: new Date(BASE_TIME.getTime() + 1_000),
          revocationReason: "LOGOUT",
        }),
      ),
    ).toBeDefined();
    expect(() =>
      validateBrowserSession(browserSession({ status: "REVOKED" })),
    ).toThrow(/require a revocation/);
  });

  it("enforces authentication revision and expiry ordering", () => {
    expect(() =>
      validateBrowserSession(browserSession({ authenticationRevisionAtIssue: 0 })),
    ).toThrow(/positive integer/);
    expect(() =>
      validateBrowserSession(
        browserSession({
          absoluteExpiresAt: new Date(BASE_TIME.getTime() + 1_000),
        }),
      ),
    ).toThrow(/absolute expiry/);
  });

  it("evaluates temporal activity and rotation relationships", () => {
    const source = browserSession({
      status: "ROTATED",
      revokedAt: new Date(BASE_TIME.getTime() + 1_000),
      revocationReason: "ROTATED",
    });
    const successor = browserSession({
      id: UUIDS.sessionTwo,
      tokenDigest: source.csrfDigest,
      csrfDigest: source.tokenDigest,
      rotatedFromSessionId: source.id,
      createdAt: new Date(BASE_TIME.getTime() + 1_000),
      authenticatedAt: new Date(BASE_TIME.getTime() + 1_000),
      lastSeenAt: new Date(BASE_TIME.getTime() + 1_000),
      updatedAt: new Date(BASE_TIME.getTime() + 1_000),
    });
    expect(() => validateSessionRotation(source, successor)).not.toThrow();
    expect(isBrowserSessionActive(browserSession(), BASE_TIME)).toBe(true);
    expect(
      isBrowserSessionActive(
        browserSession(),
        new Date(BASE_TIME.getTime() + 8 * 60 * 60_000),
      ),
    ).toBe(false);
  });
});
