import type {
  ChatInputCommandInteraction,
  GuildMember
} from "discord.js";

import type {
  PermissionService
} from "@qbox/permissions";

import type {
  CommandExecutionContext,
  DiscordCommand
} from "./DiscordCommand.js";

export class CommandRegistry {
  private readonly commandsByName = new Map<
    string,
    DiscordCommand
  >();
  private readonly primaryCommands = new Map<
    string,
    DiscordCommand
  >();

  public constructor(
    private readonly permissionService: PermissionService
  ) {}

  public register(command: DiscordCommand): void {
    this.registerAll([command]);
  }

  public registerAll(
    commands: readonly DiscordCommand[]
  ): number {
    const pendingNames = new Set(this.commandsByName.keys());

    for (const command of commands) {
      const names = [command.data.name, ...(command.aliases ?? [])];

      for (const name of names) {
        if (pendingNames.has(name)) {
          throw new Error(
            `Command name or alias '${name}' is already registered.`
          );
        }

        pendingNames.add(name);
      }
    }

    for (const command of commands) {
      this.primaryCommands.set(command.data.name, command);
      this.commandsByName.set(command.data.name, command);

      for (const alias of command.aliases ?? []) {
        this.commandsByName.set(alias, command);
      }
    }

    return commands.length;
  }

  public get(
    commandName: string
  ): DiscordCommand | undefined {
    return this.commandsByName.get(commandName);
  }

  public list(): readonly DiscordCommand[] {
    return [...this.primaryCommands.values()];
  }

  public deploymentData(): ReturnType<
    DiscordCommand["data"]["toJSON"]
  >[] {
    return this.list().flatMap((command) => {
      const data = command.data.toJSON();

      return [
        data,
        ...(command.aliases ?? []).map((alias) => ({
          ...data,
          name: alias
        }))
      ];
    });
  }

  public async execute(
    interaction: ChatInputCommandInteraction,
    context: CommandExecutionContext = {
      signal: new AbortController().signal
    }
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

    await command.execute(interaction, context);
  }
}
