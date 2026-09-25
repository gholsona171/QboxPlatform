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
  planned("applications", "Applications", "/applications"),
  live("tickets", "Tickets", ["ticket", "tickets"], ["ticket panel buttons", "ticket select menus", "ticket forms", "close/claim/reopen/transcript buttons", "feedback ratings"], ["messageCreate", "channelDelete", "threadDelete", "auto-close timer"], ["/api/v1/tickets", "/api/v1/tickets/overview", "/api/v1/tickets/settings", "/api/v1/tickets/categories", "/api/v1/tickets/panels"], "/tickets", ["tickets.manage", "tickets.handle"], ["TicketSettings", "TicketCategory", "TicketPanel", "Ticket", "TicketMessage", "TicketEvent"], true, true),
  planned("staff", "Staff", "/staff"),
  live("moderation", "Moderation", ["mod"], ["automod message checks"], ["messageCreate", "guildBanAdd", "guildBanRemove", "guildMemberRemove", "expired ban timer"], ["/api/v1/moderation/overview", "/api/v1/moderation/cases", "/api/v1/moderation/actions", "/api/v1/moderation/settings"], "/moderation", ["moderation.view", "moderation.warn", "moderation.timeout", "moderation.kick", "moderation.ban", "moderation.messages", "moderation.manage"], ["ModerationSettings", "ModerationCase"], true, true),
  planned("verification", "Verification", "/verification"),
  planned("polls", "Polls", "/polls"),
  live("birthdays", "Birthdays", ["birthday"], ["birthday confirmation buttons"], ["birthday timer"], ["/api/v1/birthdays", "/api/v1/birthdays/overview", "/api/v1/birthdays/me", "/api/v1/birthdays/members", "/api/v1/birthdays/settings"], "/birthdays", ["birthdays.manage"], ["BirthdaySettings", "Birthday"], true, true),
  planned("knowledge-base", "Knowledge Base", "/knowledge"),
  planned("fivem-server", "FiveM Server", "/fivem"),
  live("scheduled-messages", "Scheduled Messages", ["schedule"], [], ["scheduled message timer"], ["/api/v1/scheduled-messages", "/api/v1/scheduled-messages/runs"], "/scheduled", ["scheduled.manage"], ["ScheduledMessage", "ScheduledMessageRun"], true, true),
  planned("giveaways", "Giveaways", "/discord?tab=giveaways"),
  planned("levels-rewards", "Levels and Rewards", "/discord?tab=levels"),
  planned("voice-rooms", "Voice Rooms", "/discord?tab=voice"),
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
