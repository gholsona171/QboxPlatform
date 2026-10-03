import { logger } from "@qbox/logger";
import { env } from "@qbox/shared";
import { RoleMenuCommand } from "./commands/RoleMenu.command.js";
import { WelcomeCommand } from "./commands/Welcome.command.js";
import { GoodbyeCommand } from "./commands/Goodbye.command.js";
import { AutoroleCommand } from "./commands/Autorole.command.js";
import { RulesCommand } from "./commands/Rules.command.js";
import { CounterCommand } from "./commands/Counter.command.js";
import { LogsCommand } from "./commands/Logs.command.js";
import { EmbedCommand } from "./commands/Embed.command.js";
import { AnnounceCommand } from "./commands/Announce.command.js";
import { CustomCommand } from "./commands/Custom.command.js";
import { SuggestCommand } from "./commands/Suggest.command.js";
import { StarboardCommand } from "./commands/Starboard.command.js";
import { RolesCommand } from "./commands/Roles.command.js";
import { DiscordService } from "./DiscordService.js";
import { CommandLoadError, CommandLoader } from "./loaders/CommandLoader.js";
export class DiscordModule {
    permissionAuthorizer;
    compatibility;
    name = "discord";
    version = "0.1.0";
    discordService;
    commandLoader;
    constructor(permissionAuthorizer, compatibility, dependencies = {}) {
        this.permissionAuthorizer = permissionAuthorizer;
        this.compatibility = compatibility;
        this.discordService =
            dependencies.discordService ?? new DiscordService(permissionAuthorizer, dependencies.roleMenuRepository, dependencies.communityRepository, dependencies.roleDependencyRepository, dependencies.features, dependencies.templates);
        this.commandLoader = dependencies.commandLoader ?? new CommandLoader();
    }
    async start(context) {
        let loadResult;
        try {
            loadResult = await this.commandLoader.load();
        }
        catch (error) {
            if (error instanceof CommandLoadError) {
                logger.error({
                    discovered: error.diagnostics.discovered,
                    validated: error.diagnostics.validated,
                    registered: 0,
                    loadDurationMs: error.diagnostics.loadDurationMs,
                    commandFiles: error.diagnostics.commandFiles,
                    commandNames: error.diagnostics.commandNames,
                    commandAliases: error.diagnostics.commandAliases,
                    warnings: error.diagnostics.warnings,
                    failures: error.diagnostics.failures,
                }, "Discord command loading failed.");
            }
            throw error;
        }
        let registered;
        try {
            const commands = loadResult.commands.map((command) => this.replaceCommand(command));
            registered = this.discordService.registerCommands(commands);
        }
        catch (error) {
            logger.error({
                err: error,
                discovered: loadResult.diagnostics.discovered,
                validated: loadResult.diagnostics.validated,
                registered: 0,
                loadDurationMs: loadResult.diagnostics.loadDurationMs,
                commandFiles: loadResult.diagnostics.commandFiles,
                commandNames: loadResult.diagnostics.commandNames,
                commandAliases: loadResult.diagnostics.commandAliases,
                warnings: loadResult.diagnostics.warnings,
                failures: [
                    {
                        file: "registry",
                        message: error instanceof Error
                            ? error.message
                            : "Registration failed with a non-Error value.",
                    },
                ],
            }, "Discord command registration failed.");
            throw error;
        }
        logger.info({
            discovered: loadResult.diagnostics.discovered,
            validated: loadResult.diagnostics.validated,
            registered,
            loadDurationMs: loadResult.diagnostics.loadDurationMs,
            commandFiles: loadResult.diagnostics.commandFiles,
            commandNames: loadResult.diagnostics.commandNames,
            commandAliases: loadResult.diagnostics.commandAliases,
            warnings: loadResult.diagnostics.warnings,
            failures: loadResult.diagnostics.failures,
        }, "Discord commands loaded.");
        await this.discordService.start();
        context.services.register("permissions", this.permissionAuthorizer);
        context.services.register("discord", this.discordService);
        logger.info({
            user: this.discordService.client.user?.tag,
            commandCount: registered,
            permissionCompatibilityEnabled: this.compatibility.enabled,
            permissionCompatibilityRoleCount: this.compatibility.roleCount,
            permissionCompatibilityGuildId: this.compatibility.guildId,
        }, "Discord module started.");
    }
    async stop() {
        await this.discordService.stop();
        logger.info("Discord module stopped.");
    }
    replaceCommand(command) {
        const featureCommand = this.discordService.featureCommand(command.data.name);
        if (featureCommand)
            return featureCommand;
        switch (command.data.name) {
            case "role-menu": return new RoleMenuCommand(this.discordService.roleMenus);
            case "welcome": return new WelcomeCommand(this.discordService.community);
            case "goodbye": return new GoodbyeCommand(this.discordService.community);
            case "autorole": return new AutoroleCommand(this.discordService.community);
            case "rules": return new RulesCommand(this.discordService.community);
            case "counter": return new CounterCommand(this.discordService.community);
            case "logs": return new LogsCommand(this.discordService.community);
            case "embed": return new EmbedCommand(this.discordService.community);
            case "announce": return new AnnounceCommand(this.discordService.community);
            case "custom": return new CustomCommand(this.discordService.community);
            case "suggest": return new SuggestCommand(this.discordService.community);
            case "starboard": return new StarboardCommand(this.discordService.community);
            case "roles": return new RolesCommand(this.discordService.roles);
            default: return command;
        }
    }
}
//# sourceMappingURL=DiscordModule.js.map