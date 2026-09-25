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
const GAMES_PLACEHOLDERS: readonly MessagePlaceholder[] = [
  { name: "name", description: "Name the game server reports (falls back to the name you gave it)" },
  { name: "server", description: "Name you gave the server in the portal" },
  { name: "game", description: "Game label, for example Minecraft or Rust" },
  { name: "address", description: "Server address (host:port)" },
  { name: "players", description: "Players online" },
  { name: "maxPlayers", description: "Player slots" },
  { name: "map", description: "Current map, when the game reports one" },
  { name: "version", description: "Server version, when the game reports one" },
  { name: "latency", description: "Query latency in milliseconds" },
  { name: "playerList", description: "Player names, one per line (up to 20)" },
  { name: "connectUrl", description: "Connect link, when set" },
  { name: "downFor", description: "How long the server was down (back-online message only)" },
];

export const MESSAGE_CATALOG: readonly MessageKeyDefinition[] = [
  { key: "games.down", feature: "games", name: "Game server down", description: "Posted in the alert channel after three failed checks in a row.", placeholders: GAMES_PLACEHOLDERS },
  { key: "games.status", feature: "games", name: "Game server status", description: "The auto-updating status message in the status channel.", placeholders: GAMES_PLACEHOLDERS },
  { key: "games.up", feature: "games", name: "Game server back online", description: "Posted in the alert channel when a server answers again after being down.", placeholders: GAMES_PLACEHOLDERS },
];

