import { MessageFlags, type ButtonInteraction, type Interaction } from "discord.js";
import { logger } from "@qbox/logger";
import { DiscordRestGiveawayGateway, GIVEAWAY_CUSTOM_ID, GiveawayError, GiveawayService, type GiveawayEntrant, type GiveawayRepository } from "@qbox/giveaways";

import { GiveawayCommand } from "../commands/Giveaway.command.js";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";

const SWEEP_INTERVAL_MS = 30_000;

/** Giveaways: `/giveaway`, the Enter button, and drawing winners when time is up. */
export function giveawaysFeature(repository: GiveawayRepository): DiscordFeatureFactory {
  return ({ client }) => {
    const giveaways = new GiveawayService(repository, new DiscordRestGiveawayGateway(client.rest));
    let timer: ReturnType<typeof setInterval> | undefined;
    return {
      name: "giveaways",
      commands: () => [new GiveawayCommand(giveaways)],
      interactionPrefixes: ["qbox:giveaways:"],
      handleInteraction: (interaction) => handle(giveaways, interaction),
      attach: () => {
        timer = setInterval(() => void giveaways.sweepDue().catch((error: unknown) => logger.error({ err: error }, "Ending giveaways failed.")), SWEEP_INTERVAL_MS);
        timer.unref?.();
      },
      detach: () => {
        if (timer) clearInterval(timer);
        timer = undefined;
      },
    };
  };
}

async function handle(giveaways: GiveawayService, interaction: Interaction): Promise<void> {
  if (!interaction.isButton() || !interaction.customId.startsWith(GIVEAWAY_CUSTOM_ID.enter)) return;
  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (!interaction.guildId) throw new GiveawayError("INVALID_STATE", "Giveaways only work inside a server.");
    const result = await giveaways.toggleEntry(interaction.guildId, interaction.customId.slice(GIVEAWAY_CUSTOM_ID.enter.length), entrant(interaction));
    await interaction.editReply({
      content: result.entered
        ? `You're in! 🎉 You have ${result.entries} entr${result.entries === 1 ? "y" : "ies"}. Press Enter again to leave.`
        : "You left the giveaway.",
    });
  } catch (error) {
    const message = error instanceof GiveawayError ? error.message : "Something went wrong. Please try again.";
    if (!(error instanceof GiveawayError)) logger.error({ err: error, interactionId: interaction.id }, "Giveaway interaction failed.");
    if (interaction.deferred || interaction.replied) await interaction.editReply({ content: message }).catch(() => undefined);
    else await interaction.reply({ content: message, flags: MessageFlags.Ephemeral }).catch(() => undefined);
  }
}

function entrant(interaction: ButtonInteraction): GiveawayEntrant {
  const member = interaction.member;
  const roleIds = !member ? [] : Array.isArray(member.roles) ? [...member.roles] : [...member.roles.cache.keys()];
  const displayName = member && "displayName" in member && typeof member.displayName === "string" ? member.displayName : interaction.user.globalName ?? interaction.user.username;
  const joined = !member ? undefined : "joinedAt" in member ? member.joinedAt ?? undefined : "joined_at" in member && member.joined_at ? new Date(member.joined_at) : undefined;
  return { userId: interaction.user.id, displayName, roleIds, ...(joined ? { joinedAt: joined } : {}) };
}
