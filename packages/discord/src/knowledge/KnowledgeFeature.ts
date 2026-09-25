import { Events, type AutocompleteInteraction, type Client, type Interaction, type Message } from "discord.js";
import { DiscordRestKnowledgeGateway, KnowledgeService, OpenAiKnowledgeAnswerer, type KnowledgeRepository } from "@qbox/knowledge-base";
import { logger } from "@qbox/logger";

import { AskCommand } from "../commands/Ask.command.js";
import { FaqCommand } from "../commands/Faq.command.js";
import { KbCommand } from "../commands/Kb.command.js";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";

export interface KnowledgeFeatureOptions {
  /** Enables AI answers for `/ask` through the OpenAI chat completions API. */
  readonly openAiApiKey?: string | undefined;
  readonly openAiModel?: string | undefined;
}

/**
 * Knowledge base: `/faq`, `/kb`, `/ask`, title autocomplete, and automatic
 * answers in chosen channels (needs the Message Content intent).
 */
export function knowledgeFeature(repository: KnowledgeRepository, options: KnowledgeFeatureOptions = {}): DiscordFeatureFactory {
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
  private client: Client | undefined;
  private readonly onMessage = (message: Message): void => void this.safe("auto-answer", () => this.autoAnswer(message));
  private readonly onInteraction = (interaction: Interaction): void => {
    if (interaction.isAutocomplete() && (interaction.commandName === "faq" || interaction.commandName === "kb")) void this.safe("autocomplete", () => this.autocomplete(interaction));
  };

  public constructor(private readonly knowledge: KnowledgeService) {}

  public attach(client: Client): void {
    this.client = client;
    client.on(Events.MessageCreate, this.onMessage);
    client.on(Events.InteractionCreate, this.onInteraction);
  }

  public detach(): void {
    this.client?.off(Events.MessageCreate, this.onMessage);
    this.client?.off(Events.InteractionCreate, this.onInteraction);
    this.client = undefined;
  }

  private async autoAnswer(message: Message): Promise<void> {
    if (!message.inGuild() || message.author.bot || message.system || !message.content) return;
    await this.knowledge.handleMessage({ guildId: message.guildId, channelId: message.channelId, messageId: message.id, content: message.content });
  }

  /** Suggests article titles; the value is the article ID. */
  private async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    if (!interaction.guildId) return interaction.respond([]);
    const articles = await this.knowledge.suggest(interaction.guildId, String(interaction.options.getFocused()));
    await interaction.respond(articles.slice(0, 25).map((article) => ({ name: article.title.slice(0, 100), value: article.id })));
  }

  private async safe(operation: string, action: () => Promise<void>): Promise<void> {
    try {
      await action();
    } catch (error) {
      logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, operation }, "Discord knowledge base event failed.");
    }
  }
}
