import type { FastifyInstance } from "fastify";
/** Options for serving the static web portal from the API origin. */
export interface PortalStaticRouteOptions {
    /** Absolute directory containing `index.html` and portal assets. */
    readonly directory: string;
}
/**
 * Serves the framework-free portal from the same origin as the API so browser
 * session cookies, CSRF cookies, and OAuth redirects stay first-party.
 *
 * Unknown non-asset paths return `index.html` for client-side routing. Paths
 * under `/api`, `/auth`, and `/health` never fall back to the portal.
 */
export declare function registerPortalStaticRoutes(server: FastifyInstance, options: PortalStaticRouteOptions): void;
//# sourceMappingURL=PortalStaticRoutes.d.ts.map