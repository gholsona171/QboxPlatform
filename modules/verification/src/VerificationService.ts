import { randomInt } from "node:crypto";

import type {
  AttemptFilter,
  CaptchaChallenge,
  GuildMemberInfo,
  MemberVerificationStatus,
  VerificationAttempt,
  VerificationEmbed,
  VerificationGateway,
  VerificationMember,
  VerificationOutcome,
  VerificationQuestion,
  VerificationRepository,
  VerificationResult,
  VerificationSettings,
  VerificationSettingsInput,
  VerificationStaff,
  VerificationStats,
} from "./types.js";
import { VerificationError, requireLength, requireSnowflake, validateSettings } from "./validation.js";
import { BRAND } from "@qbox/shared/brand";

const DAY_MS = 86_400_000;
const CAPTCHA_TTL_MS = 5 * 60_000;
/** No 0/O, 1/I/L, so the code is easy to read. */
const CAPTCHA_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CAPTCHA_LENGTH = 6;
const DISCORD_EPOCH = 1_420_070_400_000n;
const SWEEP_BATCH = 50;

const COLORS: Readonly<Record<VerificationResult | "FLAG", string>> = {
  PASSED: "#57F287",
  MANUAL: "#57F287",
  FAILED: "#FEE75C",
  DENIED_AGE: "#E67E22",
  KICKED: "#ED4245",
  REVOKED: "#ED4245",
  FLAG: "#E67E22",
};

export function defaultVerificationSettings(guildId: string): VerificationSettings {
  return {
    guildId,
    enabled: false,
    mode: "BUTTON",
    verifiedRoleIds: [],
    panel: {
      title: "Verify to join",
      description: "Click the button below to verify and get access to the rest of the server.",
      color: "#5865F2",
      buttonLabel: "Verify",
    },
    questions: [],
    minAccountAgeDays: 0,
    ageAction: "DENY",
    kickUnverifiedMinutes: 0,
    maxAttempts: 3,
    cooldownMinutes: 10,
    dmOnSuccess: false,
    revision: 0,
  };
}

/** When a Discord account was created, read from its snowflake ID. */
export function accountCreatedAt(userId: string): Date {
  return new Date(Number((BigInt(userId) >> 22n) + DISCORD_EPOCH));
}

/** Lowercase with single spaces, for comparing answers. */
export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Replaces {user} and {server}. */
export function fillTemplate(template: string, userId: string, server: string): string {
  return template.replaceAll("{user}", `<@${userId}>`).replaceAll("{server}", server);
}

/**
 * Member verification shared by the bot and the API.
 *
 * Members verify by clicking a button, typing a code, or answering questions.
 * The service checks the account age and the attempt cooldown, gives the
 * verified roles, removes the unverified role, records every attempt, and
 * kicks members who stay unverified too long. Callers check staff permissions.
 */
export class VerificationService {
  private readonly captchas = new Map<string, { readonly code: string; readonly expiresAt: number }>();

  public constructor(
    private readonly repository: VerificationRepository,
    private readonly gateway?: VerificationGateway,
    private readonly now: () => Date = () => new Date(),
  ) {}

  public async settings(guildId: string): Promise<VerificationSettings> {
    requireSnowflake("guildId", guildId);
    return (await this.repository.getSettings(guildId)) ?? defaultVerificationSettings(guildId);
  }

  public async saveSettings(input: VerificationSettingsInput): Promise<VerificationSettings> {
    const clean: VerificationSettingsInput = {
      ...input,
      panel: { ...input.panel, title: input.panel.title.trim(), description: input.panel.description.trim(), buttonLabel: input.panel.buttonLabel.trim() },
      questions: input.questions.map((question) => ({
        id: question.id,
        prompt: question.prompt.trim(),
        answers: [...new Set(question.answers.map(normalizeAnswer).filter(Boolean))],
      })),
    };
    validateSettings(clean);
    return this.repository.saveSettings(clean);
  }

  /** Posts the panel in the verification channel, or updates the one already there. */
  public async publishPanel(guildId: string): Promise<{ readonly channelId: string; readonly messageId: string }> {
    const settings = await this.settings(guildId);
    if (!settings.channelId) throw new VerificationError("INVALID_STATE", "Choose a verification channel in the settings first.");
    const existing = settings.panelChannelId === settings.channelId ? settings.panelMessageId : undefined;
    const { messageId } = await this.requireGateway().publishPanel(settings.channelId, settings.panel, existing);
    await this.repository.setPanelMessage(guildId, settings.channelId, messageId);
    return { channelId: settings.channelId, messageId };
  }

  /**
   * Checks that a member may try to verify right now. Throws when verification
   * is off, they are verified already, they are on cooldown, or their account
   * is too new (which may also kick them).
   */
  public async checkEligible(guildId: string, member: VerificationMember): Promise<VerificationSettings> {
    const settings = await this.settings(guildId);
    if (!settings.enabled) throw new VerificationError("INVALID_STATE", "Verification is turned off on this server.");
    if (isVerified(settings, member.roleIds)) throw new VerificationError("INVALID_STATE", "You are already verified.");
    await this.checkCooldown(settings, member.userId);
    if (this.tooNew(settings, member.userId) && settings.ageAction !== "FLAG") {
      const reason = `Account is younger than ${settings.minAccountAgeDays} days.`;
      if (settings.ageAction === "KICK") {
        await this.kickTooNew(settings, member, reason);
        throw new VerificationError("FORBIDDEN", "Your Discord account is too new for this server, so you were removed.");
      }
      await this.record(settings, member, "DENIED_AGE", reason);
      throw new VerificationError("FORBIDDEN", `Your Discord account is too new to verify here. Accounts must be at least ${settings.minAccountAgeDays} days old.`);
    }
    return settings;
  }

  /** BUTTON mode: verifies the member straight away. */
  public async verifyByButton(guildId: string, member: VerificationMember): Promise<VerificationOutcome> {
    const settings = await this.checkEligible(guildId, member);
    if (settings.mode !== "BUTTON") throw new VerificationError("INVALID_STATE", "Click Verify again to get your challenge.");
    return this.pass(settings, member);
  }

  /** CAPTCHA mode: creates a new code for the member to type back. */
  public async startCaptcha(guildId: string, member: VerificationMember): Promise<CaptchaChallenge> {
    const settings = await this.checkEligible(guildId, member);
    if (settings.mode !== "CAPTCHA") throw new VerificationError("INVALID_STATE", "This server does not use code verification.");
    const code = Array.from({ length: CAPTCHA_LENGTH }, () => CAPTCHA_ALPHABET[randomInt(CAPTCHA_ALPHABET.length)]).join("");
    const expiresAt = this.now().getTime() + CAPTCHA_TTL_MS;
    this.pruneCaptchas();
    this.captchas.set(`${guildId}:${member.userId}`, { code, expiresAt });
    return { code, display: code.split("").join(" "), expiresAt: new Date(expiresAt) };
  }

  public async submitCaptcha(guildId: string, member: VerificationMember, entered: string): Promise<VerificationOutcome> {
    const key = `${guildId}:${member.userId}`;
    const challenge = this.captchas.get(key);
    this.captchas.delete(key);
    if (!challenge || challenge.expiresAt < this.now().getTime())
      throw new VerificationError("INVALID_STATE", "Your code expired. Click Verify again to get a new one.");
    const settings = await this.checkEligible(guildId, member);
    if (entered.replace(/\s+/g, "").toUpperCase() !== challenge.code) return this.fail(settings, member, "Wrong code.", "That code was wrong.");
    return this.pass(settings, member);
  }

  /** QUESTION mode: the questions to show in the form. */
  public async questions(guildId: string, member: VerificationMember): Promise<readonly VerificationQuestion[]> {
    const settings = await this.checkEligible(guildId, member);
    if (settings.mode !== "QUESTION" || settings.questions.length === 0) throw new VerificationError("INVALID_STATE", "This server does not use question verification.");
    return settings.questions;
  }

  /** Every answer must match one of its question's accepted answers. */
  public async submitAnswers(guildId: string, member: VerificationMember, answers: Readonly<Record<string, string>>): Promise<VerificationOutcome> {
    const settings = await this.checkEligible(guildId, member);
    if (settings.mode !== "QUESTION") throw new VerificationError("INVALID_STATE", "This server does not use question verification.");
    const wrong = settings.questions.filter((question) => !question.answers.includes(normalizeAnswer(answers[question.id] ?? "")));
    if (wrong.length > 0)
      return this.fail(settings, member, `Wrong answer to: ${wrong.map((question) => question.prompt).join("; ")}`.slice(0, 500), wrong.length === 1 ? "One of your answers was wrong." : "Some of your answers were wrong.");
    return this.pass(settings, member);
  }

  /** Staff verify a member, skipping the challenge and the account age check. */
  public async manualVerify(guildId: string, userId: string, staff: VerificationStaff, reason?: string): Promise<VerificationAttempt> {
    requireSnowflake("member", userId);
    const text = cleanReason(reason);
    const settings = await this.settings(guildId);
    if (settings.verifiedRoleIds.length === 0) throw new VerificationError("INVALID_STATE", "Choose a verified role in the verification settings first.");
    const member = await this.requireMember(guildId, userId);
    if (isVerified(settings, member.roleIds)) throw new VerificationError("INVALID_STATE", `${member.displayName} is already verified.`);
    return this.grant(settings, member, "MANUAL", text ?? `Verified by ${staff.displayName}`, staff);
  }

  /** Staff remove a member's verification: verified roles off, unverified role back on. */
  public async unverify(guildId: string, userId: string, staff: VerificationStaff, reason?: string): Promise<VerificationAttempt> {
    requireSnowflake("member", userId);
    const text = cleanReason(reason);
    const settings = await this.settings(guildId);
    const member = await this.requireMember(guildId, userId);
    const held = settings.verifiedRoleIds.filter((roleId) => member.roleIds.includes(roleId));
    if (held.length === 0) throw new VerificationError("INVALID_STATE", `${member.displayName} is not verified.`);
    const gateway = this.requireGateway();
    const audit = `Verification removed by ${staff.displayName}`.slice(0, 512);
    await this.roleChange(async () => {
      for (const roleId of held) await gateway.removeRole(guildId, userId, roleId, audit);
      if (settings.unverifiedRoleId) await gateway.addRole(guildId, userId, settings.unverifiedRoleId, audit);
    });
    await this.repository.upsertPending({ guildId, userId, joinedAt: this.now(), flagged: false });
    const attempt = await this.record(settings, member, "REVOKED", text ?? `Unverified by ${staff.displayName}`, staff);
    await this.log(settings, {
      title: "Verification removed",
      description: `<@${userId}> (${member.displayName}) was unverified by <@${staff.userId}>${text ? `\n**Reason:** ${text}` : ""}`,
      color: COLORS.REVOKED,
    });
    return attempt;
  }

  public async status(guildId: string, userId: string): Promise<MemberVerificationStatus> {
    requireSnowflake("member", userId);
    const settings = await this.settings(guildId);
    const member = await this.requireGateway().member(guildId, userId);
    const [pending, attempts] = await Promise.all([this.repository.getPending(guildId, userId), this.repository.listAttempts({ guildId, userId, limit: 10 })]);
    return {
      userId,
      displayName: member?.displayName ?? attempts[0]?.userName ?? userId,
      inServer: member !== undefined,
      verified: member !== undefined && isVerified(settings, member.roleIds),
      accountCreatedAt: accountCreatedAt(userId),
      ...(pending ? { pending } : {}),
      attempts,
    };
  }

  public async attempts(filter: AttemptFilter): Promise<readonly VerificationAttempt[]> {
    requireSnowflake("guildId", filter.guildId);
    if (filter.userId !== undefined) requireSnowflake("member", filter.userId);
    return this.repository.listAttempts({ ...filter, limit: Math.min(Math.max(filter.limit ?? 50, 1), 200) });
  }

  public async stats(guildId: string): Promise<VerificationStats> {
    requireSnowflake("guildId", guildId);
    return this.repository.stats(guildId, new Date(this.now().getTime() - DAY_MS));
  }

  /** Gives the unverified role and checks the account age when a member joins. */
  public async memberJoined(guildId: string, member: VerificationMember): Promise<void> {
    const settings = await this.settings(guildId);
    if (!settings.enabled) return;
    const gateway = this.requireGateway();
    const tooNew = this.tooNew(settings, member.userId);
    if (tooNew && settings.ageAction === "KICK") {
      await this.kickTooNew(settings, member, `Account is younger than ${settings.minAccountAgeDays} days.`);
      return;
    }
    if (settings.unverifiedRoleId)
      await gateway.addRole(guildId, member.userId, settings.unverifiedRoleId, "Joined and is not verified yet").catch(() =>
        this.log(settings, { title: "Could not add the unverified role", description: `<@${member.userId}> joined but I could not give them <@&${settings.unverifiedRoleId}>. Check that the ${BRAND.name} role (the bot's role) is above it.`, color: COLORS.FAILED }));
    await this.repository.upsertPending({ guildId, userId: member.userId, joinedAt: this.now(), flagged: tooNew });
    if (!tooNew) return;
    const created = Math.floor(accountCreatedAt(member.userId).getTime() / 1000);
    if (settings.ageAction === "DENY") await this.record(settings, member, "DENIED_AGE", `Joined with an account younger than ${settings.minAccountAgeDays} days.`);
    await this.log(settings, {
      title: settings.ageAction === "FLAG" ? "New account flagged" : "New account cannot verify",
      description: `<@${member.userId}> (${member.displayName}) joined with an account created <t:${created}:R>. The minimum is ${settings.minAccountAgeDays} days.`,
      color: COLORS.FLAG,
    });
  }

  public async memberLeft(guildId: string, userId: string): Promise<void> {
    await this.repository.deletePending(guildId, userId);
  }

  /** Kicks members who have not verified within the configured time. */
  public async sweepUnverified(): Promise<{ readonly kicked: number }> {
    let kicked = 0;
    const now = this.now();
    for (const settings of await this.repository.listKickEnabled()) {
      if (!settings.enabled || settings.kickUnverifiedMinutes === 0) continue;
      const before = new Date(now.getTime() - settings.kickUnverifiedMinutes * 60_000);
      for (const pending of await this.repository.listPendingBefore(settings.guildId, before, SWEEP_BATCH)) {
        const gateway = this.requireGateway();
        const member = await gateway.member(settings.guildId, pending.userId);
        await this.repository.deletePending(settings.guildId, pending.userId);
        if (!member || isVerified(settings, member.roleIds)) continue;
        const reason = `Did not verify within ${settings.kickUnverifiedMinutes} minutes.`;
        const server = await gateway.guildName(settings.guildId).catch(() => "the server");
        await gateway.directMessage(member.userId, `You were removed from ${server} because you did not verify within ${settings.kickUnverifiedMinutes} minutes. You can join again and verify.`);
        try {
          await gateway.kick(settings.guildId, member.userId, reason);
        } catch {
          await this.log(settings, { title: "Could not kick unverified member", description: `<@${member.userId}> has not verified, but I could not kick them. Check my Kick Members permission and role position.`, color: COLORS.FAILED });
          continue;
        }
        await this.record(settings, member, "KICKED", reason);
        await this.log(settings, { title: "Unverified member kicked", description: `<@${member.userId}> (${member.displayName}) ${reason.toLowerCase()}`, color: COLORS.KICKED });
        kicked += 1;
      }
    }
    return { kicked };
  }

  private async pass(settings: VerificationSettings, member: VerificationMember): Promise<VerificationOutcome> {
    const flagged = this.tooNew(settings, member.userId);
    await this.grant(settings, member, "PASSED", flagged ? "Passed with a new account (flagged)." : undefined);
    return { passed: true, message: "You are verified. Welcome!" };
  }

  private async grant(settings: VerificationSettings, member: GuildMemberInfo, result: "PASSED" | "MANUAL", reason: string | undefined, staff?: VerificationStaff): Promise<VerificationAttempt> {
    const gateway = this.requireGateway();
    const { guildId } = settings;
    const audit = (staff ? `Verified by ${staff.displayName}` : "Passed verification").slice(0, 512);
    await this.roleChange(async () => {
      for (const roleId of settings.verifiedRoleIds) if (!member.roleIds.includes(roleId)) await gateway.addRole(guildId, member.userId, roleId, audit);
      if (settings.unverifiedRoleId && member.roleIds.includes(settings.unverifiedRoleId)) await gateway.removeRole(guildId, member.userId, settings.unverifiedRoleId, audit);
    });
    await this.repository.deletePending(guildId, member.userId);
    const attempt = await this.record(settings, member, result, reason, staff);
    const needsServer = settings.dmOnSuccess || Boolean(settings.welcomeChannelId && settings.welcomeMessage);
    const server = needsServer ? await gateway.guildName(guildId).catch(() => "the server") : "";
    if (settings.dmOnSuccess)
      await gateway.directMessage(member.userId, fillTemplate(settings.successMessage ?? "You are now verified in {server}. Welcome!", member.userId, server));
    if (settings.welcomeChannelId && settings.welcomeMessage)
      await gateway.sendMessage(settings.welcomeChannelId, fillTemplate(settings.welcomeMessage, member.userId, server), member.userId).catch(() => undefined);
    await this.log(settings, {
      title: result === "MANUAL" ? "Member verified by staff" : "Member verified",
      description: [
        `<@${member.userId}> (${member.displayName})`,
        ...(staff ? [`**By:** <@${staff.userId}>${staff.source === "WEB" ? " via portal" : ""}`] : []),
        ...(reason ? [`**Note:** ${reason}`] : []),
      ].join("\n"),
      color: COLORS[result],
    });
    return attempt;
  }

  private async fail(settings: VerificationSettings, member: VerificationMember, reason: string, message: string): Promise<VerificationOutcome> {
    await this.record(settings, member, "FAILED", reason);
    await this.log(settings, { title: "Verification failed", description: `<@${member.userId}> (${member.displayName})\n${reason}`, color: COLORS.FAILED });
    let left = "";
    if (settings.maxAttempts > 0) {
      const used = (await this.repository.failuresSince(settings.guildId, member.userId, this.cooldownStart(settings))).length;
      const remaining = Math.max(settings.maxAttempts - used, 0);
      left = remaining === 0 ? ` You are out of tries. Try again in ${settings.cooldownMinutes} minutes.` : ` You have ${remaining} ${remaining === 1 ? "try" : "tries"} left.`;
    }
    return { passed: false, message: `${message}${left}${left.includes("out of tries") ? "" : " Click Verify to try again."}` };
  }

  private async checkCooldown(settings: VerificationSettings, userId: string): Promise<void> {
    if (settings.maxAttempts === 0) return;
    const failures = await this.repository.failuresSince(settings.guildId, userId, this.cooldownStart(settings));
    if (failures.length < settings.maxAttempts) return;
    const oldest = failures[failures.length - settings.maxAttempts] ?? failures[0] ?? this.now();
    const minutes = Math.max(1, Math.ceil((oldest.getTime() + settings.cooldownMinutes * 60_000 - this.now().getTime()) / 60_000));
    throw new VerificationError("LIMIT_REACHED", `Too many wrong tries. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }

  private cooldownStart(settings: VerificationSettings): Date {
    return new Date(this.now().getTime() - settings.cooldownMinutes * 60_000);
  }

  private tooNew(settings: VerificationSettings, userId: string): boolean {
    return settings.minAccountAgeDays > 0 && this.now().getTime() - accountCreatedAt(userId).getTime() < settings.minAccountAgeDays * DAY_MS;
  }

  private async kickTooNew(settings: VerificationSettings, member: VerificationMember, reason: string): Promise<void> {
    const gateway = this.requireGateway();
    const server = await gateway.guildName(settings.guildId).catch(() => "the server");
    await gateway.directMessage(member.userId, `You were removed from ${server} because your Discord account is newer than ${settings.minAccountAgeDays} days.`);
    await gateway.kick(settings.guildId, member.userId, reason);
    await this.repository.deletePending(settings.guildId, member.userId);
    await this.record(settings, member, "KICKED", reason);
    await this.log(settings, { title: "New account kicked", description: `<@${member.userId}> (${member.displayName})\n${reason}`, color: COLORS.KICKED });
  }

  private record(settings: VerificationSettings, member: { readonly userId: string; readonly displayName: string }, result: VerificationResult, reason?: string, staff?: VerificationStaff): Promise<VerificationAttempt> {
    return this.repository.recordAttempt({
      guildId: settings.guildId,
      userId: member.userId,
      userName: member.displayName.slice(0, 100),
      result,
      ...(reason ? { reason: reason.slice(0, 500) } : {}),
      ...(staff ? { staffId: staff.userId, staffName: staff.displayName.slice(0, 100) } : {}),
      source: staff?.source ?? (result === "KICKED" || result === "DENIED_AGE" ? "AUTOMATIC" : "DISCORD"),
      createdAt: this.now(),
    });
  }

  private async roleChange(change: () => Promise<void>): Promise<void> {
    try {
      await change();
    } catch {
      throw new VerificationError("DEPENDENCY_UNAVAILABLE", `I could not change the member's roles. Make sure the ${BRAND.name} role (the bot's role) is above the verification roles and has Manage Roles.`);
    }
  }

  private async requireMember(guildId: string, userId: string): Promise<GuildMemberInfo> {
    const member = await this.requireGateway().member(guildId, userId);
    if (!member) throw new VerificationError("NOT_FOUND", "That user is not in the server.");
    return member;
  }

  private async log(settings: VerificationSettings, embed: VerificationEmbed): Promise<void> {
    if (!settings.logChannelId || !this.gateway) return;
    await this.gateway.postEmbed(settings.logChannelId, { ...embed, footer: embed.footer ?? "Verification" }).catch(() => undefined);
  }

  private pruneCaptchas(): void {
    const now = this.now().getTime();
    for (const [key, value] of this.captchas) if (value.expiresAt < now) this.captchas.delete(key);
  }

  private requireGateway(): VerificationGateway {
    if (!this.gateway) throw new VerificationError("DEPENDENCY_UNAVAILABLE", "Discord is not connected.");
    return this.gateway;
  }
}

function isVerified(settings: VerificationSettings, roleIds: readonly string[]): boolean {
  return settings.verifiedRoleIds.length > 0 && settings.verifiedRoleIds.every((roleId) => roleIds.includes(roleId));
}

function cleanReason(reason: string | undefined): string | undefined {
  const text = reason?.trim() || undefined;
  if (text !== undefined) requireLength("reason", text, 1, 500);
  return text;
}
