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
import { CommandLoader } from "./loaders/CommandLoader.js";

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

    const commands = await this.commandLoader.load();

    for (const command of commands) {
      this.discordService.registerCommand(command);
    }

    context.services.register(
      "permissions",
      permissions
    );

    context.services.register(
      "discord",
      this.discordService
    );

    await this.discordService.start();

    logger.info(
      {
        user: this.discordService.client.user?.tag,
        commandCount: commands.length,
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
