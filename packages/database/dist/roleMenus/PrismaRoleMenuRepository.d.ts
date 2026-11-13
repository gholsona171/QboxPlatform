import type { RoleMenu, RoleMenuDraftInput, RoleMenuOptionInput, RoleMenuRepository, RoleMenuStatus } from "@qbox/role-menus";
import type { PrismaClient } from "@qbox/prisma";
export declare class PrismaRoleMenuRepository implements RoleMenuRepository {
    private readonly client;
    constructor(client: PrismaClient);
    create(input: RoleMenuDraftInput): Promise<RoleMenu>;
    update(id: string, input: Parameters<RoleMenuRepository["update"]>[1]): Promise<RoleMenu>;
    addOption(roleMenuId: string, input: RoleMenuOptionInput & Parameters<RoleMenuRepository["addOption"]>[1]): Promise<RoleMenu>;
    updateOption(roleMenuId: string, optionId: string, input: Parameters<RoleMenuRepository["updateOption"]>[2]): Promise<RoleMenu>;
    removeOption(roleMenuId: string, optionId: string, input?: Parameters<RoleMenuRepository["removeOption"]>[2]): Promise<RoleMenu>;
    reorderOptions(roleMenuId: string, optionIds: readonly string[], input?: Parameters<RoleMenuRepository["reorderOptions"]>[2]): Promise<RoleMenu>;
    setPublished(roleMenuId: string, messageId: string, input?: Parameters<RoleMenuRepository["setPublished"]>[2]): Promise<RoleMenu>;
    setStatus(roleMenuId: string, status: RoleMenuStatus, input?: Parameters<RoleMenuRepository["setStatus"]>[2]): Promise<RoleMenu>;
    delete(roleMenuId: string): Promise<void>;
    findById(roleMenuId: string): Promise<RoleMenu | undefined>;
    findByPublishedMessage(guildId: string, channelId: string, messageId: string): Promise<RoleMenu | undefined>;
    listByGuild(guildId: string): Promise<readonly RoleMenu[]>;
}
//# sourceMappingURL=PrismaRoleMenuRepository.d.ts.map