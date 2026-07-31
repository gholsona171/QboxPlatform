import { SlashCommandBuilder } from "discord.js";
import type {
  ChatInputCommandInteraction
} from "discord.js";
import { describe, expect, it, vi } from "vitest";

import { PermissionService } from "@qbox/permissions";

import type {
  DiscordCommand
} from "../src/commands/DiscordCommand.js";
import {
  CommandRegistry
} from "../src/commands/CommandRegistry.js";

function createInteraction(
  roleIds: readonly string[],
  inGuild = true
): {
  interaction: ChatInputCommandInteraction;
  reply: ReturnType<typeof vi.fn>;
} {
  const reply = vi.fn(async () => undefined);

  const interaction = {
    commandName: "secure",
    inGuild: () => inGuild,
    member: {
      roles: {
        cache: new Map(roleIds.map((roleId) => [roleId, {}]))
      }
    },
    user: {
      id: "user-1"
    },
    reply
  } as unknown as ChatInputCommandInteraction;

  return { interaction, reply };
}

function createProtectedCommand(): {
  command: DiscordCommand;
  execute: ReturnType<typeof vi.fn>;
} {
  const execute = vi.fn(
    async (_interaction: ChatInputCommandInteraction) => undefined
  );

  return {
    command: {
      type: "chat-input",
      data: new SlashCommandBuilder()
        .setName("secure")
        .setDescription("A protected test command."),
      requiredPermissions: ["platform.admin"],
      execute
    },
    execute
  };
}

describe("CommandRegistry permission enforcement", () => {
  it("executes a protected command for a role with every permission", async () => {
    const permissions = new PermissionService();
    const registry = new CommandRegistry(permissions);
    const { command, execute } = createProtectedCommand();
    const { interaction, reply } = createInteraction(["admin"]);

    permissions.registerGrant({
      roleId: "admin",
      permissions: ["platform.admin"]
    });
    registry.register(command);

    await registry.execute(interaction);

    expect(execute).toHaveBeenCalledOnce();
    expect(execute).toHaveBeenCalledWith(interaction);
    expect(reply).not.toHaveBeenCalled();
  });

  it("rejects a protected command when the member lacks permission", async () => {
    const registry = new CommandRegistry(
      new PermissionService()
    );
    const { command, execute } = createProtectedCommand();
    const { interaction, reply } = createInteraction(["member"]);

    registry.register(command);

    await registry.execute(interaction);

    expect(execute).not.toHaveBeenCalled();
    expect(reply).toHaveBeenCalledWith({
      content: "You do not have permission to use this command.",
      ephemeral: true
    });
  });

  it("rejects a protected command outside a guild", async () => {
    const registry = new CommandRegistry(
      new PermissionService()
    );
    const { command, execute } = createProtectedCommand();
    const { interaction, reply } = createInteraction([], false);

    registry.register(command);

    await registry.execute(interaction);

    expect(execute).not.toHaveBeenCalled();
    expect(reply).toHaveBeenCalledWith({
      content: "This command can only be used in a server.",
      ephemeral: true
    });
  });
});

describe("CommandRegistry registration", () => {
  it("registers commands and aliases successfully", () => {
    const registry = new CommandRegistry(
      new PermissionService()
    );
    const { command } = createProtectedCommand();
    const commandWithAlias: DiscordCommand = {
      ...command,
      aliases: ["secure-alias"]
    };

    expect(registry.registerAll([commandWithAlias])).toBe(1);
    expect(registry.get("secure")).toBe(commandWithAlias);
    expect(registry.get("secure-alias")).toBe(commandWithAlias);
    expect(registry.list()).toEqual([commandWithAlias]);
  });

  it("aborts registration without partial writes on a duplicate", () => {
    const registry = new CommandRegistry(
      new PermissionService()
    );
    const { command } = createProtectedCommand();
    const duplicate: DiscordCommand = {
      ...command,
      aliases: ["secure"]
    };

    expect(() => registry.registerAll([command, duplicate]))
      .toThrow("Command name or alias 'secure' is already registered.");
    expect(registry.list()).toEqual([]);
  });
});
