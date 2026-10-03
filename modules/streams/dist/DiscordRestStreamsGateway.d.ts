import type { DiscordRestClient } from "@qbox/shared/discord-rest";
import type { OutgoingMessage } from "@qbox/shared/messages";
import type { StreamsGateway, StreamsPostOptions } from "./types.js";
/** Stream announcements through the Discord REST API (v10). */
export declare class DiscordRestStreamsGateway implements StreamsGateway {
    private readonly rest;
    constructor(rest: DiscordRestClient);
    post(channelId: string, message: OutgoingMessage, options: StreamsPostOptions): Promise<string>;
    edit(channelId: string, messageId: string, message: OutgoingMessage, options: StreamsPostOptions): Promise<void>;
    deleteMessage(channelId: string, messageId: string): Promise<void>;
    guildName(guildId: string): Promise<string | undefined>;
}
/** A link button row for the "Watch" button, or no components. */
export declare function watchButton(url: string | undefined): {
    type: number;
    components: {
        type: number;
        style: number;
        label: string;
        url: string;
    }[];
}[];
//# sourceMappingURL=DiscordRestStreamsGateway.d.ts.map