import type { PlatformModule, PlatformModuleContext } from "@qbox/core";

import { logger } from "@qbox/logger";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { RoleMenuRepository } from "@qbox/role-menus";
import { env } from "@qbox/shared";

import { RoleMenuCommand } from "./commands/RoleMenu.command.js";
import { DiscordService } from "./DiscordService.js";
import { CommandLoadError, CommandLoader } from "./loaders/CommandLoader.js";

export class DiscordModule implements PlatformModule {
  public readonly name = "discord";
  public readonly version = "0.1.0";

  private readonly discordService: DiscordService;
  private readonly commandLoader: CommandLoader;

  public constructor(
    private readonly permissionAuthorizer: PermissionAuthorizer,
    private readonly compatibility: {
      readonly enabled: boolean;
      readonly roleCount: number;
      readonly guildId?: string;
    },
    dependencies: {
      readonly discordService?: DiscordService;
      readonly commandLoader?: CommandLoader;
      readonly roleMenuRepository?: RoleMenuRepository;
    } = {},
  ) {
    this.discordService =
      dependencies.discordService ?? new DiscordService(permissionAuthorizer, dependencies.roleMenuRepository);
    this.commandLoader = dependencies.commandLoader ?? new CommandLoader();
  }

  public async start(context: PlatformModuleContext): Promise<void> {
    let loadResult;

    try {
      loadResult = await this.commandLoader.load();
    } catch (error) {
      if (error instanceof CommandLoadError) {
        logger.error(
          {
            discovered: error.diagnostics.discovered,
            validated: error.diagnostics.validated,
            registered: 0,
            loadDurationMs: error.diagnostics.loadDurationMs,
            commandFiles: error.diagnostics.commandFiles,
            commandNames: error.diagnostics.commandNames,
            commandAliases: error.diagnostics.commandAliases,
            warnings: error.diagnostics.warnings,
            failures: error.diagnostics.failures,
          },
          "Discord command loading failed.",
        );
      }

      throw error;
    }

    let registered: number;

    try {
      const commands = loadResult.commands.map((command) =>
        command.data.name === "role-menu" ? new RoleMenuCommand(this.discordService.roleMenus) : command,
      );
      registered = this.discordService.registerCommands(commands);
    } catch (error) {
      logger.error(
        {
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
              message:
                error instanceof Error
                  ? error.message
                  : "Registration failed with a non-Error value.",
            },
          ],
        },
        "Discord command registration failed.",
      );

      throw error;
    }

    logger.info(
      {
        discovered: loadResult.diagnostics.discovered,
        validated: loadResult.diagnostics.validated,
        registered,
        loadDurationMs: loadResult.diagnostics.loadDurationMs,
        commandFiles: loadResult.diagnostics.commandFiles,
        commandNames: loadResult.diagnostics.commandNames,
        commandAliases: loadResult.diagnostics.commandAliases,
        warnings: loadResult.diagnostics.warnings,
        failures: loadResult.diagnostics.failures,
      },
      "Discord commands loaded.",
    );

    await this.discordService.start();

    context.services.register("permissions", this.permissionAuthorizer);
    context.services.register("discord", this.discordService);

    logger.info(
      {
        user: this.discordService.client.user?.tag,
        commandCount: registered,
        permissionCompatibilityEnabled: this.compatibility.enabled,
        permissionCompatibilityRoleCount: this.compatibility.roleCount,
        permissionCompatibilityGuildId: this.compatibility.guildId,
      },
      "Discord module started.",
    );
  }

  public async stop(): Promise<void> {
    await this.discordService.stop();

    logger.info("Discord module stopped.");
  }
}
