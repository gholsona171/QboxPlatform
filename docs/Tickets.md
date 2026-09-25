# Tickets

Support tickets for the Discord server. Members open tickets from a panel or
with `/ticket open`. Staff handle them in Discord or in the portal at `/tickets`.

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, validation, Discord REST adapter | `modules/tickets` (`@qbox/tickets`) |
| PostgreSQL persistence | `packages/database/src/tickets/PrismaTicketRepository.ts` |
| Database models | `TicketSettings`, `TicketCategory`, `TicketPanel`, `Ticket`, `TicketMessage`, `TicketEvent` in `prisma/schema.prisma` |
| Discord commands | `packages/discord/src/commands/Ticket.command.ts`, `Tickets.command.ts` |
| Buttons, dropdowns, forms | `packages/discord/src/tickets/DiscordTicketInteractionHandler.ts` |
| Message recording, deleted channels, auto-close | `packages/discord/src/tickets/DiscordTicketEventHandler.ts` |
| API | `apps/api/src/tickets/TicketRoutes.ts` |
| Portal | `apps/web/public/js/tickets.js` |

The bot and the API share one `TicketService` and one Discord adapter
(`DiscordRestTicketGateway`), so Discord and the portal behave the same.

## Permissions

| Who | Can do |
| --- | --- |
| Any member | Open tickets (unless blocked), talk in their ticket, close it if **Members can close** is on, download their own transcript, rate closed tickets. |
| Support roles (global or per ticket type) | Every staff action in Discord for tickets they can see. |
| `tickets.handle` | Staff actions in Discord for all tickets, and the portal inbox. |
| `tickets.manage` | `/tickets` configuration and portal Settings, Ticket types, and Panels. |
| Discord Administrator / Manage Server | Treated like `tickets.handle`. |

## Setup

1. Give the bot **Manage Channels**, **Manage Roles**, **Send Messages**, **Embed Links**, **Attach Files**, and **Read Message History**. In thread mode it also needs **Create Private Threads** and **Manage Threads**.
2. Run `/tickets setup enabled:true category:<category> transcripts:<channel> logs:<channel> support-role:<role>`.
3. Create ticket types: `/tickets category-create name:"General Support"`. In the portal you can add up to 5 form questions per type.
4. Post a panel: `/tickets panel name:main channel:#support`.
5. Optional: enable the **Message Content** intent in the Discord Developer Portal and set `DISCORD_MESSAGE_CONTENT_INTENT=true`. Without it, transcripts record activity but not message text.

After the first deploy that adds these commands, redeploy slash commands with the existing command deployment script.

## Features

- **Ticket reasons** with their own emoji, button color, description, default priority, support roles, alerted members, required roles, per-type open limit, channel or category override, name template, opening message, and up to 5 form questions (pop-up form).
- **Panels** as buttons (up to 25) or a dropdown menu, with title, text, color, image, and footer. Panels can be updated in place.
- **Private channels or private threads.** Channel names come from a template (`{number}`, `{username}`, `{category}`).
- **Staff tools:** claim, unclaim, transfer, add/remove members, rename, priority (low/normal/high/urgent), "waiting on member" status, tags, internal notes (never shown to the member), replies from the portal, reopen, delete channel.
- **Closing:** member close on/off, confirmation, required reason, keep (read-only, optional move to a closed category) or delete after a delay.
- **Claim lock:** optionally only the claimer can reply after a claim (channel mode).
- **Transcripts** posted to a channel on close, downloadable in Discord and the portal, and optionally DMed to the member. Staff copies include internal notes; member copies do not.
- **Feedback:** 1-5 star rating buttons DMed after close.
- **Auto-close** after N hours without activity, with an optional warning, and an option to skip claimed tickets.
- **Limits and blocks:** open tickets per member, blocked members, blocked roles.
- **Logs** of opens, claims, escalations, closes, reopens, and ratings to a log channel.
- **Statistics:** counts by status and type, average rating, average first response time, average resolution time, top staff.

## Portal

Setup is easiest in the portal at `/tickets`:

1. **Settings:** turn tickets on, pick the default Discord category, the support team roles, and the transcript and log channels.
2. **Ticket reasons:** add one reason per button (for example General Support, Report a Player, Ban Appeal). Each reason can have its own Discord category, support roles, alerted members (added to the ticket and pinged), roles required to open it, per-member limit, opening message, and up to 5 form questions.
3. **Panels:** choose the channel, title, message, color, and which reasons to show. The live preview shows how it will look in Discord. Click **Post in Discord**.

Users with `tickets.handle` also get the Inbox (filter, search, conversation, replies, notes, actions) and Statistics. `tickets.manage` unlocks Ticket reasons, Panels, and Settings.

All ticket changes from the portal require the CSRF token that the portal
sends automatically.

## Known limitations

- Message text in transcripts needs the privileged Message Content intent.
- In thread mode, claim lock is not available (threads have no per-role permissions), and closed threads are archived and locked rather than made read-only per member.
- `/ticket open` cannot show a form. Ticket types with required questions must be opened from a panel.
- Transcripts are plain text.
