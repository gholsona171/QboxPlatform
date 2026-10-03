import { type MessageTemplates } from "@qbox/shared/messages";
import type { AttemptFilter, CaptchaChallenge, MemberVerificationStatus, VerificationAttempt, VerificationGateway, VerificationMember, VerificationOutcome, VerificationQuestion, VerificationRepository, VerificationSettings, VerificationSettingsInput, VerificationStaff, VerificationStats } from "./types.js";
export declare function defaultVerificationSettings(guildId: string): VerificationSettings;
/** When a Discord account was created, read from its snowflake ID. */
export declare function accountCreatedAt(userId: string): Date;
/** Lowercase with single spaces, for comparing answers. */
export declare function normalizeAnswer(value: string): string;
/** Replaces {user} and {server}. */
export declare function fillTemplate(template: string, userId: string, server: string): string;
/**
 * Member verification shared by the bot and the API.
 *
 * Members verify by clicking a button, typing a code, or answering questions.
 * The service checks the account age and the attempt cooldown, gives the
 * verified roles, removes the unverified role, records every attempt, and
 * kicks members who stay unverified too long. Callers check staff permissions.
 */
export declare class VerificationService {
    private readonly repository;
    private readonly gateway?;
    private readonly now;
    private readonly templates;
    private readonly captchas;
    constructor(repository: VerificationRepository, gateway?: VerificationGateway | undefined, now?: () => Date, templates?: MessageTemplates);
    settings(guildId: string): Promise<VerificationSettings>;
    saveSettings(input: VerificationSettingsInput): Promise<VerificationSettings>;
    /** Posts the panel in the verification channel, or updates the one already there. */
    publishPanel(guildId: string): Promise<{
        readonly channelId: string;
        readonly messageId: string;
    }>;
    /**
     * Checks that a member may try to verify right now. Throws when verification
     * is off, they are verified already, they are on cooldown, or their account
     * is too new (which may also kick them).
     */
    checkEligible(guildId: string, member: VerificationMember): Promise<VerificationSettings>;
    /** BUTTON mode: verifies the member straight away. */
    verifyByButton(guildId: string, member: VerificationMember): Promise<VerificationOutcome>;
    /** CAPTCHA mode: creates a new code for the member to type back. */
    startCaptcha(guildId: string, member: VerificationMember): Promise<CaptchaChallenge>;
    submitCaptcha(guildId: string, member: VerificationMember, entered: string): Promise<VerificationOutcome>;
    /** QUESTION mode: the questions to show in the form. */
    questions(guildId: string, member: VerificationMember): Promise<readonly VerificationQuestion[]>;
    /** Every answer must match one of its question's accepted answers. */
    submitAnswers(guildId: string, member: VerificationMember, answers: Readonly<Record<string, string>>): Promise<VerificationOutcome>;
    /** Staff verify a member, skipping the challenge and the account age check. */
    manualVerify(guildId: string, userId: string, staff: VerificationStaff, reason?: string): Promise<VerificationAttempt>;
    /** Staff remove a member's verification: verified roles off, unverified role back on. */
    unverify(guildId: string, userId: string, staff: VerificationStaff, reason?: string): Promise<VerificationAttempt>;
    status(guildId: string, userId: string): Promise<MemberVerificationStatus>;
    attempts(filter: AttemptFilter): Promise<readonly VerificationAttempt[]>;
    stats(guildId: string): Promise<VerificationStats>;
    /** Gives the unverified role and checks the account age when a member joins. */
    memberJoined(guildId: string, member: VerificationMember): Promise<void>;
    memberLeft(guildId: string, userId: string): Promise<void>;
    /** Kicks members who have not verified within the configured time. */
    sweepUnverified(): Promise<{
        readonly kicked: number;
    }>;
    private pass;
    private grant;
    private fail;
    private checkCooldown;
    private cooldownStart;
    private tooNew;
    private kickTooNew;
    private record;
    private roleChange;
    private requireMember;
    private log;
    private pruneCaptchas;
    private requireGateway;
}
//# sourceMappingURL=VerificationService.d.ts.map