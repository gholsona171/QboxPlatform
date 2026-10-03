import type { MusicFileTags, MusicProbe } from "./types.js";
/**
 * Full path of an executable on PATH, or `override` when it points at an
 * executable file. Undefined when neither is found.
 */
export declare function findExecutable(name: string, override?: string | undefined, pathVariable?: string): string | undefined;
/** Where ffmpeg and ffprobe live on this host. */
export interface MediaTools {
    readonly ffmpeg?: string | undefined;
    readonly ffprobe?: string | undefined;
}
/** Finds ffmpeg (FFMPEG_PATH or PATH) and ffprobe (next to that ffmpeg, else PATH). */
export declare function findMediaTools(ffmpegOverride?: string | undefined): MediaTools;
/** Reads the parts of ffprobe's JSON output the library uses. */
export declare function parseProbeOutput(json: string): MusicFileTags;
/** Tags and cover art through ffprobe and ffmpeg. Every method is a no-op when the tool is missing. */
export declare class FfmpegMusicProbe implements MusicProbe {
    private readonly tools;
    constructor(tools: MediaTools);
    probe(input: string): Promise<MusicFileTags | undefined>;
    extractCover(input: string, streamIndex: number, outputPath: string): Promise<boolean>;
}
//# sourceMappingURL=tools.d.ts.map