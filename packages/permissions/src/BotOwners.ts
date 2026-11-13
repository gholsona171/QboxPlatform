/**
 * The people who run the bot itself (not one server).
 *
 * A bot owner passes every Qbox permission check in every server the bot is
 * in, without holding a role or a stored permission there, and the portal
 * lets them open every one of those servers. The list comes from the
 * `BOT_OWNER_IDS` environment setting (comma-separated Discord user IDs) and
 * is never stored in the repository or the database.
 *
 * This is the one place that answers "is this person a bot owner?"; the
 * permission service, the bot's command checks, and the portal all ask it.
 */
export interface BotOwners {
  isBotOwner(discordUserId: string): boolean;
  readonly size: number;
}

const DISCORD_SNOWFLAKE = /^[1-9][0-9]{16,19}$/u;

/** Thrown when `BOT_OWNER_IDS` holds something that is not a Discord user ID. */
export class BotOwnerConfigurationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "BotOwnerConfigurationError";
  }
}

/**
 * Reads a comma-separated list of Discord user IDs. Blank entries are
 * ignored; anything else that is not a Discord ID fails startup, so a typo
 * never silently leaves the owner without access.
 */
export function parseBotOwnerIds(raw: string | undefined): readonly string[] {
  if (raw === undefined) return [];
  const ids = raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  for (const id of ids) {
    if (!DISCORD_SNOWFLAKE.test(id))
      throw new BotOwnerConfigurationError("BOT_OWNER_IDS must be comma-separated Discord user IDs.");
  }
  return [...new Set(ids)];
}

/** Builds the owner list from verified Discord user IDs. */
export function createBotOwners(ids: Iterable<string>): BotOwners {
  const owners = new Set<string>();
  for (const id of ids) {
    if (!DISCORD_SNOWFLAKE.test(id)) throw new BotOwnerConfigurationError("Bot owner IDs must be Discord user IDs.");
    owners.add(id);
  }
  return Object.freeze({
    isBotOwner: (discordUserId: string) => owners.has(discordUserId),
    size: owners.size,
  });
}

/** Owner list built straight from the `BOT_OWNER_IDS` setting. */
export function botOwnersFromSetting(raw: string | undefined): BotOwners {
  return createBotOwners(parseBotOwnerIds(raw));
}

/** No bot owners: every check behaves exactly as it did before owners existed. */
export const NO_BOT_OWNERS: BotOwners = createBotOwners([]);
