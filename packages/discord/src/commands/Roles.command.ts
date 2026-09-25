import { SlashCommandBuilder } from "discord.js";
import { RoleManagementError, type RoleManagementService } from "@qbox/discord-roles";
import type { CommandExecutionContext, DiscordCommand } from "./DiscordCommand.js";
import { BRAND } from "@qbox/shared/brand";

export class RolesCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;

  public readonly data = new SlashCommandBuilder()
    .setName("roles")
    .setDescription(`Manage Discord roles through ${BRAND.name} role-management rules.`)
    .addSubcommand((sub) => sub.setName("list").setDescription("List manageable Discord roles."))
    .addSubcommand((sub) =>
      sub.setName("inspect").setDescription("Inspect a Discord role.").addRoleOption((option) => option.setName("role").setDescription("Role.").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("create")
        .setDescription("Create a Discord role.")
        .addStringOption((option) => option.setName("name").setDescription("Role name.").setRequired(true))
        .addStringOption((option) => option.setName("color").setDescription("Hex color, for example #5865f2."))
        .addBooleanOption((option) => option.setName("hoist").setDescription("Display separately."))
        .addBooleanOption((option) => option.setName("mentionable").setDescription("Allow members to mention the role.")),
    )
    .addSubcommand((sub) =>
      sub
        .setName("edit")
        .setDescription("Edit a Discord role.")
        .addRoleOption((option) => option.setName("role").setDescription("Role.").setRequired(true))
        .addStringOption((option) => option.setName("name").setDescription("New role name."))
        .addStringOption((option) => option.setName("color").setDescription("New hex color."))
        .addBooleanOption((option) => option.setName("hoist").setDescription("Display separately."))
        .addBooleanOption((option) => option.setName("mentionable").setDescription("Allow members to mention the role.")),
    )
    .addSubcommand((sub) =>
      sub
        .setName("delete")
        .setDescription("Delete a Discord role after confirmation.")
        .addRoleOption((option) => option.setName("role").setDescription("Role.").setRequired(true))
        .addStringOption((option) => option.setName("confirmation").setDescription("Type the role name or 'delete <role name>'.").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("move")
        .setDescription("Move a Discord role to a new hierarchy position.")
        .addRoleOption((option) => option.setName("role").setDescription("Role.").setRequired(true))
        .addIntegerOption((option) => option.setName("position").setDescription("New hierarchy position.").setRequired(true)),
    )
    .addSubcommand((sub) => sub.setName("hierarchy").setDescription("Inspect bot role-management capability."))
    .addSubcommand((sub) =>
      sub.setName("dependencies").setDescription(`List ${BRAND.name} feature dependencies for a role.`).addRoleOption((option) => option.setName("role").setDescription("Role.").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("replace-dependency")
        .setDescription(`Replace ${BRAND.name} references from one role to another.`)
        .addRoleOption((option) => option.setName("old-role").setDescription("Existing role.").setRequired(true))
        .addRoleOption((option) => option.setName("new-role").setDescription("Replacement role.").setRequired(true)),
    );

  public readonly policy = {
    contexts: "guild",
    permissions: {
      required: ["discord.roles.manage"],
      mode: "all",
      administratorOverride: true,
    },
    response: { acknowledgement: "deferred", visibility: "ephemeral" },
    concurrency: "user",
  } as const;

  public constructor(private readonly roles?: RoleManagementService) {}

  public async execute(context: CommandExecutionContext): Promise<void> {
    try {
      await context.route.dispatch({
        list: () => this.list(context),
        inspect: () => this.inspect(context),
        create: () => this.create(context),
        edit: () => this.edit(context),
        delete: () => this.delete(context),
        move: () => this.move(context),
        hierarchy: () => this.hierarchy(context),
        dependencies: () => this.dependencies(context),
        "replace-dependency": () => this.replaceDependency(context),
      });
    } catch (error) {
      await context.editReply({ content: safeRoleMessage(error) });
    }
  }

  private async list(context: CommandExecutionContext): Promise<void> {
    const roles = await this.service().listRoles(this.guildId(context));
    await context.editReply({
      content: roles
        .filter((role) => role.id !== role.guildId)
        .slice(0, 25)
        .map((role) => `${role.assignable ? "OK" : "BLOCKED"} <@&${role.id}> position ${role.position}${role.dependencyCount ? `, ${role.dependencyCount} ${BRAND.name} dependencies` : ""}${role.unavailableReason ? ` - ${role.unavailableReason}` : ""}`)
        .join("\n") || "No Discord roles were found.",
    });
  }

  private async inspect(context: CommandExecutionContext): Promise<void> {
    const role = await this.service().inspectRole(this.guildId(context), context.options.requiredRole("role").id);
    await context.editReply({ content: roleSummary(role) });
  }

  private async create(context: CommandExecutionContext): Promise<void> {
    const color = context.options.optionalString("color");
    const role = await this.service().createRole({
      guildId: this.guildId(context),
      name: context.options.requiredString("name"),
      ...(color === undefined ? {} : { color }),
      ...(context.options.optionalBoolean("hoist") === undefined ? {} : { hoist: context.options.optionalBoolean("hoist") }),
      ...(context.options.optionalBoolean("mentionable") === undefined ? {} : { mentionable: context.options.optionalBoolean("mentionable") }),
      actor: { type: "discord-user", id: context.interaction.user.id },
      source: "DISCORD",
    });
    await context.editReply({ content: `Created role <@&${role.id}> at position ${role.position}.` });
  }

  private async edit(context: CommandExecutionContext): Promise<void> {
    const color = context.options.optionalString("color");
    const name = context.options.optionalString("name");
    const hoist = context.options.optionalBoolean("hoist");
    const mentionable = context.options.optionalBoolean("mentionable");
    const role = await this.service().editRole({
      guildId: this.guildId(context),
      roleId: context.options.requiredRole("role").id,
      ...(name === undefined ? {} : { name }),
      ...(color === undefined ? {} : { color }),
      ...(hoist === undefined ? {} : { hoist }),
      ...(mentionable === undefined ? {} : { mentionable }),
      actor: { type: "discord-user", id: context.interaction.user.id },
      source: "DISCORD",
    });
    await context.editReply({ content: `Updated role <@&${role.id}>.` });
  }

  private async delete(context: CommandExecutionContext): Promise<void> {
    const role = context.options.requiredRole("role");
    await this.service().deleteRole({
      guildId: this.guildId(context),
      roleId: role.id,
      confirmation: context.options.requiredString("confirmation"),
      actor: { type: "discord-user", id: context.interaction.user.id },
      source: "DISCORD",
    });
    await context.editReply({ content: `Deleted role ${role.name}.` });
  }

  private async move(context: CommandExecutionContext): Promise<void> {
    const role = await this.service().moveRole({
      guildId: this.guildId(context),
      roleId: context.options.requiredRole("role").id,
      position: context.options.requiredInteger("position"),
      actor: { type: "discord-user", id: context.interaction.user.id },
      source: "DISCORD",
    });
    await context.editReply({ content: `Moved <@&${role.id}> to position ${role.position}.` });
  }

  private async hierarchy(context: CommandExecutionContext): Promise<void> {
    const capabilities = await this.service().capabilities(this.guildId(context));
    await context.editReply({ content: `Discord roles connected: ${capabilities.connected ? "yes" : "no"}\nManage Roles: ${capabilities.canManageRoles ? "yes" : "no"}\nBot highest role position: ${capabilities.botHighestRolePosition}${capabilities.reason ? `\n${capabilities.reason}` : ""}` });
  }

  private async dependencies(context: CommandExecutionContext): Promise<void> {
    const dependencies = await this.service().listDependencies(this.guildId(context), context.options.requiredRole("role").id);
    await context.editReply({ content: dependencies.map((dependency) => `${dependency.feature}: ${dependency.label} (${dependency.field})`).join("\n") || `No ${BRAND.name} dependencies reference that role.` });
  }

  private async replaceDependency(context: CommandExecutionContext): Promise<void> {
    const changed = await this.service().replaceDependency({
      guildId: this.guildId(context),
      oldRoleId: context.options.requiredRole("old-role").id,
      newRoleId: context.options.requiredRole("new-role").id,
      actor: { type: "discord-user", id: context.interaction.user.id },
      source: "DISCORD",
    });
    await context.editReply({ content: `Replaced ${changed} ${BRAND.name} role dependency record(s).` });
  }

  private service(): RoleManagementService {
    if (!this.roles) throw new RoleManagementError("DISCORD_UNAVAILABLE", "Role management requires the live Discord runtime.");
    return this.roles;
  }

  private guildId(context: CommandExecutionContext): string {
    return context.interaction.guildId ?? "";
  }
}

function roleSummary(role: Awaited<ReturnType<RoleManagementService["inspectRole"]>>): string {
  return [
    `<@&${role.id}>`,
    `ID: ${role.id}`,
    `Color: ${role.color}`,
    `Position: ${role.position}`,
    `Managed: ${role.managed ? "yes" : "no"}`,
    `Hoisted: ${role.hoisted ? "yes" : "no"}`,
    `Mentionable: ${role.mentionable ? "yes" : "no"}`,
    `Assignable: ${role.assignable ? "yes" : "no"}`,
    `Editable: ${role.editable ? "yes" : "no"}`,
    `Dependencies: ${role.dependencyCount}`,
    ...(role.unavailableReason ? [`Reason: ${role.unavailableReason}`] : []),
  ].join("\n");
}

function safeRoleMessage(error: unknown): string {
  if (error instanceof RoleManagementError) return error.message;
  return "Role operation failed. Check bot permissions and Discord role hierarchy.";
}

export const command = new RolesCommand();
