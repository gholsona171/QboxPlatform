import {
  ActionRowBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
  type ButtonInteraction,
  type Interaction,
  type ModalSubmitInteraction,
  type RepliableInteraction,
  type UserSelectMenuInteraction,
} from "discord.js";
import { logger } from "@qbox/logger";
import { VOICE_CUSTOM_ID, VoiceError, type VoiceRoom, type VoiceRoomService } from "@qbox/voice-rooms";

import type { VoiceElevation } from "./voiceActor.js";

const PICK_ACTIONS: Readonly<Record<string, string>> = {
  permit: "Choose a member to permit",
  reject: "Choose a member to block",
  kick: "Choose a member to disconnect",
  transfer: "Choose the new owner",
};

/** Handles voice room control panel buttons, member pickers, and forms. */
export class DiscordVoiceInteractionHandler {
  public constructor(
    private readonly voice: VoiceRoomService,
    private readonly elevation: VoiceElevation,
  ) {}

  public async handle(interaction: Interaction): Promise<void> {
    try {
      if (interaction.isButton() && interaction.customId.startsWith(VOICE_CUSTOM_ID.button)) await this.button(interaction);
      else if (interaction.isUserSelectMenu() && interaction.customId.startsWith(VOICE_CUSTOM_ID.pick)) await this.pick(interaction);
      else if (interaction.isModalSubmit() && interaction.customId.startsWith(VOICE_CUSTOM_ID.form)) await this.form(interaction);
    } catch (error) {
      await this.fail(interaction, error);
    }
  }

  private async button(interaction: ButtonInteraction): Promise<void> {
    const [action = "", roomId = ""] = interaction.customId.slice(VOICE_CUSTOM_ID.button.length).split(":");
    const room = await this.room(interaction, roomId);
    if (action === "rename" || action === "limit") {
      await interaction.showModal(form(action, room));
      return;
    }
    const pickLabel = PICK_ACTIONS[action];
    if (pickLabel) {
      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        components: [new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
          new UserSelectMenuBuilder().setCustomId(`${VOICE_CUSTOM_ID.pick}${action}:${room.id}`).setPlaceholder(pickLabel).setMinValues(1).setMaxValues(1),
        )],
      });
      return;
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const actor = await this.elevation.actor(interaction);
    switch (action) {
      case "lock":
      case "unlock":
        await this.voice.lock(room, actor, action === "lock");
        await interaction.editReply({ content: action === "lock" ? "Room locked." : "Room unlocked." });
        return;
      case "hide":
      case "unhide":
        await this.voice.hide(room, actor, action === "hide");
        await interaction.editReply({ content: action === "hide" ? "Room hidden." : "Room visible again." });
        return;
      case "claim":
        await this.voice.claim(room, actor);
        await interaction.editReply({ content: "You now own this room." });
        return;
      default:
        throw new VoiceError("INVALID_INPUT", "That button is no longer supported.");
    }
  }

  private async pick(interaction: UserSelectMenuInteraction): Promise<void> {
    const [action = "", roomId = ""] = interaction.customId.slice(VOICE_CUSTOM_ID.pick.length).split(":");
    const userId = interaction.values[0];
    if (!userId) return;
    await interaction.deferUpdate();
    const room = await this.room(interaction, roomId);
    const actor = await this.elevation.actor(interaction);
    if (action === "permit") await this.voice.permit(room, actor, userId);
    else if (action === "reject") await this.voice.reject(room, actor, userId);
    else if (action === "kick") await this.voice.kick(room, actor, userId);
    else if (action === "transfer") await this.voice.transfer(room, actor, userId);
    else throw new VoiceError("INVALID_INPUT", "That action is no longer supported.");
    const done: Readonly<Record<string, string>> = {
      permit: `<@${userId}> can now see and join this room.`,
      reject: `<@${userId}> is blocked from this room.`,
      kick: `<@${userId}> was disconnected.`,
      transfer: `<@${userId}> now owns this room.`,
    };
    await interaction.editReply({ content: done[action] ?? "Done.", components: [], allowedMentions: { parse: [] } });
  }

  private async form(interaction: ModalSubmitInteraction): Promise<void> {
    const [action = "", roomId = ""] = interaction.customId.slice(VOICE_CUSTOM_ID.form.length).split(":");
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const room = await this.room(interaction, roomId);
    const actor = await this.elevation.actor(interaction);
    const value = interaction.fields.getTextInputValue("value");
    if (action === "rename") {
      const renamed = await this.voice.rename(room, actor, value);
      await interaction.editReply({ content: `Room renamed to **${renamed.name}**.` });
      return;
    }
    const limit = Number(value.trim());
    await this.voice.limit(room, actor, limit);
    await interaction.editReply({ content: limit === 0 ? "User limit removed." : `User limit set to ${limit}.` });
  }

  private async room(interaction: Interaction, roomId: string): Promise<VoiceRoom> {
    if (!interaction.guildId) throw new VoiceError("INVALID_STATE", "Voice rooms only work inside a server.");
    return this.voice.room(interaction.guildId, roomId);
  }

  private async fail(interaction: Interaction, error: unknown): Promise<void> {
    const message = error instanceof VoiceError ? error.message : "Something went wrong with that voice room action. Please try again.";
    if (!(error instanceof VoiceError))
      logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, interactionId: interaction.id }, "Discord voice room interaction failed.");
    if (!interaction.isRepliable()) return;
    await respond(interaction, message).catch(() => undefined);
  }
}

function form(action: "rename" | "limit", room: VoiceRoom): ModalBuilder {
  const input = new TextInputBuilder().setCustomId("value").setStyle(TextInputStyle.Short).setRequired(true);
  if (action === "rename") input.setLabel("Room name").setMaxLength(100).setValue(room.name.slice(0, 100));
  else input.setLabel("User limit (0 = no limit)").setMaxLength(2).setPlaceholder("0-99");
  return new ModalBuilder()
    .setCustomId(`${VOICE_CUSTOM_ID.form}${action}:${room.id}`)
    .setTitle(action === "rename" ? "Rename room" : "User limit")
    .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
}

async function respond(interaction: RepliableInteraction, content: string): Promise<void> {
  if (interaction.deferred || interaction.replied) await interaction.editReply({ content, components: [] });
  else await interaction.reply({ content, flags: MessageFlags.Ephemeral });
}
