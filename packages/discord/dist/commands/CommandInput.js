import { ApplicationCommandOptionType } from "discord.js";
export class CommandInputError extends Error {
    userMessage;
    constructor(userMessage) {
        super(userMessage);
        this.userMessage = userMessage;
        this.name = "CommandInputError";
    }
}
export class CommandOptionReader {
    options;
    constructor(options) {
        this.options = options;
    }
    requiredString(name) {
        this.requireType(name, ApplicationCommandOptionType.String, "string");
        return this.readRequired(name, "string", () => this.options.getString(name, true));
    }
    optionalString(name) {
        return this.readOptional(name, ApplicationCommandOptionType.String, "string", () => this.options.getString(name, true));
    }
    requiredInteger(name) {
        this.requireType(name, ApplicationCommandOptionType.Integer, "integer");
        return this.readRequired(name, "integer", () => this.options.getInteger(name, true));
    }
    optionalInteger(name) {
        return this.readOptional(name, ApplicationCommandOptionType.Integer, "integer", () => this.options.getInteger(name, true));
    }
    requiredNumber(name) {
        this.requireType(name, ApplicationCommandOptionType.Number, "number");
        return this.readRequired(name, "number", () => this.options.getNumber(name, true));
    }
    optionalNumber(name) {
        return this.readOptional(name, ApplicationCommandOptionType.Number, "number", () => this.options.getNumber(name, true));
    }
    requiredBoolean(name) {
        this.requireType(name, ApplicationCommandOptionType.Boolean, "boolean");
        return this.readRequired(name, "boolean", () => this.options.getBoolean(name, true));
    }
    optionalBoolean(name) {
        return this.readOptional(name, ApplicationCommandOptionType.Boolean, "boolean", () => this.options.getBoolean(name, true));
    }
    requiredUser(name) {
        this.requireType(name, ApplicationCommandOptionType.User, "user");
        return this.readRequired(name, "user", () => this.options.getUser(name, true));
    }
    optionalUser(name) {
        return this.readOptional(name, ApplicationCommandOptionType.User, "user", () => this.options.getUser(name, true));
    }
    requiredRole(name) {
        this.requireType(name, ApplicationCommandOptionType.Role, "role");
        return this.readRequired(name, "role", () => this.options.getRole(name, true));
    }
    optionalRole(name) {
        return this.readOptional(name, ApplicationCommandOptionType.Role, "role", () => this.options.getRole(name, true));
    }
    requiredChannel(name) {
        this.requireType(name, ApplicationCommandOptionType.Channel, "channel");
        return this.readRequired(name, "channel", () => this.options.getChannel(name, true));
    }
    optionalChannel(name) {
        return this.readOptional(name, ApplicationCommandOptionType.Channel, "channel", () => this.options.getChannel(name, true));
    }
    requiredMentionable(name) {
        this.requireType(name, ApplicationCommandOptionType.Mentionable, "mentionable");
        return this.readRequired(name, "mentionable", () => this.options.getMentionable(name, true));
    }
    optionalMentionable(name) {
        return this.readOptional(name, ApplicationCommandOptionType.Mentionable, "mentionable", () => this.options.getMentionable(name, true));
    }
    requiredAttachment(name) {
        this.requireType(name, ApplicationCommandOptionType.Attachment, "attachment");
        return this.readRequired(name, "attachment", () => this.options.getAttachment(name, true));
    }
    optionalAttachment(name) {
        return this.readOptional(name, ApplicationCommandOptionType.Attachment, "attachment", () => this.options.getAttachment(name, true));
    }
    requireType(name, expectedType, typeName) {
        const option = this.options.get(name, false);
        if (!option) {
            throw new CommandInputError(`Required ${typeName} option '${name}' is missing.`);
        }
        if (option.type !== expectedType) {
            throw new CommandInputError(`Option '${name}' must be a ${typeName}.`);
        }
    }
    readOptional(name, expectedType, typeName, read) {
        const option = this.options.get(name, false);
        if (!option) {
            return undefined;
        }
        if (option.type !== expectedType) {
            throw new CommandInputError(`Option '${name}' must be a ${typeName}.`);
        }
        return this.readRequired(name, typeName, read);
    }
    readRequired(name, typeName, read) {
        try {
            return read();
        }
        catch {
            throw new CommandInputError(`Option '${name}' could not be resolved as a ${typeName}.`);
        }
    }
}
export class CommandRoute {
    subcommand;
    group;
    constructor(options) {
        this.subcommand = options.getSubcommand(false) ?? undefined;
        this.group = options.getSubcommandGroup(false) ?? undefined;
        if (this.group && !this.subcommand) {
            throw new CommandInputError(`Subcommand group '${this.group}' is missing a subcommand.`);
        }
    }
    get key() {
        if (this.group && this.subcommand) {
            return `${this.group}/${this.subcommand}`;
        }
        return this.subcommand ?? "root";
    }
    requiredSubcommand() {
        if (!this.subcommand) {
            throw new CommandInputError("A subcommand is required.");
        }
        return this.subcommand;
    }
    dispatch(routes) {
        const handler = routes[this.key];
        if (!handler) {
            if (!this.subcommand) {
                throw new CommandInputError("A subcommand is required.");
            }
            throw new CommandInputError(`The selected command route '${this.key}' is not supported.`);
        }
        return handler();
    }
}
//# sourceMappingURL=CommandInput.js.map