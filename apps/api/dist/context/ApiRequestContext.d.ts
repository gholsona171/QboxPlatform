import type { FastifyRequest } from "fastify";
import type { AuthenticationActor } from "@qbox/authentication";
import type { ApiLogger } from "../logging/ApiLogger.js";
/** Placeholder actor until an approved authentication system is implemented. */
export interface UnauthenticatedApiActor {
    readonly type: "unauthenticated";
}
/** Immutable context carried through one HTTP request. */
export interface ApiRequestContext {
    readonly requestId: string;
    readonly correlationId: string;
    readonly actor: AuthenticationActor;
    readonly startedAt: number;
    readonly logger: ApiLogger;
    readonly signal: AbortSignal;
    readonly clientIp: string;
}
declare module "fastify" {
    interface FastifyRequest {
        /** Immutable server-created context for this request. */
        apiContext: ApiRequestContext;
    }
}
/** Accepts one canonical UUID correlation identifier. */
export declare function isValidCorrelationId(value: unknown): value is string;
/** Creates a frozen context exclusively from server and validated transport data. */
export declare function createApiRequestContext(request: FastifyRequest, parentLogger: ApiLogger, signal: AbortSignal, now?: () => number): ApiRequestContext;
//# sourceMappingURL=ApiRequestContext.d.ts.map