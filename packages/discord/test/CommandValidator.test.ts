import { SlashCommandBuilder } from "discord.js";
import type {
  ChatInputCommandInteraction
} from "discord.js";
import { describe, expect, it } from "vitest";

import type {
  DiscordCommand
} from "../src/commands/DiscordCommand.js";
import {
  CommandValidationError,
  CommandValidator
} from "../src/validation/CommandValidator.js";
import type {
  DiscoveredCommandModule
} from "../src/validation/CommandValidator.js";

function createCommand(
  name: string,
  aliases: readonly string[] = []
): DiscordCommand {
  return {
    type: "chat-input",
    data: new SlashCommandBuilder()
      .setName(name)
      .setDescription(`Runs the ${name} command.`),
    aliases,
    async execute(
      _interaction: ChatInputCommandInteraction
    ): Promise<void> {}
  };
}

function moduleFor(
  file: string,
  command: unknown
): DiscoveredCommandModule {
  return {
    file,
    exports: { command }
  };
}

function validateFailure(
  modules: readonly DiscoveredCommandModule[]
): CommandValidationError {
  try {
    new CommandValidator().validate(modules);
  } catch (error) {
    expect(error).toBeInstanceOf(CommandValidationError);
    return error as CommandValidationError;
  }

  throw new Error("Expected command validation to fail.");
}

describe("CommandValidator", () => {
  it("rejects duplicate command names", () => {
    const error = validateFailure([
      moduleFor("First.command.ts", createCommand("duplicate")),
      moduleFor("Second.command.ts", createCommand("duplicate"))
    ]);

    expect(error.failures).toContainEqual({
      file: "Second.command.ts",
      message: "Command name or alias 'duplicate' is already owned by 'First.command.ts'."
    });
  });

  it("rejects modules without the explicit command export", () => {
    const error = validateFailure([
      {
        file: "Invalid.command.ts",
        exports: { default: createCommand("invalid") }
      }
    ]);

    expect(error.failures[0]?.message).toContain(
      "must export a named 'command'"
    );
  });

  it("rejects commands without execute", () => {
    const command = createCommand("missing-execute");
    const { execute: _execute, ...withoutExecute } = command;
    const error = validateFailure([
      moduleFor("Missing.command.ts", withoutExecute)
    ]);

    expect(error.failures).toContainEqual({
      file: "Missing.command.ts",
      message: "Command must implement execute()."
    });
  });

  it("rejects duplicate aliases", () => {
    const error = validateFailure([
      moduleFor(
        "First.command.ts",
        createCommand("first", ["shared"])
      ),
      moduleFor(
        "Second.command.ts",
        createCommand("second", ["shared"])
      )
    ]);

    expect(error.failures[0]?.message).toContain(
      "'shared' is already owned"
    );
  });

  it("rejects duplicate source and compiled file identities", () => {
    const error = validateFailure([
      moduleFor("Ping.command.ts", createCommand("ping")),
      moduleFor("Ping.command.js", createCommand("other"))
    ]);

    expect(error.failures[0]?.message).toContain(
      "Duplicate command file identity"
    );
  });

  it("rejects unsupported command types", () => {
    const error = validateFailure([
      moduleFor("Message.command.ts", {
        ...createCommand("message"),
        type: "message"
      })
    ]);

    expect(error.failures).toContainEqual({
      file: "Message.command.ts",
      message: "Unsupported command type 'message'."
    });
  });

  it("rejects invalid descriptions", () => {
    const error = validateFailure([
      moduleFor("Description.command.ts", {
        type: "chat-input",
        data: {
          toJSON: () => ({
            name: "description",
            description: ""
          })
        },
        async execute(): Promise<void> {}
      })
    ]);

    expect(error.failures[0]?.message).toContain(
      "between 1 and 100 characters"
    );
  });

  it("rejects unsupported permissions", () => {
    const error = validateFailure([
      moduleFor("Permission.command.ts", {
        ...createCommand("permission"),
        requiredPermissions: ["platform.superuser"]
      })
    ]);

    expect(error.failures[0]?.message).toContain(
      "Required permission 'platform.superuser' is unsupported"
    );
  });

  it("validates an explicit command export successfully", () => {
    const command = createCommand("valid", ["valid-alias"]);
    const result = new CommandValidator().validate([
      moduleFor("Valid.command.ts", command)
    ]);

    expect(result.commands).toEqual([command]);
    expect(result.failures).toEqual([]);
    expect(result.warnings).toEqual([]);
  });
});
