# Applications

## `@qbox/api`

- **Location:** `apps/api/`
- **Purpose:** Current API process placeholder. It prints startup text; it does not start an HTTP server.
- **Entry point:** `apps/api/src/index.ts`
- **Declared dependency:** `@qbox/core`
- **Scripts:** `build`, `dev`, `start`, `typecheck`, `clean`

## `@qbox/bot`

- **Location:** `apps/bot/`
- **Purpose:** Discord bot process and the only application currently using the complete platform kernel lifecycle.
- **Entry point:** `apps/bot/src/index.ts`
- **Declared dependencies:** `@qbox/core`, `@qbox/discord`, `@qbox/logger`, `@qbox/shared`
- **Scripts:** `build`, `dev`, `start`, `typecheck`, `clean`
- **Runtime behavior:** Creates `PlatformKernel`, registers `DiscordModule`, starts the kernel, and handles `SIGINT` and `SIGTERM` shutdown signals.

The additional file `apps/bot/src/bootstrap/environment.ts` defines an environment-loading function, but it is not imported by the bot entry point.

## `@qbox/worker`

- **Location:** `apps/worker/`
- **Purpose:** Current background-worker process placeholder. It prints startup text; it does not start a queue worker.
- **Entry point:** `apps/worker/src/index.ts`
- **Declared dependency:** `@qbox/core`
- **Scripts:** `build`, `dev`, `start`, `typecheck`, `clean`

# Packages

## `@qbox/core`

- **Location:** `packages/core/`
- **Responsibility:** Platform lifecycle, runtime module registration, in-process events, and named service registration.
- **Declared dependency:** `@qbox/logger`
- **Public exports:** `EventBus`, `EventHandler`, `ServiceContainer`, `PlatformModule`, `PlatformModuleContext`, `ModuleLoader`, and `PlatformKernel` through `src/index.ts`.
- **Note:** `src/kernel.ts` contains a separate basic `Kernel` class that is not exported by the package entry point.

## `@qbox/database`

- **Location:** `packages/database/`
- **Responsibility:** Placeholder database abstraction. `connect()` and `disconnect()` currently print messages only.
- **Declared dependencies:** None.
- **Public exports:** `Database` and the `database` singleton.

## `@qbox/discord`

- **Location:** `packages/discord/`
- **Responsibility:** Discord runtime module, Discord.js client lifecycle, slash-command discovery, registration, dispatch, and permission enforcement.
- **Declared dependencies:** `@qbox/core`, `@qbox/logger`, `@qbox/permissions`, `@qbox/shared`, `discord.js`
- **Public exports:** `DiscordService`, `DiscordModule`, `DiscordCommand`, `CommandRegistry`, `PingCommand`, and `CommandLoader`.
- **Note:** `AdminPingCommand` exists but is not re-exported from the package entry point. It is discovered at runtime by `CommandLoader`.

## `@qbox/logger`

- **Location:** `packages/logger/`
- **Responsibility:** Shared structured logger.
- **Declared dependency:** `pino`
- **Public export:** `logger`

## `@qbox/openai`

- **Location:** `packages/openai/`
- **Responsibility:** Placeholder AI service. Its lifecycle methods print messages only; no OpenAI client is created.
- **Declared dependencies:** None.
- **Public exports:** `AIService` and the `ai` singleton.

## `@qbox/permissions`

- **Location:** `packages/permissions/`
- **Responsibility:** Permission definitions and in-memory role-to-permission grants.
- **Declared dependencies:** None.
- **Public exports:** `PermissionService`, the `permissions` singleton, `Permission`, `PermissionSubject`, and `PermissionGrant`.

## `@qbox/prisma`

- **Location:** `packages/prisma/`
- **Responsibility:** Current Prisma package placeholder.
- **Declared dependencies:** None.
- **Public exports:** None; `src/index.ts` contains only `export {}`.

## `@qbox/scheduler`

- **Location:** `packages/scheduler/`
- **Responsibility:** Placeholder scheduler. Its lifecycle methods print messages only.
- **Declared dependencies:** None.
- **Public exports:** `Scheduler` and the `scheduler` singleton.

## `@qbox/shared`

- **Location:** `packages/shared/`
- **Responsibility:** Environment-file loading and shared configuration values.
- **Declared dependencies:** None in its workspace manifest. Its source imports `dotenv`, which is declared at the repository root.
- **Public exports:** `env`, `Configuration`, and `configuration`.
- **Non-exported source:** `AppConfig` exists in `src/config.ts` but is not exported from `src/index.ts`.

# Modules

## Runtime module system

`@qbox/core` defines `PlatformModule` and `PlatformModuleContext`. A runtime module has a name, version, required `start()` method, and optional `stop()` method. `ModuleLoader` starts modules in registration order and stops them in reverse registration order.

### `DiscordModule`

- **Implementation:** `packages/discord/src/DiscordModule.ts`
- **Registered by:** `apps/bot/src/index.ts`
- **Module name:** `discord`
- **Module version:** `0.1.0`
- **Purpose:** Configure Discord permissions, discover commands, register services, and manage the Discord client lifecycle.
- **Commands:** `ping`, `adminping`
- **Services registered:** `permissions`, `discord`
- **Events emitted directly:** None.
- **Exports:** `DiscordModule` is exported from `@qbox/discord`.
- **Dependencies:** Core module contracts, shared logger, shared environment configuration, permission service, command loader, and Discord service.

## Module workspace directories

`pnpm-workspace.yaml` includes `modules/*`. The following directories currently exist, but contain no source files, manifests, commands, services, events, or exports:

| Directory | Current contents |
| --- | --- |
| `modules/applications/` | Empty placeholder directory |
| `modules/birthdays/` | Empty placeholder directory |
| `modules/fivem/` | Empty placeholder directory |
| `modules/knowledge/` | Empty placeholder directory |
| `modules/moderation/` | Empty placeholder directory |
| `modules/polls/` | Empty placeholder directory |
| `modules/staff/` | Empty placeholder directory |
| `modules/tickets/` | Empty placeholder directory |
| `modules/verification/` | Empty placeholder directory |

Because they have no `package.json`, these directories are not currently pnpm workspace packages despite matching the configured path pattern.

# Services

## `PlatformKernel`

- **Defined in:** `packages/core/src/kernel/PlatformKernel.ts`
- **Instantiated in:** `apps/bot/src/index.ts`
- **Purpose:** Owns the service container, event bus, module loader, and platform startup/shutdown sequence.

## `ServiceContainer`

- **Defined in:** `packages/core/src/services/ServiceContainer.ts`
- **Instantiated in:** Each `PlatformKernel` instance.
- **Purpose:** Stores and retrieves services by string name.

## `EventBus`

- **Defined in:** `packages/core/src/events/EventBus.ts`
- **Instantiated in:** Each `PlatformKernel` instance.
- **Purpose:** Registers handlers and emits named in-process events.

## `ModuleLoader`

- **Defined in:** `packages/core/src/modules/ModuleLoader.ts`
- **Instantiated in:** Each `PlatformKernel` instance.
- **Purpose:** Registers modules, prevents duplicate module names, and controls lifecycle order.

## `DiscordService`

- **Defined in:** `packages/discord/src/DiscordService.ts`
- **Instantiated in:** As a private field of each `DiscordModule` instance.
- **Purpose:** Owns the Discord.js client, dispatches interactions, and registers global application commands.

## `CommandRegistry`

- **Defined in:** `packages/discord/src/commands/CommandRegistry.ts`
- **Instantiated in:** The `DiscordService` constructor.
- **Purpose:** Stores command instances, prevents duplicate command names, enforces command permissions, and invokes command handlers.

## `CommandLoader`

- **Defined in:** `packages/discord/src/loaders/CommandLoader.ts`
- **Instantiated in:** As a private field of each `DiscordModule` instance.
- **Purpose:** Scans the Discord command directory and instantiates exported command classes.

## `PermissionService`

- **Defined and instantiated in:** `packages/permissions/src/index.ts`
- **Instance:** Exported singleton `permissions`.
- **Purpose:** Stores in-memory role grants and checks individual, every, or any permission.
- **Injected into:** `DiscordService`, then `CommandRegistry`.

## Logger

- **Defined and instantiated in:** `packages/logger/src/index.ts`
- **Instance:** Exported singleton `logger`.
- **Purpose:** Pino structured logging for the platform and Discord integration.

## Placeholder service instances

- `database` is instantiated in `packages/database/src/index.ts`.
- `ai` is instantiated in `packages/openai/src/index.ts`.
- `scheduler` is instantiated in `packages/scheduler/src/index.ts`.
- `configuration` is instantiated in `packages/shared/src/config/Configuration.ts`.

These singleton instances are not currently registered with `PlatformKernel` or used by an application.

# Dependency Injection

The current implementation combines a named service registry with constructor injection.

When `PlatformKernel.start()` runs, it registers:

| Name | Value |
| --- | --- |
| `logger` | Shared Pino `logger` singleton |
| `events` | Kernel-owned `EventBus` |
| `modules` | Kernel-owned `ModuleLoader` |

The kernel passes a `PlatformModuleContext` containing `services` and `events` to every module during startup and shutdown.

During `DiscordModule.start()`, the module registers:

| Name | Value |
| --- | --- |
| `permissions` | Shared `PermissionService` singleton |
| `discord` | Module-owned `DiscordService` |

Constructor injection is used for Discord authorization:

```text
PermissionService
  -> DiscordService constructor
       -> CommandRegistry constructor
```

The container uses string keys and caller-supplied generic return types. It does not automatically construct services or verify their runtime types.

# Event System

`EventBus` supports `on(eventName, handler)` and `emit(eventName, payload)`. Registration returns an unsubscribe function. When an event is emitted, all current handlers run through `Promise.all`.

Known events:

| Event | Emitter | Payload | Current subscribers |
| --- | --- | --- | --- |
| `platform.started` | `PlatformKernel.start()` | `{ startedAt: Date }` | None in the repository |
| `platform.stopping` | `PlatformKernel.stop()` | `{ stoppedAt: Date }` | None in the repository |

Discord.js events such as `InteractionCreate` and `ClientReady` are handled by `DiscordService`, but they are Discord client events rather than events emitted through the platform `EventBus`.

# Commands

## `/ping`

- **Implementation:** `packages/discord/src/commands/PingCommand.ts`
- **Class:** `PingCommand`
- **Description:** Checks whether the bot is responding.
- **Required platform permissions:** None.
- **Response:** Ephemeral `Pong.` response.

## `/adminping`

- **Implementation:** `packages/discord/src/commands/AdminPingCommand.ts`
- **Class:** `AdminPingCommand`
- **Description:** Tests whether the caller has platform administrator permission.
- **Required platform permission:** `platform.admin`
- **Response:** Ephemeral administrator confirmation when authorized.

`CommandLoader` discovers both classes by scanning for filenames ending in `Command.ts` or `Command.js`, excluding the `DiscordCommand` interface file. `CommandRegistry` handles lookup, guild checks, role extraction, permission checks, and execution.

# Configuration

## Root configuration

| File | Controls |
| --- | --- |
| `package.json` | Root metadata, supported Node and pnpm versions, recursive scripts, and root dependencies |
| `pnpm-workspace.yaml` | Workspace discovery under `apps/*`, `packages/*`, and `modules/*` |
| `pnpm-lock.yaml` | pnpm dependency resolution |
| `package-lock.json` | npm dependency resolution; present alongside the pnpm lockfile |
| `tsconfig.json` | Shared strict TypeScript, NodeNext ESM, declaration, and source-map settings |
| `.gitignore` | Ignored secrets, dependencies, generated output, coverage, logs, editor files, and temporary files |
| `.env.example` | Names of environment settings recognized by the repository |
| `.env` | Local environment values; ignored by Git and loaded by `@qbox/shared` |
| `AGENTS.md` | Operating instructions for AI coding agents |
| `PROJECT_CHARTER.md` | Repository engineering principles and definition of done |

## Workspace configuration

Every application and package has a `package.json` describing its identity, scripts, and declared dependencies. Each also has a `tsconfig.json` extending the root compiler configuration.

Most workspace TypeScript configurations set `src` as `rootDir` and `dist` as `outDir`. `packages/prisma/tsconfig.json` currently only extends the root configuration and includes `src`.

## Source configuration

| File | Controls |
| --- | --- |
| `packages/shared/src/env.ts` | Loads the root `.env` and exposes parsed environment values |
| `packages/shared/src/config/Configuration.ts` | Exposes a `Configuration` instance backed directly by `process.env` |
| `packages/shared/src/config.ts` | Defines non-exported `AppConfig` application metadata and debug state |
| `packages/logger/src/index.ts` | Configures logger level and base service metadata |
| `apps/bot/src/bootstrap/environment.ts` | Defines an additional dotenv loader; currently unused |

# Environment Variables

Environment variable names recognized by current source or `.env.example`:

- `NODE_ENV`
- `DISCORD_TOKEN`
- `DATABASE_URL`
- `REDIS_URL`
- `OPENAI_API_KEY`
- `ADMIN_ROLE_IDS`
- `LOG_LEVEL`

`DISCORD_TOKEN` is explicitly required when starting `DiscordService`. The remaining variables receive defaults or are not consumed by an implemented integration. The shared environment loader also expects the root `.env` file to be readable.

# Build Pipeline

The repository uses pnpm workspaces and TypeScript compilation.

## Tool requirements

- Node.js 22 or newer.
- pnpm 10 or newer.
- The root manifest selects pnpm 10.16.0.

## Root commands

| Command | Current behavior |
| --- | --- |
| `pnpm build` | Runs `pnpm -r build` across workspaces defining `build` |
| `pnpm dev` | Runs application `dev` scripts in parallel |
| `pnpm typecheck` | Runs workspace `typecheck` scripts where defined |
| `pnpm test` | Runs the permission and Discord workspace Vitest suites |
| `pnpm clean` | Removes generated `dist/` directories across TypeScript workspaces |

Workspace build scripts run `tsc`. For workspaces with configured output directories, compilation writes JavaScript, source maps, declaration files, and declaration maps to ignored `dist/` directories.

The recursive root typecheck covers every TypeScript application and package. Focused Vitest suites cover `PermissionService` authorization behavior and `CommandRegistry` permission enforcement.

There is no configured CI workflow, deployment pipeline, lint script, or formatting script in the repository.

# Future Placeholders

The following systems have repository locations or placeholder classes but no functional implementation:

- API server: `apps/api/` does not create or listen with Fastify.
- Background worker: `apps/worker/` does not create BullMQ or Redis workers.
- Database service: `packages/database/` does not connect to a database.
- Prisma integration: `packages/prisma/` exports nothing, and root `prisma/` contains no schema, migrations, or seeds.
- OpenAI integration: `packages/openai/` does not construct or call an OpenAI client.
- Scheduler: `packages/scheduler/` does not schedule jobs or use Redis/BullMQ.
- FiveM/Qbox integration: `modules/fivem/` is empty.
- Applications module: `modules/applications/` is empty.
- Birthdays module: `modules/birthdays/` is empty.
- Knowledge module: `modules/knowledge/` is empty.
- Moderation module: `modules/moderation/` is empty.
- Polls module: `modules/polls/` is empty.
- Staff module: `modules/staff/` is empty.
- Tickets module: `modules/tickets/` is empty.
- Verification module: `modules/verification/` is empty.
