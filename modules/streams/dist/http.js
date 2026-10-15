export const DEFAULT_TIMEOUT_MS = 10_000;
/** Sent to sites that answer differently to non-browser clients. */
export const BROWSER_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
/** A non-2xx answer. */
export class HttpError extends Error {
    status;
    url;
    constructor(status, url) {
        super(`HTTP ${status} from ${new URL(url).hostname}`);
        this.status = status;
        this.url = url;
        this.name = "HttpError";
    }
}
/** `fetch` with a timeout. Throws `HttpError` on non-2xx answers. */
export async function request(fetchImpl, url, init, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchImpl(url, { ...init, signal: controller.signal });
        if (!response.ok)
            throw new HttpError(response.status, url);
        return response;
    }
    finally {
        clearTimeout(timer);
    }
}
export async function getJson(fetchImpl, url, headers, timeoutMs) {
    const response = await request(fetchImpl, url, { headers: { accept: "application/json", ...headers } }, timeoutMs);
    return (await response.json());
}
export async function getText(fetchImpl, url, headers, timeoutMs) {
    const response = await request(fetchImpl, url, { headers }, timeoutMs);
    return response.text();
}
/** Plain words for a failed platform request, shown to staff. */
export function describeFailure(platform, error) {
    if (error instanceof HttpError) {
        if (error.status === 401 || error.status === 403)
            return `${platform} refused the request (${error.status}). The host's credentials may be wrong, or the request was blocked.`;
        if (error.status === 404)
            return `${platform} says that creator does not exist.`;
        if (error.status === 429)
            return `${platform} is rate limiting the bot. Checks continue after a pause.`;
        return `${platform} answered with status ${error.status}.`;
    }
    if (error instanceof Error && error.name === "AbortError")
        return `${platform} did not answer in time.`;
    return `${platform} could not be reached.`;
}
/** First capture group of `pattern` in `text`, decoded from JSON string escapes. */
export function capture(text, pattern) {
    const value = pattern.exec(text)?.[1];
    if (value === undefined)
        return undefined;
    try {
        return JSON.parse(`"${value.replace(/"/g, '\\"')}"`);
    }
    catch {
        return value;
    }
}
/** Decodes the HTML entities YouTube uses in meta tags and feeds. */
export function decodeEntities(value) {
    return value.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&apos;", "'");
}
//# sourceMappingURL=http.js.map