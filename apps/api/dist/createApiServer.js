import { randomUUID } from "node:crypto";
import { BlockList, isIP } from "node:net";
import fastify, {} from "fastify";
import { logger as defaultLogger } from "@qbox/logger";
import { createApiRequestContext, } from "./context/ApiRequestContext.js";
import { mapApiError, InvalidHostApiError, InvalidRequestHeadersApiError, NotFoundApiError, PayloadTooLargeApiError, RateLimitedApiError, UnsupportedMediaTypeApiError, ValidationApiError, } from "./errors/ApiError.js";
import { aggregateApiHealth, StaticApiHealthProvider, } from "./health/ApiHealth.js";
import { noOpMetricsRecorder, } from "./metrics/MetricsRecorder.js";
import { createRequestTimings, runWithRequestTimings, serverTimingHeader, SLOW_REQUEST_MS, } from "./metrics/RequestTimings.js";
import { noOpRateLimitEvaluator, } from "./security/ApiTransportPolicies.js";
const requestTimings = new WeakMap();
const transportStates = new WeakMap();
/**
 * Creates a fully configured Fastify transport without starting any lifecycle.
 *
 * The factory never binds a socket, reads process environment, starts a kernel,
 * or accesses persistence. All stateful boundaries are injected.
 */
export function createApiServer(dependencies) {
    const diagnostics = dependencies.configuration.diagnostics();
    const parentLogger = dependencies.logger ?? defaultLogger;
    const health = dependencies.health ?? new StaticApiHealthProvider();
    const metrics = dependencies.metrics ?? noOpMetricsRecorder;
    const rateLimit = dependencies.rateLimit ?? noOpRateLimitEvaluator;
    const now = dependencies.now ?? (() => new Date());
    const monotonicNow = dependencies.monotonicNow ?? (() => performance.now());
    const observations = new WeakMap();
    const transportState = { activeControllers: new Set() };
    const trustedProxies = createTrustedProxyBlockList(diagnostics.trustProxy);
    if (diagnostics.corsPolicy.mode !== "disabled")
        throw new Error("CORS allowlist enforcement is not implemented.");
    const server = fastify({
        logger: false,
        bodyLimit: diagnostics.bodySizeLimitBytes,
        requestTimeout: diagnostics.requestTimeoutMs,
        handlerTimeout: diagnostics.requestTimeoutMs,
        keepAliveTimeout: diagnostics.keepAliveTimeoutMs,
        trustProxy: diagnostics.trustProxy.mode === "allowlist"
            ? [...diagnostics.trustProxy.addresses]
            : false,
        genReqId: () => randomUUID(),
        http: { maxHeaderSize: diagnostics.headerSizeLimitBytes },
        clientErrorHandler: (error, socket) => handleClientError(error, socket, diagnostics.buildVersion, parentLogger),
    });
    transportStates.set(server, transportState);
    server.decorateRequest("apiContext");
    // Database and Discord work done for this request is counted from here on.
    server.addHook("onRequest", (request, _reply, done) => {
        const timings = createRequestTimings();
        requestTimings.set(request, timings);
        runWithRequestTimings(timings, () => done());
    });
    server.addHook("onRequest", async (request, reply) => {
        const controller = new AbortController();
        transportState.activeControllers.add(controller);
        const signal = AbortSignal.any([request.signal, controller.signal]);
        const context = createApiRequestContext(request, parentLogger, signal, monotonicNow);
        request.apiContext = context;
        reply.header("x-request-id", context.requestId);
        reply.header("x-correlation-id", context.correlationId);
        applySecurityHeaders(reply);
        const requestBytes = parseContentLength(request.headers["content-length"]);
        observations.set(request, {
            ...(requestBytes === undefined ? {} : { requestBytes }),
            controller,
        });
        context.logger.info({
            event: "api.request.received",
            method: request.method,
            route: safeRoute(request),
            clientIp: context.clientIp,
            ...(requestBytes === undefined ? {} : { requestBytes }),
        }, "API request received.");
        validateHeaders(request, diagnostics, trustedProxies, context.logger);
        if (requestBytes !== undefined && requestBytes > (uploadRoute(request)?.bodyLimit ?? diagnostics.bodySizeLimitBytes))
            throw new PayloadTooLargeApiError();
        validateBodylessMethod(request);
        const rateLimitDecision = await rateLimit.evaluate({
            context,
            method: request.method,
            route: safeRoute(request),
        });
        if (!rateLimitDecision.allowed)
            throw new RateLimitedApiError();
    });
    server.addHook("preValidation", async (request) => {
        validateContentType(request);
    });
    server.addHook("onRequestAbort", async (request) => {
        const context = request.apiContext ?? fallbackContext(request, parentLogger);
        const observation = observations.get(request);
        observation?.controller.abort("client-disconnected");
        context.logger.warn({ event: "api.transport.client-disconnected", route: safeRoute(request) }, "API client disconnected before request completion.");
    });
    server.addHook("onSend", async (_request, reply, payload) => {
        applySecurityHeaders(reply, { keepCacheControl: true });
        reply.header("x-qbox-version", diagnostics.buildVersion);
        const timings = requestTimings.get(_request);
        if (timings !== undefined && isApiPath(_request)) {
            const startedAt = _request.apiContext?.startedAt;
            reply.header("server-timing", serverTimingHeader(timings, startedAt === undefined ? 0 : Math.max(0, monotonicNow() - startedAt)));
        }
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
        const timings = requestTimings.get(request);
        const work = timings === undefined
            ? {}
            : {
                dbQueries: timings.dbQueries,
                dbMs: Math.round(timings.dbMs),
                discordCalls: timings.discordCalls,
                discordMs: Math.round(timings.discordMs),
            };
        context.logger.info({ event: "api.request.completed", ...measurement, ...work }, "API request completed.");
        if (durationMs > SLOW_REQUEST_MS && isApiPath(request))
            context.logger.warn({ event: "api.request.slow", ...measurement, ...work }, "Slow API request.");
        try {
            metrics.recordRequest(measurement);
        }
        catch {
            context.logger.error({ event: "api.metrics.recording-failed" }, "API request metrics recording failed.");
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
        }
        catch {
            context.logger.error({ event: "api.metrics.recording-failed" }, "API transport metrics recording failed.");
        }
        if (reply.sent || reply.raw.destroyed)
            return;
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
    if (dependencies.registerRoutes !== undefined)
        void server.register(async (instance) => {
            await dependencies.registerRoutes?.(instance);
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
export function beginApiTransportShutdown(server, graceMs) {
    const state = transportStates.get(server);
    if (state === undefined || state.shutdownTimer !== undefined)
        return;
    state.shutdownTimer = setTimeout(() => {
        for (const controller of state.activeControllers)
            controller.abort("api-shutdown");
    }, Math.max(1, graceMs));
}
function fallbackContext(request, logger) {
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
function safeRoute(request) {
    return request.routeOptions.url || "unmatched";
}
function parseContentLength(value) {
    if (value === undefined)
        return undefined;
    if (typeof value !== "string" || !/^\d+$/u.test(value))
        throw new InvalidRequestHeadersApiError();
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed))
        throw new InvalidRequestHeadersApiError();
    return parsed;
}
function responseByteCount(payload) {
    if (typeof payload === "string")
        return Buffer.byteLength(payload);
    if (Buffer.isBuffer(payload))
        return payload.byteLength;
    if (payload instanceof Uint8Array)
        return payload.byteLength;
    return undefined;
}
/**
 * Security headers for every response. Responses are `no-store` unless a
 * route chose its own caching (the portal's static files revalidate by ETag).
 */
function applySecurityHeaders(reply, options = {}) {
    reply.header("x-content-type-options", "nosniff");
    reply.header("referrer-policy", "no-referrer");
    if (!options.keepCacheControl || !reply.hasHeader("cache-control"))
        reply.header("cache-control", "no-store");
}
function isApiPath(request) {
    return (request.raw.url ?? request.url).startsWith("/api/");
}
function validateHeaders(request, diagnostics, trustedProxies, logger) {
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
        logger.warn({ event: "api.transport.untrusted-forwarded-metadata", route: safeRoute(request) }, "Untrusted forwarded request metadata ignored.");
    }
    if (forwarded && trusted)
        validateForwardedHeaders(request, logger);
    const forwardedHost = trusted ? singleHeader(request.headers["x-forwarded-host"]) : undefined;
    const candidate = forwardedHost ?? singleHeader(request.headers.host);
    if (!isAllowedHost(candidate, diagnostics))
        throw new InvalidHostApiError();
}
function validateForwardedHeaders(request, logger) {
    const reject = () => {
        logger.warn({ event: "api.transport.invalid-forwarded-metadata", route: safeRoute(request) }, "API rejected invalid forwarded request metadata.");
        throw new InvalidRequestHeadersApiError();
    };
    if (request.headers.forwarded !== undefined)
        reject();
    const forwardedFor = singleHeader(request.headers["x-forwarded-for"]);
    if (forwardedFor !== undefined &&
        (forwardedFor.length > 1_024 ||
            forwardedFor.split(",").some((value) => isIP(value.trim()) === 0)))
        reject();
    const forwardedProto = singleHeader(request.headers["x-forwarded-proto"]);
    if (forwardedProto !== undefined && forwardedProto !== "http" && forwardedProto !== "https")
        reject();
    const forwardedHost = singleHeader(request.headers["x-forwarded-host"]);
    if (forwardedHost !== undefined && (forwardedHost.length > 255 || forwardedHost.includes(",")))
        reject();
}
function validateBodylessMethod(request) {
    if (request.method !== "GET" && request.method !== "HEAD")
        return;
    const length = parseContentLength(request.headers["content-length"]);
    if ((length ?? 0) > 0 || request.headers["transfer-encoding"] !== undefined)
        throw new ValidationApiError([{ path: "body", code: "BODY_NOT_ALLOWED" }]);
}
function uploadRoute(request) {
    return request.routeOptions.config?.upload;
}
function validateContentType(request) {
    if (!["POST", "PUT", "PATCH"].includes(request.method))
        return;
    const pathname = request.raw.url?.split("?", 1)[0] ?? "";
    if (!pathname.startsWith("/api/"))
        return;
    const contentType = singleHeader(request.headers["content-type"]);
    const upload = uploadRoute(request);
    const accepted = upload ? upload.contentType.test(contentType ?? "") : /^application\/json(?:\s*;\s*charset=utf-8)?$/iu.test(contentType ?? "");
    if (contentType === undefined || !accepted)
        throw new UnsupportedMediaTypeApiError();
    const length = parseContentLength(request.headers["content-length"]);
    if ((length ?? 0) === 0 && request.headers["transfer-encoding"] === undefined)
        throw new ValidationApiError([{ path: "body", code: "BODY_REQUIRED" }]);
}
function duplicateHeaderNames(rawHeaders) {
    const seen = new Set();
    const duplicates = new Set();
    for (let index = 0; index < rawHeaders.length; index += 2) {
        const name = rawHeaders[index]?.toLowerCase();
        if (name === undefined)
            continue;
        if (seen.has(name))
            duplicates.add(name);
        seen.add(name);
    }
    return duplicates;
}
function singleHeader(value) {
    return typeof value === "string" ? value : undefined;
}
function isAllowedHost(value, diagnostics) {
    if (value === undefined || value.length > 255 || value.includes(","))
        return false;
    let parsed;
    try {
        parsed = new URL(`http://${value}`);
    }
    catch {
        return false;
    }
    if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash)
        return false;
    const expected = new URL(diagnostics.publicBaseUrl);
    if (parsed.host.toLowerCase() === expected.host.toLowerCase())
        return true;
    if (diagnostics.allowedHosts.includes(parsed.host.toLowerCase()))
        return true;
    if (diagnostics.environment === "production")
        return false;
    return isLoopbackHostname(parsed.hostname);
}
function isLoopbackHostname(hostname) {
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "::1";
}
function isValidOrigin(value) {
    if (value.length > 2_048)
        return false;
    try {
        const origin = new URL(value);
        return ((origin.protocol === "http:" || origin.protocol === "https:") &&
            !origin.username &&
            !origin.password &&
            origin.pathname === "/" &&
            !origin.search &&
            !origin.hash);
    }
    catch {
        return false;
    }
}
function createTrustedProxyBlockList(policy) {
    if (policy.mode === "disabled")
        return undefined;
    const list = new BlockList();
    for (const address of policy.addresses) {
        const [host = "", prefix] = address.split("/");
        const type = isIP(host) === 6 ? "ipv6" : "ipv4";
        if (prefix === undefined)
            list.addAddress(host, type);
        else
            list.addSubnet(host, Number(prefix), type);
    }
    return list;
}
function normalizeRemoteAddress(value) {
    if (value?.startsWith("::ffff:") === true)
        return value.slice(7);
    return value;
}
function rejectionEvent(code) {
    const events = {
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
function handleClientError(_error, socket, version, logger) {
    const requestId = randomUUID();
    const correlationId = randomUUID();
    const mapped = mapApiError(new InvalidRequestHeadersApiError(), requestId, correlationId);
    const payload = JSON.stringify(mapped.problem);
    logger.warn({ event: "api.transport.invalid-headers", statusCode: 400, requestId, correlationId }, "API rejected malformed HTTP headers.");
    if (!socket.writable)
        return;
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
//# sourceMappingURL=createApiServer.js.map