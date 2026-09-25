# Scheduled Messages

Post messages and embeds on a schedule: once, every few minutes or hours,
daily, weekly, or monthly, in any time zone. Create and edit them in the
portal (`/scheduled`); use `/schedule` in Discord for day-to-day control.

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, next-run calculation, Discord REST adapter | `modules/scheduled-messages` (`@qbox/scheduled-messages`) |
| Time zone helpers (Intl only) | `packages/shared/src/timeZones.ts` (`@qbox/shared/time-zones`) |
| Database models | `ScheduledMessage`, `ScheduledMessageRun` in `prisma/schema/scheduled.prisma` |
| PostgreSQL repository | `packages/database/src/scheduledMessages/PrismaScheduledMessageRepository.ts` |
| `/schedule` command | `packages/discord/src/commands/Schedule.command.ts` |
| Timer | `packages/discord/src/scheduledMessages/ScheduledMessagesFeature.ts` |
| API | `apps/api/src/scheduledMessages/ScheduledMessageRoutes.ts` |
| Portal | `apps/web/public/js/scheduled.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `scheduled.manage` | Everything: create, edit, send, pause, resume, delete, and history |

Discord administrators can do everything.

## Discord commands

`/schedule list | send | pause | resume | delete`

`list` shows every message with its schedule and next post. The others take the
message `name` (not case sensitive).

## Features

- **Message:** text and/or one embed (title, description, color, image, footer, up to 10 fields), plus up to 10 roles to ping. The portal shows a live Discord preview.
- **Schedules:**
  - **Once** at a date and time.
  - **Interval** every N minutes (at least 10). With a start date it starts at the chosen time on that day; otherwise it counts from when it was saved.
  - **Daily** at a time.
  - **Weekly** on chosen days at a time.
  - **Monthly** on a day at a time; shorter months use their last day.
- **Time zones:** every time is a wall-clock time in the message's IANA time zone, so daily 09:00 stays 09:00 across daylight saving changes. A time skipped by clocks going forward posts at the shifted time (02:30 becomes 03:30); a time that happens twice posts once, the first time.
- **Start and end dates:** posts only happen from the start date through the end date, in the message's time zone.
- **Options:** active or paused, delete the previous post, pin each post, and stop after a number of posts.
- **Posting:** the bot checks every 30 seconds. Each due post is claimed in the database before it is sent, so it posts once even with more than one bot process. After downtime, missed posts are skipped and the schedule continues from now.
- **Send now:** posts immediately (portal button or `/schedule send`) without changing the schedule or the post count.
- **History:** every post is recorded with success or failure, the Discord message ID, and the error. Deleting a message deletes its history.

## Setup

1. Give the bot **Send Messages**, **Embed Links**, **Mention Everyone** (only to ping roles that are not mentionable), and **Manage Messages** (for pinning and deleting previous posts) in the channels you use.
2. Grant `scheduled.manage` to the staff roles who manage announcements.
3. In the portal, open **Scheduled** and create a message.

## Known limitations

- Up to 100 scheduled messages per server.
- Posts can arrive up to 30 seconds after their time.
- Images must be https links; uploads are not supported.
