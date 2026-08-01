import type { PermissionAuthorizer } from "@qbox/permissions";

import type {
  CommandExecutionContext,
  ConcurrencyScope,
  DiscordCommand,
} from "./DiscordCommand.js";
import { discordPermissionIdentity } from "../permissions/DiscordPermissionIdentity.js";

interface AuthorizationLogger {
  warn(context: object, message: string): void;
  error(context: object, message: string): void;
}

const silentAuthorizationLogger: AuthorizationLogger = {
  warn: () => undefined,
  error: () => undefined,
};

export class CommandRegistry {
  private readonly commandsByName = new Map<string, DiscordCommand>();
  private readonly primaryCommands = new Map<string, DiscordCommand>();
  private readonly cooldowns = new Map<string, number>();
  private readonly activeConcurrencyKeys = new Set<string>();

  public constructor(
    private readonly permissionAuthorizer: PermissionAuthorizer,
    private readonly authorizationLog: AuthorizationLogger = silentAuthorizationLogger,
  ) {}

  public register(command: DiscordCommand): void {
    this.registerAll([command]);
  }

  public registerAll(commands: readonly DiscordCommand[]): number {
    const pendingNames = new Set(this.commandsByName.keys());

    for (const command of commands) {
      const names = [command.data.name, ...(command.aliases ?? [])];

      for (const name of names) {
        if (pendingNames.has(name)) {
          throw new Error(
            `Command name or alias '${name}' is already registered.`,
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

  public get(commandName: string): DiscordCommand | undefined {
    return this.commandsByName.get(commandName);
  }

  public list(): readonly DiscordCommand[] {
    return [...this.primaryCommands.values()];
  }

  public deploymentData(): ReturnType<DiscordCommand["data"]["toJSON"]>[] {
    return this.list().flatMap((command) => {
      const data = command.data.toJSON();

      return [
        data,
        ...(command.aliases ?? []).map((alias) => ({
          ...data,
          name: alias,
        })),
      ];
    });
  }

  public async execute(context: CommandExecutionContext): Promise<void> {
    const { interaction } = context;
    const command = this.get(interaction.commandName);

    if (!command) {
      await context.reply({ content: "That command is not registered." });
      return;
    }

    if (!(await this.authorize(command, context))) {
      return;
    }

    const cooldownKey = this.cooldownKey(command, context);
    const now = Date.now();
    this.pruneExpiredCooldowns(now);

    if (cooldownKey) {
      const expiresAt = this.cooldowns.get(cooldownKey) ?? 0;

      if (expiresAt > now) {
        const seconds = Math.max(1, Math.ceil((expiresAt - now) / 1_000));
        await context.reply({
          content: `Please wait ${seconds} second(s) before using this command again.`,
        });
        return;
      }
    }

    const concurrencyKey = this.concurrencyKey(command, context);

    if (concurrencyKey && this.activeConcurrencyKeys.has(concurrencyKey)) {
      await context.reply({
        content: "This command is already running for the selected scope.",
      });
      return;
    }

    if (cooldownKey && command.policy.cooldown) {
      this.cooldowns.set(cooldownKey, now + command.policy.cooldown.durationMs);
    }

    if (concurrencyKey) {
      this.activeConcurrencyKeys.add(concurrencyKey);
    }

    try {
      await command.execute(context);
    } finally {
      if (concurrencyKey) {
        this.activeConcurrencyKeys.delete(concurrencyKey);
      }
    }
  }

  private async authorize(
    command: DiscordCommand,
    context: CommandExecutionContext,
  ): Promise<boolean> {
    const { interaction } = context;
    const inGuild = interaction.inGuild();

    if (command.policy.contexts === "guild" && !inGuild) {
      await context.reply({
        content: "This command can only be used in a server.",
      });
      return false;
    }

    if (command.policy.contexts === "dm" && inGuild) {
      await context.reply({
        content: "This command can only be used in a direct message.",
      });
      return false;
    }

    const permissionPolicy = command.policy.permissions;

    if (!permissionPolicy || permissionPolicy.required.length === 0) {
      return true;
    }

    if (!inGuild) {
      await context.reply({
        content: "This command requires server permissions.",
      });
      return false;
    }

    let identity;
    try {
      identity = discordPermissionIdentity(interaction);
    } catch (error) {
      this.authorizationLog.error(
        {
          err: error,
          commandName: command.data.name,
          guildId: interaction.guildId,
          userId: interaction.user.id,
        },
        "Discord authorization identity translation failed.",
      );
      await context.reply({
        content: "Authorization could not be verified. Please try again later.",
      });
      return false;
    }
    if (identity.type !== "guild") {
      await context.reply({
        content: "This command requires server permissions.",
      });
      return false;
    }
    let decision;
    try {
      decision = await this.permissionAuthorizer.authorize({
        principals: identity.principals,
        scope: identity.scope,
        required: permissionPolicy.required,
        mode: permissionPolicy.mode,
        administratorOverride: permissionPolicy.administratorOverride,
      });
    } catch (error) {
      this.authorizationLog.error(
        {
          err: error,
          commandName: command.data.name,
          guildId: identity.guildId,
          userId: interaction.user.id,
        },
        "Discord permission authorizer failed.",
      );
      await context.reply({
        content: "Authorization could not be verified. Please try again later.",
      });
      return false;
    }

    if (!decision.allowed) {
      this.authorizationLog.warn(
        {
          commandName: command.data.name,
          guildId: identity.guildId,
          userId: interaction.user.id,
          decisionReason: decision.reason,
          degraded: decision.degraded,
          usedCache: decision.usedCache,
        },
        "Discord command authorization denied.",
      );
      await context.reply({
        content:
          decision.reason === "repository-unavailable"
            ? "Authorization could not be verified. Please try again later."
            : "You do not have permission to use this command.",
      });
      return false;
    }

    return true;
  }

  private cooldownKey(
    command: DiscordCommand,
    context: CommandExecutionContext,
  ): string | undefined {
    const cooldown = command.policy.cooldown;

    if (!cooldown) {
      return undefined;
    }

    const subject =
      cooldown.scope === "user"
        ? context.interaction.user.id
        : context.interaction.guildId;

    return subject
      ? `${command.data.name}:cooldown:${cooldown.scope}:${subject}`
      : undefined;
  }

  private pruneExpiredCooldowns(now: number): void {
    for (const [key, expiresAt] of this.cooldowns) {
      if (expiresAt <= now) {
        this.cooldowns.delete(key);
      }
    }
  }

  private concurrencyKey(
    command: DiscordCommand,
    context: CommandExecutionContext,
  ): string | undefined {
    const scope: ConcurrencyScope = command.policy.concurrency;

    if (scope === "unlimited") {
      return undefined;
    }

    if (scope === "single") {
      return `${command.data.name}:concurrency:single`;
    }

    const subject =
      scope === "user"
        ? context.interaction.user.id
        : context.interaction.guildId;

    return subject
      ? `${command.data.name}:concurrency:${scope}:${subject}`
      : undefined;
  }
}
