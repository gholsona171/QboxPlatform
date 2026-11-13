import { MessageFlags } from "discord.js";
import { logger } from "@qbox/logger";
import { DiscordRestPollGateway, POLL_CUSTOM_ID, PollError, PollService, optionText } from "@qbox/polls";
import { PollCommand } from "../commands/Poll.command.js";
const SWEEP_INTERVAL_MS = 30_000;
/** Polls: `/poll`, vote buttons and menus, and closing ended polls. */
export function pollsFeature(repository) {
    return ({ client, authorizer }) => {
        const polls = new PollService(repository, new DiscordRestPollGateway(client.rest));
        let timer;
        return {
            name: "polls",
            commands: () => [new PollCommand(polls, authorizer)],
            interactionPrefixes: ["qbox:polls:"],
            handleInteraction: (interaction) => handle(polls, interaction),
            attach: () => {
                timer = setInterval(() => void polls.sweepEnded().catch((error) => logger.error({ err: error }, "Closing ended polls failed.")), SWEEP_INTERVAL_MS);
                timer.unref?.();
            },
            detach: () => {
                if (timer)
                    clearInterval(timer);
                timer = undefined;
            },
        };
    };
}
async function handle(polls, interaction) {
    if (!interaction.isButton() && !interaction.isStringSelectMenu())
        return;
    try {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const guildId = interaction.guildId;
        if (!guildId)
            throw new PollError("INVALID_STATE", "Polls only work inside a server.");
        await interaction.editReply({ content: await respond(polls, guildId, interaction) });
    }
    catch (error) {
        const message = error instanceof PollError ? error.message : "Something went wrong with that vote. Please try again.";
        if (!(error instanceof PollError))
            logger.error({ err: error, interactionId: interaction.id }, "Poll interaction failed.");
        if (interaction.deferred || interaction.replied)
            await interaction.editReply({ content: message }).catch(() => undefined);
        else
            await interaction.reply({ content: message, flags: MessageFlags.Ephemeral }).catch(() => undefined);
    }
}
async function respond(polls, guildId, interaction) {
    const id = interaction.customId;
    const voter = pollVoter(interaction);
    if (id.startsWith(POLL_CUSTOM_ID.clear)) {
        await polls.removeVote(guildId, id.slice(POLL_CUSTOM_ID.clear.length), voter.userId);
        return "Your vote was removed.";
    }
    const [pollId, optionId] = interaction.isStringSelectMenu()
        ? [id.slice(POLL_CUSTOM_ID.select.length), undefined]
        : id.slice(POLL_CUSTOM_ID.vote.length).split(":");
    if (!pollId)
        throw new PollError("INVALID_INPUT", "That poll button is not valid.");
    const choices = interaction.isStringSelectMenu() ? interaction.values : optionId ? [optionId] : [];
    const vote = await polls.vote(guildId, pollId, voter, choices);
    const poll = await polls.get(guildId, pollId);
    return `Your vote: **${vote.optionIds.map((option) => optionText(poll, option)).join(", ")}**.${poll.allowVoteChange ? " You can change it until the poll closes." : ""}`;
}
function pollVoter(interaction) {
    const member = interaction.member;
    const roleIds = !member ? [] : Array.isArray(member.roles) ? [...member.roles] : [...member.roles.cache.keys()];
    const displayName = member && "displayName" in member && typeof member.displayName === "string" ? member.displayName : interaction.user.globalName ?? interaction.user.username;
    return { userId: interaction.user.id, displayName, roleIds };
}
//# sourceMappingURL=PollsFeature.js.map