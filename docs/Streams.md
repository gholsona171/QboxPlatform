# Streams

Announce when your creators go live on Twitch, Kick, or YouTube, and when a
YouTube channel uploads a new video. Follow up to 25 creators per server from
the portal (**Community > Streams**) or with `/streams`.

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, platform clients, Discord REST adapter | `modules/streams` (`@qbox/streams`) |
| Database models | `StreamsSettings`, `StreamsSubscription` in `prisma/schema/streams.prisma` |
| PostgreSQL repository | `packages/database/src/streams/PrismaStreamsRepository.ts` |
| `/streams` command | `packages/discord/src/commands/Streams.command.ts` |
| Check timer | `packages/discord/src/streams/StreamsFeature.ts` |
| API | `apps/api/src/streams/StreamsRoutes.ts` |
| Portal | `apps/web/public/js/streams.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `streams.manage` | Add, edit, test, and remove creators; change settings; open the portal page |

`/streams list` is open to everyone. Discord administrators can do everything.

## What it does

- **Go-live announcements.** Guildhall checks each creator at the interval you
  choose (default every 90 seconds). When a creator goes live it posts in the
  creator's channel (or the default channel): the message text, an embed in the
  platform's color with the creator's avatar, the stream title, the game or
  category, the viewer count, a preview image, and a **Watch** button. Each
  stream is announced once, even if the check sees it many times or the
  creator's connection drops for a moment.
- **Role pings.** Choose a role per creator. The message starts with the
  mention, for example `@Live Alerts **Amy** is live on Twitch!`.
- **When the stream ends.** After two checks in a row show the creator
  offline, the announcement is edited to say the stream ended and how long it
  ran (default), deleted, or left alone. Pick this in Settings.
- **New YouTube videos.** Turn on "Also announce new videos" for a YouTube
  creator to post each new upload. The first check only remembers the newest
  video; uploads after that are announced (at most three per check).
- **Custom text.** Each creator can have its own message text with
  placeholders. The whole announcement can also be redesigned per server with
  message templates (`streams.live`, `streams.ended`, `streams.video`).
- **Test.** The portal's **Test** button and `/streams test` post the
  announcement right away with the current stream, or a sample one when the
  creator is offline.

## Placeholders

Message text and templates can use these:

| Message | Placeholders |
| --- | --- |
| `streams.live` | `{ping}` role mention (empty when no role is set), `{creator}`, `{platform}`, `{title}`, `{game}`, `{viewers}`, `{url}`, `{thumbnail}`, `{startedAt}`, `{server}` |
| `streams.ended` | `{creator}`, `{platform}`, `{duration}` (for example `2h 15m`), `{url}` |
| `streams.video` | `{creator}`, `{title}`, `{url}`, `{publishedAt}` |

## Setup

1. Grant `streams.manage` to the staff who manage creators.
2. Open **Community > Streams** in the portal and press **Add your first
   creator**. Pick the platform, type the channel name, handle, or a link to
   the channel, and press **Check** to see the name and avatar Guildhall found.
3. Choose the channel for announcements and, if you like, a role to ping.
   Creators without a channel use the default channel from Settings.
4. In **Settings**, decide what happens to the announcement when the stream
   ends and how often to check.

From Discord: `/streams add platform:Twitch creator:shroud channel:#live ping:@Live Alerts`,
`/streams list`, `/streams test creator:shroud`, `/streams remove creator:shroud`.

## Host setup (credentials)

Add these to the host's `.env` (they are all optional; the bot and API read
them at start):

| Variable | Needed for |
| --- | --- |
| `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` | Twitch. Without them Twitch creators cannot be added; the portal says "needs app credentials on the host". |
| `KICK_CLIENT_ID`, `KICK_CLIENT_SECRET` | Kick's official API. Without them Guildhall reads `kick.com`'s public channel endpoint with a browser User-Agent, which usually works but can be blocked by Cloudflare now and then (checks back off and retry). |
| `YOUTUBE_API_KEY` | YouTube Data API v3. Without it Guildhall reads the public channel page and `/live` page; new videos always come from the channel's RSS feed. With a key, live checks use the search endpoint (100 quota units per check per creator, so keep the interval long if you follow many channels). |

**Twitch:** sign in at <https://dev.twitch.tv/console>, open **Applications >
Register Your Application**, name it, set the OAuth redirect URL to
`http://localhost`, choose category **Chat Bot**, and create it. Copy the
**Client ID**, then press **New Secret** and copy the secret. Guildhall uses an
app access token (client credentials); no Twitch account needs to log in.

**Kick:** sign in at <https://kick.com>, open **Settings > Developer**, create
an app, and copy its client ID and secret.

**YouTube:** in the Google Cloud console create a project, enable
**YouTube Data API v3**, and create an API key under **Credentials**.

## How checks work

- The bot's timer runs every 30 seconds and checks each creator whose interval
  has passed. Twitch lookups are grouped, up to 100 creators per request across
  every server; Kick's official API is grouped 50 per request.
- After a failed check (platform down, rate limit, blocked request) the wait
  doubles each time, up to 30 minutes, and goes back to the normal interval as
  soon as a check succeeds. The last error shows in the portal next to the
  creator, in plain words.
- The announcement is posted through the bot, so the bot needs **View Channel**,
  **Send Messages**, and **Embed Links** in the announcement channel, and
  **Manage Messages** is not needed (it edits and deletes its own messages).

## Known limitations

- Checks only run while the bot is running.
- Without a YouTube API key, live detection depends on YouTube's public pages
  and may lag a minute or two; viewer counts are best effort.
- Kick's site endpoint is not an official API; when Kick blocks it, checks back
  off and try again later. Add Kick app credentials for a supported path.
