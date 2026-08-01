import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import {
  StaticApiHealthProvider,
  type ApiComponentHealth,
} from "../src/health/ApiHealth.js";
import type { ApiLogFields, ApiLogger } from "../src/logging/ApiLogger.js";
import type {
  ApiRequestMeasurement,
  MetricsRecorder,
} from "../src/metrics/MetricsRecorder.js";

interface CapturedLog {
  readonly level: string;
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

  public info(fields: ApiLogFields, message: string): void {
    this.write("info", fields, message);
  }

  public warn(fields: ApiLogFields, message: string): void {
    this.write("warn", fields, message);
  }

  public error(fields: ApiLogFields, message: string): void {
    this.write("error", fields, message);
  }

  private write(level: string, fields: ApiLogFields, message: string): void {
    this.entries.push({ level, fields: { ...this.bindings, ...fields }, message });
  }
}

function configuration() {
  return ApiConfiguration.from({
    environment: "test",
    publicBaseUrl: "http://127.0.0.1:3000",
    buildVersion: "phase-1-test",
  });
}

describe("createApiServer", () => {
  it("constructs an unbound server without health or process side effects", async () => {
    let snapshots = 0;
    const signalCount = process.listenerCount("SIGTERM");
    const server = createApiServer({
      configuration: configuration(),
      health: {
        snapshot: () => {
          snapshots += 1;
          return [];
        },
        isStopping: () => false,
      },
    });
    expect(server.server.listening).toBe(false);
    expect(snapshots).toBe(0);
    expect(process.listenerCount("SIGTERM")).toBe(signalCount);
    await server.close();
  });

  it("serves all health endpoints through injection with a version header", async () => {
    const fixedNow = new Date("2026-08-01T12:00:00.000Z");
    const server = createApiServer({
      configuration: configuration(),
      now: () => fixedNow,
    });
    for (const path of ["/health/live", "/health/ready", "/health/degraded"]) {
      const response = await server.inject({ method: "GET", url: path });
      expect(response.statusCode).toBe(200);
      expect(response.headers["x-qbox-version"]).toBe("phase-1-test");
      expect(response.json()).toMatchObject({
        service: "qbox-api",
        version: "phase-1-test",
        timestamp: fixedNow.toISOString(),
        liveness: "live",
        readiness: "ready",
        degraded: false,
      });
    }
    await server.close();
  });

  it.each([
    ["degraded", true, 503],
    ["unavailable", true, 503],
    ["live", true, 503],
    ["degraded", false, 200],
  ] as const)(
    "maps %s required=%s to readiness %s",
    async (state, required, expectedReadyStatus) => {
      const components: ApiComponentHealth[] = [
        { name: "database", state, required, reasonCode: "safe-reason" },
      ];
      const server = createApiServer({
        configuration: configuration(),
        health: new StaticApiHealthProvider(components),
      });
      const ready = await server.inject({ method: "GET", url: "/health/ready" });
      const degraded = await server.inject({ method: "GET", url: "/health/degraded" });
      expect(ready.statusCode).toBe(expectedReadyStatus);
      expect(degraded.statusCode).toBe(200);
      expect(degraded.json()).toMatchObject({
        degraded: state === "degraded" || state === "unavailable",
        components,
      });
      await server.close();
    },
  );

  it("returns 503 liveness while stopping", async () => {
    const server = createApiServer({
      configuration: configuration(),
      health: new StaticApiHealthProvider([], true),
    });
    const response = await server.inject({ method: "GET", url: "/health/live" });
    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({
      liveness: "stopping",
      readiness: "not-ready",
    });
    await server.close();
  });

  it("generates request IDs and validates client correlation IDs", async () => {
    const logger = new CapturingLogger();
    const server = createApiServer({ configuration: configuration(), logger });
    const accepted = randomUUID();
    const valid = await server.inject({
      method: "GET",
      url: "/health/live",
      headers: { "x-correlation-id": accepted },
    });
    expect(valid.headers["x-correlation-id"]).toBe(accepted);
    expect(valid.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
    );

    const invalid = await server.inject({
      method: "GET",
      url: "/health/live",
      headers: { "x-correlation-id": "untrusted-value" },
    });
    expect(invalid.headers["x-correlation-id"]).not.toBe("untrusted-value");
    expect(invalid.headers["x-correlation-id"]).toMatch(/^[0-9a-f-]{36}$/u);
    await server.close();
  });

  it("uses one problem-details envelope for unknown routes", async () => {
    const server = createApiServer({ configuration: configuration() });
    const response = await server.inject({ method: "GET", url: "/api/v1/missing" });
    expect(response.statusCode).toBe(404);
    expect(response.headers["content-type"]).toContain("application/problem+json");
    expect(response.json()).toMatchObject({
      status: 404,
      code: "RESOURCE_NOT_FOUND",
      title: "Resource not found",
    });
    expect(response.json()).not.toHaveProperty("stack");
    await server.close();
  });

  it("maps malformed JSON to a safe validation problem", async () => {
    const server = createApiServer({ configuration: configuration() });
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/missing",
      headers: { "content-type": "application/json" },
      payload: "{invalid-json",
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      code: "VALIDATION_FAILED",
      detail: "The request is invalid.",
    });
    expect(response.json()).not.toHaveProperty("stack");
    await server.close();
  });

  it("logs safe fields and byte counts without headers, cookies, or bodies", async () => {
    const logger = new CapturingLogger();
    const measurements: ApiRequestMeasurement[] = [];
    const metrics: MetricsRecorder = {
      recordRequest: (measurement) => measurements.push(measurement),
      recordTransportEvent: () => undefined,
    };
    const server = createApiServer({
      configuration: configuration(),
      logger,
      metrics,
    });
    await server.inject({
      method: "POST",
      url: "/missing",
      headers: {
        authorization: "Bearer do-not-log-token",
        cookie: "session=do-not-log-cookie",
        "content-type": "application/json",
      },
      payload: { password: "do-not-log-password" },
    });
    const serialized = JSON.stringify(logger.entries);
    expect(serialized).toContain("api.request.received");
    expect(serialized).toContain("api.request.failed");
    expect(serialized).toContain("api.request.completed");
    expect(serialized).not.toContain("do-not-log-token");
    expect(serialized).not.toContain("do-not-log-cookie");
    expect(serialized).not.toContain("do-not-log-password");
    expect(measurements[0]?.requestBytes).toBeGreaterThan(0);
    expect(measurements[0]?.responseBytes).toBeGreaterThan(0);
    await server.close();
  });
});
