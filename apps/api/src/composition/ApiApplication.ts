import { PlatformKernel } from "@qbox/core";
import {
  DatabaseConfiguration,
  DatabaseService,
  InMemoryPermissionInvalidationBus,
  PrismaPermissionPersistenceClient,
} from "@qbox/database";
import { logger } from "@qbox/logger";
import {
  InMemoryPermissionCache,
  PersistentPermissionService,
} from "@qbox/permissions";
import {
  ApiConfiguration,
  type ApiConfigurationInput,
} from "../config/ApiConfiguration.js";
import { createApiServer } from "../createApiServer.js";
import { ApiLifecycleHealth } from "../lifecycle/ApiLifecycleHealth.js";
import { ApiModule } from "../lifecycle/ApiModule.js";
import { ApiPermissionPersistenceModule } from "../lifecycle/ApiPermissionPersistenceModule.js";

/** Validated composition input supplied by the executable environment layer. */
export interface ApiApplicationInput {
  readonly api: ApiConfigurationInput;
  readonly databaseUrl: string | undefined;
}

/** Process-owned API application with idempotent bounded cleanup. */
export class ApiApplication {
  private startAttempted = false;
  private shutdownPromise: Promise<void> | undefined;

  public constructor(
    public readonly kernel: PlatformKernel,
    public readonly configuration: ApiConfiguration,
    public readonly health: ApiLifecycleHealth,
    public readonly apiModule: ApiModule,
  ) {}

  public async start(): Promise<void> {
    if (this.startAttempted) throw new Error("API application startup was already attempted.");
    this.startAttempted = true;
    try {
      await this.kernel.start();
    } catch (error) {
      this.health.beginShutdown();
      try {
        await withTimeout(
          this.kernel.stop(),
          this.configuration.diagnostics().shutdownTimeoutMs,
          "API startup cleanup timeout exceeded.",
        );
      } catch {
        // Preserve the authoritative startup failure.
      }
      throw error;
    }
  }

  public shutdown(): Promise<void> {
    if (this.shutdownPromise !== undefined) return this.shutdownPromise;
    this.health.beginShutdown();
    this.shutdownPromise = withTimeout(
      this.kernel.stop(),
      this.configuration.diagnostics().shutdownTimeoutMs,
      "API application shutdown timeout exceeded.",
    );
    return this.shutdownPromise;
  }
}

/** Composes one API process without starting it or reading process environment. */
export function createApiApplication(input: ApiApplicationInput): ApiApplication {
  const apiConfiguration = ApiConfiguration.from(input.api);
  const databaseConfiguration = DatabaseConfiguration.from({
    databaseUrl: input.databaseUrl,
    environment: apiConfiguration.diagnostics().environment,
  });
  const invalidations = new InMemoryPermissionInvalidationBus();
  const cache = new InMemoryPermissionCache();
  const unsubscribeInvalidations = invalidations.subscribe((event) =>
    cache.invalidate(event.scopes),
  );
  const persistence = new PrismaPermissionPersistenceClient(
    databaseConfiguration,
    { invalidations },
  );
  const database = new DatabaseService(databaseConfiguration, {
    create: () => persistence,
  });
  const health = new ApiLifecycleHealth(database);
  const authorizer = new PersistentPermissionService(
    persistence.repositories.permissions,
    cache,
  );
  const server = createApiServer({
    configuration: apiConfiguration,
    health,
    logger,
  });
  const kernel = new PlatformKernel();
  kernel.registerModule(
    new ApiPermissionPersistenceModule(
      database,
      persistence.repositories,
      authorizer,
      unsubscribeInvalidations,
      health,
    ),
  );
  const apiModule = new ApiModule(server, apiConfiguration, health);
  kernel.registerModule(apiModule);
  return new ApiApplication(kernel, apiConfiguration, health, apiModule);
}

async function withTimeout(
  operation: Promise<void>,
  timeoutMs: number,
  reason: string,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(reason)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
