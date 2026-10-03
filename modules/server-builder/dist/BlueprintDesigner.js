import { z } from "zod";
import { channelEmoji, defaultForumSetup, emojiChannelName, generateBlueprint, templateFor } from "./generator.js";
import { PRESETS } from "./permissions.js";
import { BUILDER_CHANNEL_EMOJIS, BUILDER_CHANNEL_TYPES, BUILDER_SECTIONS, BUILDER_SERVER_TYPES } from "./types.js";
import { BUILDER_LIMITS, BuilderError, channelSlug, isEmoji, isForumType, isTextType, keyOf, plainChannelName, validateBlueprint } from "./validation.js";
/* ---------- The JSON the model returns ---------- */
const enumOf = (values) => z.enum(values);
const shortName = z.string().trim().min(1).max(60);
const longName = z.string().trim().min(1).max(BUILDER_LIMITS.nameLength);
/** A bad emoji is dropped rather than failing the whole design. */
const optionalEmoji = z.string().max(40).optional().transform((value) => (value && isEmoji(value.trim()) ? value.trim() : undefined));
const designedChannelSchema = z.object({
    name: longName,
    emoji: optionalEmoji,
    type: enumOf(BUILDER_CHANNEL_TYPES),
    topic: z.string().trim().max(BUILDER_LIMITS.topicLength).optional(),
    readOnly: z.boolean().optional(),
});
const designedCategorySchema = z.object({
    name: longName,
    emoji: optionalEmoji,
    access: z.enum(["everyone", "staff", "roles"]),
    roles: z.array(shortName).max(20).optional(),
    channels: z.array(designedChannelSchema).min(1).max(25),
});
const designedRoleSchema = z.object({
    name: shortName,
    color: z.string().trim().regex(/^#[0-9a-f]{6}$/i, "Role colors are hex like #5865F2."),
    purpose: z.enum(["staff", "department", "ping"]).optional(),
});
/** What the AI designer may return. Everything is checked here; the model never produces a raw blueprint. */
export const designedBlueprintSchema = z.object({
    serverType: enumOf(BUILDER_SERVER_TYPES),
    serverName: longName.optional(),
    staffRanks: z.array(shortName).min(1).max(8).optional(),
    departments: z.array(shortName).max(12).optional(),
    include: z.partialRecord(enumOf(BUILDER_SECTIONS), z.boolean()).optional(),
    voiceLounges: z.number().int().min(0).max(BUILDER_LIMITS.voiceLounges).optional(),
    channelEmojis: enumOf(BUILDER_CHANNEL_EMOJIS).optional(),
    removeChannels: z.array(z.string().trim().max(BUILDER_LIMITS.nameLength)).max(100).optional(),
    extraRoles: z.array(designedRoleSchema).max(15).optional(),
    extraCategories: z.array(designedCategorySchema).max(10).optional(),
    summary: z.string().trim().max(600),
});
export const UNEXPECTED_DESIGN = "The AI designer returned something unexpected. Try again.";
export const NO_DESIGN_ANSWER = "The AI designer did not answer. Try again.";
export const NO_DESIGNER = "Describe-your-server needs an OpenAI API key on the host (OPENAI_API_KEY).";
/** Checks the model's JSON. Throws a plain DEPENDENCY_UNAVAILABLE error when it is not what was asked for. */
export function parseDesignedBlueprint(value) {
    const result = designedBlueprintSchema.safeParse(value);
    if (!result.success)
        throw new BuilderError("DEPENDENCY_UNAVAILABLE", UNEXPECTED_DESIGN);
    return result.data;
}
/* ---------- Answers and extras ---------- */
/** Questionnaire answers from a design, falling back field by field to the template for the chosen server type. */
export function answersFromDesign(design, prompt) {
    const template = templateFor(design.serverType).answers;
    const unique = (items) => {
        if (!items)
            return undefined;
        const seen = new Set();
        return items.filter((item) => {
            const key = keyOf(item);
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    };
    const staffRanks = unique(design.staffRanks);
    const departments = unique(design.departments);
    return {
        ...template,
        serverType: design.serverType,
        serverName: design.serverName ?? template.serverName,
        staffRanks: staffRanks?.length ? staffRanks : template.staffRanks,
        departments: departments ?? template.departments,
        include: { ...template.include, ...(design.include ?? {}) },
        voiceLounges: design.voiceLounges ?? template.voiceLounges,
        channelEmojis: design.channelEmojis ?? template.channelEmojis,
        description: prompt,
    };
}
/**
 * Applies the design's extras to a generated blueprint: removes channels,
 * adds roles, and adds categories. Each extra is checked on its own, and one
 * that would make the blueprint invalid is dropped rather than failing the
 * whole design.
 */
export function applyDesign(blueprint, design, answers) {
    const dropped = [];
    let current = removeChannels(blueprint, design.removeChannels ?? []);
    const keys = new Set(current.categories.flatMap((category) => [category.key, ...category.channels.map((channel) => channel.key)]));
    const roleKeys = new Set(current.roles.map((role) => role.key));
    const unique = (used, base) => {
        let key = base;
        for (let index = 2; used.has(key); index += 1)
            key = `${base}-${index}`;
        used.add(key);
        return key;
    };
    const attempt = (label, change) => {
        try {
            const next = change();
            validateBlueprint(next);
            current = next;
        }
        catch (error) {
            dropped.push(`${label} was left out: ${error instanceof Error ? error.message : "it was not valid."}`);
        }
    };
    for (const role of design.extraRoles ?? []) {
        if (current.roles.some((existing) => existing.name.toLowerCase() === role.name.toLowerCase()))
            continue;
        const key = unique(roleKeys, `role-${keyOf(role.name)}`);
        attempt(`Role "${role.name}"`, () => addRole(current, role, key));
    }
    for (const category of design.extraCategories ?? [])
        attempt(`Category "${category.name}"`, () => addCategory(current, category, answers, (base) => unique(keys, base)));
    return { blueprint: current, dropped };
}
/** Drops generated channels by slug, ignoring emoji. Categories left empty go too. */
function removeChannels(blueprint, slugs) {
    const wanted = new Set(slugs.map((slug) => channelSlug(plainChannelName(slug))).filter(Boolean));
    if (wanted.size === 0)
        return blueprint;
    const keep = (channel) => !wanted.has(channelSlug(plainChannelName(channel.name))) && !wanted.has(channel.key);
    return {
        ...blueprint,
        categories: blueprint.categories.map((category) => ({ ...category, channels: category.channels.filter(keep) })).filter((category) => category.channels.length > 0),
    };
}
function addRole(blueprint, role, key) {
    const staff = role.purpose === "staff";
    const department = role.purpose === "department";
    const added = {
        key,
        name: role.name,
        color: role.color.toUpperCase(),
        hoist: staff || department,
        mentionable: role.purpose === "ping" || department,
        permissions: [],
        ...(role.purpose ? { purpose: role.purpose } : {}),
    };
    const roles = [...blueprint.roles];
    const lastOf = (purpose) => roles.reduce((found, item, index) => (item.purpose === purpose ? index : found), -1);
    const after = staff ? lastOf("staff") : department ? Math.max(lastOf("department"), lastOf("staff")) : -1;
    roles.splice(after === -1 ? roles.length : after + 1, 0, added);
    if (!staff)
        return { ...blueprint, roles };
    /* A new staff role gets in wherever the lowest generated staff rank does. */
    const lowest = blueprint.roles.filter((item) => item.purpose === "staff").at(-1)?.key;
    const extend = (overwrites) => {
        const match = lowest ? overwrites.find((overwrite) => overwrite.target === lowest) : undefined;
        return match ? [...overwrites, { ...match, target: key }] : overwrites;
    };
    return {
        roles,
        categories: blueprint.categories.map((category) => ({
            ...category,
            overwrites: extend(category.overwrites),
            channels: category.channels.map((channel) => ({ ...channel, overwrites: extend(channel.overwrites) })),
        })),
    };
}
function addCategory(blueprint, category, answers, unique) {
    const staffKeys = blueprint.roles.filter((role) => role.purpose === "staff").map((role) => role.key);
    const verified = blueprint.roles.find((role) => role.purpose === "verified")?.key;
    const named = (category.roles ?? []).map((name) => blueprint.roles.find((role) => role.name.toLowerCase() === name.trim().toLowerCase())?.key).filter((key) => Boolean(key));
    const overwrites = category.access === "everyone"
        ? (verified ? PRESETS.VERIFIED_ONLY(verified) : PRESETS.PUBLIC())
        : category.access === "roles" && named.length > 0
            ? PRESETS.DEPARTMENT_ONLY(named[0], named.slice(1))
            : PRESETS.STAFF_ONLY(staffKeys);
    const mode = answers.channelEmojis ?? "ALL";
    const separator = answers.emojiSeparator ?? "BAR";
    const channels = category.channels.map((channel) => {
        const type = channel.type;
        const plain = isTextType(type) ? channelSlug(plainChannelName(channel.name)) : plainChannelName(channel.name);
        const emoji = mode === "NONE" ? undefined : channel.emoji ?? (mode === "ALL" ? channelEmoji(plain, undefined, type) : undefined);
        const name = emoji ? emojiChannelName(plain, emoji, type, separator) : plain;
        const topic = channel.topic?.trim();
        return {
            key: unique(keyOf(plain)),
            name,
            type,
            slowmodeSeconds: 0,
            nsfw: false,
            userLimit: 0,
            overwrites: channel.readOnly ? PRESETS.READ_ONLY(staffKeys) : [],
            ...(topic ? { topic } : {}),
            ...(isForumType(type) ? { forum: defaultForumSetup(plain, type) } : {}),
        };
    });
    const label = category.name.toUpperCase();
    const added = {
        key: unique(`cat-${keyOf(category.name)}`),
        name: answers.emojiCategories ? `${category.emoji ?? "📁"} ${label}` : label,
        overwrites,
        channels,
    };
    const categories = [...blueprint.categories];
    const before = categories.findIndex((item) => item.key === "cat-staff" || item.overwrites.some((overwrite) => overwrite.target.startsWith("dept-")));
    categories.splice(before === -1 ? categories.length : before, 0, added);
    return { ...blueprint, categories };
}
/* ---------- Prompts ---------- */
const SECTION_MEANING = {
    information: "welcome, rules, announcements, and updates channels",
    verification: "a Verified role and a verify channel; everything but Start Here is hidden until members verify",
    tickets: "an open-a-ticket panel channel, a Support category that new tickets open in, and ticket transcripts",
    applications: "an apply-here channel and a staff-only applications-review channel",
    levels: "a level-ups channel",
    giveaways: "a giveaways channel and a Giveaway Ping role",
    polls: "a polls channel",
    birthdays: "a birthdays channel",
    suggestions: "a suggestions channel",
    starboard: "a starboard channel",
    media: "screenshots, clips, and art channels",
    forums: "help and feedback forums (and forum-style character bios and bug reports for FiveM)",
    joinToCreate: "a Join to Create voice hub that makes private voice rooms",
    fivemStatus: "server status, server alerts, and how-to-connect channels",
    events: "an Event Ping role, an events channel, an event stage, and event chat",
    staffArea: "staff-only channels plus the log channels (mod-log, server-log, staff-log)",
    ageRestricted: "an 18+ channel",
};
const plainNames = (blueprint) => blueprint.categories.flatMap((category) => category.channels.map((channel) => plainChannelName(channel.name)));
/**
 * The instructions for the model: the server types, every section with what
 * it creates for this base server type, the rules, and the JSON shape.
 */
export function designerSystemPrompt(base) {
    const probe = { ...base, departments: [], channelEmojis: "NONE", include: Object.fromEntries(BUILDER_SECTIONS.map((section) => [section, true])) };
    const everything = plainNames(generateBlueprint(probe));
    const sections = BUILDER_SECTIONS.map((section) => {
        const without = new Set(plainNames(generateBlueprint({ ...probe, include: { ...probe.include, [section]: false } })));
        const made = everything.filter((name) => !without.has(name));
        return `- ${section}: ${SECTION_MEANING[section]}${made.length ? ` (creates: ${made.join(", ")})` : ""}`;
    });
    const always = plainNames(generateBlueprint({ ...probe, include: Object.fromEntries(BUILDER_SECTIONS.map((section) => [section, false])) }));
    return [
        "You design Discord server layouts for a server builder. The owner describes what they want; you answer with JSON only, no prose and no markdown.",
        "The builder already makes a full layout from a server type, staff ranks, departments, voice lounges, and sections. Your job is to pick those and add only what the description needs on top.",
        "",
        "Server types: FIVEM_RP (FiveM roleplay city), GAMING (a game community), COMMUNITY (a general community), BUSINESS (a company or team).",
        `Channels made for every layout of this server type: ${always.join(", ")}.`,
        "Each department gets a mentionable role and a private category with <department>-chat, -briefings, -reports, -training, a voice room, and a briefing room. Staff ranks get roles, highest first, with sensible permissions.",
        "",
        "Sections (set true or false in include):",
        ...sections,
        "",
        "Rules:",
        "- Do not repeat channels the sections already create. Use removeChannels (slugs) to drop generated channels that do not fit.",
        "- Channel names are short and lowercase with hyphens. Voice and stage channel names may use words with capitals.",
        "- Emoji are optional and tasteful: one per channel or category at most, never in the name itself.",
        "- Topics are under 100 characters.",
        "- Role colors are hex like #5865F2. Only name roles from staffRanks, departments, or extraRoles in a category's roles list.",
        "- Keep it proportionate: a small community does not need ten categories.",
        "- summary is one or two plain sentences saying what you understood and what you added.",
        "",
        "Return exactly this JSON shape:",
        JSON.stringify({
            serverType: "FIVEM_RP | GAMING | COMMUNITY | BUSINESS",
            serverName: "string",
            staffRanks: ["highest first, 1 to 8"],
            departments: ["0 to 12"],
            include: { "<section>": true },
            voiceLounges: 3,
            channelEmojis: "NONE | KEY | ALL",
            removeChannels: ["slugs of generated channels to drop"],
            extraRoles: [{ name: "string", color: "#hex", purpose: "staff | department | ping (optional)" }],
            extraCategories: [{
                    name: "string",
                    emoji: "optional",
                    access: "everyone | staff | roles",
                    roles: ["role names when access is roles"],
                    channels: [{ name: "string", emoji: "optional", type: "TEXT | ANNOUNCEMENT | FORUM | MEDIA | VOICE | STAGE", topic: "optional", readOnly: false }],
                }],
            summary: "one or two sentences",
        }),
    ].join("\n");
}
/** The owner's description plus the answers they start from. */
export function designerUserPrompt(prompt, base) {
    const { description: _description, ...answers } = base;
    return `Description of the server:\n${prompt.trim().slice(0, BUILDER_LIMITS.description)}\n\nCurrent answers, as a starting point (change anything that does not fit the description):\n${JSON.stringify(answers)}`;
}
/* ---------- OpenAI ---------- */
export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const ENDPOINT = "https://api.openai.com/v1/chat/completions";
const TIMEOUT_MS = 45_000;
/** Designs blueprints with the OpenAI chat completions API, asking for a JSON object. */
export class OpenAiBlueprintDesigner {
    apiKey;
    model;
    fetchImpl;
    timeoutMs;
    constructor(apiKey, model = DEFAULT_OPENAI_MODEL, fetchImpl = fetch, timeoutMs = TIMEOUT_MS) {
        this.apiKey = apiKey;
        this.model = model;
        this.fetchImpl = fetchImpl;
        this.timeoutMs = timeoutMs;
    }
    async design(prompt, base) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            let response;
            try {
                response = await this.fetchImpl(ENDPOINT, {
                    method: "POST",
                    signal: controller.signal,
                    headers: { "content-type": "application/json", authorization: `Bearer ${this.apiKey}` },
                    body: JSON.stringify({
                        model: this.model || DEFAULT_OPENAI_MODEL,
                        temperature: 0.4,
                        max_tokens: 2500,
                        response_format: { type: "json_object" },
                        messages: [
                            { role: "system", content: designerSystemPrompt(base) },
                            { role: "user", content: designerUserPrompt(prompt, base) },
                        ],
                    }),
                });
            }
            catch {
                throw new BuilderError("DEPENDENCY_UNAVAILABLE", NO_DESIGN_ANSWER);
            }
            if (!response.ok)
                throw new BuilderError("DEPENDENCY_UNAVAILABLE", NO_DESIGN_ANSWER, { status: response.status });
            const data = (await response.json().catch(() => ({})));
            const text = data.choices?.[0]?.message?.content?.trim();
            if (!text)
                throw new BuilderError("DEPENDENCY_UNAVAILABLE", NO_DESIGN_ANSWER);
            let parsed;
            try {
                parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
            }
            catch {
                throw new BuilderError("DEPENDENCY_UNAVAILABLE", UNEXPECTED_DESIGN);
            }
            return parsed;
        }
        finally {
            clearTimeout(timer);
        }
    }
}
//# sourceMappingURL=BlueprintDesigner.js.map