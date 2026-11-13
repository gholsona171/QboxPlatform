import { PermissionFlagsBits } from "discord.js";
/**
 * Decides whether a member is elevated for tickets: Discord administrators and
 * Manage Server holders always are; others need the `tickets.handle`
 * permission from the Qbox permission system.
 */
export class TicketElevation {
    authorizer;
    constructor(authorizer) {
        this.authorizer = authorizer;
    }
    async isElevated(guildId, userId, roleIds) {
        try {
            const decision = await this.authorizer.authorize({
                principals: [
                    { type: "discord-user", externalId: userId, guildId },
                    ...roleIds.map((roleId) => ({ type: "discord-role", externalId: roleId, guildId })),
                ],
                scope: { type: "discord-guild", guildId },
                required: ["tickets.handle"],
                mode: "all",
                administratorOverride: true,
            });
            return decision.allowed;
        }
        catch {
            return false;
        }
    }
}
/** Builds the ticket actor for a guild interaction. */
export async function ticketActorFromInteraction(interaction, elevation) {
    const roleIds = memberRoleIds(interaction);
    const discordAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) === true ||
        interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) === true;
    const elevated = discordAdmin || (interaction.guildId ? await elevation.isElevated(interaction.guildId, interaction.user.id, roleIds) : false);
    return {
        userId: interaction.user.id,
        displayName: memberDisplayName(interaction),
        roleIds,
        elevated,
        source: "DISCORD",
    };
}
export function memberRoleIds(interaction) {
    const member = interaction.member;
    if (!member)
        return [];
    return Array.isArray(member.roles) ? [...member.roles] : [...member.roles.cache.keys()];
}
function memberDisplayName(interaction) {
    const member = interaction.member;
    if (member && "displayName" in member && typeof member.displayName === "string")
        return member.displayName;
    return interaction.user.globalName ?? interaction.user.username;
}
//# sourceMappingURL=ticketActor.js.map