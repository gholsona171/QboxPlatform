# Giveaways

Run giveaways where members press **Enter** to join and Guildhall picks the winners
when time is up. Start them from the portal (`/giveaways`) or from Discord
(`/giveaway start`).

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, drawing, message layout, Discord REST adapter | `modules/giveaways` (`@qbox/giveaways`) |
| Database models | `GiveawayCounter`, `Giveaway`, `GiveawayEntry` in `prisma/schema/giveaways.prisma` |
| PostgreSQL repository | `packages/database/src/giveaways/PrismaGiveawayRepository.ts` |
| `/giveaway` command | `packages/discord/src/commands/Giveaway.command.ts` |
| Enter button and end timer | `packages/discord/src/giveaways/GiveawaysFeature.ts` |
| API | `apps/api/src/giveaways/GiveawayRoutes.ts` |
| Portal | `apps/web/public/js/giveaways.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `giveaways.manage` | Start, end, reroll, pause, resume, and cancel giveaways, and see entries |

Discord administrators can do everything. Any member can press Enter if they
meet the requirements.

## Discord commands

`/giveaway start | end | reroll | list | cancel`

- `/giveaway start prize duration [winners] [channel] [description] [host] [required-role] [blocked-role] [min-account-days] [min-server-days] [bonus-role] [bonus-entries] [ping-role] [dm-winners]`
  Durations accept `30m`, `2h`, `3d`, `1w`, or plain minutes (up to 90 days).
- `/giveaway end giveaway:<number>` ends it now and picks the winners.
- `/giveaway reroll giveaway:<number> [winners]` picks new winners, skipping the current ones.
- `/giveaway cancel giveaway:<number>` stops it without picking winners.
- `/giveaway list` shows recent giveaways.

Pausing and resuming, several required or blocked roles, and several bonus roles
are available in the portal.

## Features

- **Enter button:** press once to join, again to leave. The message shows the entry count, end time, host, requirements, and bonus entries.
- **Requirements:** at least one of the required roles, none of the blocked roles, a minimum Discord account age, and a minimum time in the server. Members are told which requirement they miss.
- **Bonus entries:** members with a bonus role get extra entries (for example boosters +2). Entries are counted when the member presses Enter.
- **Fair drawing:** winners are drawn with Node's cryptographic random generator, weighted by entries, and no member can win twice in one draw.
- **End time:** a timer checks every 30 seconds, draws the winners, updates the message, posts the winners as a reply, and DMs them (optional).
- **Reroll:** pick new winners for an ended giveaway. Current winners are skipped.
- **Custom messages:** customize the giveaway post under Look & Messages (key `giveaways.started`) and the winners announcement (key `giveaways.ended`). Pings and the Enter button stay.
- **End early, pause, cancel:** pausing stops entries and the timer; resuming moves the end time back by the paused time.
- **Portal:** running and ended lists, a start form with every option, and details with all entries, entry counts, and each member's chance to win.

## API

| Method | Route |
| --- | --- |
| GET | `/api/v1/giveaways/overview` |
| GET | `/api/v1/giveaways?state=active` (or `ended`) |
| GET | `/api/v1/giveaways/:id` |
| POST | `/api/v1/giveaways` |
| POST | `/api/v1/giveaways/:id/end` |
| POST | `/api/v1/giveaways/:id/reroll` |
| POST | `/api/v1/giveaways/:id/pause` |
| POST | `/api/v1/giveaways/:id/resume` |
| POST | `/api/v1/giveaways/:id/cancel` |

Every route needs `giveaways.manage`. `:id` is the giveaway ID or its number.

## Setup

1. Make sure the bot can **View Channel**, **Send Messages**, **Embed Links**, and **Read Message History** where giveaways are posted.
2. Grant `giveaways.manage` to the staff who run giveaways.

## Known limitations

- Bonus entries are fixed when a member enters. If they gain a bonus role later, they can leave and enter again.
- Members with closed DMs are not told privately that they won; the channel announcement still mentions them.
- The entry count on the message refreshes a couple of seconds after entries, so it can lag slightly.
