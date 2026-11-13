import type { DiscordChannelResource, DiscordRoleResource, RoleCapabilities, RoleCreateInput, RoleEditInput, RoleManagementGateway, RoleMoveInput } from "@qbox/discord-roles";
export declare class DiscordRestRoleGateway implements RoleManagementGateway {
    private readonly applicationId?;
    private readonly rest;
    constructor(token: string, applicationId?: string | undefined);
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
    private roles;
    private botUserId;
    private botHighestPosition;
}
//# sourceMappingURL=DiscordRestRoleGateway.d.ts.map