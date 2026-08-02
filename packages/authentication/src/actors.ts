import type {
  BrowserSessionId,
  ExternalIdentityId,
  PlatformUserId,
  ServiceIdentityId,
} from "./identifiers.js";

/** Authentication method recorded on a verified actor without retaining credentials. */
export type AuthenticationMethod = "discord-oauth" | "service-credential";

/**
 * Actor representing a public request with no accepted credential. It carries no
 * implied identity or authorization principal and is safe for public routes only.
 */
export interface UnauthenticatedActor {
  readonly type: "unauthenticated";
}

/** Trusted authentication evidence attached to a human actor for one request. */
export interface PlatformUserAuthenticationMetadata {
  readonly method: "discord-oauth";
  readonly sessionId: BrowserSessionId;
  readonly loginIdentityId: ExternalIdentityId;
  readonly authenticationRevision: number;
  /** Canonical UTC ISO timestamp, represented as a string to remain immutable. */
  readonly authenticatedAt: string;
}

/**
 * Verified human actor produced only after session validation. The actor contains
 * internal identifiers and evidence metadata, never tokens, profile names,
 * permissions, or caller-provided actor fields.
 */
export interface PlatformUserActor {
  readonly type: "platform-user";
  readonly platformUserId: PlatformUserId;
  readonly authentication: Readonly<PlatformUserAuthenticationMetadata>;
}

/**
 * Reserved actor contract for later service authentication. No Phase 1 adapter,
 * credential schema, or transport may construct this actor operationally.
 */
export interface ServiceActor {
  readonly type: "service";
  readonly serviceIdentityId: ServiceIdentityId;
  readonly authentication: Readonly<{
    method: "service-credential";
    /** Canonical UTC ISO timestamp supplied by a future trusted service verifier. */
    authenticatedAt: string;
  }>;
}

/** Canonical immutable actor union emitted by authentication boundaries. */
export type AuthenticationActor =
  | UnauthenticatedActor
  | PlatformUserActor
  | ServiceActor;

/** Creates a frozen immutable unauthenticated actor. */
export function createUnauthenticatedActor(): UnauthenticatedActor {
  return Object.freeze({ type: "unauthenticated" });
}

/**
 * Creates a deeply frozen platform-user actor from already verified internal
 * identity and session data. Callers remain responsible for credential proof.
 */
export function createPlatformUserActor(input: {
  readonly platformUserId: PlatformUserId;
  readonly sessionId: BrowserSessionId;
  readonly loginIdentityId: ExternalIdentityId;
  readonly authenticationRevision: number;
  readonly authenticatedAt: Date;
}): PlatformUserActor {
  if (!Number.isSafeInteger(input.authenticationRevision) || input.authenticationRevision < 1)
    throw new RangeError("Authentication revision must be a positive integer.");
  const authentication = Object.freeze({
    method: "discord-oauth" as const,
    sessionId: input.sessionId,
    loginIdentityId: input.loginIdentityId,
    authenticationRevision: input.authenticationRevision,
    authenticatedAt: input.authenticatedAt.toISOString(),
  });
  return Object.freeze({
    type: "platform-user",
    platformUserId: input.platformUserId,
    authentication,
  });
}
