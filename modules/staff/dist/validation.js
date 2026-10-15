/** Stable, user-safe staff failure. Messages are shown to staff and members. */
export class StaffError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "StaffError";
    }
}
const SNOWFLAKE = /^\d{17,20}$/;
const COLOR = /^#[0-9a-f]{6}$/i;
export function invalid(message) {
    throw new StaffError("INVALID_INPUT", message);
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
/** Trims optional text, returning undefined when empty, and checks its length. */
export function optionalText(name, value, max) {
    const text = value?.trim() || undefined;
    if (text !== undefined)
        requireLength(name, text, 1, max);
    return text;
}
export function validateSettings(input) {
    requireSnowflake("guildId", input.guildId);
    if (input.logChannelId !== undefined)
        requireSnowflake("logChannelId", input.logChannelId);
    if (input.rosterChannelId !== undefined)
        requireSnowflake("rosterChannelId", input.rosterChannelId);
    if (input.loaRoleId !== undefined)
        requireSnowflake("loaRoleId", input.loaRoleId);
    requireRange("autoClockOutHours", input.autoClockOutHours, 0, 72);
    requireRange("maxLeaveDays", input.maxLeaveDays, 1, 365);
}
export function validateRank(input) {
    requireLength("Rank name", input.name.trim(), 1, 50);
    if (input.roleId !== undefined)
        requireSnowflake("roleId", input.roleId);
    if (!COLOR.test(input.color))
        invalid("Color must look like #5865F2.");
    if (input.description !== undefined)
        requireLength("Description", input.description.trim(), 1, 200);
}
//# sourceMappingURL=validation.js.map