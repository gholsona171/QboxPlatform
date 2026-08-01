# Development Workflow

## Prerequisites

The root manifest declares these minimum tools:

- Node.js 22 or newer.
- pnpm 10 or newer.

The package manager field selects pnpm 10.16.0. Commands in this document therefore use pnpm.

## Install dependencies

From the repository root, install all workspace dependencies:

```sh
pnpm install
```

The repository contains both `pnpm-lock.yaml` and `package-lock.json`, but the manifest and workspace configuration identify pnpm as the intended package manager.

## Environment configuration

The repository includes `.env.example`. Local execution expects a repository-root `.env` file with the applicable variables:

```dotenv
NODE_ENV=development
DISCORD_TOKEN=
DISCORD_APPLICATION_ID=
DISCORD_GUILD_ID=
DISCORD_COMMAND_TIMEOUT_MS=15000
DISCORD_COMMAND_SHUTDOWN_TIMEOUT_MS=10000
DATABASE_URL=
REDIS_URL=
OPENAI_API_KEY=
ADMIN_ROLE_IDS=
```

`ADMIN_ROLE_IDS` is parsed as a comma-separated list. The Discord bot requires `DISCORD_TOKEN` and `DISCORD_APPLICATION_ID`. Development command deployment also requires `DISCORD_GUILD_ID`. `DISCORD_COMMAND_TIMEOUT_MS` defaults to 15 seconds, and `DISCORD_COMMAND_SHUTDOWN_TIMEOUT_MS` defaults to 10 seconds; both must be positive integers. The other URLs and API key are loaded but are not consumed by the current placeholder integrations.

The local `.env` file is ignored by Git and should not be committed.

## pnpm workspaces

The workspace includes direct children of `apps/`, `packages/`, and `modules/`. Internal dependencies use `workspace:*`, ensuring that a package resolves to the matching local workspace.

Run a command in one workspace with a filter:

```sh
pnpm --filter @qbox/bot dev
pnpm --filter @qbox/core build
pnpm --filter @qbox/discord build
```

Run a script recursively in workspaces that define it:

```sh
pnpm -r build
pnpm -r typecheck
```

The root scripts wrap these recursive commands where applicable.

## Local development

Start all applications that define a `dev` script:

```sh
pnpm dev
```

This runs the application development scripts in parallel. Each application uses `tsx watch src/index.ts`.

To work only on the bot:

```sh
pnpm --filter @qbox/bot dev
```

The API and worker currently print startup messages only. The bot starts the implemented kernel and Discord integration.

Normal bot startup validates and registers local command handlers but does not deploy Discord application commands.

## Discord command deployment

Preview the configured development guild first:

```sh
pnpm --filter @qbox/bot deploy:commands:dev:dry-run
```

The dry-run connects to the verified application, loads and validates local commands, fetches current guild commands, and reports additions, updates, removals, and unchanged commands without mutating Discord.

Apply the displayed guild plan:

```sh
pnpm --filter @qbox/bot deploy:commands:dev
```

Guild deployment displays the plan, replaces commands only in `DISCORD_GUILD_ID`, fetches the resulting definitions, verifies them against the desired definitions, and exits nonzero on failure or mismatch.

For global commands, build and preview before applying:

```sh
pnpm build
pnpm --filter @qbox/bot deploy:commands:global:dry-run
```

If the preview contains no removals, apply with:

```sh
pnpm --filter @qbox/bot deploy:commands:global -- --confirm-global
```

If the preview contains removals, both noninteractive confirmations are required:

```sh
pnpm --filter @qbox/bot deploy:commands:global -- --confirm-global --confirm-global-removals
```

Global workflows use the compiled `dist/deployCommands.js`. A dry-run never requires confirmation because it cannot mutate Discord. Every real deployment recomputes and logs the plan immediately before replacement and verifies the resulting state afterward. Normal bot startup never deploys commands.

Some library packages also define watch commands. They can be run directly with filters, for example:

```sh
pnpm --filter @qbox/core dev
pnpm --filter @qbox/shared dev
```

## Prisma tooling

`@qbox/prisma` owns the Prisma 7 toolchain while the canonical schema remains at `prisma/schema.prisma`. Supply a non-secret PostgreSQL-format `DATABASE_URL` for tooling, then run:

```bash
pnpm --filter @qbox/prisma prisma:format
pnpm --filter @qbox/prisma prisma:validate
pnpm --filter @qbox/prisma prisma:generate
```

The schema contains the persistent-permission foundation. Formatting, validation, and generation do not connect to PostgreSQL.

Generated TypeScript is committed under `packages/prisma/src/generated/client`. Package generation applies a deterministic whitespace-only normalization because Prisma 7 output otherwise fails the repository whitespace gate. Package build regenerates it before TypeScript compilation, and CI fails if regeneration changes the committed schema or generated output. Do not edit generated files manually. Applications import the public `@qbox/prisma` package boundary, never generated paths.

### Disposable local PostgreSQL

Docker Compose defines separate pinned PostgreSQL 17.6 development and test services. Both bind to loopback only. Set `QBOX_POSTGRES_PASSWORD` in the local shell before starting either service; no local database password is committed:

```sh
docker compose -f compose.postgres.yml up -d postgres-test
```

The disposable test URL is:

```text
postgresql://qbox_local:<local-password>@127.0.0.1:54330/qbox_permissions_local_test
```

Set that URL only in the current shell, apply committed migrations, and run the integration suite:

```sh
pnpm --filter @qbox/prisma prisma:migrate:deploy
pnpm test:database
```

The bot runtime also requires `DATABASE_URL`. On startup it connects through `@qbox/database`, validates readiness, synchronizes the compiled permission catalog, and only then starts Discord. Connection strings are redacted from diagnostics.

Persistent owner bootstrap and `ADMIN_ROLE_IDS` migration are dry-run-first operator workflows documented in `docs/PermissionAdministration.md`. Do not disable `PERMISSION_LEGACY_ADMIN_COMPATIBILITY_ENABLED` until both persistent owner and administrator recovery paths have been verified.

The suite refuses destructive cleanup unless the database name contains `test`. It never runs `migrate reset` or `db push`. The `postgres-test` data directory is a container-local tmpfs and is disposable; the `postgres-dev` service instead uses the named `qbox-postgres-dev` volume and database `qbox_permissions_dev` on loopback port 54329.

Create new migrations against a disposable development database, inspect the SQL before applying it, and commit migration history. CI uses `prisma migrate deploy`; production must do the same only after a backup and migration review. Never edit a migration that has been applied to a shared environment.

## Build

Build every workspace that defines a build script:

```sh
pnpm build
```

The root build command runs `pnpm -r build`. Workspace build scripts invoke `tsc`, normally compiling `src/` into `dist/` and generating JavaScript, source maps, declarations, and declaration maps.

Build an individual workspace with a filter:

```sh
pnpm --filter @qbox/bot build
```

Generated `dist/` directories are ignored by Git.

## Type checking

Run the repository-defined typecheck command:

```sh
pnpm typecheck
```

This invokes `typecheck` in every TypeScript application and package. Each workspace runs `tsc --noEmit`, so validation does not write compiled output.

## Tests, linting, formatting, and cleaning

The root manifest declares:

```sh
pnpm test
pnpm clean
```

The test workflow runs focused Vitest suites in `@qbox/permissions`, `@qbox/discord`, and `@qbox/bot`.

The clean workflow removes generated `dist/` directories from each TypeScript workspace.

ESLint and Prettier are installed as development dependencies, but the repository has no lint or formatting scripts and no corresponding configuration files.

## Running compiled applications

The API, bot, and worker define production-style start commands:

```sh
pnpm --filter @qbox/api start
pnpm --filter @qbox/bot start
pnpm --filter @qbox/worker start
```

These commands run their compiled `dist/index.js` files and therefore require a successful build first.

## Git workflow

The repository does not define a branching model, commit convention, pull request template, or contribution guide. The following Git operations describe the basic workflow supported by the repository rather than an established project policy:

1. Start from the intended base branch and confirm a clean worktree with `git status`.
2. Create or switch to a task branch, such as `git switch -c <branch-name>`.
3. Make the scoped changes.
4. Review changes with `git diff` and `git status`.
5. Run the applicable typecheck and build commands before committing.
6. Stage only the intended files and create a descriptive commit.

Secrets, dependencies, generated `dist/` files, coverage, and logs are ignored and should remain outside commits. No automated GitHub checks currently enforce this workflow because `.github/` is empty.
