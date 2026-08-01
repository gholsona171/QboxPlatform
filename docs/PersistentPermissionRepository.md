# Persistent Permission Repository

## Boundary and ownership

`@qbox/permissions` owns permission identifiers, authorization semantics, mutation models, and persistence ports. It remains independent of Prisma, PostgreSQL, Discord.js, Redis, and web frameworks.

`@qbox/database` implements those ports with injected Prisma clients. It owns connection lifecycle through `DatabaseService`, transaction boundaries, repository composition, and cache invalidation publication. `@qbox/prisma` owns only the generated Prisma client and its factory. Applications compose these layers; commands and Discord infrastructure continue to depend on `PermissionAuthorizer` rather than a database implementation.

The implemented repositories are:

- `PrismaGuildRepository`: creates, finds, updates, enables, and disables Discord guild records.
- `PrismaPermissionPrincipalRepository`: creates and manages guild-bound Discord user and role principals.
- `PrismaPermissionDefinitionRepository`: synchronizes the compiled catalog, reports unknown persisted keys, and exposes synchronization status.
- `PrismaPermissionCatalogRepository`: stores the compiled catalog version, checksum, and synchronization timestamp.
- `PrismaPermissionRepository`: queries assignments and applies grant, revoke, disable, enable, and expiration mutations.
- `PrismaPermissionAuditRepository`: appends and queries immutable audit events.

No repository is global or static. `PrismaPermissionPersistenceClient` creates the repository set around one injected Prisma client instance and participates in the `DatabaseService` lifecycle.

## Transaction boundaries

Assignment mutations and their audit events commit in the same Prisma transaction. A failed audit insert therefore rolls back the assignment mutation. Catalog definitions and catalog state also synchronize in one transaction, and unknown persisted permission identifiers abort synchronization before writes occur. Cache invalidation is published only after a successful commit.

Writes use Prisma expressions. Raw SQL is limited to the database lifecycle health probe and PostgreSQL-specific migration constraints that Prisma cannot express.

## Resolution behavior

Repository reads exclude disabled or revoked assignments, expired assignments, disabled principals, disabled permission definitions, and disabled guilds. Queries preserve platform and guild scope isolation and return the complete applicable assignment set. `PersistentPermissionService` remains authoritative for deterministic deny, allow, owner, administrator, and all/any evaluation semantics.

The bot starts the database before Discord accepts interactions, synchronizes the compiled catalog, and injects the repository-backed authorizer into `DiscordModule`. `ADMIN_ROLE_IDS` remains a guild-bound compatibility overlay and is never persisted. Unprotected commands do not query permission storage; protected commands fail closed when repository access fails.

## Cache boundary

`PermissionInvalidationPublisher` and `PermissionInvalidationSubscriber` describe post-commit invalidation events without introducing Redis. `InMemoryPermissionInvalidationBus` provides process-local fan-out, and the existing in-memory authorization cache subscribes to clear affected scopes. Redis or cross-process delivery can replace this adapter without changing domain or Discord APIs.

## Owner protection boundary

Phase 4 deliberately does not enforce last-owner protection. Every existing-assignment mutation passes through the injected `OwnerProtectionService` inside the repository transaction. The current `DeferredOwnerProtectionService` delegates without rejecting mutations.

Phase 5 must implement the following inside that same transaction:

1. Detect a mutation that would deactivate an effective platform-scoped `platform.owner` allow assignment.
2. Lock the relevant active owner assignment rows before counting them. Prisma does not expose row locking directly, so a reviewed PostgreSQL `SELECT ... FOR UPDATE` or equivalent advisory-lock query is expected at this boundary.
3. Evaluate enabled, revoked, and expiration state together with enabled principal and definition state at the transaction timestamp.
4. Reject removal when it would leave no active owner.
5. Write the assignment mutation and append-only audit event before committing.
6. Retry or safely fail on serialization and deadlock errors.

This intentionally reserves the concurrency-safe location without claiming protection that is not yet implemented.

## Testing

Pure authorization semantics remain covered without infrastructure. PostgreSQL repository tests run through `pnpm test:database` and refuse destructive cleanup unless `DATABASE_URL` names a database containing `test`. The suite covers principal creation, catalog synchronization, assignment lifecycle, scope isolation, precedence, disabled entities, transaction rollback, audit creation, and unknown persisted catalog keys.
