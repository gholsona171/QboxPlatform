import { normalizeTimeZone } from "@qbox/shared/time-zones";
import { parseDate, parseDateTime, parseTime } from "./schedule.js";
import { MIN_INTERVAL_MINUTES, SCHEDULE_TYPES } from "./types.js";
/** Stable, user-safe scheduled message failure. Messages are shown to staff. */
export class ScheduledMessageError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "ScheduledMessageError";
    }
}
const SNOWFLAKE = /^\d{17,20}$/;
const COLOR = /^#[0-9a-f]{6}$/i;
export function invalid(message) {
    throw new ScheduledMessageError("INVALID_INPUT", message);
}
export function requireSnowflake(name, value) {
    if (!value || !SNOWFLAKE.test(value))
        invalid(`${name} must be a Discord ID.`);
}
function requireRange(name, value, min, max) {
    if (!Number.isInteger(value) || value < min || value > max)
        invalid(`${name} must be a whole number between ${min} and ${max}.`);
}
function requireMax(name, value, max) {
    if (value !== undefined && value.length > max)
        invalid(`${name} can be at most ${max} characters.`);
}
function trimmed(value) {
    const text = value?.trim();
    return text ? text : undefined;
}
/** Checks a schedule and returns it with only the fields its type uses. */
export function normalizeSchedule(schedule) {
    if (!SCHEDULE_TYPES.includes(schedule.type))
        invalid("Choose once, interval, daily, weekly, or monthly.");
    const timeZone = normalizeTimeZone(schedule.timeZone);
    if (!timeZone)
        invalid(`"${schedule.timeZone}" is not a time zone. Use a name like Europe/London or America/New_York.`);
    if (schedule.type === "ONCE") {
        if (!schedule.runAt || !parseDateTime(schedule.runAt))
            invalid("Choose the date and time to post.");
        return { type: "ONCE", timeZone, runAt: schedule.runAt };
    }
    const startDate = trimmed(schedule.startDate);
    const endDate = trimmed(schedule.endDate);
    if (startDate !== undefined && !parseDate(startDate))
        invalid("Start date must look like 2026-10-01.");
    if (endDate !== undefined && !parseDate(endDate))
        invalid("End date must look like 2026-12-31.");
    if (startDate && endDate && endDate < startDate)
        invalid("The end date is before the start date.");
    const time = trimmed(schedule.time);
    if (time !== undefined && !parseTime(time))
        invalid("Time must look like 09:30 (24-hour clock).");
    const range = { ...(startDate ? { startDate } : {}), ...(endDate ? { endDate } : {}) };
    switch (schedule.type) {
        case "INTERVAL":
            requireRange("Interval (minutes)", schedule.intervalMinutes ?? 0, MIN_INTERVAL_MINUTES, 525_600);
            return { type: "INTERVAL", timeZone, intervalMinutes: schedule.intervalMinutes, ...(time && startDate ? { time } : {}), ...range };
        case "DAILY":
            if (!time)
                invalid("Choose the time to post.");
            return { type: "DAILY", timeZone, time, ...range };
        case "WEEKLY": {
            if (!time)
                invalid("Choose the time to post.");
            const weekdays = [...new Set(schedule.weekdays ?? [])].sort((left, right) => left - right);
            if (weekdays.length === 0)
                invalid("Choose at least one day of the week.");
            for (const day of weekdays)
                requireRange("Day of the week", day, 0, 6);
            return { type: "WEEKLY", timeZone, time, weekdays, ...range };
        }
        default:
            if (!time)
                invalid("Choose the time to post.");
            requireRange("Day of the month", schedule.dayOfMonth ?? 0, 1, 31);
            return { type: "MONTHLY", timeZone, time, dayOfMonth: schedule.dayOfMonth, ...range };
    }
}
/** Trims the embed, or returns undefined when it has nothing to show. */
export function normalizeEmbed(embed) {
    if (!embed)
        return undefined;
    const result = {
        ...(trimmed(embed.title) ? { title: trimmed(embed.title) } : {}),
        ...(trimmed(embed.description) ? { description: trimmed(embed.description) } : {}),
        ...(trimmed(embed.color) ? { color: trimmed(embed.color) } : {}),
        ...(trimmed(embed.imageUrl) ? { imageUrl: trimmed(embed.imageUrl) } : {}),
        ...(trimmed(embed.footer) ? { footer: trimmed(embed.footer) } : {}),
        fields: embed.fields.map((field) => ({ name: field.name.trim(), value: field.value.trim(), inline: field.inline })).filter((field) => field.name || field.value),
    };
    if (!result.title && !result.description && !result.imageUrl && result.fields.length === 0)
        return undefined;
    requireMax("Embed title", result.title, 256);
    requireMax("Embed description", result.description, 4096);
    requireMax("Embed footer", result.footer, 2048);
    if (result.color !== undefined && !COLOR.test(result.color))
        invalid("Embed color must be a hex color like #5865F2.");
    if (result.imageUrl !== undefined && !/^https:\/\/\S{1,1990}$/.test(result.imageUrl))
        invalid("Image must be an https link.");
    if (result.fields.length > 10)
        invalid("An embed can have at most 10 fields.");
    for (const field of result.fields) {
        if (!field.name || !field.value)
            invalid("Every embed field needs a name and a value.");
        requireMax("Field name", field.name, 256);
        requireMax("Field value", field.value, 1024);
    }
    const total = [result.title, result.description, result.footer, ...result.fields.flatMap((field) => [field.name, field.value])].join("").length;
    if (total > 6000)
        invalid("The embed is too long. Discord allows 6000 characters in total.");
    return result;
}
/** Checks a message and returns it trimmed and normalized. */
export function normalizeMessage(input) {
    requireSnowflake("guildId", input.guildId);
    const name = input.name.trim();
    if (name.length < 1 || name.length > 100)
        invalid("Name must be between 1 and 100 characters.");
    requireSnowflake("Channel", input.channelId);
    if (input.pingRoleIds.length > 10)
        invalid("You can ping at most 10 roles.");
    for (const roleId of input.pingRoleIds)
        requireSnowflake("Ping role", roleId);
    const pingRoleIds = [...new Set(input.pingRoleIds)];
    const content = trimmed(input.content);
    const pings = pingRoleIds.map((id) => `<@&${id}>`).join(" ");
    if (`${pings} ${content ?? ""}`.trim().length > 2000)
        invalid("The message text (with role pings) can be at most 2000 characters.");
    const embed = normalizeEmbed(input.embed);
    if (!content && !embed)
        invalid("Add message text or an embed.");
    if (input.maxRuns !== undefined)
        requireRange("Maximum posts", input.maxRuns, 1, 100_000);
    return {
        guildId: input.guildId,
        name,
        channelId: input.channelId,
        ...(content ? { content } : {}),
        ...(embed ? { embed } : {}),
        pingRoleIds,
        schedule: normalizeSchedule(input.schedule),
        enabled: input.enabled,
        deletePrevious: input.deletePrevious,
        pin: input.pin,
        ...(input.maxRuns === undefined ? {} : { maxRuns: input.maxRuns }),
    };
}
//# sourceMappingURL=validation.js.map