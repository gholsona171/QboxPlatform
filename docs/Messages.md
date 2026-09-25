# Look & Messages

Make Guildhall's messages your own from the portal (`/messages`): one **look**
(color, footer, author, thumbnail) applied to every embed the bot sends, and
custom **messages** (text and embed) for individual events such as the ticket
welcome, the warning DM, or the level-up post.

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, look, REST decorator, Discord adapter | `modules/messages` (`@qbox/messages`) |
| Message catalog and the `MessageTemplates` port features call | `packages/shared/src/messages.ts` |
| Database models | `MessagesLook`, `MessagesTemplate` in `prisma/schema/messages.prisma` |
| PostgreSQL repository | `packages/database/src/messages/PrismaMessagesRepository.ts` |
| Bot wiring (REST wrapper, interaction map) | `packages/discord/src/messages/` |
| API | `apps/api/src/messages/MessagesRoutes.ts` |
| Portal | `apps/web/public/js/messages.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `messages.manage` | Change the look, customize and reset messages, send tests |

Discord administrators can do everything. There are no slash commands; this
feature is set up in the portal only.

## The look

Open **Look & Messages > Look**. Everything is optional:

- **Accent color:** the colored bar on the left of each embed, as a hex color like `#5865F2`.
- **Author name and icon:** shown above the embed title.
- **Footer text and icon:** shown below the embed.
- **Thumbnail:** a small image in the top right of every embed.
- **Add the time:** shows when the message was sent in the footer.
- **How to apply it:** **Fill** only sets what an embed leaves empty, so a
  feature's own color or footer stays. **Override** always uses your color,
  footer, and author. Thumbnail and time only ever fill.

Footer and author text understand `{server}` (your server's name) and
`{brand}` (Guildhall). The preview on the right updates as you type.

The look is applied when a message leaves the bot, so it covers every feature
without any of them knowing about it. Direct messages are never themed. If
anything goes wrong while applying the look, the message is sent as is. A
change takes effect within a minute.

## Custom messages

Open **Look & Messages > Messages**. The list shows every message the bot can
send, grouped by feature, with a **Customized** badge where you replaced the
default.

- **Customize / Edit** opens the editor. **Form** has the message text and
  one embed (title, description, color, links, author, footer, and up to 25
  fields). **JSON** holds the same message as standard Discord message JSON,
  `{ "content": "...", "embeds": [ ... ] }`, the format embed builders such
  as Discohook export, so you can paste your own. The two stay in sync, and
  invalid JSON is not saved. Discord embeds are JSON, not HTML; Discord's own
  markdown (`**bold**`, `<@id>` mentions) works in every text field.
- **Placeholders** are the values the feature fills in when it sends the
  message, for example `{user}` or `{number}`. Click one to insert it where
  you were typing. Each message lists only the placeholders it can supply.
- **Preview** shows the message with sample values and your look.
- **Send test** posts the preview to a channel you choose.
- **Save** stores the message; **Reset to default** deletes it so the built-in
  message is used again.

A message that renders to nothing (for example, only unknown placeholders)
falls back to the default. Changes take effect within a minute.

### Placeholders by message

| Message | Placeholders |
| --- | --- |
| Ticket opened | `{user}` `{username}` `{server}` `{number}` `{reason}` `{reasonNumber}` `{subject}` |
| Ticket closed DM | `{user}` `{username}` `{server}` `{number}` `{reason}` `{subject}` |
| Warning DM | `{user}` `{username}` `{server}` `{moderator}` `{caseNumber}` `{reason}` |
| Case log entry | `{user}` `{username}` `{server}` `{moderator}` `{caseNumber}` `{action}` `{reason}` `{duration}` `{rule}` |
| Level up | `{user}` `{username}` `{server}` `{level}` `{xp}` `{rank}` |
| Giveaway started | `{server}` `{prize}` `{winners}` (how many) `{host}` `{endsAt}` |
| Giveaway ended | `{server}` `{prize}` `{winners}` (mentions) `{host}` |
| Welcome / goodbye | `{user}` `{username}` `{server}` `{memberCount}` |
| Verified welcome | `{user}` `{username}` `{server}` |
| Birthday announcement | `{user}` `{username}` `{server}` `{age}` `{date}` |

`{user}`, `{moderator}`, and `{host}` are mentions; `{username}` is plain text.
Dates and times such as `{endsAt}` show in each member's own time zone.

## Limits

Discord's own: up to 10 embeds per message, titles 256 characters,
descriptions 4096, 25 fields (names 256, values 1024), footers 2048, author
names 256, 6000 characters per embed in total, message text 2000. Image and
icon links must start with `http://` or `https://`.

## For developers

Features send a message by building their default `OutgoingMessage` and
calling `templates.apply(guildId, key, values, defaultMessage)` on the
`MessageTemplates` port from `@qbox/shared/messages`, then posting what comes
back. New keys are appended to `MESSAGE_CATALOG` in that file. The bot and the
API each wrap their Discord REST client once (`installThemedRequests`) so the
look reaches every embed, including discord.js interaction replies.
