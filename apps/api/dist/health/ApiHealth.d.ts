import { z } from "zod";
/** Authoritative schema for safe component summaries. */
export declare const ApiComponentHealthSchema: z.ZodObject<{
    name: z.ZodString;
    state: z.ZodEnum<{
        live: "live";
        ready: "ready";
        degraded: "degraded";
        unavailable: "unavailable";
    }>;
    required: z.ZodBoolean;
    reasonCode: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/** Safe health state for one process component. */
export type ApiComponentState = z.infer<typeof ApiComponentHealthSchema>["state"];
/** Safe component summary exposed by operational endpoints. */
export type ApiComponentHealth = Readonly<z.infer<typeof ApiComponentHealthSchema>>;
/** Snapshot provider for injected lifecycle and dependency health. */
export interface ApiHealthProvider {
    snapshot(): readonly ApiComponentHealth[];
    isStopping(): boolean;
}
/** Authoritative response schema shared by all operational health routes. */
export declare const ApiHealthResponseSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"1">;
    service: z.ZodLiteral<"qbox-api">;
    version: z.ZodString;
    timestamp: z.ZodISODateTime;
    liveness: z.ZodEnum<{
        live: "live";
        stopping: "stopping";
    }>;
    readiness: z.ZodEnum<{
        ready: "ready";
        "not-ready": "not-ready";
    }>;
    degraded: z.ZodBoolean;
    components: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        state: z.ZodEnum<{
            live: "live";
            ready: "ready";
            degraded: "degraded";
            unavailable: "unavailable";
        }>;
        required: z.ZodBoolean;
        reasonCode: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** Aggregate health response shared by all three operational routes. */
export type ApiHealthResponse = Readonly<z.infer<typeof ApiHealthResponseSchema>>;
/** In-memory provider for the uncomposed Phase 1 server and tests. */
export declare class StaticApiHealthProvider implements ApiHealthProvider {
    private readonly components;
    private readonly stopping;
    constructor(components?: readonly ApiComponentHealth[], stopping?: boolean);
    snapshot(): readonly ApiComponentHealth[];
    isStopping(): boolean;
}
/** Builds a safe point-in-time aggregate from injected component snapshots. */
export declare function aggregateApiHealth(provider: ApiHealthProvider, version: string, now?: () => Date): ApiHealthResponse;
//# sourceMappingURL=ApiHealth.d.ts.map