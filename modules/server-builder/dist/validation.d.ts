import type { BuilderAnswers, BuilderBlueprint, BuilderChannelType, BuilderSummary } from "./types.js";
export type BuilderErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe server builder failure. Messages are shown to server owners. */
export declare class BuilderError extends Error {
    readonly code: BuilderErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: BuilderErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
/** Discord limits the builder checks before building. */
export declare const BUILDER_LIMITS: {
    /** Categories plus channels in one server. */
    readonly channels: 500;
    readonly channelsPerCategory: 50;
    readonly roles: 250;
    readonly nameLength: 100;
    readonly topicLength: 1024;
    readonly slowmodeSeconds: 21600;
    readonly userLimit: 99;
    readonly overwritesPerChannel: 100;
    readonly staffRanks: 15;
    readonly departments: 20;
    readonly voiceLounges: 10;
    /** Forum guidelines (Discord's forum topic). */
    readonly forumGuidelines: 4096;
    readonly forumTags: 20;
    readonly forumTagName: 20;
    readonly forumPostTitle: 100;
    readonly forumPostContent: 2000;
    /** The "Describe your server" prompt. */
    readonly description: 2000;
};
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
/** Discord-style text channel name: lowercase, hyphens instead of spaces, no punctuation. */
export declare function channelSlug(name: string): string;
/** A channel name without its leading emoji and separator: `👋┃welcome` and `👋-welcome` both give `welcome`. */
export declare function plainChannelName(name: string): string;
/** Whether a channel name already starts with an emoji. */
export declare function hasLeadingEmoji(name: string): boolean;
/** Lowercase key from any name, e.g. "Senior Moderator" -> "senior-moderator". */
export declare function keyOf(name: string): string;
export declare function isTextType(type: BuilderChannelType): boolean;
/** Forum and media channels: posts with tags instead of one chat. */
export declare function isForumType(type: BuilderChannelType): boolean;
/** A unicode emoji such as 👍, or a custom emoji as `name:id`. */
export declare function isEmoji(value: string): boolean;
/** Trims names and turns text channel names into Discord style. */
export declare function normalizeBlueprint(blueprint: BuilderBlueprint): BuilderBlueprint;
/** Checks Discord limits, unique keys, and that permissions only name known roles. */
export declare function validateBlueprint(blueprint: BuilderBlueprint): void;
/** Counts and plain warnings for the preview. */
export declare function summarize(blueprint: BuilderBlueprint): BuilderSummary;
/** Checks questionnaire answers. */
export declare function validateAnswers(answers: BuilderAnswers): void;
//# sourceMappingURL=validation.d.ts.map