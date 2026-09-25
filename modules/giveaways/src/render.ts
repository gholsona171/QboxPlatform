import { colorValue } from "@qbox/shared/discord-rest";

import type { Giveaway, GiveawayMessage } from "./types.js";
import { GIVEAWAY_CUSTOM_ID } from "./types.js";

const COLORS = { RUNNING: "#F47FFF", PAUSED: "#FEE75C", ENDED: "#99AAB5", CANCELLED: "#ED4245" } as const;

const timestamp = (date: Date, style: "R" | "f") => `<t:${Math.floor(date.getTime() / 1000)}:${style}>`;
const mentions = (ids: readonly string[]) => ids.map((id) => `<@${id}>`).join(", ");

/** Plain-language requirement lines, empty when anyone can enter. */
export function requirementLines(giveaway: Giveaway): string[] {
  return [
    ...(giveaway.requiredRoleIds.length ? [`Have ${giveaway.requiredRoleIds.length === 1 ? "the role" : "one of"} ${giveaway.requiredRoleIds.map((id) => `<@&${id}>`).join(" ")}`] : []),
    ...(giveaway.blockedRoleIds.length ? [`Not have ${giveaway.blockedRoleIds.map((id) => `<@&${id}>`).join(" ")}`] : []),
    ...(giveaway.minAccountAgeDays > 0 ? [`Account at least ${giveaway.minAccountAgeDays} day${giveaway.minAccountAgeDays === 1 ? "" : "s"} old`] : []),
    ...(giveaway.minServerDays > 0 ? [`In the server for at least ${giveaway.minServerDays} day${giveaway.minServerDays === 1 ? "" : "s"}`] : []),
  ];
}

/** The giveaway message with the Enter button while it runs. */
export function giveawayMessage(giveaway: Giveaway, entrantCount: number): GiveawayMessage {
  const suffix = { RUNNING: "", PAUSED: " (paused)", ENDED: " (ended)", CANCELLED: " (cancelled)" }[giveaway.status];
  const lines = [
    ...(giveaway.description ? [giveaway.description, ""] : []),
    giveaway.status === "RUNNING"
      ? `Press **Enter** to join. Press it again to leave.\nEnds ${timestamp(giveaway.endsAt, "R")} (${timestamp(giveaway.endsAt, "f")})`
      : giveaway.status === "PAUSED"
        ? "Entries are paused for now."
        : giveaway.status === "ENDED"
          ? `Ended ${timestamp(giveaway.endedAt ?? giveaway.endsAt, "f")}`
          : "This giveaway was cancelled.",
    `Hosted by <@${giveaway.hostId}>`,
  ];
  const requirements = requirementLines(giveaway);
  const fields = [
    { name: giveaway.status === "ENDED" ? "Winners" : "Number of winners", value: giveaway.status === "ENDED" ? (giveaway.winnerIds.length ? mentions(giveaway.winnerIds) : "No valid entries").slice(0, 1024) : String(giveaway.winnerCount), inline: true },
    { name: "Entries", value: String(entrantCount), inline: true },
    ...(requirements.length ? [{ name: "Requirements", value: requirements.join("\n").slice(0, 1024), inline: false }] : []),
    ...(giveaway.bonusEntries.length ? [{ name: "Bonus entries", value: giveaway.bonusEntries.map((bonus) => `<@&${bonus.roleId}>: +${bonus.entries}`).join("\n").slice(0, 1024), inline: false }] : []),
  ];
  return {
    ...(giveaway.pingRoleId ? { content: `<@&${giveaway.pingRoleId}>` } : {}),
    mentionUserIds: [],
    mentionRoleIds: giveaway.pingRoleId ? [giveaway.pingRoleId] : [],
    embeds: [{
      title: `🎉 ${giveaway.prize}${suffix}`.slice(0, 256),
      description: lines.join("\n").slice(0, 4096),
      color: colorValue(COLORS[giveaway.status]),
      fields,
      footer: { text: `Giveaway #${giveaway.number}` },
    }],
    ...(giveaway.status === "RUNNING" ? { enterButton: { customId: `${GIVEAWAY_CUSTOM_ID.enter}${giveaway.id}`, label: "Enter" } } : {}),
  };
}

/** Channel announcement of the winners. */
export function winnersMessage(giveaway: Giveaway, winnerIds: readonly string[], reroll: boolean): GiveawayMessage {
  if (winnerIds.length === 0)
    return { content: `Giveaway #${giveaway.number} for **${giveaway.prize}** ended with no valid entries, so there is no winner.`, mentionUserIds: [], mentionRoleIds: [] };
  return {
    content: `🎉 ${reroll ? "New winner" : "Congratulations"}${reroll && winnerIds.length > 1 ? "s" : ""}: ${mentions(winnerIds)}! You won **${giveaway.prize}**. Contact <@${giveaway.hostId}> to claim it.`.slice(0, 2000),
    mentionUserIds: [...winnerIds],
    mentionRoleIds: [],
  };
}

/** DM sent to each winner when `dmWinners` is on. */
export function winnerDirectMessage(giveaway: Giveaway): GiveawayMessage {
  const link = giveaway.messageId ? `https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}` : `<#${giveaway.channelId}>`;
  return {
    mentionUserIds: [],
    mentionRoleIds: [],
    embeds: [{
      title: "You won a giveaway! 🎉",
      description: `You won **${giveaway.prize}**.\nContact <@${giveaway.hostId}> to claim it.\n${link}`,
      color: colorValue(COLORS.RUNNING),
      footer: { text: `Giveaway #${giveaway.number}` },
    }],
  };
}
