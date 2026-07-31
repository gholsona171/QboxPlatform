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
DATABASE_URL=
REDIS_URL=
OPENAI_API_KEY=
ADMIN_ROLE_IDS=
```

`ADMIN_ROLE_IDS` is parsed as a comma-separated list. The Discord bot requires `DISCORD_TOKEN`; the other URLs and API key are loaded but are not consumed by the current placeholder integrations.

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

Deploy commands to the configured development guild:

```sh
pnpm --filter @qbox/bot deploy:commands:guild
```

This requires `DISCORD_TOKEN` and `DISCORD_GUILD_ID`.

Deploy commands globally after building the repository:

```sh
pnpm build
pnpm --filter @qbox/bot deploy:commands:global
```

Global deployment uses `dist/deployCommands.js` and requires `DISCORD_TOKEN`. Both workflows load and validate the complete command set before replacing commands in their selected scope.

Some library packages also define watch commands. They can be run directly with filters, for example:

```sh
pnpm --filter @qbox/core dev
pnpm --filter @qbox/shared dev
```

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

The test workflow runs focused Vitest suites in `@qbox/permissions` and `@qbox/discord`. Other workspaces do not currently define test suites.

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
