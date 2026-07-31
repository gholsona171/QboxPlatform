import { PERMISSIONS } from "@qbox/permissions";
import type { Permission } from "@qbox/permissions";

import type { DiscordCommand } from "../commands/DiscordCommand.js";

export interface DiscoveredCommandModule {
  readonly file: string;
  readonly exports: Record<string, unknown>;
}

export interface CommandDiagnostic {
  readonly file: string;
  readonly message: string;
}

export interface CommandValidationResult {
  readonly commands: readonly DiscordCommand[];
  readonly warnings: readonly CommandDiagnostic[];
  readonly failures: readonly CommandDiagnostic[];
}

export class CommandValidationError extends Error {
  public constructor(
    public readonly failures: readonly CommandDiagnostic[],
    public readonly warnings: readonly CommandDiagnostic[],
    public readonly validatedCount: number
  ) {
    super(
      `Command validation failed with ${failures.length} failure(s).`
    );
    this.name = "CommandValidationError";
  }
}

const permissionValues = new Set<string>(PERMISSIONS);
const commandNamePattern = /^[a-z0-9_-]{1,32}$/;

export function commandFileIdentity(file: string): string {
  return file
    .replace(/\.command\.(?:ts|js)$/, "")
    .toLowerCase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readCommandData(
  value: Record<string, unknown>
): { name: string; description: string } | undefined {
  const data = value.data;

  if (!isRecord(data) || typeof data.toJSON !== "function") {
    return undefined;
  }

  try {
    const json = data.toJSON() as unknown;

    if (
      !isRecord(json) ||
      typeof json.name !== "string" ||
      typeof json.description !== "string"
    ) {
      return undefined;
    }

    return {
      name: json.name,
      description: json.description
    };
  } catch {
    return undefined;
  }
}

export class CommandValidator {
  public validate(
    modules: readonly DiscoveredCommandModule[]
  ): CommandValidationResult {
    const failures: CommandDiagnostic[] = [];
    const warnings: CommandDiagnostic[] = [];
    const commands: DiscordCommand[] = [];
    const fileIdentities = new Map<string, string>();

    for (const module of modules) {
      const identity = commandFileIdentity(module.file);
      const existingFile = fileIdentities.get(identity);

      if (existingFile) {
        failures.push({
          file: module.file,
          message: `Duplicate command file identity also used by '${existingFile}'.`
        });
        continue;
      }

      fileIdentities.set(identity, module.file);

      if (!Object.hasOwn(module.exports, "command")) {
        failures.push({
          file: module.file,
          message: "Command module must export a named 'command' value."
        });
        continue;
      }

      const candidate = module.exports.command;

      if (!isRecord(candidate)) {
        failures.push({
          file: module.file,
          message: "The named 'command' export must be an object."
        });
        continue;
      }

      const candidateFailures = this.validateCommand(
        module.file,
        candidate
      );

      if (candidateFailures.length > 0) {
        failures.push(...candidateFailures);
        continue;
      }

      commands.push(candidate as unknown as DiscordCommand);
    }

    this.validateUniqueNames(commands, modules, failures);

    if (failures.length > 0) {
      throw new CommandValidationError(
        failures,
        warnings,
        commands.length
      );
    }

    return { commands, warnings, failures };
  }

  private validateCommand(
    file: string,
    candidate: Record<string, unknown>
  ): CommandDiagnostic[] {
    const failures: CommandDiagnostic[] = [];
    const data = readCommandData(candidate);

    if (candidate.type !== "chat-input") {
      failures.push({
        file,
        message: `Unsupported command type '${String(candidate.type)}'.`
      });
    }

    if (!data) {
      failures.push({
        file,
        message: "Command metadata must provide serializable name and description values."
      });
    } else {
      if (!commandNamePattern.test(data.name)) {
        failures.push({
          file,
          message: `Command name '${data.name}' is invalid.`
        });
      }

      if (data.description.length < 1 || data.description.length > 100) {
        failures.push({
          file,
          message: "Command description must contain between 1 and 100 characters."
        });
      }
    }

    if (typeof candidate.execute !== "function") {
      failures.push({
        file,
        message: "Command must implement execute()."
      });
    }

    if (
      candidate.deferReply !== undefined &&
      typeof candidate.deferReply !== "boolean"
    ) {
      failures.push({
        file,
        message: "Command deferReply metadata must be a boolean."
      });
    }

    if (
      candidate.aliases !== undefined &&
      !Array.isArray(candidate.aliases)
    ) {
      failures.push({
        file,
        message: "Command aliases must be an array."
      });
    } else if (Array.isArray(candidate.aliases)) {
      const localAliases = new Set<string>();

      for (const alias of candidate.aliases) {
        if (typeof alias !== "string" || !commandNamePattern.test(alias)) {
          failures.push({
            file,
            message: `Command alias '${String(alias)}' is invalid.`
          });
        } else if (localAliases.has(alias)) {
          failures.push({
            file,
            message: `Command alias '${alias}' is duplicated.`
          });
        }

        if (typeof alias === "string") {
          localAliases.add(alias);
        }
      }
    }

    if (
      candidate.requiredPermissions !== undefined &&
      !Array.isArray(candidate.requiredPermissions)
    ) {
      failures.push({
        file,
        message: "Required permissions must be an array."
      });
    } else if (Array.isArray(candidate.requiredPermissions)) {
      const localPermissions = new Set<Permission>();

      for (const permission of candidate.requiredPermissions) {
        if (
          typeof permission !== "string" ||
          !permissionValues.has(permission)
        ) {
          failures.push({
            file,
            message: `Required permission '${String(permission)}' is unsupported.`
          });
        } else if (localPermissions.has(permission as Permission)) {
          failures.push({
            file,
            message: `Required permission '${permission}' is duplicated.`
          });
        } else {
          localPermissions.add(permission as Permission);
        }
      }
    }

    return failures;
  }

  private validateUniqueNames(
    commands: readonly DiscordCommand[],
    modules: readonly DiscoveredCommandModule[],
    failures: CommandDiagnostic[]
  ): void {
    const owners = new Map<string, string>();

    for (const command of commands) {
      const file = modules.find(
        (module) => module.exports.command === command
      )?.file ?? "unknown";
      const names = [command.data.name, ...(command.aliases ?? [])];

      for (const name of names) {
        const owner = owners.get(name);

        if (owner) {
          failures.push({
            file,
            message: `Command name or alias '${name}' is already owned by '${owner}'.`
          });
        } else {
          owners.set(name, file);
        }
      }
    }
  }
}
