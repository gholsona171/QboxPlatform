import type { OutgoingMessage } from "@qbox/shared/messages";
export type VerificationMode = "BUTTON" | "CAPTCHA" | "QUESTION";
/** What happens to accounts younger than the minimum age. */
export type VerificationAgeAction = "DENY" | "KICK" | "FLAG";
export type VerificationResult = "PASSED" | "FAILED" | "DENIED_AGE" | "KICKED" | "MANUAL" | "REVOKED";
export type VerificationSource = "DISCORD" | "WEB" | "AUTOMATIC";
export declare const VERIFICATION_MODES: readonly VerificationMode[];
export declare const VERIFICATION_AGE_ACTIONS: readonly VerificationAgeAction[];
export declare const VERIFICATION_RESULTS: readonly VerificationResult[];
/** Custom IDs for the panel button, the captcha code button, and the modals. */
export declare const VERIFICATION_CUSTOM_ID: {
    readonly start: "qbox:verification:start";
    readonly enterCode: "qbox:verification:enter-code";
    readonly captchaForm: "qbox:verification:captcha-form";
    readonly questionForm: "qbox:verification:question-form";
};
/** Discord modals hold at most five text inputs. */
export declare const MAX_VERIFICATION_QUESTIONS = 5;
export interface VerificationQuestion {
    readonly id: string;
    /** Shown as the modal field label (max 45 characters). */
    readonly prompt: string;
    /** Accepted answers, compared without case and extra spaces. */
    readonly answers: readonly string[];
}
export interface VerificationPanel {
    readonly title: string;
    readonly description: string;
    readonly color: string;
    readonly buttonLabel: string;
}
export interface VerificationSettings {
    readonly guildId: string;
    readonly enabled: boolean;
    readonly mode: VerificationMode;
    /** Roles given when a member verifies. */
    readonly verifiedRoleIds: readonly string[];
    /** Role given on join and removed on verify. */
    readonly unverifiedRoleId?: string | undefined;
    /** Channel the panel is posted in. */
    readonly channelId?: string | undefined;
    readonly panel: VerificationPanel;
    readonly questions: readonly VerificationQuestion[];
    readonly logChannelId?: string | undefined;
    /** 0 turns the account age check off. */
    readonly minAccountAgeDays: number;
    readonly ageAction: VerificationAgeAction;
    /** Kick members still unverified after this many minutes. 0 = off. */
    readonly kickUnverifiedMinutes: number;
    /** Wrong answers allowed before a cooldown. 0 = unlimited. */
    readonly maxAttempts: number;
    readonly cooldownMinutes: number;
    readonly dmOnSuccess: boolean;
    /** DM text after verifying. Supports {user} and {server}. */
    readonly successMessage?: string | undefined;
    readonly welcomeChannelId?: string | undefined;
    /** Posted in the welcome channel after verifying. Supports {user} and {server}. */
    readonly welcomeMessage?: string | undefined;
    /** Where the panel was last posted. */
    readonly panelChannelId?: string | undefined;
    readonly panelMessageId?: string | undefined;
    readonly revision: number;
}
export interface VerificationSettingsInput extends Omit<VerificationSettings, "revision" | "panelChannelId" | "panelMessageId"> {
    readonly expectedRevision?: number | undefined;
}
export interface VerificationAttempt {
    readonly id: string;
    readonly guildId: string;
    readonly userId: string;
    readonly userName: string;
    readonly result: VerificationResult;
    readonly reason?: string | undefined;
    /** Staff member for MANUAL and REVOKED. */
    readonly staffId?: string | undefined;
    readonly staffName?: string | undefined;
    readonly source: VerificationSource;
    readonly createdAt: Date;
}
export type AttemptCreateData = Omit<VerificationAttempt, "id">;
export interface AttemptFilter {
    readonly guildId: string;
    readonly results?: readonly VerificationResult[] | undefined;
    readonly userId?: string | undefined;
    readonly search?: string | undefined;
    readonly limit?: number | undefined;
}
/** A member who joined and has not verified yet. */
export interface PendingMember {
    readonly guildId: string;
    readonly userId: string;
    readonly joinedAt: Date;
    /** Account was younger than the minimum age (FLAG action). */
    readonly flagged: boolean;
}
export interface VerificationStats {
    readonly verified24h: number;
    readonly failed24h: number;
    readonly deniedAge24h: number;
    readonly kicked24h: number;
    readonly verifiedTotal: number;
    readonly pending: number;
}
export interface VerificationRepository {
    getSettings(guildId: string): Promise<VerificationSettings | undefined>;
    saveSettings(input: VerificationSettingsInput): Promise<VerificationSettings>;
    /** Remembers where the panel was posted without changing the revision. */
    setPanelMessage(guildId: string, channelId: string, messageId: string): Promise<void>;
    /** Guilds with verification on and a kick timer set. */
    listKickEnabled(): Promise<readonly VerificationSettings[]>;
    recordAttempt(input: AttemptCreateData): Promise<VerificationAttempt>;
    listAttempts(filter: AttemptFilter): Promise<readonly VerificationAttempt[]>;
    /** Times of FAILED attempts for a member since `since`, oldest first. */
    failuresSince(guildId: string, userId: string, since: Date): Promise<readonly Date[]>;
    upsertPending(member: PendingMember): Promise<void>;
    getPending(guildId: string, userId: string): Promise<PendingMember | undefined>;
    deletePending(guildId: string, userId: string): Promise<void>;
    /** Pending members who joined before `before`, oldest first. */
    listPendingBefore(guildId: string, before: Date, limit: number): Promise<readonly PendingMember[]>;
    stats(guildId: string, since: Date): Promise<VerificationStats>;
}
export interface VerificationEmbed {
    readonly title: string;
    readonly description: string;
    readonly color: string;
    readonly footer?: string | undefined;
}
export interface GuildMemberInfo {
    readonly userId: string;
    readonly displayName: string;
    readonly roleIds: readonly string[];
}
/** Discord operations verification needs. */
export interface VerificationGateway {
    /** The member, or undefined when they are not in the server. */
    member(guildId: string, userId: string): Promise<GuildMemberInfo | undefined>;
    guildName(guildId: string): Promise<string>;
    addRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
    removeRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
    kick(guildId: string, userId: string, reason: string): Promise<void>;
    directMessage(userId: string, content: string): Promise<boolean>;
    /** Posts the rendered `verification.welcome` message; it may mention `mentionUserId`. */
    sendMessage(channelId: string, message: OutgoingMessage, mentionUserId: string): Promise<void>;
    postEmbed(channelId: string, embed: VerificationEmbed): Promise<void>;
    /** Edits the panel message when it still exists, otherwise posts a new one. */
    publishPanel(channelId: string, panel: VerificationPanel, existingMessageId?: string): Promise<{
        readonly messageId: string;
    }>;
}
/** Member trying to verify, as seen by the interaction. */
export interface VerificationMember {
    readonly userId: string;
    readonly displayName: string;
    readonly roleIds: readonly string[];
}
/** Staff member acting on someone. Permission checks happen before the service is called. */
export interface VerificationStaff {
    readonly userId: string;
    readonly displayName: string;
    readonly source: "DISCORD" | "WEB";
}
export interface VerificationOutcome {
    readonly passed: boolean;
    readonly message: string;
}
export interface CaptchaChallenge {
    readonly code: string;
    /** The code with spaces between characters, as shown to the member. */
    readonly display: string;
    readonly expiresAt: Date;
}
export interface MemberVerificationStatus {
    readonly userId: string;
    readonly displayName: string;
    readonly inServer: boolean;
    readonly verified: boolean;
    readonly accountCreatedAt: Date;
    readonly pending?: PendingMember | undefined;
    readonly attempts: readonly VerificationAttempt[];
}
//# sourceMappingURL=types.d.ts.map