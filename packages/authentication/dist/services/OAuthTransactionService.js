import { AuthenticationServiceError } from "../errors.js";
import { cancelOAuthTransaction, completeOAuthTransaction, expireOAuthTransaction, failOAuthTransaction, isTerminalOAuthState, } from "../oauth.js";
const SECRET_BYTES = 32;
const DEFAULT_TRANSACTION_LIFETIME_MS = 10 * 60_000;
const DEFAULT_CLAIM_LEASE_MS = 60_000;
const MAX_TRANSACTION_LIFETIME_MS = 30 * 60_000;
const MAX_RETAINED_HMAC_KEYS = 4;
/**
 * One-time OAuth transaction application service with no provider or HTTP work.
 * State and browser-binding values are independently generated, stored only as
 * keyed digests, and every persisted state transition is audited atomically.
 */
export class OAuthTransactionService {
    #unitOfWork;
    #clock;
    #crypto;
    #keys;
    #ids;
    #claimLeaseMs;
    /** Constructs the lifecycle service without creating a transaction. */
    constructor(dependencies) {
        this.#unitOfWork = dependencies.unitOfWork;
        this.#clock = dependencies.clock;
        this.#crypto = dependencies.crypto;
        this.#keys = dependencies.keys;
        this.#ids = dependencies.ids;
        this.#claimLeaseMs = dependencies.claimLeaseMs ?? DEFAULT_CLAIM_LEASE_MS;
        if (!Number.isSafeInteger(this.#claimLeaseMs) ||
            this.#claimLeaseMs < 1_000 ||
            this.#claimLeaseMs > 5 * 60_000)
            throw new RangeError("OAuth claim lease must be between one second and five minutes.");
    }
    /** Creates and audits a PENDING transaction, returning raw values only after commit. */
    async createTransaction(input) {
        const now = this.#clock.now();
        const lifetimeMs = input.lifetimeMs ?? DEFAULT_TRANSACTION_LIFETIME_MS;
        if (!Number.isSafeInteger(lifetimeMs) ||
            lifetimeMs < 60_000 ||
            lifetimeMs > MAX_TRANSACTION_LIFETIME_MS)
            throw new RangeError("OAuth transaction lifetime is outside reviewed bounds.");
        const [state, browserBinding, stateKey, bindingKey] = await Promise.all([
            this.#crypto.createOpaqueSecret(SECRET_BYTES),
            this.#crypto.createOpaqueSecret(SECRET_BYTES),
            this.#keys.active("SESSION_HMAC"),
            this.#keys.active("CSRF_HMAC"),
        ]);
        const [stateDigest, browserBindingDigest] = await Promise.all([
            this.#crypto.hmac(state, stateKey),
            this.#crypto.hmac(browserBinding, bindingKey),
        ]);
        const id = this.#ids.oauthTransactionId();
        const expiresAt = new Date(now.getTime() + lifetimeMs);
        const transaction = {
            id,
            provider: "DISCORD",
            purpose: input.purpose,
            state: "PENDING",
            stateDigest,
            browserBindingDigest,
            ...(input.platformUserId ? { platformUserId: input.platformUserId } : {}),
            ...(input.initiatingSessionId
                ? { initiatingSessionId: input.initiatingSessionId }
                : {}),
            redirectKey: input.redirectKey,
            returnTargetKey: input.returnTargetKey,
            pkceMode: input.pkceMode ?? "DISABLED_UNVERIFIED",
            ...(input.encryptedPkceVerifier
                ? { encryptedPkceVerifier: input.encryptedPkceVerifier }
                : {}),
            expiresAt,
            createdAt: now,
            updatedAt: now,
        };
        await this.#unitOfWork.run(async (repositories) => {
            const created = await repositories.oauthTransactions.create(transaction);
            await repositories.audit.append(this.#audit(input.context, created, "LOGIN_START", "REQUESTED", now));
        });
        return Object.freeze({ transactionId: id, state, browserBinding, expiresAt });
    }
    /** Verifies raw state/binding values and atomically claims or reclaims the lease. */
    async claimTransaction(state, browserBinding, context) {
        const now = this.#clock.now();
        const result = await this.#unitOfWork.run(async (repositories) => {
            const transaction = await this.#findByState(repositories, state);
            if (!transaction)
                throw new AuthenticationServiceError("oauth-state-invalid", "The OAuth transaction could not be verified.");
            if (isTerminalOAuthState(transaction.state)) {
                await repositories.audit.append(this.#audit(context, transaction, "OAUTH_REPLAY", "REPLAY_DETECTED", now));
                return { kind: "terminal" };
            }
            try {
                await this.#verifyBrowserBinding(transaction, browserBinding);
            }
            catch (error) {
                if (!(error instanceof AuthenticationServiceError))
                    throw error;
                await repositories.audit.append(this.#audit(context, transaction, "OAUTH_REJECTION", "INVALID_STATE", now));
                return { kind: "binding-rejected" };
            }
            const reclaimed = transaction.state === "CLAIMED" && transaction.claimExpiresAt <= now;
            const claimed = await repositories.oauthTransactions.claim(transaction.id, now, new Date(now.getTime() + this.#claimLeaseMs));
            await repositories.audit.append(this.#audit(context, claimed, "OAUTH_CLAIM", "COMPLETED", now, {
                reclaimed,
            }));
            return {
                kind: "claimed",
                value: Object.freeze({ transaction: claimed, reclaimed }),
            };
        });
        if (result.kind === "terminal")
            throw new AuthenticationServiceError("oauth-transaction-terminal", "The OAuth transaction is no longer active.");
        if (result.kind === "binding-rejected")
            throw new AuthenticationServiceError("oauth-browser-binding-invalid", "The OAuth browser binding could not be verified.");
        return result.value;
    }
    /** Completes a currently claimed transaction exactly once with atomic audit. */
    async completeTransaction(id, context) {
        return this.#transition(id, context, (transaction, now) => completeOAuthTransaction(transaction, now));
    }
    /** Fails a claimed transaction with a closed provider/application reason. */
    async failTransaction(id, reason, context) {
        return this.#transition(id, context, (transaction, now) => failOAuthTransaction(transaction, reason, now));
    }
    /** Cancels a pending or claimed transaction without permitting later reuse. */
    async cancelTransaction(id, context) {
        return this.#transition(id, context, cancelOAuthTransaction);
    }
    /** Marks an active transaction expired only after its persisted absolute expiry. */
    async expireTransaction(id, context) {
        return this.#transition(id, context, expireOAuthTransaction);
    }
    async #transition(id, context, transition) {
        const now = this.#clock.now();
        return this.#unitOfWork.run(async (repositories) => {
            const current = await repositories.oauthTransactions.findById(id);
            if (!current)
                throw new AuthenticationServiceError("oauth-state-invalid", "The OAuth transaction could not be found.");
            const next = transition(current, now);
            const persisted = await repositories.oauthTransactions.transition(next, current.state);
            const success = persisted.state === "COMPLETED";
            await repositories.audit.append(this.#audit(context, persisted, success ? "OAUTH_COMPLETION" : "OAUTH_REJECTION", success ? "COMPLETED" : reasonForState(persisted), now));
            return persisted;
        });
    }
    async #findByState(repositories, state) {
        const keys = await candidates(this.#keys, "SESSION_HMAC");
        for (const key of keys) {
            const digest = await this.#crypto.hmac(state, key);
            const transaction = await repositories.oauthTransactions.findByStateDigest(digest);
            if (transaction)
                return transaction;
        }
        return undefined;
    }
    async #verifyBrowserBinding(transaction, binding) {
        const keys = await candidates(this.#keys, "CSRF_HMAC");
        for (const key of keys) {
            const digest = await this.#crypto.hmac(binding, key);
            if (await this.#crypto.constantTimeEqual(digest, transaction.browserBindingDigest))
                return;
        }
        throw new AuthenticationServiceError("oauth-browser-binding-invalid", "The OAuth browser binding could not be verified.");
    }
    #audit(context, transaction, action, reasonCode, occurredAt, metadata = {}) {
        return {
            id: this.#ids.authenticationAuditEventId(),
            action,
            outcome: action === "OAUTH_REJECTION"
                ? "FAILURE"
                : action === "OAUTH_REPLAY"
                    ? "REJECTED"
                    : "SUCCESS",
            reasonCode,
            ...(context.requestId ? { requestId: context.requestId } : {}),
            correlationId: context.correlationId,
            ...(context.actor ? { actor: context.actor } : {}),
            target: {
                ...(transaction.platformUserId
                    ? { platformUserId: transaction.platformUserId }
                    : {}),
                oauthTransactionId: transaction.id,
            },
            provider: transaction.provider,
            purpose: transaction.purpose,
            metadata: Object.freeze({ ...(context.metadata ?? {}), ...metadata }),
            occurredAt,
            createdAt: occurredAt,
        };
    }
}
async function candidates(keys, purpose) {
    const values = await keys.verificationCandidates(purpose);
    if (values.length < 1 || values.length > MAX_RETAINED_HMAC_KEYS)
        throw new AuthenticationServiceError("cryptography-failed", "Authentication key verification candidates are unavailable.");
    return values;
}
function reasonForState(transaction) {
    if (transaction.state === "EXPIRED")
        return "EXPIRED";
    if (transaction.state === "CANCELLED")
        return "USER_ACTION";
    if (transaction.failureReason === "PROVIDER_REJECTED")
        return "PROVIDER_REJECTED";
    if (transaction.failureReason === "DEPENDENCY_UNAVAILABLE")
        return "DEPENDENCY_UNAVAILABLE";
    return "INVALID_STATE";
}
//# sourceMappingURL=OAuthTransactionService.js.map