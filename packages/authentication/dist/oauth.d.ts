import type { AuthenticationDigest, BrowserSessionId, ExternalIdentityId, OAuthCredentialId, OAuthTransactionId, PlatformUserId } from "./identifiers.js";
/** Initial and currently exclusive external authentication provider. */
export type OAuthProvider = "DISCORD";
/** Purpose bound to a one-time OAuth transaction. */
export type OAuthTransactionPurpose = "LOGIN" | "LINK" | "REAUTHENTICATE";
/** Closed state machine for one-time OAuth browser transactions. */
export type OAuthTransactionState = "PENDING" | "CLAIMED" | "COMPLETED" | "FAILED" | "CANCELLED" | "EXPIRED";
/** Structured terminal failure causes safe for persistence and audit. */
export type OAuthTransactionFailureReason = "PROVIDER_REJECTED" | "INVALID_CALLBACK" | "STATE_MISMATCH" | "BROWSER_BINDING_MISMATCH" | "PKCE_MISMATCH" | "IDENTITY_CONFLICT" | "DEPENDENCY_UNAVAILABLE" | "CANCELLED_BY_USER" | "EXPIRED";
/** Transaction-specific PKCE decision recorded at OAuth transaction creation. */
export type OAuthPkceMode = "DISABLED_UNVERIFIED" | "S256_VERIFIED";
/** Encrypted secret envelope; ciphertext, nonce, and tag are never plaintext. */
export interface EncryptedAuthenticationSecret {
    readonly ciphertext: Uint8Array;
    readonly nonce: Uint8Array;
    readonly authenticationTag: Uint8Array;
    readonly keyVersion: number;
}
/**
 * Persisted one-time OAuth transaction. State and browser binding are keyed-HMAC
 * digests; optional PKCE material is encrypted and never exposed to clients.
 */
export interface OAuthTransaction {
    readonly id: OAuthTransactionId;
    readonly provider: OAuthProvider;
    readonly purpose: OAuthTransactionPurpose;
    readonly state: OAuthTransactionState;
    readonly stateDigest: AuthenticationDigest;
    readonly browserBindingDigest: AuthenticationDigest;
    readonly platformUserId?: PlatformUserId;
    readonly initiatingSessionId?: BrowserSessionId;
    readonly redirectKey: string;
    readonly returnTargetKey: string;
    readonly pkceMode: OAuthPkceMode;
    readonly encryptedPkceVerifier?: EncryptedAuthenticationSecret;
    readonly expiresAt: Date;
    readonly claimedAt?: Date;
    readonly claimExpiresAt?: Date;
    readonly completedAt?: Date;
    readonly failedAt?: Date;
    readonly cancelledAt?: Date;
    readonly expiredAt?: Date;
    readonly failureReason?: OAuthTransactionFailureReason;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
/** Structured OAuth credential revocation reason. */
export type OAuthCredentialRevocationReason = "IDENTITY_UNLINKED" | "ACCOUNT_DISABLED" | "PROVIDER_REVOKED" | "SECURITY_RESPONSE" | "REFRESH_FAILED";
/**
 * Persistable encrypted provider credential. Plaintext access and refresh tokens
 * are structurally absent; adapters decrypt only inside a bounded provider call.
 */
export interface OAuthCredential {
    readonly id: OAuthCredentialId;
    readonly externalIdentityId: ExternalIdentityId;
    readonly provider: OAuthProvider;
    readonly encryptedAccessToken: EncryptedAuthenticationSecret;
    readonly encryptedRefreshToken: EncryptedAuthenticationSecret;
    readonly scopes: readonly string[];
    readonly providerExpiresAt: Date;
    readonly refreshVersion: number;
    readonly revokedAt?: Date;
    readonly revocationReason?: OAuthCredentialRevocationReason;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
/** Validates all OAuth transaction state/timestamp and binding invariants. */
export declare function validateOAuthTransaction(transaction: OAuthTransaction): OAuthTransaction;
/**
 * Atomically claimable domain transition. A stale CLAIMED lease may be reclaimed;
 * repositories must serialize or conditionally update the persisted row.
 */
export declare function claimOAuthTransaction(transaction: OAuthTransaction, now: Date, leaseDurationMs: number): OAuthTransaction;
/** Completes a currently claimed transaction exactly once. */
export declare function completeOAuthTransaction(transaction: OAuthTransaction, now: Date): OAuthTransaction;
/** Fails a currently claimed transaction with a structured reason. */
export declare function failOAuthTransaction(transaction: OAuthTransaction, reason: Exclude<OAuthTransactionFailureReason, "CANCELLED_BY_USER" | "EXPIRED">, now: Date): OAuthTransaction;
/** Cancels a pending or claimed transaction without permitting later reuse. */
export declare function cancelOAuthTransaction(transaction: OAuthTransaction, now: Date): OAuthTransaction;
/** Marks a pending or claimed transaction expired after its absolute expiry. */
export declare function expireOAuthTransaction(transaction: OAuthTransaction, now: Date): OAuthTransaction;
/** Validates encryption envelopes, normalized scopes, refresh version, and revocation. */
export declare function validateOAuthCredential(credential: OAuthCredential): OAuthCredential;
/** Returns true for states that can never become active again. */
export declare function isTerminalOAuthState(state: OAuthTransactionState): boolean;
//# sourceMappingURL=oauth.d.ts.map