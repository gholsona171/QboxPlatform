import { type Client } from "discord.js";
import type { DiscordChannelResource, DiscordRoleResource, RoleCapabilities, RoleCreateInput, RoleEditInput, RoleManagementGateway, RoleMoveInput } from "@qbox/discord-roles";
export declare class DiscordRoleManagementGateway implements RoleManagementGateway {
    private readonly client;
    constructor(client: Client);
    listRoles(guildId: string): Promise<readonly DiscordRoleResource[]>;
    listChannels(guildId: string): Promise<readonly DiscordChannelResource[]>;
    getRole(guildId: string, roleId: string): Promise<DiscordRoleResource | undefined>;
    createRole(input: RoleCreateInput): Promise<DiscordRoleResource>;
    editRole(input: RoleEditInput): Promise<DiscordRoleResource>;
    deleteRole(input: {
        readonly guildId: string;
        readonly roleId: string;
        readonly actor: {
            readonly type: string;
            readonly id: string;
        };
    }): Promise<void>;
    moveRole(input: RoleMoveInput): Promise<DiscordRoleResource>;
    capabilities(guildId: string): Promise<RoleCapabilities>;
    private guild;
    private botHighestPosition;
}
//# sourceMappingURL=DiscordRoleManagementGateway.d.ts.map