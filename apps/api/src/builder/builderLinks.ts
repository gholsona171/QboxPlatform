import type { ApplicationService } from "@qbox/applications";
import type { BirthdayService } from "@qbox/birthdays";
import { LOG_EVENTS, type DiscordCommunityService } from "@qbox/discord-community";
import type { FivemService } from "@qbox/fivem";
import type { LevelService } from "@qbox/levels";
import type { ModerationService } from "@qbox/moderation";
import { BuilderError, type BuilderChannelPurpose, type BuilderLink, type BuilderLinkPort, type BuilderResolvedIds } from "@qbox/server-builder";
import type { StaffService } from "@qbox/staff";
import type { TicketService } from "@qbox/tickets";
import type { VerificationService } from "@qbox/verification";
import type { VoiceRoomService } from "@qbox/voice-rooms";

/** The feature services a build can connect, built with the same repositories as their API features. */
export interface BuilderLinkServices {
  readonly moderation: ModerationService;
  readonly verification: VerificationService;
  readonly tickets: TicketService;
  readonly applications: ApplicationService;
  readonly staff: StaffService;
  readonly levels: LevelService;
  readonly birthdays: BirthdayService;
  readonly fivem: FivemService;
  readonly voice: VoiceRoomService;
  readonly community: DiscordCommunityService;
}

const unique = (values: readonly string[]) => [...new Set(values)];

/**
 * Saves a finished build into existing Qbox features. Each link loads the
 * feature's current settings and saves them back with only the builder's
 * changes, so everything else the owner configured is kept. Nothing is deleted.
 */
export class ServiceBuilderLinks implements BuilderLinkPort {
  public constructor(private readonly services: BuilderLinkServices) {}

  public async apply(link: BuilderLink, ids: BuilderResolvedIds): Promise<string> {
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

  private async moderation(ids: BuilderResolvedIds): Promise<string> {
    const { revision, ...current } = await this.services.moderation.settings(ids.guildId);
    const logChannelId = ids.channels["mod-log"];
    const protectedRoleIds = unique([...current.protectedRoleIds, ...ids.staffRoles.map((role) => role.id)]).slice(0, 25);
    await this.services.moderation.saveSettings({ ...current, ...(logChannelId ? { logChannelId } : {}), protectedRoleIds, expectedRevision: revision });
    return sentence("Moderation", [logChannelId && `log channel set to ${channel(ids, logChannelId)}`, ids.staffRoles.length > 0 && `${ids.staffRoles.length} staff roles protected`]);
  }

  private async verification(ids: BuilderResolvedIds): Promise<string> {
    const { revision, panelChannelId: _panelChannel, panelMessageId: _panelMessage, ...current } = await this.services.verification.settings(ids.guildId);
    const verifiedRoleIds = unique([...current.verifiedRoleIds, ...(ids.verifiedRoleId ? [ids.verifiedRoleId] : [])]).slice(0, 10);
    if (verifiedRoleIds.length === 0) throw new BuilderError("INVALID_STATE", "There is no Verified role to give, so verification was not set up.");
    const unverifiedRoleId = ids.unverifiedRoleId ?? current.unverifiedRoleId;
    const channelId = ids.channels.verify ?? current.channelId;
    const logChannelId = ids.channels["mod-log"] ?? ids.channels["server-log"] ?? current.logChannelId;
    await this.services.verification.saveSettings({
      ...current,
      enabled: true,
      verifiedRoleIds,
      unverifiedRoleId: unverifiedRoleId && !verifiedRoleIds.includes(unverifiedRoleId) ? unverifiedRoleId : undefined,
      channelId,
      logChannelId,
      expectedRevision: revision,
    });
    let panel = "";
    if (channelId) {
      panel = await this.services.verification.publishPanel(ids.guildId).then(
        () => `, panel posted in ${channel(ids, channelId)}`,
        (error: unknown) => `, but the panel was not posted (${reason(error)})`,
      );
    }
    return `Verification turned on with the ${verifiedRoleIds.map((id) => role(ids, id)).join(", ")} role${panel}. Existing members need to verify or be given the role.`;
  }

  private async tickets(ids: BuilderResolvedIds): Promise<string> {
    const { tickets } = this.services;
    const { nextNumber: _next, revision, ...current } = await tickets.settings(ids.guildId);
    const transcripts = ids.channels["ticket-transcripts"];
    const openCategory = current.openCategoryChannelId ?? ids.categories.tickets;
    const staffIds = ids.staffRoles.map((role) => role.id);
    await tickets.saveSettings({
      ...current,
      enabled: current.enabled || current.mode === "CHANNEL",
      transcriptChannelId: transcripts ?? current.transcriptChannelId,
      logChannelId: current.logChannelId ?? transcripts,
      openCategoryChannelId: openCategory,
      supportRoleIds: unique([...current.supportRoleIds, ...staffIds]).slice(0, 25),
      source: "SYSTEM",
      expectedRevision: revision,
    });
    const parts: string[] = [];
    if (transcripts) parts.push(`transcripts go to ${channel(ids, transcripts)}`);
    if (openCategory && openCategory === ids.categories.tickets) parts.push(`new tickets open in ${channel(ids, openCategory)}`);
    if (staffIds.length) parts.push("staff can answer tickets");
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
        ...(ids.categories.tickets ? { parentChannelId: ids.categories.tickets } : {}),
      });
      parts.push("a Support ticket type was added");
    }
    const panelChannel = ids.channels["tickets-panel"];
    if (panelChannel) {
      const panels = await tickets.panels(ids.guildId);
      const unpublished = panels.length > 0 && panels.every((panel) => !panel.messageId) ? panels[0] : undefined;
      if (panels.length === 0 || unpublished) {
        const saved = unpublished
          ? await tickets.savePanel({ ...panelInput(unpublished), channelId: panelChannel })
          : await tickets.savePanel({
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
        parts.push(await tickets.publishPanel(ids.guildId, saved.id).then(
          () => `panel posted in ${channel(ids, panelChannel)}`,
          (error: unknown) => `panel saved for ${channel(ids, panelChannel)} but not posted (${reason(error)})`,
        ));
      }
    }
    return sentence("Tickets", parts);
  }

  private async applications(ids: BuilderResolvedIds): Promise<string> {
    const { applications } = this.services;
    const review = ids.channels["applications-review"];
    const staffIds = ids.staffRoles.map((role) => role.id);
    const forms = await applications.forms(ids.guildId);
    if (forms.length === 0) return `Applications: no forms yet. Choose ${review ? channel(ids, review) : "a review channel"} when you create one.`;
    let changed = 0;
    for (const form of forms) {
      const needsChannel = !form.reviewChannelId && review !== undefined;
      const needsReviewers = form.reviewerRoleIds.length === 0 && staffIds.length > 0;
      if (!needsChannel && !needsReviewers) continue;
      const { id, revision, createdAt: _created, updatedAt: _updated, ...input } = form;
      await applications.saveForm({
        ...input,
        reviewChannelId: form.reviewChannelId ?? review,
        reviewerRoleIds: needsReviewers ? staffIds.slice(0, 25) : form.reviewerRoleIds,
        expectedRevision: revision,
      }, id);
      changed += 1;
    }
    return changed === 0 ? "Applications: every form already has a review channel and reviewers." : `Applications: ${changed} form${changed === 1 ? "" : "s"} now reviewed in ${review ? channel(ids, review) : "their channel"}${staffIds.length ? " by staff" : ""}.`;
  }

  private async staff(ids: BuilderResolvedIds): Promise<string> {
    const { staff } = this.services;
    const { revision, rosterMessageId: _roster, ...current } = await staff.settings(ids.guildId);
    const logChannelId = ids.channels["staff-log"];
    if (logChannelId) await staff.saveSettings({ ...current, logChannelId, expectedRevision: revision });
    const ranks = await staff.ranks(ids.guildId);
    let created = 0;
    if (ranks.length === 0)
      for (const item of ids.staffRoles) {
        await staff.createRank(ids.guildId, { name: item.name, roleId: item.id, color: item.color });
        created += 1;
      }
    return sentence("Staff", [logChannelId && `log channel set to ${channel(ids, logChannelId)}`, created > 0 && `${created} ranks created from the staff roles`]);
  }

  private async levels(ids: BuilderResolvedIds): Promise<string> {
    const levelUpChannelId = this.required(ids, "level-up");
    const { revision, ...current } = await this.services.levels.settings(ids.guildId);
    await this.services.levels.saveSettings({ ...current, enabled: true, levelUpMode: "CHANNEL", levelUpChannelId, expectedRevision: revision });
    return `Levels turned on. Level-up messages go to ${channel(ids, levelUpChannelId)}.`;
  }

  private async birthdays(ids: BuilderResolvedIds): Promise<string> {
    const channelId = this.required(ids, "birthdays");
    const { revision, ...current } = await this.services.birthdays.settings(ids.guildId);
    await this.services.birthdays.saveSettings({ ...current, enabled: true, channelId, expectedRevision: revision });
    return `Birthdays turned on. Birthday messages go to ${channel(ids, channelId)}.`;
  }

  private async fivem(ids: BuilderResolvedIds): Promise<string> {
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

  private async voiceRooms(ids: BuilderResolvedIds): Promise<string> {
    const channelId = this.required(ids, "voice-hub");
    const { voice } = this.services;
    const hubs = await voice.hubs(ids.guildId);
    if (hubs.some((hub) => hub.channelId === channelId)) return `Voice Rooms: ${channel(ids, channelId)} is already a hub.`;
    if (hubs.length > 0) return "Voice Rooms: you already have a hub, so none was added.";
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

  private async welcome(ids: BuilderResolvedIds): Promise<string> {
    const channelId = this.required(ids, "welcome");
    const { community } = this.services;
    const existing = (await community.settings(ids.guildId)).welcome;
    await community.saveWelcomeGoodbye(existing
      ? { ...existing, channelId }
      : { guildId: ids.guildId, kind: "WELCOME", enabled: true, channelId, messageText: "Welcome to {server}, {user}! You are member #{memberCount}.", embedEnabled: false, thumbnailAvatar: true, directMessageEnabled: false });
    return `Welcome messages go to ${channel(ids, channelId)}.`;
  }

  private async serverLogs(ids: BuilderResolvedIds): Promise<string> {
    const channelId = this.required(ids, "server-log");
    const { community } = this.services;
    const existing = (await community.settings(ids.guildId)).logs;
    await community.saveLogs(existing
      ? { ...existing, destinations: { ...existing.destinations, all: channelId } }
      : { guildId: ids.guildId, enabled: true, events: [...LOG_EVENTS], destinations: { all: channelId }, ignoredChannels: [], ignoredRoles: [], ignoredUsers: [], includeBots: false, contentMode: "REDACTED", colors: {} });
    return `Server logs go to ${channel(ids, channelId)}.`;
  }

  private async starboard(ids: BuilderResolvedIds): Promise<string> {
    const channelId = this.required(ids, "starboard");
    const { community } = this.services;
    const existing = (await community.settings(ids.guildId)).starboard;
    await community.saveStarboard(existing
      ? { ...existing, destinationChannelId: channelId }
      : { guildId: ids.guildId, enabled: true, destinationChannelId: channelId, emoji: "⭐", threshold: 3, allowSelfStar: false, includeBotMessages: false, nsfw: "BLOCK", mode: "DENYLIST", channels: [], ignoredRoles: [] });
    return `Starred messages go to ${channel(ids, channelId)}.`;
  }

  private async rules(ids: BuilderResolvedIds): Promise<string> {
    const channelId = this.required(ids, "rules");
    const { community } = this.services;
    const existing = (await community.settings(ids.guildId)).rules;
    if (!existing) return `Rules are not set up yet. Choose ${channel(ids, channelId)} when you set them up under Discord Bot > Rules.`;
    const { messageId, ...rest } = existing;
    await community.saveRules({ ...rest, channelId, ...(messageId && existing.channelId === channelId ? { messageId } : {}), expectedRevision: existing.revision, source: "SYSTEM" });
    return `The rules message now belongs in ${channel(ids, channelId)}${existing.channelId === channelId ? "" : ". Post it again with /rules"}.`;
  }

  private required(ids: BuilderResolvedIds, purpose: BuilderChannelPurpose): string {
    const id = ids.channels[purpose];
    if (!id) throw new BuilderError("INVALID_STATE", `The ${purpose} channel was not created, so this was skipped.`);
    return id;
  }
}

function channel(ids: BuilderResolvedIds, id: string): string {
  return `#${ids.names[id] ?? id}`;
}

function role(ids: BuilderResolvedIds, id: string): string {
  return `@${ids.names[id] ?? id}`;
}

function reason(error: unknown): string {
  return error instanceof Error ? error.message : "Discord refused the request";
}

function sentence(feature: string, parts: readonly (string | false | undefined | "")[]): string {
  const filled = parts.filter((part): part is string => typeof part === "string" && part.length > 0);
  return filled.length ? `${feature}: ${filled.join(", ")}.` : `${feature}: nothing to change.`;
}

function panelInput<T extends { readonly messageId?: string | undefined; readonly publishedAt?: Date | undefined }>(panel: T): Omit<T, "messageId" | "publishedAt"> {
  const { messageId: _message, publishedAt: _published, ...input } = panel;
  return input;
}
