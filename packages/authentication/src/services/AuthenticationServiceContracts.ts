import type { PlatformUserActor } from "../actors.js";
import type {
  AuthenticationAuditActor,
  AuthenticationAuditMetadata,
} from "../audit.js";
import type {
  AuthenticationCorrelationId,
  AuthenticationDigest,
  AuthenticationRequestId,
  BrowserSessionId,
  ExternalIdentityId,
  OAuthTransactionId,
  OpaqueAuthenticationSecret,
  PlatformUserId,
} from "../identifiers.js";
import type { OAuthTransaction } from "../oauth.js";
import type { BrowserSessionStatus } from "../sessions.js";

/** Trusted operation evidence supplied by composition, never by a request DTO. */
export interface AuthenticationOperationContext {
  /** Canonical operation correlation identifier. */
  readonly correlationId: AuthenticationCorrelationId;
  /** Optional canonical transport request identifier. */
  readonly requestId?: AuthenticationRequestId;
  /** Verified initiating actor when authentication has already succeeded. */
  readonly actor?: AuthenticationAuditActor;
  /** Small safe metadata fields permitted by the audit domain validator. */
  readonly metadata?: AuthenticationAuditMetadata;
}
/** Raw client metadata accepted only transiently for keyed-HMAC correlation. */
export interface EphemeralClientMetadata {
  /** Network address as observed by a trusted transport/proxy boundary. */
  readonly clientIp?: string;
  /** Bounded browser user-agent value. */
  readonly userAgent?: string;
  /** Optional caller-generated device correlation value; never identity proof. */
  readonly device?: string;
}

/** Persistable metadata digests produced with one metadata-key version. */
export interface HashedClientMetadata {
  /** Keyed-HMAC client address correlation value. */
  readonly ipHmac?: AuthenticationDigest;
  /** Keyed-HMAC user-agent correlation value. */
  readonly userAgentHmac?: AuthenticationDigest;
  /** Keyed-HMAC optional device correlation value. */
  readonly deviceHmac?: AuthenticationDigest;
  /** Key version shared by every present metadata digest. */
  readonly metadataKeyVersion?: number;
}

/** Safe session projection that contains no token, digest, CSRF, or key data. */
export interface BrowserSessionSummary {
  /** Internal session identifier. */
  readonly id: BrowserSessionId;
  /** Current lifecycle state. */
  readonly status: BrowserSessionStatus;
  /** Initial authentication instant. */
  readonly authenticatedAt: Date;
  /** Most recent bounded activity update. */
  readonly lastSeenAt: Date;
  /** Current idle expiry. */
  readonly idleExpiresAt: Date;
  /** Non-extendable absolute expiry. */
  readonly absoluteExpiresAt: Date;
  /** Optional safe user-supplied display label. */
  readonly deviceLabel?: string;
}

/** Ephemeral credentials returned after a session creation transaction commits. */
export interface IssuedBrowserSession {
  /** Persisted session projection without credential material. */
  readonly session: BrowserSessionSummary;
  /** One-time raw browser session secret; callers must never persist or log it. */
  readonly sessionSecret: OpaqueAuthenticationSecret;
  /** Independent one-time raw CSRF secret; callers must never persist or log it. */
  readonly csrfSecret: OpaqueAuthenticationSecret;
}

/** Verified session result returned to a future credential middleware. */
export interface VerifiedBrowserSession {
  /** Immutable verified platform-user actor. */
  readonly actor: PlatformUserActor;
  /** Safe session projection. */
  readonly session: BrowserSessionSummary;
}

/** Ephemeral OAuth transaction credentials returned only after persistence commits. */
export interface IssuedOAuthTransaction {
  /** Internal transaction identifier safe for trusted application orchestration. */
  readonly transactionId: OAuthTransactionId;
  /** One-time raw state value; never persisted or logged. */
  readonly state: OpaqueAuthenticationSecret;
  /** Independent browser-binding secret; never persisted or logged. */
  readonly browserBinding: OpaqueAuthenticationSecret;
  /** Absolute transaction expiry. */
  readonly expiresAt: Date;
}

/** Result of a verified and atomically claimed OAuth transaction. */
export interface ClaimedOAuthTransaction {
  /** Claimed persisted domain transaction. */
  readonly transaction: OAuthTransaction;
  /** Whether an expired prior lease was safely reclaimed. */
  readonly reclaimed: boolean;
}

/** Inputs that bind a new browser session to trusted account/identity records. */
export interface CreateBrowserSessionInput {
  /** Verified account identifier. */
  readonly platformUserId: PlatformUserId;
  /** Enabled linked provider identity used for login. */
  readonly loginIdentityId: ExternalIdentityId;
  /** Trusted operation evidence. */
  readonly context: AuthenticationOperationContext;
  /** Optional transient metadata that will be HMAC-hashed before persistence. */
  readonly clientMetadata?: EphemeralClientMetadata;
  /** Optional bounded display-only device label. */
  readonly deviceLabel?: string;
}
