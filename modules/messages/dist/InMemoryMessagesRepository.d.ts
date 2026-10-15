import type { MessagesLook, MessagesLookInput, MessagesRepository, MessagesTemplate, MessagesTemplateInput } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryMessagesRepository implements MessagesRepository {
    private readonly now;
    readonly looks: Map<string, MessagesLook>;
    readonly templates: Map<string, MessagesTemplate>;
    constructor(now?: () => Date);
    getLook(guildId: string): Promise<MessagesLook | undefined>;
    saveLook(input: MessagesLookInput): Promise<MessagesLook>;
    listTemplates(guildId: string): Promise<readonly MessagesTemplate[]>;
    getTemplate(guildId: string, key: string): Promise<MessagesTemplate | undefined>;
    saveTemplate(input: MessagesTemplateInput): Promise<MessagesTemplate>;
    deleteTemplate(guildId: string, key: string): Promise<boolean>;
}
//# sourceMappingURL=InMemoryMessagesRepository.d.ts.map