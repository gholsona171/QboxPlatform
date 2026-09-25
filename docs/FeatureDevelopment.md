# Adding a Feature

Every feature follows the same layout so it can be built, reviewed, and tested
on its own. **Moderation is the reference implementation**; copy its patterns.

Replace `<feature>` with a kebab-case name (for example `giveaways`) and
`<Feature>` with PascalCase (`Giveaway`).

## Files a feature adds

| Layer | Path | Reference |
| --- | --- | --- |
| Domain module | `modules/<feature>/` (`@qbox/<feature>`) | `modules/moderation` |
| Types and ports | `modules/<feature>/src/types.ts` | repository and gateway interfaces |
| Rules | `modules/<feature>/src/<Feature>Service.ts` | `ModerationService` |
| Errors and validation | `modules/<feature>/src/validation.ts` | `ModerationError` |
| Discord adapter | `modules/<feature>/src/DiscordRest<Feature>Gateway.ts` | uses `@qbox/shared/discord-rest` |
| Test repository | `modules/<feature>/src/InMemory<Feature>Repository.ts` | |
| Unit tests | `modules/<feature>/test/*.test.ts` | |
| Schema | `prisma/schema/<feature>.prisma` | every model and enum starts with `<Feature>` |
| Migration | `prisma/migrations/<timestamp>_<feature>/migration.sql` | generated, never hand-written |
| Repository | `packages/database/src/<feature>/Prisma<Feature>Repository.ts` | |
| Integration test | `packages/database/integration/<Feature>Repository.integration.test.ts` | truncate only your tables |
| Slash command | `packages/discord/src/commands/<Name>.command.ts` | exports a service-less `command` |
| Bot feature | `packages/discord/src/<feature>/<Feature>Feature.ts` | `moderationFeature` |
| API routes | `apps/api/src/<feature>/<Feature>Routes.ts` | `moderationApiFeature` |
| API tests | `apps/api/test/<Feature>Routes.test.ts` | |
| Portal page | `apps/web/public/js/<feature>.js` | `moderation.js` |
| Docs | `docs/<Feature>.md` | `docs/Moderation.md` |

## One-line registrations

Add one line or entry to each of these shared files:

- `apps/bot/src/features.ts`: `<feature>Feature(new Prisma<Feature>Repository(persistence.prisma))`
- `apps/api/src/features.ts`: `<feature>ApiFeature(new <Feature>Service(...))`
- `apps/web/public/js/pages.js`: page entry with an icon (keep Account last)
- `packages/database/src/index.ts` and `packages/discord/src/index.ts`: exports
- `packages/permissions/src/catalog/PermissionCatalog.ts`: new permissions, then run `node scripts/update-permission-checksum.mjs`
- `packages/feature-registry/src/index.ts`, `apps/web/public/js/featureRegistry.js`, `docs/DiscordFeatureParity.md`: mark the feature `LIVE` with its commands, routes, permissions, and models
- `packages/feature-registry/test/FeatureRegistry.test.ts`: add the command names
- `package.json` dependencies (`workspace:*`) in `packages/database`, `packages/discord`, and `apps/api`, then `pnpm install --prefer-offline`

## Conventions

- **Guild IDs:** feature tables store the Discord guild snowflake in `guildId` and do not relate to the `Guild` model. Do not edit `prisma/schema/base.prisma`.
- **Enums in the database** map to lowercase-hyphen values (`@map("select-menu")`).
- **Settings** are one row per guild with a `revision` column. Saves pass `expectedRevision` and fail with `CONFLICT` when stale.
- **Counters** (case numbers, ticket numbers) are allocated with an atomic `upsert ... increment`.
- **Errors:** one `<Feature>Error` class with codes `INVALID_INPUT`, `NOT_FOUND`, `FORBIDDEN`, `INVALID_STATE`, `CONFLICT`, `LIMIT_REACHED`, `DEPENDENCY_UNAVAILABLE`. Messages are plain sentences a server admin understands.
- **Validation** happens in the service, which throws `<Feature>Error`. Service methods are `async` so validation errors reject.
- **Discord access** goes through a gateway interface implemented with `DiscordRestClient`, so the bot (`client.rest`) and the API (`new REST()`) share one adapter. Services never import discord.js.
- **Permissions** are `<feature>.manage` for setup plus narrower ones where staff need less (for example `moderation.view`). Discord administrators always pass.
- **Slash commands** use one top-level command with subcommands. Check a permission per subcommand with `memberHasPermission`. Catch `<Feature>Error` and reply with its message.
- **Buttons, menus, and modals** use custom IDs starting with `qbox:<feature>:` and are handled by the feature's `handleInteraction`.
- **Timers** (for example checking every minute) are created in `attach`, call `unref()`, and are cleared in `detach`.
- **API routes** live under `/api/v1/<feature>/`. Use `context.guard(request, permission, { mutation })` for staff and `context.member(request, { mutation })` for any signed-in member. Changes always pass `mutation: true` (CSRF). Use `parseInput`, `featureCall`, and `errorOf` from `apps/api/src/features/routeHelpers.ts`.
- **Portal pages** use `forms.js` helpers and pickers, `getJson`/`sendJson` from `api.js`, and the tab pattern from `moderation.js`. They show only live data; there is no demo mode. Keep wording plain and short.
- **No dead code, no commented-out code, no `any`.**

## Checks before committing

```text
pnpm --filter @qbox/prisma prisma:validate
pnpm --filter @qbox/prisma prisma:generate
pnpm build && pnpm typecheck && pnpm test
DATABASE_URL=postgresql://qbox@127.0.0.1:5433/<your_test_db> pnpm test:database
```

Create a migration by applying existing migrations to an empty test database,
then diffing it against the schema folder:

```text
createdb -h 127.0.0.1 -p 5433 -U qbox <your_test_db>
cd packages/prisma
DATABASE_URL=postgresql://qbox@127.0.0.1:5433/<your_test_db> npx prisma migrate deploy --config prisma.config.ts
DATABASE_URL=... npx prisma migrate diff --config prisma.config.ts --from-config-datasource --to-schema ../../prisma/schema --script > ../../prisma/migrations/<timestamp>_<feature>/migration.sql
DATABASE_URL=... npx prisma migrate deploy --config prisma.config.ts
```

Validate slash commands with the command loader (`CommandLoader` in
`packages/discord/src/loaders`) so Discord limits are checked before deploy.
