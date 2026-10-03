import { DISCORD_PERMISSION } from "@qbox/shared/discord-rest";
const MANAGER_BITS = DISCORD_PERMISSION.administrator | DISCORD_PERMISSION.manageGuild;
const DEFAULT_TTL_MS = 60_000;
/** Role changes in Discord reach the portal within this time. */
export const LIVE_MEMBER_TTL_MS = 30_000;
const LIVE_MEMBER_MAX_ENTRIES = 5_000;
/** Whether a Discord permission bit string includes Administrator or Manage Server. */
export function hasDiscordManagerPermissions(permissions) {
    if (!/^[0-9]{1,30}$/.test(permissions))
        return false;
    return (BigInt(permissions) & MANAGER_BITS) !== 0n;
}
/** Reads owner and role permissions through the bot's REST client, cached per server. */
export class DiscordRestGuildAuthority {
    rest;
    cache = new Map();
    members = new Map();
    ttlMs;
    now;
    onError;
    constructor(rest, options = {}) {
        this.rest = rest;
        this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
        this.now = options.now ?? Date.now;
        this.onError = options.onError;
    }
    async isManager(guildId, userId, roleIds) {
        const facts = await this.facts(guildId);
        if (!facts)
            return false;
        if (facts.ownerId === userId)
            return true;
        if (facts.managerRoleIds.has(guildId))
            return true;
        return roleIds.some((roleId) => facts.managerRoleIds.has(roleId));
    }
    async liveMember(guildId, userId) {
        const key = `${guildId}:${userId}`;
        const cached = this.members.get(key);
        if (cached && this.now() - cached.loadedAt < LIVE_MEMBER_TTL_MS)
            return cached.member;
        let member;
        try {
            const found = (await this.rest.get(`/guilds/${guildId}/members/${userId}`));
            member = { present: true, roleIds: [...found.roles] };
        }
        catch (error) {
            if (!isUnknownMember(error)) {
                this.onError?.(error, guildId);
                return undefined;
            }
            member = { present: false, roleIds: [] };
        }
        if (this.members.size >= LIVE_MEMBER_MAX_ENTRIES)
            this.members.delete(this.members.keys().next().value);
        this.members.set(key, { member, loadedAt: this.now() });
        return member;
    }
    async facts(guildId) {
        const cached = this.cache.get(guildId);
        if (cached && this.now() - cached.loadedAt < this.ttlMs)
            return cached;
        try {
            const [guild, roles] = await Promise.all([
                this.rest.get(`/guilds/${guildId}`),
                this.rest.get(`/guilds/${guildId}/roles`),
            ]);
            const managerRoleIds = new Set(roles.filter((role) => (BigInt(role.permissions) & MANAGER_BITS) !== 0n).map((role) => role.id));
            const facts = { ownerId: guild.owner_id, managerRoleIds, loadedAt: this.now() };
            this.cache.set(guildId, facts);
            return facts;
        }
        catch (error) {
            this.onError?.(error, guildId);
            return cached;
        }
    }
}
/** Discord answers 404 with code 10007 (Unknown Member) when the user is not in the server. */
function isUnknownMember(error) {
    if (typeof error !== "object" || error === null)
        return false;
    const code = Reflect.get(error, "code");
    const status = Reflect.get(error, "status");
    return code === 10007 || (status === 404 && code !== 10004);
}
//# sourceMappingURL=DiscordGuildAuthority.js.map