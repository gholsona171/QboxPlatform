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

Discord administrators can do everything.

## Using it

1. **Questions:** describe your server and let the AI design it (see
   **Describe your server** below), or pick a starting point (FiveM roleplay,
   gaming, community, or business), then change the answers: server name,
   staff ranks (highest first), departments, whether staff can see every
   department channel, voice lounges, which sections to include, and how
   emoji are used in names. **Make blueprint** saves it as your draft.
2. **Blueprint:** see every role (with its color) and every category and
   channel, with who can see and who can post in each channel. Rename things
   in place, change a channel's type, remove roles, channels, or categories,
   add channels, and edit who can see each channel (**Access**) and how
   forums are set up (**Forum setup**). Counts are shown against Discord's
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
| Tickets | Transcripts in `#ticket-transcripts`; tickets open in the Support category; staff roles can answer; a Support ticket type and a panel in `#open-a-ticket` if you have none |
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

A link that fails is shown in the log and does not stop the rest. Links are
not undone by **Undo this build**.

When verification is turned on, everything except the Start Here category is
hidden until members verify. Existing members need to verify too, or be given
the Verified role.

## Undo

**Undo this build** deletes only the roles, categories, and channels that
build created, found by the IDs saved when they were made. Things that were
skipped because they already existed are never touched. Deleted channels
lose their messages. If some items can't be deleted, the build is marked
"finished with problems" and you can try again.

## Limits

- 500 channels and categories per server, 50 channels per category, 250 roles
  (Discord's limits; your existing channels and roles count too).
- Names are 1-100 characters. Text, announcement, forum, and media channel
  names are lowercase with hyphens.
- Forum guidelines up to 4096 characters, 20 tags with names of 1-20
  characters, first post title 1-100 and content 1-2000 characters.
- One build or undo runs at a time. Builds run in the API in the background;
  if the API restarts during one, it is marked failed and whatever was created
  can be undone.
- Discord rate limits are handled automatically, so a large server can take
  a minute or two.
