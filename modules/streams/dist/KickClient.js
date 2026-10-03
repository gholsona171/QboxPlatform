import { BROWSER_USER_AGENT, DEFAULT_TIMEOUT_MS, HttpError, describeFailure, getJson, request } from "./http.js";
import { StreamsError } from "./validation.js";
const TOKEN_URL = "https://id.kick.com/oauth/token";
const PUBLIC_API_URL = "https://api.kick.com/public/v1";
const SITE_API_URL = "https://kick.com/api/v2/channels";
/** Slugs per public API request. */
const BATCH_SIZE = 50;
/**
 * Kick channels through the official public API when the host has client
 * credentials, otherwise through the site's channel endpoint with a browser
 * User-Agent. Kick's slug is the platform ID in both modes.
 */
export class KickClient {
    credentials;
    fetchImpl;
    now;
    timeoutMs;
    platform = "kick";
    available = true;
    token;
    constructor(credentials, fetchImpl = fetch, now = () => new Date(), timeoutMs = DEFAULT_TIMEOUT_MS) {
        this.credentials = credentials;
        this.fetchImpl = fetchImpl;
        this.now = now;
        this.timeoutMs = timeoutMs;
    }
    async resolve(handle) {
        try {
            return this.credentials ? await this.resolveOfficial(handle, this.credentials) : await this.resolveSite(handle);
        }
        catch (error) {
            if (error instanceof StreamsError)
                throw error;
            if (error instanceof HttpError && error.status === 404)
                throw new StreamsError("NOT_FOUND", `No Kick channel called "${handle}" was found.`);
            throw new StreamsError("DEPENDENCY_UNAVAILABLE", describeFailure("Kick", error));
        }
    }
    async liveStatus(platformIds) {
        const results = new Map();
        if (this.credentials) {
            for (let start = 0; start < platformIds.length; start += BATCH_SIZE) {
                const chunk = platformIds.slice(start, start + BATCH_SIZE);
                try {
                    const channels = await this.publicApi(`channels?${chunk.map((slug) => `slug=${encodeURIComponent(slug)}`).join("&")}`, this.credentials);
                    for (const slug of chunk) {
                        const channel = channels.find((item) => item.slug.toLowerCase() === slug);
                        if (!channel)
                            results.set(slug, { status: "error", error: "Kick says that channel does not exist." });
                        else
                            results.set(slug, channel.stream?.is_live ? { status: "live", stream: officialStream(channel) } : { status: "offline" });
                    }
                }
                catch (error) {
                    for (const slug of chunk)
                        results.set(slug, { status: "error", error: describeFailure("Kick", error) });
                }
            }
            return results;
        }
        for (const slug of platformIds) {
            try {
                const channel = await this.siteChannel(slug);
                results.set(slug, channel.livestream ? { status: "live", stream: siteStream(channel) } : { status: "offline" });
            }
            catch (error) {
                results.set(slug, { status: "error", error: describeFailure("Kick", error) });
            }
        }
        return results;
    }
    async resolveOfficial(slug, credentials) {
        const channel = (await this.publicApi(`channels?slug=${encodeURIComponent(slug)}`, credentials))[0];
        if (!channel)
            throw new StreamsError("NOT_FOUND", `No Kick channel called "${slug}" was found.`);
        const user = await this.publicApi(`users?id=${channel.broadcaster_user_id}`, credentials).then((users) => users[0], () => undefined);
        return {
            platform: "kick",
            platformId: channel.slug.toLowerCase(),
            handle: channel.slug.toLowerCase(),
            displayName: user?.name || channel.slug,
            ...(user?.profile_picture ? { avatarUrl: user.profile_picture } : {}),
            url: `https://kick.com/${channel.slug.toLowerCase()}`,
        };
    }
    async resolveSite(slug) {
        const channel = await this.siteChannel(slug);
        return {
            platform: "kick",
            platformId: channel.slug.toLowerCase(),
            handle: channel.slug.toLowerCase(),
            displayName: channel.user?.username || channel.slug,
            ...(channel.user?.profile_pic ? { avatarUrl: channel.user.profile_pic } : {}),
            url: `https://kick.com/${channel.slug.toLowerCase()}`,
        };
    }
    siteChannel(slug) {
        return getJson(this.fetchImpl, `${SITE_API_URL}/${encodeURIComponent(slug)}`, { "user-agent": BROWSER_USER_AGENT, "accept-language": "en-US,en;q=0.9" }, this.timeoutMs);
    }
    async publicApi(path, credentials, retry = true) {
        const token = await this.accessToken(credentials);
        try {
            const json = await getJson(this.fetchImpl, `${PUBLIC_API_URL}/${path}`, { authorization: `Bearer ${token}` }, this.timeoutMs);
            return json.data ?? [];
        }
        catch (error) {
            if (error instanceof HttpError && error.status === 401 && retry) {
                this.token = undefined;
                return this.publicApi(path, credentials, false);
            }
            throw error;
        }
    }
    async accessToken(credentials) {
        if (this.token && this.token.expiresAt - this.now().getTime() > 60_000)
            return this.token.value;
        const body = new URLSearchParams({ client_id: credentials.clientId, client_secret: credentials.clientSecret, grant_type: "client_credentials" });
        const response = await request(this.fetchImpl, TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" }, body: body.toString() }, this.timeoutMs);
        const json = (await response.json());
        this.token = { value: json.access_token, expiresAt: this.now().getTime() + json.expires_in * 1000 };
        return json.access_token;
    }
}
function officialStream(channel) {
    const startedAt = parseDate(channel.stream?.start_time);
    return {
        id: `${channel.slug.toLowerCase()}:${channel.stream?.start_time ?? "live"}`,
        title: channel.stream_title ?? "",
        ...(channel.category?.name ? { game: channel.category.name } : {}),
        ...(typeof channel.stream?.viewer_count === "number" ? { viewers: channel.stream.viewer_count } : {}),
        ...(channel.stream?.thumbnail ? { thumbnailUrl: channel.stream.thumbnail } : {}),
        ...(startedAt ? { startedAt } : {}),
        url: `https://kick.com/${channel.slug.toLowerCase()}`,
    };
}
function siteStream(channel) {
    const live = channel.livestream;
    const thumbnail = typeof live?.thumbnail === "string" ? live.thumbnail : live?.thumbnail?.url;
    const startedAt = parseDate(live?.created_at);
    return {
        id: String(live?.id ?? "live"),
        title: live?.session_title ?? "",
        ...(live?.categories?.[0]?.name ? { game: live.categories[0].name } : {}),
        ...(typeof live?.viewer_count === "number" ? { viewers: live.viewer_count } : {}),
        ...(thumbnail ? { thumbnailUrl: thumbnail } : {}),
        ...(startedAt ? { startedAt } : {}),
        url: `https://kick.com/${channel.slug.toLowerCase()}`,
    };
}
/** Kick sends ISO timestamps from the public API and `YYYY-MM-DD HH:MM:SS` (UTC) from the site. */
function parseDate(value) {
    if (!value)
        return undefined;
    const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? `${value.replace(" ", "T")}Z` : value;
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? undefined : date;
}
//# sourceMappingURL=KickClient.js.map