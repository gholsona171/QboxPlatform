# Tickets

Support tickets for the Discord server. Members open tickets from a panel or
with `/ticket open`. Staff handle them in Discord or in the portal at `/tickets`.

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, validation, Discord REST adapter | `modules/tickets` (`@qbox/tickets`) |
| Transcripts (.txt and .html) | `modules/tickets/src/transcripts.ts` |
| PostgreSQL persistence | `packages/database/src/tickets/PrismaTicketRepository.ts` |
| Database models | `TicketSettings`, `TicketCategory`, `TicketPanel`, `Ticket`, `TicketMessage`, `TicketEvent` in `prisma/schema/tickets.prisma` |
| Discord commands | `packages/discord/src/commands/Ticket.command.ts`, `Tickets.command.ts` |
| Buttons, dropdowns, forms | `packages/discord/src/tickets/DiscordTicketInteractionHandler.ts` |
| Message recording (ticket and staff chat), deleted channels, auto-close, retention | `packages/discord/src/tickets/DiscordTicketEventHandler.ts` |
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

1. Give the bot **Manage Channels**, **Manage Roles**, **Send Messages**, **Embed Links**, **Attach Files**, **Read Message History**, **Create Private Threads**, **Manage Threads**, and **Send Messages in Threads**. The last three are needed for the staff chat (both modes) and for ticket threads (thread mode).
2. Run `/tickets setup enabled:true category:<category> transcripts:<channel> logs:<channel> support-role:<role>`.
3. Create ticket types: `/tickets category-create name:"General Support"`. In the portal you can add up to 5 form questions per type.
4. Post a panel: `/tickets panel name:main channel:#support`.
5. Optional: enable the **Message Content** intent in the Discord Developer Portal and set `DISCORD_MESSAGE_CONTENT_INTENT=true`. Without it, transcripts record activity but not message text.

After the first deploy that adds these commands, redeploy slash commands with the existing command deployment script.

## Features

- **Ticket reasons** with their own emoji, button color, description, default priority, support roles, alerted members, required roles, per-type open limit, channel or category override, name template, opening message, and up to 5 form questions (pop-up form).
- **Panels** as buttons (up to 25, in up to 5 rows you can arrange) or a dropdown menu, with title, text, color, image, and footer. Panels can be updated in place.
- **Private channels or private threads.** Channel names come from a template (`{number}`, `{reasonNumber}`, `{reason}`, `{username}`).
- **Numbering per reason.** Every ticket gets a server-wide number, and every reason counts its own tickets too: the fifth "Donations" ticket is Donations #5. A reason with no channel-name template of its own names channels `{reason}-{reasonNumber}` (for example `donations-5`), so each reason numbers itself without any manual naming.
- **Staff tools:** claim, unclaim, transfer, add/remove members, rename, priority (low/normal/high/urgent), "waiting on member" status, tags, internal notes (never shown to the member), replies from the portal, reopen, delete channel.
- **Closing:** member close on/off, confirmation, required reason, keep (read-only, optional move to a closed category) or delete after a delay.
- **Claim lock:** optionally only the claimer can reply after a claim (channel mode).
- **Staff chat:** a private thread per ticket where staff talk without the member (see below).
- **Transcripts** posted to a channel on close (.txt and .html), downloadable in Discord and the portal, and DMed to the member (on by default for new servers). Staff copies include the staff chat; member copies never do.
- **Keeping tickets:** closed tickets are deleted after 6, 9 or 12 months (default 12), or kept forever.
- **Feedback:** 1-5 star rating buttons DMed after close.
- **Custom messages:** customize the opening message under Look & Messages (key `tickets.opened`) and the closing DM (key `tickets.closed-dm`).
- **Auto-close** after N hours without activity, with an optional warning, and an option to skip claimed tickets.
- **Limits and blocks:** open tickets per member, blocked members, blocked roles.
- **Logs** of opens, claims, escalations, closes, reopens, and ratings to a log channel.
- **Statistics:** counts by status and type, average rating, average first response time, average resolution time, top staff.

## Staff chat

When a ticket opens, the bot creates a private thread that only staff can see.
It is on by default (**Settings → Staff chat**); each ticket reason can follow
the server setting, always open one, or never open one (API field
`staffThread`: `INHERIT`, `ON`, `OFF`; setting `staffThreadEnabled`).

- **Channel mode:** right after the ticket channel is created and the opening message posted, the bot creates a private thread inside the ticket channel named `🔒 staff-<ticket channel name>`, so it appears inside the ticket.
- **Thread mode:** the ticket is itself a private thread, and a thread cannot contain another thread. The staff chat is a separate private thread in the same parent channel, named `🔒 staff-ticket-<number>`. Its first message links to the ticket thread, and the **🔒 Staff chat** button in the ticket links to it.

The thread's first message reads "Staff-only chat for Ticket #N – reason.
@member cannot see this thread." and pings the support roles. The member who
opened the ticket is never added. Staff join the thread when:

- they are an alerted member of the ticket's reason (added when the ticket opens),
- they claim the ticket (or it is transferred to them),
- they send their first message in the ticket, or
- they press **🔒 Staff chat** on the ticket's opening message. Only staff (the same rule as claiming) can; anyone else gets "Only staff can open the staff chat." The reply links to the thread.

Messages in the staff thread are saved as the ticket's staff chat (internal
notes). Notes written in the portal are posted in the thread as "Name (from
portal):". The portal shows them under **Staff chat (not visible to the
member)** with a link to the thread. Staff transcripts include them marked
`[staff chat]`; member transcripts never do.

When the ticket closes, the staff thread is archived and locked; reopening the
ticket unarchives it. When the ticket channel is deleted, the thread goes with
it in channel mode and is deleted too in thread mode.

If Discord refuses to create the thread (missing **Create Private Threads** or
**Manage Threads**), the ticket still opens. The ticket history records
`staff-thread-failed` and the portal shows "Staff chat could not be created:
the bot needs Create Private Threads and Manage Threads."

## Transcripts and keeping tickets

**Send the member their transcript when the ticket closes** is on by default
for new servers (existing servers keep their saved choice). The DM holds:

1. a summary: ticket number (and the reason's own number), server, reason, opened and closed times, who closed it, the close reason, and the message count;
2. `ticket-<N>-transcript.txt`, which Discord previews inline on desktop and mobile;
3. `ticket-<N>-transcript.html`, one self-contained page (dark Discord-like style, no scripts, nothing loaded from the internet) that opens in any browser and can be kept forever.

Both files leave out the staff chat. If the member's DMs are closed, the bot
says so in the ticket before it is archived and records
`transcript-dm-failed`; staff can retry with **Send transcript to member** on
the closed ticket in the portal (`POST /api/v1/tickets/:id/send-transcript`,
`tickets.handle` or `tickets.manage`). The staff copy posted in the transcript
channel has both files and includes the staff chat. Each file is kept under
8 MB (Discord allows 10 MB); a longer transcript is cut and ends with
"Transcript truncated; the full ticket is in the portal until <date>". The
portal downloads either format (`/transcript` and `/transcript?format=html`).

**Keep closed tickets for** 6, 9 or 12 months (default 12), or forever
(`retentionMonths`: 6, 9, 12, or 0). Once a day (and when the bot starts) the
bot deletes closed tickets whose close date is older than that, with their
messages and history, 200 at a time. Open tickets are never deleted. Members
keep the transcript they were sent.

## Portal

Setup is easiest in the portal at `/tickets`:

1. **Settings:** turn tickets on, pick the default Discord category, the support team roles, and the transcript and log channels.
2. **Ticket reasons:** add one reason per button (for example General Support, Report a Player, Ban Appeal). Each reason can have its own Discord category, support roles, alerted members (added to the ticket and pinged), roles required to open it, per-member limit, opening message, and up to 5 form questions.
3. **Panels:** choose the channel, title, message, color, and which reasons to show. The live preview shows how it will look in Discord. Click **Post in Discord**.

Channel and role pickers read the server's channels and roles again when the
list is older than 15 seconds, when you come back to the tab, and when you
switch servers. The **↻** button next to a picker reloads the list right away
and keeps what you chose. A saved channel or role the server no longer has
shows as `#deleted-channel (missing)` or `@deleted-role (missing)`: pick a new
one and save.

### Arranging buttons in rows

A buttons panel shows up to 5 rows of up to 5 buttons (Discord's limits). By
default the buttons fill rows automatically, five per row, in the order of the
ticked reasons. To choose the rows yourself:

1. Open the panel under **Panels** and tick the reasons it offers.
2. Tick **Arrange the buttons into rows myself**. Each row shows as a box with its reason buttons.
3. Use **←** and **→** to move a button to the previous or next row, and **↑** and **↓** to move it earlier or later within its row. **+ Add row** adds a row (up to 5); an empty row has a **Remove row** button, and empty rows are left out when you save.
4. The Discord preview shows the rows exactly as they will be posted. Save the panel, then click **Update in Discord**.

Every ticked reason must be in exactly one row. Ticking a new reason adds it to
the last row with space; unticking one removes it from its row. Untick
**Arrange the buttons into rows myself** to go back to automatic rows. Dropdown
panels ignore rows. The API field is `rows` on the panel (reason IDs per row,
`null` for automatic), stored as `ticket_panels.button_rows`.

### After rebuilding your server

If you delete the channels in your server and rebuild it with the server
builder, the build connects Tickets to the new channels (it asks Discord which
channels still exist):

- **Ticket panel:** the first panel whose channel was deleted moves to the new panel channel (for example `#open-a-ticket`), forgets its old message, and is posted there. The build summary says "ticket panel moved to #open-a-ticket and posted". With no panels at all, a Support panel is created and posted as before. Panels in channels that still exist are left alone.
- **Settings:** a deleted open-ticket category moves to the new tickets category; a deleted transcript or log channel moves to the new transcripts channel; a deleted closed-ticket category is cleared (the build makes none).
- **Ticket reasons:** a reason whose own Discord category was deleted moves to the new tickets category (or has the override cleared).
- **Verification:** a deleted verification, log, or welcome channel is replaced by the new one when the build made one, otherwise cleared; the summary says what to pick again.
- **Applications:** forms whose review channel was deleted move to the new review channel. Application panels in deleted channels are only reported, because the build does not make an application panel channel.

What you pick again yourself: other panels whose channels were deleted (they
show a **Channel missing** badge; **Post in Discord** opens the panel with its
channel picker), any application panel in a deleted channel, and any setting
shown as `#deleted-channel (missing)`. Posting a panel whose channel no longer
exists fails with "The panel's channel no longer exists. Pick a new channel for
this panel and post it again." instead of a Discord error. If only the old panel
message was deleted, posting simply sends a new one. Moving a panel to another
channel removes the old message and posts a fresh one next time.

Users with `tickets.handle` also get the Inbox (filter, search, conversation, replies, notes, actions) and Statistics. `tickets.manage` unlocks Ticket reasons, Panels, and Settings.

All ticket changes from the portal require the CSRF token that the portal
sends automatically.

## Known limitations

- Message text in transcripts needs the privileged Message Content intent.
- In thread mode, claim lock is not available (threads have no per-role permissions), and closed threads are archived and locked rather than made read-only per member.
- `/ticket open` cannot show a form. Ticket types with required questions must be opened from a panel.
- Transcripts record message text and attachments. Embeds other members or bots post are not recorded; the opening form is shown as a summary block.
- Staff who talk only through a bot or webhook are not added to the staff chat automatically.
