import { type Fetch } from "./http.js";
import type { LiveCheck, StreamCreator, StreamPlatformClient } from "./types.js";
export interface KickCredentials {
    readonly clientId: string;
    readonly clientSecret: string;
}
/**
 * Kick channels through the official public API when the host has client
 * credentials, otherwise through the site's channel endpoint with a browser
 * User-Agent. Kick's slug is the platform ID in both modes.
 */
export declare class KickClient implements StreamPlatformClient {
    private readonly credentials;
    private readonly fetchImpl;
    private readonly now;
    private readonly timeoutMs;
    readonly platform: "kick";
    readonly available = true;
    private token;
    constructor(credentials: KickCredentials | undefined, fetchImpl?: Fetch, now?: () => Date, timeoutMs?: number);
    resolve(handle: string): Promise<StreamCreator>;
    liveStatus(platformIds: readonly string[]): Promise<ReadonlyMap<string, LiveCheck>>;
    private resolveOfficial;
    private resolveSite;
    private siteChannel;
    private publicApi;
    private accessToken;
}
//# sourceMappingURL=KickClient.d.ts.map