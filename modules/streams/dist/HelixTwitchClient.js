import { DEFAULT_TIMEOUT_MS, HttpError, describeFailure, request } from "./http.js";
import { StreamsError } from "./validation.js";
/** User IDs per `/helix/streams` request. */
const BATCH_SIZE = 100;
const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const HELIX_URL = "https://api.twitch.tv/helix";
/** Twitch Helix with an app access token (client credentials), refreshed when it expires or Twitch answers 401. */
export class HelixTwitchClient {
    credentials;
    fetchImpl;
    now;
    timeoutMs;
    platform = "twitch";
    available;
    token;
    constructor(credentials, fetchImpl = fetch, now = () => new Date(), timeoutMs = DEFAULT_TIMEOUT_MS) {
        this.credentials = credentials;
        this.fetchImpl = fetchImpl;
        this.now = now;
        this.timeoutMs = timeoutMs;
        this.available = credentials !== undefined;
    }
    async resolve(handle) {
        const query = /^\d+$/.test(handle) ? `id=${handle}` : `login=${encodeURIComponent(handle)}`;
        const users = await this.helix(`users?${query}`).catch((error) => {
            throw new StreamsError("DEPENDENCY_UNAVAILABLE", describeFailure("Twitch", error));
        });
        const user = users[0];
        if (!user)
            throw new StreamsError("NOT_FOUND", `No Twitch channel called "${handle}" was found.`);
        return { platform: "twitch", platformId: user.id, handle: user.login, displayName: user.display_name || user.login, avatarUrl: user.profile_image_url, url: `https://www.twitch.tv/${user.login}` };
    }
    async liveStatus(platformIds) {
        const results = new Map();
        for (let start = 0; start < platformIds.length; start += BATCH_SIZE) {
            const chunk = platformIds.slice(start, start + BATCH_SIZE);
            try {
                const streams = await this.helix(`streams?first=${BATCH_SIZE}&${chunk.map((id) => `user_id=${encodeURIComponent(id)}`).join("&")}`);
                for (const id of chunk) {
                    const stream = streams.find((item) => item.user_id === id);
                    results.set(id, stream ? { status: "live", stream: toStream(stream) } : { status: "offline" });
                }
            }
            catch (error) {
                for (const id of chunk)
                    results.set(id, { status: "error", error: describeFailure("Twitch", error) });
            }
        }
        return results;
    }
    async helix(path, retry = true) {
        const credentials = this.credentials;
        if (!credentials)
            throw new StreamsError("DEPENDENCY_UNAVAILABLE", "Twitch needs app credentials on the host.");
        const token = await this.accessToken(credentials);
        try {
            const response = await request(this.fetchImpl, `${HELIX_URL}/${path}`, { headers: { accept: "application/json", "client-id": credentials.clientId, authorization: `Bearer ${token}` } }, this.timeoutMs);
            return (await response.json()).data ?? [];
        }
        catch (error) {
            if (error instanceof HttpError && error.status === 401 && retry) {
                this.token = undefined;
                return this.helix(path, false);
            }
            throw error;
        }
    }
    async accessToken(credentials) {
        if (this.token && this.token.expiresAt - this.now().getTime() > 60_000)
            return this.token.value;
        const body = new URLSearchParams({ client_id: credentials.clientId, client_secret: credentials.clientSecret, grant_type: "client_credentials" });
        const response = await request(this.fetchImpl, TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: body.toString() }, this.timeoutMs);
        const json = (await response.json());
        this.token = { value: json.access_token, expiresAt: this.now().getTime() + json.expires_in * 1000 };
        return json.access_token;
    }
}
function toStream(stream) {
    const startedAt = stream.started_at ? new Date(stream.started_at) : undefined;
    return {
        id: stream.id,
        title: stream.title,
        ...(stream.game_name ? { game: stream.game_name } : {}),
        ...(typeof stream.viewer_count === "number" ? { viewers: stream.viewer_count } : {}),
        ...(stream.thumbnail_url ? { thumbnailUrl: stream.thumbnail_url.replace("{width}", "1280").replace("{height}", "720") } : {}),
        ...(startedAt && !Number.isNaN(startedAt.getTime()) ? { startedAt } : {}),
        url: `https://www.twitch.tv/${stream.user_login}`,
    };
}
//# sourceMappingURL=HelixTwitchClient.js.map