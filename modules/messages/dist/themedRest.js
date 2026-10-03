import { applyLook, lookIsEmpty } from "./applyLook.js";
const CHANNEL_MESSAGES = /^\/channels\/(\d+)\/messages(?:\/|$|\?)/;
const INTERACTION_CALLBACK = /^\/interactions\/(\d+)\/([^/?]+)\/callback/;
const WEBHOOK = /^\/webhooks\/\d+\/([^/?]+)/;
const CHANNEL_CACHE_SIZE = 5000;
const GUILD_NAME_CACHE_SIZE = 2000;
const GUILD_NAME_TTL_MS = 10 * 60_000;
/** Bounded insertion-ordered map: the oldest entry goes when the cap is reached. */
class BoundedMap {
    cap;
    map = new Map();
    constructor(cap) {
        this.cap = cap;
    }
    get(key) {
        return this.map.get(key);
    }
    has(key) {
        return this.map.has(key);
    }
    set(key, value) {
        if (!this.map.has(key) && this.map.size >= this.cap) {
            const oldest = this.map.keys().next().value;
            if (oldest !== undefined)
                this.map.delete(oldest);
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
export function guildResolver(rest, interactions) {
    const channels = new BoundedMap(CHANNEL_CACHE_SIZE);
    return async (route) => {
        const channel = CHANNEL_MESSAGES.exec(route);
        if (channel) {
            const channelId = channel[1];
            if (!channels.has(channelId)) {
                const data = (await rest.get(`/channels/${channelId}`));
                channels.set(channelId, data.guild_id ?? null);
            }
            return channels.get(channelId) ?? undefined;
        }
        const callback = INTERACTION_CALLBACK.exec(route);
        if (callback)
            return interactions?.byId(callback[1]) ?? interactions?.byToken(callback[2]);
        const webhook = WEBHOOK.exec(route);
        if (webhook)
            return interactions?.byToken(webhook[1]);
        return undefined;
    };
}
/**
 * Applies a server's look to the embeds in a message body. Handles
 * `{ embeds }` and `{ data: { embeds } }` (interaction callbacks). Any
 * failure returns the body untouched so sending is never blocked.
 */
export class EmbedThemer {
    rest;
    resolve;
    looks;
    guildNames = new BoundedMap(GUILD_NAME_CACHE_SIZE);
    now;
    constructor(rest, resolve, looks, options = {}) {
        this.rest = rest;
        this.resolve = resolve;
        this.looks = looks;
        this.now = options.now ?? Date.now;
    }
    async theme(route, method, body) {
        try {
            const upper = method.toUpperCase();
            if (upper !== "POST" && upper !== "PATCH")
                return body;
            if (!body || typeof body !== "object" || Array.isArray(body))
                return body;
            const record = body;
            const nested = record.data && typeof record.data === "object" && !Array.isArray(record.data) ? record.data : undefined;
            const holder = Array.isArray(record.embeds) ? record : nested && Array.isArray(nested.embeds) ? nested : undefined;
            if (!holder || holder.embeds.length === 0)
                return body;
            const guildId = await this.resolve(route);
            if (!guildId)
                return body;
            const look = await this.looks.look(guildId);
            if (!look || !look.enabled || lookIsEmpty(look))
                return body;
            const needsName = /\{server\}/.test(`${look.footerText ?? ""}${look.authorName ?? ""}`);
            const guildName = needsName ? await this.guildName(guildId) : "";
            const themed = holder.embeds.map((embed) => embed && typeof embed === "object" && !Array.isArray(embed) ? applyLook(embed, look, { guildName, now: new Date(this.now()) }) : embed);
            return holder === record ? { ...record, embeds: themed } : { ...record, data: { ...holder, embeds: themed } };
        }
        catch {
            return body;
        }
    }
    async guildName(guildId) {
        const cached = this.guildNames.get(guildId);
        if (cached && this.now() - cached.at < GUILD_NAME_TTL_MS)
            return cached.name;
        const guild = (await this.rest.get(`/guilds/${guildId}`));
        this.guildNames.set(guildId, { name: guild.name, at: this.now() });
        return guild.name;
    }
}
/**
 * Decorates a `DiscordRestClient` so every message body with embeds gets the
 * guild's look before it is sent. GET, PUT, and DELETE pass straight through.
 */
export function themedRest(rest, resolve, looks, options = {}) {
    const themer = new EmbedThemer(rest, resolve, looks, options);
    const withTheme = (method, route, request) => request?.body === undefined
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
/**
 * Wraps a discord.js `REST` instance's `request` method in place, so both
 * feature gateways and discord.js's own interaction replies get themed.
 * Returns a function that restores the original.
 */
export function installThemedRequests(rest, resolve, looks, options = {}) {
    const themer = new EmbedThemer(rest, resolve, looks, options);
    const original = rest.request;
    const wrapped = async function (request) {
        const body = request.body === undefined ? undefined : await themer.theme(request.fullRoute, request.method, request.body);
        return original.call(this, body === undefined ? request : { ...request, body });
    };
    rest.request = wrapped;
    return () => {
        if (rest.request === wrapped)
            rest.request = original;
    };
}
//# sourceMappingURL=themedRest.js.map