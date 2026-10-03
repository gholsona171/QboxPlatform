import { PERMISSIONS } from "@qbox/permissions";
import { TtlCache } from "../cache/TtlCache.js";
import { DependencyUnavailableApiError, ValidationApiError } from "../errors/ApiError.js";
const CHANNEL_TYPES = { 0: "TEXT", 2: "VOICE", 4: "CATEGORY", 5: "ANNOUNCEMENT", 13: "STAGE", 15: "FORUM" };
/** Anyone who can manage a feature can see the server's channels, roles, and members. */
export const DIRECTORY_PERMISSIONS = PERMISSIONS.filter((permission) => permission.endsWith(".manage") || permission === "platform.admin");
/** Channel and role lists are reused for this long per server. */
export const DIRECTORY_CACHE_MS = 15_000;
/**
 * Per-server cache of the Discord channel and role lists behind the portal
 * pickers. Builder and wipe runs call `forget` when they finish, and the
 * portal's refresh buttons ask for `?refresh=1`.
 */
export class DirectoryCache {
    cache;
    constructor(options = {}) {
        this.cache = new TtlCache({ ttlMs: options.ttlMs ?? DIRECTORY_CACHE_MS, maxEntries: 500, ...(options.now ? { now: options.now } : {}) });
    }
    load(guildId, read, options = {}) {
        if (options.refresh)
            this.cache.delete(guildId);
        return this.cache.getOrLoad(guildId, read);
    }
    /** Drops one server's lists (after its channels or roles changed). */
    forget(guildId) {
        this.cache.delete(guildId);
    }
}
/**
 * Discord server directory for portal pickers:
 * `GET /api/v1/directory` (channels, roles) and
 * `GET /api/v1/directory/members?query=` or `?ids=a,b`.
 */
export function directoryApiFeature(rest, cache = new DirectoryCache()) {
    return { name: "directory", register: (server, context) => registerDirectoryRoutes(server, context, rest, cache) };
}
function registerDirectoryRoutes(server, context, rest, cache) {
    const discord = () => {
        if (!rest)
            throw new DependencyUnavailableApiError();
        return rest;
    };
    server.get("/api/v1/directory", async (request, reply) => {
        reply.header("cache-control", "no-store");
        await context.guard(request, DIRECTORY_PERMISSIONS, { mutation: false });
        const guildId = context.guildId;
        const refresh = Reflect.get((request.query ?? {}), "refresh") === "1";
        const { channels, roles } = await cache.load(guildId, async () => {
            const [channelList, roleList] = await Promise.all([
                discord().get(`/guilds/${guildId}/channels`),
                discord().get(`/guilds/${guildId}/roles`),
            ]);
            return { channels: channelList, roles: roleList };
        }, { refresh }).catch((error) => {
            if (error instanceof DependencyUnavailableApiError)
                throw error;
            throw new DependencyUnavailableApiError();
        });
        return {
            data: {
                channels: channels
                    .map((channel) => ({ id: channel.id, name: channel.name ?? channel.id, type: CHANNEL_TYPES[channel.type] ?? "OTHER", ...(channel.parent_id ? { parentId: channel.parent_id } : {}), position: channel.position ?? 0 }))
                    .sort((left, right) => left.position - right.position),
                roles: roles
                    .filter((role) => role.id !== context.guildId && !role.managed)
                    .map((role) => ({ id: role.id, name: role.name, color: `#${role.color.toString(16).padStart(6, "0")}`, position: role.position }))
                    .sort((left, right) => right.position - left.position),
            },
        };
    });
    server.get("/api/v1/directory/members", async (request, reply) => {
        reply.header("cache-control", "no-store");
        await context.guard(request, DIRECTORY_PERMISSIONS, { mutation: false });
        const query = request.query && typeof request.query === "object" ? request.query : {};
        if (typeof query.ids === "string") {
            const ids = query.ids.split(",").filter((id) => /^\d{17,20}$/.test(id)).slice(0, 50);
            const members = await Promise.all(ids.map((id) => discord().get(`/guilds/${context.guildId}/members/${id}`).catch(() => undefined)));
            return { data: members.flatMap((member) => (member ? [mapMember(member)] : [])) };
        }
        const search = typeof query.query === "string" ? query.query.trim() : "";
        if (search.length < 1 || search.length > 32)
            throw new ValidationApiError([{ path: "query", code: "invalid", message: "Search needs 1 to 32 characters." }]);
        const members = (await discord().get(`/guilds/${context.guildId}/members/search?query=${encodeURIComponent(search)}&limit=10`).catch(() => { throw new DependencyUnavailableApiError(); }));
        return { data: members.map(mapMember) };
    });
}
function mapMember(member) {
    const avatar = member.user.avatar;
    return {
        id: member.user.id,
        username: member.user.username,
        displayName: member.nick ?? member.user.global_name ?? member.user.username,
        roleIds: member.roles,
        bot: member.user.bot === true,
        ...(avatar ? { avatarUrl: `https://cdn.discordapp.com/avatars/${member.user.id}/${avatar}.png?size=64` } : {}),
    };
}
//# sourceMappingURL=DirectoryRoutes.js.map