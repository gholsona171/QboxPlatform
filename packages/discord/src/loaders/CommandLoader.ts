import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { DiscordCommand } from "../commands/DiscordCommand.js";

type CommandConstructor = new () => DiscordCommand;

function isCommandConstructor(
  value: unknown
): value is CommandConstructor {
  if (typeof value !== "function") {
    return false;
  }

  const prototype = value.prototype as
    | { execute?: unknown }
    | undefined;

  return typeof prototype?.execute === "function";
}

export class CommandLoader {
  public async load(): Promise<DiscordCommand[]> {
    const commandDirectory = fileURLToPath(
      new URL("../commands/", import.meta.url)
    );

    const files = await readdir(commandDirectory);

    const commandFiles = files.filter(
      (file) =>
        file.endsWith("Command.ts") ||
        file.endsWith("Command.js")
    ).filter(
      (file) => file !== "DiscordCommand.ts" &&
                file !== "DiscordCommand.js"
    );

    const commands: DiscordCommand[] = [];

    for (const file of commandFiles) {
      const filePath = join(commandDirectory, file);
      const importedModule = await import(
        pathToFileURL(filePath).href
      );

      const CommandClass = Object.values(
        importedModule
      ).find(isCommandConstructor);

      if (!CommandClass) {
        throw new Error(
          `No command class was found in '${file}'.`
        );
      }

      commands.push(new CommandClass());
    }

    return commands;
  }
}
