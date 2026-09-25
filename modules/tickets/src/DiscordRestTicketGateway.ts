import type {
  TicketAccessInput,
  TicketButtonStyle,
  TicketCloseSpaceInput,
  TicketDirectMessage,
  TicketDirectoryChannel,
  TicketDirectoryMember,
  TicketDirectoryRole,
  TicketDiscordGateway,
  TicketNotice,
  TicketOpeningMessage,
  TicketPanelPublishInput,
  TicketReopenSpaceInput,
  TicketSpaceInput,
  TicketTranscriptPost,
} from "./types.js";

/** File attached to a Discord REST request. */
export interface DiscordRestFile {
  readonly name: string;
  readonly data: Buffer;
  readonly contentType?: string;
}

export interface DiscordRestRequest {
  readonly body?: unknown;
  readonly files?: DiscordRestFile[];
  readonly reason?: string;
}

/**
 * Minimal Discord REST surface. discord.js `REST` (and `client.rest`) satisfy
 * it, so the bot and the API share one gateway implementation.
 */
export interface DiscordRestClient {
  get(route: `/${string}`, options?: DiscordRestRequest): Promise<unknown>;
  post(route: `/${string}`, options?: DiscordRestRequest): Promise<unknown>;
  patch(route: `/${string}`, options?: DiscordRestRequest): Promise<unknown>;
  put(route: `/${string}`, options?: DiscordRestRequest): Promise<unknown>;
  delete(route: `/${string}`, options?: DiscordRestRequest): Promise<unknown>;
}

/** Custom ID prefixes routed by the Discord interaction handler. */
export const TICKET_CUSTOM_ID = {
  open: "qbox:ticket:open:",
  select: "qbox:ticket:select",
  form: "qbox:ticket:form:",
  close: "qbox:ticket:close:",
  closeConfirm: "qbox:ticket:close-confirm:",
  closeReason: "qbox:ticket:close-reason:",
  claim: "qbox:ticket:claim:",
  reopen: "qbox:ticket:reopen:",
  transcript: "qbox:ticket:transcript:",
  delete: "qbox:ticket:delete:",
  rate: "qbox:ticket:rate:",
} as const;

const PERMISSION = {
  addReactions: 1n << 6n,
  manageChannels: 1n << 4n,
  viewChannel: 1n << 10n,
  sendMessages: 1n << 11n,
  manageMessages: 1n << 13n,
  embedLinks: 1n << 14n,
  attachFiles: 1n << 15n,
  readMessageHistory: 1n << 16n,
} as const;

const FULL_ACCESS =
  PERMISSION.viewChannel | PERMISSION.sendMessages | PERMISSION.readMessageHistory | PERMISSION.attachFiles | PERMISSION.embedLinks | PERMISSION.addReactions;
const READ_ONLY_ALLOW = PERMISSION.viewChannel | PERMISSION.readMessageHistory;
const READ_ONLY_DENY = PERMISSION.sendMessages | PERMISSION.addReactions | PERMISSION.attachFiles;

const CHANNEL_TYPE_TEXT = 0;
const CHANNEL_TYPE_PRIVATE_THREAD = 12;
const OVERWRITE_ROLE = 0;
const OVERWRITE_MEMBER = 1;
const BUTTON_STYLE: Readonly<Record<TicketButtonStyle, number>> = { PRIMARY: 1, SECONDARY: 2, SUCCESS: 3, DANGER: 4 };

interface IdResponse {
  readonly id: string;
}

/** Discord adapter for tickets built on the Discord REST API (v10). */
export class DiscordRestTicketGateway implements TicketDiscordGateway {
  private botUserId: string | undefined;

  public constructor(
    private readonly rest: DiscordRestClient,
    private readonly schedule: (callback: () => void, delayMs: number) => void = defaultSchedule,
  ) {}

  public async createTicketSpace(input: TicketSpaceInput): Promise<{ readonly channelId: string }> {
    if (input.mode === "THREAD") {
      if (!input.parentChannelId) throw new Error("Thread mode requires a parent channel.");
      const thread = (await this.rest.post(`/channels/${input.parentChannelId}/threads`, {
        body: { name: input.name, type: CHANNEL_TYPE_PRIVATE_THREAD, invitable: false, auto_archive_duration: 10080 },
        reason: input.topic,
      })) as IdResponse;
      for (const userId of [input.openerId, ...input.memberIds])
        await this.rest.put(`/channels/${thread.id}/thread-members/${userId}`);
      return { channelId: thread.id };
    }
    const botUserId = await this.selfId();
    const channel = (await this.rest.post(`/guilds/${input.guildId}/channels`, {
      body: {
        name: input.name,
        type: CHANNEL_TYPE_TEXT,
        topic: input.topic,
        ...(input.parentChannelId ? { parent_id: input.parentChannelId } : {}),
        permission_overwrites: [
          { id: input.guildId, type: OVERWRITE_ROLE, allow: "0", deny: String(PERMISSION.viewChannel) },
          { id: input.openerId, type: OVERWRITE_MEMBER, allow: String(FULL_ACCESS), deny: "0" },
          ...input.memberIds.map((userId) => ({ id: userId, type: OVERWRITE_MEMBER, allow: String(FULL_ACCESS), deny: "0" })),
          ...input.supportRoleIds.map((roleId) => ({ id: roleId, type: OVERWRITE_ROLE, allow: String(FULL_ACCESS | PERMISSION.manageMessages), deny: "0" })),
          { id: botUserId, type: OVERWRITE_MEMBER, allow: String(FULL_ACCESS | PERMISSION.manageChannels | PERMISSION.manageMessages), deny: "0" },
        ],
      },
      reason: input.topic,
    })) as IdResponse;
    return { channelId: channel.id };
  }

  public async postOpening(input: TicketOpeningMessage): Promise<void> {
    const buttons = [
      button(`${TICKET_CUSTOM_ID.close}${input.ticket.id}`, "Close", "DANGER", "🔒"),
      ...(input.claimButton ? [button(`${TICKET_CUSTOM_ID.claim}${input.ticket.id}`, "Claim", "SUCCESS", "🙋")] : []),
    ];
    await this.rest.post(`/channels/${input.channelId}/messages`, {
      body: {
        content: [...input.mentionUserIds.map((id) => `<@${id}>`), ...input.mentionRoleIds.map((id) => `<@&${id}>`)].join(" ") || undefined,
        embeds: [{
          title: input.title,
          description: input.body,
          color: colorValue(input.color),
          footer: { text: `Priority: ${input.ticket.priority.toLowerCase()} | Ticket ID ${input.ticket.id}` },
          timestamp: input.ticket.createdAt.toISOString(),
        }],
        components: [{ type: 1, components: buttons }],
        allowed_mentions: { parse: [], users: [...input.mentionUserIds], roles: [...input.mentionRoleIds] },
      },
    });
  }

  public async postNotice(input: TicketNotice): Promise<{ readonly messageId: string }> {
    const controls = input.closedControlsTicketId
      ? [{
          type: 1,
          components: [
            button(`${TICKET_CUSTOM_ID.reopen}${input.closedControlsTicketId}`, "Reopen", "SECONDARY", "🔓"),
            button(`${TICKET_CUSTOM_ID.transcript}${input.closedControlsTicketId}`, "Transcript", "SECONDARY", "📄"),
            button(`${TICKET_CUSTOM_ID.delete}${input.closedControlsTicketId}`, "Delete", "DANGER", "🗑️"),
          ],
        }]
      : [];
    const body = input.title
      ? { embeds: [{ title: input.title, description: input.content, color: colorValue(input.color ?? "#5865F2") }], components: controls, allowed_mentions: { parse: [] } }
      : { content: input.content, components: controls, allowed_mentions: { parse: ["users"] } };
    const message = (await this.rest.post(`/channels/${input.channelId}/messages`, { body })) as IdResponse;
    return { messageId: message.id };
  }

  public async setAccess(input: TicketAccessInput): Promise<void> {
    if (input.mode === "THREAD") {
      if (input.targetType === "ROLE") return;
      const route = `/channels/${input.channelId}/thread-members/${input.targetId}` as const;
      if (input.access === "FULL") await this.rest.put(route);
      else await this.rest.delete(route);
      return;
    }
    const route = `/channels/${input.channelId}/permissions/${input.targetId}` as const;
    if (input.access === "NONE") {
      await this.rest.delete(route);
      return;
    }
    const type = input.targetType === "ROLE" ? OVERWRITE_ROLE : OVERWRITE_MEMBER;
    const body = input.access === "FULL"
      ? { type, allow: String(FULL_ACCESS), deny: "0" }
      : { type, allow: String(READ_ONLY_ALLOW), deny: String(READ_ONLY_DENY) };
    await this.rest.put(route, { body });
  }

  public async closeSpace(input: TicketCloseSpaceInput): Promise<void> {
    if (input.action === "DELETE") {
      await this.deleteSpace(input.channelId, input.deleteDelaySeconds);
      return;
    }
    if (input.mode === "THREAD") {
      await this.rest.patch(`/channels/${input.channelId}`, { body: { archived: true, locked: true } });
      return;
    }
    if (input.closedParentChannelId)
      await this.rest.patch(`/channels/${input.channelId}`, { body: { parent_id: input.closedParentChannelId } });
  }

  public async reopenSpace(input: TicketReopenSpaceInput): Promise<void> {
    if (input.mode === "THREAD") {
      await this.rest.patch(`/channels/${input.channelId}`, { body: { archived: false, locked: false } });
      return;
    }
    if (input.openParentChannelId)
      await this.rest.patch(`/channels/${input.channelId}`, { body: { parent_id: input.openParentChannelId } });
  }

  public async deleteSpace(channelId: string, delaySeconds: number): Promise<void> {
    const remove = () => this.rest.delete(`/channels/${channelId}`, { reason: "Qbox ticket closed." });
    if (delaySeconds <= 0) {
      await remove();
      return;
    }
    this.schedule(() => void remove().catch(() => undefined), delaySeconds * 1000);
  }

  public async renameSpace(channelId: string, name: string): Promise<void> {
    await this.rest.patch(`/channels/${channelId}`, { body: { name } });
  }

  public async publishPanel(input: TicketPanelPublishInput): Promise<{ readonly messageId: string }> {
    const { panel, categories } = input;
    const components = panel.style === "SELECT_MENU"
      ? [{
          type: 1,
          components: [{
            type: 3,
            custom_id: TICKET_CUSTOM_ID.select,
            placeholder: panel.placeholder,
            min_values: 1,
            max_values: 1,
            options: categories.map((category) => ({
              label: category.name,
              value: category.id,
              ...(category.description ? { description: category.description } : {}),
              ...(category.emoji ? { emoji: emoji(category.emoji) } : {}),
            })),
          }],
        }]
      : chunk(categories, 5).map((row) => ({
          type: 1,
          components: row.map((category) => button(`${TICKET_CUSTOM_ID.open}${category.id}`, category.name, category.buttonStyle, category.emoji)),
        }));
    const body = {
      embeds: [{
        title: panel.title,
        description: panel.description,
        color: colorValue(panel.color),
        ...(panel.imageUrl ? { image: { url: panel.imageUrl } } : {}),
        ...(panel.footer ? { footer: { text: panel.footer } } : {}),
      }],
      components,
      allowed_mentions: { parse: [] },
    };
    if (panel.messageId) {
      try {
        await this.rest.patch(`/channels/${panel.channelId}/messages/${panel.messageId}`, { body });
        return { messageId: panel.messageId };
      } catch {
        // The old panel message was deleted or moved; post a fresh one.
      }
    }
    const message = (await this.rest.post(`/channels/${panel.channelId}/messages`, { body })) as IdResponse;
    return { messageId: message.id };
  }

  public async deletePanelMessage(channelId: string, messageId: string): Promise<void> {
    await this.rest.delete(`/channels/${channelId}/messages/${messageId}`);
  }

  public async postTranscript(input: TicketTranscriptPost): Promise<{ readonly messageId: string }> {
    const message = (await this.rest.post(`/channels/${input.channelId}/messages`, {
      body: {
        embeds: [{ title: `Ticket #${input.ticket.number} transcript`, description: input.summary, color: colorValue("#5865F2") }],
        allowed_mentions: { parse: [] },
      },
      files: [transcriptFile(input.file.fileName, input.file.content)],
    })) as IdResponse;
    return { messageId: message.id };
  }

  public async directMessage(input: TicketDirectMessage): Promise<boolean> {
    try {
      const channel = (await this.rest.post("/users/@me/channels", { body: { recipient_id: input.userId } })) as IdResponse;
      await this.rest.post(`/channels/${channel.id}/messages`, {
        body: {
          content: input.content,
          ...(input.feedbackTicketId
            ? { components: [{ type: 1, components: [1, 2, 3, 4, 5].map((stars) => button(`${TICKET_CUSTOM_ID.rate}${input.feedbackTicketId}:${stars}`, `${stars}`, "SECONDARY", "⭐")) }] }
            : {}),
          allowed_mentions: { parse: [] },
        },
        ...(input.file ? { files: [transcriptFile(input.file.fileName, input.file.content)] } : {}),
      });
      return true;
    } catch {
      return false;
    }
  }

  public async listChannels(guildId: string): Promise<readonly TicketDirectoryChannel[]> {
    const channels = (await this.rest.get(`/guilds/${guildId}/channels`)) as readonly ApiChannel[];
    return channels
      .map((channel) => ({
        id: channel.id,
        name: channel.name ?? channel.id,
        type: CHANNEL_TYPES[channel.type] ?? "OTHER",
        ...(channel.parent_id ? { parentId: channel.parent_id } : {}),
        position: channel.position ?? 0,
      }))
      .sort((left, right) => left.position - right.position);
  }

  public async listRoles(guildId: string): Promise<readonly TicketDirectoryRole[]> {
    const roles = (await this.rest.get(`/guilds/${guildId}/roles`)) as readonly ApiRole[];
    return roles
      .filter((role) => role.id !== guildId && !role.managed)
      .map((role) => ({ id: role.id, name: role.name, color: `#${role.color.toString(16).padStart(6, "0")}`, position: role.position }))
      .sort((left, right) => right.position - left.position);
  }

  public async searchMembers(guildId: string, query: string): Promise<readonly TicketDirectoryMember[]> {
    const members = (await this.rest.get(`/guilds/${guildId}/members/search?query=${encodeURIComponent(query)}&limit=10`)) as readonly ApiMember[];
    return members.map(mapMember);
  }

  public async getMembers(guildId: string, userIds: readonly string[]): Promise<readonly TicketDirectoryMember[]> {
    const members = await Promise.all(
      userIds.map((userId) => (this.rest.get(`/guilds/${guildId}/members/${userId}`) as Promise<ApiMember>).catch(() => undefined)),
    );
    return members.flatMap((member) => (member ? [mapMember(member)] : []));
  }

  private async selfId(): Promise<string> {
    if (!this.botUserId) this.botUserId = ((await this.rest.get("/users/@me")) as IdResponse).id;
    return this.botUserId;
  }
}

interface ApiChannel {
  readonly id: string;
  readonly name?: string;
  readonly type: number;
  readonly parent_id?: string | null;
  readonly position?: number;
}

interface ApiRole {
  readonly id: string;
  readonly name: string;
  readonly color: number;
  readonly position: number;
  readonly managed: boolean;
}

interface ApiMember {
  readonly nick?: string | null;
  readonly avatar?: string | null;
  readonly user: { readonly id: string; readonly username: string; readonly global_name?: string | null; readonly avatar?: string | null };
}

const CHANNEL_TYPES: Readonly<Record<number, TicketDirectoryChannel["type"]>> = { 0: "TEXT", 4: "CATEGORY", 5: "ANNOUNCEMENT", 15: "FORUM" };

function mapMember(member: ApiMember): TicketDirectoryMember {
  const avatar = member.user.avatar;
  return {
    id: member.user.id,
    username: member.user.username,
    displayName: member.nick ?? member.user.global_name ?? member.user.username,
    ...(avatar ? { avatarUrl: `https://cdn.discordapp.com/avatars/${member.user.id}/${avatar}.png?size=64` } : {}),
  };
}

function button(customId: string, label: string, style: TicketButtonStyle, emojiText?: string | undefined) {
  return {
    type: 2,
    style: BUTTON_STYLE[style],
    custom_id: customId,
    label: label.slice(0, 80),
    ...(emojiText ? { emoji: emoji(emojiText) } : {}),
  };
}

/** Parses `<:name:id>`, `<a:name:id>`, or a unicode emoji into a Discord emoji object. */
export function emoji(value: string): { readonly id?: string; readonly name: string; readonly animated?: boolean } {
  const custom = /^<(a?):(\w{2,32}):(\d{17,20})>$/.exec(value.trim());
  if (custom) return { id: custom[3] as string, name: custom[2] as string, animated: custom[1] === "a" };
  return { name: value.trim() };
}

function colorValue(hex: string): number {
  return Number.parseInt(hex.replace("#", ""), 16);
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) rows.push(items.slice(index, index + size));
  return rows;
}

function transcriptFile(name: string, content: string): DiscordRestFile {
  return { name, data: Buffer.from(content, "utf8"), contentType: "text/plain; charset=utf-8" };
}

function defaultSchedule(callback: () => void, delayMs: number): void {
  const timer = setTimeout(callback, delayMs);
  timer.unref?.();
}
