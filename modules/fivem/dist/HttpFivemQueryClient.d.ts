import type { FivemQueryClient, FivemServerStatus } from "./types.js";
type Fetch = typeof fetch;
/** Removes FiveM color codes (`^1`) and trims. */
export declare function cleanHostname(value: string): string;
/**
 * Reads an uptime a server shares in its vars (`SetConvarServerInfo("Uptime", ...)`),
 * for example `2h 05m`, `1d 3h 20m`, `125 minutes`, or `01:02:03`. Returns
 * milliseconds, or undefined when it cannot be read.
 */
export declare function parseUptime(value: string | undefined): number | undefined;
/**
 * Queries a FiveM server's `info.json`, `players.json`, and `dynamic.json`
 * with a timeout. Never throws: an unreachable server is reported offline.
 */
export declare class HttpFivemQueryClient implements FivemQueryClient {
    private readonly fetchImpl;
    private readonly timeoutMs;
    private readonly now;
    constructor(fetchImpl?: Fetch, timeoutMs?: number, now?: () => Date);
    query(address: string): Promise<FivemServerStatus>;
    private json;
}
export {};
//# sourceMappingURL=HttpFivemQueryClient.d.ts.map