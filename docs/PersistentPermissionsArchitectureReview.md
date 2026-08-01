# Persistent Permissions Architecture Review

## 1. Current systems

### `@qbox/permissions`

Implemented today:

- A compile-time permission catalog containing nine permissions, including `platform.owner`, `platform.admin`, moderation, tickets, staff, applications, and knowledge permissions.
- `PermissionSubject` with a Discord user ID and Discord role IDs.
- `PermissionGrant`, which associates one Discord role ID with permissions.
- `PermissionService`, which stores grants in an in-memory `Map<string, Set<Permission>>`.
- Single, all, and any permission evaluation.
- Clearing all grants.
- A shared singleton named `permissions`.
- Three focused unit tests.

Limitations:

- Only Discord roles actually affect authorization.
- `PermissionSubject.userId` is collected but never evaluated.
- Role grants are global: there is no guild identifier, so identical role IDs are treated as globally equivalent.
- No persistence, denial, expiration, auditing, mutation authorization, cache invalidation, or repository boundary exists.
- Methods are synchronous.
- The exported singleton creates global mutable process state.

### Discord authorization

`DiscordModule.start()`:

1. Clears the permission singleton.
2. Parses `ADMIN_ROLE_IDS`.
3. Grants `platform.admin` to each configured role.
4. Passes the same singleton into `DiscordService`.
5. Registers it in the service container as `permissions`.

`CommandRegistry`:

1. Enforces guild/DM command context.
2. Builds a subject using `interaction.user.id` and the interaction member’s role IDs.
3. Checks `platform.admin` when the command enables administrator override.
4. Otherwise evaluates required permissions using `all` or `any`.
5. Rejects unauthorized execution before the command handler runs.

This path is functional and live-tested for Discord roles. It is not tenant-safe persistence.

### `ADMIN_ROLE_IDS`

Implemented:

- Loaded from the root `.env`.
- Parsed as a comma-separated, trimmed list.
- Converted to in-memory `platform.admin` role grants during every Discord module startup.
- Used only by the Discord process.

Consequences:

- Restarting reconstructs exactly the environment-defined grants.
- Web/API changes cannot persist.
- A configured role effectively has administrator permission everywhere the process uses that singleton.
- Removing the environment value removes access on the next restart.
- There is no first-run/bootstrap distinction.

### Database and Prisma

Placeholder-only:

- `@qbox/database` logs “connected” and “disconnected”; it opens no connection.
- `@qbox/prisma` exports nothing.
- Top-level `prisma/` is empty.
- There is no Prisma schema, client generation, migration, seed, transaction abstraction, or health check.
- Prisma dependencies are installed at the repository root, but are not integrated.
- `DATABASE_URL` is loaded but unused.

### API

`apps/api` only prints a startup message. It has no:

- HTTP server
- authentication
- authorization
- application services
- permission endpoints
- kernel/module lifecycle
- database access

### Shared configuration

Implemented:

- Import-time loading of the root `.env`.
- Discord IDs, timeout settings, database/Redis URLs, OpenAI key, and administrator-role IDs.
- A separate `Configuration` singleton that reads a smaller set directly from `process.env`.

Limitations:

- Configuration is split across two abstractions.
- Database configuration is not validated or consumed.
- Environment loading happens as an import side effect.

### Service container and lifecycle

Implemented:

- A string-keyed in-memory `ServiceContainer`.
- Sequential module startup and reverse-order shutdown.
- Core registration of logger, events, and modules.
- Discord registration of permission and Discord services.

Limitations:

- Service keys are untyped.
- Registration overwrites existing values.
- There is no dedicated database or permissions runtime module.
- Startup rollback is not transactional if a later module fails.
- The current permission service has no lifecycle.

### Documentation and roadmap

Documentation accurately describes permissions as in-memory and role-based. The roadmap already identifies:

- Global role-ID mappings as a weakness.
- Unused user identity.
- Missing guild awareness.
- Database and Prisma work as placeholders.
- Persistence interfaces as a future database milestone.
- API authentication and tenant-safe authorization as future requirements.

## 2. Permission principals

| Principal              | Implement now? | Recommendation                                                                                                                     |
| ---------------------- | -------------: | ---------------------------------------------------------------------------------------------------------------------------------- |
| Discord guild role     |            Yes | Primary current authorization mechanism. Identity must include guild ID and role ID.                                               |
| Discord user           |            Yes | Supports exceptions, bootstrap owners, and web-panel assignments to individual Discord users.                                      |
| Platform user          |  Contract only | Reserve the type, but wait until platform authentication and account linking are designed.                                         |
| API service identity   |          Later | Requires API authentication, credential rotation, and service-account management.                                                  |
| FiveM player identity  |          Later | Requires an approved stable player identifier and server integration.                                                              |
| System/service account |    Limited now | Permit an internal actor type for audit records and controlled bootstrap/migration operations, not ordinary command authorization. |

The first implementation should support authorization principals for:

- `DISCORD_ROLE`
- `DISCORD_USER`

The model may reserve a typed discriminator for future principal categories, but it should reject unsupported categories at service boundaries until their identity verification exists.

Do not represent Discord users and roles as unqualified strings. Their authoritative identity is:

```text
principal type + Discord guild ID + Discord object ID
```

## 3. Permission scope

### Recommended initial scope model

Implement two scopes:

- `PLATFORM`: applies across the platform.
- `DISCORD_GUILD`: applies only inside one Discord guild.

Rules:

- Ordinary Discord feature permissions should be guild-scoped.
- `platform.owner` should be platform-scoped and tightly controlled.
- `platform.admin` may be platform-scoped for true platform administrators or guild-scoped for community administrators.
- A guild-scoped assignment must include a guild ID.
- A platform-scoped assignment must not include a guild ID.

This is enough for the Discord bot and a future web panel without prematurely modeling every resource.

### Defer

- FiveM server scope: blocked by FiveM server identity/integration.
- Organization/community scope: defer until the product defines whether a community can own multiple Discord guilds or FiveM servers.
- Resource-specific scope: add only when a real feature needs ticket/application/resource ACLs.
- Temporary grants: schema support should be included now through `expiresAt`; management UX can arrive later.
- Explicit denial: include it in the persistence and semantics now because retrofitting precedence later is risky. The first UI need not expose it immediately.

Avoid a generic arbitrary `scopeType/scopeId` system with undocumented values. Use an explicit scope enum and validated nullable foreign keys.

## 4. Permission semantics

### Direct grants

A Discord user may receive a guild-scoped or permitted platform-scoped assignment. Direct grants and role grants are combined; neither inherently outranks the other.

### Discord role grants

A role assignment applies only when:

- The interaction is in the assignment’s guild.
- Discord reports that role on the current interaction member.
- The role principal remains enabled.
- The assignment is active and unexpired.

### Administrator override

`platform.admin` only bypasses a command’s required permissions when that command explicitly sets `administratorOverride: true`.

It does not bypass:

- Guild/DM context policy
- Shutdown policy
- Explicit denials
- Invalid or unverified identity context

### Owner override

`platform.owner` is a break-glass platform authority.

Recommended rules:

- It is granted only by bootstrap/migration or a separately protected owner-management operation.
- Ordinary permission mutation APIs cannot self-assign or remove the last owner.
- It bypasses required permission checks regardless of administrator override metadata.
- It does not bypass command context rules or identity verification.
- A valid owner grant outranks ordinary explicit denials to preserve recoverability.
- Owner use must be audited.

### All/any checks

After effective permissions are calculated:

- `all`: every requested permission must be effective.
- `any`: at least one requested permission must be effective.
- An empty required set is valid only for commands with no permission policy; command validation already prevents empty permission arrays.

### Explicit denies

- A matching active deny removes that permission from direct and role-derived grants.
- A deny outranks ordinary grants and administrator override.
- Denies are scope-specific.
- A guild deny must not affect another guild.
- Only the protected owner override may bypass a deny.

### Disabled and expired data

Ignore:

- Disabled principals
- Disabled permission definitions
- Disabled assignments
- Assignments whose `expiresAt <= now`
- Deleted/invalid guild bindings

Expired records should remain available for audit, not be silently deleted.

### Missing guild context

- A guild-scoped permission check without a verified guild ID fails closed.
- Platform-scoped permissions can be evaluated without a guild only if the consumer and command policy permit it.
- Current permission-protected Discord commands remain guild-only.

### Cache and database failures

- Cache miss: query the repository and populate the cache.
- Cache backend failure: log safely and fall back to the database.
- Database failure with no usable cache entry: deny protected operations.
- A short-lived existing cache entry may be used during database failure, with a degraded-state warning and metric.
- Mutations must not report success unless database commit and audit creation succeed.
- If post-commit cache invalidation fails, return success with a high-severity operational alert because the authoritative mutation succeeded; keep TTL short to bound stale authorization.

### Legacy environment compatibility

During migration, `ADMIN_ROLE_IDS` should provide bootstrap administrator grants in the configured development/primary guild, not unqualified global grants.

Environment-derived grants should be visibly marked as bootstrap/legacy grants and logged by role count only. While compatibility is enabled, they cannot be revoked through the web panel because startup would restore them.

### Exact authorization order

1. Validate requested permissions against the code-backed permission catalog.
2. Validate the caller’s authenticated principal data.
3. Enforce command guild/DM context policy.
4. Establish the scope: platform and, when applicable, verified Discord guild.
5. Resolve current Discord user and role principal keys from the interaction.
6. Load active assignments through the cache/repository boundary.
7. On cache failure, fall back to the repository; on unrecoverable repository failure, fail closed.
8. Remove disabled and expired principals, definitions, and assignments.
9. Add compatible legacy bootstrap assignments while compatibility mode is active.
10. If the subject has an effective `platform.owner` grant, authorize and audit the override.
11. Calculate explicit denies for requested permissions.
12. Remove denied permissions from all ordinary direct and role-derived grants.
13. Determine effective `platform.admin`, applying deny precedence.
14. If administrator override is enabled and `platform.admin` is effective, authorize.
15. Combine remaining direct-user and Discord-role grants.
16. Apply `all` or `any` evaluation to the requested permissions.
17. Return the decision with non-secret diagnostic reason data.
18. Audit privileged overrides and all permission mutations; optionally emit metrics for every decision.

## 5. Persistence model

No migration should be created until the database foundation and schema conventions are approved.

### `Guild`

Purpose: authoritative local representation of Discord guilds known to the platform.

Key fields:

- `id`: internal UUID
- `discordGuildId`: Discord snowflake stored as string
- `name`: optional display snapshot
- `enabled`
- `createdAt`, `updatedAt`

Constraints and indexes:

- Unique `discordGuildId`
- Index `enabled`

Deletion:

- Prefer soft disable.
- Hard deletion should restrict while assignments or audit references exist.

Integrity:

- Validate snowflake format at application boundaries.
- Discord name is informational, not an identity key.

### `PermissionPrincipal`

Purpose: normalized assignable identity.

Key fields:

- `id`: internal UUID
- `type`: `DISCORD_ROLE`, `DISCORD_USER`, later types
- `externalId`: provider identifier
- `guildId`: required for current Discord roles/users
- `enabled`
- `displayName`: optional snapshot
- `createdAt`, `updatedAt`

Constraints and indexes:

- Unique `(type, guildId, externalId)`
- Index `(guildId, type)`
- Index `(type, externalId)`

Foreign keys:

- `guildId -> Guild.id`

Deletion:

- Restrict hard deletion when assignments or audit records exist.
- Disable instead.

Integrity:

- Discord principal types require `guildId`.
- Unsupported principal types must be rejected until implemented.
- Never trust a web request’s claimed role membership; Discord remains authoritative for runtime membership.

### `PermissionDefinition`

Purpose: persistent catalog metadata for code-supported permissions.

Key fields:

- `id`
- `key`, such as `moderation.warn`
- `description`
- `category`
- `enabled`
- `createdAt`, `updatedAt`

Constraints:

- Unique `key`

Indexes:

- `(category, enabled)`

Deletion:

- Restrict if referenced.
- Disable definitions instead.

Integrity:

- Startup/catalog synchronization may add or update metadata.
- Database entries must not make unknown permission strings executable; the compiled catalog remains authoritative.

### `PermissionAssignment`

Purpose: allow or deny one permission for one principal in one scope.

Key fields:

- `id`
- `principalId`
- `permissionDefinitionId`
- `effect`: `ALLOW` or `DENY`
- `scopeType`: `PLATFORM` or `DISCORD_GUILD`
- `guildId`: nullable and required for guild scope
- `enabled`
- `expiresAt`: nullable
- `createdByPrincipalId`: nullable for bootstrap/system work
- `updatedByPrincipalId`: nullable
- `createdAt`, `updatedAt`

Constraints:

- Unique active logical assignment across `(principalId, permissionDefinitionId, effect, scopeType, guildId)`
- Prefer one current effect per principal/permission/scope. Prevent simultaneous allow and deny through service logic and, if practical, a database constraint.

Indexes:

- `(principalId, scopeType, guildId, enabled)`
- `(permissionDefinitionId, scopeType, guildId)`
- `expiresAt`
- `(guildId, enabled)`

Foreign keys:

- Principal, permission definition, guild, creator, updater

Deletion:

- Prefer disabling assignments.
- Audit records must survive assignment removal.

Integrity:

- Guild scope requires `guildId`.
- Platform scope forbids `guildId`.
- `expiresAt` must be later than creation when supplied.
- Creator and updater cannot be accepted directly from untrusted request bodies.

### `PermissionAuditEvent`

Purpose: append-only history of permission mutations and protected overrides.

Key fields:

- `id`
- `action`: grant, deny, revoke, enable, disable, expire, bootstrap, migration
- `assignmentId`: nullable snapshot reference
- `actorPrincipalId`: nullable for controlled system activity
- `targetPrincipalId`
- `permissionKey`
- `scopeType`
- `guildId`
- `previousState`: structured JSON
- `newState`: structured JSON
- `requestId`/correlation ID
- `reason`: optional
- `createdAt`

Constraints and indexes:

- Index `(targetPrincipalId, createdAt)`
- Index `(actorPrincipalId, createdAt)`
- Index `(guildId, createdAt)`
- Index `(permissionKey, createdAt)`
- Unique request/idempotency key where mutation retries are supported

Deletion:

- Restrict referenced principal/guild deletion.
- No ordinary update/delete operations.

Integrity:

- Written in the same database transaction as the mutation.
- API must not permit clients to supply authoritative audit snapshots.
- Database access roles should prevent application paths from rewriting history.

A separate assignment-history table is unnecessary initially if audit events contain complete immutable before/after snapshots.

## 6. Service architecture

### Domain contracts

`@qbox/permissions` should own:

- Principal and scope value types
- Authorization request and decision types
- Permission repository interface
- Persistent permission service
- Policy evaluation
- Catalog
- Domain errors

It should not import Prisma or Discord.js.

Suggested repository responsibilities:

```ts
interface PermissionRepository {
  findEffectiveAssignments(
    query: PermissionAssignmentQuery,
  ): Promise<readonly PermissionAssignmentRecord[]>;

  applyMutation(
    mutation: PermissionMutation,
    audit: PermissionAuditInput,
  ): Promise<PermissionMutationResult>;

  countActiveOwners(): Promise<number>;
}
```

Use focused mutation methods if one generic mutation makes invariants unclear.

### Prisma adapter

A Prisma-backed repository belongs in `@qbox/database` or `@qbox/prisma`, after the repository decides which package owns generated Prisma infrastructure.

It should handle:

- Query translation
- Transactions
- Unique-constraint conflicts
- Atomic audit writes
- Database-specific errors
- Owner-count locking/invariants

Discord, commands, and API handlers must not issue Prisma queries directly.

### Persistent permission service

Responsibilities:

- Validate principal/scope combinations.
- Load assignments.
- Apply expiration and deny precedence.
- Evaluate owner/admin/all/any semantics.
- Authorize mutation operations.
- Protect the last owner.
- Invalidate cache entries after mutation.
- Return structured decisions without leaking internal data.

The public authorization API becomes asynchronous. `CommandRegistry.authorize()` is already asynchronous, so this change fits its current control flow.

### Caching boundary

Start with a small injected interface:

```ts
interface PermissionCache {
  get(key: PermissionCacheKey): Promise<CachedAssignments | undefined>;
  set(
    key: PermissionCacheKey,
    value: CachedAssignments,
    ttlMs: number,
  ): Promise<void>;
  invalidate(keys: readonly PermissionCacheKey[]): Promise<void>;
  close?(): Promise<void>;
}
```

Initial implementation:

- In-process cache only.
- Key includes principal identities, scope type, and guild ID.
- Short TTL.
- No permission logic inside the cache.

Later:

- Redis-backed cache and pub/sub invalidation for multiple bot/API instances.
- Versioned cache entries or a guild authorization revision to prevent stale repopulation races.

### Discord identity resolution

Discord integration should translate a trusted interaction into:

- Discord user principal key
- Discord role principal keys
- Verified guild scope

It should not persist role membership as authoritative authorization state. Role membership comes from the current Discord interaction/member state. Assignment targets can be validated against Discord during web/API mutation where possible.

### API and web consumption

Both Discord and API should call the same application-level permission service. API endpoints should never reproduce permission precedence or query assignments directly.

The web panel communicates only with authenticated API endpoints. It does not directly access the database or cache.

### Registration and lifecycle

Recommended startup order:

1. Database module connects and registers repository infrastructure.
2. Permission module validates/synchronizes the permission catalog.
3. Permission module initializes bootstrap compatibility and cache.
4. Permission service registers in the container.
5. Discord module receives the registered service rather than importing a singleton.
6. Discord connects and begins accepting interactions.

Shutdown:

1. Stop accepting new Discord/API work.
2. Drain active operations.
3. Close distributed cache clients if present.
4. Disconnect the database last.

Do not let `DiscordModule` clear or reconstruct the persistent service during startup.

### Failure behavior

- Database startup failure: fail startup when persistent authorization is required.
- Catalog synchronization failure: fail startup.
- Protected authorization lookup failure: deny and log a correlation ID.
- Mutation transaction failure: no cache invalidation and no success response.
- Cache invalidation failure after commit: alert and rely on short TTL/version checking.
- Discord role resolution failure: deny role-based access; direct user/owner evaluation may proceed only if identity and scope remain verified.

## 7. Web panel flow

```text
Web panel
  -> API transport validation
  -> authenticated platform identity
  -> authorization of the mutation itself
  -> mutation service and invariant checks
  -> database transaction:
       assignment mutation + immutable audit event
  -> cache invalidation/version increment
  -> success response
  -> bot observes invalidation or bounded TTL
  -> subsequent command uses the new decision
```

Mutation authorization must consider:

- Actor’s verified platform/Discord identity
- Target guild
- Requested permission
- Whether the actor can delegate that permission
- Owner/admin restrictions
- Self-granting
- Last-owner protection
- Idempotency/concurrent updates

Can be implemented on this branch:

- Domain contracts and semantics
- Principal/scope types
- Repository and cache interfaces
- Persistent permission service
- In-memory repository/cache adapters for deterministic tests
- Bootstrap compatibility policy
- Service-level mutation and audit contracts
- Comprehensive domain tests

Blocked by later work:

- Prisma repository and actual schema migration
- API authentication
- Permission-management endpoints
- Web panel
- Cross-process Redis invalidation
- Discord-based mutation target validation outside bot context
- Real platform-user account linking

## 8. Security review

| Risk                            | Recommended control                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Privilege escalation            | Authorize every mutation server-side; restrict delegating permissions at or above the actor’s authority; protect owner/admin assignments.        |
| Cross-guild leakage             | Put guild ID into principal identities, assignments, queries, cache keys, and unique constraints; reject missing or mismatched scope.            |
| Stale cache                     | Short TTL, mutation invalidation, scope-specific revision numbers, Redis pub/sub later, and security metrics.                                    |
| Self-granting                   | Deny self-elevation by default; allow only a separately protected owner operation with audit and optional second-party approval.                 |
| Discord role deletion           | Disable unresolved role principals, surface them in administration diagnostics, and deny their grants.                                           |
| Discord ID spoofing             | Accept IDs only from authenticated Discord interactions or verified API-side Discord lookups; never trust web form identity claims.              |
| API authorization bypass        | Central authorization middleware plus application-service checks; direct repository access is not an authorization boundary.                     |
| Audit-log tampering             | Append-only transactional audit records, restrictive database credentials, no general update/delete API, backups, and exported monitoring later. |
| Race conditions                 | Transactions, unique constraints, optimistic revisioning/idempotency keys, and row/advisory locking for owner invariants.                        |
| Owner lockout                   | Require at least one active, unexpired owner; bootstrap recovery path; prohibit deletion/expiration of the last owner.                           |
| Deny bypass                     | Centralize precedence in one domain service; do not duplicate evaluation in Discord or API.                                                      |
| Database outage                 | Fail closed for uncached protected decisions; bounded cache use with degraded alerts.                                                            |
| Cache poisoning                 | Typed/versioned serialization, namespace isolation, non-user-controlled keys, short TTL, and authenticated Redis later.                          |
| Overbroad environment bootstrap | Bind legacy role IDs to an explicit guild and compatibility mode; log bootstrap activation.                                                      |

## 9. Migration strategy

### Bootstrap behavior

Introduce explicit bootstrap configuration:

- Existing `ADMIN_ROLE_IDS`
- Required bootstrap Discord guild ID
- Compatibility mode flag, defaulting on during migration

Do not silently translate role IDs into platform-global assignments.

### First run

When the persistent repository contains no active owner or administrator:

1. Validate the configured bootstrap guild.
2. Create or resolve that guild.
3. Create role principals for configured administrator roles.
4. Insert guild-scoped `platform.admin` assignments.
5. Record immutable bootstrap audit events.
6. Log counts and IDs only—never credentials.
7. Require an explicit owner bootstrap operation before retiring compatibility.

For stronger recovery, the first owner should be a Discord user rather than a role.

### Compatibility period

- Persistent assignments are authoritative.
- Environment administrator roles are merged as legacy bootstrap grants.
- Startup reports compatibility mode clearly.
- Web/API cannot revoke those environment-derived grants while the environment values remain active.
- All new changes go to persistence.

### Migration command or seed

Prefer an idempotent operational command over a general Prisma seed:

```text
permissions bootstrap-admins --guild <guild-id> --dry-run
permissions bootstrap-admins --guild <guild-id> --apply
```

It should:

- Validate configured roles against the guild where possible.
- Preview additions and existing assignments.
- Never remove assignments.
- Create audit events.
- Be safe to rerun.
- Require an explicit apply flag.

A narrowly scoped owner-bootstrap command should separately bind a verified Discord user as `platform.owner`.

### Rollback

During compatibility:

- Re-enable compatibility mode.
- Restore known-good `ADMIN_ROLE_IDS`.
- Restart the bot.
- Persistent data remains intact for diagnosis.
- Do not delete assignments as part of rollback.

After environment retirement, preserve a controlled offline/bootstrap recovery command with direct operational authorization and mandatory auditing.

### Retirement criteria

Retire `ADMIN_ROLE_IDS` only when:

- At least two verified owner/recovery identities exist, if operational policy permits.
- Persistent permission loading has run reliably through deploy/restart checks.
- Mutation audit records are verified.
- Web/API administration has its own authorization tests.
- Cache invalidation is proven.
- A rollback/recovery procedure has been exercised.
- No environment-only administrator remains.

Then remove environment-derived authorization, but retain an explicit emergency recovery mechanism.

## 10. Phased implementation plan

### Phase 1 — Domain contracts and deterministic semantics

Scope:

- Principal and scope types
- Assignment allow/deny/expiration model
- Authorization request/decision model
- Repository and cache interfaces
- Persistent permission service
- In-memory adapters
- Exact owner/admin/all/any precedence
- Legacy bootstrap overlay contract

Likely files:

- `packages/permissions/src/models/*`
- `packages/permissions/src/repositories/*`
- `packages/permissions/src/cache/*`
- `packages/permissions/src/PersistentPermissionService.ts`
- `packages/permissions/src/index.ts`
- `packages/permissions/test/*`
- Directly affected documentation

Schema changes: none.

Tests:

- User and role grants
- Platform/guild isolation
- All/any
- Denials
- Owner/admin override
- Expiration/disable
- Missing context
- cache hit/miss/failure
- repository failure
- legacy bootstrap behavior
- mutation invariants and audit input generation

Live checks: none.

Dependencies: existing TypeScript and Vitest only.

Risk: semantics becoming difficult to change once consumers adopt them.

Complexity: medium.

### Phase 2 — Discord integration with asynchronous service

Scope:

- Replace singleton role-map assumptions.
- Inject the new authorization service.
- Resolve guild/user/role principal keys.
- Preserve current command policy behavior.
- Keep legacy environment compatibility.

Likely files:

- `packages/discord/src/DiscordModule.ts`
- `DiscordService.ts`
- `commands/CommandRegistry.ts`
- Discord tests
- Bot startup composition

Schema changes: none.

Tests:

- Guild isolation
- Direct user permission
- Role permission
- owner/admin override
- failure-closed responses
- legacy role compatibility

Live checks:

- `/ping`
- authorized and unauthorized `/adminping`
- restart/bootstrap behavior
- identity and degraded-mode logs

Dependencies: Phase 1.

Risk: accidental administrator lockout or changed live command behavior.

Complexity: medium.

### Phase 3 — Database/Prisma foundation

Scope:

- Decide ownership between `@qbox/database` and `@qbox/prisma`.
- Add actual Prisma client lifecycle.
- Validate `DATABASE_URL`.
- Register database/repository services through the kernel.
- Add health and shutdown behavior.

Likely files:

- `packages/database/*`
- `packages/prisma/*`
- `prisma/schema.prisma`
- application composition
- configuration and documentation

Schema changes: initial schema and first migration, only after separate approval.

Tests:

- Connection lifecycle
- transaction behavior
- startup failure
- clean shutdown

Live checks:

- Local database connection
- migration apply/rollback procedure
- process restart

Dependencies: approved database engine and deployment environment.

Risk: schema/tooling choices affect all future persistence.

Complexity: high.

### Phase 4 — Persistent repository and bootstrap migration

Scope:

- Prisma repository implementation
- Transactional mutations and audit records
- Catalog synchronization
- Dry-run/apply bootstrap command
- Compatibility mode
- In-process cache

Likely files:

- Permission repository adapter
- Prisma schema/migration
- CLI/application entry point
- shared configuration
- permission lifecycle module

Schema changes: all models described above.

Tests:

- Repository contract integration tests
- unique/scope constraints
- transaction rollback
- immutable audit creation
- idempotent bootstrap
- last-owner protection
- concurrent mutation behavior

Live checks:

- Empty database first run
- bootstrap preview/apply
- restart persistence
- revoke/grant propagation
- rollback to legacy mode

Dependencies: Phase 3 and a disposable test database.

Risk: privilege loss, incorrect migration, audit gaps.

Complexity: high.

### Phase 5 — API authorization and management application service

Scope:

- Authentication decision
- Platform identity mapping
- Permission query/mutation application services
- API endpoints
- request validation
- idempotency and audit correlation

Likely files:

- `apps/api/*`
- permission application-service package or module
- authentication integration
- API tests and documentation

Schema changes: platform identity/account-linking tables as required.

Tests:

- Authentication
- cross-guild denial
- self-grant prevention
- delegation rules
- API bypass attempts
- concurrent mutations

Live checks:

- Authenticated grant/revoke
- bot enforcement after mutation
- audit inspection

Dependencies: API foundation, Phase 4, authentication design.

Risk: remotely exploitable privilege escalation.

Complexity: high.

### Phase 6 — Distributed cache and multi-process invalidation

Scope:

- Redis cache adapter
- invalidation messages or scope revisioning
- bot/API multi-instance consistency
- degraded behavior and metrics

Likely files:

- Permission cache adapter
- Redis lifecycle package/module
- API and bot composition
- operational documentation

Schema changes: optional scope revision field.

Tests:

- Cross-process invalidation
- out-of-order messages
- Redis outage
- database outage
- stale repopulation races

Live checks:

- Grant/revoke while bot and API run separately
- Redis restart
- bounded stale-access verification

Dependencies: Redis infrastructure and Phase 5.

Risk: stale authorization across processes.

Complexity: high.

### Phase 7 — Future principal and scope extensions

Scope:

- Platform users
- API service identities
- FiveM players and server scope
- Organization/resource scope only when demanded by real features

Schema changes: identity/provider and scope additions based on approved subsystem designs.

Tests and live checks: integration-specific.

Dependencies: authentication, FiveM, organization, and resource models.

Risk: identity collisions and inconsistent cross-system authority.

Complexity: high.

## 11. Recommended first phase

Implement **Phase 1: Domain contracts and deterministic semantics** first.

It has the highest leverage because every future consumer—Discord, API, web panel, and FiveM—needs one authoritative definition of principals, scope, denial precedence, owner/admin behavior, expiration, failure handling, and mutation invariants.

It is also the safest starting point because it requires:

- No migration
- No database connection
- No dependency installation
- No live authorization replacement
- No administrator cutover
- No API or web assumptions

The smallest approved deliverable should be a thoroughly tested, asynchronous permission-domain service behind repository and cache interfaces, using in-memory test adapters. Discord integration and persistence should remain separate follow-up phases.
