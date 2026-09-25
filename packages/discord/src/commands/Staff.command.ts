import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import {
  StaffError,
  formatSeconds,
  recordLabel,
  rosterEmbed,
  statusLabel,
  type StaffActor,
  type StaffRank,
  type StaffService,
} from "@qbox/staff";
import type { Permission, PermissionAuthorizer } from "@qbox/permissions";

import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
import { interactionDisplayName, memberHasPermission } from "../features/featureAuthorization.js";

/** Permission each subcommand needs. Profile, loa, and shifts are checked in `run`. */
const SUBCOMMAND_PERMISSIONS: Readonly<Record<string, Permission>> = {
  roster: "staff.view",
  hire: "staff.manage",
  promote: "staff.manage",
  demote: "staff.manage",
  fire: "staff.manage",
  strike: "staff.manage",
  note: "staff.manage",
  clockin: "staff.shifts",
  clockout: "staff.shifts",
};

const DAY_MS = 86_400_000;
const unix = (date: Date) => Math.floor(date.getTime() / 1000);

/** `/staff` - roster, promotions, strikes, leave, and shifts. */
export class StaffCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;
  public readonly policy: CommandExecutionPolicy = {
    contexts: "guild",
    response: { acknowledgement: "deferred", visibility: "ephemeral" },
    concurrency: "user",
  };
  public readonly data = new SlashCommandBuilder()
    .setName("staff")
    .setDescription("Staff roster, ranks, leave, and shifts.")
    .addSubcommand((sub) => sub.setName("roster").setDescription("Show the staff roster."))
    .addSubcommand((sub) => sub.setName("profile").setDescription("Show a staff member's profile.")
      .addUserOption((option) => option.setName("member").setDescription("Member (default: you).")))
    .addSubcommand((sub) => sub.setName("hire").setDescription("Add someone to the staff roster.")
      .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
      .addStringOption((option) => option.setName("rank").setDescription("Rank name (default: lowest rank).").setMaxLength(50))
      .addStringOption((option) => option.setName("callsign").setDescription("Callsign or badge number.").setMaxLength(32))
      .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(1000)))
    .addSubcommand((sub) => sub.setName("promote").setDescription("Move a staff member up a rank.")
      .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
      .addStringOption((option) => option.setName("rank").setDescription("Rank name (default: next rank up).").setMaxLength(50))
      .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(1000)))
    .addSubcommand((sub) => sub.setName("demote").setDescription("Move a staff member down a rank.")
      .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
      .addStringOption((option) => option.setName("rank").setDescription("Rank name (default: next rank down).").setMaxLength(50))
      .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(1000)))
    .addSubcommand((sub) => sub.setName("fire").setDescription("Remove someone from staff and take their staff roles.")
      .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
      .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(1000)))
    .addSubcommand((sub) => sub.setName("strike").setDescription("Give a staff member a strike.")
      .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
      .addStringOption((option) => option.setName("reason").setDescription("Reason.").setRequired(true).setMaxLength(1000))
      .addIntegerOption((option) => option.setName("expires-days").setDescription("Stops counting after this many days (default: never).").setMinValue(1).setMaxValue(3650)))
    .addSubcommand((sub) => sub.setName("note").setDescription("Add a note to a staff member's history.")
      .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
      .addStringOption((option) => option.setName("text").setDescription("Note.").setRequired(true).setMaxLength(1000)))
    .addSubcommand((sub) => sub.setName("loa").setDescription("Request leave of absence, or end your leave.")
      .addStringOption((option) => option.setName("action").setDescription("What to do (default: request).").addChoices({ name: "Request leave", value: "request" }, { name: "Cancel or end my leave", value: "end" }))
      .addIntegerOption((option) => option.setName("days").setDescription("How many days.").setMinValue(1).setMaxValue(365))
      .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(500))
      .addStringOption((option) => option.setName("start").setDescription("Start date as YYYY-MM-DD (default: now).").setMaxLength(10)))
    .addSubcommand((sub) => sub.setName("clockin").setDescription("Start a shift."))
    .addSubcommand((sub) => sub.setName("clockout").setDescription("End your shift."))
    .addSubcommand((sub) => sub.setName("shifts").setDescription("Show shift time for you, a member, or the leaderboard.")
      .addUserOption((option) => option.setName("member").setDescription("Member (default: you)."))
      .addBooleanOption((option) => option.setName("leaderboard").setDescription("Show everyone's time this week."))
      .addIntegerOption((option) => option.setName("weeks-ago").setDescription("0 = this week, 1 = last week.").setMinValue(0).setMaxValue(52)));

  public constructor(
    private readonly staff?: StaffService,
    private readonly authorizer?: PermissionAuthorizer,
  ) {}

  public bypassAuthorization(): boolean {
    return true;
  }

  public async execute(context: CommandExecutionContext): Promise<void> {
    try {
      await this.run(context);
    } catch (error) {
      if (!(error instanceof StaffError)) throw error;
      await context.editReply({ content: error.message });
    }
  }

  private async run(context: CommandExecutionContext): Promise<void> {
    const staff = this.staff;
    const authorizer = this.authorizer;
    const interaction = context.interaction;
    const guildId = interaction.guildId;
    if (!staff || !authorizer || !guildId) throw new StaffError("DEPENDENCY_UNAVAILABLE", "Staff management is not available right now.");
    const route = context.route.requiredSubcommand();
    const options = context.options;
    const self = { userId: interaction.user.id, displayName: interactionDisplayName(interaction) };
    const actor: StaffActor = { ...self, source: "DISCORD" };
    const can = (permission: Permission) => memberHasPermission(authorizer, interaction, permission);
    const denied = (permission: Permission) => context.editReply({ content: `You need the \`${permission}\` permission to do that.` });

    const needed = SUBCOMMAND_PERMISSIONS[route];
    if (needed && !(await can(needed))) return denied(needed);

    const user = options.optionalUser("member");
    const target = user ? { userId: user.id, displayName: "globalName" in user && user.globalName ? user.globalName : user.username } : self;

    switch (route) {
      case "roster": {
        const roster = await staff.roster(guildId);
        const embed = rosterEmbed(roster.ranks, roster.members);
        await context.editReply({ embeds: [new EmbedBuilder().setTitle(embed.title).setDescription(embed.description).setColor(embed.color as `#${string}`).setFooter({ text: embed.footer ?? "" })] });
        return;
      }
      case "profile": {
        if (target.userId !== self.userId && !(await can("staff.view"))) return denied("staff.view");
        await context.editReply({ embeds: [await this.profileEmbed(staff, guildId, target.userId)] });
        return;
      }
      case "hire": {
        const rank = await this.rankByName(staff, guildId, options.optionalString("rank"));
        const member = await staff.hire(guildId, target, actor, { rankId: rank?.id, callsign: options.optionalString("callsign"), reason: options.optionalString("reason") });
        const ranks = await staff.ranks(guildId);
        await context.editReply({ content: `<@${member.userId}> hired as ${ranks.find((item) => item.id === member.rankId)?.name ?? "staff"}.` });
        return;
      }
      case "promote":
      case "demote": {
        const rank = await this.rankByName(staff, guildId, options.optionalString("rank"));
        const reason = options.optionalString("reason");
        const member = route === "promote" ? await staff.promote(guildId, target.userId, actor, rank?.id, reason) : await staff.demote(guildId, target.userId, actor, rank?.id, reason);
        const ranks = await staff.ranks(guildId);
        await context.editReply({ content: `<@${member.userId}> ${route}d to ${ranks.find((item) => item.id === member.rankId)?.name ?? "their new rank"}.` });
        return;
      }
      case "fire": {
        await staff.fire(guildId, target.userId, actor, options.optionalString("reason"));
        await context.editReply({ content: `<@${target.userId}> was removed from staff.` });
        return;
      }
      case "strike": {
        const expiresDays = options.optionalInteger("expires-days");
        await staff.strike(guildId, target.userId, actor, options.requiredString("reason"), expiresDays);
        const profile = await staff.profile(guildId, target.userId);
        await context.editReply({ content: `Strike given to <@${target.userId}>. Active strikes: ${profile.activeStrikes}.` });
        return;
      }
      case "note": {
        await staff.note(guildId, target.userId, actor, options.requiredString("text"));
        await context.editReply({ content: `Note added to <@${target.userId}>'s history.` });
        return;
      }
      case "loa": {
        if (options.optionalString("action") === "end") {
          const current = await staff.currentLeave(guildId, self.userId);
          if (!current) throw new StaffError("INVALID_STATE", "You have no pending or active leave.");
          const updated = await staff.cancelLeave(guildId, current.id, self.userId);
          await context.editReply({ content: updated.status === "ENDED" ? "Welcome back. Your leave has ended." : "Your leave request was cancelled." });
          return;
        }
        const days = options.optionalInteger("days");
        const reason = options.optionalString("reason");
        if (!days || !reason) throw new StaffError("INVALID_INPUT", "Give the number of days and a reason for your leave.");
        const startsAt = parseStart(options.optionalString("start")) ?? new Date();
        const leave = await staff.requestLeave(guildId, self, { startsAt, endsAt: new Date(startsAt.getTime() + days * DAY_MS), reason });
        await context.editReply({ content: `Leave requested from <t:${unix(leave.startsAt)}:D> to <t:${unix(leave.endsAt)}:D>. A manager will review it.` });
        return;
      }
      case "clockin": {
        const shift = await staff.clockIn(guildId, self);
        await context.editReply({ content: `Clocked in at <t:${unix(shift.startedAt)}:t>.` });
        return;
      }
      case "clockout": {
        const shift = await staff.clockOut(guildId, self.userId);
        await context.editReply({ content: `Clocked out. Shift length: ${formatSeconds(shift.durationSeconds ?? 0)}.` });
        return;
      }
      default: {
        const weeksAgo = options.optionalInteger("weeks-ago") ?? 0;
        const others = options.optionalBoolean("leaderboard") === true || target.userId !== self.userId;
        const permission: Permission = others ? "staff.view" : "staff.shifts";
        if (!(await can(permission))) return denied(permission);
        const board = await staff.leaderboard(guildId, weeksAgo);
        const period = `<t:${unix(board.since)}:D> to <t:${unix(new Date(board.until.getTime() - 1000))}:D>`;
        if (options.optionalBoolean("leaderboard")) {
          const lines = board.entries.slice(0, 25).map((entry, index) => `**${index + 1}.** <@${entry.userId}> - ${formatSeconds(entry.seconds)} (${entry.shifts} shift${entry.shifts === 1 ? "" : "s"})`);
          await context.editReply({ embeds: [new EmbedBuilder().setTitle("Shift leaderboard").setColor(0x5865f2).setDescription(`${period}\n\n${lines.join("\n") || "No shifts yet."}`)] });
          return;
        }
        const entry = board.entries.find((item) => item.userId === target.userId);
        const recent = await staff.shifts({ guildId, userId: target.userId, limit: 10 });
        const lines = recent.map((shift) => `<t:${unix(shift.startedAt)}:f> - ${shift.endedAt ? formatSeconds(shift.durationSeconds ?? 0) : "on shift now"}${shift.autoEnded ? " (auto)" : ""}`);
        await context.editReply({
          embeds: [new EmbedBuilder()
            .setTitle(`Shifts for ${target.displayName}`)
            .setColor(0x5865f2)
            .setDescription(`${period}: **${formatSeconds(entry?.seconds ?? 0)}** in ${entry?.shifts ?? 0} shift${entry?.shifts === 1 ? "" : "s"}\n\n${lines.join("\n") || "No shifts yet."}`)],
        });
      }
    }
  }

  private async rankByName(staff: StaffService, guildId: string, name: string | undefined): Promise<StaffRank | undefined> {
    if (!name) return undefined;
    const rank = (await staff.ranks(guildId)).find((item) => item.name.toLowerCase() === name.trim().toLowerCase());
    if (!rank) throw new StaffError("NOT_FOUND", `There is no rank called "${name}". Use /staff roster to see the ranks.`);
    return rank;
  }

  private async profileEmbed(staff: StaffService, guildId: string, userId: string): Promise<EmbedBuilder> {
    const profile = await staff.profile(guildId, userId);
    const { member, rank } = profile;
    const history = profile.records.slice(0, 8).map((record) => `<t:${unix(record.createdAt)}:d> ${recordLabel(record.type)}${record.toRank && record.fromRank ? ` (${record.fromRank} → ${record.toRank})` : ""}${record.reason ? ` - ${record.reason.slice(0, 80)}` : ""}`);
    const leave = profile.leaves.find((item) => item.status === "ACTIVE" || item.status === "APPROVED" || item.status === "PENDING");
    return new EmbedBuilder()
      .setTitle(member.displayName)
      .setColor(rank.color as `#${string}`)
      .addFields(
        { name: "Rank", value: rank.name, inline: true },
        { name: "Callsign", value: member.callsign ?? "None", inline: true },
        { name: "Status", value: statusLabel(member.status), inline: true },
        { name: "Joined", value: `<t:${unix(member.joinedAt)}:D>`, inline: true },
        { name: "Active strikes", value: String(profile.activeStrikes), inline: true },
        { name: "This week", value: `${formatSeconds(profile.weekSeconds)}${profile.openShift ? " (on shift)" : ""}`, inline: true },
        ...(leave ? [{ name: "Leave", value: `${leave.status.toLowerCase()}: <t:${unix(leave.startsAt)}:D> to <t:${unix(leave.endsAt)}:D>` }] : []),
        { name: "History", value: history.join("\n").slice(0, 1024) || "Nothing yet." },
      );
  }
}

function parseStart(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  const date = match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : undefined;
  if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value.trim()) throw new StaffError("INVALID_INPUT", "Use a start date like 2026-10-01.");
  return date;
}

export const command = new StaffCommand();
