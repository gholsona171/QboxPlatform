import { type KnowledgeService } from "@qbox/knowledge-base";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/ask` - answer a question from the knowledge base, with AI when configured. */
export declare class AskCommand implements DiscordCommand {
    private readonly knowledge?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandOptionsOnlyBuilder;
    constructor(knowledge?: KnowledgeService | undefined);
    execute(context: CommandExecutionContext): Promise<void>;
}
export declare const command: AskCommand;
//# sourceMappingURL=Ask.command.d.ts.map