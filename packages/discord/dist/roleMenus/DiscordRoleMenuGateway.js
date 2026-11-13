import { PermissionsBitField } from "discord.js";
export class DiscordRoleMenuGateway {
    client;
    constructor(client) {
        this.client = client;
    }
    async addRole(input) {
        const { member } = await this.resolve(input);
        await member.roles.add(input.roleId, input.reason);
        return { changed: true, message: "Role added." };
    }
    async removeRole(input) {
        const { member } = await this.resolve(input);
        await member.roles.remove(input.roleId, input.reason);
        return { changed: true, message: "Role removed." };
    }
    async hasRole(input) {
        const { member } = await this.resolve(input);
        return member.roles.cache.has(input.roleId);
    }
    async validateAssignableRole(input) {
        const { guild, me } = await this.resolve(input);
        const role = await guild.roles.fetch(input.roleId);
        if (!role)
            return { assignable: false, reason: "Configured role no longer exists." };
        if (role.id === guild.id)
            return { assignable: false, reason: "@everyone cannot be assigned." };
        if (role.managed)
            return { assignable: false, reason: "Managed roles cannot be assigned by the bot." };
        if (!me.permissions.has(PermissionsBitField.Flags.ManageRoles))
            return { assignable: false, reason: "Bot is missing Manage Roles." };
        if (role.position >= me.roles.highest.position)
            return { assignable: false, reason: "Bot role is not higher than the target role." };
        return { assignable: true };
    }
    async resolve(input) {
        const guild = await this.client.guilds.fetch(input.guildId);
        const member = await guild.members.fetch(input.memberId);
        const me = await guild.members.fetchMe();
        if (member.user.id === this.client.user?.id)
            throw new Error("Bot member cannot self-assign role menus.");
        return { guild, member, me };
    }
}
//# sourceMappingURL=DiscordRoleMenuGateway.js.map