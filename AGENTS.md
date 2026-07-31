# Project Purpose

QboxPlatform is a modular, AI-powered management platform for Discord and Qbox/FiveM communities. The repository is currently in its foundation phase. It contains a shared platform kernel, a working Discord integration, and placeholder boundaries for planned API, worker, database, scheduling, OpenAI, and FiveM capabilities.

Agents must distinguish between behavior that exists today and functionality that is only planned. Do not present placeholder code or roadmap goals as completed features.

# Repository Architecture

## `apps/`

Contains executable applications. Applications compose reusable packages and own process-level startup and shutdown behavior.

Current applications include the Discord bot, an API placeholder, and a worker placeholder.

## `packages/`

Contains reusable pnpm workspace libraries and platform services. Shared infrastructure, contracts, configuration, logging, permissions, and integration adapters belong here when they are useful across applications or modules.

The core package supplies the platform kernel, event bus, service container, and runtime module lifecycle.

## `modules/`

Reserved for independently organized workspace modules. It is included in the pnpm workspace configuration but currently contains no implementation.

Do not confuse this directory with `packages/core/src/modules/`, which contains the existing runtime module contract and loader.

## `docs/`

Contains documentation describing the repository's current architecture, structure, development workflow, modules, and coding standards. Documentation must remain synchronized with implemented behavior.

## `prisma/`

Reserved for Prisma-related project assets. It is currently empty: no schema, migration, or seed workflow exists. There is also a separate placeholder `packages/prisma/` workspace. Do not infer responsibilities that have not yet been implemented or documented.

# Development Principles

Prioritize:

- Modularity.
- Readability.
- Maintainability.
- Explicit naming.
- Dependency injection.
- Loose coupling.
- Strong typing.
- Minimal duplication.
- Security.
- Performance.

Keep responsibilities and dependency boundaries clear. Prefer code that is straightforward to inspect, test, and replace over implicit behavior or unnecessary abstraction.

# Coding Standards

- Use TypeScript first.
- Preserve strict typing.
- Avoid `any`. Prefer specific types, generics, `unknown`, and narrowing.
- Keep classes small and focused on one responsibility.
- Prefer constructor injection for required dependencies.
- Prefer composition over inheritance.
- Use descriptive, structured logging with useful operational context.
- Do not leave dead code.
- Do not leave commented-out code.
- Follow the repository's native ESM conventions, including `.js` extensions in relative TypeScript imports where required by NodeNext resolution.
- Declare direct dependencies in the workspace that consumes them.
- Maintain existing package boundaries unless an approved change requires otherwise.

# Documentation Standards

- Document every public package, service, runtime module, and command.
- Record architecture decisions when they are made.
- Keep generated and hand-written documentation consistent with the source.
- Documentation must reflect current reality rather than intended future features.
- Clearly label placeholders, incomplete integrations, and known limitations.
- Update relevant documentation when behavior, commands, dependencies, configuration, or architecture changes.

# Git Workflow

- Never commit directly to `main`.
- Always work from a feature, fix, chore, or other task-specific branch.
- Never rewrite Git history unless explicitly instructed.
- Review `git status` and the relevant diff before committing.
- Keep commits scoped to the approved task.
- Do not discard or overwrite unrelated user changes.

# Safety Rules

- Never edit `.env` files.
- Never expose secrets in output, logs, documentation, commits, or tests.
- Never delete files without approval.
- Never change database schemas without approval.
- Never change package names without approval.
- Never install dependencies without approval.
- Never modify generated files unless explicitly instructed.
- Treat local credentials and environment values as sensitive even when they appear to be development-only.
- Confirm the exact target before performing destructive or difficult-to-reverse operations.

# Development Workflow

Before implementing any feature:

1. Inspect the existing architecture and relevant project instructions.
2. Search for existing implementations, abstractions, and conventions.
3. Propose a concise implementation and validation plan.
4. Wait for approval before implementation.
5. Implement only the approved scope.
6. Validate the change in proportion to its risk.
7. Summarize the changes, validation results, and any remaining limitations.

Do not use implementation work to redesign unrelated areas of the project.

# FiveM and Discord Philosophy

This repository is intended to contain both Discord and Qbox/FiveM systems.

- Design reusable shared packages when functionality genuinely applies to more than one system.
- Avoid tightly coupling Discord logic to FiveM logic.
- Keep integration-specific behavior inside the relevant adapter or module.
- Place shared contracts and functionality in `packages/`.
- Do not introduce FiveM behavior into Discord components, or Discord behavior into FiveM components, solely in anticipation of future requirements.

# AI Expectations

- Act as a senior software engineer.
- Prefer improving the existing architecture over introducing new frameworks.
- Keep changes as small as possible while fully satisfying the approved task.
- Inspect and understand affected code before editing it.
- Preserve established conventions unless a change is explicitly approved.
- State uncertainty and ask rather than making consequential assumptions.
- Separate observed facts from recommendations and future possibilities.
- Do not claim validation that was not performed.
