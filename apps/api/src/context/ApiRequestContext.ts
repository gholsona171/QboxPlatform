import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { FastifyRequest } from "fastify";
import type { ApiLogger } from "../logging/ApiLogger.js";

/** Placeholder actor until an approved authentication system is implemented. */
export interface UnauthenticatedApiActor {
  readonly type: "unauthenticated";
}

/** Immutable context carried through one HTTP request. */
export interface ApiRequestContext {
  readonly requestId: string;
  readonly correlationId: string;
  readonly actor: UnauthenticatedApiActor;
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

const correlationIdSchema = z.uuid();

/** Accepts one canonical UUID correlation identifier. */
export function isValidCorrelationId(value: unknown): value is string {
  return typeof value === "string" && correlationIdSchema.safeParse(value).success;
}

/** Creates a frozen context exclusively from server and validated transport data. */
export function createApiRequestContext(
  request: FastifyRequest,
  parentLogger: ApiLogger,
  signal: AbortSignal,
  now: () => number = () => performance.now(),
): ApiRequestContext {
  const supplied = request.headers["x-correlation-id"];
  const correlationId = isValidCorrelationId(supplied) ? supplied : randomUUID();
  const actor = Object.freeze({ type: "unauthenticated" } as const);
  const context: ApiRequestContext = {
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
