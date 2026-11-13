import { AuthenticationDomainError } from "./errors.js";
/** Validates all OAuth transaction state/timestamp and binding invariants. */
export function validateOAuthTransaction(transaction) {
    if (transaction.expiresAt <= transaction.createdAt)
        invalidTransaction("OAuth expiry must follow creation.");
    if (transaction.updatedAt < transaction.createdAt)
        invalidTransaction("OAuth updatedAt cannot precede creation.");
    validateConfigurationKey(transaction.redirectKey, "redirect");
    validateConfigurationKey(transaction.returnTargetKey, "return target");
    if (transaction.pkceMode !== "DISABLED_UNVERIFIED" &&
        transaction.pkceMode !== "S256_VERIFIED")
        invalidTransaction("OAuth PKCE mode is invalid.");
    if ((transaction.purpose === "LINK" || transaction.purpose === "REAUTHENTICATE") &&
        (!transaction.platformUserId || !transaction.initiatingSessionId))
        invalidTransaction("Link and reauthentication transactions require a verified account and session.");
    if (transaction.purpose === "LOGIN" && transaction.initiatingSessionId)
        invalidTransaction("Login transactions cannot bind an initiating session.");
    if (transaction.encryptedPkceVerifier)
        validateEncryptedSecret(transaction.encryptedPkceVerifier, "PKCE verifier");
    if (transaction.pkceMode === "DISABLED_UNVERIFIED" && transaction.encryptedPkceVerifier)
        invalidTransaction("Disabled PKCE transactions cannot store a verifier.");
    if (transaction.pkceMode === "S256_VERIFIED" && !transaction.encryptedPkceVerifier)
        invalidTransaction("S256 PKCE transactions require an encrypted verifier.");
    const claimedPair = Boolean(transaction.claimedAt) === Boolean(transaction.claimExpiresAt);
    if (!claimedPair)
        invalidTransaction("OAuth claim timestamps must be stored together.");
    if (transaction.claimedAt && transaction.claimExpiresAt <= transaction.claimedAt)
        invalidTransaction("OAuth claim lease must expire after it is claimed.");
    const terminalTimes = [
        transaction.completedAt,
        transaction.failedAt,
        transaction.cancelledAt,
        transaction.expiredAt,
    ].filter(Boolean).length;
    switch (transaction.state) {
        case "PENDING":
            if (transaction.claimedAt || terminalTimes || transaction.failureReason)
                invalidTransaction("Pending OAuth transactions cannot have claim or terminal metadata.");
            break;
        case "CLAIMED":
            if (!transaction.claimedAt || terminalTimes || transaction.failureReason)
                invalidTransaction("Claimed OAuth transactions require only active claim metadata.");
            break;
        case "COMPLETED":
            if (!transaction.claimedAt || !transaction.completedAt || terminalTimes !== 1 || transaction.failureReason)
                invalidTransaction("Completed OAuth transactions require one completion timestamp.");
            break;
        case "FAILED":
            if (!transaction.claimedAt || !transaction.failedAt || terminalTimes !== 1 || !transaction.failureReason)
                invalidTransaction("Failed OAuth transactions require a failure timestamp and reason.");
            break;
        case "CANCELLED":
            if (!transaction.cancelledAt || terminalTimes !== 1 || !transaction.failureReason)
                invalidTransaction("Cancelled OAuth transactions require one timestamp and reason.");
            break;
        case "EXPIRED":
            if (!transaction.expiredAt || terminalTimes !== 1 || transaction.failureReason !== "EXPIRED")
                invalidTransaction("Expired OAuth transactions require the EXPIRED reason.");
            break;
    }
    return transaction;
}
/**
 * Atomically claimable domain transition. A stale CLAIMED lease may be reclaimed;
 * repositories must serialize or conditionally update the persisted row.
 */
export function claimOAuthTransaction(transaction, now, leaseDurationMs) {
    validateOAuthTransaction(transaction);
    if (!Number.isSafeInteger(leaseDurationMs) || leaseDurationMs < 1_000 || leaseDurationMs > 5 * 60_000)
        invalidTransaction("OAuth claim lease must be between one second and five minutes.");
    if (now >= transaction.expiresAt)
        throw new AuthenticationDomainError("oauth-transaction-expired", "The OAuth transaction has expired.");
    if (isTerminalOAuthState(transaction.state))
        throw new AuthenticationDomainError("oauth-transaction-terminal", "A terminal OAuth transaction cannot be claimed again.");
    if (transaction.state === "CLAIMED" && transaction.claimExpiresAt > now)
        throw new AuthenticationDomainError("oauth-transaction-claimed", "The OAuth transaction already has an active claim.");
    return validateOAuthTransaction({
        ...transaction,
        state: "CLAIMED",
        claimedAt: now,
        claimExpiresAt: new Date(now.getTime() + leaseDurationMs),
        updatedAt: now,
    });
}
/** Completes a currently claimed transaction exactly once. */
export function completeOAuthTransaction(transaction, now) {
    requireActiveClaim(transaction, now);
    return validateOAuthTransaction({
        ...transaction,
        state: "COMPLETED",
        completedAt: now,
        updatedAt: now,
    });
}
/** Fails a currently claimed transaction with a structured reason. */
export function failOAuthTransaction(transaction, reason, now) {
    requireActiveClaim(transaction, now);
    return validateOAuthTransaction({
        ...transaction,
        state: "FAILED",
        failedAt: now,
        failureReason: reason,
        updatedAt: now,
    });
}
/** Cancels a pending or claimed transaction without permitting later reuse. */
export function cancelOAuthTransaction(transaction, now) {
    validateOAuthTransaction(transaction);
    if (isTerminalOAuthState(transaction.state))
        terminalTransaction();
    return validateOAuthTransaction({
        ...transaction,
        state: "CANCELLED",
        cancelledAt: now,
        failureReason: "CANCELLED_BY_USER",
        updatedAt: now,
    });
}
/** Marks a pending or claimed transaction expired after its absolute expiry. */
export function expireOAuthTransaction(transaction, now) {
    validateOAuthTransaction(transaction);
    if (isTerminalOAuthState(transaction.state))
        terminalTransaction();
    if (now < transaction.expiresAt)
        invalidTransaction("OAuth transactions cannot expire before expiresAt.");
    return validateOAuthTransaction({
        ...transaction,
        state: "EXPIRED",
        expiredAt: now,
        failureReason: "EXPIRED",
        updatedAt: now,
    });
}
/** Validates encryption envelopes, normalized scopes, refresh version, and revocation. */
export function validateOAuthCredential(credential) {
    validateEncryptedSecret(credential.encryptedAccessToken, "access token");
    validateEncryptedSecret(credential.encryptedRefreshToken, "refresh token");
    if (!Number.isSafeInteger(credential.refreshVersion) || credential.refreshVersion < 1)
        invalidCredential("OAuth refresh version must be a positive integer.");
    if (credential.providerExpiresAt <= credential.createdAt)
        invalidCredential("Provider token expiry must follow credential creation.");
    if (credential.updatedAt < credential.createdAt)
        invalidCredential("OAuth credential updatedAt cannot precede creation.");
    if (Boolean(credential.revokedAt) !== Boolean(credential.revocationReason))
        invalidCredential("OAuth credential revocation timestamp and reason must be stored together.");
    if (credential.revokedAt && credential.revokedAt < credential.createdAt)
        invalidCredential("OAuth credential revocation cannot precede creation.");
    const normalized = [...new Set(credential.scopes)].sort();
    if (credential.scopes.length === 0 ||
        normalized.some((scope) => !/^[a-z][a-z0-9._-]{0,63}$/.test(scope)) ||
        normalized.some((scope, index) => scope !== credential.scopes[index]))
        invalidCredential("OAuth scopes must be unique, sorted, lowercase identifiers.");
    return credential;
}
/** Returns true for states that can never become active again. */
export function isTerminalOAuthState(state) {
    return state === "COMPLETED" || state === "FAILED" || state === "CANCELLED" || state === "EXPIRED";
}
function requireActiveClaim(transaction, now) {
    validateOAuthTransaction(transaction);
    if (transaction.state !== "CLAIMED")
        invalidTransaction("Only a claimed OAuth transaction can complete or fail.");
    if (transaction.claimExpiresAt <= now || transaction.expiresAt <= now)
        throw new AuthenticationDomainError("oauth-transaction-expired", "The OAuth claim lease has expired.");
}
function validateConfigurationKey(value, label) {
    if (!/^[a-z][a-z0-9-]{0,63}$/.test(value))
        invalidTransaction(`OAuth ${label} key is invalid.`);
}
function validateEncryptedSecret(secret, label) {
    if (secret.ciphertext.byteLength < 1 ||
        secret.nonce.byteLength !== 12 ||
        secret.authenticationTag.byteLength !== 16 ||
        !Number.isSafeInteger(secret.keyVersion) ||
        secret.keyVersion < 1)
        invalidCredential(`Encrypted ${label} metadata is invalid.`);
}
function terminalTransaction() {
    throw new AuthenticationDomainError("oauth-transaction-terminal", "A terminal OAuth transaction cannot transition again.");
}
function invalidTransaction(message) {
    throw new AuthenticationDomainError("invalid-oauth-transaction", message);
}
function invalidCredential(message) {
    throw new AuthenticationDomainError("invalid-oauth-credential", message);
}
//# sourceMappingURL=oauth.js.map