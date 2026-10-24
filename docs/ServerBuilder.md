# Server Builder

Answer a few questions in the portal, check the blueprint, and click **Build**.
Guildhall creates the roles, categories, channels, and channel permissions in your
Discord server, then connects them to the other Guildhall features (moderation
logs, verification, tickets, and so on). It works on the one server Guildhall is
set up for.

## Where the code lives

| Part | Location |
| --- | --- |
| Blueprint, generator, presets, build runner, Discord REST adapter | `modules/server-builder` (`@qbox/server-builder`) |
| AI designer ("Describe your server") | `modules/server-builder/src/BlueprintDesigner.ts` (`OpenAiBlueprintDesigner`) |
| Database models | `BuilderDraft`, `BuilderRun`, `BuilderRunItem` in `prisma/schema/builder.prisma` |
| PostgreSQL repository | `packages/database/src/builder/PrismaBuilderRepository.ts` |
| `/builder` command | `packages/discord/src/commands/Builder.command.ts` |
| API and feature links | `apps/api/src/builder/BuilderRoutes.ts`, `apps/api/src/builder/builderLinks.ts` |
| Portal | `apps/web/public/js/builder.js` (page **Server Builder**, `/builder`) |

## Permissions

| Permission | Allows |
| --- | --- |
| `builder.manage` | Everything: answers, blueprint, building, undo, `/builder status` |

Discord administrators can do everything. Wiping the server is stricter: only
the server owner, a member with the Discord Administrator permission, or a
platform owner can wipe (see **Wiping a server**).

## Using it

1. **Questions:** describe your server and let the AI design it (see
   **Describe your server** below), or pick a starting point (FiveM roleplay,
   gaming, community, business, or FiveM asset studio), then change the answers: server name,
   staff ranks (highest first), departments, whether staff can see every
   department channel, voice lounges, which sections to include, and how
   emoji are used in names. **Make blueprint** saves it as your draft.
2. **Blueprint:** see every role (with its color) and every category and
   channel, with who can see and who can post in each channel. Rename things
   in place, change a channel's type, remove roles, channels, or categories,
   add channels, and edit who can see each channel (**Access**) and how
   forums are set up (**Forum setup**). The **Tickets** card lists the ready-made
   ticket panel and ticket types (rename or remove them) and the three ticket
   status categories. Counts are shown against Discord's
   limits, with warnings. Every change is saved, so you can come back later.
3. **Build:** the bot check tells you if Guildhall is missing permissions. Choose a
   mode and which features to connect, then click **Build**. Progress and
   each step show live on the page.
4. **History:** past builds with what they created, skipped, and failed.
   **Undo this build** removes what that build created.

`/builder status` in Discord shows the last build.

### Modes

- **Add to my server:** roles, categories, and channels that already exist
  with the same name (and the same channel type) are skipped and reused.
- **Fresh layout:** everything is created, even if the names already exist.

Neither mode ever deletes or changes anything that is already in your
server.

## FiveM asset studio

For a team that makes and sells FiveM assets. The answers follow the same
questionnaire as every other starting point: **each product line is a
department**, so the starting point lists `Scripts`, `MLOs`, `Vehicles`,
`Clothing & EUP`, and `Props` under departments (all on). Delete a line to
switch that product line off; add your own (for example `Weapons`) and it gets
the same treatment with generic names (`Weapons Team`, `Weapons Buyer`,
`Weapons Support`). The sections, voice lounges, and emoji questions work as
usual (FiveM status and birthdays start off).

**Roles** (highest first): staff ranks Owner, Studio Manager, Lead Developer,
Developer, Moderator, Support (Owner is Administrator, Studio Manager gets
admin permissions, Support the trial set); one team role per product line
(Script Developer, MLO Builder, Vehicle Artist, Clothing Artist, Prop Artist);
Partner, Content Creator, Customer, one buyer role per product line (`Scripts
Buyer` ...), Server Owner, Beta Tester; Release Ping, Giveaway Ping, Event
Ping; Member (the verified role) and Unverified.

**Categories** (members see public ones after verifying):

| Category | Channels | Who sees / posts |
| --- | --- | --- |
| Start Here | welcome, rules, verify | everyone / staff |
| Information | announcements, releases (announcement), changelogs, free-releases, events, giveaways, polls | members / staff (releases, changelogs, free releases: staff and the product teams) |
| Store | store, pricing, bundles, faq, vouches | members / staff; vouches: Customer and buyers |
| Showcase (media section) | showcase, community-showcase | members / showcase: staff and teams (everyone reacts); community showcase: members |
| Community | general, off-topic, memes, introductions, dev-talk, server-owners, partners, bot-commands, suggestions, starboard, level-ups | members; server-owners: Server Owner and the team |
| One per product line (e.g. Scripts) | scripts-chat, scripts-help (forum), scripts-downloads, scripts-support | chat and help: members; downloads: that line's buyers read, staff and that line's team post; support: that line's buyers, staff, and team |
| Customers | customer-announcements, customer-chat, how-to-download, beta-testing | Customer, buyers, and Beta Tester (plus staff and teams); announcements and how-to-download are read-only for customers; beta-testing is Beta Tester only |
| Commissions | commission-info, commission-requests (forum) | members / commission-info: staff |
| Feedback | bug-reports, feature-requests, feedback (forums; text without the forums section) | members |
| Support | open-a-ticket, apply-here | members / staff |
| New Inquiries, In Progress, Finished | ticket status categories (empty; ticket channels live here) | staff |
| Events | Showcase Stage, event-chat | members |
| Voice | Join to Create, Community Lounge 1-2 | members |
| One team category per product line (e.g. Scripts Team) | scripts-dev, scripts-wip, scripts-tasks, Scripts Dev Room | that team and staff |
| Studio (staff area) | team-announcements, team-chat, planning, roadmap, qa-testing, commission-board, staff-commands, Team Voice, Team Meeting | staff and every team; team-announcements: Owner and Studio Manager post |
| Logs | mod-log, server-log, ticket-transcripts, applications-review, staff-log, store-log | staff / Guildhall (store-log is for store webhooks) |

Forums carry product-line tags (Script, MLO, Vehicle, Clothing, Prop) where
they fit (showcase, bug reports, feature requests, commission requests).

## Ticket setup

With the **Support tickets** section on, every starting point comes with a
ticket setup that the build creates when the **Tickets** feature is connected:

- **A panel** in `#open-a-ticket` with a title and text that fit the server
  (buttons; a menu when there are more than 10 types).
- **Ticket types** with their own emoji, button color, priority, support roles,
  and up to 5 form questions:

| Starting point | Panel title | Ticket types |
| --- | --- | --- |
| FiveM roleplay | `<server> Support` | General Support, Player Report, Ban Appeal, Staff Application, Donation / Store, Bug Report, one `<department> Department` per department (answered by that department's role) |
| Gaming | Need a hand? | General Help, Report a Player, Ban Appeal, Bug Report, Claim a Prize (giveaways on), Staff Application (applications on), one per department |
| Community | Need help? | General Support, Report a Member, Appeal a Punishment, Partnership Request, Something Else, one per department |
| Business | Contact the team | General Question, Technical Support, Billing & Invoices, Feature Request, one per department (Sales, Customer Success, Development) |
| FiveM asset studio | `<server> Support & Orders` | Purchase / Store Question, one support type per product line that is on (Script, MLO, Vehicle, Clothing & EUP, Prop Support, answered by that line's team), Custom Commission, Bug Report, Partnership / Content Creator, Refund / Licence Transfer |

- **Three status categories:** new tickets open in the first, claimed tickets
  and tickets waiting on the member move to the second, and closed tickets move
  to the third. Names per starting point: New Tickets / Tickets In Progress /
  Closed Tickets (roleplay), Open Tickets / Being Handled / Closed Tickets
  (gaming), Open Tickets / In Progress / Closed Tickets (community), New
  Requests / In Progress / Resolved (business), New Inquiries / In Progress /
  Finished (asset studio). They are ordinary blueprint categories (rename or
  remove them like any other) with a ticket purpose, visible to staff only.

A server keeps at most 25 ticket types (the Tickets limit and Discord's 25
buttons or menu options per panel), so a starting point with many departments
stops at 25. The setup is saved in the blueprint (`tickets`), so drafts saved
before it existed simply have none.

## Describe your server

At the top of the Questions tab, type what you are trying to do with the
server ("A Rust community with 3 wipes a month, a clan system, a trading
market, and a ticket desk for base raids") and click **Design it for me**.
Guildhall asks an AI model to fill in the questions the way the starting
points do (server type, name, staff ranks, departments, voice lounges,
sections, emoji), and to add what the starting points don't have: extra
roles, extra categories with their own channels and access (everyone, staff,
or named roles), and a list of generated channels to leave out. The result is
saved as your draft, the model's one-line summary of what it understood is
shown, and the Blueprint tab opens. Everything the AI added can be edited or
removed like anything else. Your description is kept with the answers.

The model never writes the blueprint itself: it returns a short list of
answers and extras that Guildhall checks against the same rules as the
questionnaire, and anything that would break the blueprint (a bad name, too
many channels) is left out and mentioned in the summary.

Nothing is built until you click **Build** on the Build tab.

This needs an OpenAI API key on the host: set `OPENAI_API_KEY` (and
optionally `OPENAI_MODEL`, default `gpt-4o-mini`) in the API's `.env` and
restart. Without it the card says so and the rest of the builder works as
before. A model that does not answer or answers with something unexpected is
reported as a plain error; try again.

## Channel emojis

Two questions control emoji in names:

- **Emoji in category names** puts an emoji in front of each category, like
  `📢 INFORMATION`.
- **Emoji in channel names** chooses which channels get one: **None**, **Key
  channels only** (channels connected to a feature, plus everything in Start
  Here, Information, and Support), or **Every channel** (the default). The
  business starting point uses key channels only.
- **Emoji style** chooses how it is joined: **Bar** (`👋┃welcome`,
  `🔊┃Lounge 1`) or **Dash or space** (`👋-welcome`, `🔊 Lounge 1`).

The emoji comes from a curated table by what the channel is for (welcome 👋,
rules 📜, verify ✅, announcements 📢, tickets 🎫, mod-log 🔨, department
chat 💬, briefings 📋, radio 📻, lounges 🔊, and so on), with a keyword match
for channels you add yourself. Rename a channel in the Blueprint to change or
remove its emoji.

In **Add to my server** mode the emoji is ignored when matching names, so
`👋┃welcome` reuses an existing `welcome` channel, and `welcome` reuses an
existing `👋-welcome`.

## Who can see each channel

Every channel row shows "Sees: ... · Posts: ..." (voice: "Joins"). Click
**Access** on a channel or a category header to change it. The editor lists
@everyone and every role in the blueprint (staff ranks first, then
departments, then the rest), each with one choice:

| Choice | Means |
| --- | --- |
| Default | No override: the channel inherits the category, and the category inherits the server |
| Hidden | The role cannot see the channel |
| See only | Can see and read, but not post (voice: not join) |
| See & post / See & join | Can see and post (voice: connect and speak) |

Each role can also get **Manage**: delete messages and manage threads in text
channels, mute and move members in voice channels. The summary line updates
as you click; nothing is saved until **Save**. On a category, **Apply to all
channels in this category** copies the category's choices into every channel
in it, replacing what those channels had for those roles.

Department categories are hidden from everyone except the department role.
The question **Staff can see every department channel** (on by default)
also lets every staff rank see, post, and join in them. Turn it off for
department-only channels, or use **Access** afterwards to let in specific
roles.

## Forums

Forum and media channels get a full setup, like Discord's own "get started"
checklist: post guidelines (the channel topic), up to 20 tags (each with an
optional emoji), a default reaction added to every new post, and a first post
that is pinned to the top. The generator fills these in for the forums it
creates (help, feedback, character bios, bug reports) and the media channels
(tags and reaction only, since media posts need an attachment). Click
**Forum setup** on a forum channel to change any of it, or clear the first
post. Changing a channel's type to forum or media adds a plain setup; changing
it away removes it.

The first post is made right after the channel is created; the build log
shows "First post pinned." on the channel, or a note if the post could not be
made (the channel itself still counts as created). An existing forum that is
skipped in **Add to my server** mode gets no post. Undo deletes the channel,
and the post with it.

Emoji can be a normal emoji such as 👍 or a custom emoji as `name:id`.

## Setup

1. Give the Guildhall bot **Manage Roles** and **Manage Channels**. Making it an
   **Administrator** is simplest: without it, Guildhall can only give roles and
   channel permissions it has itself, and anything else is listed as failed.
2. Drag the Guildhall role to the **top** of the role list (Server Settings >
   Roles). New roles are placed just under it, in rank order. If that is not
   allowed, the build still works and you can drag the roles into place.
3. Announcement, stage, and media channels need **Community** turned on
   (Server Settings > Enable Community). Without it, Guildhall makes them as text
   or voice channels and says so in the build log. Forums that can't be
   created fall back to text channels the same way.

## Connecting features

After the layout is built, the chosen links save the new channels and roles
into each feature's settings. Other settings you already made are kept.

| Feature | What is set |
| --- | --- |
| Moderation | Log channel = `#mod-log`; staff roles become protected roles |
| Verification | Turned on; panel in `#verify` (posted if possible); Verified and Unverified roles; log to `#mod-log` |
| Tickets | Transcripts in `#ticket-transcripts`; staff roles can answer; tickets open in the new-tickets status category, move to the in-progress one when claimed or waiting, and to the closed one when closed (a category you already picked that still exists is kept); the blueprint's ticket types you don't have yet (matched by name; existing ones are left as you set them up); its panel in `#open-a-ticket` if you have no panel. Blueprints without a ticket setup get a Support type and panel if you have none, as before |
| Applications | Forms with no review channel use `#applications-review`; forms with no reviewer roles use the staff roles |
| Staff | Log channel = `#staff-log`; ranks from the staff roles if you have no ranks |
| Levels | Turned on; level-up messages in `#level-ups` |
| Birthdays | Turned on; messages in `#birthdays` |
| FiveM Server | Status message in `#server-status`, alerts in `#server-alerts` |
| Voice Rooms | The join-to-create channel becomes a hub, if you have no hubs |
| Welcome messages | Welcome channel = `#welcome` |
| Server logs | All logs go to `#server-log` |
| Starboard | Starred messages go to `#starboard` |
| Rules | An existing rules message moves to `#rules` (post it again with `/rules`) |

A link that fails is shown in the log and does not stop the rest. Settings a
link changed are not undone by **Undo this build**, but the ticket types and
the ticket panel the Tickets link made are listed in the build log ("Ticket
type: ...", "Ticket panel: ...") and undo removes them (the panel's Discord
message too). Everything the build made in Tickets is ordinary Tickets data:
staff edit it afterwards on the Tickets page, and a later build never
overwrites those edits.

When verification is turned on, everything except the Start Here category is
hidden until members verify. Existing members need to verify too, or be given
the Verified role.

## Undo

**Undo this build** deletes only the roles, categories, and channels that
build created, found by the IDs saved when they were made, plus the ticket
panel (and its message) and ticket types the Tickets link made; ticket types
are removed from any other panel that offered them first. Things that were
skipped because they already existed are never touched. Deleted channels
lose their messages. If some items can't be deleted, the build is marked
"finished with problems" and you can try again.

## Wiping a server

The **Wipe server** card at the bottom of the Build tab erases everything
inside Discord so you can start a server clean (for a first install). The
Build tab also has a third build mode, **Wipe the server first, then build**,
which wipes and then builds the current blueprint (Fresh) and connects the
features, as one run.

**Only the server owner, a member with the Discord Administrator permission,
or a platform owner can wipe.** `builder.manage` alone (or Manage Server
alone) is not enough. Everyone else sees the card with one line saying why.

**What a wipe deletes** (the owner picks; all on by default except emojis):

- Every channel and category (text, voice, forum, media, stage, announcement;
  threads go with their channels).
- Every role it can delete: not `@everyone`, not managed (bot, integration,
  or booster) roles, and below the Guildhall role. Roles above the Guildhall
  role are kept and listed as "above the Guildhall role" with a tip to move
  the Guildhall role to the top.
- Optionally, custom emojis and stickers.

**Never deleted:** the server itself, members, bans, `@everyone`, and managed
roles. While Community is on, Discord refuses to delete the rules channel and
the public updates channel (error 50074); Guildhall keeps those two, records
"Discord requires it for Community (turn Community off in Server Settings to
remove it)", and carries on. Any other per-item failure is recorded and the
wipe continues.

**The confirmation** lists exact counts (channels, categories, roles, emojis,
stickers, and what will be kept), states that messages and channels cannot be
recovered, and requires typing the server name exactly (case-sensitive) plus
ticking "I understand". The API re-checks the typed name.

**Snapshot and rebuild.** Before deleting, Guildhall reads the full current
layout (roles, categories, channels, and their permissions) and stores it with
the run. The History entry for a wipe offers **Load as blueprint**, which turns
that snapshot back into a blueprint and saves it as your draft, so you can
rebuild the old layout. Member-specific permission overrides and permissions
Guildhall does not manage are dropped with a note. **Messages cannot be
recovered** — only the layout.

A wipe runs in the background like a build, one at a time per server (a build
and a wipe never overlap), with progress shown live. Undo is not offered for a
wipe; the History entry offers **Load as blueprint** instead. The bot needs
Manage Channels, Manage Roles, and (for emojis and stickers) Manage
Expressions; the preview lists anything missing. At most one wipe per server
every 10 minutes.

## Limits

- 500 channels and categories per server, 50 channels per category, 250 roles
  (Discord's limits; your existing channels and roles count too).
- Names are 1-100 characters. Text, announcement, forum, and media channel
  names are lowercase with hyphens.
- Forum guidelines up to 4096 characters, 20 tags with names of 1-20
  characters, first post title 1-100 and content 1-2000 characters.
- Ticket setup: up to 25 ticket types (names up to 80 characters,
  descriptions up to 100), 5 questions per type with labels up to 45
  characters; panel title up to 256 and text up to 4000 characters.
- One build or undo runs at a time. Builds run in the API in the background;
  if the API restarts during one, it is marked failed and whatever was created
  can be undone.
- Discord rate limits are handled automatically, so a large server can take
  a minute or two.
