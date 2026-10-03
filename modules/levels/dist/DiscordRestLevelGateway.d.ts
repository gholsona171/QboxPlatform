import { type DiscordRestClient } from "@qbox/shared/discord-rest";
import type { OutgoingMessage } from "@qbox/shared/messages";
import type { LevelGateway } from "./types.js";
/** Level rewards and level-up messages through the Discord REST API (v10). */
export declare class DiscordRestLevelGateway implements LevelGateway {
    private readonly rest;
    private readonly guildNames;
    constructor(rest: DiscordRestClient);
    guildName(guildId: string): Promise<string>;
    memberRoleIds(guildId: string, userId: string): Promise<readonly string[] | undefined>;
    addRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
    removeRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
    sendMessage(channelId: string, message: OutgoingMessage, mentionUserId: string): Promise<void>;
    directMessage(userId: string, message: OutgoingMessage): Promise<boolean>;
}
//# sourceMappingURL=DiscordRestLevelGateway.d.ts.map