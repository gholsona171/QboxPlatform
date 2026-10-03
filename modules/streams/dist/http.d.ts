export type Fetch = typeof fetch;
export declare const DEFAULT_TIMEOUT_MS = 10000;
/** Sent to sites that answer differently to non-browser clients. */
export declare const BROWSER_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
/** A non-2xx answer. */
export declare class HttpError extends Error {
    readonly status: number;
    readonly url: string;
    constructor(status: number, url: string);
}
/** `fetch` with a timeout. Throws `HttpError` on non-2xx answers. */
export declare function request(fetchImpl: Fetch, url: string, init: RequestInit, timeoutMs: number): Promise<Response>;
export declare function getJson<T>(fetchImpl: Fetch, url: string, headers: Record<string, string>, timeoutMs: number): Promise<T>;
export declare function getText(fetchImpl: Fetch, url: string, headers: Record<string, string>, timeoutMs: number): Promise<string>;
/** Plain words for a failed platform request, shown to staff. */
export declare function describeFailure(platform: string, error: unknown): string;
/** First capture group of `pattern` in `text`, decoded from JSON string escapes. */
export declare function capture(text: string, pattern: RegExp): string | undefined;
/** Decodes the HTML entities YouTube uses in meta tags and feeds. */
export declare function decodeEntities(value: string): string;
//# sourceMappingURL=http.d.ts.map