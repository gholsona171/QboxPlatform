import { AsyncLocalStorage } from "node:async_hooks";
/** Requests slower than this are logged at warn with where the time went. */
export const SLOW_REQUEST_MS = 800;
const storage = new AsyncLocalStorage();
export function createRequestTimings() {
    return { dbQueries: 0, dbMs: 0, discordCalls: 0, discordMs: 0 };
}
/**
 * Runs `operation` with `timings` as the current request's counters. Fastify
 * continues the request from inside `operation`, so later hooks and the
 * handler (and the database and Discord calls they make) count toward it.
 */
export function runWithRequestTimings(timings, operation) {
    return storage.run(timings, operation);
}
/** Counts one SQL statement for the running request, if any. */
export function recordDatabaseQuery(durationMs) {
    const timings = storage.getStore();
    if (timings === undefined)
        return;
    timings.dbQueries += 1;
    timings.dbMs += durationMs;
}
/** Counts one Discord call for the running request, if any. */
export function recordDiscordCall(durationMs) {
    const timings = storage.getStore();
    if (timings === undefined)
        return;
    timings.discordCalls += 1;
    timings.discordMs += durationMs;
}
/** Times one Discord call and counts it for the running request. */
export async function timeDiscordCall(operation) {
    const started = performance.now();
    try {
        return await operation();
    }
    finally {
        recordDiscordCall(performance.now() - started);
    }
}
/** Makes every call through a Discord REST client count toward the running request. */
export function installDiscordCallTiming(rest) {
    const original = rest.request;
    rest.request = async function timedRequest(...args) {
        return timeDiscordCall(() => original.apply(this, args));
    };
}
/** `Server-Timing` value: db and discord time (with counts), and the total so far. */
export function serverTimingHeader(timings, totalMs) {
    const round = (value) => Math.round(value * 10) / 10;
    return [
        `db;dur=${round(timings.dbMs)};desc="${timings.dbQueries} queries"`,
        `discord;dur=${round(timings.discordMs)};desc="${timings.discordCalls} calls"`,
        `total;dur=${round(totalMs)}`,
    ].join(", ");
}
//# sourceMappingURL=RequestTimings.js.map