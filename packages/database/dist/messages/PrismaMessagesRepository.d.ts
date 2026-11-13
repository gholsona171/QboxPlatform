import { type MessagesLook, type MessagesLookInput, type MessagesRepository, type MessagesTemplate, type MessagesTemplateInput } from "@qbox/messages";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "messagesLook" | "messagesTemplate">;
/** PostgreSQL looks and message templates. `guildId` is the Discord guild ID. */
export declare class PrismaMessagesRepository implements MessagesRepository {
    private readonly client;
    constructor(client: Client);
    getLook(guildId: string): Promise<MessagesLook | undefined>;
    saveLook(input: MessagesLookInput): Promise<MessagesLook>;
    listTemplates(guildId: string): Promise<readonly MessagesTemplate[]>;
    getTemplate(guildId: string, key: string): Promise<MessagesTemplate | undefined>;
    saveTemplate(input: MessagesTemplateInput): Promise<MessagesTemplate>;
    deleteTemplate(guildId: string, key: string): Promise<boolean>;
}
export {};
//# sourceMappingURL=PrismaMessagesRepository.d.ts.map