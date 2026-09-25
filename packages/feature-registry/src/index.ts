export type FeatureStatus = "LIVE" | "PARTIAL" | "DISABLED" | "PLANNED";

export interface FeatureRegistryRecord {
  readonly id: string;
  readonly displayName: string;
  readonly status: FeatureStatus;
  readonly discordCommands: readonly string[];
  readonly discordInteractions: readonly string[];
  readonly automaticHandlers: readonly string[];
  readonly apiRoutes: readonly string[];
  readonly portalRoute: string;
  readonly requiredPermissions: readonly string[];
  readonly persistence: readonly string[];
  readonly discordFallbackAvailable: boolean;
  readonly portalAvailable: boolean;
}

export const featureRegistry = [
  live("command-center", "Command Center", ["ping", "adminping"], [], [], [], "/discord?tab=overview", [], [], true, true),
  live("role-management", "Role Management", ["roles"], [], [], ["/api/v1/discord/roles", "/api/v1/discord/resources/roles"], "/discord?tab=role-management", ["discord.roles.manage"], ["DiscordRoleAuditEvent", "RoleManagementDependencyRepository"], true, true),
  live("role-menus", "Role Menus", ["role-menu"], ["role-menu buttons", "select menus", "reactions"], ["messageReactionAdd", "messageReactionRemove"], ["/api/v1/discord/role-menus"], "/discord?tab=roles", ["discord.role-menus.manage"], ["RoleMenu", "RoleMenuOption", "PrismaRoleMenuRepository"], true, true),
  live("welcome-goodbye", "Welcome and Goodbye", ["welcome", "goodbye"], [], ["guildMemberAdd", "guildMemberRemove"], ["/api/v1/discord/welcome", "/api/v1/discord/goodbye"], "/discord?tab=welcome", ["discord.welcome.manage"], ["WelcomeGoodbyeConfig"], true, true),
  live("autoroles", "Autoroles", ["autorole"], [], ["guildMemberAdd"], ["/api/v1/discord/autoroles"], "/discord?tab=autoroles", ["discord.autoroles.manage"], ["AutoroleConfig", "AutoroleRule"], true, true),
  live("rules", "Rules", ["rules"], ["rules accept button"], [], ["/api/v1/discord/rules"], "/discord?tab=rules", ["discord.rules.manage"], ["RulesConfig"], true, true),
  live("member-counters", "Member Counters", ["counter"], [], ["guildMemberAdd", "guildMemberRemove", "counter timer"], ["/api/v1/discord/counters"], "/discord?tab=counters", ["discord.counters.manage"], ["CommunityCounter"], true, true),
  live("server-logs", "Server Logs", ["logs"], [], ["member/log events"], ["/api/v1/discord/logs"], "/discord?tab=logs", ["discord.logs.manage"], ["ServerLogConfig"], true, true),
  live("embeds-announcements", "Embeds and Announcements", ["embed", "announce"], [], [], ["/api/v1/discord/embeds"], "/discord?tab=announcements", ["discord.embeds.manage"], ["EmbedTemplate"], true, true),
  live("custom-commands", "Custom Commands", ["custom"], [], ["messageCreate"], ["/api/v1/discord/custom-commands"], "/discord?tab=custom", ["discord.custom-commands.manage"], ["CustomCommand"], true, true),
  live("suggestions", "Suggestions", ["suggest"], [], [], ["/api/v1/discord/suggestions"], "/discord?tab=suggestions", ["discord.suggestions.manage"], ["Suggestion"], true, true),
  live("starboard", "Starboard", ["starboard"], [], ["messageReactionAdd", "messageDelete"], ["/api/v1/discord/starboard"], "/discord?tab=starboard", ["discord.starboard.manage"], ["StarboardConfig", "StarboardEntry"], true, true),
  live("applications", "Applications", ["apply", "applications"], ["application panel buttons", "form picker", "paged application forms", "accept/deny/vote buttons", "decision reason forms"], [], ["/api/v1/applications", "/api/v1/applications/me", "/api/v1/applications/overview", "/api/v1/applications/forms", "/api/v1/applications/panels"], "/applications", ["applications.review", "applications.manage"], ["ApplicationForm", "ApplicationPanel", "Application", "ApplicationVote", "ApplicationNote", "ApplicationCounter"], true, true),
  live("tickets", "Tickets", ["ticket", "tickets"], ["ticket panel buttons", "ticket select menus", "ticket forms", "close/claim/reopen/transcript buttons", "feedback ratings"], ["messageCreate", "channelDelete", "threadDelete", "auto-close timer"], ["/api/v1/tickets", "/api/v1/tickets/overview", "/api/v1/tickets/settings", "/api/v1/tickets/categories", "/api/v1/tickets/panels"], "/tickets", ["tickets.manage", "tickets.handle"], ["TicketSettings", "TicketCategory", "TicketPanel", "Ticket", "TicketMessage", "TicketEvent"], true, true),
  live("staff", "Staff", ["staff"], ["leave approve/deny buttons"], ["auto clock-out and leave start/end timer"], ["/api/v1/staff/overview", "/api/v1/staff/me", "/api/v1/staff/members", "/api/v1/staff/leaves", "/api/v1/staff/shifts", "/api/v1/staff/leaderboard", "/api/v1/staff/ranks", "/api/v1/staff/settings"], "/staff", ["staff.view", "staff.manage", "staff.shifts"], ["StaffSettings", "StaffRank", "StaffMember", "StaffRecord", "StaffStrike", "StaffLeave", "StaffShift"], true, true),
  live("moderation", "Moderation", ["mod"], ["automod message checks"], ["messageCreate", "guildBanAdd", "guildBanRemove", "guildMemberRemove", "expired ban timer"], ["/api/v1/moderation/overview", "/api/v1/moderation/cases", "/api/v1/moderation/actions", "/api/v1/moderation/settings"], "/moderation", ["moderation.view", "moderation.warn", "moderation.timeout", "moderation.kick", "moderation.ban", "moderation.messages", "moderation.manage"], ["ModerationSettings", "ModerationCase"], true, true),
  live("verification", "Verification", ["verify"], ["verification panel button", "captcha code form", "question form"], ["guildMemberAdd", "guildMemberRemove", "unverified kick timer"], ["/api/v1/verification/overview", "/api/v1/verification/attempts", "/api/v1/verification/members", "/api/v1/verification/settings", "/api/v1/verification/panel"], "/verification", ["verification.manage", "verification.members"], ["VerificationSettings", "VerificationAttempt", "VerificationPendingMember"], true, true),
  live("polls", "Polls", ["poll"], ["poll vote buttons", "poll choice menus", "remove vote button"], ["poll end timer"], ["/api/v1/polls", "/api/v1/polls/overview", "/api/v1/polls/:id/close", "/api/v1/polls/:id/reopen", "/api/v1/polls/:id/export"], "/polls", ["polls.create", "polls.manage"], ["PollCounter", "Poll", "PollVote"], true, true),
  live("giveaways", "Giveaways", ["giveaway"], ["giveaway enter button"], ["giveaway end timer"], ["/api/v1/giveaways", "/api/v1/giveaways/overview", "/api/v1/giveaways/:id/end", "/api/v1/giveaways/:id/reroll", "/api/v1/giveaways/:id/cancel", "/api/v1/giveaways/:id/pause", "/api/v1/giveaways/:id/resume"], "/giveaways", ["giveaways.manage"], ["GiveawayCounter", "Giveaway", "GiveawayEntry"], true, true),
  live("birthdays", "Birthdays", ["birthday"], ["birthday confirmation buttons"], ["birthday timer"], ["/api/v1/birthdays", "/api/v1/birthdays/overview", "/api/v1/birthdays/me", "/api/v1/birthdays/members", "/api/v1/birthdays/settings"], "/birthdays", ["birthdays.manage"], ["BirthdaySettings", "Birthday"], true, true),
  live("scheduled-messages", "Scheduled Messages", ["schedule"], [], ["scheduled message timer"], ["/api/v1/scheduled-messages", "/api/v1/scheduled-messages/runs"], "/scheduled", ["scheduled.manage"], ["ScheduledMessage", "ScheduledMessageRun"], true, true),
  live("levels-rewards", "Levels and Rewards", ["rank", "leaderboard", "levels"], [], ["messageCreate", "voiceStateUpdate", "voice XP timer"], ["/api/v1/levels/leaderboard", "/api/v1/levels/overview", "/api/v1/levels/members", "/api/v1/levels/settings", "/api/v1/levels/reset"], "/levels", ["levels.manage"], ["LevelSettings", "LevelMember"], true, true),
  live("voice-rooms", "Voice Rooms", ["voice"], ["voice room control panel buttons", "member pickers", "rename and limit forms"], ["voiceStateUpdate", "channelDelete", "empty room timer", "startup cleanup"], ["/api/v1/voice/overview", "/api/v1/voice/settings", "/api/v1/voice/hubs", "/api/v1/voice/rooms"], "/voice", ["voice.manage"], ["VoiceSettings", "VoiceHub", "VoiceRoom"], true, true),
  live("knowledge-base", "Knowledge Base", ["faq", "kb", "ask"], ["faq/kb title autocomplete", "auto-answer suggestions"], ["messageCreate", "interactionCreate (autocomplete)"], ["/api/v1/knowledge/overview", "/api/v1/knowledge/articles", "/api/v1/knowledge/categories", "/api/v1/knowledge/settings"], "/knowledge", ["knowledge.manage"], ["KnowledgeSettings", "KnowledgeCategory", "KnowledgeArticle"], true, true),
  live("fivem-server", "FiveM Server", ["fivem"], ["connect link button"], ["status update timer", "restart warning timer"], ["/api/v1/fivem/overview", "/api/v1/fivem/status", "/api/v1/fivem/history", "/api/v1/fivem/settings", "/api/v1/fivem/test"], "/fivem", ["fivem.manage"], ["FivemSettings", "FivemStatusSnapshot"], true, true),
  live("streams", "Streams", ["streams"], ["watch link button"], ["stream check timer"], ["/api/v1/streams/overview", "/api/v1/streams/settings", "/api/v1/streams/resolve", "/api/v1/streams/subscriptions", "/api/v1/streams/subscriptions/:id", "/api/v1/streams/subscriptions/:id/test"], "/streams", ["streams.manage"], ["StreamsSettings", "StreamsSubscription"], true, true),
  live("server-builder", "Server Builder", ["builder"], [], ["background build and undo runs", "interrupted run recovery"], ["/api/v1/builder/overview", "/api/v1/builder/draft", "/api/v1/builder/generate", "/api/v1/builder/runs", "/api/v1/builder/runs/:id", "/api/v1/builder/runs/:id/undo"], "/builder", ["builder.manage"], ["BuilderDraft", "BuilderRun", "BuilderRunItem"], true, true),
] as const satisfies readonly FeatureRegistryRecord[];

function live(
  id: string,
  displayName: string,
  discordCommands: readonly string[],
  discordInteractions: readonly string[],
  automaticHandlers: readonly string[],
  apiRoutes: readonly string[],
  portalRoute: string,
  requiredPermissions: readonly string[],
  persistence: readonly string[],
  discordFallbackAvailable: boolean,
  portalAvailable: boolean,
): FeatureRegistryRecord {
  return { id, displayName, status: "LIVE", discordCommands, discordInteractions, automaticHandlers, apiRoutes, portalRoute, requiredPermissions, persistence, discordFallbackAvailable, portalAvailable };
}

function planned(id: string, displayName: string, portalRoute: string): FeatureRegistryRecord {
  return { id, displayName, status: "PLANNED", discordCommands: [], discordInteractions: [], automaticHandlers: [], apiRoutes: [], portalRoute, requiredPermissions: [], persistence: [], discordFallbackAvailable: false, portalAvailable: false };
}
