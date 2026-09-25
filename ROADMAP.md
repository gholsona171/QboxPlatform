# QboxPlatform Roadmap

## Status and estimation notes

QboxPlatform has an implemented TypeScript monorepo, platform kernel, persistent PostgreSQL permission system, complete Discord command platform, hardened Fastify API foundation, and a browser-accessible authentication proof of concept. The proof of concept includes Discord OAuth login, first-login platform account creation, encrypted OAuth credential persistence, guild membership verification, opaque session cookies, authenticated request actor binding, `/api/v1/me`, `/api/v1/admin-check`, logout, and a framework-free portal served by the Qbox API and previewed on GitHub Pages. Worker, scheduler, OpenAI, FiveM/Qbox, and feature-module areas remain placeholders or empty directories.

This roadmap separates existing functionality from planned work. A listed milestone does not indicate that its work is already implemented.

Effort estimates are planning ranges for one engineer familiar with the repository. They exclude product discovery, external approval delays, Discord/FiveM environment provisioning, deployment review, and ongoing maintenance. Complexity is relative to this repository:

- **Low:** localized work with few dependencies.
- **Medium:** changes spanning multiple packages or requiring integration tests.
- **High:** new operational infrastructure, persistence, security boundaries, or external-system coordination.

# Phase 1 — Foundation

## Existing functionality

- pnpm workspace structure for `apps/*`, `packages/*`, and `modules/*`.
- Shared strict TypeScript configuration using NodeNext ESM.
- `PlatformKernel`, `ModuleLoader`, `EventBus`, and `ServiceContainer`.
- Shared Pino logger.
- Root development, build, typecheck, test, and clean command definitions.
- Typecheck and clean scripts across all TypeScript workspaces.
- Focused Vitest coverage for permission behavior and Discord command permission enforcement.
- Architecture and engineering documentation.

## Milestone 1.1 — Restore a reliable workspace baseline

- **Goal:** Complete the remaining workspace baseline work by choosing pnpm as the single lockfile owner and ensuring direct dependencies are declared by consuming workspaces.
- **Why it matters:** Type checking, focused tests, and cleaning now have working root workflows, but two package-manager lockfiles remain tracked and some packages rely on dependencies declared only at the repository root.
- **Dependencies:** Existing manifests, TypeScript configurations, and pnpm workspace configuration.
- **Estimated complexity:** Medium.
- **Estimated effort:** 2–4 engineer days.
- **Risks:** Script normalization may expose additional compile failures; lockfile cleanup may change dependency resolution; package-local dependency corrections may reveal reliance on root hoisting.

## Milestone 1.2 — Establish automated quality checks

- **Goal:** Configure and run formatting, linting, full-workspace type checking, unit tests, and builds in continuous integration.
- **Why it matters:** Focused Vitest tests now exist, but ESLint and Prettier remain unconfigured and `.github/` is empty. Automated checks are necessary to prevent regressions as more modules are added.
- **Dependencies:** Milestone 1.1 and decisions on formatting and lint rules consistent with existing TypeScript conventions.
- **Estimated complexity:** Medium.
- **Estimated effort:** 3–5 engineer days.
- **Risks:** Applying formatting repository-wide could create a large initial diff; strict lint rules may surface substantial cleanup work; CI behavior may differ from local pnpm resolution.

## Milestone 1.3 — Harden kernel lifecycle and shared contracts

- **Goal:** Add lifecycle state, startup rollback, duplicate-service safeguards, typed service keys, and typed event-to-payload contracts. Add focused tests for the kernel, module loader, service container, and event bus.
- **Why it matters:** The current kernel is the shared runtime foundation. Startup does not roll back already-started modules, services use unchecked string keys, and event payload types are not tied to event names.
- **Dependencies:** Milestones 1.1 and 1.2; agreement on public core contracts because applications and modules depend on them.
- **Estimated complexity:** Medium.
- **Estimated effort:** 4–7 engineer days.
- **Risks:** Public contract changes can affect every consuming workspace; over-generalizing the kernel before additional integrations exist could add unnecessary abstraction.

## Milestone 1.4 — Consolidate configuration and operational logging

- **Goal:** Replace duplicated environment abstractions with one validated configuration path, define required and optional settings, remove unused environment bootstrap code, and configure consistent structured logging and sensitive-field redaction.
- **Why it matters:** Environment loading currently exists in multiple forms, the shared loader requires a repository-relative `.env`, and most missing values become empty strings. Consistent validation and redaction are prerequisites for safe deployment.
- **Dependencies:** Stable workspace baseline and agreement on application-specific versus shared configuration ownership.
- **Estimated complexity:** Medium.
- **Estimated effort:** 3–5 engineer days.
- **Risks:** Import-time environment loading affects startup order and tests; changing `.env` path assumptions may alter local execution; overly strict shared validation could require variables for applications that do not use them.

# Phase 2 — Discord Bot

## Existing functionality

- Discord.js client managed by `DiscordService`.
- `DiscordModule` integrated with the platform kernel.
- Dynamic command discovery and a command registry.
- Global slash-command registration on client readiness.
- `/ping` and permission-protected `/adminping` commands.
- In-memory administrator grants based on `ADMIN_ROLE_IDS`.
- Graceful handling of `SIGINT` and `SIGTERM` in the bot process.
- Focused tests for command permission enforcement and permission-service behavior.
- Deterministic command discovery with explicit exports and validation before atomic registration.
- Dedicated guild-scoped and global command deployment workflows separated from bot startup.

## Milestone 2.1 — Stabilize command loading and deployment (implemented)

- **Goal:** Maintain deterministic command discovery, validation, diagnostics, and explicit guild/global deployment workflows.
- **Why it matters:** Command loading now uses a single named export contract, rejects the complete batch on validation failure, and no longer mutates global Discord commands during normal startup.
- **Dependencies:** Phase 1 lifecycle, validation, test, and configuration foundations.
- **Estimated complexity:** Medium.
- **Estimated effort:** 3–5 engineer days.
- **Risks:** Discord global command propagation remains external and asynchronous; deployment requires valid live Discord credentials and has not been exercised by automated tests.

## Milestone 2.2 — Strengthen Discord authorization

- **Goal:** Make permission evaluation guild-aware, avoid unchecked member casts, define ownership and administrator behavior, and add tests for allowed, denied, and non-guild interactions.
- **Why it matters:** Current grants are global role-ID mappings held in memory. The command registry assumes an interaction member is a cached `GuildMember`, and `PermissionSubject.userId` is not used.
- **Dependencies:** Phase 1 typed contracts and configuration; eventual persistence work if grants must survive configuration changes.
- **Estimated complexity:** Medium.
- **Estimated effort:** 4–7 engineer days for a configuration-backed model; more if persistence is included.
- **Risks:** Discord role identifiers are guild-specific; partial member data can vary by interaction context; premature persistence choices could conflict with Phase 5.

## Milestone 2.3 — Reduce privileges and improve resilience

- **Goal:** Confirm and request only necessary gateway intents, handle Discord readiness and registration failures explicitly, add graceful shutdown timeouts, and define retry/backoff behavior where appropriate.
- **Why it matters:** The current client requests privileged member and message-content intents even though the implemented commands are slash commands. External failures can currently abort module startup without recovery.
- **Dependencies:** Stable bot tests, command deployment decisions, and documented operational requirements.
- **Estimated complexity:** Medium.
- **Estimated effort:** 3–5 engineer days.
- **Risks:** Removing intents may affect future features if requirements are not recorded; retries can amplify outages or rate limits if configured incorrectly.

## Milestone 2.4 — Add first production command modules

- **Goal:** Implement approved Discord functionality inside the existing modular boundaries, with command documentation, permission requirements, tests, and structured logs for each feature.
- **Why it matters:** The current bot proves connectivity and authorization only; it does not implement the repository's listed management features.
- **Dependencies:** Milestones 2.1–2.3 and an approved product specification for each command or module. Features requiring storage also depend on Phase 5.
- **Estimated complexity:** Medium to high per feature.
- **Estimated effort:** To be estimated per approved feature; typically 3–10 engineer days for a bounded command set.
- **Risks:** The empty `modules/*` directories do not define contracts yet; implementing features before persistence and tenancy decisions may cause rework.

# Phase 3 — Shared Packages

## Existing functionality

- Core lifecycle and service infrastructure.
- Shared structured logger.
- Shared environment loading and configuration objects.
- In-memory permission types and service.
- Placeholder database, Prisma, scheduler, and OpenAI packages.

## Milestone 3.1 — Define package ownership and public APIs

- **Goal:** Document and enforce the responsibility, supported exports, and dependency direction of every package. Remove duplicate or unused public concepts only after confirming consumers.
- **Why it matters:** `database` and `prisma` have overlapping implied scope, configuration exists in multiple forms, and a second non-exported core `Kernel` exists. Clear ownership reduces duplication and coupling.
- **Dependencies:** Phase 1 baseline and architecture decisions recorded for package boundaries.
- **Estimated complexity:** Medium.
- **Estimated effort:** 3–5 engineer days.
- **Risks:** Removing apparently unused code can affect external or untracked consumers; broad export changes can create migration work.

## Milestone 3.2 — Define shared application contracts

- **Goal:** Add only the cross-application types and interfaces required by implemented Discord, API, worker, database, and future FiveM boundaries. Keep external SDK types behind integration packages.
- **Why it matters:** Shared contracts allow applications to communicate without importing Discord- or FiveM-specific implementation details.
- **Dependencies:** Concrete API, persistence, and queue use cases from Phases 4 and 5; core package boundary decisions.
- **Estimated complexity:** Medium.
- **Estimated effort:** 4–7 engineer days initially, then incremental maintenance.
- **Risks:** Designing contracts without working consumers can create speculative abstractions; a large shared package can become a coupling point.

## Milestone 3.3 — Implement shared queue and scheduling boundaries

- **Goal:** Define reusable queue, job, and scheduler interfaces, then connect the existing scheduler placeholder to the selected BullMQ/Redis lifecycle when a real job is approved.
- **Why it matters:** BullMQ, ioredis, `REDIS_URL`, a worker app, and a scheduler package already exist as unused boundaries. A common contract prevents each feature from creating its own queue conventions.
- **Dependencies:** Phase 1 configuration and lifecycle work; approved job use cases; operational Redis availability.
- **Estimated complexity:** High.
- **Estimated effort:** 1–2 engineer weeks for the first production-ready queue path.
- **Risks:** Delivery guarantees, retries, idempotency, and failure handling require explicit decisions; Redis outages affect multiple applications; abstracting before a concrete job exists risks unnecessary design.

# Phase 4 — API

## Existing functionality

- Private `@qbox/api` workspace with build, development, start, typecheck, test, and clean scripts.
- Package-owned Fastify and Zod dependencies.
- An unbound Fastify server factory with immutable configuration, request context, structured request logging, typed Problem Details errors, metrics boundary, health endpoints, and injection tests.
- Persistence-first process lifecycle, loopback socket binding, health/readiness composition, graceful signal shutdown, Zod transport validation, and HTTP hardening.
- Pure authentication contracts, additive PostgreSQL models, repository/crypto/session/credential/membership services, Discord provider infrastructure, browser login routes, authenticated actor binding, and proof-of-concept account/permission endpoints exist.
- `apps/web` contains the static portal, served by the Qbox API on the live platform and published as a Demo Mode preview on GitHub Pages.
- General authentication middleware, service credentials, account-management endpoints, and production domain-management APIs remain deferred.

## Milestone 4.1 — Establish the API runtime

- **Goal:** Complete the existing Fastify transport foundation by composing it with the core/database lifecycle, adding graceful startup and shutdown, and binding it safely for operation.
- **Existing functionality:** Implemented on the API foundation branch: persistence-first kernel composition, catalog synchronization, loopback-testable HTTP lifecycle, live readiness composition, startup cleanup, and idempotent SIGINT/SIGTERM shutdown.
- **Why it matters:** The current API does not listen for requests. A stable runtime boundary is required before business routes are added.
- **Dependencies:** Phase 1 baseline, configuration, logging, and lifecycle hardening; package-local Fastify dependency approval.
- **Estimated complexity:** Medium.
- **Estimated effort:** 4–7 engineer days.
- **Risks:** Health and readiness semantics depend on future database and Redis dependencies; server lifecycle must integrate cleanly with the kernel rather than create a parallel system.

## Milestone 4.2 — Define API security and validation

- **Goal:** Implement an approved authentication model, authorization integration, request/response schemas, secure headers, CORS policy, rate limiting, and safe error responses.
- **Existing functionality:** Transport validation, safe errors, host/proxy/content/header/body hardening, cooperative timeouts, security headers, Discord OAuth proof-of-concept login, opaque session cookies, authenticated request actor binding, safe profile/permission test routes, and a static dashboard are complete. Authentication foundations include pure account/identity/session/OAuth/audit contracts, additive storage, repository adapters, crypto/key infrastructure, encrypted provider credentials, a Discord OAuth provider adapter, and membership verification services.
- **Why it matters:** No API security boundary currently exists. These controls must precede exposure of management or user data.
- **Dependencies:** Milestone 4.1, Phase 2/3 permission contracts, approved client and identity requirements, and potentially Phase 5 persistence.
- **Estimated complexity:** High.
- **Estimated effort:** 1–3 engineer weeks after authentication requirements are defined.
- **Risks:** The proof of concept is intentionally narrow; production authentication still needs generalized middleware, account/recovery operations, explicit CORS deployment policy, and operational hardening before management features are exposed.

## Milestone 4.3 — Add versioned feature endpoints

- **Goal:** Add approved, versioned endpoints backed by application services rather than direct integration or database access. Document endpoint schemas and test authorization and failure paths.
- **Why it matters:** A stable application boundary keeps HTTP concerns separate from Discord, FiveM, and persistence implementations.
- **Dependencies:** Milestones 4.1–4.2, Phase 5 data services for persistent features, and approved product requirements.
- **Estimated complexity:** Medium to high per endpoint group.
- **Estimated effort:** To be estimated per feature; typically 1–2 engineer weeks for the first complete endpoint group.
- **Risks:** Premature endpoint design can lock in unstable domain contracts; missing pagination, idempotency, or tenant filtering can cause later breaking changes.

# Phase 5 — Database

## Existing functionality

- `@qbox/database` owns validated PostgreSQL configuration, lifecycle/readiness, persistent-permission repositories, transaction boundaries, owner protection, bootstrap/migration operators, and process-local invalidation.
- `@qbox/prisma` owns Prisma 7.9.1, the ESM generated client, disconnected client factory, canonical schema tooling, migration deployment, and drift checks.
- Root `prisma/` contains committed permission and additive authentication schemas/migrations; generated client output is deterministic and committed under `packages/prisma/src/generated/client`.
- Disposable PostgreSQL integration tests cover migrations, constraints, transactions, permission repositories, owner protection, and authentication-foundation invariants.
- Authentication repository adapters, transaction boundaries, native cryptography, key-ring support, owner-access locking, session/OAuth transaction services, encrypted provider-credential lifecycle, Discord membership verification services, and HTTP proof-of-concept authentication composition are implemented and tested. No service credentials, account-linking UI, recovery UI, or generalized domain-management API exists yet.

## Milestone 5.1 — Define persistence ownership and data requirements

- **Goal:** Decide and record how `@qbox/database`, `@qbox/prisma`, and root `prisma/` divide responsibilities. Define only data models required by approved features, including guild/tenant boundaries and retention needs.
- **Why it matters:** Schema work requires explicit ownership and domain requirements. The existing placeholders do not establish either.
- **Dependencies:** Approved Discord/API feature requirements and architecture decision records.
- **Estimated complexity:** Medium.
- **Estimated effort:** 3–7 engineer days, depending on the first domain model.
- **Risks:** A schema designed before tenancy, audit, or retention requirements are known can cause costly migrations; overlapping packages can duplicate database responsibilities.

## Milestone 5.2 — Implement Prisma lifecycle and migrations

- **Goal:** Add an approved schema, migration workflow, generated client integration, connection lifecycle, health checks, and test-database setup.
- **Why it matters:** Persistent features cannot be implemented safely with the current console-only database placeholder.
- **Dependencies:** Milestone 5.1, database technology and hosting decisions, schema-change approval, and Phase 1 configuration/security work.
- **Estimated complexity:** High.
- **Estimated effort:** 1–2 engineer weeks for the initial production-ready foundation.
- **Risks:** Schema changes are difficult to reverse; migration behavior differs across environments; connection limits and deployment ordering can cause outages.

## Milestone 5.3 — Add repository and transaction boundaries

- **Goal:** Expose focused persistence interfaces to application services, centralize transaction handling, and keep Prisma types and queries out of Discord, FiveM, and HTTP handlers.
- **Why it matters:** Integration modules should depend on stable domain-facing contracts rather than a specific ORM.
- **Dependencies:** Milestone 5.2 and concrete persistent use cases.
- **Estimated complexity:** Medium to high.
- **Estimated effort:** 1–2 engineer weeks for the first domain, then incremental work.
- **Risks:** Generic repository abstractions can hide useful database behavior; inadequate transaction boundaries can create partial writes; excessive abstraction can increase maintenance cost.

## Milestone 5.4 — Operationalize data safety

- **Goal:** Add backup/restore procedures, migration checks, least-privilege credentials, observability, retention rules, and recovery testing.
- **Why it matters:** Production readiness requires recovery and operational controls, not only a working client connection.
- **Dependencies:** Production database environment and Milestones 5.1–5.3.
- **Estimated complexity:** High.
- **Estimated effort:** 1–3 engineer weeks plus recurring operational testing.
- **Risks:** Unverified backups provide false confidence; migration and restore tests can affect shared environments if isolation is inadequate.

# Phase 6 — FiveM / Qbox

## Existing functionality

- The platform vision names FiveM and Qbox.
- `modules/fivem/` exists as an empty directory.
- No FiveM resource, Qbox adapter, protocol, event, command, service, configuration, or data synchronization code exists.

## Milestone 6.1 — Define the integration boundary

- **Goal:** Document approved FiveM/Qbox use cases, trust boundaries, communication protocol, identity mapping, failure behavior, and ownership between game-server-specific code and shared packages.
- **Why it matters:** There is currently no implemented contract. A defined boundary is required to keep FiveM logic independent from Discord while reusing genuine shared functionality.
- **Dependencies:** Concrete server topology, Qbox version and extension requirements, security requirements, and relevant shared contracts from Phase 3.
- **Estimated complexity:** High.
- **Estimated effort:** 1–2 engineer weeks for discovery, prototypes, and architecture decisions.
- **Risks:** FiveM/Qbox runtime constraints may not match Node application assumptions; insecure server events can enable spoofing or privilege escalation; identity mapping may require persistent data.

## Milestone 6.2 — Implement a minimal authenticated adapter

- **Goal:** Build the smallest approved end-to-end integration between Qbox/FiveM and the platform, with authentication, validation, structured logs, timeouts, and failure isolation.
- **Why it matters:** A narrow vertical slice validates the integration boundary before feature modules depend on it.
- **Dependencies:** Milestone 6.1, Phase 4 API or another approved transport, Phase 5 persistence if identity mapping is stored, and a representative development server.
- **Estimated complexity:** High.
- **Estimated effort:** 2–4 engineer weeks.
- **Risks:** Network trust, replay protection, server availability, version compatibility, and deployment coordination can all affect correctness.

## Milestone 6.3 — Add approved cross-system features

- **Goal:** Implement feature-specific FiveM/Qbox modules while keeping Discord and game-server adapters separate and sharing only domain contracts and services.
- **Why it matters:** This realizes the repository's cross-community purpose without creating direct Discord-to-FiveM coupling.
- **Dependencies:** Milestones 6.1–6.2, relevant Phase 2 features, shared packages, database support, and approved feature specifications.
- **Estimated complexity:** High per feature.
- **Estimated effort:** To be estimated per feature; typically 2–6 engineer weeks for a cross-system vertical slice.
- **Risks:** Cross-system consistency, partial outages, duplicate delivery, and permission mismatches require explicit handling and idempotency.

# Phase 7 — AI

## Existing functionality

- The repository vision includes an AI knowledge base and future AI integrations.
- `OPENAI_API_KEY` is loaded by shared configuration.
- `@qbox/openai` exports a placeholder `AIService` whose methods print messages only.
- The OpenAI SDK is installed at the repository root but is not imported by `@qbox/openai` or any application.

## Milestone 7.1 — Define AI use cases and safety requirements

- **Goal:** Specify an approved initial use case, allowed data sources, privacy constraints, retention rules, human review requirements, failure behavior, cost limits, and evaluation criteria.
- **Why it matters:** No AI behavior currently exists. The service boundary, security controls, and testing approach depend on what data the system may process and what actions it may take.
- **Dependencies:** Product requirements, data classification, applicable Discord/FiveM policies, and Phase 1 security/configuration foundations.
- **Estimated complexity:** High.
- **Estimated effort:** 1–2 engineer weeks for the initial use case and evaluation plan.
- **Risks:** Sensitive user or staff data may be sent externally; vague quality criteria can make behavior untestable; automated actions can create moderation or authorization harm.

## Milestone 7.2 — Implement the OpenAI package boundary

- **Goal:** Replace the placeholder with an injected client adapter, validated configuration, timeouts, retries, rate and cost controls, structured redacted logging, and deterministic test doubles.
- **Why it matters:** AI calls should be isolated behind a reusable service rather than made directly from Discord, API, or FiveM handlers.
- **Dependencies:** Milestone 7.1, package-local dependency approval, shared configuration, logging, and service-container contracts.
- **Estimated complexity:** Medium to high.
- **Estimated effort:** 1–2 engineer weeks.
- **Risks:** Retry behavior can duplicate costs; prompts or responses may leak sensitive information through logs; SDK and model behavior can change independently of application code.

## Milestone 7.3 — Deliver and evaluate the first AI feature

- **Goal:** Implement one approved, bounded feature with authorization, source attribution where applicable, human-review controls, quality evaluations, cost monitoring, and non-AI fallback behavior.
- **Why it matters:** A measured vertical slice validates the service and safety model before AI is used broadly across the platform.
- **Dependencies:** Milestones 7.1–7.2 and the relevant Discord, API, database, or knowledge feature dependencies.
- **Estimated complexity:** High.
- **Estimated effort:** 2–4 engineer weeks for the first feature, excluding data preparation at scale.
- **Risks:** Incorrect output, prompt injection, data leakage, unpredictable latency, model changes, and uncontrolled cost. Features that affect users or moderation require explicit review boundaries.

## Milestone 7.4 — Operationalize AI evaluation and governance

- **Goal:** Add repeatable evaluations, regression datasets, usage and cost dashboards, model/prompt version tracking, incident procedures, and periodic privacy and security review.
- **Why it matters:** Production AI behavior cannot be validated solely through TypeScript tests or one-time manual review.
- **Dependencies:** A working AI feature, representative approved evaluation data, and operational telemetry.
- **Estimated complexity:** High.
- **Estimated effort:** 2–4 engineer weeks initially, followed by ongoing review.
- **Risks:** Evaluation data can contain sensitive content; poorly chosen metrics may reward incorrect behavior; governance can become stale as models or features change.

# Priority order

The phases are ordered by technical dependency:

1. Establish a reliable, secure foundation.
2. Stabilize the only working external integration, the Discord bot.
3. Clarify and implement reusable package boundaries from concrete needs.
4. Establish the API runtime and security boundary.
5. Add approved persistent data models and operational safeguards.
6. Integrate FiveM/Qbox through a defined, authenticated boundary.
7. Add AI only after data, authorization, observability, and evaluation controls exist.

Work within a later phase may be explored earlier, but production implementation should not bypass its listed dependencies or approval requirements.
