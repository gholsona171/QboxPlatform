import { type Fetch } from "./http.js";
import type { LiveCheck, StreamCreator, StreamPlatformClient } from "./types.js";
export interface TwitchCredentials {
    readonly clientId: string;
    readonly clientSecret: string;
}
/** Twitch Helix with an app access token (client credentials), refreshed when it expires or Twitch answers 401. */
export declare class HelixTwitchClient implements StreamPlatformClient {
    private readonly credentials;
    private readonly fetchImpl;
    private readonly now;
    private readonly timeoutMs;
    readonly platform: "twitch";
    readonly available: boolean;
    private token;
    constructor(credentials: TwitchCredentials | undefined, fetchImpl?: Fetch, now?: () => Date, timeoutMs?: number);
    resolve(handle: string): Promise<StreamCreator>;
    liveStatus(platformIds: readonly string[]): Promise<ReadonlyMap<string, LiveCheck>>;
    private helix;
    private accessToken;
}
//# sourceMappingURL=HelixTwitchClient.d.ts.map