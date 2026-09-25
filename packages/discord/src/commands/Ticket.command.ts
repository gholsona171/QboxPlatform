import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import { TicketError, type Ticket, type TicketPriority, type TicketService } from "@qbox/tickets";

import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
import { TicketElevation, ticketActorFromInteraction } from "../tickets/ticketActor.js";

const PRIORITY_CHOICES = [
  { name: "Low", value: "LOW" },
  { name: "Normal", value: "NORMAL" },
  { name: "High", value: "HIGH" },
  { name: "Urgent", value: "URGENT" },
] as const;

/**
 * `/ticket` - member and support-team actions. Access is decided per action by
 * the ticket service: support roles, `tickets.handle`, or Discord admins for
 * staff actions; the opener for their own ticket where settings allow.
 */
export class TicketCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;
  public readonly policy: CommandExecutionPolicy = {
    contexts: "guild",
    response: { acknowledgement: "deferred", visibility: "ephemeral" },
    concurrency: "user",
  };
  public readonly data = new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Open and manage support tickets.")
    .addSubcommand((sub) => sub.setName("open").setDescription("Open a support ticket.")
      .addStringOption((option) => option.setName("type").setDescription("Ticket type name (leave empty for general support)."))
      .addStringOption((option) => option.setName("subject").setDescription("What do you need help with?").setMaxLength(200)))
    .addSubcommand((sub) => sub.setName("close").setDescription("Close this ticket.")
      .addStringOption((option) => option.setName("reason").setDescription("Why the ticket is being closed.").setMaxLength(500)))
    .addSubcommand((sub) => sub.setName("claim").setDescription("Claim this ticket."))
    .addSubcommand((sub) => sub.setName("unclaim").setDescription("Release your claim on this ticket."))
    .addSubcommand((sub) => sub.setName("transfer").setDescription("Hand this ticket to another staff member.")
      .addUserOption((option) => option.setName("member").setDescription("Staff member.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("add").setDescription("Add a member to this ticket.")
      .addUserOption((option) => option.setName("member").setDescription("Member to add.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("remove").setDescription("Remove a member from this ticket.")
      .addUserOption((option) => option.setName("member").setDescription("Member to remove.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("rename").setDescription("Rename this ticket channel.")
      .addStringOption((option) => option.setName("name").setDescription("New name.").setRequired(true).setMaxLength(90)))
    .addSubcommand((sub) => sub.setName("priority").setDescription("Set this ticket's priority.")
      .addStringOption((option) => option.setName("level").setDescription("Priority.").setRequired(true).addChoices(...PRIORITY_CHOICES)))
    .addSubcommand((sub) => sub.setName("waiting").setDescription("Mark this ticket as waiting on the member, or active again.")
      .addBooleanOption((option) => option.setName("waiting").setDescription("True to wait for the member, false to resume.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("tag").setDescription("Set tags on this ticket.")
      .addStringOption((option) => option.setName("tags").setDescription("Comma-separated tags, or empty to clear.")))
    .addSubcommand((sub) => sub.setName("note").setDescription("Add an internal staff note (not visible to the member).")
      .addStringOption((option) => option.setName("text").setDescription("Note.").setRequired(true).setMaxLength(1900)))
    .addSubcommand((sub) => sub.setName("reopen").setDescription("Reopen this closed ticket."))
    .addSubcommand((sub) => sub.setName("transcript").setDescription("Download this ticket's transcript."))
    .addSubcommand((sub) => sub.setName("info").setDescription("Show details about this ticket."))
    .addSubcommand((sub) => sub.setName("mine").setDescription("List your open tickets."));

  public constructor(
    private readonly tickets?: TicketService,
    private readonly elevation?: TicketElevation,
  ) {}

  public bypassAuthorization(): boolean {
    return true;
  }

  public async execute(context: CommandExecutionContext): Promise<void> {
    try {
      await this.run(context);
    } catch (error) {
      if (!(error instanceof TicketError)) throw error;
      await context.editReply({ content: error.message });
    }
  }

  private async run(context: CommandExecutionContext): Promise<void> {
    if (!this.tickets || !this.elevation) throw new TicketError("DEPENDENCY_UNAVAILABLE", "Tickets are not available right now.");
    const tickets = this.tickets;
    const guildId = context.interaction.guildId;
    if (!guildId) throw new TicketError("INVALID_STATE", "Tickets only work inside a server.");
    const actor = await ticketActorFromInteraction(context.interaction, this.elevation);
    const route = context.route.requiredSubcommand();

    if (route === "open") {
      const typeName = context.options.optionalString("type")?.trim().toLowerCase();
      const categories = await tickets.categories(guildId);
      const category = typeName ? categories.find((item) => item.enabled && item.name.toLowerCase() === typeName) : undefined;
      if (typeName && !category)
        throw new TicketError("NOT_FOUND", `Unknown ticket type. Available: ${categories.filter((item) => item.enabled).map((item) => item.name).join(", ") || "none"}.`);
      if (category?.questions.some((question) => question.required))
        throw new TicketError("INVALID_STATE", `${category.name} tickets need a short form. Use the ticket panel to open one.`);
      const subject = context.options.optionalString("subject");
      const ticket = await tickets.openTicket({ guildId, actor, ...(category ? { categoryId: category.id } : {}), ...(subject ? { subject } : {}) });
      await context.editReply({ content: `Your ticket is ready: <#${ticket.channelId}>` });
      return;
    }
    if (route === "mine") {
      const mine = await tickets.list({ guildId, openerId: actor.userId, statuses: ["OPEN", "CLAIMED", "PENDING"], limit: 10 });
      await context.editReply({ content: mine.length ? mine.map((ticket) => `#${ticket.number} ${ticket.channelId ? `<#${ticket.channelId}>` : ""} - ${ticket.status.toLowerCase()}`).join("\n") : "You have no open tickets." });
      return;
    }

    const ticket = await this.currentTicket(context);
    switch (route) {
      case "close":
        await tickets.close(guildId, ticket.id, actor, context.options.optionalString("reason"));
        await context.editReply({ content: "Ticket closed." });
        return;
      case "claim":
        await tickets.claim(guildId, ticket.id, actor);
        await context.editReply({ content: "You claimed this ticket." });
        return;
      case "unclaim":
        await tickets.unclaim(guildId, ticket.id, actor);
        await context.editReply({ content: "Claim released." });
        return;
      case "transfer": {
        const member = context.options.requiredUser("member");
        await tickets.transfer(guildId, ticket.id, actor, member.id);
        await context.editReply({ content: `Ticket transferred to <@${member.id}>.` });
        return;
      }
      case "add": {
        const member = context.options.requiredUser("member");
        await tickets.addParticipant(guildId, ticket.id, actor, member.id);
        await context.editReply({ content: `<@${member.id}> added.` });
        return;
      }
      case "remove": {
        const member = context.options.requiredUser("member");
        await tickets.removeParticipant(guildId, ticket.id, actor, member.id);
        await context.editReply({ content: `<@${member.id}> removed.` });
        return;
      }
      case "rename":
        await tickets.rename(guildId, ticket.id, actor, context.options.requiredString("name"));
        await context.editReply({ content: "Ticket renamed." });
        return;
      case "priority":
        await tickets.setPriority(guildId, ticket.id, actor, context.options.requiredString("level") as TicketPriority);
        await context.editReply({ content: "Priority updated." });
        return;
      case "waiting":
        await tickets.setPending(guildId, ticket.id, actor, context.options.requiredBoolean("waiting"));
        await context.editReply({ content: "Ticket status updated." });
        return;
      case "tag": {
        const tags = (context.options.optionalString("tags") ?? "").split(",");
        const updated = await tickets.setTags(guildId, ticket.id, actor, tags);
        await context.editReply({ content: updated.tags.length ? `Tags: ${updated.tags.join(", ")}` : "Tags cleared." });
        return;
      }
      case "note":
        await tickets.addNote(guildId, ticket.id, actor, context.options.requiredString("text"));
        await context.editReply({ content: "Internal note saved. Only the support team can see it." });
        return;
      case "reopen":
        await tickets.reopen(guildId, ticket.id, actor);
        await context.editReply({ content: "Ticket reopened." });
        return;
      case "transcript": {
        const file = await tickets.transcriptFor(guildId, ticket.id, actor);
        await context.editReply({ files: [new AttachmentBuilder(Buffer.from(file.content, "utf8"), { name: file.fileName })] });
        return;
      }
      default:
        await context.editReply({ content: ticketInfo(ticket) });
    }
  }

  private async currentTicket(context: CommandExecutionContext): Promise<Ticket> {
    const ticket = await this.tickets?.ticketForChannel(context.interaction.channelId);
    if (!ticket) throw new TicketError("NOT_FOUND", "Run this command inside a ticket channel.");
    return ticket;
  }
}

function ticketInfo(ticket: Ticket): string {
  return [
    `**Ticket #${ticket.number}**${ticket.categoryName ? ` - ${ticket.categoryName}` : ""}`,
    `Status: ${ticket.status.toLowerCase()} | Priority: ${ticket.priority.toLowerCase()}`,
    `Opened by <@${ticket.openerId}> <t:${Math.floor(ticket.createdAt.getTime() / 1000)}:R>`,
    ticket.claimedById ? `Claimed by <@${ticket.claimedById}>` : "Not claimed",
    ...(ticket.subject ? [`Subject: ${ticket.subject}`] : []),
    ...(ticket.tags.length ? [`Tags: ${ticket.tags.join(", ")}`] : []),
    ...(ticket.participantIds.length ? [`Added: ${ticket.participantIds.map((id) => `<@${id}>`).join(" ")}`] : []),
  ].join("\n");
}

export const command = new TicketCommand();
