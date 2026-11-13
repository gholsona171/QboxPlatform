import type { DiscordRestClient } from "@qbox/shared/discord-rest";
import type { BirthdayAnnouncement, BirthdayGateway } from "./types.js";
/** Birthday messages and roles through the Discord REST API (v10). */
export declare class DiscordRestBirthdayGateway implements BirthdayGateway {
    private readonly rest;
    private readonly now;
    private readonly names;
    constructor(rest: DiscordRestClient, now?: () => number);
    guildName(guildId: string): Promise<string>;
    post(channelId: string, announcement: BirthdayAnnouncement): Promise<{
        readonly messageId: string;
    }>;
    addRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
    removeRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
}
//# sourceMappingURL=DiscordRestBirthdayGateway.d.ts.map