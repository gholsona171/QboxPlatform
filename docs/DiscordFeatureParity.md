# Discord Feature Parity

Discord is the primary member interaction surface. The portal is the configuration, review, and administrative surface. Implemented Discord features must use the same application services and persistence from Discord commands, Discord interactions, API routes, and portal management pages.

| Feature | Member Discord interaction | Staff Discord command/context action | Portal management page | API routes | Required permission | Automatic event behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Command Center | Slash commands | Deployment workflow | Discord Bot / Command Center demo | Existing command deployment tooling, no management API yet | Existing command permissions | None |
| Role Menus | Buttons, select menus, reactions | `/role-menu` subcommands | Discord Bot / Role Menus | `/api/v1/discord/role-menus*` | `discord.role-menus.manage` | Reaction add/remove handling after bot restart through persisted menu IDs |
| Welcome and Goodbye | Planned | Planned | Demo only | Planned | Planned | Planned guild-member events |
| Autoroles | Planned | Planned | Demo only | Planned | Planned | Planned guild-member events |
| AutoMod and Filters | Planned | Planned | Demo only | Planned | Planned | Planned message/moderation events |
| Server Logs | Planned | Planned | Demo only | Planned | Planned | Planned Discord audit/event logging |
| Embeds and Announcements | Planned | Planned | Demo only | Planned | Planned | Planned scheduled or manual sends |
| Scheduled Messages and Reminders | Planned | Planned | Planned | Planned | Planned | Blocked by scheduler execution |
| Giveaways | Planned | Planned | Planned | Planned | Planned | Blocked by scheduler and component workflow |
| Levels and Rewards | Planned | Planned | Planned | Planned | Planned | Blocked by activity ingestion |
| Starboard | Planned | Planned | Planned | Planned | Planned | Blocked by reaction/message event design |
| Voice Rooms | Planned | Planned | Planned | Planned | Planned | Blocked by voice-state workflow |
| Custom Commands | Planned | Planned | Planned | Planned | Planned | Blocked by command content policy |
| Server Utilities | Planned | Planned | Demo only | Planned | Planned | None yet |
| Bot Settings | Planned | Planned | Demo only | Planned | Planned | None yet |

Role Menus are the first live Discord feature. The portal can inspect and manage role-menu configuration through the authenticated API when live services are connected and falls back to clearly labeled Demo Mode otherwise.
