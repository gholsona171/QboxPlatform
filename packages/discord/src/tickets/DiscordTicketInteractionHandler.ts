import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type Interaction,
  type ModalSubmitInteraction,
  type RepliableInteraction,
  type StringSelectMenuInteraction,
} from "discord.js";
import { logger } from "@qbox/logger";
import { TICKET_CUSTOM_ID, TicketError, type TicketCategory, type TicketService } from "@qbox/tickets";

import { TicketElevation, ticketActorFromInteraction } from "./ticketActor.js";

const PREFIX = "qbox:ticket:";
/** Custom ID prefixes this handler owns. */
export const TICKET_INTERACTION_PREFIXES = [PREFIX, TICKET_CUSTOM_ID.staffChat] as const;

/** Handles ticket panel buttons, select menus, forms, and in-ticket controls. */
export class DiscordTicketInteractionHandler {
  public constructor(
    private readonly tickets: TicketService,
    private readonly elevation: TicketElevation,
  ) {}

  public static handles(interaction: Interaction): boolean {
    if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit())
      return TICKET_INTERACTION_PREFIXES.some((prefix) => interaction.customId.startsWith(prefix));
    return false;
  }

  public async handle(interaction: Interaction): Promise<void> {
    try {
      if (interaction.isButton()) await this.button(interaction);
      else if (interaction.isStringSelectMenu()) await this.select(interaction);
      else if (interaction.isModalSubmit()) await this.modal(interaction);
    } catch (error) {
      await this.fail(interaction, error);
    }
  }

  private async button(interaction: ButtonInteraction): Promise<void> {
    const id = interaction.customId;
    if (id.startsWith(TICKET_CUSTOM_ID.open)) return this.startOpen(interaction, id.slice(TICKET_CUSTOM_ID.open.length));
    if (id.startsWith(TICKET_CUSTOM_ID.rate)) return this.rate(interaction);
    if (id.startsWith(TICKET_CUSTOM_ID.closeConfirm)) return this.closeNow(interaction, id.slice(TICKET_CUSTOM_ID.closeConfirm.length));
    if (id.startsWith(TICKET_CUSTOM_ID.close)) return this.requestClose(interaction, id.slice(TICKET_CUSTOM_ID.close.length));
    const guildId = requireGuild(interaction);
    const actor = await ticketActorFromInteraction(interaction, this.elevation);
    if (id.startsWith(TICKET_CUSTOM_ID.staffChat)) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const chat = await this.tickets.openStaffChat(guildId, id.slice(TICKET_CUSTOM_ID.staffChat.length), actor);
      await interaction.editReply({ content: `You're in the staff chat: <#${chat.threadId}> (${chat.url})` });
      return;
    }
    if (id.startsWith(TICKET_CUSTOM_ID.claim)) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      await this.tickets.claim(guildId, id.slice(TICKET_CUSTOM_ID.claim.length), actor);
      await interaction.editReply({ content: "You claimed this ticket." });
      return;
    }
    if (id.startsWith(TICKET_CUSTOM_ID.reopen)) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      await this.tickets.reopen(guildId, id.slice(TICKET_CUSTOM_ID.reopen.length), actor);
      await interaction.editReply({ content: "Ticket reopened." });
      return;
    }
    if (id.startsWith(TICKET_CUSTOM_ID.delete)) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      await this.tickets.deleteChannel(guildId, id.slice(TICKET_CUSTOM_ID.delete.length), actor);
      await interaction.editReply({ content: "This channel will be deleted in a few seconds." });
      return;
    }
    if (id.startsWith(TICKET_CUSTOM_ID.transcript)) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const file = await this.tickets.transcriptFor(guildId, id.slice(TICKET_CUSTOM_ID.transcript.length), actor);
      await interaction.editReply({ files: [new AttachmentBuilder(Buffer.from(file.content, "utf8"), { name: file.fileName })] });
    }
  }

  private async select(interaction: StringSelectMenuInteraction): Promise<void> {
    if (interaction.customId !== TICKET_CUSTOM_ID.select) return;
    const categoryId = interaction.values[0];
    if (!categoryId) return;
    await this.startOpen(interaction, categoryId);
  }

  private async startOpen(interaction: ButtonInteraction | StringSelectMenuInteraction, categoryId: string): Promise<void> {
    const guildId = requireGuild(interaction);
    const category = (await this.tickets.categories(guildId)).find((item) => item.id === categoryId && item.enabled);
    if (!category) throw new TicketError("NOT_FOUND", "That ticket type is no longer available.");
    if (category.questions.length > 0) {
      await interaction.showModal(ticketForm(category));
      return;
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const ticket = await this.tickets.openTicket({ guildId, actor: await ticketActorFromInteraction(interaction, this.elevation), categoryId });
    await interaction.editReply({ content: `Your ticket is ready: <#${ticket.channelId}>` });
  }

  private async requestClose(interaction: ButtonInteraction, ticketId: string): Promise<void> {
    const guildId = requireGuild(interaction);
    const actor = await ticketActorFromInteraction(interaction, this.elevation);
    const ticket = await this.tickets.ticket(guildId, ticketId);
    if (ticket.status === "CLOSED") throw new TicketError("INVALID_STATE", "This ticket is already closed.");
    if (!(await this.tickets.canClose(ticket, actor))) throw new TicketError("FORBIDDEN", "You are not allowed to close this ticket.");
    const settings = await this.tickets.settings(guildId);
    if (settings.requireCloseReason) {
      await interaction.showModal(
        new ModalBuilder()
          .setCustomId(`${TICKET_CUSTOM_ID.closeReason}${ticketId}`)
          .setTitle(`Close ticket #${ticket.number}`)
          .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder().setCustomId("reason").setLabel("Reason").setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500),
            ),
          ),
      );
      return;
    }
    if (settings.closeConfirmation) {
      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: `Close ticket #${ticket.number}?`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`${TICKET_CUSTOM_ID.closeConfirm}${ticketId}`).setLabel("Close ticket").setStyle(ButtonStyle.Danger),
          ),
        ],
      });
      return;
    }
    await this.closeNow(interaction, ticketId);
  }

  private async closeNow(interaction: ButtonInteraction, ticketId: string, reason?: string): Promise<void> {
    const guildId = requireGuild(interaction);
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await this.tickets.close(guildId, ticketId, await ticketActorFromInteraction(interaction, this.elevation), reason);
    await interaction.editReply({ content: "Ticket closed." });
  }

  private async modal(interaction: ModalSubmitInteraction): Promise<void> {
    const id = interaction.customId;
    const guildId = requireGuild(interaction);
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const actor = await ticketActorFromInteraction(interaction, this.elevation);
    if (id.startsWith(TICKET_CUSTOM_ID.closeReason)) {
      await this.tickets.close(guildId, id.slice(TICKET_CUSTOM_ID.closeReason.length), actor, interaction.fields.getTextInputValue("reason"));
      await interaction.editReply({ content: "Ticket closed." });
      return;
    }
    if (id.startsWith(TICKET_CUSTOM_ID.form)) {
      const categoryId = id.slice(TICKET_CUSTOM_ID.form.length);
      const category = (await this.tickets.categories(guildId)).find((item) => item.id === categoryId);
      if (!category) throw new TicketError("NOT_FOUND", "That ticket type is no longer available.");
      const answers: Record<string, string> = {};
      for (const question of category.questions) {
        try {
          answers[question.id] = interaction.fields.getTextInputValue(question.id);
        } catch {
          answers[question.id] = "";
        }
      }
      const ticket = await this.tickets.openTicket({ guildId, actor, categoryId, answers });
      await interaction.editReply({ content: `Your ticket is ready: <#${ticket.channelId}>` });
    }
  }

  private async rate(interaction: ButtonInteraction): Promise<void> {
    const [ticketId, stars] = interaction.customId.slice(TICKET_CUSTOM_ID.rate.length).split(":");
    const rating = Number(stars);
    if (!ticketId) return;
    await this.tickets.rate(ticketId, interaction.user.id, rating);
    await interaction.update({ content: `Thanks for your feedback! You rated this ticket ${"⭐".repeat(rating)} (${rating}/5).`, components: [] });
  }

  private async fail(interaction: Interaction, error: unknown): Promise<void> {
    const message = error instanceof TicketError ? error.message : "Something went wrong with that ticket action. Please try again.";
    if (!(error instanceof TicketError))
      logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, interactionId: interaction.id }, "Discord ticket interaction failed.");
    if (!interaction.isRepliable()) return;
    await respond(interaction, message).catch(() => undefined);
  }
}

function ticketForm(category: TicketCategory): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(`${TICKET_CUSTOM_ID.form}${category.id}`)
    .setTitle(category.name.slice(0, 45))
    .addComponents(
      ...category.questions.map((question) => {
        const input = new TextInputBuilder()
          .setCustomId(question.id)
          .setLabel(question.label)
          .setStyle(question.style === "PARAGRAPH" ? TextInputStyle.Paragraph : TextInputStyle.Short)
          .setRequired(question.required)
          .setMaxLength(question.maxLength ?? 4000);
        if (question.minLength) input.setMinLength(question.minLength);
        if (question.placeholder) input.setPlaceholder(question.placeholder);
        return new ActionRowBuilder<TextInputBuilder>().addComponents(input);
      }),
    );
}

function requireGuild(interaction: Interaction): string {
  if (!interaction.guildId) throw new TicketError("INVALID_STATE", "Ticket actions only work inside a server.");
  return interaction.guildId;
}

async function respond(interaction: RepliableInteraction, content: string): Promise<void> {
  if (interaction.deferred || interaction.replied) await interaction.editReply({ content, components: [] });
  else await interaction.reply({ content, flags: MessageFlags.Ephemeral });
}
