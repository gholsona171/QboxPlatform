import { type BlueprintDesigner } from "./BlueprintDesigner.js";
import type { BuilderAccess, BuilderAnswers, BuilderBlueprint, BuilderChannelType, BuilderDraftInput, BuilderGateway, BuilderLink, BuilderLinkOption, BuilderLinkPort, BuilderPreflight, BuilderRepository, BuilderRun, BuilderRunDetail, BuilderRunMode, BuilderStarter, BuilderSummary, BuilderTemplate, WipeInclude, WipePreview } from "./types.js";
import { BUILDER_LIMITS } from "./validation.js";
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
/** Whether the viewer may wipe the server, and if not, a plain reason. */
export interface WipeEligibility {
    readonly allowed: boolean;
    readonly reason: string;
}
export interface BuilderOverview {
    readonly draft?: BuilderDraftView | undefined;
    readonly templates: readonly BuilderTemplate[];
    readonly limits: typeof BUILDER_LIMITS;
    readonly lastRun?: BuilderRun | undefined;
    readonly preflight: BuilderPreflight;
    /** "Describe your server" can be used: an AI designer is configured. */
    readonly aiAvailable: boolean;
    /** Whether the current viewer may wipe the server. */
    readonly wipe: WipeEligibility;
}
export interface BuilderStartInput {
    readonly mode: BuilderRunMode;
    readonly links: readonly BuilderLink[];
    /** WIPE_AND_BUILD only: the typed server name, checked server side. */
    readonly confirmName?: string | undefined;
    /** WIPE_AND_BUILD only: what the wipe deletes. */
    readonly include?: WipeInclude | undefined;
}
/** POST /wipe body. */
export interface WipeStartInput {
    readonly confirmName: string;
    readonly include: WipeInclude;
}
/** Who is asking, beyond builder.manage: whether they are a platform owner. */
export interface WipeAuthorizationOptions {
    readonly platformOwner?: boolean | undefined;
}
/** Result of turning a wipe snapshot back into a draft. */
export interface LoadBlueprintResult {
    readonly draft: BuilderDraftView;
    readonly notes: readonly string[];
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
    /** Called when a background build, wipe, or undo finishes (or fails), so cached server lists can be dropped. */
    readonly onRunFinished?: ((guildId: string) => void) | undefined;
}
export declare function discordChannelType(type: BuilderChannelType): number;
/**
 * Server builder: questionnaire answers become a blueprint, the blueprint is
 * built in Discord (never deleting anything that already exists), and the
 * result is connected to Qbox features through the link port.
 *
 * Builds and undos run in the background; progress is saved after every item
 * so the portal can poll the run.
 */
export declare class BuilderService {
    private readonly repository;
    private readonly gateway?;
    private readonly links?;
    private readonly now;
    private readonly schedule;
    private readonly active;
    private readonly designer;
    private readonly onRunFinished;
    constructor(repository: BuilderRepository, gateway?: BuilderGateway | undefined, links?: BuilderLinkPort | undefined, options?: BuilderServiceOptions);
    templates(): readonly BuilderTemplate[];
    plan(blueprint: BuilderBlueprint): BuilderPlan;
    /** Turns answers into a blueprint without saving it. */
    generate(answers: BuilderAnswers): Promise<BuilderPlan>;
    overview(guildId: string, viewer?: BuilderStarter, options?: WipeAuthorizationOptions): Promise<BuilderOverview>;
    /** Whether the viewer may wipe the server (owner, administrator, or platform owner). */
    wipeEligibility(guildId: string, viewer?: BuilderStarter, options?: WipeAuthorizationOptions): Promise<WipeEligibility>;
    /**
     * "Describe your server": the AI designer turns the description into answers
     * and extras, the generator makes the blueprint, the extras are applied and
     * checked, and the result is saved as the draft. Nothing is built.
     */
    designFromPrompt(guildId: string, prompt: string, expectedRevision: number, updatedById?: string): Promise<BuilderDesignResult>;
    draft(guildId: string): Promise<BuilderDraftView | undefined>;
    saveDraft(input: BuilderDraftInput): Promise<BuilderDraftView>;
    /** Checks that Qbox can create roles and channels. */
    preflight(guildId: string): Promise<BuilderPreflight>;
    runs(guildId: string, limit?: number): Promise<readonly BuilderRun[]>;
    lastRun(guildId: string): Promise<BuilderRunDetail | undefined>;
    run(guildId: string, id: string): Promise<BuilderRunDetail>;
    /** Starts building the saved draft. Returns right away; poll the run for progress. */
    startRun(guildId: string, input: BuilderStartInput, starter: BuilderStarter, options?: WipeAuthorizationOptions): Promise<BuilderRun>;
    /** Starts a wipe of the whole server. Owner-, administrator-, or platform-owner-only. Returns right away; poll the run. */
    startWipe(guildId: string, input: WipeStartInput, starter: BuilderStarter, options?: WipeAuthorizationOptions): Promise<BuilderRun>;
    /** Counts, the kept list, and any missing permissions for the wipe confirmation dialog. */
    wipePreview(guildId: string): Promise<WipePreview>;
    /** Turns the layout saved with a wipe run back into the draft blueprint. Messages cannot be recovered. */
    loadBlueprintFromRun(guildId: string, id: string, starter?: BuilderStarter): Promise<LoadBlueprintResult>;
    /** Deletes only the roles and channels this run created. Runs in the background. */
    undo(guildId: string, id: string): Promise<BuilderRun>;
    /** Marks runs left RUNNING by a restart as FAILED. Call once when the API starts. */
    recoverInterrupted(): Promise<number>;
    /** Builds ADD/FRESH: sets the run running, builds, and finalizes. */
    private runBuild;
    /** Wipes the server, then builds the draft (Fresh) and connects the links, as one run. */
    private runWipeThenBuild;
    /** Wipes the server. */
    private runWipe;
    private recorder;
    private finalize;
    /** Deletes everything a wipe should: channels (children first), categories, roles (lowest first), then emojis and stickers. */
    private doWipe;
    /** Reads the layout, checks the typed name, and captures the snapshot for a wipe. */
    private prepareWipe;
    /** Owner, administrator (Discord Administrator bit), or platform owner. */
    private isOwnerOrAdmin;
    private requireWipeRate;
    private build;
    /** Creates (and pins) the first post in a new forum channel. Returns a plain note; a failure is a note too, since the channel exists. */
    private firstPost;
    private removeCreated;
    /** Runs a background task, marking the run FAILED if it throws, and frees the guild. */
    private guarded;
    private requireIdle;
    private requireRun;
    private requireGateway;
    private view;
}
//# sourceMappingURL=BuilderService.d.ts.map