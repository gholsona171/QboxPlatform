import { randomUUID } from "node:crypto";
import { BlockList, isIP, type Socket } from "node:net";
import fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from "fastify";
import { logger as defaultLogger } from "@qbox/logger";

import type { ApiConfiguration } from "./config/ApiConfiguration.js";
import {
  createApiRequestContext,
  type ApiRequestContext,
} from "./context/ApiRequestContext.js";
import {
  mapApiError,
  InvalidHostApiError,
  InvalidRequestHeadersApiError,
  NotFoundApiError,
  PayloadTooLargeApiError,
  RateLimitedApiError,
  UnsupportedMediaTypeApiError,
  ValidationApiError,
} from "./errors/ApiError.js";
import {
  aggregateApiHealth,
  StaticApiHealthProvider,
  type ApiHealthProvider,
} from "./health/ApiHealth.js";
import type { ApiLogger } from "./logging/ApiLogger.js";
import {
  noOpMetricsRecorder,
  type MetricsRecorder,
} from "./metrics/MetricsRecorder.js";
import {
  noOpRateLimitEvaluator,
  type ApiRateLimitEvaluator,
} from "./security/ApiTransportPolicies.js";

/** Injected dependencies for an unbound API transport instance. */
export interface ApiServerDependencies {
  readonly configuration: ApiConfiguration;
  readonly logger?: ApiLogger;
  readonly health?: ApiHealthProvider;
  readonly metrics?: MetricsRecorder;
  readonly rateLimit?: ApiRateLimitEvaluator;
  readonly now?: () => Date;
  readonly monotonicNow?: () => number;
}

interface RequestObservation {
  readonly requestBytes?: number;
  readonly controller: AbortController;
  responseBytes?: number;
}

interface ApiTransportState {
  readonly activeControllers: Set<AbortController>;
  shutdownTimer?: ReturnType<typeof setTimeout>;
}

const transportStates = new WeakMap<FastifyInstance, ApiTransportState>();

/**
 * Creates a fully configured Fastify transport without starting any lifecycle.
 *
 * The factory never binds a socket, reads process environment, starts a kernel,
 * or accesses persistence. All stateful boundaries are injected.
 */
export function createApiServer(
  dependencies: ApiServerDependencies,
): FastifyInstance {
  const diagnostics = dependencies.configuration.diagnostics();
  const parentLogger = dependencies.logger ?? defaultLogger;
  const health = dependencies.health ?? new StaticApiHealthProvider();
  const metrics = dependencies.metrics ?? noOpMetricsRecorder;
  const rateLimit = dependencies.rateLimit ?? noOpRateLimitEvaluator;
  const now = dependencies.now ?? (() => new Date());
  const monotonicNow = dependencies.monotonicNow ?? (() => performance.now());
  const observations = new WeakMap<FastifyRequest, RequestObservation>();
  const transportState: ApiTransportState = { activeControllers: new Set() };
  const trustedProxies = createTrustedProxyBlockList(diagnostics.trustProxy);

  if (diagnostics.corsPolicy.mode !== "disabled")
    throw new Error("CORS allowlist enforcement is not implemented.");

  const server = fastify({
    logger: false,
    bodyLimit: diagnostics.bodySizeLimitBytes,
    requestTimeout: diagnostics.requestTimeoutMs,
    handlerTimeout: diagnostics.requestTimeoutMs,
    keepAliveTimeout: diagnostics.keepAliveTimeoutMs,
    trustProxy:
      diagnostics.trustProxy.mode === "allowlist"
        ? [...diagnostics.trustProxy.addresses]
        : false,
    genReqId: () => randomUUID(),
    http: { maxHeaderSize: diagnostics.headerSizeLimitBytes },
    clientErrorHandler: (error, socket) =>
      handleClientError(error, socket, diagnostics.buildVersion, parentLogger),
  });
  transportStates.set(server, transportState);

  server.decorateRequest("apiContext");

  server.addHook("onRequest", async (request, reply) => {
    const controller = new AbortController();
    transportState.activeControllers.add(controller);
    const signal = AbortSignal.any([request.signal, controller.signal]);

    const context = createApiRequestContext(
      request,
      parentLogger,
      signal,
      monotonicNow,
    );
    request.apiContext = context;
    reply.header("x-request-id", context.requestId);
    reply.header("x-correlation-id", context.correlationId);
    applySecurityHeaders(reply);

    const requestBytes = parseContentLength(request.headers["content-length"]);
    observations.set(request, {
      ...(requestBytes === undefined ? {} : { requestBytes }),
      controller,
    });
    context.logger.info(
      {
        event: "api.request.received",
        method: request.method,
        route: safeRoute(request),
        clientIp: context.clientIp,
        ...(requestBytes === undefined ? {} : { requestBytes }),
      },
      "API request received.",
    );

    validateHeaders(request, diagnostics, trustedProxies, context.logger);
    if (requestBytes !== undefined && requestBytes > diagnostics.bodySizeLimitBytes)
      throw new PayloadTooLargeApiError();
    validateBodylessMethod(request);
    const rateLimitDecision = await rateLimit.evaluate({
      context,
      method: request.method,
      route: safeRoute(request),
    });
    if (!rateLimitDecision.allowed) throw new RateLimitedApiError();
  });

  server.addHook("preValidation", async (request) => {
    validateContentType(request);
  });

  server.addHook("onRequestAbort", async (request) => {
    const context = request.apiContext ?? fallbackContext(request, parentLogger);
    const observation = observations.get(request);
    observation?.controller.abort("client-disconnected");
    context.logger.warn(
      { event: "api.transport.client-disconnected", route: safeRoute(request) },
      "API client disconnected before request completion.",
    );
  });

  server.addHook("onSend", async (_request, reply, payload) => {
    applySecurityHeaders(reply);
    reply.header("x-qbox-version", diagnostics.buildVersion);
    const observation = observations.get(_request);
    const responseBytes = responseByteCount(payload);
    if (observation !== undefined && responseBytes !== undefined)
      observation.responseBytes = responseBytes;
    return payload;
  });

  server.addHook("onResponse", async (request, reply) => {
    const context = request.apiContext ?? fallbackContext(request, parentLogger);
    const observation = observations.get(request);
    const durationMs = Math.max(0, monotonicNow() - context.startedAt);
    const measurement = {
      method: request.method,
      route: safeRoute(request),
      statusCode: reply.statusCode,
      durationMs,
      ...(observation?.requestBytes === undefined
        ? {}
        : { requestBytes: observation.requestBytes }),
      ...(observation?.responseBytes === undefined
        ? {}
        : { responseBytes: observation.responseBytes }),
    };
    context.logger.info(
      { event: "api.request.completed", ...measurement },
      "API request completed.",
    );
    try {
      metrics.recordRequest(measurement);
    } catch {
      context.logger.error(
        { event: "api.metrics.recording-failed" },
        "API request metrics recording failed.",
      );
    }
    if (observation !== undefined)
      transportState.activeControllers.delete(observation.controller);
    observations.delete(request);
  });

  server.setNotFoundHandler(async () => {
    throw new NotFoundApiError();
  });

  server.setErrorHandler(async (error, request, reply) => {
    const context = request.apiContext ?? fallbackContext(request, parentLogger);
    const mapped = mapApiError(error, context.requestId, context.correlationId);
    const fields = {
      event: "api.request.failed",
      rejectionEvent: rejectionEvent(mapped.error.code),
      method: request.method,
      route: safeRoute(request),
      statusCode: mapped.error.status,
      errorCode: mapped.error.code,
      durationMs: Math.max(0, monotonicNow() - context.startedAt),
    };
    context.logger[mapped.error.logLevel](fields, "API request failed.");
    try {
      metrics.recordTransportEvent({
        code: mapped.error.code,
        route: safeRoute(request),
        statusCode: mapped.error.status,
      });
    } catch {
      context.logger.error(
        { event: "api.metrics.recording-failed" },
        "API transport metrics recording failed.",
      );
    }
    if (reply.sent || reply.raw.destroyed) return;
    await reply
      .code(mapped.error.status)
      .type("application/problem+json")
      .send(mapped.problem);
  });

  server.get("/health/live", async (_request, reply) => {
    const snapshot = aggregateApiHealth(health, diagnostics.buildVersion, now);
    return reply.code(snapshot.liveness === "live" ? 200 : 503).send(snapshot);
  });

  server.get("/health/ready", async (_request, reply) => {
    const snapshot = aggregateApiHealth(health, diagnostics.buildVersion, now);
    return reply.code(snapshot.readiness === "ready" ? 200 : 503).send(snapshot);
  });

  server.get("/health/degraded", async (_request, reply) => {
    return reply
      .code(200)
      .send(aggregateApiHealth(health, diagnostics.buildVersion, now));
  });

  server.register(async () => undefined, { prefix: "/api/v1" });
  server.addHook("onClose", async () => {
    if (transportState.shutdownTimer !== undefined)
      clearTimeout(transportState.shutdownTimer);
    for (const controller of transportState.activeControllers)
      controller.abort("api-shutdown");
    transportState.activeControllers.clear();
  });
  return server;
}

/** Marks transport shutdown and aborts cooperative requests after the grace period. */
export function beginApiTransportShutdown(
  server: FastifyInstance,
  graceMs: number,
): void {
  const state = transportStates.get(server);
  if (state === undefined || state.shutdownTimer !== undefined) return;
  state.shutdownTimer = setTimeout(() => {
    for (const controller of state.activeControllers)
      controller.abort("api-shutdown");
  }, Math.max(1, graceMs));
}

function fallbackContext(
  request: FastifyRequest,
  logger: ApiLogger,
): ApiRequestContext {
  const correlationId = randomUUID();
  return Object.freeze({
    requestId: request.id,
    correlationId,
    actor: Object.freeze({ type: "unauthenticated" }),
    startedAt: performance.now(),
    logger: logger.child({
      requestId: request.id,
      correlationId,
      actorType: "unauthenticated",
    }),
    signal: new AbortController().signal,
    clientIp: request.ip,
  });
}

function safeRoute(request: FastifyRequest): string {
  return request.routeOptions.url || "unmatched";
}

function parseContentLength(value: string | string[] | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !/^\d+$/u.test(value))
    throw new InvalidRequestHeadersApiError();
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) throw new InvalidRequestHeadersApiError();
  return parsed;
}

function responseByteCount(payload: unknown): number | undefined {
  if (typeof payload === "string") return Buffer.byteLength(payload);
  if (Buffer.isBuffer(payload)) return payload.byteLength;
  if (payload instanceof Uint8Array) return payload.byteLength;
  return undefined;
}

function applySecurityHeaders(reply: FastifyReply): void {
  reply.header("x-content-type-options", "nosniff");
  reply.header("referrer-policy", "no-referrer");
  reply.header("cache-control", "no-store");
}

function validateHeaders(
  request: FastifyRequest,
  diagnostics: ReturnType<ApiConfiguration["diagnostics"]>,
  trustedProxies: BlockList | undefined,
  logger: ApiLogger,
): void {
  const duplicates = duplicateHeaderNames(request.raw.rawHeaders);
  const sensitive = new Set([
    "authorization", "cookie", "content-length", "host", "transfer-encoding",
    "origin", "x-correlation-id", "x-forwarded-for", "x-forwarded-host", "x-forwarded-proto",
  ]);
  if ([...duplicates].some((name) => sensitive.has(name)))
    throw new InvalidRequestHeadersApiError();
  for (const value of Object.values(request.headers)) {
    const values = Array.isArray(value) ? value : [value];
    if (values.some((item) => typeof item === "string" && /[\u0000-\u001f\u007f]/u.test(item)))
      throw new InvalidRequestHeadersApiError();
  }
  const userAgent = request.headers["user-agent"];
  if (typeof userAgent === "string" && userAgent.length > diagnostics.userAgentLimitChars)
    throw new InvalidRequestHeadersApiError();
  if (request.headers["content-length"] !== undefined && request.headers["transfer-encoding"] !== undefined)
    throw new InvalidRequestHeadersApiError();
  const origin = singleHeader(request.headers.origin);
  if (origin !== undefined && !isValidOrigin(origin))
    throw new InvalidRequestHeadersApiError();

  const forwarded = ["forwarded", "x-forwarded-for", "x-forwarded-host", "x-forwarded-proto"]
    .some((name) => request.headers[name] !== undefined);
  const remoteAddress = normalizeRemoteAddress(request.socket.remoteAddress);
  const trusted = remoteAddress !== undefined && trustedProxies?.check(remoteAddress, isIP(remoteAddress) === 6 ? "ipv6" : "ipv4") === true;
  if (forwarded && !trusted) {
    logger.warn(
      { event: "api.transport.untrusted-forwarded-metadata", route: safeRoute(request) },
      "Untrusted forwarded request metadata ignored.",
    );
  }
  if (forwarded && trusted) validateForwardedHeaders(request, logger);
  const forwardedHost = trusted ? singleHeader(request.headers["x-forwarded-host"]) : undefined;
  const candidate = forwardedHost ?? singleHeader(request.headers.host);
  if (!isAllowedHost(candidate, diagnostics)) throw new InvalidHostApiError();
}

function validateForwardedHeaders(request: FastifyRequest, logger: ApiLogger): void {
  const reject = (): never => {
    logger.warn(
      { event: "api.transport.invalid-forwarded-metadata", route: safeRoute(request) },
      "API rejected invalid forwarded request metadata.",
    );
    throw new InvalidRequestHeadersApiError();
  };
  if (request.headers.forwarded !== undefined) reject();
  const forwardedFor = singleHeader(request.headers["x-forwarded-for"]);
  if (
    forwardedFor !== undefined &&
    (forwardedFor.length > 1_024 ||
      forwardedFor.split(",").some((value) => isIP(value.trim()) === 0))
  ) reject();
  const forwardedProto = singleHeader(request.headers["x-forwarded-proto"]);
  if (forwardedProto !== undefined && forwardedProto !== "http" && forwardedProto !== "https")
    reject();
  const forwardedHost = singleHeader(request.headers["x-forwarded-host"]);
  if (forwardedHost !== undefined && (forwardedHost.length > 255 || forwardedHost.includes(",")))
    reject();
}

function validateBodylessMethod(request: FastifyRequest): void {
  if (request.method !== "GET" && request.method !== "HEAD") return;
  const length = parseContentLength(request.headers["content-length"]);
  if ((length ?? 0) > 0 || request.headers["transfer-encoding"] !== undefined)
    throw new ValidationApiError([{ path: "body", code: "BODY_NOT_ALLOWED" }]);
}

function validateContentType(request: FastifyRequest): void {
  if (!["POST", "PUT", "PATCH"].includes(request.method)) return;
  const pathname = request.raw.url?.split("?", 1)[0] ?? "";
  if (!pathname.startsWith("/api/")) return;
  const contentType = singleHeader(request.headers["content-type"]);
  if (contentType === undefined || !/^application\/json(?:\s*;\s*charset=utf-8)?$/iu.test(contentType))
    throw new UnsupportedMediaTypeApiError();
  const length = parseContentLength(request.headers["content-length"]);
  if ((length ?? 0) === 0 && request.headers["transfer-encoding"] === undefined)
    throw new ValidationApiError([{ path: "body", code: "BODY_REQUIRED" }]);
}

function duplicateHeaderNames(rawHeaders: readonly string[]): ReadonlySet<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (let index = 0; index < rawHeaders.length; index += 2) {
    const name = rawHeaders[index]?.toLowerCase();
    if (name === undefined) continue;
    if (seen.has(name)) duplicates.add(name);
    seen.add(name);
  }
  return duplicates;
}

function singleHeader(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isAllowedHost(
  value: string | undefined,
  diagnostics: ReturnType<ApiConfiguration["diagnostics"]>,
): boolean {
  if (value === undefined || value.length > 255 || value.includes(",")) return false;
  let parsed: URL;
  try {
    parsed = new URL(`http://${value}`);
  } catch {
    return false;
  }
  if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash)
    return false;
  const expected = new URL(diagnostics.publicBaseUrl);
  if (parsed.host.toLowerCase() === expected.host.toLowerCase()) return true;
  if (diagnostics.environment === "production") return false;
  return isLoopbackHostname(parsed.hostname) && isLoopbackHostname(expected.hostname);
}

function isLoopbackHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "::1";
}

function isValidOrigin(value: string): boolean {
  if (value.length > 2_048) return false;
  try {
    const origin = new URL(value);
    return (
      (origin.protocol === "http:" || origin.protocol === "https:") &&
      !origin.username &&
      !origin.password &&
      origin.pathname === "/" &&
      !origin.search &&
      !origin.hash
    );
  } catch {
    return false;
  }
}

function createTrustedProxyBlockList(
  policy: ReturnType<ApiConfiguration["diagnostics"]>["trustProxy"],
): BlockList | undefined {
  if (policy.mode === "disabled") return undefined;
  const list = new BlockList();
  for (const address of policy.addresses) {
    const [host = "", prefix] = address.split("/");
    const type = isIP(host) === 6 ? "ipv6" : "ipv4";
    if (prefix === undefined) list.addAddress(host, type);
    else list.addSubnet(host, Number(prefix), type);
  }
  return list;
}

function normalizeRemoteAddress(value: string | undefined): string | undefined {
  if (value?.startsWith("::ffff:") === true) return value.slice(7);
  return value;
}

function rejectionEvent(code: string): string {
  const events: Readonly<Record<string, string>> = {
    VALIDATION_FAILED: "api.transport.validation-failed",
    INVALID_REQUEST_HEADERS: "api.transport.invalid-headers",
    INVALID_HOST: "api.transport.invalid-host",
    UNSUPPORTED_MEDIA_TYPE: "api.transport.unsupported-media-type",
    PAYLOAD_TOO_LARGE: "api.transport.payload-too-large",
    REQUEST_TIMEOUT: "api.transport.timeout",
    RATE_LIMITED: "api.transport.rate-limited",
  };
  return events[code] ?? "api.transport.request-failed";
}

function handleClientError(
  _error: Error,
  socket: Socket,
  version: string,
  logger: ApiLogger,
): void {
  const requestId = randomUUID();
  const correlationId = randomUUID();
  const mapped = mapApiError(new InvalidRequestHeadersApiError(), requestId, correlationId);
  const payload = JSON.stringify(mapped.problem);
  logger.warn(
    { event: "api.transport.invalid-headers", statusCode: 400, requestId, correlationId },
    "API rejected malformed HTTP headers.",
  );
  if (!socket.writable) return;
  socket.end([
    "HTTP/1.1 400 Bad Request",
    "Content-Type: application/problem+json",
    `Content-Length: ${Buffer.byteLength(payload)}`,
    `X-Request-Id: ${requestId}`,
    `X-Correlation-Id: ${correlationId}`,
    `X-Qbox-Version: ${version}`,
    "X-Content-Type-Options: nosniff",
    "Referrer-Policy: no-referrer",
    "Cache-Control: no-store",
    "Connection: close",
    "",
    payload,
  ].join("\r\n"));
}
