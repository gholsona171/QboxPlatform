# API Conventions

This document defines conventions for QboxPlatform HTTP APIs. The current API foundation exposes only operational health endpoints; domain endpoints, authentication, and authorization are not implemented yet.

## Endpoint naming and versioning

- Use lowercase plural nouns for resources: `/api/v1/tickets`.
- Use path segments for stable resource identity: `/api/v1/tickets/{ticketId}`.
- Avoid verbs in resource paths. Model an operation as a resource or explicit action only when normal resource semantics do not fit.
- Domain routes live under `/api/v1`.
- Operational routes live under `/health` and are not API-versioned.
- An incompatible request or response change requires a new major URL version. Additive optional fields may remain in the current version.

## HTTP verbs

- `GET` reads without changing state.
- `POST` creates a resource or invokes a non-idempotent approved action.
- `PUT` completely replaces a resource only when replacement semantics are genuine.
- `PATCH` applies a validated partial update.
- `DELETE` is reserved for approved deletion semantics. Permission infrastructure uses revoke/disable operations rather than physical deletion.

Use appropriate success codes: `200` for reads or updates with a response, `201` for creation, `202` for accepted asynchronous work, and `204` only when no response body is useful.

## Pagination, filtering, and sorting

Collection endpoints should use cursor pagination unless a use case explicitly requires stable offset pagination. Recommended fields are `limit` and `cursor`; responses return `nextCursor` when another page exists. Limits require bounded defaults and maxima.

Filters use explicit query fields rather than an unvalidated expression language. Sorting uses an allowlisted `sort` field and `order=asc|desc`. Unknown filters, fields, or sort keys are validation errors. Tenant or guild scope always comes from trusted route/authentication context, never an unrestricted client filter.

## Responses

Successful single-resource responses return the resource DTO directly. Collections use:

```json
{
  "items": [],
  "page": {
    "nextCursor": null
  }
}
```

Transport DTOs are versioned contracts and are defined once with Zod. Database rows, Prisma types, internal permission assignments, and application-service objects are not returned directly.

Health responses contain service, version, timestamp, liveness, readiness, degraded state, and safe component summaries. Every response includes `X-Qbox-Version`. Request responses include `X-Request-ID` and `X-Correlation-ID`.

## Errors

Errors use an RFC 9457-compatible Problem Details document with Qbox extensions:

```json
{
  "type": "https://qbox.invalid/problems/validation-failed",
  "title": "Request validation failed",
  "status": 400,
  "detail": "The request is invalid.",
  "code": "VALIDATION_FAILED",
  "requestId": "server-generated-id",
  "correlationId": "validated-or-generated-id",
  "errors": []
}
```

Stable codes currently reserved by the foundation are:

- `VALIDATION_FAILED`
- `AUTHENTICATION_REQUIRED`
- `AUTHORIZATION_DENIED`
- `RESOURCE_CONFLICT`
- `RESOURCE_NOT_FOUND`
- `DEPENDENCY_UNAVAILABLE`
- `INTERNAL_ERROR`

Validation details contain safe field paths and issue codes, not rejected values. Internal messages and stack traces never appear in client responses.

## Request and correlation IDs

The server always generates the request ID. A caller cannot select it.

Clients may send `X-Correlation-ID` only as a canonical UUID. Valid values are propagated; missing, malformed, repeated, or unsupported values are replaced with a server-generated UUID. IDs support diagnostics and tracing but do not authenticate a caller or authorize an operation.

## Deprecation

Deprecated fields or endpoints must be documented with their replacement and removal version. Responses should use standards-compatible deprecation and sunset headers when a concrete retirement date exists. A deprecated contract remains tested until removal. Breaking removal occurs only in a new major API version unless a documented emergency security response requires otherwise.

## Security baseline

Route handlers validate inputs with Zod and call injected application services. They do not read environment variables, instantiate repositories or Prisma, perform permission evaluation, or trust actor identity from request data. Authorization headers, cookies, tokens, passwords, database URLs, and request bodies are excluded from default logging.
