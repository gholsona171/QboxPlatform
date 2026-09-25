export type QuestionType = "SHORT" | "PARAGRAPH" | "YES_NO" | "CHOICE";
export type ApplicationStatus = "PENDING" | "ACCEPTED" | "DENIED" | "WITHDRAWN";
export type ApplicationSource = "DISCORD" | "WEB";
export type VoteType = "UP" | "DOWN";
export type ButtonStyle = "PRIMARY" | "SECONDARY" | "SUCCESS" | "DANGER";

export const QUESTION_TYPES: readonly QuestionType[] = ["SHORT", "PARAGRAPH", "YES_NO", "CHOICE"];
export const APPLICATION_STATUSES: readonly ApplicationStatus[] = ["PENDING", "ACCEPTED", "DENIED", "WITHDRAWN"];
export const BUTTON_STYLES: readonly ButtonStyle[] = ["PRIMARY", "SECONDARY", "SUCCESS", "DANGER"];
/** Most questions a form can have. */
export const MAX_QUESTIONS = 25;
/** Questions shown per Discord form page (a Discord limit). */
export const QUESTIONS_PER_PAGE = 5;

/** Custom ID prefixes for Discord components. */
export const APPLICATION_CUSTOM_ID = {
  prefix: "qbox:applications:",
  open: "qbox:applications:open:",
  pick: "qbox:applications:pick",
  page: "qbox:applications:page:",
  next: "qbox:applications:next:",
  accept: "qbox:applications:accept:",
  deny: "qbox:applications:deny:",
  up: "qbox:applications:up:",
  down: "qbox:applications:down:",
  reason: "qbox:applications:reason:",
} as const;

export interface ApplicationQuestion {
  /** Stable key, unique within the form. */
  readonly id: string;
  readonly label: string;
  readonly description?: string | undefined;
  readonly type: QuestionType;
  readonly required: boolean;
  readonly minLength?: number | undefined;
  readonly maxLength?: number | undefined;
  /** Options for CHOICE questions. */
  readonly choices: readonly string[];
}

export interface ApplicationForm {
  readonly id: string;
  readonly guildId: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly enabled: boolean;
  readonly questions: readonly ApplicationQuestion[];
  /** Days a denied member waits before applying to this form again. 0 = no wait. */
  readonly cooldownDays: number;
  /** Allow only one pending application per member for this form. */
  readonly onePending: boolean;
  /** Members need at least one of these roles to apply. Empty = anyone. */
  readonly requiredRoleIds: readonly string[];
  /** Members with any of these roles cannot apply. */
  readonly blockedRoleIds: readonly string[];
  /** Discord accounts must be at least this many days old. */
  readonly minAccountAgeDays?: number | undefined;
  readonly reviewChannelId?: string | undefined;
  /** Roles that can review this form, in addition to `applications.review`. */
  readonly reviewerRoleIds: readonly string[];
  /** Members mentioned when a new application arrives. */
  readonly pingMemberIds: readonly string[];
  readonly acceptRoleIds: readonly string[];
  readonly removeRoleIds: readonly string[];
  /** DM on accept. Supports {user} {form} {number} {reason} {server}. */
  readonly acceptMessage?: string | undefined;
  /** DM on deny. Supports {user} {form} {number} {reason} {server}. */
  readonly denyMessage?: string | undefined;
  /** When set, a private discussion thread with the applicant is created in this channel. */
  readonly discussionChannelId?: string | undefined;
  readonly buttonLabel?: string | undefined;
  readonly buttonEmoji?: string | undefined;
  readonly buttonStyle: ButtonStyle;
  readonly position: number;
  readonly revision: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type ApplicationFormInput = Omit<ApplicationForm, "id" | "revision" | "createdAt" | "updatedAt"> & {
  readonly expectedRevision?: number | undefined;
};

export interface ApplicationPanel {
  readonly id: string;
  readonly guildId: string;
  readonly channelId: string;
  readonly messageId?: string | undefined;
  readonly title: string;
  readonly description: string;
  readonly color: string;
  /** Forms shown as buttons, in order. Empty = every enabled form. */
  readonly formIds: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type ApplicationPanelInput = Omit<ApplicationPanel, "id" | "messageId" | "createdAt" | "updatedAt">;

export interface ApplicationAnswer {
  readonly questionId: string;
  readonly question: string;
  readonly answer: string;
}

export interface ApplicationVote {
  readonly userId: string;
  readonly vote: VoteType;
  readonly createdAt: Date;
}

export interface ApplicationNote {
  readonly id: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly body: string;
  readonly createdAt: Date;
}

export interface Application {
  readonly id: string;
  readonly guildId: string;
  readonly number: number;
  readonly formId?: string | undefined;
  readonly formName: string;
  readonly applicantId: string;
  readonly applicantName: string;
  readonly status: ApplicationStatus;
  readonly source: ApplicationSource;
  readonly answers: readonly ApplicationAnswer[];
  readonly votes: readonly ApplicationVote[];
  readonly notes: readonly ApplicationNote[];
  readonly reviewChannelId?: string | undefined;
  readonly reviewMessageId?: string | undefined;
  readonly threadId?: string | undefined;
  readonly decidedById?: string | undefined;
  readonly decidedByName?: string | undefined;
  readonly decisionReason?: string | undefined;
  readonly decidedAt?: Date | undefined;
  readonly dmDelivered?: boolean | undefined;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ApplicationCreateData {
  readonly guildId: string;
  readonly number: number;
  readonly formId: string;
  readonly formName: string;
  readonly applicantId: string;
  readonly applicantName: string;
  readonly source: ApplicationSource;
  readonly answers: readonly ApplicationAnswer[];
}

export interface ApplicationPatch {
  readonly status?: ApplicationStatus;
  readonly reviewChannelId?: string | null;
  readonly reviewMessageId?: string | null;
  readonly threadId?: string | null;
  readonly decidedById?: string | null;
  readonly decidedByName?: string | null;
  readonly decisionReason?: string | null;
  readonly decidedAt?: Date | null;
  readonly dmDelivered?: boolean | null;
}

export interface ApplicationFilter {
  readonly guildId: string;
  readonly statuses?: readonly ApplicationStatus[] | undefined;
  readonly formIds?: readonly string[] | undefined;
  readonly applicantId?: string | undefined;
  readonly search?: string | undefined;
  readonly limit?: number | undefined;
}

export interface ApplicationFormStats {
  readonly formId?: string | undefined;
  readonly formName: string;
  readonly total: number;
  readonly pending: number;
  readonly accepted: number;
  readonly denied: number;
}

export interface ApplicationStats {
  readonly total: number;
  readonly last7Days: number;
  readonly byStatus: Readonly<Record<ApplicationStatus, number>>;
  readonly byForm: readonly ApplicationFormStats[];
  /** Average minutes from submission to accept or deny. */
  readonly averageReviewMinutes?: number | undefined;
}

export interface ApplicationRepository {
  listForms(guildId: string): Promise<readonly ApplicationForm[]>;
  getForm(guildId: string, id: string): Promise<ApplicationForm | undefined>;
  createForm(input: ApplicationFormInput): Promise<ApplicationForm>;
  /** Fails with CONFLICT when `expectedRevision` is stale. */
  updateForm(id: string, input: ApplicationFormInput): Promise<ApplicationForm>;
  deleteForm(guildId: string, id: string): Promise<void>;

  listPanels(guildId: string): Promise<readonly ApplicationPanel[]>;
  getPanel(guildId: string, id: string): Promise<ApplicationPanel | undefined>;
  createPanel(input: ApplicationPanelInput): Promise<ApplicationPanel>;
  updatePanel(id: string, input: ApplicationPanelInput): Promise<ApplicationPanel>;
  setPanelMessage(id: string, messageId: string | null): Promise<ApplicationPanel>;
  deletePanel(guildId: string, id: string): Promise<void>;

  /** Atomically returns the next application number for the guild. */
  allocateNumber(guildId: string): Promise<number>;
  createApplication(input: ApplicationCreateData): Promise<Application>;
  getApplication(guildId: string, id: string): Promise<Application | undefined>;
  getApplicationByNumber(guildId: string, number: number): Promise<Application | undefined>;
  listApplications(filter: ApplicationFilter): Promise<readonly Application[]>;
  updateApplication(id: string, patch: ApplicationPatch): Promise<Application>;
  /** Sets or clears (`vote` undefined) one reviewer's vote. */
  setVote(applicationId: string, userId: string, vote: VoteType | undefined): Promise<Application>;
  addNote(applicationId: string, authorId: string, authorName: string, body: string): Promise<Application>;
  /** This member's applications to this form, newest first. */
  listForApplicant(guildId: string, formId: string, applicantId: string): Promise<readonly Application[]>;
  stats(guildId: string, now: Date): Promise<ApplicationStats>;
}

export interface ApplicationEmbed {
  readonly title: string;
  readonly description: string;
  readonly color: string;
  readonly fields?: readonly { readonly name: string; readonly value: string; readonly inline?: boolean }[] | undefined;
  readonly footer?: string | undefined;
}

/** Review message posted in the review channel. */
export interface ReviewMessage {
  readonly content?: string | undefined;
  readonly mentionUserIds: readonly string[];
  readonly embed: ApplicationEmbed;
  readonly applicationId: string;
  readonly upvotes: number;
  readonly downvotes: number;
  /** Decided or withdrawn: no buttons. */
  readonly closed: boolean;
}

/** Discord operations applications need. */
export interface ApplicationGateway {
  postReview(channelId: string, message: ReviewMessage): Promise<{ readonly messageId: string }>;
  updateReview(channelId: string, messageId: string, message: ReviewMessage): Promise<void>;
  /** Private thread in `channelId` with the applicant added; returns the thread ID. */
  createDiscussion(channelId: string, name: string, memberIds: readonly string[], content: string): Promise<{ readonly threadId: string }>;
  postMessage(channelId: string, content: string): Promise<void>;
  addRoles(guildId: string, userId: string, roleIds: readonly string[], reason: string): Promise<void>;
  removeRoles(guildId: string, userId: string, roleIds: readonly string[], reason: string): Promise<void>;
  directMessage(userId: string, embed: ApplicationEmbed): Promise<boolean>;
  publishPanel(panel: ApplicationPanel, forms: readonly ApplicationForm[]): Promise<{ readonly messageId: string }>;
  deleteMessage(channelId: string, messageId: string): Promise<void>;
  guildName(guildId: string): Promise<string>;
}

/** A member applying. `accountCreatedAt` comes from their user ID. */
export interface Applicant {
  readonly userId: string;
  readonly displayName: string;
  readonly roleIds: readonly string[];
  readonly source: ApplicationSource;
}

/**
 * A staff member reviewing. `elevated` is true for Discord administrators and
 * holders of `applications.review` or `applications.manage`; other reviewers
 * need one of a form's reviewer roles.
 */
export interface Reviewer {
  readonly userId: string;
  readonly displayName: string;
  readonly roleIds: readonly string[];
  readonly elevated: boolean;
  readonly source: ApplicationSource;
}

export interface FormAvailability {
  readonly form: ApplicationForm;
  readonly canApply: boolean;
  /** Why the member cannot apply. */
  readonly reason?: string | undefined;
}
