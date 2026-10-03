import { DISCORD_PERMISSION, colorValue } from "@qbox/shared/discord-rest";
import { snapshotToBlueprint } from "./wipe.js";
import { NO_DESIGNER, NO_DESIGN_ANSWER, answersFromDesign, applyDesign, parseDesignedBlueprint } from "./BlueprintDesigner.js";
import { BUILDER_TEMPLATES, generateBlueprint, templateFor } from "./generator.js";
import { linkLabel, linkOptions } from "./links.js";
import { describeAccess, effectiveOverwrites, permissionBits } from "./permissions.js";
import { BOT, BUILDER_LINKS, BUILDER_START_MODES, DISCORD_CHANNEL_TYPE, DISCORD_COMMUNITY_CHANNEL_ERROR, EVERYONE } from "./types.js";
import { BUILDER_LIMITS, BuilderError, isForumType, normalizeBlueprint, plainChannelName, requireSnowflake, summarize, validateAnswers, validateBlueprint } from "./validation.js";
import { BRAND } from "@qbox/shared/brand";
const WIPE_NOT_ALLOWED = "Only the server owner or an administrator can wipe the server.";
const WIPE_RATE_MS = 10 * 60_000;
const DEFAULT_WIPE_INCLUDE = { channels: true, roles: true, emojis: false };
const FALLBACK = { ANNOUNCEMENT: "TEXT", FORUM: "TEXT", MEDIA: "TEXT", STAGE: "VOICE" };
const NEEDS_COMMUNITY = new Set(["ANNOUNCEMENT", "STAGE", "MEDIA"]);
const VOICE_TYPES = new Set(["VOICE", "STAGE"]);
const INTERRUPTED = "The API restarted while this was running. Anything already created is listed below and can be undone.";
export function discordChannelType(type) {
    return DISCORD_CHANNEL_TYPE[type];
}
function messageOf(error) {
    if (error instanceof BuilderError)
        return error.message;
    const text = error instanceof Error ? error.message : "";
    return (text || "Discord refused the request.").slice(0, 300);
}
/**
 * Server builder: questionnaire answers become a blueprint, the blueprint is
 * built in Discord (never deleting anything that already exists), and the
 * result is connected to Qbox features through the link port.
 *
 * Builds and undos run in the background; progress is saved after every item
 * so the portal can poll the run.
 */
export class BuilderService {
    repository;
    gateway;
    links;
    now;
    schedule;
    active = new Set();
    designer;
    onRunFinished;
    constructor(repository, gateway, links, options = {}) {
        this.repository = repository;
        this.gateway = gateway;
        this.links = links;
        this.now = options.now ?? (() => new Date());
        this.schedule = options.schedule ?? ((task) => void task());
        this.designer = options.designer;
        this.onRunFinished = options.onRunFinished;
    }
    templates() {
        return BUILDER_TEMPLATES;
    }
    plan(blueprint) {
        return { blueprint, summary: summarize(blueprint), access: describeAccess(blueprint), links: linkOptions(blueprint) };
    }
    /** Turns answers into a blueprint without saving it. */
    async generate(answers) {
        return this.plan(generateBlueprint(answers));
    }
    async overview(guildId, viewer, options = {}) {
        requireSnowflake("guildId", guildId);
        const [draft, runs, preflight, wipe] = await Promise.all([
            this.draft(guildId),
            this.repository.listRuns(guildId, 1),
            this.preflight(guildId).catch((error) => unavailablePreflight(messageOf(error))),
            this.wipeEligibility(guildId, viewer, options),
        ]);
        return { draft, templates: BUILDER_TEMPLATES, limits: BUILDER_LIMITS, lastRun: runs[0] ? withoutSnapshot(runs[0]) : undefined, preflight, aiAvailable: this.designer !== undefined, wipe };
    }
    /** Whether the viewer may wipe the server (owner, administrator, or platform owner). */
    async wipeEligibility(guildId, viewer, options = {}) {
        if (!this.gateway)
            return { allowed: false, reason: "Discord is not connected to the API right now." };
        if (!viewer)
            return { allowed: false, reason: WIPE_NOT_ALLOWED };
        const allowed = await this.isOwnerOrAdmin(guildId, viewer, options).catch(() => false);
        return { allowed, reason: allowed ? "" : WIPE_NOT_ALLOWED };
    }
    /**
     * "Describe your server": the AI designer turns the description into answers
     * and extras, the generator makes the blueprint, the extras are applied and
     * checked, and the result is saved as the draft. Nothing is built.
     */
    async designFromPrompt(guildId, prompt, expectedRevision, updatedById) {
        requireSnowflake("guildId", guildId);
        const text = prompt.trim();
        if (text.length < 1)
            throw new BuilderError("INVALID_INPUT", "Describe your server first.");
        if (text.length > BUILDER_LIMITS.description)
            throw new BuilderError("INVALID_INPUT", `Keep the description under ${BUILDER_LIMITS.description} characters.`);
        if (!this.designer)
            throw new BuilderError("DEPENDENCY_UNAVAILABLE", NO_DESIGNER);
        const current = await this.repository.getDraft(guildId);
        const base = current?.answers ?? templateFor("COMMUNITY").answers;
        let raw;
        try {
            raw = await this.designer.design(text, base);
        }
        catch (error) {
            if (error instanceof BuilderError)
                throw error;
            throw new BuilderError("DEPENDENCY_UNAVAILABLE", NO_DESIGN_ANSWER);
        }
        const design = parseDesignedBlueprint(raw);
        const answers = answersFromDesign(design, text);
        validateAnswers(answers);
        const applied = applyDesign(generateBlueprint(answers), design, answers);
        const blueprint = normalizeBlueprint(applied.blueprint);
        validateBlueprint(blueprint);
        const draft = await this.repository.saveDraft({ guildId, answers, blueprint, updatedById, expectedRevision });
        const notes = applied.dropped.length ? ` ${applied.dropped.join(" ")}` : "";
        return { draft: this.view(draft), summary: `${design.summary || "Blueprint designed from your description."}${notes}`.trim() };
    }
    async draft(guildId) {
        requireSnowflake("guildId", guildId);
        const draft = await this.repository.getDraft(guildId);
        return draft ? this.view(draft) : undefined;
    }
    async saveDraft(input) {
        requireSnowflake("guildId", input.guildId);
        validateAnswers(input.answers);
        const blueprint = normalizeBlueprint(input.blueprint);
        validateBlueprint(blueprint);
        return this.view(await this.repository.saveDraft({ ...input, blueprint }));
    }
    /** Checks that Qbox can create roles and channels. */
    async preflight(guildId) {
        if (!this.gateway)
            return unavailablePreflight("Discord is not connected to the API right now.");
        return preflightFrom(await this.gateway.botStatus(guildId));
    }
    async runs(guildId, limit = 25) {
        requireSnowflake("guildId", guildId);
        return (await this.repository.listRuns(guildId, Math.min(Math.max(limit, 1), 100))).map(withoutSnapshot);
    }
    async lastRun(guildId) {
        const [run] = await this.runs(guildId, 1);
        return run ? { run, items: await this.repository.listItems(run.id) } : undefined;
    }
    async run(guildId, id) {
        const run = await this.requireRun(guildId, id);
        return { run: withoutSnapshot(run), items: await this.repository.listItems(run.id) };
    }
    /** Starts building the saved draft. Returns right away; poll the run for progress. */
    async startRun(guildId, input, starter, options = {}) {
        requireSnowflake("guildId", guildId);
        if (!BUILDER_START_MODES.includes(input.mode))
            throw new BuilderError("INVALID_INPUT", "Choose how to build: add to your server, a fresh layout, or wipe first.");
        for (const link of input.links)
            if (!BUILDER_LINKS.includes(link))
                throw new BuilderError("INVALID_INPUT", `"${link}" is not a feature the builder can connect.`);
        const gateway = this.requireGateway();
        const draft = await this.repository.getDraft(guildId);
        if (!draft)
            throw new BuilderError("INVALID_STATE", "Answer the questions and save a blueprint first.");
        validateBlueprint(draft.blueprint);
        const available = new Set(linkOptions(draft.blueprint).filter((option) => option.available).map((option) => option.link));
        const links = [...new Set(input.links)].filter((link) => available.has(link));
        if (links.length > 0 && !this.links)
            throw new BuilderError("DEPENDENCY_UNAVAILABLE", "Feature links are not available right now.");
        const wipeFirst = input.mode === "WIPE_AND_BUILD";
        if (wipeFirst && !(await this.isOwnerOrAdmin(guildId, starter, options)))
            throw new BuilderError("FORBIDDEN", WIPE_NOT_ALLOWED);
        await this.requireIdle(guildId);
        const bot = await gateway.botStatus(guildId);
        const preflight = preflightFrom(bot);
        if (!preflight.ready)
            throw new BuilderError("INVALID_STATE", preflight.messages[0] ?? `${BRAND.name} cannot build in this server.`);
        const include = { ...DEFAULT_WIPE_INCLUDE, ...(input.include ?? {}) };
        let snapshot;
        let plannedWipe = 0;
        if (wipeFirst) {
            await this.requireWipeRate(guildId);
            const missing = wipeMissing(bot, include);
            if (missing.length > 0)
                throw new BuilderError("INVALID_STATE", missing[0]);
            const prepared = await this.prepareWipe(guildId, input.confirmName ?? "", gateway);
            snapshot = prepared.snapshot;
            plannedWipe = wipeItemCount(snapshot, include, bot.topRolePosition);
        }
        this.active.add(guildId);
        try {
            const { blueprint } = draft;
            const plannedBuild = blueprint.roles.length + blueprint.categories.reduce((sum, category) => sum + 1 + category.channels.length, 0) + links.length;
            const run = await this.repository.createRun({ guildId, mode: input.mode, links, planned: plannedWipe + plannedBuild, startedById: starter.userId, startedByName: starter.displayName, ...(snapshot ? { snapshot } : {}) });
            if (wipeFirst && snapshot) {
                const captured = snapshot;
                this.schedule(() => this.guarded(run, () => this.runWipeThenBuild(run, captured, include, blueprint, bot, gateway)));
            }
            else {
                this.schedule(() => this.guarded(run, () => this.runBuild(run, blueprint, gateway)));
            }
            return run;
        }
        catch (error) {
            this.active.delete(guildId);
            throw error;
        }
    }
    /** Starts a wipe of the whole server. Owner-, administrator-, or platform-owner-only. Returns right away; poll the run. */
    async startWipe(guildId, input, starter, options = {}) {
        requireSnowflake("guildId", guildId);
        const gateway = this.requireGateway();
        if (!(await this.isOwnerOrAdmin(guildId, starter, options)))
            throw new BuilderError("FORBIDDEN", WIPE_NOT_ALLOWED);
        const include = { ...DEFAULT_WIPE_INCLUDE, ...(input.include ?? {}) };
        await this.requireIdle(guildId);
        await this.requireWipeRate(guildId);
        const bot = await gateway.botStatus(guildId);
        const missing = wipeMissing(bot, include);
        if (missing.length > 0)
            throw new BuilderError("INVALID_STATE", missing[0]);
        const { snapshot } = await this.prepareWipe(guildId, input.confirmName, gateway);
        const planned = wipeItemCount(snapshot, include, bot.topRolePosition);
        this.active.add(guildId);
        try {
            const run = await this.repository.createRun({ guildId, mode: "WIPE", links: [], planned, startedById: starter.userId, startedByName: starter.displayName, snapshot });
            this.schedule(() => this.guarded(run, () => this.runWipe(run, snapshot, include, bot, gateway)));
            return run;
        }
        catch (error) {
            this.active.delete(guildId);
            throw error;
        }
    }
    /** Counts, the kept list, and any missing permissions for the wipe confirmation dialog. */
    async wipePreview(guildId) {
        requireSnowflake("guildId", guildId);
        const gateway = this.requireGateway();
        const [bot, layout, emojis, stickers] = await Promise.all([gateway.botStatus(guildId), gateway.readLayout(guildId), gateway.listEmojis(guildId), gateway.listStickers(guildId)]);
        const community = new Set([layout.rulesChannelId, layout.publicUpdatesChannelId].filter((id) => Boolean(id)));
        const nonCategory = layout.channels.filter((channel) => channel.type !== DISCORD_CHANNEL_TYPE.CATEGORY);
        const categories = layout.channels.filter((channel) => channel.type === DISCORD_CHANNEL_TYPE.CATEGORY);
        const deletableRoles = layout.roles.filter((role) => deletableRole(role, bot.topRolePosition));
        const keptRoles = layout.roles.filter((role) => role.name !== "@everyone" && role.name !== "@here" && !role.managed && role.position >= bot.topRolePosition);
        const kept = [
            ...keptRoles.map((role) => `Role "${role.name}" — above the ${BRAND.name} role. Move the ${BRAND.name} role to the top of Server Settings > Roles to remove it.`),
            ...nonCategory.filter((channel) => community.has(channel.id)).map((channel) => `#${channel.name} — Discord requires it for Community. Turn Community off in Server Settings to remove it.`),
        ];
        return {
            serverName: layout.name,
            channels: nonCategory.filter((channel) => !community.has(channel.id)).length,
            categories: categories.length,
            roles: deletableRoles.length,
            emojis: emojis.length,
            stickers: stickers.length,
            kept,
            community: layout.community,
            missing: wipeMissing(bot, { channels: true, roles: true, emojis: emojis.length > 0 || stickers.length > 0 }),
        };
    }
    /** Turns the layout saved with a wipe run back into the draft blueprint. Messages cannot be recovered. */
    async loadBlueprintFromRun(guildId, id, starter) {
        const run = await this.requireRun(guildId, id);
        if (!run.snapshot)
            throw new BuilderError("INVALID_STATE", "This run has no saved layout to load.");
        const { blueprint, notes } = snapshotToBlueprint(run.snapshot);
        const normalized = normalizeBlueprint(blueprint);
        validateBlueprint(normalized);
        const current = await this.repository.getDraft(guildId);
        const answers = current?.answers ?? templateFor("COMMUNITY").answers;
        const draft = await this.repository.saveDraft({ guildId, answers, blueprint: normalized, expectedRevision: current?.revision ?? 0, ...(starter?.userId ? { updatedById: starter.userId } : {}) });
        return { draft: this.view(draft), notes };
    }
    /** Deletes only the roles and channels this run created. Runs in the background. */
    async undo(guildId, id) {
        const gateway = this.requireGateway();
        const run = await this.requireRun(guildId, id);
        if (run.status === "QUEUED" || run.status === "RUNNING")
            throw new BuilderError("INVALID_STATE", "Wait for this run to finish before undoing it.");
        if (run.status === "UNDONE")
            throw new BuilderError("INVALID_STATE", "This build was already undone.");
        const items = (await this.repository.listItems(run.id)).filter((item) => item.status === "CREATED" && item.kind !== "LINK" && item.discordId);
        if (items.length === 0)
            throw new BuilderError("INVALID_STATE", "This build did not create anything that can be removed.");
        await this.requireIdle(guildId);
        this.active.add(guildId);
        try {
            const updated = await this.repository.updateRun(run.id, { status: "RUNNING", error: null });
            this.schedule(() => this.guarded(run, () => this.removeCreated(run, items, gateway)));
            return updated;
        }
        catch (error) {
            this.active.delete(guildId);
            throw error;
        }
    }
    /** Marks runs left RUNNING by a restart as FAILED. Call once when the API starts. */
    async recoverInterrupted() {
        return this.repository.failActiveRuns(INTERRUPTED, this.now());
    }
    /* ---------- Build ---------- */
    /** Builds ADD/FRESH: sets the run running, builds, and finalizes. */
    async runBuild(run, blueprint, gateway) {
        const counts = { done: 0, skipped: 0, failed: 0 };
        const warnings = [];
        await this.repository.updateRun(run.id, { status: "RUNNING", startedAt: this.now() });
        await this.build(run, blueprint, gateway, counts, warnings);
        await this.finalize(run, counts, "Nothing could be created. Check the errors below.");
    }
    /** Wipes the server, then builds the draft (Fresh) and connects the links, as one run. */
    async runWipeThenBuild(run, snapshot, include, blueprint, bot, gateway) {
        const counts = { done: 0, skipped: 0, failed: 0 };
        const warnings = [];
        await this.repository.updateRun(run.id, { status: "RUNNING", startedAt: this.now() });
        await this.doWipe(run, snapshot, include, bot, gateway, counts);
        await this.build(run, blueprint, gateway, counts, warnings);
        await this.finalize(run, counts, "Nothing could be changed. Check the errors below.");
    }
    /** Wipes the server. */
    async runWipe(run, snapshot, include, bot, gateway) {
        const counts = { done: 0, skipped: 0, failed: 0 };
        await this.repository.updateRun(run.id, { status: "RUNNING", startedAt: this.now() });
        await this.doWipe(run, snapshot, include, bot, gateway, counts);
        await this.finalize(run, counts, "Nothing could be deleted. Check the errors below.");
    }
    recorder(run, counts) {
        return async (kind, key, name, status, extra = {}) => {
            await this.repository.addItem({ runId: run.id, kind, key, name, status, ...extra });
            if (status === "CREATED" || status === "DELETED")
                counts.done += 1;
            else if (status === "SKIPPED" || status === "KEPT")
                counts.skipped += 1;
            else
                counts.failed += 1;
            await this.repository.updateRun(run.id, { done: counts.done, skipped: counts.skipped, failed: counts.failed });
        };
    }
    async finalize(run, counts, failMessage) {
        const status = counts.failed === 0 ? "SUCCEEDED" : counts.done + counts.skipped > 0 ? "PARTIAL" : "FAILED";
        await this.repository.updateRun(run.id, { ...counts, status, finishedAt: this.now(), ...(status === "FAILED" ? { error: failMessage } : {}) });
    }
    /** Deletes everything a wipe should: channels (children first), categories, roles (lowest first), then emojis and stickers. */
    async doWipe(run, snapshot, include, bot, gateway, counts) {
        const record = this.recorder(run, counts);
        const reason = `${BRAND.name} server wipe, started by ${run.startedByName}`.slice(0, 512);
        const community = new Set([snapshot.rulesChannelId, snapshot.publicUpdatesChannelId].filter((id) => Boolean(id)));
        const deleteChannel = async (kind, channel) => {
            if (community.has(channel.id)) {
                await record(kind, channel.id, channel.name, "KEPT", { discordId: channel.id, note: `Discord requires it for Community (turn Community off in Server Settings to remove it).` });
                return;
            }
            try {
                await gateway.deleteChannel(channel.id, reason);
                await record(kind, channel.id, channel.name, "DELETED", { discordId: channel.id });
            }
            catch (error) {
                if (isCommunityChannelError(error))
                    await record(kind, channel.id, channel.name, "KEPT", { discordId: channel.id, note: "Discord requires it for Community (turn Community off in Server Settings to remove it)." });
                else
                    await record(kind, channel.id, channel.name, "FAILED", { discordId: channel.id, error: messageOf(error) });
            }
        };
        if (include.channels) {
            const nonCategory = snapshot.channels.filter((channel) => channel.type !== DISCORD_CHANNEL_TYPE.CATEGORY);
            const categories = snapshot.channels.filter((channel) => channel.type === DISCORD_CHANNEL_TYPE.CATEGORY);
            for (const channel of nonCategory)
                await deleteChannel("CHANNEL", channel);
            for (const category of categories)
                await deleteChannel("CATEGORY", category);
        }
        if (include.roles) {
            const roles = [...snapshot.roles].sort((a, b) => a.position - b.position);
            for (const role of roles) {
                if (role.name === "@everyone" || role.name === "@here" || role.managed)
                    continue;
                if (role.position >= bot.topRolePosition) {
                    await record("ROLE", role.id, role.name, "KEPT", { discordId: role.id, note: `Above the ${BRAND.name} role. Move the ${BRAND.name} role to the top of Server Settings > Roles to remove it.` });
                    continue;
                }
                try {
                    await gateway.deleteRole(run.guildId, role.id, reason);
                    await record("ROLE", role.id, role.name, "DELETED", { discordId: role.id });
                }
                catch (error) {
                    await record("ROLE", role.id, role.name, "FAILED", { discordId: role.id, error: messageOf(error) });
                }
            }
        }
        if (include.emojis) {
            for (const emoji of snapshot.emojis) {
                try {
                    await gateway.deleteEmoji(run.guildId, emoji.id, reason);
                    await record("EMOJI", emoji.id, emoji.name, "DELETED", { discordId: emoji.id });
                }
                catch (error) {
                    await record("EMOJI", emoji.id, emoji.name, "FAILED", { discordId: emoji.id, error: messageOf(error) });
                }
            }
            for (const sticker of snapshot.stickers) {
                try {
                    await gateway.deleteSticker(run.guildId, sticker.id, reason);
                    await record("STICKER", sticker.id, sticker.name, "DELETED", { discordId: sticker.id });
                }
                catch (error) {
                    await record("STICKER", sticker.id, sticker.name, "FAILED", { discordId: sticker.id, error: messageOf(error) });
                }
            }
        }
    }
    /** Reads the layout, checks the typed name, and captures the snapshot for a wipe. */
    async prepareWipe(guildId, confirmName, gateway) {
        const [bot, layout, emojis, stickers] = await Promise.all([gateway.botStatus(guildId), gateway.readLayout(guildId), gateway.listEmojis(guildId), gateway.listStickers(guildId)]);
        if (confirmName !== layout.name)
            throw new BuilderError("INVALID_INPUT", "The server name did not match. Type it exactly (it is case-sensitive) to confirm.");
        const snapshot = {
            guildName: layout.name,
            botUserId: bot.userId,
            community: layout.community,
            ...(layout.rulesChannelId ? { rulesChannelId: layout.rulesChannelId } : {}),
            ...(layout.publicUpdatesChannelId ? { publicUpdatesChannelId: layout.publicUpdatesChannelId } : {}),
            roles: layout.roles,
            channels: layout.channels,
            emojis,
            stickers,
        };
        return { snapshot, layout };
    }
    /** Owner, administrator (Discord Administrator bit), or platform owner. */
    async isOwnerOrAdmin(guildId, viewer, options) {
        if (options.platformOwner)
            return true;
        if (!this.gateway)
            return false;
        const [bot, roles] = await Promise.all([this.gateway.botStatus(guildId), this.gateway.listRoles(guildId)]);
        if (bot.ownerId && bot.ownerId === viewer.userId)
            return true;
        const adminRoleIds = new Set(roles.filter((role) => hasAdministrator(role.permissions)).map((role) => role.id));
        if (adminRoleIds.has(guildId))
            return true;
        return (viewer.roleIds ?? []).some((roleId) => adminRoleIds.has(roleId));
    }
    async requireWipeRate(guildId) {
        const recent = await this.repository.listRuns(guildId, 25);
        const since = this.now().getTime() - WIPE_RATE_MS;
        if (recent.some((run) => (run.mode === "WIPE" || run.mode === "WIPE_AND_BUILD") && run.createdAt.getTime() > since))
            throw new BuilderError("LIMIT_REACHED", "A wipe was started in the last 10 minutes. Wait before starting another.");
    }
    async build(run, blueprint, gateway, counts, warnings) {
        const { guildId } = run;
        const reason = `${BRAND.name} server builder, started by ${run.startedByName}`.slice(0, 512);
        const add = run.mode === "ADD";
        const record = this.recorder(run, counts);
        const [existingRoles, existingChannels, bot] = await Promise.all([gateway.listRoles(guildId), gateway.listChannels(guildId), gateway.botStatus(guildId)]);
        const names = {};
        /* Roles, highest first. */
        const roleIds = new Map();
        const created = [];
        for (const role of blueprint.roles) {
            const existing = add ? existingRoles.find((item) => !item.managed && item.name.toLowerCase() === role.name.toLowerCase()) : undefined;
            if (existing) {
                roleIds.set(role.key, existing.id);
                names[existing.id] = role.name;
                await record("ROLE", role.key, role.name, "SKIPPED", { discordId: existing.id, note: "Already in the server." });
                continue;
            }
            try {
                const id = await gateway.createRole(guildId, { name: role.name, color: colorValue(role.color), hoist: role.hoist, mentionable: role.mentionable, permissions: permissionBits(role.permissions) }, reason);
                roleIds.set(role.key, id);
                names[id] = role.name;
                created.push(id);
                await record("ROLE", role.key, role.name, "CREATED", { discordId: id });
            }
            catch (error) {
                await record("ROLE", role.key, role.name, "FAILED", { error: messageOf(error) });
            }
        }
        if (created.length > 0) {
            try {
                const top = (await gateway.botStatus(guildId)).topRolePosition - 1;
                await gateway.setRolePositions(guildId, created.map((id, index) => ({ id, position: Math.max(1, top - index) })), reason);
            }
            catch {
                warnings.push(`New roles could not be moved into rank order under the ${BRAND.name} role (the bot's role). Drag them into place in Server Settings > Roles.`);
                await this.repository.updateRun(run.id, { warnings });
            }
        }
        const resolve = (overwrites) => overwrites.flatMap((overwrite) => {
            const allow = permissionBits(overwrite.allow);
            const deny = permissionBits(overwrite.deny);
            if (overwrite.target === EVERYONE)
                return [{ id: guildId, type: 0, allow, deny }];
            if (overwrite.target === BOT)
                return [{ id: bot.userId, type: 1, allow, deny }];
            const id = roleIds.get(overwrite.target);
            return id ? [{ id, type: 0, allow, deny }] : [];
        });
        /* Names match without their leading emoji, so "👋┃welcome" reuses an existing "welcome" and the other way around. */
        const findExisting = (name, types, parentId) => {
            if (!add)
                return undefined;
            const wanted = plainChannelName(name).toLowerCase();
            const matches = existingChannels.filter((item) => types.includes(item.type) && plainChannelName(item.name).toLowerCase() === wanted);
            const exact = matches.filter((item) => item.name.toLowerCase() === name.toLowerCase());
            return exact.find((item) => item.parentId === parentId) ?? matches.find((item) => item.parentId === parentId) ?? exact[0] ?? matches[0];
        };
        /* Categories. */
        const categoryIds = new Map();
        for (const category of blueprint.categories) {
            const existing = findExisting(category.name, [DISCORD_CHANNEL_TYPE.CATEGORY]);
            if (existing) {
                categoryIds.set(category.key, existing.id);
                names[existing.id] = category.name;
                await record("CATEGORY", category.key, category.name, "SKIPPED", { discordId: existing.id, note: "Already in the server." });
                continue;
            }
            try {
                const id = await gateway.createChannel(guildId, { name: category.name, type: DISCORD_CHANNEL_TYPE.CATEGORY, overwrites: resolve(category.overwrites) }, reason);
                categoryIds.set(category.key, id);
                names[id] = category.name;
                await record("CATEGORY", category.key, category.name, "CREATED", { discordId: id });
            }
            catch (error) {
                await record("CATEGORY", category.key, category.name, "FAILED", { error: messageOf(error) });
            }
        }
        /* Channels. */
        const channels = {};
        const channelParents = {};
        const categories = {};
        for (const category of blueprint.categories) {
            const parentId = categoryIds.get(category.key);
            if (category.purpose && parentId)
                categories[category.purpose] = parentId;
            for (const channel of category.channels) {
                const fallback = FALLBACK[channel.type];
                const existing = findExisting(channel.name, [channel.type, ...(fallback ? [fallback] : [])].map(discordChannelType), parentId);
                let id = existing?.id;
                if (existing)
                    await record("CHANNEL", channel.key, channel.name, "SKIPPED", { discordId: existing.id, note: "Already in the server." });
                else {
                    const overwrites = resolve(effectiveOverwrites(category, channel));
                    const create = async (type, note) => ({ id: await gateway.createChannel(guildId, channelInput(channel, type, parentId, overwrites), reason), type, note });
                    const note = (type) => `Made as a ${type === "VOICE" ? "voice" : "text"} channel because ${channel.type.toLowerCase()} channels ${NEEDS_COMMUNITY.has(channel.type) ? "need Community turned on" : "could not be created"}.`;
                    try {
                        let made;
                        if (fallback && NEEDS_COMMUNITY.has(channel.type) && !bot.community)
                            made = await create(fallback, note(fallback));
                        else {
                            try {
                                made = await create(channel.type, parentId ? undefined : "Created outside a category because its category failed.");
                            }
                            catch (error) {
                                if (!fallback)
                                    throw error;
                                made = await create(fallback, note(fallback));
                            }
                        }
                        id = made.id;
                        const post = isForumType(made.type) ? await this.firstPost(channel, made.id, reason) : undefined;
                        const notes = [made.note, post].filter(Boolean).join(" ");
                        await record("CHANNEL", channel.key, channel.name, "CREATED", { discordId: id, ...(notes ? { note: notes } : {}) });
                    }
                    catch (error) {
                        await record("CHANNEL", channel.key, channel.name, "FAILED", { error: messageOf(error) });
                    }
                }
                if (id) {
                    names[id] = channel.name;
                    if (channel.purpose) {
                        channels[channel.purpose] = id;
                        if (parentId)
                            channelParents[channel.purpose] = parentId;
                    }
                }
            }
        }
        /* Feature links. */
        const ids = {
            guildId,
            channels,
            categories,
            channelParents,
            staffRoles: blueprint.roles.flatMap((role) => {
                const id = role.purpose === "staff" ? roleIds.get(role.key) : undefined;
                return id ? [{ id, name: role.name, color: role.color }] : [];
            }),
            verifiedRoleId: roleIdFor(blueprint, roleIds, "verified"),
            unverifiedRoleId: roleIdFor(blueprint, roleIds, "unverified"),
            names,
        };
        for (const link of run.links) {
            try {
                if (!this.links)
                    throw new BuilderError("DEPENDENCY_UNAVAILABLE", "Feature links are not available right now.");
                const summary = await this.links.apply(link, ids);
                await record("LINK", link, linkLabel(link), "CREATED", { note: summary });
            }
            catch (error) {
                await record("LINK", link, linkLabel(link), "FAILED", { error: messageOf(error) });
            }
        }
    }
    /** Creates (and pins) the first post in a new forum channel. Returns a plain note; a failure is a note too, since the channel exists. */
    async firstPost(channel, channelId, reason) {
        const post = channel.forum?.firstPost;
        if (!post || !this.gateway)
            return undefined;
        let threadId;
        try {
            ({ threadId } = await this.gateway.createForumPost(channelId, { title: post.title, content: post.content }, reason));
        }
        catch (error) {
            return `First post could not be created: ${messageOf(error)}`;
        }
        if (!post.pin)
            return "First post created.";
        try {
            await this.gateway.pinForumPost(threadId, reason);
            return "First post pinned.";
        }
        catch (error) {
            return `First post created but could not be pinned: ${messageOf(error)}`;
        }
    }
    async removeCreated(run, items, gateway) {
        const reason = `${BRAND.name} server builder undo`;
        const order = ["CHANNEL", "CATEGORY", "ROLE"];
        let remaining = 0;
        for (const kind of order)
            for (const item of items.filter((candidate) => candidate.kind === kind)) {
                const discordId = item.discordId;
                try {
                    if (kind === "ROLE")
                        await gateway.deleteRole(run.guildId, discordId, reason);
                    else
                        await gateway.deleteChannel(discordId, reason);
                    await this.repository.updateItem(item.id, { status: "DELETED", error: null });
                }
                catch (error) {
                    remaining += 1;
                    await this.repository.updateItem(item.id, { error: `Could not delete: ${messageOf(error)}` });
                }
            }
        await this.repository.updateRun(run.id, remaining === 0
            ? { status: "UNDONE", undoneAt: this.now(), finishedAt: this.now(), error: null }
            : { status: "PARTIAL", finishedAt: this.now(), error: `${remaining} item${remaining === 1 ? "" : "s"} could not be removed. Try again, or delete them in Discord.` });
    }
    /** Runs a background task, marking the run FAILED if it throws, and frees the guild. */
    async guarded(run, task) {
        try {
            await task();
        }
        catch (error) {
            await this.repository.updateRun(run.id, { status: "FAILED", error: messageOf(error), finishedAt: this.now() }).catch(() => undefined);
        }
        finally {
            this.active.delete(run.guildId);
            try {
                this.onRunFinished?.(run.guildId);
            }
            catch {
                // A listener failure never changes the run's outcome.
            }
        }
    }
    async requireIdle(guildId) {
        if (this.active.has(guildId) || (await this.repository.findActiveRun(guildId)))
            throw new BuilderError("CONFLICT", "A build is already running. Wait for it to finish.");
    }
    async requireRun(guildId, id) {
        requireSnowflake("guildId", guildId);
        const run = await this.repository.getRun(guildId, id);
        if (!run)
            throw new BuilderError("NOT_FOUND", "That build was not found.");
        return run;
    }
    requireGateway() {
        if (!this.gateway)
            throw new BuilderError("DEPENDENCY_UNAVAILABLE", "Discord is not connected to the API right now.");
        return this.gateway;
    }
    view(draft) {
        return { ...this.plan(draft.blueprint), answers: draft.answers, revision: draft.revision, updatedAt: draft.updatedAt };
    }
}
/** Drops the (potentially large) wipe snapshot before a run is sent to the client; it is only used server side. */
function withoutSnapshot(run) {
    if (run.snapshot === undefined)
        return run;
    const { snapshot: _snapshot, ...rest } = run;
    return rest;
}
function roleIdFor(blueprint, roleIds, purpose) {
    const role = blueprint.roles.find((item) => item.purpose === purpose);
    return role ? roleIds.get(role.key) : undefined;
}
function channelInput(channel, type, parentId, overwrites) {
    const voice = VOICE_TYPES.has(type);
    const forum = isForumType(type) ? channel.forum : undefined;
    const topic = forum?.guidelines ?? channel.topic;
    return {
        name: channel.name,
        type: discordChannelType(type),
        overwrites,
        ...(parentId ? { parentId } : {}),
        ...(channel.nsfw ? { nsfw: true } : {}),
        ...(!voice && topic ? { topic } : {}),
        ...(forum?.tags.length ? { tags: forum.tags } : {}),
        ...(forum?.defaultReactionEmoji ? { defaultReactionEmoji: forum.defaultReactionEmoji } : {}),
        ...(!voice && channel.slowmodeSeconds > 0 ? { slowmodeSeconds: channel.slowmodeSeconds } : {}),
        ...(type === "VOICE" && channel.userLimit > 0 ? { userLimit: channel.userLimit } : {}),
    };
}
function unavailablePreflight(message) {
    return { ready: false, canManageRoles: false, canManageChannels: false, community: false, messages: [message] };
}
function preflightFrom(bot) {
    const admin = (bot.permissions & DISCORD_PERMISSION.administrator) !== 0n;
    const canManageRoles = admin || (bot.permissions & DISCORD_PERMISSION.manageRoles) !== 0n;
    const canManageChannels = admin || (bot.permissions & DISCORD_PERMISSION.manageChannels) !== 0n;
    const messages = [];
    if (!canManageRoles)
        messages.push(`${BRAND.name} needs the Manage Roles permission to create roles.`);
    if (!canManageChannels)
        messages.push(`${BRAND.name} needs the Manage Channels permission to create channels.`);
    if (bot.topRolePosition < bot.highestRolePosition)
        messages.push(`The ${BRAND.name} role (the bot's role) is not at the top of the role list. New roles go under it, and ${BRAND.name} can't manage roles above it. Drag it to the top in Server Settings > Roles.`);
    if (!admin && canManageRoles && canManageChannels)
        messages.push(`${BRAND.name} is not an administrator, so it can only give roles and channel permissions it has itself. Items it can't set are listed as failed.`);
    if (!bot.community)
        messages.push("Community is off, so announcement, stage, and media channels will be made as text and voice channels.");
    return { ready: canManageRoles && canManageChannels, canManageRoles, canManageChannels, community: bot.community, messages };
}
/** Whether a permission bitfield string carries the Administrator bit. */
function hasAdministrator(permissions) {
    if (!permissions || !/^[0-9]{1,30}$/.test(permissions))
        return false;
    try {
        return (BigInt(permissions) & DISCORD_PERMISSION.administrator) !== 0n;
    }
    catch {
        return false;
    }
}
/** A role a wipe can delete: not @everyone, not managed, below the bot's highest role. */
function deletableRole(role, botTopRolePosition) {
    return role.name !== "@everyone" && role.name !== "@here" && !role.managed && role.position < botTopRolePosition;
}
/** Bot permissions a wipe needs but is missing, given what it will delete. */
function wipeMissing(bot, include) {
    const admin = (bot.permissions & DISCORD_PERMISSION.administrator) !== 0n;
    const has = (bit) => admin || (bot.permissions & bit) !== 0n;
    const missing = [];
    if (include.channels && !has(DISCORD_PERMISSION.manageChannels))
        missing.push(`${BRAND.name} needs the Manage Channels permission to delete channels.`);
    if (include.roles && !has(DISCORD_PERMISSION.manageRoles))
        missing.push(`${BRAND.name} needs the Manage Roles permission to delete roles.`);
    if (include.emojis && !has(DISCORD_PERMISSION.manageGuildExpressions))
        missing.push(`${BRAND.name} needs the Manage Expressions permission to delete emojis and stickers.`);
    return missing;
}
/** How many items a wipe run will record (deleted plus kept), for the progress bar. */
function wipeItemCount(snapshot, include, botTopRolePosition) {
    let total = 0;
    if (include.channels)
        total += snapshot.channels.length;
    if (include.roles)
        total += snapshot.roles.filter((role) => deletableRole(role, botTopRolePosition) || (role.name !== "@everyone" && role.name !== "@here" && !role.managed && role.position >= botTopRolePosition)).length;
    if (include.emojis)
        total += snapshot.emojis.length + snapshot.stickers.length;
    return total;
}
/** Discord's error when a Community-required channel cannot be deleted while Community is on. */
function isCommunityChannelError(error) {
    if (!error || typeof error !== "object")
        return false;
    const code = Reflect.get(error, "code");
    if (code === DISCORD_COMMUNITY_CHANNEL_ERROR || code === String(DISCORD_COMMUNITY_CHANNEL_ERROR))
        return true;
    const message = error instanceof Error ? error.message : "";
    return message.includes(String(DISCORD_COMMUNITY_CHANNEL_ERROR));
}
//# sourceMappingURL=BuilderService.js.map