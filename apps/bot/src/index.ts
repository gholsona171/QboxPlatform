import { PlatformKernel } from "@qbox/core";
import {
  DatabaseConfiguration,
  DatabaseService,
  InMemoryPermissionInvalidationBus,
  PrismaPermissionPersistenceClient,
} from "@qbox/database";
import { DiscordModule } from "@qbox/discord";
import { logger } from "@qbox/logger";
import {
  createLegacyAdministratorCompatibility,
  InMemoryPermissionCache,
  PERMISSION_CACHE_TTL_MS,
  PersistentPermissionService,
} from "@qbox/permissions";
import { env } from "@qbox/shared";

import { botFeatures } from "./features.js";
import { PermissionPersistenceModule } from "./PermissionPersistenceModule.js";

const kernel = new PlatformKernel();
const databaseConfiguration = DatabaseConfiguration.from({
  databaseUrl: env.DATABASE_URL,
  environment: env.NODE_ENV,
});
const invalidations = new InMemoryPermissionInvalidationBus();
const cache = new InMemoryPermissionCache({ ttlMs: PERMISSION_CACHE_TTL_MS });
const unsubscribeInvalidation = invalidations.subscribe((event) =>
  cache.invalidate(event.scopes),
);
const persistence = new PrismaPermissionPersistenceClient(
  databaseConfiguration,
  { invalidations },
);
const database = new DatabaseService(databaseConfiguration, {
  create: () => persistence,
});
const compatibility = createLegacyAdministratorCompatibility(
  env.DISCORD_GUILD_ID,
  env.ADMIN_ROLE_IDS,
  env.PERMISSION_LEGACY_ADMIN_COMPATIBILITY_ENABLED,
);
const authorizer = new PersistentPermissionService(
  persistence.repositories.permissions,
  cache,
  { legacyAssignments: compatibility.assignments },
);

kernel.registerModule(
  new PermissionPersistenceModule(
    database,
    persistence,
    persistence.repositories.definitions,
    cache,
    {
      enabled: compatibility.enabled,
      ...(compatibility.guildId ? { guildId: compatibility.guildId } : {}),
      roleIds: env.ADMIN_ROLE_IDS,
    },
  ),
);
kernel.registerModule(
  new DiscordModule(authorizer, compatibility, {
    roleMenuRepository: persistence.repositories.roleMenus,
    communityRepository: persistence.repositories.discordCommunity,
    roleDependencyRepository: persistence.repositories.discordRoles,
    features: botFeatures(persistence, authorizer),
  }),
);

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Shutdown signal received.");
  try {
    await kernel.stop();
    unsubscribeInvalidation();
    process.exitCode = 0;
  } catch (error) {
    console.error("Shutdown error:", error);
    logger.error(
      { err: error, stack: error instanceof Error ? error.stack : undefined },
      "Platform shutdown failed.",
    );
    process.exitCode = 1;
  }
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

async function main(): Promise<void> {
  try {
    await kernel.start();
  } catch (error) {
    console.error("Startup error:", error);
    logger.fatal(
      { err: error, stack: error instanceof Error ? error.stack : undefined },
      "Qbox Platform failed to start.",
    );
    try {
      await kernel.stop();
    } catch (cleanupError) {
      logger.error(
        {
          err: cleanupError,
          stack: cleanupError instanceof Error ? cleanupError.stack : undefined,
        },
        "Qbox Platform startup cleanup failed.",
      );
    } finally {
      unsubscribeInvalidation();
    }
    process.exitCode = 1;
  }
}

void main();
