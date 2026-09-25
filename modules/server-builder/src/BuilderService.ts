import { DISCORD_PERMISSION, colorValue } from "@qbox/shared/discord-rest";

import { BUILDER_TEMPLATES, generateBlueprint } from "./generator.js";
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
  DiscordOverwrite,
  ExistingChannel,
} from "./types.js";
import { BOT, BUILDER_LINKS, BUILDER_RUN_MODES, DISCORD_CHANNEL_TYPE, EVERYONE } from "./types.js";
import { BUILDER_LIMITS, BuilderError, normalizeBlueprint, requireSnowflake, summarize, validateAnswers, validateBlueprint } from "./validation.js";

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
}

export interface BuilderStartInput {
  readonly mode: BuilderRunMode;
  readonly links: readonly BuilderLink[];
}

export interface BuilderServiceOptions {
  readonly now?: () => Date;
  /** Runs a build in the background. Tests capture the task to await it. */
  readonly schedule?: (task: () => Promise<void>) => void;
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

  public constructor(
    private readonly repository: BuilderRepository,
    private readonly gateway?: BuilderGateway,
    private readonly links?: BuilderLinkPort,
    options: BuilderServiceOptions = {},
  ) {
    this.now = options.now ?? (() => new Date());
    this.schedule = options.schedule ?? ((task) => void task());
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
    return { draft, templates: BUILDER_TEMPLATES, limits: BUILDER_LIMITS, lastRun: runs[0], preflight };
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
    if (!preflight.ready) throw new BuilderError("INVALID_STATE", preflight.messages[0] ?? "Qbox cannot build in this server.");
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
    const reason = `Qbox server builder, started by ${run.startedByName}`.slice(0, 512);
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
        warnings.push("New roles could not be moved into rank order under the Qbox role. Drag them into place in Server Settings > Roles.");
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
    const findExisting = (name: string, types: readonly number[], parentId?: string): ExistingChannel | undefined => {
      if (!add) return undefined;
      const matches = existingChannels.filter((item) => item.name.toLowerCase() === name.toLowerCase() && types.includes(item.type));
      return matches.find((item) => item.parentId === parentId) ?? matches[0];
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
          const create = (type: BuilderChannelType) => gateway.createChannel(guildId, channelInput(channel, type, parentId, overwrites), reason);
          const note = (type: BuilderChannelType) => `Made as a ${type === "VOICE" ? "voice" : "text"} channel because ${channel.type.toLowerCase()} channels ${NEEDS_COMMUNITY.has(channel.type) ? "need Community turned on" : "could not be created"}.`;
          try {
            if (fallback && NEEDS_COMMUNITY.has(channel.type) && !bot.community) {
              id = await create(fallback);
              await record("CHANNEL", channel.key, channel.name, "CREATED", { discordId: id, note: note(fallback) });
            } else {
              try {
                id = await create(channel.type);
                await record("CHANNEL", channel.key, channel.name, "CREATED", { discordId: id, ...(parentId ? {} : { note: "Created outside a category because its category failed." }) });
              } catch (error) {
                if (!fallback) throw error;
                id = await create(fallback);
                await record("CHANNEL", channel.key, channel.name, "CREATED", { discordId: id, note: note(fallback) });
              }
            }
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

  private async removeCreated(run: BuilderRun, items: readonly BuilderRunItem[], gateway: BuilderGateway): Promise<void> {
    const reason = "Qbox server builder undo";
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

function channelInput(channel: BuilderChannel, type: BuilderChannelType, parentId: string | undefined, overwrites: readonly DiscordOverwrite[]) {
  const voice = VOICE_TYPES.has(type);
  return {
    name: channel.name,
    type: discordChannelType(type),
    overwrites,
    ...(parentId ? { parentId } : {}),
    ...(channel.nsfw ? { nsfw: true } : {}),
    ...(!voice && channel.topic ? { topic: channel.topic } : {}),
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
  if (!canManageRoles) messages.push("Qbox needs the Manage Roles permission to create roles.");
  if (!canManageChannels) messages.push("Qbox needs the Manage Channels permission to create channels.");
  if (bot.topRolePosition < bot.highestRolePosition)
    messages.push("The Qbox role is not at the top of the role list. New roles go under it, and Qbox can't manage roles above it. Drag it to the top in Server Settings > Roles.");
  if (!admin && canManageRoles && canManageChannels)
    messages.push("Qbox is not an administrator, so it can only give roles and channel permissions it has itself. Items it can't set are listed as failed.");
  if (!bot.community) messages.push("Community is off, so announcement, stage, and media channels will be made as text and voice channels.");
  return { ready: canManageRoles && canManageChannels, canManageRoles, canManageChannels, community: bot.community, messages };
}
