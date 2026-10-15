import { LEVEL_CAP, LEVEL_REWARD_MODES, LEVEL_UP_MODES } from "./types.js";
/** Stable, user-safe levels failure. Messages are shown to members and staff. */
export class LevelError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "LevelError";
    }
}
const SNOWFLAKE = /^\d{17,20}$/;
export function invalid(message) {
    throw new LevelError("INVALID_INPUT", message);
}
export function requireSnowflake(name, value) {
    if (!value || !SNOWFLAKE.test(value))
        invalid(`${name} must be a Discord ID.`);
}
export function requireRange(name, value, min, max) {
    if (!Number.isInteger(value) || value < min || value > max)
        invalid(`${name} must be a whole number between ${min} and ${max}.`);
}
function requireNumber(name, value, min, max) {
    if (!Number.isFinite(value) || value < min || value > max)
        invalid(`${name} must be between ${min} and ${max}.`);
}
function requireIds(name, values, max) {
    if (values.length > max)
        invalid(`${name} can contain at most ${max} entries.`);
    if (new Set(values).size !== values.length)
        invalid(`${name} lists the same ID twice.`);
    for (const value of values)
        requireSnowflake(name, value);
}
function requireMultipliers(name, values) {
    requireIds(name, values.map((value) => value.id), 50);
    for (const value of values)
        requireNumber(`${name} multiplier`, value.multiplier, 0.1, 10);
}
export function validateSettings(input) {
    requireSnowflake("guildId", input.guildId);
    requireRange("Minimum message XP", input.messageXpMin, 0, 1000);
    requireRange("Maximum message XP", input.messageXpMax, 0, 1000);
    if (input.messageXpMax < input.messageXpMin)
        invalid("Maximum message XP must be at least the minimum.");
    requireRange("Cooldown", input.cooldownSeconds, 0, 3600);
    requireRange("Voice XP per minute", input.voiceXpPerMinute, 0, 1000);
    requireNumber("Curve base", input.curve.base, 1, 10_000);
    requireNumber("Curve exponent", input.curve.exponent, 1, 4);
    requireNumber("Curve linear part", input.curve.linear, 0, 10_000);
    requireMultipliers("Role multipliers", input.roleMultipliers);
    requireMultipliers("Channel multipliers", input.channelMultipliers);
    requireIds("No-XP roles", input.noXpRoleIds, 100);
    requireIds("No-XP channels", input.noXpChannelIds, 200);
    if (!LEVEL_UP_MODES.includes(input.levelUpMode))
        invalid("Level-up message setting is not supported.");
    if (input.levelUpChannelId !== undefined)
        requireSnowflake("Level-up channel", input.levelUpChannelId);
    if (input.levelUpMode === "CHANNEL" && !input.levelUpChannelId)
        invalid("Choose a channel for level-up messages.");
    const message = input.levelUpMessage.trim();
    if (message.length < 1 || message.length > 500)
        invalid("Level-up message must be between 1 and 500 characters.");
    if (!LEVEL_REWARD_MODES.includes(input.rewardMode))
        invalid("Reward mode must be STACK or HIGHEST.");
    if (input.rewards.length > 50)
        invalid("You can have at most 50 reward roles.");
    const roles = new Set();
    for (const reward of input.rewards) {
        requireRange("Reward level", reward.level, 1, LEVEL_CAP);
        requireSnowflake("Reward role", reward.roleId);
        if (roles.has(reward.roleId))
            invalid("Each reward role can only be used once.");
        roles.add(reward.roleId);
    }
    requireRange("Max level", input.maxLevel, 0, LEVEL_CAP);
}
//# sourceMappingURL=validation.js.map