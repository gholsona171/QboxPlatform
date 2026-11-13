import type { FastifyInstance } from "fastify";
import { type TicketService } from "@qbox/tickets";
import type { ApiFeature, ApiPermissionGuard } from "../features/ApiFeature.js";
export interface TicketRouteDependencies {
    readonly tickets: TicketService;
    /** Current server for the request being handled. Read inside handlers only. */
    readonly currentGuildId: () => string;
    readonly guard: ApiPermissionGuard;
}
/** Tickets as a pluggable API feature. */
export declare function ticketsApiFeature(tickets: TicketService): ApiFeature;
/** Registers `/api/v1/tickets/*` for the portal. */
export declare function registerTicketRoutes(server: FastifyInstance, dependencies: TicketRouteDependencies): void;
//# sourceMappingURL=TicketRoutes.d.ts.map