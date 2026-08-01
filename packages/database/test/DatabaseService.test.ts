import { describe, expect, it, vi } from "vitest";

import {
  DatabaseConfiguration,
  DatabaseService,
  HealthState,
  ReadinessState,
  type ClientFactory,
  type DatabaseClient,
} from "../src/index.js";

function configuration(startupTimeoutMs = 1_000): DatabaseConfiguration {
  return DatabaseConfiguration.from({
    databaseUrl: "postgresql://test:test@localhost/qbox_test",
    environment: "test",
    startupTimeoutMs,
  });
}

function factory(client: DatabaseClient): ClientFactory {
  return { create: vi.fn(() => client) };
}

describe("DatabaseService", () => {
  it("transitions from LIVE to READY and then LIVE stopped", async () => {
    const client = {
      start: vi.fn(async () => {}),
      stop: vi.fn(async () => {}),
    };
    const service = new DatabaseService(configuration(), factory(client));
    expect(service.health()).toEqual({
      health: HealthState.LIVE,
      readiness: ReadinessState.REJECTING,
      lifecycle: "CREATED",
    });
    expect(await service.start()).toEqual({
      started: true,
      state: "READY",
      cleanupAttempted: false,
    });
    expect(service.health()).toEqual({
      health: HealthState.READY,
      readiness: ReadinessState.ACCEPTING,
      lifecycle: "READY",
    });
    expect(await service.stop()).toEqual({ stopped: true, state: "STOPPED" });
    expect(service.health()).toEqual({
      health: HealthState.LIVE,
      readiness: ReadinessState.REJECTING,
      lifecycle: "STOPPED",
    });
  });

  it("is idempotent after successful startup and shutdown", async () => {
    const client = {
      start: vi.fn(async () => {}),
      stop: vi.fn(async () => {}),
    };
    const service = new DatabaseService(configuration(), factory(client));
    await service.start();
    await service.start();
    await service.stop();
    await service.stop();
    expect(client.start).toHaveBeenCalledTimes(1);
    expect(client.stop).toHaveBeenCalledTimes(1);
  });

  it("attempts cleanup and becomes DEGRADED after startup failure", async () => {
    const client = {
      start: vi.fn(async () => Promise.reject(new Error("contains secret"))),
      stop: vi.fn(async () => {}),
    };
    const service = new DatabaseService(configuration(), factory(client));
    expect(await service.start()).toEqual({
      started: false,
      state: "FAILED",
      reason: "database-startup-failed",
      cleanupAttempted: true,
      cleanupSucceeded: true,
    });
    expect(service.health()).toEqual({
      health: HealthState.DEGRADED,
      readiness: ReadinessState.REJECTING,
      lifecycle: "FAILED",
      reason: "database-startup-failed",
    });
    expect(JSON.stringify(service.health())).not.toContain("secret");
  });

  it("reports cleanup failure without exposing client errors", async () => {
    const client = {
      start: vi.fn(async () => Promise.reject(new Error("url secret"))),
      stop: vi.fn(async () => Promise.reject(new Error("password secret"))),
    };
    const service = new DatabaseService(configuration(), factory(client));
    expect(await service.start()).toEqual({
      started: false,
      state: "FAILED",
      reason: "database-startup-cleanup-failed",
      cleanupAttempted: true,
      cleanupSucceeded: false,
    });
  });

  it("bounds startup and cleans up a timed-out client", async () => {
    vi.useFakeTimers();
    let startupSignal: AbortSignal | undefined;
    const client = {
      start: vi.fn((signal: AbortSignal) => {
        startupSignal = signal;
        return new Promise<void>(() => {});
      }),
      stop: vi.fn(async () => {}),
    };
    const service = new DatabaseService(configuration(100), factory(client));
    const result = service.start();
    await vi.advanceTimersByTimeAsync(100);
    await expect(result).resolves.toEqual({
      started: false,
      state: "FAILED",
      reason: "database-startup-timeout",
      cleanupAttempted: true,
      cleanupSucceeded: true,
    });
    expect(startupSignal?.aborted).toBe(true);
    expect(startupSignal?.reason).toBe("database-startup-timeout");
    vi.useRealTimers();
  });

  it("becomes DEGRADED when shutdown fails", async () => {
    const client = {
      start: vi.fn(async () => {}),
      stop: vi.fn(async () => Promise.reject(new Error("private"))),
    };
    const service = new DatabaseService(configuration(), factory(client));
    await service.start();
    expect(await service.stop()).toEqual({
      stopped: false,
      state: "FAILED",
      reason: "database-shutdown-failed",
    });
    expect(service.health().health).toBe(HealthState.DEGRADED);
  });
});
