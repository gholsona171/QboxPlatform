import { AuthenticationServiceError } from "../errors.js";
import { isAuthorizationPositiveMembership, } from "../membership.js";
const NORMAL_MAX_AGE_MS = 5 * 60_000;
const SENSITIVE_MAX_AGE_MS = 60_000;
const ROLE_LIMIT = 250;
/**
 * Transport-independent Discord membership verification service.
 *
 * The service treats UNKNOWN and stale PRESENT snapshots as non-authorizing,
 * calls Discord outside PostgreSQL transactions, and atomically persists the
 * resulting snapshot, role replacement, session revocation, and audit events.
 */
export class DiscordGuildMembershipService {
    #unitOfWork;
    #clock;
    #ids;
    #credentials;
    #verifier;
    /** Constructs the service without reading configuration or opening connections. */
    constructor(dependencies) {
        this.#unitOfWork = dependencies.unitOfWork;
        this.#clock = dependencies.clock;
        this.#ids = dependencies.ids;
        this.#credentials = dependencies.credentials;
        this.#verifier = dependencies.verifier;
    }
    /** Verifies current provider state and persists a fresh non-secret snapshot. */
    async verifyCurrentMembership(input) {
        const access = await this.#credentials.loadUsableAccessCredential(input.externalIdentityId, input.context, input.signal);
        const identity = await this.#unitOfWork.run(async (repositories) => {
            const current = await repositories.externalIdentities.findById(input.externalIdentityId);
            if (!current || !current.enabled)
                throw new AuthenticationServiceError("identity-unavailable", "The external identity is unavailable.");
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
            throw new AuthenticationServiceError("authentication-failed", "Discord membership verification returned an unexpected guild.");
        const now = this.#clock.now();
        const normalizedRoles = [...new Set(providerResult.roleIds)].sort();
        if (normalizedRoles.length > ROLE_LIMIT)
            throw new AuthenticationServiceError("authentication-failed", "Discord membership verification returned too many roles.");
        return this.#unitOfWork.run(async (repositories) => {
            const existing = await repositories.guildMemberships.find(input.externalIdentityId, input.discordGuildId);
            const membershipId = existing?.id ?? this.#ids.discordGuildMembershipId();
            const membershipInput = providerResult.status === "PRESENT"
                ? {
                    id: membershipId,
                    externalIdentityId: input.externalIdentityId,
                    guildId: input.guildId,
                    status: "PRESENT",
                    source: "DISCORD_OAUTH",
                    verifiedAt: providerResult.verifiedAt,
                    validUntil: providerResult.validUntil ?? new Date(providerResult.verifiedAt.getTime() + 5 * 60_000),
                    roles: normalizedRoles.map((roleId) => Object.freeze({
                        membershipId,
                        roleId,
                        createdAt: now,
                    })),
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
                await repositories.browserSessions.revokeAll(identity.platformUserId, "GUILD_DEPARTURE", now);
            }
            await repositories.audit.append(this.#audit(input.context, membership, identity.platformUserId, now));
            return membership;
        });
    }
    /** Evaluates a persisted snapshot against a named freshness tier. */
    isFreshEnough(membership, tier, now = this.#clock.now(), policy = defaultDiscordMembershipFreshnessPolicy()) {
        if (!isAuthorizationPositiveMembership(membership, now) || !membership.verifiedAt)
            return false;
        const maxAge = tier === "OWNER_ADMIN_SENSITIVE"
            ? policy.ownerAdminSensitiveMaxAgeMs
            : policy.normalProtectedMaxAgeMs;
        return now.getTime() - membership.verifiedAt.getTime() <= maxAge;
    }
    #audit(context, membership, platformUserId, occurredAt) {
        const action = membership.status === "ABSENT"
            ? "GUILD_DEPARTURE"
            : membership.status === "PRESENT"
                ? "GUILD_REJOIN"
                : "OAUTH_REJECTION";
        return {
            id: this.#ids.authenticationAuditEventId(),
            action,
            outcome: membership.status === "PRESENT" ? "SUCCESS" : "REJECTED",
            reasonCode: membership.status === "PRESENT" ? "COMPLETED" : "GUILD_MEMBERSHIP_CHANGED",
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
export function defaultDiscordMembershipFreshnessPolicy() {
    return Object.freeze({
        normalProtectedMaxAgeMs: NORMAL_MAX_AGE_MS,
        ownerAdminSensitiveMaxAgeMs: SENSITIVE_MAX_AGE_MS,
    });
}
//# sourceMappingURL=DiscordGuildMembershipService.js.map