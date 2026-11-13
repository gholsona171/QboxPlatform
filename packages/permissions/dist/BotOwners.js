const DISCORD_SNOWFLAKE = /^[1-9][0-9]{16,19}$/u;
/** Thrown when `BOT_OWNER_IDS` holds something that is not a Discord user ID. */
export class BotOwnerConfigurationError extends Error {
    constructor(message) {
        super(message);
        this.name = "BotOwnerConfigurationError";
    }
}
/**
 * Reads a comma-separated list of Discord user IDs. Blank entries are
 * ignored; anything else that is not a Discord ID fails startup, so a typo
 * never silently leaves the owner without access.
 */
export function parseBotOwnerIds(raw) {
    if (raw === undefined)
        return [];
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
export function createBotOwners(ids) {
    const owners = new Set();
    for (const id of ids) {
        if (!DISCORD_SNOWFLAKE.test(id))
            throw new BotOwnerConfigurationError("Bot owner IDs must be Discord user IDs.");
        owners.add(id);
    }
    return Object.freeze({
        isBotOwner: (discordUserId) => owners.has(discordUserId),
        size: owners.size,
    });
}
/** Owner list built straight from the `BOT_OWNER_IDS` setting. */
export function botOwnersFromSetting(raw) {
    return createBotOwners(parseBotOwnerIds(raw));
}
/** No bot owners: every check behaves exactly as it did before owners existed. */
export const NO_BOT_OWNERS = createBotOwners([]);
//# sourceMappingURL=BotOwners.js.map