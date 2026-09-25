# Discord Feature Parity

This document is validated against the typed feature registry in `packages/feature-registry/src/index.ts` and the portal mirror in `apps/web/public/js/featureRegistry.js`.

Discord remains the primary operational and fallback interface. The portal is the richer configuration, editing, review, and administrative interface. LIVE features must declare their Discord, API, portal, permission, and persistence surfaces in the registry.

| Feature | Status | Discord commands | Components/interactions | Automatic handlers | API routes | Portal route | Permissions | Persistence | Fallback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Command Center | LIVE | ping, adminping |  |  |  | /discord?tab=overview |  |  | Discord yes / Portal yes |
| Role Management | LIVE | roles |  |  | /api/v1/discord/roles, /api/v1/discord/resources/roles | /discord?tab=role-management | discord.roles.manage | DiscordRoleAuditEvent, RoleManagementDependencyRepository | Discord yes / Portal yes |
| Role Menus | LIVE | role-menu | role-menu buttons, select menus, reactions | messageReactionAdd, messageReactionRemove | /api/v1/discord/role-menus | /discord?tab=roles | discord.role-menus.manage | RoleMenu, RoleMenuOption, PrismaRoleMenuRepository | Discord yes / Portal yes |
| Welcome and Goodbye | LIVE | welcome, goodbye |  | guildMemberAdd, guildMemberRemove | /api/v1/discord/welcome, /api/v1/discord/goodbye | /discord?tab=welcome | discord.welcome.manage | WelcomeGoodbyeConfig | Discord yes / Portal yes |
| Autoroles | LIVE | autorole |  | guildMemberAdd | /api/v1/discord/autoroles | /discord?tab=autoroles | discord.autoroles.manage | AutoroleConfig, AutoroleRule | Discord yes / Portal yes |
| Rules | LIVE | rules | rules accept button |  | /api/v1/discord/rules | /discord?tab=rules | discord.rules.manage | RulesConfig | Discord yes / Portal yes |
| Member Counters | LIVE | counter |  | guildMemberAdd, guildMemberRemove, counter timer | /api/v1/discord/counters | /discord?tab=counters | discord.counters.manage | CommunityCounter | Discord yes / Portal yes |
| Server Logs | LIVE | logs |  | member/log events | /api/v1/discord/logs | /discord?tab=logs | discord.logs.manage | ServerLogConfig | Discord yes / Portal yes |
| Embeds and Announcements | LIVE | embed, announce |  |  | /api/v1/discord/embeds | /discord?tab=announcements | discord.embeds.manage | EmbedTemplate | Discord yes / Portal yes |
| Custom Commands | LIVE | custom |  | messageCreate | /api/v1/discord/custom-commands | /discord?tab=custom | discord.custom-commands.manage | CustomCommand | Discord yes / Portal yes |
| Suggestions | LIVE | suggest |  |  | /api/v1/discord/suggestions | /discord?tab=suggestions | discord.suggestions.manage | Suggestion | Discord yes / Portal yes |
| Starboard | LIVE | starboard |  | messageReactionAdd, messageDelete | /api/v1/discord/starboard | /discord?tab=starboard | discord.starboard.manage | StarboardConfig, StarboardEntry | Discord yes / Portal yes |
| Applications | PLANNED |  |  |  |  | /applications |  |  | Discord no / Portal no |
| Tickets | LIVE | ticket, tickets | ticket panel buttons, ticket select menus, ticket forms, close/claim/reopen/transcript buttons, feedback ratings | messageCreate, channelDelete, threadDelete, auto-close timer | /api/v1/tickets, /api/v1/tickets/overview, /api/v1/tickets/settings, /api/v1/tickets/categories, /api/v1/tickets/panels | /tickets | tickets.manage, tickets.handle | TicketSettings, TicketCategory, TicketPanel, Ticket, TicketMessage, TicketEvent | Discord yes / Portal yes |
| Staff | PLANNED |  |  |  |  | /staff |  |  | Discord no / Portal no |
| Moderation | LIVE | mod | automod message checks | messageCreate, guildBanAdd, guildBanRemove, guildMemberRemove, expired ban timer | /api/v1/moderation/overview, /api/v1/moderation/cases, /api/v1/moderation/actions, /api/v1/moderation/settings | /moderation | moderation.view, moderation.warn, moderation.timeout, moderation.kick, moderation.ban, moderation.messages, moderation.manage | ModerationSettings, ModerationCase | Discord yes / Portal yes |
| Verification | LIVE | verify | verification panel button, captcha code form, question form | guildMemberAdd, guildMemberRemove, unverified kick timer | /api/v1/verification/overview, /api/v1/verification/attempts, /api/v1/verification/members, /api/v1/verification/settings, /api/v1/verification/panel | /verification | verification.manage, verification.members | VerificationSettings, VerificationAttempt, VerificationPendingMember | Discord yes / Portal yes |
| Polls | PLANNED |  |  |  |  | /polls |  |  | Discord no / Portal no |
| Birthdays | PLANNED |  |  |  |  | /birthdays |  |  | Discord no / Portal no |
| Knowledge Base | PLANNED |  |  |  |  | /knowledge |  |  | Discord no / Portal no |
| FiveM Server | PLANNED |  |  |  |  | /fivem |  |  | Discord no / Portal no |
| Scheduled Messages | PLANNED |  |  |  |  | /discord?tab=scheduled |  |  | Discord no / Portal no |
| Giveaways | PLANNED |  |  |  |  | /discord?tab=giveaways |  |  | Discord no / Portal no |
| Levels and Rewards | PLANNED |  |  |  |  | /discord?tab=levels |  |  | Discord no / Portal no |
| Voice Rooms | PLANNED |  |  |  |  | /discord?tab=voice |  |  | Discord no / Portal no |
