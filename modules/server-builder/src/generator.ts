import { PRESETS, mergeOverwrites } from "./permissions.js";
import type {
  BuilderAnswers,
  BuilderBlueprint,
  BuilderCategory,
  BuilderCategoryPurpose,
  BuilderChannel,
  BuilderChannelPurpose,
  BuilderChannelType,
  BuilderOverwrite,
  BuilderPermission,
  BuilderRole,
  BuilderSection,
  BuilderServerType,
  BuilderTemplate,
} from "./types.js";
import { BUILDER_SECTIONS, EVERYONE } from "./types.js";
import { channelSlug, isTextType, keyOf, validateAnswers } from "./validation.js";

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

/** Answers with every section on, used as the base for templates. */
function allOn(): Record<BuilderSection, boolean> {
  return Object.fromEntries(BUILDER_SECTIONS.map((section) => [section, section !== "ageRestricted"])) as Record<BuilderSection, boolean>;
}

function answers(serverType: BuilderServerType, serverName: string, overrides: Partial<BuilderAnswers>, off: readonly BuilderSection[]): BuilderAnswers {
  const include = allOn();
  for (const section of off) include[section] = false;
  return { serverType, serverName, staffRanks: DEFAULT_STAFF, departments: [], include, voiceLounges: 3, useMediaChannels: false, emojiCategories: true, ...overrides };
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
      { staffRanks: ["Owner", "Manager", "Support Lead", "Support Agent"], departments: ["Sales", "Customer Success", "Development"], voiceLounges: 1, emojiCategories: false },
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
    };
  };
  const categories: BuilderCategory[] = [];
  const category = (emoji: string, name: string, channels: readonly BuilderChannel[], overwrites: readonly BuilderOverwrite[], purpose?: BuilderCategoryPurpose): void => {
    if (channels.length === 0) return;
    const label = name.toUpperCase();
    categories.push({
      key: uniqueKey(`cat-${keyOf(name)}`),
      name: input.emojiCategories ? `${emoji} ${label}` : label,
      overwrites,
      channels,
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
  category("👋", "Start Here", start, []);

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
  category("📢", "Information", info, gate);

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
  category("🎫", "Support", support, gate, on("tickets") ? "tickets" : undefined);

  /* Events. */
  if (on("events"))
    category("🎉", "Events", [
      channel("STAGE", business ? "Town Hall" : "Event Stage"),
      channel("TEXT", "event-chat", { topic: "Talk about the current event." }),
    ], gate);

  /* Voice. */
  const voice: BuilderChannel[] = [];
  if (on("joinToCreate")) voice.push(channel("VOICE", "➕ Join to Create", { purpose: "voice-hub" }));
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
    ], PRESETS.DEPARTMENT_ONLY(department.key));
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
