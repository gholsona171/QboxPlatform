import { randomUUID } from "node:crypto";

import {
  authenticationDigest,
  browserSessionId,
  discordGuildMembershipId,
  discordRoleId,
  discordUserId,
  externalIdentityId,
  guildId,
  oauthCredentialId,
  oauthTransactionId,
  platformUserId,
  type BrowserSession,
  type DiscordGuildMembership,
  type ExternalIdentity,
  type OAuthCredential,
  type OAuthTransaction,
  type PlatformUser,
} from "../src/index.js";

export const UUIDS = Object.freeze({
  platformUser: platformUserId(randomUUID()),
  platformUserTwo: platformUserId(randomUUID()),
  identity: externalIdentityId(randomUUID()),
  identityTwo: externalIdentityId(randomUUID()),
  session: browserSessionId(randomUUID()),
  sessionTwo: browserSessionId(randomUUID()),
  transaction: oauthTransactionId(randomUUID()),
  credential: oauthCredentialId(randomUUID()),
  membership: discordGuildMembershipId(randomUUID()),
  guild: guildId(randomUUID()),
});

export const DISCORD_IDS = Object.freeze({
  user: discordUserId("804859666655739996"),
  userTwo: discordUserId("804859666655739997"),
  role: discordRoleId("1262656532902842423"),
});

export const BASE_TIME = new Date("2026-08-01T12:00:00.000Z");

export function platformUser(
  overrides: Partial<PlatformUser> = {},
): PlatformUser {
  return {
    id: UUIDS.platformUser,
    status: "ACTIVE",
    authenticationRevision: 1,
    statusReasonCode: "ACCOUNT_CREATED",
    createdAt: BASE_TIME,
    updatedAt: BASE_TIME,
    ...overrides,
  };
}

export function externalIdentity(
  overrides: Partial<ExternalIdentity> = {},
): ExternalIdentity {
  return {
    id: UUIDS.identity,
    platformUserId: UUIDS.platformUser,
    provider: "DISCORD",
    providerSubjectId: DISCORD_IDS.user,
    profile: { username: "display-only" },
    enabled: true,
    linkedAt: BASE_TIME,
    verifiedAt: BASE_TIME,
    createdAt: BASE_TIME,
    updatedAt: BASE_TIME,
    ...overrides,
  };
}

export function browserSession(
  overrides: Partial<BrowserSession> = {},
): BrowserSession {
  return {
    id: UUIDS.session,
    platformUserId: UUIDS.platformUser,
    loginIdentityId: UUIDS.identity,
    tokenDigest: authenticationDigest("a".repeat(64)),
    tokenKeyVersion: 1,
    csrfDigest: authenticationDigest("b".repeat(64)),
    csrfKeyVersion: 1,
    authenticationRevisionAtIssue: 1,
    authenticatedAt: BASE_TIME,
    lastSeenAt: BASE_TIME,
    idleExpiresAt: new Date(BASE_TIME.getTime() + 8 * 60 * 60_000),
    absoluteExpiresAt: new Date(BASE_TIME.getTime() + 7 * 24 * 60 * 60_000),
    status: "ACTIVE",
    createdAt: BASE_TIME,
    updatedAt: BASE_TIME,
    ...overrides,
  };
}

export function oauthTransaction(
  overrides: Partial<OAuthTransaction> = {},
): OAuthTransaction {
  return {
    id: UUIDS.transaction,
    provider: "DISCORD",
    purpose: "LOGIN",
    state: "PENDING",
    stateDigest: authenticationDigest("c".repeat(64)),
    browserBindingDigest: authenticationDigest("d".repeat(64)),
    redirectKey: "web-login",
    returnTargetKey: "dashboard",
    pkceMode: "DISABLED_UNVERIFIED",
    expiresAt: new Date(BASE_TIME.getTime() + 10 * 60_000),
    createdAt: BASE_TIME,
    updatedAt: BASE_TIME,
    ...overrides,
  };
}

const encrypted = {
  ciphertext: new Uint8Array([1]),
  nonce: new Uint8Array(12),
  authenticationTag: new Uint8Array(16),
  keyVersion: 1,
};

export function oauthCredential(
  overrides: Partial<OAuthCredential> = {},
): OAuthCredential {
  return {
    id: UUIDS.credential,
    externalIdentityId: UUIDS.identity,
    provider: "DISCORD",
    encryptedAccessToken: encrypted,
    encryptedRefreshToken: encrypted,
    scopes: ["identify"],
    providerExpiresAt: new Date(BASE_TIME.getTime() + 60 * 60_000),
    refreshVersion: 1,
    createdAt: BASE_TIME,
    updatedAt: BASE_TIME,
    ...overrides,
  };
}

export function membership(
  overrides: Partial<DiscordGuildMembership> = {},
): DiscordGuildMembership {
  return {
    id: UUIDS.membership,
    externalIdentityId: UUIDS.identity,
    guildId: UUIDS.guild,
    status: "PRESENT",
    source: "COMBINED",
    verifiedAt: BASE_TIME,
    validUntil: new Date(BASE_TIME.getTime() + 5 * 60_000),
    roles: [
      {
        membershipId: UUIDS.membership,
        roleId: DISCORD_IDS.role,
        createdAt: BASE_TIME,
      },
    ],
    createdAt: BASE_TIME,
    updatedAt: BASE_TIME,
    ...overrides,
  };
}
