/** Stable, user-safe messages failure. Messages are shown to staff. */
export class MessagesError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "MessagesError";
    }
}
/** Discord's embed limits. */
export const EMBED_LIMITS = {
    embeds: 10,
    title: 256,
    description: 4096,
    fields: 25,
    fieldName: 256,
    fieldValue: 1024,
    footer: 2048,
    author: 256,
    total: 6000,
    content: 2000,
    url: 2048,
};
const SNOWFLAKE = /^\d{17,20}$/;
const HEX_COLOR = /^#?([0-9a-f]{6})$/i;
const MESSAGE_KEY = /^[a-z0-9-]+\.[a-z0-9-]+$/;
export function invalid(message) {
    throw new MessagesError("INVALID_INPUT", message);
}
export function requireSnowflake(name, value) {
    if (!value || !SNOWFLAKE.test(value))
        invalid(`${name} must be a Discord ID.`);
}
export function requireMessageKey(key) {
    if (!MESSAGE_KEY.test(key))
        invalid("That message key does not exist.");
}
/** `#5865F2` (or `5865F2`) to `#5865F2`. */
export function normalizeHexColor(value, name) {
    const match = HEX_COLOR.exec(value.trim());
    if (!match)
        invalid(`${name} must be a hex color like #5865F2.`);
    return `#${match[1].toUpperCase()}`;
}
function isHttpUrl(value) {
    try {
        const url = new URL(value);
        return (url.protocol === "https:" || url.protocol === "http:") && value.length <= EMBED_LIMITS.url;
    }
    catch {
        return false;
    }
}
function requireUrl(name, value) {
    const trimmed = value.trim();
    if (!isHttpUrl(trimmed))
        invalid(`${name} must be a full http(s) link.`);
    return trimmed;
}
function optionalUrl(name, value) {
    if (value === undefined)
        return undefined;
    const trimmed = value.trim();
    return trimmed ? requireUrl(name, trimmed) : undefined;
}
function optionalText(name, value, max) {
    if (value === undefined)
        return undefined;
    if (typeof value !== "string")
        invalid(`${name} must be text.`);
    const trimmed = value.trim();
    if (trimmed.length > max)
        invalid(`${name} can have at most ${max} characters.`);
    return trimmed || undefined;
}
export function validateLook(input) {
    requireSnowflake("guildId", input.guildId);
    if (input.mode !== "fill" && input.mode !== "override")
        invalid('Mode must be "fill" or "override".');
    return {
        guildId: input.guildId,
        enabled: input.enabled === true,
        accentColor: input.accentColor?.trim() ? normalizeHexColor(input.accentColor, "Accent color") : undefined,
        footerText: optionalText("Footer text", input.footerText, EMBED_LIMITS.footer),
        footerIconUrl: optionalUrl("Footer icon", input.footerIconUrl),
        authorName: optionalText("Author name", input.authorName, EMBED_LIMITS.author),
        authorIconUrl: optionalUrl("Author icon", input.authorIconUrl),
        thumbnailUrl: optionalUrl("Thumbnail", input.thumbnailUrl),
        showTimestamp: input.showTimestamp === true,
        mode: input.mode,
        expectedRevision: input.expectedRevision,
    };
}
/** Accepts an integer or a hex string for an embed color and returns the integer Discord expects. */
export function embedColor(value) {
    if (value === undefined || value === null || value === "")
        return undefined;
    if (typeof value === "number") {
        if (!Number.isInteger(value) || value < 0 || value > 0xffffff)
            invalid("Embed color must be a whole number between 0 and 16777215 or a hex color.");
        return value;
    }
    if (typeof value === "string")
        return Number.parseInt(normalizeHexColor(value, "Embed color").slice(1), 16);
    invalid("Embed color must be a hex color like #5865F2.");
}
function embedLength(embed) {
    return ((embed.title?.length ?? 0) +
        (embed.description?.length ?? 0) +
        (embed.footer?.text.length ?? 0) +
        (embed.author?.name.length ?? 0) +
        (embed.fields ?? []).reduce((sum, field) => sum + field.name.length + field.value.length, 0));
}
/**
 * Checks one embed against Discord's limits and returns it cleaned: trimmed
 * text, hex colors turned into integers, empty parts dropped. Returns
 * undefined when nothing is left.
 */
export function normalizeEmbed(input, position) {
    if (!input || typeof input !== "object" || Array.isArray(input))
        invalid(`Embed ${position} must be an object.`);
    const raw = input;
    const label = `Embed ${position}`;
    const text = (name, max) => {
        const value = raw[name];
        if (value === undefined || value === null)
            return undefined;
        if (typeof value !== "string")
            invalid(`${label} ${name} must be text.`);
        return optionalText(`${label} ${name}`, value, max);
    };
    const part = (name) => {
        const value = raw[name];
        if (value === undefined || value === null)
            return undefined;
        if (typeof value !== "object" || Array.isArray(value))
            invalid(`${label} ${name} must be an object.`);
        return value;
    };
    const partText = (owner, name, ownerName, max) => {
        const value = owner[name];
        if (value === undefined || value === null)
            return undefined;
        if (typeof value !== "string")
            invalid(`${label} ${ownerName} ${name} must be text.`);
        return optionalText(`${label} ${ownerName} ${name}`, value, max);
    };
    const partUrl = (owner, name, ownerName) => {
        const value = owner[name];
        if (value === undefined || value === null)
            return undefined;
        if (typeof value !== "string")
            invalid(`${label} ${ownerName} ${name} must be a link.`);
        return optionalUrl(`${label} ${ownerName} ${name}`, value);
    };
    const title = text("title", EMBED_LIMITS.title);
    const description = text("description", EMBED_LIMITS.description);
    const url = optionalUrl(`${label} url`, text("url", EMBED_LIMITS.url));
    const color = embedColor(raw.color);
    const timestamp = text("timestamp", 64);
    if (timestamp !== undefined && Number.isNaN(Date.parse(timestamp)))
        invalid(`${label} timestamp must be an ISO 8601 date.`);
    const footerPart = part("footer");
    const footerText = footerPart ? partText(footerPart, "text", "footer", EMBED_LIMITS.footer) : undefined;
    const footerIcon = footerPart ? partUrl(footerPart, "icon_url", "footer") : undefined;
    const authorPart = part("author");
    const authorName = authorPart ? partText(authorPart, "name", "author", EMBED_LIMITS.author) : undefined;
    const authorUrl = authorPart ? partUrl(authorPart, "url", "author") : undefined;
    const authorIcon = authorPart ? partUrl(authorPart, "icon_url", "author") : undefined;
    const imagePart = part("image");
    const imageUrl = imagePart ? partUrl(imagePart, "url", "image") : undefined;
    const thumbnailPart = part("thumbnail");
    const thumbnailUrl = thumbnailPart ? partUrl(thumbnailPart, "url", "thumbnail") : undefined;
    const fieldsRaw = raw.fields;
    if (fieldsRaw !== undefined && fieldsRaw !== null && !Array.isArray(fieldsRaw))
        invalid(`${label} fields must be a list.`);
    const fields = (fieldsRaw ?? []).flatMap((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item))
            invalid(`${label} field ${index + 1} must be an object.`);
        const field = item;
        const name = partText(field, "name", `field ${index + 1}`, EMBED_LIMITS.fieldName);
        const value = partText(field, "value", `field ${index + 1}`, EMBED_LIMITS.fieldValue);
        if (name === undefined && value === undefined)
            return [];
        if (name === undefined || value === undefined)
            invalid(`${label} field ${index + 1} needs both a name and a value.`);
        if (field.inline !== undefined && typeof field.inline !== "boolean")
            invalid(`${label} field ${index + 1} inline must be true or false.`);
        return [{ name, value, ...(field.inline === true ? { inline: true } : {}) }];
    });
    if (fields.length > EMBED_LIMITS.fields)
        invalid(`${label} can have at most ${EMBED_LIMITS.fields} fields.`);
    const embed = {
        ...(title === undefined ? {} : { title }),
        ...(description === undefined ? {} : { description }),
        ...(url === undefined ? {} : { url }),
        ...(color === undefined ? {} : { color }),
        ...(timestamp === undefined ? {} : { timestamp }),
        ...(footerText === undefined ? {} : { footer: { text: footerText, ...(footerIcon === undefined ? {} : { icon_url: footerIcon }) } }),
        ...(imageUrl === undefined ? {} : { image: { url: imageUrl } }),
        ...(thumbnailUrl === undefined ? {} : { thumbnail: { url: thumbnailUrl } }),
        ...(authorName === undefined ? {} : { author: { name: authorName, ...(authorUrl === undefined ? {} : { url: authorUrl }), ...(authorIcon === undefined ? {} : { icon_url: authorIcon }) } }),
        ...(fields.length ? { fields } : {}),
    };
    if (embedLength(embed) > EMBED_LIMITS.total)
        invalid(`${label} has more than ${EMBED_LIMITS.total} characters in total.`);
    const hasVisibleContent = title !== undefined || description !== undefined || footerText !== undefined || authorName !== undefined || imageUrl !== undefined || thumbnailUrl !== undefined || fields.length > 0;
    return hasVisibleContent ? embed : undefined;
}
/**
 * Validates a whole message draft (Discord JSON: `content` and `embeds`) and
 * returns it cleaned. Throws when it is empty or over a limit.
 */
export function normalizeMessage(input) {
    if (!input || typeof input !== "object" || Array.isArray(input))
        invalid("The message must be an object with content and embeds.");
    const raw = input;
    if (raw.content !== undefined && raw.content !== null && typeof raw.content !== "string")
        invalid("Content must be text.");
    const content = optionalText("Content", raw.content ?? undefined, EMBED_LIMITS.content);
    if (raw.embeds !== undefined && raw.embeds !== null && !Array.isArray(raw.embeds))
        invalid("Embeds must be a list.");
    const list = raw.embeds ?? [];
    if (list.length > EMBED_LIMITS.embeds)
        invalid(`A message can have at most ${EMBED_LIMITS.embeds} embeds.`);
    const embeds = list.flatMap((item, index) => {
        const embed = normalizeEmbed(item, index + 1);
        return embed ? [embed] : [];
    });
    if (content === undefined && embeds.length === 0)
        invalid("Write some text or fill in an embed.");
    return { ...(content === undefined ? {} : { content }), embeds };
}
//# sourceMappingURL=validation.js.map