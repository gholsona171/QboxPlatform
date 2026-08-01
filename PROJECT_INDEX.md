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
- **Scripts:** `build`, `dev`, `start`, `deploy:commands:dev`, `deploy:commands:dev:dry-run`, `deploy:commands:global`, `deploy:commands:global:dry-run`, `deploy:commands:guild`, `typecheck`, `test`, `clean`
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
- **Responsibility:** PostgreSQL configuration and lifecycle, Prisma-backed persistent-permission repositories, transaction boundaries, and cache invalidation infrastructure.
- **Declared dependencies:** `@qbox/permissions`, `@qbox/prisma`
- **Public exports:** database configuration/lifecycle contracts, `PrismaPermissionPersistenceClient`, six permission repository implementations, and `InMemoryPermissionInvalidationBus`.

## `@qbox/discord`

- **Location:** `packages/discord/`
- **Responsibility:** Discord runtime module, Discord.js client lifecycle, slash-command discovery, registration, dispatch, and permission enforcement.
- **Declared dependencies:** `@qbox/core`, `@qbox/logger`, `@qbox/permissions`, `@qbox/shared`, `discord.js`
- **Public exports:** `DiscordService`, `DiscordModule`, `DiscordCommand`, `CommandRegistry`, `CommandOptionReader`, `CommandRoute`, `CommandInputError`, `DiscordInteractionHandler`, `PingCommand`, `AdminPingCommand`, `CommandLoader`, command loading diagnostics, and command validation types.

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
- **Responsibility:** Versioned permission catalog, asynchronous authorization domain, repository/cache contracts, and guild-bound legacy administrator compatibility.
- **Declared dependencies:** None.
- **Public exports:** `PermissionAuthorizer`, `PersistentPermissionService`, catalog/principal/scope/assignment contracts, in-memory runtime adapters, and the deprecated legacy `PermissionService` compatibility API.

## `@qbox/prisma`

- **Location:** `packages/prisma/`
- **Responsibility:** Prisma 7 toolchain, committed NodeNext/ESM generated client, schema/migration ownership, and disconnected client factory.
- **Declared runtime dependencies:** `@prisma/adapter-pg`, `@prisma/client`, `pg`
- **Public exports:** `PrismaClient`, `PrismaClientFactory`, Prisma types, and generated permission enums.

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

| Directory               | Current contents            |
| ----------------------- | --------------------------- |
| `modules/applications/` | Empty placeholder directory |
| `modules/birthdays/`    | Empty placeholder directory |
| `modules/fivem/`        | Empty placeholder directory |
| `modules/knowledge/`    | Empty placeholder directory |
| `modules/moderation/`   | Empty placeholder directory |
| `modules/polls/`        | Empty placeholder directory |
| `modules/staff/`        | Empty placeholder directory |
| `modules/tickets/`      | Empty placeholder directory |
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
- **Purpose:** Owns the Discord.js client, dispatches interactions, and exposes current, desired, and applied command-definition operations to the explicit deployment workflow.

## `CommandRegistry`

- **Defined in:** `packages/discord/src/commands/CommandRegistry.ts`
- **Instantiated in:** The `DiscordService` constructor.
- **Purpose:** Atomically stores validated command instances and aliases, produces deployment data, enforces context, permission, administrator-override, cooldown, and concurrency policies, and invokes command handlers.

## `DiscordInteractionHandler`

- **Defined in:** `packages/discord/src/interactions/DiscordInteractionHandler.ts`
- **Instantiated in:** The `DiscordService` constructor.
- **Purpose:** Dispatches supported interactions, applies response policies, records non-secret execution diagnostics, enforces acknowledgement and execution timeouts, tracks active executions, drains work during shutdown, and sends state-aware ephemeral error responses.

## `CommandLoader`

- **Defined in:** `packages/discord/src/loaders/CommandLoader.ts`
- **Instantiated in:** As a private field of each `DiscordModule` instance.
- **Purpose:** Deterministically scans `.command.ts` or `.command.js` files, imports their named `command` exports, and returns validated commands with load diagnostics.

## `CommandValidator`

- **Defined in:** `packages/discord/src/validation/CommandValidator.ts`
- **Instantiated in:** `CommandLoader` by default.
- **Purpose:** Validates file identity, explicit exports, command type, metadata, option and subcommand structure, aliases, policies, execution handlers, and cross-command name uniqueness before registration.

## Permission authorization service

- **Defined in:** `packages/permissions/src/PersistentPermissionService.ts`
- **Instantiated by:** bot composition with `PrismaPermissionRepository`, an in-memory cache, and the guild-bound compatibility overlay.
- **Purpose:** Asynchronously evaluates direct-user and role assignments with guild isolation, deny precedence, owner/admin overrides, cache fallback, and fail-closed behavior.
- **Injected into:** `DiscordModule`, `DiscordService`, then `CommandRegistry` through `PermissionAuthorizer`.

## Logger

- **Defined and instantiated in:** `packages/logger/src/index.ts`
- **Instance:** Exported singleton `logger`.
- **Purpose:** Pino structured logging for the platform and Discord integration.

## Placeholder service instances

- `ai` is instantiated in `packages/openai/src/index.ts`.
- `scheduler` is instantiated in `packages/scheduler/src/index.ts`.
- `configuration` is instantiated in `packages/shared/src/config/Configuration.ts`.

These singleton instances are not currently registered with `PlatformKernel` or used by an application.

# Dependency Injection

The current implementation combines a named service registry with constructor injection.

When `PlatformKernel.start()` runs, it registers:

| Name      | Value                          |
| --------- | ------------------------------ |
| `logger`  | Shared Pino `logger` singleton |
| `events`  | Kernel-owned `EventBus`        |
| `modules` | Kernel-owned `ModuleLoader`    |

The kernel passes a `PlatformModuleContext` containing `services` and `events` to every module during startup and shutdown.

During `DiscordModule.start()`, the module registers:

| Name          | Value                                        |
| ------------- | -------------------------------------------- |
| `permissions` | Injected asynchronous `PermissionAuthorizer` |
| `discord`     | Module-owned `DiscordService`                |

Constructor injection is used for Discord authorization:

```text
PermissionAuthorizer
  -> DiscordService constructor
       -> CommandRegistry constructor
```

The container uses string keys and caller-supplied generic return types. It does not automatically construct services or verify their runtime types.

# Event System

`EventBus` supports `on(eventName, handler)` and `emit(eventName, payload)`. Registration returns an unsubscribe function. When an event is emitted, all current handlers run through `Promise.all`.

Known events:

| Event               | Emitter                  | Payload               | Current subscribers    |
| ------------------- | ------------------------ | --------------------- | ---------------------- |
| `platform.started`  | `PlatformKernel.start()` | `{ startedAt: Date }` | None in the repository |
| `platform.stopping` | `PlatformKernel.stop()`  | `{ stoppedAt: Date }` | None in the repository |

Discord.js events such as `InteractionCreate` and `ClientReady` are handled by `DiscordService`, but they are Discord client events rather than events emitted through the platform `EventBus`.

# Commands

## `/ping`

- **Implementation:** `packages/discord/src/commands/Ping.command.ts`
- **Class:** `PingCommand`
- **Description:** Checks whether the bot is responding.
- **Required platform permissions:** None.
- **Response:** Ephemeral `Pong.` response.

## `/adminping`

- **Implementation:** `packages/discord/src/commands/AdminPing.command.ts`
- **Class:** `AdminPingCommand`
- **Description:** Tests whether the caller has platform administrator permission.
- **Required platform permission:** `platform.admin`
- **Response:** Ephemeral administrator confirmation when authorized.

Each command file exports a named `command` instance. `CommandLoader` discovers command files in deterministic filename order, `CommandValidator` validates the full set, and `CommandRegistry` handles primary names, aliases, guild checks, role extraction, permission checks, and execution.

# Configuration

## Root configuration

| File                  | Controls                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| `package.json`        | Root metadata, supported Node and pnpm versions, recursive scripts, and root dependencies          |
| `pnpm-workspace.yaml` | Workspace discovery under `apps/*`, `packages/*`, and `modules/*`                                  |
| `pnpm-lock.yaml`      | pnpm dependency resolution                                                                         |
| `package-lock.json`   | npm dependency resolution; present alongside the pnpm lockfile                                     |
| `tsconfig.json`       | Shared strict TypeScript, NodeNext ESM, declaration, and source-map settings                       |
| `.gitignore`          | Ignored secrets, dependencies, generated output, coverage, logs, editor files, and temporary files |
| `.env.example`        | Names of environment settings recognized by the repository                                         |
| `.env`                | Local environment values; ignored by Git and loaded by `@qbox/shared`                              |
| `AGENTS.md`           | Operating instructions for AI coding agents                                                        |
| `PROJECT_CHARTER.md`  | Repository engineering principles and definition of done                                           |

## Workspace configuration

Every application and package has a `package.json` describing its identity, scripts, and declared dependencies. Each also has a `tsconfig.json` extending the root compiler configuration.

Most workspace TypeScript configurations set `src` as `rootDir` and `dist` as `outDir`. `packages/prisma/tsconfig.json` currently only extends the root configuration and includes `src`.

## Source configuration

| File                                          | Controls                                                              |
| --------------------------------------------- | --------------------------------------------------------------------- |
| `packages/shared/src/env.ts`                  | Loads the root `.env` and exposes parsed environment values           |
| `packages/shared/src/config/Configuration.ts` | Exposes a `Configuration` instance backed directly by `process.env`   |
| `packages/shared/src/config.ts`               | Defines non-exported `AppConfig` application metadata and debug state |
| `packages/logger/src/index.ts`                | Configures logger level and base service metadata                     |
| `apps/bot/src/bootstrap/environment.ts`       | Defines an additional dotenv loader; currently unused                 |

# Environment Variables

Environment variable names recognized by current source or `.env.example`:

- `NODE_ENV`
- `DISCORD_TOKEN`
- `DISCORD_APPLICATION_ID`
- `DISCORD_GUILD_ID`
- `DISCORD_COMMAND_TIMEOUT_MS`
- `DISCORD_COMMAND_SHUTDOWN_TIMEOUT_MS`
- `DATABASE_URL`
- `REDIS_URL`
- `OPENAI_API_KEY`
- `ADMIN_ROLE_IDS`
- `PERMISSION_LEGACY_ADMIN_COMPATIBILITY_ENABLED`
- `LOG_LEVEL`

`DISCORD_TOKEN` and `DISCORD_APPLICATION_ID` are required for the live Discord lifecycle. Guild deployment additionally requires `DISCORD_GUILD_ID`. `DISCORD_COMMAND_TIMEOUT_MS` defaults to `15000`; `DISCORD_COMMAND_SHUTDOWN_TIMEOUT_MS` defaults to `10000`. The shared environment loader expects the root `.env` file to be readable.

`PERMISSION_LEGACY_ADMIN_COMPATIBILITY_ENABLED` defaults to enabled and accepts the exact value `false` to request retirement. Startup then requires persistent owner and administrator recovery paths.

# Build Pipeline

The repository uses pnpm workspaces and TypeScript compilation.

## Tool requirements

- Node.js 22 or newer.
- pnpm 10 or newer.
- The root manifest selects pnpm 10.16.0.

## Root commands

| Command          | Current behavior                                                   |
| ---------------- | ------------------------------------------------------------------ |
| `pnpm build`     | Runs `pnpm -r build` across workspaces defining `build`            |
| `pnpm dev`       | Runs application `dev` scripts in parallel                         |
| `pnpm typecheck` | Runs workspace `typecheck` scripts where defined                   |
| `pnpm test`      | Runs the permission, Discord, and bot deployment Vitest suites     |
| `pnpm clean`     | Removes generated `dist/` directories across TypeScript workspaces |

Workspace build scripts run `tsc`. For workspaces with configured output directories, compilation writes JavaScript, source maps, declaration files, and declaration maps to ignored `dist/` directories.

The recursive root typecheck covers every TypeScript application and package. Focused Vitest suites cover permission behavior, command registration and interaction handling, and deployment target safeguards.

There is no configured CI workflow, deployment pipeline, lint script, or formatting script in the repository.

# Future Placeholders

The following systems have repository locations or placeholder classes but no functional implementation:

- API server: `apps/api/` does not create or listen with Fastify.
- Background worker: `apps/worker/` does not create BullMQ or Redis workers.
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
