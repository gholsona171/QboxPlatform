# Discord Command Operations Runbook

Run commands from the repository root. Keep credentials only in the ignored root `.env`; never paste tokens into logs or command lines.

## Development guild workflow

1. Validate locally: `pnpm build`, `pnpm typecheck`, and `pnpm test`.
2. Preview: `pnpm --filter @qbox/bot deploy:commands:dev:dry-run`.
3. Review additions, updates, removals, unchanged commands, application ID, and guild ID.
4. Apply: `pnpm --filter @qbox/bot deploy:commands:dev`.
5. Start: `pnpm --filter @qbox/bot dev`.

Startup logs should identify the Discord application ID, bot username and user ID, connected guild count, discovered and registered command counts, command names/aliases, and load duration. They must not contain the token.

When `ADMIN_ROLE_IDS` compatibility is active, the module startup log also reports `permissionCompatibilityEnabled: true`, `permissionCompatibilityRoleCount`, and `permissionCompatibilityGuildId`. Roles are bound only to that guild. `DISCORD_GUILD_ID` is optional: the bot serves every server it is invited to, and when the ID is empty any configured legacy roles are ignored (`permissionCompatibilityRoleCount: 0`) instead of failing startup.

## Live smoke tests

- Run `/ping`; expect the immediate ephemeral `Pong.` response and logs for lookup, execution start, duration, and reply state.
- Run `/adminping` as a member with an `ADMIN_ROLE_IDS` role; expect success.
- Run `/adminping` as a member without that role; expect authorization rejection and no command execution.
- Invoke `/ping` twice inside its cooldown window; expect the second request to be rejected with a retry message.
- Stop and restart the bot, then repeat `/ping`; confirm clean shutdown/startup logs and successful dispatch.

There is no permanent deferred example command. Validate deferred behavior in automated tests; perform a live deferred check only when a real command legitimately uses deferred acknowledgement. It should acknowledge promptly, then edit the deferred response or follow up safely.

For stale-command removal, use only a known obsolete development-guild command. Confirm the dry-run lists it under removals, apply the guild plan, and dry-run again to confirm no changes. Do not create or remove a global command solely for a smoke test.

## Identity checks

Compare `DISCORD_APPLICATION_ID` and `DISCORD_GUILD_ID` with the non-secret IDs printed by deployment and startup. Confirm the bot username/user ID is the intended application identity and that the connected guild count includes the development guild. Deployment and runtime must use credentials for that same application.

## "The application did not respond"

1. Confirm the bot process is running and ready.
2. Confirm deployment and startup report the same application ID.
3. Confirm the interaction log contains the command name and interaction ID.
4. Check lookup success, authorization, execution start, acknowledgement, duration, timeout, and Discord API error logs.
5. Re-run the guild dry-run to detect a stale definition.
6. Confirm the bot is installed in the target guild with application-command scope and can see the channel.
7. If no interaction reaches the process, inspect Discord application/guild installation configuration; if it arrives but is not acknowledged, use the recorded stack trace and reply/defer state.

## Global deployment and rollback

Always preview global state first:

`pnpm --filter @qbox/bot deploy:commands:global:dry-run`

Apply a global plan with `pnpm --filter @qbox/bot deploy:commands:global -- --confirm-global`. If the plan removes commands, also pass `--confirm-global-removals`. Review the printed plan immediately before applying; global propagation is not instantaneous, and Discord can take a few minutes to show new or changed global commands.

Global is the production scope: one registration serves every server the bot is invited to, so hosted deployments (`ops/oracle/setup.sh` and `update.sh`) always run `node dist/deployCommands.js global --confirm-global --confirm-global-removals`.

### Clearing a guild copy

A server that previously received a guild deployment shows each command twice once the global set exists (Discord lists the guild copy and the global one). Remove the guild copy with `pnpm --filter @qbox/bot deploy:commands:clear-guild:dry-run` to preview, then `pnpm --filter @qbox/bot deploy:commands:clear-guild` (`node dist/deployCommands.js clear-guild`). It targets `DISCORD_GUILD_ID`, removes every guild-scoped command there, leaves global commands untouched, and verifies that the server's guild command list is empty. It needs no confirmation flags because it changes one server only. The hosted scripts run it automatically when `DISCORD_GUILD_ID` is set in `.env`.

To roll back, check out or rebuild a previously validated revision, run its full quality gate, preview its desired definitions against the same scope, then apply that plan. Prefer guild rollback while developing. Never improvise a global replacement without reviewing removals and using the required confirmation flags.
