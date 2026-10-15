import { authenticationAuditEventId, authenticationDigest, browserSessionId, discordGuildMembershipId, externalIdentityId, oauthCredentialId, oauthTransactionId, platformUserId, type AuthenticationCrypto, type AuthenticationIdGenerator, type AuthenticationKeyHandle, type AuthenticationKeyProvider, type EncryptedAuthenticationSecret, type OpaqueAuthenticationSecret } from "@qbox/authentication";
declare const resolveKeyMaterial: unique symbol;
/** Authentication cryptographic key purpose supported by the injected key ring. */
export type AuthenticationKeyPurpose = AuthenticationKeyHandle["purpose"];
/** Constructor-only key registration; callers must not retain or log material. */
export interface AuthenticationKeyRegistration {
    /** Cryptographic separation purpose. */
    readonly purpose: AuthenticationKeyPurpose;
    /** Positive persisted key version. */
    readonly version: number;
    /** Raw process-provisioned key bytes copied immediately by the key ring. */
    readonly material: Uint8Array;
    /** Whether this version creates new cryptographic material. */
    readonly active: boolean;
}
/** Safe serialized key diagnostic containing no bytes or secret-derived values. */
export interface AuthenticationKeyDiagnostic {
    /** Key purpose. */
    readonly purpose: AuthenticationKeyPurpose;
    /** Persisted version number. */
    readonly version: number;
    /** Whether the version is active for new material. */
    readonly active: boolean;
    /** Whether the version remains available for verification/decryption. */
    readonly retained: boolean;
}
/**
 * Injected process-level bounded authentication key ring.
 *
 * It reads no environment state, copies all key material at construction, never
 * serializes bytes, and exposes only opaque domain handles. One active key is
 * required for each registered purpose. Retained candidates are bounded to keep
 * session verification work predictable in every process.
 */
export declare class AuthenticationKeyRing implements AuthenticationKeyProvider {
    #private;
    /** Validates and copies all injected key registrations. */
    constructor(registrations: readonly AuthenticationKeyRegistration[]);
    /** Returns the non-secret active handle for one purpose. */
    active(purpose: AuthenticationKeyPurpose): Promise<AuthenticationKeyHandle>;
    /** Returns one retained non-secret handle by purpose/version. */
    byVersion(purpose: AuthenticationKeyPurpose, version: number): Promise<AuthenticationKeyHandle | undefined>;
    /** Returns active first followed by retained versions in descending order. */
    verificationCandidates(purpose: AuthenticationKeyPurpose): Promise<readonly AuthenticationKeyHandle[]>;
    /** Returns frozen non-secret diagnostics for startup observability. */
    diagnostics(): readonly AuthenticationKeyDiagnostic[];
    /** Creates the only native crypto adapter allowed to resolve this ring's handles. */
    createCrypto(): NodeAuthenticationCrypto;
    /** @internal Resolves a copied key only for the symbol-bound native crypto adapter. */
    [resolveKeyMaterial](handle: AuthenticationKeyHandle): Uint8Array;
}
/**
 * Node 22 native authentication cryptography adapter.
 *
 * Secrets use base64url, HMACs use lowercase hexadecimal SHA-256, and encrypted
 * provider values use AES-256-GCM with 12-byte nonces, 16-byte tags, and caller-
 * supplied associated data. Instances are stateless and safe for concurrent use.
 */
export declare class NodeAuthenticationCrypto implements AuthenticationCrypto {
    private readonly keys;
    /** Construction is intentionally limited to an injected key ring. */
    constructor(keys: AuthenticationKeyRing);
    /** Generates at least 32 random bytes and returns a bounded base64url value. */
    createOpaqueSecret(byteLength: number): Promise<OpaqueAuthenticationSecret>;
    /** Computes a 64-character lowercase HMAC-SHA-256 digest. */
    hmac(value: OpaqueAuthenticationSecret | string, key: AuthenticationKeyHandle): Promise<ReturnType<typeof authenticationDigest>>;
    /** Encrypts bounded UTF-8 plaintext with fresh AES-256-GCM nonce and AAD. */
    encrypt(plaintext: OpaqueAuthenticationSecret, key: AuthenticationKeyHandle, associatedData: string): Promise<EncryptedAuthenticationSecret>;
    /** Decrypts only after AES-GCM tag and associated-data verification succeeds. */
    decrypt(encrypted: EncryptedAuthenticationSecret, key: AuthenticationKeyHandle, associatedData: string): Promise<OpaqueAuthenticationSecret>;
    /** Compares canonical HMAC digests with Node's constant-time primitive. */
    constantTimeEqual(left: ReturnType<typeof authenticationDigest>, right: ReturnType<typeof authenticationDigest>): Promise<boolean>;
}
/** Cryptographically secure UUID identifier generator for authentication services. */
export declare class NodeAuthenticationIdGenerator implements AuthenticationIdGenerator {
    /** Creates a new canonical platform-user UUID. */
    platformUserId(): ReturnType<typeof platformUserId>;
    /** Creates a new canonical external-identity UUID. */
    externalIdentityId(): ReturnType<typeof externalIdentityId>;
    /** Creates a new canonical browser-session UUID. */
    browserSessionId(): ReturnType<typeof browserSessionId>;
    /** Creates a new canonical OAuth-transaction UUID. */
    oauthTransactionId(): ReturnType<typeof oauthTransactionId>;
    /** Creates a new canonical OAuth-credential UUID. */
    oauthCredentialId(): ReturnType<typeof oauthCredentialId>;
    /** Creates a new canonical Discord guild-membership UUID. */
    discordGuildMembershipId(): ReturnType<typeof discordGuildMembershipId>;
    /** Creates a new canonical authentication-audit UUID. */
    authenticationAuditEventId(): ReturnType<typeof authenticationAuditEventId>;
}
export {};
//# sourceMappingURL=NodeAuthenticationCryptography.d.ts.map