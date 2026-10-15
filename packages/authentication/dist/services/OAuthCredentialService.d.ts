import type { ExternalIdentityId, OAuthCredentialId, OpaqueAuthenticationSecret } from "../identifiers.js";
import type { OAuthCredential, OAuthCredentialRevocationReason, OAuthProvider } from "../oauth.js";
import type { AuthenticationClock, AuthenticationCrypto, AuthenticationIdGenerator, AuthenticationKeyProvider, AuthenticationUnitOfWork, DiscordOAuthProvider, DiscordOAuthTokenResult } from "../ports.js";
import type { AuthenticationOperationContext } from "./AuthenticationServiceContracts.js";
/** Raw provider grant accepted only before immediate server-side encryption. */
export interface PersistOAuthGrantInput {
    /** Existing linked external identity that owns the provider credential. */
    readonly externalIdentityId: ExternalIdentityId;
    /** Verified provider token response with ephemeral plaintext tokens. */
    readonly tokenResult: DiscordOAuthTokenResult;
    /** Trusted operation evidence for mandatory audit. */
    readonly context: AuthenticationOperationContext;
}
/** Ephemeral decrypted access credential returned for one provider operation. */
export interface UsableOAuthAccessCredential {
    /** Persisted credential identifier. */
    readonly credentialId: OAuthCredentialId;
    /** Current decrypted access token; callers must never store or log it. */
    readonly accessToken: OpaqueAuthenticationSecret;
    /** Provider token expiry. */
    readonly expiresAt: Date;
    /** Refresh version used in encryption associated data. */
    readonly refreshVersion: number;
}
/** Dependencies for encrypted OAuth credential lifecycle orchestration. */
export interface OAuthCredentialServiceDependencies {
    /** Atomic authentication persistence boundary. */
    readonly unitOfWork: AuthenticationUnitOfWork;
    /** Injectable security clock. */
    readonly clock: AuthenticationClock;
    /** Native cryptography boundary. */
    readonly crypto: AuthenticationCrypto;
    /** Process key-provider boundary. */
    readonly keys: AuthenticationKeyProvider;
    /** Identifier generator for new credential and audit IDs. */
    readonly ids: AuthenticationIdGenerator;
    /** Discord provider boundary used only outside database transactions. */
    readonly provider: DiscordOAuthProvider;
    /** Bounded refresh skew before provider expiry. */
    readonly refreshSkewMs?: number;
}
/**
 * Transport-independent encrypted provider-credential lifecycle service.
 *
 * The service never exposes persisted ciphertext as a usable credential, never
 * performs provider network calls inside a database transaction, and appends
 * mandatory audit rows in the same transaction as every credential mutation.
 */
export declare class OAuthCredentialService {
    #private;
    /** Constructs the service without reading environment or opening connections. */
    constructor(dependencies: OAuthCredentialServiceDependencies);
    /** Encrypts and stores an initial Discord grant for an existing identity. */
    persistInitialGrant(input: PersistOAuthGrantInput): Promise<OAuthCredential>;
    /** Creates or replaces the encrypted Discord grant during an interactive login. */
    persistLoginGrant(input: PersistOAuthGrantInput): Promise<OAuthCredential>;
    /**
     * Loads and decrypts an access token, refreshing first when it is within the
     * configured skew. Any provider refresh occurs outside database transactions.
     */
    loadUsableAccessCredential(externalIdentityId: ExternalIdentityId, context: AuthenticationOperationContext, signal: AbortSignal): Promise<UsableOAuthAccessCredential>;
    /** Refreshes one provider grant with optimistic replacement and audit. */
    refreshGrant(externalIdentityId: ExternalIdentityId, context: AuthenticationOperationContext, signal: AbortSignal): Promise<OAuthCredential>;
    /** Locally revokes a provider credential and audits the decision atomically. */
    revokeLocalGrant(externalIdentityId: ExternalIdentityId, reason: OAuthCredentialRevocationReason, context: AuthenticationOperationContext): Promise<OAuthCredential>;
    /** Decrypts one token for a caller-managed best-effort provider revocation. */
    prepareProviderRevocationMaterial(externalIdentityId: ExternalIdentityId, tokenType: "access" | "refresh"): Promise<UsableOAuthAccessCredential>;
}
/** Builds stable encryption associated data for OAuth provider tokens. */
export declare function associatedData(provider: OAuthProvider, externalIdentityId: ExternalIdentityId, credentialId: OAuthCredentialId, tokenType: "access" | "refresh", refreshVersion: number): string;
//# sourceMappingURL=OAuthCredentialService.d.ts.map