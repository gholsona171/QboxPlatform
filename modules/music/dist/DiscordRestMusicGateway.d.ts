import type { DiscordRestClient } from "@qbox/shared/discord-rest";
import type { OutgoingMessage } from "@qbox/shared/messages";
import type { MusicGateway, MusicPostOptions } from "./types.js";
/**
 * Now-playing messages through the Discord REST API (v10). A cover is sent as
 * an attachment the embed thumbnail points at (`attachment://cover.jpg`);
 * progress edits keep that attachment.
 */
export declare class DiscordRestMusicGateway implements MusicGateway {
    private readonly rest;
    constructor(rest: DiscordRestClient);
    post(channelId: string, message: OutgoingMessage, options: MusicPostOptions): Promise<string>;
    edit(channelId: string, messageId: string, message: OutgoingMessage, options: MusicPostOptions): Promise<void>;
    deleteMessage(channelId: string, messageId: string): Promise<void>;
    guildName(guildId: string): Promise<string | undefined>;
}
//# sourceMappingURL=DiscordRestMusicGateway.d.ts.map