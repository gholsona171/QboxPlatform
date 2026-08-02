import { AuthenticationDomainError } from "./errors.js";
import type {
  AuthenticationAuditEventId,
  AuthenticationCorrelationId,
  AuthenticationDigest,
  AuthenticationRequestId,
  BrowserSessionId,
  DiscordGuildMembershipId,
  ExternalIdentityId,
  OAuthCredentialId,
  OAuthTransactionId,
  PlatformUserId,
  ServiceIdentityId,
} from "./identifiers.js";
import type {
  OAuthProvider,
  OAuthTransactionPurpose,
} from "./oauth.js";

/** Closed authentication/security action catalog for immutable audit history. */
export type AuthenticationAuditAction =
  | "LOGIN_START"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "OAUTH_CLAIM"
  | "OAUTH_COMPLETION"
  | "OAUTH_REJECTION"
  | "OAUTH_REPLAY"
  | "SESSION_CREATION"
  | "SESSION_ROTATION"
  | "SESSION_EXPIRY"
  | "SESSION_REVOCATION"
  | "LOGOUT"
  | "GLOBAL_LOGOUT"
  | "IDENTITY_LINK"
  | "IDENTITY_UNLINK"
  | "ACCOUNT_STATUS_CHANGE"
  | "GUILD_DEPARTURE"
  | "GUILD_REJOIN"
  | "RECOVERY";

/** Closed outcome classification for authentication audit events. */
export type AuthenticationAuditOutcome = "SUCCESS" | "FAILURE" | "REJECTED";

/** Structured reason catalog; free-form secrets and unbounded explanations are excluded. */
export type AuthenticationAuditReasonCode =
  | "REQUESTED"
  | "COMPLETED"
  | "INVALID_CREDENTIAL"
  | "INVALID_STATE"
  | "EXPIRED"
  | "REVOKED"
  | "REPLAY_DETECTED"
  | "PROVIDER_REJECTED"
  | "DEPENDENCY_UNAVAILABLE"
  | "ACCOUNT_UNAVAILABLE"
  | "IDENTITY_CONFLICT"
  | "GUILD_MEMBERSHIP_CHANGED"
  | "ADMINISTRATOR_ACTION"
  | "SECURITY_RESPONSE"
  | "USER_ACTION"
  | "RECOVERY"
  | "SYSTEM_MAINTENANCE";

/** Verified actor snapshot accepted by the immutable audit boundary. */
export type AuthenticationAuditActor =
  | { readonly type: "platform-user"; readonly id: PlatformUserId }
  | { readonly type: "service"; readonly id: ServiceIdentityId };

/** Internal identifiers of records affected by one authentication event. */
export interface AuthenticationAuditTarget {
  readonly platformUserId?: PlatformUserId;
  readonly externalIdentityId?: ExternalIdentityId;
  readonly browserSessionId?: BrowserSessionId;
  readonly oauthTransactionId?: OAuthTransactionId;
  readonly oauthCredentialId?: OAuthCredentialId;
  readonly guildMembershipId?: DiscordGuildMembershipId;
}

/** Scalar values accepted in bounded, allowlisted authentication audit metadata. */
export type AuthenticationAuditMetadataValue = string | number | boolean | null;

/**
 * Safe auxiliary audit metadata. Domain validation rejects secret-like keys,
 * nested payloads, token digests, and unbounded values before persistence.
 */
export type AuthenticationAuditMetadata = Readonly<
  Record<string, AuthenticationAuditMetadataValue>
>;

/**
 * Append-only authentication event projection. Dedicated keyed-HMAC fields hold
 * safe device correlation; credentials and request payloads are never modeled.
 */
export interface AuthenticationAuditEvent {
  readonly id: AuthenticationAuditEventId;
  readonly action: AuthenticationAuditAction;
  readonly outcome: AuthenticationAuditOutcome;
  readonly reasonCode: AuthenticationAuditReasonCode;
  readonly requestId?: AuthenticationRequestId;
  readonly correlationId: AuthenticationCorrelationId;
  readonly actor?: AuthenticationAuditActor;
  readonly target: Readonly<AuthenticationAuditTarget>;
  readonly provider?: OAuthProvider;
  readonly purpose?: OAuthTransactionPurpose;
  readonly metadata: AuthenticationAuditMetadata;
  readonly ipHmac?: AuthenticationDigest;
  readonly userAgentHmac?: AuthenticationDigest;
  readonly deviceHmac?: AuthenticationDigest;
  readonly metadataKeyVersion?: number;
  readonly occurredAt: Date;
  readonly createdAt: Date;
}

const FORBIDDEN_METADATA_KEY =
  /(?:authorization|cookie|password|secret|token|digest|oauth[._-]?(?:code|state)|pkce|request[._-]?body)/i;

/** Validates an immutable authentication audit event and its bounded metadata. */
export function validateAuthenticationAuditEvent(
  event: AuthenticationAuditEvent,
): AuthenticationAuditEvent {
  validateAuthenticationAuditMetadata(event.metadata);
  if (event.createdAt < event.occurredAt)
    unsafeMetadata("Audit createdAt cannot precede occurredAt.");
  const hmacPresent = Boolean(event.ipHmac || event.userAgentHmac || event.deviceHmac);
  if (
    hmacPresent !== Boolean(event.metadataKeyVersion) ||
    (event.metadataKeyVersion !== undefined &&
      (!Number.isSafeInteger(event.metadataKeyVersion) ||
        event.metadataKeyVersion < 1))
  )
    unsafeMetadata("Audit metadata HMACs and their key version must be stored together.");
  return event;
}

/** Validates bounded scalar metadata and rejects fields likely to contain secrets. */
export function validateAuthenticationAuditMetadata(
  metadata: AuthenticationAuditMetadata,
): AuthenticationAuditMetadata {
  const entries = Object.entries(metadata);
  if (entries.length > 20)
    unsafeMetadata("Authentication audit metadata may contain at most 20 fields.");
  for (const [key, value] of entries) {
    if (
      !/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/.test(key) ||
      key.length > 64 ||
      FORBIDDEN_METADATA_KEY.test(key)
    )
      unsafeMetadata("Authentication audit metadata contains an unsafe key.");
    if (typeof value === "string") {
      if (value.length > 256 || /[\u0000-\u001f\u007f]/.test(value))
        unsafeMetadata("Authentication audit metadata contains an unsafe string.");
    } else if (typeof value === "number" && !Number.isFinite(value)) {
      unsafeMetadata("Authentication audit metadata numbers must be finite.");
    }
  }
  return metadata;
}

function unsafeMetadata(message: string): never {
  throw new AuthenticationDomainError("unsafe-audit-metadata", message);
}
