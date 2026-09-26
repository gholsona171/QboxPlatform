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
export function colorValue(hex: string): number {
  return Number.parseInt(hex.replace("#", ""), 16);
}

const GUILD_NAME_CACHE_MS = 10 * 60_000;

/** Guild names for `{server}` placeholders, fetched through GET /guilds/:id and cached for ten minutes. */
export class GuildNameCache {
  private readonly names = new Map<string, { readonly name: string; readonly at: number }>();

  public constructor(
    private readonly rest: DiscordRestClient,
    private readonly now: () => number = Date.now,
  ) {}

  public async name(guildId: string): Promise<string> {
    const cached = this.names.get(guildId);
    if (cached && this.now() - cached.at < GUILD_NAME_CACHE_MS) return cached.name;
    const guild = (await this.rest.get(`/guilds/${guildId}`)) as { readonly name: string };
    this.names.set(guildId, { name: guild.name, at: this.now() });
    return guild.name;
  }
}

/** Parses `<:name:id>`, `<a:name:id>`, or a unicode emoji into a Discord emoji object. */
export function emojiObject(value: string): { readonly id?: string; readonly name: string; readonly animated?: boolean } {
  const custom = /^<(a?):(\w{2,32}):(\d{17,20})>$/.exec(value.trim());
  if (custom) return { id: custom[3] as string, name: custom[2] as string, animated: custom[1] === "a" };
  return { name: value.trim() };
}

/** Discord JSON error codes the adapters tell apart. */
export const DISCORD_ERROR = {
  unknownChannel: 10003,
  unknownMessage: 10008,
  missingAccess: 50001,
} as const;

/** The Discord JSON error code on a REST failure (discord.js `DiscordAPIError.code`), if any. */
export function discordErrorCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const code = (error as { readonly code?: unknown }).code;
  if (typeof code === "number") return code;
  if (typeof code === "string" && /^\d+$/.test(code)) return Number(code);
  return undefined;
}

/** The channel was deleted (Unknown Channel) or the bot can no longer see it (Missing Access). */
export function isMissingChannelError(error: unknown): boolean {
  const code = discordErrorCode(error);
  return code === DISCORD_ERROR.unknownChannel || code === DISCORD_ERROR.missingAccess;
}

/** Plain message shown when a stored panel channel is gone. */
export const MISSING_PANEL_CHANNEL_MESSAGE = "The panel's channel no longer exists. Pick a new channel for this panel and post it again.";

/** Discord permission bits used by feature adapters. */
export const DISCORD_PERMISSION = {
  createInstantInvite: 1n << 0n,
  kickMembers: 1n << 1n,
  banMembers: 1n << 2n,
  administrator: 1n << 3n,
  manageChannels: 1n << 4n,
  manageGuild: 1n << 5n,
  addReactions: 1n << 6n,
  viewAuditLog: 1n << 7n,
  prioritySpeaker: 1n << 8n,
  stream: 1n << 9n,
  viewChannel: 1n << 10n,
  sendMessages: 1n << 11n,
  manageMessages: 1n << 13n,
  embedLinks: 1n << 14n,
  attachFiles: 1n << 15n,
  readMessageHistory: 1n << 16n,
  mentionEveryone: 1n << 17n,
  useExternalEmojis: 1n << 18n,
  connect: 1n << 20n,
  speak: 1n << 21n,
  muteMembers: 1n << 22n,
  deafenMembers: 1n << 23n,
  moveMembers: 1n << 24n,
  useVoiceActivity: 1n << 25n,
  changeNickname: 1n << 26n,
  manageNicknames: 1n << 27n,
  manageRoles: 1n << 28n,
  manageWebhooks: 1n << 29n,
  useApplicationCommands: 1n << 31n,
  requestToSpeak: 1n << 32n,
  manageEvents: 1n << 33n,
  manageThreads: 1n << 34n,
  createPublicThreads: 1n << 35n,
  createPrivateThreads: 1n << 36n,
  sendMessagesInThreads: 1n << 38n,
  moderateMembers: 1n << 40n,
  sendVoiceMessages: 1n << 46n,
} as const;
