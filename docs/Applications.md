# Applications

Staff and whitelist applications. Members apply from a panel button in Discord,
with `/apply`, or from the portal. Staff vote, discuss, and accept or deny in
Discord or in the portal (`/applications`). Accepting gives roles and DMs the
member; denying DMs them the reason.

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, eligibility, Discord REST adapter | `modules/applications` (`@qbox/applications`) |
| Database models | `ApplicationForm`, `ApplicationPanel`, `Application`, `ApplicationVote`, `ApplicationNote`, `ApplicationCounter` in `prisma/schema/applications.prisma` |
| PostgreSQL repository | `packages/database/src/applications/PrismaApplicationRepository.ts` |
| `/apply` and `/applications` | `packages/discord/src/commands/Apply.command.ts`, `Applications.command.ts` |
| Panel buttons, paged forms, review buttons | `packages/discord/src/applications/` |
| API | `apps/api/src/applications/ApplicationRoutes.ts` |
| Portal | `apps/web/public/js/applications.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `applications.review` | Review, vote, add notes, accept, and deny on every form; see statistics |
| `applications.manage` | Create and edit forms and panels; also reviews every form |

Members with one of a form's **reviewer roles** can review that form only.
Discord administrators can do everything. Any member can apply. Nobody can vote
on or decide their own application.

## Discord commands

- `/apply` shows the forms you can apply to (and why you can't apply to the others). Pick one to open the form.
- `/applications list [status] [member]` lists applications (pending by default).
- `/applications view <number>` shows the answers, votes, and decision.
- `/applications accept <number> [reason]` and `/applications deny <number> <reason>`.
- `/applications panel <channel> [title] [text]` posts or updates the panel in a channel (`applications.manage`).

## Features

- **Forms:** many per server. Each has a name, description, open or closed switch, and up to 25 questions: short text, paragraph, yes or no, and multiple choice (2 to 25 choices). Questions can be required and text answers can have a minimum and maximum length.
- **Who can apply:** required roles (any one of them), blocked roles, a minimum Discord account age in days, one pending application per member, and a wait after a denial (days).
- **Applying in Discord:** Discord forms show five questions at a time. After each page the member presses **Continue**. Answers from earlier pages are kept for 30 minutes.
- **Applying in the portal:** the Apply tab lists open forms and your own applications, where you can also withdraw a pending one.
- **Review message:** each application is numbered per server and posted to the form's review channel with every answer, the member's account age, and **Accept**, **Deny**, 👍, and 👎 buttons. Pressing a vote button again removes your vote. Accept and Deny ask for a reason (required to deny). Chosen members are pinged on each new application.
- **Discussion thread (optional):** when a discussion channel is set, Qbox opens a private thread there with the member and the pinged members, and mentions the reviewer roles.
- **Decisions:** accepting gives and removes the form's roles, then DMs the member. If roles can't be changed, the application stays pending and the reviewer is told why. DMs use the form's templates with `{user}`, `{form}`, `{number}`, `{reason}`, and `{server}`; the reason is added below the message when the template doesn't include it.
- **Portal review:** filter by status, form, or search (`#number`, member name or ID, form). The detail view shows answers, who voted, private staff notes, and accept or deny.
- **Statistics:** totals, applications by status and per form, last 7 days, and average time from submission to decision.

## Setup

1. Give the bot **Manage Roles** (with the Qbox role above the roles it gives), **Send Messages**, and **Create Private Threads** in the review and discussion channels.
2. In the portal, open **Applications > Forms** and create a form: questions, review channel, reviewer roles, and roles to give on accept.
3. Open **Applications > Panels**, create a panel for your applications channel, and press **Post in Discord**. You can also run `/applications panel`.
4. Grant `applications.review` to staff who review every form, and `applications.manage` to those who set up forms.

## Known limitations

- Answers from earlier Discord form pages live in the bot's memory; a bot restart mid-application means starting again.
- Members who have left the server can't be accepted when the form gives roles.
- Deleting a form keeps its past applications (with the form name) but removes it from panels.
