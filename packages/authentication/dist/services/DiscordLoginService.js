import { validateExternalIdentity, validatePlatformUser, } from "../accounts.js";
import { AuthenticationInfrastructureError, AuthenticationServiceError, } from "../errors.js";
/**
 * Resolves first-login account ownership for a verified Discord provider subject.
 *
 * This service performs no HTTP, OAuth, cookie, Discord.js, Prisma, or
 * authorization work. It treats the Discord user ID as the only authoritative
 * provider subject, stores profile fields only as mutable display data, and
 * relies on repository uniqueness for race-safe first-login behavior.
 */
export class DiscordLoginService {
    #unitOfWork;
    #clock;
    #ids;
    /** Constructs the resolver without reading configuration or opening resources. */
    constructor(dependencies) {
        this.#unitOfWork = dependencies.unitOfWork;
        this.#clock = dependencies.clock;
        this.#ids = dependencies.ids;
    }
    /** Creates or resolves the platform account for one verified Discord login. */
    async resolveLogin(identity, context) {
        for (let attempt = 0; attempt < 2; attempt += 1) {
            try {
                return await this.#resolveOnce(identity, context);
            }
            catch (error) {
                if (attempt === 0 &&
                    error instanceof AuthenticationInfrastructureError &&
                    (error.code === "duplicate-provider-identity" ||
                        error.code === "duplicate-account-provider-identity" ||
                        error.code === "conflict")) {
                    continue;
                }
                throw error;
            }
        }
        throw new AuthenticationServiceError("authentication-failed", "The Discord login could not be resolved safely.");
    }
    async #resolveOnce(identity, context) {
        const now = this.#clock.now();
        return this.#unitOfWork.run(async (repositories) => {
            const existing = await repositories.externalIdentities.findByProviderSubject("DISCORD", identity.userId);
            if (existing) {
                if (!existing.enabled || existing.unlinkedAt)
                    throw new AuthenticationServiceError("identity-unavailable", "The Discord identity is unavailable.");
                const account = await repositories.platformUsers.findById(existing.platformUserId);
                if (!account || account.status !== "ACTIVE")
                    throw new AuthenticationServiceError("account-unavailable", "The platform account is unavailable.");
                const updatedIdentity = await repositories.externalIdentities.updateVerifiedIdentity(validateExternalIdentity({
                    ...existing,
                    profile: profile(identity),
                    verifiedAt: now,
                    lastProviderRefreshAt: now,
                    updatedAt: now,
                }));
                await repositories.audit.append(this.#audit(context, "LOGIN_SUCCESS", now, {
                    platformUserId: account.id,
                    externalIdentityId: updatedIdentity.id,
                }));
                return Object.freeze({
                    platformUser: account,
                    externalIdentity: updatedIdentity,
                    created: false,
                });
            }
            const platformUser = validatePlatformUser({
                id: this.#ids.platformUserId(),
                status: "ACTIVE",
                authenticationRevision: 1,
                statusReasonCode: "ACCOUNT_CREATED",
                createdAt: now,
                updatedAt: now,
            });
            const externalIdentity = validateExternalIdentity({
                id: this.#ids.externalIdentityId(),
                platformUserId: platformUser.id,
                provider: "DISCORD",
                providerSubjectId: identity.userId,
                profile: profile(identity),
                enabled: true,
                linkedAt: now,
                verifiedAt: now,
                lastProviderRefreshAt: now,
                createdAt: now,
                updatedAt: now,
            });
            const createdAccount = await repositories.platformUsers.create(platformUser);
            const createdIdentity = await repositories.externalIdentities.create(externalIdentity);
            await repositories.audit.append(this.#audit(context, "IDENTITY_LINK", now, {
                platformUserId: createdAccount.id,
                externalIdentityId: createdIdentity.id,
            }));
            await repositories.audit.append(this.#audit(context, "LOGIN_SUCCESS", now, {
                platformUserId: createdAccount.id,
                externalIdentityId: createdIdentity.id,
            }));
            return Object.freeze({
                platformUser: createdAccount,
                externalIdentity: createdIdentity,
                created: true,
            });
        });
    }
    #audit(context, action, occurredAt, target) {
        return {
            id: this.#ids.authenticationAuditEventId(),
            action,
            outcome: "SUCCESS",
            reasonCode: "COMPLETED",
            ...(context.requestId ? { requestId: context.requestId } : {}),
            correlationId: context.correlationId,
            ...(context.actor ? { actor: context.actor } : {}),
            target,
            provider: "DISCORD",
            metadata: Object.freeze({ ...(context.metadata ?? {}) }),
            occurredAt,
            createdAt: occurredAt,
        };
    }
}
function profile(identity) {
    return Object.freeze({
        ...(identity.username ? { username: identity.username } : {}),
        ...(identity.globalName ? { globalName: identity.globalName } : {}),
        ...(identity.avatar ? { avatar: identity.avatar } : {}),
    });
}
//# sourceMappingURL=DiscordLoginService.js.map