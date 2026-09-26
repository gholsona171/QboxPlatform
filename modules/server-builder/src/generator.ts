import { PRESETS, mergeOverwrites } from "./permissions.js";
import type {
  BuilderAnswers,
  BuilderBlueprint,
  BuilderCategory,
  BuilderCategoryPurpose,
  BuilderChannel,
  BuilderChannelEmojis,
  BuilderChannelPurpose,
  BuilderChannelType,
  BuilderEmojiSeparator,
  BuilderForumSetup,
  BuilderOverwrite,
  BuilderPermission,
  BuilderRole,
  BuilderSection,
  BuilderServerType,
  BuilderTemplate,
} from "./types.js";
import { BUILDER_SECTIONS, EVERYONE } from "./types.js";
import { channelSlug, hasLeadingEmoji, isForumType, isTextType, keyOf, plainChannelName, validateAnswers } from "./validation.js";

const DEFAULT_STAFF = ["Owner", "Admin", "Senior Moderator", "Moderator", "Trial Moderator"];
const STAFF_COLORS = ["#E74C3C", "#E67E22", "#F1C40F", "#2ECC71", "#1ABC9C", "#3498DB", "#9B59B6"];
const DEPARTMENT_COLORS = ["#3498DB", "#E74C3C", "#E67E22", "#95A5A6", "#1ABC9C", "#8E44AD", "#F39C12", "#16A085", "#D35400", "#2C3E50"];

const ADMIN_PERMISSIONS: readonly BuilderPermission[] = [
  "ManageGuild", "ManageRoles", "ManageChannels", "ManageWebhooks", "ManageEvents", "ViewAuditLog", "KickMembers", "BanMembers",
  "ModerateMembers", "ManageMessages", "ManageThreads", "ManageNicknames", "MentionEveryone", "MoveMembers", "MuteMembers", "DeafenMembers",
];
const MODERATOR_PERMISSIONS: readonly BuilderPermission[] = [
  "ViewAuditLog", "KickMembers", "BanMembers", "ModerateMembers", "ManageMessages", "ManageThreads", "ManageNicknames", "MoveMembers", "MuteMembers",
];
const TRIAL_PERMISSIONS: readonly BuilderPermission[] = ["ModerateMembers", "ManageMessages", "MoveMembers"];

const DEPARTMENT_EMOJI: readonly (readonly [RegExp, string])[] = [
  [/police|sheriff|pd|law/i, "🚓"],
  [/ems|medic|hospital|doctor/i, "🚑"],
  [/fire/i, "🚒"],
  [/mechanic|tow|garage/i, "🔧"],
  [/estate|realt|house/i, "🏠"],
  [/gang|crime|mafia|cartel/i, "🕶️"],
  [/sales|market/i, "💼"],
  [/support|help/i, "🎧"],
  [/dev|engineer|tech/i, "💻"],
  [/design|art|creative/i, "🎨"],
];

/** Channel emoji by purpose. */
const PURPOSE_EMOJI: Readonly<Partial<Record<BuilderChannelPurpose, string>>> = {
  welcome: "👋",
  rules: "📜",
  verify: "✅",
  announcements: "📢",
  giveaways: "🎁",
  polls: "📊",
  birthdays: "🎂",
  suggestions: "💡",
  starboard: "⭐",
  "level-up": "🏆",
  "tickets-panel": "🎫",
  "fivem-status": "🟢",
  "fivem-alerts": "🚨",
  "mod-log": "🔨",
  "server-log": "🧾",
  "ticket-transcripts": "📁",
  "applications-review": "🗳️",
  "staff-log": "📒",
  "voice-hub": "➕",
};

/** Channel emoji by exact (plain, lowercase) name. */
const NAME_EMOJI: Readonly<Record<string, string>> = {
  welcome: "👋",
  rules: "📜",
  verify: "✅",
  announcements: "📢",
  "server-updates": "🆕",
  "company-updates": "🏢",
  events: "📅",
  giveaways: "🎁",
  polls: "📊",
  birthdays: "🎂",
  general: "💬",
  "off-topic": "🎲",
  memes: "😂",
  introductions: "🙋",
  "bot-commands": "🤖",
  suggestions: "💡",
  starboard: "⭐",
  "level-ups": "🏆",
  "18-plus": "🔞",
  screenshots: "📸",
  clips: "🎬",
  art: "🎨",
  help: "❓",
  feedback: "📝",
  "open-a-ticket": "🎫",
  "apply-here": "📋",
  "event-chat": "🎪",
  "event stage": "🎙️",
  "town hall": "🎙️",
  "join to create": "➕",
  "server-status": "🟢",
  "server-alerts": "🚨",
  "how-to-connect": "🔗",
  "city-rules": "📕",
  "city-news": "📰",
  "character-bios": "🎭",
  "bug-reports": "🐛",
  "patch-notes": "🛠️",
  "looking-for-rp": "🔎",
  "looking-for-group": "🔎",
  "staff-announcements": "📣",
  "staff-chat": "🛡️",
  "staff-commands": "⌨️",
  "staff voice": "🔒",
  "staff meeting": "🔒",
  "mod-log": "🔨",
  "server-log": "🧾",
  "ticket-transcripts": "📁",
  "applications-review": "🗳️",
  "staff-log": "📒",
  watercooler: "☕",
};

/** Channel emoji by name keyword, checked in order after the exact table. */
const KEYWORD_EMOJI: readonly (readonly [RegExp, string])[] = [
  [/briefing room$/, "🎙️"],
  [/meeting room/, "🗓️"],
  [/^lounge/, "🔊"],
  [/-briefings?$/, "📋"],
  [/-reports?$/, "📄"],
  [/-training$/, "🎓"],
  [/radio$/, "📻"],
  [/-chat$/, "💬"],
  [/welcome|intro/, "👋"],
  [/rule|guideline/, "📜"],
  [/verif/, "✅"],
  [/announce|news/, "📢"],
  [/update|changelog|patch/, "🆕"],
  [/event/, "📅"],
  [/giveaway/, "🎁"],
  [/poll|vote/, "📊"],
  [/birthday/, "🎂"],
  [/meme|funny/, "😂"],
  [/bot|command/, "🤖"],
  [/suggest|idea/, "💡"],
  [/star/, "⭐"],
  [/level|rank|xp/, "🏆"],
  [/nsfw|18/, "🔞"],
  [/screenshot|photo|picture|gallery/, "📸"],
  [/clip|video/, "🎬"],
  [/art|creative|design/, "🎨"],
  [/help|question|support|faq/, "❓"],
  [/feedback|review/, "📝"],
  [/ticket/, "🎫"],
  [/apply|application|recruit/, "📋"],
  [/status|online/, "🟢"],
  [/alert|outage|warning/, "🚨"],
  [/connect|link|invite/, "🔗"],
  [/bug|issue/, "🐛"],
  [/rac(e|ing)/, "🏁"],
  [/lfg|looking-for|find|team|group|squad|party/, "🔎"],
  [/log$|logs$|-log-/, "🧾"],
  [/staff|admin|mod/, "🛡️"],
  [/trade|market|shop|store|sell|buy/, "💰"],
  [/music/, "🎵"],
  [/stream|live/, "📺"],
  [/game|play/, "🎮"],
  [/train|guide|tutorial|learn/, "🎓"],
  [/report/, "📄"],
  [/meeting|call/, "🗓️"],
  [/voice|vc|talk|hangout/, "🔊"],
  [/afk|sleep/, "💤"],
];

const VOICE_LIKE = new Set<BuilderChannelType>(["VOICE", "STAGE"]);

/**
 * A tasteful emoji for a channel: by purpose first, then by its exact name,
 * then by a keyword in the name, then a plain default for its type.
 */
export function channelEmoji(name: string, purpose?: BuilderChannelPurpose | undefined, type: BuilderChannelType = "TEXT"): string {
  const byPurpose = purpose ? PURPOSE_EMOJI[purpose] : undefined;
  if (byPurpose) return byPurpose;
  const plain = plainChannelName(name).toLowerCase();
  const exact = NAME_EMOJI[plain] ?? NAME_EMOJI[plain.replaceAll("-", " ")];
  if (exact) return exact;
  const keyword = KEYWORD_EMOJI.find(([pattern]) => pattern.test(plain))?.[1];
  if (keyword) return keyword;
  return VOICE_LIKE.has(type) ? "🔊" : "💬";
}

/**
 * Puts an emoji in front of a channel name in the chosen style. Text channels:
 * `👋┃welcome` (BAR) or `👋-welcome` (SPACE). Voice: `🔊┃Lounge 1` or `🔊 Lounge 1`.
 * A name that already starts with an emoji is left alone.
 */
export function emojiChannelName(name: string, emoji: string, type: BuilderChannelType, separator: BuilderEmojiSeparator): string {
  if (hasLeadingEmoji(name)) return name;
  const text = isTextType(type);
  const joint = separator === "BAR" ? "┃" : text ? "-" : " ";
  return `${emoji}${joint}${text ? channelSlug(name) : name.trim()}`;
}

/** Whether a channel gets an emoji under the answer: KEY means channels with a purpose or in a key category (Start Here, Information, Support). */
export function wantsEmoji(mode: BuilderChannelEmojis, channel: Pick<BuilderChannel, "purpose">, keyCategory: boolean): boolean {
  if (mode === "ALL") return true;
  if (mode === "NONE") return false;
  return channel.purpose !== undefined || keyCategory;
}

const READ_ME = "Read me first";
const HOW_TO_POST = "Start a new post with the button above. Give it a clear title, pick a tag, and keep one topic per post.";

/** Ready-made forum setups by channel name. */
const FORUM_SETUPS: Readonly<Record<string, BuilderForumSetup>> = {
  help: {
    guidelines: "One post per problem. Say what you tried and include screenshots.",
    tags: [{ name: "Question", emoji: "❓" }, { name: "Solved", emoji: "✅" }, { name: "Bug", emoji: "🐛" }],
    defaultReactionEmoji: "👍",
    firstPost: { title: READ_ME, content: `${HOW_TO_POST} Say what you tried and include screenshots. When your problem is fixed, add the Solved tag.`, pin: true },
  },
  feedback: {
    guidelines: "Tell us what to improve. One idea per post.",
    tags: [{ name: "Idea", emoji: "💡" }, { name: "Bug", emoji: "🐛" }, { name: "Praise", emoji: "🎉" }],
    defaultReactionEmoji: "👍",
    firstPost: { title: READ_ME, content: `${HOW_TO_POST} Ideas, bugs, and praise are all welcome. Vote with 👍 on posts you agree with.`, pin: true },
  },
  "character-bios": {
    guidelines: "One post per character. Name, job, and backstory.",
    tags: [{ name: "Civilian", emoji: "🧑" }, { name: "Police", emoji: "🚓" }, { name: "EMS", emoji: "🚑" }, { name: "Criminal", emoji: "🕶️" }],
    defaultReactionEmoji: "👋",
    firstPost: { title: READ_ME, content: `${HOW_TO_POST} Use your character's name as the title and tag their side of the city.`, pin: true },
  },
  "bug-reports": {
    guidelines: "One bug per post. What happened, what you expected, and how to repeat it.",
    tags: [{ name: "Open", emoji: "🔴" }, { name: "Fixed", emoji: "✅" }, { name: "Cannot reproduce", emoji: "❔" }],
    defaultReactionEmoji: "👀",
    firstPost: { title: READ_ME, content: `${HOW_TO_POST} Say what happened, what you expected, and the steps to repeat it. Staff update the tag when it is fixed.`, pin: true },
  },
  screenshots: { guidelines: "Photos and screenshots only.", tags: [{ name: "Screenshot", emoji: "📷" }, { name: "Event", emoji: "🎉" }], defaultReactionEmoji: "❤️" },
  clips: { guidelines: "Video clips only.", tags: [{ name: "Clip", emoji: "🎬" }, { name: "Funny", emoji: "😂" }, { name: "Highlight", emoji: "🔥" }], defaultReactionEmoji: "🔥" },
  art: { guidelines: "Share your creations.", tags: [{ name: "Art", emoji: "🎨" }, { name: "Work in progress", emoji: "✏️" }], defaultReactionEmoji: "❤️" },
};

/**
 * Sensible forum setup for a channel: a ready-made one by name, or a plain
 * one. Media channels need an attachment in every post, so they get no first post.
 */
export function defaultForumSetup(name: string, type: BuilderChannelType = "FORUM"): BuilderForumSetup {
  const ready = FORUM_SETUPS[channelSlug(plainChannelName(name))];
  const setup: BuilderForumSetup = ready ?? {
    guidelines: "One topic per post. Give it a clear title.",
    tags: [{ name: "Question", emoji: "❓" }, { name: "Discussion", emoji: "💬" }, { name: "Solved", emoji: "✅" }],
    defaultReactionEmoji: "👍",
    firstPost: { title: READ_ME, content: HOW_TO_POST, pin: true },
  };
  if (type === "MEDIA") {
    const { firstPost: _firstPost, ...rest } = setup;
    return rest;
  }
  return setup;
}

/** Answers with every section on, used as the base for templates. */
function allOn(): Record<BuilderSection, boolean> {
  return Object.fromEntries(BUILDER_SECTIONS.map((section) => [section, section !== "ageRestricted"])) as Record<BuilderSection, boolean>;
}

function answers(serverType: BuilderServerType, serverName: string, overrides: Partial<BuilderAnswers>, off: readonly BuilderSection[]): BuilderAnswers {
  const include = allOn();
  for (const section of off) include[section] = false;
  return { serverType, serverName, staffRanks: DEFAULT_STAFF, departments: [], staffAccess: "ALL", include, voiceLounges: 3, useMediaChannels: false, emojiCategories: true, channelEmojis: "ALL", emojiSeparator: "BAR", ...overrides };
}

/** Ready-made answer sets. */
export const BUILDER_TEMPLATES: readonly BuilderTemplate[] = [
  {
    type: "FIVEM_RP",
    label: "FiveM roleplay",
    description: "City info, server status, departments with private channels, tickets, and applications.",
    answers: answers("FIVEM_RP", "My City", { departments: ["Police", "EMS", "Fire", "Mechanics", "Real Estate", "Gangs"] }, []),
  },
  {
    type: "GAMING",
    label: "Gaming community",
    description: "Game chat, looking-for-group, clips, events, levels, and giveaways.",
    answers: answers("GAMING", "My Gaming Server", { voiceLounges: 4 }, ["fivemStatus", "birthdays"]),
  },
  {
    type: "COMMUNITY",
    label: "General community",
    description: "Chat, media, forums, events, birthdays, suggestions, and a starboard.",
    answers: answers("COMMUNITY", "My Community", { voiceLounges: 2 }, ["fivemStatus", "applications"]),
  },
  {
    type: "BUSINESS",
    label: "Business or team",
    description: "Announcements, departments, support tickets, help forums, and meeting rooms.",
    answers: answers(
      "BUSINESS",
      "My Company",
      { staffRanks: ["Owner", "Manager", "Support Lead", "Support Agent"], departments: ["Sales", "Customer Success", "Development"], voiceLounges: 1, emojiCategories: false, channelEmojis: "KEY" },
      ["verification", "applications", "levels", "giveaways", "birthdays", "starboard", "media", "joinToCreate", "fivemStatus"],
    ),
  },
];

export function templateFor(type: BuilderServerType): BuilderTemplate {
  return BUILDER_TEMPLATES.find((template) => template.type === type) ?? (BUILDER_TEMPLATES[0] as BuilderTemplate);
}

interface ChannelOptions {
  readonly name?: string;
  readonly topic?: string;
  readonly slowmodeSeconds?: number;
  readonly nsfw?: boolean;
  readonly userLimit?: number;
  readonly overwrites?: readonly BuilderOverwrite[];
  readonly purpose?: BuilderChannelPurpose;
}

/**
 * Turns questionnaire answers into a full server layout. Pure and
 * deterministic: the same answers always give the same blueprint.
 */
export function generateBlueprint(input: BuilderAnswers): BuilderBlueprint {
  validateAnswers(input);
  const on = (section: BuilderSection) => input.include[section];
  const fivem = input.serverType === "FIVEM_RP";
  const business = input.serverType === "BUSINESS";
  const keys = new Set<string>();
  const uniqueKey = (base: string): string => {
    let key = base;
    for (let index = 2; keys.has(key); index += 1) key = `${base}-${index}`;
    keys.add(key);
    return key;
  };
  const channel = (type: BuilderChannelType, name: string, options: ChannelOptions = {}): BuilderChannel => {
    const finalName = isTextType(type) ? channelSlug(name) : name;
    return {
      key: uniqueKey(keyOf(finalName)),
      name: finalName,
      type,
      slowmodeSeconds: options.slowmodeSeconds ?? 0,
      nsfw: options.nsfw ?? false,
      userLimit: options.userLimit ?? 0,
      overwrites: options.overwrites ?? [],
      ...(options.topic ? { topic: options.topic } : {}),
      ...(options.purpose ? { purpose: options.purpose } : {}),
      ...(isForumType(type) ? { forum: defaultForumSetup(finalName, type) } : {}),
    };
  };
  const emojiMode: BuilderChannelEmojis = input.channelEmojis ?? "ALL";
  const separator: BuilderEmojiSeparator = input.emojiSeparator ?? "BAR";
  const decorate = (item: BuilderChannel, keyCategory: boolean): BuilderChannel =>
    wantsEmoji(emojiMode, item, keyCategory) ? { ...item, name: emojiChannelName(item.name, channelEmoji(item.name, item.purpose, item.type), item.type, separator) } : item;
  const categories: BuilderCategory[] = [];
  /** `keyCategory`: Start Here, Information, and Support, whose channels get an emoji under KEY. */
  const category = (emoji: string, name: string, channels: readonly BuilderChannel[], overwrites: readonly BuilderOverwrite[], purpose?: BuilderCategoryPurpose, keyCategory = false): void => {
    if (channels.length === 0) return;
    const label = name.toUpperCase();
    categories.push({
      key: uniqueKey(`cat-${keyOf(name)}`),
      name: input.emojiCategories ? `${emoji} ${label}` : label,
      overwrites,
      channels: channels.map((item) => decorate(item, keyCategory)),
      ...(purpose ? { purpose } : {}),
    });
  };

  /* Roles, highest first. */
  const roles: BuilderRole[] = [];
  const staffRanks = input.staffRanks.map((rank) => rank.trim());
  const staffKeys = staffRanks.map((rank, index) => {
    const key = `staff-${keyOf(rank)}`;
    const last = index === staffRanks.length - 1 && staffRanks.length >= 3;
    const permissions: readonly BuilderPermission[] = index === 0 ? ["Administrator"] : index === 1 ? ADMIN_PERMISSIONS : last ? TRIAL_PERMISSIONS : MODERATOR_PERMISSIONS;
    roles.push({ key, name: rank, color: STAFF_COLORS[index % STAFF_COLORS.length] as string, hoist: true, mentionable: false, permissions, purpose: "staff" });
    return key;
  });
  const departments = input.departments.map((department, index) => {
    const name = department.trim();
    const key = `dept-${keyOf(name)}`;
    roles.push({ key, name, color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length] as string, hoist: fivem, mentionable: true, permissions: [], purpose: "department" });
    return { key, name };
  });
  if (on("giveaways")) roles.push({ key: "giveaway-ping", name: "Giveaway Ping", color: "#F1C40F", hoist: false, mentionable: true, permissions: [], purpose: "ping" });
  if (on("events")) roles.push({ key: "event-ping", name: "Event Ping", color: "#9B59B6", hoist: false, mentionable: true, permissions: [], purpose: "ping" });
  const verifiedKey = on("verification") ? "verified" : undefined;
  if (verifiedKey) {
    roles.push({ key: verifiedKey, name: "Verified", color: "#2ECC71", hoist: false, mentionable: false, permissions: [], purpose: "verified" });
    roles.push({ key: "unverified", name: "Unverified", color: "#95A5A6", hoist: false, mentionable: false, permissions: [], purpose: "unverified" });
  }

  const gate = verifiedKey ? PRESETS.VERIFIED_ONLY(verifiedKey) : PRESETS.PUBLIC();
  const readOnly = PRESETS.READ_ONLY(staffKeys);

  /* Start here: visible before verifying. */
  const start: BuilderChannel[] = [];
  if (on("information")) {
    start.push(channel("TEXT", "welcome", { topic: `Welcome to ${input.serverName.trim()}!`, overwrites: readOnly, purpose: "welcome" }));
    start.push(channel("TEXT", "rules", { topic: "Read these before you join in.", overwrites: readOnly, purpose: "rules" }));
  }
  if (verifiedKey)
    start.push(channel("TEXT", "verify", {
      topic: "Click the button to get access to the server.",
      purpose: "verify",
      overwrites: mergeOverwrites(readOnly, [{ target: EVERYONE, allow: ["ViewChannel", "ReadMessageHistory"], deny: ["SendMessages"] }, { target: verifiedKey, allow: [], deny: ["ViewChannel"] }]),
    }));
  category("👋", "Start Here", start, [], undefined, true);

  /* Information. */
  const info: BuilderChannel[] = [];
  if (on("information")) {
    info.push(channel("ANNOUNCEMENT", "announcements", { topic: "Important news.", overwrites: readOnly, purpose: "announcements" }));
    info.push(channel("ANNOUNCEMENT", business ? "company-updates" : "server-updates", { overwrites: readOnly }));
  }
  if (on("events")) info.push(channel("TEXT", "events", { topic: "Upcoming events.", overwrites: readOnly }));
  if (on("giveaways")) info.push(channel("TEXT", "giveaways", { topic: "Click the button on a giveaway to enter.", overwrites: readOnly, purpose: "giveaways" }));
  if (on("polls")) info.push(channel("TEXT", "polls", { topic: "Vote on server questions.", overwrites: readOnly, purpose: "polls" }));
  if (on("birthdays")) info.push(channel("TEXT", "birthdays", { topic: "Birthday wishes. Add yours with /birthday set.", overwrites: readOnly, purpose: "birthdays" }));
  category("📢", "Information", info, gate, undefined, true);

  /* Game server. */
  const game: BuilderChannel[] = [];
  if (on("fivemStatus")) {
    game.push(channel("TEXT", "server-status", { topic: "Live server status.", overwrites: readOnly, purpose: "fivem-status" }));
    game.push(channel("TEXT", "server-alerts", { topic: "Downtime and restart alerts.", overwrites: readOnly, purpose: "fivem-alerts" }));
    game.push(channel("TEXT", "how-to-connect", { topic: "How to join the server.", overwrites: readOnly }));
  }
  if (fivem) {
    game.push(channel("TEXT", "city-rules", { topic: "Roleplay rules.", overwrites: readOnly }));
    game.push(channel("TEXT", "city-news", { topic: "In-character news.", slowmodeSeconds: 60 }));
    game.push(channel(on("forums") ? "FORUM" : "TEXT", "character-bios", { topic: "Share your character's story." }));
    game.push(channel(on("forums") ? "FORUM" : "TEXT", "bug-reports", { topic: "Found a bug? Tell us here." }));
    game.push(channel("TEXT", "patch-notes", { topic: "Server changes.", overwrites: readOnly }));
  }
  category(fivem ? "🏙️" : "🎮", fivem ? "City" : "Game Server", game, gate);

  /* Community. */
  const community: BuilderChannel[] = [channel("TEXT", "general", { topic: "Chat about anything." })];
  if (business) community.push(channel("TEXT", "watercooler", { topic: "Off-topic chat." }));
  else community.push(channel("TEXT", "off-topic"), channel("TEXT", "memes", { slowmodeSeconds: 10 }));
  community.push(channel("TEXT", "introductions", { topic: "Say hi and tell us about yourself.", slowmodeSeconds: 60 }));
  if (fivem) community.push(channel("TEXT", "looking-for-rp", { topic: "Find people to roleplay with." }));
  if (input.serverType === "GAMING") community.push(channel("TEXT", "looking-for-group", { topic: "Find people to play with." }));
  community.push(channel("TEXT", "bot-commands", { topic: "Use bot commands here." }));
  if (on("suggestions")) community.push(channel("TEXT", "suggestions", { topic: "Share ideas with /suggest submit.", slowmodeSeconds: 30, purpose: "suggestions" }));
  if (on("starboard")) community.push(channel("TEXT", "starboard", { topic: "The best messages, picked by stars.", overwrites: readOnly, purpose: "starboard" }));
  if (on("levels")) community.push(channel("TEXT", "level-ups", { topic: "Level-up messages.", overwrites: readOnly, purpose: "level-up" }));
  if (on("ageRestricted")) community.push(channel("TEXT", "18-plus", { topic: "Age-restricted chat.", nsfw: true }));
  category("💬", "Community", community, gate);

  /* Media. */
  if (on("media")) {
    const type: BuilderChannelType = input.useMediaChannels ? "MEDIA" : "TEXT";
    const media = PRESETS.MEDIA_ONLY(input.useMediaChannels);
    const slowmodeSeconds = input.useMediaChannels ? 0 : 10;
    category("📸", "Media", [
      channel(type, "screenshots", { topic: "Photos and screenshots only.", overwrites: media, slowmodeSeconds }),
      channel(type, "clips", { topic: "Video clips only.", overwrites: media, slowmodeSeconds }),
      channel(type, "art", { topic: "Share your creations.", overwrites: media, slowmodeSeconds }),
    ], gate);
  }

  /* Forums. */
  if (on("forums"))
    category("🗂️", "Forums", [
      channel("FORUM", "help", { topic: "Ask a question. One post per problem." }),
      channel("FORUM", "feedback", { topic: "Tell us what to improve." }),
    ], gate);

  /* Support. */
  const support: BuilderChannel[] = [];
  if (on("tickets")) support.push(channel("TEXT", "open-a-ticket", { topic: "Need help? Open a ticket here.", overwrites: readOnly, purpose: "tickets-panel" }));
  if (on("applications")) support.push(channel("TEXT", "apply-here", { topic: "Apply to join the team.", overwrites: readOnly }));
  category("🎫", "Support", support, gate, on("tickets") ? "tickets" : undefined, true);

  /* Events. */
  if (on("events"))
    category("🎉", "Events", [
      channel("STAGE", business ? "Town Hall" : "Event Stage"),
      channel("TEXT", "event-chat", { topic: "Talk about the current event." }),
    ], gate);

  /* Voice. */
  const voice: BuilderChannel[] = [];
  if (on("joinToCreate")) voice.push(channel("VOICE", "Join to Create", { purpose: "voice-hub" }));
  for (let index = 1; index <= input.voiceLounges; index += 1) voice.push(channel("VOICE", business ? `Meeting Room ${index}` : `Lounge ${index}`));
  category("🔊", "Voice", voice, gate);

  /* Departments. */
  for (const department of departments) {
    const slug = channelSlug(department.name);
    const emoji = DEPARTMENT_EMOJI.find(([pattern]) => pattern.test(department.name))?.[1] ?? "📁";
    category(emoji, department.name, [
      channel("TEXT", `${slug}-chat`, { topic: `${department.name} chat.` }),
      channel("TEXT", `${slug}-briefings`, { topic: `${department.name} briefings and orders.` }),
      channel("TEXT", `${slug}-reports`, { topic: `${department.name} reports.` }),
      channel("TEXT", `${slug}-training`, { topic: `${department.name} training.` }),
      channel("VOICE", `${department.name} ${fivem ? "Radio" : "Room"}`),
      channel("VOICE", `${department.name} Briefing Room`),
    ], PRESETS.DEPARTMENT_ONLY(department.key, input.staffAccess === "NONE" ? [] : staffKeys));
  }

  /* Staff. */
  if (on("staffArea")) {
    category("🛡️", "Staff", [
      channel("TEXT", "staff-announcements", { topic: "Only senior staff post here.", overwrites: staffKeys.slice(2).map((key) => ({ target: key, allow: [], deny: ["SendMessages"] })) }),
      channel("TEXT", "staff-chat"),
      channel("TEXT", "staff-commands", { topic: "Use staff commands here." }),
      channel("VOICE", "Staff Voice"),
      channel("VOICE", "Staff Meeting"),
    ], PRESETS.STAFF_ONLY(staffKeys));
    const logs: BuilderChannel[] = [
      channel("TEXT", "mod-log", { purpose: "mod-log" }),
      channel("TEXT", "server-log", { purpose: "server-log" }),
    ];
    if (on("tickets")) logs.push(channel("TEXT", "ticket-transcripts", { purpose: "ticket-transcripts" }));
    if (on("applications")) logs.push(channel("TEXT", "applications-review", { purpose: "applications-review", overwrites: staffKeys.map((key) => ({ target: key, allow: ["SendMessages", "SendMessagesInThreads"], deny: [] })) }));
    logs.push(channel("TEXT", "staff-log", { purpose: "staff-log" }));
    category("📜", "Logs", logs, PRESETS.HIDDEN_LOG(staffKeys));
  }

  return { roles, categories };
}
