import type { Client } from "discord.js";
import type { RoleMenuMemberRoleGateway, RoleMenuRoleMutation, RoleMenuRoleMutationResult, RoleMenuRoleQuery, RoleMenuRoleValidation } from "@qbox/role-menus";
export declare class DiscordRoleMenuGateway implements RoleMenuMemberRoleGateway {
    private readonly client;
    constructor(client: Client);
    addRole(input: RoleMenuRoleMutation): Promise<RoleMenuRoleMutationResult>;
    removeRole(input: RoleMenuRoleMutation): Promise<RoleMenuRoleMutationResult>;
    hasRole(input: RoleMenuRoleQuery): Promise<boolean>;
    validateAssignableRole(input: RoleMenuRoleQuery): Promise<RoleMenuRoleValidation>;
    private resolve;
}
//# sourceMappingURL=DiscordRoleMenuGateway.d.ts.map