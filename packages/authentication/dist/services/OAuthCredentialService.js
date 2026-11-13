import { AuthenticationServiceError } from "../errors.js";
const DEFAULT_REFRESH_SKEW_MS = 5 * 60_000;
const MAX_REFRESH_SKEW_MS = 60 * 60_000;
/**
 * Transport-independent encrypted provider-credential lifecycle service.
 *
 * The service never exposes persisted ciphertext as a usable credential, never
 * performs provider network calls inside a database transaction, and appends
 * mandatory audit rows in the same transaction as every credential mutation.
 */
export class OAuthCredentialService {
    #unitOfWork;
    #clock;
    #crypto;
    #keys;
    #ids;
    #provider;
    #refreshSkewMs;
    /** Constructs the service without reading environment or opening connections. */
    constructor(dependencies) {
        this.#unitOfWork = dependencies.unitOfWork;
        this.#clock = dependencies.clock;
        this.#crypto = dependencies.crypto;
        this.#keys = dependencies.keys;
        this.#ids = dependencies.ids;
        this.#provider = dependencies.provider;
        this.#refreshSkewMs = dependencies.refreshSkewMs ?? DEFAULT_REFRESH_SKEW_MS;
        if (!Number.isSafeInteger(this.#refreshSkewMs) ||
            this.#refreshSkewMs < 0 ||
            this.#refreshSkewMs > MAX_REFRESH_SKEW_MS)
            throw new RangeError("OAuth refresh skew is outside reviewed bounds.");
    }
    /** Encrypts and stores an initial Discord grant for an existing identity. */
    async persistInitialGrant(input) {
        const now = this.#clock.now();
        const credentialId = this.#ids.oauthCredentialId();
        const credential = await this.#buildCredential({
            id: credentialId,
            externalIdentityId: input.externalIdentityId,
            tokenResult: input.tokenResult,
            refreshVersion: 1,
            createdAt: now,
            updatedAt: now,
        });
        return this.#unitOfWork.run(async (repositories) => {
            const created = await repositories.oauthCredentials.create(credential);
            await repositories.audit.append(this.#audit(input.context, "OAUTH_COMPLETION", "COMPLETED", now, {
                externalIdentityId: input.externalIdentityId,
                oauthCredentialId: created.id,
            }));
            return created;
        });
    }
    /** Creates or replaces the encrypted Discord grant during an interactive login. */
    async persistLoginGrant(input) {
        const now = this.#clock.now();
        const existing = await this.#unitOfWork.run((repositories) => repositories.oauthCredentials.findByExternalIdentity(input.externalIdentityId));
        if (!existing)
            return this.persistInitialGrant(input);
        const credential = await this.#buildCredential({
            id: existing.id,
            externalIdentityId: input.externalIdentityId,
            tokenResult: input.tokenResult,
            refreshVersion: existing.refreshVersion + 1,
            createdAt: existing.createdAt,
            updatedAt: now,
        });
        return this.#unitOfWork.run(async (repositories) => {
            const updated = await repositories.oauthCredentials.updateEncryptedCredential(existing.id, existing.refreshVersion, credential);
            await repositories.audit.append(this.#audit(input.context, "OAUTH_COMPLETION", "COMPLETED", now, {
                externalIdentityId: input.externalIdentityId,
                oauthCredentialId: updated.id,
            }, { login_replacement: true }));
            return updated;
        });
    }
    /**
     * Loads and decrypts an access token, refreshing first when it is within the
     * configured skew. Any provider refresh occurs outside database transactions.
     */
    async loadUsableAccessCredential(externalIdentityId, context, signal) {
        let current = await this.#readCredential(externalIdentityId);
        // Read again only after a refresh; an unexpired credential is used as read.
        if (current.providerExpiresAt.getTime() - this.#clock.now().getTime() <= this.#refreshSkewMs) {
            await this.refreshGrant(externalIdentityId, context, signal);
            current = await this.#readCredential(externalIdentityId);
        }
        const accessToken = await this.#decryptToken(current, "access");
        return Object.freeze({
            credentialId: current.id,
            accessToken,
            expiresAt: current.providerExpiresAt,
            refreshVersion: current.refreshVersion,
        });
    }
    /** Refreshes one provider grant with optimistic replacement and audit. */
    async refreshGrant(externalIdentityId, context, signal) {
        const current = await this.#readCredential(externalIdentityId);
        const refreshToken = await this.#decryptToken(current, "refresh");
        const tokenResult = await this.#provider.refreshToken({ refreshToken, signal });
        const now = this.#clock.now();
        const next = await this.#buildCredential({
            id: current.id,
            externalIdentityId,
            tokenResult,
            refreshVersion: current.refreshVersion + 1,
            createdAt: current.createdAt,
            updatedAt: now,
        });
        try {
            return await this.#unitOfWork.run(async (repositories) => {
                const updated = await repositories.oauthCredentials.updateEncryptedCredential(current.id, current.refreshVersion, next);
                await repositories.audit.append(this.#audit(context, "OAUTH_COMPLETION", "COMPLETED", now, {
                    externalIdentityId,
                    oauthCredentialId: updated.id,
                }, { refreshed: true }));
                return updated;
            });
        }
        catch (error) {
            if (error &&
                typeof error === "object" &&
                "code" in error &&
                error.code === "credential-refresh-conflict")
                return this.#readCredential(externalIdentityId);
            throw error;
        }
    }
    /** Locally revokes a provider credential and audits the decision atomically. */
    async revokeLocalGrant(externalIdentityId, reason, context) {
        const now = this.#clock.now();
        return this.#unitOfWork.run(async (repositories) => {
            const current = await repositories.oauthCredentials.findByExternalIdentity(externalIdentityId);
            if (!current)
                throw new AuthenticationServiceError("identity-unavailable", "The OAuth credential is unavailable.");
            const revoked = await repositories.oauthCredentials.revoke(current.id, reason, now);
            await repositories.audit.append(this.#audit(context, "OAUTH_REJECTION", "REVOKED", now, {
                externalIdentityId,
                oauthCredentialId: revoked.id,
            }, { local_revocation: true }));
            return revoked;
        });
    }
    /** Decrypts one token for a caller-managed best-effort provider revocation. */
    async prepareProviderRevocationMaterial(externalIdentityId, tokenType) {
        const current = await this.#readCredential(externalIdentityId);
        return Object.freeze({
            credentialId: current.id,
            accessToken: await this.#decryptToken(current, tokenType),
            expiresAt: current.providerExpiresAt,
            refreshVersion: current.refreshVersion,
        });
    }
    async #readCredential(externalIdentityId) {
        return this.#unitOfWork.run(async (repositories) => {
            const credential = await repositories.oauthCredentials.findByExternalIdentity(externalIdentityId);
            if (!credential || credential.revokedAt)
                throw new AuthenticationServiceError("identity-unavailable", "The OAuth credential is unavailable.");
            return credential;
        });
    }
    async #buildCredential(input) {
        const key = await this.#keys.active("OAUTH_ENCRYPTION");
        const [encryptedAccessToken, encryptedRefreshToken] = await Promise.all([
            this.#crypto.encrypt(input.tokenResult.accessToken, key, associatedData("DISCORD", input.externalIdentityId, input.id, "access", input.refreshVersion)),
            this.#crypto.encrypt(input.tokenResult.refreshToken, key, associatedData("DISCORD", input.externalIdentityId, input.id, "refresh", input.refreshVersion)),
        ]);
        return Object.freeze({
            id: input.id,
            externalIdentityId: input.externalIdentityId,
            provider: "DISCORD",
            encryptedAccessToken,
            encryptedRefreshToken,
            scopes: Object.freeze([...new Set(input.tokenResult.scopes)].sort()),
            providerExpiresAt: input.tokenResult.expiresAt,
            refreshVersion: input.refreshVersion,
            createdAt: input.createdAt,
            updatedAt: input.updatedAt,
        });
    }
    async #decryptToken(credential, tokenType) {
        const encrypted = tokenType === "access"
            ? credential.encryptedAccessToken
            : credential.encryptedRefreshToken;
        const key = await this.#keys.byVersion("OAUTH_ENCRYPTION", encrypted.keyVersion);
        if (!key)
            throw new AuthenticationServiceError("cryptography-failed", "Authentication cryptography could not complete safely.");
        return this.#crypto.decrypt(encrypted, key, associatedData(credential.provider, credential.externalIdentityId, credential.id, tokenType, credential.refreshVersion));
    }
    #audit(context, action, reasonCode, occurredAt, target, metadata = {}) {
        return {
            id: this.#ids.authenticationAuditEventId(),
            action,
            outcome: reasonCode === "COMPLETED" ? "SUCCESS" : "REJECTED",
            reasonCode,
            ...(context.requestId ? { requestId: context.requestId } : {}),
            correlationId: context.correlationId,
            ...(context.actor ? { actor: context.actor } : {}),
            target,
            provider: "DISCORD",
            metadata: Object.freeze({ ...(context.metadata ?? {}), ...metadata }),
            occurredAt,
            createdAt: occurredAt,
        };
    }
}
/** Builds stable encryption associated data for OAuth provider tokens. */
export function associatedData(provider, externalIdentityId, credentialId, tokenType, refreshVersion) {
    return `provider=${provider};identity=${externalIdentityId};credential=${credentialId};token=${tokenType};version=${refreshVersion}`;
}
//# sourceMappingURL=OAuthCredentialService.js.map