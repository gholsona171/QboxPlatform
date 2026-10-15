/* ---------- Blueprint ---------- */
export const BUILDER_CHANNEL_TYPES = ["TEXT", "ANNOUNCEMENT", "FORUM", "MEDIA", "VOICE", "STAGE"];
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
];
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
];
/** `tickets`: the category new ticket channels are created in. */
export const BUILDER_CATEGORY_PURPOSES = ["tickets"];
/** `staff` roles are staff ranks, highest first. */
export const BUILDER_ROLE_PURPOSES = ["staff", "department", "verified", "unverified", "ping"];
export const EVERYONE = "@everyone";
export const BOT = "@bot";
export const BUILDER_SERVER_TYPES = ["FIVEM_RP", "GAMING", "COMMUNITY", "BUSINESS"];
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
];
export const BUILDER_STAFF_ACCESS = ["ALL", "NONE"];
export const BUILDER_CHANNEL_EMOJIS = ["NONE", "KEY", "ALL"];
export const BUILDER_EMOJI_SEPARATORS = ["SPACE", "BAR"];
/** Modes for the Build tab (add to the server or a fresh layout). */
export const BUILDER_RUN_MODES = ["ADD", "FRESH"];
/** Modes the start-run endpoint accepts: the two build modes plus wipe-then-build. */
export const BUILDER_START_MODES = ["ADD", "FRESH", "WIPE_AND_BUILD"];
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
];
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
};
/** Discord's error code when deleting a Community-required channel (rules, public updates). */
export const DISCORD_COMMUNITY_CHANNEL_ERROR = 50074;
//# sourceMappingURL=types.js.map