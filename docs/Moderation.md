# Moderation

Warn, time out, kick, and ban members, keep a numbered case history, run
automod, and punish repeat offenders automatically. Everything works from the
portal (`/moderation`) and from Discord (`/mod`).

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, automod, Discord REST adapter | `modules/moderation` (`@qbox/moderation`) |
| Database models | `ModerationSettings`, `ModerationCase` in `prisma/schema/moderation.prisma` |
| PostgreSQL repository | `packages/database/src/moderation/PrismaModerationRepository.ts` |
| `/mod` command | `packages/discord/src/commands/Mod.command.ts` |
| Automod, external actions, expired bans | `packages/discord/src/moderation/ModerationFeature.ts` |
| API | `apps/api/src/moderation/ModerationRoutes.ts` |
| Portal | `apps/web/public/js/moderation.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `moderation.view` | See cases, member history, and statistics |
| `moderation.warn` | Warnings and staff notes |
| `moderation.timeout` | Timeouts and removing timeouts |
| `moderation.kick` | Kicks |
| `moderation.ban` | Bans (permanent or temporary), unbans, softbans |
| `moderation.messages` | Purge, lock, unlock, slowmode |
| `moderation.manage` | Settings, automod, editing and pardoning cases |

Discord administrators can do everything.

## Discord commands

`/mod warn | timeout | untimeout | kick | ban | unban | softban | note | history | case | reason | pardon | purge | lock | unlock | slowmode`

Durations accept `10m`, `2h`, `3d`, `1w`, or plain minutes. Timeouts can last up
to 28 days (a Discord limit). Bans can be temporary; Qbox lifts them when they
expire.

## Features

- **Cases:** every action gets a case number with member, moderator, reason, length, source (Discord, portal, automatic, or done directly in Discord), DM status, and evidence links. Reasons can be edited and cases pardoned. Pardoning an active ban or timeout lifts it in Discord.
- **Safety checks:** you cannot moderate yourself, the server owner, the bot, anyone whose highest role is at or above yours or the bot's, or anyone with a protected role.
- **DMs:** members are told what happened and why (sent before kicks and bans so they can still receive it). Optionally include the moderator's name and an appeal message.
- **Log channel:** every action, pardon, reason change, purge, lock, and slowmode change is posted.
- **Automatic punishments:** for example, time out at 3 warnings and ban at 5. Warnings can expire after a number of days.
- **Automod:** spam bursts, invite links, links not on an allow list, blocked words (with `*` wildcards), mass mentions, and excessive caps. Each rule deletes the message and can also warn or time out. Roles and channels can be exempt; administrators are never checked.
- **Done in Discord:** bans, unbans, and kicks made in Discord's own menus are recorded as cases, using the audit log to find who did it.
- **Channel tools:** purge up to 100 recent messages (optionally from one member), lock and unlock channels, and set slowmode.
- **Statistics:** cases by action, last 7 days, active bans and timeouts, automatic actions, and the most active moderators.

## Setup

1. Give the bot **Kick Members**, **Ban Members**, **Moderate Members**, **Manage Messages**, **Manage Channels**, **Manage Roles**, and **View Audit Log**. Put the Qbox role above the roles it should moderate.
2. In the portal, open **Moderation > Settings** and choose a log channel.
3. Grant the moderation permissions to your staff roles.
4. Optionally configure **Automod** and automatic punishments.

## Known limitations

- Blocked words, invites, links, and caps need the Message Content intent (`DISCORD_MESSAGE_CONTENT_INTENT=true`). Spam and mention checks work without it.
- Discord only bulk-deletes messages newer than 14 days.
- Kicks and bans made directly in Discord are matched to the audit log within 10 seconds; if the bot lacks View Audit Log they are recorded without a moderator.
