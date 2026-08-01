# Folder Structure

## Repository root

The repository root contains shared configuration for the monorepo:

```text
QboxPlatform/
|-- .github/
|-- apps/
|-- docs/
|-- modules/
|-- packages/
|-- prisma/
|-- .env.example
|-- .gitignore
|-- package.json
|-- package-lock.json
|-- pnpm-lock.yaml
|-- pnpm-workspace.yaml
|-- README.md
`-- tsconfig.json
```

### `.github/`

Contains the GitHub Actions quality gate in `.github/workflows/quality.yml`. It validates pull requests targeting `main` and pushes to `main` without using Discord credentials or deploying commands.

### `apps/`

Contains executable applications. Each application is a private pnpm workspace with its own `package.json`, `tsconfig.json`, and `src/index.ts` entry point.

Examples:

- `apps/bot/` contains the Discord bot startup code and signal handling.
- `apps/api/` contains an API startup placeholder.
- `apps/worker/` contains a background-worker startup placeholder.

Some applications have local ignored `dist/` directories containing TypeScript output.

### `docs/`

Contains project documentation. It was empty before the documentation files in this set were added.

Examples include architecture, folder structure, development workflow, command authoring, Discord operations, runtime module, and coding convention documentation.

### `modules/`

Currently empty. It is included by `pnpm-workspace.yaml` through the `modules/*` pattern, so direct child directories can be pnpm workspace projects. No runtime or workspace module currently exists here.

This directory is distinct from `packages/core/src/modules/`, which contains the implemented runtime module interfaces and loader.

### `packages/`

Contains reusable workspace libraries:

- `core/`: platform kernel, module lifecycle, event bus, and service container.
- `database/`: placeholder `Database` class and singleton.
- `discord/`: Discord client, module, command registry, commands, and command loader.
- `logger/`: shared Pino logger.
- `openai/`: placeholder `AIService` class and singleton.
- `permissions/`: permission types and in-memory role grants.
- `prisma/`: empty TypeScript package entry point.
- `scheduler/`: placeholder `Scheduler` class and singleton.
- `shared/`: environment loading and configuration values.

Package source is stored under `src/`. TypeScript builds generally write to an ignored `dist/` directory.

### `prisma/`

Currently empty. There is no Prisma schema, migration, or seed in the repository. This top-level directory is separate from the `packages/prisma/` workspace.

### `.git/`

Contains Git's internal repository data. It is not application source and should be managed only through Git commands.

### `node_modules/`

Contains installed dependencies and pnpm workspace links. It is ignored by Git and is created by package installation.

## Root files

### `.env`

Local environment values. It is ignored by Git. The shared environment loader resolves this file from the repository root.

### `.env.example`

Lists the currently recognized environment variables without values:

- `NODE_ENV`
- `DISCORD_TOKEN`
- `DATABASE_URL`
- `REDIS_URL`
- `OPENAI_API_KEY`
- `ADMIN_ROLE_IDS`

### `.gitignore`

Ignores secrets, dependencies, build output, coverage, logs, editor files, operating-system files, and temporary files. It explicitly allows `.env.example`.

### `package.json`

Defines root metadata, Node and pnpm requirements, shared scripts, and root-level dependencies and development dependencies.

### `pnpm-workspace.yaml`

Defines `apps/*`, `packages/*`, and `modules/*` as workspace locations.

### `pnpm-lock.yaml`

Records the dependency graph used by pnpm.

### `package-lock.json`

An npm lockfile is also present, although the repository declares pnpm as its package manager.

### `tsconfig.json`

Provides strict shared TypeScript compiler settings. Workspace projects extend it and usually add `rootDir` and `outDir`.

### `README.md`

States the platform vision, initial goals, and current foundation-phase status.

## Common workspace layout

Most workspaces follow this pattern:

```text
workspace/
|-- package.json
|-- tsconfig.json
|-- src/
|   `-- index.ts
`-- dist/              # Generated and ignored when present
```

The Discord package has additional organization:

```text
packages/discord/src/
|-- commands/
|   |-- DiscordCommand.ts
|   |-- CommandRegistry.ts
|   |-- Ping.command.ts
|   `-- AdminPing.command.ts
|-- loaders/
|   `-- CommandLoader.ts
|-- validation/
|   `-- CommandValidator.ts
|-- DiscordModule.ts
|-- DiscordService.ts
`-- index.ts
```
