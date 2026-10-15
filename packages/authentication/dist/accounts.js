import { AuthenticationDomainError } from "./errors.js";
/** Validates account state/timestamp and positive revision invariants. */
export function validatePlatformUser(user) {
    if (!Number.isSafeInteger(user.authenticationRevision) || user.authenticationRevision < 1)
        invalidAccount("Authentication revision must be a positive integer.");
    if (user.updatedAt < user.createdAt)
        invalidAccount("Platform-user updatedAt cannot precede createdAt.");
    const expected = {
        ACTIVE: [false, false, false],
        SUSPENDED: [true, false, false],
        DISABLED: [false, true, false],
        DELETED: [false, false, true],
    }[user.status];
    const actual = [Boolean(user.suspendedAt), Boolean(user.disabledAt), Boolean(user.deletedAt)];
    if (!expected.every((value, index) => value === actual[index]))
        invalidAccount(`Platform-user timestamps are inconsistent with ${user.status}.`);
    for (const timestamp of [user.suspendedAt, user.disabledAt, user.deletedAt]) {
        if (timestamp && timestamp < user.createdAt)
            invalidAccount("Platform-user lifecycle timestamps cannot precede createdAt.");
    }
    return user;
}
/**
 * Applies a reviewed account lifecycle transition and increments the revision so
 * previously issued sessions can be invalidated by future services.
 */
export function transitionPlatformUser(user, status, reasonCode, occurredAt) {
    validatePlatformUser(user);
    if (user.status === "DELETED")
        invalidAccount("Deleted platform users cannot transition to another state.");
    if (occurredAt < user.updatedAt)
        invalidAccount("Account transitions cannot move backward in time.");
    const next = {
        id: user.id,
        status,
        statusReasonCode: reasonCode,
        authenticationRevision: user.authenticationRevision + 1,
        ...(status === "SUSPENDED" ? { suspendedAt: occurredAt } : {}),
        ...(status === "DISABLED" ? { disabledAt: occurredAt } : {}),
        ...(status === "DELETED" ? { deletedAt: occurredAt } : {}),
        createdAt: user.createdAt,
        updatedAt: occurredAt,
    };
    return validatePlatformUser(next);
}
/** Validates provider ownership, lifecycle, snowflake, and profile bounds. */
export function validateExternalIdentity(identity) {
    if (identity.provider !== "DISCORD")
        identityConflict("Only Discord external identities are supported initially.");
    if (identity.enabled === Boolean(identity.unlinkedAt))
        identityConflict("Enabled and unlinked identity state is inconsistent.");
    if (identity.linkedAt < identity.createdAt || identity.verifiedAt < identity.linkedAt)
        identityConflict("Identity verification timestamps are inconsistent.");
    if (identity.updatedAt < identity.createdAt)
        identityConflict("Identity updatedAt cannot precede createdAt.");
    if (identity.lastProviderRefreshAt && identity.lastProviderRefreshAt < identity.verifiedAt)
        identityConflict("Provider refresh cannot precede identity verification.");
    if (identity.unlinkedAt && identity.unlinkedAt < identity.linkedAt)
        identityConflict("Identity unlinking cannot precede linking.");
    validateProfileValue(identity.profile.username, 80, "username");
    validateProfileValue(identity.profile.globalName, 80, "global name");
    validateProfileValue(identity.profile.avatar, 512, "avatar");
    return identity;
}
/**
 * Enforces the initial one-Discord-identity-per-account policy over a repository
 * snapshot. Unlinked identities remain ownership records and still participate.
 */
export function validateExternalIdentityOwnership(identities) {
    const subjects = new Set();
    const accountProviders = new Set();
    for (const identity of identities) {
        validateExternalIdentity(identity);
        const subject = `${identity.provider}:${identity.providerSubjectId}`;
        const ownerProvider = `${identity.platformUserId}:${identity.provider}`;
        if (subjects.has(subject))
            identityConflict("A provider subject cannot belong to multiple platform accounts.");
        if (accountProviders.has(ownerProvider))
            identityConflict("A platform account may have only one Discord identity initially.");
        subjects.add(subject);
        accountProviders.add(ownerProvider);
    }
    return identities;
}
function validateProfileValue(value, maximum, label) {
    if (value !== undefined && (value.length > maximum || /[\u0000-\u001f\u007f]/.test(value)))
        identityConflict(`Discord ${label} snapshot is not safely bounded.`);
}
function invalidAccount(message) {
    throw new AuthenticationDomainError("invalid-account-state", message);
}
function identityConflict(message) {
    throw new AuthenticationDomainError("identity-ownership-conflict", message);
}
//# sourceMappingURL=accounts.js.map