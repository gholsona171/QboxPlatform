import type { PlatformModule, PlatformModuleContext } from "@qbox/core";
import type { FastifyInstance } from "fastify";
import type { ApiConfiguration } from "../config/ApiConfiguration.js";
import type { ApiLifecycleHealth } from "./ApiLifecycleHealth.js";

/** Safe bound-address diagnostics returned after successful listening. */
export interface ApiBoundAddress {
  readonly host: string;
  readonly port: number;
}

/** Owns exactly one Fastify listen/close lifecycle. */
export class ApiModule implements PlatformModule {
  public readonly name = "api-http";
  public readonly version = "0.1.0";
  private started = false;
  private stopped = false;
  private boundAddress: ApiBoundAddress | undefined;

  public constructor(
    private readonly server: FastifyInstance,
    private readonly configuration: ApiConfiguration,
    private readonly health: ApiLifecycleHealth,
  ) {}

  public async start(context: PlatformModuleContext): Promise<void> {
    if (this.started) throw new Error("API module has already started.");
    if (this.stopped) throw new Error("API module cannot restart after shutdown.");
    this.health.markHttp("starting");
    const configured = this.configuration.diagnostics();
    try {
      await this.server.listen({ host: configured.host, port: configured.port });
      const address = this.server.server.address();
      if (address === null || typeof address === "string")
        throw new Error("API server did not expose a TCP bound address.");
      this.boundAddress = Object.freeze({ host: configured.host, port: address.port });
      this.started = true;
      this.health.markHttp("listening");
      context.services.register("api", this.server);
    } catch (error) {
      this.health.markHttp("failed");
      try {
        await this.closeWithinTimeout();
      } catch {
        // Preserve the listen failure while still attempting cleanup.
      }
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (this.stopped) return;
    this.stopped = true;
    this.health.beginShutdown();
    await this.closeWithinTimeout();
    this.health.markHttp("stopped");
  }

  public diagnostics(): ApiBoundAddress | undefined {
    return this.boundAddress;
  }

  private async closeWithinTimeout(): Promise<void> {
    const timeoutMs = this.configuration.diagnostics().shutdownTimeoutMs;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        this.server.close(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error("API shutdown timeout exceeded.")),
            timeoutMs,
          );
        }),
      ]);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  }
}
