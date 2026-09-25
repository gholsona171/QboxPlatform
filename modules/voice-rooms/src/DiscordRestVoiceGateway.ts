import { DISCORD_PERMISSION, type DiscordRestClient } from "@qbox/shared/discord-rest";

import type { VoiceAccess, VoiceChannelSpec, VoiceGateway, VoiceRoom } from "./types.js";
import { VOICE_CUSTOM_ID } from "./types.js";

interface ApiOverwrite { readonly id: string; readonly type: number; readonly allow: string; readonly deny: string }
interface ApiChannel { readonly id: string; readonly parent_id?: string | null; readonly permission_overwrites?: readonly ApiOverwrite[] }

const PRIORITY_SPEAKER = 1n << 8n;
const STREAM = 1n << 9n;
const VIEW = DISCORD_PERMISSION.viewChannel;
const CONNECT = DISCORD_PERMISSION.connect;
const OWNER_BITS = VIEW | CONNECT | DISCORD_PERMISSION.speak | STREAM | PRIORITY_SPEAKER;
const BOT_BITS = VIEW | CONNECT | DISCORD_PERMISSION.manageChannels | DISCORD_PERMISSION.moveMembers;
const ROLE = 0;
const MEMBER = 1;
const VOICE_CHANNEL = 2;
const DEFAULT_BITRATE = 64_000;

/** Control panel buttons: [action, label, style]. Style 2 is grey, 4 is red, 3 is green. */
const PANEL: readonly (readonly (readonly [string, string, number])[])[] = [
  [["rename", "Rename", 2], ["limit", "Limit", 2], ["lock", "Lock", 2], ["unlock", "Unlock", 2], ["hide", "Hide", 2]],
  [["unhide", "Unhide", 2], ["permit", "Permit", 3], ["reject", "Reject", 4], ["kick", "Kick", 4], ["transfer", "Transfer", 2]],
  [["claim", "Claim", 1]],
];

/** Voice room channels and member moves through the Discord REST API (v10). */
export class DiscordRestVoiceGateway implements VoiceGateway {
  private botUserId: string | undefined;

  public constructor(private readonly rest: DiscordRestClient) {}

  public async channelParentId(channelId: string): Promise<string | undefined> {
    return (await this.channel(channelId)).parent_id ?? undefined;
  }

  public async createRoomChannel(guildId: string, spec: VoiceChannelSpec, reason: string): Promise<{ readonly channelId: string }> {
    const inherited = spec.parentId ? ((await this.channel(spec.parentId).catch(() => undefined))?.permission_overwrites ?? []) : [];
    const overwrites = new Map<string, { id: string; type: number; allow: string; deny: string }>(inherited.map((item) => [item.id, { ...item }]));
    if (spec.private) {
      const current = overwrites.get(guildId);
      overwrites.set(guildId, { id: guildId, type: ROLE, allow: String(BigInt(current?.allow ?? "0") & ~(VIEW | CONNECT)), deny: String(BigInt(current?.deny ?? "0") | VIEW | CONNECT) });
    }
    overwrites.set(spec.ownerId, { id: spec.ownerId, type: MEMBER, allow: String(OWNER_BITS), deny: "0" });
    const botId = await this.selfId();
    overwrites.set(botId, { id: botId, type: MEMBER, allow: String(BOT_BITS), deny: "0" });
    const body = {
      name: spec.name,
      type: VOICE_CHANNEL,
      ...(spec.parentId ? { parent_id: spec.parentId } : {}),
      user_limit: spec.userLimit,
      permission_overwrites: [...overwrites.values()],
    };
    try {
      const created = (await this.rest.post(`/guilds/${guildId}/channels`, { body: { ...body, bitrate: spec.bitrateKbps * 1000 }, reason })) as ApiChannel;
      return { channelId: created.id };
    } catch {
      // Bitrates above 96 kbps need server boosts; retry with a safe bitrate.
      const created = (await this.rest.post(`/guilds/${guildId}/channels`, { body: { ...body, bitrate: DEFAULT_BITRATE }, reason })) as ApiChannel;
      return { channelId: created.id };
    }
  }

  public async deleteChannel(channelId: string, reason: string): Promise<void> {
    await this.rest.delete(`/channels/${channelId}`, { reason });
  }

  public async renameChannel(channelId: string, name: string, reason: string): Promise<void> {
    await this.rest.patch(`/channels/${channelId}`, { body: { name }, reason });
  }

  public async setUserLimit(channelId: string, limit: number, reason: string): Promise<void> {
    await this.rest.patch(`/channels/${channelId}`, { body: { user_limit: limit }, reason });
  }

  public async setLocked(guildId: string, channelId: string, locked: boolean, reason: string): Promise<void> {
    await this.toggleEveryone(guildId, channelId, CONNECT, locked, reason);
  }

  public async setHidden(guildId: string, channelId: string, hidden: boolean, reason: string): Promise<void> {
    await this.toggleEveryone(guildId, channelId, VIEW, hidden, reason);
  }

  public async setMemberAccess(channelId: string, userId: string, access: VoiceAccess, reason: string): Promise<void> {
    if (access === "CLEAR") {
      await this.rest.delete(`/channels/${channelId}/permissions/${userId}`, { reason });
      return;
    }
    const bits = String(VIEW | CONNECT);
    await this.rest.put(`/channels/${channelId}/permissions/${userId}`, {
      body: { type: MEMBER, allow: access === "PERMIT" ? bits : "0", deny: access === "REJECT" ? bits : "0" },
      reason,
    });
  }

  public async setOwner(channelId: string, userId: string, reason: string): Promise<void> {
    await this.rest.put(`/channels/${channelId}/permissions/${userId}`, { body: { type: MEMBER, allow: String(OWNER_BITS), deny: "0" }, reason });
  }

  public async moveMember(guildId: string, userId: string, channelId: string | undefined): Promise<void> {
    await this.rest.patch(`/guilds/${guildId}/members/${userId}`, { body: { channel_id: channelId ?? null } });
  }

  public async memberVoiceChannel(guildId: string, userId: string): Promise<string | undefined> {
    try {
      const state = (await this.rest.get(`/guilds/${guildId}/voice-states/${userId}`)) as { readonly channel_id?: string | null };
      return state.channel_id ?? undefined;
    } catch {
      return undefined;
    }
  }

  public async sendPanel(channelId: string, room: VoiceRoom): Promise<{ readonly messageId: string }> {
    const message = (await this.rest.post(`/channels/${channelId}/messages`, {
      body: {
        embeds: [{
          title: "Voice room controls",
          description: `<@${room.ownerId}> owns this room. The owner can use these buttons or \`/voice\`. If the owner leaves, anyone in the room can claim it.`,
          color: 0x5865f2,
        }],
        components: PANEL.map((buttons) => ({
          type: 1,
          components: buttons.map(([action, label, style]) => ({ type: 2, style, label, custom_id: `${VOICE_CUSTOM_ID.button}${action}:${room.id}` })),
        })),
        allowed_mentions: { parse: [] },
      },
    })) as { readonly id: string };
    return { messageId: message.id };
  }

  private async toggleEveryone(guildId: string, channelId: string, bit: bigint, deny: boolean, reason: string): Promise<void> {
    const current = (await this.channel(channelId)).permission_overwrites?.find((overwrite) => overwrite.id === guildId);
    const allow = BigInt(current?.allow ?? "0") & ~bit;
    const denied = deny ? BigInt(current?.deny ?? "0") | bit : BigInt(current?.deny ?? "0") & ~bit;
    await this.rest.put(`/channels/${channelId}/permissions/${guildId}`, { body: { type: ROLE, allow: String(allow), deny: String(denied) }, reason });
  }

  private async channel(channelId: string): Promise<ApiChannel> {
    return (await this.rest.get(`/channels/${channelId}`)) as ApiChannel;
  }

  private async selfId(): Promise<string> {
    if (!this.botUserId) this.botUserId = ((await this.rest.get("/users/@me")) as { readonly id: string }).id;
    return this.botUserId;
  }
}
