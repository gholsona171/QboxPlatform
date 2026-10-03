/** Requests slower than this are logged at warn with where the time went. */
export declare const SLOW_REQUEST_MS = 800;
/** Database and Discord work done while handling one request. */
export interface RequestTimings {
    dbQueries: number;
    dbMs: number;
    discordCalls: number;
    discordMs: number;
}
export declare function createRequestTimings(): RequestTimings;
/**
 * Runs `operation` with `timings` as the current request's counters. Fastify
 * continues the request from inside `operation`, so later hooks and the
 * handler (and the database and Discord calls they make) count toward it.
 */
export declare function runWithRequestTimings<T>(timings: RequestTimings, operation: () => T): T;
/** Counts one SQL statement for the running request, if any. */
export declare function recordDatabaseQuery(durationMs: number): void;
/** Counts one Discord call for the running request, if any. */
export declare function recordDiscordCall(durationMs: number): void;
/** Times one Discord call and counts it for the running request. */
export declare function timeDiscordCall<T>(operation: () => Promise<T>): Promise<T>;
/** Makes every call through a Discord REST client count toward the running request. */
export declare function installDiscordCallTiming(rest: {
    request: (...args: never[]) => Promise<unknown>;
}): void;
/** `Server-Timing` value: db and discord time (with counts), and the total so far. */
export declare function serverTimingHeader(timings: RequestTimings, totalMs: number): string;
//# sourceMappingURL=RequestTimings.d.ts.map