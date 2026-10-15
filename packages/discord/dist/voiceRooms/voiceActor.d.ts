import { type BaseInteraction } from "discord.js";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { VoiceActor } from "@qbox/voice-rooms";
/**
 * Staff who can control any voice room: Discord administrators, and members
 * with the `voice.manage` permission.
 */
export declare class VoiceElevation {
    private readonly authorizer;
    constructor(authorizer: PermissionAuthorizer);
    actor(interaction: BaseInteraction): Promise<VoiceActor>;
    private elevated;
}
/** Voice channel the interaction's member is in, from the gateway cache. */
export declare function currentVoiceChannelId(interaction: BaseInteraction): string | undefined;
//# sourceMappingURL=voiceActor.d.ts.map