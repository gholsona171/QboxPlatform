import type { Poll, PollButton, PollMessage, PollTally } from "./types.js";
import { POLL_CUSTOM_ID } from "./types.js";

const BAR_WIDTH = 12;
const OPEN_COLOR = "#5865F2";
const CLOSED_COLOR = "#99AAB5";

/** Text bar like `██████░░░░░░ 50% (5)`. Percent is of voters. */
export function resultBar(count: number, voters: number): string {
  const share = voters > 0 ? count / voters : 0;
  const filled = Math.round(share * BAR_WIDTH);
  return `${"█".repeat(filled)}${"░".repeat(BAR_WIDTH - filled)} ${Math.round(share * 100)}% (${count})`;
}

/** True when vote counts may be shown to members. */
export function resultsVisible(poll: Poll): boolean {
  return poll.status === "CLOSED" || poll.resultsVisibility === "LIVE";
}

/** Option IDs with the most votes (several on a tie, none without votes). */
export function leadingOptions(poll: Poll, tally: PollTally): readonly string[] {
  const top = Math.max(0, ...poll.options.map((option) => tally.counts[option.id] ?? 0));
  if (top === 0) return [];
  return poll.options.filter((option) => (tally.counts[option.id] ?? 0) === top).map((option) => option.id);
}

export function optionText(poll: Poll, optionId: string): string {
  const option = poll.options.find((item) => item.id === optionId);
  if (!option) return optionId;
  return option.emoji ? `${option.emoji} ${option.label}` : option.label;
}

function optionLines(poll: Poll, tally: PollTally, showCounts: boolean): string {
  const leaders = poll.status === "CLOSED" ? leadingOptions(poll, tally) : [];
  return poll.options
    .map((option, index) => {
      const label = `**${index + 1}.** ${optionText(poll, option.id)}${leaders.includes(option.id) ? " 🏆" : ""}`;
      return showCounts ? `${label}\n\`${resultBar(tally.counts[option.id] ?? 0, tally.voters)}\`` : label;
    })
    .join("\n");
}

function footer(poll: Poll): string {
  return [`Poll #${poll.number}`, poll.anonymous ? "Anonymous" : "Votes are public", poll.resultsVisibility === "LIVE" ? "Live results" : "Results after it closes"].join(" · ");
}

/** The poll message members vote on. Closed polls show final results and no controls. */
export function pollMessage(poll: Poll, tally: PollTally): PollMessage {
  const open = poll.status === "OPEN";
  const showCounts = resultsVisible(poll);
  const ends = poll.endsAt ? `<t:${Math.floor(poll.endsAt.getTime() / 1000)}:${open ? "R" : "f"}>` : open ? "When closed by staff" : "—";
  const choices = poll.maxChoices === 1 ? "Pick one" : `Pick up to ${poll.maxChoices}`;
  const fields = [
    { name: open ? "Ends" : "Ended", value: poll.closedAt && !open ? `<t:${Math.floor(poll.closedAt.getTime() / 1000)}:f>` : ends, inline: true },
    { name: "Choices", value: choices, inline: true },
    { name: "Voters", value: String(tally.voters), inline: true },
    ...(poll.allowedRoleIds.length ? [{ name: "Who can vote", value: poll.allowedRoleIds.map((id) => `<@&${id}>`).join(" ").slice(0, 1024) }] : []),
  ];
  return {
    ...(poll.pingRoleId ? { content: `<@&${poll.pingRoleId}>` } : {}),
    mentionRoleIds: poll.pingRoleId ? [poll.pingRoleId] : [],
    embed: {
      title: `📊 ${poll.question}${open ? "" : " (closed)"}`.slice(0, 256),
      description: optionLines(poll, tally, showCounts).slice(0, 4096),
      color: open ? OPEN_COLOR : CLOSED_COLOR,
      fields,
      footer: footer(poll),
    },
    buttonRows: open ? controls(poll) : [],
    ...(open && poll.maxChoices > 1
      ? {
          select: {
            customId: `${POLL_CUSTOM_ID.select}${poll.id}`,
            placeholder: `Pick up to ${poll.maxChoices}`,
            maxValues: Math.min(poll.maxChoices, poll.options.length),
            options: poll.options.map((option) => ({ value: option.id, label: option.label, ...(option.emoji ? { emoji: option.emoji } : {}) })),
          },
        }
      : {}),
  };
}

/** Final results posted in the channel when a poll closes. */
export function resultsMessage(poll: Poll, tally: PollTally): PollMessage {
  const leaders = leadingOptions(poll, tally);
  const winner = leaders.length === 0 ? "No votes" : leaders.length === 1 ? optionText(poll, leaders[0] as string) : `Tie: ${leaders.map((id) => optionText(poll, id)).join(", ")}`;
  return {
    mentionRoleIds: [],
    embed: {
      title: `Poll #${poll.number} results`.slice(0, 256),
      description: `**${poll.question}**\n\n${optionLines(poll, tally, true)}`.slice(0, 4096),
      color: CLOSED_COLOR,
      fields: [
        { name: "Winner", value: winner.slice(0, 1024), inline: true },
        { name: "Voters", value: String(tally.voters), inline: true },
      ],
    },
    buttonRows: [],
  };
}

function controls(poll: Poll): (readonly PollButton[])[] {
  const rows: PollButton[][] = [];
  if (poll.maxChoices === 1) {
    const buttons = poll.options.map((option): PollButton => ({
      customId: `${POLL_CUSTOM_ID.vote}${poll.id}:${option.id}`,
      label: option.label.slice(0, 80),
      ...(option.emoji ? { emoji: option.emoji } : {}),
      style: "SECONDARY",
    }));
    for (let index = 0; index < buttons.length; index += 5) rows.push(buttons.slice(index, index + 5));
  }
  if (poll.allowVoteChange) rows.push([{ customId: `${POLL_CUSTOM_ID.clear}${poll.id}`, label: "Remove my vote", style: "DANGER" }]);
  return rows;
}
