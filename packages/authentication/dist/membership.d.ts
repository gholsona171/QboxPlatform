import type { DiscordGuildMembershipId, DiscordRoleId, ExternalIdentityId, GuildId } from "./identifiers.js";
/** Closed provider-verification states for Discord guild membership. */
export type DiscordGuildMembershipStatus = "PRESENT" | "ABSENT" | "UNKNOWN";
/** Trusted source that produced a guild-membership snapshot. */
export type DiscordGuildMembershipSource = "DISCORD_BOT" | "DISCORD_OAUTH" | "COMBINED";
/** Normalized immutable Discord role entry belonging to one membership snapshot. */
export interface DiscordGuildMembershipRole {
    readonly membershipId: DiscordGuildMembershipId;
    readonly roleId: DiscordRoleId;
    readonly createdAt: Date;
}
/**
 * Persisted bounded membership snapshot. UNKNOWN is deliberately non-positive;
 * role records are normalized children and are never a serialized text array.
 */
export interface DiscordGuildMembership {
    readonly id: DiscordGuildMembershipId;
    readonly externalIdentityId: ExternalIdentityId;
    readonly guildId: GuildId;
    readonly status: DiscordGuildMembershipStatus;
    readonly source: DiscordGuildMembershipSource;
    readonly verifiedAt?: Date;
    readonly validUntil?: Date;
    readonly departedAt?: Date;
    readonly roles: readonly DiscordGuildMembershipRole[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
/** Validates membership timestamps, normalized role uniqueness, and lifecycle state. */
export declare function validateDiscordGuildMembership(membership: DiscordGuildMembership): DiscordGuildMembership;
/** Returns true only for a currently verified PRESENT membership. */
export declare function isAuthorizationPositiveMembership(membership: DiscordGuildMembership, now: Date): boolean;
//# sourceMappingURL=membership.d.ts.map