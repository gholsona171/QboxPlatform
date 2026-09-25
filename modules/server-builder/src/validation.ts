import type { BuilderAnswers, BuilderBlueprint, BuilderChannelType, BuilderOverwrite, BuilderSummary } from "./types.js";
import {
  BOT,
  BUILDER_CATEGORY_PURPOSES,
  BUILDER_CHANNEL_PURPOSES,
  BUILDER_CHANNEL_TYPES,
  BUILDER_PERMISSIONS,
  BUILDER_ROLE_PURPOSES,
  BUILDER_SECTIONS,
  BUILDER_SERVER_TYPES,
  EVERYONE,
} from "./types.js";

export type BuilderErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";

/** Stable, user-safe server builder failure. Messages are shown to server owners. */
export class BuilderError extends Error {
  public constructor(
    public readonly code: BuilderErrorCode,
    message: string,
    public readonly details?: Readonly<Record<string, string | number>> | undefined,
  ) {
    super(message);
    this.name = "BuilderError";
  }
}

/** Discord limits the builder checks before building. */
export const BUILDER_LIMITS = {
  /** Categories plus channels in one server. */
  channels: 500,
  channelsPerCategory: 50,
  roles: 250,
  nameLength: 100,
  topicLength: 1024,
  slowmodeSeconds: 21_600,
  userLimit: 99,
  overwritesPerChannel: 100,
  staffRanks: 15,
  departments: 20,
  voiceLounges: 10,
} as const;

const SNOWFLAKE = /^\d{17,20}$/;
const KEY = /^[a-z0-9][a-z0-9-]{0,59}$/;
const HEX = /^#[0-9a-f]{6}$/i;
const TEXT_TYPES = new Set<BuilderChannelType>(["TEXT", "ANNOUNCEMENT", "FORUM", "MEDIA"]);

export function invalid(message: string): never {
  throw new BuilderError("INVALID_INPUT", message);
}

export function requireSnowflake(name: string, value: string | undefined): void {
  if (!value || !SNOWFLAKE.test(value)) invalid(`${name} must be a Discord ID.`);
}

/** Discord-style text channel name: lowercase, hyphens instead of spaces, no punctuation. */
export function channelSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replaceAll(/[\s_]+/g, "-")
    .replaceAll(/[`~!@#$%^&*()+=[\]{};:'",.<>/?\\|]/g, "")
    .replaceAll(/-{2,}/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, BUILDER_LIMITS.nameLength);
}

/** Lowercase key from any name, e.g. "Senior Moderator" -> "senior-moderator". */
export function keyOf(name: string): string {
  return name.toLowerCase().normalize("NFKD").replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-+|-+$/g, "").slice(0, 50) || "item";
}

export function isTextType(type: BuilderChannelType): boolean {
  return TEXT_TYPES.has(type);
}

/** Trims names and turns text channel names into Discord style. */
export function normalizeBlueprint(blueprint: BuilderBlueprint): BuilderBlueprint {
  return {
    roles: blueprint.roles.map((role) => ({ ...role, name: role.name.trim(), color: role.color.toUpperCase() })),
    categories: blueprint.categories.map((category) => ({
      ...category,
      name: category.name.trim(),
      channels: category.channels.map((channel) => ({
        ...channel,
        name: isTextType(channel.type) ? channelSlug(channel.name) : channel.name.trim(),
        ...(channel.topic?.trim() ? { topic: channel.topic.trim() } : { topic: undefined }),
      })),
    })),
  };
}

function requireName(what: string, name: string): void {
  if (name.length < 1 || name.length > BUILDER_LIMITS.nameLength) invalid(`${what} names must be between 1 and ${BUILDER_LIMITS.nameLength} characters.`);
}

function requireRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) invalid(`${name} must be a whole number between ${min} and ${max}.`);
}

function requireOverwrites(where: string, overwrites: readonly BuilderOverwrite[], roleKeys: ReadonlySet<string>): void {
  if (overwrites.length > BUILDER_LIMITS.overwritesPerChannel) invalid(`"${where}" has too many permission overrides.`);
  const targets = new Set<string>();
  for (const overwrite of overwrites) {
    if (overwrite.target !== EVERYONE && overwrite.target !== BOT && !roleKeys.has(overwrite.target))
      invalid(`"${where}" gives permissions to a role that is not in the blueprint (${overwrite.target}).`);
    if (targets.has(overwrite.target)) invalid(`"${where}" lists the same role twice in its permissions.`);
    targets.add(overwrite.target);
    for (const name of [...overwrite.allow, ...overwrite.deny])
      if (!(BUILDER_PERMISSIONS as readonly string[]).includes(name)) invalid(`"${name}" is not a permission the builder can set.`);
  }
}

/** Checks Discord limits, unique keys, and that permissions only name known roles. */
export function validateBlueprint(blueprint: BuilderBlueprint): void {
  if (blueprint.roles.length > BUILDER_LIMITS.roles) invalid(`A server can have at most ${BUILDER_LIMITS.roles} roles.`);
  const roleKeys = new Set<string>();
  for (const role of blueprint.roles) {
    if (!KEY.test(role.key)) invalid(`Role key "${role.key}" must use lowercase letters, numbers, and dashes.`);
    if (roleKeys.has(role.key)) invalid(`Two roles use the key "${role.key}".`);
    roleKeys.add(role.key);
    requireName("Role", role.name);
    if (role.name === "@everyone" || role.name === "@here") invalid(`"${role.name}" cannot be used as a role name.`);
    if (!HEX.test(role.color)) invalid(`Role "${role.name}" needs a hex color like #5865F2.`);
    if (role.purpose !== undefined && !BUILDER_ROLE_PURPOSES.includes(role.purpose)) invalid(`Role "${role.name}" has an unknown purpose.`);
    for (const name of role.permissions)
      if (!(BUILDER_PERMISSIONS as readonly string[]).includes(name)) invalid(`"${name}" is not a permission the builder can set.`);
  }
  const keys = new Set<string>();
  const channelPurposes = new Set<string>();
  let total = 0;
  for (const category of blueprint.categories) {
    if (!KEY.test(category.key)) invalid(`Category key "${category.key}" must use lowercase letters, numbers, and dashes.`);
    if (keys.has(category.key)) invalid(`Two categories or channels use the key "${category.key}".`);
    keys.add(category.key);
    requireName("Category", category.name);
    if (category.purpose !== undefined && !BUILDER_CATEGORY_PURPOSES.includes(category.purpose)) invalid(`Category "${category.name}" has an unknown purpose.`);
    if (category.channels.length > BUILDER_LIMITS.channelsPerCategory)
      invalid(`"${category.name}" has ${category.channels.length} channels. Discord allows ${BUILDER_LIMITS.channelsPerCategory} per category.`);
    requireOverwrites(category.name, category.overwrites, roleKeys);
    total += 1 + category.channels.length;
    for (const channel of category.channels) {
      if (!KEY.test(channel.key)) invalid(`Channel key "${channel.key}" must use lowercase letters, numbers, and dashes.`);
      if (keys.has(channel.key)) invalid(`Two categories or channels use the key "${channel.key}".`);
      keys.add(channel.key);
      if (!BUILDER_CHANNEL_TYPES.includes(channel.type)) invalid(`Channel "${channel.name}" has an unknown type.`);
      requireName("Channel", channel.name);
      if (isTextType(channel.type) && channel.name !== channelSlug(channel.name))
        invalid(`Text channel names use lowercase letters and hyphens ("${channelSlug(channel.name)}" instead of "${channel.name}").`);
      if (channel.topic !== undefined && channel.topic.length > BUILDER_LIMITS.topicLength) invalid(`The topic of #${channel.name} is too long (max ${BUILDER_LIMITS.topicLength}).`);
      requireRange(`Slowmode of ${channel.name}`, channel.slowmodeSeconds, 0, BUILDER_LIMITS.slowmodeSeconds);
      requireRange(`User limit of ${channel.name}`, channel.userLimit, 0, BUILDER_LIMITS.userLimit);
      if (channel.purpose !== undefined) {
        if (!BUILDER_CHANNEL_PURPOSES.includes(channel.purpose)) invalid(`Channel "${channel.name}" has an unknown purpose.`);
        if (channelPurposes.has(channel.purpose)) invalid(`Only one channel can be the ${channel.purpose} channel.`);
        channelPurposes.add(channel.purpose);
      }
      requireOverwrites(channel.name, channel.overwrites, roleKeys);
    }
  }
  if (total > BUILDER_LIMITS.channels) invalid(`That is ${total} channels and categories. Discord allows ${BUILDER_LIMITS.channels}.`);
}

/** Counts and plain warnings for the preview. */
export function summarize(blueprint: BuilderBlueprint): BuilderSummary {
  const channels = blueprint.categories.reduce((sum, category) => sum + category.channels.length, 0);
  const all = blueprint.categories.flatMap((category) => category.channels);
  const warnings: string[] = [];
  if (all.some((channel) => channel.type === "ANNOUNCEMENT" || channel.type === "STAGE" || channel.type === "MEDIA"))
    warnings.push("Announcement, stage, and media channels need Community turned on in Server Settings. Without it they are made as text or voice channels.");
  if (blueprint.categories.some((category) => category.channels.length > 40)) warnings.push("A category has more than 40 channels. Discord allows 50.");
  if (blueprint.roles.length > 200) warnings.push("That is a lot of roles. Discord allows 250 in total, including roles you already have.");
  if (channels + blueprint.categories.length > 400) warnings.push("That is a lot of channels. Discord allows 500 in total, including channels you already have.");
  if (all.some((channel) => channel.nsfw)) warnings.push("Age-restricted channels are only visible to members who confirmed they are 18 or older.");
  const categoryNames = blueprint.categories.map((category) => category.name.toLowerCase());
  const repeated = [...new Set(categoryNames.filter((name, index) => categoryNames.indexOf(name) !== index))];
  if (repeated.length) warnings.push(`More than one category is called ${repeated.join(", ")}. When adding to your server they count as one.`);
  const purposes = new Set(all.map((channel) => channel.purpose));
  if (!purposes.has("mod-log")) warnings.push("There is no mod-log channel, so moderation will not be linked.");
  return { roles: blueprint.roles.length, categories: blueprint.categories.length, channels, totalChannels: channels + blueprint.categories.length, warnings };
}

/** Checks questionnaire answers. */
export function validateAnswers(answers: BuilderAnswers): void {
  if (!BUILDER_SERVER_TYPES.includes(answers.serverType)) invalid("Choose a server type.");
  const name = answers.serverName.trim();
  if (name.length < 1 || name.length > 100) invalid("Server name must be between 1 and 100 characters.");
  if (answers.staffRanks.length > BUILDER_LIMITS.staffRanks) invalid(`You can have at most ${BUILDER_LIMITS.staffRanks} staff ranks.`);
  if (answers.departments.length > BUILDER_LIMITS.departments) invalid(`You can have at most ${BUILDER_LIMITS.departments} departments.`);
  const seen = new Set<string>();
  for (const [what, list] of [["Staff rank", answers.staffRanks], ["Department", answers.departments]] as const)
    for (const item of list) {
      const trimmed = item.trim();
      if (trimmed.length < 1 || trimmed.length > 60) invalid(`${what} names must be between 1 and 60 characters.`);
      const key = keyOf(trimmed);
      if (seen.has(key)) invalid(`"${trimmed}" is listed twice.`);
      seen.add(key);
    }
  requireRange("Voice lounges", answers.voiceLounges, 0, BUILDER_LIMITS.voiceLounges);
  for (const section of BUILDER_SECTIONS) if (typeof answers.include[section] !== "boolean") invalid(`Answer "${section}" with yes or no.`);
}
