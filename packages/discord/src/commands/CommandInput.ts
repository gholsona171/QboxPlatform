import { ApplicationCommandOptionType } from "discord.js";
import type {
  CommandInteractionOption,
  CommandInteractionOptionResolver
} from "discord.js";

type OptionUser = NonNullable<CommandInteractionOption["user"]>;
type OptionRole = NonNullable<CommandInteractionOption["role"]>;
type OptionChannel = NonNullable<CommandInteractionOption["channel"]>;
type OptionMentionable = NonNullable<
  CommandInteractionOption["member" | "role" | "user"]
>;
type OptionAttachment = NonNullable<CommandInteractionOption["attachment"]>;

export type SupportedOptionResolver = Pick<
  CommandInteractionOptionResolver,
  | "get"
  | "getString"
  | "getInteger"
  | "getNumber"
  | "getBoolean"
  | "getUser"
  | "getRole"
  | "getChannel"
  | "getMentionable"
  | "getAttachment"
  | "getSubcommand"
  | "getSubcommandGroup"
>;

export class CommandInputError extends Error {
  public constructor(public readonly userMessage: string) {
    super(userMessage);
    this.name = "CommandInputError";
  }
}

export class CommandOptionReader {
  public constructor(
    private readonly options: SupportedOptionResolver
  ) {}

  public requiredString(name: string): string {
    this.requireType(name, ApplicationCommandOptionType.String, "string");
    return this.readRequired(name, "string", () =>
      this.options.getString(name, true));
  }

  public optionalString(name: string): string | undefined {
    return this.readOptional(
      name,
      ApplicationCommandOptionType.String,
      "string",
      () => this.options.getString(name, true)
    );
  }

  public requiredInteger(name: string): number {
    this.requireType(name, ApplicationCommandOptionType.Integer, "integer");
    return this.readRequired(name, "integer", () =>
      this.options.getInteger(name, true));
  }

  public optionalInteger(name: string): number | undefined {
    return this.readOptional(
      name,
      ApplicationCommandOptionType.Integer,
      "integer",
      () => this.options.getInteger(name, true)
    );
  }

  public requiredNumber(name: string): number {
    this.requireType(name, ApplicationCommandOptionType.Number, "number");
    return this.readRequired(name, "number", () =>
      this.options.getNumber(name, true));
  }

  public optionalNumber(name: string): number | undefined {
    return this.readOptional(
      name,
      ApplicationCommandOptionType.Number,
      "number",
      () => this.options.getNumber(name, true)
    );
  }

  public requiredBoolean(name: string): boolean {
    this.requireType(name, ApplicationCommandOptionType.Boolean, "boolean");
    return this.readRequired(name, "boolean", () =>
      this.options.getBoolean(name, true));
  }

  public optionalBoolean(name: string): boolean | undefined {
    return this.readOptional(
      name,
      ApplicationCommandOptionType.Boolean,
      "boolean",
      () => this.options.getBoolean(name, true)
    );
  }

  public requiredUser(name: string): OptionUser {
    this.requireType(name, ApplicationCommandOptionType.User, "user");
    return this.readRequired(name, "user", () =>
      this.options.getUser(name, true));
  }

  public optionalUser(name: string): OptionUser | undefined {
    return this.readOptional(
      name,
      ApplicationCommandOptionType.User,
      "user",
      () => this.options.getUser(name, true)
    );
  }

  public requiredRole(name: string): OptionRole {
    this.requireType(name, ApplicationCommandOptionType.Role, "role");
    return this.readRequired(name, "role", () =>
      this.options.getRole(name, true));
  }

  public optionalRole(name: string): OptionRole | undefined {
    return this.readOptional(
      name,
      ApplicationCommandOptionType.Role,
      "role",
      () => this.options.getRole(name, true)
    );
  }

  public requiredChannel(name: string): OptionChannel {
    this.requireType(name, ApplicationCommandOptionType.Channel, "channel");
    return this.readRequired(name, "channel", () =>
      this.options.getChannel(name, true));
  }

  public optionalChannel(name: string): OptionChannel | undefined {
    return this.readOptional(
      name,
      ApplicationCommandOptionType.Channel,
      "channel",
      () => this.options.getChannel(name, true)
    );
  }

  public requiredMentionable(name: string): OptionMentionable {
    this.requireType(
      name,
      ApplicationCommandOptionType.Mentionable,
      "mentionable"
    );
    return this.readRequired(name, "mentionable", () =>
      this.options.getMentionable(name, true));
  }

  public optionalMentionable(name: string): OptionMentionable | undefined {
    return this.readOptional(
      name,
      ApplicationCommandOptionType.Mentionable,
      "mentionable",
      () => this.options.getMentionable(name, true)
    );
  }

  public requiredAttachment(name: string): OptionAttachment {
    this.requireType(
      name,
      ApplicationCommandOptionType.Attachment,
      "attachment"
    );
    return this.readRequired(name, "attachment", () =>
      this.options.getAttachment(name, true));
  }

  public optionalAttachment(name: string): OptionAttachment | undefined {
    return this.readOptional(
      name,
      ApplicationCommandOptionType.Attachment,
      "attachment",
      () => this.options.getAttachment(name, true)
    );
  }

  private requireType(
    name: string,
    expectedType: ApplicationCommandOptionType,
    typeName: string
  ): void {
    const option = this.options.get(name, false);

    if (!option) {
      throw new CommandInputError(
        `Required ${typeName} option '${name}' is missing.`
      );
    }

    if (option.type !== expectedType) {
      throw new CommandInputError(
        `Option '${name}' must be a ${typeName}.`
      );
    }
  }

  private readOptional<T>(
    name: string,
    expectedType: ApplicationCommandOptionType,
    typeName: string,
    read: () => T
  ): T | undefined {
    const option = this.options.get(name, false);

    if (!option) {
      return undefined;
    }

    if (option.type !== expectedType) {
      throw new CommandInputError(
        `Option '${name}' must be a ${typeName}.`
      );
    }

    return this.readRequired(name, typeName, read);
  }

  private readRequired<T>(
    name: string,
    typeName: string,
    read: () => T
  ): T {
    try {
      return read();
    } catch {
      throw new CommandInputError(
        `Option '${name}' could not be resolved as a ${typeName}.`
      );
    }
  }
}

export type CommandRouteHandler<T> = () => T;

export class CommandRoute {
  public readonly subcommand: string | undefined;
  public readonly group: string | undefined;

  public constructor(options: SupportedOptionResolver) {
    this.subcommand = options.getSubcommand(false) ?? undefined;
    this.group = options.getSubcommandGroup(false) ?? undefined;

    if (this.group && !this.subcommand) {
      throw new CommandInputError(
        `Subcommand group '${this.group}' is missing a subcommand.`
      );
    }
  }

  public get key(): string {
    if (this.group && this.subcommand) {
      return `${this.group}/${this.subcommand}`;
    }

    return this.subcommand ?? "root";
  }

  public requiredSubcommand(): string {
    if (!this.subcommand) {
      throw new CommandInputError("A subcommand is required.");
    }

    return this.subcommand;
  }

  public dispatch<T>(
    routes: Readonly<Record<string, CommandRouteHandler<T>>>
  ): T {
    const handler = routes[this.key];

    if (!handler) {
      if (!this.subcommand) {
        throw new CommandInputError("A subcommand is required.");
      }

      throw new CommandInputError(
        `The selected command route '${this.key}' is not supported.`
      );
    }

    return handler();
  }
}
