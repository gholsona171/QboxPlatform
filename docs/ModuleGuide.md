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

- Receives the asynchronous permission authorizer through constructor injection.
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

1. Process composition creates the in-memory permission runtime and guild-bound compatibility assignments.
2. Load command implementations from the command directory.
3. Register the commands in `DiscordService`.
4. Start `DiscordService` and log in.
5. Verify the connected application ID against `DISCORD_APPLICATION_ID`.
6. Register the authoritative `permissions` authorizer and `discord` service only after startup succeeds.
7. Log the connected identity, command count, and non-secret compatibility diagnostics.

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
- Fetch and normalize current Discord definitions, preview deployment differences, guard global removals, and verify resulting definitions after replacement.
- Route interactions through `DiscordInteractionHandler`, with acknowledgement and execution timeouts, active-execution tracking, bounded shutdown draining, and state-aware error responses.
- Apply required command policies for guild/DM scope, permission evaluation and administrator override, response acknowledgement and visibility, cooldown, and concurrency.

Dependencies: `@qbox/core`, `@qbox/logger`, `@qbox/permissions`, `@qbox/shared`, and `discord.js`.

Existing commands:

- `PingCommand`: implements `/ping` and replies ephemerally with `Pong.`
- `AdminPingCommand`: implements `/adminping`, requires `platform.admin`, and returns an ephemeral confirmation.

`DiscordCommand` defines chat-input metadata, a required execution policy, and execution through a context that supplies the interaction, abort signal, and policy-aware response helpers. `CommandLoader` deterministically discovers files ending in `.command.ts` or `.command.js` and imports only their named `command` export. `CommandValidator` rejects invalid or conflicting commands and policies before `CommandRegistry` atomically registers the complete set. `CommandRegistry` enforces context, authorization, cooldown, and concurrency policies. `DiscordInteractionHandler` records non-secret interaction context, tracks active work, rejects new work during shutdown, and reports failures through an ephemeral reply or follow-up.

### Command authoring

The complete policy, input, routing, testing, and live-verification guidance is in `docs/CommandAuthoring.md`; operating procedures are in `docs/DiscordCommandOperations.md`.

### Command authoring example

Discord.js builders remain the command-definition API. Required options precede optional options inside each subcommand. Execution uses the typed option reader and route dispatcher:

```ts
import { SlashCommandBuilder } from "discord.js";
import type { CommandExecutionContext, DiscordCommand } from "@qbox/discord";

export class ExampleCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;

  public readonly data = new SlashCommandBuilder()
    .setName("example")
    .setDescription("Demonstrates typed command input.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Creates an example.")
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Why the example is needed.")
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("duration")
            .setDescription("Optional duration in minutes."),
        ),
    );

  public readonly policy = {
    contexts: "guild",
    response: {
      acknowledgement: "immediate",
      visibility: "ephemeral",
    },
    concurrency: "user",
  } as const;

  public async execute(context: CommandExecutionContext): Promise<void> {
    await context.route.dispatch({
      create: async () => {
        const reason = context.options.requiredString("reason");
        const duration = context.options.optionalInteger("duration");

        await context.reply({
          content: duration ? `${reason} (${duration} minutes)` : reason,
        });
      },
    });
  }
}
```

`CommandOptionReader` supports string, integer, number, boolean, user, role, channel, mentionable, and attachment options with required and optional accessors. Optional accessors return `undefined`. `CommandRoute` uses `root`, `subcommand`, or `group/subcommand` keys. Missing inputs and unsupported routes throw `CommandInputError`; the interaction handler returns its safe message ephemerally without exposing internal details.

## Logger package

Package: `@qbox/logger`

Responsibility: exports a shared Pino logger configured with `LOG_LEVEL` or `info` and a base service name of `qbox-platform`.

Dependency: `pino`.

It has no explicit lifecycle.

## Permissions package

Package: `@qbox/permissions`

Responsibilities:

- Define and version the authoritative compiled permission catalog.
- Validate lowercase dot-separated identifiers and reject unknown persisted catalog keys.
- Model Discord user/role principals, platform/guild scopes, exact grants, denies, expiration, mutations, and structured audit reasons without integration dependencies.
- Define asynchronous repository and cache ports plus deterministic owner/admin/deny/all/any authorization semantics.
- Provide process-local in-memory adapters for domain testing.
- Preserve the deprecated synchronous role-grant `PermissionService` only for legacy package compatibility tests; Discord uses `PermissionAuthorizer`.

It has no external package dependencies and no persistence lifecycle. `@qbox/database` implements its repository ports; no Redis adapter exists. The bot supplies the repository-backed authorizer and environment compatibility overlay to Discord without resetting global singleton state. See `docs/PermissionDomain.md` and `docs/PersistentPermissionRepository.md`.

## Authentication package

Package: `@qbox/authentication`

Responsibilities:

- Define canonical branded platform, identity, session, OAuth, membership, audit, and Discord identifiers.
- Model immutable verified actors without credentials, profile display data, or computed permissions.
- Enforce pure platform-account, identity-ownership, browser-session, OAuth transaction, encrypted credential, membership, and audit invariants.
- Define persistence repositories, a transaction boundary, time and cryptography ports, a key-provider port, a Discord OAuth provider port, a guild-membership verifier port, and owner-access protection without selecting an adapter.
- Provide transport-independent browser-session, OAuth-transaction, encrypted OAuth-credential, Discord guild-membership verification, and keyed metadata-hashing application services. These services issue raw values only as ephemeral post-commit results, persist digests/ciphertext only, call providers outside database transactions, and require same-transaction audit writes.

The package has no runtime dependencies and does not import Prisma, Fastify, Discord.js, database infrastructure, Redis, or HTTP transports. `@qbox/database` now implements its persistence, transaction, key-ring, native-crypto, ID-generation, and owner-access ports. `@qbox/api` owns an import-safe native-fetch Discord OAuth provider adapter and strict provider configuration, but authentication is still not composed into the running API or bot: no login endpoint exists, no callback route exists, no cookie is issued, no browser credential can be created over HTTP, and no verified actor is attached to an HTTP request. `@qbox/permissions` remains the sole permission-evaluation domain. See `docs/AuthenticationArchitectureReview.md`.

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

Current responsibility: owns the authoritative typed PostgreSQL configuration value object, lifecycle coordination, health/readiness contracts, Prisma-backed permission and authentication repositories, advisory-locked permission and authentication owner protection, dry-run-first permission bootstrap/migration workflows, authentication transaction boundaries, native Node authentication cryptography/key-ring infrastructure, and in-memory permission cache invalidation adapter.

`DatabaseService` uses an injected `ClientFactory`, reports `LIVE`, `READY`, or `DEGRADED`, rejects readiness until its client starts, and attempts cleanup after startup failure. `PrismaPermissionPersistenceClient` owns one injected Prisma client and repository collection for the process lifecycle.

`@qbox/database` is the application-facing infrastructure boundary. `@qbox/prisma` owns the Prisma 7 CLI/runtime dependencies, root schema and migration tooling, committed ESM generated client, and disconnected PostgreSQL client factory. Repository adapters and the readiness probe remain in `@qbox/database`. See `docs/DatabaseDecisionRecord.md`, `docs/DatabaseFoundationArchitectureReview.md`, `docs/PersistentPermissionRepository.md`, and `docs/PermissionAdministration.md`.

The canonical schema is `prisma/schema.prisma`. It contains the PostgreSQL datasource, `prisma-client` generator, persistent-permission models, additive authentication-foundation models, and an additive OAuth PKCE mode column/constraint for transaction-specific PKCE decisions. Authentication adapters can be bound to the exact lifecycle-owned Prisma client through `PrismaAuthenticationPersistence`, but no application composes a usable authentication flow yet. Applications import `@qbox/prisma` only through infrastructure composition; commands, domain packages, and API handlers never import generated paths or Prisma directly. Connection startup and shutdown remain owned by `@qbox/database`.

The package depends on `@qbox/authentication`, `@qbox/permissions`, and `@qbox/prisma` through workspace boundaries.

## Prisma package

Package: `@qbox/prisma`

The entry point exports the generated Prisma client and disconnected `PrismaClientFactory`. Migration history remains under root `prisma/migrations`; lifecycle behavior remains outside this package.

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

Current responsibility: testable HTTP transport plus an explicit, persistence-backed process lifecycle. Importing the package has no environment, database, signal, or socket side effects.

Dependencies: `@qbox/core`, `@qbox/database`, `@qbox/logger`, `@qbox/permissions`, `@qbox/shared`, Fastify, and Zod.

It exports an unbound Fastify server factory, immutable API configuration, reusable Zod transport schemas, one typed route-input parser, strict host/content/header policy, cooperative request cancellation, lifecycle health aggregation, typed Problem Details errors, safe logging hooks, and metrics/rate-limit boundaries. `createApiApplication()` composes `PlatformKernel`, the database-backed permission infrastructure, catalog synchronization, and `ApiModule`. The executable `run.ts` loads environment input and installs idempotent signal handling. CORS and rate limiting remain disabled; the package does not authenticate users or expose domain routes.

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
