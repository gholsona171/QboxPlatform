import {
  AuthenticationServiceError,
  discordGuildId,
  type AuthenticationOperationContext,
  type AuthenticationUnitOfWork,
  type ExternalIdentity,
  type OpaqueAuthenticationSecret,
} from "@qbox/authentication";
import { PERMISSIONS, type PermissionAuthorizer, type PermissionPrincipal } from "@qbox/permissions";
import type { DiscordRestClient } from "@qbox/shared/discord-rest";

import type { ApiLogger } from "../logging/ApiLogger.js";
import { hasDiscordManagerPermissions } from "./DiscordGuildAuthority.js";

/** One server as Discord reports it to the signed-in user (`guilds` scope). */
export interface DiscordUserGuild {
  readonly id: string;
  readonly name: string;
  readonly icon: string | null;
  readonly owner: boolean;
  /** Permission bits as a decimal string. */
  readonly permissions: string;
}

/** Reads the signed-in user's server list with their OAuth access token. */
export interface DiscordUserGuildSource {
  fetchGuilds(accessToken: OpaqueAuthenticationSecret, signal: AbortSignal): Promise<readonly DiscordUserGuild[]>;
}

/** One server the bot is in. */
export interface BotGuild {
  readonly id: string;
  readonly name: string;
  readonly icon: string | null;
}

/** Lists the servers the bot is in. */
export interface BotGuildSource {
  listGuilds(): Promise<readonly BotGuild[]>;
}

/** A server the member and the bot share, as the portal shows it. */
export interface GuildSummary {
  readonly id: string;
  readonly name: string;
  readonly icon: string | null;
  readonly owner: boolean;
  /** Discord owner / Administrator / Manage Server, or any Qbox permission there. */
  readonly canManage: boolean;
}

/** The member's server list, or the reason it could not be read. */
export interface GuildListing {
  readonly guilds: readonly GuildSummary[];
  /** The stored OAuth grant predates the `guilds` scope; the member must sign in again. */
  readonly reauthRequired: boolean;
}

/** Answers which servers a signed-in member and the bot share. */
export interface GuildDirectory {
  /** Lists shared servers; `refresh` re-reads Discord instead of the cache. */
  list(
    identity: ExternalIdentity,
    context: AuthenticationOperationContext,
    signal: AbortSignal,
    options?: { readonly refresh?: boolean },
  ): Promise<GuildListing>;
  /** Drops the cached list for one identity (after login or membership changes). */
  forget(identityId: ExternalIdentity["id"]): void;
}

/** Whether the member holds any Qbox permission in one server. */
export type QboxAccessCheck = (identity: ExternalIdentity, guildId: string) => Promise<boolean>;

export interface DiscordGuildDirectoryDependencies {
  readonly credentials: {
    loadUsableAccessCredential(
      externalIdentityId: ExternalIdentity["id"],
      context: AuthenticationOperationContext,
      signal: AbortSignal,
    ): Promise<{ readonly accessToken: OpaqueAuthenticationSecret }>;
  };
  readonly unitOfWork: AuthenticationUnitOfWork;
  readonly provider: DiscordUserGuildSource;
  /** Absent when the bot token is not configured; then only the default server is offered. */
  readonly bot?: BotGuildSource | undefined;
  readonly qboxAccess?: QboxAccessCheck | undefined;
  readonly defaultGuildId?: string | undefined;
  readonly ttlMs?: number;
  readonly now?: () => number;
  readonly logger?: ApiLogger;
}

const DEFAULT_TTL_MS = 60_000;
const REQUIRED_SCOPE = "guilds";
const REAUTH_FAILURE_CODES: ReadonlySet<string> = new Set([
  "MISSING_REQUIRED_SCOPE",
  "EXPIRED_OR_REVOKED_PROVIDER_TOKEN",
  "INVALID_CALLBACK",
]);

interface CachedListing {
  readonly listing: GuildListing;
  readonly loadedAt: number;
}

/**
 * Intersects the member's Discord server list with the bot's, cached per
 * identity for a minute. A stored grant without the `guilds` scope (users who
 * signed in before multi-server support) yields `reauthRequired` instead of
 * an error so the portal can ask them to sign in again.
 */
export class DiscordGuildDirectory implements GuildDirectory {
  private readonly cache = new Map<string, CachedListing>();
  private readonly ttlMs: number;
  private readonly now: () => number;

  public constructor(private readonly dependencies: DiscordGuildDirectoryDependencies) {
    this.ttlMs = dependencies.ttlMs ?? DEFAULT_TTL_MS;
    this.now = dependencies.now ?? Date.now;
  }

  public async list(
    identity: ExternalIdentity,
    context: AuthenticationOperationContext,
    signal: AbortSignal,
    options: { readonly refresh?: boolean } = {},
  ): Promise<GuildListing> {
    const cached = this.cache.get(identity.id);
    if (!options.refresh && cached && this.now() - cached.loadedAt < this.ttlMs) return cached.listing;
    const listing = await this.load(identity, context, signal);
    this.cache.set(identity.id, { listing, loadedAt: this.now() });
    return listing;
  }

  public forget(identityId: ExternalIdentity["id"]): void {
    this.cache.delete(identityId);
  }

  private async load(
    identity: ExternalIdentity,
    context: AuthenticationOperationContext,
    signal: AbortSignal,
  ): Promise<GuildListing> {
    const memberGuilds = await this.memberGuilds(identity, context, signal);
    if (memberGuilds === undefined) return Object.freeze({ guilds: [], reauthRequired: true });
    const shared = await this.shared(memberGuilds);
    const guilds = await Promise.all(
      shared.map(async ({ member, bot }) => {
        const discordManager = member.owner || hasDiscordManagerPermissions(member.permissions);
        const canManage =
          discordManager || ((await this.dependencies.qboxAccess?.(identity, member.id)) ?? false);
        return Object.freeze({
          id: member.id,
          name: bot?.name ?? member.name,
          icon: bot?.icon ?? member.icon,
          owner: member.owner,
          canManage,
        });
      }),
    );
    guilds.sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id));
    return Object.freeze({ guilds: Object.freeze(guilds), reauthRequired: false });
  }

  /** The member's servers, or `undefined` when the stored grant cannot list them. */
  private async memberGuilds(
    identity: ExternalIdentity,
    context: AuthenticationOperationContext,
    signal: AbortSignal,
  ): Promise<readonly DiscordUserGuild[] | undefined> {
    const credential = await this.dependencies.unitOfWork.run((repositories) =>
      repositories.oauthCredentials.findByExternalIdentity(identity.id),
    );
    if (!credential || credential.revokedAt || !credential.scopes.includes(REQUIRED_SCOPE)) return undefined;
    try {
      const access = await this.dependencies.credentials.loadUsableAccessCredential(identity.id, context, signal);
      return await this.dependencies.provider.fetchGuilds(access.accessToken, signal);
    } catch (error) {
      if (isReauthFailure(error)) {
        this.dependencies.logger?.info(
          { event: "api.guilds.reauth-required", externalIdentityId: identity.id },
          "Stored Discord grant cannot list servers; the member must sign in again.",
        );
        return undefined;
      }
      throw error;
    }
  }

  private async shared(
    memberGuilds: readonly DiscordUserGuild[],
  ): Promise<readonly { readonly member: DiscordUserGuild; readonly bot: BotGuild | undefined }[]> {
    if (!this.dependencies.bot) {
      const fallback = this.dependencies.defaultGuildId;
      return memberGuilds
        .filter((guild) => guild.id === fallback)
        .map((member) => ({ member, bot: undefined }));
    }
    const botGuilds = new Map((await this.dependencies.bot.listGuilds()).map((guild) => [guild.id, guild] as const));
    return memberGuilds
      .filter((guild) => botGuilds.has(guild.id))
      .map((member) => ({ member, bot: botGuilds.get(member.id) }));
  }
}

function isReauthFailure(error: unknown): boolean {
  if (error instanceof AuthenticationServiceError) return error.code === "identity-unavailable";
  if (typeof error !== "object" || error === null) return false;
  const code = Reflect.get(error, "code");
  return typeof code === "string" && REAUTH_FAILURE_CODES.has(code);
}

/** Bot-side server list read through the bot's REST client, cached for a minute. */
export class DiscordRestBotGuildSource implements BotGuildSource {
  private cached: { readonly guilds: readonly BotGuild[]; readonly loadedAt: number } | undefined;
  private inFlight: Promise<readonly BotGuild[]> | undefined;
  private readonly ttlMs: number;
  private readonly now: () => number;

  public constructor(
    private readonly rest: DiscordRestClient,
    options: { readonly ttlMs?: number; readonly now?: () => number } = {},
  ) {
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
    this.now = options.now ?? Date.now;
  }

  public async listGuilds(): Promise<readonly BotGuild[]> {
    if (this.cached && this.now() - this.cached.loadedAt < this.ttlMs) return this.cached.guilds;
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.fetchAll().finally(() => {
      this.inFlight = undefined;
    });
    return this.inFlight;
  }

  private async fetchAll(): Promise<readonly BotGuild[]> {
    const guilds: BotGuild[] = [];
    let after: string | undefined;
    for (let page = 0; page < BOT_GUILD_PAGE_LIMIT; page += 1) {
      const route = `/users/@me/guilds?limit=200${after === undefined ? "" : `&after=${after}`}` as const;
      let batch: readonly BotGuild[];
      try {
        batch = parseBotGuilds(await this.rest.get(route));
      } catch (error) {
        if (this.cached) return this.cached.guilds;
        throw error;
      }
      guilds.push(...batch);
      if (batch.length < 200) break;
      after = batch[batch.length - 1]?.id;
    }
    this.cached = { guilds: Object.freeze(guilds), loadedAt: this.now() };
    return this.cached.guilds;
  }
}

const BOT_GUILD_PAGE_LIMIT = 50;

function parseBotGuilds(value: unknown): readonly BotGuild[] {
  if (!Array.isArray(value)) throw new Error("Discord returned an unexpected guild list.");
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const id = Reflect.get(entry, "id");
    const name = Reflect.get(entry, "name");
    const icon = Reflect.get(entry, "icon");
    if (typeof id !== "string" || typeof name !== "string") return [];
    return [{ id, name, icon: typeof icon === "string" ? icon : null }];
  });
}

/** Builds the Qbox side of `canManage`: any active permission in that server, roles from the stored membership. */
export function createQboxAccessCheck(dependencies: {
  readonly authorizer: PermissionAuthorizer;
  readonly unitOfWork: AuthenticationUnitOfWork;
}): QboxAccessCheck {
  return async (identity, guildId) => {
    const membership = await dependencies.unitOfWork.run((repositories) =>
      repositories.guildMemberships.find(identity.id, discordGuildId(guildId)),
    );
    const principals: PermissionPrincipal[] = [
      { type: "discord-user", externalId: identity.providerSubjectId, guildId },
      ...(membership?.status === "PRESENT" ? membership.roles : []).map((role) => ({
        type: "discord-role" as const,
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
