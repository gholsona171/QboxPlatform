import { type Fetch } from "./http.js";
import type { LiveCheck, StreamCreator, StreamPlatformClient, StreamVideo } from "./types.js";
/**
 * YouTube channels through the Data API when the host has an API key, else
 * by reading the public channel pages. New uploads come from the channel's
 * RSS feed, which needs no key.
 */
export declare class YouTubeClient implements StreamPlatformClient {
    private readonly apiKey;
    private readonly fetchImpl;
    private readonly timeoutMs;
    readonly platform: "youtube";
    readonly available = true;
    constructor(apiKey: string | undefined, fetchImpl?: Fetch, timeoutMs?: number);
    resolve(handle: string): Promise<StreamCreator>;
    liveStatus(platformIds: readonly string[]): Promise<ReadonlyMap<string, LiveCheck>>;
    /** Newest first, from the channel's RSS feed. */
    latestVideos(channelId: string): Promise<readonly StreamVideo[]>;
    private resolveApi;
    private resolveSite;
    private liveApi;
    private liveSite;
}
//# sourceMappingURL=YouTubeClient.d.ts.map