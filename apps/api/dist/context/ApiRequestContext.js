import { randomUUID } from "node:crypto";
import { ApiCorrelationIdSchema } from "../transport/ApiTransportSchemas.js";
/** Accepts one canonical UUID correlation identifier. */
export function isValidCorrelationId(value) {
    return typeof value === "string" && ApiCorrelationIdSchema.safeParse(value).success;
}
/** Creates a frozen context exclusively from server and validated transport data. */
export function createApiRequestContext(request, parentLogger, signal, now = () => performance.now()) {
    const supplied = request.headers["x-correlation-id"];
    const correlationId = isValidCorrelationId(supplied) ? supplied : randomUUID();
    const actor = Object.freeze({ type: "unauthenticated" });
    const context = {
        requestId: request.id,
        correlationId,
        actor,
        startedAt: now(),
        logger: parentLogger.child({
            requestId: request.id,
            correlationId,
            actorType: actor.type,
        }),
        signal,
        clientIp: request.ip,
    };
    return Object.freeze(context);
}
//# sourceMappingURL=ApiRequestContext.js.map