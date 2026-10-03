import { type KnowledgeService } from "@qbox/knowledge-base";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/faq` - show a knowledge base article. Anyone can use it. */
export declare class FaqCommand implements DiscordCommand {
    private readonly knowledge?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandOptionsOnlyBuilder;
    constructor(knowledge?: KnowledgeService | undefined);
    execute(context: CommandExecutionContext): Promise<void>;
}
export declare const command: FaqCommand;
//# sourceMappingURL=Faq.command.d.ts.map