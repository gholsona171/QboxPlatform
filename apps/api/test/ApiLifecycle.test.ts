import { EventBus, ServiceContainer } from "@qbox/core";
import type {
  DatabaseHealthSnapshot,
  DatabaseServiceContract,
  ShutdownResult,
  StartupResult,
} from "@qbox/database";
import type {
  PermissionAuthorizer,
  PermissionCatalogSynchronizationResult,
} from "@qbox/permissions";
import { describe, expect, it, vi } from "vitest";
import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { ApiLifecycleHealth } from "../src/lifecycle/ApiLifecycleHealth.js";
import { ApiModule } from "../src/lifecycle/ApiModule.js";
import { ApiPermissionPersistenceModule } from "../src/lifecycle/ApiPermissionPersistenceModule.js";
import { ApiApplication, createApiApplication } from "../src/composition/ApiApplication.js";
import { PlatformKernel } from "@qbox/core";

class FakeDatabase implements DatabaseServiceContract {
  public state: DatabaseHealthSnapshot = {
    health: "LIVE",
    readiness: "REJECTING",
    lifecycle: "CREATED",
  };
  public readonly events: string[] = [];
  public failStart = false;

  public async start(): Promise<StartupResult> {
    this.events.push("database:start");
    if (this.failStart)
      return { started: false, state: "FAILED", reason: "database-failed", cleanupAttempted: true };
    this.state = { health: "READY", readiness: "ACCEPTING", lifecycle: "READY" };
    return { started: true, state: "READY", cleanupAttempted: false };
  }

  public async stop(): Promise<ShutdownResult> {
    this.events.push("database:stop");
    this.state = { health: "LIVE", readiness: "REJECTING", lifecycle: "STOPPED" };
    return { stopped: true, state: "STOPPED" };
  }

  public health(): DatabaseHealthSnapshot {
    return this.state;
  }
}

const context = () => ({ services: new ServiceContainer(), events: new EventBus() });
const syncResult: PermissionCatalogSynchronizationResult = {
  status: {
    compiledVersion: "test",
    compiledChecksum: "sha256:test",
    persistedVersion: "test",
    persistedChecksum: "sha256:test",
    state: "synchronized",
  },
  unknownKeys: [],
  synchronizedDefinitions: 9,
};
const authorizer: PermissionAuthorizer = {
  authorize: async () => ({
    allowed: false,
    reason: "permission-denied",
    effectivePermissions: [],
    deniedPermissions: [],
    usedCache: false,
    degraded: false,
  }),
};

describe("API lifecycle composition", () => {
  it("starts database and catalog before binding HTTP, then stops HTTP first", async () => {
    const database = new FakeDatabase();
    const health = new ApiLifecycleHealth(database);
    const events = database.events;
    const persistence = new ApiPermissionPersistenceModule(
      database,
      { definitions: { synchronizeCatalog: async () => { events.push("catalog:sync"); return syncResult; } } },
      authorizer,
      async () => { events.push("cache:close"); },
      health,
    );
    const configuration = ApiConfiguration.from({ environment: "test", port: 0 });
    const server = createApiServer({ configuration, health });
    server.addHook("onListen", async () => { events.push("http:listen"); });
    server.addHook("onClose", async () => { events.push("http:close"); });
    const http = new ApiModule(server, configuration, health);
    await persistence.start(context());
    await http.start(context());
    expect(events.slice(0, 3)).toEqual(["database:start", "catalog:sync", "http:listen"]);
    expect(http.diagnostics()).toMatchObject({ host: "127.0.0.1" });
    expect(http.diagnostics()?.port).toBeGreaterThan(0);
    const ready = await server.inject({ method: "GET", url: "/health/ready" });
    expect(ready.statusCode).toBe(200);
    await http.stop();
    await persistence.stop();
    expect(events.slice(-3)).toEqual(["http:close", "cache:close", "database:stop"]);
  });

  it("never binds HTTP when database startup fails", async () => {
    const database = new FakeDatabase();
    database.failStart = true;
    const health = new ApiLifecycleHealth(database);
    const module = new ApiPermissionPersistenceModule(
      database,
      { definitions: { synchronizeCatalog: async () => syncResult } },
      authorizer,
      () => undefined,
      health,
    );
    await expect(module.start(context())).rejects.toThrow("database-failed");
    expect(health.snapshot().find((item) => item.name === "http")?.state).toBe("live");
  });

  it("cleans up the database when catalog synchronization fails", async () => {
    const database = new FakeDatabase();
    const health = new ApiLifecycleHealth(database);
    const module = new ApiPermissionPersistenceModule(
      database,
      { definitions: { synchronizeCatalog: async () => { throw new Error("catalog failed"); } } },
      authorizer,
      () => undefined,
      health,
    );
    await expect(module.start(context())).rejects.toThrow("catalog failed");
    expect(database.events).toEqual(["database:start", "database:stop"]);
    expect(health.snapshot().find((item) => item.name === "permission-catalog")?.state).toBe("degraded");
  });

  it("rejects an incomplete catalog synchronization result", async () => {
    const database = new FakeDatabase();
    const health = new ApiLifecycleHealth(database);
    const module = new ApiPermissionPersistenceModule(
      database,
      {
        definitions: {
          synchronizeCatalog: async () => ({
            ...syncResult,
            status: { ...syncResult.status, state: "checksum-mismatch" },
          }),
        },
      },
      authorizer,
      () => undefined,
      health,
    );
    await expect(module.start(context())).rejects.toThrow("did not reach synchronized");
    expect(database.events).toEqual(["database:start", "database:stop"]);
  });

  it("stops the database even when cache cleanup fails", async () => {
    const database = new FakeDatabase();
    const health = new ApiLifecycleHealth(database);
    const module = new ApiPermissionPersistenceModule(
      database,
      { definitions: { synchronizeCatalog: async () => syncResult } },
      authorizer,
      () => { throw new Error("cache cleanup failed"); },
      health,
    );
    await module.start(context());
    await expect(module.stop()).rejects.toThrow("cache cleanup failed");
    expect(database.events.at(-1)).toBe("database:stop");
  });

  it("rejects duplicate HTTP start", async () => {
    const database = new FakeDatabase();
    database.state = { health: "READY", readiness: "ACCEPTING", lifecycle: "READY" };
    const health = new ApiLifecycleHealth(database);
    health.markCatalogSynchronized();
    const configuration = ApiConfiguration.from({ environment: "test", port: 0 });
    const server = createApiServer({ configuration, health });
    const module = new ApiModule(server, configuration, health);
    await module.start(context());
    await expect(module.start(context())).rejects.toThrow("already started");
    await module.stop();
  });

  it("closes a server after listen failure", async () => {
    const database = new FakeDatabase();
    const health = new ApiLifecycleHealth(database);
    const configuration = ApiConfiguration.from({ environment: "test", port: 0 });
    const server = createApiServer({ configuration, health });
    vi.spyOn(server, "listen").mockRejectedValueOnce(new Error("listen failed"));
    const close = vi.spyOn(server, "close");
    const module = new ApiModule(server, configuration, health);
    await expect(module.start(context())).rejects.toThrow("listen failed");
    expect(close).toHaveBeenCalledOnce();
    expect(health.snapshot().find((item) => item.name === "http")?.state).toBe("degraded");
  });

  it("constructs each concrete module once without connecting or binding", async () => {
    const signalCount = process.listenerCount("SIGTERM");
    const application = createApiApplication({
      api: { environment: "test", port: 0 },
      databaseUrl: "postgresql://validation:validation@127.0.0.1:5432/qbox_validation_test",
    });
    expect(application.kernel.modules.list().map((module) => module.name)).toEqual([
      "api-permission-persistence",
      "api-http",
    ]);
    expect(application.apiModule.diagnostics()).toBeUndefined();
    expect(process.listenerCount("SIGTERM")).toBe(signalCount);
    await application.shutdown();
  });

  it("bounds application shutdown and marks readiness rejecting immediately", async () => {
    class HangingKernel extends PlatformKernel {
      public override async stop(): Promise<void> {
        await new Promise<void>(() => undefined);
      }
    }
    const database = new FakeDatabase();
    database.state = { health: "READY", readiness: "ACCEPTING", lifecycle: "READY" };
    const health = new ApiLifecycleHealth(database);
    health.markCatalogSynchronized();
    health.markHttp("listening");
    const configuration = ApiConfiguration.from({
      environment: "test",
      shutdownTimeoutMs: 100,
    });
    const server = createApiServer({ configuration, health });
    const application = new ApiApplication(
      new HangingKernel(),
      configuration,
      health,
      new ApiModule(server, configuration, health),
    );
    const shutdown = application.shutdown();
    expect(health.isStopping()).toBe(true);
    await expect(shutdown).rejects.toThrow("shutdown timeout");
    await server.close();
  });

  it("keeps liveness independent while database failure rejects readiness", async () => {
    const database = new FakeDatabase();
    database.state = { health: "DEGRADED", readiness: "REJECTING", lifecycle: "FAILED", reason: "database-unavailable" };
    const health = new ApiLifecycleHealth(database);
    health.markCatalogSynchronized();
    health.markHttp("listening");
    const server = createApiServer({ configuration: ApiConfiguration.from({ environment: "test" }), health });
    expect((await server.inject({ method: "GET", url: "/health/live" })).statusCode).toBe(200);
    const ready = await server.inject({ method: "GET", url: "/health/ready" });
    expect(ready.statusCode).toBe(503);
    expect((await server.inject({ method: "GET", url: "/health/degraded" })).json()).toMatchObject({
      degraded: true,
      components: expect.arrayContaining([expect.objectContaining({ name: "database", reasonCode: "database-unavailable" })]),
    });
    await server.close();
  });
});
