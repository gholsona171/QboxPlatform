import { ActivityType, Events, type Channel, type Client, type DMChannel, type NonThreadGuildBasedChannel, type VoiceState } from "discord.js";
import { logger } from "@qbox/logger";
import { DiscordRestVoiceGateway, VOICE_CUSTOM_ID, VoiceRoomService, type VoiceRepository, type VoiceRoom } from "@qbox/voice-rooms";

import { VoiceCommand } from "../commands/Voice.command.js";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
import { DiscordVoiceInteractionHandler } from "./DiscordVoiceInteractionHandler.js";
import { VoiceElevation } from "./voiceActor.js";

/** Voice rooms: join-to-create hubs, `/voice`, the control panel, and empty-room cleanup. */
export function voiceRoomsFeature(repository: VoiceRepository): DiscordFeatureFactory {
  return ({ client, authorizer }) => {
    const voice = new VoiceRoomService(repository, new DiscordRestVoiceGateway(client.rest));
    const elevation = new VoiceElevation(authorizer);
    const interactions = new DiscordVoiceInteractionHandler(voice, elevation);
    const events = new VoiceRoomEvents(voice);
    return {
      name: "voice-rooms",
      commands: () => [new VoiceCommand(voice, elevation)],
      interactionPrefixes: [VOICE_CUSTOM_ID.prefix],
      handleInteraction: (interaction) => interactions.handle(interaction),
      attach: (target) => events.attach(target),
      detach: () => events.detach(),
    };
  };
}

class VoiceRoomEvents {
  private client: Client | undefined;
  private readonly pending = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly onVoice = (before: VoiceState, after: VoiceState): void => void this.safe("voice-state", () => this.voiceState(before, after));
  private readonly onChannelDelete = (channel: DMChannel | NonThreadGuildBasedChannel): void => void this.safe("channel-delete", async () => {
    this.cancel(channel.id);
    await this.voice.channelDeleted(channel.id);
  });
  private readonly onReady = (): void => void this.safe("startup-cleanup", async () => {
    const removed = await this.voice.cleanup((room) => this.occupancy(room));
    if (removed > 0) logger.info({ removed }, "Stale voice rooms removed.");
  });

  public constructor(private readonly voice: VoiceRoomService) {}

  public attach(client: Client): void {
    this.client = client;
    client.on(Events.VoiceStateUpdate, this.onVoice);
    client.on(Events.ChannelDelete, this.onChannelDelete);
    client.once(Events.ClientReady, this.onReady);
  }

  public detach(): void {
    this.client?.off(Events.VoiceStateUpdate, this.onVoice);
    this.client?.off(Events.ChannelDelete, this.onChannelDelete);
    this.client?.off(Events.ClientReady, this.onReady);
    for (const timer of this.pending.values()) clearTimeout(timer);
    this.pending.clear();
    this.client = undefined;
  }

  private async voiceState(before: VoiceState, after: VoiceState): Promise<void> {
    if (before.channelId === after.channelId) return;
    if (after.channelId) {
      this.cancel(after.channelId);
      const member = after.member;
      if (member && !member.user.bot)
        await this.voice.handleJoin({
          guildId: after.guild.id,
          channelId: after.channelId,
          userId: member.id,
          displayName: member.displayName,
          roleIds: [...member.roles.cache.keys()],
          activity: member.presence?.activities.find((activity) => activity.type === ActivityType.Playing)?.name,
        });
    }
    if (before.channelId && this.people(before.channel) === 0) await this.scheduleDelete(before.channelId);
  }

  /** Deletes an empty room after its hub's delay, unless someone joins first. */
  private async scheduleDelete(channelId: string): Promise<void> {
    const empty = await this.voice.roomEmptied(channelId);
    if (!empty) return;
    this.cancel(channelId);
    const timer = setTimeout(() => {
      this.pending.delete(channelId);
      void this.safe("delete-empty-room", async () => {
        if (this.people(this.client?.channels.cache.get(channelId)) !== 0) return;
        await this.voice.deleteRoom(empty.room.guildId, empty.room.id, "Voice room was empty");
      });
    }, empty.delaySeconds * 1000);
    timer.unref?.();
    this.pending.set(channelId, timer);
  }

  private cancel(channelId: string): void {
    const timer = this.pending.get(channelId);
    if (timer) clearTimeout(timer);
    this.pending.delete(channelId);
  }

  /** People (not bots) in a voice channel, or undefined when it is not a known voice channel. */
  private people(channel: Channel | null | undefined): number | undefined {
    if (!channel?.isVoiceBased()) return undefined;
    return channel.members.filter((member) => !member.user.bot).size;
  }

  private occupancy(room: VoiceRoom): number | undefined {
    const guild = this.client?.guilds.cache.get(room.guildId);
    return this.people(guild?.channels.cache.get(room.channelId));
  }

  private async safe(operation: string, action: () => Promise<void>): Promise<void> {
    try {
      await action();
    } catch (error) {
      logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, operation }, "Discord voice room event failed.");
    }
  }
}
