import { PRESETS, mergeOverwrites } from "./permissions.js";
import { BUILDER_SECTIONS, EVERYONE } from "./types.js";
import { channelSlug, hasLeadingEmoji, isForumType, isTextType, keyOf, plainChannelName, validateAnswers } from "./validation.js";
const DEFAULT_STAFF = ["Owner", "Admin", "Senior Moderator", "Moderator", "Trial Moderator"];
const STAFF_COLORS = ["#E74C3C", "#E67E22", "#F1C40F", "#2ECC71", "#1ABC9C", "#3498DB", "#9B59B6"];
const DEPARTMENT_COLORS = ["#3498DB", "#E74C3C", "#E67E22", "#95A5A6", "#1ABC9C", "#8E44AD", "#F39C12", "#16A085", "#D35400", "#2C3E50"];
const ADMIN_PERMISSIONS = [
    "ManageGuild", "ManageRoles", "ManageChannels", "ManageWebhooks", "ManageEvents", "ViewAuditLog", "KickMembers", "BanMembers",
    "ModerateMembers", "ManageMessages", "ManageThreads", "ManageNicknames", "MentionEveryone", "MoveMembers", "MuteMembers", "DeafenMembers",
];
const MODERATOR_PERMISSIONS = [
    "ViewAuditLog", "KickMembers", "BanMembers", "ModerateMembers", "ManageMessages", "ManageThreads", "ManageNicknames", "MoveMembers", "MuteMembers",
];
const TRIAL_PERMISSIONS = ["ModerateMembers", "ManageMessages", "MoveMembers"];
const DEPARTMENT_EMOJI = [
    [/script|code/i, "💻"],
    [/mlo|map|interior/i, "🏗️"],
    [/vehicle|\bcars?\b/i, "🚗"],
    [/cloth|eup|outfit|uniform/i, "👕"],
    [/prop/i, "📦"],
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
const PURPOSE_EMOJI = {
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
const NAME_EMOJI = {
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
    store: "🛒",
    pricing: "💲",
    bundles: "🧺",
    vouches: "🏅",
    faq: "❓",
    releases: "🚀",
    "free-releases": "🆓",
    showcase: "🎬",
    "community-showcase": "🖼️",
    "dev-talk": "💻",
    partners: "🤝",
    "team-announcements": "📣",
    "team voice": "🔒",
    "team meeting": "🔒",
    "store-log": "🧾",
};
/** Channel emoji by name keyword, checked in order after the exact table. */
const KEYWORD_EMOJI = [
    [/download/, "📥"],
    [/commission/, "🧩"],
    [/-dev$/, "💻"],
    [/-wip$/, "🚧"],
    [/-tasks?$/, "📌"],
    [/roadmap|planning/, "🗺️"],
    [/^qa-|testing/, "🧪"],
    [/feature/, "✨"],
    [/release/, "🚀"],
    [/owner/, "👑"],
    [/vouch/, "🏅"],
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
const VOICE_LIKE = new Set(["VOICE", "STAGE"]);
/**
 * A tasteful emoji for a channel: by purpose first, then by its exact name,
 * then by a keyword in the name, then a plain default for its type.
 */
export function channelEmoji(name, purpose, type = "TEXT") {
    const byPurpose = purpose ? PURPOSE_EMOJI[purpose] : undefined;
    if (byPurpose)
        return byPurpose;
    const plain = plainChannelName(name).toLowerCase();
    const exact = NAME_EMOJI[plain] ?? NAME_EMOJI[plain.replaceAll("-", " ")];
    if (exact)
        return exact;
    const keyword = KEYWORD_EMOJI.find(([pattern]) => pattern.test(plain))?.[1];
    if (keyword)
        return keyword;
    return VOICE_LIKE.has(type) ? "🔊" : "💬";
}
/**
 * Puts an emoji in front of a channel name in the chosen style. Text channels:
 * `👋┃welcome` (BAR) or `👋-welcome` (SPACE). Voice: `🔊┃Lounge 1` or `🔊 Lounge 1`.
 * A name that already starts with an emoji is left alone.
 */
export function emojiChannelName(name, emoji, type, separator) {
    if (hasLeadingEmoji(name))
        return name;
    const text = isTextType(type);
    const joint = separator === "BAR" ? "┃" : text ? "-" : " ";
    return `${emoji}${joint}${text ? channelSlug(name) : name.trim()}`;
}
/** Whether a channel gets an emoji under the answer: KEY means channels with a purpose or in a key category (Start Here, Information, Support). */
export function wantsEmoji(mode, channel, keyCategory) {
    if (mode === "ALL")
        return true;
    if (mode === "NONE")
        return false;
    return channel.purpose !== undefined || keyCategory;
}
const READ_ME = "Read me first";
const HOW_TO_POST = "Start a new post with the button above. Give it a clear title, pick a tag, and keep one topic per post.";
/** Ready-made forum setups by channel name. */
const FORUM_SETUPS = {
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
export function defaultForumSetup(name, type = "FORUM") {
    const ready = FORUM_SETUPS[channelSlug(plainChannelName(name))];
    const setup = ready ?? {
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
function allOn() {
    return Object.fromEntries(BUILDER_SECTIONS.map((section) => [section, section !== "ageRestricted"]));
}
function answers(serverType, serverName, overrides, off) {
    const include = allOn();
    for (const section of off)
        include[section] = false;
    return { serverType, serverName, staffRanks: DEFAULT_STAFF, departments: [], staffAccess: "ALL", include, voiceLounges: 3, useMediaChannels: false, emojiCategories: true, channelEmojis: "ALL", emojiSeparator: "BAR", ...overrides };
}
/** The asset studio's product lines, on by default. Each is a department: remove a line to switch it off. */
export const STUDIO_PRODUCT_LINES = ["Scripts", "MLOs", "Vehicles", "Clothing & EUP", "Props"];
/** Ready-made answer sets. */
export const BUILDER_TEMPLATES = [
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
        answers: answers("BUSINESS", "My Company", { staffRanks: ["Owner", "Manager", "Support Lead", "Support Agent"], departments: ["Sales", "Customer Success", "Development"], voiceLounges: 1, emojiCategories: false, channelEmojis: "KEY" }, ["verification", "applications", "levels", "giveaways", "birthdays", "starboard", "media", "joinToCreate", "fivemStatus"]),
    },
    {
        type: "ASSET_STUDIO",
        label: "FiveM asset studio",
        description: "Releases, a team showcase, store, buyer-only support per product line, and commissions.",
        answers: answers("ASSET_STUDIO", "My Studio", { staffRanks: ["Owner", "Studio Manager", "Lead Developer", "Developer", "Moderator", "Support"], departments: STUDIO_PRODUCT_LINES, voiceLounges: 2 }, ["fivemStatus", "birthdays"]),
    },
];
export function templateFor(type) {
    return BUILDER_TEMPLATES.find((template) => template.type === type) ?? BUILDER_TEMPLATES[0];
}
/** Ticket status category names (new, in progress, closed) per server type. */
const TICKET_STATUS_NAMES = {
    FIVEM_RP: ["New Tickets", "Tickets In Progress", "Closed Tickets"],
    GAMING: ["Open Tickets", "Being Handled", "Closed Tickets"],
    COMMUNITY: ["Open Tickets", "In Progress", "Closed Tickets"],
    BUSINESS: ["New Requests", "In Progress", "Resolved"],
    ASSET_STUDIO: ["New Inquiries", "In Progress", "Finished"],
};
/** Studio product line labels: the team role, the support ticket type, and the singular for forum tags. */
const STUDIO_LINES = [
    [/^scripts?$/i, { team: "Script Developer", support: "Script Support", tag: "Script" }],
    [/^mlos?$|^maps?$|^mlos? ?& ?maps?$/i, { team: "MLO Builder", support: "MLO Support", tag: "MLO" }],
    [/^vehicles?$|^cars?$/i, { team: "Vehicle Artist", support: "Vehicle Support", tag: "Vehicle" }],
    [/^clothing|^eup/i, { team: "Clothing Artist", support: "Clothing & EUP Support", tag: "Clothing" }],
    [/^props?$/i, { team: "Prop Artist", support: "Prop Support", tag: "Prop" }],
];
function studioLine(name) {
    const known = STUDIO_LINES.find(([pattern]) => pattern.test(name.trim()))?.[1];
    return known ?? { team: `${name} Team`, support: `${name} Support`, tag: name.slice(0, 20) };
}
const question = (id, label, style, required, placeholder) => ({
    id,
    label,
    style,
    required,
    ...(placeholder ? { placeholder } : {}),
});
/** A ready-made ticket panel and ticket types that fit the server type. */
function ticketSetup({ input, departments, on }) {
    const types = [];
    const keys = new Set();
    const add = (name, emoji, description, options = {}) => {
        let key = `ticket-${keyOf(name)}`;
        for (let index = 2; keys.has(key); index += 1)
            key = `ticket-${keyOf(name)}-${index}`;
        keys.add(key);
        types.push({ key, name, emoji, description, buttonStyle: "PRIMARY", defaultPriority: "NORMAL", supportRoles: [], requiredRoles: [], questions: [], ...options });
    };
    const help = [question("details", "What do you need help with?", "PARAGRAPH", true, "Tell us as much as you can.")];
    const bug = [
        question("what", "What happened?", "PARAGRAPH", true),
        question("steps", "How can we make it happen again?", "PARAGRAPH", true, "Step by step."),
        question("evidence", "Screenshots or clips (links)", "PARAGRAPH", false),
    ];
    const report = [
        question("who", "Who are you reporting?", "SHORT", true, "Name, ID, or Discord tag"),
        question("what", "What happened?", "PARAGRAPH", true),
        question("evidence", "Evidence (clip or screenshot links)", "PARAGRAPH", false),
    ];
    const appeal = [
        question("name", "Your name or ID when you were banned", "SHORT", true),
        question("reason", "Why were you banned?", "PARAGRAPH", true),
        question("why", "Why should the ban be lifted?", "PARAGRAPH", true),
    ];
    const departmentTypes = (label) => {
        for (const department of departments) {
            const emoji = DEPARTMENT_EMOJI.find(([pattern]) => pattern.test(department.name))?.[1] ?? "📁";
            add(label(department.name), emoji, `Questions for the ${department.name} team.`.slice(0, 100), {
                buttonStyle: "SECONDARY",
                supportRoles: [department.key],
                questions: [question("details", "What do you need?", "PARAGRAPH", true)],
            });
        }
    };
    const name = input.serverName.trim();
    let panel;
    switch (input.serverType) {
        case "FIVEM_RP":
            add("General Support", "🎫", "Questions and help with the city.", { questions: help });
            add("Player Report", "🚨", "Report a player for breaking the rules.", { buttonStyle: "DANGER", defaultPriority: "HIGH", questions: report });
            add("Ban Appeal", "⚖️", "Ask for a ban to be reviewed.", { buttonStyle: "SECONDARY", questions: appeal });
            add("Staff Application", "📋", "Apply to join the staff team.", {
                buttonStyle: "SUCCESS",
                questions: [question("age", "How old are you?", "SHORT", true), question("timezone", "Your timezone", "SHORT", true), question("why", "Why do you want to join staff?", "PARAGRAPH", true)],
            });
            add("Donation / Store", "💎", "Help with a store purchase or perk.", {
                buttonStyle: "SUCCESS",
                questions: [question("order", "Transaction or order ID", "SHORT", true), question("details", "What is the problem?", "PARAGRAPH", true)],
            });
            add("Bug Report", "🐛", "Something in the city is broken.", { buttonStyle: "SECONDARY", questions: bug });
            departmentTypes((department) => `${department} Department`);
            panel = { name: "Support", title: `${name} Support`, description: "Pick the option that fits and a private ticket opens with the right team. Please open one ticket per issue.", color: "#5865F2", style: "BUTTONS", placeholder: "Choose what you need help with" };
            break;
        case "GAMING":
            add("General Help", "🎫", "Questions about the server or community.", { questions: help });
            add("Report a Player", "🚨", "Report cheating, toxicity, or rule breaking.", { buttonStyle: "DANGER", defaultPriority: "HIGH", questions: report });
            add("Ban Appeal", "⚖️", "Ask for a ban or mute to be reviewed.", { buttonStyle: "SECONDARY", questions: appeal });
            add("Bug Report", "🐛", "Something is broken.", { buttonStyle: "SECONDARY", questions: bug });
            if (on("giveaways"))
                add("Claim a Prize", "🎁", "You won a giveaway. Claim it here.", { buttonStyle: "SUCCESS", questions: [question("giveaway", "Which giveaway did you win?", "SHORT", true)] });
            if (on("applications"))
                add("Staff Application", "📋", "Apply to join the team.", { buttonStyle: "SUCCESS", questions: [question("why", "Why do you want to join?", "PARAGRAPH", true)] });
            departmentTypes((department) => department);
            panel = { name: "Support", title: "Need a hand?", description: `Open a private ticket with the ${name} team. Pick the option that fits.`, color: "#5865F2", style: "BUTTONS", placeholder: "Choose a ticket type" };
            break;
        case "BUSINESS":
            add("General Question", "💬", "Ask us anything.", { questions: help });
            add("Technical Support", "🛠️", "Something is not working.", { defaultPriority: "HIGH", questions: bug });
            add("Billing & Invoices", "🧾", "Payments, invoices, and refunds.", {
                buttonStyle: "SECONDARY",
                questions: [question("invoice", "Invoice or order number", "SHORT", false), question("details", "How can we help?", "PARAGRAPH", true)],
            });
            add("Feature Request", "✨", "Tell us what you would like next.", { buttonStyle: "SECONDARY", questions: [question("idea", "What would you like?", "PARAGRAPH", true)] });
            departmentTypes((department) => department);
            panel = { name: "Support", title: "Contact the team", description: `Open a private request with ${name}. Pick the team you need and we will reply as soon as we can.`, color: "#5865F2", style: "BUTTONS", placeholder: "Choose a team" };
            break;
        case "ASSET_STUDIO": {
            const order = question("order", "Order or transaction ID", "SHORT", false, "From your store receipt");
            add("Purchase / Store Question", "🛒", "Questions before or after you buy.", { buttonStyle: "SUCCESS", questions: [order, question("details", "Your question", "PARAGRAPH", true)] });
            for (const department of departments) {
                const line = studioLine(department.name);
                const emoji = DEPARTMENT_EMOJI.find(([pattern]) => pattern.test(department.name))?.[1] ?? "📁";
                const scripts = /script|code/i.test(department.name);
                add(line.support, emoji, `Help with your ${/^[A-Z0-9]+$/.test(line.tag) ? line.tag : line.tag.toLowerCase()} purchase.`.slice(0, 100), {
                    supportRoles: [department.key],
                    questions: [
                        question("product", "Which product?", "SHORT", true),
                        order,
                        scripts
                            ? question("setup", "Framework and server version", "SHORT", false, "Qbox, QBCore, ESX ... and your artifact")
                            : question("setup", "Game build and server artifact", "SHORT", false, "For example 3095 and artifact 12345"),
                        question("problem", "What is the problem?", "PARAGRAPH", true, "Errors from F8 or the server console help a lot."),
                    ],
                });
            }
            add("Custom Commission", "🧩", "Request custom work or a new inquiry.", {
                questions: [
                    question("what", "What would you like made?", "PARAGRAPH", true),
                    question("budget", "Your budget", "SHORT", true),
                    question("deadline", "Deadline", "SHORT", false),
                    question("references", "References or examples (links)", "PARAGRAPH", false),
                ],
            });
            add("Bug Report", "🐛", "Report a bug in one of our products.", {
                buttonStyle: "SECONDARY",
                questions: [question("product", "Which product and version?", "SHORT", true), question("what", "What happened?", "PARAGRAPH", true), question("steps", "How can we make it happen again?", "PARAGRAPH", true)],
            });
            add("Partnership / Content Creator", "🤝", "Partner with us or make content with our assets.", {
                buttonStyle: "SECONDARY",
                questions: [question("link", "Your server, channel, or store link", "SHORT", true), question("idea", "What do you have in mind?", "PARAGRAPH", true)],
            });
            add("Refund / Licence Transfer", "🔁", "Ask for a refund or to move a licence.", {
                buttonStyle: "DANGER",
                questions: [order, question("kind", "Refund or licence transfer?", "SHORT", true), question("details", "Tell us more", "PARAGRAPH", true)],
            });
            panel = { name: "Support", title: `${name} Support & Orders`, description: "Pick what you need and a private ticket opens with the right team. Have your order or transaction ID ready for product support, refunds, and licence transfers.", color: "#5865F2", style: "BUTTONS", placeholder: "Choose what you need" };
            break;
        }
        default:
            add("General Support", "🎫", "Get help from the team.", { questions: help });
            add("Report a Member", "🚨", "Report someone for breaking the rules.", { buttonStyle: "DANGER", defaultPriority: "HIGH", questions: report });
            add("Appeal a Punishment", "⚖️", "Ask for a ban, mute, or warning to be reviewed.", { buttonStyle: "SECONDARY", questions: appeal });
            add("Partnership Request", "🤝", "Partner with the community.", { buttonStyle: "SECONDARY", questions: [question("link", "Your server or invite link", "SHORT", true), question("idea", "What do you have in mind?", "PARAGRAPH", true)] });
            add("Something Else", "💬", "Anything that fits nowhere else.", { buttonStyle: "SECONDARY", questions: help });
            departmentTypes((department) => department);
            panel = { name: "Support", title: "Need help?", description: `Open a private ticket with the ${name} team. Pick the option that fits.`, color: "#5865F2", style: "BUTTONS", placeholder: "Choose a ticket type" };
    }
    const kept = types.slice(0, 25);
    return { panel: { ...panel, title: panel.title.slice(0, 256), style: kept.length > 10 ? "SELECT_MENU" : panel.style }, types: kept };
}
/**
 * Turns questionnaire answers into a full server layout. Pure and
 * deterministic: the same answers always give the same blueprint.
 */
export function generateBlueprint(input) {
    validateAnswers(input);
    const on = (section) => input.include[section];
    const fivem = input.serverType === "FIVEM_RP";
    const business = input.serverType === "BUSINESS";
    const studio = input.serverType === "ASSET_STUDIO";
    const keys = new Set();
    const uniqueKey = (base) => {
        let key = base;
        for (let index = 2; keys.has(key); index += 1)
            key = `${base}-${index}`;
        keys.add(key);
        return key;
    };
    const channel = (type, name, options = {}) => {
        const finalName = isTextType(type) ? channelSlug(name) : name;
        const forum = isForumType(type) ? (options.forum ? mediaSafe(options.forum, type) : defaultForumSetup(finalName, type)) : undefined;
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
            ...(forum ? { forum } : {}),
        };
    };
    const emojiMode = input.channelEmojis ?? "ALL";
    const separator = input.emojiSeparator ?? "BAR";
    const decorate = (item, keyCategory) => wantsEmoji(emojiMode, item, keyCategory) ? { ...item, name: emojiChannelName(item.name, channelEmoji(item.name, item.purpose, item.type), item.type, separator) } : item;
    const categories = [];
    /**
     * `keyCategory`: Start Here, Information, and Support, whose channels get an emoji under KEY.
     * `keepEmpty`: made even with no channels (ticket status categories hold ticket channels).
     */
    const category = (emoji, name, channels, overwrites, purpose, keyCategory = false, keepEmpty = false) => {
        if (channels.length === 0 && !keepEmpty)
            return;
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
    const roles = [];
    const staffRanks = input.staffRanks.map((rank) => rank.trim());
    const staffKeys = staffRanks.map((rank, index) => {
        const key = `staff-${keyOf(rank)}`;
        const last = index === staffRanks.length - 1 && staffRanks.length >= 3;
        const permissions = index === 0 ? ["Administrator"] : index === 1 ? ADMIN_PERMISSIONS : last ? TRIAL_PERMISSIONS : MODERATOR_PERMISSIONS;
        roles.push({ key, name: rank, color: STAFF_COLORS[index % STAFF_COLORS.length], hoist: true, mentionable: false, permissions, purpose: "staff" });
        return key;
    });
    /* In the asset studio a department is a product line: its role is the team that makes it (Script Developer, MLO Builder ...). */
    const departments = input.departments.map((department, index) => {
        const name = department.trim();
        const key = `dept-${keyOf(name)}`;
        roles.push({ key, name: studio ? studioLine(name).team : name, color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length], hoist: fivem || studio, mentionable: true, permissions: [], purpose: "department" });
        return { key, name, slug: channelSlug(name) };
    });
    const teamKeys = studio ? departments.map((department) => department.key) : [];
    /* Studio community and customer roles. */
    const customerKey = "customer";
    const buyerKeys = [];
    if (studio) {
        roles.push({ key: "partner", name: "Partner", color: "#FD79A8", hoist: true, mentionable: false, permissions: [] });
        roles.push({ key: "content-creator", name: "Content Creator", color: "#E84393", hoist: true, mentionable: false, permissions: [] });
        roles.push({ key: customerKey, name: "Customer", color: "#00B894", hoist: true, mentionable: false, permissions: [] });
        departments.forEach((department, index) => {
            const key = `buyer-${keyOf(department.name)}`;
            roles.push({ key, name: `${department.name} Buyer`, color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length], hoist: false, mentionable: false, permissions: [] });
            buyerKeys.push(key);
        });
        roles.push({ key: "server-owner", name: "Server Owner", color: "#00CEC9", hoist: false, mentionable: false, permissions: [] });
        roles.push({ key: "beta-tester", name: "Beta Tester", color: "#6C5CE7", hoist: false, mentionable: true, permissions: [] });
        roles.push({ key: "release-ping", name: "Release Ping", color: "#E67E22", hoist: false, mentionable: true, permissions: [], purpose: "ping" });
    }
    if (on("giveaways"))
        roles.push({ key: "giveaway-ping", name: "Giveaway Ping", color: "#F1C40F", hoist: false, mentionable: true, permissions: [], purpose: "ping" });
    if (on("events"))
        roles.push({ key: "event-ping", name: "Event Ping", color: "#9B59B6", hoist: false, mentionable: true, permissions: [], purpose: "ping" });
    const verifiedKey = on("verification") ? "verified" : undefined;
    if (verifiedKey) {
        roles.push({ key: verifiedKey, name: studio ? "Member" : "Verified", color: "#2ECC71", hoist: false, mentionable: false, permissions: [], purpose: "verified" });
        roles.push({ key: "unverified", name: "Unverified", color: "#95A5A6", hoist: false, mentionable: false, permissions: [], purpose: "unverified" });
    }
    const gate = verifiedKey ? PRESETS.VERIFIED_ONLY(verifiedKey) : PRESETS.PUBLIC();
    const readOnly = PRESETS.READ_ONLY(staffKeys);
    /** Staff and the product teams post; everyone reads (and reacts). */
    const teamPosts = PRESETS.READ_ONLY([...staffKeys, ...teamKeys]);
    /** Hidden from members (and the verified role) except the given roles; staff and the given teams always see and post. */
    const rolesOnly = (read, post, teams = teamKeys) => PRESETS.ROLES_ONLY({ read, post: [...post, ...staffKeys, ...teams], hide: verifiedKey ? [verifiedKey] : [] });
    /* Start here: visible before verifying. */
    const start = [];
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
    const info = [];
    if (on("information")) {
        info.push(channel("ANNOUNCEMENT", "announcements", { topic: "Important news.", overwrites: readOnly, purpose: "announcements" }));
        if (studio) {
            info.push(channel("ANNOUNCEMENT", "releases", { topic: "New releases. Follow this channel to get them in your own server.", overwrites: teamPosts }));
            info.push(channel("TEXT", "changelogs", { topic: "Updates and fixes for every product.", overwrites: teamPosts }));
            info.push(channel("TEXT", "free-releases", { topic: "Free assets from the team.", overwrites: teamPosts }));
        }
        else
            info.push(channel("ANNOUNCEMENT", business ? "company-updates" : "server-updates", { overwrites: readOnly }));
    }
    if (on("events"))
        info.push(channel("TEXT", "events", { topic: "Upcoming events.", overwrites: readOnly }));
    if (on("giveaways"))
        info.push(channel("TEXT", "giveaways", { topic: "Click the button on a giveaway to enter.", overwrites: readOnly, purpose: "giveaways" }));
    if (on("polls"))
        info.push(channel("TEXT", "polls", { topic: "Vote on server questions.", overwrites: readOnly, purpose: "polls" }));
    if (on("birthdays"))
        info.push(channel("TEXT", "birthdays", { topic: "Birthday wishes. Add yours with /birthday set.", overwrites: readOnly, purpose: "birthdays" }));
    category("📢", "Information", info, gate, undefined, true);
    /* Store (asset studio). */
    if (studio)
        category("🛒", "Store", [
            channel("TEXT", "store", { topic: "Where to buy, and how to get your Customer role after buying.", overwrites: readOnly }),
            channel("TEXT", "pricing", { topic: "Prices, licences, and what each one includes.", overwrites: readOnly }),
            channel("TEXT", "bundles", { topic: "Bundles and deals.", overwrites: readOnly }),
            channel("TEXT", "faq", { topic: "Answers to common questions before you buy.", overwrites: readOnly }),
            channel("TEXT", "vouches", { topic: "Bought something? Tell others how it went.", slowmodeSeconds: 60, overwrites: PRESETS.READ_ONLY([...staffKeys, customerKey, ...buyerKeys]) }),
        ], gate);
    /* Game server. */
    const game = [];
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
    /* Showcase (asset studio): the team's previews, and members' servers using the assets. */
    const lineTags = departments.map((department) => ({ name: studioLine(department.name).tag, emoji: DEPARTMENT_EMOJI.find(([pattern]) => pattern.test(department.name))?.[1] ?? "📁" }));
    if (studio && on("media")) {
        const type = input.useMediaChannels ? "MEDIA" : "TEXT";
        category("🎬", "Showcase", [
            channel(type, "showcase", {
                topic: "Previews, screenshots, and videos from the team. React to show some love.",
                overwrites: mergeOverwrites(teamPosts, PRESETS.MEDIA_ONLY(input.useMediaChannels)),
                forum: { guidelines: "Previews from the team only.", tags: [...lineTags.slice(0, 18), { name: "Teaser", emoji: "👀" }, { name: "Release", emoji: "🚀" }], defaultReactionEmoji: "🔥" },
            }),
            channel(type, "community-showcase", {
                topic: "Show your server using our assets: screenshots and clips.",
                overwrites: PRESETS.MEDIA_ONLY(input.useMediaChannels),
                slowmodeSeconds: input.useMediaChannels ? 0 : 10,
                forum: { guidelines: "Your server using our assets. Screenshots and clips only.", tags: [{ name: "Screenshot", emoji: "📷" }, { name: "Video", emoji: "🎬" }, { name: "Server", emoji: "🏙️" }], defaultReactionEmoji: "❤️" },
            }),
        ], gate);
    }
    else if (on("media")) {
        const type = input.useMediaChannels ? "MEDIA" : "TEXT";
        const media = PRESETS.MEDIA_ONLY(input.useMediaChannels);
        const slowmodeSeconds = input.useMediaChannels ? 0 : 10;
        category("📸", "Media", [
            channel(type, "screenshots", { topic: "Photos and screenshots only.", overwrites: media, slowmodeSeconds }),
            channel(type, "clips", { topic: "Video clips only.", overwrites: media, slowmodeSeconds }),
            channel(type, "art", { topic: "Share your creations.", overwrites: media, slowmodeSeconds }),
        ], gate);
    }
    /* Community. */
    const community = [channel("TEXT", "general", { topic: "Chat about anything." })];
    if (business)
        community.push(channel("TEXT", "watercooler", { topic: "Off-topic chat." }));
    else
        community.push(channel("TEXT", "off-topic"), channel("TEXT", "memes", { slowmodeSeconds: 10 }));
    community.push(channel("TEXT", "introductions", { topic: "Say hi and tell us about yourself.", slowmodeSeconds: 60 }));
    if (fivem)
        community.push(channel("TEXT", "looking-for-rp", { topic: "Find people to roleplay with." }));
    if (input.serverType === "GAMING")
        community.push(channel("TEXT", "looking-for-group", { topic: "Find people to play with." }));
    if (studio) {
        community.push(channel("TEXT", "dev-talk", { topic: "FiveM development: scripting, mapping, modelling." }));
        community.push(channel("TEXT", "server-owners", { topic: "Chat for server owners.", overwrites: rolesOnly(["server-owner"], ["server-owner"]) }));
        community.push(channel("TEXT", "partners", { topic: "Our partners and content creators.", overwrites: readOnly }));
    }
    community.push(channel("TEXT", "bot-commands", { topic: "Use bot commands here." }));
    if (on("suggestions"))
        community.push(channel("TEXT", "suggestions", { topic: "Share ideas with /suggest submit.", slowmodeSeconds: 30, purpose: "suggestions" }));
    if (on("starboard"))
        community.push(channel("TEXT", "starboard", { topic: "The best messages, picked by stars.", overwrites: readOnly, purpose: "starboard" }));
    if (on("levels"))
        community.push(channel("TEXT", "level-ups", { topic: "Level-up messages.", overwrites: readOnly, purpose: "level-up" }));
    if (on("ageRestricted"))
        community.push(channel("TEXT", "18-plus", { topic: "Age-restricted chat.", nsfw: true }));
    category("💬", "Community", community, gate);
    /* Product lines (asset studio): public chat and help, plus buyer-only downloads and support. */
    if (studio)
        departments.forEach((department, index) => {
            const emoji = DEPARTMENT_EMOJI.find(([pattern]) => pattern.test(department.name))?.[1] ?? "📁";
            const buyer = buyerKeys[index];
            const line = studioLine(department.name);
            category(emoji, department.name, [
                channel("TEXT", `${department.slug}-chat`, { topic: `Talk about our ${department.name}.` }),
                channel(on("forums") ? "FORUM" : "TEXT", `${department.slug}-help`, {
                    topic: `Questions about our ${department.name}. One post per problem.`,
                    forum: {
                        guidelines: "One post per problem. Say which product, your framework, and paste any errors.",
                        tags: [{ name: "Question", emoji: "❓" }, { name: "Solved", emoji: "✅" }, { name: "Bug", emoji: "🐛" }],
                        defaultReactionEmoji: "👍",
                        firstPost: { title: "Read me first", content: `${HOW_TO_POST} Say which product, your framework, and paste any errors. Buyers get faster help in #${department.slug}-support.`, pin: true },
                    },
                }),
                channel("TEXT", `${department.slug}-downloads`, { topic: `Downloads and install guides for buyers of our ${department.name}.`, overwrites: rolesOnly([buyer], [], [department.key]) }),
                channel("TEXT", `${department.slug}-support`, { topic: `Priority ${line.tag} support for buyers.`, overwrites: rolesOnly([buyer], [buyer], [department.key]) }),
            ], gate);
        });
    /* Customers (asset studio): everyone who bought anything. */
    const customerRoles = [customerKey, ...buyerKeys, "beta-tester"];
    /** Customers read; only staff (and the teams, when given) post. */
    const customersRead = (posters) => mergeOverwrites(customerRoles.map((key) => ({ target: key, allow: [], deny: ["SendMessages", "SendMessagesInThreads", "CreatePublicThreads", "CreatePrivateThreads"] })), PRESETS.READ_ONLY(posters));
    if (studio)
        category("🔐", "Customers", [
            channel("TEXT", "customer-announcements", { topic: "News for customers: updates, licence changes, and early access.", overwrites: customersRead([...staffKeys, ...teamKeys]) }),
            channel("TEXT", "customer-chat", { topic: "Chat for customers." }),
            channel("TEXT", "how-to-download", { topic: "How to download your purchases and claim your buyer roles.", overwrites: customersRead(staffKeys) }),
            channel("TEXT", "beta-testing", {
                topic: "Try new releases before everyone else.",
                overwrites: [
                    ...[customerKey, ...buyerKeys].map((key) => ({ target: key, allow: [], deny: ["ViewChannel"] })),
                    { target: "beta-tester", allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"], deny: [] },
                ],
            }),
        ], PRESETS.ROLES_ONLY({ read: customerRoles, post: [...customerRoles, ...staffKeys, ...teamKeys], hide: verifiedKey ? [verifiedKey] : [] }));
    /* Commissions (asset studio). */
    if (studio)
        category("🧩", "Commissions", [
            channel("TEXT", "commission-info", { topic: "What we take on, prices, and how commissions work.", overwrites: readOnly }),
            channel(on("forums") ? "FORUM" : "TEXT", "commission-requests", {
                topic: "Request custom work. One post per request.",
                slowmodeSeconds: on("forums") ? 0 : 60,
                forum: {
                    guidelines: "One post per request: what you want, your budget, your deadline, and references.",
                    tags: [...lineTags.slice(0, 16), { name: "Other", emoji: "📁" }, { name: "Open", emoji: "🟢" }, { name: "Accepted", emoji: "🤝" }, { name: "Closed", emoji: "🔒" }],
                    defaultReactionEmoji: "👀",
                    firstPost: { title: "Read me first", content: `${HOW_TO_POST} Say what you want made, your budget, your deadline, and add references. For private requests, open a Custom Commission ticket.`, pin: true },
                },
            }),
        ], gate);
    /* Forums. */
    if (studio) {
        const type = on("forums") ? "FORUM" : "TEXT";
        category("🗂️", "Feedback", [
            channel(type, "bug-reports", {
                topic: "Found a bug in one of our products? One post per bug.",
                forum: {
                    guidelines: "One bug per post: the product and version, what happened, and how to repeat it.",
                    tags: [...lineTags.slice(0, 17), { name: "Open", emoji: "🔴" }, { name: "Fixed", emoji: "✅" }, { name: "Cannot reproduce", emoji: "❔" }],
                    defaultReactionEmoji: "👀",
                    firstPost: { title: "Read me first", content: `${HOW_TO_POST} Say the product and version, what happened, and the steps to repeat it. The team updates the tag when it is fixed.`, pin: true },
                },
            }),
            channel(type, "feature-requests", {
                topic: "Ideas for new features and products.",
                forum: {
                    guidelines: "One idea per post. Vote with 👍 on the ones you want.",
                    tags: [...lineTags.slice(0, 17), { name: "Planned", emoji: "🗺️" }, { name: "Done", emoji: "✅" }, { name: "Not planned", emoji: "🚫" }],
                    defaultReactionEmoji: "👍",
                    firstPost: { title: "Read me first", content: `${HOW_TO_POST} One idea per post. Vote with 👍 on the ones you want most.`, pin: true },
                },
            }),
            ...(on("forums") ? [channel("FORUM", "feedback", { topic: "Tell us what to improve." })] : []),
        ], gate);
    }
    else if (on("forums"))
        category("🗂️", "Forums", [
            channel("FORUM", "help", { topic: "Ask a question. One post per problem." }),
            channel("FORUM", "feedback", { topic: "Tell us what to improve." }),
        ], gate);
    /* Support. */
    const support = [];
    if (on("tickets"))
        support.push(channel("TEXT", "open-a-ticket", { topic: "Need help? Open a ticket here.", overwrites: readOnly, purpose: "tickets-panel" }));
    if (on("applications"))
        support.push(channel("TEXT", "apply-here", { topic: "Apply to join the team.", overwrites: readOnly }));
    category("🎫", "Support", support, gate, undefined, true);
    /* Ticket status categories: tickets open in the first, move to the second when claimed or waiting, and to the third when closed. */
    if (on("tickets")) {
        const [fresh, progress, closed] = TICKET_STATUS_NAMES[input.serverType];
        const ticketStaff = PRESETS.STAFF_ONLY(staffKeys);
        category("📥", fresh, [], ticketStaff, "tickets", false, true);
        category("⏳", progress, [], ticketStaff, "tickets-progress", false, true);
        category("📁", closed, [], ticketStaff, "tickets-closed", false, true);
    }
    /* Events. */
    if (on("events"))
        category("🎉", "Events", [
            channel("STAGE", business ? "Town Hall" : studio ? "Showcase Stage" : "Event Stage"),
            channel("TEXT", "event-chat", { topic: "Talk about the current event." }),
        ], gate);
    /* Voice. */
    const voice = [];
    if (on("joinToCreate"))
        voice.push(channel("VOICE", "Join to Create", { purpose: "voice-hub" }));
    for (let index = 1; index <= input.voiceLounges; index += 1)
        voice.push(channel("VOICE", business ? `Meeting Room ${index}` : studio ? `Community Lounge ${index}` : `Lounge ${index}`));
    category("🔊", "Voice", voice, gate);
    /* Departments (asset studio: each product line's team). */
    for (const department of departments) {
        const slug = department.slug;
        const emoji = DEPARTMENT_EMOJI.find(([pattern]) => pattern.test(department.name))?.[1] ?? "📁";
        const access = PRESETS.DEPARTMENT_ONLY(department.key, input.staffAccess === "NONE" ? [] : staffKeys);
        if (studio) {
            category(emoji, `${department.name} Team`, [
                channel("TEXT", `${slug}-dev`, { topic: `${department.name} team chat.` }),
                channel("TEXT", `${slug}-wip`, { topic: "Work in progress: previews before they go to the showcase." }),
                channel("TEXT", `${slug}-tasks`, { topic: "What is being worked on, and by whom." }),
                channel("VOICE", `${department.name} Dev Room`),
            ], access);
            continue;
        }
        category(emoji, department.name, [
            channel("TEXT", `${slug}-chat`, { topic: `${department.name} chat.` }),
            channel("TEXT", `${slug}-briefings`, { topic: `${department.name} briefings and orders.` }),
            channel("TEXT", `${slug}-reports`, { topic: `${department.name} reports.` }),
            channel("TEXT", `${slug}-training`, { topic: `${department.name} training.` }),
            channel("VOICE", `${department.name} ${fivem ? "Radio" : "Room"}`),
            channel("VOICE", `${department.name} Briefing Room`),
        ], access);
    }
    /* Staff (asset studio: the whole team). */
    if (on("staffArea")) {
        const seniorOnly = (keys) => keys.map((key) => ({ target: key, allow: [], deny: ["SendMessages"] }));
        if (studio)
            category("🏢", "Studio", [
                channel("TEXT", "team-announcements", { topic: "Only the owner and studio manager post here.", overwrites: seniorOnly([...staffKeys.slice(2), ...teamKeys]) }),
                channel("TEXT", "team-chat"),
                channel("TEXT", "planning", { topic: "Internal planning: what we build next." }),
                channel("TEXT", "roadmap", { topic: "Release roadmap and dates." }),
                channel("TEXT", "qa-testing", { topic: "Testing builds before release. Post what you tested and what broke." }),
                channel("TEXT", "commission-board", { topic: "Commissions we took on: who, what, price, and deadline." }),
                channel("TEXT", "staff-commands", { topic: "Use staff commands here." }),
                channel("VOICE", "Team Voice"),
                channel("VOICE", "Team Meeting"),
            ], PRESETS.STAFF_ONLY([...staffKeys, ...teamKeys]));
        else
            category("🛡️", "Staff", [
                channel("TEXT", "staff-announcements", { topic: "Only senior staff post here.", overwrites: seniorOnly(staffKeys.slice(2)) }),
                channel("TEXT", "staff-chat"),
                channel("TEXT", "staff-commands", { topic: "Use staff commands here." }),
                channel("VOICE", "Staff Voice"),
                channel("VOICE", "Staff Meeting"),
            ], PRESETS.STAFF_ONLY(staffKeys));
        const logs = [
            channel("TEXT", "mod-log", { purpose: "mod-log" }),
            channel("TEXT", "server-log", { purpose: "server-log" }),
        ];
        if (on("tickets"))
            logs.push(channel("TEXT", "ticket-transcripts", { purpose: "ticket-transcripts" }));
        if (on("applications"))
            logs.push(channel("TEXT", "applications-review", { purpose: "applications-review", overwrites: staffKeys.map((key) => ({ target: key, allow: ["SendMessages", "SendMessagesInThreads"], deny: [] })) }));
        logs.push(channel("TEXT", "staff-log", { purpose: "staff-log" }));
        if (studio)
            logs.push(channel("TEXT", "store-log", { topic: "Store purchase webhooks." }));
        category("📜", "Logs", logs, PRESETS.HIDDEN_LOG(staffKeys));
    }
    return { roles, categories, ...(on("tickets") ? { tickets: ticketSetup({ input, departments, on }) } : {}) };
}
/** Media channels need an attachment per post, so a media channel's setup has no first post. */
function mediaSafe(setup, type) {
    if (type !== "MEDIA")
        return setup;
    const { firstPost: _firstPost, ...rest } = setup;
    return rest;
}
//# sourceMappingURL=generator.js.map