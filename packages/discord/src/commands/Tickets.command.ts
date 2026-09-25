import { ChannelType, SlashCommandBuilder } from "discord.js";
import {
  TicketError,
  type TicketButtonStyle,
  type TicketCloseAction,
  type TicketMode,
  type TicketPanelStyle,
  type TicketPriority,
  type TicketService,
  type TicketSettings,
  type TicketSettingsInput,
} from "@qbox/tickets";

import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";

const TEXT_CHANNELS = [ChannelType.GuildText, ChannelType.GuildAnnouncement] as const;

/** `/tickets` - ticket system administration (requires `tickets.manage`). */
export class TicketsCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;
  public readonly policy: CommandExecutionPolicy = {
    contexts: "guild",
    permissions: { required: ["tickets.manage"], mode: "all", administratorOverride: true },
    response: { acknowledgement: "deferred", visibility: "ephemeral" },
    concurrency: "guild",
  };
  public readonly data = new SlashCommandBuilder()
    .setName("tickets")
    .setDescription("Configure the ticket system.")
    .addSubcommand((sub) => sub.setName("setup").setDescription("Turn tickets on and set the main channels.")
      .addBooleanOption((option) => option.setName("enabled").setDescription("Enable tickets.").setRequired(true))
      .addStringOption((option) => option.setName("mode").setDescription("Private channels or private threads.").addChoices({ name: "Channels", value: "CHANNEL" }, { name: "Threads", value: "THREAD" }))
      .addChannelOption((option) => option.setName("category").setDescription("Discord category for new ticket channels.").addChannelTypes(ChannelType.GuildCategory))
      .addChannelOption((option) => option.setName("thread-channel").setDescription("Channel for ticket threads (thread mode).").addChannelTypes(...TEXT_CHANNELS))
      .addChannelOption((option) => option.setName("transcripts").setDescription("Channel that receives transcripts.").addChannelTypes(...TEXT_CHANNELS))
      .addChannelOption((option) => option.setName("logs").setDescription("Channel that receives ticket logs.").addChannelTypes(...TEXT_CHANNELS))
      .addRoleOption((option) => option.setName("support-role").setDescription("Add a support team role.")))
    .addSubcommand((sub) => sub.setName("config").setDescription("Change ticket behavior. Only the options you set change.")
      .addIntegerOption((option) => option.setName("max-open").setDescription("Open tickets allowed per member.").setMinValue(1).setMaxValue(25))
      .addBooleanOption((option) => option.setName("member-close").setDescription("Let members close their own tickets."))
      .addBooleanOption((option) => option.setName("require-reason").setDescription("Require a reason to close."))
      .addBooleanOption((option) => option.setName("confirm-close").setDescription("Ask for confirmation before closing."))
      .addStringOption((option) => option.setName("close-action").setDescription("What happens to closed channels.").addChoices({ name: "Keep (archive)", value: "ARCHIVE" }, { name: "Delete", value: "DELETE" }))
      .addIntegerOption((option) => option.setName("delete-delay").setDescription("Seconds before a closed channel is deleted.").setMinValue(0).setMaxValue(3600))
      .addChannelOption((option) => option.setName("closed-category").setDescription("Move closed ticket channels here.").addChannelTypes(ChannelType.GuildCategory))
      .addBooleanOption((option) => option.setName("claiming").setDescription("Allow staff to claim tickets."))
      .addBooleanOption((option) => option.setName("claim-locks").setDescription("Only the claimer can reply after a claim."))
      .addBooleanOption((option) => option.setName("ping-support").setDescription("Ping support roles when a ticket opens."))
      .addBooleanOption((option) => option.setName("transcripts").setDescription("Post transcripts when tickets close."))
      .addBooleanOption((option) => option.setName("dm-transcript").setDescription("DM the transcript to the member."))
      .addBooleanOption((option) => option.setName("feedback").setDescription("Ask members to rate closed tickets."))
      .addIntegerOption((option) => option.setName("auto-close-hours").setDescription("Close inactive tickets after N hours (0 = off).").setMinValue(0).setMaxValue(720))
      .addIntegerOption((option) => option.setName("auto-close-warning").setDescription("Warn N hours before auto-close (0 = off).").setMinValue(0).setMaxValue(720))
      .addBooleanOption((option) => option.setName("auto-close-claimed").setDescription("Also auto-close claimed tickets."))
      .addStringOption((option) => option.setName("name-template").setDescription("Channel name, e.g. ticket-{number}-{username}.").setMaxLength(90))
      .addStringOption((option) => option.setName("open-message").setDescription("Opening message. Supports {user} {username} {number} {category}.").setMaxLength(2000))
      .addStringOption((option) => option.setName("color").setDescription("Embed color, e.g. #5865F2.").setMaxLength(7)))
    .addSubcommand((sub) => sub.setName("view").setDescription("Show the current ticket configuration."))
    .addSubcommand((sub) => sub.setName("support-remove").setDescription("Remove a support team role.")
      .addRoleOption((option) => option.setName("role").setDescription("Role.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("block").setDescription("Stop a member from opening tickets.")
      .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("unblock").setDescription("Allow a blocked member to open tickets again.")
      .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("category-create").setDescription("Create a ticket type.")
      .addStringOption((option) => option.setName("name").setDescription("Name, e.g. Ban Appeal.").setRequired(true).setMaxLength(80))
      .addStringOption((option) => option.setName("description").setDescription("Short description.").setMaxLength(100))
      .addStringOption((option) => option.setName("emoji").setDescription("Button emoji."))
      .addStringOption((option) => option.setName("style").setDescription("Button color.").addChoices({ name: "Blurple", value: "PRIMARY" }, { name: "Grey", value: "SECONDARY" }, { name: "Green", value: "SUCCESS" }, { name: "Red", value: "DANGER" }))
      .addRoleOption((option) => option.setName("support-role").setDescription("Extra support role for this type."))
      .addStringOption((option) => option.setName("priority").setDescription("Default priority.").addChoices({ name: "Low", value: "LOW" }, { name: "Normal", value: "NORMAL" }, { name: "High", value: "HIGH" }, { name: "Urgent", value: "URGENT" }))
      .addStringOption((option) => option.setName("question").setDescription("Optional form question asked when opening.").setMaxLength(45)))
    .addSubcommand((sub) => sub.setName("category-toggle").setDescription("Enable or disable a ticket type.")
      .addStringOption((option) => option.setName("name").setDescription("Ticket type name.").setRequired(true))
      .addBooleanOption((option) => option.setName("enabled").setDescription("Enabled.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("category-delete").setDescription("Delete a ticket type.")
      .addStringOption((option) => option.setName("name").setDescription("Ticket type name.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("category-list").setDescription("List ticket types."))
    .addSubcommand((sub) => sub.setName("panel").setDescription("Create or update a ticket panel and post it.")
      .addStringOption((option) => option.setName("name").setDescription("Panel name.").setRequired(true).setMaxLength(80))
      .addChannelOption((option) => option.setName("channel").setDescription("Where to post the panel.").setRequired(true).addChannelTypes(...TEXT_CHANNELS))
      .addStringOption((option) => option.setName("title").setDescription("Panel title.").setMaxLength(256))
      .addStringOption((option) => option.setName("description").setDescription("Panel text.").setMaxLength(4000))
      .addStringOption((option) => option.setName("style").setDescription("Buttons or a dropdown.").addChoices({ name: "Buttons", value: "BUTTONS" }, { name: "Dropdown", value: "SELECT_MENU" })))
    .addSubcommand((sub) => sub.setName("panel-delete").setDescription("Delete a ticket panel.")
      .addStringOption((option) => option.setName("name").setDescription("Panel name.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("stats").setDescription("Show ticket statistics."));

  public constructor(private readonly tickets?: TicketService) {}

  public async execute(context: CommandExecutionContext): Promise<void> {
    try {
      await this.run(context);
    } catch (error) {
      if (!(error instanceof TicketError)) throw error;
      await context.editReply({ content: error.message });
    }
  }

  private async run(context: CommandExecutionContext): Promise<void> {
    if (!this.tickets) throw new TicketError("DEPENDENCY_UNAVAILABLE", "Tickets are not available right now.");
    const tickets = this.tickets;
    const guildId = context.interaction.guildId;
    if (!guildId) throw new TicketError("INVALID_STATE", "Tickets only work inside a server.");
    const options = context.options;
    const route = context.route.requiredSubcommand();
    const settings = await tickets.settings(guildId);
    const save = (changes: Partial<TicketSettingsInput>) => tickets.saveSettings({ ...editable(settings), ...changes, expectedRevision: settings.revision, source: "DISCORD" });

    switch (route) {
      case "setup": {
        const supportRole = options.optionalRole("support-role");
        const saved = await save({
          enabled: options.requiredBoolean("enabled"),
          ...defined("mode", options.optionalString("mode") as TicketMode | undefined),
          ...defined("openCategoryChannelId", options.optionalChannel("category")?.id),
          ...defined("threadParentChannelId", options.optionalChannel("thread-channel")?.id),
          ...defined("transcriptChannelId", options.optionalChannel("transcripts")?.id),
          ...defined("logChannelId", options.optionalChannel("logs")?.id),
          ...(supportRole ? { supportRoleIds: [...new Set([...settings.supportRoleIds, supportRole.id])] } : {}),
        });
        await context.editReply({ content: `Tickets are ${saved.enabled ? "enabled" : "disabled"}.\n${summary(saved)}\nNext: create ticket types with \`/tickets category-create\`, then post a panel with \`/tickets panel\`.` });
        return;
      }
      case "config": {
        const saved = await save({
          ...defined("maxOpenPerUser", options.optionalInteger("max-open")),
          ...defined("allowUserClose", options.optionalBoolean("member-close")),
          ...defined("requireCloseReason", options.optionalBoolean("require-reason")),
          ...defined("closeConfirmation", options.optionalBoolean("confirm-close")),
          ...defined("closeAction", options.optionalString("close-action") as TicketCloseAction | undefined),
          ...defined("deleteDelaySeconds", options.optionalInteger("delete-delay")),
          ...defined("closedCategoryChannelId", options.optionalChannel("closed-category")?.id),
          ...defined("claimEnabled", options.optionalBoolean("claiming")),
          ...defined("claimRestrictsReplies", options.optionalBoolean("claim-locks")),
          ...defined("pingSupportOnOpen", options.optionalBoolean("ping-support")),
          ...defined("transcriptsEnabled", options.optionalBoolean("transcripts")),
          ...defined("transcriptDmUser", options.optionalBoolean("dm-transcript")),
          ...defined("feedbackEnabled", options.optionalBoolean("feedback")),
          ...defined("autoCloseHours", options.optionalInteger("auto-close-hours")),
          ...defined("autoCloseWarningHours", options.optionalInteger("auto-close-warning")),
          ...defined("autoCloseExcludeClaimed", invert(options.optionalBoolean("auto-close-claimed"))),
          ...defined("nameTemplate", options.optionalString("name-template")),
          ...defined("openMessage", options.optionalString("open-message")),
          ...defined("embedColor", options.optionalString("color")),
        });
        await context.editReply({ content: `Ticket settings saved.\n${summary(saved)}` });
        return;
      }
      case "view":
        await context.editReply({ content: summary(settings) });
        return;
      case "support-remove": {
        const role = options.requiredRole("role");
        await save({ supportRoleIds: settings.supportRoleIds.filter((id) => id !== role.id) });
        await context.editReply({ content: `<@&${role.id}> removed from the support team.` });
        return;
      }
      case "block": {
        const member = options.requiredUser("member");
        await save({ blockedUserIds: [...new Set([...settings.blockedUserIds, member.id])] });
        await context.editReply({ content: `<@${member.id}> can no longer open tickets.` });
        return;
      }
      case "unblock": {
        const member = options.requiredUser("member");
        await save({ blockedUserIds: settings.blockedUserIds.filter((id) => id !== member.id) });
        await context.editReply({ content: `<@${member.id}> can open tickets again.` });
        return;
      }
      case "category-create": {
        const supportRole = options.optionalRole("support-role");
        const question = options.optionalString("question");
        const category = await tickets.saveCategory({
          guildId,
          name: options.requiredString("name"),
          ...defined("description", options.optionalString("description")),
          ...defined("emoji", options.optionalString("emoji")),
          buttonStyle: (options.optionalString("style") as TicketButtonStyle | undefined) ?? "PRIMARY",
          enabled: true,
          supportRoleIds: supportRole ? [supportRole.id] : [],
          defaultPriority: (options.optionalString("priority") as TicketPriority | undefined) ?? "NORMAL",
          questions: question ? [{ id: "details", label: question, style: "PARAGRAPH", required: true, maxLength: 1000 }] : [],
          requiredRoleIds: [],
        });
        await context.editReply({ content: `Ticket type **${category.name}** created. Use the portal to add more form questions or settings.` });
        return;
      }
      case "category-toggle": {
        const category = await this.categoryByName(guildId, options.requiredString("name"));
        const { id, position: _position, ...rest } = category;
        await tickets.saveCategory({ ...rest, id, enabled: options.requiredBoolean("enabled") });
        await context.editReply({ content: `Ticket type **${category.name}** ${options.requiredBoolean("enabled") ? "enabled" : "disabled"}. Republish panels to update them.` });
        return;
      }
      case "category-delete": {
        const category = await this.categoryByName(guildId, options.requiredString("name"));
        await tickets.deleteCategory(guildId, category.id);
        await context.editReply({ content: `Ticket type **${category.name}** deleted. Existing tickets keep their history.` });
        return;
      }
      case "category-list": {
        const categories = await tickets.categories(guildId);
        await context.editReply({ content: categories.length ? categories.map((item) => `${item.emoji ?? "•"} **${item.name}**${item.enabled ? "" : " (disabled)"} - ${item.questions.length} question(s), priority ${item.defaultPriority.toLowerCase()}`).join("\n") : "No ticket types yet. Create one with `/tickets category-create`." });
        return;
      }
      case "panel": {
        const name = options.requiredString("name");
        const existing = (await tickets.panels(guildId)).find((panel) => panel.name.toLowerCase() === name.toLowerCase());
        const saved = await tickets.savePanel({
          ...(existing ?? {}),
          guildId,
          name,
          channelId: options.requiredChannel("channel").id,
          title: options.optionalString("title") ?? existing?.title ?? "Need help?",
          description: options.optionalString("description") ?? existing?.description ?? "Choose a ticket type below and our team will help you as soon as possible.",
          color: existing?.color ?? settings.embedColor,
          style: (options.optionalString("style") as TicketPanelStyle | undefined) ?? existing?.style ?? "BUTTONS",
          placeholder: existing?.placeholder ?? "Select a ticket type",
          categoryIds: existing?.categoryIds ?? [],
        });
        const published = await tickets.publishPanel(guildId, saved.id);
        await context.editReply({ content: `Panel **${published.name}** posted in <#${published.channelId}>.` });
        return;
      }
      case "panel-delete": {
        const panel = (await tickets.panels(guildId)).find((item) => item.name.toLowerCase() === options.requiredString("name").toLowerCase());
        if (!panel) throw new TicketError("NOT_FOUND", "Panel was not found.");
        await tickets.deletePanel(guildId, panel.id);
        await context.editReply({ content: `Panel **${panel.name}** deleted.` });
        return;
      }
      default: {
        const stats = await tickets.stats(guildId);
        await context.editReply({
          content: [
            `**Open:** ${stats.open} | **Claimed:** ${stats.claimed} | **Waiting:** ${stats.pending} | **Closed:** ${stats.closed}`,
            `**Average rating:** ${stats.averageRating === undefined ? "n/a" : `${stats.averageRating}/5 (${stats.ratingCount})`}`,
            `**First response:** ${minutes(stats.averageFirstResponseMinutes)} | **Resolution:** ${minutes(stats.averageResolutionMinutes)}`,
            ...(stats.topStaff.length ? [`**Top staff:** ${stats.topStaff.slice(0, 5).map((item) => `<@${item.userId}> (${item.closed})`).join(", ")}`] : []),
          ].join("\n"),
        });
      }
    }
  }

  private async categoryByName(guildId: string, name: string) {
    const category = (await this.tickets?.categories(guildId))?.find((item) => item.name.toLowerCase() === name.trim().toLowerCase());
    if (!category) throw new TicketError("NOT_FOUND", "Ticket type was not found. Check `/tickets category-list`.");
    return category;
  }
}

function editable(settings: TicketSettings): Omit<TicketSettingsInput, "source"> {
  const { nextNumber: _nextNumber, revision: _revision, ...rest } = settings;
  return rest;
}

function defined<K extends string, V>(key: K, value: V | undefined): { [P in K]?: V } {
  return (value === undefined ? {} : { [key]: value }) as { [P in K]?: V };
}

function invert(value: boolean | undefined): boolean | undefined {
  return value === undefined ? undefined : !value;
}

function minutes(value: number | undefined): string {
  if (value === undefined) return "n/a";
  return value >= 120 ? `${Math.round(value / 60)}h` : `${value}m`;
}

function summary(settings: TicketSettings): string {
  const channel = (id: string | undefined) => (id ? `<#${id}>` : "not set");
  return [
    `**Mode:** ${settings.mode === "THREAD" ? "private threads" : "private channels"}`,
    settings.mode === "THREAD" ? `**Thread channel:** ${channel(settings.threadParentChannelId)}` : `**Ticket category:** ${channel(settings.openCategoryChannelId)}`,
    `**Transcripts:** ${settings.transcriptsEnabled ? channel(settings.transcriptChannelId) : "off"} | **Logs:** ${channel(settings.logChannelId)}`,
    `**Support roles:** ${settings.supportRoleIds.map((id) => `<@&${id}>`).join(" ") || "none (only admins)"}`,
    `**Max open per member:** ${settings.maxOpenPerUser} | **Members can close:** ${settings.allowUserClose ? "yes" : "no"} | **Reason required:** ${settings.requireCloseReason ? "yes" : "no"}`,
    `**On close:** ${settings.closeAction === "DELETE" ? `delete after ${settings.deleteDelaySeconds}s` : `keep${settings.closedCategoryChannelId ? ` in ${channel(settings.closedCategoryChannelId)}` : ""}`}`,
    `**Claiming:** ${settings.claimEnabled ? (settings.claimRestrictsReplies ? "on (locks replies)" : "on") : "off"} | **Feedback:** ${settings.feedbackEnabled ? "on" : "off"} | **DM transcript:** ${settings.transcriptDmUser ? "on" : "off"}`,
    `**Auto-close:** ${settings.autoCloseHours ? `${settings.autoCloseHours}h${settings.autoCloseWarningHours ? `, warn ${settings.autoCloseWarningHours}h before` : ""}` : "off"}`,
    `**Blocked members:** ${settings.blockedUserIds.length}`,
  ].join("\n");
}

export const command = new TicketsCommand();
