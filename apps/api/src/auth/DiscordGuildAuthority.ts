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
  /**
   * The member's current roles, read through the bot (cached briefly), so
   * role changes in Discord apply without signing in again. `present: false`
   * when Discord says they are not in the server; undefined when Discord
   * could not be asked (callers fall back to the stored snapshot).
   */
  liveMember?(guildId: string, userId: string): Promise<LiveMember | undefined>;
}

export interface LiveMember {
  readonly present: boolean;
  readonly roleIds: readonly string[];
}

const MANAGER_BITS = DISCORD_PERMISSION.administrator | DISCORD_PERMISSION.manageGuild;
const DEFAULT_TTL_MS = 60_000;
/** Role changes in Discord reach the portal within this time. */
export const LIVE_MEMBER_TTL_MS = 30_000;
const LIVE_MEMBER_MAX_ENTRIES = 5_000;

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

interface ApiMember {
  readonly roles: readonly string[];
}

interface ApiRole {
  readonly id: string;
  readonly permissions: string;
}

/** Reads owner and role permissions through the bot's REST client, cached per server. */
export class DiscordRestGuildAuthority implements DiscordGuildAuthority {
  private readonly cache = new Map<string, GuildFacts>();
  private readonly members = new Map<string, { readonly member: LiveMember; readonly loadedAt: number }>();
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

  public async liveMember(guildId: string, userId: string): Promise<LiveMember | undefined> {
    const key = `${guildId}:${userId}`;
    const cached = this.members.get(key);
    if (cached && this.now() - cached.loadedAt < LIVE_MEMBER_TTL_MS) return cached.member;
    let member: LiveMember;
    try {
      const found = (await this.rest.get(`/guilds/${guildId}/members/${userId}`)) as ApiMember;
      member = { present: true, roleIds: [...found.roles] };
    } catch (error) {
      if (!isUnknownMember(error)) {
        this.onError?.(error, guildId);
        return undefined;
      }
      member = { present: false, roleIds: [] };
    }
    if (this.members.size >= LIVE_MEMBER_MAX_ENTRIES) this.members.delete(this.members.keys().next().value as string);
    this.members.set(key, { member, loadedAt: this.now() });
    return member;
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

/** Discord answers 404 with code 10007 (Unknown Member) when the user is not in the server. */
function isUnknownMember(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const code = Reflect.get(error, "code");
  const status = Reflect.get(error, "status");
  return code === 10007 || (status === 404 && code !== 10004);
}
