import { type DiscordRestClient } from "@qbox/shared/discord-rest";
import type { StaffButton, StaffEmbed, StaffGateway } from "./types.js";
/** Staff role changes and messages through the Discord REST API (v10). */
export declare class DiscordRestStaffGateway implements StaffGateway {
    private readonly rest;
    constructor(rest: DiscordRestClient);
    addRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
    removeRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
    postEmbed(channelId: string, embed: StaffEmbed, buttons?: readonly StaffButton[]): Promise<{
        readonly messageId: string;
    }>;
    editEmbed(channelId: string, messageId: string, embed: StaffEmbed, buttons?: readonly StaffButton[]): Promise<void>;
}
//# sourceMappingURL=DiscordRestStaffGateway.d.ts.map