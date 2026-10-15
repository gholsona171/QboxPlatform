import type { DiscordGuildId, ExternalIdentityId, GuildId } from "../identifiers.js";
import { type DiscordGuildMembership } from "../membership.js";
import type { AuthenticationClock, AuthenticationIdGenerator, AuthenticationUnitOfWork, DiscordGuildMembershipVerifier } from "../ports.js";
import type { AuthenticationOperationContext } from "./AuthenticationServiceContracts.js";
import type { OAuthCredentialService } from "./OAuthCredentialService.js";
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
export declare class DiscordGuildMembershipService {
    #private;
    /** Constructs the service without reading configuration or opening connections. */
    constructor(dependencies: DiscordGuildMembershipServiceDependencies);
    /** Verifies current provider state and persists a fresh non-secret snapshot. */
    verifyCurrentMembership(input: VerifyDiscordGuildMembershipInput): Promise<DiscordGuildMembership>;
    /** Evaluates a persisted snapshot against a named freshness tier. */
    isFreshEnough(membership: DiscordGuildMembership, tier: DiscordMembershipFreshnessTier, now?: Date, policy?: DiscordMembershipFreshnessPolicy): boolean;
}
/** Returns the reviewed fixed membership freshness policy. */
export declare function defaultDiscordMembershipFreshnessPolicy(): DiscordMembershipFreshnessPolicy;
//# sourceMappingURL=DiscordGuildMembershipService.d.ts.map