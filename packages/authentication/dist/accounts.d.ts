import type { DiscordUserId, ExternalIdentityId, PlatformUserId } from "./identifiers.js";
/** Closed lifecycle states for a canonical platform account. */
export type PlatformUserStatus = "ACTIVE" | "SUSPENDED" | "DISABLED" | "DELETED";
/** Structured reasons for platform-account lifecycle changes. */
export type PlatformUserStatusReasonCode = "ACCOUNT_CREATED" | "USER_REQUEST" | "ADMINISTRATOR_ACTION" | "SECURITY_RESPONSE" | "RECOVERY" | "IDENTITY_UNLINKED" | "ACCOUNT_MERGED";
/** Immutable domain projection of a canonical human platform account. */
export interface PlatformUser {
    readonly id: PlatformUserId;
    readonly status: PlatformUserStatus;
    readonly authenticationRevision: number;
    readonly statusReasonCode: PlatformUserStatusReasonCode;
    readonly suspendedAt?: Date;
    readonly disabledAt?: Date;
    readonly deletedAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
/** Provider kinds accepted by the initial identity ownership model. */
export type ExternalIdentityProvider = "DISCORD";
/** Bounded, mutable, non-authoritative Discord profile snapshot for display only. */
export interface DiscordProfileSnapshot {
    readonly username?: string;
    readonly globalName?: string;
    readonly avatar?: string;
}
/**
 * Immutable identity-ownership snapshot. Provider subject IDs are authoritative;
 * usernames and profile fields are display-only and may change independently.
 */
export interface ExternalIdentity {
    readonly id: ExternalIdentityId;
    readonly platformUserId: PlatformUserId;
    readonly provider: ExternalIdentityProvider;
    readonly providerSubjectId: DiscordUserId;
    readonly profile: Readonly<DiscordProfileSnapshot>;
    readonly enabled: boolean;
    readonly linkedAt: Date;
    readonly verifiedAt: Date;
    readonly lastProviderRefreshAt?: Date;
    readonly unlinkedAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
/** Validates account state/timestamp and positive revision invariants. */
export declare function validatePlatformUser(user: PlatformUser): PlatformUser;
/**
 * Applies a reviewed account lifecycle transition and increments the revision so
 * previously issued sessions can be invalidated by future services.
 */
export declare function transitionPlatformUser(user: PlatformUser, status: PlatformUserStatus, reasonCode: PlatformUserStatusReasonCode, occurredAt: Date): PlatformUser;
/** Validates provider ownership, lifecycle, snowflake, and profile bounds. */
export declare function validateExternalIdentity(identity: ExternalIdentity): ExternalIdentity;
/**
 * Enforces the initial one-Discord-identity-per-account policy over a repository
 * snapshot. Unlinked identities remain ownership records and still participate.
 */
export declare function validateExternalIdentityOwnership(identities: readonly ExternalIdentity[]): readonly ExternalIdentity[];
//# sourceMappingURL=accounts.d.ts.map