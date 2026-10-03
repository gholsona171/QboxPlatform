import type { BuilderAnswers, BuilderBlueprint, BuilderChannel, BuilderChannelEmojis, BuilderChannelPurpose, BuilderChannelType, BuilderEmojiSeparator, BuilderForumSetup, BuilderServerType, BuilderTemplate } from "./types.js";
/**
 * A tasteful emoji for a channel: by purpose first, then by its exact name,
 * then by a keyword in the name, then a plain default for its type.
 */
export declare function channelEmoji(name: string, purpose?: BuilderChannelPurpose | undefined, type?: BuilderChannelType): string;
/**
 * Puts an emoji in front of a channel name in the chosen style. Text channels:
 * `👋┃welcome` (BAR) or `👋-welcome` (SPACE). Voice: `🔊┃Lounge 1` or `🔊 Lounge 1`.
 * A name that already starts with an emoji is left alone.
 */
export declare function emojiChannelName(name: string, emoji: string, type: BuilderChannelType, separator: BuilderEmojiSeparator): string;
/** Whether a channel gets an emoji under the answer: KEY means channels with a purpose or in a key category (Start Here, Information, Support). */
export declare function wantsEmoji(mode: BuilderChannelEmojis, channel: Pick<BuilderChannel, "purpose">, keyCategory: boolean): boolean;
/**
 * Sensible forum setup for a channel: a ready-made one by name, or a plain
 * one. Media channels need an attachment in every post, so they get no first post.
 */
export declare function defaultForumSetup(name: string, type?: BuilderChannelType): BuilderForumSetup;
/** Ready-made answer sets. */
export declare const BUILDER_TEMPLATES: readonly BuilderTemplate[];
export declare function templateFor(type: BuilderServerType): BuilderTemplate;
/**
 * Turns questionnaire answers into a full server layout. Pure and
 * deterministic: the same answers always give the same blueprint.
 */
export declare function generateBlueprint(input: BuilderAnswers): BuilderBlueprint;
//# sourceMappingURL=generator.d.ts.map