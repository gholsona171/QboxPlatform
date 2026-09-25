import { colorValue, type DiscordRestClient } from "@qbox/shared/discord-rest";

import type { StaffButton, StaffEmbed, StaffGateway } from "./types.js";

/** Staff role changes and messages through the Discord REST API (v10). */
export class DiscordRestStaffGateway implements StaffGateway {
  public constructor(private readonly rest: DiscordRestClient) {}

  public async addRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void> {
    await this.rest.put(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
  }

  public async removeRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void> {
    await this.rest.delete(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, { reason });
  }

  public async postEmbed(channelId: string, embed: StaffEmbed, buttons: readonly StaffButton[] = []): Promise<{ readonly messageId: string }> {
    const message = (await this.rest.post(`/channels/${channelId}/messages`, { body: messageBody(embed, buttons) })) as { readonly id: string };
    return { messageId: message.id };
  }

  public async editEmbed(channelId: string, messageId: string, embed: StaffEmbed, buttons: readonly StaffButton[] = []): Promise<void> {
    await this.rest.patch(`/channels/${channelId}/messages/${messageId}`, { body: messageBody(embed, buttons) });
  }
}

function messageBody(embed: StaffEmbed, buttons: readonly StaffButton[]) {
  return {
    embeds: [{
      title: embed.title,
      description: embed.description,
      color: colorValue(embed.color),
      ...(embed.fields?.length ? { fields: embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })) } : {}),
      ...(embed.footer ? { footer: { text: embed.footer } } : {}),
      timestamp: new Date().toISOString(),
    }],
    components: buttons.length
      ? [{ type: 1, components: buttons.map((button) => ({ type: 2, style: button.style === "success" ? 3 : 4, label: button.label, custom_id: button.customId })) }]
      : [],
    allowed_mentions: { parse: [] },
  };
}
