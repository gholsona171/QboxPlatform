import type { FastifyRequest } from "fastify";
import { z } from "zod";

import { ConflictApiError, DependencyUnavailableApiError, NotFoundApiError, ValidationApiError } from "../errors/ApiError.js";

/** Shape shared by feature error classes (TicketError, ModerationError, ...). */
export interface FeatureError {
  readonly code: string;
  readonly message: string;
  readonly details?: Readonly<Record<string, string | number>> | undefined;
}

export const snowflakeSchema = z.string().regex(/^\d{17,20}$/);

/** Validates input with zod, returning readable 400 errors and dropping `undefined` keys. */
export function parseInput<T extends z.ZodType>(schema: T, value: unknown): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new ValidationApiError(result.error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code, message: `${issue.path.join(".") || "value"}: ${issue.message}` })));
  return withoutUndefined(result.data) as z.infer<T>;
}

/** Reads one route parameter. */
export function routeParam(request: FastifyRequest, name: string): string {
  const value = request.params && typeof request.params === "object" ? Reflect.get(request.params, name) : undefined;
  if (typeof value !== "string" || value.length === 0 || value.length > 64) throw new ValidationApiError([{ path: name, code: "invalid", message: `${name} is invalid.` }]);
  return value;
}

/** Reads the query object. */
export function routeQuery(request: FastifyRequest): Record<string, unknown> {
  return request.query && typeof request.query === "object" ? (request.query as Record<string, unknown>) : {};
}

/**
 * Runs a feature operation and maps its errors to API problems:
 * NOT_FOUND 404, CONFLICT 409, DEPENDENCY_UNAVAILABLE 503, anything else 400
 * with the feature's user-facing message.
 */
export async function featureCall<T>(operation: () => Promise<T>, isFeatureError: (error: unknown) => error is FeatureError): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isFeatureError(error)) throw error;
    if (error.code === "NOT_FOUND") throw new NotFoundApiError();
    if (error.code === "DEPENDENCY_UNAVAILABLE") throw new DependencyUnavailableApiError([{ path: "feature", code: error.code, message: error.message }]);
    if (error.code === "CONFLICT") throw new ConflictApiError([{ path: "feature", code: "STALE_REVISION", message: error.message, ...(error.details ?? {}) }]);
    throw new ValidationApiError([{ path: "feature", code: error.code, message: error.message }]);
  }
}

/** Builds an `isFeatureError` guard for a feature error class. */
export function errorOf(errorClass: abstract new (...args: never[]) => FeatureError): (error: unknown) => error is FeatureError {
  return (error: unknown): error is FeatureError => error instanceof errorClass;
}

function withoutUndefined(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value) || value instanceof Date) return value;
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined).map(([key, item]) => [key, withoutUndefined(item)]));
}
