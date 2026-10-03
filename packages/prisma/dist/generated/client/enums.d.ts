export declare const ApplicationStatus: {
    readonly PENDING: "PENDING";
    readonly ACCEPTED: "ACCEPTED";
    readonly DENIED: "DENIED";
    readonly WITHDRAWN: "WITHDRAWN";
};
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];
export declare const ApplicationSource: {
    readonly DISCORD: "DISCORD";
    readonly WEB: "WEB";
};
export type ApplicationSource = (typeof ApplicationSource)[keyof typeof ApplicationSource];
export declare const ApplicationVoteType: {
    readonly UP: "UP";
    readonly DOWN: "DOWN";
};
export type ApplicationVoteType = (typeof ApplicationVoteType)[keyof typeof ApplicationVoteType];
export declare const ApplicationButtonStyle: {
    readonly PRIMARY: "PRIMARY";
    readonly SECONDARY: "SECONDARY";
    readonly SUCCESS: "SUCCESS";
    readonly DANGER: "DANGER";
};
export type ApplicationButtonStyle = (typeof ApplicationButtonStyle)[keyof typeof ApplicationButtonStyle];
export declare const PermissionPrincipalType: {
    readonly DISCORD_USER: "DISCORD_USER";
    readonly DISCORD_ROLE: "DISCORD_ROLE";
};
export type PermissionPrincipalType = (typeof PermissionPrincipalType)[keyof typeof PermissionPrincipalType];
export declare const PermissionScopeType: {
    readonly PLATFORM: "PLATFORM";
    readonly DISCORD_GUILD: "DISCORD_GUILD";
};
export type PermissionScopeType = (typeof PermissionScopeType)[keyof typeof PermissionScopeType];
export declare const PermissionAssignmentEffect: {
    readonly ALLOW: "ALLOW";
    readonly DENY: "DENY";
};
export type PermissionAssignmentEffect = (typeof PermissionAssignmentEffect)[keyof typeof PermissionAssignmentEffect];
export declare const PermissionAuditAction: {
    readonly SET_ASSIGNMENT: "SET_ASSIGNMENT";
    readonly REVOKE_ASSIGNMENT: "REVOKE_ASSIGNMENT";
    readonly DISABLE_ASSIGNMENT: "DISABLE_ASSIGNMENT";
    readonly ENABLE_ASSIGNMENT: "ENABLE_ASSIGNMENT";
    readonly EXPIRE_ASSIGNMENT: "EXPIRE_ASSIGNMENT";
    readonly DISABLE_PRINCIPAL: "DISABLE_PRINCIPAL";
    readonly ENABLE_PRINCIPAL: "ENABLE_PRINCIPAL";
    readonly DISABLE_GUILD: "DISABLE_GUILD";
    readonly ENABLE_GUILD: "ENABLE_GUILD";
    readonly DISABLE_DEFINITION: "DISABLE_DEFINITION";
    readonly ENABLE_DEFINITION: "ENABLE_DEFINITION";
    readonly OWNER_PROTECTION_REJECTION: "OWNER_PROTECTION_REJECTION";
};
export type PermissionAuditAction = (typeof PermissionAuditAction)[keyof typeof PermissionAuditAction];
export declare const PermissionMutationReasonCode: {
    readonly BOOTSTRAP: "BOOTSTRAP";
    readonly ADMINISTRATOR_ACTION: "ADMINISTRATOR_ACTION";
    readonly SECURITY_RESPONSE: "SECURITY_RESPONSE";
    readonly ROLE_SYNCHRONIZATION: "ROLE_SYNCHRONIZATION";
    readonly MIGRATION: "MIGRATION";
    readonly EXPIRATION: "EXPIRATION";
    readonly SYSTEM_MAINTENANCE: "SYSTEM_MAINTENANCE";
};
export type PermissionMutationReasonCode = (typeof PermissionMutationReasonCode)[keyof typeof PermissionMutationReasonCode];
export declare const PermissionAuditActorType: {
    readonly PRINCIPAL: "PRINCIPAL";
    readonly SYSTEM: "SYSTEM";
};
export type PermissionAuditActorType = (typeof PermissionAuditActorType)[keyof typeof PermissionAuditActorType];
export declare const PlatformUserStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly SUSPENDED: "SUSPENDED";
    readonly DISABLED: "DISABLED";
    readonly DELETED: "DELETED";
};
export type PlatformUserStatus = (typeof PlatformUserStatus)[keyof typeof PlatformUserStatus];
export declare const PlatformUserStatusReasonCode: {
    readonly ACCOUNT_CREATED: "ACCOUNT_CREATED";
    readonly USER_REQUEST: "USER_REQUEST";
    readonly ADMINISTRATOR_ACTION: "ADMINISTRATOR_ACTION";
    readonly SECURITY_RESPONSE: "SECURITY_RESPONSE";
    readonly RECOVERY: "RECOVERY";
    readonly IDENTITY_UNLINKED: "IDENTITY_UNLINKED";
    readonly ACCOUNT_MERGED: "ACCOUNT_MERGED";
};
export type PlatformUserStatusReasonCode = (typeof PlatformUserStatusReasonCode)[keyof typeof PlatformUserStatusReasonCode];
export declare const AuthenticationProvider: {
    readonly DISCORD: "DISCORD";
};
export type AuthenticationProvider = (typeof AuthenticationProvider)[keyof typeof AuthenticationProvider];
export declare const BrowserSessionStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly REVOKED: "REVOKED";
    readonly EXPIRED: "EXPIRED";
    readonly ROTATED: "ROTATED";
};
export type BrowserSessionStatus = (typeof BrowserSessionStatus)[keyof typeof BrowserSessionStatus];
export declare const BrowserSessionRevocationReason: {
    readonly LOGOUT: "LOGOUT";
    readonly GLOBAL_LOGOUT: "GLOBAL_LOGOUT";
    readonly ACCOUNT_STATUS_CHANGED: "ACCOUNT_STATUS_CHANGED";
    readonly AUTHENTICATION_REVISION_CHANGED: "AUTHENTICATION_REVISION_CHANGED";
    readonly IDENTITY_UNLINKED: "IDENTITY_UNLINKED";
    readonly GUILD_DEPARTURE: "GUILD_DEPARTURE";
    readonly SECURITY_RESPONSE: "SECURITY_RESPONSE";
    readonly SESSION_LIMIT: "SESSION_LIMIT";
    readonly ROTATED: "ROTATED";
    readonly EXPIRED: "EXPIRED";
};
export type BrowserSessionRevocationReason = (typeof BrowserSessionRevocationReason)[keyof typeof BrowserSessionRevocationReason];
export declare const OAuthTransactionState: {
    readonly PENDING: "PENDING";
    readonly CLAIMED: "CLAIMED";
    readonly COMPLETED: "COMPLETED";
    readonly FAILED: "FAILED";
    readonly CANCELLED: "CANCELLED";
    readonly EXPIRED: "EXPIRED";
};
export type OAuthTransactionState = (typeof OAuthTransactionState)[keyof typeof OAuthTransactionState];
export declare const OAuthTransactionPurpose: {
    readonly LOGIN: "LOGIN";
    readonly LINK: "LINK";
    readonly REAUTHENTICATE: "REAUTHENTICATE";
};
export type OAuthTransactionPurpose = (typeof OAuthTransactionPurpose)[keyof typeof OAuthTransactionPurpose];
export declare const OAuthTransactionFailureReason: {
    readonly PROVIDER_REJECTED: "PROVIDER_REJECTED";
    readonly INVALID_CALLBACK: "INVALID_CALLBACK";
    readonly STATE_MISMATCH: "STATE_MISMATCH";
    readonly BROWSER_BINDING_MISMATCH: "BROWSER_BINDING_MISMATCH";
    readonly PKCE_MISMATCH: "PKCE_MISMATCH";
    readonly IDENTITY_CONFLICT: "IDENTITY_CONFLICT";
    readonly DEPENDENCY_UNAVAILABLE: "DEPENDENCY_UNAVAILABLE";
    readonly CANCELLED_BY_USER: "CANCELLED_BY_USER";
    readonly EXPIRED: "EXPIRED";
};
export type OAuthTransactionFailureReason = (typeof OAuthTransactionFailureReason)[keyof typeof OAuthTransactionFailureReason];
export declare const OAuthPkceMode: {
    readonly DISABLED_UNVERIFIED: "DISABLED_UNVERIFIED";
    readonly S256_VERIFIED: "S256_VERIFIED";
};
export type OAuthPkceMode = (typeof OAuthPkceMode)[keyof typeof OAuthPkceMode];
export declare const OAuthCredentialRevocationReason: {
    readonly IDENTITY_UNLINKED: "IDENTITY_UNLINKED";
    readonly ACCOUNT_DISABLED: "ACCOUNT_DISABLED";
    readonly PROVIDER_REVOKED: "PROVIDER_REVOKED";
    readonly SECURITY_RESPONSE: "SECURITY_RESPONSE";
    readonly REFRESH_FAILED: "REFRESH_FAILED";
};
export type OAuthCredentialRevocationReason = (typeof OAuthCredentialRevocationReason)[keyof typeof OAuthCredentialRevocationReason];
export declare const DiscordGuildMembershipStatus: {
    readonly PRESENT: "PRESENT";
    readonly ABSENT: "ABSENT";
    readonly UNKNOWN: "UNKNOWN";
};
export type DiscordGuildMembershipStatus = (typeof DiscordGuildMembershipStatus)[keyof typeof DiscordGuildMembershipStatus];
export declare const DiscordGuildMembershipSource: {
    readonly DISCORD_BOT: "DISCORD_BOT";
    readonly DISCORD_OAUTH: "DISCORD_OAUTH";
    readonly COMBINED: "COMBINED";
};
export type DiscordGuildMembershipSource = (typeof DiscordGuildMembershipSource)[keyof typeof DiscordGuildMembershipSource];
export declare const RoleMenuPresentationType: {
    readonly BUTTONS: "BUTTONS";
    readonly SELECT_MENU: "SELECT_MENU";
    readonly REACTIONS: "REACTIONS";
};
export type RoleMenuPresentationType = (typeof RoleMenuPresentationType)[keyof typeof RoleMenuPresentationType];
export declare const RoleMenuAssignmentMode: {
    readonly TOGGLE: "TOGGLE";
    readonly ADD_ONLY: "ADD_ONLY";
    readonly REMOVE_ONLY: "REMOVE_ONLY";
    readonly EXCLUSIVE: "EXCLUSIVE";
};
export type RoleMenuAssignmentMode = (typeof RoleMenuAssignmentMode)[keyof typeof RoleMenuAssignmentMode];
export declare const RoleMenuStatus: {
    readonly DRAFT: "DRAFT";
    readonly PUBLISHED: "PUBLISHED";
    readonly DISABLED: "DISABLED";
};
export type RoleMenuStatus = (typeof RoleMenuStatus)[keyof typeof RoleMenuStatus];
export declare const WelcomeGoodbyeKind: {
    readonly WELCOME: "WELCOME";
    readonly GOODBYE: "GOODBYE";
};
export type WelcomeGoodbyeKind = (typeof WelcomeGoodbyeKind)[keyof typeof WelcomeGoodbyeKind];
export declare const CommunityCounterType: {
    readonly TOTAL_MEMBERS: "TOTAL_MEMBERS";
    readonly HUMANS: "HUMANS";
    readonly BOTS: "BOTS";
    readonly ONLINE: "ONLINE";
    readonly ROLE: "ROLE";
};
export type CommunityCounterType = (typeof CommunityCounterType)[keyof typeof CommunityCounterType];
export declare const CommunityContentMode: {
    readonly REDACTED: "REDACTED";
    readonly WHEN_AVAILABLE: "WHEN_AVAILABLE";
};
export type CommunityContentMode = (typeof CommunityContentMode)[keyof typeof CommunityContentMode];
export declare const CustomCommandTriggerMode: {
    readonly SLASH_ONLY: "SLASH_ONLY";
    readonly EXACT: "EXACT";
    readonly STARTS_WITH: "STARTS_WITH";
    readonly CONTAINS: "CONTAINS";
};
export type CustomCommandTriggerMode = (typeof CustomCommandTriggerMode)[keyof typeof CustomCommandTriggerMode];
export declare const SuggestionStatus: {
    readonly SUBMITTED: "SUBMITTED";
    readonly UNDER_REVIEW: "UNDER_REVIEW";
    readonly APPROVED: "APPROVED";
    readonly DENIED: "DENIED";
    readonly IMPLEMENTED: "IMPLEMENTED";
};
export type SuggestionStatus = (typeof SuggestionStatus)[keyof typeof SuggestionStatus];
export declare const StarboardChannelMode: {
    readonly ALLOWLIST: "ALLOWLIST";
    readonly DENYLIST: "DENYLIST";
};
export type StarboardChannelMode = (typeof StarboardChannelMode)[keyof typeof StarboardChannelMode];
export declare const StarboardNsfwMode: {
    readonly ALLOW: "ALLOW";
    readonly BLOCK: "BLOCK";
};
export type StarboardNsfwMode = (typeof StarboardNsfwMode)[keyof typeof StarboardNsfwMode];
export declare const AuthenticationAuditAction: {
    readonly LOGIN_START: "LOGIN_START";
    readonly LOGIN_SUCCESS: "LOGIN_SUCCESS";
    readonly LOGIN_FAILURE: "LOGIN_FAILURE";
    readonly OAUTH_CLAIM: "OAUTH_CLAIM";
    readonly OAUTH_COMPLETION: "OAUTH_COMPLETION";
    readonly OAUTH_REJECTION: "OAUTH_REJECTION";
    readonly OAUTH_REPLAY: "OAUTH_REPLAY";
    readonly SESSION_CREATION: "SESSION_CREATION";
    readonly SESSION_ROTATION: "SESSION_ROTATION";
    readonly SESSION_EXPIRY: "SESSION_EXPIRY";
    readonly SESSION_REVOCATION: "SESSION_REVOCATION";
    readonly LOGOUT: "LOGOUT";
    readonly GLOBAL_LOGOUT: "GLOBAL_LOGOUT";
    readonly IDENTITY_LINK: "IDENTITY_LINK";
    readonly IDENTITY_UNLINK: "IDENTITY_UNLINK";
    readonly ACCOUNT_STATUS_CHANGE: "ACCOUNT_STATUS_CHANGE";
    readonly GUILD_DEPARTURE: "GUILD_DEPARTURE";
    readonly GUILD_REJOIN: "GUILD_REJOIN";
    readonly RECOVERY: "RECOVERY";
};
export type AuthenticationAuditAction = (typeof AuthenticationAuditAction)[keyof typeof AuthenticationAuditAction];
export declare const AuthenticationAuditOutcome: {
    readonly SUCCESS: "SUCCESS";
    readonly FAILURE: "FAILURE";
    readonly REJECTED: "REJECTED";
};
export type AuthenticationAuditOutcome = (typeof AuthenticationAuditOutcome)[keyof typeof AuthenticationAuditOutcome];
export declare const AuthenticationAuditReasonCode: {
    readonly REQUESTED: "REQUESTED";
    readonly COMPLETED: "COMPLETED";
    readonly INVALID_CREDENTIAL: "INVALID_CREDENTIAL";
    readonly INVALID_STATE: "INVALID_STATE";
    readonly EXPIRED: "EXPIRED";
    readonly REVOKED: "REVOKED";
    readonly REPLAY_DETECTED: "REPLAY_DETECTED";
    readonly PROVIDER_REJECTED: "PROVIDER_REJECTED";
    readonly DEPENDENCY_UNAVAILABLE: "DEPENDENCY_UNAVAILABLE";
    readonly ACCOUNT_UNAVAILABLE: "ACCOUNT_UNAVAILABLE";
    readonly IDENTITY_CONFLICT: "IDENTITY_CONFLICT";
    readonly GUILD_MEMBERSHIP_CHANGED: "GUILD_MEMBERSHIP_CHANGED";
    readonly ADMINISTRATOR_ACTION: "ADMINISTRATOR_ACTION";
    readonly SECURITY_RESPONSE: "SECURITY_RESPONSE";
    readonly USER_ACTION: "USER_ACTION";
    readonly RECOVERY: "RECOVERY";
    readonly SYSTEM_MAINTENANCE: "SYSTEM_MAINTENANCE";
};
export type AuthenticationAuditReasonCode = (typeof AuthenticationAuditReasonCode)[keyof typeof AuthenticationAuditReasonCode];
export declare const AuthenticationAuditActorType: {
    readonly PLATFORM_USER: "PLATFORM_USER";
    readonly SERVICE: "SERVICE";
};
export type AuthenticationAuditActorType = (typeof AuthenticationAuditActorType)[keyof typeof AuthenticationAuditActorType];
export declare const BuilderRunStatus: {
    readonly QUEUED: "QUEUED";
    readonly RUNNING: "RUNNING";
    readonly SUCCEEDED: "SUCCEEDED";
    readonly FAILED: "FAILED";
    readonly PARTIAL: "PARTIAL";
    readonly UNDONE: "UNDONE";
};
export type BuilderRunStatus = (typeof BuilderRunStatus)[keyof typeof BuilderRunStatus];
export declare const BuilderRunMode: {
    readonly ADD: "ADD";
    readonly FRESH: "FRESH";
    readonly WIPE: "WIPE";
    readonly WIPE_AND_BUILD: "WIPE_AND_BUILD";
};
export type BuilderRunMode = (typeof BuilderRunMode)[keyof typeof BuilderRunMode];
export declare const BuilderItemKind: {
    readonly ROLE: "ROLE";
    readonly CATEGORY: "CATEGORY";
    readonly CHANNEL: "CHANNEL";
    readonly LINK: "LINK";
    readonly EMOJI: "EMOJI";
    readonly STICKER: "STICKER";
};
export type BuilderItemKind = (typeof BuilderItemKind)[keyof typeof BuilderItemKind];
export declare const BuilderItemStatus: {
    readonly CREATED: "CREATED";
    readonly SKIPPED: "SKIPPED";
    readonly FAILED: "FAILED";
    readonly DELETED: "DELETED";
    readonly KEPT: "KEPT";
};
export type BuilderItemStatus = (typeof BuilderItemStatus)[keyof typeof BuilderItemStatus];
export declare const GamesServerKind: {
    readonly MINECRAFT_JAVA: "MINECRAFT_JAVA";
    readonly MINECRAFT_BEDROCK: "MINECRAFT_BEDROCK";
    readonly STEAM: "STEAM";
};
export type GamesServerKind = (typeof GamesServerKind)[keyof typeof GamesServerKind];
export declare const GiveawayStatus: {
    readonly RUNNING: "RUNNING";
    readonly PAUSED: "PAUSED";
    readonly ENDED: "ENDED";
    readonly CANCELLED: "CANCELLED";
};
export type GiveawayStatus = (typeof GiveawayStatus)[keyof typeof GiveawayStatus];
export declare const LevelUpMode: {
    readonly CURRENT: "CURRENT";
    readonly CHANNEL: "CHANNEL";
    readonly DM: "DM";
    readonly OFF: "OFF";
};
export type LevelUpMode = (typeof LevelUpMode)[keyof typeof LevelUpMode];
export declare const LevelRewardMode: {
    readonly STACK: "STACK";
    readonly HIGHEST: "HIGHEST";
};
export type LevelRewardMode = (typeof LevelRewardMode)[keyof typeof LevelRewardMode];
export declare const MessagesLookMode: {
    readonly FILL: "FILL";
    readonly OVERRIDE: "OVERRIDE";
};
export type MessagesLookMode = (typeof MessagesLookMode)[keyof typeof MessagesLookMode];
export declare const ModerationCaseType: {
    readonly WARN: "WARN";
    readonly TIMEOUT: "TIMEOUT";
    readonly UNTIMEOUT: "UNTIMEOUT";
    readonly KICK: "KICK";
    readonly BAN: "BAN";
    readonly UNBAN: "UNBAN";
    readonly SOFTBAN: "SOFTBAN";
    readonly NOTE: "NOTE";
};
export type ModerationCaseType = (typeof ModerationCaseType)[keyof typeof ModerationCaseType];
export declare const ModerationCaseSource: {
    readonly DISCORD: "DISCORD";
    readonly WEB: "WEB";
    readonly AUTOMOD: "AUTOMOD";
    readonly EXTERNAL: "EXTERNAL";
};
export type ModerationCaseSource = (typeof ModerationCaseSource)[keyof typeof ModerationCaseSource];
export declare const MusicLoopMode: {
    readonly OFF: "OFF";
    readonly TRACK: "TRACK";
    readonly QUEUE: "QUEUE";
};
export type MusicLoopMode = (typeof MusicLoopMode)[keyof typeof MusicLoopMode];
export declare const MusicPlayerState: {
    readonly IDLE: "IDLE";
    readonly PLAYING: "PLAYING";
    readonly PAUSED: "PAUSED";
    readonly BUFFERING: "BUFFERING";
};
export type MusicPlayerState = (typeof MusicPlayerState)[keyof typeof MusicPlayerState];
export declare const PollStatus: {
    readonly OPEN: "OPEN";
    readonly CLOSED: "CLOSED";
};
export type PollStatus = (typeof PollStatus)[keyof typeof PollStatus];
export declare const PollResultsVisibility: {
    readonly LIVE: "LIVE";
    readonly AFTER_CLOSE: "AFTER_CLOSE";
};
export type PollResultsVisibility = (typeof PollResultsVisibility)[keyof typeof PollResultsVisibility];
export declare const ScheduledMessageType: {
    readonly ONCE: "ONCE";
    readonly INTERVAL: "INTERVAL";
    readonly DAILY: "DAILY";
    readonly WEEKLY: "WEEKLY";
    readonly MONTHLY: "MONTHLY";
};
export type ScheduledMessageType = (typeof ScheduledMessageType)[keyof typeof ScheduledMessageType];
export declare const StaffMemberStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly LOA: "LOA";
    readonly SUSPENDED: "SUSPENDED";
    readonly RETIRED: "RETIRED";
};
export type StaffMemberStatus = (typeof StaffMemberStatus)[keyof typeof StaffMemberStatus];
export declare const StaffRecordType: {
    readonly HIRE: "HIRE";
    readonly PROMOTE: "PROMOTE";
    readonly DEMOTE: "DEMOTE";
    readonly FIRE: "FIRE";
    readonly LOA_START: "LOA_START";
    readonly LOA_END: "LOA_END";
    readonly NOTE: "NOTE";
    readonly STRIKE: "STRIKE";
};
export type StaffRecordType = (typeof StaffRecordType)[keyof typeof StaffRecordType];
export declare const StaffLeaveStatus: {
    readonly PENDING: "PENDING";
    readonly APPROVED: "APPROVED";
    readonly ACTIVE: "ACTIVE";
    readonly ENDED: "ENDED";
    readonly DENIED: "DENIED";
    readonly CANCELLED: "CANCELLED";
};
export type StaffLeaveStatus = (typeof StaffLeaveStatus)[keyof typeof StaffLeaveStatus];
export declare const StreamsPlatform: {
    readonly TWITCH: "TWITCH";
    readonly KICK: "KICK";
    readonly YOUTUBE: "YOUTUBE";
};
export type StreamsPlatform = (typeof StreamsPlatform)[keyof typeof StreamsPlatform];
export declare const StreamsEndedBehavior: {
    readonly KEEP: "KEEP";
    readonly EDIT: "EDIT";
    readonly DELETE: "DELETE";
};
export type StreamsEndedBehavior = (typeof StreamsEndedBehavior)[keyof typeof StreamsEndedBehavior];
export declare const TicketMode: {
    readonly CHANNEL: "CHANNEL";
    readonly THREAD: "THREAD";
};
export type TicketMode = (typeof TicketMode)[keyof typeof TicketMode];
export declare const TicketStatus: {
    readonly OPEN: "OPEN";
    readonly CLAIMED: "CLAIMED";
    readonly PENDING: "PENDING";
    readonly CLOSED: "CLOSED";
};
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];
export declare const TicketPriority: {
    readonly LOW: "LOW";
    readonly NORMAL: "NORMAL";
    readonly HIGH: "HIGH";
    readonly URGENT: "URGENT";
};
export type TicketPriority = (typeof TicketPriority)[keyof typeof TicketPriority];
export declare const TicketPanelStyle: {
    readonly BUTTONS: "BUTTONS";
    readonly SELECT_MENU: "SELECT_MENU";
};
export type TicketPanelStyle = (typeof TicketPanelStyle)[keyof typeof TicketPanelStyle];
export declare const TicketMessageSource: {
    readonly DISCORD: "DISCORD";
    readonly WEB: "WEB";
    readonly SYSTEM: "SYSTEM";
};
export type TicketMessageSource = (typeof TicketMessageSource)[keyof typeof TicketMessageSource];
export declare const TicketCloseAction: {
    readonly ARCHIVE: "ARCHIVE";
    readonly DELETE: "DELETE";
};
export type TicketCloseAction = (typeof TicketCloseAction)[keyof typeof TicketCloseAction];
export declare const VerificationMode: {
    readonly BUTTON: "BUTTON";
    readonly CAPTCHA: "CAPTCHA";
    readonly QUESTION: "QUESTION";
};
export type VerificationMode = (typeof VerificationMode)[keyof typeof VerificationMode];
export declare const VerificationAgeAction: {
    readonly DENY: "DENY";
    readonly KICK: "KICK";
    readonly FLAG: "FLAG";
};
export type VerificationAgeAction = (typeof VerificationAgeAction)[keyof typeof VerificationAgeAction];
export declare const VerificationAttemptResult: {
    readonly PASSED: "PASSED";
    readonly FAILED: "FAILED";
    readonly DENIED_AGE: "DENIED_AGE";
    readonly KICKED: "KICKED";
    readonly MANUAL: "MANUAL";
    readonly REVOKED: "REVOKED";
};
export type VerificationAttemptResult = (typeof VerificationAttemptResult)[keyof typeof VerificationAttemptResult];
export declare const VerificationAttemptSource: {
    readonly DISCORD: "DISCORD";
    readonly WEB: "WEB";
    readonly AUTOMATIC: "AUTOMATIC";
};
export type VerificationAttemptSource = (typeof VerificationAttemptSource)[keyof typeof VerificationAttemptSource];
//# sourceMappingURL=enums.d.ts.map