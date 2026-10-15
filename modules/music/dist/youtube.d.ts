import type { YoutubeSource, YoutubeStream, YoutubeVideo } from "./types.js";
import { MusicError } from "./validation.js";
export declare const YOUTUBE_ID: RegExp;
/** Longest search text handed to yt-dlp. */
export declare const YOUTUBE_QUERY_LIMIT = 150;
/** Most search results asked for at once. */
export declare const YOUTUBE_SEARCH_LIMIT = 10;
export declare const YOUTUBE_UNAVAILABLE_MESSAGE = "YouTube is not set up on this host. Whoever runs it can install yt-dlp (see the Music guide).";
export declare const YOUTUBE_PLAYLIST_MESSAGE = "YouTube playlists are not supported yet. Paste a link to one video, or type the song's name.";
export declare const YOUTUBE_NOT_A_VIDEO_MESSAGE = "That YouTube link is not a video. Paste a link to one video, or type the song's name.";
export declare const YOUTUBE_SIGN_IN_MESSAGE = "YouTube is asking this host to sign in, which usually means it has blocked the host's address. Whoever runs the host needs to set up a YouTube cookies file (see the Music guide).";
export declare const YOUTUBE_TIMEOUT_MESSAGE = "YouTube took too long to answer. Try again in a moment.";
export declare const YOUTUBE_BUSY_MESSAGE = "YouTube is busy with other requests. Try again in a moment.";
export declare const YOUTUBE_FAILED_MESSAGE = "YouTube could not play that right now. Try again in a moment.";
export type YoutubeLink = {
    readonly kind: "video";
    readonly id: string;
}
/** A playlist link without a video in it. */
 | {
    readonly kind: "playlist";
}
/** A YouTube page that is not a video: a channel, search, or the home page. */
 | {
    readonly kind: "other";
};
/**
 * Reads a YouTube link: `youtube.com/watch`, `youtu.be`, `music.youtube.com`,
 * `/shorts/` and `/live/`, with or without `https://`. Undefined when the text
 * is not a YouTube link at all.
 */
export declare function parseYoutubeLink(raw: string): YoutubeLink | undefined;
/** The canonical watch address for a video ID. This is the only link form handed to yt-dlp. */
export declare function youtubeWatchUrl(id: string): string;
export declare function youtubeThumbnailUrl(id: string): string;
/** Search text as yt-dlp gets it: one line, no control characters, at most 150 characters. */
export declare function cleanYoutubeQuery(query: string): string;
interface YtDlpRow extends YoutubeVideo {
    /** The audio stream address, when yt-dlp was asked for one. */
    readonly url?: string | undefined;
}
/** Maps yt-dlp's JSON lines. Skips anything that is not a video with a valid ID and a title. */
export declare function parseYoutubeRows(output: string): readonly YtDlpRow[];
/** When a stream address stops working, in milliseconds, read from its `expire` value. */
export declare function youtubeStreamExpiry(url: string): number | undefined;
/** Turns yt-dlp's error output into a plain sentence. The raw text is logged, never shown. */
export declare function youtubeError(stderr: string): MusicError;
export interface ProcessResult {
    /** Exit code; null when the process could not start or was killed. */
    readonly code: number | null;
    readonly stdout: string;
    readonly stderr: string;
    readonly timedOut: boolean;
    /** The output passed the size limit and the process was stopped. */
    readonly truncated: boolean;
}
/** Runs a program with an argument list (never a shell) and collects its output. */
export type ProcessRunner = (file: string, args: readonly string[], limits: {
    readonly timeoutMs: number;
    readonly maxBytes: number;
}) => Promise<ProcessResult>;
/** `spawn` without a shell, stopped after `timeoutMs` or `maxBytes` of output. */
export declare const runProcess: ProcessRunner;
/**
 * Where yt-dlp lives: `override` (YTDLP_PATH) when set, else PATH, else
 * `~/.local/bin/yt-dlp`, where the host scripts install it.
 */
export declare function findYtDlp(override?: string | undefined, home?: string): string | undefined;
export interface YoutubeLog {
    warn(message: string, details: Readonly<Record<string, unknown>>): void;
}
export interface YtDlpYoutubeOptions {
    /** Path of yt-dlp, or a lookup that is tried again while it finds nothing. */
    readonly binary: string | undefined | (() => string | undefined);
    /** Netscape-format cookies file passed as `--cookies` (YOUTUBE_COOKIES_FILE). */
    readonly cookiesFile?: string | undefined;
    /** yt-dlp needs a JavaScript runtime for YouTube; by default the Node.js that runs this process. Empty to pass none. */
    readonly jsRuntime?: string | undefined;
    /** Extra yt-dlp arguments for local testing. Not read from the environment. */
    readonly extraArgs?: readonly string[] | undefined;
    readonly run?: ProcessRunner | undefined;
    readonly now?: (() => number) | undefined;
    readonly timeoutMs?: number | undefined;
    /** yt-dlp processes running at once; more wait their turn. */
    readonly concurrency?: number | undefined;
    /** Requests that may wait for a turn; more are refused. */
    readonly maxWaiting?: number | undefined;
    readonly log?: YoutubeLog | undefined;
}
/**
 * YouTube through the yt-dlp program on the host. Member text never reaches a
 * shell: searches are one `ytsearchN:<text>` argument, and videos are always
 * the watch address built from a checked 11-character ID.
 */
export declare class YtDlpYoutubeSource implements YoutubeSource {
    private readonly options;
    private readonly run;
    private readonly now;
    private readonly timeoutMs;
    private readonly concurrency;
    private readonly maxWaiting;
    private readonly log;
    private readonly baseArgs;
    private readonly streams;
    private readonly resolving;
    private readonly waiting;
    private active;
    private binary;
    private locatedAt;
    constructor(options: YtDlpYoutubeOptions);
    get available(): boolean;
    search(query: string, limit?: number): Promise<readonly YoutubeVideo[]>;
    first(query: string): Promise<YoutubeVideo>;
    video(id: string): Promise<YoutubeVideo>;
    stream(id: string): Promise<YoutubeStream>;
    forget(id: string): void;
    /** One video with its audio stream address. */
    private lookup;
    /** Keeps a row's stream address until shortly before it expires. Returns it when it is safe to play. */
    private remember;
    private locate;
    private execute;
    private failure;
    private acquire;
    /** Hands the slot to the next waiting request, or frees it. */
    private release;
}
export interface YoutubeHostOptions {
    /** YTDLP_PATH. */
    readonly ytDlpPath?: string | undefined;
    /** YOUTUBE_COOKIES_FILE. */
    readonly cookiesFile?: string | undefined;
    readonly concurrency?: number | undefined;
    readonly log?: YoutubeLog | undefined;
}
/** The YouTube source for this host, from its environment settings. */
export declare function createYoutubeSource(options?: YoutubeHostOptions): YtDlpYoutubeSource;
export {};
//# sourceMappingURL=youtube.d.ts.map