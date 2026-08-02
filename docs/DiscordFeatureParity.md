# Discord Feature Parity

This document is validated against the typed feature registry in `packages/feature-registry/src/index.ts` and the portal mirror in `apps/web/public/js/featureRegistry.js`.

Discord remains the primary operational and fallback interface. The portal is the richer configuration, editing, review, and administrative interface. LIVE features must declare their Discord, API, portal, permission, and persistence surfaces in the registry.

| Feature | Status | Discord commands | Components/interactions | Automatic handlers | API routes | Portal route | Permissions | Persistence | Fallback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Command Center | LIVE | ping, adminping |  |  |  | /discord?tab=overview |  |  | Discord yes / Portal yes |
| Role Management | PARTIAL | roles |  |  | /api/v1/discord/roles, /api/v1/discord/resources/roles | /discord?tab=role-management | discord.roles.manage | DiscordRoleAuditEvent, RoleManagementDependencyRepository | Discord yes / Portal yes |
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
| Tickets | PLANNED |  |  |  |  | /tickets |  |  | Discord no / Portal no |
| Staff | DEMO |  |  |  |  | /staff |  |  | Discord no / Portal yes |
| Moderation | PLANNED |  |  |  |  | /moderation |  |  | Discord no / Portal no |
| Verification | DEMO |  |  |  |  | /verification |  |  | Discord no / Portal yes |
| Polls | DEMO |  |  |  |  | /polls |  |  | Discord no / Portal yes |
| Birthdays | DEMO |  |  |  |  | /birthdays |  |  | Discord no / Portal yes |
| Knowledge Base | DEMO |  |  |  |  | /knowledge |  |  | Discord no / Portal yes |
| FiveM Server | DEMO |  |  |  |  | /fivem |  |  | Discord no / Portal yes |
| Scheduled Messages | PLANNED |  |  |  |  | /discord?tab=scheduled |  |  | Discord no / Portal no |
| Giveaways | PLANNED |  |  |  |  | /discord?tab=giveaways |  |  | Discord no / Portal no |
| Levels and Rewards | PLANNED |  |  |  |  | /discord?tab=levels |  |  | Discord no / Portal no |
| Voice Rooms | PLANNED |  |  |  |  | /discord?tab=voice |  |  | Discord no / Portal no |
