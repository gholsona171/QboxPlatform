import { ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { PollError, parseDuration, resultsMessage, splitOptionText, type PollActor, type PollResultsVisibility, type PollService } from "@qbox/polls";
import type { PermissionAuthorizer } from "@qbox/permissions";

import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
import { interactionDisplayName, memberHasPermission } from "../features/featureAuthorization.js";

const OPTION_NAMES = ["option1", "option2", "option3", "option4", "option5", "option6", "option7", "option8", "option9", "option10"] as const;

/** `/poll` - create, close, and view polls. */
export class PollCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;
  public readonly policy: CommandExecutionPolicy = {
    contexts: "guild",
    response: { acknowledgement: "deferred", visibility: "ephemeral" },
    concurrency: "user",
  };
  public readonly data = new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create and manage polls.")
    .addSubcommand((sub) => {
      sub.setName("create").setDescription("Post a poll. Start an option with an emoji to show it on the button.")
        .addStringOption((option) => option.setName("question").setDescription("The question.").setRequired(true).setMaxLength(200));
      for (const [index, name] of OPTION_NAMES.entries())
        sub.addStringOption((option) => option.setName(name).setDescription(`Option ${index + 1}${index < 2 ? "" : " (optional)"}, e.g. 🍕 Pizza.`).setRequired(index < 2).setMaxLength(100));
      return sub
        .addStringOption((option) => option.setName("duration").setDescription("How long it runs, e.g. 30m, 2h, 3d. Leave empty to close it yourself."))
        .addIntegerOption((option) => option.setName("max-choices").setDescription("How many options each member can pick (default 1).").setMinValue(1).setMaxValue(10))
        .addChannelOption((option) => option.setName("channel").setDescription("Where to post (default: this channel).").addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
        .addBooleanOption((option) => option.setName("anonymous").setDescription("Hide who voted for what (default: no)."))
        .addStringOption((option) => option.setName("results").setDescription("When members see the counts.").addChoices({ name: "Live while voting", value: "LIVE" }, { name: "Only after it closes", value: "AFTER_CLOSE" }))
        .addBooleanOption((option) => option.setName("allow-change").setDescription("Let members change or remove their vote (default: yes)."))
        .addRoleOption((option) => option.setName("allowed-role").setDescription("Only members with this role can vote. Add more roles in the portal."))
        .addRoleOption((option) => option.setName("ping-role").setDescription("Role to ping when the poll is posted."));
    })
    .addSubcommand((sub) => sub.setName("close").setDescription("Close a poll now and post the results.")
      .addIntegerOption((option) => option.setName("poll").setDescription("Poll number.").setRequired(true).setMinValue(1)))
    .addSubcommand((sub) => sub.setName("results").setDescription("Show a poll's results.")
      .addIntegerOption((option) => option.setName("poll").setDescription("Poll number.").setRequired(true).setMinValue(1)))
    .addSubcommand((sub) => sub.setName("list").setDescription("List recent polls."));

  public constructor(
    private readonly polls?: PollService,
    private readonly authorizer?: PermissionAuthorizer,
  ) {}

  public bypassAuthorization(): boolean {
    return true;
  }

  public async execute(context: CommandExecutionContext): Promise<void> {
    try {
      await this.run(context);
    } catch (error) {
      if (!(error instanceof PollError)) throw error;
      await context.editReply({ content: error.message });
    }
  }

  private async run(context: CommandExecutionContext): Promise<void> {
    const polls = this.polls;
    const authorizer = this.authorizer;
    const interaction = context.interaction;
    const guildId = interaction.guildId;
    if (!polls || !authorizer || !guildId) throw new PollError("DEPENDENCY_UNAVAILABLE", "Polls are not available right now.");
    const route = context.route.requiredSubcommand();
    const options = context.options;
    const actor = async (): Promise<PollActor> => ({
      userId: interaction.user.id,
      displayName: interactionDisplayName(interaction),
      canManage: await memberHasPermission(authorizer, interaction, "polls.manage"),
    });

    switch (route) {
      case "create": {
        if (!(await memberHasPermission(authorizer, interaction, "polls.create"))) {
          await context.editReply({ content: "You need the `polls.create` permission to create polls." });
          return;
        }
        const durationText = options.optionalString("duration");
        const durationMinutes = durationText === undefined ? undefined : parseDuration(durationText);
        if (durationText !== undefined && durationMinutes === undefined) throw new PollError("INVALID_INPUT", "Use a duration like 30m, 2h, 3d, or 1w.");
        const allowedRole = options.optionalRole("allowed-role")?.id;
        const pingRole = options.optionalRole("ping-role")?.id;
        const poll = await polls.create({
          guildId,
          question: options.requiredString("question"),
          options: OPTION_NAMES.flatMap((name) => {
            const text = options.optionalString(name);
            return text?.trim() ? [splitOptionText(text)] : [];
          }),
          maxChoices: options.optionalInteger("max-choices"),
          anonymous: options.optionalBoolean("anonymous"),
          resultsVisibility: options.optionalString("results") as PollResultsVisibility | undefined,
          allowVoteChange: options.optionalBoolean("allow-change"),
          allowedRoleIds: allowedRole ? [allowedRole] : [],
          channelId: options.optionalChannel("channel")?.id ?? interaction.channelId,
          ...(pingRole ? { pingRoleId: pingRole } : {}),
          ...(durationMinutes === undefined ? {} : { durationMinutes }),
        }, await actor());
        await context.editReply({ content: `Poll #${poll.number} posted in <#${poll.channelId}>.` });
        return;
      }
      case "close": {
        const poll = await polls.close(guildId, String(options.requiredInteger("poll")), await actor());
        await context.editReply({ content: `Poll #${poll.number} closed. The results were posted in <#${poll.channelId}>.` });
        return;
      }
      case "results": {
        const results = await polls.results(guildId, String(options.requiredInteger("poll")), await actor());
        const { embed } = resultsMessage(results.poll, results);
        await context.editReply({
          embeds: [new EmbedBuilder().setTitle(embed.title).setDescription(embed.description).setColor(0x5865f2).addFields(...embed.fields.map((field) => ({ ...field, inline: field.inline ?? false })))
            .setFooter({ text: results.poll.status === "OPEN" ? "Still open. Results may change." : "Final results." })],
        });
        return;
      }
      default: {
        const recent = await polls.list(guildId, undefined, 15);
        const lines = recent.map((poll) => `\`#${poll.number}\` ${poll.status === "OPEN" ? "🟢" : "⚪"} ${poll.question.slice(0, 80)} · ${poll.voterCount} voter${poll.voterCount === 1 ? "" : "s"}${poll.messageId ? ` · [open](https://discord.com/channels/${guildId}/${poll.channelId}/${poll.messageId})` : ""}`);
        await context.editReply({ embeds: [new EmbedBuilder().setTitle("Polls").setColor(0x5865f2).setDescription(lines.join("\n") || "No polls yet.")] });
      }
    }
  }
}

export const command = new PollCommand();
