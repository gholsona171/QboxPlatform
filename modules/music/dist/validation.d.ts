import type { MusicSettingsInput } from "./types.js";
export type MusicErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe music failure. Messages are shown to members and staff. */
export declare class MusicError extends Error {
    readonly code: MusicErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: MusicErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
/** Largest file a manager can upload. */
export declare const MAX_FILE_BYTES: number;
export declare const MAX_QUEUE_LIMIT = 500;
export declare const MAX_DJ_ROLES = 25;
export declare const MAX_STATIONS = 100;
export declare const MAX_PLAYLISTS = 100;
export declare const MAX_PLAYLIST_TRACKS = 500;
export declare const TEXT_LIMIT = 200;
export declare const DESCRIPTION_LIMIT = 500;
/** The message shown whenever ffmpeg is needed but missing. */
export declare const FFMPEG_MISSING = "Music needs ffmpeg on the host.";
/** Upload formats: extension -> content types browsers send for it. */
export declare const AUDIO_FORMATS: Readonly<Record<string, readonly string[]>>;
export declare function invalid(message: string): never;
export declare function isSnowflake(value: string | undefined): value is string;
export declare function isUuid(value: string): boolean;
export declare function requireSnowflake(name: string, value: string | undefined): void;
export declare function validateSettings(input: MusicSettingsInput): void;
/** Trims a required text field and checks its length. */
export declare function requiredText(label: string, value: string, limit?: number): string;
/** Trims an optional text field; empty becomes undefined. */
export declare function optionalText(label: string, value: string | undefined, limit?: number): string | undefined;
/** "1:23", "01:02:03", or "83" to seconds. */
export declare function parseTime(value: string): number;
/** Seconds to "m:ss" or "h:mm:ss". */
export declare function formatTime(seconds: number): string;
/** Lowercase extension of a file name, without the dot. */
export declare function extensionOf(name: string): string;
/**
 * The stored extension for an upload, from its file name and content type.
 * Throws when it is not a supported audio format.
 */
export declare function uploadExtension(fileName: string, contentType: string): string;
/** Title and artist from a file name like "Artist - Title.mp3". */
export declare function tagsFromFileName(fileName: string): {
    readonly title: string;
    readonly artist?: string | undefined;
};
//# sourceMappingURL=validation.d.ts.map