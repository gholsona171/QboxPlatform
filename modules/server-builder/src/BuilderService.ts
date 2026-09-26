import { DISCORD_PERMISSION, colorValue } from "@qbox/shared/discord-rest";

import { NO_DESIGNER, NO_DESIGN_ANSWER, answersFromDesign, applyDesign, parseDesignedBlueprint, type BlueprintDesigner } from "./BlueprintDesigner.js";
import { BUILDER_TEMPLATES, generateBlueprint, templateFor } from "./generator.js";
import { linkLabel, linkOptions } from "./links.js";
import { describeAccess, effectiveOverwrites, permissionBits } from "./permissions.js";
import type {
  BotStatus,
  BuilderAccess,
  BuilderAnswers,
  BuilderBlueprint,
  BuilderCategoryPurpose,
  BuilderChannel,
  BuilderChannelPurpose,
  BuilderChannelType,
  BuilderDraft,
  BuilderDraftInput,
  BuilderGateway,
  BuilderItemKind,
  BuilderItemStatus,
  BuilderLink,
  BuilderLinkOption,
  BuilderLinkPort,
  BuilderOverwrite,
  BuilderPreflight,
  BuilderRepository,
  BuilderResolvedIds,
  BuilderRun,
  BuilderRunDetail,
  BuilderRunItem,
  BuilderRunMode,
  BuilderStarter,
  BuilderSummary,
  BuilderTemplate,
  ChannelCreateInput,
  DiscordOverwrite,
  ExistingChannel,
} from "./types.js";
import { BOT, BUILDER_LINKS, BUILDER_RUN_MODES, DISCORD_CHANNEL_TYPE, EVERYONE } from "./types.js";
import { BUILDER_LIMITS, BuilderError, isForumType, normalizeBlueprint, plainChannelName, requireSnowflake, summarize, validateAnswers, validateBlueprint } from "./validation.js";
import { BRAND } from "@qbox/shared/brand";

/** A blueprint with its counts, warnings, access summary, and feature links. */
export interface BuilderPlan {
  readonly blueprint: BuilderBlueprint;
  readonly summary: BuilderSummary;
  readonly access: Readonly<Record<string, BuilderAccess>>;
  readonly links: readonly BuilderLinkOption[];
}

export interface BuilderDraftView extends BuilderPlan {
  readonly answers: BuilderAnswers;
  readonly revision: number;
  readonly updatedAt: Date;
}

export interface BuilderOverview {
  readonly draft?: BuilderDraftView | undefined;
  readonly templates: readonly BuilderTemplate[];
  readonly limits: typeof BUILDER_LIMITS;
  readonly lastRun?: BuilderRun | undefined;
  readonly preflight: BuilderPreflight;
  /** "Describe your server" can be used: an AI designer is configured. */
  readonly aiAvailable: boolean;
}

export interface BuilderStartInput {
  readonly mode: BuilderRunMode;
  readonly links: readonly BuilderLink[];
}

/** A draft made from a description, with the designer's plain summary of what it understood. */
export interface BuilderDesignResult {
  readonly draft: BuilderDraftView;
  readonly summary: string;
}

export interface BuilderServiceOptions {
  readonly now?: () => Date;
  /** Runs a build in the background. Tests capture the task to await it. */
  readonly schedule?: (task: () => Promise<void>) => void;
  /** Turns "Describe your server" text into answers and extras. Without one, describing is unavailable. */
  readonly designer?: BlueprintDesigner | undefined;
}

const FALLBACK: Readonly<Partial<Record<BuilderChannelType, BuilderChannelType>>> = { ANNOUNCEMENT: "TEXT", FORUM: "TEXT", MEDIA: "TEXT", STAGE: "VOICE" };
const NEEDS_COMMUNITY = new Set<BuilderChannelType>(["ANNOUNCEMENT", "STAGE", "MEDIA"]);
const VOICE_TYPES = new Set<BuilderChannelType>(["VOICE", "STAGE"]);
const INTERRUPTED = "The API restarted while this was running. Anything already created is listed below and can be undone.";

export function discordChannelType(type: BuilderChannelType): number {
  return DISCORD_CHANNEL_TYPE[type];
}

function messageOf(error: unknown): string {
  if (error instanceof BuilderError) return error.message;
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
  private readonly now: () => Date;
  private readonly schedule: (task: () => Promise<void>) => void;
  private readonly active = new Set<string>();
  private readonly designer: BlueprintDesigner | undefined;

  public constructor(
    private readonly repository: BuilderRepository,
    private readonly gateway?: BuilderGateway,
    private readonly links?: BuilderLinkPort,
    options: BuilderServiceOptions = {},
  ) {
    this.now = options.now ?? (() => new Date());
    this.schedule = options.schedule ?? ((task) => void task());
    this.designer = options.designer;
  }

  public templates(): readonly BuilderTemplate[] {
    return BUILDER_TEMPLATES;
  }

  public plan(blueprint: BuilderBlueprint): BuilderPlan {
    return { blueprint, summary: summarize(blueprint), access: describeAccess(blueprint), links: linkOptions(blueprint) };
  }

  /** Turns answers into a blueprint without saving it. */
  public async generate(answers: BuilderAnswers): Promise<BuilderPlan> {
    return this.plan(generateBlueprint(answers));
  }

  public async overview(guildId: string): Promise<BuilderOverview> {
    requireSnowflake("guildId", guildId);
    const [draft, runs, preflight] = await Promise.all([this.draft(guildId), this.repository.listRuns(guildId, 1), this.preflight(guildId).catch((error: unknown) => unavailablePreflight(messageOf(error)))]);
    return { draft, templates: BUILDER_TEMPLATES, limits: BUILDER_LIMITS, lastRun: runs[0], preflight, aiAvailable: this.designer !== undefined };
  }

  /**
   * "Describe your server": the AI designer turns the description into answers
   * and extras, the generator makes the blueprint, the extras are applied and
   * checked, and the result is saved as the draft. Nothing is built.
   */
  public async designFromPrompt(guildId: string, prompt: string, expectedRevision: number, updatedById?: string): Promise<BuilderDesignResult> {
    requireSnowflake("guildId", guildId);
    const text = prompt.trim();
    if (text.length < 1) throw new BuilderError("INVALID_INPUT", "Describe your server first.");
    if (text.length > BUILDER_LIMITS.description) throw new BuilderError("INVALID_INPUT", `Keep the description under ${BUILDER_LIMITS.description} characters.`);
    if (!this.designer) throw new BuilderError("DEPENDENCY_UNAVAILABLE", NO_DESIGNER);
    const current = await this.repository.getDraft(guildId);
    const base = current?.answers ?? templateFor("COMMUNITY").answers;
    let raw: unknown;
    try {
      raw = await this.designer.design(text, base);
    } catch (error) {
      if (error instanceof BuilderError) throw error;
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

  public async draft(guildId: string): Promise<BuilderDraftView | undefined> {
    requireSnowflake("guildId", guildId);
    const draft = await this.repository.getDraft(guildId);
    return draft ? this.view(draft) : undefined;
  }

  public async saveDraft(input: BuilderDraftInput): Promise<BuilderDraftView> {
    requireSnowflake("guildId", input.guildId);
    validateAnswers(input.answers);
    const blueprint = normalizeBlueprint(input.blueprint);
    validateBlueprint(blueprint);
    return this.view(await this.repository.saveDraft({ ...input, blueprint }));
  }

  /** Checks that Qbox can create roles and channels. */
  public async preflight(guildId: string): Promise<BuilderPreflight> {
    if (!this.gateway) return unavailablePreflight("Discord is not connected to the API right now.");
    return preflightFrom(await this.gateway.botStatus(guildId));
  }

  public async runs(guildId: string, limit = 25): Promise<readonly BuilderRun[]> {
    requireSnowflake("guildId", guildId);
    return this.repository.listRuns(guildId, Math.min(Math.max(limit, 1), 100));
  }

  public async lastRun(guildId: string): Promise<BuilderRunDetail | undefined> {
    const [run] = await this.runs(guildId, 1);
    return run ? { run, items: await this.repository.listItems(run.id) } : undefined;
  }

  public async run(guildId: string, id: string): Promise<BuilderRunDetail> {
    const run = await this.requireRun(guildId, id);
    return { run, items: await this.repository.listItems(run.id) };
  }

  /** Starts building the saved draft. Returns right away; poll the run for progress. */
  public async startRun(guildId: string, input: BuilderStartInput, starter: BuilderStarter): Promise<BuilderRun> {
    requireSnowflake("guildId", guildId);
    if (!BUILDER_RUN_MODES.includes(input.mode)) throw new BuilderError("INVALID_INPUT", "Choose how to build: add to your server or a fresh layout.");
    for (const link of input.links) if (!BUILDER_LINKS.includes(link)) throw new BuilderError("INVALID_INPUT", `"${link}" is not a feature the builder can connect.`);
    const gateway = this.requireGateway();
    const draft = await this.repository.getDraft(guildId);
    if (!draft) throw new BuilderError("INVALID_STATE", "Answer the questions and save a blueprint first.");
    validateBlueprint(draft.blueprint);
    const available = new Set(linkOptions(draft.blueprint).filter((option) => option.available).map((option) => option.link));
    const links = [...new Set(input.links)].filter((link) => available.has(link));
    if (links.length > 0 && !this.links) throw new BuilderError("DEPENDENCY_UNAVAILABLE", "Feature links are not available right now.");
    await this.requireIdle(guildId);
    const preflight = preflightFrom(await gateway.botStatus(guildId));
    if (!preflight.ready) throw new BuilderError("INVALID_STATE", preflight.messages[0] ?? `${BRAND.name} cannot build in this server.`);
    this.active.add(guildId);
    try {
      const { blueprint } = draft;
      const planned = blueprint.roles.length + blueprint.categories.reduce((sum, category) => sum + 1 + category.channels.length, 0) + links.length;
      const run = await this.repository.createRun({ guildId, mode: input.mode, links, planned, startedById: starter.userId, startedByName: starter.displayName });
      this.schedule(() => this.guarded(run, () => this.build(run, blueprint, gateway)));
      return run;
    } catch (error) {
      this.active.delete(guildId);
      throw error;
    }
  }

  /** Deletes only the roles and channels this run created. Runs in the background. */
  public async undo(guildId: string, id: string): Promise<BuilderRun> {
    const gateway = this.requireGateway();
    const run = await this.requireRun(guildId, id);
    if (run.status === "QUEUED" || run.status === "RUNNING") throw new BuilderError("INVALID_STATE", "Wait for this run to finish before undoing it.");
    if (run.status === "UNDONE") throw new BuilderError("INVALID_STATE", "This build was already undone.");
    const items = (await this.repository.listItems(run.id)).filter((item) => item.status === "CREATED" && item.kind !== "LINK" && item.discordId);
    if (items.length === 0) throw new BuilderError("INVALID_STATE", "This build did not create anything that can be removed.");
    await this.requireIdle(guildId);
    this.active.add(guildId);
    try {
      const updated = await this.repository.updateRun(run.id, { status: "RUNNING", error: null });
      this.schedule(() => this.guarded(run, () => this.removeCreated(run, items, gateway)));
      return updated;
    } catch (error) {
      this.active.delete(guildId);
      throw error;
    }
  }

  /** Marks runs left RUNNING by a restart as FAILED. Call once when the API starts. */
  public async recoverInterrupted(): Promise<number> {
    return this.repository.failActiveRuns(INTERRUPTED, this.now());
  }

  /* ---------- Build ---------- */

  private async build(run: BuilderRun, blueprint: BuilderBlueprint, gateway: BuilderGateway): Promise<void> {
    const { guildId } = run;
    const reason = `${BRAND.name} server builder, started by ${run.startedByName}`.slice(0, 512);
    const add = run.mode === "ADD";
    const counts = { done: 0, skipped: 0, failed: 0 };
    const warnings: string[] = [];
    const record = async (kind: BuilderItemKind, key: string, name: string, status: BuilderItemStatus, extra: { discordId?: string; error?: string; note?: string } = {}): Promise<void> => {
      await this.repository.addItem({ runId: run.id, kind, key, name, status, ...extra });
      if (status === "CREATED") counts.done += 1;
      else if (status === "SKIPPED") counts.skipped += 1;
      else counts.failed += 1;
      await this.repository.updateRun(run.id, { ...counts });
    };

    await this.repository.updateRun(run.id, { status: "RUNNING", startedAt: this.now() });
    const [existingRoles, existingChannels, bot] = await Promise.all([gateway.listRoles(guildId), gateway.listChannels(guildId), gateway.botStatus(guildId)]);
    const names: Record<string, string> = {};

    /* Roles, highest first. */
    const roleIds = new Map<string, string>();
    const created: string[] = [];
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
      } catch (error) {
        await record("ROLE", role.key, role.name, "FAILED", { error: messageOf(error) });
      }
    }
    if (created.length > 0) {
      try {
        const top = (await gateway.botStatus(guildId)).topRolePosition - 1;
        await gateway.setRolePositions(guildId, created.map((id, index) => ({ id, position: Math.max(1, top - index) })), reason);
      } catch {
        warnings.push(`New roles could not be moved into rank order under the ${BRAND.name} role (the bot's role). Drag them into place in Server Settings > Roles.`);
        await this.repository.updateRun(run.id, { warnings });
      }
    }

    const resolve = (overwrites: readonly BuilderOverwrite[]): DiscordOverwrite[] =>
      overwrites.flatMap((overwrite): DiscordOverwrite[] => {
        const allow = permissionBits(overwrite.allow);
        const deny = permissionBits(overwrite.deny);
        if (overwrite.target === EVERYONE) return [{ id: guildId, type: 0, allow, deny }];
        if (overwrite.target === BOT) return [{ id: bot.userId, type: 1, allow, deny }];
        const id = roleIds.get(overwrite.target);
        return id ? [{ id, type: 0, allow, deny }] : [];
      });
    /* Names match without their leading emoji, so "👋┃welcome" reuses an existing "welcome" and the other way around. */
    const findExisting = (name: string, types: readonly number[], parentId?: string): ExistingChannel | undefined => {
      if (!add) return undefined;
      const wanted = plainChannelName(name).toLowerCase();
      const matches = existingChannels.filter((item) => types.includes(item.type) && plainChannelName(item.name).toLowerCase() === wanted);
      const exact = matches.filter((item) => item.name.toLowerCase() === name.toLowerCase());
      return exact.find((item) => item.parentId === parentId) ?? matches.find((item) => item.parentId === parentId) ?? exact[0] ?? matches[0];
    };

    /* Categories. */
    const categoryIds = new Map<string, string>();
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
      } catch (error) {
        await record("CATEGORY", category.key, category.name, "FAILED", { error: messageOf(error) });
      }
    }

    /* Channels. */
    const channels: Partial<Record<BuilderChannelPurpose, string>> = {};
    const channelParents: Partial<Record<BuilderChannelPurpose, string>> = {};
    const categories: Partial<Record<BuilderCategoryPurpose, string>> = {};
    for (const category of blueprint.categories) {
      const parentId = categoryIds.get(category.key);
      if (category.purpose && parentId) categories[category.purpose] = parentId;
      for (const channel of category.channels) {
        const fallback = FALLBACK[channel.type];
        const existing = findExisting(channel.name, [channel.type, ...(fallback ? [fallback] : [])].map(discordChannelType), parentId);
        let id: string | undefined = existing?.id;
        if (existing) await record("CHANNEL", channel.key, channel.name, "SKIPPED", { discordId: existing.id, note: "Already in the server." });
        else {
          const overwrites = resolve(effectiveOverwrites(category, channel));
          const create = async (type: BuilderChannelType, note?: string) => ({ id: await gateway.createChannel(guildId, channelInput(channel, type, parentId, overwrites), reason), type, note });
          const note = (type: BuilderChannelType) => `Made as a ${type === "VOICE" ? "voice" : "text"} channel because ${channel.type.toLowerCase()} channels ${NEEDS_COMMUNITY.has(channel.type) ? "need Community turned on" : "could not be created"}.`;
          try {
            let made: { id: string; type: BuilderChannelType; note?: string | undefined };
            if (fallback && NEEDS_COMMUNITY.has(channel.type) && !bot.community) made = await create(fallback, note(fallback));
            else {
              try {
                made = await create(channel.type, parentId ? undefined : "Created outside a category because its category failed.");
              } catch (error) {
                if (!fallback) throw error;
                made = await create(fallback, note(fallback));
              }
            }
            id = made.id;
            const post = isForumType(made.type) ? await this.firstPost(channel, made.id, reason) : undefined;
            const notes = [made.note, post].filter(Boolean).join(" ");
            await record("CHANNEL", channel.key, channel.name, "CREATED", { discordId: id, ...(notes ? { note: notes } : {}) });
          } catch (error) {
            await record("CHANNEL", channel.key, channel.name, "FAILED", { error: messageOf(error) });
          }
        }
        if (id) {
          names[id] = channel.name;
          if (channel.purpose) {
            channels[channel.purpose] = id;
            if (parentId) channelParents[channel.purpose] = parentId;
          }
        }
      }
    }

    /* Feature links. */
    const ids: BuilderResolvedIds = {
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
        if (!this.links) throw new BuilderError("DEPENDENCY_UNAVAILABLE", "Feature links are not available right now.");
        const summary = await this.links.apply(link, ids);
        await record("LINK", link, linkLabel(link), "CREATED", { note: summary });
      } catch (error) {
        await record("LINK", link, linkLabel(link), "FAILED", { error: messageOf(error) });
      }
    }

    const status = counts.failed === 0 ? "SUCCEEDED" : counts.done + counts.skipped > 0 ? "PARTIAL" : "FAILED";
    await this.repository.updateRun(run.id, { ...counts, status, finishedAt: this.now(), ...(status === "FAILED" ? { error: "Nothing could be created. Check the errors below." } : {}) });
  }

  /** Creates (and pins) the first post in a new forum channel. Returns a plain note; a failure is a note too, since the channel exists. */
  private async firstPost(channel: BuilderChannel, channelId: string, reason: string): Promise<string | undefined> {
    const post = channel.forum?.firstPost;
    if (!post || !this.gateway) return undefined;
    let threadId: string;
    try {
      ({ threadId } = await this.gateway.createForumPost(channelId, { title: post.title, content: post.content }, reason));
    } catch (error) {
      return `First post could not be created: ${messageOf(error)}`;
    }
    if (!post.pin) return "First post created.";
    try {
      await this.gateway.pinForumPost(threadId, reason);
      return "First post pinned.";
    } catch (error) {
      return `First post created but could not be pinned: ${messageOf(error)}`;
    }
  }

  private async removeCreated(run: BuilderRun, items: readonly BuilderRunItem[], gateway: BuilderGateway): Promise<void> {
    const reason = `${BRAND.name} server builder undo`;
    const order: readonly BuilderItemKind[] = ["CHANNEL", "CATEGORY", "ROLE"];
    let remaining = 0;
    for (const kind of order)
      for (const item of items.filter((candidate) => candidate.kind === kind)) {
        const discordId = item.discordId as string;
        try {
          if (kind === "ROLE") await gateway.deleteRole(run.guildId, discordId, reason);
          else await gateway.deleteChannel(discordId, reason);
          await this.repository.updateItem(item.id, { status: "DELETED", error: null });
        } catch (error) {
          remaining += 1;
          await this.repository.updateItem(item.id, { error: `Could not delete: ${messageOf(error)}` });
        }
      }
    await this.repository.updateRun(run.id, remaining === 0
      ? { status: "UNDONE", undoneAt: this.now(), finishedAt: this.now(), error: null }
      : { status: "PARTIAL", finishedAt: this.now(), error: `${remaining} item${remaining === 1 ? "" : "s"} could not be removed. Try again, or delete them in Discord.` });
  }

  /** Runs a background task, marking the run FAILED if it throws, and frees the guild. */
  private async guarded(run: BuilderRun, task: () => Promise<void>): Promise<void> {
    try {
      await task();
    } catch (error) {
      await this.repository.updateRun(run.id, { status: "FAILED", error: messageOf(error), finishedAt: this.now() }).catch(() => undefined);
    } finally {
      this.active.delete(run.guildId);
    }
  }

  private async requireIdle(guildId: string): Promise<void> {
    if (this.active.has(guildId) || (await this.repository.findActiveRun(guildId)))
      throw new BuilderError("CONFLICT", "A build is already running. Wait for it to finish.");
  }

  private async requireRun(guildId: string, id: string): Promise<BuilderRun> {
    requireSnowflake("guildId", guildId);
    const run = await this.repository.getRun(guildId, id);
    if (!run) throw new BuilderError("NOT_FOUND", "That build was not found.");
    return run;
  }

  private requireGateway(): BuilderGateway {
    if (!this.gateway) throw new BuilderError("DEPENDENCY_UNAVAILABLE", "Discord is not connected to the API right now.");
    return this.gateway;
  }

  private view(draft: BuilderDraft): BuilderDraftView {
    return { ...this.plan(draft.blueprint), answers: draft.answers, revision: draft.revision, updatedAt: draft.updatedAt };
  }
}

function roleIdFor(blueprint: BuilderBlueprint, roleIds: ReadonlyMap<string, string>, purpose: "verified" | "unverified"): string | undefined {
  const role = blueprint.roles.find((item) => item.purpose === purpose);
  return role ? roleIds.get(role.key) : undefined;
}

function channelInput(channel: BuilderChannel, type: BuilderChannelType, parentId: string | undefined, overwrites: readonly DiscordOverwrite[]): ChannelCreateInput {
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

function unavailablePreflight(message: string): BuilderPreflight {
  return { ready: false, canManageRoles: false, canManageChannels: false, community: false, messages: [message] };
}

function preflightFrom(bot: BotStatus): BuilderPreflight {
  const admin = (bot.permissions & DISCORD_PERMISSION.administrator) !== 0n;
  const canManageRoles = admin || (bot.permissions & DISCORD_PERMISSION.manageRoles) !== 0n;
  const canManageChannels = admin || (bot.permissions & DISCORD_PERMISSION.manageChannels) !== 0n;
  const messages: string[] = [];
  if (!canManageRoles) messages.push(`${BRAND.name} needs the Manage Roles permission to create roles.`);
  if (!canManageChannels) messages.push(`${BRAND.name} needs the Manage Channels permission to create channels.`);
  if (bot.topRolePosition < bot.highestRolePosition)
    messages.push(`The ${BRAND.name} role (the bot's role) is not at the top of the role list. New roles go under it, and ${BRAND.name} can't manage roles above it. Drag it to the top in Server Settings > Roles.`);
  if (!admin && canManageRoles && canManageChannels)
    messages.push(`${BRAND.name} is not an administrator, so it can only give roles and channel permissions it has itself. Items it can't set are listed as failed.`);
  if (!bot.community) messages.push("Community is off, so announcement, stage, and media channels will be made as text and voice channels.");
  return { ready: canManageRoles && canManageChannels, canManageRoles, canManageChannels, community: bot.community, messages };
}
