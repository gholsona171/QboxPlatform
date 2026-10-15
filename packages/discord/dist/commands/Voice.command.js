import { SlashCommandBuilder } from "discord.js";
import { VoiceError } from "@qbox/voice-rooms";
import { VoiceElevation, currentVoiceChannelId } from "../voiceRooms/voiceActor.js";
/** `/voice` - control the voice room you are in. Owners (and `voice.manage` staff) can change it. */
export class VoiceCommand {
    voice;
    elevation;
    type = "chat-input";
    policy = {
        contexts: "guild",
        response: { acknowledgement: "deferred", visibility: "ephemeral" },
        concurrency: "user",
    };
    data = new SlashCommandBuilder()
        .setName("voice")
        .setDescription("Control your voice room.")
        .addSubcommand((sub) => sub.setName("rename").setDescription("Rename your room.")
        .addStringOption((option) => option.setName("name").setDescription("New name.").setRequired(true).setMaxLength(100)))
        .addSubcommand((sub) => sub.setName("limit").setDescription("Set how many people can join (0 = no limit).")
        .addIntegerOption((option) => option.setName("users").setDescription("0-99.").setRequired(true).setMinValue(0).setMaxValue(99)))
        .addSubcommand((sub) => sub.setName("lock").setDescription("Stop new people from joining."))
        .addSubcommand((sub) => sub.setName("unlock").setDescription("Let anyone join again."))
        .addSubcommand((sub) => sub.setName("hide").setDescription("Hide your room from the channel list."))
        .addSubcommand((sub) => sub.setName("unhide").setDescription("Show your room in the channel list again."))
        .addSubcommand((sub) => sub.setName("permit").setDescription("Let a member see and join even when locked or hidden.")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true)))
        .addSubcommand((sub) => sub.setName("reject").setDescription("Block a member from your room.")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true)))
        .addSubcommand((sub) => sub.setName("kick").setDescription("Disconnect a member from your room.")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true)))
        .addSubcommand((sub) => sub.setName("transfer").setDescription("Make someone in your room the owner.")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true)))
        .addSubcommand((sub) => sub.setName("claim").setDescription("Take over this room after its owner left."))
        .addSubcommand((sub) => sub.setName("panel").setDescription("Post the control panel again."));
    constructor(voice, elevation) {
        this.voice = voice;
        this.elevation = elevation;
    }
    async execute(context) {
        try {
            await this.run(context);
        }
        catch (error) {
            if (!(error instanceof VoiceError))
                throw error;
            await context.editReply({ content: error.message });
        }
    }
    async run(context) {
        const voice = this.voice;
        const interaction = context.interaction;
        if (!voice || !this.elevation || !interaction.guildId)
            throw new VoiceError("DEPENDENCY_UNAVAILABLE", "Voice rooms are not available right now.");
        const room = await voice.roomForChannel(currentVoiceChannelId(interaction));
        const actor = await this.elevation.actor(interaction);
        const options = context.options;
        const reply = (content) => context.editReply({ content, allowedMentions: { parse: [] } });
        switch (context.route.requiredSubcommand()) {
            case "rename": {
                const renamed = await voice.rename(room, actor, options.requiredString("name"));
                return reply(`Room renamed to **${renamed.name}**.`);
            }
            case "limit": {
                const users = options.requiredInteger("users");
                await voice.limit(room, actor, users);
                return reply(users === 0 ? "User limit removed." : `User limit set to ${users}.`);
            }
            case "lock":
            case "unlock": {
                const locked = context.route.requiredSubcommand() === "lock";
                await voice.lock(room, actor, locked);
                return reply(locked ? "Room locked." : "Room unlocked.");
            }
            case "hide":
            case "unhide": {
                const hidden = context.route.requiredSubcommand() === "hide";
                await voice.hide(room, actor, hidden);
                return reply(hidden ? "Room hidden." : "Room visible again.");
            }
            case "permit": {
                const member = options.requiredUser("member");
                await voice.permit(room, actor, member.id);
                return reply(`<@${member.id}> can now see and join your room.`);
            }
            case "reject": {
                const member = options.requiredUser("member");
                await voice.reject(room, actor, member.id);
                return reply(`<@${member.id}> is blocked from your room.`);
            }
            case "kick": {
                const member = options.requiredUser("member");
                await voice.kick(room, actor, member.id);
                return reply(`<@${member.id}> was disconnected.`);
            }
            case "transfer": {
                const member = options.requiredUser("member");
                await voice.transfer(room, actor, member.id);
                return reply(`<@${member.id}> now owns this room.`);
            }
            case "claim":
                await voice.claim(room, actor);
                return reply("You now own this room.");
            default:
                await voice.resendPanel(room, actor);
                return reply("Control panel posted in the room's chat.");
        }
    }
}
export const command = new VoiceCommand();
//# sourceMappingURL=Voice.command.js.map