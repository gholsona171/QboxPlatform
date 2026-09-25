import { Events, type Channel, type Client, type Message, type ThreadChannel } from "discord.js";
import { logger } from "@qbox/logger";
import type { TicketService } from "@qbox/tickets";

const CACHE_TTL_MS = 60_000;
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Records ticket channel messages for transcripts and activity, closes tickets
 * whose channel is deleted, and runs the auto-close sweep every 10 minutes.
 *
 * Message text is only visible when the bot has the privileged Message Content
 * intent (`DISCORD_MESSAGE_CONTENT_INTENT=true`); without it, activity is still
 * tracked and text is recorded as unavailable.
 */
export class DiscordTicketEventHandler {
  private readonly ticketChannels = new Map<string, { readonly ticket: boolean; readonly expiresAt: number }>();
  private sweepTimer: ReturnType<typeof setInterval> | undefined;
  private client: Client | undefined;
  private readonly onMessage = (message: Message): void => void this.safe("ticket-message", () => this.recordMessage(message));
  private readonly onChannelDelete = (channel: Channel): void => void this.safe("ticket-channel-delete", () => this.channelDeleted(channel.id));
  private readonly onThreadDelete = (thread: ThreadChannel): void => void this.safe("ticket-thread-delete", () => this.channelDeleted(thread.id));

  public constructor(private readonly tickets: TicketService) {}

  public attach(client: Client): void {
    this.client = client;
    client.on(Events.MessageCreate, this.onMessage);
    client.on(Events.ChannelDelete, this.onChannelDelete);
    client.on(Events.ThreadDelete, this.onThreadDelete);
    this.sweepTimer = setInterval(() => void this.safe("ticket-auto-close", () => this.sweep()), SWEEP_INTERVAL_MS);
    this.sweepTimer.unref?.();
  }

  public detach(): void {
    this.client?.off(Events.MessageCreate, this.onMessage);
    this.client?.off(Events.ChannelDelete, this.onChannelDelete);
    this.client?.off(Events.ThreadDelete, this.onThreadDelete);
    if (this.sweepTimer) clearInterval(this.sweepTimer);
    this.client = undefined;
  }

  private async recordMessage(message: Message): Promise<void> {
    if (!message.guild || message.author.bot || message.system) return;
    if (!(await this.isTicketChannel(message.channelId))) return;
    const attachments = [...message.attachments.values()].map((attachment) => attachment.url);
    await this.tickets.recordMessage({
      channelId: message.channelId,
      discordMessageId: message.id,
      authorId: message.author.id,
      authorName: message.member?.displayName ?? message.author.globalName ?? message.author.username,
      authorRoleIds: [...(message.member?.roles.cache.keys() ?? [])],
      content: message.content || (attachments.length > 0 ? "" : "[message text unavailable]"),
      attachments,
    });
  }

  private async channelDeleted(channelId: string): Promise<void> {
    this.ticketChannels.delete(channelId);
    await this.tickets.handleChannelDeleted(channelId);
  }

  private async sweep(): Promise<void> {
    const result = await this.tickets.sweepAutoClose();
    if (result.closed > 0 || result.warned > 0) logger.info({ ...result }, "Ticket auto-close sweep completed.");
  }

  private async isTicketChannel(channelId: string): Promise<boolean> {
    const cached = this.ticketChannels.get(channelId);
    if (cached && cached.expiresAt > Date.now()) return cached.ticket;
    const ticket = await this.tickets.ticketForChannel(channelId);
    const isTicket = ticket !== undefined && ticket.status !== "CLOSED";
    this.ticketChannels.set(channelId, { ticket: isTicket, expiresAt: Date.now() + CACHE_TTL_MS });
    if (this.ticketChannels.size > 5000) this.ticketChannels.clear();
    return isTicket;
  }

  private async safe(operation: string, action: () => Promise<void>): Promise<void> {
    try {
      await action();
    } catch (error) {
      logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, operation }, "Discord ticket event failed.");
    }
  }
}
