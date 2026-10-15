/** Stable, user-safe poll failure. Messages are shown to members and staff. */
export class PollError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "PollError";
    }
}
const SNOWFLAKE = /^\d{17,20}$/;
const CUSTOM_EMOJI = /^<a?:\w{2,32}:\d{17,20}>$/;
export function invalid(message) {
    throw new PollError("INVALID_INPUT", message);
}
export function requireSnowflake(name, value) {
    if (!value || !SNOWFLAKE.test(value))
        invalid(`${name} must be a Discord ID.`);
}
export function requireRange(name, value, min, max) {
    if (!Number.isInteger(value) || value < min || value > max)
        invalid(`${name} must be a whole number between ${min} and ${max}.`);
}
export function requireLength(name, value, min, max) {
    if (value.length < min || value.length > max)
        invalid(`${name} must be between ${min} and ${max} characters.`);
}
export function requireIds(name, values, max) {
    if (values.length > max)
        invalid(`${name} can contain at most ${max} entries.`);
    for (const value of values)
        requireSnowflake(name, value);
}
/** Accepts one unicode emoji (up to 16 characters) or a custom `<:name:id>` emoji. */
export function requireEmoji(value) {
    if (CUSTOM_EMOJI.test(value))
        return;
    if (value.length > 16 || /[\sA-Za-z_]/.test(value) || /^[\x00-\x7F]+$/.test(value))
        invalid(`"${value}" is not a valid emoji.`);
}
const LEADING_EMOJI = /^(<a?:\w{2,32}:\d{17,20}>|[0-9#*]️?⃣|\p{Extended_Pictographic}(?:️|[\u{1F3FB}-\u{1F3FF}]|‍\p{Extended_Pictographic}️?)*)\s*(.+)$/u;
/** Splits `🍕 Pizza` into an emoji and a label. Text without a leading emoji is all label. */
export function splitOptionText(text) {
    const match = LEADING_EMOJI.exec(text.trim());
    return match ? { label: match[2].trim(), emoji: match[1] } : { label: text.trim() };
}
/** `10m`, `2h`, `3d`, `1w`, or plain minutes. Returns minutes, or undefined when invalid. */
export function parseDuration(text) {
    const match = /^\s*(\d{1,6})\s*(m|min|mins|minutes?|h|hrs?|hours?|d|days?|w|weeks?)?\s*$/i.exec(text);
    if (!match)
        return undefined;
    const amount = Number(match[1]);
    const unit = (match[2] ?? "m").toLowerCase()[0];
    const minutes = amount * (unit === "w" ? 10_080 : unit === "d" ? 1440 : unit === "h" ? 60 : 1);
    return minutes > 0 ? minutes : undefined;
}
//# sourceMappingURL=validation.js.map