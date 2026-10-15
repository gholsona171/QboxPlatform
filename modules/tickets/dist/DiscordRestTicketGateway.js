import { TicketError } from "./validation.js";
import { GuildNameCache, MISSING_PANEL_CHANNEL_MESSAGE, colorValue, emojiObject, isMissingChannelError, } from "@qbox/shared/discord-rest";
import { BRAND } from "@qbox/shared/brand";
/** Custom ID prefixes routed by the Discord interaction handler. */
export const TICKET_CUSTOM_ID = {
    open: "qbox:ticket:open:",
    select: "qbox:ticket:select",
    form: "qbox:ticket:form:",
    close: "qbox:ticket:close:",
    closeConfirm: "qbox:ticket:close-confirm:",
    closeReason: "qbox:ticket:close-reason:",
    claim: "qbox:ticket:claim:",
    reopen: "qbox:ticket:reopen:",
    transcript: "qbox:ticket:transcript:",
    delete: "qbox:ticket:delete:",
    rate: "qbox:ticket:rate:",
    /** "🔒 Staff chat" button on the opening message. */
    staffChat: "qbox:tickets:staffchat:",
};
const PERMISSION = {
    addReactions: 1n << 6n,
    manageChannels: 1n << 4n,
    viewChannel: 1n << 10n,
    sendMessages: 1n << 11n,
    manageMessages: 1n << 13n,
    embedLinks: 1n << 14n,
    attachFiles: 1n << 15n,
    readMessageHistory: 1n << 16n,
};
const FULL_ACCESS = PERMISSION.viewChannel | PERMISSION.sendMessages | PERMISSION.readMessageHistory | PERMISSION.attachFiles | PERMISSION.embedLinks | PERMISSION.addReactions;
const READ_ONLY_ALLOW = PERMISSION.viewChannel | PERMISSION.readMessageHistory;
const READ_ONLY_DENY = PERMISSION.sendMessages | PERMISSION.addReactions | PERMISSION.attachFiles;
const CHANNEL_TYPE_TEXT = 0;
const CHANNEL_TYPE_PRIVATE_THREAD = 12;
const OVERWRITE_ROLE = 0;
const OVERWRITE_MEMBER = 1;
const BUTTON_STYLE = { PRIMARY: 1, SECONDARY: 2, SUCCESS: 3, DANGER: 4 };
/** Discord adapter for tickets built on the Discord REST API (v10). */
export class DiscordRestTicketGateway {
    rest;
    schedule;
    botUserId;
    guildNames;
    constructor(rest, schedule = defaultSchedule) {
        this.rest = rest;
        this.schedule = schedule;
        this.guildNames = new GuildNameCache(rest);
    }
    guildName(guildId) {
        return this.guildNames.name(guildId);
    }
    async createTicketSpace(input) {
        if (input.mode === "THREAD") {
            if (!input.parentChannelId)
                throw new Error("Thread mode requires a parent channel.");
            const thread = (await this.rest.post(`/channels/${input.parentChannelId}/threads`, {
                body: { name: input.name, type: CHANNEL_TYPE_PRIVATE_THREAD, invitable: false, auto_archive_duration: 10080 },
                reason: input.topic,
            }));
            for (const userId of [input.openerId, ...input.memberIds])
                await this.rest.put(`/channels/${thread.id}/thread-members/${userId}`);
            return { channelId: thread.id };
        }
        const botUserId = await this.selfId();
        const channel = (await this.rest.post(`/guilds/${input.guildId}/channels`, {
            body: {
                name: input.name,
                type: CHANNEL_TYPE_TEXT,
                topic: input.topic,
                ...(input.parentChannelId ? { parent_id: input.parentChannelId } : {}),
                permission_overwrites: [
                    { id: input.guildId, type: OVERWRITE_ROLE, allow: "0", deny: String(PERMISSION.viewChannel) },
                    { id: input.openerId, type: OVERWRITE_MEMBER, allow: String(FULL_ACCESS), deny: "0" },
                    ...input.memberIds.map((userId) => ({ id: userId, type: OVERWRITE_MEMBER, allow: String(FULL_ACCESS), deny: "0" })),
                    ...input.supportRoleIds.map((roleId) => ({ id: roleId, type: OVERWRITE_ROLE, allow: String(FULL_ACCESS | PERMISSION.manageMessages), deny: "0" })),
                    { id: botUserId, type: OVERWRITE_MEMBER, allow: String(FULL_ACCESS | PERMISSION.manageChannels | PERMISSION.manageMessages), deny: "0" },
                ],
            },
            reason: input.topic,
        }));
        return { channelId: channel.id };
    }
    async postOpening(input) {
        const buttons = [
            button(`${TICKET_CUSTOM_ID.close}${input.ticket.id}`, "Close", "DANGER", "🔒"),
            ...(input.claimButton ? [button(`${TICKET_CUSTOM_ID.claim}${input.ticket.id}`, "Claim", "SUCCESS", "🙋")] : []),
            ...(input.staffChatButton ? [button(`${TICKET_CUSTOM_ID.staffChat}${input.ticket.id}`, "Staff chat", "SECONDARY", "🔒")] : []),
        ];
        const mentions = [...input.mentionUserIds.map((id) => `<@${id}>`), ...input.mentionRoleIds.map((id) => `<@&${id}>`)].join(" ");
        await this.rest.post(`/channels/${input.channelId}/messages`, {
            body: {
                content: [mentions, input.message.content ?? ""].filter(Boolean).join("\n") || undefined,
                embeds: input.message.embeds ?? [],
                components: [{ type: 1, components: buttons }],
                allowed_mentions: { parse: [], users: [...input.mentionUserIds], roles: [...input.mentionRoleIds] },
            },
        });
    }
    async postNotice(input) {
        const controls = input.closedControlsTicketId
            ? [{
                    type: 1,
                    components: [
                        button(`${TICKET_CUSTOM_ID.reopen}${input.closedControlsTicketId}`, "Reopen", "SECONDARY", "🔓"),
                        button(`${TICKET_CUSTOM_ID.transcript}${input.closedControlsTicketId}`, "Transcript", "SECONDARY", "📄"),
                        button(`${TICKET_CUSTOM_ID.delete}${input.closedControlsTicketId}`, "Delete", "DANGER", "🗑️"),
                    ],
                }]
            : [];
        const body = input.title
            ? { embeds: [{ title: input.title, description: input.content, color: colorValue(input.color ?? "#5865F2") }], components: controls, allowed_mentions: { parse: [] } }
            : { content: input.content, components: controls, allowed_mentions: { parse: input.silent ? [] : ["users"] } };
        const message = (await this.rest.post(`/channels/${input.channelId}/messages`, { body }));
        return { messageId: message.id };
    }
    async setAccess(input) {
        if (input.mode === "THREAD") {
            if (input.targetType === "ROLE")
                return;
            const route = `/channels/${input.channelId}/thread-members/${input.targetId}`;
            if (input.access === "FULL")
                await this.rest.put(route);
            else
                await this.rest.delete(route);
            return;
        }
        const route = `/channels/${input.channelId}/permissions/${input.targetId}`;
        if (input.access === "NONE") {
            await this.rest.delete(route);
            return;
        }
        const type = input.targetType === "ROLE" ? OVERWRITE_ROLE : OVERWRITE_MEMBER;
        const body = input.access === "FULL"
            ? { type, allow: String(FULL_ACCESS), deny: "0" }
            : { type, allow: String(READ_ONLY_ALLOW), deny: String(READ_ONLY_DENY) };
        await this.rest.put(route, { body });
    }
    async closeSpace(input) {
        if (input.action === "DELETE") {
            await this.deleteSpace(input.channelId, input.deleteDelaySeconds);
            return;
        }
        if (input.mode === "THREAD") {
            await this.rest.patch(`/channels/${input.channelId}`, { body: { archived: true, locked: true } });
            return;
        }
        if (input.closedParentChannelId)
            await this.rest.patch(`/channels/${input.channelId}`, { body: { parent_id: input.closedParentChannelId } });
    }
    async reopenSpace(input) {
        if (input.mode === "THREAD") {
            await this.rest.patch(`/channels/${input.channelId}`, { body: { archived: false, locked: false } });
            return;
        }
        if (input.openParentChannelId)
            await this.rest.patch(`/channels/${input.channelId}`, { body: { parent_id: input.openParentChannelId } });
    }
    async deleteSpace(channelId, delaySeconds) {
        const remove = () => this.rest.delete(`/channels/${channelId}`, { reason: `${BRAND.name} ticket closed.` });
        if (delaySeconds <= 0) {
            await remove();
            return;
        }
        this.schedule(() => void remove().catch(() => undefined), delaySeconds * 1000);
    }
    async renameSpace(channelId, name) {
        await this.rest.patch(`/channels/${channelId}`, { body: { name } });
    }
    async publishPanel(input) {
        const { panel, categories } = input;
        const components = panel.style === "SELECT_MENU"
            ? [{
                    type: 1,
                    components: [{
                            type: 3,
                            custom_id: TICKET_CUSTOM_ID.select,
                            placeholder: panel.placeholder,
                            min_values: 1,
                            max_values: 1,
                            options: categories.map((category) => ({
                                label: category.name,
                                value: category.id,
                                ...(category.description ? { description: category.description } : {}),
                                ...(category.emoji ? { emoji: emojiObject(category.emoji) } : {}),
                            })),
                        }],
                }]
            : panelButtonRows(panel, categories).map((row) => ({
                type: 1,
                components: row.map((category) => button(`${TICKET_CUSTOM_ID.open}${category.id}`, category.name, category.buttonStyle, category.emoji)),
            }));
        const body = {
            embeds: [{
                    title: panel.title,
                    description: panel.description,
                    color: colorValue(panel.color),
                    ...(panel.imageUrl ? { image: { url: panel.imageUrl } } : {}),
                    ...(panel.footer ? { footer: { text: panel.footer } } : {}),
                }],
            components,
            allowed_mentions: { parse: [] },
        };
        if (panel.messageId) {
            try {
                await this.rest.patch(`/channels/${panel.channelId}/messages/${panel.messageId}`, { body });
                return { messageId: panel.messageId };
            }
            catch (error) {
                // A deleted channel cannot take a new post either. Anything else
                // (usually Unknown Message: the old panel was deleted) posts a fresh one.
                if (isMissingChannelError(error))
                    throw missingPanelChannel();
            }
        }
        try {
            const message = (await this.rest.post(`/channels/${panel.channelId}/messages`, { body }));
            return { messageId: message.id };
        }
        catch (error) {
            if (isMissingChannelError(error))
                throw missingPanelChannel();
            throw error;
        }
    }
    async deletePanelMessage(channelId, messageId) {
        await this.rest.delete(`/channels/${channelId}/messages/${messageId}`);
    }
    async postTranscript(input) {
        const message = (await this.rest.post(`/channels/${input.channelId}/messages`, {
            body: {
                embeds: [{ title: `Ticket #${input.ticket.number} transcript`, description: input.summary, color: colorValue("#5865F2") }],
                allowed_mentions: { parse: [] },
            },
            files: input.files.map(transcriptFile),
        }));
        return { messageId: message.id };
    }
    async directMessage(input) {
        try {
            const channel = (await this.rest.post("/users/@me/channels", { body: { recipient_id: input.userId } }));
            await this.rest.post(`/channels/${channel.id}/messages`, {
                body: {
                    ...input.message,
                    ...(input.feedbackTicketId
                        ? { components: [{ type: 1, components: [1, 2, 3, 4, 5].map((stars) => button(`${TICKET_CUSTOM_ID.rate}${input.feedbackTicketId}:${stars}`, `${stars}`, "SECONDARY", "⭐")) }] }
                        : {}),
                    allowed_mentions: { parse: [] },
                },
                ...(input.files?.length ? { files: input.files.map(transcriptFile) } : {}),
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async createStaffThread(input) {
        const thread = (await this.rest.post(`/channels/${input.parentChannelId}/threads`, {
            body: { name: input.name.slice(0, 100), type: CHANNEL_TYPE_PRIVATE_THREAD, invitable: false, auto_archive_duration: 10080 },
            reason: input.reason,
        }));
        // Only the roles are pinged: a pinged member would be pulled into the private thread.
        await this.rest.post(`/channels/${thread.id}/messages`, {
            body: { content: input.content, allowed_mentions: { parse: [], roles: [...input.mentionRoleIds] } },
        });
        return { threadId: thread.id };
    }
    async addThreadMember(threadId, userId) {
        await this.rest.put(`/channels/${threadId}/thread-members/${userId}`);
    }
    async setThreadArchived(threadId, archived) {
        await this.rest.patch(`/channels/${threadId}`, { body: { archived, locked: archived } });
    }
    async selfId() {
        if (!this.botUserId)
            this.botUserId = (await this.rest.get("/users/@me")).id;
        return this.botUserId;
    }
}
function button(customId, label, style, emojiText) {
    return {
        type: 2,
        style: BUTTON_STYLE[style],
        custom_id: customId,
        label: label.slice(0, 80),
        ...(emojiText ? { emoji: emojiObject(emojiText) } : {}),
    };
}
/**
 * Button rows for a BUTTONS panel: the owner's arrangement when set (unknown or
 * disabled reasons dropped, empty rows removed), otherwise five per row.
 * Offered reasons missing from the arrangement fill the remaining space.
 * Discord allows at most 5 rows of 5 buttons.
 */
export function panelButtonRows(panel, categories) {
    if (!panel.rows || panel.rows.length === 0)
        return chunk(categories, 5).slice(0, 5);
    const byId = new Map(categories.map((category) => [category.id, category]));
    const used = new Set();
    const rows = [];
    for (const ids of panel.rows) {
        const row = [];
        for (const id of ids) {
            const category = byId.get(id);
            if (!category || used.has(id) || row.length >= 5)
                continue;
            used.add(id);
            row.push(category);
        }
        if (row.length > 0)
            rows.push(row);
    }
    for (const category of categories) {
        if (used.has(category.id))
            continue;
        const open = rows.find((row) => row.length < 5);
        if (open)
            open.push(category);
        else
            rows.push([category]);
    }
    return rows.slice(0, 5);
}
function missingPanelChannel() {
    return new TicketError("INVALID_STATE", MISSING_PANEL_CHANNEL_MESSAGE);
}
function chunk(items, size) {
    const rows = [];
    for (let index = 0; index < items.length; index += size)
        rows.push(items.slice(index, index + size));
    return rows;
}
function transcriptFile(file) {
    return { name: file.fileName, data: Buffer.from(file.content, "utf8"), contentType: file.contentType ?? "text/plain; charset=utf-8" };
}
function defaultSchedule(callback, delayMs) {
    const timer = setTimeout(callback, delayMs);
    timer.unref?.();
}
/** Parses a unicode or custom emoji into a Discord emoji object. */
export const emoji = emojiObject;
//# sourceMappingURL=DiscordRestTicketGateway.js.map