# API Foundation Architecture Review

> Review status: this document records the pre-implementation inspection and approved design. Phase 1 implemented the unbound server factory and transport contracts. Phase 2 subsequently implemented process composition, persistence-first startup, lifecycle-backed readiness, socket ownership, bounded shutdown, and signal handling. Authentication and domain routes remain future work.

## 1. Current API-related code

### `apps/api`

`@qbox/api` is a private ESM TypeScript workspace. Its only source file, `apps/api/src/index.ts`, prints `QboxPlatform api starting...`. The package has `build`, `dev`, `start`, `typecheck`, and `clean` scripts, but it has no test script. Its only declared workspace dependency is `@qbox/core`.

The API does not currently:

- instantiate Fastify;
- bind a network socket;
- create a `PlatformKernel`;
- register a module or service;
- load validated API configuration;
- connect to PostgreSQL;
- expose health or versioned routes;
- establish request context, validation, error mapping, authentication, or authorization;
- handle process signals or startup cleanup.

It is therefore a startup placeholder, not an HTTP application.

### Root tooling and Fastify

The root workspace uses pnpm 10.16.0 and Node.js 22 or newer. Root scripts recursively build, typecheck, test, and clean workspaces. `fastify` is declared at the repository root as `^5.11.0`; the lockfile currently resolves Fastify 5.11.0. Zod is also available at the root as `^4.4.3`. Neither is declared by `@qbox/api`, so the API does not currently own the runtime dependencies it would import. Package ownership should be corrected when implementation begins rather than relying on pnpm root dependency visibility.

### Shared environment loading

`packages/shared/src/env.ts` loads the repository-root `.env` through `dotenv` at module import time and exports a single object. It supplies Discord, database, Redis, OpenAI, and compatibility values. Most string values use empty-string fallbacks. No API host, port, timeout, proxy, base URL, CORS, or body-limit values exist.

`packages/shared/src/config/Configuration.ts` is a second environment abstraction containing only Node environment, Discord token, Redis URL, and OpenAI key. `packages/shared/src/config.ts` also defines an `AppConfig`, but it is not exported through `@qbox/shared`. These are existing overlapping configuration paths. API configuration should be one validated value object constructed at the composition root; it should not add another unvalidated global environment singleton.

### Logger

`@qbox/logger` exports one process-global Pino logger. It reads `LOG_LEVEL` directly, adds `service: "qbox-platform"`, and has no explicit redaction configuration. The bot uses it for structured lifecycle and interaction logs. The API can use Pino-compatible child loggers, but HTTP redaction and request fields must be configured explicitly. Secrets must not be passed to the logger on the assumption that Pino will remove them.

### Kernel, modules, and service container

`PlatformKernel` owns a `ServiceContainer`, `EventBus`, and `ModuleLoader`. On startup it registers those core services, then starts modules sequentially and emits `platform.started`. Shutdown emits `platform.stopping` and stops modules in reverse registration order.

`ServiceContainer` is string-keyed, permits replacement of an existing key, and narrows values through an unchecked generic assertion in `get<T>()`. `ModuleLoader` rejects duplicate module names, but `PlatformKernel.start()` does not automatically roll back modules already started when a later module fails. The bot composition compensates with explicit cleanup in its entrypoint and within the persistence module.

The API should use the existing kernel/module lifecycle rather than invent a parallel application container. Its composition root must still own startup-failure cleanup and signal idempotency. HTTP request handlers should receive typed application dependencies through a server factory or route-plugin options; they should not repeatedly fetch untyped services by string.

### Database lifecycle and repositories

`@qbox/database` is implemented infrastructure. `DatabaseConfiguration` strictly validates PostgreSQL URLs, environment, SSL mode, startup timeout, and query timeout while exposing redacted diagnostics. `DatabaseService` owns a process-local client lifecycle and reports `LIVE`, `READY`, or `DEGRADED` plus `ACCEPTING` or `REJECTING`. Startup is bounded and attempts cleanup after failure.

`PrismaPermissionPersistenceClient` owns the Prisma-backed permission repositories and participates in `DatabaseService` lifecycle. The repositories implement guild, principal, definition, assignment, catalog, and immutable audit persistence. Owner mutation protection and advisory transaction locking already exist. Applications may compose `@qbox/database`; HTTP route handlers and domain services must not import `@qbox/prisma`, generated clients, or instantiate repositories.

### Permission authorization

`PersistentPermissionService` implements the asynchronous `PermissionAuthorizer` interface. It consumes verified principals and scope, evaluates direct grants and denies, owner and optional administrator override behavior, expiration, enabled state, and repository failure. It fails closed for protected operations when authoritative state is unavailable. The API can later inject this interface into authenticated application services. It must not derive authoritative actor identity from route bodies, query parameters, or arbitrary headers.

The deprecated synchronous `PermissionService` remains exported for compatibility, but it is not the API authorization path.

### GitHub Actions

The quality workflow runs on pull requests targeting `main` and pushes to `main`. It installs with a frozen lockfile, formats and validates Prisma, generates and checks the client, builds and typechecks workspaces, deploys migrations to a disposable PostgreSQL 17.6 service, checks drift, runs database integration tests and unit tests, and checks whitespace. It provides no Discord credentials and should continue to require none for API tests.

### Documentation and roadmap

At review time, `PROJECT_INDEX.md`, `docs/Architecture.md`, `docs/ModuleGuide.md`, `docs/DevelopmentWorkflow.md`, and `ROADMAP.md` described the API as a placeholder. Roadmap Phase 4 identified a Fastify runtime, configuration validation, structured logging, health/readiness, graceful shutdown, and tests as the next API boundary. Database and persistent-permission documentation prohibit direct Prisma access from API routes. Some older architecture-review passages describe database or permissions as future work; current implemented code and newer repository documentation take precedence over those historical planning statements.

## 2. API server architecture

The API should have one composition root and one testable server factory.

```text
apps/api/src/index.ts
  -> parse process configuration
  -> construct database/persistence/permission dependencies
  -> create PlatformKernel
  -> register persistence module, then HTTP module
  -> kernel.start()
  -> install idempotent SIGINT/SIGTERM shutdown

createApiServer(dependencies, configuration)
  -> Fastify instance (not listening)
  -> request-context hooks
  -> centralized error handler
  -> health routes
  -> /api/v1 route plugin boundary
```

`createApiServer` must construct and return an unbound Fastify instance. It must not inspect `process.env`, install process signal handlers, connect to PostgreSQL, or call `listen()`. Tests can therefore use `fastify.inject()` without a public port.

An `ApiModule` should own HTTP lifecycle. Its constructor receives the server, validated API configuration, and injected health/application dependencies. Startup occurs only after persistence has reached readiness and registered its services. The module calls `listen()` once and registers the HTTP service only after successful binding. Shutdown first stops accepting new requests, allows bounded in-flight request completion, and then closes Fastify. Kernel reverse-order shutdown consequently closes HTTP before persistence.

The process entrypoint owns signals and an idempotent shutdown promise. `SIGINT` and `SIGTERM` initiate one shutdown, set readiness to rejecting before socket closure, enforce the configured shutdown deadline, and set a nonzero exit code on failure. It must not call `process.exit()` while cleanup is still running. If startup fails, the entrypoint calls `kernel.stop()` and closes a constructed-but-unregistered server if necessary.

HTTP transport code is limited to parsing transport input, invoking an injected application service, and mapping its result. Application services own use-case orchestration and authorization. Infrastructure repositories remain behind those services. No route handler constructs Prisma, `DatabaseService`, repository adapters, or `PersistentPermissionService`.

## 3. Configuration

Create one immutable `ApiConfiguration` value object from untrusted input. It should follow `DatabaseConfiguration`: a `from(input)` factory, typed diagnostics, stable validation errors, private sensitive/raw values where applicable, and safe JSON serialization.

Recommended fields and defaults:

| Field | Development/test default | Production rule |
|---|---:|---|
| environment | `development` | Must be exactly `production` in production deployment |
| host | `127.0.0.1` | Explicit; default remains loopback unless deployment deliberately binds another interface |
| port | `3000` | Integer 1–65535; explicit configuration recommended |
| bodySizeLimitBytes | `1 MiB` | Positive bounded integer; never unlimited |
| requestTimeoutMs | `15,000` | Positive bounded integer |
| keepAliveTimeoutMs | `5,000` | Positive bounded integer and coordinated with reverse proxy timeout |
| shutdownTimeoutMs | `10,000` | Positive bounded integer |
| trustProxy | `false` | Must be an explicit false value or reviewed proxy address/CIDR list; never unrestricted `true` by default |
| corsMode | `disabled` | Placeholder policy only; production must reject wildcard-with-credentials |
| rateLimitMode | `disabled` | Placeholder policy only; production exposure requires implementation before sensitive routes |
| publicBaseUrl | `http://127.0.0.1:3000` | Required HTTPS absolute URL, no credentials, fragment, or ambiguous host |
| logLevel | inherited validated logger level | Must be one of the approved Pino levels |

Empty strings are invalid, not defaults. Numeric strings must be parsed completely and constrained. Host values must not contain a URL scheme or path. `publicBaseUrl` must use HTTP only in development/test and HTTPS in production. Diagnostics may include environment, host, port, limits, timeout values, proxy mode, feature-policy modes, base URL origin, and log level; they must exclude credentials, database URLs, headers, and secrets.

The existing shared environment loader may expose raw names temporarily, but parsing belongs in `ApiConfiguration`. A later configuration cleanup should reconcile `env`, `Configuration`, and `AppConfig`; the API foundation should not silently broaden that cleanup into unrelated bot changes.

## 4. Health model

Health routes remain outside `/api/v1` and require no authentication. They return small stable JSON documents and read cached lifecycle snapshots rather than issuing an unbounded database query per probe.

### `GET /health/live`

- `200 OK` while the process and HTTP event loop are running, including when PostgreSQL is unavailable.
- `503 Service Unavailable` only after shutdown has begun and readiness/lifecycle has been marked stopping, if the server can still answer.
- Must not query PostgreSQL or any future external dependency.

### `GET /health/ready`

- `200 OK` only when startup is complete, the server is accepting work, and every required dependency reports accepting/ready.
- `503 Service Unavailable` during startup, shutdown, failed database startup, lost required database readiness, or another required dependency outage.
- The present required dependency is PostgreSQL/persistent permission infrastructure. Optional future components must not accidentally become readiness requirements without an explicit policy.

### `GET /health/degraded`

- `200 OK` because this is an operational diagnostic endpoint for a live process, whether or not degradation exists.
- Returns `degraded: true` if any component is degraded or unavailable and includes safe component summaries such as `{ name, state, required, reasonCode? }`.
- Returns `degraded: false` when all registered components are healthy.
- If shutdown has progressed far enough that HTTP cannot answer, the connection naturally fails; the endpoint does not redefine liveness.

All responses include a schema version, service name, process state, build/version metadata when supplied by the build environment, and a timestamp. They expose no host internals, credentials, connection strings, stack traces, SQL, role assignments, or dependency error messages. A generic health-contributor contract should allow Redis, scheduler, Discord, and FiveM components later without changing route schemas.

## 5. Request context

Each request receives an immutable context:

```ts
interface ApiRequestContext {
  requestId: string;
  correlationId: string;
  actor: ApiActor;
  startedAt: number;
  logger: Logger;
  signal: AbortSignal;
  clientIp: string;
}
```

Fastify generates `requestId` server-side. Client-provided request IDs are never authoritative. A client `x-correlation-id` may be accepted only if it is one canonical UUID and within a strict length limit; otherwise the server generates a UUID. Invalid values should be replaced, not reflected. Responses return the server-selected request and correlation IDs in headers and error bodies where appropriate.

`actor` initially equals `{ type: "unauthenticated" }`. Authentication middleware will later replace it from verified credentials, never from a request body or identity header.

The logger is a child containing request ID, correlation ID, and later only a safe actor identifier/type. `startedAt` uses a monotonic clock for latency. A request-scoped `AbortController` is aborted on client disconnect, server shutdown, or a bounded request deadline. Application services may cooperate with the signal; cancellation must not be assumed to roll back work unless the transaction boundary explicitly does so.

`clientIp` comes from Fastify's socket-derived address unless `trustProxy` has been explicitly restricted to known proxy hops. `X-Forwarded-For`, `Forwarded`, `X-Real-IP`, and similar headers are ignored when the sender is not a trusted proxy.

## 6. Logging

Use structured events rather than Fastify's default request serialization plus separate duplicate application logs. Recommended events are:

- `api.request.received`: method, normalized route if matched, request ID, correlation ID, actor type, and safe client metadata;
- `api.request.completed`: the same identifiers, status code, and latency;
- `api.request.failed`: stable error code, status code, severity, and latency;
- lifecycle events for configuration accepted, listening address, readiness transitions, shutdown requested, shutdown completed, and cleanup failure.

Route templates such as `/api/v1/users/:id`, not raw URLs containing query values, belong in completion logs. Safe client metadata is limited to trusted IP, user-agent with a length cap, and protocol where operationally useful. Actor logs use stable internal IDs only after authentication and never include complete permission assignments.

Never log authorization headers, cookies, bodies by default, passwords, bearer/session tokens, database URLs, raw query strings, multipart content, or arbitrary headers. Internal failures may include stack traces in server logs, but production responses never include them. Pino redaction paths should be defense in depth; input selection remains the primary control.

## 7. Error model

Define a transport-independent `ApplicationError` contract with a stable code, HTTP status mapping at the transport boundary, public message, operational flag, and optional safe details. Concrete categories are:

| Category | HTTP status | Example stable code | Server log level |
|---|---:|---|---|
| Validation | 400 | `VALIDATION_FAILED` | warn/info |
| Authentication required | 401 | `AUTHENTICATION_REQUIRED` | warn |
| Authorization denied | 403 | `AUTHORIZATION_DENIED` | warn |
| Not found | 404 | `RESOURCE_NOT_FOUND` | info |
| Conflict | 409 | `RESOURCE_CONFLICT` | warn |
| Rate limit | 429 | `RATE_LIMITED` | warn |
| Dependency unavailable | 503 | `DEPENDENCY_UNAVAILABLE` | error |
| Internal failure | 500 | `INTERNAL_ERROR` | error/fatal only for process-level failures |

Safe response shape:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request is invalid.",
    "details": []
  },
  "requestId": "server-generated-id",
  "correlationId": "validated-or-generated-id"
}
```

Validation details contain only field paths and stable issue codes, with rejected values omitted. The error handler recognizes expected application/validation errors and maps unknown values to `INTERNAL_ERROR`. Internal error messages, SQL information, dependency response bodies, and stack traces are logged safely but never sent to clients. Fastify 404s and parser/body-limit errors must use the same response envelope.

## 8. Validation strategy

Use Zod as the primary application validation strategy. It is already an approved root dependency, provides strong TypeScript inference, supports strict reusable schemas, and can validate configuration and transport data consistently. Fastify's JSON Schema is valuable for native serialization and future OpenAPI generation, but adopting it as a second authoring source would create parallel schemas. TypeBox would add another dependency and schema language. Plain TypeScript performs no runtime validation.

Every route should define Zod schemas for params, query, selected headers, body, and response DTOs. Objects should be strict by default. Shared primitives—UUIDs, Discord snowflakes, pagination, correlation IDs, timestamps—belong in focused schema modules. Route adapters parse unknown Fastify input once and pass typed values to application services.

Response DTOs should also be validated in tests and, where performance permits, at the application/transport boundary in non-production or for high-risk responses. A future OpenAPI adapter should derive documentation from the same Zod definitions rather than creating hand-maintained schemas. Versioned DTOs are immutable contracts under `v1`; incompatible changes require `v2`.

Fastify still enforces low-level body size, content type, JSON parsing, header count, and timeout limits. Those transport protections complement rather than replace Zod semantic validation.

## 9. Routing and versioning

Use Fastify plugins for encapsulation:

```text
routes/
  health/                 mounted at /health
  v1/
    index.ts              mounted at /api/v1
    permissions/          future
    authentication/       future
    discord-oauth/        future
```

The first foundation registers health routes and an empty `/api/v1` plugin boundary; it does not create domain endpoints. Each future domain plugin receives typed application services through explicit plugin options. Route files contain schemas and HTTP mapping, not persistence composition.

URL versioning begins at `/api/v1`. Health routes are operational contracts and remain unversioned, though their payload includes a schema version. Future permission-management, authentication, and Discord OAuth routes should be separate plugins because their security, cookie, and rate-limit policies differ.

## 10. Security foundation

### Controls required in the foundation

- Bind to loopback by default and require an explicit host for broader exposure.
- Set bounded body, request, keep-alive, shutdown, and header limits.
- Reject unsupported content types and malformed JSON consistently.
- Disable unrestricted proxy trust; configure exact proxy hops or address ranges.
- Validate `Host`/forwarded host against the configured public origin at the edge and application boundary where applicable.
- Keep CORS disabled by default. Define a typed allowlist policy boundary now, but do not enable wildcard origins.
- Provide a rate-limit policy interface/configuration placeholder, but do not claim enforcement until implemented.
- Redact sensitive headers and never log bodies by default.
- Use Fastify/Node versions that receive security updates and preserve CI lockfile determinism.
- Return generic dependency and internal errors.
- Mark readiness unavailable when required dependencies cannot safely serve work.
- Reject ambiguous content length/transfer handling through the maintained HTTP stack and reverse proxy; do not add custom raw HTTP parsing.

### Controls that require authentication design

- CSRF protection depends on whether browser authentication uses cookies. SameSite cookies alone are not a complete policy.
- Session cookies require `Secure`, `HttpOnly`, deliberate `SameSite`, rotation, expiry, and server-side invalidation decisions.
- Bearer token issuance, validation, audience, issuer, rotation, and revocation wait for the authentication architecture.
- Login, token refresh, OAuth callback, and recovery endpoints require stricter endpoint-specific rate limits and brute-force controls.
- Authorization timing should avoid exposing assignment details, but exact side-channel controls depend on authentication and endpoint behavior.

SSRF defenses belong at every future outbound-client boundary: URL allowlists, scheme restrictions, DNS/IP policy, redirect limits, response limits, and deadlines. The API foundation should define no generic “fetch arbitrary URL” helper.

## 11. Authentication boundary

Define a transport-neutral discriminated actor model without implementing credential verification:

- `{ type: "unauthenticated" }`;
- `{ type: "platform-user", platformUserId, discordIdentity? }`;
- `{ type: "discord-user", platformUserId?, discordUserId, guildMemberships }` after verified Discord OAuth/linking;
- `{ type: "service", serviceId }` after verified service credentials;
- `{ type: "fivem-player", platformUserId?, serverId, playerIdentity }` as a reserved future boundary, not an implemented principal.

Request bodies may refer to target identities for a use case, but they never set the authenticated actor. Only authentication middleware populates actor context from verified cookies, tokens, mTLS, or another approved credential mechanism.

Later authorization middleware/application services translate verified actor identity and trusted tenant context into domain principals and a `PermissionScope`, then call the injected `PermissionAuthorizer`. The route declares required compiled permission keys, all/any mode, and administrator-override policy. Transport middleware may reject obvious unauthenticated calls, but privileged application services must also authorize so alternate transports cannot bypass policy. Repository presence is not proof of authorization.

## 12. Testing strategy

### Unit tests

- API configuration defaults, bounds, production restrictions, and redacted serialization.
- Error category/status/code mapping.
- correlation-ID validation and regeneration.
- health aggregation and required/optional component semantics.
- actor and request-context construction.
- logging field selection and redaction policy.
- idempotent shutdown state transitions and timeout behavior.

### Fastify injection tests

- server construction has no socket or database side effects;
- `/health/live`, `/health/ready`, and `/health/degraded` payloads and transitions;
- malformed params/query/headers/body and unsupported content types;
- unknown route uses the common error envelope;
- typed errors and unknown errors map correctly;
- request and correlation IDs are returned and logged consistently;
- sensitive headers/cookies/body values never appear in captured logs;
- dependency failure changes readiness without changing liveness;
- `/api/v1` registration is isolated from health routes.

### Database-backed tests

Use the existing disposable PostgreSQL integration environment for readiness transitions across successful startup, unavailable database, and clean shutdown. These tests compose real `DatabaseService`/persistence outside route handlers. They must refuse unsafe database names using the existing test-marker policy.

### Live-socket/process tests

Use a loopback ephemeral port (`port: 0`) for a small number of tests covering actual listen/close behavior, connection draining, and signal-driven shutdown where practical. Most tests should use injection and bind no port. Signal behavior is best tested through a child process with a bounded deadline so the test runner is not terminated.

### Clean-checkout behavior

CI must build workspace package entrypoints before tests that import them. API tests must not rely on pre-existing `dist`, `.env` secrets, Discord credentials, or a publicly bound port.

## 13. CI and operations

The existing corrected quality ordering should remain:

1. frozen install;
2. Prisma format, validate, generate, and generated-artifact check;
3. workspace build and typecheck;
4. migration deploy and drift check;
5. PostgreSQL integration tests;
6. unit and HTTP injection tests;
7. whitespace checks.

Adding an API test script makes it participate in the root recursive test. HTTP injection tests need no PostgreSQL service unless explicitly composing readiness. Database-backed readiness tests can reuse the pinned CI PostgreSQL service and non-production credentials. CI must not start Discord, deploy commands, require production environment values, or bind a public port.

Production should run the built API behind a maintained TLS reverse proxy. The proxy must preserve only reviewed forwarding headers, use timeouts longer than the API's request timeout but compatible with keep-alive, impose request/header limits, and stop routing to an instance before termination. Orchestration probes call `/health/live` for process restart decisions and `/health/ready` for traffic admission. `/health/degraded` is for diagnostics/monitoring, not traffic admission.

On termination the API marks readiness rejecting, stops accepting connections, waits up to its shutdown timeout, aborts cooperative request contexts, closes HTTP, then stops database resources through reverse module order. Forced termination after the orchestration grace period remains an operational last resort. Metrics and tracing exporters can later consume the same request context and health contributors without changing route handlers.

## 14. Phased implementation plan

### Phase 1 — API runtime contracts and server factory

- **Scope:** Add package-owned Fastify/Zod declarations using existing versions; implement `ApiConfiguration`, request context, typed error mapping, logger redaction policy, health contributor/aggregator contracts, an unbound `createApiServer`, health routes, and an empty `/api/v1` plugin.
- **Likely files:** `apps/api/package.json`, `apps/api/src/config/*`, `apps/api/src/http/*`, `apps/api/src/health/*`, `apps/api/src/errors/*`, `apps/api/src/context/*`, `apps/api/test/*`, and directly affected API documentation.
- **Dependency changes:** Move or declare existing Fastify 5.11.0 and Zod 4.4.3 ownership in `@qbox/api`; lockfile changes should be ownership-only. No new library is required.
- **Tests:** Configuration, errors, context IDs, redaction, health aggregation, construction side effects, injection tests for all health states and unknown routes.
- **Live checks:** None; injection tests are sufficient because the server does not yet listen.
- **Risks:** Accidental parallel configuration systems, logging secrets through Fastify defaults, and coupling health DTOs directly to database types.
- **Complexity:** Medium.

### Phase 2 — Process composition and lifecycle

- **Scope:** Compose Fastify, `PlatformKernel`, `DatabaseService`, persistent repositories, cache, and `PermissionAuthorizer`; add `ApiModule`, listen/close lifecycle, startup cleanup, readiness sequencing, signal handling, and bounded shutdown.
- **Likely files:** `apps/api/src/index.ts`, `apps/api/src/ApiModule.ts`, `apps/api/src/composition/*`, lifecycle tests, package scripts, and operational documentation.
- **Dependency changes:** Add direct workspace ownership for `@qbox/database`, `@qbox/permissions`, `@qbox/logger`, and `@qbox/shared`; no external dependency required.
- **Tests:** Startup/shutdown, startup failure cleanup, dependency readiness transitions, duplicate signal handling, and no repository access before readiness.
- **Live checks:** Start on loopback, call health endpoints, stop with SIGTERM, confirm clean database disconnect.
- **Risks:** Kernel does not automatically roll back partially started modules; shutdown races and double cleanup require explicit ownership.
- **Complexity:** Medium–high.

### Phase 3 — Validation and transport hardening

- **Scope:** Finalize reusable Zod route schemas, body/content/header/host enforcement, normalized error responses, validated correlation header behavior, and tested CORS/rate-limit policy boundaries while keeping both disabled unless configured.
- **Likely files:** API schema, hooks, error, configuration, and security modules plus injection tests.
- **Dependency changes:** None expected. Actual CORS or rate-limit plugins require separate approval when enforcement is implemented.
- **Tests:** Malformed inputs, oversized bodies, invalid content types, host/proxy behavior, CORS-disabled behavior, header redaction, and timeout/cancellation paths.
- **Live checks:** Loopback requests through a representative reverse-proxy configuration where available.
- **Risks:** Treating placeholders as enforcement, trusting forwarded headers, or exposing validation internals.
- **Complexity:** Medium.

### Phase 4 — Authentication contracts and application-service boundary

- **Scope:** Implement only the approved authentication architecture, authenticated actor middleware, application-service authorization helper, and transport-independent permission checks. Do not add permission mutation endpoints until authentication is proven.
- **Likely files:** `apps/api/src/auth/*`, application-service contracts in an appropriate package, context extensions, and security documentation.
- **Dependency changes:** Determined by the separately approved session/OAuth design.
- **Tests:** Forged actor headers/bodies, unauthenticated/expired credentials, tenant/guild isolation, owner/admin behavior, explicit deny, repository outage, and audit correlation propagation.
- **Live checks:** Approved Discord OAuth or session flow only after credentials and callback origins are configured.
- **Risks:** Identity spoofing, CSRF/session errors, privilege escalation, and duplicating permission semantics.
- **Complexity:** High; blocked by authentication design.

### Phase 5 — First real versioned domain API

- **Scope:** Add one approved web-panel use case through `/api/v1`, an application service, domain authorization, transactional repository mutation, and immutable audit. Permission administration is a likely candidate only after authentication and recovery controls are complete.
- **Likely files:** domain route plugin, schemas, application service, integration tests, and endpoint documentation.
- **Dependency changes:** None expected beyond approved authentication infrastructure.
- **Tests:** Full transport-to-application flow, authorization bypass attempts, conflicts, transaction rollback, audit linkage, and cross-guild isolation.
- **Live checks:** Authenticated call against a disposable development guild/database, including restart persistence.
- **Risks:** Exposing administrative mutation before authentication and cross-process cache invalidation are production-ready.
- **Complexity:** High; blocked by Phase 4 and potentially Redis-backed invalidation for multi-process deployment.

## 15. Recommended first implementation phase

Implement **Phase 1 — API runtime contracts and server factory** first.

It is the highest-leverage safe boundary because every later API feature needs validated configuration, stable errors, request identity, safe logging, health semantics, versioned plugin structure, and a server that can be tested without sockets or production dependencies. It also exposes integration mistakes before database and signal lifecycle are added. The phase uses Fastify and Zod versions already present in the repository, introduces no domain endpoint, does not touch authentication or permission mutation, and keeps Prisma completely outside HTTP code.

Completion means a clean checkout can build, typecheck, and test an unbound API server with deterministic health and error behavior. It does not mean the API is deployable or listening; process composition and PostgreSQL-backed readiness deliberately remain Phase 2.
