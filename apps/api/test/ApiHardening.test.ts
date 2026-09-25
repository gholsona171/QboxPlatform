import { request as httpRequest } from "node:http";
import { createConnection } from "node:net";
import { describe, expect, it, vi } from "vitest";
import { ApiConfiguration, type ApiConfigurationInput } from "../src/config/ApiConfiguration.js";
import {
  beginApiTransportShutdown,
  createApiServer,
} from "../src/createApiServer.js";
import type { ApiLogFields, ApiLogger } from "../src/logging/ApiLogger.js";

interface CapturedLog {
  readonly fields: ApiLogFields;
  readonly message: string;
}

class CapturingLogger implements ApiLogger {
  public constructor(
    public readonly entries: CapturedLog[] = [],
    private readonly bindings: ApiLogFields = {},
  ) {}
  public child(bindings: ApiLogFields): ApiLogger {
    return new CapturingLogger(this.entries, { ...this.bindings, ...bindings });
  }
  public info(fields: ApiLogFields, message: string): void { this.write(fields, message); }
  public warn(fields: ApiLogFields, message: string): void { this.write(fields, message); }
  public error(fields: ApiLogFields, message: string): void { this.write(fields, message); }
  private write(fields: ApiLogFields, message: string): void {
    this.entries.push({ fields: { ...this.bindings, ...fields }, message });
  }
}

function configuration(input: ApiConfigurationInput = {}) {
  return ApiConfiguration.from({
    environment: "test",
    publicBaseUrl: "http://127.0.0.1:3000",
    ...input,
  });
}

describe("API transport hardening", () => {
  it("rejects unexpected hosts with a normalized problem", async () => {
    const server = createApiServer({ configuration: configuration() });
    const response = await server.inject({
      method: "GET",
      url: "/health/live",
      headers: { host: "evil.example" },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "INVALID_HOST" });
    expect(response.headers["content-type"]).toContain("application/problem+json");
    await server.close();
  });

  it("records safe metrics for transport rejection", async () => {
    const events: { code: string; route: string; statusCode: number }[] = [];
    const server = createApiServer({
      configuration: configuration(),
      metrics: {
        recordRequest: () => undefined,
        recordTransportEvent: (event) => events.push(event),
      },
    });
    await server.inject({ method: "GET", url: "/health/live", headers: { host: "evil.example" } });
    expect(events).toEqual([{ code: "INVALID_HOST", route: "/health/live", statusCode: 400 }]);
    await server.close();
  });

  it("exposes an injectable rate-limit denial boundary while default remains disabled", async () => {
    const server = createApiServer({
      configuration: configuration(),
      rateLimit: { evaluate: async () => ({ allowed: false }) },
    });
    const response = await server.inject({ method: "GET", url: "/health/live" });
    expect(response.statusCode).toBe(429);
    expect(response.json()).toMatchObject({ code: "RATE_LIMITED" });
    await server.close();
  });

  it("ignores forwarded host metadata from untrusted peers", async () => {
    const logger = new CapturingLogger();
    const server = createApiServer({ configuration: configuration(), logger });
    const response = await server.inject({
      method: "GET",
      url: "/health/live",
      headers: { host: "127.0.0.1:3000", "x-forwarded-host": "evil.example" },
      remoteAddress: "203.0.113.10",
    });
    expect(response.statusCode).toBe(200);
    expect(logger.entries).toEqual(expect.arrayContaining([
      expect.objectContaining({
        fields: expect.objectContaining({ event: "api.transport.untrusted-forwarded-metadata" }),
      }),
    ]));
    await server.close();
  });

  it("accepts forwarded host only from an allowlisted proxy", async () => {
    const server = createApiServer({
      configuration: configuration({ trustProxy: ["127.0.0.1"] }),
    });
    const response = await server.inject({
      method: "GET",
      url: "/health/live",
      headers: { host: "internal.invalid", "x-forwarded-host": "127.0.0.1:3000" },
      remoteAddress: "127.0.0.1",
    });
    expect(response.statusCode).toBe(200);
    await server.close();
  });

  it("accepts configured public API hosts separate from the browser public base URL", async () => {
    const server = createApiServer({
      configuration: configuration({
        publicBaseUrl: "https://qbox.example.com",
        allowedHosts: ["qbox-vps.tailnet.ts.net"],
      }),
    });
    const response = await server.inject({
      method: "GET",
      url: "/health/live",
      headers: { host: "qbox-vps.tailnet.ts.net" },
    });
    expect(response.statusCode).toBe(200);
    await server.close();
  });

  it("accepts loopback health checks in development even when the browser base is public", async () => {
    const server = createApiServer({
      configuration: configuration({
        environment: "development",
        publicBaseUrl: "https://qbox.example.com",
      }),
    });
    const response = await server.inject({
      method: "GET",
      url: "/health/live",
      headers: { host: "127.0.0.1:3000" },
    });
    expect(response.statusCode).toBe(200);
    await server.close();
  });

  it("rejects malformed metadata from trusted proxies and malformed origins", async () => {
    const logger = new CapturingLogger();
    const server = createApiServer({
      configuration: configuration({ trustProxy: ["127.0.0.1"] }),
      logger,
    });
    const forwarded = await server.inject({
      method: "GET", url: "/health/live", remoteAddress: "127.0.0.1",
      headers: { host: "127.0.0.1:3000", "x-forwarded-for": "not-an-ip" },
    });
    expect(forwarded.statusCode).toBe(400);
    expect(forwarded.json()).toMatchObject({ code: "INVALID_REQUEST_HEADERS" });
    expect(logger.entries).toEqual(expect.arrayContaining([
      expect.objectContaining({
        fields: expect.objectContaining({ event: "api.transport.invalid-forwarded-metadata" }),
      }),
    ]));
    const origin = await server.inject({
      method: "GET", url: "/health/live",
      headers: { host: "127.0.0.1:3000", origin: "https://user:secret@example.com/path" },
    });
    expect(origin.statusCode).toBe(400);
    expect(origin.json()).toMatchObject({ code: "INVALID_REQUEST_HEADERS" });
    await server.close();
  });

  it("rejects overlong user agents and duplicate sensitive headers", async () => {
    const server = createApiServer({ configuration: configuration({ port: 0 }) });
    const overlong = await server.inject({
      method: "GET", url: "/health/live", headers: { "user-agent": "x".repeat(1_025) },
    });
    expect(overlong.statusCode).toBe(400);
    expect(overlong.json()).toMatchObject({ code: "INVALID_REQUEST_HEADERS" });
    await server.listen({ host: "127.0.0.1", port: 0 });
    const duplicate = await rawHttpRequest(server, [
      "GET /health/live HTTP/1.1",
      "Host: 127.0.0.1",
      "Host: evil.example",
      "Connection: close",
      "",
      "",
    ].join("\r\n"));
    expect(duplicate).toContain("400 Bad Request");
    expect(duplicate).toContain('"code":"INVALID_REQUEST_HEADERS"');
    await server.close();
  });

  it("normalizes parser-level control and framing ambiguity errors", async () => {
    const server = createApiServer({ configuration: configuration({ port: 0 }) });
    await server.listen({ host: "127.0.0.1", port: 0 });
    const control = await rawHttpRequest(server, [
      "GET /health/live HTTP/1.1",
      "Host: 127.0.0.1",
      "X-Test: unsafe\u0000value",
      "Connection: close",
      "",
      "",
    ].join("\r\n"));
    expect(control).toContain('"code":"INVALID_REQUEST_HEADERS"');
    const ambiguous = await rawHttpRequest(server, [
      "POST /api/v1/missing HTTP/1.1",
      "Host: 127.0.0.1",
      "Content-Type: application/json",
      "Content-Length: 2",
      "Transfer-Encoding: chunked",
      "Connection: close",
      "",
      "{}",
    ].join("\r\n"));
    expect(ambiguous).toContain('"code":"INVALID_REQUEST_HEADERS"');
    await server.close();
  });

  it("rejects oversized JSON before route handling", async () => {
    const server = createApiServer({
      configuration: configuration({ bodySizeLimitBytes: 1_024 }),
    });
    server.post("/api/v1/input", async () => ({ ok: true }));
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/input",
      headers: { "content-type": "application/json" },
      payload: { value: "x".repeat(2_000) },
    });
    expect(response.statusCode).toBe(413);
    expect(response.json()).toMatchObject({ code: "PAYLOAD_TOO_LARGE" });
    await server.close();
  });

  it.each([
    ["text/plain", "text"],
    ["application/x-www-form-urlencoded", "key=value"],
    ["multipart/form-data; boundary=test", "--test--"],
  ])("rejects unsupported content type %s", async (contentType, payload) => {
    const server = createApiServer({ configuration: configuration() });
    server.post("/api/v1/input", async () => ({ ok: true }));
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/input",
      headers: { "content-type": contentType },
      payload,
    });
    expect(response.statusCode).toBe(415);
    expect(response.json()).toMatchObject({ code: "UNSUPPORTED_MEDIA_TYPE" });
    await server.close();
  });

  it("maps malformed and empty JSON through validation errors", async () => {
    const server = createApiServer({ configuration: configuration() });
    server.post("/api/v1/input", async () => ({ ok: true }));
    const malformed = await server.inject({
      method: "POST", url: "/api/v1/input",
      headers: { "content-type": "application/json" }, payload: "{bad",
    });
    expect(malformed.statusCode).toBe(400);
    expect(malformed.json()).toMatchObject({ code: "VALIDATION_FAILED" });
    const empty = await server.inject({
      method: "POST", url: "/api/v1/input",
      headers: { "content-type": "application/json", "content-length": "0" }, payload: "",
    });
    expect(empty.statusCode).toBe(400);
    expect(empty.json()).toMatchObject({ code: "VALIDATION_FAILED" });
    await server.close();
  });

  it("rejects bodies on health GET routes", async () => {
    const server = createApiServer({ configuration: configuration() });
    const response = await server.inject({
      method: "GET", url: "/health/live", payload: "unexpected",
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "VALIDATION_FAILED" });
    await server.close();
  });

  it("applies API security headers without permissive CORS", async () => {
    const server = createApiServer({ configuration: configuration() });
    for (const url of ["/health/live", "/missing"]) {
      const response = await server.inject({ method: "GET", url });
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
      expect(response.headers["referrer-policy"]).toBe("no-referrer");
      expect(response.headers["cache-control"]).toBe("no-store");
      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    }
    const preflight = await server.inject({
      method: "OPTIONS", url: "/api/v1/missing",
      headers: { origin: "https://panel.example.com", "access-control-request-method": "GET" },
    });
    expect(preflight.statusCode).toBe(404);
    expect(preflight.headers["access-control-allow-origin"]).toBeUndefined();
    await server.close();
  });

  it("refuses a future CORS allowlist until enforcement is implemented", () => {
    expect(() => createApiServer({
      configuration: configuration({
        corsPolicy: { mode: "allowlist", origins: ["https://panel.example.com"], credentials: false },
      }),
    })).toThrow("not implemented");
  });

  it("maps handler deadlines and aborts the request context", async () => {
    const server = createApiServer({
      configuration: configuration({ requestTimeoutMs: 100 }),
    });
    let aborted = false;
    server.get("/api/v1/slow", async (request) => {
      await new Promise<void>((resolve) => {
        request.apiContext.signal.addEventListener("abort", () => {
          aborted = true;
          resolve();
        }, { once: true });
      });
      return { completed: true };
    });
    const response = await server.inject({ method: "GET", url: "/api/v1/slow" });
    expect(response.statusCode).toBe(408);
    expect(response.json()).toMatchObject({ code: "REQUEST_TIMEOUT" });
    expect(aborted).toBe(true);
    await server.close();
  });

  it("aborts cooperative contexts after the shutdown grace window", async () => {
    const server = createApiServer({ configuration: configuration() });
    let started = false;
    server.get("/api/v1/shutdown", async (request) => {
      started = true;
      await new Promise<void>((resolve) =>
        request.apiContext.signal.addEventListener("abort", () => resolve(), { once: true }),
      );
      return { aborted: request.apiContext.signal.aborted };
    });
    const pending = server.inject({ method: "GET", url: "/api/v1/shutdown" });
    await vi.waitFor(() => expect(started).toBe(true));
    beginApiTransportShutdown(server, 10);
    expect((await pending).json()).toEqual({ aborted: true });
    await server.close();
  });

  it("propagates live client disconnect cancellation", async () => {
    const server = createApiServer({ configuration: configuration({ port: 0 }) });
    let aborted = false;
    let started = false;
    server.get("/api/v1/disconnect", async (request) => {
      started = true;
      await new Promise<void>((resolve) =>
        request.apiContext.signal.addEventListener("abort", () => {
          aborted = true;
          resolve();
        }, { once: true }),
      );
      return { ok: true };
    });
    await server.listen({ host: "127.0.0.1", port: 0 });
    const address = server.server.address();
    if (address === null || typeof address === "string") throw new Error("Expected TCP address.");
    const client = httpRequest({ host: "127.0.0.1", port: address.port, path: "/api/v1/disconnect" });
    client.on("error", () => undefined);
    client.end();
    await vi.waitFor(() => expect(started).toBe(true));
    client.destroy();
    await vi.waitFor(() => expect(aborted).toBe(true));
    await server.close();
  });

  it("does not retain sensitive rejected values in structured logs", async () => {
    const logger = new CapturingLogger();
    const server = createApiServer({ configuration: configuration(), logger });
    await server.inject({
      method: "POST", url: "/api/v1/missing",
      headers: {
        host: "evil.example",
        authorization: "Bearer sensitive-token",
        cookie: "session=sensitive-cookie",
        "content-type": "application/json",
      },
      payload: { password: "sensitive-password" },
    });
    const serialized = JSON.stringify(logger.entries);
    expect(serialized).toContain("api.transport.invalid-host");
    expect(serialized).not.toContain("sensitive-token");
    expect(serialized).not.toContain("sensitive-cookie");
    expect(serialized).not.toContain("sensitive-password");
    expect(serialized).not.toContain("evil.example");
    await server.close();
  });
});

async function rawHttpRequest(
  server: ReturnType<typeof createApiServer>,
  payload: string,
): Promise<string> {
  const address = server.server.address();
  if (address === null || typeof address === "string") throw new Error("Expected TCP address.");
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const socket = createConnection({ host: "127.0.0.1", port: address.port }, () => socket.write(payload));
    socket.on("data", (chunk: Buffer) => chunks.push(chunk));
    socket.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    socket.on("error", reject);
  });
}
