import type { ButtonInteraction, MessageReaction, PartialMessageReaction, PartialUser, StringSelectMenuInteraction, User } from "discord.js";
import { type RoleMenuService } from "@qbox/role-menus";
export declare function roleMenuButtonCustomId(menuId: string, optionId: string): string;
export declare class DiscordRoleMenuInteractionHandler {
    private readonly roleMenus;
    constructor(roleMenus: RoleMenuService);
    handleComponent(interaction: ButtonInteraction | StringSelectMenuInteraction): Promise<void>;
    handleReaction(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, direction: "add" | "remove"): Promise<void>;
}
/**
 * Takes a reaction back only on a role-menu message, when the emoji is not one
 * of the menu's options or the role could not be given. Reactions on every
 * other message (no role menu there) and failures we cannot explain are left
 * alone, so members can react normally across the server.
 */
export declare function shouldUndoReaction(error: unknown): boolean;
//# sourceMappingURL=DiscordRoleMenuInteractionHandler.d.ts.map