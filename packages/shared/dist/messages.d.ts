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
    readonly footer?: {
        readonly text: string;
        readonly icon_url?: string | undefined;
    } | undefined;
    readonly image?: {
        readonly url: string;
    } | undefined;
    readonly thumbnail?: {
        readonly url: string;
    } | undefined;
    readonly author?: {
        readonly name: string;
        readonly url?: string | undefined;
        readonly icon_url?: string | undefined;
    } | undefined;
    readonly fields?: readonly {
        readonly name: string;
        readonly value: string;
        readonly inline?: boolean | undefined;
    }[] | undefined;
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
export declare const passthroughTemplates: MessageTemplates;
/** Replaces `{name}` tokens. Unknown tokens are left as written. */
export declare function renderPlaceholders(text: string, values: TemplateValues): string;
/** Renders every text field of a message template with the given values. */
export declare function renderMessage(template: OutgoingMessage, values: TemplateValues): OutgoingMessage;
export declare const MESSAGE_CATALOG: readonly MessageKeyDefinition[];
//# sourceMappingURL=messages.d.ts.map