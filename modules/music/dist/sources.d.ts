import type { JamendoCatalog, JamendoTrack, LinkResolver, MusicProbe, RadioDirectory, RadioStation, ResolvedLink } from "./types.js";
export type Fetch = typeof fetch;
export declare const USER_AGENT: string;
export declare const RADIO_BROWSER_URL = "https://de1.api.radio-browser.info";
export declare const JAMENDO_URL = "https://api.jamendo.com/v3.0";
/** Shown for Spotify, Apple Music and YouTube links. */
export declare const STREAMING_SERVICE_MESSAGE = "Spotify, Apple Music and YouTube do not allow bots to play their music. Use Discord's Listen Along for Spotify, or upload the file.";
/** Shown for web pages and anything else that is not audio. */
export declare const NOT_AUDIO_MESSAGE = "That link is a web page, not audio. Only direct audio links work: a link to an .mp3, .ogg, .m4a, .flac or .wav file, or to a radio stream.";
/** The plain explanation for a streaming-service link, or undefined for any other link. */
export declare function streamingServiceMessage(url: URL): string | undefined;
/** True for localhost and private, link-local, or loopback address literals. */
export declare function isPrivateHost(hostname: string): boolean;
/** Parses a link typed by a member. Throws a plain MusicError for anything that cannot be played. */
export declare function parseAudioUrl(raw: string): URL;
/** First entry of an .m3u or .pls playlist, resolved against the playlist's own URL. */
export declare function firstPlaylistEntry(text: string, base: string): string | undefined;
/** A readable title from a link: the file name without its extension, else the host. */
export declare function titleFromUrl(url: URL): string;
/**
 * Direct links: audio files by extension, anything served as audio, and the
 * first entry of .m3u/.pls playlists. Web pages are refused.
 */
export declare class HttpLinkResolver implements LinkResolver {
    private readonly fetchImpl;
    private readonly probe?;
    constructor(fetchImpl?: Fetch, probe?: MusicProbe | undefined);
    resolve(raw: string): Promise<ResolvedLink>;
    private resolveUrl;
    private fromPlaylist;
    /** A remote file: ffprobe gives the length when available; unknown lengths play as live. */
    private file;
}
/** Maps Radio Browser station JSON. Skips rows without a name or a usable stream URL. */
export declare function parseRadioStations(rows: unknown): readonly RadioStation[];
/** The free Radio Browser directory (radio-browser.info). */
export declare class RadioBrowserDirectory implements RadioDirectory {
    private readonly fetchImpl;
    private readonly baseUrl;
    constructor(fetchImpl?: Fetch, baseUrl?: string);
    search(name: string): Promise<readonly RadioStation[]>;
}
/** Maps Jamendo `tracks` JSON. */
export declare function parseJamendoTracks(body: unknown): readonly JamendoTrack[];
/** Jamendo's Creative Commons catalog. Unavailable without a client ID. */
export declare class JamendoApiCatalog implements JamendoCatalog {
    private readonly clientId;
    private readonly fetchImpl;
    private readonly baseUrl;
    readonly available: boolean;
    constructor(clientId: string, fetchImpl?: Fetch, baseUrl?: string);
    search(query: string): Promise<readonly JamendoTrack[]>;
    track(id: string): Promise<JamendoTrack | undefined>;
    private tracks;
}
//# sourceMappingURL=sources.d.ts.map