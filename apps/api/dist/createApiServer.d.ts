import { type FastifyInstance } from "fastify";
import type { ApiConfiguration } from "./config/ApiConfiguration.js";
import { type ApiHealthProvider } from "./health/ApiHealth.js";
import type { ApiLogger } from "./logging/ApiLogger.js";
import { type MetricsRecorder } from "./metrics/MetricsRecorder.js";
import { type ApiRateLimitEvaluator } from "./security/ApiTransportPolicies.js";
/**
 * Route config for a route that takes a raw file body instead of JSON: the
 * content types it accepts and its own body size limit.
 */
export interface ApiUploadRoute {
    readonly contentType: RegExp;
    readonly bodyLimit: number;
}
declare module "fastify" {
    interface FastifyContextConfig {
        readonly upload?: ApiUploadRoute;
    }
}
/** Injected dependencies for an unbound API transport instance. */
export interface ApiServerDependencies {
    readonly configuration: ApiConfiguration;
    readonly logger?: ApiLogger;
    readonly health?: ApiHealthProvider;
    readonly metrics?: MetricsRecorder;
    readonly rateLimit?: ApiRateLimitEvaluator;
    readonly registerRoutes?: (server: FastifyInstance) => Promise<void> | void;
    readonly now?: () => Date;
    readonly monotonicNow?: () => number;
}
/**
 * Creates a fully configured Fastify transport without starting any lifecycle.
 *
 * The factory never binds a socket, reads process environment, starts a kernel,
 * or accesses persistence. All stateful boundaries are injected.
 */
export declare function createApiServer(dependencies: ApiServerDependencies): FastifyInstance;
/** Marks transport shutdown and aborts cooperative requests after the grace period. */
export declare function beginApiTransportShutdown(server: FastifyInstance, graceMs: number): void;
//# sourceMappingURL=createApiServer.d.ts.map