import { createCipheriv, createDecipheriv, createHmac, randomBytes, randomUUID, timingSafeEqual, } from "node:crypto";
import { AuthenticationServiceError, authenticationAuditEventId, authenticationDigest, browserSessionId, discordGuildMembershipId, externalIdentityId, oauthCredentialId, oauthTransactionId, opaqueAuthenticationSecret, providerIssuedSecret, platformUserId, } from "@qbox/authentication";
const resolveKeyMaterial = Symbol("resolve-authentication-key-material");
const MAX_RETAINED_VERSIONS = 4;
const MIN_HMAC_KEY_BYTES = 32;
const AES_256_KEY_BYTES = 32;
const GCM_NONCE_BYTES = 12;
const GCM_TAG_BYTES = 16;
/**
 * Injected process-level bounded authentication key ring.
 *
 * It reads no environment state, copies all key material at construction, never
 * serializes bytes, and exposes only opaque domain handles. One active key is
 * required for each registered purpose. Retained candidates are bounded to keep
 * session verification work predictable in every process.
 */
export class AuthenticationKeyRing {
    #keys = new Map();
    /** Validates and copies all injected key registrations. */
    constructor(registrations) {
        const grouped = new Map();
        for (const registration of registrations) {
            validateRegistration(registration);
            const current = grouped.get(registration.purpose) ?? [];
            if (current.some((key) => key.handle.version === registration.version))
                throw new RangeError("Authentication key purpose/version is duplicated.");
            current.push({
                handle: Object.freeze({
                    purpose: registration.purpose,
                    version: registration.version,
                    identifier: `${registration.purpose.toLowerCase()}:v${registration.version}`,
                }),
                material: new Uint8Array(registration.material),
                active: registration.active,
            });
            grouped.set(registration.purpose, current);
        }
        for (const [purpose, keys] of grouped) {
            if (keys.length > MAX_RETAINED_VERSIONS)
                throw new RangeError(`Authentication purpose ${purpose} retains too many versions.`);
            if (keys.filter((key) => key.active).length !== 1)
                throw new RangeError(`Authentication purpose ${purpose} requires one active key.`);
            this.#keys.set(purpose, Object.freeze([...keys].sort((left, right) => right.handle.version - left.handle.version)));
        }
    }
    /** Returns the non-secret active handle for one purpose. */
    async active(purpose) {
        const key = this.#requiredPurpose(purpose).find((candidate) => candidate.active);
        if (!key)
            throw cryptographyFailure();
        return key.handle;
    }
    /** Returns one retained non-secret handle by purpose/version. */
    async byVersion(purpose, version) {
        return this.#requiredPurpose(purpose).find((candidate) => candidate.handle.version === version)?.handle;
    }
    /** Returns active first followed by retained versions in descending order. */
    async verificationCandidates(purpose) {
        const keys = this.#requiredPurpose(purpose);
        const active = keys.find((candidate) => candidate.active);
        return Object.freeze([
            active.handle,
            ...keys.filter((candidate) => candidate !== active).map((candidate) => candidate.handle),
        ]);
    }
    /** Returns frozen non-secret diagnostics for startup observability. */
    diagnostics() {
        return Object.freeze([...this.#keys.values()]
            .flat()
            .map((key) => Object.freeze({
            purpose: key.handle.purpose,
            version: key.handle.version,
            active: key.active,
            retained: true,
        }))
            .sort((left, right) => left.purpose.localeCompare(right.purpose) || left.version - right.version));
    }
    /** Creates the only native crypto adapter allowed to resolve this ring's handles. */
    createCrypto() {
        return new NodeAuthenticationCrypto(this);
    }
    /** @internal Resolves a copied key only for the symbol-bound native crypto adapter. */
    [resolveKeyMaterial](handle) {
        const key = this.#requiredPurpose(handle.purpose).find((candidate) => candidate.handle.version === handle.version &&
            candidate.handle.identifier === handle.identifier);
        if (!key)
            throw cryptographyFailure();
        return new Uint8Array(key.material);
    }
    #requiredPurpose(purpose) {
        const keys = this.#keys.get(purpose);
        if (!keys)
            throw cryptographyFailure();
        return keys;
    }
}
/**
 * Node 22 native authentication cryptography adapter.
 *
 * Secrets use base64url, HMACs use lowercase hexadecimal SHA-256, and encrypted
 * provider values use AES-256-GCM with 12-byte nonces, 16-byte tags, and caller-
 * supplied associated data. Instances are stateless and safe for concurrent use.
 */
export class NodeAuthenticationCrypto {
    keys;
    /** Construction is intentionally limited to an injected key ring. */
    constructor(keys) {
        this.keys = keys;
    }
    /** Generates at least 32 random bytes and returns a bounded base64url value. */
    async createOpaqueSecret(byteLength) {
        if (!Number.isSafeInteger(byteLength) || byteLength < 32 || byteLength > 256)
            throw new RangeError("Authentication secrets require between 32 and 256 bytes.");
        return opaqueAuthenticationSecret(randomBytes(byteLength).toString("base64url"));
    }
    /** Computes a 64-character lowercase HMAC-SHA-256 digest. */
    async hmac(value, key) {
        const material = this.keys[resolveKeyMaterial](key);
        try {
            return authenticationDigest(createHmac("sha256", material).update(value, "utf8").digest("hex"));
        }
        finally {
            material.fill(0);
        }
    }
    /** Encrypts bounded UTF-8 plaintext with fresh AES-256-GCM nonce and AAD. */
    async encrypt(plaintext, key, associatedData) {
        requireEncryptionKey(key);
        validateAssociatedData(associatedData);
        const material = this.keys[resolveKeyMaterial](key);
        const nonce = randomBytes(GCM_NONCE_BYTES);
        try {
            const cipher = createCipheriv("aes-256-gcm", material, nonce, {
                authTagLength: GCM_TAG_BYTES,
            });
            cipher.setAAD(Buffer.from(associatedData, "utf8"));
            const ciphertext = Buffer.concat([
                cipher.update(plaintext, "utf8"),
                cipher.final(),
            ]);
            return Object.freeze({
                ciphertext: new Uint8Array(ciphertext),
                nonce: new Uint8Array(nonce),
                authenticationTag: new Uint8Array(cipher.getAuthTag()),
                keyVersion: key.version,
            });
        }
        catch {
            throw cryptographyFailure();
        }
        finally {
            material.fill(0);
        }
    }
    /** Decrypts only after AES-GCM tag and associated-data verification succeeds. */
    async decrypt(encrypted, key, associatedData) {
        requireEncryptionKey(key);
        validateAssociatedData(associatedData);
        if (encrypted.keyVersion !== key.version ||
            encrypted.nonce.byteLength !== GCM_NONCE_BYTES ||
            encrypted.authenticationTag.byteLength !== GCM_TAG_BYTES ||
            encrypted.ciphertext.byteLength < 1)
            throw cryptographyFailure();
        const material = this.keys[resolveKeyMaterial](key);
        try {
            const decipher = createDecipheriv("aes-256-gcm", material, encrypted.nonce, { authTagLength: GCM_TAG_BYTES });
            decipher.setAAD(Buffer.from(associatedData, "utf8"));
            decipher.setAuthTag(Buffer.from(encrypted.authenticationTag));
            const plaintext = Buffer.concat([
                decipher.update(encrypted.ciphertext),
                decipher.final(),
            ]);
            return providerIssuedSecret(plaintext.toString("utf8"));
        }
        catch {
            throw cryptographyFailure();
        }
        finally {
            material.fill(0);
        }
    }
    /** Compares canonical HMAC digests with Node's constant-time primitive. */
    async constantTimeEqual(left, right) {
        const leftBytes = Buffer.from(left, "hex");
        const rightBytes = Buffer.from(right, "hex");
        return leftBytes.byteLength === rightBytes.byteLength && timingSafeEqual(leftBytes, rightBytes);
    }
}
/** Cryptographically secure UUID identifier generator for authentication services. */
export class NodeAuthenticationIdGenerator {
    /** Creates a new canonical platform-user UUID. */
    platformUserId() {
        return platformUserId(randomUUID());
    }
    /** Creates a new canonical external-identity UUID. */
    externalIdentityId() {
        return externalIdentityId(randomUUID());
    }
    /** Creates a new canonical browser-session UUID. */
    browserSessionId() {
        return browserSessionId(randomUUID());
    }
    /** Creates a new canonical OAuth-transaction UUID. */
    oauthTransactionId() {
        return oauthTransactionId(randomUUID());
    }
    /** Creates a new canonical OAuth-credential UUID. */
    oauthCredentialId() {
        return oauthCredentialId(randomUUID());
    }
    /** Creates a new canonical Discord guild-membership UUID. */
    discordGuildMembershipId() {
        return discordGuildMembershipId(randomUUID());
    }
    /** Creates a new canonical authentication-audit UUID. */
    authenticationAuditEventId() {
        return authenticationAuditEventId(randomUUID());
    }
}
function validateRegistration(registration) {
    if (!Number.isSafeInteger(registration.version) || registration.version < 1)
        throw new RangeError("Authentication key versions must be positive integers.");
    const expected = registration.purpose === "OAUTH_ENCRYPTION"
        ? AES_256_KEY_BYTES
        : MIN_HMAC_KEY_BYTES;
    if ((registration.purpose === "OAUTH_ENCRYPTION" &&
        registration.material.byteLength !== expected) ||
        (registration.purpose !== "OAUTH_ENCRYPTION" &&
            registration.material.byteLength < expected))
        throw new RangeError("Authentication key material has an invalid length.");
}
function requireEncryptionKey(key) {
    if (key.purpose !== "OAUTH_ENCRYPTION")
        throw cryptographyFailure();
}
function validateAssociatedData(value) {
    if (value.length < 1 || value.length > 512 || /[\u0000-\u001f\u007f]/.test(value))
        throw cryptographyFailure();
}
function cryptographyFailure() {
    return new AuthenticationServiceError("cryptography-failed", "Authentication cryptography could not complete safely.");
}
//# sourceMappingURL=NodeAuthenticationCryptography.js.map