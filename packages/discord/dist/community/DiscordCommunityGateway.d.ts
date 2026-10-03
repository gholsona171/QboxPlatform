import { type Client } from "discord.js";
import type { ChannelRenameInput, CommunityRoleMutation, CommunityRoleMutationResult, CommunityRoleQuery, CommunityRoleValidation, CommunityPostMessage, CommunitySendMessage, CommunitySentMessage, CounterCountInput, DiscordCommunityGateway } from "@qbox/discord-community";
export declare class DiscordCommunityGatewayAdapter implements DiscordCommunityGateway {
    private readonly client;
    constructor(client: Client);
    sendMessage(input: CommunitySendMessage): Promise<CommunitySentMessage>;
    postMessage(input: CommunityPostMessage): Promise<CommunitySentMessage>;
    private sent;
    assignRole(input: CommunityRoleMutation): Promise<CommunityRoleMutationResult>;
    removeRole(input: CommunityRoleMutation): Promise<CommunityRoleMutationResult>;
    validateRole(input: CommunityRoleQuery): Promise<CommunityRoleValidation>;
    countMembers(input: CounterCountInput): Promise<number>;
    renameChannel(input: ChannelRenameInput): Promise<void>;
    private resolveGuild;
    private resolveMember;
    private resolveTextChannel;
}
/**
 * Members mentioned in the text (`{user}` renders as `<@id>`). Listing them
 * makes Discord send their names with the message, so everyone sees the
 * name instead of "@unknown-user"; it also pings them, as welcome bots do.
 */
export declare function userMentions(content: string | undefined): string[];
//# sourceMappingURL=DiscordCommunityGateway.d.ts.map