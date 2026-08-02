import type { AuthenticationAuditEvent } from "../audit.js";
import { AuthenticationServiceError } from "../errors.js";
import type {
  BrowserSessionId,
  OpaqueAuthenticationSecret,
  PlatformUserId,
} from "../identifiers.js";
import {
  cancelOAuthTransaction,
  completeOAuthTransaction,
  expireOAuthTransaction,
  failOAuthTransaction,
  isTerminalOAuthState,
  type EncryptedAuthenticationSecret,
  type OAuthPkceMode,
  type OAuthTransaction,
  type OAuthTransactionFailureReason,
  type OAuthTransactionPurpose,
} from "../oauth.js";
import type {
  AuthenticationClock,
  AuthenticationCrypto,
  AuthenticationIdGenerator,
  AuthenticationKeyHandle,
  AuthenticationKeyProvider,
  AuthenticationTransactionContext,
  AuthenticationUnitOfWork,
} from "../ports.js";
import type {
  AuthenticationOperationContext,
  ClaimedOAuthTransaction,
  IssuedOAuthTransaction,
} from "./AuthenticationServiceContracts.js";

const SECRET_BYTES = 32;
const DEFAULT_TRANSACTION_LIFETIME_MS = 10 * 60_000;
const DEFAULT_CLAIM_LEASE_MS = 60_000;
const MAX_TRANSACTION_LIFETIME_MS = 30 * 60_000;
const MAX_RETAINED_HMAC_KEYS = 4;

/** Inputs for a one-time OAuth transaction with symbolic redirect destinations. */
export interface CreateOAuthTransactionInput {
  /** Explicit provider operation purpose. */
  readonly purpose: OAuthTransactionPurpose;
  /** Prevalidated fixed redirect configuration key. */
  readonly redirectKey: string;
  /** Prevalidated allowlisted post-login destination key. */
  readonly returnTargetKey: string;
  /** Required verified account for linking or reauthentication. */
  readonly platformUserId?: PlatformUserId;
  /** Required verified initiating session for linking or reauthentication. */
  readonly initiatingSessionId?: BrowserSessionId;
  /** Optional already-encrypted PKCE verifier envelope. */
  readonly encryptedPkceVerifier?: EncryptedAuthenticationSecret;
  /** Explicit PKCE capability decision preserved for this transaction. */
  readonly pkceMode?: OAuthPkceMode;
  /** Optional bounded transaction lifetime. */
  readonly lifetimeMs?: number;
  /** Trusted operation evidence. */
  readonly context: AuthenticationOperationContext;
}

/** Dependencies for the transport-independent OAuth transaction lifecycle. */
export interface OAuthTransactionServiceDependencies {
  /** Atomic authentication persistence boundary. */
  readonly unitOfWork: AuthenticationUnitOfWork;
  /** Injectable security clock. */
  readonly clock: AuthenticationClock;
  /** Opaque-secret and keyed-digest implementation. */
  readonly crypto: AuthenticationCrypto;
  /** Active and bounded retained key handles. */
  readonly keys: AuthenticationKeyProvider;
  /** Cryptographically secure identifier source. */
  readonly ids: AuthenticationIdGenerator;
  /** Optional bounded claim lease duration. */
  readonly claimLeaseMs?: number;
}

/**
 * One-time OAuth transaction application service with no provider or HTTP work.
 * State and browser-binding values are independently generated, stored only as
 * keyed digests, and every persisted state transition is audited atomically.
 */
export class OAuthTransactionService {
  readonly #unitOfWork: AuthenticationUnitOfWork;
  readonly #clock: AuthenticationClock;
  readonly #crypto: AuthenticationCrypto;
  readonly #keys: AuthenticationKeyProvider;
  readonly #ids: AuthenticationIdGenerator;
  readonly #claimLeaseMs: number;

  /** Constructs the lifecycle service without creating a transaction. */
  public constructor(dependencies: OAuthTransactionServiceDependencies) {
    this.#unitOfWork = dependencies.unitOfWork;
    this.#clock = dependencies.clock;
    this.#crypto = dependencies.crypto;
    this.#keys = dependencies.keys;
    this.#ids = dependencies.ids;
    this.#claimLeaseMs = dependencies.claimLeaseMs ?? DEFAULT_CLAIM_LEASE_MS;
    if (
      !Number.isSafeInteger(this.#claimLeaseMs) ||
      this.#claimLeaseMs < 1_000 ||
      this.#claimLeaseMs > 5 * 60_000
    )
      throw new RangeError("OAuth claim lease must be between one second and five minutes.");
  }

  /** Creates and audits a PENDING transaction, returning raw values only after commit. */
  public async createTransaction(
    input: CreateOAuthTransactionInput,
  ): Promise<IssuedOAuthTransaction> {
    const now = this.#clock.now();
    const lifetimeMs = input.lifetimeMs ?? DEFAULT_TRANSACTION_LIFETIME_MS;
    if (
      !Number.isSafeInteger(lifetimeMs) ||
      lifetimeMs < 60_000 ||
      lifetimeMs > MAX_TRANSACTION_LIFETIME_MS
    )
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
    const transaction: OAuthTransaction = {
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
      await repositories.audit.append(
        this.#audit(input.context, created, "LOGIN_START", "REQUESTED", now),
      );
    });
    return Object.freeze({ transactionId: id, state, browserBinding, expiresAt });
  }

  /** Verifies raw state/binding values and atomically claims or reclaims the lease. */
  public async claimTransaction(
    state: OpaqueAuthenticationSecret,
    browserBinding: OpaqueAuthenticationSecret,
    context: AuthenticationOperationContext,
  ): Promise<ClaimedOAuthTransaction> {
    const now = this.#clock.now();
    const result = await this.#unitOfWork.run(async (repositories) => {
      const transaction = await this.#findByState(repositories, state);
      if (!transaction)
        throw new AuthenticationServiceError(
          "oauth-state-invalid",
          "The OAuth transaction could not be verified.",
        );
      if (isTerminalOAuthState(transaction.state)) {
        await repositories.audit.append(
          this.#audit(
            context,
            transaction,
            "OAUTH_REPLAY",
            "REPLAY_DETECTED",
            now,
          ),
        );
        return { kind: "terminal" as const };
      }
      try {
        await this.#verifyBrowserBinding(transaction, browserBinding);
      } catch (error) {
        if (!(error instanceof AuthenticationServiceError)) throw error;
        await repositories.audit.append(
          this.#audit(
            context,
            transaction,
            "OAUTH_REJECTION",
            "INVALID_STATE",
            now,
          ),
        );
        return { kind: "binding-rejected" as const };
      }
      const reclaimed =
        transaction.state === "CLAIMED" && transaction.claimExpiresAt! <= now;
      const claimed = await repositories.oauthTransactions.claim(
        transaction.id,
        now,
        new Date(now.getTime() + this.#claimLeaseMs),
      );
      await repositories.audit.append(
        this.#audit(context, claimed, "OAUTH_CLAIM", "COMPLETED", now, {
          reclaimed,
        }),
      );
      return {
        kind: "claimed" as const,
        value: Object.freeze({ transaction: claimed, reclaimed }),
      };
    });
    if (result.kind === "terminal")
      throw new AuthenticationServiceError(
        "oauth-transaction-terminal",
        "The OAuth transaction is no longer active.",
      );
    if (result.kind === "binding-rejected")
      throw new AuthenticationServiceError(
        "oauth-browser-binding-invalid",
        "The OAuth browser binding could not be verified.",
      );
    return result.value;
  }

  /** Completes a currently claimed transaction exactly once with atomic audit. */
  public async completeTransaction(
    id: OAuthTransaction["id"],
    context: AuthenticationOperationContext,
  ): Promise<OAuthTransaction> {
    return this.#transition(id, context, (transaction, now) =>
      completeOAuthTransaction(transaction, now),
    );
  }

  /** Fails a claimed transaction with a closed provider/application reason. */
  public async failTransaction(
    id: OAuthTransaction["id"],
    reason: Exclude<OAuthTransactionFailureReason, "CANCELLED_BY_USER" | "EXPIRED">,
    context: AuthenticationOperationContext,
  ): Promise<OAuthTransaction> {
    return this.#transition(id, context, (transaction, now) =>
      failOAuthTransaction(transaction, reason, now),
    );
  }

  /** Cancels a pending or claimed transaction without permitting later reuse. */
  public async cancelTransaction(
    id: OAuthTransaction["id"],
    context: AuthenticationOperationContext,
  ): Promise<OAuthTransaction> {
    return this.#transition(id, context, cancelOAuthTransaction);
  }

  /** Marks an active transaction expired only after its persisted absolute expiry. */
  public async expireTransaction(
    id: OAuthTransaction["id"],
    context: AuthenticationOperationContext,
  ): Promise<OAuthTransaction> {
    return this.#transition(id, context, expireOAuthTransaction);
  }

  async #transition(
    id: OAuthTransaction["id"],
    context: AuthenticationOperationContext,
    transition: (transaction: OAuthTransaction, now: Date) => OAuthTransaction,
  ): Promise<OAuthTransaction> {
    const now = this.#clock.now();
    return this.#unitOfWork.run(async (repositories) => {
      const current = await repositories.oauthTransactions.findById(id);
      if (!current)
        throw new AuthenticationServiceError(
          "oauth-state-invalid",
          "The OAuth transaction could not be found.",
        );
      const next = transition(current, now);
      const persisted = await repositories.oauthTransactions.transition(
        next,
        current.state,
      );
      const success = persisted.state === "COMPLETED";
      await repositories.audit.append(
        this.#audit(
          context,
          persisted,
          success ? "OAUTH_COMPLETION" : "OAUTH_REJECTION",
          success ? "COMPLETED" : reasonForState(persisted),
          now,
        ),
      );
      return persisted;
    });
  }

  async #findByState(
    repositories: AuthenticationTransactionContext,
    state: OpaqueAuthenticationSecret,
  ): Promise<OAuthTransaction | undefined> {
    const keys = await candidates(this.#keys, "SESSION_HMAC");
    for (const key of keys) {
      const digest = await this.#crypto.hmac(state, key);
      const transaction = await repositories.oauthTransactions.findByStateDigest(digest);
      if (transaction) return transaction;
    }
    return undefined;
  }

  async #verifyBrowserBinding(
    transaction: OAuthTransaction,
    binding: OpaqueAuthenticationSecret,
  ): Promise<void> {
    const keys = await candidates(this.#keys, "CSRF_HMAC");
    for (const key of keys) {
      const digest = await this.#crypto.hmac(binding, key);
      if (await this.#crypto.constantTimeEqual(digest, transaction.browserBindingDigest))
        return;
    }
    throw new AuthenticationServiceError(
      "oauth-browser-binding-invalid",
      "The OAuth browser binding could not be verified.",
    );
  }

  #audit(
    context: AuthenticationOperationContext,
    transaction: OAuthTransaction,
    action: AuthenticationAuditEvent["action"],
    reasonCode: AuthenticationAuditEvent["reasonCode"],
    occurredAt: Date,
    metadata: AuthenticationAuditEvent["metadata"] = {},
  ): AuthenticationAuditEvent {
    return {
      id: this.#ids.authenticationAuditEventId(),
      action,
      outcome:
        action === "OAUTH_REJECTION"
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

async function candidates(
  keys: AuthenticationKeyProvider,
  purpose: AuthenticationKeyHandle["purpose"],
): Promise<readonly AuthenticationKeyHandle[]> {
  const values = await keys.verificationCandidates(purpose);
  if (values.length < 1 || values.length > MAX_RETAINED_HMAC_KEYS)
    throw new AuthenticationServiceError(
      "cryptography-failed",
      "Authentication key verification candidates are unavailable.",
    );
  return values;
}

function reasonForState(
  transaction: OAuthTransaction,
): AuthenticationAuditEvent["reasonCode"] {
  if (transaction.state === "EXPIRED") return "EXPIRED";
  if (transaction.state === "CANCELLED") return "USER_ACTION";
  if (transaction.failureReason === "PROVIDER_REJECTED") return "PROVIDER_REJECTED";
  if (transaction.failureReason === "DEPENDENCY_UNAVAILABLE")
    return "DEPENDENCY_UNAVAILABLE";
  return "INVALID_STATE";
}
