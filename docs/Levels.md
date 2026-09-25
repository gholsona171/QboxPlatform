# Levels and Rewards

Members earn XP by chatting and by spending time in voice. XP adds up to
levels, levels can give reward roles, and everyone can see the leaderboard.
Staff set everything up in the portal (`/levels`); members use `/rank` and
`/leaderboard` in Discord.

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, level curve, voice tracking, Discord REST adapter | `modules/levels` (`@qbox/levels`) |
| Database models | `LevelSettings`, `LevelMember` in `prisma/schema/levels.prisma` |
| PostgreSQL repository | `packages/database/src/levels/PrismaLevelRepository.ts` |
| `/rank`, `/leaderboard`, `/levels` | `packages/discord/src/commands/Rank.command.ts`, `Leaderboard.command.ts`, `Levels.command.ts` |
| Message XP, voice XP | `packages/discord/src/levels/LevelsFeature.ts` |
| API | `apps/api/src/levels/LevelRoutes.ts` |
| Portal | `apps/web/public/js/levels.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `levels.manage` | Settings, rewards, giving, taking, setting, and resetting XP, member search, reset all |

Any signed-in member of the server can see the leaderboard and their own rank
in the portal. Discord administrators can do everything.

## Discord commands

- `/rank [member]` shows level, XP, progress to the next level, rank, messages, and voice minutes.
- `/leaderboard [page]` shows 10 members per page.
- `/levels give | take | set | reset` (needs `levels.manage`). `set` sets a level; the member gets exactly the XP that level needs.

## How XP works

- **Messages:** each message earns a random amount between the minimum and maximum, at most once per cooldown (default 60 seconds). Only messages that earn XP are counted in the message total. Bots, webhooks, and system messages never earn XP.
- **Voice:** members earn XP per minute while they are in a voice channel with at least one other person (bots don't count) and are not muted or deafened (self or server). The AFK channel never earns XP. Voice time is tracked from voice state updates and paid out once a minute.
- **Multipliers:** a member gets their highest role multiplier times the channel multiplier (0.1 to 10). Channel settings also apply inside that channel's threads.
- **No XP:** roles and channels (and their threads) listed here never earn XP.
- **Level curve:** the total XP needed for level n is `base * n^exponent + linear * n` (default `50 * n^2 + 50 * n`: level 1 = 100, level 2 = 300, level 10 = 5,500). The portal shows a preview while you edit it.
- **Max level:** optional. XP keeps counting, but the level stops at the maximum. Levels can go up to 1000.

## Level-up messages

Send the message in the channel where the member leveled up (for voice XP,
the voice channel's chat), in a specific channel, in a DM, or not at all.
`{user}` becomes a mention and `{level}` the new level. Messages are only
sent when XP is earned by chatting or voice, not when staff change XP.

## Reward roles

Add roles for levels. **Stack** keeps every reward role a member has earned;
**Highest** keeps only the role for the highest level reached and removes the
others. When staff take XP or set a lower level, reward roles above the new
level are removed. With **Remove reward roles when XP is reset** on, resetting
a member (or everyone) removes their reward roles.

## Setup

1. Give the bot **Manage Roles** and put the Guildhall role above your reward roles.
2. In the portal, open **Levels > Settings**, turn XP on, and adjust the amounts.
3. Add reward roles under **Levels > Rewards**.
4. Grant `levels.manage` to staff who should adjust XP.

## Known limitations

- The message cooldown is kept in memory, so a restart lets members earn XP from their next message right away.
- Voice minutes earned in the last partial minute before someone leaves are dropped.
- Leaderboard names are the display name the member had when they last earned XP.
