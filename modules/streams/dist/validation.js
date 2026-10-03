import { ENDED_BEHAVIORS, STREAM_PLATFORMS } from "./types.js";
/** Stable, user-safe streams failure. Messages are shown to staff. */
export class StreamsError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "StreamsError";
    }
}
export const MESSAGE_TEXT_LIMIT = 1000;
const SNOWFLAKE = /^\d{17,20}$/;
const HANDLE_RULES = {
    twitch: { pattern: /^[a-z0-9_]{3,25}$/, example: "a Twitch name like shroud" },
    kick: { pattern: /^[a-z0-9_-]{1,50}$/, example: "a Kick channel name like xqc" },
    youtube: { pattern: /^(?:UC[\w-]{22}|[\w.-]{1,100})$/, example: "a YouTube handle like @mkbhd or a channel ID starting with UC" },
};
export function invalid(message) {
    throw new StreamsError("INVALID_INPUT", message);
}
export function requireSnowflake(name, value) {
    if (!value || !SNOWFLAKE.test(value))
        invalid(`${name} must be a Discord ID.`);
}
export function isPlatform(value) {
    return STREAM_PLATFORMS.includes(value);
}
export function platformLabel(platform) {
    return platform === "twitch" ? "Twitch" : platform === "kick" ? "Kick" : "YouTube";
}
/**
 * Cleans a handle as staff typed it: trims, strips a pasted profile URL and a
 * leading `@`, and lowercases Twitch and Kick names. Throws when it cannot be a handle.
 */
export function normalizeHandle(platform, raw) {
    let handle = raw
        .trim()
        .replace(/^https?:\/\/(?:www\.|m\.)?(?:twitch\.tv|kick\.com|youtube\.com)\//i, "")
        .replace(/^(?:channel|c|user)\//i, "")
        .replace(/[/?#].*$/, "")
        .replace(/^@/, "");
    if (platform !== "youtube")
        handle = handle.toLowerCase();
    const rule = HANDLE_RULES[platform];
    if (!rule.pattern.test(handle))
        invalid(`Enter ${rule.example}.`);
    return handle;
}
export function validateSettings(input) {
    requireSnowflake("guildId", input.guildId);
    if (input.defaultChannelId !== undefined)
        requireSnowflake("defaultChannelId", input.defaultChannelId);
    if (!ENDED_BEHAVIORS.includes(input.endedBehavior))
        invalid("Choose what happens when a stream ends: keep, edit, or delete.");
    if (!Number.isInteger(input.checkIntervalSeconds) || input.checkIntervalSeconds < 60 || input.checkIntervalSeconds > 600)
        invalid("Check interval must be a whole number of seconds between 60 and 600.");
}
export function validateSubscriptionFields(input) {
    if (input.announceChannelId !== undefined)
        requireSnowflake("announceChannelId", input.announceChannelId);
    if (input.pingRoleId !== undefined)
        requireSnowflake("pingRoleId", input.pingRoleId);
    if (input.messageText !== undefined && input.messageText.trim().length === 0)
        invalid("Message text cannot be blank. Leave it empty to use the default.");
    if (input.messageText !== undefined && input.messageText.length > MESSAGE_TEXT_LIMIT)
        invalid(`Message text can have at most ${MESSAGE_TEXT_LIMIT} characters.`);
}
//# sourceMappingURL=validation.js.map