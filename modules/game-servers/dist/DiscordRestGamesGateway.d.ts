import type { DiscordRestClient } from "@qbox/shared/discord-rest";
import type { OutgoingMessage } from "@qbox/shared/messages";
import type { GamesGateway } from "./types.js";
/** Game server status messages, alerts, and channel renames through the Discord REST API (v10). */
export declare class DiscordRestGamesGateway implements GamesGateway {
    private readonly rest;
    constructor(rest: DiscordRestClient);
    upsertStatusMessage(channelId: string, messageId: string | undefined, message: OutgoingMessage, connectUrl: string | undefined): Promise<string>;
    postAlert(channelId: string, message: OutgoingMessage, roleId: string | undefined): Promise<void>;
    renameChannel(channelId: string, name: string): Promise<void>;
}
/** A link button row for an http(s) connect link, or no components. */
export declare function connectButton(connectUrl: string | undefined): {
    type: number;
    components: {
        type: number;
        style: number;
        label: string;
        url: string;
    }[];
}[];
//# sourceMappingURL=DiscordRestGamesGateway.d.ts.map