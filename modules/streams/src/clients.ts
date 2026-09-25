import { HelixTwitchClient } from "./HelixTwitchClient.js";
import { KickClient } from "./KickClient.js";
import { YouTubeClient } from "./YouTubeClient.js";
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
export function createStreamPlatformClients(credentials: StreamPlatformCredentials, fetchImpl: typeof fetch = fetch): readonly StreamPlatformClient[] {
  const twitch = credentials.twitchClientId && credentials.twitchClientSecret ? { clientId: credentials.twitchClientId, clientSecret: credentials.twitchClientSecret } : undefined;
  const kick = credentials.kickClientId && credentials.kickClientSecret ? { clientId: credentials.kickClientId, clientSecret: credentials.kickClientSecret } : undefined;
  return [new HelixTwitchClient(twitch, fetchImpl), new KickClient(kick, fetchImpl), new YouTubeClient(credentials.youtubeApiKey || undefined, fetchImpl)];
}
