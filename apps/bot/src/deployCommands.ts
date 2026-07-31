import { PlatformKernel } from "@qbox/core";
import {
  DiscordModule,
  DiscordService
} from "@qbox/discord";
import { logger } from "@qbox/logger";
import { env } from "@qbox/shared";

type DeploymentScope = "global" | "guild";

function readDeploymentScope(): DeploymentScope {
  const scope = process.argv[2];

  if (scope === "global" || scope === "guild") {
    return scope;
  }

  throw new Error(
    "Command deployment scope must be either 'global' or 'guild'."
  );
}

async function main(): Promise<void> {
  const scope = readDeploymentScope();
  const guildId = scope === "guild"
    ? env.DISCORD_GUILD_ID
    : undefined;

  if (scope === "guild" && !guildId) {
    throw new Error(
      "DISCORD_GUILD_ID is required for guild command deployment."
    );
  }

  const kernel = new PlatformKernel();
  kernel.registerModule(new DiscordModule());
  let started = false;

  try {
    await kernel.start();
    started = true;

    const discord = kernel.services.get<DiscordService>("discord");
    const deployed = await discord.deployCommands(guildId);

    logger.info(
      {
        scope,
        guildId,
        deployed
      },
      "Discord commands deployed."
    );
  } finally {
    if (started) {
      await kernel.stop();
    }
  }
}

void main().catch((error: unknown) => {
  logger.fatal(
    {
      err: error,
      stack: error instanceof Error ? error.stack : undefined
    },
    "Discord command deployment failed."
  );

  process.exitCode = 1;
});
