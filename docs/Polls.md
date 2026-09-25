# Polls

Ask the server a question and let members vote with buttons. Create polls from
the portal (`/polls`) or from Discord (`/poll create`).

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, message layout, Discord REST adapter | `modules/polls` (`@qbox/polls`) |
| Database models | `PollCounter`, `Poll`, `PollVote` in `prisma/schema/polls.prisma` |
| PostgreSQL repository | `packages/database/src/polls/PrismaPollRepository.ts` |
| `/poll` command | `packages/discord/src/commands/Poll.command.ts` |
| Vote buttons, menus, end timer | `packages/discord/src/polls/PollsFeature.ts` |
| API | `apps/api/src/polls/PollRoutes.ts` |
| Portal | `apps/web/public/js/polls.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `polls.create` | Create polls, and close or reopen your own polls |
| `polls.manage` | Close, reopen, and delete any poll, export results, and see hidden results early |

Discord administrators can do everything. Anyone can vote unless the poll limits
voting to certain roles.

## Discord commands

`/poll create | close | results | list`

- `/poll create question option1 option2 [option3..option10] [duration] [max-choices] [channel] [anonymous] [results] [allow-change] [allowed-role] [ping-role]`
  Start an option with an emoji to show it on the button, for example `🍕 Pizza`.
  Durations accept `30m`, `2h`, `3d`, `1w`, or plain minutes. Leave it empty to keep
  the poll open until someone closes it.
- `/poll close poll:<number>` closes it now and posts the results.
- `/poll results poll:<number>` shows the counts (only to you).
- `/poll list` shows recent polls.

## Features

- **Options:** 2 to 10, each with a label and an optional emoji (unicode or a custom server emoji).
- **Single or multiple choice:** single-choice polls show one button per option. Multiple-choice polls show a menu where members pick up to the limit you set.
- **Changing votes:** when allowed, members can pick again or press **Remove my vote**. When not allowed, the first vote is final.
- **Who can vote:** limit voting to one or more roles.
- **Anonymous or public:** public polls show staff who voted for what in the portal and the CSV export. Anonymous polls only keep counts visible.
- **Results:** shown live as text bars in the poll message (`██████░░░░░░ 50% (5)`), or hidden until the poll closes. Percentages are of voters, so multiple-choice polls can add up to more than 100%.
- **End time:** give a duration or an exact time (up to 90 days). A timer checks every 30 seconds, closes ended polls, marks the winner, and posts the final results as a reply to the poll.
- **Staff tools:** close early, reopen (optionally with a new duration), delete (removes the message and votes), and export results as CSV from the portal (`GET /api/v1/polls/:id/export`).
- **Role ping:** optionally ping a role when the poll is posted.

## API

| Method | Route | Permission |
| --- | --- | --- |
| GET | `/api/v1/polls/overview` | `polls.create` or `polls.manage` |
| GET | `/api/v1/polls?status=OPEN` | `polls.create` or `polls.manage` |
| GET | `/api/v1/polls/:id` | `polls.create` or `polls.manage` |
| GET | `/api/v1/polls/:id/export` | `polls.manage` |
| POST | `/api/v1/polls` | `polls.create` |
| POST | `/api/v1/polls/:id/close` | creator or `polls.manage` |
| POST | `/api/v1/polls/:id/reopen` | creator or `polls.manage` |
| DELETE | `/api/v1/polls/:id` | `polls.manage` |

`:id` is the poll ID or its number.

## Setup

1. Make sure the bot can **View Channel**, **Send Messages**, **Embed Links**, and **Read Message History** where polls are posted. To ping a role that is not mentionable, it also needs **Mention Everyone**.
2. Grant `polls.create` to members who may start polls and `polls.manage` to staff.

## Known limitations

- The poll message is refreshed a couple of seconds after votes, so counts can lag slightly on busy polls.
- Poll options cannot be edited after posting. Delete the poll and create a new one instead.
