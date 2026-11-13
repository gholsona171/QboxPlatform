/** Stable, user-safe music failure. Messages are shown to members and staff. */
export class MusicError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "MusicError";
    }
}
/** Largest file a manager can upload. */
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_QUEUE_LIMIT = 500;
export const MAX_DJ_ROLES = 25;
export const MAX_STATIONS = 100;
export const MAX_PLAYLISTS = 100;
export const MAX_PLAYLIST_TRACKS = 500;
export const TEXT_LIMIT = 200;
export const DESCRIPTION_LIMIT = 500;
/** The message shown whenever ffmpeg is needed but missing. */
export const FFMPEG_MISSING = "Music needs ffmpeg on the host.";
/** Upload formats: extension -> content types browsers send for it. */
export const AUDIO_FORMATS = {
    mp3: ["audio/mpeg", "audio/mp3"],
    ogg: ["audio/ogg", "application/ogg", "audio/vorbis"],
    opus: ["audio/opus", "audio/ogg"],
    m4a: ["audio/mp4", "audio/x-m4a", "audio/m4a", "audio/aac"],
    aac: ["audio/aac", "audio/x-aac", "audio/mp4"],
    flac: ["audio/flac", "audio/x-flac"],
    wav: ["audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave"],
};
const SNOWFLAKE = /^\d{17,20}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function invalid(message) {
    throw new MusicError("INVALID_INPUT", message);
}
export function isSnowflake(value) {
    return value !== undefined && SNOWFLAKE.test(value);
}
export function isUuid(value) {
    return UUID.test(value);
}
export function requireSnowflake(name, value) {
    if (!isSnowflake(value))
        invalid(`${name} must be a Discord ID.`);
}
export function validateSettings(input) {
    requireSnowflake("guildId", input.guildId);
    if (input.djRoleIds.length > MAX_DJ_ROLES)
        invalid(`Pick at most ${MAX_DJ_ROLES} DJ roles.`);
    for (const roleId of input.djRoleIds)
        requireSnowflake("djRoleIds", roleId);
    if (input.announceChannelId !== undefined)
        requireSnowflake("announceChannelId", input.announceChannelId);
    if (input.homeChannelId !== undefined)
        requireSnowflake("homeChannelId", input.homeChannelId);
    if (!Number.isInteger(input.defaultVolume) || input.defaultVolume < 0 || input.defaultVolume > 200)
        invalid("Default volume must be a whole number from 0 to 200.");
    if (!Number.isInteger(input.maxQueue) || input.maxQueue < 1 || input.maxQueue > MAX_QUEUE_LIMIT)
        invalid(`Queue size must be a whole number from 1 to ${MAX_QUEUE_LIMIT}.`);
    if (!Number.isInteger(input.autoLeaveMinutes) || input.autoLeaveMinutes < 0 || input.autoLeaveMinutes > 1440)
        invalid("Auto-leave must be a whole number of minutes from 0 to 1440.");
    if (input.stayConnected247 && !input.homeChannelId)
        invalid("Pick a home voice channel for 24/7 mode.");
    if (input.idleRadioStationId !== undefined && !isUuid(input.idleRadioStationId))
        invalid("Pick a saved station for the idle radio.");
}
/** Trims a required text field and checks its length. */
export function requiredText(label, value, limit = TEXT_LIMIT) {
    const text = value.trim();
    if (!text)
        invalid(`${label} cannot be empty.`);
    if (text.length > limit)
        invalid(`${label} can have at most ${limit} characters.`);
    return text;
}
/** Trims an optional text field; empty becomes undefined. */
export function optionalText(label, value, limit = TEXT_LIMIT) {
    const text = value?.trim();
    if (!text)
        return undefined;
    if (text.length > limit)
        invalid(`${label} can have at most ${limit} characters.`);
    return text;
}
/** "1:23", "01:02:03", or "83" to seconds. */
export function parseTime(value) {
    const text = value.trim();
    if (!/^\d{1,5}(?::\d{1,2}){0,2}$/.test(text))
        invalid("Write the time as mm:ss, for example 1:30.");
    const parts = text.split(":").map(Number);
    if (parts.slice(1).some((part) => part >= 60))
        invalid("Write the time as mm:ss, for example 1:30.");
    return parts.reduce((total, part) => total * 60 + part, 0);
}
/** Seconds to "m:ss" or "h:mm:ss". */
export function formatTime(seconds) {
    const whole = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(whole / 3600);
    const minutes = Math.floor((whole % 3600) / 60);
    const rest = String(whole % 60).padStart(2, "0");
    return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
}
/** Lowercase extension of a file name, without the dot. */
export function extensionOf(name) {
    const match = /\.([a-z0-9]{1,5})$/i.exec(name.trim());
    return match ? match[1].toLowerCase() : "";
}
/**
 * The stored extension for an upload, from its file name and content type.
 * Throws when it is not a supported audio format.
 */
export function uploadExtension(fileName, contentType) {
    const type = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
    const fromName = extensionOf(fileName);
    if (fromName in AUDIO_FORMATS)
        return fromName;
    const fromType = Object.entries(AUDIO_FORMATS).find(([, types]) => types.includes(type));
    if (fromType)
        return fromType[0];
    return invalid("That file type is not supported. Upload mp3, ogg, opus, m4a, aac, flac, or wav.");
}
/** Title and artist from a file name like "Artist - Title.mp3". */
export function tagsFromFileName(fileName) {
    const base = fileName.replace(/^.*[\\/]/, "").replace(/\.[a-z0-9]{1,5}$/i, "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
    const withoutNumber = base.replace(/^\d{1,3}\s*[-.]\s+/, "");
    const split = /^(.+?)\s+-\s+(.+)$/.exec(withoutNumber);
    if (split)
        return { artist: split[1].trim().slice(0, TEXT_LIMIT), title: split[2].trim().slice(0, TEXT_LIMIT) };
    return { title: (withoutNumber || base || "Untitled").slice(0, TEXT_LIMIT) };
}
//# sourceMappingURL=validation.js.map