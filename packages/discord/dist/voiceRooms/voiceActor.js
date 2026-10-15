import { PermissionFlagsBits } from "discord.js";
/**
 * Staff who can control any voice room: Discord administrators, and members
 * with the `voice.manage` permission.
 */
export class VoiceElevation {
    authorizer;
    constructor(authorizer) {
        this.authorizer = authorizer;
    }
    async actor(interaction) {
        return { userId: interaction.user.id, displayName: displayName(interaction), elevated: await this.elevated(interaction) };
    }
    async elevated(interaction) {
        if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator))
            return true;
        const guildId = interaction.guildId;
        if (!guildId)
            return false;
        const member = interaction.member;
        const roleIds = !member ? [] : Array.isArray(member.roles) ? [...member.roles] : [...member.roles.cache.keys()];
        try {
            const decision = await this.authorizer.authorize({
                principals: [
                    { type: "discord-user", externalId: interaction.user.id, guildId },
                    ...roleIds.map((roleId) => ({ type: "discord-role", externalId: roleId, guildId })),
                ],
                scope: { type: "discord-guild", guildId },
                required: ["voice.manage"],
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
/** Voice channel the interaction's member is in, from the gateway cache. */
export function currentVoiceChannelId(interaction) {
    return interaction.guild?.voiceStates.cache.get(interaction.user.id)?.channelId ?? undefined;
}
function displayName(interaction) {
    const member = interaction.member;
    if (member && "displayName" in member && typeof member.displayName === "string")
        return member.displayName;
    return interaction.user.globalName ?? interaction.user.username;
}
//# sourceMappingURL=voiceActor.js.map