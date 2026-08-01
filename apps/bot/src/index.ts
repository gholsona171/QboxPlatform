import { PlatformKernel } from "@qbox/core";
import { createDiscordModule } from "@qbox/discord";
import { logger } from "@qbox/logger";

const kernel = new PlatformKernel();

kernel.registerModule(createDiscordModule());

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info({ signal }, "Shutdown signal received.");

  try {
    await kernel.stop();
    process.exitCode = 0;
  } catch (error) {
    console.error("Shutdown error:", error);

    logger.error(
      {
        err: error,
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Platform shutdown failed.",
    );

    process.exitCode = 1;
  }
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

async function main(): Promise<void> {
  try {
    await kernel.start();
  } catch (error) {
    console.error("Startup error:", error);

    logger.fatal(
      {
        err: error,
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Qbox Platform failed to start.",
    );

    process.exitCode = 1;
  }
}

void main();
