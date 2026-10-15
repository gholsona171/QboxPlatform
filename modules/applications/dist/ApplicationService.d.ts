import type { Applicant, Application, ApplicationAnswer, ApplicationFilter, ApplicationForm, ApplicationFormInput, ApplicationGateway, ApplicationPanel, ApplicationPanelInput, ApplicationQuestion, ApplicationRepository, ApplicationStats, ApplicationStatus, FormAvailability, Reviewer, VoteType } from "./types.js";
export interface SubmitInput {
    readonly guildId: string;
    readonly formId: string;
    readonly applicant: Applicant;
    /** Answers keyed by question ID. */
    readonly answers: Readonly<Record<string, string>>;
}
export type Decision = "ACCEPTED" | "DENIED";
/** When a Discord account was created, read from its user ID. */
export declare function accountCreatedAt(userId: string): Date;
export declare function statusLabel(status: ApplicationStatus): string;
/** Questions split into Discord form pages of five. */
export declare function questionPages(form: ApplicationForm): readonly (readonly ApplicationQuestion[])[];
/** Replaces {user} {form} {number} {reason} {server} in a DM template. */
export declare function renderTemplate(template: string, values: Readonly<Record<string, string>>): string;
/**
 * Application rules shared by the bot and the API.
 *
 * The caller works out who the member is (roles, and whether they hold
 * `applications.review`). This service checks eligibility, validates answers,
 * numbers applications, posts review messages, and applies decisions (roles
 * and DMs).
 */
export declare class ApplicationService {
    private readonly repository;
    private readonly gateway?;
    private readonly now;
    constructor(repository: ApplicationRepository, gateway?: ApplicationGateway | undefined, now?: () => Date);
    forms(guildId: string): Promise<readonly ApplicationForm[]>;
    form(guildId: string, id: string): Promise<ApplicationForm>;
    /** Creates a form, or updates form `id`. */
    saveForm(input: ApplicationFormInput, id?: string): Promise<ApplicationForm>;
    deleteForm(guildId: string, id: string): Promise<void>;
    panels(guildId: string): Promise<readonly ApplicationPanel[]>;
    savePanel(input: ApplicationPanelInput, id?: string): Promise<ApplicationPanel>;
    /** Posts the panel, or edits its existing message. */
    publishPanel(guildId: string, id: string): Promise<ApplicationPanel>;
    /** Posts a panel with every enabled form to a channel, reusing a panel already in that channel. */
    postPanel(guildId: string, channelId: string, title?: string, description?: string): Promise<ApplicationPanel>;
    deletePanel(guildId: string, id: string): Promise<void>;
    /** Enabled forms and whether this member can apply to each. */
    availability(guildId: string, applicant: Applicant): Promise<readonly FormAvailability[]>;
    /** The form, when this member may apply to it now. */
    requireEligible(guildId: string, formId: string, applicant: Applicant): Promise<ApplicationForm>;
    submit(input: SubmitInput): Promise<Application>;
    withdraw(guildId: string, id: string, applicant: Applicant): Promise<Application>;
    /** A member's own applications, newest first. */
    mine(guildId: string, userId: string): Promise<readonly Application[]>;
    /** True when the reviewer may review at least one form. */
    isReviewer(guildId: string, reviewer: Reviewer): Promise<boolean>;
    /** Forms this reviewer can review. */
    reviewableForms(guildId: string, reviewer: Reviewer): Promise<readonly ApplicationForm[]>;
    list(filter: ApplicationFilter, reviewer: Reviewer): Promise<readonly Application[]>;
    application(guildId: string, id: string): Promise<Application>;
    applicationByNumber(guildId: string, number: number): Promise<Application>;
    /** An application the reviewer is allowed to see. */
    review(guildId: string, id: string, reviewer: Reviewer): Promise<Application>;
    /** Sets a vote, or clears it with `undefined`. */
    vote(guildId: string, id: string, reviewer: Reviewer, vote: VoteType | undefined): Promise<Application>;
    /** Votes, or removes the vote when the reviewer presses the same button again. */
    toggleVote(guildId: string, id: string, reviewer: Reviewer, vote: VoteType): Promise<Application>;
    addNote(guildId: string, id: string, reviewer: Reviewer, body: string): Promise<Application>;
    /** Accepts (roles and DM) or denies (DM) a pending application. */
    decide(guildId: string, id: string, reviewer: Reviewer, decision: Decision, reason?: string): Promise<Application>;
    stats(guildId: string, reviewer: Reviewer): Promise<ApplicationStats>;
    private blocker;
    private requireReviewer;
    private refreshReview;
    private reviewMessage;
    private decisionEmbed;
    private panel;
    private requireGateway;
}
export declare function canReviewForm(form: ApplicationForm, reviewer: Reviewer): boolean;
/** Checks answers against the form and returns them in question order. */
export declare function validateAnswers(form: ApplicationForm, answers: Readonly<Record<string, string>>): readonly ApplicationAnswer[];
//# sourceMappingURL=ApplicationService.d.ts.map