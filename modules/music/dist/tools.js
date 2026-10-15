import { execFile } from "node:child_process";
import { accessSync, constants, statSync } from "node:fs";
import { delimiter, dirname, join } from "node:path";
import { TEXT_LIMIT } from "./validation.js";
const PROBE_TIMEOUT_MS = 15_000;
/** Remote links are probed quickly so a play command stays responsive. */
const REMOTE_PROBE_TIMEOUT_MS = 6_000;
/**
 * Full path of an executable on PATH, or `override` when it points at an
 * executable file. Undefined when neither is found.
 */
export function findExecutable(name, override, pathVariable = process.env["PATH"] ?? "") {
    if (override)
        return isExecutable(override) ? override : undefined;
    for (const directory of pathVariable.split(delimiter).filter(Boolean)) {
        for (const candidate of process.platform === "win32" ? [`${name}.exe`, name] : [name]) {
            const path = join(directory, candidate);
            if (isExecutable(path))
                return path;
        }
    }
    return undefined;
}
function isExecutable(path) {
    try {
        if (!statSync(path).isFile())
            return false;
        accessSync(path, constants.X_OK);
        return true;
    }
    catch {
        return false;
    }
}
/** Finds ffmpeg (FFMPEG_PATH or PATH) and ffprobe (next to that ffmpeg, else PATH). */
export function findMediaTools(ffmpegOverride) {
    const ffmpeg = findExecutable("ffmpeg", ffmpegOverride || undefined);
    const beside = ffmpeg && ffmpegOverride ? findExecutable("ffprobe", undefined, dirname(ffmpeg)) : undefined;
    return { ffmpeg, ffprobe: beside ?? findExecutable("ffprobe") };
}
/** Reads the parts of ffprobe's JSON output the library uses. */
export function parseProbeOutput(json) {
    const output = JSON.parse(json);
    const tags = new Map(Object.entries(output.format?.tags ?? {}).map(([key, value]) => [key.toLowerCase(), String(value).trim()]));
    const text = (value) => (value ? value.slice(0, TEXT_LIMIT) : undefined);
    const track = Number.parseInt(tags.get("track") ?? "", 10);
    const duration = Number.parseFloat(output.format?.duration ?? "");
    const picture = output.streams?.find((stream) => stream.codec_type === "video" && stream.disposition?.attached_pic === 1 && typeof stream.index === "number");
    const extension = picture?.codec_name === "png" ? "png" : picture?.codec_name === "mjpeg" || picture?.codec_name === "jpeg" ? "jpg" : undefined;
    return {
        title: text(tags.get("title")),
        artist: text(tags.get("artist") ?? tags.get("album_artist")),
        album: text(tags.get("album")),
        trackNumber: Number.isInteger(track) && track > 0 ? track : undefined,
        durationSeconds: Number.isFinite(duration) && duration > 0 ? Math.round(duration) : undefined,
        cover: picture && extension ? { streamIndex: picture.index, extension } : undefined,
    };
}
function run(file, args, timeout = PROBE_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
        execFile(file, [...args], { timeout, maxBuffer: 4 * 1024 * 1024, windowsHide: true }, (error, stdout) => (error ? reject(error) : resolve(stdout)));
    });
}
/** Tags and cover art through ffprobe and ffmpeg. Every method is a no-op when the tool is missing. */
export class FfmpegMusicProbe {
    tools;
    constructor(tools) {
        this.tools = tools;
    }
    async probe(input) {
        if (!this.tools.ffprobe)
            return undefined;
        try {
            const remote = /^https?:\/\//i.test(input);
            const args = ["-v", "error", ...(remote ? ["-rw_timeout", "5000000"] : []), "-show_format", "-show_streams", "-of", "json", input];
            return parseProbeOutput(await run(this.tools.ffprobe, args, remote ? REMOTE_PROBE_TIMEOUT_MS : PROBE_TIMEOUT_MS));
        }
        catch {
            return undefined;
        }
    }
    async extractCover(input, streamIndex, outputPath) {
        if (!this.tools.ffmpeg)
            return false;
        try {
            await run(this.tools.ffmpeg, ["-v", "error", "-y", "-i", input, "-map", `0:${streamIndex}`, "-an", "-vcodec", "copy", "-frames:v", "1", outputPath]);
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=tools.js.map