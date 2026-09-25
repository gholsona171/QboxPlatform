import { PermissionFlagsBits, type BaseInteraction } from "discord.js";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { VoiceActor } from "@qbox/voice-rooms";

/**
 * Staff who can control any voice room: Discord administrators, and members
 * with the `voice.manage` permission.
 */
export class VoiceElevation {
  public constructor(private readonly authorizer: PermissionAuthorizer) {}

  public async actor(interaction: BaseInteraction): Promise<VoiceActor> {
    return { userId: interaction.user.id, displayName: displayName(interaction), elevated: await this.elevated(interaction) };
  }

  private async elevated(interaction: BaseInteraction): Promise<boolean> {
    if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return true;
    const guildId = interaction.guildId;
    if (!guildId) return false;
    const member = interaction.member;
    const roleIds = !member ? [] : Array.isArray(member.roles) ? [...member.roles] : [...member.roles.cache.keys()];
    try {
      const decision = await this.authorizer.authorize({
        principals: [
          { type: "discord-user", externalId: interaction.user.id, guildId },
          ...roleIds.map((roleId) => ({ type: "discord-role" as const, externalId: roleId, guildId })),
        ],
        scope: { type: "discord-guild", guildId },
        required: ["voice.manage"],
        mode: "all",
        administratorOverride: true,
      });
      return decision.allowed;
    } catch {
      return false;
    }
  }
}

/** Voice channel the interaction's member is in, from the gateway cache. */
export function currentVoiceChannelId(interaction: BaseInteraction): string | undefined {
  return interaction.guild?.voiceStates.cache.get(interaction.user.id)?.channelId ?? undefined;
}

function displayName(interaction: BaseInteraction): string {
  const member = interaction.member;
  if (member && "displayName" in member && typeof member.displayName === "string") return member.displayName;
  return interaction.user.globalName ?? interaction.user.username;
}
