/**
 * Translates Discord-authenticated interaction identity without reading options.
 * Both cached GuildMember role collections and API member role arrays are supported.
 */
export function discordPermissionIdentity(interaction) {
    const userId = interaction.user.id?.trim();
    if (!userId)
        throw new Error("Discord interaction user identity is missing.");
    if (!interaction.inGuild())
        return { type: "dm", userId };
    const guildId = interaction.guildId?.trim();
    if (!guildId)
        throw new Error("Discord guild interaction is missing its guild identity.");
    const memberRoles = interaction.member.roles;
    const roleIds = Array.isArray(memberRoles)
        ? memberRoles
        : [...memberRoles.cache.keys()];
    if (roleIds.some((roleId) => typeof roleId !== "string" || roleId.trim().length === 0)) {
        throw new Error("Discord interaction contains a malformed role identity.");
    }
    return {
        type: "guild",
        guildId,
        scope: { type: "discord-guild", guildId },
        principals: [
            { type: "discord-user", externalId: userId, guildId },
            ...roleIds.map((roleId) => ({
                type: "discord-role",
                externalId: roleId,
                guildId,
            })),
        ],
    };
}
//# sourceMappingURL=DiscordPermissionIdentity.js.map