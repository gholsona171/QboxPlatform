import type { StreamPlatformClient } from "./types.js";
/** Host credentials for the platforms. Empty strings count as missing. */
export interface StreamPlatformCredentials {
    readonly twitchClientId?: string | undefined;
    readonly twitchClientSecret?: string | undefined;
    readonly kickClientId?: string | undefined;
    readonly kickClientSecret?: string | undefined;
    readonly youtubeApiKey?: string | undefined;
}
/** One client per platform, configured from the host's credentials. Shared by the bot and the API. */
export declare function createStreamPlatformClients(credentials: StreamPlatformCredentials, fetchImpl?: typeof fetch): readonly StreamPlatformClient[];
//# sourceMappingURL=clients.d.ts.map