import { type ChatInputCommandInteraction, type MessageComponentInteraction } from "discord.js";
import type { Permission, PermissionAuthorizer } from "@qbox/permissions";
/**
 * True when the member holds `permission` through Qbox permissions, or is a
 * Discord administrator. Used by feature commands whose subcommands need
 * different permissions, and by component handlers (buttons, menus).
 */
export declare function memberHasPermission(authorizer: PermissionAuthorizer, interaction: ChatInputCommandInteraction | MessageComponentInteraction, permission: Permission): Promise<boolean>;
/** Display name of the member who ran an interaction. */
export declare function interactionDisplayName(interaction: ChatInputCommandInteraction): string;
//# sourceMappingURL=featureAuthorization.d.ts.map