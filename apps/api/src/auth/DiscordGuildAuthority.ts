import { DISCORD_PERMISSION, type DiscordRestClient } from "@qbox/shared/discord-rest";

/**
 * Answers whether a member already runs the server in Discord's eyes.
 *
 * The server owner and anyone holding Administrator or Manage Server get
 * full portal access without any Qbox permission setup, the same way other
 * dashboards treat those members.
 */
export interface DiscordGuildAuthority {
  isManager(guildId: string, userId: string, roleIds: readonly string[]): Promise<boolean>;
}

const MANAGER_BITS = DISCORD_PERMISSION.administrator | DISCORD_PERMISSION.manageGuild;
const DEFAULT_TTL_MS = 60_000;

/** Whether a Discord permission bit string includes Administrator or Manage Server. */
export function hasDiscordManagerPermissions(permissions: string): boolean {
  if (!/^[0-9]{1,30}$/.test(permissions)) return false;
  return (BigInt(permissions) & MANAGER_BITS) !== 0n;
}

interface GuildFacts {
  readonly ownerId: string;
  readonly managerRoleIds: ReadonlySet<string>;
  readonly loadedAt: number;
}

interface ApiGuild {
  readonly owner_id: string;
}

interface ApiRole {
  readonly id: string;
  readonly permissions: string;
}

/** Reads owner and role permissions through the bot's REST client, cached per server. */
export class DiscordRestGuildAuthority implements DiscordGuildAuthority {
  private readonly cache = new Map<string, GuildFacts>();
  private readonly ttlMs: number;
  private readonly now: () => number;
  private readonly onError: ((error: unknown, guildId: string) => void) | undefined;

  public constructor(
    private readonly rest: DiscordRestClient,
    options: {
      readonly ttlMs?: number;
      readonly now?: () => number;
      readonly onError?: (error: unknown, guildId: string) => void;
    } = {},
  ) {
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
    this.now = options.now ?? Date.now;
    this.onError = options.onError;
  }

  public async isManager(guildId: string, userId: string, roleIds: readonly string[]): Promise<boolean> {
    const facts = await this.facts(guildId);
    if (!facts) return false;
    if (facts.ownerId === userId) return true;
    if (facts.managerRoleIds.has(guildId)) return true;
    return roleIds.some((roleId) => facts.managerRoleIds.has(roleId));
  }

  private async facts(guildId: string): Promise<GuildFacts | undefined> {
    const cached = this.cache.get(guildId);
    if (cached && this.now() - cached.loadedAt < this.ttlMs) return cached;
    try {
      const [guild, roles] = await Promise.all([
        this.rest.get(`/guilds/${guildId}`) as Promise<ApiGuild>,
        this.rest.get(`/guilds/${guildId}/roles`) as Promise<readonly ApiRole[]>,
      ]);
      const managerRoleIds = new Set(
        roles.filter((role) => (BigInt(role.permissions) & MANAGER_BITS) !== 0n).map((role) => role.id),
      );
      const facts = { ownerId: guild.owner_id, managerRoleIds, loadedAt: this.now() };
      this.cache.set(guildId, facts);
      return facts;
    } catch (error) {
      this.onError?.(error, guildId);
      return cached;
    }
  }
}
