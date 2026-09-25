import { DISCORD_PERMISSION, colorValue, type DiscordRestClient } from "@qbox/shared/discord-rest";

import type { HierarchyCheck, ModerationEmbed, ModerationGateway } from "./types.js";
import { BRAND } from "@qbox/shared/brand";

interface ApiGuild { readonly owner_id: string; readonly roles: readonly ApiRole[] }
interface ApiRole { readonly id: string; readonly position: number }
interface ApiMember { readonly roles: readonly string[]; readonly user: { readonly id: string } }
interface ApiMessage { readonly id: string; readonly timestamp: string; readonly author: { readonly id: string } }
interface ApiOverwrite { readonly id: string; readonly type: number; readonly allow: string; readonly deny: string }
interface ApiChannel { readonly permission_overwrites?: readonly ApiOverwrite[] }

const GUILD_CACHE_MS = 60_000;
const BULK_DELETE_MAX_AGE_MS = 14 * 86_400_000 - 60_000;
const LOCK_BITS = DISCORD_PERMISSION.sendMessages | DISCORD_PERMISSION.sendMessagesInThreads | DISCORD_PERMISSION.createPublicThreads | DISCORD_PERMISSION.createPrivateThreads | DISCORD_PERMISSION.addReactions;

/** Moderation actions through the Discord REST API (v10). */
export class DiscordRestModerationGateway implements ModerationGateway {
  private botUserId: string | undefined;
  private readonly guilds = new Map<string, { readonly guild: ApiGuild; readonly at: number }>();

  public constructor(
    private readonly rest: DiscordRestClient,
    private readonly now: () => number = Date.now,
  ) {}

  public async checkHierarchy(guildId: string, moderatorId: string | undefined, targetId: string): Promise<HierarchyCheck> {
    const guild = await this.guild(guildId);
    const target = await this.member(guildId, targetId);
    const targetRoleIds = target?.roles ?? [];
    if (!target) return { allowed: true, targetRoleIds, targetIsMember: false };
    if (targetId === guild.owner_id) return { allowed: false, reason: "The server owner cannot be moderated.", targetRoleIds, targetIsMember: true };
    const botId = await this.selfId();
    if (targetId === botId) return { allowed: false, reason: "I can't moderate myself.", targetRoleIds, targetIsMember: true };
    const bot = await this.member(guildId, botId);
    const targetTop = topPosition(guild, targetRoleIds);
    if (topPosition(guild, bot?.roles ?? []) <= targetTop)
      return { allowed: false, reason: `My highest role must be above theirs. Move the ${BRAND.name} role (the bot's role) higher in Server Settings > Roles.`, targetRoleIds, targetIsMember: true };
    if (moderatorId && moderatorId !== guild.owner_id) {
      const moderator = await this.member(guildId, moderatorId);
      if (topPosition(guild, moderator?.roles ?? []) <= targetTop)
        return { allowed: false, reason: "Your highest role must be above theirs.", targetRoleIds, targetIsMember: true };
    }
    return { allowed: true, targetRoleIds, targetIsMember: true };
  }

  public async timeout(guildId: string, userId: string, until: Date | undefined, reason: string): Promise<void> {
    await this.rest.patch(`/guilds/${guildId}/members/${userId}`, { body: { communication_disabled_until: until ? until.toISOString() : null }, reason });
  }

  public async kick(guildId: string, userId: string, reason: string): Promise<void> {
    await this.rest.delete(`/guilds/${guildId}/members/${userId}`, { reason });
  }

  public async ban(guildId: string, userId: string, deleteMessageSeconds: number, reason: string): Promise<void> {
    await this.rest.put(`/guilds/${guildId}/bans/${userId}`, { body: { delete_message_seconds: deleteMessageSeconds }, reason });
  }

  public async unban(guildId: string, userId: string, reason: string): Promise<void> {
    await this.rest.delete(`/guilds/${guildId}/bans/${userId}`, { reason });
  }

  public async directMessage(userId: string, embed: ModerationEmbed): Promise<boolean> {
    try {
      const channel = (await this.rest.post("/users/@me/channels", { body: { recipient_id: userId } })) as { readonly id: string };
      await this.rest.post(`/channels/${channel.id}/messages`, { body: { embeds: [toEmbed(embed)], allowed_mentions: { parse: [] } } });
      return true;
    } catch {
      return false;
    }
  }

  public async postEmbed(channelId: string, embed: ModerationEmbed): Promise<{ readonly messageId: string }> {
    const message = (await this.rest.post(`/channels/${channelId}/messages`, { body: { embeds: [toEmbed(embed)], allowed_mentions: { parse: [] } } })) as { readonly id: string };
    return { messageId: message.id };
  }

  public async purge(channelId: string, count: number, userId?: string): Promise<number> {
    const messages = (await this.rest.get(`/channels/${channelId}/messages?limit=100`)) as readonly ApiMessage[];
    const cutoff = this.now() - BULK_DELETE_MAX_AGE_MS;
    const ids = messages
      .filter((message) => !userId || message.author.id === userId)
      .filter((message) => Date.parse(message.timestamp) > cutoff)
      .slice(0, count)
      .map((message) => message.id);
    if (ids.length === 0) return 0;
    if (ids.length === 1) await this.rest.delete(`/channels/${channelId}/messages/${ids[0]}`);
    else await this.rest.post(`/channels/${channelId}/messages/bulk-delete`, { body: { messages: ids } });
    return ids.length;
  }

  public async setLocked(guildId: string, channelId: string, locked: boolean, reason: string): Promise<void> {
    const channel = (await this.rest.get(`/channels/${channelId}`)) as ApiChannel;
    const current = channel.permission_overwrites?.find((overwrite) => overwrite.id === guildId);
    const allow = BigInt(current?.allow ?? "0") & ~(locked ? LOCK_BITS : 0n);
    const deny = locked ? BigInt(current?.deny ?? "0") | LOCK_BITS : BigInt(current?.deny ?? "0") & ~LOCK_BITS;
    await this.rest.put(`/channels/${channelId}/permissions/${guildId}`, { body: { type: 0, allow: String(allow), deny: String(deny) }, reason });
  }

  public async setSlowmode(channelId: string, seconds: number, reason: string): Promise<void> {
    await this.rest.patch(`/channels/${channelId}`, { body: { rate_limit_per_user: seconds }, reason });
  }

  public async deleteMessage(channelId: string, messageId: string, reason: string): Promise<void> {
    await this.rest.delete(`/channels/${channelId}/messages/${messageId}`, { reason });
  }

  private async guild(guildId: string): Promise<ApiGuild> {
    const cached = this.guilds.get(guildId);
    if (cached && this.now() - cached.at < GUILD_CACHE_MS) return cached.guild;
    const guild = (await this.rest.get(`/guilds/${guildId}`)) as ApiGuild;
    this.guilds.set(guildId, { guild, at: this.now() });
    return guild;
  }

  private async member(guildId: string, userId: string): Promise<ApiMember | undefined> {
    try {
      return (await this.rest.get(`/guilds/${guildId}/members/${userId}`)) as ApiMember;
    } catch {
      return undefined;
    }
  }

  private async selfId(): Promise<string> {
    if (!this.botUserId) this.botUserId = ((await this.rest.get("/users/@me")) as { readonly id: string }).id;
    return this.botUserId;
  }
}

function topPosition(guild: ApiGuild, roleIds: readonly string[]): number {
  return guild.roles.filter((role) => roleIds.includes(role.id)).reduce((top, role) => Math.max(top, role.position), 0);
}

function toEmbed(embed: ModerationEmbed) {
  return {
    title: embed.title,
    description: embed.description,
    color: colorValue(embed.color),
    ...(embed.fields?.length ? { fields: embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })) } : {}),
    ...(embed.footer ? { footer: { text: embed.footer } } : {}),
    timestamp: new Date().toISOString(),
  };
}
