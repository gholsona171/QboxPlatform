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
/** Thrown when `BOT_OWNER_IDS` holds something that is not a Discord user ID. */
export declare class BotOwnerConfigurationError extends Error {
    constructor(message: string);
}
/**
 * Reads a comma-separated list of Discord user IDs. Blank entries are
 * ignored; anything else that is not a Discord ID fails startup, so a typo
 * never silently leaves the owner without access.
 */
export declare function parseBotOwnerIds(raw: string | undefined): readonly string[];
/** Builds the owner list from verified Discord user IDs. */
export declare function createBotOwners(ids: Iterable<string>): BotOwners;
/** Owner list built straight from the `BOT_OWNER_IDS` setting. */
export declare function botOwnersFromSetting(raw: string | undefined): BotOwners;
/** No bot owners: every check behaves exactly as it did before owners existed. */
export declare const NO_BOT_OWNERS: BotOwners;
//# sourceMappingURL=BotOwners.d.ts.map