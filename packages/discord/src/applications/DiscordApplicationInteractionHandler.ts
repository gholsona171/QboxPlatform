import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type Interaction,
  type ModalMessageModalSubmitInteraction,
  type ModalSubmitInteraction,
  type RepliableInteraction,
  type StringSelectMenuInteraction,
} from "discord.js";
import { logger } from "@qbox/logger";
import {
  APPLICATION_CUSTOM_ID as ID,
  ApplicationError,
  MAX_ANSWER_LENGTH,
  questionPages,
  statusLabel,
  type ApplicationForm,
  type ApplicationQuestion,
  type ApplicationService,
  type Decision,
  type FormAvailability,
} from "@qbox/applications";

import { ApplicationElevation, applicantFromInteraction, reviewerFromInteraction } from "./applicationActor.js";

const DRAFT_TTL_MS = 30 * 60_000;

interface Draft {
  readonly answers: Record<string, string>;
  readonly expiresAt: number;
}

/**
 * Handles panel buttons, the form picker, paged application forms, and the
 * accept, deny, and vote buttons on review messages.
 *
 * Answers from earlier pages are kept in memory for 30 minutes while the
 * member continues to the next page.
 */
export class DiscordApplicationInteractionHandler {
  private readonly drafts = new Map<string, Draft>();

  public constructor(
    private readonly applications: ApplicationService,
    private readonly elevation: ApplicationElevation,
    private readonly now: () => number = Date.now,
  ) {}

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
    if (id.startsWith(ID.open)) return this.start(interaction, id.slice(ID.open.length));
    if (id.startsWith(ID.next)) {
      const [formId, page] = id.slice(ID.next.length).split(":");
      return this.continue(interaction, formId ?? "", Number(page));
    }
    const guildId = requireGuild(interaction);
    if (id.startsWith(ID.accept) || id.startsWith(ID.deny)) {
      const decision: Decision = id.startsWith(ID.accept) ? "ACCEPTED" : "DENIED";
      const applicationId = id.slice((decision === "ACCEPTED" ? ID.accept : ID.deny).length);
      const application = await this.applications.review(guildId, applicationId, await reviewerFromInteraction(interaction, this.elevation));
      if (application.status !== "PENDING") throw new ApplicationError("INVALID_STATE", `Application #${application.number} is already ${statusLabel(application.status).toLowerCase()}.`);
      await interaction.showModal(reasonModal(application.id, application.number, decision));
      return;
    }
    if (id.startsWith(ID.up) || id.startsWith(ID.down)) {
      const vote = id.startsWith(ID.up) ? "UP" : "DOWN";
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const reviewer = await reviewerFromInteraction(interaction, this.elevation);
      const updated = await this.applications.toggleVote(guildId, id.slice((vote === "UP" ? ID.up : ID.down).length), reviewer, vote);
      const mine = updated.votes.find((item) => item.userId === reviewer.userId)?.vote;
      await interaction.editReply({ content: mine ? `You voted ${mine === "UP" ? "👍" : "👎"} on application #${updated.number}.` : `Your vote on application #${updated.number} was removed.` });
    }
  }

  private async select(interaction: StringSelectMenuInteraction): Promise<void> {
    if (interaction.customId !== ID.pick) return;
    const formId = interaction.values[0];
    if (formId) await this.start(interaction, formId);
  }

  /** Checks eligibility and shows the first page of the form. */
  private async start(interaction: ButtonInteraction | StringSelectMenuInteraction, formId: string): Promise<void> {
    const guildId = requireGuild(interaction);
    const form = await this.applications.requireEligible(guildId, formId, applicantFromInteraction(interaction));
    this.drafts.set(this.draftKey(interaction, form.id), { answers: {}, expiresAt: this.now() + DRAFT_TTL_MS });
    await interaction.showModal(pageModal(form, 0));
  }

  private async continue(interaction: ButtonInteraction, formId: string, page: number): Promise<void> {
    const guildId = requireGuild(interaction);
    if (!this.draft(interaction, formId)) throw new ApplicationError("INVALID_STATE", "Your answers expired. Please start the application again.");
    const form = await this.applications.form(guildId, formId);
    if (!Number.isInteger(page) || page < 1 || page >= questionPages(form).length) throw new ApplicationError("INVALID_STATE", "This form changed. Please start the application again.");
    await interaction.showModal(pageModal(form, page));
  }

  private async modal(interaction: ModalSubmitInteraction): Promise<void> {
    const id = interaction.customId;
    if (id.startsWith(ID.reason)) return this.decide(interaction);
    if (!id.startsWith(ID.page)) return;
    const guildId = requireGuild(interaction);
    const [formId = "", pageText] = id.slice(ID.page.length).split(":");
    const page = Number(pageText);
    const form = await this.applications.form(guildId, formId);
    const pages = questionPages(form);
    const draft = this.draft(interaction, formId);
    if (!draft) throw new ApplicationError("INVALID_STATE", "Your answers expired. Please start the application again.");
    for (const question of pages[page] ?? []) draft.answers[question.id] = readAnswer(interaction, question);

    if (page + 1 < pages.length) {
      const content = `Page ${page + 1} of ${pages.length} saved. Press **Continue** for the next questions.`;
      const components = [new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`${ID.next}${form.id}:${page + 1}`).setLabel("Continue").setStyle(ButtonStyle.Primary),
      )];
      if (fromEphemeral(interaction)) await interaction.update({ content, components });
      else await interaction.reply({ content, components, flags: MessageFlags.Ephemeral });
      return;
    }

    if (fromEphemeral(interaction)) await interaction.deferUpdate();
    else await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const application = await this.applications.submit({ guildId, formId, applicant: applicantFromInteraction(interaction), answers: draft.answers });
    this.drafts.delete(this.draftKey(interaction, formId));
    await interaction.editReply({ content: `Your ${form.name} application was sent (#${application.number}). You'll get a DM when staff decide.`, components: [] });
  }

  private async decide(interaction: ModalSubmitInteraction): Promise<void> {
    const guildId = requireGuild(interaction);
    const [decisionText, applicationId = ""] = interaction.customId.slice(ID.reason.length).split(":");
    const decision: Decision = decisionText === "ACCEPTED" ? "ACCEPTED" : "DENIED";
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const reason = interaction.fields.getTextInputValue("reason");
    const updated = await this.applications.decide(guildId, applicationId, await reviewerFromInteraction(interaction, this.elevation), decision, reason || undefined);
    await interaction.editReply({
      content: `Application #${updated.number} ${statusLabel(updated.status).toLowerCase()}.${updated.dmDelivered === false ? " Their DMs are closed, so they were not notified." : ""}`,
    });
  }

  private draftKey(interaction: Interaction, formId: string): string {
    return `${interaction.guildId}:${interaction.user.id}:${formId}`;
  }

  private draft(interaction: Interaction, formId: string): Draft | undefined {
    const now = this.now();
    for (const [key, draft] of this.drafts) if (draft.expiresAt <= now) this.drafts.delete(key);
    return this.drafts.get(this.draftKey(interaction, formId));
  }

  private async fail(interaction: Interaction, error: unknown): Promise<void> {
    const message = error instanceof ApplicationError ? error.message : "Something went wrong with that application action. Please try again.";
    if (!(error instanceof ApplicationError))
      logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, interactionId: interaction.id }, "Discord application interaction failed.");
    if (!interaction.isRepliable()) return;
    await respond(interaction, message).catch(() => undefined);
  }
}

/** Ephemeral picker listing the forms a member can apply to. */
export function formPicker(available: readonly FormAvailability[]): { content: string; components: ActionRowBuilder<StringSelectMenuBuilder>[] } {
  const open = available.filter((item) => item.canApply);
  const closed = available.filter((item) => !item.canApply);
  const notes = closed.map((item) => `- ${item.reason ?? `You can't apply for ${item.form.name} right now.`}`);
  if (open.length === 0) return { content: ["There are no applications you can send right now.", ...notes].join("\n"), components: [] };
  return {
    content: ["Choose what you want to apply for.", ...notes].join("\n"),
    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(ID.pick)
        .setPlaceholder("Choose a form")
        .addOptions(open.slice(0, 25).map(({ form }) => ({
          label: form.name.slice(0, 100),
          value: form.id,
          ...(form.description ? { description: form.description.slice(0, 100) } : {}),
        }))),
    )],
  };
}

function pageModal(form: ApplicationForm, page: number): ModalBuilder {
  const pages = questionPages(form);
  const title = pages.length > 1 ? `${form.name.slice(0, 32)} (${page + 1}/${pages.length})` : form.name.slice(0, 45);
  return new ModalBuilder()
    .setCustomId(`${ID.page}${form.id}:${page}`)
    .setTitle(title)
    .addLabelComponents(...(pages[page] ?? []).map(questionLabel));
}

function questionLabel(question: ApplicationQuestion): LabelBuilder {
  const label = new LabelBuilder().setLabel(question.label);
  if (question.description) label.setDescription(question.description);
  if (question.type === "YES_NO" || question.type === "CHOICE") {
    const choices = question.type === "YES_NO" ? ["Yes", "No"] : question.choices;
    return label.setStringSelectMenuComponent(
      new StringSelectMenuBuilder()
        .setCustomId(question.id)
        .setRequired(question.required)
        .setMinValues(question.required ? 1 : 0)
        .setMaxValues(1)
        .addOptions(choices.map((choice) => ({ label: choice.slice(0, 100), value: choice.slice(0, 100) }))),
    );
  }
  const input = new TextInputBuilder()
    .setCustomId(question.id)
    .setStyle(question.type === "PARAGRAPH" ? TextInputStyle.Paragraph : TextInputStyle.Short)
    .setRequired(question.required)
    .setMaxLength(question.maxLength ?? MAX_ANSWER_LENGTH);
  if (question.minLength) input.setMinLength(question.minLength);
  return label.setTextInputComponent(input);
}

function reasonModal(applicationId: string, number: number, decision: Decision): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(`${ID.reason}${decision}:${applicationId}`)
    .setTitle(`${decision === "ACCEPTED" ? "Accept" : "Deny"} application #${number}`)
    .addLabelComponents(
      new LabelBuilder()
        .setLabel("Reason")
        .setDescription(decision === "ACCEPTED" ? "Optional. Sent to the member." : "Sent to the member.")
        .setTextInputComponent(new TextInputBuilder().setCustomId("reason").setStyle(TextInputStyle.Paragraph).setRequired(decision === "DENIED").setMaxLength(1000)),
    );
}

function readAnswer(interaction: ModalSubmitInteraction, question: ApplicationQuestion): string {
  try {
    if (question.type === "YES_NO" || question.type === "CHOICE") return interaction.fields.getStringSelectValues(question.id)[0] ?? "";
    return interaction.fields.getTextInputValue(question.id);
  } catch {
    return "";
  }
}

/** True when the form was opened from Qbox's own ephemeral message, which can be edited in place. */
function fromEphemeral(interaction: ModalSubmitInteraction): interaction is ModalMessageModalSubmitInteraction {
  return interaction.isFromMessage() && interaction.message.flags.has(MessageFlags.Ephemeral);
}

function requireGuild(interaction: Interaction): string {
  if (!interaction.guildId) throw new ApplicationError("INVALID_STATE", "Applications only work inside a server.");
  return interaction.guildId;
}

async function respond(interaction: RepliableInteraction, content: string): Promise<void> {
  if (interaction.deferred || interaction.replied) await interaction.editReply({ content, components: [] });
  else await interaction.reply({ content, flags: MessageFlags.Ephemeral });
}
