import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { BirthdayError, MONTH_NAMES, type Birthday, type BirthdayService, type BirthdayWrite, type UpcomingBirthday } from "@qbox/birthdays";
import type { PermissionAuthorizer } from "@qbox/permissions";

import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
import { interactionDisplayName, memberHasPermission } from "../features/featureAuthorization.js";

/** Custom ID prefixes for the birthday confirmation buttons. */
export const BIRTHDAY_CUSTOM_ID = {
  confirm: "qbox:birthday:confirm:",
  cancel: "qbox:birthday:cancel",
} as const;

const MONTH_CHOICES = MONTH_NAMES.map((name, index) => ({ name, value: index + 1 }));

/** `/birthday` - members save their birthday; staff manage everyone's. */
export class BirthdayCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;
  public readonly policy: CommandExecutionPolicy = {
    contexts: "guild",
    response: { acknowledgement: "deferred", visibility: "ephemeral" },
    concurrency: "user",
  };
  public readonly data = new SlashCommandBuilder()
    .setName("birthday")
    .setDescription("Save your birthday and see upcoming ones.")
    .addSubcommand((sub) => sub.setName("set").setDescription("Save your birthday (staff can set one for a member).")
      .addIntegerOption((option) => option.setName("month").setDescription("Month.").setRequired(true).addChoices(...MONTH_CHOICES))
      .addIntegerOption((option) => option.setName("day").setDescription("Day of the month.").setRequired(true).setMinValue(1).setMaxValue(31))
      .addIntegerOption((option) => option.setName("year").setDescription("Birth year (optional).").setMinValue(1900).setMaxValue(2100))
      .addBooleanOption((option) => option.setName("show-age").setDescription("Show your age in the birthday message."))
      .addStringOption((option) => option.setName("timezone").setDescription("Your time zone, for example Europe/London or America/New_York.").setMaxLength(64))
      .addUserOption((option) => option.setName("member").setDescription("Staff: set it for this member.")))
    .addSubcommand((sub) => sub.setName("remove").setDescription("Remove your birthday (staff can remove a member's).")
      .addUserOption((option) => option.setName("member").setDescription("Staff: remove this member's birthday.")))
    .addSubcommand((sub) => sub.setName("view").setDescription("Show a saved birthday.")
      .addUserOption((option) => option.setName("member").setDescription("Member (default: you).")))
    .addSubcommand((sub) => sub.setName("list").setDescription("Birthdays in the next 30 days."))
    .addSubcommand((sub) => sub.setName("next").setDescription("The next birthday."));

  public constructor(
    private readonly birthdays?: BirthdayService,
    private readonly authorizer?: PermissionAuthorizer,
  ) {}

  public bypassAuthorization(): boolean {
    return true;
  }

  public async execute(context: CommandExecutionContext): Promise<void> {
    try {
      await this.run(context);
    } catch (error) {
      if (!(error instanceof BirthdayError)) throw error;
      await context.editReply({ content: error.message, components: [] });
    }
  }

  private async run(context: CommandExecutionContext): Promise<void> {
    const birthdays = this.birthdays;
    const interaction = context.interaction;
    const guildId = interaction.guildId;
    if (!birthdays || !this.authorizer || !guildId) throw new BirthdayError("DEPENDENCY_UNAVAILABLE", "Birthdays are not available right now.");
    const options = context.options;
    const route = context.route.requiredSubcommand();
    const target = options.optionalUser("member");
    const other = target !== undefined && target.id !== interaction.user.id;
    const manager = other && (route === "set" || route === "remove") ? await memberHasPermission(this.authorizer, interaction, "birthdays.manage") : false;
    if (other && (route === "set" || route === "remove") && !manager) {
      await context.editReply({ content: "You need the `birthdays.manage` permission to change someone else's birthday." });
      return;
    }
    const actor = { userId: interaction.user.id, displayName: interactionDisplayName(interaction), manager };
    const userId = target?.id ?? interaction.user.id;

    switch (route) {
      case "set": {
        const input = {
          guildId,
          userId,
          displayName: other ? memberName(interaction, userId) : actor.displayName,
          month: options.requiredInteger("month"),
          day: options.requiredInteger("day"),
          year: options.optionalInteger("year"),
          showAge: options.optionalBoolean("show-age"),
          timeZone: options.optionalString("timezone"),
        };
        const check = await birthdays.check(input, actor);
        if (check.needsConfirmation) {
          await context.editReply({ content: `Is this right? **${birthdayText(check.write)}**`, components: [confirmRow(check.write)] });
          return;
        }
        const saved = await birthdays.set(input, actor);
        await context.editReply({ content: `${other ? `Saved <@${userId}>'s` : "Saved your"} birthday: **${birthdayText(saved)}**.` });
        return;
      }
      case "remove": {
        await birthdays.remove(guildId, userId, actor);
        await context.editReply({ content: other ? `Removed <@${userId}>'s birthday.` : "Your birthday was removed." });
        return;
      }
      case "view": {
        const found = await birthdays.get(guildId, userId);
        if (!found) {
          await context.editReply({ content: other ? `<@${userId}> has not saved a birthday.` : "You have not saved a birthday yet. Use `/birthday set`." });
          return;
        }
        const own = !other;
        await context.editReply({ content: `${own ? "Your" : `<@${userId}>'s`} birthday: **${birthdayText(found, own || found.showAge)}**` });
        return;
      }
      case "list": {
        const upcoming = await birthdays.upcoming(guildId, 30);
        const lines = upcoming.slice(0, 30).map(line);
        const embed = new EmbedBuilder().setTitle("Birthdays in the next 30 days").setColor(0xf47fff).setDescription(lines.join("\n") || "No birthdays in the next 30 days.");
        if (upcoming.length > 30) embed.setFooter({ text: `And ${upcoming.length - 30} more. See the portal for the full list.` });
        await context.editReply({ embeds: [embed] });
        return;
      }
      default: {
        const next = await birthdays.next(guildId);
        await context.editReply({ content: next.length ? `Next birthday:\n${next.map(line).join("\n")}` : "No birthdays are saved yet." });
      }
    }
  }
}

function line(item: UpcomingBirthday): string {
  const [, month, day] = item.date.split("-").map(Number);
  const when = item.daysUntil === 0 ? "today" : item.daysUntil === 1 ? "tomorrow" : `in ${item.daysUntil} days`;
  return `**${MONTH_NAMES[(month ?? 1) - 1]} ${day}** - <@${item.birthday.userId}> (${when}${item.turning ? `, turning ${item.turning}` : ""})`;
}

/** "March 5, 1999 (Europe/London)". The year is left out unless `withYear`. */
export function birthdayText(birthday: Pick<Birthday, "month" | "day" | "year" | "timeZone">, withYear = true): string {
  const year = withYear && birthday.year ? `, ${birthday.year}` : "";
  return `${MONTH_NAMES[birthday.month - 1]} ${birthday.day}${year} (${birthday.timeZone})`;
}

function confirmRow(write: BirthdayWrite): ActionRowBuilder<ButtonBuilder> {
  const id = `${BIRTHDAY_CUSTOM_ID.confirm}${write.month}:${write.day}:${write.year ?? 0}:${write.showAge ? 1 : 0}:${write.timeZone}`;
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(id).setLabel("Save birthday").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(BIRTHDAY_CUSTOM_ID.cancel).setLabel("Cancel").setStyle(ButtonStyle.Secondary),
  );
}

function memberName(interaction: ChatInputCommandInteraction, userId: string): string {
  const member = interaction.options.getMember("member");
  if (member && "displayName" in member && typeof member.displayName === "string") return member.displayName;
  const user = interaction.options.getUser("member");
  return user?.globalName ?? user?.username ?? userId;
}

export const command = new BirthdayCommand();
