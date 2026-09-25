import type {
  TicketCategoryInput,
  TicketPanelInput,
  TicketQuestion,
  TicketSettingsInput,
} from "./types.js";
import { TICKET_BUTTON_STYLES, TICKET_PRIORITIES } from "./types.js";

export type TicketErrorCode =
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "DISABLED"
  | "FORBIDDEN"
  | "LIMIT_REACHED"
  | "INVALID_STATE"
  | "CONFLICT"
  | "DEPENDENCY_UNAVAILABLE";

/** Stable, user-safe ticket failure. Messages are shown to members. */
export class TicketError extends Error {
  public constructor(
    public readonly code: TicketErrorCode,
    message: string,
    public readonly details?: Readonly<Record<string, string | number>> | undefined,
  ) {
    super(message);
    this.name = "TicketError";
  }
}

const SNOWFLAKE = /^\d{17,20}$/;
const HEX_COLOR = /^#?[0-9a-fA-F]{6}$/;
const QUESTION_ID = /^[a-z0-9-]{1,32}$/;

export function invalid(message: string): never {
  throw new TicketError("INVALID_INPUT", message);
}

export function requireSnowflake(name: string, value: string): void {
  if (!SNOWFLAKE.test(value)) invalid(`${name} must be a Discord ID.`);
}

export function optionalSnowflake(name: string, value: string | undefined): void {
  if (value !== undefined) requireSnowflake(name, value);
}

export function requireLength(name: string, value: string, min: number, max: number): void {
  if (value.length < min || value.length > max) invalid(`${name} must be between ${min} and ${max} characters.`);
}

export function requireRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) invalid(`${name} must be a whole number between ${min} and ${max}.`);
}

function requireRoleList(name: string, values: readonly string[], max = 25): void {
  if (values.length > max) invalid(`${name} can contain at most ${max} entries.`);
  for (const value of values) {
    requireSnowflake(name, value);
  }
}

export function validateSettings(input: TicketSettingsInput): void {
  requireSnowflake("guildId", input.guildId);
  optionalSnowflake("openCategoryChannelId", input.openCategoryChannelId);
  optionalSnowflake("closedCategoryChannelId", input.closedCategoryChannelId);
  optionalSnowflake("threadParentChannelId", input.threadParentChannelId);
  optionalSnowflake("transcriptChannelId", input.transcriptChannelId);
  optionalSnowflake("logChannelId", input.logChannelId);
  requireRoleList("supportRoleIds", input.supportRoleIds);
  requireRoleList("blockedRoleIds", input.blockedRoleIds);
  requireRoleList("blockedUserIds", input.blockedUserIds, 500);
  requireRange("maxOpenPerUser", input.maxOpenPerUser, 1, 25);
  requireLength("nameTemplate", input.nameTemplate, 1, 90);
  requireLength("openMessage", input.openMessage, 1, 2000);
  if (!HEX_COLOR.test(input.embedColor)) invalid("embedColor must be a hex color such as #5865F2.");
  requireRange("deleteDelaySeconds", input.deleteDelaySeconds, 0, 3600);
  requireRange("autoCloseHours", input.autoCloseHours, 0, 720);
  requireRange("autoCloseWarningHours", input.autoCloseWarningHours, 0, 720);
  if (input.autoCloseWarningHours > 0 && input.autoCloseWarningHours >= input.autoCloseHours)
    invalid("autoCloseWarningHours must be less than autoCloseHours.");
  if (input.enabled && input.mode === "THREAD" && !input.threadParentChannelId)
    invalid("Thread mode requires a parent channel for ticket threads.");
}

export function validateCategory(input: TicketCategoryInput): void {
  requireSnowflake("guildId", input.guildId);
  requireLength("name", input.name.trim(), 1, 80);
  if (input.description !== undefined) requireLength("description", input.description, 1, 100);
  if (input.emoji !== undefined) requireLength("emoji", input.emoji, 1, 64);
  if (!TICKET_BUTTON_STYLES.includes(input.buttonStyle)) invalid("buttonStyle is not supported.");
  if (!TICKET_PRIORITIES.includes(input.defaultPriority)) invalid("defaultPriority is not supported.");
  requireRoleList("supportRoleIds", input.supportRoleIds);
  requireRoleList("requiredRoleIds", input.requiredRoleIds);
  optionalSnowflake("parentChannelId", input.parentChannelId);
  if (input.nameTemplate !== undefined) requireLength("nameTemplate", input.nameTemplate, 1, 90);
  if (input.openMessage !== undefined) requireLength("openMessage", input.openMessage, 1, 2000);
  if (input.maxOpenPerUser !== undefined) requireRange("maxOpenPerUser", input.maxOpenPerUser, 1, 25);
  if (input.questions.length > 5) invalid("A ticket form can have at most 5 questions.");
  const ids = new Set<string>();
  for (const question of input.questions) {
    validateQuestion(question);
    if (ids.has(question.id)) invalid("Question IDs must be unique.");
    ids.add(question.id);
  }
}

function validateQuestion(question: TicketQuestion): void {
  if (!QUESTION_ID.test(question.id)) invalid("Question IDs use lowercase letters, numbers, and dashes.");
  requireLength("question label", question.label, 1, 45);
  if (question.placeholder !== undefined) requireLength("question placeholder", question.placeholder, 1, 100);
  if (question.style !== "SHORT" && question.style !== "PARAGRAPH") invalid("Question style must be SHORT or PARAGRAPH.");
  const min = question.minLength ?? 0;
  const max = question.maxLength ?? 4000;
  requireRange("question minLength", min, 0, 4000);
  requireRange("question maxLength", max, 1, 4000);
  if (min > max) invalid("Question minLength cannot exceed maxLength.");
}

export function validatePanel(input: TicketPanelInput): void {
  requireSnowflake("guildId", input.guildId);
  requireSnowflake("channelId", input.channelId);
  requireLength("name", input.name.trim(), 1, 80);
  requireLength("title", input.title, 1, 256);
  requireLength("description", input.description, 1, 4000);
  requireLength("placeholder", input.placeholder, 1, 150);
  if (!HEX_COLOR.test(input.color)) invalid("color must be a hex color such as #5865F2.");
  if (input.footer !== undefined) requireLength("footer", input.footer, 1, 2048);
  if (input.imageUrl !== undefined && !/^https:\/\/\S{1,2000}$/.test(input.imageUrl))
    invalid("imageUrl must be an https URL.");
  if (input.categoryIds.length > 25) invalid("A panel can offer at most 25 categories.");
}

/** Turns a name template into a Discord-safe channel name. */
export function channelName(template: string, values: Readonly<Record<string, string>>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(values)) rendered = rendered.replaceAll(`{${key}}`, value);
  const safe = rendered
    .toLowerCase()
    .replaceAll(/[^a-z0-9_-]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "")
    .slice(0, 100);
  return safe || `ticket-${values.number ?? "new"}`;
}

/** Replaces `{placeholder}` tokens in member-facing text. */
export function renderText(template: string, values: Readonly<Record<string, string>>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(values)) rendered = rendered.replaceAll(`{${key}}`, value);
  return rendered;
}
