import type { ApiRequestContext } from "../context/ApiRequestContext.js";
/** Future CORS allowlist contract; transport enforcement is not implemented. */
export type ApiCorsPolicy = {
    readonly mode: "disabled";
} | {
    readonly mode: "allowlist";
    readonly origins: readonly string[];
    readonly credentials: boolean;
};
/** Rate-limit policy currently restricted to explicit disabled behavior. */
export interface ApiRateLimitPolicy {
    readonly mode: "disabled";
}
/** Input available to a future local or distributed rate-limit evaluator. */
export interface ApiRateLimitInput {
    readonly context: ApiRequestContext;
    readonly method: string;
    readonly route: string;
}
/** Application hook boundary for future rate-limit enforcement. */
export interface ApiRateLimitEvaluator {
    evaluate(input: ApiRateLimitInput): Promise<{
        readonly allowed: true;
    } | {
        readonly allowed: false;
    }>;
}
/** Explicit no-op implementation used while rate limiting is disabled. */
export declare const noOpRateLimitEvaluator: ApiRateLimitEvaluator;
//# sourceMappingURL=ApiTransportPolicies.d.ts.map