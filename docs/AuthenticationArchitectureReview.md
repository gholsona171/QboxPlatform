# Authentication Architecture Review

> Review baseline: `feature/auth-architecture` at `89989ebf3b8bc6ef9661eb5412476488112c0ef2` on 2026-08-01. This document describes observed repository behavior and recommended authentication architecture. It does not describe implemented authentication. No authentication schema, repository, middleware, OAuth endpoint, session, service credential, or FiveM identity exists at this baseline.

> Implementation status: later commits on `feature/auth-architecture` implemented the approved pure authentication package, additive PostgreSQL authentication schema, Prisma repository adapters, transaction boundaries, native cryptography/key ring, session/OAuth transaction services, encrypted OAuth credential lifecycle, Discord guild-membership verification services, and an import-safe API-owned Discord OAuth provider adapter. Browser-facing authentication remains unavailable: there are no login routes, OAuth callback routes, cookies, CSRF endpoints, authenticated request actors, authorization middleware, service credentials, FiveM identities, Redis integration, or live Discord OAuth calls in application startup. PKCE remains disabled by default as `DISABLED_UNVERIFIED` unless an explicit `S256_VERIFIED` capability decision is configured and recorded per transaction.

## 1. Current repository inspection

### API transport and process

`apps/api` is an implemented private ESM TypeScript workspace using Fastify 5.11 and Zod 4.4. Its executable entry point is `apps/api/src/run.ts`; `apps/api/src/index.ts` exports import-safe contracts and factories. `createApiServer()` constructs an unbound Fastify instance, while `createApiApplication()` composes the process around `PlatformKernel`, `DatabaseService`, persistent permission repositories, catalog synchronization, and `ApiModule`.

The process validates configuration before startup, starts PostgreSQL and synchronizes the compiled permission catalog before HTTP binds, exposes only `GET /health/live`, `GET /health/ready`, and `GET /health/degraded`, and performs bounded reverse-order shutdown. `/api/v1` is an empty plugin boundary. There are no login, callback, logout, session, user, identity, or domain routes.

The transport already supplies several authentication prerequisites:

- server-generated request IDs;
- validated-or-regenerated canonical UUID correlation IDs;
- an immutable request context with a request logger, monotonic start time, `AbortSignal`, and trusted client IP interpretation;
- strict host, forwarded-header, content-type, header, and body policies;
- RFC 9457-compatible Problem Details responses;
- `AUTHENTICATION_REQUIRED` and `AUTHORIZATION_DENIED` transport error codes;
- default `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, and `X-Content-Type-Options: nosniff` response headers;
- disabled CORS and rate-limit policy boundaries;
- no body, cookie, authorization-header, token, password, raw-query, or database-URL logging.

`apps/api/src/context/ApiRequestContext.ts` defines only `UnauthenticatedApiActor` with `{ type: "unauthenticated" }`. `createApiRequestContext()` always creates that actor. This is an explicit placeholder, not authentication. The frozen context cannot currently be populated with a verified actor. A future authentication hook must replace the entire context once with a newly frozen context; it must not mutate the existing object or accept actor data from transport input.

`apps/api/src/errors/ApiError.ts` provides centralized safe error mapping, but it does not distinguish invalid, expired, or revoked sessions, OAuth failures, CSRF failures, disabled accounts, or service credentials. Those error contracts remain future work.

### Core composition and configuration

`PlatformKernel` starts modules sequentially and stops them in reverse order. `ServiceContainer` is string-keyed, permits replacement, and returns values through an unchecked generic assertion. Authentication should participate in kernel lifecycle but route plugins should receive typed dependencies by constructor or plugin options rather than repeatedly resolving string keys.

`ApiConfiguration` is immutable and strictly validates API host, port, size limits, timeouts, trusted proxy allowlists, public base URL, CORS placeholder policy, rate-limit placeholder policy, log level, and build version. Production requires HTTPS in `publicBaseUrl`; wildcard CORS with credentials is rejected. Authentication configuration does not exist. It should extend one process-composition configuration boundary with typed OAuth, cookie, expiry, encryption-key-version, and trusted-origin values instead of creating route-local environment access.

`packages/shared/src/env.ts` loads the root `.env` at module import and exposes Discord bot, guild, database, Redis, OpenAI, and compatibility values, often with empty-string fallbacks. `packages/shared/src/config/Configuration.ts` is another direct `process.env` abstraction. Neither is sufficiently strict for authentication secrets. Authentication must receive validated configuration from the API composition root; handlers, providers, and repositories must not read `process.env`.

The shared Pino logger is process-global and has no configured redaction paths. API code avoids sensitive fields by selection rather than relying on logger redaction. Authentication must continue that practice and should add defense-in-depth redaction for standard credential paths when its configuration is implemented.

### Database and Prisma

PostgreSQL is the only supported production database. `@qbox/prisma` owns Prisma 7.9.1, the generated NodeNext/ESM client, and a client factory. `@qbox/database` owns validated database configuration, lifecycle, health/readiness, transaction-oriented repository adapters, and application-facing persistence composition. Applications and route handlers do not instantiate Prisma.

The current Prisma schema contains only:

- `Guild`;
- `PermissionPrincipal`;
- `PermissionDefinition`;
- `PermissionAssignment`;
- `PermissionAuditEvent`;
- `PermissionCatalogState`.

There is no platform user, linked external identity, browser session, OAuth transaction, OAuth token, service identity, authentication credential, guild-membership snapshot, or authentication audit model.

Current migrations enforce UUID identifiers, restrictive foreign keys, soft disable/revoke behavior, scope/guild checks, active-assignment uniqueness, permission-key syntax, immutable `createdAt` values, and append-only permission audit events. Owner-invalidating permission mutations use a PostgreSQL transaction advisory lock and re-read active owners after acquiring it.

### Authorization and permission principals

`@qbox/permissions` is a Prisma-, Discord.js-, Express-, and Redis-independent domain package. `PersistentPermissionService` implements the asynchronous `PermissionAuthorizer` contract. It consumes verified principals and a scope, loads current assignments, handles cache fallback, and applies the authoritative rules for owner override, explicit deny, optional administrator override, all/any checks, expiry, enabled state, platform scope, and guild isolation. Protected decisions fail closed when the repository is unavailable.

The compiled permission catalog is the only source of valid permission keys. The current principal union is closed to:

- `discord-user`;
- `discord-role`.

Every current `PermissionPrincipal` requires an external ID and Discord guild ID. The persistence table likewise requires `guild_id`, and its enum contains only those Discord types. Even a platform-scoped `platform.owner` assignment targets a guild-bound Discord principal. No platform-user, service, or FiveM permission principal exists.

The Discord command path creates authorization identities only from trusted interaction data. `DiscordPermissionIdentity` uses the interaction user ID, verified guild ID, and current cached/API member roles; command options do not supply the actor. This translation is reusable as a security pattern, not as browser authentication code.

### Discord process assumptions

The bot validates `DISCORD_TOKEN`, `DISCORD_APPLICATION_ID`, and, for guild workflows, `DISCORD_GUILD_ID`. On login it verifies that the connected Discord application matches the configured application. `ADMIN_ROLE_IDS` remains an explicitly guild-bound compatibility overlay controlled by `PERMISSION_LEGACY_ADMIN_COMPATIBILITY_ENABLED`. Persistent owner and administrator grants are already supported, and disabling compatibility is guarded by active owner and administrator recovery counts.

Discord bot authentication is bot-token authentication of the bot process. It is distinct from Discord OAuth authentication of a browser user. The bot token must never be repurposed as a browser credential, and a browser user's Discord access token must never be treated as a Qbox API bearer token.

### Audit and correlation

Permission mutation audit is immutable and transactionally linked to permission changes. It records structured reason codes, optional human reasons, correlation IDs, actor and target snapshots, scope, permission, outcome snapshots, and timestamps. It is specialized to permission mutation actions and Discord permission principals. Authentication needs a separate append-only audit event model because login failures, sessions, OAuth transactions, identity links, and credential rotation are not permission mutations.

### Documentation and roadmap

`PROJECT_INDEX.md`, `ROADMAP.md`, `docs/ApiConventions.md`, `docs/ApiFoundationArchitectureReview.md`, and the permission reviews all identify authentication, actor mapping, CORS enforcement, and domain routes as future work. They consistently require the API to call the existing authorizer instead of reproducing permission semantics. Some older prose in `AGENTS.md`, `ROADMAP.md`, and pre-implementation review passages still describes the API or Prisma directory as placeholders; source code and the current index are authoritative where those historical statements conflict.

### Exact current identity status

Implemented identity-related behavior is limited to:

- Discord's trusted interaction user/guild/role translation for command authorization;
- persisted Discord user and role authorization principals;
- system/principal actors for permission mutation auditing;
- the API's immutable unauthenticated actor placeholder;
- server request and correlation identifiers.

Placeholder-only or absent behavior includes:

- platform accounts;
- browser authentication;
- Discord OAuth;
- sessions and cookies;
- CSRF enforcement;
- account linking and recovery;
- service authentication;
- FiveM identity linking;
- authenticated API actor middleware;
- authentication audit storage.

### Existing models that must not be overloaded

| Existing model or contract | Why it must not become authentication storage |
| --- | --- |
| `PermissionPrincipal` | It is a guild-bound authorization target limited to Discord users and roles. It is not an account, login identity, credential, or session. |
| `Guild` | It represents a configured Discord authorization boundary. It may be referenced by a membership record, but it is not a user membership or tenant-session table. |
| `PermissionAssignment` | It expresses authorization effect and scope. It must not carry session state, OAuth scopes, account status, or login provenance. |
| `PermissionAuditEvent` | Its closed actions and reason codes describe permission mutations. Authentication events require a distinct immutable audit stream. |
| `PermissionCatalogState` | It synchronizes compiled permission metadata only. It has no identity-provider or credential role. |
| `ADMIN_ROLE_IDS` compatibility | It bootstraps guild-scoped authorization. It cannot authenticate web requests or identify a browser user. |
| `ApiRequestContext.requestId` or `correlationId` | These trace requests; neither is a credential or actor proof. |

## 2. Authentication and authorization separation

Authentication answers **who or what proved control of a credential**. It owns:

- credential verification;
- OAuth transaction initiation and callback validation;
- account and external-identity linking;
- browser session creation, rotation, expiry, revocation, and recovery;
- service credential verification and rotation;
- producing a verified immutable actor;
- authentication audit events.

Authorization answers **what that verified actor may do in a trusted scope**. It owns:

- translating the verified actor and server-resolved guild context into permission principals;
- resolving current Discord role principals;
- invoking `PermissionAuthorizer`;
- applying platform/guild scope, explicit-deny precedence, owner override, administrator override, expiry, and enabled-state rules;
- protecting privileged mutations and last-owner invariants;
- authorization audit correlation.

The mandatory flow is:

```text
Supported credential
  -> authentication service
  -> verified immutable actor
  -> server-resolved tenant/guild context
  -> authorization-principal resolver
  -> existing PermissionAuthorizer
  -> application service
```

Authentication must never grant a permission itself. Authorization must never infer that a request is authenticated from a Discord ID, platform-user UUID, route body, query parameter, arbitrary header, display name, request ID, or correlation ID. A route may accept a target user or guild as input, but that value identifies the requested resource only; it does not define the caller.

HTTP middleware may reject missing credentials and may perform a route-declared authorization precheck by delegating to the same authorizer. Every privileged application service must authorize again at its transport-independent boundary so a future Discord, worker, or FiveM caller cannot bypass policy.

## 3. Actor and identity model

### Canonical terms

| Term | Definition |
| --- | --- |
| Actor | Immutable, request-scoped result of successful credential verification, or the explicit unauthenticated actor. It records the real caller, not a body-selected target. |
| Platform account | Internal lifecycle record representing one human account independently of any provider. It owns status and linked identities. |
| External identity | Verified provider subject linked to one platform account, such as one Discord user ID. |
| Session | Server-side browser login state referenced by an opaque cookie token. |
| Credential | Secret or proof used to authenticate, such as an opaque session token or service token. Discord OAuth tokens are provider credentials, not Qbox API credentials. |
| Authorization principal | Identity shape consumed by `PermissionAuthorizer`; currently only a guild-bound Discord user or role. |
| Tenant/guild context | Server-validated target authorization boundary. A route parameter may select it, but membership and permission are separately verified. |

### Recommended actor contracts

The API should define a closed immutable union in an authentication-domain package:

```ts
type ApiActor =
  | { readonly type: "unauthenticated" }
  | {
      readonly type: "platform-user";
      readonly platformUserId: string;
      readonly sessionId: string;
      readonly authenticatedAt: Date;
      readonly authenticationMethod: "discord-oauth";
      readonly externalIdentityId: string;
    }
  | {
      readonly type: "service";
      readonly serviceIdentityId: string;
      readonly credentialId: string;
      readonly authenticatedAt: Date;
    };
```

The exact implementation may use value objects instead of raw strings, but all IDs above are internal UUIDs. The actor should not contain OAuth tokens, the browser session token, Discord usernames, arbitrary metadata, or the complete permission set. Future FiveM authentication adds a separate discriminated actor only after a trusted server-to-platform proof exists.

An impersonation actor should not be implemented initially. If a real support requirement later approves it, the actor must preserve both `operatorPlatformUserId` and `effectivePlatformUserId`, require step-up authentication, a dedicated compiled permission, a bounded expiry and reason, and immutable start/end audit events. The operator must never disappear from logs or authorization context.

### Identifier classification

| Identifier/data | Classification and use |
| --- | --- |
| Platform user ID | Internal UUID; canonical account key; security-sensitive but not secret. |
| External identity ID | Internal UUID; canonical link-row key. |
| Discord user ID | External immutable provider subject (snowflake string); authoritative only after Discord verification. Never parse as a JavaScript number. |
| Discord guild/role IDs | External snowflake strings; authoritative only from configured server context and current Discord verification. |
| Discord username, global name, avatar, guild nickname | Mutable display/profile snapshots only; never unique keys or authorization evidence. |
| Session ID | Internal UUID for audit/reference; never the browser credential. |
| Session token | High-entropy secret sent only in a cookie; never stored plaintext. |
| OAuth state/binding token and PKCE verifier | One-time secrets; hashed or encrypted as appropriate and never logged. |
| Service identity ID | Internal UUID representing one workload. |
| Service credential ID | Public lookup identifier paired with a high-entropy secret; not sufficient alone to authenticate. |
| Request/correlation ID | Trace data, not identity proof. |

## 4. Platform-account strategy

### Options

| Model | Benefits | Problems |
| --- | --- | --- |
| Discord identity is the account | Small initial schema | Couples all account lifecycle to Discord, blocks safe future identity providers, makes recovery and merges ambiguous, and encourages overloading permission principals. |
| Platform account with exactly one Discord identity forever | Separates account status and sessions | Still hard-codes Discord as the permanent account model and requires redesign for future login methods. |
| Platform account with linked external identities | Stable internal account, explicit provider ownership, future-compatible linking and recovery | Requires an account/link layer and carefully protected linking rules. |

### Decision

Use a **first-class platform account with linked external identities**.

Initially, a platform account may have at most one active Discord identity, and Discord is the only enabled human login provider. The schema should be provider-generic enough for another approved provider later, but no unimplemented provider becomes usable merely because an enum or table exists.

Rules:

- One Discord provider subject may belong to exactly one platform account for its entire normal lifecycle.
- A platform account may have at most one Discord identity initially. Enforce this with a unique `(platformUserId, provider)` constraint.
- A global unique `(provider, providerSubjectId)` constraint prevents the same Discord account from owning multiple platform accounts.
- Unlinking disables the link but does not automatically release the provider subject for reuse. Reassignment requires an explicit audited transfer or account-merge procedure.
- Multiple identity providers per platform account may be supported later; multiple Discord identities require a separate product and security decision.
- `ACTIVE`, `SUSPENDED`, `DISABLED`, and tombstoned `DELETED` are distinct account states. All non-active states reject new sessions; suspension/disable/deletion revoke existing sessions.
- Accounts and identity ownership records are soft-disabled or tombstoned. Display metadata may be scrubbed for deletion, but immutable ownership and audit evidence remain.
- Account merging is not a normal self-service operation. A future operator workflow must lock both accounts and identities, prevent owner lockout, move only unambiguous links, revoke every involved session, and append immutable audit events.

This model keeps the platform account stable when Discord profile data changes and prevents Discord usernames or display names from becoming identity keys.

## 5. Browser authentication strategy

### Comparison

| Strategy | Revocation/logout | Permission and suspension freshness | Scaling | CSRF/XSS profile | Complexity |
| --- | --- | --- | --- | --- | --- |
| Server-side opaque session | Immediate database revocation; global logout is direct | Account/session state checked per request; permissions remain live in the existing authorizer | PostgreSQL works across instances; Redis optional for performance | Cookie requires CSRF controls; `HttpOnly` limits token theft by JavaScript | Moderate and operationally explicit |
| Signed/encrypted cookie session | Requires revocation list or short expiry | Encoded status becomes stale | Easy reads, difficult immediate invalidation | Cookie still requires CSRF; payload/key mistakes increase risk | Appears simple but pushes state and rotation complexity into cryptography |
| Stateless JWT access token | Logout/suspension require denylist, short TTL, or key rotation | Claims and permissions become stale unless every request rechecks state | Easy validation but not truly stateless once revocation is required | Browser storage increases XSS risk; cookie JWT still needs CSRF | High key, claim, audience, issuer, and rotation burden |
| Short-lived access plus refresh tokens | Refresh can be revoked, but access remains valid until expiry | Short bounded staleness unless state is rechecked | Scales, often with more token infrastructure | Browser token storage and refresh replay require careful rotation | Highest complexity for no current cross-origin/mobile need |

### Decision

Use **server-side opaque browser sessions stored in PostgreSQL**, referenced by one host-only `HttpOnly` cookie. Do not use JWTs for the initial web panel.

The browser receives a cryptographically random 256-bit token. PostgreSQL stores only a versioned HMAC-SHA-256 digest of that token, never the token itself. A public internal session UUID supports audit and foreign keys but is not a credential. The HMAC key is provisioned outside the database; storing its version permits planned rotation. Constant-time comparison is required after lookup where comparison is not already performed by an indexed digest equality query.

This choice supports immediate logout, global logout, suspension, session theft response, owner demotion response, and horizontally scaled API processes using the existing PostgreSQL dependency. Redis is not required for correctness. A future Redis cache may reduce read load only if revocation/version consistency is proven; PostgreSQL remains authoritative.

## 6. Discord OAuth architecture

### Standards basis and provider facts

Discord currently documents the OAuth 2.0 authorization-code grant, `state`, code exchange, refresh tokens, token revocation, `identify`, `guilds`, and `guilds.members.read`. Discord's current public OAuth documentation does **not** document `code_challenge`, `code_challenge_method`, or `code_verifier`. OAuth Security Best Current Practice recommends authorization code plus transaction-specific PKCE S256 for web clients when the provider supports it, exact redirect matching, one-time CSRF state otherwise, and no open redirectors. See [Discord OAuth2](https://docs.discord.com/developers/topics/oauth2), [Discord user/guild-member resources](https://docs.discord.com/developers/resources/user), and [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html).

The implementation phase must verify Discord PKCE support against current official provider documentation and a development application. If Discord supports it, S256 is mandatory and the transaction stores an encrypted verifier. If it remains undocumented/unsupported, the adapter must not pretend PKCE is active: confidential-client authentication plus a one-time, browser-bound, expiring state remains mandatory. `state` should remain enabled even if PKCE is used because it also correlates the application transaction and return target.

### Recommended flow

1. The browser requests a login start endpoint on the same origin.
2. The server validates an optional return-target **key** against a compiled/configured allowlist. It never accepts a free-form post-login URL.
3. The server generates at least 32 random bytes for OAuth `state` and a separate browser-binding token. If provider capability is verified, it also generates a transaction-specific PKCE verifier and S256 challenge.
4. The server stores an `OAuthTransaction` containing only state and binding digests, provider, purpose (`login`, later `link` or `reauthenticate`), fixed redirect-URI identifier, allowlisted return target, expiry, and encrypted PKCE verifier when used.
5. The server sets a short-lived host-only, `Secure`, `HttpOnly`, `SameSite=Lax` OAuth-binding cookie and redirects to Discord's authorization endpoint with `response_type=code`, configured client ID, exact redirect URI, minimum scopes, and state. The callback URI is configured, not request-derived.
6. Discord redirects to the fixed callback with `code` and `state`, or a provider error/cancellation.
7. Before code exchange, the callback validates syntax, hashes state and the binding cookie, atomically claims exactly one unexpired/unconsumed transaction, confirms provider/purpose/redirect, and rejects replay. Invalid state receives a generic error; it is never reflected or logged.
8. The server exchanges the code directly with Discord over TLS using the client secret and, when supported, the PKCE verifier. OAuth codes, client secrets, and tokens are excluded from logs, URLs after the callback, error details, and audit metadata.
9. The server calls Discord's current-user endpoint and validates the returned Discord snowflake. Requested scopes and token type must equal the approved set; unexpected or missing scopes fail closed.
10. The server verifies current membership and roles for the configured guild as described below.
11. In one database transaction, it creates or resolves the platform account and external identity, updates non-authoritative profile metadata, stores encrypted provider tokens if retained, creates/rotates the browser session, consumes the OAuth transaction, and appends authentication audit events. Unique constraints resolve concurrent first-login races.
12. The response sets a new session cookie, deletes the temporary OAuth-binding cookie, and redirects only to the stored allowlisted relative target. The callback page must not load third-party resources and should immediately replace the callback URL in browser history.

Minimum initial scopes should be `identify` plus `guilds.members.read` if the user-token membership strategy below is approved. Do not request `email`, `connections`, `guilds.join`, bot installation, or application-command scopes without a concrete use case. `guilds` alone reports basic membership across guilds but does not provide the exact current member roles required for permission-principal translation.

Discord OAuth tokens authorize server-to-Discord provider calls only. They must never be returned to browser JavaScript, accepted as a Qbox API bearer token, or confused with the bot token. Provider cancellation is an expected safe outcome; provider errors and token exchange failures are normalized and audited without exposing provider payloads.

## 7. Discord guild-membership verification

### Options

| Source | Strength | Limitations |
| --- | --- | --- |
| OAuth `guilds` scope | Direct user-authorized current guild list | Basic membership only; no exact current roles; broader list than needed. |
| OAuth `guilds.members.read` | Direct member object for the configured guild, including current roles | Requires retaining/refreshing encrypted user OAuth tokens for later freshness checks. |
| Bot member lookup | Server-side current guild/member data using the existing bot application | Requires making the bot credential available to an API-side adapter or an authenticated inter-service boundary; increases bot-token blast radius. |
| Persistent synchronized snapshot | Fast and available during brief provider outages | Becomes stale and cannot remain authoritative indefinitely. |

### Decision

Use Discord's current guild-member endpoint with the user's `guilds.members.read` grant as the initial authoritative membership and role source. Keep it behind an injected `DiscordGuildMembershipVerifier` provider port so a future bot-backed verifier or trusted bot service can replace or corroborate it without changing authentication or authorization domains.

Store only a bounded membership snapshot containing the internal identity ID, configured guild ID, current role snowflakes, verification time, provider source, and status. It is a cache of provider truth, not a permanent grant.

Freshness policy:

- membership must be verified during login and reauthentication;
- guild-scoped protected operations may use a snapshot no older than five minutes;
- owner/admin mutations and identity-link changes require a snapshot no older than one minute or a live provider check;
- a confirmed `404`/not-member result immediately removes role principals, records departure, and revokes all browser sessions while Discord guild membership remains a platform-login requirement;
- rejoin does not silently reactivate a revoked session; the user logs in again and a fresh membership record is created/updated;
- a Discord outage does not turn stale membership into permanent authority. If the snapshot is beyond the allowed age, membership-dependent authorization fails closed with dependency-unavailable semantics, not a fabricated denial;
- a fresh confirmed absence is an authorization/account eligibility failure, not a dependency failure.

Longer-lived background synchronization may improve responsiveness later, but it must not be the only verification path for privileged operations. Discord usernames, guild nicknames, and cached display roles are never authoritative.

## 8. Session lifecycle

### Creation and storage

- Generate a 256-bit random session token with Node's cryptographic RNG.
- Store the raw token only in the response cookie; store a versioned HMAC-SHA-256 digest in PostgreSQL.
- Create a separate UUID session record linked to the platform user and login identity.
- Record `createdAt`, `authenticatedAt`, `lastSeenAt`, idle expiry, absolute expiry, account authentication revision at issuance, credential method, and safe device metadata hashes.
- Insert session creation and login-success audit events in the same transaction as account/identity changes where possible.
- Never accept a pre-login cookie value as the new session token. Successful login always creates a new token, preventing fixation.

### Expiry and renewal

Use an eight-hour idle timeout and a seven-day absolute timeout initially. Both are server-enforced and configurable only within reviewed bounds. Activity may advance `lastSeenAt` and idle expiry at a write-throttled interval, for example once every five minutes; it never extends the absolute expiry.

Rotate the token:

- on every successful login or fresh reauthentication;
- after identity link/unlink;
- after account recovery;
- after elevation to or demotion from owner/admin, with all other sessions revoked for privileged changes;
- when suspicious reuse or a credential-version change is detected.

Rotation atomically revokes the old digest and inserts a new session linked through `rotatedFromSessionId`. There is no long overlap window. Concurrent requests using the replaced token may receive a generic invalid-session response and retry after the browser receives the new cookie.

### Revocation and logout

- Logout is `POST`, requires CSRF protection, revokes the current session in PostgreSQL, appends an audit event, and deletes the cookie with matching attributes.
- Global logout increments the account authentication revision and revokes all active sessions transactionally.
- Account suspension, disable, deletion, confirmed guild departure, external-identity unlink, recovery, and high-privilege demotion revoke all sessions.
- Ordinary permission changes do not rely on session claims; the existing authorizer observes them immediately. For owner/admin changes, global session revocation provides additional stolen-session containment.
- Expired/revoked sessions remain queryable for a bounded security-retention period, then a cleanup job physically removes session rows. Immutable audit events preserve history.
- Concurrent-session policy should initially allow up to five active browser sessions per account. Creating a sixth revokes the least recently used session and audits the action. Operators and users can list safe device/session summaries and revoke individual sessions later.

### Failure behavior

- Database unavailable: do not accept cached session authority; return `DEPENDENCY_UNAVAILABLE` for protected routes. Health liveness remains database-independent.
- Discord unavailable: an unexpired local session can prove the platform account, but guild-role authorization may proceed only within the explicit membership freshness window. Stale membership fails closed.
- Linked identity removed: revoke sessions and reject future refresh/login until a valid login method exists.
- Permission change: permission decisions update independently of session state; no permission list is embedded in the session.
- Stolen session: individual/global revocation, authentication-revision invalidation, audit review, and forced reauthentication contain it.

## 9. Cookie security

The production browser session cookie policy is:

| Attribute | Required value |
| --- | --- |
| Name | `__Host-qbox_session` |
| Value | Random opaque token only |
| `Secure` | Always in production |
| `HttpOnly` | Always |
| `SameSite` | `Lax` for the same-origin web panel and top-level OAuth callback |
| `Path` | `/` |
| `Domain` | Omitted, producing a host-only cookie |
| `Max-Age` | No longer than the seven-day absolute server expiry |
| `Expires` | May accompany `Max-Age` for compatibility and must match it |

The `__Host-` prefix requires Secure transport, host-only scope, and `Path=/` under the current cookie specification. See [RFC 10025](https://www.rfc-editor.org/rfc/rfc10025.html). Production startup must reject HTTP public origins or a configuration that would require an insecure session cookie.

For loopback-only development and tests, use a differently named `qbox_session` cookie without `Secure` only when `NODE_ENV` is not production and the configured public origin is loopback HTTP. Keep `HttpOnly`, `SameSite=Lax`, host-only scope, and `Path=/`. Never weaken production based on a request header.

Deletion sends the identical name, path, security, and SameSite attributes with `Max-Age=0` and an expired date. Session identifiers never appear in URLs, fragments, local storage, session storage, browser-readable cookies, or response bodies. Discord tokens never reside in the session cookie.

## 10. CSRF strategy

Use a layered **synchronizer-token strategy**:

1. Host-only `SameSite=Lax` authentication cookie.
2. Exact `Origin` validation for every unsafe cookie-authenticated method (`POST`, `PUT`, `PATCH`, `DELETE`). Accept a normalized `Referer` origin only as a narrowly documented fallback; reject requests with neither in production.
3. A per-session cryptographically random CSRF token whose digest is stored server-side. Deliver the raw token only through a same-origin authenticated bootstrap/CSRF response and require it in `X-CSRF-Token` on unsafe requests.
4. Rotate the CSRF token whenever the session token rotates; validate it with constant-time comparison.
5. Continue strict host and trusted-proxy enforcement so origin decisions cannot be rewritten by untrusted forwarding headers.

SameSite alone is not sufficient. A double-submit cookie is unnecessary while authoritative server-side sessions already exist; the synchronizer token avoids making another browser-readable cookie the sole proof.

Application by flow:

- JSON mutations: Origin plus synchronizer token.
- Login start/callback: the dedicated one-time OAuth state and browser-binding cookie protect login CSRF; no existing session is assumed.
- Logout/global logout: POST only, Origin plus synchronizer token.
- Explicit session refresh or reauthentication: Origin plus synchronizer token; OAuth reauthentication also uses a separate one-time state.
- Link/unlink: authenticated session, fresh reauthentication, Origin, synchronizer token, and a purpose-bound OAuth transaction.
- Service bearer credentials: not automatically sent by browsers and therefore do not use the browser CSRF token, but ambiguous cookie-plus-bearer requests are rejected.

## 11. CORS interaction

The first deployment should use **one public origin for the web panel and API**, with the reverse proxy serving static/UI content and forwarding `/api` and `/health` to the loopback API. This keeps authentication cookies first-party, allows host-only cookies, and avoids credentialed CORS complexity. The current CORS-disabled transport is correct for that shape.

If a separate web origin becomes a real requirement:

- use an explicit exact HTTPS origin allowlist;
- enable credentials only for those origins;
- never combine credentials with `*`;
- answer preflights deterministically with allowlisted methods and headers;
- include `Vary: Origin` where origin-specific headers are returned;
- validate production and development origins separately;
- keep Origin/CSRF enforcement even when CORS succeeds;
- never treat CORS as authentication or authorization.

A separate-origin design should be a later reviewed change because it requires implemented CORS enforcement, cookie/SameSite reassessment, reverse-proxy validation, and browser integration tests. No CORS dependency is required for the recommended initial same-origin deployment.

## 12. Token and secret storage

| Secret | Storage and handling |
| --- | --- |
| Discord client secret | Secret manager/environment at the API composition root; never database metadata, logs, diagnostics, or browser content. Support current/next version during rotation. |
| Discord OAuth access token | AES-256-GCM encrypted at rest only if retained for membership calls; store key version, random nonce, authentication tag, expiry, scopes, and provider authorization ID separately. |
| Discord OAuth refresh token | AES-256-GCM encrypted at rest; stricter access path than profile data; rotate stored ciphertext after every refresh response and revoke at Discord on unlink/global compromise where possible. |
| Session token | Browser cookie only; PostgreSQL stores a versioned HMAC-SHA-256 digest. Never encrypt merely to recover it. |
| Session HMAC key | External secret with key version. Keep current and previous verification keys for controlled rotation or deliberately revoke all sessions. |
| OAuth state and browser binding | Raw values exist only in the browser redirect/cookie; PostgreSQL stores digests and one-time status. |
| PKCE verifier | Encrypted in the short-lived OAuth transaction only when Discord support is verified; delete/erase on consumption/expiry cleanup. |
| OAuth encryption key | External 256-bit key with version; AES-GCM associated data binds provider, identity/transaction, and token type. Keys remain separate from database backups. |
| Service credential | High-entropy opaque secret shown once; store public credential ID plus versioned HMAC digest. Never share one key across services. |
| Future API key | Same per-identity opaque/hash pattern unless an approved protocol requires asymmetric assertions. |

Node 22's native `crypto.randomBytes`, `createHmac`, AES-GCM primitives, WebCrypto digest support, and `timingSafeEqual` are sufficient. Authentication must use a single reviewed crypto utility rather than ad hoc calls throughout handlers. Encryption-key rotation needs key-version columns and an online re-encryption process. HMAC-key rotation may accept multiple versions briefly or intentionally revoke sessions/credentials; it must never silently fall back to an unknown key.

Database backups contain encrypted provider tokens and credential digests. Encryption/HMAC keys must be backed up separately with restricted access. A database leak therefore exposes account relationships and session digests but not reusable raw sessions; a simultaneous key leak changes that assessment and triggers global revocation, provider-token revocation, and key rotation.

## 13. PostgreSQL and Prisma model

The schema below is a recommendation only. It requires a separately reviewed additive migration.

### `PlatformUser`

Purpose: canonical human platform account.

Important columns:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`;
- `status PlatformUserStatus` (`ACTIVE`, `SUSPENDED`, `DISABLED`, `DELETED`);
- `authenticationRevision BIGINT NOT NULL DEFAULT 1`;
- `suspendedAt`, `disabledAt`, `deletedAt` nullable timestamps consistent with status;
- structured status reason code, not a free-text-only reason;
- `createdAt`, `updatedAt`.

Indexes/constraints: status index; status/timestamp check constraints; immutable ID/created time. Do not physically delete during ordinary operation. Mutable profile display data should not live here unless it is platform-owned and non-authoritative.

### `ExternalIdentity`

Purpose: provider subject ownership and mutable profile snapshot.

Important columns:

- internal UUID `id`;
- `platformUserId` restrictive FK;
- provider enum initially containing only `DISCORD`;
- immutable `providerSubjectId` containing the verified Discord snowflake;
- mutable `username`, `globalName`, `avatar`, and other bounded profile snapshots;
- `enabled`, `linkedAt`, `verifiedAt`, `lastProviderRefreshAt`, `unlinkedAt`;
- `createdAt`, `updatedAt`.

Constraints: global unique `(provider, providerSubjectId)` and initial unique `(platformUserId, provider)`; Discord snowflake check; enabled/unlinked state check. An unlinked identity retains ownership history and cannot be claimed by another account without a protected transfer/merge transaction.

### `BrowserSession`

Purpose: authoritative server-side browser session.

Important columns:

- UUID `id`;
- restrictive FKs to platform user and login external identity;
- unique binary/hex `tokenDigest` plus `tokenKeyVersion`;
- `authenticationRevisionAtIssue`;
- `csrfDigest` and `csrfKeyVersion`;
- status/revocation reason code;
- `authenticatedAt`, `lastSeenAt`, `idleExpiresAt`, `absoluteExpiresAt`, `revokedAt`;
- nullable self-FK `rotatedFromSessionId` with uniqueness preventing branching rotations;
- safe IP/user-agent hashes and optional display label;
- `createdAt`.

Indexes: unique token digest; `(platformUserId, status)`; idle/absolute expiry indexes for cleanup; revoked time; authentication revision. Constraints enforce expiry ordering and revoked-state timestamps. Session rows may be physically purged after a defined retention window because immutable audit records preserve security history.

### `OAuthTransaction`

Purpose: one-time login/link/reauthentication state and browser binding.

Important columns:

- UUID `id`;
- provider and purpose enum;
- unique `stateDigest` and `browserBindingDigest`;
- nullable platform user/session IDs for authenticated link/reauth flows;
- fixed redirect configuration key and allowlisted return-target key;
- optional encrypted PKCE verifier fields and encryption key version;
- `expiresAt`, `consumedAt`, outcome/reason code, `createdAt`.

Indexes: state digest, expiry cleanup, platform user/purpose. Consumption is an atomic conditional update requiring `consumedAt IS NULL` and `expiresAt > now()`. Expired/consumed rows are retained briefly for replay diagnostics, then purged.

### `OAuthCredential`

Purpose: recoverable provider grant used only for server-to-Discord identity/membership calls.

Important columns:

- UUID `id` and unique `externalIdentityId` FK;
- encrypted access-token and refresh-token ciphertext, nonces, authentication tags, and encryption key versions;
- exact normalized scope set;
- token type;
- provider expiry, refresh time, revoked time, and provider authorization metadata that is safe to store;
- `createdAt`, `updatedAt`.

No plaintext token column is permitted. Refresh uses an optimistic version or row lock so simultaneous refreshes cannot overwrite a rotated refresh token. Unlink/revocation marks the credential revoked and makes a best-effort provider revocation call; local rejection is immediate even if Discord is unavailable.

### `DiscordGuildMembership`

Purpose: bounded snapshot of provider-verified membership and current role IDs.

Important columns:

- UUID `id`;
- restrictive FKs to external identity and the existing `Guild` row;
- status (`PRESENT`, `ABSENT`, `UNKNOWN`);
- provider source;
- bounded `roleIds` text array or a child table of snowflake role IDs;
- `verifiedAt`, `validUntil`, `departedAt`, `createdAt`, `updatedAt`.

Constraint: unique `(externalIdentityId, guildId)`. `PRESENT` requires a non-expired verification timestamp; `ABSENT` records departure; `UNKNOWN` is never authorization-positive. Updates replace membership and role snapshot atomically.

### `AuthenticationAuditEvent`

Purpose: immutable authentication/security history independent of permission audit actions.

Important columns:

- UUID `id`;
- closed authentication action, outcome, and reason-code enums;
- request ID and canonical correlation UUID;
- actor platform user/service ID when verified;
- target internal account/identity/session/credential IDs when applicable;
- provider and purpose where applicable;
- safe metadata containing only allowlisted fields;
- irreversible IP and user-agent hashes or coarse derived categories;
- `occurredAt`, immutable `createdAt`.

Use restrictive nullable FKs plus immutable identifier snapshots where history must survive disabling. Add a database trigger rejecting UPDATE and DELETE, mirroring permission audit defense in depth. Never store raw cookies, tokens, OAuth codes, state, PKCE verifier, provider payloads, authorization headers, or free-form request bodies.

### `ServiceIdentity` and `ServiceCredential`

Purpose: future workload identity and rotatable credentials. These belong in the later service-authentication phase, not the first browser migration.

`ServiceIdentity` contains UUID, unique stable slug, status, bounded metadata, and lifecycle timestamps. `ServiceCredential` contains UUID/public credential ID, service FK, HMAC digest/key version, optional expiry, last-used time, rotation linkage, revoked time, and safe label. Allow a short two-key rotation overlap; disallow an unbounded number of active credentials.

### Data integrity ownership

Database constraints own uniqueness, foreign keys, valid state/timestamp combinations, one-time state consumption guards where expressible, immutable audit defense, and provider-subject format. Repositories own transaction boundaries, row/advisory locks, token encryption/hash mapping, optimistic refresh, and translating constraint conflicts into typed domain outcomes. Domain/application services own account eligibility, link/unlink policy, fresh-auth requirements, session limits, owner recovery safety, and which provider result is trusted.

### Race handling

- Simultaneous first login: insert account/identity in one transaction; unique provider subject selects one winner, and the loser reloads only after verifying the same transaction/subject. Never create a second account on conflict.
- Duplicate callback: atomically consume the OAuth transaction before code exchange or mark a claimed state with a bounded lease; only one callback may complete. A replay receives a generic state error and audit event.
- Identity linking: lock the identity ownership key and target platform user; global provider-subject uniqueness prevents dual ownership.
- Session rotation: lock the source session, revoke it, insert the successor, and set the cookie only after commit.
- Logout/revocation: idempotent conditional status update; repeat calls do not create misleading duplicate success state but may be safely audited according to policy.
- Account merge: lock accounts and identities in deterministic UUID order, acquire the owner-protection lock, revoke sessions, and commit link movement/tombstone/audit together.

## 14. Account linking and unlinking

Multiple Discord identities per platform account are **not supported initially**. The schema's one-identity-per-provider constraint makes that policy explicit.

Future link flow requirements:

1. Require an active authenticated browser session.
2. Require fresh Discord reauthentication within five minutes; an old session alone is insufficient.
3. Require Origin and synchronizer-token CSRF checks.
4. Create a separate one-time OAuth transaction with purpose `link`, bound to the current session/account and a fresh browser-binding cookie.
5. Verify the Discord provider subject from `/users/@me`; never accept it from a request body.
6. Lock and check global identity ownership. If owned by another account, return a generic conflict and append an audit event without naming that account.
7. Verify configured-guild membership before making the identity usable.
8. Link in one transaction, rotate the current session, revoke other sessions if account authority changes, and audit success/failure.

Unlinking requires fresh reauthentication, CSRF, an active replacement login method, and owner-recovery evaluation. It must refuse to unlink the last usable login identity, the identity through which the only recoverable owner authenticates, or an identity involved in an unresolved security hold. Unlink locally first, revoke sessions, and make a best-effort Discord token revocation call. Provider failure must not keep a locally revoked credential active.

Account merge and ownership transfer are intentionally deferred. They require a dedicated operator workflow, two-account proof or documented recovery approval, deterministic locking, last-owner protection, complete session revocation, and immutable audit history.

## 15. Owner and recovery safety

The existing permission owner bootstrap is a local, dry-run-first operator CLI that creates a guild-bound Discord user principal and platform-scoped `platform.owner` assignment. It is an authorization recovery mechanism; it does not prove a browser caller's identity and must never be exposed as an HTTP login shortcut.

Authentication adds a second owner-safety dimension: an active permission assignment is not useful if every account/identity capable of presenting that principal is disabled or unlinked. The current `OwnerProtectionService` protects permission records, principals, guilds, and definitions, but it cannot see future platform accounts or login links. Phase implementation therefore needs an `OwnerAccessProtectionService` transaction boundary in the authentication/application layer. It should acquire the same PostgreSQL advisory transaction lock used for owner mutations, re-read active owner assignments plus active linked accounts/identities, and reject any account disable, identity unlink, credential revocation, or account merge that would leave no usable owner path.

Recovery rules:

- No universal bypass token, magic owner header, environment-authenticated browser, or endpoint that accepts a Discord ID as proof.
- Normal recovery begins with Discord OAuth on a verified replacement Discord account that belongs to the configured guild.
- If the original owner Discord account is lost or revoked, an authorized operator uses the existing local owner-bootstrap workflow to grant ownership to the verified replacement Discord user. The replacement then completes normal OAuth login. Bootstrap remains dry-run-first, explicit, idempotent, and audited.
- A disabled platform account may be re-enabled only through an offline operator workflow or another active owner's protected application service. The operation requires a structured reason, correlation ID, owner-access lock, and immutable audit event.
- A corrupted session store is recovered by revoking/bumping all authentication revisions and requiring normal OAuth login. Sessions are disposable; account and permission records are not.
- During a Discord outage, no new Discord login, identity link, or fresh membership proof is possible. Existing sessions may perform only actions whose authentication and authorization inputs remain within explicit freshness bounds. Recovery waits for Discord or uses local operational permission bootstrap; it never enables a remote bypass.
- After database restoration, treat sessions and OAuth grants as potentially resurrected. Run an explicit recovery procedure that increments all account authentication revisions or globally revokes sessions, verifies owner assignments, rotates compromised keys if relevant, and records the restored backup point and actions outside and inside the immutable audit stream.
- Emergency recovery requires two deliberate operator actions where practical: generate/review a dry-run plan, then apply with an exact confirmation value. OS/database access is the operational authority; the CLI must not listen on a network socket.

Last-owner permission protection remains authoritative for assignment changes. Authentication owner-access protection supplements it; it does not weaken or replace it.

## 16. Service authentication

Browser sessions and service credentials are separate credential classes with separate parsing, storage, audit, expiry, and revocation rules.

### Options

| Strategy | Suitability now | Security/operations |
| --- | --- | --- |
| Shared static API key | Unacceptable | No workload attribution, broad blast radius, difficult rotation, and effectively an internal master key. |
| Per-service high-entropy opaque token | Recommended initially | Simple, auditable, hashable, immediately revocable, and compatible with the current VPS/PostgreSQL maturity. |
| Signed JWT assertions | Defer | Useful for federated issuers, but adds key distribution, issuer/audience/clock, replay, and revocation complexity. |
| mTLS | Strong later option | Excellent workload binding, but certificate issuance/rotation and reverse-proxy termination are premature for the current deployment. |
| Cloud/workload identity | Preferred when the hosting platform supports it | Removes stored long-lived secrets, but no current orchestrator or identity provider exists. |

### Decision

Start later with **one high-entropy opaque credential per service identity**, never one credential shared across worker, scheduler, bot, deployment tooling, or FiveM bridge.

Recommended wire format is a recognizable non-secret prefix and public credential UUID plus random secret, for example `qbx_svc_<credential-id>.<secret>`. The public part selects one row; the secret is verified against a versioned HMAC digest. Each credential has an expiry, status, last-used timestamp, safe label, rotation predecessor, and revocation reason. Rotation permits a short explicit overlap and then revokes the old credential.

Service requests use an `Authorization` bearer credential over TLS, not a cookie. Cookie plus service bearer credentials is an ambiguous request and must be rejected. Service actors receive only permissions assigned to a future service authorization principal through the existing authorizer. There is no implicit internal trust and no platform-owner default.

The current permission domain and Prisma enum cannot represent service principals. Do not encode a service UUID as `discord-user`, reuse a system audit actor as authorization, or grant based on a service name alone. A later reviewed phase must extend the domain principal union, persistence enum/nullability and assignment constraints, resolver, repository tests, and compiled permission usage before service-authenticated domain operations are enabled.

Deployment tooling that runs locally against PostgreSQL does not need an HTTP service identity merely to appear uniform. It should remain an explicit operator CLI until a remote automation use case exists.

## 17. Future FiveM identity boundary

No FiveM/Qbox code, server protocol, player identity, or trust mechanism exists. The authentication architecture should reserve interfaces, not schema enum values or usable routes.

Required future boundary:

- A FiveM bridge authenticates first as its own restricted service identity. The game client itself is never a trusted service.
- A player identifier is provider-qualified, for example a Rockstar/license or approved platform identifier, and represented as a string. The exact authoritative identifier set requires a FiveM-specific review.
- Linking a player to a platform account uses a short-lived, random, one-time linking code generated by the platform for an already authenticated platform account. Store only its digest, purpose, account, server, expiry, and consumed state.
- The bridge submits the code together with server-authenticated context. The database consumes it atomically; client-supplied player identifiers without trusted server proof never authenticate or link an account.
- Codes are single-use, expire in minutes, are bound to one server identity and purpose, and are rate limited. Replays are audited and rejected.
- A compromised game server can lie about connected players. Contain it with server-specific credentials, narrowly scoped service permissions, server-bound player links, short-lived assertions, revocation, and no platform-wide owner/admin authority.
- FiveM-linked identity may later become an external identity/login method only after a stronger proof and recovery design. Initial linking should support game authorization/use cases, not browser login.

## 18. Authentication middleware boundary

Authentication belongs in an encapsulated Fastify plugin/hook backed by injected application services. It should run after the base transport has created and validated request context, and before protected route handlers. Public health routes are explicitly `public` and bypass cookie parsing, session lookup, Discord calls, and database authentication work.

Each route/plugin declares one policy:

- `public`: no credential accepted or required for actor construction; health remains cheap and dependency-independent;
- `optional`: supported credentials may produce a verified actor, but absence remains unauthenticated;
- `required-browser`: exactly one supported session cookie is required;
- `required-service`: exactly one service bearer credential is required;
- a future explicit union only when the application service genuinely supports both actor types.

Processing order:

1. Read only the credential locations allowed by route policy.
2. Reject duplicate or malformed credential syntax without logging values.
3. If both cookie and bearer/service credentials are present, return `AMBIGUOUS_CREDENTIALS`; never choose silent precedence.
4. Hash/verify the credential through the authentication application service.
5. Load session, account, external identity, and authentication revision; reject expired/revoked/disabled state.
6. Refresh membership only when route/application policy requires it and the snapshot is stale.
7. Create a frozen verified actor.
8. Replace `request.apiContext` exactly once with `bindVerifiedActor(existingContext, actor)`, which returns a new frozen object preserving request ID, correlation ID, start time, signal, and client IP while creating a child logger with only internal actor type/ID.
9. Pass the actor and request `AbortSignal` to application services.

The context replacement must be internal and symbol/private-hook guarded; no route input schema exposes `actor`. Forged `X-User-ID`, `X-Discord-ID`, `X-Service-ID`, or similar headers are rejected or ignored according to a strict selected-header schema and never populate identity.

Session verification is PostgreSQL-authoritative. If an optional Redis cache is added later, entries must contain authentication revision and short expiry, and revocation must invalidate before success is returned. A cache outage falls back to PostgreSQL; a PostgreSQL outage fails protected authentication closed.

## 19. Authorization integration

Introduce a transport-independent `AuthorizationPrincipalResolver` that consumes a verified actor plus trusted resource/guild context and returns principals and `PermissionScope`. It does not evaluate permissions.

### Platform user actor

For the initial Discord-login implementation:

1. Load the actor's enabled Discord external identity.
2. Resolve the server-selected guild row/context.
3. Require a fresh `PRESENT` Discord membership snapshot.
4. Produce the existing guild-bound `discord-user` principal and current `discord-role` principals.
5. Invoke `PermissionAuthorizer` with the route/application service's compiled permission list, all/any mode, and explicit administrator-override policy.

This immediately reuses existing authorization without changing its rules. The platform account itself is not yet an authorization principal. A future `platform-user` principal requires an explicit permission-domain and schema extension; it must be guild-independent and must not be simulated by placing a platform UUID into a Discord principal.

### Service actor

A future service actor maps only to a future service principal. It receives no Discord user or role principals and no guild merely because a request named one. Guild scope is derived from the target resource and validated against service assignments.

### Scope and role freshness

- Platform scope is chosen only by the application use case; it is not requested by the caller.
- Discord guild scope uses the configured/persisted `Guild` identity after host/route resource resolution.
- Role principals come from a membership verification within the approved freshness window.
- `ABSENT`, `UNKNOWN`, expired, malformed, or cross-guild membership creates no role principals and fails protected work closed.
- Permission cache behavior, deny precedence, owner/admin rules, expiry, and repository failure remain entirely inside `PersistentPermissionService`.

### Enforcement locations

Route declarations provide early, consistent 401/403 mapping and documentation. Privileged application services independently authorize immediately before business/repository work, passing the request correlation ID into any subsequent audit. Both layers call the same `PermissionAuthorizer`; neither reimplements precedence. The application-service check is authoritative because it protects non-HTTP transports and prevents route-registration mistakes from becoming authorization bypasses.

## 20. Authentication errors

Extend the existing `ApiErrorCode`/Problem Details schema only when implementation begins. Recommended stable external mappings are:

| Condition | HTTP | Stable code | Public behavior |
| --- | ---: | --- | --- |
| No supported credential on required route | 401 | `AUTHENTICATION_REQUIRED` | Generic authentication-required message. |
| Malformed/unknown session token | 401 | `AUTH_SESSION_INVALID` | Do not reveal lookup details; delete unusable cookie. |
| Session past idle/absolute expiry | 401 | `AUTH_SESSION_EXPIRED` | Generic expired-session message; delete cookie. |
| Session explicitly revoked/revision mismatch | 401 | `AUTH_SESSION_REVOKED` | Generic reauthentication message; delete cookie. |
| Valid session for disabled/suspended account | 403 | `AUTH_ACCOUNT_DISABLED` | Say account is unavailable, not why or who acted. |
| Multiple credential classes supplied | 400 | `AMBIGUOUS_CREDENTIALS` | Reject rather than choose precedence. |
| OAuth state/binding invalid, expired, consumed, or replayed | 400 | `OAUTH_STATE_INVALID` | One generic response; do not echo state. |
| Provider cancellation or invalid callback/code | 400 | `OAUTH_CALLBACK_FAILED` | Generic login failure/cancelled response. |
| Provider/network unavailable | 503 | `DEPENDENCY_UNAVAILABLE` | Retry-safe generic provider-unavailable response. |
| Provider identity already owned by another account | 409 | `IDENTITY_ALREADY_LINKED` | Returned only after authenticated link plus provider proof; never identify the owner. |
| Concurrent/ambiguous identity operation | 409 | `IDENTITY_CONFLICT` | Generic conflict. |
| Sensitive action needs recent provider proof | 401 | `FRESH_AUTHENTICATION_REQUIRED` | Start a purpose-bound reauthentication flow. |
| Origin or synchronizer token fails | 403 | `CSRF_VALIDATION_FAILED` | Generic request rejection. |
| Service credential malformed/invalid/revoked | 401 | `SERVICE_CREDENTIAL_INVALID` | Same message for all credential failure reasons. |

Internal audit reason codes may distinguish invalid, expired, revoked, replay, provider denial, database failure, and policy rejection. Client messages never include stack traces, provider responses, account existence, identity owner, assignment data, token fragments, or cryptographic failure details. Responses preserve request/correlation IDs and `application/problem+json`.

Enumeration-sensitive public login failures should collapse to generic results. More specific identity-link conflicts are acceptable only after a caller has a valid session, fresh reauthentication, CSRF proof, and provider proof of the identity being linked.

## 21. Authentication audit model

Authentication audit events are append-only and separate from permission audit events. Use a closed action/outcome/reason catalog covering:

- login started, succeeded, failed, and cancelled;
- OAuth callback accepted, rejected, expired, and replayed;
- session created, renewed, rotated, expired, and revoked;
- logout and global logout;
- identity link/unlink attempted, succeeded, and rejected;
- account suspended, disabled, enabled, deleted, recovered, and merged;
- guild membership verified, departed, rejoined, or unavailable when security-relevant;
- service identity/credential created, rotated, expired, revoked, and rejected;
- owner recovery and emergency session invalidation.

Every event includes:

- immutable event UUID and timestamps;
- action, outcome, and structured reason code;
- request ID where an HTTP request exists;
- canonical correlation ID, generated for CLI/background operations if absent;
- real actor internal ID when verified;
- target internal IDs when relevant;
- provider/purpose and safe credential/session record IDs;
- safe route template and service name;
- keyed IP hash and user-agent hash or coarse family, not unbounded raw values.

Do not store cookies, session-token digests in audit metadata, OAuth codes, raw state, PKCE verifier, OAuth access/refresh tokens, authorization headers, client secrets, request bodies, full provider payloads, or database URLs. Free text is optional and bounded; a reason code is mandatory for administrative/recovery mutations.

Login failure audit must resist log/audit flooding. Aggregate operational metrics, rate-limit repeated sources, and retain individual immutable events according to a documented security retention policy. Audit append failure during a successful login/session mutation should roll back the security state where the event is required for accountability.

## 22. Abuse protection

### Required before exposing login or credential routes

- At least 256-bit session secrets and 256-bit OAuth state/binding values.
- One-time, expiring, browser-bound OAuth transactions with atomic replay rejection.
- Exact configured redirect URIs and allowlisted return-target keys; no redirect URL supplied by a caller.
- Session fixation prevention through unconditional post-login token creation/rotation.
- Generic enumeration-safe login and credential failures.
- Per-process token-bucket limits for OAuth start, callback failures, CSRF failures, session refresh, link/unlink, and service-credential failures while the deployment is single-instance.
- A per-account/session limit on outstanding OAuth transactions and active browser sessions.
- Bounded OAuth rows and cleanup queries to prevent state-table growth.
- Provider-call deadlines, retry limits, circuit metrics, and no automatic retry of a consumed authorization code.
- Constant-time secret comparison and no raw credential logging.
- Fresh reauthentication plus CSRF for link/unlink and recovery-sensitive actions.
- Stolen-cookie containment through session inventory, individual/global revocation, account revision, rotation, and high-privilege session invalidation.

### Deferred until distributed rate limiting/multi-instance deployment

- Redis-backed IP/account/provider-subject rate buckets;
- cross-instance progressive delay and coordinated lockout signals;
- distributed OAuth-start quotas and replay telemetry;
- shared bot/provider membership cache invalidation;
- fleet-wide anomaly scoring.

Redis is a scaling dependency, not a prerequisite for session correctness. Before adding a second API instance, local-only abuse limits must be replaced or supplemented by a distributed mechanism. Database uniqueness and one-time transaction consumption remain necessary even after Redis exists.

## 23. Concise threat model

| Threat | Prevention | Detection | Containment | Recovery |
| --- | --- | --- | --- | --- |
| Stolen browser session | Secure/HttpOnly host-only cookie, TLS, high entropy, no URL/storage exposure, bounded expiry | Session-use audit, device/IP hash changes, suspicious rotation/reuse events | Individual/global revoke, account revision, privilege-change revocation | Fresh Discord login; rotate affected keys only if key compromise is suspected |
| XSS | Same-origin design, output encoding, no token in JavaScript, future web CSP where meaningful | Browser/security telemetry and unusual request audit | HttpOnly prevents direct cookie read but XSS can act as user; revoke sessions and disable affected UI deployment | Patch injection source, deploy, global logout if exposure is broad |
| CSRF | SameSite Lax, exact Origin/Referer, synchronizer token, one-time OAuth state/binding | CSRF failure metrics/audit | Reject before application service | Rotate session/CSRF token if compromise suspected |
| Malicious OAuth callback/login CSRF | One-time state, browser binding, exact redirect, PKCE S256 if verified, provider identity call | Invalid/replayed state and subject mismatch audit | Consume/reject transaction, no session created | Restart a fresh login flow |
| Compromised Discord account | Discord's own controls plus fresh reauth for sensitive changes | New-session/device and identity-change audit | Revoke sessions, suspend platform account, remove/deny permission assignments using existing controls | Deliberate owner/bootstrap recovery to a verified replacement identity |
| Compromised Discord bot | Do not use bot token for browser login; isolate any membership adapter | Bot identity mismatch, Discord API anomalies | Revoke bot token; user OAuth verifier remains available | Rotate bot token and revalidate memberships |
| Compromised service credential | Per-service, scoped, expiring tokens; no shared master | Last-used/audit and rate anomalies | Revoke one credential/service; deny remains centralized | Rotate credential and inspect actions |
| Malicious reverse-proxy headers | Existing exact host and proxy-IP allowlist; proxy overwrites forwarded headers | Invalid/untrusted forwarding logs | Reject malformed trusted metadata; ignore untrusted metadata | Correct proxy/allowlist and rotate sessions only if origin/IP trust was bypassed |
| Database leak | Hashed sessions/service tokens, encrypted provider tokens, keys stored separately | Database/access monitoring and integrity review | Revoke sessions/provider grants; rotate encryption/HMAC keys | Restore clean database, re-encrypt, force login, verify audits/owners |
| Log leak | Field allowlists and redaction; never pass credentials to logger | Secret-pattern scans and log review | Revoke any exposed credential | Purge retained logs where possible and rotate |
| Insider privilege abuse | Existing authorizer, deny precedence, owner lock, fresh auth, separation of duties, reason codes | Immutable authentication and permission audits | Suspend actor, revoke sessions/credentials, deny assignments | Reviewed owner/operator recovery and audit investigation |
| Account-linking takeover | Authenticated session, fresh reauth, separate bound OAuth state, global identity uniqueness | Link conflict/rejection audit | Reject/rollback, revoke suspicious session | Secure both accounts and use audited operator merge/recovery only |
| Replay attacks | One-time OAuth/link codes, session rotation, service credential expiry, transaction uniqueness | Replay reason codes and metrics | Revoke transaction/session/credential | Fresh flow/credential rotation |
| Owner lockout | Existing permission owner protection plus future owner-access protection | Rejected mutation audit and owner-path health check | Reject unsafe unlink/disable/demotion | Dry-run-first local bootstrap to verified replacement owner |

## 24. Testing strategy

### Pure unit tests

Use fake clocks, deterministic crypto ports, and in-memory repository fakes for:

- platform account and identity invariants;
- actor construction and immutable binding;
- session token/digest generation, expiry, idle/absolute timeout, rotation, and authentication revision;
- logout/global logout and idempotent revocation;
- cookie serialization/deletion flags in production and loopback development;
- OAuth state, browser binding, return-target allowlist, purpose binding, expiry, and PKCE capability behavior;
- CSRF Origin/Referer and synchronizer-token decisions;
- account disabled/suspended/deleted behavior;
- identity link/unlink, last-login-method, and owner-access rules;
- service token parsing, key-version verification, expiry, and rotation;
- error normalization and enumeration-safe messages;
- audit event redaction and reason-code validation.

### API injection tests

Fastify injection should cover:

- public health routes cause no authentication repository/provider calls;
- required/optional/public route policy;
- missing, malformed, expired, revoked, and ambiguous credentials;
- forged actor/Discord/service headers never populate the actor;
- context is replaced once with a frozen verified actor;
- session cookie flags, rotation, deletion, and fixation prevention;
- CSRF success/failure for every unsafe browser flow;
- OAuth start redirect shape without logging state;
- callback cancellation, provider failure, invalid/expired/replayed state, PKCE mismatch in the fake provider, and duplicate callbacks;
- account/identity conflict responses;
- database and Discord dependency outages;
- authorization delegation to the existing authorizer;
- secrets absent from logs and Problem Details.

### PostgreSQL integration tests

Use the disposable database name guard already required by database tests. Cover:

- additive migrations apply to empty and current schemas;
- concurrent first Discord login creates one account/identity;
- provider-subject and per-account/provider uniqueness;
- OAuth transaction single consumption and replay under concurrency;
- session rotation/revocation/global revision transaction rollback;
- expired-session and OAuth cleanup queries;
- simultaneous link conflict;
- refresh-token optimistic concurrency/row locking;
- append-only authentication audit UPDATE/DELETE rejection;
- account disable/unlink rollback when owner-access protection rejects;
- restart persistence;
- no partial security state when audit append fails.

### Fake Discord provider

Define a provider-independent port and a deterministic fake for CI. It must simulate:

- authorization URL generation;
- code exchange success/failure;
- current user with immutable Discord ID and mutable names;
- exact guild member/role results;
- missing scopes;
- cancellation;
- expired/revoked tokens and refresh rotation;
- rate limit, timeout, malformed provider response, guild departure, and outage;
- PKCE supported/unsupported and verifier mismatch.

No production Discord credential is permitted in CI. Provider response DTOs are parsed once with strict Zod schemas.

### Live OAuth tests

After automated validation, use a dedicated development Discord application/guild and HTTPS callback or an explicitly approved loopback callback. Verify login, logout, global logout, restart persistence, authorized/unauthorized role changes, guild departure/rejoin, identity conflict, callback replay, session cookie flags, and provider-token revocation. Sanitize evidence; never paste codes, cookies, client secrets, or OAuth tokens.

### Cleanup and operational tests

Test expiry cleanup on a disposable database with fake time, bounded batches, and refusal outside a test-marked database. Test signal shutdown with active authentication requests, transaction rollback on `AbortSignal`, deployment restarts with sessions preserved, and global revocation after simulated backup restore.

## 25. Operations and deployment

- Terminate public TLS at a reviewed reverse proxy; the API remains loopback-bound. Redirect HTTP to HTTPS before setting production cookies.
- Configure `API_PUBLIC_BASE_URL` to the exact public origin and register the exact Discord callback URL. Do not compute either from `Host` or forwarded headers.
- The proxy must remove client-supplied forwarding headers, write its own, and connect from the existing explicit trusted-proxy allowlist.
- Use the same public origin for web and API initially. Keep cookies host-only and CORS disabled.
- Provision Discord client secret, OAuth encryption keys, session/service HMAC keys, and key versions through the host secret facility. Do not put them in Git, `.env.example` values, logs, images, database rows, or command-line arguments visible to other users.
- Maintain current and next key versions during planned rotation. Expose only key version/status diagnostics, never key material.
- Synchronize system clocks with a reliable time service; OAuth state, token, session, CSRF, and service-credential validity all depend on time.
- Run session/OAuth cleanup in bounded batches. A process-local periodic task is acceptable for one API instance; the future scheduler should own it once implemented. Cleanup failure degrades diagnostics but must not make expired state valid.
- Back up PostgreSQL regularly. Keep encryption keys separate, test restoration, and document the post-restore global session-revocation procedure.
- Incident response must support immediate account suspension, individual/global session revocation, service credential revocation, provider token revocation, key rotation, owner-path verification, and audit export.
- Normal deployment restart preserves PostgreSQL sessions. New code versions must continue reading active key versions; a breaking key removal is an intentional mass logout.
- Multiple API instances can share PostgreSQL sessions, OAuth transactions, account state, and audits without Redis. They must share encryption/HMAC keys securely. PostgreSQL transactions provide callback/session correctness.
- Redis becomes necessary for strong distributed rate limiting and may be useful for short-lived caches/invalidation. It is not required for authoritative sessions, OAuth state, revocation, or identity ownership.
- Readiness should require authentication repositories/configuration and key availability once auth routes are installed. Liveness remains independent. Discord outage should appear as a safe degraded component and block only work needing fresh provider evidence.

## 26. Dependency review

No dependency should be added during architecture work.

| Potential dependency | Purpose | Recommendation | Security/maintenance considerations |
| --- | --- | --- | --- |
| Node 22 `node:crypto` | Random tokens, HMAC, AES-GCM, SHA-256/PKCE, constant-time comparison | Required platform-native API; no package | Centralize usage, version ciphertext, validate key lengths/nonces, and never invent custom encryption formats without tests. |
| Native `fetch`/`AbortSignal` | Discord authorization-code exchange and resource calls | Sufficient initially | Strict URL constants, TLS, deadlines, response limits, Zod parsing, and no redirect to arbitrary hosts. |
| Existing Zod | Auth configuration and provider/transport DTO validation | Required and already owned by `@qbox/api` | Keep one schema source; reject unknown provider fields where appropriate. |
| Existing Fastify | Hooks and auth routes | Required and already owned by `@qbox/api` | Keep route plugins injected and health bypass explicit. |
| `@fastify/cookie` | Standards-aware cookie parsing and serialization | Likely required when browser middleware is implemented; request approval then | Pin a Fastify-5-compatible maintained version; configure signed cookies only if actually used. Opaque session security remains server-side, not plugin signing. |
| `oauth4webapi` or another OAuth client | Standards-oriented URL, token, and PKCE helpers | Optional, not required for the narrow Discord adapter | Adds protocol expertise but must support Discord's non-OIDC endpoints/config. Review dependency health and do not accept unsafe defaults. Native fetch plus a small tested adapter is viable. |
| `openid-client` | OpenID Connect/OAuth client | Not required for Discord's documented non-OIDC login flow | Avoid OIDC concepts/ID-token validation when Discord supplies no OIDC contract. |
| `jose` | JWT/JWS/JWE | Not required initially | Avoid until signed assertions are an approved requirement. JWTs are not the browser session decision. |
| Password-hashing library | Human password verification | Not required because no password login is proposed | Random session/service tokens use HMAC digests; do not add password auth casually. |
| `@fastify/cors` | Separate-origin credentialed CORS | Not required for same-origin first deployment | Add only with approval when allowlist enforcement is implemented and tested. |
| Rate-limit plugin/Redis | Local/distributed abuse limits | Local implementation or small plugin may be needed before login exposure; Redis deferred until multi-instance | Must key only on safe normalized dimensions, handle proxy IP correctly, and fail according to endpoint risk. |

Prefer platform-native crypto and fetch plus existing Fastify/Zod. A small, audited cookie dependency is more defensible than hand-parsing `Cookie`; final selection belongs to the implementation phase and requires dependency approval.

## 27. Phased implementation plan

### Phase 1 - Authentication domain contracts and additive schema

- **Scope:** Create a pure `@qbox/authentication` workspace with account, external identity, session, OAuth transaction, provider port, actor, audit, reason-code, and repository contracts. Add only human/Discord browser-auth schema models and one reviewed additive migration. Define owner-access protection interface but do not expose login.
- **Likely files:** `packages/authentication/package.json`, `packages/authentication/src/**`, `packages/authentication/test/**`, `prisma/schema.prisma`, `prisma/migrations/<timestamp>_authentication_foundation/**`, generated Prisma client, schema integration tests, directly affected docs/index.
- **Schema changes:** `PlatformUser`, `ExternalIdentity`, `BrowserSession`, `OAuthTransaction`, `OAuthCredential`, `DiscordGuildMembership`, `AuthenticationAuditEvent`, required enums/checks/indexes/triggers. No service/FiveM rows yet.
- **Dependencies:** No new external dependency expected. Workspace manifest/lock importer and generated client change as required.
- **Tests:** Exhaustive domain validation plus PostgreSQL constraints, uniqueness, append-only audit, OAuth single-consumption, and concurrent first-login skeleton transactions where possible without provider calls.
- **Live checks:** Migration apply/drift on disposable PostgreSQL only; no browser or Discord login.
- **Rollback:** Additive schema remains unused if application work rolls back. Prefer roll-forward migration correction; do not destructive-reset production.
- **Risks:** Schema overreach, accidental coupling to permission principals, incorrect uniqueness preventing safe recovery.
- **Complexity:** High.

### Phase 2 - Session repository and lifecycle services

- **Scope:** Implement Prisma adapters in `@qbox/database`, crypto ports/utilities, session create/verify/rotate/revoke/global-revoke, account revision, cleanup queries, transactional authentication audit, and owner-access protection transactions. No HTTP routes.
- **Likely files:** `packages/database/src/authentication/**`, `packages/authentication/src/services/**`, integration tests, database composition exports.
- **Schema/migration:** Only corrections proven necessary by Phase 1 tests; otherwise none.
- **Dependencies:** Node crypto only.
- **Tests:** Token secrecy, no implicit plaintext, timeout/expiry, rotation races, rollback, audit atomicity, last usable owner/account protection, restart persistence.
- **Live checks:** Operator-only database diagnostic/test harness; no cookie issued.
- **Rollback:** Services are uncomposed and can be removed without disabling existing API/Discord paths.
- **Risks:** Crypto/key-version mistakes, concurrency, audit availability coupling.
- **Complexity:** High.

### Phase 3 - Discord OAuth provider and membership adapters

- **Scope:** Add typed authentication configuration and a generic provider port with a Discord adapter using fixed endpoints, native fetch, strict Zod response schemas, deadlines, minimum scopes, encrypted token storage/refresh, membership verification, fake provider, and explicit PKCE capability decision. Still no publicly registered routes.
- **Likely files:** `packages/authentication/src/providers/**` contracts, `apps/api/src/authentication/discord/**`, `apps/api/src/config/ApiConfiguration.ts`, composition tests, `.env.example` names only after approval.
- **Schema/migration:** None expected unless provider-token rotation metadata proves incomplete.
- **Dependencies:** No external dependency expected; OAuth library only after separate review/approval.
- **Tests:** Provider success/failure, scope/subject validation, state/purpose binding service integration, refresh races, guild membership/roles, outages, redaction, fake PKCE support/mismatch.
- **Live checks:** Development Discord application capability probe that records no credentials; verify documented callback/scopes and PKCE behavior.
- **Rollback:** Adapter remains unregistered; revoke development OAuth grants if needed.
- **Risks:** Provider behavior drift, token leakage, undocumented PKCE assumptions, excessive scopes.
- **Complexity:** High.

### Phase 4 - Browser authentication transport, CSRF, and local abuse controls

- **Scope:** Add cookie parsing/serialization, login start/callback, current-session, logout/global-logout, CSRF bootstrap, authentication route policy, actor context binding, local rate limits, exact redirect/Origin policy, and application composition. No permission-management routes.
- **Likely files:** `apps/api/src/authentication/**`, `apps/api/src/context/ApiRequestContext.ts`, `apps/api/src/createApiServer.ts` or an encapsulated plugin registration point, `ApiError.ts`, configuration/composition/lifecycle files, tests and API conventions.
- **Schema/migration:** None expected.
- **Dependencies:** Likely `@fastify/cookie` after explicit approval; no CORS dependency for same-origin deployment.
- **Tests:** Full injection matrix, cookie flags, fixation, callback replay, CSRF, forged headers, ambiguity, signal/cancellation, rate limits, log redaction.
- **Live checks:** Real development OAuth login/logout/restart on HTTPS or approved loopback callback; inspect cookies without revealing values.
- **Rollback:** Remove route registration and revoke development OAuth grant; existing health API remains unaffected.
- **Risks:** Remotely exploitable auth/session/CSRF flaw; reverse-proxy misconfiguration.
- **Complexity:** Very high.

### Phase 5 - Authorization-principal resolution and protected application boundary

- **Scope:** Implement `AuthorizationPrincipalResolver`, fresh Discord membership/role translation, route permission declarations, transport-independent application-service guard, and correlation into permission/auth audits. Add no domain mutation endpoint until a separately approved feature phase.
- **Likely files:** `packages/authentication` actor ports, `packages/permissions` resolver-facing contracts if needed, `apps/api/src/authorization/**`, application service tests.
- **Schema/migration:** None for initial Discord-principal mapping. A platform-user principal extension is separate and must not be hidden here.
- **Dependencies:** Existing `PermissionAuthorizer` and membership verifier.
- **Tests:** Direct user/role grants, guild isolation, deny/owner/admin behavior through the existing service, stale/absent membership, repository/provider outages, middleware bypass attempts, non-HTTP application service calls.
- **Live checks:** Authenticated allowed/denied no-op diagnostic or first approved real use case; never a placeholder production command/endpoint merely for display.
- **Rollback:** Disable protected route/application registration; authentication session remains usable only for session endpoints.
- **Risks:** Actor-to-principal mismatch and cross-guild privilege leakage.
- **Complexity:** High.

### Phase 6 - Account linking, reauthentication, and recovery hardening

- **Scope:** Purpose-bound reauthentication, link/unlink, session/device management, owner-access protection integration, operator recovery CLI, account suspension/enable, provider revocation, and incident runbook.
- **Likely files:** authentication services/repositories, API auth routes, operator CLI under an application boundary, docs/runbook.
- **Schema/migration:** Only if recovery/merge history needs a dedicated record; no speculative merge support.
- **Dependencies:** Phases 1-5 and existing owner protection.
- **Tests:** Last login method, identity ownership conflict, owner lockout, lost/revoked Discord account, disabled account, Discord outage, provider revocation failure, audit evidence.
- **Live checks:** Development link/unlink and owner recovery drill with non-production identities.
- **Rollback:** Disable self-service linking; keep safe sessions and offline recovery.
- **Risks:** Account takeover and owner lockout.
- **Complexity:** Very high.

### Phase 7 - Service identities

- **Scope:** Add service identity/credential contracts and schema, per-service opaque token issuance/rotation/revocation CLI, service middleware, and a real approved worker/bot/tool use case.
- **Likely files:** `packages/authentication`, `packages/database`, Prisma schema/migration, API service-auth plugin, operator documentation.
- **Schema/migration:** `ServiceIdentity`, `ServiceCredential`; explicit permission-principal type/schema extension.
- **Dependencies:** A concrete internal service API use case and permission-domain extension approval.
- **Tests:** Credential guessing/replay, scope limitation, rotation overlap, revocation, ambiguous cookie/bearer, no master key, audit.
- **Live checks:** One non-production service call end to end.
- **Rollback:** Revoke service credential and disable the route/client; browser auth unaffected.
- **Risks:** Internal trust escalation and long-lived secret leakage.
- **Complexity:** High.

### Phase 8 - Distributed and operational hardening

- **Scope:** Redis-backed distributed abuse limits/caches only when multiple instances require them, cross-instance invalidation, key rotation automation, session/OAuth cleanup ownership, anomaly metrics, backup-restore drill, and incident response validation.
- **Likely files:** approved Redis adapter package, API composition/health, worker/scheduler when real, operations docs and CI/live tests.
- **Schema/migration:** Optional global authentication revision/key status only if operational evidence requires it.
- **Dependencies:** Operational Redis and multi-instance deployment; scheduler for owned cleanup.
- **Tests:** Cross-instance revocation/rates, Redis outage fallback, key rollover, restore and mass logout.
- **Live checks:** Staged multi-instance and incident drill.
- **Rollback:** PostgreSQL remains authoritative; disable caches without accepting stale authority.
- **Risks:** stale cache, split-brain limits, operational key failure.
- **Complexity:** High.

FiveM linking/authentication remains a separate integration phase after a FiveM trust-boundary review and is not implicitly included in Phase 7.

## 28. Recommended first implementation phase

Implement **Phase 1: Authentication domain contracts and additive schema** first.

It comes first because every later choice needs stable definitions for account ownership, external identity uniqueness, actors, sessions, one-time OAuth transactions, audit events, and repository transactions. It is also the safest phase: it creates no usable credential, cookie, callback, public route, provider call, or authorization path.

It includes:

- a pure, framework- and Prisma-independent authentication domain/application contract package;
- canonical actor/account/identity/session/OAuth/audit types and reason codes;
- repository, provider, crypto, clock, and owner-access protection interfaces;
- the additive PostgreSQL/Prisma schema and migration for browser/Discord authentication only;
- database constraint and migration tests;
- exhaustive pure invariant tests and documentation.

It deliberately excludes:

- Discord network calls;
- OAuth routes;
- cookies and CSRF enforcement;
- session token issuance through HTTP;
- API actor middleware composition;
- authorization principal changes;
- permission-management routes;
- service identities and credentials;
- FiveM identity;
- Redis and distributed rate limiting.

Completion criteria:

- all exported contracts have complete TSDoc and import no Fastify, Discord.js, Prisma, Redis, or Express;
- authentication and permission models remain separate;
- provider subject and per-account/provider uniqueness are database-enforced;
- session/OAuth expiry and state invariants are constrained and tested;
- authentication audit is append-only at application and PostgreSQL levels;
- migrations apply to an empty disposable PostgreSQL database and the current schema with no drift;
- build, typecheck, unit tests, database integration tests, secret scans, dependency-boundary scans, and generated-client determinism pass;
- no authentication route or credential is operational.

Blockers are limited to approval of exact status/reason enums, retention periods, and the proposed model names. No external dependency or live Discord credential is required for Phase 1.

## 29. Final decision summary

| Decision | Recommendation |
| --- | --- |
| Canonical platform account | First-class internal `PlatformUser` UUID with linked external identities. One Discord identity per account initially; one provider subject can never normally belong to multiple accounts. |
| Browser session type | High-entropy opaque server-side session; no JWT browser session. |
| Session storage | PostgreSQL-authoritative record with versioned HMAC token digest, eight-hour idle timeout, seven-day absolute timeout, rotation/revocation, and account authentication revision. Redis is optional later, never authoritative. |
| Discord OAuth flow | Authorization code, exact callback, minimum `identify` + `guilds.members.read` scopes, one-time browser-bound expiring state, server-side exchange, encrypted provider tokens. Require PKCE S256 only after current Discord support is verified; never claim unsupported protection. |
| Guild membership | Discord current-member response via injected user-OAuth verifier, cached for at most five minutes and one minute for privileged mutations. Stale/unavailable evidence fails closed; confirmed departure revokes sessions. |
| CSRF | SameSite Lax host-only cookie + exact Origin/limited Referer validation + per-session synchronizer token; OAuth has separate state and browser binding. |
| CORS/deployment | Same public origin for web and API behind HTTPS reverse proxy. Keep CORS disabled initially; explicit credentialed allowlist only if a real separate-origin requirement emerges. |
| Account linking | Disabled initially beyond first Discord link. Later require active session, fresh reauth, CSRF, purpose-bound OAuth state, global identity uniqueness, owner protection, session rotation, and immutable audit. |
| Owner recovery | Deliberate local dry-run/apply workflow using verified replacement Discord identity and existing owner bootstrap, supplemented by future owner-access locking. No HTTP bypass, static master token, or ID-as-authentication endpoint. |
| Service credentials | Later per-service, high-entropy opaque, HMAC-digested, expiring and rotatable credentials with a distinct service principal. No shared internal key and no browser-session reuse. |
| Future FiveM boundary | Authenticate the bridge as a restricted service; bind short-lived one-time link codes to server and account; never accept a client-supplied player ID as account proof. |
| First implementation phase | Pure authentication contracts plus additive human/Discord auth schema and migration, with exhaustive unit/database tests and no usable login endpoint. |

The resulting architecture keeps the trust chain explicit:

```text
Discord/provider or service credential proof
  -> PostgreSQL-backed authentication
  -> verified immutable actor
  -> trusted guild/resource resolution
  -> existing PermissionAuthorizer
  -> authorized application service
  -> repository transaction and immutable audit
```

Authentication establishes identity. Authorization remains the single source of permission truth.
