import { ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ApplicationError, statusLabel, type Application, type ApplicationService, type ApplicationStatus } from "@qbox/applications";
import type { PermissionAuthorizer } from "@qbox/permissions";

import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
import { ApplicationElevation, reviewerFromInteraction } from "../applications/applicationActor.js";
import { memberHasPermission } from "../features/featureAuthorization.js";

const STATUS_CHOICES = [
  { name: "Pending", value: "PENDING" },
  { name: "Accepted", value: "ACCEPTED" },
  { name: "Denied", value: "DENIED" },
  { name: "Withdrawn", value: "WITHDRAWN" },
] as const;

const COLORS: Readonly<Record<ApplicationStatus, number>> = { PENDING: 0x5865f2, ACCEPTED: 0x57f287, DENIED: 0xed4245, WITHDRAWN: 0x99aab5 };

/**
 * `/applications` - staff review. Reviewers need `applications.review` or a
 * form's reviewer role; posting a panel needs `applications.manage`.
 */
export class ApplicationsCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;
  public readonly policy: CommandExecutionPolicy = {
    contexts: "guild",
    response: { acknowledgement: "deferred", visibility: "ephemeral" },
    concurrency: "user",
  };
  public readonly data = new SlashCommandBuilder()
    .setName("applications")
    .setDescription("Review applications.")
    .addSubcommand((sub) => sub.setName("list").setDescription("List recent applications.")
      .addStringOption((option) => option.setName("status").setDescription("Only this status (default: pending).").addChoices(...STATUS_CHOICES))
      .addUserOption((option) => option.setName("member").setDescription("Only this member's applications.")))
    .addSubcommand((sub) => sub.setName("view").setDescription("Show one application with its answers.")
      .addIntegerOption((option) => option.setName("number").setDescription("Application number.").setRequired(true).setMinValue(1)))
    .addSubcommand((sub) => sub.setName("accept").setDescription("Accept an application (gives roles and DMs the member).")
      .addIntegerOption((option) => option.setName("number").setDescription("Application number.").setRequired(true).setMinValue(1))
      .addStringOption((option) => option.setName("reason").setDescription("Reason sent to the member.").setMaxLength(1000)))
    .addSubcommand((sub) => sub.setName("deny").setDescription("Deny an application (DMs the member).")
      .addIntegerOption((option) => option.setName("number").setDescription("Application number.").setRequired(true).setMinValue(1))
      .addStringOption((option) => option.setName("reason").setDescription("Reason sent to the member.").setRequired(true).setMaxLength(1000)))
    .addSubcommand((sub) => sub.setName("panel").setDescription("Post or update the application panel in a channel.")
      .addChannelOption((option) => option.setName("channel").setDescription("Channel for the panel.").setRequired(true).addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
      .addStringOption((option) => option.setName("title").setDescription("Panel title.").setMaxLength(256))
      .addStringOption((option) => option.setName("text").setDescription("Panel text.").setMaxLength(2000)));

  public constructor(
    private readonly applications?: ApplicationService,
    private readonly elevation?: ApplicationElevation,
    private readonly authorizer?: PermissionAuthorizer,
  ) {}

  public bypassAuthorization(): boolean {
    return true;
  }

  public async execute(context: CommandExecutionContext): Promise<void> {
    try {
      await this.run(context);
    } catch (error) {
      if (!(error instanceof ApplicationError)) throw error;
      await context.editReply({ content: error.message });
    }
  }

  private async run(context: CommandExecutionContext): Promise<void> {
    const applications = this.applications;
    const interaction = context.interaction;
    const guildId = interaction.guildId;
    if (!applications || !this.elevation || !this.authorizer || !guildId) throw new ApplicationError("DEPENDENCY_UNAVAILABLE", "Applications are not available right now.");
    const route = context.route.requiredSubcommand();
    const options = context.options;

    if (route === "panel") {
      if (!(await memberHasPermission(this.authorizer, interaction, "applications.manage"))) {
        await context.editReply({ content: "You need the `applications.manage` permission to do that." });
        return;
      }
      const channel = options.requiredChannel("channel");
      const panel = await applications.postPanel(guildId, channel.id, options.optionalString("title"), options.optionalString("text"));
      await context.editReply({ content: `Application panel posted in <#${panel.channelId}>. Change its forms and text in the portal.` });
      return;
    }

    const reviewer = await reviewerFromInteraction(interaction, this.elevation);
    switch (route) {
      case "list": {
        const status = (options.optionalString("status") ?? "PENDING") as ApplicationStatus;
        const member = options.optionalUser("member");
        const items = await applications.list({ guildId, statuses: [status], ...(member ? { applicantId: member.id } : {}), limit: 20 }, reviewer);
        const lines = items.map((item) => `\`#${item.number}\` ${item.formName} - <@${item.applicantId}> <t:${Math.floor(item.createdAt.getTime() / 1000)}:R>${votes(item)}`);
        await context.editReply({ content: lines.length ? `**${statusLabel(status)} applications**\n${lines.join("\n")}` : `No ${statusLabel(status).toLowerCase()} applications.` });
        return;
      }
      case "view": {
        const found = await applications.applicationByNumber(guildId, options.requiredInteger("number"));
        await context.editReply({ embeds: [applicationEmbed(await applications.review(guildId, found.id, reviewer))] });
        return;
      }
      default: {
        const found = await applications.applicationByNumber(guildId, options.requiredInteger("number"));
        const updated = await applications.decide(guildId, found.id, reviewer, route === "accept" ? "ACCEPTED" : "DENIED", options.optionalString("reason"));
        await context.editReply({
          content: `Application #${updated.number} ${statusLabel(updated.status).toLowerCase()}.${updated.dmDelivered === false ? " Their DMs are closed, so they were not notified." : ""}`,
        });
      }
    }
  }
}

function votes(item: Application): string {
  if (item.votes.length === 0) return "";
  const up = item.votes.filter((vote) => vote.vote === "UP").length;
  return ` (👍 ${up} · 👎 ${item.votes.length - up})`;
}

function applicationEmbed(item: Application): EmbedBuilder {
  const budget = Math.min(1024, Math.max(100, Math.floor(4000 / Math.max(item.answers.length, 1))));
  return new EmbedBuilder()
    .setTitle(`Application #${item.number} · ${item.formName}`.slice(0, 256))
    .setColor(COLORS[item.status])
    .setDescription([
      `**Applicant:** <@${item.applicantId}> (${item.applicantName})`,
      `**Status:** ${statusLabel(item.status)}${item.decidedById ? ` by <@${item.decidedById}>` : ""}`,
      ...(item.decisionReason ? [`**Reason:** ${item.decisionReason}`] : []),
      `**Sent:** <t:${Math.floor(item.createdAt.getTime() / 1000)}:f>${votes(item)}`,
      ...(item.notes.length ? [`**Staff notes:** ${item.notes.length} (see the portal)`] : []),
    ].join("\n"))
    .addFields(item.answers.slice(0, 25).map((answer) => ({
      name: answer.question.slice(0, 256),
      value: (answer.answer.length > budget ? `${answer.answer.slice(0, budget - 1)}…` : answer.answer) || "—",
    })));
}

export const command = new ApplicationsCommand();
