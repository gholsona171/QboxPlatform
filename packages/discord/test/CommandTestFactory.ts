import { SlashCommandBuilder } from "discord.js";
import {
  InMemoryPermissionRepository,
  PersistentPermissionService,
} from "@qbox/permissions";
import type { PermissionAssignment } from "@qbox/permissions";

import type {
  CommandExecutionPolicy,
  DiscordCommand,
} from "../src/commands/DiscordCommand.js";

export const defaultPolicy: CommandExecutionPolicy = {
  contexts: "both",
  response: {
    acknowledgement: "immediate",
    visibility: "ephemeral",
  },
  concurrency: "unlimited",
};

export function createTestAuthorizer(
  assignments: readonly PermissionAssignment[] = [],
) {
  return new PersistentPermissionService(
    new InMemoryPermissionRepository(assignments),
  );
}

export function createCommand(
  name: string,
  overrides: Partial<DiscordCommand> = {},
): DiscordCommand {
  return {
    type: "chat-input",
    data: new SlashCommandBuilder()
      .setName(name)
      .setDescription(`Runs the ${name} command.`),
    policy: defaultPolicy,
    async execute(): Promise<void> {},
    ...overrides,
  };
}

export function createOptionsCommand(): DiscordCommand {
  return createCommand("options", {
    data: new SlashCommandBuilder()
      .setName("options")
      .setDescription("Tests required and optional command options.")
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Required reason.")
          .setRequired(true),
      )
      .addIntegerOption((option) =>
        option.setName("duration").setDescription("Optional duration."),
      ),
  });
}

export function createSubcommandCommand(): DiscordCommand {
  return createCommand("subcommand", {
    data: new SlashCommandBuilder()
      .setName("subcommand")
      .setDescription("Tests a single subcommand.")
      .addSubcommand((subcommand) =>
        subcommand.setName("create").setDescription("Creates a test value."),
      ),
  });
}

export function createGroupedSubcommandCommand(): DiscordCommand {
  return createCommand("grouped", {
    data: new SlashCommandBuilder()
      .setName("grouped")
      .setDescription("Tests a grouped subcommand.")
      .addSubcommandGroup((group) =>
        group
          .setName("staff")
          .setDescription("Staff test routes.")
          .addSubcommand((subcommand) =>
            subcommand
              .setName("add")
              .setDescription("Adds a test staff member."),
          ),
      ),
  });
}
