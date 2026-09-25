import { colorValue } from "@qbox/shared/discord-rest";
import { passthroughTemplates, type MessageTemplates, type OutgoingEmbed, type OutgoingMessage, type TemplateValues } from "@qbox/shared/messages";

import { SpamTracker, defaultAutomod, evaluateAutomod, formatDuration } from "./automod.js";
import type {
  AutomodMessage,
  AutomodViolation,
  CaseFilter,
  CaseType,
  ModerationCase,
  ModerationEmbed,
  ModerationGateway,
  ModerationRepository,
  ModerationSettings,
  ModerationSettingsInput,
  ModerationStats,
  ModerationTarget,
  Moderator,
} from "./types.js";
import { MAX_TIMEOUT_MINUTES } from "./types.js";
import { ModerationError, invalid, requireLength, requireRange, requireSnowflake, validateSettings } from "./validation.js";
import { BRAND } from "@qbox/shared/brand";

export interface ModerationActionInput {
  readonly guildId: string;
  readonly type: CaseType;
  readonly target: ModerationTarget;
  readonly moderator: Moderator;
  readonly reason?: string | undefined;
  /** Timeout length, or temporary ban length. Omit for permanent bans. */
  readonly durationMinutes?: number | undefined;
  /** Ban/softban: hours of the member's messages to delete (0-168). */
  readonly deleteMessageHours?: number | undefined;
  readonly evidence?: readonly string[] | undefined;
}

export interface MemberHistory {
  readonly cases: readonly ModerationCase[];
  readonly activeWarnings: number;
  readonly activeBan?: ModerationCase | undefined;
  readonly activeTimeout?: ModerationCase | undefined;
}

export interface ExternalAction {
  readonly guildId: string;
  readonly type: "BAN" | "UNBAN" | "KICK";
  readonly target: ModerationTarget;
  readonly moderatorId?: string | undefined;
  readonly moderatorName?: string | undefined;
  readonly reason?: string | undefined;
}

const COLORS: Readonly<Record<CaseType, string>> = {
  WARN: "#FEE75C",
  TIMEOUT: "#E67E22",
  UNTIMEOUT: "#57F287",
  KICK: "#E67E22",
  BAN: "#ED4245",
  UNBAN: "#57F287",
  SOFTBAN: "#ED4245",
  NOTE: "#5865F2",
};

const LABELS: Readonly<Record<CaseType, string>> = {
  WARN: "Warning",
  TIMEOUT: "Timeout",
  UNTIMEOUT: "Timeout removed",
  KICK: "Kick",
  BAN: "Ban",
  UNBAN: "Unban",
  SOFTBAN: "Softban",
  NOTE: "Note",
};

const QBOX: Moderator = { userId: "0", displayName: BRAND.name, source: "AUTOMOD" };
const DAY_MS = 86_400_000;

export function defaultModerationSettings(guildId: string): ModerationSettings {
  return {
    guildId,
    dmOnAction: true,
    dmIncludeModerator: false,
    requireReason: false,
    defaultTimeoutMinutes: 60,
    banDeleteMessageHours: 0,
    warningExpiryDays: 0,
    protectedRoleIds: [],
    escalation: [],
    automod: defaultAutomod(),
    recordExternalActions: true,
    revision: 0,
  };
}

export function caseLabel(type: CaseType): string {
  return LABELS[type];
}

/** Placeholder values shared by `moderation.warn-dm` and `moderation.case-log`. */
function caseValues(item: Pick<ModerationCase, "type" | "number" | "targetId" | "targetName" | "moderatorId" | "moderatorName" | "reason" | "durationMinutes" | "source">, server: string): TemplateValues {
  return {
    user: `<@${item.targetId}>`,
    username: item.targetName,
    moderator: item.moderatorId === "0" ? item.moderatorName : `<@${item.moderatorId}>`,
    caseNumber: item.number,
    action: caseLabel(item.type),
    duration: item.durationMinutes ? formatDuration(item.durationMinutes) : "",
    reason: item.reason ?? "No reason given",
    rule: item.source === "AUTOMOD" ? (/^Automod \((\w+)\)/.exec(item.reason ?? "")?.[1] ?? "") : "",
    server,
  };
}

/**
 * Moderation rules shared by the bot, the API, and automod.
 *
 * The caller checks permissions (warn, timeout, kick, ban, ...) before calling.
 * This service enforces role hierarchy, protected roles, reasons, and
 * durations, performs the Discord action, records a numbered case, DMs the
 * member, posts to the log channel, and applies warning escalation.
 */
export class ModerationService {
  private readonly spam = new SpamTracker();

  public constructor(
    private readonly repository: ModerationRepository,
    private readonly gateway?: ModerationGateway,
    private readonly now: () => Date = () => new Date(),
    private readonly templates: MessageTemplates = passthroughTemplates,
  ) {}

  public async settings(guildId: string): Promise<ModerationSettings> {
    requireSnowflake("guildId", guildId);
    const saved = await this.repository.getSettings(guildId);
    return saved ?? defaultModerationSettings(guildId);
  }

  public async saveSettings(input: ModerationSettingsInput): Promise<ModerationSettings> {
    validateSettings(input);
    return this.repository.saveSettings({
      ...input,
      escalation: [...input.escalation].sort((left, right) => left.warnings - right.warnings),
      automod: {
        ...input.automod,
        words: { ...input.automod.words, words: [...new Set(input.automod.words.words.map((word) => word.trim().toLowerCase()).filter(Boolean))] },
        links: { ...input.automod.links, allowedDomains: [...new Set(input.automod.links.allowedDomains.map((domain) => domain.trim().toLowerCase().replace(/^www\./, "")).filter(Boolean))] },
      },
    });
  }

  /** Performs a moderation action and records it as a case. */
  public async act(input: ModerationActionInput): Promise<ModerationCase> {
    const { guildId, type, target, moderator } = input;
    requireSnowflake("guildId", guildId);
    requireSnowflake("member", target.userId);
    const settings = await this.settings(guildId);
    const reason = input.reason?.trim() || undefined;
    if (reason !== undefined) requireLength("reason", reason, 1, 1000);
    if (!reason && settings.requireReason && moderator.source !== "AUTOMOD" && moderator.source !== "EXTERNAL")
      invalid("A reason is required on this server.");
    if (target.userId === moderator.userId) invalid("You cannot moderate yourself.");
    const duration = this.duration(type, input.durationMinutes, settings);
    const gateway = this.requireGateway();

    if (type !== "UNBAN" && type !== "NOTE") {
      const check = await gateway.checkHierarchy(guildId, moderator.source === "AUTOMOD" ? undefined : moderator.userId, target.userId);
      if (!check.allowed) throw new ModerationError("FORBIDDEN", check.reason ?? "You cannot moderate this member.");
      if (check.targetRoleIds.some((roleId) => settings.protectedRoleIds.includes(roleId)))
        throw new ModerationError("FORBIDDEN", "This member has a protected role and cannot be moderated here.");
      if (!check.targetIsMember && (type === "TIMEOUT" || type === "UNTIMEOUT" || type === "KICK"))
        throw new ModerationError("INVALID_STATE", "That user is not in the server.");
    }

    const auditReason = `${reason ?? "No reason given"} (by ${moderator.displayName}${moderator.source === "WEB" ? ` via ${BRAND.name} portal` : ""})`.slice(0, 512);
    const expiresAt = duration ? new Date(this.now().getTime() + duration * 60_000) : undefined;
    const number = await this.repository.allocateCaseNumber(guildId);

    let dmDelivered: boolean | undefined;
    const notify = type !== "NOTE" && type !== "UNBAN" && settings.dmOnAction;
    const dm = async () => {
      const server = await gateway.guildName(guildId).catch(() => "the server");
      const values = caseValues({ type, number, targetId: target.userId, targetName: target.displayName, moderatorId: moderator.userId, moderatorName: moderator.displayName, reason, durationMinutes: duration, source: moderator.source }, server);
      const message = await this.templates.apply(guildId, "moderation.warn-dm", values, { embeds: [this.dmEmbed(type, settings, moderator, reason, duration, number)] });
      return gateway.directMessage(target.userId, message).catch(() => false);
    };
    if (notify && (type === "KICK" || type === "BAN" || type === "SOFTBAN")) dmDelivered = await dm();

    switch (type) {
      case "TIMEOUT":
        await gateway.timeout(guildId, target.userId, expiresAt, auditReason);
        break;
      case "UNTIMEOUT":
        await gateway.timeout(guildId, target.userId, undefined, auditReason);
        break;
      case "KICK":
        await gateway.kick(guildId, target.userId, auditReason);
        break;
      case "BAN":
        await gateway.ban(guildId, target.userId, this.deleteSeconds(input.deleteMessageHours, settings), auditReason);
        break;
      case "SOFTBAN":
        await gateway.ban(guildId, target.userId, this.deleteSeconds(input.deleteMessageHours ?? 24, settings), auditReason);
        await gateway.unban(guildId, target.userId, `Softban release: ${auditReason}`.slice(0, 512));
        break;
      case "UNBAN":
        await gateway.unban(guildId, target.userId, auditReason);
        break;
      default:
        break;
    }
    if (notify && dmDelivered === undefined) dmDelivered = await dm();

    if (type === "UNBAN") await this.deactivate(guildId, target.userId, ["BAN"]);
    if (type === "UNTIMEOUT") await this.deactivate(guildId, target.userId, ["TIMEOUT"]);
    if (type === "BAN" || type === "TIMEOUT") await this.deactivate(guildId, target.userId, [type]);

    const created = await this.repository.createCase({
      guildId,
      number,
      type,
      targetId: target.userId,
      targetName: target.displayName,
      moderatorId: moderator.userId,
      moderatorName: moderator.displayName,
      ...(reason ? { reason } : {}),
      ...(duration ? { durationMinutes: duration } : {}),
      ...(expiresAt ? { expiresAt } : {}),
      active: type === "WARN" || type === "BAN" || type === "TIMEOUT",
      source: moderator.source,
      evidence: (input.evidence ?? []).slice(0, 10),
      ...(dmDelivered === undefined ? {} : { dmDelivered }),
    });
    const logged = await this.log(settings, created);
    if (type === "WARN") await this.escalate(settings, target);
    return logged;
  }

  /** Current and past cases for one member. */
  public async history(guildId: string, targetId: string): Promise<MemberHistory> {
    requireSnowflake("member", targetId);
    const settings = await this.settings(guildId);
    const cases = await this.repository.listCases({ guildId, targetId, limit: 200 });
    return {
      cases,
      activeWarnings: await this.repository.countActiveWarnings(guildId, targetId, this.warningCutoff(settings)),
      activeBan: cases.find((item) => item.type === "BAN" && item.active),
      activeTimeout: cases.find((item) => item.type === "TIMEOUT" && item.active && (!item.expiresAt || item.expiresAt > this.now())),
    };
  }

  public async getCase(guildId: string, number: number): Promise<ModerationCase> {
    requireSnowflake("guildId", guildId);
    const found = await this.repository.getCase(guildId, number);
    if (!found) throw new ModerationError("NOT_FOUND", `Case #${number} was not found.`);
    return found;
  }

  public async list(filter: CaseFilter): Promise<readonly ModerationCase[]> {
    requireSnowflake("guildId", filter.guildId);
    return this.repository.listCases({ ...filter, limit: Math.min(Math.max(filter.limit ?? 50, 1), 200) });
  }

  public async stats(guildId: string): Promise<ModerationStats> {
    requireSnowflake("guildId", guildId);
    return this.repository.stats(guildId, this.now());
  }

  public async updateReason(guildId: string, number: number, moderator: Moderator, reason: string): Promise<ModerationCase> {
    requireLength("reason", reason.trim(), 1, 1000);
    const found = await this.getCase(guildId, number);
    const updated = await this.repository.updateCase(found.id, { reason: reason.trim() });
    const settings = await this.settings(guildId);
    await this.post(settings, {
      title: `Case #${number} reason updated`,
      description: `**New reason:** ${reason.trim()}\nUpdated by <@${moderator.userId}>`,
      color: "#5865F2",
    });
    return updated;
  }

  public async addEvidence(guildId: string, number: number, url: string): Promise<ModerationCase> {
    if (!/^https:\/\/\S{1,1000}$/.test(url)) invalid("Evidence must be an https link.");
    const found = await this.getCase(guildId, number);
    if (found.evidence.length >= 10) invalid("A case can have at most 10 evidence links.");
    return this.repository.updateCase(found.id, { evidence: [...found.evidence, url] });
  }

  /**
   * Pardons a case: warnings stop counting, active timeouts are lifted, and
   * active bans are lifted in Discord.
   */
  public async revoke(guildId: string, number: number, moderator: Moderator, reason?: string): Promise<ModerationCase> {
    const found = await this.getCase(guildId, number);
    if (found.revokedAt) throw new ModerationError("INVALID_STATE", `Case #${number} is already pardoned.`);
    const text = reason?.trim() || undefined;
    if (text !== undefined) requireLength("reason", text, 1, 1000);
    const gateway = this.requireGateway();
    const audit = `Case #${number} pardoned by ${moderator.displayName}${text ? `: ${text}` : ""}`.slice(0, 512);
    if (found.type === "BAN" && found.active) await gateway.unban(guildId, found.targetId, audit).catch(() => undefined);
    if (found.type === "TIMEOUT" && found.active) await gateway.timeout(guildId, found.targetId, undefined, audit).catch(() => undefined);
    const updated = await this.repository.updateCase(found.id, {
      active: false,
      revokedAt: this.now(),
      revokedById: moderator.userId,
      ...(text ? { revokeReason: text } : {}),
    });
    await this.post(await this.settings(guildId), {
      title: `Case #${number} pardoned`,
      description: `${caseLabel(found.type)} for <@${found.targetId}> pardoned by <@${moderator.userId}>${text ? `\n**Reason:** ${text}` : ""}`,
      color: "#57F287",
    });
    return updated;
  }

  public async purge(guildId: string, channelId: string, count: number, moderator: Moderator, userId?: string): Promise<number> {
    requireSnowflake("channelId", channelId);
    requireRange("count", count, 1, 100);
    if (userId !== undefined) requireSnowflake("member", userId);
    const deleted = await this.requireGateway().purge(channelId, count, userId);
    await this.post(await this.settings(guildId), {
      title: "Messages purged",
      description: `<@${moderator.userId}> deleted ${deleted} message${deleted === 1 ? "" : "s"} in <#${channelId}>${userId ? ` from <@${userId}>` : ""}.`,
      color: "#E67E22",
    });
    return deleted;
  }

  public async lock(guildId: string, channelId: string, locked: boolean, moderator: Moderator, reason?: string): Promise<void> {
    requireSnowflake("channelId", channelId);
    await this.requireGateway().setLocked(guildId, channelId, locked, `${locked ? "Locked" : "Unlocked"} by ${moderator.displayName}${reason ? `: ${reason}` : ""}`.slice(0, 512));
    await this.post(await this.settings(guildId), {
      title: locked ? "Channel locked" : "Channel unlocked",
      description: `<#${channelId}> ${locked ? "locked" : "unlocked"} by <@${moderator.userId}>${reason ? `\n**Reason:** ${reason}` : ""}`,
      color: locked ? "#ED4245" : "#57F287",
    });
  }

  public async slowmode(guildId: string, channelId: string, seconds: number, moderator: Moderator): Promise<void> {
    requireSnowflake("channelId", channelId);
    requireRange("slowmode", seconds, 0, 21_600);
    await this.requireGateway().setSlowmode(channelId, seconds, `Slowmode set by ${moderator.displayName}`);
    await this.post(await this.settings(guildId), {
      title: "Slowmode changed",
      description: `<#${channelId}> slowmode ${seconds ? `set to ${seconds}s` : "turned off"} by <@${moderator.userId}>.`,
      color: "#5865F2",
    });
  }

  /** Checks a message against automod and applies the configured action. */
  public async handleMessage(message: AutomodMessage): Promise<AutomodViolation | undefined> {
    const settings = await this.settings(message.guildId);
    const violation = evaluateAutomod(settings.automod, message, this.spam);
    if (!violation) return undefined;
    const gateway = this.requireGateway();
    await gateway.deleteMessage(message.channelId, message.messageId, `Automod: ${violation.description}`).catch(() => undefined);
    const target = { userId: message.authorId, displayName: message.authorName };
    const reason = `Automod (${violation.rule}): ${violation.description}`;
    if (violation.action === "WARN") await this.act({ guildId: message.guildId, type: "WARN", target, moderator: QBOX, reason }).catch(() => undefined);
    else if (violation.action === "TIMEOUT")
      await this.act({ guildId: message.guildId, type: "TIMEOUT", target, moderator: QBOX, reason, durationMinutes: violation.timeoutMinutes }).catch(() => undefined);
    else
      await this.post(settings, {
        title: "Automod removed a message",
        description: `<@${message.authorId}> in <#${message.channelId}>\n**Rule:** ${violation.rule}\n${violation.description}`,
        color: "#FEE75C",
      });
    return violation;
  }

  /** Records a ban, unban, or kick done directly in Discord. */
  public async recordExternal(action: ExternalAction): Promise<ModerationCase | undefined> {
    const settings = await this.settings(action.guildId);
    if (!settings.recordExternalActions) return undefined;
    const number = await this.repository.allocateCaseNumber(action.guildId);
    if (action.type === "UNBAN") await this.deactivate(action.guildId, action.target.userId, ["BAN"]);
    const created = await this.repository.createCase({
      guildId: action.guildId,
      number,
      type: action.type,
      targetId: action.target.userId,
      targetName: action.target.displayName,
      moderatorId: action.moderatorId ?? "0",
      moderatorName: action.moderatorName ?? "Unknown (done in Discord)",
      ...(action.reason ? { reason: action.reason.slice(0, 1000) } : {}),
      active: action.type === "BAN",
      source: "EXTERNAL",
      evidence: [],
    });
    return this.log(settings, created);
  }

  /** Lifts expired temporary bans and closes expired timeouts. */
  public async sweepExpired(): Promise<{ readonly unbanned: number; readonly timeoutsEnded: number }> {
    const now = this.now();
    let unbanned = 0;
    let timeoutsEnded = 0;
    for (const expired of await this.repository.listExpired(["BAN", "TIMEOUT"], now)) {
      if (expired.type === "BAN") {
        try {
          await this.requireGateway().unban(expired.guildId, expired.targetId, `Temporary ban (case #${expired.number}) expired`);
        } catch {
          // Already unbanned in Discord; still close the case below.
        }
        await this.repository.updateCase(expired.id, { active: false });
        const number = await this.repository.allocateCaseNumber(expired.guildId);
        const created = await this.repository.createCase({
          guildId: expired.guildId,
          number,
          type: "UNBAN",
          targetId: expired.targetId,
          targetName: expired.targetName,
          moderatorId: QBOX.userId,
          moderatorName: QBOX.displayName,
          reason: `Temporary ban from case #${expired.number} expired.`,
          active: false,
          source: "AUTOMOD",
          evidence: [],
        });
        await this.log(await this.settings(expired.guildId), created);
        unbanned += 1;
      } else {
        await this.repository.updateCase(expired.id, { active: false });
        timeoutsEnded += 1;
      }
    }
    return { unbanned, timeoutsEnded };
  }

  private async escalate(settings: ModerationSettings, target: ModerationTarget): Promise<void> {
    if (settings.escalation.length === 0) return;
    const count = await this.repository.countActiveWarnings(settings.guildId, target.userId, this.warningCutoff(settings));
    const step = settings.escalation.find((item) => item.warnings === count);
    if (!step) return;
    await this.act({
      guildId: settings.guildId,
      type: step.action,
      target,
      moderator: QBOX,
      reason: `Automatic ${caseLabel(step.action).toLowerCase()} after ${count} warnings.`,
      ...(step.durationMinutes > 0 ? { durationMinutes: step.durationMinutes } : {}),
    }).catch(() => undefined);
  }

  private duration(type: CaseType, value: number | undefined, settings: ModerationSettings): number | undefined {
    if (type === "TIMEOUT") {
      const minutes = value ?? settings.defaultTimeoutMinutes;
      requireRange("timeout length (minutes)", minutes, 1, MAX_TIMEOUT_MINUTES);
      return minutes;
    }
    if (type === "BAN" && value !== undefined && value > 0) {
      requireRange("ban length (minutes)", value, 1, 525_600);
      return value;
    }
    return undefined;
  }

  private deleteSeconds(hours: number | undefined, settings: ModerationSettings): number {
    const value = hours ?? settings.banDeleteMessageHours;
    requireRange("delete message hours", value, 0, 168);
    return value * 3600;
  }

  private warningCutoff(settings: ModerationSettings): Date | undefined {
    return settings.warningExpiryDays > 0 ? new Date(this.now().getTime() - settings.warningExpiryDays * DAY_MS) : undefined;
  }

  private async deactivate(guildId: string, targetId: string, types: readonly CaseType[]): Promise<void> {
    for (const active of await this.repository.listCases({ guildId, targetId, types, active: true, limit: 50 }))
      await this.repository.updateCase(active.id, { active: false });
  }

  private dmEmbed(type: CaseType, settings: ModerationSettings, moderator: Moderator, reason: string | undefined, duration: number | undefined, number: number): OutgoingEmbed {
    const verb: Readonly<Record<CaseType, string>> = {
      WARN: "You received a warning",
      TIMEOUT: "You were timed out",
      UNTIMEOUT: "Your timeout was removed",
      KICK: "You were kicked",
      BAN: duration ? "You were temporarily banned" : "You were banned",
      UNBAN: "You were unbanned",
      SOFTBAN: "You were kicked and your recent messages were removed",
      NOTE: "Note",
    };
    return this.embed({
      title: verb[type],
      description: reason ? `**Reason:** ${reason}` : "No reason was given.",
      color: COLORS[type],
      fields: [
        ...(duration ? [{ name: "Length", value: formatDuration(duration), inline: true }] : []),
        ...(settings.dmIncludeModerator && moderator.source !== "AUTOMOD" ? [{ name: "Moderator", value: moderator.displayName, inline: true }] : []),
        ...(settings.appealMessage && (type === "BAN" || type === "KICK" || type === "SOFTBAN") ? [{ name: "Appeal", value: settings.appealMessage }] : []),
      ],
      footer: `Case #${number}`,
    });
  }

  /** A moderation embed as Discord embed JSON, the way the log channel shows it. */
  private embed(embed: ModerationEmbed): OutgoingEmbed {
    return {
      title: embed.title,
      description: embed.description,
      color: colorValue(embed.color),
      ...(embed.fields?.length ? { fields: embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })) } : {}),
      ...(embed.footer ? { footer: { text: embed.footer } } : {}),
      timestamp: this.now().toISOString(),
    };
  }

  private async log(settings: ModerationSettings, item: ModerationCase): Promise<ModerationCase> {
    if (!settings.logChannelId || !this.gateway) return item;
    const server = await this.gateway.guildName(item.guildId).catch(() => "the server");
    const fallback: OutgoingMessage = {
      embeds: [this.embed({
        title: `${caseLabel(item.type)} | Case #${item.number}`,
        description: [
          `**Member:** <@${item.targetId}> (${item.targetName})`,
          `**Moderator:** ${item.moderatorId === "0" ? item.moderatorName : `<@${item.moderatorId}>`}${item.source === "WEB" ? " via portal" : item.source === "AUTOMOD" ? " (automatic)" : item.source === "EXTERNAL" ? " (in Discord)" : ""}`,
          `**Reason:** ${item.reason ?? "No reason given"}`,
          ...(item.durationMinutes ? [`**Length:** ${formatDuration(item.durationMinutes)}`] : []),
          ...(item.expiresAt ? [`**Ends:** <t:${Math.floor(item.expiresAt.getTime() / 1000)}:R>`] : []),
          ...(item.dmDelivered === false ? ["_Could not DM the member._"] : []),
        ].join("\n"),
        color: COLORS[item.type],
        footer: `Member ID ${item.targetId}`,
      })],
    };
    const message = await this.templates.apply(item.guildId, "moderation.case-log", caseValues(item, server), fallback);
    const posted = await this.gateway.postMessage(settings.logChannelId, message).catch(() => undefined);
    return posted ? this.repository.updateCase(item.id, { logMessageId: posted.messageId }) : item;
  }

  private async post(settings: ModerationSettings, embed: ModerationEmbed): Promise<{ readonly messageId: string } | undefined> {
    if (!settings.logChannelId || !this.gateway) return undefined;
    return this.gateway.postEmbed(settings.logChannelId, embed).catch(() => undefined);
  }

  private requireGateway(): ModerationGateway {
    if (!this.gateway) throw new ModerationError("DEPENDENCY_UNAVAILABLE", "Discord is not connected.");
    return this.gateway;
  }
}
