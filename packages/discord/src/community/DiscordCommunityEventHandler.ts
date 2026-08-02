import { Events, type Client, type GuildMember, type Message, type MessageReaction, type PartialGuildMember, type PartialMessage, type PartialMessageReaction, type PartialUser, type User, type VoiceState } from "discord.js";
import { DiscordCommunityService, type SuggestionStatus } from "@qbox/discord-community";
import { logger } from "@qbox/logger";

export class DiscordCommunityEventHandler {
  private counterTimer: ReturnType<typeof setInterval> | undefined;

  public constructor(private readonly service: DiscordCommunityService) {}

  public attach(client: Client): void {
    client.on(Events.GuildMemberAdd, (member) => void this.safe("welcome/autorole", () => this.onMemberAdd(member)));
    client.on(Events.GuildMemberRemove, (member) => void this.safe("goodbye", () => this.onMemberRemove(member)));
    client.on(Events.MessageCreate, (message) => void this.safe("custom-message-trigger", () => this.onMessage(message)));
    client.on(Events.MessageReactionAdd, (reaction, user) => void this.safe("starboard-add", () => this.onReaction(reaction, user)));
    client.on(Events.MessageDelete, (message) => void this.safe("message-delete", () => this.onMessageDelete(message)));
    client.on(Events.VoiceStateUpdate, (oldState, newState) => void this.safe("voice-log", () => this.onVoice(oldState, newState)));
    this.counterTimer = setInterval(() => void this.safe("counter-timer", () => this.refreshCounters()), 5 * 60 * 1000);
    this.counterTimer.unref?.();
  }

  public detach(): void {
    if (this.counterTimer) clearInterval(this.counterTimer);
  }

  private async onMemberAdd(member: GuildMember): Promise<void> {
    const context = {
      user: `<@${member.id}>`,
      username: member.user.username,
      displayName: member.displayName,
      userId: member.id,
      server: member.guild.name,
      memberCount: member.guild.memberCount,
      joinedAt: member.joinedAt ?? new Date(),
    };
    await this.service.deliverWelcomeGoodbye("WELCOME", member.guild.id, context);
    const settings = await this.service.settings(member.guild.id);
    if (settings.autoroles.delaySeconds > 0) await wait(settings.autoroles.delaySeconds * 1000);
    await this.service.applyAutoroles(member.guild.id, member.id, member.user.bot);
    await this.refreshCounters(member.guild.id);
  }

  private async onMemberRemove(member: GuildMember | PartialGuildMember): Promise<void> {
    await this.service.deliverWelcomeGoodbye("GOODBYE", member.guild.id, {
      user: `<@${member.id}>`,
      username: member.user.username,
      displayName: member.displayName,
      userId: member.id,
      server: member.guild.name,
      memberCount: member.guild.memberCount,
      joinedAt: member.joinedAt ?? new Date(),
    });
    await this.refreshCounters(member.guild.id);
  }

  private async onMessage(message: Message): Promise<void> {
    if (!message.guild || message.author.bot) return;
    const settings = await this.service.settings(message.guild.id);
    const command = this.service.matchCustomCommand(settings.customCommands, message.content ?? "", message.channelId, [...message.member?.roles.cache.keys() ?? []]);
    if (!command) return;
    await message.reply({ content: command.responseText, allowedMentions: { parse: [] } });
    if (command.deleteTriggeringMessage) await message.delete().catch(() => undefined);
  }

  private async onReaction(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser): Promise<void> {
    if (user.bot) return;
    const fullReaction = reaction.partial ? await reaction.fetch() : reaction;
    const message = fullReaction.message.partial ? await fullReaction.message.fetch() : fullReaction.message;
    if (!message.guild || !message.author) return;
    const settings = await this.service.settings(message.guild.id);
    const config = settings.starboard;
    if (!config || fullReaction.emoji.toString() !== config.emoji) return;
    const count = fullReaction.count ?? 0;
    if (!this.service.shouldStar(config, {
      channelId: message.channelId,
      authorId: message.author.id,
      reactorId: user.id,
      isBot: message.author.bot,
      nsfw: "nsfw" in message.channel && message.channel.nsfw === true,
      count,
    })) return;
    await this.service.upsertStarboardEntry({
      guildId: message.guild.id,
      sourceChannelId: message.channelId,
      sourceMessageId: message.id,
      authorId: message.author.id,
      starCount: count,
      deleted: false,
    });
  }

  private async onMessageDelete(message: Message | PartialMessage): Promise<void> {
    if (!message.guild) return;
    await this.service.markStarboardEntryDeleted(message.guild.id, message.id).catch(() => undefined);
  }

  private async onVoice(_oldState: VoiceState, _newState: VoiceState): Promise<void> {
    return undefined;
  }

  private async refreshCounters(guildId?: string): Promise<void> {
    if (!guildId) return;
    const settings = await this.service.settings(guildId);
    for (const counter of settings.counters) await this.service.refreshCounter(counter).catch((error) => logger.warn({ err: error, counterId: counter.id }, "Discord counter refresh failed."));
  }

  private async safe(feature: string, operation: () => Promise<void>): Promise<void> {
    try {
      await operation();
    } catch (error) {
      logger.warn({ err: error, feature }, "Discord community feature handler failed.");
    }
  }
}

export function rulesCustomId(guildId: string): string {
  return `qbox:rules:${guildId}`;
}

export function suggestionStatus(value: string): SuggestionStatus {
  return value === "approve" ? "APPROVED" : value === "deny" ? "DENIED" : value === "implemented" ? "IMPLEMENTED" : "UNDER_REVIEW";
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
