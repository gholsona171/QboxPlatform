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
export declare class ApiModule implements PlatformModule {
    private readonly server;
    private readonly configuration;
    private readonly health;
    readonly name = "api-http";
    readonly version = "0.1.0";
    private started;
    private stopped;
    private boundAddress;
    constructor(server: FastifyInstance, configuration: ApiConfiguration, health: ApiLifecycleHealth);
    start(context: PlatformModuleContext): Promise<void>;
    stop(): Promise<void>;
    diagnostics(): ApiBoundAddress | undefined;
    private closeWithinTimeout;
}
//# sourceMappingURL=ApiModule.d.ts.map