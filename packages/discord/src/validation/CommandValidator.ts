import { ApplicationCommandOptionType } from "discord.js";

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
): {
  name: string;
  description: string;
  options: unknown;
} | undefined {
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
      description: json.description,
      options: json.options
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

      failures.push(...this.validateOptions(file, data.options));
    }

    if (typeof candidate.execute !== "function") {
      failures.push({
        file,
        message: "Command must implement execute()."
      });
    }

    failures.push(...this.validatePolicy(file, candidate.policy));

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

    return failures;
  }

  private validateOptions(
    file: string,
    value: unknown
  ): CommandDiagnostic[] {
    if (value === undefined) {
      return [];
    }

    if (!Array.isArray(value)) {
      return [{
        file,
        message: "Command options must be an array."
      }];
    }

    const failures: CommandDiagnostic[] = [];
    const optionKinds = value
      .filter(isRecord)
      .map((option) => option.type);
    const hasRoutes = optionKinds.some((type) =>
      type === ApplicationCommandOptionType.Subcommand ||
      type === ApplicationCommandOptionType.SubcommandGroup);
    const hasValues = optionKinds.some((type) =>
      type !== ApplicationCommandOptionType.Subcommand &&
      type !== ApplicationCommandOptionType.SubcommandGroup);

    if (hasRoutes && hasValues) {
      failures.push({
        file,
        message: "Top-level value options cannot be mixed with subcommands or subcommand groups."
      });
    }

    this.validateOptionList(file, value, "command", "top", failures);
    return failures;
  }

  private validateOptionList(
    file: string,
    options: readonly unknown[],
    location: string,
    level: "top" | "group" | "subcommand",
    failures: CommandDiagnostic[]
  ): void {
    const names = new Set<string>();
    let optionalValueSeen = false;

    for (const optionValue of options) {
      if (!isRecord(optionValue)) {
        failures.push({
          file,
          message: `Option in '${location}' must be an object.`
        });
        continue;
      }

      const name = optionValue.name;
      const type = optionValue.type;

      if (typeof name !== "string" || !commandNamePattern.test(name)) {
        failures.push({
          file,
          message: `Option name '${String(name)}' in '${location}' is invalid.`
        });
      } else if (names.has(name)) {
        failures.push({
          file,
          message: `Option name '${name}' is duplicated in '${location}'.`
        });
      } else {
        names.add(name);
      }

      if (
        typeof type !== "number" ||
        type < ApplicationCommandOptionType.Subcommand ||
        type > ApplicationCommandOptionType.Attachment
      ) {
        failures.push({
          file,
          message: `Option '${String(name)}' uses unsupported type '${String(type)}'.`
        });
        continue;
      }

      const isSubcommand = type === ApplicationCommandOptionType.Subcommand;
      const isGroup = type === ApplicationCommandOptionType.SubcommandGroup;

      if (level === "group" && !isSubcommand) {
        failures.push({
          file,
          message: `Subcommand group '${location}' may contain only subcommands.`
        });
      }

      if (level === "subcommand" && (isSubcommand || isGroup)) {
        failures.push({
          file,
          message: `Subcommand '${location}' cannot contain nested command routes.`
        });
      }

      if (isSubcommand || isGroup) {
        const children = optionValue.options;

        if (children !== undefined && !Array.isArray(children)) {
          failures.push({
            file,
            message: `Options for command route '${String(name)}' must be an array.`
          });
          continue;
        }

        if (isGroup && (!Array.isArray(children) || children.length === 0)) {
          failures.push({
            file,
            message: `Subcommand group '${String(name)}' must contain at least one subcommand.`
          });
          continue;
        }

        if (Array.isArray(children)) {
          this.validateOptionList(
            file,
            children,
            typeof name === "string" ? name : location,
            isGroup ? "group" : "subcommand",
            failures
          );
        }

        continue;
      }

      const required = optionValue.required === true;

      if (!required) {
        optionalValueSeen = true;
      } else if (optionalValueSeen) {
        failures.push({
          file,
          message: `Required option '${String(name)}' must precede optional options in '${location}'.`
        });
      }
    }
  }

  private validatePolicy(
    file: string,
    value: unknown
  ): CommandDiagnostic[] {
    const failures: CommandDiagnostic[] = [];

    if (!isRecord(value)) {
      return [{ file, message: "Command policy metadata is required." }];
    }

    if (!["guild", "dm", "both"].includes(String(value.contexts))) {
      failures.push({
        file,
        message: "Command context policy is invalid."
      });
    }

    if (!isRecord(value.response)) {
      failures.push({
        file,
        message: "Command response policy is required."
      });
    } else {
      if (!["immediate", "deferred"].includes(
        String(value.response.acknowledgement)
      )) {
        failures.push({
          file,
          message: "Command response acknowledgement policy is invalid."
        });
      }

      if (!["ephemeral", "public"].includes(
        String(value.response.visibility)
      )) {
        failures.push({
          file,
          message: "Command response visibility policy is invalid."
        });
      }
    }

    if (!["single", "user", "guild", "unlimited"].includes(
      String(value.concurrency)
    )) {
      failures.push({
        file,
        message: "Command concurrency policy is invalid."
      });
    }

    if (value.cooldown !== undefined) {
      if (!isRecord(value.cooldown)) {
        failures.push({
          file,
          message: "Command cooldown policy is invalid."
        });
      } else {
        if (!["user", "guild"].includes(String(value.cooldown.scope))) {
          failures.push({
            file,
            message: "Command cooldown scope is invalid."
          });
        }

        if (
          typeof value.cooldown.durationMs !== "number" ||
          !Number.isInteger(value.cooldown.durationMs) ||
          value.cooldown.durationMs <= 0
        ) {
          failures.push({
            file,
            message: "Command cooldown duration must be a positive integer."
          });
        }
      }
    }

    if (value.permissions !== undefined) {
      if (!isRecord(value.permissions)) {
        failures.push({
          file,
          message: "Command permission policy is invalid."
        });
      } else {
        const required = value.permissions.required;

        if (!Array.isArray(required) || required.length === 0) {
          failures.push({
            file,
            message: "Command permission policy requires a non-empty permission array."
          });
        } else {
          const localPermissions = new Set<Permission>();

          for (const permission of required) {
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

        if (!["all", "any"].includes(String(value.permissions.mode))) {
          failures.push({
            file,
            message: "Command permission evaluation mode is invalid."
          });
        }

        if (typeof value.permissions.administratorOverride !== "boolean") {
          failures.push({
            file,
            message: "Command administrator override policy must be a boolean."
          });
        }
      }
    }

    if (
      value.contexts !== "guild" &&
      (value.concurrency === "guild" ||
        (isRecord(value.cooldown) && value.cooldown.scope === "guild"))
    ) {
      failures.push({
        file,
        message: "Guild-scoped cooldown or concurrency requires a guild-only command."
      });
    }

    if (value.contexts !== "guild" && value.permissions !== undefined) {
      failures.push({
        file,
        message: "Role-based permission policy requires a guild-only command."
      });
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
