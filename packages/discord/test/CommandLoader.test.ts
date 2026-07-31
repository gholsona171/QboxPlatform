import { basename } from "node:path";

import { SlashCommandBuilder } from "discord.js";
import type {
  ChatInputCommandInteraction
} from "discord.js";
import { describe, expect, it, vi } from "vitest";

import type {
  DiscordCommand
} from "../src/commands/DiscordCommand.js";
import { CommandLoader } from "../src/loaders/CommandLoader.js";
import { CommandLoadError } from "../src/loaders/CommandLoader.js";

function createCommand(name: string): DiscordCommand {
  return {
    type: "chat-input",
    data: new SlashCommandBuilder()
      .setName(name)
      .setDescription(`Runs the ${name} command.`),
    async execute(
      _interaction: ChatInputCommandInteraction
    ): Promise<void> {}
  };
}

describe("CommandLoader", () => {
  it("discovers and imports command files in deterministic order", async () => {
    const imported: string[] = [];
    const commands = new Map([
      ["Alpha.command.ts", createCommand("alpha")],
      ["Zulu.command.ts", createCommand("zulu")]
    ]);
    const loader = new CommandLoader({
      commandDirectory: "commands",
      readDirectory: async () => [
        "Zulu.command.ts",
        "DiscordCommand.ts",
        "Alpha.command.ts"
      ],
      importModule: async (filePath) => {
        const file = basename(filePath);
        imported.push(file);

        return { command: commands.get(file) };
      }
    });

    const result = await loader.load();

    expect(imported).toEqual([
      "Alpha.command.ts",
      "Zulu.command.ts"
    ]);
    expect(result.commands.map((command) => command.data.name))
      .toEqual(["alpha", "zulu"]);
    expect(result.diagnostics.discovered).toBe(2);
    expect(result.diagnostics.validated).toBe(2);
    expect(result.diagnostics.failures).toEqual([]);
  });

  it("rejects duplicate file identities before importing either file", async () => {
    const importModule = vi.fn(
      async () => ({ command: createCommand("unused") })
    );
    const loader = new CommandLoader({
      commandDirectory: "commands",
      readDirectory: async () => [
        "Ping.command.ts",
        "Ping.command.js"
      ],
      importModule
    });

    await expect(loader.load()).rejects.toBeInstanceOf(
      CommandLoadError
    );
    expect(importModule).not.toHaveBeenCalled();
  });
});
