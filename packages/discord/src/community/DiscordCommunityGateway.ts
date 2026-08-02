import {
  EmbedBuilder,
  type Client,
  type Guild,
  type GuildMember,
  type GuildTextBasedChannel,
} from "discord.js";
import type {
  ChannelRenameInput,
  CommunityRoleMutation,
  CommunityRoleMutationResult,
  CommunityRoleQuery,
  CommunityRoleValidation,
  CommunitySendMessage,
  CommunitySentMessage,
  CounterCountInput,
  DiscordCommunityGateway,
} from "@qbox/discord-community";

export class DiscordCommunityGatewayAdapter implements DiscordCommunityGateway {
  public constructor(private readonly client: Client) {}

  public async sendMessage(input: CommunitySendMessage): Promise<CommunitySentMessage> {
    const channel = await this.resolveTextChannel(input.guildId, input.channelId);
    const message = await channel.send({
      ...(input.content ? { content: input.content } : {}),
      ...(input.embed ? { embeds: [embed(input.embed)] } : {}),
      allowedMentions: { parse: [], roles: roleMentions(input.content) },
    });
    if (input.deleteAfterSeconds) {
      setTimeout(() => void message.delete().catch(() => undefined), input.deleteAfterSeconds * 1000).unref?.();
    }
    return {
      channelId: message.channelId,
      messageId: message.id,
      url: message.url,
    };
  }

  public async assignRole(input: CommunityRoleMutation): Promise<CommunityRoleMutationResult> {
    const member = await this.resolveMember(input);
    if (member.roles.cache.has(input.roleId)) return { changed: false, message: "Member already has that role." };
    await member.roles.add(input.roleId, input.reason);
    return { changed: true, message: "Role assigned." };
  }

  public async removeRole(input: CommunityRoleMutation): Promise<CommunityRoleMutationResult> {
    const member = await this.resolveMember(input);
    if (!member.roles.cache.has(input.roleId)) return { changed: false, message: "Member does not have that role." };
    await member.roles.remove(input.roleId, input.reason);
    return { changed: true, message: "Role removed." };
  }

  public async validateRole(input: CommunityRoleQuery): Promise<CommunityRoleValidation> {
    const guild = await this.resolveGuild(input.guildId);
    const role = await guild.roles.fetch(input.roleId);
    if (!role) return { assignable: false, reason: "Role was not found." };
    if (role.managed) return { assignable: false, reason: "Managed roles cannot be assigned." };
    if (role.id === guild.id) return { assignable: false, reason: "@everyone cannot be assigned." };
    const me = guild.members.me ?? await guild.members.fetchMe();
    if (role.position >= me.roles.highest.position) return { assignable: false, reason: "Bot role is not high enough." };
    return { assignable: true };
  }

  public async countMembers(input: CounterCountInput): Promise<number> {
    const guild = await this.resolveGuild(input.guildId);
    await guild.members.fetch();
    if (input.type === "TOTAL_MEMBERS") return guild.memberCount;
    if (input.type === "BOTS") return guild.members.cache.filter((member) => member.user.bot).size;
    if (input.type === "HUMANS") return guild.members.cache.filter((member) => !member.user.bot).size;
    if (input.type === "ROLE" && input.roleId) {
      const roleId = input.roleId;
      return guild.members.cache.filter((member) => member.roles.cache.has(roleId)).size;
    }
    return guild.presences.cache.size;
  }

  public async renameChannel(input: ChannelRenameInput): Promise<void> {
    const guild = await this.resolveGuild(input.guildId);
    const channel = await guild.channels.fetch(input.channelId);
    if (!channel || !("setName" in channel)) throw new Error("Counter channel cannot be renamed.");
    await channel.setName(input.name, "Qbox member counter refresh.");
  }

  private async resolveGuild(guildId: string): Promise<Guild> {
    const guild = await this.client.guilds.fetch(guildId);
    if (!guild) throw new Error("Guild is unavailable.");
    return guild;
  }

  private async resolveMember(input: CommunityRoleQuery): Promise<GuildMember> {
    const guild = await this.resolveGuild(input.guildId);
    return guild.members.fetch(input.memberId);
  }

  private async resolveTextChannel(guildId: string, channelId: string): Promise<GuildTextBasedChannel> {
    const guild = await this.resolveGuild(guildId);
    const channel = await guild.channels.fetch(channelId);
    if (!channel || !channel.isTextBased() || !("send" in channel)) throw new Error("Configured channel cannot receive messages.");
    return channel;
  }
}

function embed(input: NonNullable<CommunitySendMessage["embed"]>): EmbedBuilder {
  const builder = new EmbedBuilder();
  if (input.title) builder.setTitle(input.title);
  if (input.description) builder.setDescription(input.description);
  if (input.color !== undefined) builder.setColor(input.color);
  if (input.thumbnailUrl && !input.thumbnailUrl.startsWith("avatar:")) builder.setThumbnail(input.thumbnailUrl);
  if (input.imageUrl) builder.setImage(input.imageUrl);
  if (input.footer) builder.setFooter({ text: input.footer });
  if (input.timestamp) builder.setTimestamp();
  if (input.fields) builder.addFields(input.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline })));
  return builder;
}

function roleMentions(content: string | undefined): string[] {
  if (!content) return [];
  return [...content.matchAll(/<@&(\d{17,20})>/g)].map((match) => match[1]).filter((id): id is string => id !== undefined);
}
