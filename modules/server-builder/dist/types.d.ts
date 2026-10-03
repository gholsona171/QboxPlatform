export type BuilderChannelType = "TEXT" | "ANNOUNCEMENT" | "FORUM" | "MEDIA" | "VOICE" | "STAGE";
export declare const BUILDER_CHANNEL_TYPES: readonly BuilderChannelType[];
/** Discord permission names the builder can grant or deny. */
export declare const BUILDER_PERMISSIONS: readonly ["Administrator", "ViewChannel", "SendMessages", "SendMessagesInThreads", "CreatePublicThreads", "CreatePrivateThreads", "EmbedLinks", "AttachFiles", "AddReactions", "UseExternalEmojis", "MentionEveryone", "ManageMessages", "ManageThreads", "ReadMessageHistory", "UseApplicationCommands", "SendVoiceMessages", "Connect", "Speak", "Stream", "UseVAD", "PrioritySpeaker", "RequestToSpeak", "MuteMembers", "DeafenMembers", "MoveMembers", "ManageChannels", "ManageRoles", "ManageWebhooks", "ManageGuild", "ManageEvents", "ManageNicknames", "ChangeNickname", "KickMembers", "BanMembers", "ModerateMembers", "ViewAuditLog", "CreateInstantInvite"];
export type BuilderPermission = (typeof BUILDER_PERMISSIONS)[number];
/** Channel purposes that connect the layout to Qbox features. */
export declare const BUILDER_CHANNEL_PURPOSES: readonly ["welcome", "rules", "verify", "mod-log", "server-log", "tickets-panel", "ticket-transcripts", "applications-review", "staff-log", "level-up", "birthdays", "giveaways", "polls", "fivem-status", "fivem-alerts", "suggestions", "starboard", "announcements", "voice-hub"];
export type BuilderChannelPurpose = (typeof BUILDER_CHANNEL_PURPOSES)[number];
/** `tickets`: the category new ticket channels are created in. */
export declare const BUILDER_CATEGORY_PURPOSES: readonly ["tickets"];
export type BuilderCategoryPurpose = (typeof BUILDER_CATEGORY_PURPOSES)[number];
/** `staff` roles are staff ranks, highest first. */
export declare const BUILDER_ROLE_PURPOSES: readonly ["staff", "department", "verified", "unverified", "ping"];
export type BuilderRolePurpose = (typeof BUILDER_ROLE_PURPOSES)[number];
/** `@everyone`, `@bot` (Qbox itself), or a role key from the blueprint. */
export type BuilderOverwriteTarget = string;
export declare const EVERYONE = "@everyone";
export declare const BOT = "@bot";
export interface BuilderOverwrite {
    readonly target: BuilderOverwriteTarget;
    readonly allow: readonly BuilderPermission[];
    readonly deny: readonly BuilderPermission[];
}
export interface BuilderRole {
    /** Stable slug, unique among roles. */
    readonly key: string;
    readonly name: string;
    /** Hex color such as `#E74C3C`. */
    readonly color: string;
    readonly hoist: boolean;
    readonly mentionable: boolean;
    readonly permissions: readonly BuilderPermission[];
    readonly purpose?: BuilderRolePurpose | undefined;
}
export interface BuilderForumTag {
    /** 1-20 characters. */
    readonly name: string;
    /** A unicode emoji, or `name:id` for a custom emoji. */
    readonly emoji?: string | undefined;
}
export interface BuilderForumPost {
    readonly title: string;
    readonly content: string;
    /** Pin the post to the top of the forum. */
    readonly pin: boolean;
}
/** Forum and media channel setup: guidelines, tags, default reaction, and a first post. */
export interface BuilderForumSetup {
    /** Shown as the channel's post guidelines (Discord's forum topic, up to 4096 characters). */
    readonly guidelines?: string | undefined;
    readonly tags: readonly BuilderForumTag[];
    /** A unicode emoji, or `name:id` for a custom emoji. */
    readonly defaultReactionEmoji?: string | undefined;
    /** Posted after the channel is created. Media channels need an attachment per post, so they get no first post. */
    readonly firstPost?: BuilderForumPost | undefined;
}
export interface BuilderChannel {
    /** Stable slug, unique among categories and channels. */
    readonly key: string;
    readonly name: string;
    readonly type: BuilderChannelType;
    readonly topic?: string | undefined;
    readonly slowmodeSeconds: number;
    readonly nsfw: boolean;
    /** Voice channels only. 0 = no limit. */
    readonly userLimit: number;
    /** Added to the category's overwrites. */
    readonly overwrites: readonly BuilderOverwrite[];
    readonly purpose?: BuilderChannelPurpose | undefined;
    /** FORUM and MEDIA channels only. */
    readonly forum?: BuilderForumSetup | undefined;
}
export interface BuilderCategory {
    readonly key: string;
    readonly name: string;
    readonly overwrites: readonly BuilderOverwrite[];
    readonly channels: readonly BuilderChannel[];
    readonly purpose?: BuilderCategoryPurpose | undefined;
}
/** A complete server layout. Roles are listed highest first. */
export interface BuilderBlueprint {
    readonly roles: readonly BuilderRole[];
    readonly categories: readonly BuilderCategory[];
}
export type BuilderServerType = "FIVEM_RP" | "GAMING" | "COMMUNITY" | "BUSINESS";
export declare const BUILDER_SERVER_TYPES: readonly BuilderServerType[];
export declare const BUILDER_SECTIONS: readonly ["information", "verification", "tickets", "applications", "levels", "giveaways", "polls", "birthdays", "suggestions", "starboard", "media", "forums", "joinToCreate", "fivemStatus", "events", "staffArea", "ageRestricted"];
export type BuilderSection = (typeof BUILDER_SECTIONS)[number];
/** ALL: every staff rank can see and post in department channels. NONE: department roles only. */
export type BuilderStaffAccess = "ALL" | "NONE";
export declare const BUILDER_STAFF_ACCESS: readonly BuilderStaffAccess[];
/** NONE: plain names. KEY: emoji on channels with a purpose and in Start Here, Information, and Support. ALL: every channel. */
export type BuilderChannelEmojis = "NONE" | "KEY" | "ALL";
export declare const BUILDER_CHANNEL_EMOJIS: readonly BuilderChannelEmojis[];
/** BAR: `👋┃welcome`. SPACE: `👋-welcome` for text channels and `🔊 Lounge 1` for voice. */
export type BuilderEmojiSeparator = "SPACE" | "BAR";
export declare const BUILDER_EMOJI_SEPARATORS: readonly BuilderEmojiSeparator[];
export interface BuilderAnswers {
    readonly serverType: BuilderServerType;
    readonly serverName: string;
    /** Staff ranks, highest first. */
    readonly staffRanks: readonly string[];
    /** Each department gets a role and a private category. */
    readonly departments: readonly string[];
    /** Whether staff ranks can see every department channel. Default ALL. */
    readonly staffAccess: BuilderStaffAccess;
    readonly include: Readonly<Record<BuilderSection, boolean>>;
    /** Public voice lounges (0-10). */
    readonly voiceLounges: number;
    /** Photos and clips use Discord media channels (needs Community). Otherwise text channels. */
    readonly useMediaChannels: boolean;
    /** Category names like "📢 INFORMATION". */
    readonly emojiCategories: boolean;
    /** Emoji in channel names. Default ALL. */
    readonly channelEmojis: BuilderChannelEmojis;
    /** How the emoji is joined to the channel name. Default BAR. */
    readonly emojiSeparator: BuilderEmojiSeparator;
    /** What the owner typed into "Describe your server", when the answers came from the AI designer. */
    readonly description?: string | undefined;
}
export interface BuilderTemplate {
    readonly type: BuilderServerType;
    readonly label: string;
    readonly description: string;
    readonly answers: BuilderAnswers;
}
export interface BuilderDraft {
    readonly guildId: string;
    readonly answers: BuilderAnswers;
    readonly blueprint: BuilderBlueprint;
    readonly updatedById?: string | undefined;
    readonly revision: number;
    readonly updatedAt: Date;
}
export interface BuilderDraftInput {
    readonly guildId: string;
    readonly answers: BuilderAnswers;
    readonly blueprint: BuilderBlueprint;
    readonly updatedById?: string | undefined;
    readonly expectedRevision?: number | undefined;
}
export interface BuilderSummary {
    readonly roles: number;
    readonly categories: number;
    readonly channels: number;
    /** Categories plus channels (Discord counts both toward 500). */
    readonly totalChannels: number;
    readonly warnings: readonly string[];
}
/** Who can see and post in a channel, for the blueprint preview. */
export interface BuilderAccess {
    readonly see: string;
    readonly post: string;
}
export type BuilderRunStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "PARTIAL" | "UNDONE";
export type BuilderRunMode = "ADD" | "FRESH" | "WIPE" | "WIPE_AND_BUILD";
/** Modes for the Build tab (add to the server or a fresh layout). */
export declare const BUILDER_RUN_MODES: readonly BuilderRunMode[];
/** Modes the start-run endpoint accepts: the two build modes plus wipe-then-build. */
export declare const BUILDER_START_MODES: readonly BuilderRunMode[];
export type BuilderItemKind = "ROLE" | "CATEGORY" | "CHANNEL" | "LINK" | "EMOJI" | "STICKER";
/** KEPT: a wipe deliberately left an item in place (managed role, above the bot, Community channel). */
export type BuilderItemStatus = "CREATED" | "SKIPPED" | "FAILED" | "DELETED" | "KEPT";
export declare const BUILDER_LINKS: readonly ["moderation", "verification", "tickets", "applications", "staff", "levels", "birthdays", "fivem", "voice-rooms", "welcome", "server-logs", "starboard", "rules"];
export type BuilderLink = (typeof BUILDER_LINKS)[number];
export interface BuilderRun {
    readonly id: string;
    readonly guildId: string;
    readonly status: BuilderRunStatus;
    readonly mode: BuilderRunMode;
    readonly links: readonly BuilderLink[];
    readonly planned: number;
    readonly done: number;
    readonly skipped: number;
    readonly failed: number;
    readonly startedById: string;
    readonly startedByName: string;
    readonly warnings: readonly string[];
    readonly error?: string | undefined;
    /** The server layout captured before a wipe, so the old layout can be rebuilt. */
    readonly snapshot?: WipeSnapshot | undefined;
    readonly startedAt?: Date | undefined;
    readonly finishedAt?: Date | undefined;
    readonly undoneAt?: Date | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export interface BuilderRunCreateData {
    readonly guildId: string;
    readonly mode: BuilderRunMode;
    readonly links: readonly BuilderLink[];
    readonly planned: number;
    readonly startedById: string;
    readonly startedByName: string;
    readonly snapshot?: WipeSnapshot | undefined;
}
export interface BuilderRunPatch {
    readonly status?: BuilderRunStatus;
    readonly done?: number;
    readonly skipped?: number;
    readonly failed?: number;
    readonly warnings?: readonly string[];
    readonly error?: string | null;
    readonly startedAt?: Date;
    readonly finishedAt?: Date;
    readonly undoneAt?: Date;
}
export interface BuilderRunItem {
    readonly id: string;
    readonly runId: string;
    readonly kind: BuilderItemKind;
    readonly key: string;
    readonly name: string;
    readonly discordId?: string | undefined;
    readonly status: BuilderItemStatus;
    readonly error?: string | undefined;
    /** Plain note, e.g. a link summary or a channel type fallback. */
    readonly note?: string | undefined;
    readonly createdAt: Date;
}
export type BuilderRunItemCreateData = Omit<BuilderRunItem, "id" | "createdAt">;
export interface BuilderRunItemPatch {
    readonly status?: BuilderItemStatus;
    readonly error?: string | null;
}
export interface BuilderRunDetail {
    readonly run: BuilderRun;
    readonly items: readonly BuilderRunItem[];
}
export interface BuilderStarter {
    readonly userId: string;
    readonly displayName: string;
    /** The member's Discord role IDs, for the owner-or-administrator wipe check. */
    readonly roleIds?: readonly string[] | undefined;
}
export interface BuilderRepository {
    getDraft(guildId: string): Promise<BuilderDraft | undefined>;
    saveDraft(input: BuilderDraftInput): Promise<BuilderDraft>;
    createRun(input: BuilderRunCreateData): Promise<BuilderRun>;
    updateRun(id: string, patch: BuilderRunPatch): Promise<BuilderRun>;
    getRun(guildId: string, id: string): Promise<BuilderRun | undefined>;
    listRuns(guildId: string, limit: number): Promise<readonly BuilderRun[]>;
    /** A QUEUED or RUNNING run for the guild. */
    findActiveRun(guildId: string): Promise<BuilderRun | undefined>;
    addItem(input: BuilderRunItemCreateData): Promise<BuilderRunItem>;
    updateItem(id: string, patch: BuilderRunItemPatch): Promise<BuilderRunItem>;
    listItems(runId: string): Promise<readonly BuilderRunItem[]>;
    /** Marks every QUEUED or RUNNING run FAILED with `message`. Returns how many. */
    failActiveRuns(message: string, now: Date): Promise<number>;
}
/** Discord channel type numbers. */
export declare const DISCORD_CHANNEL_TYPE: {
    readonly TEXT: 0;
    readonly VOICE: 2;
    readonly CATEGORY: 4;
    readonly ANNOUNCEMENT: 5;
    readonly STAGE: 13;
    readonly FORUM: 15;
    readonly MEDIA: 16;
};
export interface ExistingRole {
    readonly id: string;
    readonly name: string;
    readonly position: number;
    readonly managed: boolean;
    /** Permission bitfield as a string; present when read for the wipe owner-or-administrator check. */
    readonly permissions?: string | undefined;
}
export interface ExistingChannel {
    readonly id: string;
    readonly name: string;
    readonly type: number;
    readonly parentId?: string | undefined;
}
export interface BotStatus {
    readonly userId: string;
    /** Guild-level permission bits from the bot's roles. */
    readonly permissions: bigint;
    /** Position of the bot's highest role. */
    readonly topRolePosition: number;
    /** Position of the highest role in the server. */
    readonly highestRolePosition: number;
    /** The server has Community turned on (needed for announcement, stage, and media channels). */
    readonly community: boolean;
    /** Discord user ID of the guild owner, for the owner-only wipe check. */
    readonly ownerId?: string | undefined;
}
export interface DiscordOverwrite {
    readonly id: string;
    /** 0 = role, 1 = member. */
    readonly type: 0 | 1;
    readonly allow: string;
    readonly deny: string;
}
export interface RoleCreateInput {
    readonly name: string;
    readonly color: number;
    readonly hoist: boolean;
    readonly mentionable: boolean;
    readonly permissions: string;
}
export interface ChannelCreateInput {
    readonly name: string;
    readonly type: number;
    readonly parentId?: string | undefined;
    readonly topic?: string | undefined;
    readonly slowmodeSeconds?: number | undefined;
    readonly nsfw?: boolean | undefined;
    readonly userLimit?: number | undefined;
    readonly overwrites: readonly DiscordOverwrite[];
    /** Forum and media channels: post tags. */
    readonly tags?: readonly BuilderForumTag[] | undefined;
    /** Forum and media channels: the reaction added to every new post. */
    readonly defaultReactionEmoji?: string | undefined;
}
export interface ForumPostInput {
    readonly title: string;
    readonly content: string;
}
/** A role, exactly as Discord has it, captured for a wipe snapshot. */
export interface WipeLayoutRole {
    readonly id: string;
    readonly name: string;
    /** Discord's integer color (0 = no color). */
    readonly color: number;
    readonly hoist: boolean;
    readonly mentionable: boolean;
    /** Permission bitfield as a string. */
    readonly permissions: string;
    readonly position: number;
    readonly managed: boolean;
}
/** A permission overwrite, as Discord has it. `type` 0 = role, 1 = member. */
export interface WipeLayoutOverwrite {
    readonly id: string;
    readonly type: 0 | 1;
    readonly allow: string;
    readonly deny: string;
}
/** A category or channel, exactly as Discord has it, captured for a wipe snapshot. */
export interface WipeLayoutChannel {
    readonly id: string;
    readonly name: string;
    readonly type: number;
    readonly topic?: string | undefined;
    readonly nsfw: boolean;
    readonly slowmodeSeconds: number;
    readonly userLimit: number;
    readonly bitrate?: number | undefined;
    readonly position: number;
    readonly parentId?: string | undefined;
    readonly overwrites: readonly WipeLayoutOverwrite[];
}
/** A custom emoji or sticker. */
export interface WipeExpression {
    readonly id: string;
    readonly name: string;
}
/** Everything a wipe needs to read before deleting. */
export interface WipeLayout {
    readonly name: string;
    readonly community: boolean;
    /** Community channels Discord refuses to delete while Community is on. */
    readonly rulesChannelId?: string | undefined;
    readonly publicUpdatesChannelId?: string | undefined;
    readonly roles: readonly WipeLayoutRole[];
    readonly channels: readonly WipeLayoutChannel[];
}
/** The layout saved with a wipe run, so it can be turned back into a blueprint. */
export interface WipeSnapshot {
    readonly guildName: string;
    readonly botUserId: string;
    readonly community: boolean;
    readonly rulesChannelId?: string | undefined;
    readonly publicUpdatesChannelId?: string | undefined;
    readonly roles: readonly WipeLayoutRole[];
    readonly channels: readonly WipeLayoutChannel[];
    readonly emojis: readonly WipeExpression[];
    readonly stickers: readonly WipeExpression[];
}
/** Which kinds of thing a wipe deletes. Emojis and stickers are off by default. */
export interface WipeInclude {
    readonly channels: boolean;
    readonly roles: boolean;
    readonly emojis: boolean;
}
/** Counts and the kept list for the wipe confirmation dialog. */
export interface WipePreview {
    readonly serverName: string;
    readonly channels: number;
    readonly categories: number;
    readonly roles: number;
    readonly emojis: number;
    readonly stickers: number;
    /** Roles and channels a wipe cannot or will not delete, with why. */
    readonly kept: readonly string[];
    readonly community: boolean;
    /** Missing bot permissions that would stop the wipe. */
    readonly missing: readonly string[];
}
/** Discord operations the builder needs. */
export interface BuilderGateway {
    listRoles(guildId: string): Promise<readonly ExistingRole[]>;
    listChannels(guildId: string): Promise<readonly ExistingChannel[]>;
    botStatus(guildId: string): Promise<BotStatus>;
    createRole(guildId: string, input: RoleCreateInput, reason: string): Promise<string>;
    setRolePositions(guildId: string, positions: readonly {
        readonly id: string;
        readonly position: number;
    }[], reason: string): Promise<void>;
    createChannel(guildId: string, input: ChannelCreateInput, reason: string): Promise<string>;
    /** Starts a post (thread) in a forum or media channel. */
    createForumPost(channelId: string, input: ForumPostInput, reason: string): Promise<{
        readonly threadId: string;
    }>;
    /** Pins a forum post to the top of its channel. */
    pinForumPost(threadId: string, reason: string): Promise<void>;
    deleteChannel(channelId: string, reason: string): Promise<void>;
    deleteRole(guildId: string, roleId: string, reason: string): Promise<void>;
    /** Reads the full current layout (roles and channels) for a wipe. */
    readLayout(guildId: string): Promise<WipeLayout>;
    listEmojis(guildId: string): Promise<readonly WipeExpression[]>;
    listStickers(guildId: string): Promise<readonly WipeExpression[]>;
    deleteEmoji(guildId: string, emojiId: string, reason: string): Promise<void>;
    deleteSticker(guildId: string, stickerId: string, reason: string): Promise<void>;
}
/** Discord's error code when deleting a Community-required channel (rules, public updates). */
export declare const DISCORD_COMMUNITY_CHANNEL_ERROR = 50074;
export interface BuilderPreflight {
    readonly ready: boolean;
    readonly canManageRoles: boolean;
    readonly canManageChannels: boolean;
    readonly community: boolean;
    /** Plain problems and warnings for the owner. */
    readonly messages: readonly string[];
}
/** Discord IDs the build produced (or found), handed to feature links. */
export interface BuilderResolvedIds {
    readonly guildId: string;
    /** Channel ID by purpose. */
    readonly channels: Readonly<Partial<Record<BuilderChannelPurpose, string>>>;
    /** Category ID by purpose. */
    readonly categories: Readonly<Partial<Record<BuilderCategoryPurpose, string>>>;
    /** Discord category ID holding each channel purpose. */
    readonly channelParents: Readonly<Partial<Record<BuilderChannelPurpose, string>>>;
    /** Staff rank roles, highest first. */
    readonly staffRoles: readonly {
        readonly id: string;
        readonly name: string;
        readonly color: string;
    }[];
    readonly verifiedRoleId?: string | undefined;
    readonly unverifiedRoleId?: string | undefined;
    /** Discord ID to name, for summaries. */
    readonly names: Readonly<Record<string, string>>;
}
/** Saves the new layout into an existing Qbox feature's settings. */
export interface BuilderLinkPort {
    /** Applies one link and returns a plain summary such as "Moderation log channel set to #mod-log". */
    apply(link: BuilderLink, ids: BuilderResolvedIds): Promise<string>;
}
export interface BuilderLinkOption {
    readonly link: BuilderLink;
    readonly label: string;
    readonly description: string;
    /** The blueprint has what this link needs. */
    readonly available: boolean;
}
//# sourceMappingURL=types.d.ts.map