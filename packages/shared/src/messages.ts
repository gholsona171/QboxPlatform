/**
 * Custom messages and embeds (`@qbox/shared/messages`). Side-effect free.
 *
 * Every message the bot sends has a *key* (for example `tickets.opened`).
 * A server can replace the default message for a key with its own text and
 * embed, written in the portal or pasted as Discord embed JSON, using
 * `{placeholders}` the key provides. Feature services ask `MessageTemplates`
 * for the server's version and fall back to their built-in default.
 */

/** Discord embed JSON as the REST API accepts it. */
export interface OutgoingEmbed {
  readonly title?: string | undefined;
  readonly description?: string | undefined;
  readonly url?: string | undefined;
  /** Integer color, as Discord expects. */
  readonly color?: number | undefined;
  /** ISO 8601. */
  readonly timestamp?: string | undefined;
  readonly footer?: { readonly text: string; readonly icon_url?: string | undefined } | undefined;
  readonly image?: { readonly url: string } | undefined;
  readonly thumbnail?: { readonly url: string } | undefined;
  readonly author?: { readonly name: string; readonly url?: string | undefined; readonly icon_url?: string | undefined } | undefined;
  readonly fields?: readonly { readonly name: string; readonly value: string; readonly inline?: boolean | undefined }[] | undefined;
}

/** What gets posted: plain text, embeds, or both. */
export interface OutgoingMessage {
  readonly content?: string | undefined;
  readonly embeds?: readonly OutgoingEmbed[] | undefined;
}

export type TemplateValue = string | number | boolean | Date | null | undefined;
export type TemplateValues = Readonly<Record<string, TemplateValue>>;

/** One placeholder a message key offers, shown in the portal editor. */
export interface MessagePlaceholder {
  readonly name: string;
  readonly description: string;
}

/** Catalog entry for a message the bot sends. */
export interface MessageKeyDefinition {
  /** `<feature>.<event>`, for example `tickets.opened`. */
  readonly key: string;
  /** Feature id as the portal names it: `tickets`, `moderation`, `levels`, `streams` ... */
  readonly feature: string;
  readonly name: string;
  readonly description: string;
  readonly placeholders: readonly MessagePlaceholder[];
  /** Whether the message is a direct message to a member (no channel choice). */
  readonly directMessage?: boolean | undefined;
}

/** Port feature services use. Implemented by `@qbox/messages`; `passthroughTemplates` when unavailable. */
export interface MessageTemplates {
  /**
   * The server's custom version of message `key` rendered with `values`, or
   * `fallback` when the server has not customized that message. Never throws.
   */
  apply(guildId: string, key: string, values: TemplateValues, fallback: OutgoingMessage): Promise<OutgoingMessage>;
}

/** Default when message customization is not wired: every message stays as built. */
export const passthroughTemplates: MessageTemplates = {
  apply: async (_guildId, _key, _values, fallback) => fallback,
};

function valueText(value: TemplateValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return `<t:${Math.floor(value.getTime() / 1000)}:f>`;
  return String(value);
}

/** Replaces `{name}` tokens. Unknown tokens are left as written. */
export function renderPlaceholders(text: string, values: TemplateValues): string {
  return text.replaceAll(/\{([a-zA-Z0-9_.]+)\}/g, (token, name: string) => (name in values ? valueText(values[name]) : token));
}

/** Renders every text field of a message template with the given values. */
export function renderMessage(template: OutgoingMessage, values: TemplateValues): OutgoingMessage {
  return {
    ...(template.content === undefined ? {} : { content: renderPlaceholders(template.content, values) }),
    ...(template.embeds === undefined
      ? {}
      : {
          embeds: template.embeds.map((embed) => ({
            ...embed,
            ...(embed.title === undefined ? {} : { title: renderPlaceholders(embed.title, values) }),
            ...(embed.description === undefined ? {} : { description: renderPlaceholders(embed.description, values) }),
            ...(embed.url === undefined ? {} : { url: renderPlaceholders(embed.url, values) }),
            ...(embed.footer === undefined ? {} : { footer: { ...embed.footer, text: renderPlaceholders(embed.footer.text, values) } }),
            ...(embed.author === undefined ? {} : { author: { ...embed.author, name: renderPlaceholders(embed.author.name, values) } }),
            ...(embed.image === undefined ? {} : { image: { url: renderPlaceholders(embed.image.url, values) } }),
            ...(embed.thumbnail === undefined ? {} : { thumbnail: { url: renderPlaceholders(embed.thumbnail.url, values) } }),
            ...(embed.fields === undefined
              ? {}
              : { fields: embed.fields.map((field) => ({ ...field, name: renderPlaceholders(field.name, values), value: renderPlaceholders(field.value, values) })) }),
          })),
        }),
  };
}

/**
 * Every customizable message, grouped by feature. Each feature that sends a
 * customizable message appends its keys here; the portal lists them from
 * this catalog. Keep entries sorted by feature, then by key.
 */
const USER: MessagePlaceholder = { name: "user", description: "Mentions the member (@name)." };
const USERNAME: MessagePlaceholder = { name: "username", description: "The member's name as plain text." };
const SERVER: MessagePlaceholder = { name: "server", description: "Your server's name." };

export const MESSAGE_CATALOG: readonly MessageKeyDefinition[] = [
  {
    key: "birthdays.announcement",
    feature: "birthdays",
    name: "Birthday announcement",
    description: "Posted in the birthday channel on a member's birthday.",
    placeholders: [USER, USERNAME, SERVER, { name: "age", description: "The age they turn, when they chose to show it." }, { name: "date", description: "The birthday date, for example September 25." }],
  },
  {
    key: "community.goodbye",
    feature: "community",
    name: "Goodbye message",
    description: "Posted when a member leaves.",
    placeholders: [USER, USERNAME, SERVER, { name: "memberCount", description: "How many members the server has now." }],
  },
  {
    key: "community.welcome",
    feature: "community",
    name: "Welcome message",
    description: "Posted when a new member joins.",
    placeholders: [USER, USERNAME, SERVER, { name: "memberCount", description: "How many members the server has now." }],
  },
  {
    key: "giveaways.ended",
    feature: "giveaways",
    name: "Giveaway ended",
    description: "Posted when a giveaway ends and winners are drawn.",
    placeholders: [SERVER, { name: "prize", description: "What was given away." }, { name: "winners", description: "Mentions of the winners." }, { name: "host", description: "Mentions the member who started the giveaway." }],
  },
  {
    key: "giveaways.started",
    feature: "giveaways",
    name: "Giveaway started",
    description: "The giveaway message members enter from.",
    placeholders: [SERVER, { name: "prize", description: "What is being given away." }, { name: "winners", description: "How many winners will be drawn." }, { name: "host", description: "Mentions the member who started the giveaway." }, { name: "endsAt", description: "When the giveaway ends, shown in each member's time zone." }],
  },
  {
    key: "levels.level-up",
    feature: "levels",
    name: "Level up",
    description: "Posted when a member reaches a new level.",
    placeholders: [USER, USERNAME, SERVER, { name: "level", description: "The new level." }, { name: "xp", description: "Their total XP." }, { name: "rank", description: "Their place on the leaderboard." }],
  },
  {
    key: "moderation.case-log",
    feature: "moderation",
    name: "Case log entry",
    description: "Posted in the moderation log channel for every case.",
    placeholders: [USER, USERNAME, SERVER, { name: "moderator", description: "Mentions the moderator." }, { name: "caseNumber", description: "The case number." }, { name: "action", description: "What happened: Warning, Timeout, Kick, Ban ..." }, { name: "reason", description: "The reason the moderator gave." }, { name: "duration", description: "How long a timeout or ban lasts, when it is temporary." }, { name: "rule", description: "The automod rule that triggered, when automod acted." }],
  },
  {
    key: "moderation.warn-dm",
    feature: "moderation",
    name: "Warning direct message",
    description: "Sent to a member when they are warned.",
    placeholders: [USER, USERNAME, SERVER, { name: "moderator", description: "Mentions the moderator." }, { name: "caseNumber", description: "The case number." }, { name: "reason", description: "The reason the moderator gave." }],
    directMessage: true,
  },
  {
    key: "tickets.closed-dm",
    feature: "tickets",
    name: "Ticket closed direct message",
    description: "Sent to the member who opened a ticket when it is closed.",
    placeholders: [USER, USERNAME, SERVER, { name: "number", description: "The ticket number." }, { name: "reason", description: "Why the ticket was closed, when a reason was given." }, { name: "subject", description: "What the ticket was about." }],
    directMessage: true,
  },
  {
    key: "tickets.opened",
    feature: "tickets",
    name: "Ticket opened",
    description: "The first message in a new ticket channel.",
    placeholders: [USER, USERNAME, SERVER, { name: "number", description: "The ticket number." }, { name: "reason", description: "The ticket reason (category) the member picked." }, { name: "reasonNumber", description: "The ticket's number within that reason." }, { name: "subject", description: "What the member wrote when opening the ticket." }],
  },
  {
    key: "verification.welcome",
    feature: "verification",
    name: "Verified welcome",
    description: "Posted in the welcome channel after a member verifies.",
    placeholders: [USER, USERNAME, SERVER],
  },
];

