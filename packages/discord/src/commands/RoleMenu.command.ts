import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  type GuildTextBasedChannel,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
} from "discord.js";
import type { RoleMenuAssignmentMode, RoleMenuPresentationType, RoleMenuService } from "@qbox/role-menus";
import { RoleMenuError } from "@qbox/role-menus";
import type { CommandExecutionContext, DiscordCommand } from "./DiscordCommand.js";
import { roleMenuButtonCustomId } from "../roleMenus/DiscordRoleMenuInteractionHandler.js";

export class RoleMenuCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;

  public readonly data = new SlashCommandBuilder()
    .setName("role-menu")
    .setDescription("Manage persistent Discord role menus.")
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("List role menus for this server."),
    )
    .addSubcommand((sub) =>
      sub
        .setName("create")
        .setDescription("Create a role-menu draft.")
        .addChannelOption((option) =>
          option.setName("channel").setDescription("Target channel.").addChannelTypes(ChannelType.GuildText).setRequired(true),
        )
        .addStringOption((option) => option.setName("title").setDescription("Menu title.").setRequired(true))
        .addStringOption((option) =>
          option
            .setName("presentation")
            .setDescription("Menu presentation.")
            .addChoices(
              { name: "Buttons", value: "BUTTONS" },
              { name: "Select menu", value: "SELECT_MENU" },
              { name: "Reactions", value: "REACTIONS" },
            )
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("mode")
            .setDescription("Assignment mode.")
            .addChoices(
              { name: "Toggle", value: "TOGGLE" },
              { name: "Add only", value: "ADD_ONLY" },
              { name: "Remove only", value: "REMOVE_ONLY" },
              { name: "Exclusive", value: "EXCLUSIVE" },
            )
            .setRequired(true),
        )
        .addStringOption((option) => option.setName("description").setDescription("Optional menu description.")),
    )
    .addSubcommand((sub) =>
      sub
        .setName("option-add")
        .setDescription("Add a role option.")
        .addStringOption((option) => option.setName("menu").setDescription("Role menu ID.").setRequired(true))
        .addRoleOption((option) => option.setName("role").setDescription("Discord role.").setRequired(true))
        .addStringOption((option) => option.setName("label").setDescription("Option label.").setRequired(true))
        .addStringOption((option) => option.setName("emoji").setDescription("Unicode or custom emoji identifier.")),
    )
    .addSubcommand((sub) =>
      sub
        .setName("option-edit")
        .setDescription("Edit a role option.")
        .addStringOption((option) => option.setName("menu").setDescription("Role menu ID.").setRequired(true))
        .addStringOption((option) => option.setName("option").setDescription("Option ID.").setRequired(true))
        .addStringOption((option) => option.setName("label").setDescription("New label."))
        .addStringOption((option) => option.setName("emoji").setDescription("New emoji.")),
    )
    .addSubcommand((sub) =>
      sub
        .setName("option-remove")
        .setDescription("Remove a role option.")
        .addStringOption((option) => option.setName("menu").setDescription("Role menu ID.").setRequired(true))
        .addStringOption((option) => option.setName("option").setDescription("Option ID.").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("publish")
        .setDescription("Publish or republish a role menu.")
        .addStringOption((option) => option.setName("menu").setDescription("Role menu ID.").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub.setName("disable").setDescription("Disable a role menu.").addStringOption((option) => option.setName("menu").setDescription("Role menu ID.").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub.setName("delete").setDescription("Delete a role menu.").addStringOption((option) => option.setName("menu").setDescription("Role menu ID.").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub.setName("inspect").setDescription("Inspect a role menu.").addStringOption((option) => option.setName("menu").setDescription("Role menu ID.").setRequired(true)),
    );

  public readonly policy = {
    contexts: "guild",
    permissions: {
      required: ["discord.role-menus.manage"],
      mode: "all",
      administratorOverride: true,
    },
    response: { acknowledgement: "deferred", visibility: "ephemeral" },
    concurrency: "user",
  } as const;

  public constructor(private readonly roleMenus?: RoleMenuService) {}

  public async execute(context: CommandExecutionContext): Promise<void> {
    try {
      await context.route.dispatch({
        list: () => this.list(context),
        create: () => this.create(context),
        "option-add": () => this.optionAdd(context),
        "option-edit": () => this.optionEdit(context),
        "option-remove": () => this.optionRemove(context),
        publish: () => this.publish(context),
        disable: () => this.disable(context),
        delete: () => this.delete(context),
        inspect: () => this.inspect(context),
      });
    } catch (error) {
      await context.editReply({ content: safeRoleMenuMessage(error) });
    }
  }

  private async list(context: CommandExecutionContext): Promise<void> {
    const menus = await this.requireService().listByGuild(context.interaction.guildId ?? "");
    await context.editReply({
      content: menus.length
        ? menus.map((menu) => `\`${menu.id}\` • ${menu.title} • ${menu.status} • ${menu.options.length} options`).join("\n")
        : "No role menus exist for this server.",
    });
  }

  private async create(context: CommandExecutionContext): Promise<void> {
    const channel = context.options.requiredChannel("channel");
    const description = context.options.optionalString("description");
    const menu = await this.requireService().createDraft({
      guildId: context.interaction.guildId ?? "",
      channelId: channel.id,
      title: context.options.requiredString("title"),
      ...(description === undefined ? {} : { description }),
      presentationType: parsePresentationType(context.options.requiredString("presentation")),
      assignmentMode: parseAssignmentMode(context.options.requiredString("mode")),
      createdByDiscordUserId: context.interaction.user.id,
    });
    await context.editReply({ content: `Created role-menu draft \`${menu.id}\`.` });
  }

  private async optionAdd(context: CommandExecutionContext): Promise<void> {
    const role = context.options.requiredRole("role");
    const emoji = context.options.optionalString("emoji");
    const menu = await this.requireService().addOption(context.options.requiredString("menu"), {
      roleId: role.id,
      label: context.options.requiredString("label"),
      ...(emoji === undefined ? {} : { emoji }),
    });
    await context.editReply({ content: `Added option. Menu now has ${menu.options.length} options.` });
  }

  private async optionEdit(context: CommandExecutionContext): Promise<void> {
    const label = context.options.optionalString("label");
    const emoji = context.options.optionalString("emoji");
    await this.requireService().updateOption(
      context.options.requiredString("menu"),
      context.options.requiredString("option"),
      {
        ...(label === undefined ? {} : { label }),
        ...(emoji === undefined ? {} : { emoji }),
      },
    );
    await context.editReply({ content: "Updated role-menu option." });
  }

  private async optionRemove(context: CommandExecutionContext): Promise<void> {
    const menu = await this.requireService().removeOption(context.options.requiredString("menu"), context.options.requiredString("option"));
    await context.editReply({ content: `Removed option. Menu now has ${menu.options.length} options.` });
  }

  private async publish(context: CommandExecutionContext): Promise<void> {
    const draft = await this.requireService().getById(context.options.requiredString("menu"));
    if (!draft) throw new RoleMenuError("NOT_FOUND", "Role menu was not found.");
    const channel = await context.interaction.client.channels.fetch(draft.channelId);
    if (!isSendableGuildTextChannel(channel)) throw new RoleMenuError("INVALID_INPUT", "Configured channel cannot receive role-menu messages.");
    const message = await channel.send(renderRoleMenuMessage(draft));
    const menu = await this.requireService().publish(draft.id, message.id);
    if (menu.presentationType === "REACTIONS") {
      for (const option of menu.options) if (option.emoji) await message.react(option.emoji);
    }
    await context.editReply({ content: `Published role menu \`${menu.id}\` to <#${menu.channelId}>.` });
  }

  private async disable(context: CommandExecutionContext): Promise<void> {
    await this.requireService().disable(context.options.requiredString("menu"));
    await context.editReply({ content: "Disabled role menu." });
  }

  private async delete(context: CommandExecutionContext): Promise<void> {
    await this.requireService().delete(context.options.requiredString("menu"));
    await context.editReply({ content: "Deleted role menu configuration. Existing Discord messages are not modified automatically." });
  }

  private async inspect(context: CommandExecutionContext): Promise<void> {
    const menu = await this.requireService().getById(context.options.requiredString("menu"));
    if (!menu) throw new RoleMenuError("NOT_FOUND", "Role menu was not found.");
    await context.editReply({
      content: `\`${menu.id}\` • ${menu.title}\nStatus: ${menu.status}\nPresentation: ${menu.presentationType}\nMode: ${menu.assignmentMode}\nOptions:\n${menu.options.map((option) => `- \`${option.id}\` ${option.emoji ?? ""} ${option.label} → <@&${option.roleId}>`).join("\n") || "None"}`,
    });
  }

  private requireService(): RoleMenuService {
    if (!this.roleMenus) {
      throw new RoleMenuError("DISABLED", "Role menus require the persistent database-backed runtime.");
    }
    return this.roleMenus;
  }
}

function renderRoleMenuMessage(menu: Awaited<ReturnType<RoleMenuService["getById"]>>) {
  if (!menu) throw new RoleMenuError("NOT_FOUND", "Role menu was not found.");
  const components = menu.presentationType === "BUTTONS"
    ? chunk(menu.options.slice(0, 25), 5).map((options) =>
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          options.map((option) =>
            new ButtonBuilder()
              .setCustomId(roleMenuButtonCustomId(menu.id, option.id))
              .setLabel(option.label)
              .setStyle(ButtonStyle.Secondary),
          ),
        ),
      )
    : menu.presentationType === "SELECT_MENU"
      ? [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(new StringSelectMenuBuilder().setCustomId(roleMenuButtonCustomId(menu.id, "select")).setPlaceholder(menu.title).addOptions(renderSelectOptions(menu)).setMinValues(1).setMaxValues(menu.assignmentMode === "EXCLUSIVE" ? 1 : Math.min(menu.options.length, 25)))]
      : [];
  return {
    content: `**${menu.title}**\n${menu.description ?? "Choose a role below."}`,
    components,
  };
}

function isSendableGuildTextChannel(channel: unknown): channel is GuildTextBasedChannel {
  return typeof channel === "object" && channel !== null && "send" in channel;
}

function parsePresentationType(value: string): RoleMenuPresentationType {
  if (value === "BUTTONS" || value === "SELECT_MENU" || value === "REACTIONS") return value;
  throw new RoleMenuError("INVALID_INPUT", "Unsupported role-menu presentation type.");
}

function parseAssignmentMode(value: string): RoleMenuAssignmentMode {
  if (value === "TOGGLE" || value === "ADD_ONLY" || value === "REMOVE_ONLY" || value === "EXCLUSIVE") return value;
  throw new RoleMenuError("INVALID_INPUT", "Unsupported role-menu assignment mode.");
}

function chunk<T>(values: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) chunks.push(values.slice(index, index + size));
  return chunks;
}

function renderSelectOptions(menu: NonNullable<Awaited<ReturnType<RoleMenuService["getById"]>>>) {
  return menu.options.map((option) => ({
    label: option.label,
    value: option.id,
    ...(option.description === undefined ? {} : { description: option.description }),
  }));
}

function safeRoleMenuMessage(error: unknown): string {
  if (error instanceof RoleMenuError) return error.message;
  return "Role-menu operation failed. Check the menu ID, bot permissions, and role hierarchy.";
}

export const command = new RoleMenuCommand();
