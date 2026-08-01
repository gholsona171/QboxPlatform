# Architecture

## Overview

QboxPlatform is a Node.js and TypeScript monorepo for a modular management platform. The repository currently contains three applications under `apps/`, reusable workspace packages under `packages/`, and an empty `modules/` directory reserved by the pnpm workspace configuration.

The implemented runtime architecture is centered on `@qbox/core`. Its `PlatformKernel` owns three shared facilities:

- `ServiceContainer`, an in-memory registry of named services.
- `EventBus`, an in-process publish/subscribe mechanism.
- `ModuleLoader`, which registers modules and controls their lifecycle.

The Discord bot and API both use the kernel/module lifecycle. Each composes PostgreSQL permission persistence before its transport starts. The API binds Fastify only after the database starts and the compiled permission catalog synchronizes. The worker remains a startup placeholder; OpenAI and scheduler remain unintegrated.

## Applications, packages, and modules

### Applications

Applications are executable workspace projects:

- `@qbox/bot` constructs a `PlatformKernel`, registers `DiscordModule`, and starts the platform.
- `@qbox/api` exports a validated, unbound Fastify server for tests and an explicit process composition root for operation. Its persistence module starts the database and synchronizes permissions before its HTTP module binds; reverse module shutdown closes HTTP before persistence.
- `@qbox/worker` currently prints startup information. It does not start a BullMQ worker.

### Packages

Packages provide reusable types and services. Workspace dependencies use the `workspace:*` protocol. For example, the bot depends on the core, Discord, logger, and shared packages, while the Discord package depends on core, logger, permissions, shared, and `discord.js`.

The currently implemented dependency direction is:

```text
@qbox/bot
  -> @qbox/core
  -> @qbox/database
       -> @qbox/permissions
       -> @qbox/prisma
  -> @qbox/discord
       -> @qbox/core
       -> @qbox/logger
       -> @qbox/permissions
       -> @qbox/shared
  -> @qbox/logger
  -> @qbox/shared

@qbox/api
  -> @qbox/core
  -> @qbox/database
  -> @qbox/logger
  -> @qbox/permissions
  -> @qbox/shared
@qbox/worker -> @qbox/core
@qbox/core   -> @qbox/logger
```

Other packages exist in the workspace but are not connected to an application lifecycle.

### Runtime modules

A runtime module implements the `PlatformModule` interface. A module has a `name`, a `version`, a required `start(context)` method, and an optional `stop(context)` method.

The bot registers permission persistence and `DiscordModule`. The API registers permission persistence and `ApiModule`; registration order establishes persistence-first startup and reverse-order HTTP-first shutdown. The top-level `modules/` workspace directory contains no domain modules.

### API transport boundary

`createApiServer()` applies body/header limits, strict host and proxy policy, bodyless health semantics, JSON-only write-route content policy, normalized Problem Details, safe response headers, cooperative deadlines, and request cancellation. Route/application adapters use reusable strict Zod schemas and `parseRouteInput()` rather than Fastify JSON Schema or direct untyped input access. CORS and rate limiting remain explicitly disabled policy boundaries.

## Bot startup flow

The bot follows this sequence:

1. Imports of `@qbox/shared` load the repository-root `.env` file through `dotenv` and expose environment values.
2. The bot creates a `PlatformKernel`.
3. The bot creates the database configuration, repository composition, and repository-backed permission authorizer.
4. The bot registers the permission persistence module before `DiscordModule`.
5. The bot attaches one-time handlers for `SIGINT` and `SIGTERM`.
6. `PlatformKernel.start()` registers the core logger, event bus, and module loader services.
7. The kernel calls `ModuleLoader.startAll()` in module registration order.
8. Permission persistence connects, checks readiness, synchronizes the compiled catalog, and registers the repository services.
9. The bot overlays guild-bound `ADMIN_ROLE_IDS` compatibility assignments without persisting them.
10. `CommandLoader` scans for `.command.ts` or `.command.js` files in deterministic filename order and imports each module's named `command` export.
11. `CommandValidator` validates all discovered commands before registration. Any validation failure aborts registration.
12. `CommandRegistry.registerAll()` registers the validated command set atomically, including aliases.
13. The permission and Discord services are registered.
14. `DiscordService` installs its interaction listener and logs in with `DISCORD_TOKEN`.
15. Startup verifies that the connected application matches `DISCORD_APPLICATION_ID` and logs the non-secret bot identity and connected guild count.
16. After all modules start, the kernel emits `platform.started` and logs the module count.

If startup throws, the bot logs a fatal error and sets `process.exitCode` to `1`.

Normal bot startup does not deploy or replace Discord application commands. Command deployment is an explicit workflow. The deployment process normalizes and compares current Discord definitions with validated local definitions, then reports additions, updates, removals, and unchanged commands. Dry-run workflows do not mutate Discord. Real deployments apply the full desired set and refetch it for verification. Global replacement requires `--confirm-global`, plus `--confirm-global-removals` when the computed plan removes commands.

`DiscordInteractionHandler` receives Discord interactions, ignores unsupported types, resolves chat-input commands through `CommandRegistry`, enforces acknowledgement and execution timeouts, and applies each command's immediate/deferred and public/ephemeral response policy. `CommandRegistry` applies explicit guild/DM scope, all/any permission evaluation, administrator override, cooldown, and concurrency policies before invoking a command.

Command definitions continue to use Discord.js `SlashCommandBuilder`. At execution time, `CommandOptionReader` adds required/optional typed accessors over Discord.js's resolver, while `CommandRoute` exposes the selected root, subcommand, or grouped-subcommand route. Invalid input raises `CommandInputError`, which receives a safe ephemeral response and is logged as an expected rejection rather than an internal failure.

## Shutdown flow

On `SIGINT` or `SIGTERM`, the bot calls `PlatformKernel.stop()` once:

1. The kernel emits `platform.stopping`.
2. `ModuleLoader.stopAll()` stops registered modules in reverse registration order.
3. `DiscordModule.stop()` rejects new command executions, waits up to `DISCORD_COMMAND_SHUTDOWN_TIMEOUT_MS` for active commands, aborts their cooperative cancellation signals if the deadline expires, and destroys the Discord client.
4. The permission persistence module clears the process cache and disconnects PostgreSQL.
5. The kernel logs that the platform stopped.

The bot records shutdown failure and sets a nonzero exit code if an exception is thrown.

## Dependency injection

Dependency injection is implemented through explicit constructors and the `ServiceContainer`.

Constructor injection is used inside the Discord integration: `DiscordModule` receives a `PermissionAuthorizer`, passes it to `DiscordService`, and then to `CommandRegistry`. The authorizer is registered in the service container only after Discord startup succeeds.

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

| Service name | Registered value               |
| ------------ | ------------------------------ |
| `logger`     | Shared Pino logger             |
| `events`     | Kernel `EventBus` instance     |
| `modules`    | Kernel `ModuleLoader` instance |

`DiscordModule` then registers:

| Service name  | Registered value                             |
| ------------- | -------------------------------------------- |
| `permissions` | Injected asynchronous `PermissionAuthorizer` |
| `discord`     | Module-owned `DiscordService` instance       |

Services are registered imperatively during startup. There is no automatic dependency discovery, scope management, or disposal in the container.

## Events

`EventBus` stores handlers by string event name. Handlers may be synchronous or asynchronous. Emitting an event invokes the current handlers concurrently through `Promise.all`.

The kernel currently emits:

- `platform.started`, with a `startedAt` date.
- `platform.stopping`, with a `stoppedAt` date.

No other event publishers or subscribers currently exist.
