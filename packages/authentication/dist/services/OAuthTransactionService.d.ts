import type { BrowserSessionId, OpaqueAuthenticationSecret, PlatformUserId } from "../identifiers.js";
import { type EncryptedAuthenticationSecret, type OAuthPkceMode, type OAuthTransaction, type OAuthTransactionFailureReason, type OAuthTransactionPurpose } from "../oauth.js";
import type { AuthenticationClock, AuthenticationCrypto, AuthenticationIdGenerator, AuthenticationKeyProvider, AuthenticationUnitOfWork } from "../ports.js";
import type { AuthenticationOperationContext, ClaimedOAuthTransaction, IssuedOAuthTransaction } from "./AuthenticationServiceContracts.js";
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
export declare class OAuthTransactionService {
    #private;
    /** Constructs the lifecycle service without creating a transaction. */
    constructor(dependencies: OAuthTransactionServiceDependencies);
    /** Creates and audits a PENDING transaction, returning raw values only after commit. */
    createTransaction(input: CreateOAuthTransactionInput): Promise<IssuedOAuthTransaction>;
    /** Verifies raw state/binding values and atomically claims or reclaims the lease. */
    claimTransaction(state: OpaqueAuthenticationSecret, browserBinding: OpaqueAuthenticationSecret, context: AuthenticationOperationContext): Promise<ClaimedOAuthTransaction>;
    /** Completes a currently claimed transaction exactly once with atomic audit. */
    completeTransaction(id: OAuthTransaction["id"], context: AuthenticationOperationContext): Promise<OAuthTransaction>;
    /** Fails a claimed transaction with a closed provider/application reason. */
    failTransaction(id: OAuthTransaction["id"], reason: Exclude<OAuthTransactionFailureReason, "CANCELLED_BY_USER" | "EXPIRED">, context: AuthenticationOperationContext): Promise<OAuthTransaction>;
    /** Cancels a pending or claimed transaction without permitting later reuse. */
    cancelTransaction(id: OAuthTransaction["id"], context: AuthenticationOperationContext): Promise<OAuthTransaction>;
    /** Marks an active transaction expired only after its persisted absolute expiry. */
    expireTransaction(id: OAuthTransaction["id"], context: AuthenticationOperationContext): Promise<OAuthTransaction>;
}
//# sourceMappingURL=OAuthTransactionService.d.ts.map