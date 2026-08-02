import type { AuthenticationAuditEvent } from "../audit.js";
import { AuthenticationServiceError } from "../errors.js";
import type {
  DiscordGuildId,
  DiscordGuildMembershipId,
  ExternalIdentityId,
  GuildId,
  PlatformUserId,
} from "../identifiers.js";
import {
  isAuthorizationPositiveMembership,
  type DiscordGuildMembership,
  type DiscordGuildMembershipStatus,
} from "../membership.js";
import type {
  AuthenticationClock,
  AuthenticationIdGenerator,
  AuthenticationUnitOfWork,
  DiscordGuildMembershipVerifier,
} from "../ports.js";
import type { AuthenticationOperationContext } from "./AuthenticationServiceContracts.js";
import type { OAuthCredentialService } from "./OAuthCredentialService.js";

const NORMAL_MAX_AGE_MS = 5 * 60_000;
const SENSITIVE_MAX_AGE_MS = 60_000;
const ROLE_LIMIT = 250;

/** Named freshness tiers accepted by trusted application services. */
export type DiscordMembershipFreshnessTier = "NORMAL_PROTECTED" | "OWNER_ADMIN_SENSITIVE";

/** Immutable freshness policy with reviewed fixed tiers. */
export interface DiscordMembershipFreshnessPolicy {
  /** Maximum accepted age for ordinary protected operations. */
  readonly normalProtectedMaxAgeMs: number;
  /** Maximum accepted age for owner/admin or identity-sensitive operations. */
  readonly ownerAdminSensitiveMaxAgeMs: number;
}

/** Inputs for current Discord guild-membership verification. */
export interface VerifyDiscordGuildMembershipInput {
  /** Existing external identity whose OAuth grant will be used. */
  readonly externalIdentityId: ExternalIdentityId;
  /** Internal guild row resolved by trusted composition before calling the service. */
  readonly guildId: GuildId;
  /** Configured Discord guild snowflake verified by provider calls. */
  readonly discordGuildId: DiscordGuildId;
  /** Trusted operation evidence for mandatory audit. */
  readonly context: AuthenticationOperationContext;
  /** Cooperative cancellation boundary. */
  readonly signal: AbortSignal;
}

/** Dependencies for provider-backed Discord guild-membership orchestration. */
export interface DiscordGuildMembershipServiceDependencies {
  /** Atomic authentication persistence boundary. */
  readonly unitOfWork: AuthenticationUnitOfWork;
  /** Injectable security clock. */
  readonly clock: AuthenticationClock;
  /** Identifier generator for new membership and audit rows. */
  readonly ids: AuthenticationIdGenerator;
  /** Encrypted credential lifecycle service. */
  readonly credentials: OAuthCredentialService;
  /** Provider verifier invoked only outside database transactions. */
  readonly verifier: DiscordGuildMembershipVerifier;
}

/**
 * Transport-independent Discord membership verification service.
 *
 * The service treats UNKNOWN and stale PRESENT snapshots as non-authorizing,
 * calls Discord outside PostgreSQL transactions, and atomically persists the
 * resulting snapshot, role replacement, session revocation, and audit events.
 */
export class DiscordGuildMembershipService {
  readonly #unitOfWork: AuthenticationUnitOfWork;
  readonly #clock: AuthenticationClock;
  readonly #ids: AuthenticationIdGenerator;
  readonly #credentials: OAuthCredentialService;
  readonly #verifier: DiscordGuildMembershipVerifier;

  /** Constructs the service without reading configuration or opening connections. */
  public constructor(dependencies: DiscordGuildMembershipServiceDependencies) {
    this.#unitOfWork = dependencies.unitOfWork;
    this.#clock = dependencies.clock;
    this.#ids = dependencies.ids;
    this.#credentials = dependencies.credentials;
    this.#verifier = dependencies.verifier;
  }

  /** Verifies current provider state and persists a fresh non-secret snapshot. */
  public async verifyCurrentMembership(
    input: VerifyDiscordGuildMembershipInput,
  ): Promise<DiscordGuildMembership> {
    const access = await this.#credentials.loadUsableAccessCredential(
      input.externalIdentityId,
      input.context,
      input.signal,
    );
    const identity = await this.#unitOfWork.run(async (repositories) => {
      const current = await repositories.externalIdentities.findById(input.externalIdentityId);
      if (!current || !current.enabled)
        throw new AuthenticationServiceError(
          "identity-unavailable",
          "The external identity is unavailable.",
        );
      return current;
    });
    const verifiedIdentity = {
      userId: identity.providerSubjectId,
      ...identity.profile,
    };
    const providerResult = await this.#verifier.verify({
      identity: verifiedIdentity,
      accessToken: access.accessToken,
      guildId: input.discordGuildId,
      signal: input.signal,
    });
    if (providerResult.guildId !== input.discordGuildId)
      throw new AuthenticationServiceError(
        "authentication-failed",
        "Discord membership verification returned an unexpected guild.",
      );
    const now = this.#clock.now();
    const normalizedRoles = [...new Set(providerResult.roleIds)].sort();
    if (normalizedRoles.length > ROLE_LIMIT)
      throw new AuthenticationServiceError(
        "authentication-failed",
        "Discord membership verification returned too many roles.",
      );
    return this.#unitOfWork.run(async (repositories) => {
      const existing = await repositories.guildMemberships.find(
        input.externalIdentityId,
        input.discordGuildId,
      );
      const membershipId = existing?.id ?? this.#ids.discordGuildMembershipId();
      const membershipInput: DiscordGuildMembership =
        providerResult.status === "PRESENT"
          ? {
              id: membershipId,
              externalIdentityId: input.externalIdentityId,
              guildId: input.guildId,
              status: "PRESENT",
              source: "DISCORD_OAUTH",
              verifiedAt: providerResult.verifiedAt,
              validUntil: providerResult.validUntil ?? new Date(providerResult.verifiedAt.getTime() + 5 * 60_000),
              roles: normalizedRoles.map((roleId) =>
                Object.freeze({
                  membershipId,
                  roleId,
                  createdAt: now,
                }),
              ),
              createdAt: existing?.createdAt ?? now,
              updatedAt: now,
            }
          : providerResult.status === "ABSENT"
            ? {
                id: membershipId,
                externalIdentityId: input.externalIdentityId,
                guildId: input.guildId,
                status: "ABSENT",
                source: "DISCORD_OAUTH",
                verifiedAt: providerResult.verifiedAt,
                departedAt: providerResult.verifiedAt,
                roles: [],
                createdAt: existing?.createdAt ?? now,
                updatedAt: now,
              }
            : {
                id: membershipId,
                externalIdentityId: input.externalIdentityId,
                guildId: input.guildId,
                status: "UNKNOWN",
                source: "DISCORD_OAUTH",
                roles: [],
                createdAt: existing?.createdAt ?? now,
                updatedAt: now,
              };
      const membership = await repositories.guildMemberships.replaceVerifiedSnapshot(membershipInput);
      if (providerResult.status === "ABSENT") {
        await repositories.browserSessions.acquireAccountMutationLock(identity.platformUserId);
        await repositories.browserSessions.revokeAll(
          identity.platformUserId,
          "GUILD_DEPARTURE",
          now,
        );
      }
      await repositories.audit.append(
        this.#audit(input.context, membership, identity.platformUserId, now),
      );
      return membership;
    });
  }

  /** Evaluates a persisted snapshot against a named freshness tier. */
  public isFreshEnough(
    membership: DiscordGuildMembership,
    tier: DiscordMembershipFreshnessTier,
    now: Date = this.#clock.now(),
    policy: DiscordMembershipFreshnessPolicy = defaultDiscordMembershipFreshnessPolicy(),
  ): boolean {
    if (!isAuthorizationPositiveMembership(membership, now) || !membership.verifiedAt)
      return false;
    const maxAge =
      tier === "OWNER_ADMIN_SENSITIVE"
        ? policy.ownerAdminSensitiveMaxAgeMs
        : policy.normalProtectedMaxAgeMs;
    return now.getTime() - membership.verifiedAt.getTime() <= maxAge;
  }

  #audit(
    context: AuthenticationOperationContext,
    membership: DiscordGuildMembership,
    platformUserId: PlatformUserId,
    occurredAt: Date,
  ): AuthenticationAuditEvent {
    const action =
      membership.status === "ABSENT"
        ? "GUILD_DEPARTURE"
        : membership.status === "PRESENT"
          ? "GUILD_REJOIN"
          : "OAUTH_REJECTION";
    return {
      id: this.#ids.authenticationAuditEventId(),
      action,
      outcome: membership.status === "PRESENT" ? "SUCCESS" : "REJECTED",
      reasonCode:
        membership.status === "PRESENT" ? "COMPLETED" : "GUILD_MEMBERSHIP_CHANGED",
      ...(context.requestId ? { requestId: context.requestId } : {}),
      correlationId: context.correlationId,
      ...(context.actor ? { actor: context.actor } : {}),
      target: {
        platformUserId,
        externalIdentityId: membership.externalIdentityId,
        guildMembershipId: membership.id,
      },
      provider: "DISCORD",
      metadata: Object.freeze({
        ...(context.metadata ?? {}),
        membership_status: membership.status,
      }),
      occurredAt,
      createdAt: occurredAt,
    };
  }
}

/** Returns the reviewed fixed membership freshness policy. */
export function defaultDiscordMembershipFreshnessPolicy(): DiscordMembershipFreshnessPolicy {
  return Object.freeze({
    normalProtectedMaxAgeMs: NORMAL_MAX_AGE_MS,
    ownerAdminSensitiveMaxAgeMs: SENSITIVE_MAX_AGE_MS,
  });
}
