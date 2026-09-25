# Persistent Permission Administration

## Owner invariant and locking

Every owner-invalidating mutation runs inside one Prisma transaction. The repository first acquires the PostgreSQL transaction advisory lock derived from the fixed key `qbox:platform-owner-mutation`, then reloads the active platform-scoped `platform.owner` allow assignments. Only after that locked read does `DeterministicOwnerProtectionService` evaluate the requested revoke, disable, expiration, principal disable, guild disable, or permission-definition disable.

The operation is rejected with `OwnerInvariantViolationError` if no active, enabled, unexpired owner would remain. Assignment mutation and successful audit commit atomically. A rejected transaction rolls back and is followed by a separate append-only rejection audit event containing the attempted action and stable error code. This second transaction records the failed attempt without committing the prohibited mutation.

Expiration changes are evaluated at their requested future instant. Another owner must remain valid beyond that instant. Expired records are excluded from authorization immediately, retained historically, and available through `findExpired()` for a future scheduler.

## Owner bootstrap

## Automatic access

Nobody has to grant permissions before a server can be managed:

- **Bot:** when the bot starts, and whenever it joins a server, it makes that server's Discord owner the Qbox owner (`platform.owner`). This is the same grant the owner bootstrap CLI makes, done automatically (`guildOnboardingFeature`).
- **Portal and API:** the server owner and any member with **Administrator** or **Manage Server** in Discord pass every permission check (`DiscordGuildAuthority`, read through the bot token and cached for a minute). Qbox permissions still apply to everyone else, and `/api/v1/me` reports `permissions.discordManager`.
- **Slash commands:** Discord administrators pass every command's permission check.

The CLI below remains for recovery, for example when the bot token is unavailable.

Owner bootstrap is a local operator CLI, never a Discord command. It accepts only explicit 17–20 digit Discord guild and user IDs. The trusted system actor is created inside the workflow rather than accepted from user input.

Dry-run is the default:

```sh
pnpm --filter @qbox/bot permissions:owner-bootstrap -- --guild-id <guild-id> --user-id <user-id>
```

Apply requires the explicit flag:

```sh
pnpm --filter @qbox/bot permissions:owner-bootstrap -- --guild-id <guild-id> --user-id <user-id> --apply
```

The command previews guild/principal creation and the owner grant. Apply creates or resolves only the requested guild and Discord user principal, adds one platform-scoped owner allow assignment, and writes an immutable bootstrap audit event. Repeating it reports the existing assignment and creates nothing.

## Legacy administrator migration

The migration reads `ADMIN_ROLE_IDS` from trusted process configuration and targets `DISCORD_GUILD_ID`, or the guild passed explicitly with `--guild-id <id>` (required when `DISCORD_GUILD_ID` is empty, which is the multi-server default). Dry-run previews the guild, each configured role, principals to create, grants to create, and existing grants:

```sh
pnpm --filter @qbox/bot permissions:migrate-legacy-admin
```

Apply is explicit:

```sh
pnpm --filter @qbox/bot permissions:migrate-legacy-admin -- --apply
```

Each role receives an additive, guild-scoped `platform.admin` allow assignment with an immutable migration audit event. The workflow never removes assignments and is idempotent.

## Compatibility retirement

`PERMISSION_LEGACY_ADMIN_COMPATIBILITY_ENABLED` defaults to enabled. Set it to the exact string `false` only after owner bootstrap and administrator migration are verified. Startup refuses disabled compatibility unless persistent storage contains at least one active owner and at least one active administrator recovery path.

Startup diagnostics report compatibility state, guild ID, configured role count, and the number of matching persistent migrated role grants. While compatibility remains enabled, environment-derived administrator grants cannot be revoked persistently because restart restores the overlay.

## PostgreSQL adapter warning

The `pg` deprecation warning about calling `client.query()` while a query is executing was traced with `--trace-deprecation`. The stack originates in `@prisma/adapter-pg` 7.9.1 (`PgTransaction.performIO`) during the intentional concurrent owner-revocation integration test, not from direct project calls to `pg.Client.query`. Repository code awaits every Prisma operation and does not share raw `pg` clients. The warning is not suppressed. Re-evaluate it when upgrading Prisma, `@prisma/adapter-pg`, or before adopting `pg` 9.
