import type { ChatInputCommandInteraction, MessageComponentInteraction } from "discord.js";
import type { PermissionPrincipal, PermissionScope } from "@qbox/permissions";
/** Trusted Discord identity translated for permission-domain authorization. */
export type DiscordPermissionIdentity = {
    readonly type: "dm";
    readonly userId: string;
} | {
    readonly type: "guild";
    readonly guildId: string;
    readonly principals: readonly PermissionPrincipal[];
    readonly scope: PermissionScope;
};
/**
 * Translates Discord-authenticated interaction identity without reading options.
 * Both cached GuildMember role collections and API member role arrays are supported.
 */
export declare function discordPermissionIdentity(interaction: ChatInputCommandInteraction | MessageComponentInteraction): DiscordPermissionIdentity;
//# sourceMappingURL=DiscordPermissionIdentity.d.ts.map