import { AuthenticationDomainError } from "./errors.js";
/** Validates membership timestamps, normalized role uniqueness, and lifecycle state. */
export function validateDiscordGuildMembership(membership) {
    if (membership.updatedAt < membership.createdAt)
        invalidMembership("Membership updatedAt cannot precede createdAt.");
    if (membership.status === "PRESENT") {
        if (!membership.verifiedAt ||
            !membership.validUntil ||
            membership.validUntil <= membership.verifiedAt ||
            membership.departedAt)
            invalidMembership("Present membership requires a bounded verification window.");
    }
    else if (membership.status === "ABSENT") {
        if (!membership.verifiedAt ||
            !membership.departedAt ||
            membership.departedAt < membership.verifiedAt ||
            membership.validUntil)
            invalidMembership("Absent membership requires verified departure metadata.");
    }
    else if (membership.verifiedAt ||
        membership.validUntil ||
        membership.departedAt ||
        membership.roles.length > 0) {
        invalidMembership("Unknown membership cannot carry positive verification data or roles.");
    }
    const roleIds = new Set();
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
export function isAuthorizationPositiveMembership(membership, now) {
    validateDiscordGuildMembership(membership);
    return membership.status === "PRESENT" && membership.validUntil > now;
}
function invalidMembership(message) {
    throw new AuthenticationDomainError("invalid-membership", message);
}
//# sourceMappingURL=membership.js.map