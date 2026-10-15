import { z } from "zod";
/** Authoritative schema for safe component summaries. */
export const ApiComponentHealthSchema = z.strictObject({
    name: z.string().trim().min(1).max(64),
    state: z.enum(["live", "ready", "degraded", "unavailable"]),
    required: z.boolean(),
    reasonCode: z.string().trim().min(1).max(128).optional(),
});
/** Authoritative response schema shared by all operational health routes. */
export const ApiHealthResponseSchema = z.strictObject({
    schemaVersion: z.literal("1"),
    service: z.literal("qbox-api"),
    version: z.string().trim().min(1),
    timestamp: z.iso.datetime(),
    liveness: z.enum(["live", "stopping"]),
    readiness: z.enum(["ready", "not-ready"]),
    degraded: z.boolean(),
    components: z.array(ApiComponentHealthSchema),
});
/** In-memory provider for the uncomposed Phase 1 server and tests. */
export class StaticApiHealthProvider {
    components;
    stopping;
    constructor(components = [], stopping = false) {
        this.components = components;
        this.stopping = stopping;
    }
    snapshot() {
        return this.components.map((component) => Object.freeze({ ...component }));
    }
    isStopping() {
        return this.stopping;
    }
}
/** Builds a safe point-in-time aggregate from injected component snapshots. */
export function aggregateApiHealth(provider, version, now = () => new Date()) {
    const components = provider.snapshot().map((component) => Object.freeze({ ...component }));
    const stopping = provider.isStopping();
    const requiredUnavailable = components.some((component) => component.required &&
        component.state !== "ready");
    return Object.freeze(ApiHealthResponseSchema.parse({
        schemaVersion: "1",
        service: "qbox-api",
        version,
        timestamp: now().toISOString(),
        liveness: stopping ? "stopping" : "live",
        readiness: stopping || requiredUnavailable ? "not-ready" : "ready",
        degraded: components.some((component) => component.state === "degraded" || component.state === "unavailable"),
        components: Object.freeze(components),
    }));
}
//# sourceMappingURL=ApiHealth.js.map