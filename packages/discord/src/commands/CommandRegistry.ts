import type {
  ChatInputCommandInteraction,
  GuildMember
} from "discord.js";

import type {
  PermissionService
} from "@qbox/permissions";

import type {
  DiscordCommand
} from "./DiscordCommand.js";

export class CommandRegistry {
  private readonly commands = new Map<
    string,
    DiscordCommand
  >();

  public constructor(
    private readonly permissionService: PermissionService
  ) {}

  public register(command: DiscordCommand): void {
    const commandName = command.data.name;

    if (this.commands.has(commandName)) {
      throw new Error(
        `Command '${commandName}' is already registered.`
      );
    }

    this.commands.set(commandName, command);
  }

  public get(
    commandName: string
  ): DiscordCommand | undefined {
    return this.commands.get(commandName);
  }

  public list(): readonly DiscordCommand[] {
    return [...this.commands.values()];
  }

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const command = this.get(interaction.commandName);

    if (!command) {
      await interaction.reply({
        content: "That command is not registered.",
        ephemeral: true
      });

      return;
    }

    const requiredPermissions =
      command.requiredPermissions ?? [];

    if (requiredPermissions.length > 0) {
      if (!interaction.inGuild()) {
        await interaction.reply({
          content: "This command can only be used in a server.",
          ephemeral: true
        });

        return;
      }

      const member = interaction.member as GuildMember;

      const allowed =
        this.permissionService.hasEveryPermission(
          {
            userId: interaction.user.id,
            roleIds: [...member.roles.cache.keys()]
          },
          requiredPermissions
        );

      if (!allowed) {
        await interaction.reply({
          content: "You do not have permission to use this command.",
          ephemeral: true
        });

        return;
      }
    }

    await command.execute(interaction);
  }
}
