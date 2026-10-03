import { type ExternalIdentity, type PlatformUser } from "../accounts.js";
import type { DiscordUserId } from "../identifiers.js";
import type { AuthenticationClock, AuthenticationIdGenerator, AuthenticationUnitOfWork } from "../ports.js";
import type { AuthenticationOperationContext } from "./AuthenticationServiceContracts.js";
/** Verified Discord identity accepted by the first-login resolver. */
export interface VerifiedDiscordLoginIdentity {
    /** Immutable Discord user snowflake returned by Discord's current-user endpoint. */
    readonly userId: DiscordUserId;
    /** Display-only Discord username. */
    readonly username?: string;
    /** Display-only Discord global name. */
    readonly globalName?: string;
    /** Display-only Discord avatar hash. */
    readonly avatar?: string;
}
/** Result of resolving or creating the platform account for a Discord login. */
export interface DiscordLoginAccountResolution {
    /** Canonical platform account. */
    readonly platformUser: PlatformUser;
    /** Enabled Discord identity linked to the platform account. */
    readonly externalIdentity: ExternalIdentity;
    /** Whether this callback created the account. */
    readonly created: boolean;
}
/** Dependencies for the transport-independent Discord login account resolver. */
export interface DiscordLoginServiceDependencies {
    /** Atomic authentication persistence boundary. */
    readonly unitOfWork: AuthenticationUnitOfWork;
    /** Injectable security clock. */
    readonly clock: AuthenticationClock;
    /** Internal identifier source. */
    readonly ids: AuthenticationIdGenerator;
}
/**
 * Resolves first-login account ownership for a verified Discord provider subject.
 *
 * This service performs no HTTP, OAuth, cookie, Discord.js, Prisma, or
 * authorization work. It treats the Discord user ID as the only authoritative
 * provider subject, stores profile fields only as mutable display data, and
 * relies on repository uniqueness for race-safe first-login behavior.
 */
export declare class DiscordLoginService {
    #private;
    /** Constructs the resolver without reading configuration or opening resources. */
    constructor(dependencies: DiscordLoginServiceDependencies);
    /** Creates or resolves the platform account for one verified Discord login. */
    resolveLogin(identity: VerifiedDiscordLoginIdentity, context: AuthenticationOperationContext): Promise<DiscordLoginAccountResolution>;
}
//# sourceMappingURL=DiscordLoginService.d.ts.map