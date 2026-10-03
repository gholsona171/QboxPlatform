import { Events } from "discord.js";
import { DiscordRestKnowledgeGateway, KnowledgeService, OpenAiKnowledgeAnswerer } from "@qbox/knowledge-base";
import { logger } from "@qbox/logger";
import { AskCommand } from "../commands/Ask.command.js";
import { FaqCommand } from "../commands/Faq.command.js";
import { KbCommand } from "../commands/Kb.command.js";
/**
 * Knowledge base: `/faq`, `/kb`, `/ask`, title autocomplete, and automatic
 * answers in chosen channels (needs the Message Content intent).
 */
export function knowledgeFeature(repository, options = {}) {
    return ({ client, authorizer }) => {
        const answerer = options.openAiApiKey ? new OpenAiKnowledgeAnswerer(options.openAiApiKey, options.openAiModel || undefined) : undefined;
        const knowledge = new KnowledgeService(repository, new DiscordRestKnowledgeGateway(client.rest), answerer);
        const events = new KnowledgeEvents(knowledge);
        return {
            name: "knowledge-base",
            commands: () => [new FaqCommand(knowledge), new KbCommand(knowledge, authorizer), new AskCommand(knowledge)],
            attach: (target) => events.attach(target),
            detach: () => events.detach(),
        };
    };
}
class KnowledgeEvents {
    knowledge;
    client;
    onMessage = (message) => void this.safe("auto-answer", () => this.autoAnswer(message));
    onInteraction = (interaction) => {
        if (interaction.isAutocomplete() && (interaction.commandName === "faq" || interaction.commandName === "kb"))
            void this.safe("autocomplete", () => this.autocomplete(interaction));
    };
    constructor(knowledge) {
        this.knowledge = knowledge;
    }
    attach(client) {
        this.client = client;
        client.on(Events.MessageCreate, this.onMessage);
        client.on(Events.InteractionCreate, this.onInteraction);
    }
    detach() {
        this.client?.off(Events.MessageCreate, this.onMessage);
        this.client?.off(Events.InteractionCreate, this.onInteraction);
        this.client = undefined;
    }
    async autoAnswer(message) {
        if (!message.inGuild() || message.author.bot || message.system || !message.content)
            return;
        await this.knowledge.handleMessage({ guildId: message.guildId, channelId: message.channelId, messageId: message.id, content: message.content });
    }
    /** Suggests article titles; the value is the article ID. */
    async autocomplete(interaction) {
        if (!interaction.guildId)
            return interaction.respond([]);
        const articles = await this.knowledge.suggest(interaction.guildId, String(interaction.options.getFocused()));
        await interaction.respond(articles.slice(0, 25).map((article) => ({ name: article.title.slice(0, 100), value: article.id })));
    }
    async safe(operation, action) {
        try {
            await action();
        }
        catch (error) {
            logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, operation }, "Discord knowledge base event failed.");
        }
    }
}
//# sourceMappingURL=KnowledgeFeature.js.map