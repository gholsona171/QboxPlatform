/* ---------- Blueprint ---------- */

export type BuilderChannelType = "TEXT" | "ANNOUNCEMENT" | "FORUM" | "MEDIA" | "VOICE" | "STAGE";
export const BUILDER_CHANNEL_TYPES: readonly BuilderChannelType[] = ["TEXT", "ANNOUNCEMENT", "FORUM", "MEDIA", "VOICE", "STAGE"];

/** Discord permission names the builder can grant or deny. */
export const BUILDER_PERMISSIONS = [
  "Administrator",
  "ViewChannel",
  "SendMessages",
  "SendMessagesInThreads",
  "CreatePublicThreads",
  "CreatePrivateThreads",
  "EmbedLinks",
  "AttachFiles",
  "AddReactions",
  "UseExternalEmojis",
  "MentionEveryone",
  "ManageMessages",
  "ManageThreads",
  "ReadMessageHistory",
  "UseApplicationCommands",
  "SendVoiceMessages",
  "Connect",
  "Speak",
  "Stream",
  "UseVAD",
  "PrioritySpeaker",
  "RequestToSpeak",
  "MuteMembers",
  "DeafenMembers",
  "MoveMembers",
  "ManageChannels",
  "ManageRoles",
  "ManageWebhooks",
  "ManageGuild",
  "ManageEvents",
  "ManageNicknames",
  "ChangeNickname",
  "KickMembers",
  "BanMembers",
  "ModerateMembers",
  "ViewAuditLog",
  "CreateInstantInvite",
] as const;
export type BuilderPermission = (typeof BUILDER_PERMISSIONS)[number];

/** Channel purposes that connect the layout to Qbox features. */
export const BUILDER_CHANNEL_PURPOSES = [
  "welcome",
  "rules",
  "verify",
  "mod-log",
  "server-log",
  "tickets-panel",
  "ticket-transcripts",
  "applications-review",
  "staff-log",
  "level-up",
  "birthdays",
  "giveaways",
  "polls",
  "fivem-status",
  "fivem-alerts",
  "suggestions",
  "starboard",
  "announcements",
  "voice-hub",
] as const;
export type BuilderChannelPurpose = (typeof BUILDER_CHANNEL_PURPOSES)[number];

/** `tickets`: the category new ticket channels are created in. */
export const BUILDER_CATEGORY_PURPOSES = ["tickets"] as const;
export type BuilderCategoryPurpose = (typeof BUILDER_CATEGORY_PURPOSES)[number];

/** `staff` roles are staff ranks, highest first. */
export const BUILDER_ROLE_PURPOSES = ["staff", "department", "verified", "unverified", "ping"] as const;
export type BuilderRolePurpose = (typeof BUILDER_ROLE_PURPOSES)[number];

/** `@everyone`, `@bot` (Qbox itself), or a role key from the blueprint. */
export type BuilderOverwriteTarget = string;
export const EVERYONE = "@everyone";
export const BOT = "@bot";

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

/* ---------- Questionnaire ---------- */

export type BuilderServerType = "FIVEM_RP" | "GAMING" | "COMMUNITY" | "BUSINESS";
export const BUILDER_SERVER_TYPES: readonly BuilderServerType[] = ["FIVEM_RP", "GAMING", "COMMUNITY", "BUSINESS"];

export const BUILDER_SECTIONS = [
  "information",
  "verification",
  "tickets",
  "applications",
  "levels",
  "giveaways",
  "polls",
  "birthdays",
  "suggestions",
  "starboard",
  "media",
  "forums",
  "joinToCreate",
  "fivemStatus",
  "events",
  "staffArea",
  "ageRestricted",
] as const;
export type BuilderSection = (typeof BUILDER_SECTIONS)[number];

/** ALL: every staff rank can see and post in department channels. NONE: department roles only. */
export type BuilderStaffAccess = "ALL" | "NONE";
export const BUILDER_STAFF_ACCESS: readonly BuilderStaffAccess[] = ["ALL", "NONE"];

/** NONE: plain names. KEY: emoji on channels with a purpose and in Start Here, Information, and Support. ALL: every channel. */
export type BuilderChannelEmojis = "NONE" | "KEY" | "ALL";
export const BUILDER_CHANNEL_EMOJIS: readonly BuilderChannelEmojis[] = ["NONE", "KEY", "ALL"];

/** BAR: `👋┃welcome`. SPACE: `👋-welcome` for text channels and `🔊 Lounge 1` for voice. */
export type BuilderEmojiSeparator = "SPACE" | "BAR";
export const BUILDER_EMOJI_SEPARATORS: readonly BuilderEmojiSeparator[] = ["SPACE", "BAR"];

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

/* ---------- Drafts ---------- */

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

/* ---------- Runs ---------- */

export type BuilderRunStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "PARTIAL" | "UNDONE";
export type BuilderRunMode = "ADD" | "FRESH";
export const BUILDER_RUN_MODES: readonly BuilderRunMode[] = ["ADD", "FRESH"];
export type BuilderItemKind = "ROLE" | "CATEGORY" | "CHANNEL" | "LINK";
export type BuilderItemStatus = "CREATED" | "SKIPPED" | "FAILED" | "DELETED";

export const BUILDER_LINKS = [
  "moderation",
  "verification",
  "tickets",
  "applications",
  "staff",
  "levels",
  "birthdays",
  "fivem",
  "voice-rooms",
  "welcome",
  "server-logs",
  "starboard",
  "rules",
] as const;
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

/* ---------- Discord ---------- */

/** Discord channel type numbers. */
export const DISCORD_CHANNEL_TYPE = {
  TEXT: 0,
  VOICE: 2,
  CATEGORY: 4,
  ANNOUNCEMENT: 5,
  STAGE: 13,
  FORUM: 15,
  MEDIA: 16,
} as const;

export interface ExistingRole {
  readonly id: string;
  readonly name: string;
  readonly position: number;
  readonly managed: boolean;
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

/** Discord operations the builder needs. */
export interface BuilderGateway {
  listRoles(guildId: string): Promise<readonly ExistingRole[]>;
  listChannels(guildId: string): Promise<readonly ExistingChannel[]>;
  botStatus(guildId: string): Promise<BotStatus>;
  createRole(guildId: string, input: RoleCreateInput, reason: string): Promise<string>;
  setRolePositions(guildId: string, positions: readonly { readonly id: string; readonly position: number }[], reason: string): Promise<void>;
  createChannel(guildId: string, input: ChannelCreateInput, reason: string): Promise<string>;
  /** Starts a post (thread) in a forum or media channel. */
  createForumPost(channelId: string, input: ForumPostInput, reason: string): Promise<{ readonly threadId: string }>;
  /** Pins a forum post to the top of its channel. */
  pinForumPost(threadId: string, reason: string): Promise<void>;
  deleteChannel(channelId: string, reason: string): Promise<void>;
  deleteRole(guildId: string, roleId: string, reason: string): Promise<void>;
}

export interface BuilderPreflight {
  readonly ready: boolean;
  readonly canManageRoles: boolean;
  readonly canManageChannels: boolean;
  readonly community: boolean;
  /** Plain problems and warnings for the owner. */
  readonly messages: readonly string[];
}

/* ---------- Feature links ---------- */

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
  readonly staffRoles: readonly { readonly id: string; readonly name: string; readonly color: string }[];
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
