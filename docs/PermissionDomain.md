# Permission Domain

`@qbox/permissions` owns integration-independent permission contracts and deterministic authorization semantics. It does not import Discord.js, Prisma, Redis, or an HTTP framework. The Discord bot now consumes the asynchronous `PermissionAuthorizer` contract; persistence remains intentionally absent.

## Authoritative catalog

`PERMISSIONS` is the only authoritative set of exact permission identifiers. A future database may store catalog version, descriptions, categories, and enabled state, but a database key not present in `PERMISSIONS` is rejected and cannot become executable authorization data.

The compiled catalog exposes `PERMISSION_CATALOG_VERSION`, a deterministic SHA-256 checksum, an immutable snapshot, status comparison, and validation for a future persisted descriptor. Status distinguishes unavailable persistence, version mismatch, checksum mismatch, and synchronization. No database synchronization runs in this phase.

Future audit inputs carry a correlation ID in addition to the required structured reason code and optional human explanation. Mutation callers may supply an upstream correlation ID; the domain service generates one when absent. Persistence remains unimplemented.

Exact permission identifiers must:

- be lowercase;
- contain at least two dot-separated segments;
- begin each segment with a lowercase letter;
- contain only lowercase letters and digits within segments.

Valid examples include `platform.owner`, `platform.admin`, `moderation.warn`, `tickets.close`, and `knowledge.publish`. Invalid examples include `Platform.admin`, `platform`, `platform..admin`, and `staff.*`.

## Principals and scopes

The implemented principal types are Discord users and Discord roles. Both identities include the owning Discord guild ID, preventing an external identifier from leaking across guilds.

Assignments may be platform-scoped or Discord-guild-scoped. A platform assignment is considered during both platform and guild authorization. A guild assignment is considered only for its exact guild.

## Deterministic precedence

Authorization applies active, unexpired direct-user and role assignments in this order:

1. Platform owner grants provide the protected owner override.
2. Exact denies remove ordinary grants, including administrator permission.
3. Administrator override applies only when requested by the consumer policy.
4. Remaining exact grants are evaluated using `all` or `any`.

Disabled and expired assignments are ignored. Cross-guild principal mismatches and unavailable repositories fail closed. Cache failure falls back to the repository. Reserved group selectors such as `staff.*` are representable for forward-compatible storage contracts but are rejected by authorization and mutation logic; inheritance and wildcards are not implemented.

## Mutations and audit reasons

Every mutation requires a `reasonCode` from the compiled reason-code catalog. Optional free text may add context but cannot replace the structured code. The repository contract must commit the mutation and audit input atomically. The domain prevents self-elevation, invalid expiry, cross-guild assignment, group assignment, and revocation of the last active owner.

Repository and cache contracts contain no adapter-specific types. The included in-memory adapters are process-local test utilities, not persistence implementations. A future Prisma repository and Redis cache can implement these interfaces without changing domain consumers.

## Discord compatibility runtime

Until persistence exists, process composition creates an in-memory repository/cache and a `PersistentPermissionService`. `ADMIN_ROLE_IDS` values become non-persistent, guild-scoped `platform.admin` assignments bound to `DISCORD_GUILD_ID`. Without that guild ID (the multi-server default) the legacy roles are ignored and no assignments are created; startup continues. Persistent deny assignments outrank compatibility grants.

Discord translates only the authenticated interaction user, guild, and current member roles into principals. Command options and user-provided content never supply authorization identity. The authorizer is registered in the service container only after Discord startup succeeds; unprotected commands bypass repository access.
