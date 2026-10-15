import { AuditLogEvent, Events, PermissionFlagsBits } from "discord.js";
import { DiscordRestModerationGateway, ModerationService } from "@qbox/moderation";
import { passthroughTemplates } from "@qbox/shared/messages";
import { logger } from "@qbox/logger";
import { ModCommand } from "../commands/Mod.command.js";
const SWEEP_INTERVAL_MS = 60_000;
const AUDIT_WINDOW_MS = 10_000;
/**
 * Moderation: `/mod`, automod on every message, recording bans, unbans, and
 * kicks done directly in Discord, and lifting expired temporary bans.
 */
export function moderationFeature(repository, templates = passthroughTemplates) {
    return ({ client, authorizer }) => {
        const moderation = new ModerationService(repository, new DiscordRestModerationGateway(client.rest), undefined, templates);
        const events = new ModerationEvents(moderation);
        return {
            name: "moderation",
            commands: () => [new ModCommand(moderation, authorizer)],
            attach: (target) => events.attach(target),
            detach: () => events.detach(),
        };
    };
}
class ModerationEvents {
    moderation;
    client;
    timer;
    onMessage = (message) => void this.safe("automod", () => this.automod(message));
    onBanAdd = (ban) => void this.safe("external-ban", () => this.external(ban, "BAN"));
    onBanRemove = (ban) => void this.safe("external-unban", () => this.external(ban, "UNBAN"));
    onMemberRemove = (member) => void this.safe("external-kick", () => this.kick(member));
    constructor(moderation) {
        this.moderation = moderation;
    }
    attach(client) {
        this.client = client;
        client.on(Events.MessageCreate, this.onMessage);
        client.on(Events.GuildBanAdd, this.onBanAdd);
        client.on(Events.GuildBanRemove, this.onBanRemove);
        client.on(Events.GuildMemberRemove, this.onMemberRemove);
        this.timer = setInterval(() => void this.safe("sweep", async () => {
            const result = await this.moderation.sweepExpired();
            if (result.unbanned > 0)
                logger.info({ ...result }, "Expired temporary bans lifted.");
        }), SWEEP_INTERVAL_MS);
        this.timer.unref?.();
    }
    detach() {
        this.client?.off(Events.MessageCreate, this.onMessage);
        this.client?.off(Events.GuildBanAdd, this.onBanAdd);
        this.client?.off(Events.GuildBanRemove, this.onBanRemove);
        this.client?.off(Events.GuildMemberRemove, this.onMemberRemove);
        if (this.timer)
            clearInterval(this.timer);
        this.client = undefined;
    }
    async automod(message) {
        if (!message.inGuild() || message.author.bot || message.system)
            return;
        if (message.member?.permissions.has(PermissionFlagsBits.Administrator))
            return;
        await this.moderation.handleMessage({
            guildId: message.guildId,
            channelId: message.channelId,
            messageId: message.id,
            authorId: message.author.id,
            authorName: message.member?.displayName ?? message.author.username,
            authorRoleIds: [...(message.member?.roles.cache.keys() ?? [])],
            content: message.content,
            mentionCount: message.mentions.users.size + message.mentions.roles.size + (message.mentions.everyone ? 10 : 0),
            createdAt: message.createdAt,
        });
    }
    /** Records bans and unbans that were not made by Qbox. */
    async external(ban, type) {
        const entry = await this.auditEntry(ban.guild, type === "BAN" ? AuditLogEvent.MemberBanAdd : AuditLogEvent.MemberBanRemove, ban.user.id);
        if (entry?.executorId === this.client?.user?.id)
            return;
        await this.moderation.recordExternal({
            guildId: ban.guild.id,
            type,
            target: { userId: ban.user.id, displayName: ban.user.globalName ?? ban.user.username },
            ...(entry?.executorId ? { moderatorId: entry.executorId, moderatorName: entry.executorName } : {}),
            ...(entry?.reason ?? ban.reason ? { reason: entry?.reason ?? ban.reason ?? undefined } : {}),
        });
    }
    /** A member leaving is a kick when a matching, recent audit log entry exists. */
    async kick(member) {
        const entry = await this.auditEntry(member.guild, AuditLogEvent.MemberKick, member.id);
        if (!entry || entry.executorId === this.client?.user?.id)
            return;
        await this.moderation.recordExternal({
            guildId: member.guild.id,
            type: "KICK",
            target: { userId: member.id, displayName: member.user.globalName ?? member.user.username },
            ...(entry.executorId ? { moderatorId: entry.executorId, moderatorName: entry.executorName } : {}),
            ...(entry.reason ? { reason: entry.reason } : {}),
        });
    }
    async auditEntry(guild, type, targetId) {
        try {
            const logs = await guild.fetchAuditLogs({ type, limit: 5 });
            const entry = logs.entries.find((item) => item.targetId === targetId && Date.now() - item.createdTimestamp < AUDIT_WINDOW_MS);
            if (!entry)
                return undefined;
            return {
                executorId: entry.executorId ?? undefined,
                executorName: entry.executor?.globalName ?? entry.executor?.username ?? "Unknown",
                reason: entry.reason ?? undefined,
            };
        }
        catch {
            return undefined;
        }
    }
    async safe(operation, action) {
        try {
            await action();
        }
        catch (error) {
            logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, operation }, "Discord moderation event failed.");
        }
    }
}
//# sourceMappingURL=ModerationFeature.js.map