import { AuthenticationDomainError } from "./errors.js";
import type {
  DiscordGuildMembershipId,
  DiscordRoleId,
  ExternalIdentityId,
  GuildId,
} from "./identifiers.js";

/** Closed provider-verification states for Discord guild membership. */
export type DiscordGuildMembershipStatus = "PRESENT" | "ABSENT" | "UNKNOWN";

/** Trusted source that produced a guild-membership snapshot. */
export type DiscordGuildMembershipSource =
  | "DISCORD_BOT"
  | "DISCORD_OAUTH"
  | "COMBINED";

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
export function validateDiscordGuildMembership(
  membership: DiscordGuildMembership,
): DiscordGuildMembership {
  if (membership.updatedAt < membership.createdAt)
    invalidMembership("Membership updatedAt cannot precede createdAt.");
  if (membership.status === "PRESENT") {
    if (
      !membership.verifiedAt ||
      !membership.validUntil ||
      membership.validUntil <= membership.verifiedAt ||
      membership.departedAt
    )
      invalidMembership("Present membership requires a bounded verification window.");
  } else if (membership.status === "ABSENT") {
    if (
      !membership.verifiedAt ||
      !membership.departedAt ||
      membership.departedAt < membership.verifiedAt ||
      membership.validUntil
    )
      invalidMembership("Absent membership requires verified departure metadata.");
  } else if (
    membership.verifiedAt ||
    membership.validUntil ||
    membership.departedAt ||
    membership.roles.length > 0
  ) {
    invalidMembership("Unknown membership cannot carry positive verification data or roles.");
  }

  const roleIds = new Set<string>();
  for (const role of membership.roles) {
    if (role.membershipId !== membership.id)
      invalidMembership("Membership roles must reference their owning membership.");
    if (roleIds.has(role.roleId))
      invalidMembership("Discord membership roles must be unique.");
    if (role.createdAt < membership.createdAt)
      invalidMembership("Membership role creation cannot precede membership creation.");
    roleIds.add(role.roleId);
  }
  if (membership.status !== "PRESENT" && membership.roles.length > 0)
    invalidMembership("Only present memberships may retain role snapshots.");
  return membership;
}

/** Returns true only for a currently verified PRESENT membership. */
export function isAuthorizationPositiveMembership(
  membership: DiscordGuildMembership,
  now: Date,
): boolean {
  validateDiscordGuildMembership(membership);
  return membership.status === "PRESENT" && membership.validUntil! > now;
}

function invalidMembership(message: string): never {
  throw new AuthenticationDomainError("invalid-membership", message);
}
