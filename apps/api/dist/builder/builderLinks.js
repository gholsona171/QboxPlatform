import { LOG_EVENTS } from "@qbox/discord-community";
import { BuilderError } from "@qbox/server-builder";
import { MISSING_PANEL_CHANNEL_MESSAGE } from "@qbox/shared/discord-rest";
import { TicketError } from "@qbox/tickets";
const unique = (values) => [...new Set(values)];
/**
 * Saves a finished build into existing Qbox features. Each link loads the
 * feature's current settings and saves them back with only the builder's
 * changes, so everything else the owner configured is kept. Nothing is deleted.
 * Settings and panels that point at channels which no longer exist (the owner
 * deleted everything and rebuilt) are moved to the newly built equivalents, or
 * cleared when the build made none.
 */
export class ServiceBuilderLinks {
    services;
    options;
    constructor(services, options = {}) {
        this.services = services;
        this.options = options;
    }
    /** Asks Discord which channels exist; unknown when it cannot be asked. */
    async channelCheck(guildId) {
        const { listChannels } = this.options;
        if (!listChannels)
            return () => undefined;
        const existing = await listChannels(guildId).then((channels) => new Set(channels), () => undefined);
        if (!existing)
            return () => undefined;
        return (channelId) => (channelId === undefined ? undefined : existing.has(channelId));
    }
    async apply(link, ids) {
        switch (link) {
            case "moderation": return this.moderation(ids);
            case "verification": return this.verification(ids);
            case "tickets": return this.tickets(ids);
            case "applications": return this.applications(ids);
            case "staff": return this.staff(ids);
            case "levels": return this.levels(ids);
            case "birthdays": return this.birthdays(ids);
            case "fivem": return this.fivem(ids);
            case "voice-rooms": return this.voiceRooms(ids);
            case "welcome": return this.welcome(ids);
            case "server-logs": return this.serverLogs(ids);
            case "starboard": return this.starboard(ids);
            case "rules": return this.rules(ids);
            default: throw new BuilderError("INVALID_INPUT", "That feature cannot be connected.");
        }
    }
    async moderation(ids) {
        const { revision, ...current } = await this.services.moderation.settings(ids.guildId);
        const logChannelId = ids.channels["mod-log"];
        const protectedRoleIds = unique([...current.protectedRoleIds, ...ids.staffRoles.map((role) => role.id)]).slice(0, 25);
        await this.services.moderation.saveSettings({ ...current, ...(logChannelId ? { logChannelId } : {}), protectedRoleIds, expectedRevision: revision });
        return sentence("Moderation", [logChannelId && `log channel set to ${channel(ids, logChannelId)}`, ids.staffRoles.length > 0 && `${ids.staffRoles.length} staff roles protected`]);
    }
    async verification(ids) {
        const { revision, panelChannelId: _panelChannel, panelMessageId: _panelMessage, ...current } = await this.services.verification.settings(ids.guildId);
        const verifiedRoleIds = unique([...current.verifiedRoleIds, ...(ids.verifiedRoleId ? [ids.verifiedRoleId] : [])]).slice(0, 10);
        if (verifiedRoleIds.length === 0)
            throw new BuilderError("INVALID_STATE", "There is no Verified role to give, so verification was not set up.");
        const unverifiedRoleId = ids.unverifiedRoleId ?? current.unverifiedRoleId;
        const exists = await this.channelCheck(ids.guildId);
        const gone = (id) => exists(id) === false;
        const cleared = [];
        const keep = (label, id) => {
            if (!gone(id))
                return id;
            cleared.push(label);
            return undefined;
        };
        const channelId = ids.channels.verify ?? keep("verification channel", current.channelId);
        const logChannelId = ids.channels["mod-log"] ?? ids.channels["server-log"] ?? keep("log channel", current.logChannelId);
        const welcomeChannelId = keep("welcome channel", current.welcomeChannelId);
        await this.services.verification.saveSettings({
            ...current,
            enabled: true,
            verifiedRoleIds,
            unverifiedRoleId: unverifiedRoleId && !verifiedRoleIds.includes(unverifiedRoleId) ? unverifiedRoleId : undefined,
            channelId,
            logChannelId,
            welcomeChannelId,
            expectedRevision: revision,
        });
        const repairs = cleared.length ? ` The ${cleared.join(" and ")} no longer existed, so ${cleared.length === 1 ? "it was" : "they were"} cleared; choose ${cleared.length === 1 ? "a new one" : "new ones"} on the Verification page.` : "";
        let panel = "";
        if (channelId) {
            panel = await this.services.verification.publishPanel(ids.guildId).then(() => `, panel posted in ${channel(ids, channelId)}`, (error) => `, but the panel was not posted (${reason(error)})`);
        }
        return `Verification turned on with the ${verifiedRoleIds.map((id) => role(ids, id)).join(", ")} role${panel}. Existing members need to verify or be given the role.${repairs}`;
    }
    async tickets(ids) {
        const { tickets } = this.services;
        const { nextNumber: _next, revision, ...current } = await tickets.settings(ids.guildId);
        const exists = await this.channelCheck(ids.guildId);
        const gone = (id) => exists(id) === false;
        const parts = [];
        /** A setting that points at a deleted channel moves to the built one, or is cleared. */
        const repoint = (label, id, replacement) => {
            if (!gone(id))
                return id;
            parts.push(replacement ? `${label} moved to ${channel(ids, replacement)}` : `${label} cleared because its channel was deleted`);
            return replacement;
        };
        const transcripts = ids.channels["ticket-transcripts"];
        const builtCategory = ids.categories.tickets;
        const openCategory = repoint("open ticket category", current.openCategoryChannelId, builtCategory) ?? builtCategory;
        const closedCategory = repoint("closed ticket category", current.closedCategoryChannelId, undefined);
        const transcriptChannel = transcripts ?? repoint("transcript channel", current.transcriptChannelId, undefined);
        const logChannel = repoint("ticket log channel", current.logChannelId, transcripts) ?? transcripts;
        const staffIds = ids.staffRoles.map((role) => role.id);
        await tickets.saveSettings({
            ...current,
            enabled: current.enabled || current.mode === "CHANNEL",
            transcriptChannelId: transcriptChannel,
            logChannelId: logChannel,
            openCategoryChannelId: openCategory,
            closedCategoryChannelId: closedCategory,
            supportRoleIds: unique([...current.supportRoleIds, ...staffIds]).slice(0, 25),
            source: "SYSTEM",
            expectedRevision: revision,
        });
        if (transcripts)
            parts.push(`transcripts go to ${channel(ids, transcripts)}`);
        if (openCategory && openCategory === builtCategory && !gone(current.openCategoryChannelId))
            parts.push(`new tickets open in ${channel(ids, openCategory)}`);
        if (staffIds.length)
            parts.push("staff can answer tickets");
        const categories = await tickets.categories(ids.guildId);
        if (categories.length === 0) {
            await tickets.saveCategory({
                guildId: ids.guildId,
                name: "Support",
                description: "Get help from the team.",
                emoji: "🎫",
                buttonStyle: "PRIMARY",
                enabled: true,
                supportRoleIds: [],
                alertUserIds: [],
                defaultPriority: "NORMAL",
                questions: [],
                requiredRoleIds: [],
                ...(builtCategory ? { parentChannelId: builtCategory } : {}),
            });
            parts.push("a Support ticket type was added");
        }
        const staleReasons = categories.filter((category) => gone(category.parentChannelId));
        for (const category of staleReasons) {
            const { parentChannelId: _parent, ...rest } = category;
            await tickets.saveCategory({ ...rest, ...(builtCategory ? { parentChannelId: builtCategory } : {}) });
        }
        if (staleReasons.length > 0) {
            const count = `${staleReasons.length} ticket reason${staleReasons.length === 1 ? "" : "s"}`;
            parts.push(builtCategory ? `${count} now open in ${channel(ids, builtCategory)} (${staleReasons.length === 1 ? "its" : "their"} category was deleted)` : `${count} no longer point at a deleted category`);
        }
        const panelChannel = ids.channels["tickets-panel"];
        if (panelChannel)
            parts.push(await this.ticketPanel(ids, panelChannel, gone, exists));
        return sentence("Tickets", parts);
    }
    /**
     * Makes sure the built panel channel has a posted ticket panel: creates one
     * when there are none, posts a panel that was never posted, or moves the first
     * panel whose channel was deleted to the new channel and posts it there.
     */
    async ticketPanel(ids, panelChannel, gone, exists) {
        const { tickets } = this.services;
        const panels = await tickets.panels(ids.guildId);
        const where = channel(ids, panelChannel);
        const post = (saved, success, saving) => tickets.publishPanel(ids.guildId, saved.id).then(() => success, (error) => `${saving} but not posted (${reason(error)})`);
        if (panels.length === 0) {
            const saved = await tickets.savePanel({
                guildId: ids.guildId,
                name: "Support",
                channelId: panelChannel,
                title: "Need help?",
                description: "Click a button below to open a private ticket with the team.",
                color: "#5865F2",
                style: "BUTTONS",
                placeholder: "Choose a ticket type",
                categoryIds: [],
            });
            return post(saved, `panel posted in ${where}`, `panel saved for ${where}`);
        }
        let stale = panels.find((panel) => gone(panel.channelId));
        if (!stale && exists(panels[0]?.channelId) === undefined)
            stale = await this.probeTicketPanels(ids.guildId, panels, panelChannel);
        if (stale) {
            const saved = await tickets.savePanel({ ...panelInput(stale), channelId: panelChannel });
            return post(saved, `ticket panel moved to ${where} and posted`, `ticket panel moved to ${where}`);
        }
        const unpublished = panels.every((panel) => !panel.messageId) ? panels[0] : undefined;
        if (!unpublished)
            return "";
        const saved = await tickets.savePanel({ ...panelInput(unpublished), channelId: panelChannel });
        return post(saved, `panel posted in ${where}`, `panel saved for ${where}`);
    }
    /**
     * Without a channel list, re-posts each posted panel outside the new panel
     * channel until one fails because its channel is gone; that one is moved.
     */
    async probeTicketPanels(guildId, panels, panelChannel) {
        for (const panel of panels) {
            if (!panel.messageId || panel.channelId === panelChannel)
                continue;
            const missing = await this.services.tickets.publishPanel(guildId, panel.id).then(() => false, (error) => error instanceof TicketError && error.code === "INVALID_STATE" && error.message === MISSING_PANEL_CHANNEL_MESSAGE);
            if (missing)
                return panel;
        }
        return undefined;
    }
    async applications(ids) {
        const { applications } = this.services;
        const review = ids.channels["applications-review"];
        const staffIds = ids.staffRoles.map((role) => role.id);
        const forms = await applications.forms(ids.guildId);
        if (forms.length === 0)
            return `Applications: no forms yet. Choose ${review ? channel(ids, review) : "a review channel"} when you create one.`;
        const exists = await this.channelCheck(ids.guildId);
        const gone = (id) => exists(id) === false;
        let changed = 0;
        let moved = 0;
        let cleared = 0;
        for (const form of forms) {
            const stale = gone(form.reviewChannelId);
            const needsChannel = (!form.reviewChannelId || stale) && review !== undefined;
            const needsReviewers = form.reviewerRoleIds.length === 0 && staffIds.length > 0;
            if (!needsChannel && !needsReviewers && !stale)
                continue;
            const { id, revision, createdAt: _created, updatedAt: _updated, ...input } = form;
            await applications.saveForm({
                ...input,
                reviewChannelId: stale ? review : form.reviewChannelId ?? review,
                reviewerRoleIds: needsReviewers ? staffIds.slice(0, 25) : form.reviewerRoleIds,
                expectedRevision: revision,
            }, id);
            if (stale && review)
                moved += 1;
            else if (stale)
                cleared += 1;
            if (needsChannel || needsReviewers)
                changed += 1;
        }
        const summary = changed === 0 ? "Applications: every form already has a review channel and reviewers." : `Applications: ${changed} form${changed === 1 ? "" : "s"} now reviewed in ${review ? channel(ids, review) : "their channel"}${staffIds.length ? " by staff" : ""}.`;
        const repairs = [];
        if (moved > 0)
            repairs.push(`${plural(moved, "form")} had a deleted review channel and ${moved === 1 ? "was" : "were"} moved to ${channel(ids, review)}.`);
        if (cleared > 0)
            repairs.push(`${plural(cleared, "form")} had a deleted review channel; choose a new one on the Applications page.`);
        const stalePanels = (await applications.panels(ids.guildId)).filter((panel) => gone(panel.channelId));
        if (stalePanels.length > 0)
            repairs.push(`${plural(stalePanels.length, "application panel")} ${stalePanels.length === 1 ? "is" : "are"} in a deleted channel; pick a new channel for ${stalePanels.length === 1 ? "it" : "them"} and post again.`);
        return [summary, ...repairs].join(" ");
    }
    async staff(ids) {
        const { staff } = this.services;
        const { revision, rosterMessageId: _roster, ...current } = await staff.settings(ids.guildId);
        const logChannelId = ids.channels["staff-log"];
        if (logChannelId)
            await staff.saveSettings({ ...current, logChannelId, expectedRevision: revision });
        const ranks = await staff.ranks(ids.guildId);
        let created = 0;
        if (ranks.length === 0)
            for (const item of ids.staffRoles) {
                await staff.createRank(ids.guildId, { name: item.name, roleId: item.id, color: item.color });
                created += 1;
            }
        return sentence("Staff", [logChannelId && `log channel set to ${channel(ids, logChannelId)}`, created > 0 && `${created} ranks created from the staff roles`]);
    }
    async levels(ids) {
        const levelUpChannelId = this.required(ids, "level-up");
        const { revision, ...current } = await this.services.levels.settings(ids.guildId);
        await this.services.levels.saveSettings({ ...current, enabled: true, levelUpMode: "CHANNEL", levelUpChannelId, expectedRevision: revision });
        return `Levels turned on. Level-up messages go to ${channel(ids, levelUpChannelId)}.`;
    }
    async birthdays(ids) {
        const channelId = this.required(ids, "birthdays");
        const { revision, ...current } = await this.services.birthdays.settings(ids.guildId);
        await this.services.birthdays.saveSettings({ ...current, enabled: true, channelId, expectedRevision: revision });
        return `Birthdays turned on. Birthday messages go to ${channel(ids, channelId)}.`;
    }
    async fivem(ids) {
        const statusChannelId = ids.channels["fivem-status"];
        const alertChannelId = ids.channels["fivem-alerts"];
        const { revision, ...current } = await this.services.fivem.settings(ids.guildId);
        await this.services.fivem.saveSettings({
            ...current,
            ...(statusChannelId ? { statusChannelId } : {}),
            ...(alertChannelId ? { alertChannelId } : {}),
            expectedRevision: revision,
        });
        return sentence("FiveM", [
            statusChannelId && `status message in ${channel(ids, statusChannelId)}`,
            alertChannelId && `alerts in ${channel(ids, alertChannelId)}`,
            !current.serverAddress && "add your server address on the FiveM page",
        ]);
    }
    async voiceRooms(ids) {
        const channelId = this.required(ids, "voice-hub");
        const { voice } = this.services;
        const hubs = await voice.hubs(ids.guildId);
        if (hubs.some((hub) => hub.channelId === channelId))
            return `Voice Rooms: ${channel(ids, channelId)} is already a hub.`;
        if (hubs.length > 0)
            return "Voice Rooms: you already have a hub, so none was added.";
        const categoryId = ids.channelParents["voice-hub"];
        await voice.createHub(ids.guildId, {
            name: "Join to Create",
            enabled: true,
            channelId,
            ...(categoryId ? { categoryId } : {}),
            nameTemplate: "{user}'s room",
            userLimit: 0,
            bitrateKbps: 64,
            privateByDefault: false,
            deleteDelaySeconds: 0,
            allowedRoleIds: [],
        });
        const settings = await voice.settings(ids.guildId);
        return `Voice Rooms: joining ${channel(ids, channelId)} creates a room${settings.enabled ? "" : " once voice rooms are turned on"}.`;
    }
    async welcome(ids) {
        const channelId = this.required(ids, "welcome");
        const { community } = this.services;
        const existing = (await community.settings(ids.guildId)).welcome;
        await community.saveWelcomeGoodbye(existing
            ? { ...existing, channelId }
            : { guildId: ids.guildId, kind: "WELCOME", enabled: true, channelId, messageText: "Welcome to {server}, {user}! You are member #{memberCount}.", embedEnabled: false, thumbnailAvatar: true, directMessageEnabled: false });
        return `Welcome messages go to ${channel(ids, channelId)}.`;
    }
    async serverLogs(ids) {
        const channelId = this.required(ids, "server-log");
        const { community } = this.services;
        const existing = (await community.settings(ids.guildId)).logs;
        await community.saveLogs(existing
            ? { ...existing, destinations: { ...existing.destinations, all: channelId } }
            : { guildId: ids.guildId, enabled: true, events: [...LOG_EVENTS], destinations: { all: channelId }, ignoredChannels: [], ignoredRoles: [], ignoredUsers: [], includeBots: false, contentMode: "REDACTED", colors: {} });
        return `Server logs go to ${channel(ids, channelId)}.`;
    }
    async starboard(ids) {
        const channelId = this.required(ids, "starboard");
        const { community } = this.services;
        const existing = (await community.settings(ids.guildId)).starboard;
        await community.saveStarboard(existing
            ? { ...existing, destinationChannelId: channelId }
            : { guildId: ids.guildId, enabled: true, destinationChannelId: channelId, emoji: "⭐", threshold: 3, allowSelfStar: false, includeBotMessages: false, nsfw: "BLOCK", mode: "DENYLIST", channels: [], ignoredRoles: [] });
        return `Starred messages go to ${channel(ids, channelId)}.`;
    }
    async rules(ids) {
        const channelId = this.required(ids, "rules");
        const { community } = this.services;
        const existing = (await community.settings(ids.guildId)).rules;
        if (!existing)
            return `Rules are not set up yet. Choose ${channel(ids, channelId)} when you set them up under Discord Bot > Rules.`;
        const { messageId, ...rest } = existing;
        await community.saveRules({ ...rest, channelId, ...(messageId && existing.channelId === channelId ? { messageId } : {}), expectedRevision: existing.revision, source: "SYSTEM" });
        return `The rules message now belongs in ${channel(ids, channelId)}${existing.channelId === channelId ? "" : ". Post it again with /rules"}.`;
    }
    required(ids, purpose) {
        const id = ids.channels[purpose];
        if (!id)
            throw new BuilderError("INVALID_STATE", `The ${purpose} channel was not created, so this was skipped.`);
        return id;
    }
}
function channel(ids, id) {
    return `#${ids.names[id] ?? id}`;
}
function plural(count, noun) {
    return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
function role(ids, id) {
    return `@${ids.names[id] ?? id}`;
}
function reason(error) {
    return error instanceof Error ? error.message : "Discord refused the request";
}
function sentence(feature, parts) {
    const filled = parts.filter((part) => typeof part === "string" && part.length > 0);
    return filled.length ? `${feature}: ${filled.join(", ")}.` : `${feature}: nothing to change.`;
}
function panelInput(panel) {
    const { messageId: _message, publishedAt: _published, ...input } = panel;
    return input;
}
//# sourceMappingURL=builderLinks.js.map