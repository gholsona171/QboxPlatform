import type {
  PlatformModule,
  PlatformModuleContext
} from "@qbox/core";

import { logger } from "@qbox/logger";
import { env } from "@qbox/shared";

import {
  permissions
} from "@qbox/permissions";

import { DiscordService } from "./DiscordService.js";
import {
  CommandLoadError,
  CommandLoader
} from "./loaders/CommandLoader.js";

export class DiscordModule implements PlatformModule {
  public readonly name = "discord";
  public readonly version = "0.1.0";

  private readonly discordService =
    new DiscordService(permissions);

  private readonly commandLoader =
    new CommandLoader();

  public async start(
    context: PlatformModuleContext
  ): Promise<void> {
    permissions.clear();

    for (const roleId of env.ADMIN_ROLE_IDS) {
      permissions.registerGrant({
        roleId,
        permissions: [
          "platform.admin"
        ]
      });
    }

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
            warnings: error.diagnostics.warnings,
            failures: error.diagnostics.failures
          },
          "Discord command loading failed."
        );
      }

      throw error;
    }

    let registered: number;

    try {
      registered = this.discordService.registerCommands(
        loadResult.commands
      );
    } catch (error) {
      logger.error(
        {
          err: error,
          discovered: loadResult.diagnostics.discovered,
          validated: loadResult.diagnostics.validated,
          registered: 0,
          loadDurationMs: loadResult.diagnostics.loadDurationMs,
          warnings: loadResult.diagnostics.warnings,
          failures: [
            {
              file: "registry",
              message: error instanceof Error
                ? error.message
                : "Registration failed with a non-Error value."
            }
          ]
        },
        "Discord command registration failed."
      );

      throw error;
    }

    context.services.register(
      "permissions",
      permissions
    );

    context.services.register(
      "discord",
      this.discordService
    );

    logger.info(
      {
        discovered: loadResult.diagnostics.discovered,
        validated: loadResult.diagnostics.validated,
        registered,
        loadDurationMs: loadResult.diagnostics.loadDurationMs,
        warnings: loadResult.diagnostics.warnings,
        failures: loadResult.diagnostics.failures
      },
      "Discord commands loaded."
    );

    await this.discordService.start();

    logger.info(
      {
        user: this.discordService.client.user?.tag,
        commandCount: registered,
        administratorRoleCount:
          env.ADMIN_ROLE_IDS.length
      },
      "Discord module started."
    );
  }

  public async stop(): Promise<void> {
    await this.discordService.stop();

    logger.info("Discord module stopped.");
  }
}
