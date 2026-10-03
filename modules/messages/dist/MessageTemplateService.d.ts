import { type MessageKeyDefinition, type MessageTemplates, type OutgoingMessage, type TemplateValues } from "@qbox/shared/messages";
import type { LookProvider, MessageCatalogEntry, MessageDraftInput, MessagesGateway, MessagesLook, MessagesLookInput, MessagesRepository } from "./types.js";
export interface MessageTemplateServiceOptions {
    readonly gateway?: MessagesGateway | undefined;
    readonly catalog?: readonly MessageKeyDefinition[] | undefined;
    readonly now?: (() => Date) | undefined;
}
/**
 * Custom messages and the server-wide look. Implements the `MessageTemplates`
 * port feature services call: `apply` never throws and returns the feature's
 * default when the server has not customized the message. Looks and
 * templates are cached for a minute per server. Permission checks happen
 * before the service is called.
 */
export declare class MessageTemplateService implements MessageTemplates, LookProvider {
    private readonly repository;
    private readonly gateway;
    private readonly catalog;
    private readonly now;
    private readonly looks;
    private readonly templates;
    constructor(repository: MessagesRepository, options?: MessageTemplateServiceOptions);
    apply(guildId: string, key: string, values: TemplateValues, fallback: OutgoingMessage): Promise<OutgoingMessage>;
    look(guildId: string): Promise<MessagesLook | undefined>;
    getLook(guildId: string): Promise<MessagesLook>;
    saveLook(input: MessagesLookInput): Promise<MessagesLook>;
    definition(key: string): MessageKeyDefinition;
    /** Every catalog message with the server's override, if any. */
    list(guildId: string): Promise<readonly MessageCatalogEntry[]>;
    get(guildId: string, key: string): Promise<MessageCatalogEntry>;
    save(guildId: string, key: string, input: MessageDraftInput & {
        readonly enabled?: boolean | undefined;
    }, updatedBy?: string): Promise<MessageCatalogEntry>;
    /** Removes the server's version so the feature's default is used again. */
    reset(guildId: string, key: string): Promise<MessageCatalogEntry>;
    /** Renders a draft with sample values and the server's look, as it would be sent. */
    preview(guildId: string, key: string, draft: MessageDraftInput): Promise<OutgoingMessage>;
    /** Posts the preview of a draft (or the saved template) to a channel. */
    sendTest(guildId: string, key: string, channelId: string, draft?: MessageDraftInput): Promise<{
        readonly messageId: string;
    }>;
    private cachedTemplate;
    private entry;
}
//# sourceMappingURL=MessageTemplateService.d.ts.map