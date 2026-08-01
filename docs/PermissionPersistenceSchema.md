# Persistent Permission Schema

## Boundary

The first migration, `20260731000000_permission_foundation`, persists only the existing permission domain. It does not provide a repository adapter or change Discord, API, or bootstrap behavior.

The models are:

- `Guild`: one enabled/disabled record for a unique Discord guild snowflake.
- `PermissionPrincipal`: a Discord user or role identity isolated by guild.
- `PermissionDefinition`: metadata keyed by an exact compiled permission identifier.
- `PermissionAssignment`: an allow or deny assignment at platform or Discord-guild scope, with expiration and revocation state.
- `PermissionAuditEvent`: an append-only historical mutation record with actor/target snapshots, scope, permission, reason code, correlation ID, and bounded JSONB before/after snapshots.
- `PermissionCatalogState`: the single persisted compiled-catalog version/checksum observation.

The enums exactly mirror the current domain: Discord user/role principals, platform/Discord-guild scopes, allow/deny effects, set/revoke actions, principal/system audit actors, and the seven compiled mutation reason codes. No future platform-user, API-service, FiveM, resource-scope, group, or wildcard values are present.

## Identifier and retention policy

Internal identifiers use PostgreSQL `gen_random_uuid()`. PostgreSQL 17 does not provide a portable UUID v7 default, and adding an application ID dependency is outside this foundation. Provider identities such as Discord snowflakes remain strings.

Guilds, principals, permission definitions, and assignments are retained during ordinary operation. They transition through enabled/disabled or active/revoked state. Foreign keys use `RESTRICT`; no cascade deletes destroy permission or audit history.

## Database-enforced invariants

PostgreSQL enforces:

- unique Discord guild identity;
- principal uniqueness by type, guild, and external ID;
- lowercase dot-separated permission keys;
- required guild ownership for every currently supported Discord principal;
- a null guild for platform assignments and a required guild for Discord-guild assignments;
- a trigger requiring a Discord-guild assignment to use its principal's guild;
- expiration after creation and consistent enabled/revoked timestamps;
- restrictive foreign keys;
- immutable `created_at` values;
- one catalog row named `compiled-permission-catalog`;
- append-only audit rows through an UPDATE/DELETE rejection trigger.

Active assignment uniqueness uses two partial unique indexes. Platform assignments index principal, permission, and effect without a nullable guild component. Discord-guild assignments include the non-null guild. Revoked/disabled historical rows are excluded, so PostgreSQL NULL uniqueness cannot permit duplicate active platform assignments.

## Audit history

Audit foreign keys preserve navigation while snapshot columns preserve historical actor, target, guild, scope, and permission meaning even if live records are later disabled. Core authorization identity is stored in typed columns. JSONB is limited to immutable before/after snapshots.

Audit writes must eventually occur in the same repository transaction as their mutations. The schema prepares that linkage but does not implement it in this subphase.

## Last-owner boundary

The database does not claim to prevent removal of the final active owner. The future permission repository must begin a transaction, lock the applicable active `platform.owner` allow assignments, evaluate enabled/revoked/expiration state at one transaction timestamp, reject removal when only one remains, write the mutation and audit event, and commit atomically. Serializable isolation or explicit row/advisory locking must prevent concurrent last-owner removals.
