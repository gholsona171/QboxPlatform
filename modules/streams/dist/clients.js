import { HelixTwitchClient } from "./HelixTwitchClient.js";
import { KickClient } from "./KickClient.js";
import { YouTubeClient } from "./YouTubeClient.js";
/** One client per platform, configured from the host's credentials. Shared by the bot and the API. */
export function createStreamPlatformClients(credentials, fetchImpl = fetch) {
    const twitch = credentials.twitchClientId && credentials.twitchClientSecret ? { clientId: credentials.twitchClientId, clientSecret: credentials.twitchClientSecret } : undefined;
    const kick = credentials.kickClientId && credentials.kickClientSecret ? { clientId: credentials.kickClientId, clientSecret: credentials.kickClientSecret } : undefined;
    return [new HelixTwitchClient(twitch, fetchImpl), new KickClient(kick, fetchImpl), new YouTubeClient(credentials.youtubeApiKey || undefined, fetchImpl)];
}
//# sourceMappingURL=clients.js.map