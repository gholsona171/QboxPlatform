import { AuthenticationServiceError, discordGuildId, } from "@qbox/authentication";
import { PERMISSIONS } from "@qbox/permissions";
import { hasDiscordManagerPermissions } from "./DiscordGuildAuthority.js";
const DEFAULT_TTL_MS = 60_000;
const REQUIRED_SCOPE = "guilds";
const REAUTH_FAILURE_CODES = new Set([
    "MISSING_REQUIRED_SCOPE",
    "EXPIRED_OR_REVOKED_PROVIDER_TOKEN",
    "INVALID_CALLBACK",
]);
/**
 * Intersects the member's Discord server list with the bot's, cached per
 * identity for a minute. A stored grant without the `guilds` scope (users who
 * signed in before multi-server support) yields `reauthRequired` instead of
 * an error so the portal can ask them to sign in again.
 */
export class DiscordGuildDirectory {
    dependencies;
    cache = new Map();
    ttlMs;
    now;
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.ttlMs = dependencies.ttlMs ?? DEFAULT_TTL_MS;
        this.now = dependencies.now ?? Date.now;
    }
    async list(identity, context, signal, options = {}) {
        const cached = this.cache.get(identity.id);
        if (!options.refresh && cached && this.now() - cached.loadedAt < this.ttlMs)
            return cached.listing;
        const listing = await this.load(identity, context, signal);
        this.cache.set(identity.id, { listing, loadedAt: this.now() });
        return listing;
    }
    forget(identityId) {
        this.cache.delete(identityId);
    }
    async load(identity, context, signal) {
        // The bot's server list does not depend on the member's; read both at once.
        const botGuilds = this.dependencies.bot?.listGuilds();
        botGuilds?.catch(() => undefined);
        const memberGuilds = await this.memberGuilds(identity, context, signal);
        if (memberGuilds === undefined)
            return Object.freeze({ guilds: [], reauthRequired: true });
        const shared = await this.shared(memberGuilds, botGuilds);
        const guilds = await Promise.all(shared.map(async ({ member, bot }) => {
            const discordManager = member.owner || hasDiscordManagerPermissions(member.permissions);
            const canManage = discordManager || ((await this.dependencies.qboxAccess?.(identity, member.id)) ?? false);
            return Object.freeze({
                id: member.id,
                name: bot?.name ?? member.name,
                icon: bot?.icon ?? member.icon,
                owner: member.owner,
                canManage,
            });
        }));
        guilds.sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id));
        return Object.freeze({ guilds: Object.freeze(guilds), reauthRequired: false });
    }
    /** The member's servers, or `undefined` when the stored grant cannot list them. */
    async memberGuilds(identity, context, signal) {
        const credential = await this.dependencies.unitOfWork.run((repositories) => repositories.oauthCredentials.findByExternalIdentity(identity.id));
        if (!credential || credential.revokedAt || !credential.scopes.includes(REQUIRED_SCOPE))
            return undefined;
        try {
            const access = await this.dependencies.credentials.loadUsableAccessCredential(identity.id, context, signal);
            return await this.dependencies.provider.fetchGuilds(access.accessToken, signal);
        }
        catch (error) {
            if (isReauthFailure(error)) {
                this.dependencies.logger?.info({ event: "api.guilds.reauth-required", externalIdentityId: identity.id }, "Stored Discord grant cannot list servers; the member must sign in again.");
                return undefined;
            }
            throw error;
        }
    }
    async shared(memberGuilds, botGuildList) {
        if (!botGuildList) {
            const fallback = this.dependencies.defaultGuildId;
            return memberGuilds
                .filter((guild) => guild.id === fallback)
                .map((member) => ({ member, bot: undefined }));
        }
        const botGuilds = new Map((await botGuildList).map((guild) => [guild.id, guild]));
        return memberGuilds
            .filter((guild) => botGuilds.has(guild.id))
            .map((member) => ({ member, bot: botGuilds.get(member.id) }));
    }
}
function isReauthFailure(error) {
    if (error instanceof AuthenticationServiceError)
        return error.code === "identity-unavailable";
    if (typeof error !== "object" || error === null)
        return false;
    const code = Reflect.get(error, "code");
    return typeof code === "string" && REAUTH_FAILURE_CODES.has(code);
}
/** Bot-side server list read through the bot's REST client, cached for a minute. */
export class DiscordRestBotGuildSource {
    rest;
    cached;
    inFlight;
    ttlMs;
    now;
    constructor(rest, options = {}) {
        this.rest = rest;
        this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
        this.now = options.now ?? Date.now;
    }
    async listGuilds() {
        if (this.cached && this.now() - this.cached.loadedAt < this.ttlMs)
            return this.cached.guilds;
        if (this.inFlight)
            return this.inFlight;
        this.inFlight = this.fetchAll().finally(() => {
            this.inFlight = undefined;
        });
        return this.inFlight;
    }
    async fetchAll() {
        const guilds = [];
        let after;
        for (let page = 0; page < BOT_GUILD_PAGE_LIMIT; page += 1) {
            const route = `/users/@me/guilds?limit=200${after === undefined ? "" : `&after=${after}`}`;
            let batch;
            try {
                batch = parseBotGuilds(await this.rest.get(route));
            }
            catch (error) {
                if (this.cached)
                    return this.cached.guilds;
                throw error;
            }
            guilds.push(...batch);
            if (batch.length < 200)
                break;
            after = batch[batch.length - 1]?.id;
        }
        this.cached = { guilds: Object.freeze(guilds), loadedAt: this.now() };
        return this.cached.guilds;
    }
}
const BOT_GUILD_PAGE_LIMIT = 50;
function parseBotGuilds(value) {
    if (!Array.isArray(value))
        throw new Error("Discord returned an unexpected guild list.");
    return value.flatMap((entry) => {
        if (typeof entry !== "object" || entry === null)
            return [];
        const id = Reflect.get(entry, "id");
        const name = Reflect.get(entry, "name");
        const icon = Reflect.get(entry, "icon");
        if (typeof id !== "string" || typeof name !== "string")
            return [];
        return [{ id, name, icon: typeof icon === "string" ? icon : null }];
    });
}
/** Builds the Qbox side of `canManage`: any active permission in that server, roles from the stored membership. */
export function createQboxAccessCheck(dependencies) {
    return async (identity, guildId) => {
        const membership = await dependencies.unitOfWork.run((repositories) => repositories.guildMemberships.find(identity.id, discordGuildId(guildId)));
        const principals = [
            { type: "discord-user", externalId: identity.providerSubjectId, guildId },
            ...(membership?.status === "PRESENT" ? membership.roles : []).map((role) => ({
                type: "discord-role",
                externalId: role.roleId,
                guildId,
            })),
        ];
        const decision = await dependencies.authorizer.authorize({
            principals,
            scope: { type: "discord-guild", guildId },
            required: [...PERMISSIONS],
            mode: "any",
            administratorOverride: true,
        });
        return decision.allowed;
    };
}
//# sourceMappingURL=GuildDirectory.js.map