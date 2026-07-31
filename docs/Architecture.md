# Architecture

## Overview

QboxPlatform is a Node.js and TypeScript monorepo for a modular management platform. The repository currently contains three applications under `apps/`, reusable workspace packages under `packages/`, and an empty `modules/` directory reserved by the pnpm workspace configuration.

The implemented runtime architecture is centered on `@qbox/core`. Its `PlatformKernel` owns three shared facilities:

- `ServiceContainer`, an in-memory registry of named services.
- `EventBus`, an in-process publish/subscribe mechanism.
- `ModuleLoader`, which registers modules and controls their lifecycle.

The Discord bot is currently the only application that uses the complete kernel/module lifecycle. The API and worker are startup placeholders. The database, Prisma, OpenAI, and scheduler packages are also placeholders rather than integrated runtime components.

## Applications, packages, and modules

### Applications

Applications are executable workspace projects:

- `@qbox/bot` constructs a `PlatformKernel`, registers `DiscordModule`, and starts the platform.
- `@qbox/api` currently prints startup information. It does not start a Fastify server.
- `@qbox/worker` currently prints startup information. It does not start a BullMQ worker.

### Packages

Packages provide reusable types and services. Workspace dependencies use the `workspace:*` protocol. For example, the bot depends on the core, Discord, logger, and shared packages, while the Discord package depends on core, logger, permissions, shared, and `discord.js`.

The currently implemented dependency direction is:

```text
@qbox/bot
  -> @qbox/core
  -> @qbox/discord
       -> @qbox/core
       -> @qbox/logger
       -> @qbox/permissions
       -> @qbox/shared
  -> @qbox/logger
  -> @qbox/shared

@qbox/api    -> @qbox/core
@qbox/worker -> @qbox/core
@qbox/core   -> @qbox/logger
```

Other packages exist in the workspace but are not connected to an application lifecycle.

### Runtime modules

A runtime module implements the `PlatformModule` interface. A module has a `name`, a `version`, a required `start(context)` method, and an optional `stop(context)` method.

`DiscordModule` is the only current implementation. The top-level `modules/` workspace directory contains no modules.

## Bot startup flow

The bot follows this sequence:

1. Imports of `@qbox/shared` load the repository-root `.env` file through `dotenv` and expose environment values.
2. The bot creates a `PlatformKernel`.
3. The bot creates and registers a `DiscordModule`.
4. The bot attaches one-time handlers for `SIGINT` and `SIGTERM`.
5. `PlatformKernel.start()` registers the core logger, event bus, and module loader services.
6. The kernel calls `ModuleLoader.startAll()` in module registration order.
7. `DiscordModule.start()` clears and configures permission grants from `ADMIN_ROLE_IDS`.
8. `CommandLoader` scans for `.command.ts` or `.command.js` files in deterministic filename order and imports each module's named `command` export.
9. `CommandValidator` validates all discovered commands before registration. Any validation failure aborts registration.
10. `CommandRegistry.registerAll()` registers the validated command set atomically, including aliases.
11. The permission and Discord services are registered.
12. `DiscordService` installs its interaction listener and logs in with `DISCORD_TOKEN`.
13. After all modules start, the kernel emits `platform.started` and logs the module count.

If startup throws, the bot logs a fatal error and sets `process.exitCode` to `1`.

Normal bot startup does not deploy or replace Discord application commands. Command deployment is an explicit workflow. Guild-scoped development deployment uses `pnpm --filter @qbox/bot deploy:commands:guild` with `DISCORD_GUILD_ID`; global deployment uses a compiled bot build and `pnpm --filter @qbox/bot deploy:commands:global`.

## Shutdown flow

On `SIGINT` or `SIGTERM`, the bot calls `PlatformKernel.stop()` once:

1. The kernel emits `platform.stopping`.
2. `ModuleLoader.stopAll()` stops registered modules in reverse registration order.
3. `DiscordModule.stop()` destroys the Discord client.
4. The kernel logs that the platform stopped.

The bot records shutdown failure and sets a nonzero exit code if an exception is thrown.

## Dependency injection

Dependency injection is implemented through explicit constructors and the `ServiceContainer`.

Constructor injection is used inside the Discord integration: `DiscordModule` passes the singleton `PermissionService` to `DiscordService`, which passes it to `CommandRegistry`. This makes permission checks available during command execution.

The module context provides shared runtime dependencies:

```ts
interface PlatformModuleContext {
  services: ServiceContainer;
  events: EventBus;
}
```

The service container stores values by string name. `register<T>(name, service)` adds or replaces a value, and `get<T>(name)` returns it using a caller-supplied type. The container does not perform runtime type checking.

## Service registration

The kernel registers these services before starting modules:

| Service name | Registered value |
| --- | --- |
| `logger` | Shared Pino logger |
| `events` | Kernel `EventBus` instance |
| `modules` | Kernel `ModuleLoader` instance |

`DiscordModule` then registers:

| Service name | Registered value |
| --- | --- |
| `permissions` | Shared `PermissionService` singleton |
| `discord` | Module-owned `DiscordService` instance |

Services are registered imperatively during startup. There is no automatic dependency discovery, scope management, or disposal in the container.

## Events

`EventBus` stores handlers by string event name. Handlers may be synchronous or asynchronous. Emitting an event invokes the current handlers concurrently through `Promise.all`.

The kernel currently emits:

- `platform.started`, with a `startedAt` date.
- `platform.stopping`, with a `stoppedAt` date.

No other event publishers or subscribers currently exist.
