import { PermissionFlagsBits } from "discord.js";
import { memberRoleIds } from "../tickets/ticketActor.js";
/**
 * Decides whether a member reviews every form: Discord administrators always
 * do; others need `applications.review` or `applications.manage`.
 */
export class ApplicationElevation {
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
                required: ["applications.review", "applications.manage"],
                mode: "any",
                administratorOverride: true,
            });
            return decision.allowed;
        }
        catch {
            return false;
        }
    }
}
export function applicantFromInteraction(interaction) {
    return { userId: interaction.user.id, displayName: displayName(interaction), roleIds: memberRoleIds(interaction), source: "DISCORD" };
}
export async function reviewerFromInteraction(interaction, elevation) {
    const roleIds = memberRoleIds(interaction);
    const admin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) === true;
    const elevated = admin || (interaction.guildId ? await elevation.isElevated(interaction.guildId, interaction.user.id, roleIds) : false);
    return { userId: interaction.user.id, displayName: displayName(interaction), roleIds, elevated, source: "DISCORD" };
}
function displayName(interaction) {
    const member = interaction.member;
    if (member && "displayName" in member && typeof member.displayName === "string")
        return member.displayName;
    return interaction.user.globalName ?? interaction.user.username;
}
//# sourceMappingURL=applicationActor.js.map