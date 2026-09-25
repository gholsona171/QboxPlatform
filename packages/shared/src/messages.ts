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
export const MESSAGE_CATALOG: readonly MessageKeyDefinition[] = [
  {
    key: "birthdays.announcement",
    feature: "birthdays",
    name: "Birthday announcement",
    description: "Posted in the birthday channel on a member's birthday.",
    placeholders: [
      { name: "user", description: "Mention of the birthday member" },
      { name: "username", description: "Display name of the birthday member" },
      { name: "age", description: "Age they turn today, empty when hidden" },
      { name: "date", description: "The birthday date" },
      { name: "server", description: "Server name" },
    ],
  },
  {
    key: "community.goodbye",
    feature: "discord",
    name: "Goodbye message",
    description: "Posted in the goodbye channel when a member leaves.",
    placeholders: [
      { name: "user", description: "Mention of the member" },
      { name: "username", description: "Display name of the member" },
      { name: "server", description: "Server name" },
      { name: "memberCount", description: "Members in the server" },
    ],
  },
  {
    key: "community.welcome",
    feature: "discord",
    name: "Welcome message",
    description: "Posted in the welcome channel when a member joins.",
    placeholders: [
      { name: "user", description: "Mention of the new member" },
      { name: "username", description: "Display name of the new member" },
      { name: "server", description: "Server name" },
      { name: "memberCount", description: "Members in the server" },
    ],
  },
  {
    key: "giveaways.ended",
    feature: "giveaways",
    name: "Giveaway winners",
    description: "Posted when a giveaway ends or is rerolled.",
    placeholders: [
      { name: "prize", description: "The prize" },
      { name: "winners", description: "Mentions of the winners, or none" },
      { name: "host", description: "Mention of the host" },
      { name: "endsAt", description: "When the giveaway ended" },
      { name: "entries", description: "Number of entries" },
      { name: "server", description: "Server name" },
    ],
  },
  {
    key: "giveaways.started",
    feature: "giveaways",
    name: "Giveaway post",
    description: "The giveaway message with the Enter button while it runs.",
    placeholders: [
      { name: "prize", description: "The prize" },
      { name: "winners", description: "Number of winners" },
      { name: "host", description: "Mention of the host" },
      { name: "endsAt", description: "When the giveaway ends" },
      { name: "entries", description: "Entries so far" },
      { name: "server", description: "Server name" },
    ],
  },
  {
    key: "levels.level-up",
    feature: "levels",
    name: "Level-up message",
    description: "Sent when a member reaches a new level.",
    placeholders: [
      { name: "user", description: "Mention of the member" },
      { name: "username", description: "Display name of the member" },
      { name: "level", description: "The new level" },
      { name: "xp", description: "Total XP" },
      { name: "rank", description: "Place on the leaderboard" },
      { name: "server", description: "Server name" },
    ],
  },
  {
    key: "moderation.case-log",
    feature: "moderation",
    name: "Case log",
    description: "Posted in the moderation log channel for every case.",
    placeholders: [
      { name: "user", description: "Mention of the member" },
      { name: "username", description: "Display name of the member" },
      { name: "moderator", description: "Mention of the moderator" },
      { name: "caseNumber", description: "Case number" },
      { name: "action", description: "Warning, Timeout, Kick, Ban ..." },
      { name: "duration", description: "Length for timeouts and temporary bans" },
      { name: "reason", description: "The reason" },
      { name: "rule", description: "The rule that was broken, when known" },
      { name: "server", description: "Server name" },
    ],
  },
  {
    key: "moderation.warn-dm",
    feature: "moderation",
    name: "Member notice",
    description: "Direct message to the member for a warning, timeout, kick, or ban.",
    directMessage: true,
    placeholders: [
      { name: "user", description: "Mention of the member" },
      { name: "username", description: "Display name of the member" },
      { name: "moderator", description: "Mention of the moderator" },
      { name: "caseNumber", description: "Case number" },
      { name: "action", description: "Warning, Timeout, Kick, Ban ..." },
      { name: "duration", description: "Length for timeouts and temporary bans" },
      { name: "reason", description: "The reason" },
      { name: "rule", description: "The rule that was broken, when known" },
      { name: "server", description: "Server name" },
    ],
  },
  {
    key: "streams.ended",
    feature: "streams",
    name: "Stream ended",
    description: "What the live announcement becomes when the stream ends (with the \"edit\" ended behavior).",
    placeholders: [
      { name: "creator", description: "The creator's display name" },
      { name: "platform", description: "Twitch, Kick, or YouTube" },
      { name: "duration", description: "How long the stream was live, for example 2h 15m" },
      { name: "url", description: "Link to the creator's channel" },
    ],
  },
  {
    key: "streams.live",
    feature: "streams",
    name: "Creator went live",
    description: "Posted when a followed creator starts streaming.",
    placeholders: [
      { name: "creator", description: "The creator's display name" },
      { name: "platform", description: "Twitch, Kick, or YouTube" },
      { name: "title", description: "Stream title" },
      { name: "game", description: "Game or category, when known" },
      { name: "viewers", description: "Current viewer count, when known" },
      { name: "url", description: "Link to the stream" },
      { name: "thumbnail", description: "Stream preview image link, when available" },
      { name: "startedAt", description: "When the stream started" },
      { name: "server", description: "This server's name" },
      { name: "ping", description: "The role mention, or nothing when no ping role is set" },
    ],
  },
  {
    key: "streams.video",
    feature: "streams",
    name: "New video",
    description: "Posted when a followed YouTube channel uploads a video.",
    placeholders: [
      { name: "creator", description: "The channel's name" },
      { name: "title", description: "Video title" },
      { name: "url", description: "Link to the video" },
      { name: "publishedAt", description: "When the video was published" },
    ],
  },
  {
    key: "tickets.closed-dm",
    feature: "tickets",
    name: "Ticket closed notice",
    description: "Direct message to the member who opened the ticket when it closes.",
    directMessage: true,
    placeholders: [
      { name: "user", description: "Mention of the member who opened the ticket" },
      { name: "username", description: "Display name of the member" },
      { name: "number", description: "Ticket number" },
      { name: "reason", description: "Ticket reason (category)" },
      { name: "reasonNumber", description: "Ticket number within its reason" },
      { name: "closeReason", description: "Why the ticket was closed" },
      { name: "ratingPrompt", description: "The rating request when feedback is on" },
    ],
  },
  {
    key: "tickets.opened",
    feature: "tickets",
    name: "Ticket opening message",
    description: "Posted in the new ticket channel.",
    placeholders: [
      { name: "user", description: "Mention of the member who opened the ticket" },
      { name: "username", description: "Display name of the member" },
      { name: "server", description: "Server name" },
      { name: "number", description: "Ticket number" },
      { name: "reason", description: "Ticket reason (category)" },
      { name: "reasonNumber", description: "Ticket number within its reason" },
      { name: "subject", description: "Subject the member entered" },
    ],
  },
  {
    key: "verification.welcome",
    feature: "verification",
    name: "Verified welcome",
    description: "Posted in the welcome channel when a member passes verification.",
    placeholders: [
      { name: "user", description: "Mention of the member" },
      { name: "username", description: "Display name of the member" },
      { name: "server", description: "Server name" },
    ],
  },
];

