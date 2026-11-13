import type { MessageKeyDefinition, OutgoingEmbed, OutgoingMessage } from "@qbox/shared/messages";
export type { OutgoingEmbed, OutgoingMessage } from "@qbox/shared/messages";
/** "fill" sets only what an embed leaves empty; "override" always replaces color, footer, and author. */
export type MessagesLookMode = "fill" | "override";
/** The server-wide look applied to every embed the bot sends. */
export interface MessagesLook {
    readonly guildId: string;
    readonly enabled: boolean;
    /** `#RRGGBB`. */
    readonly accentColor?: string | undefined;
    /** Supports {server} and {brand}. */
    readonly footerText?: string | undefined;
    readonly footerIconUrl?: string | undefined;
    /** Supports {server} and {brand}. */
    readonly authorName?: string | undefined;
    readonly authorIconUrl?: string | undefined;
    readonly thumbnailUrl?: string | undefined;
    readonly showTimestamp: boolean;
    readonly mode: MessagesLookMode;
    readonly revision: number;
}
export interface MessagesLookInput extends Omit<MessagesLook, "revision"> {
    readonly expectedRevision?: number | undefined;
}
/** A server's custom version of one message key. */
export interface MessagesTemplate {
    readonly guildId: string;
    readonly key: string;
    readonly enabled: boolean;
    readonly content?: string | undefined;
    readonly embeds: readonly OutgoingEmbed[];
    readonly updatedAt: Date;
    /** Discord user ID of who last saved it. */
    readonly updatedBy?: string | undefined;
}
export interface MessagesTemplateInput {
    readonly guildId: string;
    readonly key: string;
    readonly enabled: boolean;
    readonly content?: string | undefined;
    readonly embeds: readonly OutgoingEmbed[];
    readonly updatedBy?: string | undefined;
}
/** What the portal edits: the same shape as Discord message JSON. */
export interface MessageTemplateDraft {
    readonly content?: string | undefined;
    readonly embeds?: readonly OutgoingEmbed[] | undefined;
}
/** A draft as it arrives from the portal or pasted JSON, before validation. */
export interface MessageDraftInput {
    readonly content?: string | undefined;
    readonly embeds?: readonly unknown[] | undefined;
}
/** A catalog entry joined with the server's override, as the portal lists it. */
export interface MessageCatalogEntry extends MessageKeyDefinition {
    readonly customized: boolean;
    readonly enabled: boolean;
    readonly template?: MessageTemplateDraft | undefined;
    readonly updatedAt?: Date | undefined;
    readonly updatedBy?: string | undefined;
    /** Sample value per placeholder, for previews. */
    readonly samples: Readonly<Record<string, string>>;
}
export interface MessagesRepository {
    getLook(guildId: string): Promise<MessagesLook | undefined>;
    saveLook(input: MessagesLookInput): Promise<MessagesLook>;
    listTemplates(guildId: string): Promise<readonly MessagesTemplate[]>;
    getTemplate(guildId: string, key: string): Promise<MessagesTemplate | undefined>;
    saveTemplate(input: MessagesTemplateInput): Promise<MessagesTemplate>;
    /** Returns whether a template existed. */
    deleteTemplate(guildId: string, key: string): Promise<boolean>;
}
/** Discord operations the messages feature needs. */
export interface MessagesGateway {
    postMessage(channelId: string, message: OutgoingMessage): Promise<{
        readonly messageId: string;
    }>;
    guildName(guildId: string): Promise<string | undefined>;
}
/** Where the REST decorator reads a server's look from. Must never throw. */
export interface LookProvider {
    look(guildId: string): Promise<MessagesLook | undefined>;
}
//# sourceMappingURL=types.d.ts.map