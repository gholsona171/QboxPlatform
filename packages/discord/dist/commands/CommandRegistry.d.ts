import type { PermissionAuthorizer } from "@qbox/permissions";
import type { CommandExecutionContext, DiscordCommand } from "./DiscordCommand.js";
interface AuthorizationLogger {
    warn(context: object, message: string): void;
    error(context: object, message: string): void;
}
export declare class CommandRegistry {
    private readonly permissionAuthorizer;
    private readonly authorizationLog;
    private readonly commandsByName;
    private readonly primaryCommands;
    private readonly cooldowns;
    private readonly activeConcurrencyKeys;
    constructor(permissionAuthorizer: PermissionAuthorizer, authorizationLog?: AuthorizationLogger);
    register(command: DiscordCommand): void;
    registerAll(commands: readonly DiscordCommand[]): number;
    get(commandName: string): DiscordCommand | undefined;
    list(): readonly DiscordCommand[];
    deploymentData(): ReturnType<DiscordCommand["data"]["toJSON"]>[];
    execute(context: CommandExecutionContext): Promise<void>;
    private authorize;
    private cooldownKey;
    private pruneExpiredCooldowns;
    private concurrencyKey;
}
export {};
//# sourceMappingURL=CommandRegistry.d.ts.map