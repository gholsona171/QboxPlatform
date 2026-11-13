import { BUTTON_STYLES, MAX_QUESTIONS, QUESTION_TYPES } from "./types.js";
/** Stable, user-safe application failure. Messages are shown to members and staff. */
export class ApplicationError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "ApplicationError";
    }
}
const SNOWFLAKE = /^\d{17,20}$/;
const QUESTION_ID = /^[a-z0-9_-]{1,40}$/i;
const COLOR = /^#[0-9a-f]{6}$/i;
/** Longest text answer Discord forms accept. */
export const MAX_ANSWER_LENGTH = 4000;
export const MAX_FORMS = 25;
export const MAX_PANELS = 25;
export function invalid(message) {
    throw new ApplicationError("INVALID_INPUT", message);
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
function requireIds(name, values, max) {
    if (values.length > max)
        invalid(`${name} can contain at most ${max} entries.`);
    for (const value of values)
        requireSnowflake(name, value);
}
function validateQuestion(question, index) {
    const name = `Question ${index + 1}`;
    if (!QUESTION_ID.test(question.id))
        invalid(`${name} needs an ID made of letters, numbers, - or _.`);
    requireLength(`${name} label`, question.label.trim(), 1, 45);
    if (question.description !== undefined)
        requireLength(`${name} description`, question.description, 1, 100);
    if (!QUESTION_TYPES.includes(question.type))
        invalid(`${name} type is not supported.`);
    if (question.type === "CHOICE") {
        if (question.choices.length < 2 || question.choices.length > 25)
            invalid(`${name} needs between 2 and 25 choices.`);
        const seen = new Set();
        for (const choice of question.choices) {
            requireLength(`${name} choice`, choice.trim(), 1, 100);
            if (seen.has(choice.trim().toLowerCase()))
                invalid(`${name} has the same choice twice.`);
            seen.add(choice.trim().toLowerCase());
        }
    }
    else if (question.choices.length > 0)
        invalid(`${name} can only have choices when it is a multiple choice question.`);
    if (question.type === "SHORT" || question.type === "PARAGRAPH") {
        if (question.minLength !== undefined)
            requireRange(`${name} minimum length`, question.minLength, 0, MAX_ANSWER_LENGTH);
        if (question.maxLength !== undefined)
            requireRange(`${name} maximum length`, question.maxLength, 1, MAX_ANSWER_LENGTH);
        if (question.minLength !== undefined && question.maxLength !== undefined && question.minLength > question.maxLength)
            invalid(`${name} minimum length is larger than its maximum length.`);
    }
}
export function validateForm(input) {
    requireSnowflake("guildId", input.guildId);
    requireLength("Form name", input.name.trim(), 1, 80);
    if (input.description !== undefined)
        requireLength("Description", input.description, 1, 1000);
    if (input.questions.length < 1)
        invalid("A form needs at least one question.");
    if (input.questions.length > MAX_QUESTIONS)
        invalid(`A form can have at most ${MAX_QUESTIONS} questions.`);
    const ids = new Set();
    input.questions.forEach((question, index) => {
        validateQuestion(question, index);
        if (ids.has(question.id))
            invalid("Each question needs a different ID.");
        ids.add(question.id);
    });
    requireRange("Cooldown after denial (days)", input.cooldownDays, 0, 365);
    if (input.minAccountAgeDays !== undefined)
        requireRange("Minimum account age (days)", input.minAccountAgeDays, 1, 3650);
    requireIds("Required roles", input.requiredRoleIds, 25);
    requireIds("Blocked roles", input.blockedRoleIds, 25);
    requireIds("Reviewer roles", input.reviewerRoleIds, 25);
    requireIds("Members to ping", input.pingMemberIds, 10);
    requireIds("Roles given on accept", input.acceptRoleIds, 10);
    requireIds("Roles removed on accept", input.removeRoleIds, 10);
    if (input.reviewChannelId !== undefined)
        requireSnowflake("Review channel", input.reviewChannelId);
    if (input.discussionChannelId !== undefined)
        requireSnowflake("Discussion channel", input.discussionChannelId);
    if (input.acceptMessage !== undefined)
        requireLength("Accept message", input.acceptMessage, 1, 2000);
    if (input.denyMessage !== undefined)
        requireLength("Deny message", input.denyMessage, 1, 2000);
    if (input.buttonLabel !== undefined)
        requireLength("Button label", input.buttonLabel, 1, 80);
    if (input.buttonEmoji !== undefined)
        requireLength("Button emoji", input.buttonEmoji, 1, 64);
    if (!BUTTON_STYLES.includes(input.buttonStyle))
        invalid("Button color is not supported.");
    requireRange("Position", input.position, 0, 1000);
    if (input.acceptRoleIds.some((id) => input.removeRoleIds.includes(id)))
        invalid("A role cannot be both given and removed on accept.");
}
export function validatePanel(input) {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("Channel", input.channelId);
    requireLength("Panel title", input.title.trim(), 1, 256);
    requireLength("Panel text", input.description.trim(), 1, 4000);
    if (!COLOR.test(input.color))
        invalid("Color must look like #5865F2.");
    if (input.formIds.length > 25)
        invalid("A panel can show at most 25 forms.");
}
//# sourceMappingURL=validation.js.map