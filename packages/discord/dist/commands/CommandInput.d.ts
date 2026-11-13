import type { CommandInteractionOption, CommandInteractionOptionResolver } from "discord.js";
type OptionUser = NonNullable<CommandInteractionOption["user"]>;
type OptionRole = NonNullable<CommandInteractionOption["role"]>;
type OptionChannel = NonNullable<CommandInteractionOption["channel"]>;
type OptionMentionable = NonNullable<CommandInteractionOption["member" | "role" | "user"]>;
type OptionAttachment = NonNullable<CommandInteractionOption["attachment"]>;
export type SupportedOptionResolver = Pick<CommandInteractionOptionResolver, "get" | "getString" | "getInteger" | "getNumber" | "getBoolean" | "getUser" | "getRole" | "getChannel" | "getMentionable" | "getAttachment" | "getSubcommand" | "getSubcommandGroup">;
export declare class CommandInputError extends Error {
    readonly userMessage: string;
    constructor(userMessage: string);
}
export declare class CommandOptionReader {
    private readonly options;
    constructor(options: SupportedOptionResolver);
    requiredString(name: string): string;
    optionalString(name: string): string | undefined;
    requiredInteger(name: string): number;
    optionalInteger(name: string): number | undefined;
    requiredNumber(name: string): number;
    optionalNumber(name: string): number | undefined;
    requiredBoolean(name: string): boolean;
    optionalBoolean(name: string): boolean | undefined;
    requiredUser(name: string): OptionUser;
    optionalUser(name: string): OptionUser | undefined;
    requiredRole(name: string): OptionRole;
    optionalRole(name: string): OptionRole | undefined;
    requiredChannel(name: string): OptionChannel;
    optionalChannel(name: string): OptionChannel | undefined;
    requiredMentionable(name: string): OptionMentionable;
    optionalMentionable(name: string): OptionMentionable | undefined;
    requiredAttachment(name: string): OptionAttachment;
    optionalAttachment(name: string): OptionAttachment | undefined;
    private requireType;
    private readOptional;
    private readRequired;
}
export type CommandRouteHandler<T> = () => T;
export declare class CommandRoute {
    readonly subcommand: string | undefined;
    readonly group: string | undefined;
    constructor(options: SupportedOptionResolver);
    get key(): string;
    requiredSubcommand(): string;
    dispatch<T>(routes: Readonly<Record<string, CommandRouteHandler<T>>>): T;
}
export {};
//# sourceMappingURL=CommandInput.d.ts.map