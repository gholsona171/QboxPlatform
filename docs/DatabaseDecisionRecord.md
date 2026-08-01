# Database Decision Record

- Status: Accepted for the database foundation
- Decision date: 2026-07-31
- Scope: QboxPlatform production persistence

## Decision

QboxPlatform will use PostgreSQL as its only supported production relational database and Prisma as its ORM/schema-migration toolchain.

The dependency direction is:

```text
applications
    ↓
@qbox/database
    ↓
@qbox/prisma
    ↓
PostgreSQL
```

Application modules consume domain repositories or application services. They do not instantiate or import Prisma directly.

The foundation includes pure database lifecycle contracts, the Prisma 7 schema/generation toolchain, and the first persistent-permission migration. Repository adapters and application database composition remain deferred.

## Why PostgreSQL

QboxPlatform is expected to run concurrent Discord, API, worker, web-panel, and FiveM-facing processes. Persistent permissions require atomic mutation plus audit writes, tenant isolation, uniqueness, expiration, and safe concurrent owner changes. PostgreSQL supplies mature transactions, MVCC, row locking, expressive constraints and indexes, JSONB for carefully bounded metadata, and established backup and point-in-time recovery tooling.

PostgreSQL is widely available through managed hosting and can also run as a separately managed VPS service. A pinned local PostgreSQL container can closely match production behavior. These properties justify its additional operational cost over an embedded database.

## Why not SQLite

SQLite is an embedded file database. It is a poor authority for independently deployed bot, API, worker, and integration processes because network access, write concurrency, centralized availability, failover, and production backup operations would become constraints.

SQLite will not be used as a substitute for PostgreSQL integration tests. Dialect and concurrency differences could allow tests to pass while PostgreSQL constraints, transactions, indexes, or migrations fail. Pure tests remain database-free; integration tests will use disposable PostgreSQL.

## Why not MySQL or MariaDB

MySQL and MariaDB could support basic platform data, but provide no QboxPlatform-specific advantage that offsets a second set of design and operational decisions. PostgreSQL is the better fit for the planned authorization constraints, partial indexing needs, audit controls, transactional invariants, and JSON querying.

Supporting multiple engines would multiply schema, migration, integration-test, and incident complexity. QboxPlatform therefore chooses one production engine rather than advertising portability it does not verify.

## Why Prisma

Prisma and Prisma Client are already declared in the repository. Prisma provides a strongly typed TypeScript client, an inspectable schema, committed migration history, and an established generation workflow compatible with the monorepo's TypeScript-first direction.

Prisma does not replace domain validation, transaction design, reviewed SQL constraints, backup operations, or migration review. PostgreSQL-specific SQL may be included in reviewed migrations when Prisma schema syntax cannot express an invariant precisely. No Prisma generation or schema exists in this subphase.

## Why separate `@qbox/database` and `@qbox/prisma`

`@qbox/prisma` owns Prisma-specific mechanics: future generated client output, types, client construction, and schema tooling integration.

`@qbox/database` owns application-facing infrastructure: configuration policy, process-local lifecycle, readiness, health, transaction boundaries, error classification, and future repository adapters.

Keeping both packages prevents generated ORM details from becoming the platform's public persistence API. The separation is not duplicate abstraction: `@qbox/prisma` is the technology adapter, while `@qbox/database` is the lifecycle and repository composition boundary. The dependency must remain `@qbox/database` to `@qbox/prisma`, never the reverse.

## Why repositories instead of direct Prisma usage

Domain repository interfaces describe operations and consistency requirements in domain terms. Direct Prisma use in Discord commands, API routes, or domain packages would:

- Couple business logic to a selected ORM and generated record shapes.
- Scatter guild/tenant predicates across handlers.
- Make atomic mutation and audit boundaries harder to review.
- Encourage application code to create clients and transactions independently.
- Make pure authorization tests require database infrastructure.

Repository interfaces remain Prisma-free and live with their domains. Concrete Prisma repository adapters will live in `@qbox/database`. Applications receive those interfaces through composition and dependency injection.

Generic CRUD repositories are not required. Each repository should expose the smallest operations needed by its domain and make transaction/tenant behavior explicit.

## Configuration and diagnostic consequences

`DatabaseConfiguration` is the single typed database configuration object. It accepts only PostgreSQL URLs, validates environment and timeout policy, requires TLS in production, and serializes only redacted diagnostics. Its raw connection string is available solely for a future client factory and must never be logged.

`LIVE`, `READY`, and `DEGRADED` mean:

- `LIVE`: the process is alive but database resources are not ready or have been intentionally stopped; readiness rejects new database-dependent work.
- `READY`: startup succeeded and database-dependent work may be accepted.
- `DEGRADED`: a known startup, cleanup, shutdown, or future health failure exists; database-dependent work is rejected.

## Data-retention consequence

Permission infrastructure uses soft deletion during ordinary operation. Records are disabled or assignments are revoked. Ordinary repository contracts must not expose physical deletion. Audit history remains append-only. A physical deletion path requires separate approval for an explicit retention, privacy, or recovery procedure.

## Prisma toolchain implementation

`@qbox/prisma` owns exact-version Prisma 7.9.1 CLI and client dependencies plus the official PostgreSQL driver adapter. Its package-local `prisma.config.ts` resolves the canonical root `prisma/schema.prisma` independently of the caller's working directory. Prisma 7 reads the datasource URL from configuration rather than the schema.

The `prisma-client` generator emits ESM TypeScript with `.js` import specifiers into `packages/prisma/src/generated/client`. Generated output is committed because `@qbox/prisma` exports and compiles it as package source. A package-owned post-generation script normalizes trailing whitespace only so generated files satisfy the repository patch-quality gate. Builds regenerate before compilation; CI validates, generates, and verifies that tracked output remains unchanged.

`PrismaClientFactory` creates a distinct client using `@prisma/adapter-pg` without calling `$connect`. It configures warning/error events only and owns no singleton or lifecycle. `@qbox/database` remains responsible for future connection startup, readiness, and shutdown.

## Permission schema implementation

The initial schema contains only guilds, Discord principals, compiled permission metadata, assignments, immutable audit events, and the catalog synchronization singleton. PostgreSQL generates internal UUIDs with `gen_random_uuid()`; Discord snowflakes remain strings. This avoids a runtime ID dependency and works consistently with the pinned PostgreSQL 17 development and CI services.

PostgreSQL-specific checks, partial unique indexes, and triggers supplement Prisma where its schema language cannot precisely express tenant/scope consistency, active-row uniqueness with nullable guild IDs, immutable timestamps, or append-only auditing. Ordinary records are disabled or revoked rather than physically deleted, and all historical relationships use restrictive foreign keys.

The database cannot independently prevent revocation of the last active `platform.owner` because that invariant depends on current time, enabled/expiry state, and a concurrent mutation decision. A future repository must enforce it in the mutation transaction by locking the applicable active-owner assignment rows before counting and revoking them.

## Deferred decisions

The following remain for approved later subphases:

- Pool sizing and deployed SSL certificate details.
- Repository implementations.
- Backup and production rollout implementation.
