import type { FastifyRequest } from "fastify";
import { z } from "zod";
/** Shape shared by feature error classes (TicketError, ModerationError, ...). */
export interface FeatureError {
    readonly code: string;
    readonly message: string;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
}
export declare const snowflakeSchema: z.ZodString;
/** Validates input with zod, returning readable 400 errors and dropping `undefined` keys. */
export declare function parseInput<T extends z.ZodType>(schema: T, value: unknown): z.infer<T>;
/** Reads one route parameter. */
export declare function routeParam(request: FastifyRequest, name: string): string;
/** Reads the query object. */
export declare function routeQuery(request: FastifyRequest): Record<string, unknown>;
/**
 * Runs a feature operation and maps its errors to API problems:
 * NOT_FOUND 404, CONFLICT 409, DEPENDENCY_UNAVAILABLE 503, anything else 400
 * with the feature's user-facing message.
 */
export declare function featureCall<T>(operation: () => Promise<T>, isFeatureError: (error: unknown) => error is FeatureError): Promise<T>;
/** Builds an `isFeatureError` guard for a feature error class. */
export declare function errorOf(errorClass: abstract new (...args: never[]) => FeatureError): (error: unknown) => error is FeatureError;
//# sourceMappingURL=routeHelpers.d.ts.map