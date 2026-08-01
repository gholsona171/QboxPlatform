# Module Guide

## Meaning of "module"

The repository uses the term in two related ways:

- A **runtime platform module** implements the `PlatformModule` interface and participates in kernel startup and shutdown.
- A **workspace package** is a pnpm project under `packages/` that provides reusable code.

Only `DiscordModule` is currently a runtime platform module. This guide documents it and every existing workspace component so that placeholder packages are not mistaken for completed integrations.

## Runtime module contract

`PlatformModule` is defined by `@qbox/core`:

```ts
interface PlatformModule {
  name: string;
  version: string;
  start(context: PlatformModuleContext): void | Promise<void>;
  stop?(context: PlatformModuleContext): void | Promise<void>;
}
```

The context exposes the shared `ServiceContainer` and `EventBus`.

`ModuleLoader.register()` rejects duplicate module names. `startAll()` starts modules sequentially in registration order. `stopAll()` calls optional stop methods sequentially in reverse registration order.

## Discord runtime module

### Identity

- Name: `discord`
- Version: `0.1.0`
- Implementation: `packages/discord/src/DiscordModule.ts`
- Registered by: `apps/bot/src/index.ts`

### Responsibilities

`DiscordModule`:

- Initializes administrator permission grants from `ADMIN_ROLE_IDS`.
- Discovers Discord command classes.
- Registers each command with `DiscordService`.
- Publishes permission and Discord services through the service container.
- Starts and stops the Discord client.
- Logs command discovery, connected application identity, interaction dispatch, execution timing, and failures without logging credentials.

### Dependencies

- `@qbox/core` for `PlatformModule` and its context.
- `@qbox/logger` for structured lifecycle logging.
- `@qbox/shared` for environment values.
- `@qbox/permissions` for role-based permission checks.
- `discord.js` through `DiscordService` and commands.

### Start lifecycle

1. Clear existing grants from the shared permission service.
2. Grant `platform.admin` to each configured administrator role ID.
3. Load command implementations from the command directory.
4. Register the commands in `DiscordService`.
5. Register `permissions` in the shared service container.
6. Register `discord` in the shared service container.
7. Start `DiscordService` and log in.
8. Verify the connected application ID against `DISCORD_APPLICATION_ID`.
9. Log the connected user, application ID, guild count, command count, and administrator-role count.

### Stop lifecycle

The module calls `DiscordService.stop()`, which destroys the Discord client, and then logs that the module stopped.

## Core package

Package: `@qbox/core`

Responsibilities:

- Own the platform lifecycle through `PlatformKernel`.
- Define the runtime module contract.
- Register and order modules through `ModuleLoader`.
- Provide an in-process `EventBus`.
- Provide a named `ServiceContainer`.

Dependency: `@qbox/logger`.

The package has no independent process lifecycle. An application constructs and starts its kernel.

## Discord package

Package: `@qbox/discord`

Responsibilities:

- Implement the Discord runtime module.
- Own the Discord.js client.
- Discover, register, and execute slash commands.
- Apply permission checks before protected commands execute.
- Validate command modules, metadata, aliases, permissions, and handlers before registration.
- Deploy guild or global application commands only through the dedicated deployment workflow.
- Route interactions through `DiscordInteractionHandler`, with acknowledgement and execution timeouts, active-execution tracking, bounded shutdown draining, and state-aware error responses.
- Apply required command policies for guild/DM scope, permission evaluation and administrator override, response acknowledgement and visibility, cooldown, and concurrency.

Dependencies: `@qbox/core`, `@qbox/logger`, `@qbox/permissions`, `@qbox/shared`, and `discord.js`.

Existing commands:

- `PingCommand`: implements `/ping` and replies ephemerally with `Pong.`
- `AdminPingCommand`: implements `/adminping`, requires `platform.admin`, and returns an ephemeral confirmation.

`DiscordCommand` defines chat-input metadata, a required execution policy, and execution through a context that supplies the interaction, abort signal, and policy-aware response helpers. `CommandLoader` deterministically discovers files ending in `.command.ts` or `.command.js` and imports only their named `command` export. `CommandValidator` rejects invalid or conflicting commands and policies before `CommandRegistry` atomically registers the complete set. `CommandRegistry` enforces context, authorization, cooldown, and concurrency policies. `DiscordInteractionHandler` records non-secret interaction context, tracks active work, rejects new work during shutdown, and reports failures through an ephemeral reply or follow-up.

## Logger package

Package: `@qbox/logger`

Responsibility: exports a shared Pino logger configured with `LOG_LEVEL` or `info` and a base service name of `qbox-platform`.

Dependency: `pino`.

It has no explicit lifecycle.

## Permissions package

Package: `@qbox/permissions`

Responsibilities:

- Define the current permission string union.
- Represent permission subjects and role grants.
- Store role-to-permission grants in memory.
- Check one, every, or any requested permission.
- Export a shared `PermissionService` singleton.

It has no external package dependencies and no persistence lifecycle. `DiscordModule.start()` clears and rebuilds its grants.

## Shared package

Package: `@qbox/shared`

Responsibilities:

- Load the repository-root `.env` file with `dotenv`.
- Expose environment values through `env`.
- Export a separate `Configuration` singleton that reads `process.env`.

The package exports `env` and `Configuration`. The `AppConfig` value in `src/config.ts` is not exported from the package entry point.

Environment loading happens as an import-time side effect rather than through an explicit lifecycle method.

## Database package

Package: `@qbox/database`

Current responsibility: exports a `Database` class and singleton with `connect()` and `disconnect()` methods.

Lifecycle behavior is currently limited to console messages. It does not connect to a database, consume `DATABASE_URL`, or depend on Prisma.

The package declares no dependencies.

## Prisma package

Package: `@qbox/prisma`

The entry point currently exports nothing. There is no Prisma client wrapper, schema, generated client, migration, or lifecycle behavior.

The package declares no dependencies of its own.

## OpenAI package

Package: `@qbox/openai`

Current responsibility: exports an `AIService` class and singleton with `initialize()` and `shutdown()` methods.

Both methods currently emit console messages only. The package does not construct an OpenAI client or consume `OPENAI_API_KEY`, and it declares no dependencies.

## Scheduler package

Package: `@qbox/scheduler`

Current responsibility: exports a `Scheduler` class and singleton with `start()` and `stop()` methods.

Both methods currently emit console messages only. The package does not use BullMQ, Redis, or cron scheduling, and it declares no dependencies.

## API application

Package: `@qbox/api`

Current responsibility: executable placeholder that logs its startup.

Dependency: `@qbox/core`.

It does not construct a `PlatformKernel`, register modules, or run an HTTP server.

## Bot application

Package: `@qbox/bot`

Responsibilities:

- Construct the platform kernel.
- Register `DiscordModule`.
- Start the kernel.
- Handle `SIGINT` and `SIGTERM` once.
- Log startup and shutdown failures.

Dependencies: `@qbox/core`, `@qbox/discord`, `@qbox/logger`, and `@qbox/shared`.

This is the only application currently exercising the complete runtime module lifecycle.

## Worker application

Package: `@qbox/worker`

Current responsibility: executable placeholder that logs its startup.

Dependency: `@qbox/core`.

It does not construct a kernel, register modules, connect to Redis, or create a queue worker.
