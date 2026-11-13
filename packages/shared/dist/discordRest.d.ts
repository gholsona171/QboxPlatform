/**
 * Discord REST helpers shared by feature adapters. This entry point
 * (`@qbox/shared/discord-rest`) has no side effects and does not load
 * environment configuration.
 */
/** File attached to a Discord REST request. */
export interface DiscordRestFile {
    readonly name: string;
    readonly data: Buffer;
    readonly contentType?: string;
}
export interface DiscordRestRequest {
    readonly body?: unknown;
    readonly files?: DiscordRestFile[];
    readonly reason?: string;
}
/**
 * Minimal Discord REST v10 surface. discord.js `REST` (and `client.rest`)
 * satisfies it, so the bot and the API share adapter implementations.
 */
export interface DiscordRestClient {
    get(route: `/${string}`, options?: DiscordRestRequest): Promise<unknown>;
    post(route: `/${string}`, options?: DiscordRestRequest): Promise<unknown>;
    patch(route: `/${string}`, options?: DiscordRestRequest): Promise<unknown>;
    put(route: `/${string}`, options?: DiscordRestRequest): Promise<unknown>;
    delete(route: `/${string}`, options?: DiscordRestRequest): Promise<unknown>;
}
/** `#5865F2` to the integer Discord expects for embed colors. */
export declare function colorValue(hex: string): number;
/** Guild names for `{server}` placeholders, fetched through GET /guilds/:id and cached for ten minutes. */
export declare class GuildNameCache {
    private readonly rest;
    private readonly now;
    private readonly names;
    constructor(rest: DiscordRestClient, now?: () => number);
    name(guildId: string): Promise<string>;
}
/** Parses `<:name:id>`, `<a:name:id>`, or a unicode emoji into a Discord emoji object. */
export declare function emojiObject(value: string): {
    readonly id?: string;
    readonly name: string;
    readonly animated?: boolean;
};
/** Discord JSON error codes the adapters tell apart. */
export declare const DISCORD_ERROR: {
    readonly unknownChannel: 10003;
    readonly unknownMessage: 10008;
    readonly missingAccess: 50001;
};
/** The Discord JSON error code on a REST failure (discord.js `DiscordAPIError.code`), if any. */
export declare function discordErrorCode(error: unknown): number | undefined;
/** The channel was deleted (Unknown Channel) or the bot can no longer see it (Missing Access). */
export declare function isMissingChannelError(error: unknown): boolean;
/** Plain message shown when a stored panel channel is gone. */
export declare const MISSING_PANEL_CHANNEL_MESSAGE = "The panel's channel no longer exists. Pick a new channel for this panel and post it again.";
/** Discord permission bits used by feature adapters. */
export declare const DISCORD_PERMISSION: {
    readonly createInstantInvite: bigint;
    readonly kickMembers: bigint;
    readonly banMembers: bigint;
    readonly administrator: bigint;
    readonly manageChannels: bigint;
    readonly manageGuild: bigint;
    readonly addReactions: bigint;
    readonly viewAuditLog: bigint;
    readonly prioritySpeaker: bigint;
    readonly stream: bigint;
    readonly viewChannel: bigint;
    readonly sendMessages: bigint;
    readonly manageMessages: bigint;
    readonly embedLinks: bigint;
    readonly attachFiles: bigint;
    readonly readMessageHistory: bigint;
    readonly mentionEveryone: bigint;
    readonly useExternalEmojis: bigint;
    readonly connect: bigint;
    readonly speak: bigint;
    readonly muteMembers: bigint;
    readonly deafenMembers: bigint;
    readonly moveMembers: bigint;
    readonly useVoiceActivity: bigint;
    readonly changeNickname: bigint;
    readonly manageNicknames: bigint;
    readonly manageRoles: bigint;
    readonly manageWebhooks: bigint;
    readonly manageGuildExpressions: bigint;
    readonly useApplicationCommands: bigint;
    readonly requestToSpeak: bigint;
    readonly manageEvents: bigint;
    readonly manageThreads: bigint;
    readonly createPublicThreads: bigint;
    readonly createPrivateThreads: bigint;
    readonly sendMessagesInThreads: bigint;
    readonly moderateMembers: bigint;
    readonly sendVoiceMessages: bigint;
};
//# sourceMappingURL=discordRest.d.ts.map