import type { DiscordRestClient, DiscordRestRequest } from "@qbox/shared/discord-rest";
import type { OutgoingEmbed } from "@qbox/shared/messages";

import { applyLook, lookIsEmpty } from "./applyLook.js";
import type { LookProvider } from "./types.js";

/** Resolves the guild a REST route posts into; undefined leaves the body untouched. */
export type RouteGuildResolver = (route: string) => Promise<string | undefined>;

/** Interaction id and token to guild lookups, filled by the bot on InteractionCreate. */
export interface InteractionGuildSource {
  byId(interactionId: string): string | undefined;
  byToken(token: string): string | undefined;
}

const CHANNEL_MESSAGES = /^\/channels\/(\d+)\/messages(?:\/|$|\?)/;
const INTERACTION_CALLBACK = /^\/interactions\/(\d+)\/([^/?]+)\/callback/;
const WEBHOOK = /^\/webhooks\/\d+\/([^/?]+)/;
const CHANNEL_CACHE_SIZE = 5000;
const GUILD_NAME_CACHE_SIZE = 2000;
const GUILD_NAME_TTL_MS = 10 * 60_000;

interface ThemedRestOptions {
  readonly now?: (() => number) | undefined;
}

/** Bounded insertion-ordered map: the oldest entry goes when the cap is reached. */
class BoundedMap<V> {
  private readonly map = new Map<string, V>();
  public constructor(private readonly cap: number) {}
  public get(key: string): V | undefined {
    return this.map.get(key);
  }
  public has(key: string): boolean {
    return this.map.has(key);
  }
  public set(key: string, value: V): void {
    if (!this.map.has(key) && this.map.size >= this.cap) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(key, value);
  }
}

/**
 * Guild resolution for message routes: `/channels/:id/messages` through a
 * cached `GET /channels/:id` (DM channels have no guild and are remembered
 * as such), interaction callbacks and webhook follow-ups through the
 * interaction map the bot fills.
 */
export function guildResolver(rest: Pick<DiscordRestClient, "get">, interactions?: InteractionGuildSource): RouteGuildResolver {
  const channels = new BoundedMap<string | null>(CHANNEL_CACHE_SIZE);
  return async (route) => {
    const channel = CHANNEL_MESSAGES.exec(route);
    if (channel) {
      const channelId = channel[1] as string;
      if (!channels.has(channelId)) {
        const data = (await rest.get(`/channels/${channelId}`)) as { readonly guild_id?: string | undefined };
        channels.set(channelId, data.guild_id ?? null);
      }
      return channels.get(channelId) ?? undefined;
    }
    const callback = INTERACTION_CALLBACK.exec(route);
    if (callback) return interactions?.byId(callback[1] as string) ?? interactions?.byToken(callback[2] as string);
    const webhook = WEBHOOK.exec(route);
    if (webhook) return interactions?.byToken(webhook[1] as string);
    return undefined;
  };
}

/**
 * Applies a server's look to the embeds in a message body. Handles
 * `{ embeds }` and `{ data: { embeds } }` (interaction callbacks). Any
 * failure returns the body untouched so sending is never blocked.
 */
export class EmbedThemer {
  private readonly guildNames = new BoundedMap<{ readonly name: string; readonly at: number }>(GUILD_NAME_CACHE_SIZE);
  private readonly now: () => number;

  public constructor(
    private readonly rest: Pick<DiscordRestClient, "get">,
    private readonly resolve: RouteGuildResolver,
    private readonly looks: LookProvider,
    options: ThemedRestOptions = {},
  ) {
    this.now = options.now ?? Date.now;
  }

  public async theme(route: string, method: string, body: unknown): Promise<unknown> {
    try {
      const upper = method.toUpperCase();
      if (upper !== "POST" && upper !== "PATCH") return body;
      if (!body || typeof body !== "object" || Array.isArray(body)) return body;
      const record = body as Record<string, unknown>;
      const nested = record.data && typeof record.data === "object" && !Array.isArray(record.data) ? (record.data as Record<string, unknown>) : undefined;
      const holder = Array.isArray(record.embeds) ? record : nested && Array.isArray(nested.embeds) ? nested : undefined;
      if (!holder || (holder.embeds as unknown[]).length === 0) return body;
      const guildId = await this.resolve(route);
      if (!guildId) return body;
      const look = await this.looks.look(guildId);
      if (!look || !look.enabled || lookIsEmpty(look)) return body;
      const needsName = /\{server\}/.test(`${look.footerText ?? ""}${look.authorName ?? ""}`);
      const guildName = needsName ? await this.guildName(guildId) : "";
      const themed = (holder.embeds as unknown[]).map((embed) =>
        embed && typeof embed === "object" && !Array.isArray(embed) ? applyLook(embed as OutgoingEmbed, look, { guildName, now: new Date(this.now()) }) : embed,
      );
      return holder === record ? { ...record, embeds: themed } : { ...record, data: { ...holder, embeds: themed } };
    } catch {
      return body;
    }
  }

  private async guildName(guildId: string): Promise<string> {
    const cached = this.guildNames.get(guildId);
    if (cached && this.now() - cached.at < GUILD_NAME_TTL_MS) return cached.name;
    const guild = (await this.rest.get(`/guilds/${guildId}`)) as { readonly name: string };
    this.guildNames.set(guildId, { name: guild.name, at: this.now() });
    return guild.name;
  }
}

/**
 * Decorates a `DiscordRestClient` so every message body with embeds gets the
 * guild's look before it is sent. GET, PUT, and DELETE pass straight through.
 */
export function themedRest(rest: DiscordRestClient, resolve: RouteGuildResolver, looks: LookProvider, options: ThemedRestOptions = {}): DiscordRestClient {
  const themer = new EmbedThemer(rest, resolve, looks, options);
  const withTheme = (method: "POST" | "PATCH", route: `/${string}`, request: DiscordRestRequest | undefined) =>
    request?.body === undefined
      ? Promise.resolve(request)
      : themer.theme(route, method, request.body).then((body) => ({ ...request, body }));
  return {
    get: (route, request) => rest.get(route, request),
    delete: (route, request) => rest.delete(route, request),
    put: (route, request) => rest.put(route, request),
    post: async (route, request) => rest.post(route, await withTheme("POST", route, request)),
    patch: async (route, request) => rest.patch(route, await withTheme("PATCH", route, request)),
  };
}

/** The part of discord.js `REST` that every helper (`get`, `post`, ...) and discord.js itself funnel through. */
export interface RequestingRest extends Pick<DiscordRestClient, "get"> {
  request(options: { readonly fullRoute: `/${string}`; readonly method: string; readonly body?: unknown }): Promise<unknown>;
}

/**
 * Wraps a discord.js `REST` instance's `request` method in place, so both
 * feature gateways and discord.js's own interaction replies get themed.
 * Returns a function that restores the original.
 */
export function installThemedRequests(rest: RequestingRest, resolve: RouteGuildResolver, looks: LookProvider, options: ThemedRestOptions = {}): () => void {
  const themer = new EmbedThemer(rest, resolve, looks, options);
  const original = rest.request;
  const wrapped: RequestingRest["request"] = async function (this: RequestingRest, request) {
    const body = request.body === undefined ? undefined : await themer.theme(request.fullRoute, request.method, request.body);
    return original.call(this, body === undefined ? request : { ...request, body });
  };
  rest.request = wrapped;
  return () => {
    if (rest.request === wrapped) rest.request = original;
  };
}
