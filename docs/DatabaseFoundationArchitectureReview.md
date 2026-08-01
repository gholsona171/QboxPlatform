# Database Foundation Architecture Review

## Status and decision summary

This review describes Phase 3 only. It does not create a schema, migration, generated client, database connection, or dependency change.

The recommended production database is **PostgreSQL**. The existing packages should both remain, with a strict dependency direction:

```text
applications and modules
        |
        v
@qbox/database       lifecycle, transactions, health, repository adapters
        |
        v
@qbox/prisma         generated Prisma client and Prisma-specific construction
        |
        v
PostgreSQL
```

Domain packages, Discord commands, API routes, and FiveM adapters must not import Prisma. They consume domain repository contracts or application services. `@qbox/database` is the only normal application-facing persistence package; `@qbox/prisma` is an infrastructure implementation detail.

## 1. Current database-related code

### Repository and workspace

The repository is a pnpm 10.16.0 workspace. `pnpm-workspace.yaml` includes `apps/*`, `packages/*`, and `modules/*`. Root scripts run `build`, `typecheck`, `test`, and `clean` recursively across workspaces. Node 22 or newer is required.

The root TypeScript configuration uses NodeNext modules, an ESNext target, strict type checking, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, isolated modules, declarations, declaration maps, and source maps. These settings are suitable for a typed database boundary, but generated Prisma output and package exports will need to be aligned with ESM and NodeNext resolution.

### `@qbox/database`

`packages/database/src/index.ts` currently exports:

- A `Database` class.
- An asynchronous `connect()` method that only prints `Database connected.`.
- An asynchronous `disconnect()` method that only prints `Database disconnected.`.
- A process-global `database` singleton.

It has no package dependencies, tests, health check, state tracking, error handling, timeout, transaction support, repository adapters, or real connection. The methods do not declare explicit return types. This package is a placeholder, not a functioning database layer.

### `@qbox/prisma`

`packages/prisma/src/index.ts` contains only `export {};`. Its package has normal build, development, typecheck, and clean scripts, but no Prisma scripts or dependencies. It does not export a generated client, client factory, types, schema location, or lifecycle API. This package is also a placeholder.

### Top-level `prisma/`

The top-level `prisma/` directory is empty. There is no:

- `schema.prisma`
- Prisma configuration
- migration history
- generated client output
- seed program
- migration lock file
- database provider declaration

The empty directory establishes an intended location but no working convention.

### Root dependencies and scripts

The root package declares `prisma` and `@prisma/client`, both at `^7.9.1`. Nothing in the repository imports them. The root has no `prisma:*`, migration, generation, validation, seed, or database test scripts.

Ownership is therefore currently ambiguous: the dependencies are installed globally for the monorepo while `@qbox/prisma` owns no Prisma functionality. Phase 3 should move direct Prisma dependency ownership to the package that uses it. That move will legitimately change `package.json` files and `pnpm-lock.yaml` in a later approved implementation subphase.

### Bot composition and lifecycle

`apps/bot/src/index.ts` creates a `PlatformKernel`, registers `createDiscordModule()`, and starts the kernel. SIGINT and SIGTERM call `kernel.stop()`. No database module is registered.

`createDiscordModule()` creates an in-memory permission runtime and injects its asynchronous `PermissionAuthorizer` into `DiscordModule`. `DiscordModule` loads commands, starts Discord, and registers permission and Discord services in the kernel service container. Persistent permission assignments are therefore still process-local. The bot neither connects to a database nor waits for database readiness.

The current composition has an important positive boundary: Discord already consumes an authorization interface rather than Prisma. A database-backed permission repository can replace the in-memory adapter without changing command handlers.

### API placeholder

`apps/api/src/index.ts` only prints `QboxPlatform api starting...`. It does not create a Fastify server, use the kernel, validate configuration, expose health endpoints, authenticate requests, register services, or access a database. Its only workspace dependency is `@qbox/core`. The API is not currently a database consumer.

### Service container and module lifecycle

The core runtime provides sequential module startup and reverse-order shutdown through `PlatformKernel`. Services are registered in an in-memory, string-keyed service container. Registration is not type-safe and may overwrite a service with the same key. There is no database service key, database module, startup dependency graph, or automatic rollback of all earlier modules when a later module fails.

The database should be composed as an explicit module before modules that require persistence. A database service must be registered only after a successful connection and health check. If later startup fails, the kernel must still stop the successfully started database module.

### Environment loading and `DATABASE_URL`

`packages/shared/src/env.ts` loads the repository-root `.env` as an import side effect. It exports `DATABASE_URL` as a string and substitutes an empty string when missing. It performs no URL, provider, credential, SSL, database-name, or environment validation.

`packages/shared/src/config/Configuration.ts` separately reads `process.env.DATABASE_URL` into a process-global `configuration` singleton. This duplicates the environment abstraction and does not ensure `.env` was loaded first. Neither value is consumed by database code.

`.env.example` includes an empty `DATABASE_URL=`. The current CI copies this file to `.env`, so a future unconditional database connection would fail unless CI configuration is changed deliberately.

### GitHub Actions quality workflow

`.github/workflows/quality.yml` runs for pull requests targeting `main` and pushes to `main`. It uses Node 22, pnpm 10.16.0, a frozen lockfile install, then runs the root build, typecheck, tests, and `git diff --check`.

It does not provide PostgreSQL, set a test database URL, generate Prisma Client explicitly, validate the Prisma schema, apply migrations, detect drift, or run database integration tests. It also must never run a production migration or use production credentials.

### Exact implemented versus placeholder boundary

Implemented today:

- Workspace build and test orchestration.
- Strict TypeScript defaults.
- Root Prisma packages in the lockfile.
- A reserved `prisma/` directory.
- A `DATABASE_URL` environment name.
- Kernel startup and reverse shutdown.
- Domain-level asynchronous permission repository and cache contracts.
- In-memory permission repository/cache implementations.

Placeholder-only today:

- Both database package implementations.
- Prisma schema, generation, and migrations.
- Database configuration validation.
- Connection and pool lifecycle.
- Database health/readiness.
- Transaction helpers.
- Persistent repository adapters.
- Database integration testing and CI services.
- Operational migration, backup, restore, and monitoring procedures.

## 2. Database engine recommendation

### Recommendation: PostgreSQL

PostgreSQL should be the single supported production and integration-test engine.

Why it is the best fit:

- **Permission transactions:** permission mutation and its audit event must commit atomically. PostgreSQL provides mature transactional behavior, row locking, isolation levels, and advisory locking when a protected invariant such as “never remove the last owner” needs serialization.
- **Audit history:** append-only audit records benefit from strong constraints, separate database privileges, and optional database triggers. PostgreSQL supports these controls well.
- **API and web panel:** concurrent reads and writes from multiple processes are normal server workloads for PostgreSQL. Pagination, filtering, reporting, and transactional mutation paths are well supported.
- **FiveM integration:** a networked database supports independent bot, API, worker, and integration processes without sharing a local file. FiveM code should still access data through platform services rather than connect directly.
- **Concurrency:** MVCC, row-level locking, unique constraints, and robust conflict handling are appropriate for simultaneous permission updates, ticket workflows, and application processing.
- **JSON support:** `jsonb` is available for immutable audit snapshots and feature metadata when a relational column is not justified. Core authorization fields should remain relational and constrained.
- **Migrations:** Prisma has mature PostgreSQL migration support, while PostgreSQL also allows carefully reviewed SQL for constraints or indexes that Prisma schema syntax cannot express precisely.
- **Production hosting:** PostgreSQL is widely available as a managed service and is straightforward to run on a VPS when managed hosting is unavailable.
- **Local development:** a pinned PostgreSQL container provides a close match to production and avoids dialect-specific surprises.
- **Backups:** standard logical backups, physical backups, WAL archiving, and point-in-time recovery are mature.
- **Operational complexity:** PostgreSQL is more operationally involved than SQLite, but that cost is justified for a multi-process production platform. It is not materially more complex than operating MySQL for this use case.

### Why not MySQL or MariaDB

MySQL/MariaDB could support the platform, but provides no material project-specific advantage. PostgreSQL is a stronger fit for partial indexes, expressive checks, transactional invariants, JSON querying, and operational tooling around a relational authorization/audit model. Supporting both would multiply migration and test complexity without adding user value.

### Why not SQLite

SQLite is suitable for embedded or single-process applications, but not as the production authority for independently deployed bot, API, worker, web-panel, and FiveM-facing services. File locking, network access, high write concurrency, operational failover, and centralized backups would become constraints. SQLite should not be used even as the primary integration-test substitute because passing tests against a different SQL dialect can conceal PostgreSQL constraint, transaction, and migration defects. Pure unit tests remain database-free; integration tests should use disposable PostgreSQL.

## 3. Package ownership

### `@qbox/prisma`

This package should own only Prisma-specific mechanics:

- Prisma Client generation target and exported generated types/client class.
- The Prisma schema toolchain configuration associated with the canonical root `prisma/` directory.
- A small client factory accepting validated configuration.
- Prisma-specific logging/event adaptation without logging parameters or credentials.
- Test utilities that are genuinely Prisma-specific.

It should depend on `@prisma/client` at runtime and own the `prisma` CLI as a development dependency where pnpm/Prisma command resolution permits. It should not expose a preconstructed mutable singleton.

The canonical schema and migration history should remain under the existing top-level `prisma/` directory because it is a repository-level deployment artifact. Architectural ownership still belongs to `@qbox/prisma`; filesystem location does not imply root application ownership.

### `@qbox/database`

This package should own application-facing infrastructure:

- Connection lifecycle and state.
- Startup deadline, connection verification, health and readiness checks.
- Graceful disconnect and resource cleanup.
- Transaction boundary helpers.
- Concrete repository adapters, beginning with persistent permissions.
- Translation between Prisma records and domain models.
- Database error classification and redacted operational diagnostics.
- Integration-test repository factories.

It should depend on `@qbox/prisma` and the relevant domain packages, such as `@qbox/permissions`. Domain packages must not depend back on `@qbox/database`.

### Application imports

- Applications should compose and start `@qbox/database`.
- Application services should receive domain repository interfaces.
- Discord modules should receive `PermissionAuthorizer` and never a Prisma client.
- API routes should receive application services and never a Prisma client.
- Migration tooling may invoke scripts owned by `@qbox/prisma` directly.
- No command, event listener, route, or FiveM adapter may instantiate Prisma.

### Transaction and repository ownership

Transaction helpers belong in `@qbox/database` because transactions are application persistence concerns, not generated-client concerns. Helpers should be narrow: accept a callback with a transaction-scoped repository set or client facade, set an explicit timeout/isolation level where needed, and never permit a transaction client to escape its callback.

Concrete repository adapters also belong in `@qbox/database`. Their interfaces remain in domain packages. Avoid a generic CRUD repository abstraction; repositories should express domain operations and required consistency boundaries.

### Keep or consolidate

Keep both packages. They represent useful, non-duplicated boundaries once implemented. Remove the current `database` singleton and placeholder console methods during implementation, but do not remove either package. The dependency direction must remain `database -> prisma`, never the reverse.

## 4. Prisma lifecycle

### Client creation and injection

Create one Prisma Client instance per operating-system process through a factory in `@qbox/prisma`. The composition root passes it into a `DatabaseService` in `@qbox/database`. The service then constructs repository adapters against that client and registers their domain interfaces.

“One per process” is a lifecycle rule, not an exported singleton. Tests may create isolated instances deliberately. Applications must not call `new PrismaClient()`.

### Lifecycle state

`DatabaseService` should have explicit states such as `created`, `starting`, `ready`, `stopping`, `stopped`, and `failed`. `start()` and `stop()` should be idempotent for normal duplicate lifecycle calls. Repository access before readiness or after shutdown should fail clearly.

Startup order:

1. Load and validate database configuration.
2. Create the client.
3. Attempt connection within the configured startup deadline.
4. Run a minimal database health query.
5. Construct repository adapters.
6. Register services only after readiness succeeds.
7. Start Discord/API modules that depend on repositories.

If connection or health verification fails, disconnect the partially created client and fail startup. Never leave Discord accepting protected interactions with an accidentally incomplete persistence composition.

### Health checks

Provide two concepts:

- **Liveness:** the Node process/event loop is alive. It must not query the database.
- **Readiness:** the process can reach the expected database and serve database-dependent work. It should use a small bounded query and report only a redacted failure category and duration.

Do not put schema mutations or migration execution in a health check.

### Shutdown

Stop request acceptance first, wait for active command/API work according to existing shutdown policies, then close database resources. Database shutdown must have a deadline and structured diagnostics. A failed disconnect should be logged and affect shutdown status without exposing the connection string.

### Development hot reload

The bot currently uses `tsx watch`, which normally restarts application code. The composition root should stop the old kernel and disconnect before replacement where the runner allows it. Do not add a general global singleton merely for hot reload.

If a future web framework evaluates modules repeatedly within one process, a development-only `globalThis` client cache may be added inside `@qbox/prisma`, guarded by environment and fully encapsulated. It is not required for the current bot/API runtime and should not be introduced speculatively.

### Test isolation

Pure tests inject fakes and create no Prisma client. Integration suites create clients against explicitly validated disposable PostgreSQL databases. Each test worker should use an isolated database or schema namespace. Cleanup must never accept an unverified URL and must refuse to operate if the target does not match an explicit test naming rule.

### Transaction boundaries

Transactions belong around complete use cases, not individual repository methods. For example, a permission assignment mutation, its catalog validation, last-owner protection, and its audit event must be one transaction.

Use the weakest isolation level that protects the actual invariant. Ordinary independent inserts may use the default. Last-owner and conflicting grant mutations require row locking or serializable execution with bounded retries for recognized serialization conflicts. No network call to Discord, Redis, or OpenAI should occur inside a database transaction.

### Startup failure cleanup

The database module must retain ownership of the client as soon as it is created. Every startup failure path calls disconnect exactly once. It registers no repositories until healthy. Kernel startup should track successfully started modules so a later module failure triggers reverse cleanup; this kernel behavior may require a focused core improvement during the wiring subphase.

## 5. Configuration

### Authoritative configuration path

Replace the two database configuration reads with one typed configuration construction path in `@qbox/shared`. Loading `.env` and validating values should be explicit at an application composition boundary, not hidden behind multiple import-time singletons.

Database configuration should be a value object containing at least:

- Redacted target identity suitable for diagnostics, such as host, port, and database name.
- Environment name.
- Startup/connect deadline.
- Query/transaction timeout policy.
- Pool limit appropriate to the process role.
- SSL policy.

The raw URL remains available only to the Prisma factory and is never included in default serialization or logs.

### Validation

For a database-dependent runtime, `DATABASE_URL` must:

- Be present and non-empty.
- Parse as a URL.
- Use the selected PostgreSQL protocol.
- Identify a host and database.
- Include an authenticated identity according to the deployment model.
- Pass environment-specific TLS requirements.
- Not contain placeholder values.

Validation errors may name the variable and invalid component but must never print the URL, password, query parameters, or authorization material.

Apps that do not yet use a database should not fail merely because the variable is absent. The requirement becomes active when the database module is registered. Migration and integration-test commands always require it.

### Environment behavior

- **Development:** use a developer-owned local PostgreSQL database, normally provided by a pinned container definition. Store the URL only in the ignored `.env`; document a non-secret example.
- **Test:** use a dedicated `DATABASE_TEST_URL` or an explicitly test-scoped injected `DATABASE_URL`. Refuse cleanup/migration operations when the test URL equals a known production URL or the database name lacks an approved test marker.
- **CI:** inject a short-lived service database URL from workflow values. These are disposable CI credentials, not repository or production secrets.
- **Production:** provide `DATABASE_URL` through the VPS secret-management/deployment mechanism. Do not bake it into an image, repository, systemd unit committed to Git, or command output.
- **Missing value:** fail configuration before creating a client for any runtime that declares database dependency.

### SSL and timeouts

Production connections should require TLS with certificate verification. Prefer provider-issued CA configuration when required. Do not normalize insecure certificate bypasses as a supported production option. Local loopback development may explicitly disable TLS.

Enforce both a bounded application startup deadline and supported driver/Prisma connection/pool timeouts. The exact URL or adapter settings must be confirmed against the installed Prisma/PostgreSQL driver during implementation. Log timeout category and elapsed duration only.

### Safe diagnostics

Permitted fields include environment, database provider, redacted host, port, database name, pool limit, SSL mode category, connection state, and duration. Forbidden fields include raw URLs, passwords, usernames when sensitive, query parameters, SQL bind values, access tokens, and environment dumps.

## 6. Initial schema boundary

The first schema should contain only persistent permission infrastructure. Tickets, applications, web sessions, FiveM identities, and other feature data should not be added until their domains are approved.

Use database-generated UUID primary keys for internal records. Store Discord snowflakes as strings, never JavaScript numbers. All timestamps should be timezone-aware UTC values. `createdAt` is immutable; `updatedAt` changes only on mutable records.

### `Guild`

Purpose: represent a Discord guild tenant recognized by the platform.

Key fields:

- Internal UUID `id`.
- Unique string `discordGuildId`.
- Optional display metadata for operations, not authorization identity.
- `enabled` state.
- `createdAt` and `updatedAt`.

Constraints and indexes:

- Unique `discordGuildId`.
- Index `enabled` only if operational queries justify it.
- Validate snowflake form at the application/domain boundary; a database check for digits and bounded length is also appropriate.

Deletion behavior:

- Do not hard-delete a guild with permission history.
- Disable it for normal removal.
- Foreign keys from assignments/principals should restrict destructive deletion.
- Audit snapshots remain readable even if optional foreign keys are later detached.

### `PermissionPrincipal`

Purpose: persist an assignable identity. The initial implemented types are Discord user and Discord role.

Key fields:

- Internal UUID `id`.
- `type` enum (`DISCORD_USER`, `DISCORD_ROLE` initially).
- Guild foreign key for both initial Discord principal types.
- External string identifier.
- `enabled`.
- `createdAt` and `updatedAt`.

Constraints and indexes:

- Unique `(type, guildId, externalId)`.
- Index `(guildId, type)` for authorization lookup.
- Check that initial Discord principal types always have a guild.
- Reserve future enum additions, but reject unsupported types in current services.

Deletion behavior:

- Disable rather than delete principals used by history.
- Restrict deletion while assignments exist.
- A deleted Discord role should be disabled by reconciliation, not cascade-delete its assignments or audit history.

### `PermissionDefinition`

Purpose: store operational metadata for identifiers whose authority remains the compiled permission catalog.

Key fields:

- Internal UUID `id`.
- Unique lowercase dot-separated `key`.
- Description and category metadata.
- `enabled`.
- Catalog version last synchronized.
- `createdAt` and `updatedAt`.

Constraints and indexes:

- Unique `key`.
- Database check for the approved identifier syntax where practical.
- Repository synchronization rejects unknown persisted keys.
- Database rows never create authority for an identifier absent from the compiled catalog.

Deletion behavior:

- Disable definitions rather than delete them when assignments/history reference them.
- Foreign keys from assignments should restrict deletion.

### `PermissionAssignment`

Purpose: record an active or historical grant/deny linking a principal, permission, and scope.

Key fields:

- Internal UUID `id`.
- Principal foreign key.
- Permission-definition foreign key.
- Effect enum (`GRANT`, `DENY`).
- Scope enum (`PLATFORM`, `DISCORD_GUILD`).
- Nullable guild foreign key required for guild scope and forbidden for platform scope.
- `enabled`.
- Optional `expiresAt`.
- Required mutation `reasonCode` and optional `reason`.
- Creator/updater actor identity fields.
- `createdAt` and `updatedAt`.

Constraints and indexes:

- Check scope/guild nullability.
- One effective assignment identity per principal, permission, and scope. PostgreSQL null semantics require a reviewed partial unique index or an equivalent normalized scope key for platform assignments.
- Index authorization lookups by `(guildId, principalId, enabled)` and expiration.
- Index permission-definition references for catalog synchronization.
- The initial repository must prevent a principal from being applied across guilds.

Deletion behavior:

- Revoke by disabling or recording a domain-defined state transition, not by routine hard delete.
- Restrict deletion of referenced principals, guilds, and definitions.
- Preserve assignment identifiers used by audit history.

### `PermissionAuditEvent`

Purpose: append an immutable, complete record of permission mutations and protected bootstrap/catalog operations.

Key fields:

- Internal time-sortable UUID or UUID plus `occurredAt`.
- Action enum.
- Target assignment/principal/permission IDs where available.
- Actor type and actor identifier.
- Required reason code and optional reason.
- Guild/scope snapshot.
- Before/after snapshots using constrained JSON only where a relational snapshot is impractical.
- Correlation/request ID.
- `occurredAt`.

Constraints and indexes:

- Index `(guildId, occurredAt)` and `(actorId, occurredAt)`.
- Index target assignment ID.
- Audit creation occurs in the same transaction as the mutation.
- The application database role receives insert/select but not update/delete rights on this table where deployment tooling permits.
- A database trigger may reject update/delete as defense in depth.

Deletion behavior:

- No cascade deletion.
- Optional live foreign keys use `SET NULL` only when immutable snapshot fields preserve meaning; otherwise restrict deletion.
- Retention, archival, and legal requirements must be approved before any purge mechanism exists.

### `PermissionCatalogState`

Purpose: record the persisted catalog version and synchronization status expected by the Phase 1 domain design.

Key fields:

- A singleton key or named catalog identifier.
- Persisted catalog version.
- Optional deterministic checksum.
- Last successful synchronization timestamp.
- Last synchronizing actor/deployment identity.

Constraints:

- One row for the permission catalog.
- Updates only through the catalog synchronization transaction.
- A version is not marked current until all compiled definitions have been reconciled and unknown persisted keys have caused the operation to fail.

### Invariant ownership

Database constraints must enforce:

- Primary keys, foreign keys, uniqueness, scope/guild nullability, known stored enum values, immutable audit behavior, and basic identifier shapes.
- Prevention of obvious orphaning and conflicting assignment rows.

Prisma repository adapters must enforce:

- Atomic mutation plus audit write.
- Tenant-qualified queries on every guild-scoped operation.
- Mapping and validation of database records into domain types.
- Compiled catalog membership during synchronization and assignment writes.
- Concurrency control and recognized conflict retry.
- No transaction client escaping its callback.

Domain services must enforce:

- Authorization semantics and grant/deny precedence.
- Supported principal/scope combinations.
- Actor authorization and self-grant restrictions.
- Owner override semantics.
- Last-owner protection as a business invariant, executed through a repository transaction/lock.
- Mutation reason-code rules, expiration semantics, and compiled catalog authority.

### Owner protection and cross-guild isolation

“At least one active platform owner” cannot be guaranteed by a simple row constraint. The domain mutation must use a transaction that locks the relevant owner set or obtains a database advisory lock, rechecks active unexpired owners, then writes the mutation and audit event atomically.

Cross-guild safety requires defense in depth: composite/conditional constraints where practical, guild-qualified repository methods, mandatory guild predicates, domain scope validation, and integration tests proving that the same external IDs in two guilds never share assignments.

## 7. Migration strategy

### First migration

The first migration should create only the six permission-foundation models, enums, constraints, indexes, and audit protections approved from the preceding schema design. It should not seed owners from environment variables automatically and should not add unrelated feature tables.

Use descriptive timestamped names, for example `2026xxxxxx_permission_foundation`. Preserve Prisma's migration history exactly after review.

### Local development workflow

1. Start a pinned local PostgreSQL service.
2. Validate that the target is a development database.
3. Format and validate the Prisma schema.
4. Create a named migration with Prisma's development migration command.
5. Inspect generated SQL manually, especially delete behavior, partial indexes, checks, and audit protections.
6. Apply it only to the developer database.
7. Generate Prisma Client.
8. Run build, typecheck, unit tests, and PostgreSQL integration tests.

Destructive reset is permitted only for a positively identified disposable local/test database and should not be the normal workflow. It is forbidden in production.

### CI validation

CI should start a disposable PostgreSQL service, wait for its health check, inject a CI-only URL, validate/generate the Prisma client, apply all migrations to an empty database using the deployment command, and run database integration tests. CI should also check schema formatting and that generation/migrations do not leave an unexpected tracked diff.

At least one migration test should build the database solely from committed migrations rather than schema push. Schema push is not a substitute for migration validation.

### Production application

- Back up and verify the target before risky migrations.
- Run migrations once as a controlled release step with a dedicated migration identity.
- Use Prisma's non-development migration apply workflow.
- Prevent multiple app replicas from independently racing migration execution.
- Deploy application code only when it is compatible with the current/next schema according to the release plan.
- Run catalog synchronization as a separate idempotent controlled startup/release operation after schema readiness, not as an implicit schema migration.

### Rollback policy

Treat migrations as forward-only. Prisma migration history is not a guarantee of safe automatic down migrations. Prefer a corrective forward migration and application rollback only when schema compatibility is preserved. For destructive or data-transforming changes, use expand/migrate/contract releases and define a restore decision point before execution.

Never edit an already-applied migration. Never use reset, force resolution, or schema push against production to repair drift without an approved incident plan.

### Backups and drift detection

Production migration approval requires a recent successful backup and known restore procedure. Drift detection should include migration status in deployment checks and periodic operational checks. Local development may use a disposable shadow database. CI must fail on invalid schema, failed migrations, or an ungenerated/stale client state.

### Prisma generation

Generation should be an explicit package script and part of a deterministic build/install workflow. Generated output ownership and Git policy must be decided before implementation. Prefer generating during install/build and not committing platform-sensitive generated artifacts unless Prisma's selected generator/output model requires a reviewed exception.

## 8. Testing strategy

### Pure unit tests

No live database required:

- Database configuration parsing and redaction.
- Lifecycle state transitions using a fake low-level client.
- Startup timeout and cleanup behavior.
- Error classification.
- Repository mapping functions.
- Transaction wrapper control flow.
- Existing permission domain semantics.

### Repository contract tests

Define one contract suite from the domain repository interface. Run it against the PostgreSQL adapter. The existing in-memory adapter may also run compatible behavioral cases, but it must not be treated as proof of SQL behavior.

Cover direct grants, role grants, denies, expiration, disabled rows, guild isolation, catalog validation, mutation reason codes, audit creation, and concurrent mutation outcomes.

### PostgreSQL integration tests

Require a disposable live PostgreSQL database for:

- Client connection and disconnection.
- Repository queries and mappings.
- Unique/check/foreign-key constraints.
- Transaction commit and rollback.
- Serialization conflict handling.
- Atomic assignment plus audit insertion.
- Last-owner concurrent mutation protection.
- Cross-guild isolation.
- Catalog synchronization failure on unknown keys.
- Readiness failure and recovery behavior.

### Startup and shutdown tests

Test successful start/stop, double start/stop policy, connection failure, health-query failure, startup timeout, cleanup after partial start, shutdown timeout, and application module ordering. Confirm Discord is not started before required repositories are ready.

### Migration tests

- Apply every committed migration to an empty PostgreSQL database.
- Validate the expected catalog/schema shape.
- Test upgrade from the last released schema once releases exist.
- Inspect migration status and fail on drift.
- Verify audit immutability and special SQL constraints that Prisma models do not fully express.

### Cleanup safety

Prefer a dedicated database per CI job and isolated database/schema per parallel worker. Use transactions for test cleanup only when code under test does not itself require independent transactions. Otherwise truncate a fixed allowlist of tables in a verified test database.

Cleanup code must parse and validate the target, require an explicit test marker, and refuse localhost assumptions as sufficient proof. It must never derive a destructive target from an empty variable.

### CI database service

Add a pinned supported PostgreSQL container with a health check, non-production credentials, and no external exposure. Separate pure tests from integration tests so developers can run fast feedback without PostgreSQL, while the root quality gate still runs both before merge.

## 9. Security review

| Risk | Recommended controls |
| --- | --- |
| SQL injection | Use Prisma's structured query API. Prohibit unsafe raw SQL with interpolated input. Centralize reviewed raw SQL needed for migrations/locks and bind parameters. Validate sort/filter fields against allowlists. |
| Connection-string leakage | Keep raw URLs inside configuration/client construction, redact errors and logs, never dump environments, scan commits, and rotate immediately after suspected exposure. |
| Overprivileged accounts | Separate migration and runtime identities. Runtime receives only required schema/table privileges; it cannot create schemas, alter tables, manage roles, or mutate audit history. Restrict network access. |
| Audit-log mutation | Write audit rows in the mutation transaction; deny runtime UPDATE/DELETE; add database trigger defense; store immutable actor/target snapshots; ship copies to protected external logging later. |
| Cross-guild leakage | Require guild-qualified repository methods and predicates, constrain principal/scope relationships, test duplicate external IDs across guilds, and authorize the requested guild at API boundaries. |
| Migration mistakes | Review generated SQL, test against empty and upgrade databases, back up first, use expand/contract for destructive changes, run once per release, and forbid production reset/schema push. |
| Accidental production reset | Do not expose reset through root production scripts. Validate environment and database identity. Require explicit, disposable target markers for any destructive test utility. Use separate credentials that lack drop/create rights at runtime. |
| Stale generated client | Make generation deterministic in build/CI, validate schema first, and fail CI if generation leaves unexpected changes or types do not match. |
| Long transactions | Keep external calls outside transactions, set bounded timeouts, instrument duration, review slow transactions, and keep mutation units narrow. |
| Connection exhaustion | One client/pool per process, process-role-specific pool limits, managed proxy/pooler if required, readiness monitoring, bounded concurrency, and capacity planning across replicas. |
| Race conditions | Enforce unique constraints, use atomic operations, lock protected owner rows/advisory key, choose explicit isolation for contested invariants, and retry only recognized transient conflicts with limits. |
| Last-owner deletion | Restrict owner mutations, serialize and recheck the owner set in the same transaction, audit every attempt, preserve an out-of-band recovery procedure, and test concurrent revocations. |
| Backup failure | Automated encrypted off-host backups, success alerts, retention monitoring, regular restore drills, documented recovery objectives, and migration gates for recent verified backups. |

Additional controls:

- Never use Discord option values as actor identity; continue using trusted interaction/session authentication data.
- Protected authorization fails closed on persistence failure. An unprotected command can remain available only if the process has deliberately entered a documented degraded mode.
- Permission catalog identifiers remain compiled authority. Database content cannot create a new effective permission.
- Cache invalidation occurs after committed mutations; short TTL and versioning bound stale access. Cache is not an authority for writes.
- Database errors returned to users contain stable safe codes, not SQL, table names, stack traces, or connection details.

## 10. Operational model

### Local development database

Provide a repository-documented, pinned PostgreSQL container in an approved implementation subphase. Use a named persistent development volume and a separate disposable integration-test database. Developers run migrations and generation explicitly. No real secret or production-like credential belongs in the compose file or documentation.

### Production database and VPS deployment

A managed PostgreSQL service is preferred because automated backups, patching, replication, and point-in-time recovery reduce operational risk. If PostgreSQL must run on the VPS:

- Run it as a separately managed service, not inside the Node process.
- Bind to a private interface or localhost as topology permits.
- Use firewall rules and TLS.
- Use separate runtime, migration, and backup identities.
- Store data and backups outside application release directories.
- Monitor disk, WAL growth, connections, locks, replication/backup state, and query latency.
- Pin and deliberately upgrade the PostgreSQL major version.

The bot, API, and worker each own their process-local Prisma pool. Pool budgets must be calculated together against the server connection limit.

### Backup and restore

An initial practical policy is:

- Daily automated backups with at least 30 days retention.
- More frequent WAL/PITR coverage when production write volume and recovery objectives justify it.
- Weekly or monthly longer-retention copies.
- Encryption in transit and at rest.
- Off-host storage with access separate from the application runtime.
- Automated missed-backup alerts.
- Quarterly restore exercises at minimum, and before major destructive migrations.

Final recovery-point and recovery-time objectives require product/operations approval. A backup is not considered valid until restoration has been tested.

### Migration execution

Migrations run as a deployment step before dependent application rollout, under a migration lock/single executor. Record migration version, duration, and result without SQL parameters or secrets. Long/locking migrations require a maintenance or online migration plan.

### Monitoring and health

Monitor connection pool usage/wait time, readiness latency/failures, transaction duration, slow queries, serialization/deadlock rates, migration version, database storage, backup age, and restore-test age. Correlate repository errors with application request/interaction IDs without logging private assignment content unnecessarily.

API liveness remains green when the process is alive; readiness becomes unavailable when required database operations cannot be served. A load balancer should remove unready API instances.

### Database unavailable behavior

- **Startup:** a process that requires persistent repositories fails startup after a bounded attempt and cleans up. It must not silently swap to an empty in-memory repository.
- **Protected operations:** fail closed with a safe temporary-unavailable response and high-quality diagnostics.
- **Unprotected diagnostics such as `/ping`:** may remain available only if the bot is intentionally allowed to start in a clearly logged degraded mode. During the migration from environment bootstrap to persistence, this choice must be explicit; it must not accidentally authorize protected commands.
- **API:** return a safe `503` for database-dependent routes and fail readiness.
- **Mutations:** never report success without a committed authoritative transaction and audit record.
- **Recovery:** bounded reconnect behavior may restore readiness; avoid unbounded retry storms.

## 11. Phased implementation plan

### Subphase 3.1 — PostgreSQL configuration and package contracts

Scope:

- Record PostgreSQL as the supported engine.
- Consolidate database configuration behind one validated, redacting value object.
- Define lifecycle state, health result, transaction runner, and low-level client/factory contracts needed by `@qbox/database` without pretending to connect.
- Remove the exported placeholder singleton and console-only behavior only when all consumers are confirmed absent.
- Add focused unit tests for validation, redaction, state, timeout, and cleanup contracts.

Likely files:

- `packages/shared/src/env.ts` and the duplicate configuration path.
- `packages/database/src/*` and `packages/database/test/*`.
- Package documentation and directly affected architecture docs.

Dependency and lockfile changes: none expected.

Schema and migration changes: none.

Live checks: build, typecheck, unit tests; verify missing/invalid URL errors contain no URL or credential.

Risks: configuration changes can affect Discord startup if environment loading is changed too broadly. Keep database validation lazy until a database-dependent module is composed.

Complexity: medium, approximately 2–4 engineer days.

### Subphase 3.2 — Prisma ownership, schema toolchain, and generated client

Scope:

- Move Prisma CLI/client dependency ownership from root to `@qbox/prisma` as appropriate for pnpm.
- Establish the canonical root schema path and explicit Prisma scripts.
- Configure PostgreSQL datasource and generated client output/export.
- Implement a Prisma client factory using validated configuration.
- Establish generated artifact policy and schema format/validate/generate checks.

Likely files:

- Root and `packages/prisma/package.json`.
- `pnpm-lock.yaml`.
- `packages/prisma/src/*`.
- Prisma configuration and initial schema shell under `prisma/`.
- Workflow/documentation updates.

Dependency and lockfile changes: expected ownership changes, but no new third-party package is expected because Prisma is already installed.

Schema changes: datasource/generator only; no domain tables unless explicitly combined with Subphase 3.3 after review.

Tests: generation smoke test, client factory unit tests, schema validation, build/typecheck.

Live checks: generate from a clean checkout; confirm no secret is logged and no unexpected generated artifacts are tracked.

Risks: Prisma 7 generator/config conventions and ESM output must be verified against the installed toolchain; package dependency movement changes the lockfile.

Complexity: medium, approximately 2–4 engineer days.

### Subphase 3.3 — Initial permission schema and first migration

Scope:

- Implement the six reviewed permission models and enums.
- Add PostgreSQL-specific checks, partial uniqueness where required, deletion behavior, and audit immutability.
- Generate and manually review the first migration.
- Do not wire Discord or migrate `ADMIN_ROLE_IDS` yet.

Likely files:

- `prisma/schema.prisma`.
- `prisma/migrations/<timestamp>_permission_foundation/*`.
- Prisma package scripts and schema documentation.

Dependency and lockfile changes: none expected beyond Subphase 3.2.

Schema changes: all initial permission foundation tables, enums, indexes, constraints, and catalog state.

Tests: apply migrations to empty PostgreSQL; constraint tests; audit immutability; scope shape; unique assignments; deletion restrictions.

Live checks: inspect generated SQL and migration status against disposable local PostgreSQL.

Risks: nullable-scope uniqueness, cross-guild constraints, audit permissions/triggers, and owner invariants require careful SQL review. This is the first irreversible design boundary.

Complexity: high, approximately 4–7 engineer days.

### Subphase 3.4 — Database lifecycle and CI PostgreSQL

Scope:

- Implement process-local client and `DatabaseService` lifecycle.
- Add connection/readiness checks, startup/shutdown deadlines, cleanup, and structured redacted logging.
- Add a disposable PostgreSQL service and migration/generation validation to GitHub Actions.
- Add integration-test target validation and cleanup utilities.

Likely files:

- `packages/prisma/src/*`.
- `packages/database/src/*` and tests.
- `.github/workflows/quality.yml`.
- Root/workspace scripts and `.env.example` names only.
- Operational documentation.

Dependency and lockfile changes: no new package expected; script/package ownership changes may touch the lockfile only if package manifests change.

Schema changes: none expected.

Tests: lifecycle, health, failure cleanup, timeout, connect/disconnect, migration-from-empty, test-target safeguards.

Live checks: start and stop against local PostgreSQL; simulate unavailable database; confirm pool cleanup and redaction.

Risks: CI flakiness, connection exhaustion, and accidentally making all pure tests depend on PostgreSQL.

Complexity: medium-high, approximately 4–6 engineer days.

### Subphase 3.5 — Persistent permission repository adapters

Scope:

- Implement `PermissionRepository` in `@qbox/database` using Prisma.
- Implement transaction-scoped mutation plus audit behavior.
- Implement compiled catalog synchronization/version state.
- Reject unknown database permission keys.
- Preserve explicit deny precedence and tenant isolation.
- Add cache invalidation integration boundaries without requiring Redis.

Likely files:

- `packages/database/src/permissions/*` and tests.
- `packages/prisma` exports/types only as needed.
- Permission integration documentation.

Dependency and lockfile changes: add workspace dependency from `@qbox/database` to `@qbox/prisma` and `@qbox/permissions`; lockfile workspace metadata may change. No new external dependency expected.

Schema changes: only corrective migration changes discovered by reviewed repository requirements; avoid schema push.

Tests: full repository contract, catalog sync/version, unknown keys, grant/deny/expiry, audit atomicity, guild isolation, cache fallback, last-owner concurrency, rollback.

Live checks: execute controlled assignments against disposable PostgreSQL and inspect redacted logs/audit rows.

Risks: authorization regressions, stale cache, transaction conflicts, incorrect mapping, and owner lockout.

Complexity: high, approximately 5–9 engineer days.

### Subphase 3.6 — Application composition and compatibility migration

Scope:

- Compose the database module before Discord.
- Inject the persistent repository into the existing permission runtime.
- Add startup synchronization diagnostics.
- Preserve guild-bound `ADMIN_ROLE_IDS` bootstrap during an explicit compatibility period.
- Define failure/degraded-mode policy and reverse startup cleanup.
- Prepare API consumption through the same services without building API endpoints.

Likely files:

- `apps/bot/src/index.ts` or a focused composition module.
- `packages/database` module exports.
- `packages/discord/src/createDiscordModule.ts` composition boundary.
- `packages/core` only if startup rollback needs correction.
- Permission/database runbooks and environment example.

Dependency and lockfile changes: workspace dependencies for the bot/composition package; lockfile workspace metadata may change. No new external dependency expected.

Schema changes: none expected.

Tests: startup order, startup rollback, repository outage, `/ping` behavior, `/adminping` grant/deny, compatibility overlay, restart persistence, shutdown ordering.

Live checks: migrate disposable/local database, synchronize catalog, start bot, test authorized and unauthorized commands, restart, verify assignments persist, and verify compatibility diagnostics.

Risks: live administrator lockout, changed startup availability, partial composition, and bootstrap/persistent precedence errors.

Complexity: high, approximately 4–7 engineer days.

### Subphase 3.7 — Production migration and recovery operations

Scope:

- Add reviewed release migration procedure.
- Establish runtime/migration database roles.
- Document VPS or managed-service deployment.
- Implement backup monitoring and a restore drill.
- Add readiness/metrics integration and incident procedures.

Likely files:

- Operations documentation.
- Deployment configuration owned by the eventual hosting approach.
- Health/readiness composition.
- No source change should encode credentials.

Dependency and lockfile changes: none expected unless monitoring requirements later approve a client.

Schema changes: none expected.

Tests: deployment rehearsal, permission verification, backup restore to isolated PostgreSQL, readiness failure/recovery.

Live checks: restore a production-format backup into an isolated environment and run migration/integration validation.

Risks: operational access, backup costs, downtime, and untested infrastructure assumptions.

Complexity: high, approximately 4–8 engineer days plus recurring operational work.

## 12. Recommended first implementation subphase

Implement **Subphase 3.1 — PostgreSQL configuration and package contracts** first.

It has the highest leverage because every later step needs one unambiguous configuration path, redaction policy, lifecycle contract, and package boundary. It is the safest starting point because it introduces no schema, migration, database connection, external dependency, or lockfile change. Its tests can establish failure and cleanup semantics before irreversible persistence choices are made.

The subphase should end with:

- PostgreSQL formally selected.
- One validated database configuration value object.
- No duplicate `DATABASE_URL` abstraction exposed to consumers.
- Explicit database lifecycle/health/client contracts.
- No exported mutable database singleton.
- Exhaustive pure tests for validation, redaction, lifecycle, timeout, and cleanup semantics.
- No change to Discord runtime behavior yet.

Do not combine Subphase 3.1 with schema creation. After it is reviewed, Subphase 3.2 should validate the exact Prisma 7 ESM/generator mechanics, and Subphase 3.3 should receive separate approval because it creates the first migration and durable data model.
