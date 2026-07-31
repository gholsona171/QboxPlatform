# Coding Standards

## Scope

This document records conventions visible in the current repository. The project does not yet include a formal style guide, ESLint configuration, Prettier configuration, or enforced formatting script. Where files differ, this document describes the predominant convention and notes the inconsistency.

## Language and module system

- Source code is TypeScript.
- Workspace packages use native ECMAScript modules through `"type": "module"`.
- TypeScript uses `module: "nodenext"` and `verbatimModuleSyntax`.
- Relative imports include the emitted `.js` extension, for example `./DiscordService.js`.
- Type-only dependencies use `import type`.
- The shared compiler configuration enables strict type checking, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`.
- Public asynchronous methods generally declare `Promise<void>` explicitly.

## Naming conventions

Observed conventions include:

| Element | Convention | Examples |
| --- | --- | --- |
| Classes | PascalCase | `PlatformKernel`, `DiscordService` |
| Interfaces | PascalCase without an `I` prefix | `PlatformModule`, `DiscordCommand` |
| Type aliases | PascalCase | `Permission`, `EventHandler` |
| Methods and variables | camelCase | `registerModule`, `commandData` |
| Constants | UPPER_SNAKE_CASE for environment fields | `DISCORD_TOKEN`, `ADMIN_ROLE_IDS` |
| Exported singleton instances | camelCase | `logger`, `permissions`, `database` |
| Private fields | camelCase with the `private` modifier | `discordService`, `commandLoader` |
| Workspace packages | `@qbox/<name>` | `@qbox/core`, `@qbox/discord` |
| Source files containing a main class/interface | PascalCase | `ModuleLoader.ts`, `Permission.ts` |
| Package entry points | `index.ts` | `packages/core/src/index.ts` |

Discord command implementation filenames end in `Command.ts`. The runtime loader depends on this suffix and excludes `DiscordCommand.ts`, which contains the interface.

## File organization

- Executable application startup belongs in `apps/<application>/src/index.ts`.
- Reusable code belongs in `packages/<package>/src/`.
- Package public APIs are re-exported from `src/index.ts` where implemented.
- Related implementations may be grouped into descriptive subdirectories such as `commands/`, `loaders/`, `events/`, `kernel/`, `modules/`, `models/`, and `services/`.
- Each workspace owns its `package.json` and `tsconfig.json`.
- Workspace TypeScript configurations extend the root `tsconfig.json`.
- Compiled output belongs in `dist/` and is ignored by Git.

There are currently duplicate or unused organization paths, including two core kernel files and multiple shared configuration implementations. These are existing exceptions rather than conventions to copy.

## Imports and exports

- Imports from other workspaces use the `@qbox/*` package name.
- Relative imports are used within a package.
- Type imports are separated with `import type` where the imported name is only used by the type system.
- Package entry points use named exports; the codebase does not currently use default exports for its own classes or services.
- Barrel files use `export *` for public package members.

## Classes and visibility

The predominant class style uses explicit visibility modifiers:

- `public` for exposed constructors, methods, and properties.
- `private` for internal state.
- `readonly` for dependencies or collections whose references are not reassigned.

Interfaces use `readonly` for stable metadata and command definitions. Some placeholder classes omit explicit visibility and return types; this is an existing inconsistency.

## Formatting

The predominant formatting visible in the implemented core and Discord code is:

- Two-space indentation.
- Double-quoted strings.
- Semicolons.
- Trailing commas are generally not used on the final property in an object.
- Multiline function arguments and imports are used when expressions become long.
- Blank lines separate logical sections.

Some files, notably `ServiceContainer.ts` and `Configuration.ts`, use four-space indentation. Since no formatter configuration exists, formatting is not currently enforced automatically.

## Logging patterns

Implemented application and module code uses the shared Pino `logger` from `@qbox/logger`.

The observed pattern puts structured context first and the message second:

```ts
logger.info(
  {
    moduleCount: this.modules.list().length
  },
  "Qbox Platform started."
);
```

Errors are logged with an `err` property and, in application startup/shutdown handling, an explicit stack when the value is an `Error`:

```ts
logger.error(
  {
    err: error,
    stack: error instanceof Error ? error.stack : undefined
  },
  "Platform shutdown failed."
);
```

Severity usage currently includes:

- `info` for normal startup, shutdown, and registration events.
- `error` for recoverable command and shutdown failures.
- `fatal` for application startup failure.

The API, worker, placeholder packages, simple legacy kernel, and bot error handlers also use `console.log` or `console.error`. Structured logging is therefore the pattern in the implemented runtime path, but it is not applied consistently across all files.

## Error handling

Observed error-handling patterns include:

- Throwing `Error` for missing required runtime state, duplicate registrations, and failed command discovery.
- Catching errors at application or external-event boundaries.
- Logging structured error context before setting a nonzero process exit code.
- Returning generic Discord error messages rather than exposing internal error details.
- Checking whether an interaction was already replied to or deferred before choosing `reply()` or `followUp()`.
- Guarding shutdown with a boolean so repeated signals do not run shutdown concurrently.

The code generally allows lower-level errors to propagate to the application boundary. There are no custom error classes or result types.

## Asynchronous code

- Asynchronous lifecycle and command methods use `async`/`await`.
- Intentionally unawaited application startup and signal-handler promises use the `void` operator.
- Modules start sequentially in registration order and stop sequentially in reverse order.
- Event handlers run concurrently through `Promise.all`.

## Dependency and configuration conventions

- Internal workspace dependencies use `workspace:*`.
- Runtime configuration is read from environment variables.
- The shared `env` object normalizes `ADMIN_ROLE_IDS` into a trimmed, non-empty string array.
- The implemented Discord integration checks for a missing Discord token before login.

The repository currently has more than one configuration abstraction. Code should be read carefully to determine whether it uses `env`, `Configuration`, `AppConfig`, or direct `process.env` access; no single convention is yet enforced.

## Testing and automated enforcement

No tests currently exist. Vitest, ESLint, and Prettier are installed at the root, but none has project configuration or a working repository-wide script. These tools therefore do not currently enforce the inferred standards described above.
