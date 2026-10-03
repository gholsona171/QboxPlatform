import { Events } from "discord.js";
import { DiscordRestLevelGateway, LevelService, VoiceTracker } from "@qbox/levels";
import { passthroughTemplates } from "@qbox/shared/messages";
import { logger } from "@qbox/logger";
import { LeaderboardCommand } from "../commands/Leaderboard.command.js";
import { LevelsCommand } from "../commands/Levels.command.js";
import { RankCommand } from "../commands/Rank.command.js";
const VOICE_FLUSH_MS = 60_000;
/** Levels and rewards: `/rank`, `/leaderboard`, `/levels`, message XP, and voice XP. */
export function levelsFeature(repository, templates = passthroughTemplates) {
    return ({ client, authorizer }) => {
        const levels = new LevelService(repository, new DiscordRestLevelGateway(client.rest), undefined, undefined, templates);
        const events = new LevelEvents(levels);
        return {
            name: "levels",
            commands: () => [new RankCommand(levels), new LeaderboardCommand(levels), new LevelsCommand(levels, authorizer)],
            attach: (target) => events.attach(target),
            detach: () => events.detach(),
        };
    };
}
class LevelEvents {
    levels;
    client;
    timer;
    tracker = new VoiceTracker();
    onMessage = (message) => void this.safe("message-xp", () => this.message(message));
    onVoice = (before, after) => {
        if (before.channel)
            this.sync(before.channel);
        if (after.channel && after.channelId !== before.channelId)
            this.sync(after.channel);
    };
    onReady = (client) => {
        for (const guild of client.guilds.cache.values())
            for (const state of guild.voiceStates.cache.values())
                if (state.channel)
                    this.sync(state.channel);
    };
    constructor(levels) {
        this.levels = levels;
    }
    attach(client) {
        this.client = client;
        client.on(Events.MessageCreate, this.onMessage);
        client.on(Events.VoiceStateUpdate, this.onVoice);
        client.once(Events.ClientReady, this.onReady);
        this.timer = setInterval(() => void this.safe("voice-xp", () => this.flush()), VOICE_FLUSH_MS);
        this.timer.unref?.();
    }
    detach() {
        this.client?.off(Events.MessageCreate, this.onMessage);
        this.client?.off(Events.VoiceStateUpdate, this.onVoice);
        this.client?.off(Events.ClientReady, this.onReady);
        if (this.timer)
            clearInterval(this.timer);
        this.client = undefined;
    }
    async message(message) {
        if (!message.inGuild() || message.author.bot || message.system || message.webhookId)
            return;
        await this.levels.handleMessage({
            guildId: message.guildId,
            channelId: message.channelId,
            ...(message.channel.isThread() && message.channel.parentId ? { parentChannelId: message.channel.parentId } : {}),
            userId: message.author.id,
            displayName: message.member?.displayName ?? message.author.globalName ?? message.author.username,
            roleIds: [...(message.member?.roles.cache.keys() ?? [])],
            at: message.createdAt,
        });
    }
    /** Records who is in a voice channel now. The AFK channel never earns XP. */
    sync(channel) {
        const participants = channel.id === channel.guild.afkChannelId
            ? []
            : [...channel.members.values()].map((member) => ({
                userId: member.id,
                displayName: member.displayName,
                roleIds: [...member.roles.cache.keys()],
                bot: member.user.bot,
                muted: member.voice.mute === true,
                deafened: member.voice.deaf === true,
            }));
        this.tracker.syncChannel(channel.guild.id, channel.id, participants, Date.now());
    }
    async flush() {
        const minutes = this.tracker.flush(Date.now());
        if (minutes.length > 0)
            await this.levels.awardVoice(minutes);
    }
    async safe(operation, action) {
        try {
            await action();
        }
        catch (error) {
            logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, operation }, "Discord levels event failed.");
        }
    }
}
//# sourceMappingURL=LevelsFeature.js.map