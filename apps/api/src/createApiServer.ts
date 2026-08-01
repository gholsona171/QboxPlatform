import { randomUUID } from "node:crypto";
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
  NotFoundApiError,
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

/** Injected dependencies for an unbound API transport instance. */
export interface ApiServerDependencies {
  readonly configuration: ApiConfiguration;
  readonly logger?: ApiLogger;
  readonly health?: ApiHealthProvider;
  readonly metrics?: MetricsRecorder;
  readonly now?: () => Date;
  readonly monotonicNow?: () => number;
}

interface RequestObservation {
  readonly requestBytes?: number;
  readonly abortListener: () => void;
  responseBytes?: number;
}

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
  const now = dependencies.now ?? (() => new Date());
  const monotonicNow = dependencies.monotonicNow ?? (() => performance.now());
  const observations = new WeakMap<FastifyRequest, RequestObservation>();
  const abortControllers = new WeakMap<FastifyRequest, AbortController>();

  const server = fastify({
    logger: false,
    bodyLimit: diagnostics.bodySizeLimitBytes,
    requestTimeout: diagnostics.requestTimeoutMs,
    keepAliveTimeout: diagnostics.keepAliveTimeoutMs,
    trustProxy:
      diagnostics.trustProxy.mode === "allowlist"
        ? [...diagnostics.trustProxy.addresses]
        : false,
    genReqId: () => randomUUID(),
  });

  server.decorateRequest("apiContext");

  server.addHook("onRequest", async (request, reply) => {
    const controller = new AbortController();
    const abort = () => controller.abort("client-disconnected");
    request.raw.once("aborted", abort);
    abortControllers.set(request, controller);

    const context = createApiRequestContext(
      request,
      parentLogger,
      controller.signal,
      monotonicNow,
    );
    request.apiContext = context;
    reply.header("x-request-id", context.requestId);
    reply.header("x-correlation-id", context.correlationId);

    const requestBytes = parseByteCount(request.headers["content-length"]);
    observations.set(request, {
      ...(requestBytes === undefined ? {} : { requestBytes }),
      abortListener: abort,
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
  });

  server.addHook("onSend", async (_request, reply, payload) => {
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
      request.raw.off("aborted", observation.abortListener);
    abortControllers.delete(request);
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
      method: request.method,
      route: safeRoute(request),
      statusCode: mapped.error.status,
      errorCode: mapped.error.code,
      durationMs: Math.max(0, monotonicNow() - context.startedAt),
    };
    context.logger[mapped.error.logLevel](fields, "API request failed.");
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
  return server;
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

function parseByteCount(value: string | undefined): number | undefined {
  if (value === undefined || !/^\d+$/u.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function responseByteCount(payload: unknown): number | undefined {
  if (typeof payload === "string") return Buffer.byteLength(payload);
  if (Buffer.isBuffer(payload)) return payload.byteLength;
  if (payload instanceof Uint8Array) return payload.byteLength;
  return undefined;
}
