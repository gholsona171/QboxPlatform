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

This subphase establishes configuration and pure lifecycle contracts only. It does not connect to PostgreSQL, generate Prisma Client, create a schema, or create migrations.

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

## Deferred decisions

The following remain for approved later subphases:

- Prisma 7 generator and ESM output configuration.
- PostgreSQL client/adapter construction.
- Schema and migration design.
- Pool sizing and deployed SSL certificate details.
- Repository implementations.
- CI PostgreSQL service.
- Backup and production rollout implementation.
