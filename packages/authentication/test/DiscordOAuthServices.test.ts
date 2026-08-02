import { TextDecoder, TextEncoder } from "node:util";

import { describe, expect, it } from "vitest";

import {
  authenticationCorrelationId,
  discordGuildId,
  opaqueAuthenticationSecret,
  type AuthenticationCrypto,
  type AuthenticationKeyHandle,
  type DiscordGuildMembershipVerifier,
  type DiscordOAuthProvider,
  type EncryptedAuthenticationSecret,
  type OAuthCredential,
  type OpaqueAuthenticationSecret,
} from "../src/index.js";
import {
  DiscordGuildMembershipService,
  OAuthCredentialService,
  defaultDiscordMembershipFreshnessPolicy,
} from "../src/index.js";
import {
  BASE_TIME,
  DISCORD_IDS,
  UUIDS,
  browserSession,
  externalIdentity,
  platformUser,
} from "./fixtures.js";
import {
  FakeCrypto,
  FakeIds,
  FakeKeys,
  FixedClock,
  MemoryUnitOfWork,
  memoryState,
} from "./serviceFixtures.js";

describe("OAuthCredentialService", () => {
  it("encrypts initial grants, decrypts usable access, and keeps provider calls outside transactions", async () => {
    const state = memoryState();
    const unitOfWork = new MemoryUnitOfWork(state);
    const provider = new FakeProvider(() => {
      expect(unitOfWork.active).toBe(false);
    });
    const service = credentialService(unitOfWork, provider);
    state.users.set(UUIDS.platformUser, platformUser());
    state.identities.set(UUIDS.identity, externalIdentity());
    const tokenResult = token("access-initial", "refresh-initial");

    const stored = await service.persistInitialGrant({
      externalIdentityId: UUIDS.identity,
      tokenResult,
      context: context(),
    });

    expect(JSON.stringify(stored)).not.toContain("access-initial");
    expect(JSON.stringify(stored)).not.toContain("refresh-initial");
    const access = await service.loadUsableAccessCredential(
      UUIDS.identity,
      context(),
      new AbortController().signal,
    );
    expect(access.accessToken).toBe("access-initial-" + "x".repeat(32));
    expect(provider.refreshCount).toBe(0);
  });

  it("refreshes expiring credentials with optimistic replacement and local revocation", async () => {
    const state = memoryState();
    const unitOfWork = new MemoryUnitOfWork(state);
    const provider = new FakeProvider(() => {
      expect(unitOfWork.active).toBe(false);
    });
    const service = credentialService(unitOfWork, provider);
    state.users.set(UUIDS.platformUser, platformUser());
    state.identities.set(UUIDS.identity, externalIdentity());
    await service.persistInitialGrant({
      externalIdentityId: UUIDS.identity,
      tokenResult: token("access-old", "refresh-old", new Date(BASE_TIME.getTime() + 1_000)),
      context: context(),
    });
    provider.nextTokenResult = token("access-new", "refresh-new");

    const refreshed = await service.loadUsableAccessCredential(
      UUIDS.identity,
      context(),
      new AbortController().signal,
    );

    expect(refreshed.accessToken).toBe("access-new-" + "x".repeat(32));
    expect(provider.refreshCount).toBe(1);
    expect([...state.credentials.values()][0]?.refreshVersion).toBe(2);
    await service.revokeLocalGrant(UUIDS.identity, "SECURITY_RESPONSE", context());
    await expect(
      service.loadUsableAccessCredential(UUIDS.identity, context(), new AbortController().signal),
    ).rejects.toMatchObject({ code: "identity-unavailable" });
  });
});

describe("DiscordGuildMembershipService", () => {
  it("stores PRESENT and UNKNOWN as distinct non-secret membership snapshots", async () => {
    const { state, unitOfWork, membershipService, verifier } = await setupMembership();
    verifier.status = "PRESENT";
    const present = await membershipService.verifyCurrentMembership({
      externalIdentityId: UUIDS.identity,
      guildId: UUIDS.guild,
      discordGuildId: discordGuildId("1257928923048837201"),
      context: context(),
      signal: new AbortController().signal,
    });
    expect(present.status).toBe("PRESENT");
    expect(present.roles.map((role) => role.roleId)).toEqual([DISCORD_IDS.role]);
    expect(unitOfWork.active).toBe(false);

    verifier.status = "UNKNOWN";
    const unknown = await membershipService.verifyCurrentMembership({
      externalIdentityId: UUIDS.identity,
      guildId: UUIDS.guild,
      discordGuildId: discordGuildId("1257928923048837201"),
      context: context(),
      signal: new AbortController().signal,
    });
    expect(unknown.status).toBe("UNKNOWN");
    expect(unknown.roles).toHaveLength(0);
  });

  it("revokes active sessions atomically after confirmed guild departure", async () => {
    const { state, membershipService, verifier } = await setupMembership();
    state.sessions.set(UUIDS.session, browserSession());
    verifier.status = "ABSENT";

    const absent = await membershipService.verifyCurrentMembership({
      externalIdentityId: UUIDS.identity,
      guildId: UUIDS.guild,
      discordGuildId: discordGuildId("1257928923048837201"),
      context: context(),
      signal: new AbortController().signal,
    });

    expect(absent.status).toBe("ABSENT");
    expect(state.sessions.get(UUIDS.session)).toMatchObject({
      status: "REVOKED",
      revocationReason: "GUILD_DEPARTURE",
    });
    expect([...state.audits.values()].some((event) => event.action === "GUILD_DEPARTURE")).toBe(true);
  });

  it("evaluates freshness by named tiers only", async () => {
    const { membershipService } = await setupMembership();
    const policy = defaultDiscordMembershipFreshnessPolicy();
    const membership = {
      id: UUIDS.membership,
      externalIdentityId: UUIDS.identity,
      guildId: UUIDS.guild,
      status: "PRESENT" as const,
      source: "DISCORD_OAUTH" as const,
      verifiedAt: BASE_TIME,
      validUntil: new Date(BASE_TIME.getTime() + 10 * 60_000),
      roles: [],
      createdAt: BASE_TIME,
      updatedAt: BASE_TIME,
    };
    expect(
      membershipService.isFreshEnough(
        membership,
        "NORMAL_PROTECTED",
        new Date(BASE_TIME.getTime() + policy.normalProtectedMaxAgeMs),
      ),
    ).toBe(true);
    expect(
      membershipService.isFreshEnough(
        membership,
        "OWNER_ADMIN_SENSITIVE",
        new Date(BASE_TIME.getTime() + policy.ownerAdminSensitiveMaxAgeMs + 1),
      ),
    ).toBe(false);
  });
});

async function setupMembership() {
  const state = memoryState();
  const unitOfWork = new MemoryUnitOfWork(state);
  state.users.set(UUIDS.platformUser, platformUser());
  state.identities.set(UUIDS.identity, externalIdentity());
  const provider = new FakeProvider(() => {
    expect(unitOfWork.active).toBe(false);
  });
  const credentials = credentialService(unitOfWork, provider);
  await credentials.persistInitialGrant({
    externalIdentityId: UUIDS.identity,
    tokenResult: token("access-token", "refresh-token"),
    context: context(),
  });
  const verifier = new FakeMembershipVerifier(() => {
    expect(unitOfWork.active).toBe(false);
  });
  const membershipService = new DiscordGuildMembershipService({
    unitOfWork,
    clock: new FixedClock(BASE_TIME),
    ids: new FakeIds(),
    credentials,
    verifier,
  });
  return { state, unitOfWork, membershipService, verifier };
}

function credentialService(unitOfWork: MemoryUnitOfWork, provider: DiscordOAuthProvider) {
  const crypto = new SimpleCrypto();
  return new OAuthCredentialService({
    unitOfWork,
    clock: new FixedClock(BASE_TIME),
    crypto,
    keys: new FakeKeys(),
    ids: new FakeIds(),
    provider,
  });
}

function context() {
  return { correlationId: authenticationCorrelationId("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa") };
}

function token(access: string, refresh: string, expiresAt = new Date(BASE_TIME.getTime() + 60 * 60_000)) {
  return {
    accessToken: opaqueAuthenticationSecret(`${access}-${"x".repeat(32)}`),
    refreshToken: opaqueAuthenticationSecret(`${refresh}-${"x".repeat(32)}`),
    scopes: ["guilds.members.read", "identify"],
    expiresAt,
  };
}

class SimpleCrypto extends FakeCrypto implements AuthenticationCrypto {
  public override async encrypt(
    plaintext: OpaqueAuthenticationSecret,
    key: AuthenticationKeyHandle,
    associatedData: string,
  ): Promise<EncryptedAuthenticationSecret> {
    return simpleEncrypted(`${key.identifier}|${associatedData}|${plaintext}`);
  }

  public override async decrypt(
    encrypted: EncryptedAuthenticationSecret,
    key: AuthenticationKeyHandle,
    associatedData: string,
  ): Promise<OpaqueAuthenticationSecret> {
    const plaintext = new TextDecoder().decode(encrypted.ciphertext);
    const prefix = `${key.identifier}|${associatedData}|`;
    if (!plaintext.startsWith(prefix)) throw new Error("bad associated data");
    return opaqueAuthenticationSecret(plaintext.slice(prefix.length));
  }
}

class FakeProvider implements DiscordOAuthProvider {
  public refreshCount = 0;
  public nextTokenResult = token("access-refreshed", "refresh-refreshed");
  public constructor(private readonly onCall: () => void) {}
  public createAuthorizationUrl(): URL { throw new Error("not used"); }
  public async exchangeCode() { throw new Error("not used"); }
  public async refreshToken() {
    this.onCall();
    this.refreshCount += 1;
    return this.nextTokenResult;
  }
  public async inspectAuthorization() { throw new Error("not used"); }
  public async fetchIdentity() { throw new Error("not used"); }
  public async revokeCredential() {
    this.onCall();
    return { providerAccepted: true };
  }
}

class FakeMembershipVerifier implements DiscordGuildMembershipVerifier {
  public status: "PRESENT" | "ABSENT" | "UNKNOWN" = "PRESENT";
  public constructor(private readonly onCall: () => void) {}
  public async verify() {
    this.onCall();
    return {
      guildId: discordGuildId("1257928923048837201"),
      status: this.status,
      roleIds: this.status === "PRESENT" ? [DISCORD_IDS.role] : [],
      source: "DISCORD_OAUTH" as const,
      verifiedAt: BASE_TIME,
      ...(this.status === "PRESENT"
        ? { validUntil: new Date(BASE_TIME.getTime() + 5 * 60_000) }
        : {}),
    };
  }
}

function simpleEncrypted(value: string): EncryptedAuthenticationSecret {
  return {
    ciphertext: new TextEncoder().encode(value),
    nonce: new Uint8Array(12),
    authenticationTag: new Uint8Array(16),
    keyVersion: 1,
  };
}
