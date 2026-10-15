import { type Interaction } from "discord.js";
import { type VoiceRoomService } from "@qbox/voice-rooms";
import type { VoiceElevation } from "./voiceActor.js";
/** Handles voice room control panel buttons, member pickers, and forms. */
export declare class DiscordVoiceInteractionHandler {
    private readonly voice;
    private readonly elevation;
    constructor(voice: VoiceRoomService, elevation: VoiceElevation);
    handle(interaction: Interaction): Promise<void>;
    private button;
    private pick;
    private form;
    private room;
    private fail;
}
//# sourceMappingURL=DiscordVoiceInteractionHandler.d.ts.map