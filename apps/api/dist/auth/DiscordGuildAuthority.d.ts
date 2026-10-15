import { type DiscordRestClient } from "@qbox/shared/discord-rest";
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
/** Role changes in Discord reach the portal within this time. */
export declare const LIVE_MEMBER_TTL_MS = 30000;
/** Whether a Discord permission bit string includes Administrator or Manage Server. */
export declare function hasDiscordManagerPermissions(permissions: string): boolean;
/** Reads owner and role permissions through the bot's REST client, cached per server. */
export declare class DiscordRestGuildAuthority implements DiscordGuildAuthority {
    private readonly rest;
    private readonly cache;
    private readonly members;
    private readonly ttlMs;
    private readonly now;
    private readonly onError;
    constructor(rest: DiscordRestClient, options?: {
        readonly ttlMs?: number;
        readonly now?: () => number;
        readonly onError?: (error: unknown, guildId: string) => void;
    });
    isManager(guildId: string, userId: string, roleIds: readonly string[]): Promise<boolean>;
    liveMember(guildId: string, userId: string): Promise<LiveMember | undefined>;
    private facts;
}
//# sourceMappingURL=DiscordGuildAuthority.d.ts.map