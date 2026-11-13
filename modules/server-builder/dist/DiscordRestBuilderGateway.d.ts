import type { DiscordRestClient } from "@qbox/shared/discord-rest";
import type { BotStatus, BuilderGateway, ChannelCreateInput, ExistingChannel, ExistingRole, ForumPostInput, RoleCreateInput, WipeExpression, WipeLayout } from "./types.js";
/** Server builder operations through the Discord REST API (v10). */
export declare class DiscordRestBuilderGateway implements BuilderGateway {
    private readonly rest;
    private botUserId;
    constructor(rest: DiscordRestClient);
    listRoles(guildId: string): Promise<readonly ExistingRole[]>;
    listChannels(guildId: string): Promise<readonly ExistingChannel[]>;
    botStatus(guildId: string): Promise<BotStatus>;
    createRole(guildId: string, input: RoleCreateInput, reason: string): Promise<string>;
    setRolePositions(guildId: string, positions: readonly {
        readonly id: string;
        readonly position: number;
    }[], reason: string): Promise<void>;
    createChannel(guildId: string, input: ChannelCreateInput, reason: string): Promise<string>;
    createForumPost(channelId: string, input: ForumPostInput, reason: string): Promise<{
        readonly threadId: string;
    }>;
    pinForumPost(threadId: string, reason: string): Promise<void>;
    /** Deleting something that is already gone counts as done. */
    deleteChannel(channelId: string, reason: string): Promise<void>;
    deleteRole(guildId: string, roleId: string, reason: string): Promise<void>;
    readLayout(guildId: string): Promise<WipeLayout>;
    listEmojis(guildId: string): Promise<readonly WipeExpression[]>;
    listStickers(guildId: string): Promise<readonly WipeExpression[]>;
    deleteEmoji(guildId: string, emojiId: string, reason: string): Promise<void>;
    deleteSticker(guildId: string, stickerId: string, reason: string): Promise<void>;
    private selfId;
}
//# sourceMappingURL=DiscordRestBuilderGateway.d.ts.map