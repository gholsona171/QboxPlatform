import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { DiscordCommand } from "../commands/DiscordCommand.js";
import {
  commandFileIdentity,
  CommandValidationError,
  CommandValidator
} from "../validation/CommandValidator.js";
import type {
  CommandDiagnostic,
  DiscoveredCommandModule
} from "../validation/CommandValidator.js";

export interface CommandLoadDiagnostics {
  readonly discovered: number;
  readonly validated: number;
  readonly loadDurationMs: number;
  readonly commandFiles: readonly string[];
  readonly commandNames: readonly string[];
  readonly commandAliases: readonly string[];
  readonly warnings: readonly CommandDiagnostic[];
  readonly failures: readonly CommandDiagnostic[];
}

export interface CommandLoadResult {
  readonly commands: readonly DiscordCommand[];
  readonly diagnostics: CommandLoadDiagnostics;
}

export class CommandLoadError extends Error {
  public constructor(
    message: string,
    public readonly diagnostics: CommandLoadDiagnostics
  ) {
    super(message);
    this.name = "CommandLoadError";
  }
}

export type CommandModuleImporter = (
  filePath: string
) => Promise<Record<string, unknown>>;

export interface CommandLoaderOptions {
  readonly commandDirectory?: string;
  readonly readDirectory?: (directory: string) => Promise<string[]>;
  readonly importModule?: CommandModuleImporter;
  readonly validator?: CommandValidator;
}

const commandFilePattern = /\.command\.(?:ts|js)$/;

function defaultCommandDirectory(): string {
  return fileURLToPath(
    new URL("../commands/", import.meta.url)
  );
}

async function defaultImportModule(
  filePath: string
): Promise<Record<string, unknown>> {
  return await import(pathToFileURL(filePath).href) as
    Record<string, unknown>;
}

export class CommandLoader {
  private readonly commandDirectory: string;
  private readonly readDirectory: (
    directory: string
  ) => Promise<string[]>;
  private readonly importModule: CommandModuleImporter;
  private readonly validator: CommandValidator;

  public constructor(options: CommandLoaderOptions = {}) {
    this.commandDirectory =
      options.commandDirectory ?? defaultCommandDirectory();
    this.readDirectory = options.readDirectory ?? readdir;
    this.importModule = options.importModule ?? defaultImportModule;
    this.validator = options.validator ?? new CommandValidator();
  }

  public async load(): Promise<CommandLoadResult> {
    const startedAt = performance.now();
    const files = (await this.readDirectory(this.commandDirectory))
      .filter((file) => commandFilePattern.test(file))
      .sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
    const discoveredModules: DiscoveredCommandModule[] = [];
    const importFailures: CommandDiagnostic[] = [];
    const discoveryWarnings: CommandDiagnostic[] = files.length === 0
      ? [{
          file: this.commandDirectory,
          message: "No command files were discovered."
        }]
      : [];
    const discoveredIdentities = new Map<string, string>();
    const duplicateFailures: CommandDiagnostic[] = [];

    for (const file of files) {
      const identity = commandFileIdentity(file);
      const existingFile = discoveredIdentities.get(identity);

      if (existingFile) {
        duplicateFailures.push({
          file,
          message: `Duplicate command file identity also used by '${existingFile}'.`
        });
      } else {
        discoveredIdentities.set(identity, file);
      }
    }

    if (duplicateFailures.length > 0) {
      throw new CommandLoadError(
        "Duplicate command files were discovered.",
        {
          discovered: files.length,
          validated: 0,
          loadDurationMs: performance.now() - startedAt,
          commandFiles: files,
          commandNames: [],
          commandAliases: [],
          warnings: discoveryWarnings,
          failures: duplicateFailures
        }
      );
    }

    for (const file of files) {
      const filePath = join(this.commandDirectory, file);

      try {
        discoveredModules.push({
          file,
          exports: await this.importModule(filePath)
        });
      } catch (error) {
        importFailures.push({
          file,
          message: error instanceof Error
            ? `Import failed: ${error.message}`
            : "Import failed with a non-Error value."
        });
      }
    }

    try {
      const validation = this.validator.validate(discoveredModules);
      const failures = [
        ...importFailures,
        ...validation.failures
      ];
      const diagnostics = {
        discovered: files.length,
        validated: validation.commands.length,
        loadDurationMs: performance.now() - startedAt,
        commandFiles: files,
        commandNames: validation.commands.map(
          (command) => command.data.name
        ),
        commandAliases: validation.commands.flatMap(
          (command) => command.aliases ?? []
        ),
        warnings: [
          ...discoveryWarnings,
          ...validation.warnings
        ],
        failures
      } satisfies CommandLoadDiagnostics;

      if (failures.length > 0) {
        throw new CommandLoadError(
          "Command loading failed validation.",
          diagnostics
        );
      }

      return {
        commands: validation.commands,
        diagnostics
      };
    } catch (error) {
      if (error instanceof CommandLoadError) {
        throw error;
      }

      if (error instanceof CommandValidationError) {
        throw new CommandLoadError(
          error.message,
          {
            discovered: files.length,
            validated: error.validatedCount,
            loadDurationMs: performance.now() - startedAt,
            commandFiles: files,
            commandNames: [],
            commandAliases: [],
            warnings: [
              ...discoveryWarnings,
              ...error.warnings
            ],
            failures: [
              ...importFailures,
              ...error.failures
            ]
          }
        );
      }

      throw error;
    }
  }
}
