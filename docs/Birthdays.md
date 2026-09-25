# Birthdays

Members save their birthday, and Guildhall posts a message and gives a birthday
role on the day, in each member's own time zone. Everything works from the
portal (`/birthdays`) and from Discord (`/birthday`).

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, timer logic, Discord REST adapter | `modules/birthdays` (`@qbox/birthdays`) |
| Time zone helpers (Intl only) | `packages/shared/src/timeZones.ts` (`@qbox/shared/time-zones`) |
| Database models | `BirthdaySettings`, `Birthday` in `prisma/schema/birthdays.prisma` |
| PostgreSQL repository | `packages/database/src/birthdays/PrismaBirthdayRepository.ts` |
| `/birthday` command | `packages/discord/src/commands/Birthday.command.ts` |
| Confirmation buttons and timer | `packages/discord/src/birthdays/BirthdaysFeature.ts` |
| API | `apps/api/src/birthdays/BirthdayRoutes.ts` |
| Portal | `apps/web/public/js/birthdays.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `birthdays.manage` | Settings, test messages, and setting or removing anyone's birthday |

Every server member can save, view, and remove their own birthday and see the
list and calendar. Discord administrators can do everything.

## Discord commands

`/birthday set | remove | view | list | next`

- `set month day [year] [show-age] [timezone] [member]` saves a birthday. `timezone` is an IANA name such as `Europe/London` (default `UTC`). `member` needs `birthdays.manage`.
- `remove [member]` removes a birthday (`member` needs `birthdays.manage`).
- `view [member]` shows a saved birthday. Other members' birth years are only shown when they chose to show their age.
- `list` shows birthdays in the next 30 days; `next` shows the next one.

When **Require confirmation** is on, `/birthday set` shows the date with
**Save birthday** and **Cancel** buttons, and the portal asks before saving.

## Features

- **Dates:** month and day, optional year (turn off **Allow year** to never store years), optional "show age", and the member's time zone. February 29 birthdays are celebrated on February 28 in other years.
- **Announcements:** a timer runs every 5 minutes. When it is the member's birthday in their time zone and the configured hour has passed, Guildhall posts the message once for that year (`lastAnnouncedYear`). Changing the date resets this.
- **Message:** a template with `{user}` (mention), `{age}` (only when the member shows their age), and `{server}`, in an embed with your color. An optional role is pinged too. Customize this message under Look & Messages (key `birthdays.announcement`).
- **Birthday role:** given with the announcement and removed when the member's day ends in their time zone.
- **Portal:** upcoming birthdays (next 30 days), a month calendar, all birthdays with search, your own birthday form, and settings with a test message.

## Setup

1. Give the bot **Send Messages**, **Embed Links**, and **Manage Roles**. Put the Guildhall role above the birthday role.
2. In the portal, open **Birthdays > Settings**, choose a channel and/or a birthday role, and turn birthdays on.
3. Ask members to use `/birthday set` or the **My birthday** tab.

## Known limitations

- Announcements run every 5 minutes, so a message can arrive up to 5 minutes after the hour.
- If the bot is offline for a member's whole birthday, that birthday is not announced late.
- The directory search in the portal is only for staff; members see names saved with each birthday.
