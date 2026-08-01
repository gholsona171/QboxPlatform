import { createInMemoryPermissionRuntime } from "@qbox/permissions";
import { env } from "@qbox/shared";

import { DiscordModule } from "./DiscordModule.js";

/** Composes the pre-persistence permission runtime and injects it into Discord. */
export function createDiscordModule(): DiscordModule {
  const permissions = createInMemoryPermissionRuntime(
    env.DISCORD_GUILD_ID,
    env.ADMIN_ROLE_IDS,
  );
  return new DiscordModule(permissions.authorizer, permissions.compatibility);
}
