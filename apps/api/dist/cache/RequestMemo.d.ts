import type { FastifyRequest } from "fastify";
/**
 * Runs `load` once per request and key; later calls in the same request get
 * the same promise (including its failure). The guard, the current-server
 * lookup, and the handler share one database read this way.
 */
export declare function requestMemo<T>(request: FastifyRequest, key: string, load: () => Promise<T>): Promise<T>;
/** Replaces a memoized value after this request changed it (for example a fresh membership check). */
export declare function setRequestMemo<T>(request: FastifyRequest, key: string, value: T): void;
//# sourceMappingURL=RequestMemo.d.ts.map