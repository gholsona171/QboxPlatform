import { type VoiceRoomService } from "@qbox/voice-rooms";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
import { VoiceElevation } from "../voiceRooms/voiceActor.js";
/** `/voice` - control the voice room you are in. Owners (and `voice.manage` staff) can change it. */
export declare class VoiceCommand implements DiscordCommand {
    private readonly voice?;
    private readonly elevation?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(voice?: VoiceRoomService | undefined, elevation?: VoiceElevation | undefined);
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
}
export declare const command: VoiceCommand;
//# sourceMappingURL=Voice.command.d.ts.map