import { PlatformKernel } from "@qbox/core";
import {
  DiscordModule,
  DiscordService
} from "@qbox/discord";
import { logger } from "@qbox/logger";
import { env } from "@qbox/shared";

import {
  executeCommandDeployment,
  resolveCommandDeploymentTarget
} from "./commandDeployment.js";
import type {
  DeploymentScope
} from "./commandDeployment.js";

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
  const target = resolveCommandDeploymentTarget(
    readDeploymentScope(),
    {
      applicationId: env.DISCORD_APPLICATION_ID,
      guildId: env.DISCORD_GUILD_ID,
      dryRun: process.argv.includes("--dry-run"),
      confirmGlobal: process.argv.includes("--confirm-global"),
      confirmGlobalRemovals: process.argv.includes(
        "--confirm-global-removals"
      )
    }
  );
  const kernel = new PlatformKernel();
  kernel.registerModule(new DiscordModule());
  let started = false;

  try {
    await kernel.start();
    started = true;

    const discord = kernel.services.get<DiscordService>("discord");
    await executeCommandDeployment(target, discord, logger);
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
    "Discord command deployment process failed."
  );

  process.exitCode = 1;
});
