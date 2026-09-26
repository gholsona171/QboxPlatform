import type { BuilderAnswers, BuilderBlueprint, BuilderChannel, BuilderChannelType, BuilderForumSetup, BuilderOverwrite, BuilderSummary } from "./types.js";
import {
  BOT,
  BUILDER_CHANNEL_EMOJIS,
  BUILDER_EMOJI_SEPARATORS,
  BUILDER_STAFF_ACCESS,
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
  /** Forum guidelines (Discord's forum topic). */
  forumGuidelines: 4096,
  forumTags: 20,
  forumTagName: 20,
  forumPostTitle: 100,
  forumPostContent: 2000,
  /** The "Describe your server" prompt. */
  description: 2000,
} as const;

const SNOWFLAKE = /^\d{17,20}$/;
const KEY = /^[a-z0-9][a-z0-9-]{0,59}$/;
const HEX = /^#[0-9a-f]{6}$/i;
const TEXT_TYPES = new Set<BuilderChannelType>(["TEXT", "ANNOUNCEMENT", "FORUM", "MEDIA"]);
const FORUM_TYPES = new Set<BuilderChannelType>(["FORUM", "MEDIA"]);
const CUSTOM_EMOJI = /^[a-zA-Z0-9_]{2,32}:\d{17,20}$/;
/** One unicode emoji: a pictograph with optional skin tone, variation selector, and ZWJ parts, a keycap, or a flag. */
const EMOJI_PATTERN = String.raw`(?:\p{Regional_Indicator}{2}|[0-9#*]\uFE0F?\u20E3|(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:\uFE0F|\p{Emoji_Modifier}|\u200D(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})\uFE0F?\p{Emoji_Modifier}?)*)`;
const UNICODE_EMOJI = new RegExp(`^${EMOJI_PATTERN}$`, "u");
/** A channel name's leading emoji and the separator after it: `\uD83D\uDC4B\u2503welcome`, `\uD83D\uDC4B-welcome`, `\uD83D\uDD0A Lounge 1`, `\uD83D\uDC4B | welcome`. */
const LEADING_EMOJI = new RegExp(`^${EMOJI_PATTERN}[\\s\u2503\u2502|\u30FB\u4E28\u2022\u00B7-]*`, "u");

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

/** A channel name without its leading emoji and separator: `👋┃welcome` and `👋-welcome` both give `welcome`. */
export function plainChannelName(name: string): string {
  return name.trim().replace(LEADING_EMOJI, "").trim();
}

/** Whether a channel name already starts with an emoji. */
export function hasLeadingEmoji(name: string): boolean {
  return LEADING_EMOJI.test(name.trim());
}

/** Lowercase key from any name, e.g. "Senior Moderator" -> "senior-moderator". */
export function keyOf(name: string): string {
  return name.toLowerCase().normalize("NFKD").replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-+|-+$/g, "").slice(0, 50) || "item";
}

export function isTextType(type: BuilderChannelType): boolean {
  return TEXT_TYPES.has(type);
}

/** Forum and media channels: posts with tags instead of one chat. */
export function isForumType(type: BuilderChannelType): boolean {
  return FORUM_TYPES.has(type);
}

/** A unicode emoji such as 👍, or a custom emoji as `name:id`. */
export function isEmoji(value: string): boolean {
  return CUSTOM_EMOJI.test(value) || UNICODE_EMOJI.test(value);
}

function normalizeForum(forum: BuilderForumSetup): BuilderForumSetup {
  const guidelines = forum.guidelines?.trim();
  const reaction = forum.defaultReactionEmoji?.trim();
  return {
    tags: forum.tags.map((tag) => ({ name: tag.name.trim(), ...(tag.emoji?.trim() ? { emoji: tag.emoji.trim() } : {}) })),
    ...(guidelines ? { guidelines } : {}),
    ...(reaction ? { defaultReactionEmoji: reaction } : {}),
    ...(forum.firstPost ? { firstPost: { title: forum.firstPost.title.trim(), content: forum.firstPost.content.trim(), pin: forum.firstPost.pin } } : {}),
  };
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
        ...(channel.forum ? { forum: normalizeForum(channel.forum) } : {}),
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

function requireEmoji(where: string, value: string | undefined): void {
  if (value !== undefined && !isEmoji(value)) invalid(`${where} must be an emoji like 👍, or a custom emoji as name:id.`);
}

function requireForum(channel: BuilderChannel): void {
  const forum = channel.forum;
  if (!forum) return;
  if (!isForumType(channel.type)) invalid(`#${channel.name} has forum settings but is not a forum or media channel.`);
  if (forum.guidelines !== undefined && forum.guidelines.length > BUILDER_LIMITS.forumGuidelines) invalid(`The guidelines of #${channel.name} are too long (max ${BUILDER_LIMITS.forumGuidelines}).`);
  if (forum.tags.length > BUILDER_LIMITS.forumTags) invalid(`#${channel.name} has too many tags. Discord allows ${BUILDER_LIMITS.forumTags}.`);
  for (const tag of forum.tags) {
    if (tag.name.length < 1 || tag.name.length > BUILDER_LIMITS.forumTagName) invalid(`Tag names in #${channel.name} must be between 1 and ${BUILDER_LIMITS.forumTagName} characters.`);
    requireEmoji(`The emoji of tag "${tag.name}" in #${channel.name}`, tag.emoji);
  }
  requireEmoji(`The default reaction of #${channel.name}`, forum.defaultReactionEmoji);
  if (forum.firstPost) {
    if (forum.firstPost.title.length < 1 || forum.firstPost.title.length > BUILDER_LIMITS.forumPostTitle) invalid(`The first post title of #${channel.name} must be between 1 and ${BUILDER_LIMITS.forumPostTitle} characters.`);
    if (forum.firstPost.content.length < 1 || forum.firstPost.content.length > BUILDER_LIMITS.forumPostContent) invalid(`The first post of #${channel.name} must be between 1 and ${BUILDER_LIMITS.forumPostContent} characters.`);
    if (typeof forum.firstPost.pin !== "boolean") invalid(`Say whether the first post of #${channel.name} is pinned.`);
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
      requireForum(channel);
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
  if (!BUILDER_STAFF_ACCESS.includes(answers.staffAccess)) invalid("Choose whether staff can see every department channel.");
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
  /* Drafts saved before these questions existed have no value, which means the default. */
  if (answers.channelEmojis !== undefined && !BUILDER_CHANNEL_EMOJIS.includes(answers.channelEmojis)) invalid("Choose which channels get an emoji: none, key channels, or every channel.");
  if (answers.emojiSeparator !== undefined && !BUILDER_EMOJI_SEPARATORS.includes(answers.emojiSeparator)) invalid("Choose how the emoji is joined to the channel name.");
  if (answers.description !== undefined && (typeof answers.description !== "string" || answers.description.length > BUILDER_LIMITS.description))
    invalid(`The description must be at most ${BUILDER_LIMITS.description} characters.`);
}
