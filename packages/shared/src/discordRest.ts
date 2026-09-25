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

/** Parses `<:name:id>`, `<a:name:id>`, or a unicode emoji into a Discord emoji object. */
export function emojiObject(value: string): { readonly id?: string; readonly name: string; readonly animated?: boolean } {
  const custom = /^<(a?):(\w{2,32}):(\d{17,20})>$/.exec(value.trim());
  if (custom) return { id: custom[3] as string, name: custom[2] as string, animated: custom[1] === "a" };
  return { name: value.trim() };
}

/** Discord permission bits used by feature adapters. */
export const DISCORD_PERMISSION = {
  createInstantInvite: 1n << 0n,
  kickMembers: 1n << 1n,
  banMembers: 1n << 2n,
  administrator: 1n << 3n,
  manageChannels: 1n << 4n,
  addReactions: 1n << 6n,
  viewChannel: 1n << 10n,
  sendMessages: 1n << 11n,
  manageMessages: 1n << 13n,
  embedLinks: 1n << 14n,
  attachFiles: 1n << 15n,
  readMessageHistory: 1n << 16n,
  connect: 1n << 20n,
  speak: 1n << 21n,
  moveMembers: 1n << 24n,
  manageRoles: 1n << 28n,
  createPublicThreads: 1n << 35n,
  createPrivateThreads: 1n << 36n,
  sendMessagesInThreads: 1n << 38n,
  moderateMembers: 1n << 40n,
} as const;
