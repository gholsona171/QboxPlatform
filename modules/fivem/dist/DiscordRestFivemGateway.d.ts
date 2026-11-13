import { type DiscordRestClient } from "@qbox/shared/discord-rest";
import type { FivemEmbed, FivemGateway, FivemStatusMessageOptions } from "./types.js";
/** FiveM status messages and alerts through the Discord REST API (v10). */
export declare class DiscordRestFivemGateway implements FivemGateway {
    private readonly rest;
    constructor(rest: DiscordRestClient);
    upsertStatusMessage(channelId: string, messageId: string | undefined, embed: FivemEmbed, connectUrl: string | undefined, options?: FivemStatusMessageOptions): Promise<string>;
    postAlert(channelId: string, content: string, embed: FivemEmbed, roleId: string | undefined): Promise<void>;
}
/** A link button row for the cfx.re join link, or no components. */
export declare function connectButton(connectUrl: string | undefined): {
    type: number;
    components: {
        type: number;
        style: number;
        label: string;
        url: string;
    }[];
}[];
export declare function toEmbed(embed: FivemEmbed): {
    timestamp?: string;
    footer?: {
        text: string;
    };
    thumbnail?: {
        url: string;
    };
    image?: {
        url: string;
    };
    fields?: {
        name: string;
        value: string;
        inline: boolean;
    }[];
    title: string;
    description: string;
    color: number;
};
//# sourceMappingURL=DiscordRestFivemGateway.d.ts.map