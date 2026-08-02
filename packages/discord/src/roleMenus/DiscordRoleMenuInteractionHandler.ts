import type {
  ButtonInteraction,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  StringSelectMenuInteraction,
  User,
} from "discord.js";
import { RoleMenuError, type RoleMenuService } from "@qbox/role-menus";

const customIdPrefix = "qbox:role-menu:";

export function roleMenuButtonCustomId(menuId: string, optionId: string): string {
  return `${customIdPrefix}${menuId}:${optionId}`;
}

export class DiscordRoleMenuInteractionHandler {
  public constructor(private readonly roleMenus: RoleMenuService) {}

  public async handleComponent(
    interaction: ButtonInteraction | StringSelectMenuInteraction,
  ): Promise<void> {
    if (!interaction.customId.startsWith(customIdPrefix)) return;
    if (!interaction.guildId || !interaction.channelId || !interaction.message.id) {
      await interaction.reply({ content: "Role menus are only available in the configured server.", ephemeral: true });
      return;
    }
    const [, , menuId, optionId] = interaction.customId.split(":");
    const optionIds = interaction.isStringSelectMenu() ? interaction.values : [optionId];
    const messages: string[] = [];
    try {
      for (const selectedOptionId of optionIds) {
        if (!selectedOptionId) throw new RoleMenuError("OPTION_NOT_FOUND", "Role menu option was not found.");
        const result = await this.roleMenus.resolveMemberInteraction({
          surface: interaction.isStringSelectMenu() ? "SELECT_MENU" : "BUTTON",
          guildId: interaction.guildId,
          channelId: interaction.channelId,
          messageId: interaction.message.id,
          memberId: interaction.user.id,
          ...(selectedOptionId ? { optionId: selectedOptionId } : {}),
        });
        messages.push(result.message);
      }
      await interaction.reply({ content: messages.join("\n") || `Role menu ${menuId} updated.`, ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: safeMessage(error), ephemeral: true });
    }
  }

  public async handleReaction(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
    direction: "add" | "remove",
  ): Promise<void> {
    if (user.bot) return;
    const resolved = reaction.partial ? await reaction.fetch() : reaction;
    const message = resolved.message.partial ? await resolved.message.fetch() : resolved.message;
    if (!message.guildId || !message.channelId) return;
    try {
      const emoji = resolved.emoji.id ?? resolved.emoji.name ?? undefined;
      if (!emoji) return;
      await this.roleMenus.resolveMemberInteraction({
        surface: "REACTION",
        guildId: message.guildId,
        channelId: message.channelId,
        messageId: message.id,
        memberId: user.id,
        direction,
        emoji,
      });
    } catch {
      if (direction === "add") {
        await resolved.users.remove(user.id).catch(() => undefined);
      }
    }
  }
}

function safeMessage(error: unknown): string {
  if (error instanceof RoleMenuError) return error.message;
  return "The role could not be changed. Check bot role hierarchy and permissions.";
}
