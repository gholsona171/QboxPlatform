import { PlatformKernel } from "@qbox/core";
import { createDiscordModule, DiscordService } from "@qbox/discord";
import { logger } from "@qbox/logger";
import { env } from "@qbox/shared";
import { executeCommandDeployment, resolveCommandDeploymentTarget, } from "./commandDeployment.js";
function readDeploymentScope() {
    const scope = process.argv[2];
    if (scope === "global" || scope === "guild" || scope === "clear-guild") {
        return scope;
    }
    throw new Error("Command deployment scope must be 'global', 'guild', or 'clear-guild'.");
}
async function main() {
    const target = resolveCommandDeploymentTarget(readDeploymentScope(), {
        applicationId: env.DISCORD_APPLICATION_ID,
        guildId: env.DISCORD_GUILD_ID,
        dryRun: process.argv.includes("--dry-run"),
        confirmGlobal: process.argv.includes("--confirm-global"),
        confirmGlobalRemovals: process.argv.includes("--confirm-global-removals"),
    });
    const kernel = new PlatformKernel();
    kernel.registerModule(createDiscordModule());
    let started = false;
    try {
        await kernel.start();
        started = true;
        const discord = kernel.services.get("discord");
        await executeCommandDeployment(target, discord, logger);
    }
    finally {
        if (started) {
            await kernel.stop();
        }
    }
}
void main().catch((error) => {
    logger.fatal({
        err: error,
        stack: error instanceof Error ? error.stack : undefined,
    }, "Discord command deployment process failed.");
    process.exitCode = 1;
});
//# sourceMappingURL=deployCommands.js.map