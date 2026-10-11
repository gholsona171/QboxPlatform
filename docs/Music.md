# Music

Play music and internet radio in your voice channels: YouTube songs by name
or link, songs you upload, your playlists, direct links to audio files, and
radio stations. Control it from
the portal (**Community > Music**), with `/music`, or with the buttons on the
now-playing panel.

## Your library

Your library is the heart of Music: the audio files you already have (for
example MP3s you saved) uploaded once and played any time.

- **Upload.** In **Music > Library**, drag in as many files as you like (or
  click to choose). Each file gets its own progress bar; files that fail are
  listed with the reason. Formats: mp3, ogg, opus, m4a, aac, flac, wav. Each
  file can be up to 50 MB, and each server has 2 GB of space (the host can
  change this with `MUSIC_GUILD_QUOTA_MB`). The bar above the list shows how
  much is used.
- **Tags and covers.** Guildhall reads the title, artist, album, track number
  and length from the file's tags, and saves embedded cover art. When a file
  has no tags, the name is used: `Artist - Title.mp3` becomes artist "Artist"
  and title "Title". You can edit the title, artist and album afterwards.
- **No duplicates.** Uploading a file that is already in the library (the
  same file, even with another name) says "Already in your library" instead
  of storing a second copy.
- **Find songs.** Search by title, artist or album, sort by recently added,
  title or artist, and group by artist or album.
- **Pick several.** Tick songs to add them to the queue or a playlist, or to
  delete them, all at once.
- **Playlists.** In **Music > Playlists**, create a playlist, add songs from
  the library, put them in order, and remove them. Press **Play**, **Shuffle
  play** or **Add to queue**. A playlist's cover is its first song with cover
  art. In Discord, `/music playlist <name>` queues one.

Files are stored on the host under `MUSIC_STORAGE_DIR` (default
`~/qbox-music`), one folder per server. Deleting a song removes the file.

## What it plays, and what it does not

Music plays:

- **YouTube**, when the host has yt-dlp installed (see "YouTube" below). Type
  a song's name and the top YouTube result plays, or paste a link to a video.
- **Your library**: the files you uploaded, and playlists made from them.
- **Direct links** to audio files or streams: a link that ends in `.mp3`,
  `.ogg`, `.m4a`, `.flac`, `.wav`, `.opus`, an `.m3u` or `.pls` playlist, or
  any link the server says is audio.
- **Internet radio** from the free
  [Radio Browser](https://www.radio-browser.info) directory.
- **Jamendo** Creative Commons music, when the host sets it up.

Spotify and Apple Music do not allow bots to play their music, and Guildhall
does not work around that. Pasting one of their links explains this. For
Spotify, use Discord's own **Listen Along**; otherwise upload the file. Links
to other web pages are refused: only YouTube videos and direct audio links
work.

## YouTube

- **By name.** `/music play never gonna give you up` searches YouTube and
  plays the top result. It adds to the queue when something is playing.
  The portal's Player tab does the same when you type a name and press
  **Add**, and its **YouTube** box lists results (title, channel, length) with
  **Play now** and **Add** buttons.
- **By link.** Links from `youtube.com/watch`, `youtu.be`,
  `music.youtube.com`, `youtube.com/shorts` and `youtube.com/live` play that
  video. A link to a whole playlist is not supported yet; it says so.
- **Your own songs come first.** Suggestions while you type in Discord still
  come from your library, playlists and stations, and picking one plays it.
  Text that is exactly the name of a library song, a playlist or a saved
  station plays that. Anything else goes to YouTube.
- **Live videos** play like radio: no seeking, rewinding or skipping ahead.
- **It takes a few seconds.** Finding a song and its audio takes a few
  seconds before it starts.

What to know before relying on it:

- **It works through yt-dlp**, a separate program on the host that reads
  YouTube the way a browser does. Guildhall does not use a YouTube API key
  for this.
- **It is against YouTube's terms of service.** YouTube does not allow
  playing its videos this way. Turning it on is the choice of whoever runs
  the host. Without yt-dlp on the host, YouTube is simply off: the portal
  hides the YouTube box and Music works as before.
- **YouTube may block the host.** YouTube often refuses cloud server
  addresses (including Google Cloud's) and asks them to sign in. Playing then
  says "YouTube is asking this host to sign in". The fix is a cookies file
  (see Setup). It can also stop working for a while after YouTube changes
  something, until yt-dlp is updated; the host updates it every day.
- **Nothing is downloaded or kept.** The audio is streamed while it plays.
  The queue remembers the video, not the audio, so a song still plays after
  a bot restart.

## Setup (for whoever runs the host)

1. **Install ffmpeg** on the machine that runs Guildhall:
   `sudo apt-get install -y ffmpeg`. It turns every format into what Discord
   needs and reads tags and covers. Without it the portal shows a warning and
   playing says "Music needs ffmpeg on the host". If ffmpeg is not on `PATH`,
   set `FFMPEG_PATH` in `.env`.
2. **Turn Music on** in the portal (**Music**): pick a home voice channel and
   where now-playing messages go.
3. **Optional: a second bot for music.** So Guildhall itself never sits in a
   voice channel, create a second application in the
   [Discord developer portal](https://discord.com/developers/applications)
   (Bot > Reset Token), put its token in `.env` as `MUSIC_BOT_TOKEN`, restart,
   and invite it with the link the portal shows under Music settings. It only
   needs Connect, Speak and View Channel. Commands and buttons stay on the main
   bot; the second bot only plays.
4. **Optional: Jamendo.** Get a client ID at
   [developer.jamendo.com](https://developer.jamendo.com) and set
   `JAMENDO_CLIENT_ID`. Without it the portal hides Jamendo search.
5. **YouTube: yt-dlp.** The host scripts install it for you:
   `ops/oracle/setup.sh` puts the official yt-dlp program in
   `~/.local/bin/yt-dlp`, and `ops/oracle/update.sh` refreshes it once a day.
   On a server that is already running, it is installed by the next update
   check (within 5 minutes of this version arriving) and YouTube turns on by
   itself, without a restart. To install or refresh it by hand:
   `bash ~/qbox/ops/oracle/ytdlp.sh --force`. Guildhall looks for yt-dlp in
   `YTDLP_PATH` when that is set, else on `PATH`, else in `~/.local/bin`.
   yt-dlp needs a JavaScript program to read YouTube; Guildhall tells it to
   use the Node.js that already runs the bot, so nothing else is installed.
   To keep YouTube off, do not install yt-dlp (remove `~/.local/bin/yt-dlp`
   and the `ytdlp.sh` line in `update.sh`).
6. **YouTube: cookies, only if YouTube blocks the host.** When playing says
   "YouTube is asking this host to sign in":
   1. On your own computer, sign in to YouTube in a browser with an account
      you do not mind losing (YouTube can ban accounts used this way), and
      export its cookies as a `cookies.txt` file in Netscape format with a
      browser extension made for that.
   2. Copy the file to the server, for example to `~/youtube-cookies.txt`,
      and make it private: `chmod 600 ~/youtube-cookies.txt`. It must belong
      to the user that runs Guildhall, because yt-dlp also writes to it.
   3. Set `YOUTUBE_COOKIES_FILE=/home/<user>/youtube-cookies.txt` in `.env`
      and restart: `sudo systemctl restart qbox-api qbox-bot`.

   The file is a sign-in to that account. Never commit it or share it.
   Cookies expire, so this has to be repeated when the message comes back.

An upload has two minutes to finish (`API_REQUEST_TIMEOUT_MS`, default
120000). On a very slow connection, raise it or upload fewer files at once.

## Controls

| In Discord | What it does |
| --- | --- |
| `/music play <query>` | Type a song's name to play the top YouTube result, or paste a YouTube or direct audio link. Suggestions come from your library, playlists and stations; pick one to play it. Adds to the queue when something is playing. Without YouTube on the host, a name is looked up in the library, playlists and stations instead. |
| `/music playlist <name> [shuffle]` | Queues a playlist. |
| `/music radio <name>` | Plays a saved station, or the first Radio Browser match. |
| `/music pause`, `resume`, `skip`, `previous` | Previous restarts the song after 5 seconds of play, otherwise goes back one. |
| `/music stop` | Stops, clears the queue, and leaves (stays in 24/7 mode). |
| `/music seek <time>`, `rewind [seconds]`, `forward [seconds]` | Jump to `1:30`, or move 10 seconds (or the number you give). Not for live radio or live YouTube videos. |
| `/music volume <0-200>` | Sets the volume. |
| `/music loop <off\|track\|queue>`, `/music shuffle` | Repeat and shuffle. Shuffle keeps the current song. |
| `/music queue [page]`, `/music nowplaying` | Shows the queue or the current song. |
| `/music remove <position>`, `move <from> <to>`, `clear` | Edit the queue. Numbers are the ones in `/music queue`. |
| `/music join`, `/music leave` | Join your voice channel, or leave. |

The now-playing panel has buttons for previous, back 10 seconds, play/pause,
forward 10 seconds, next, stop, loop, shuffle, and volume down/up. The portal's
Player tab has the same controls, a progress bar you can click to seek, a
volume slider, a voice channel picker, the queue with move up/down, remove
and play-this buttons, and (with YouTube on) a YouTube search box. For a
YouTube song the now-playing panel shows the video's title, its channel as
the artist, and its thumbnail.

## Who can control it

| Permission | Allows |
| --- | --- |
| `music.manage` | Settings, uploads, playlists, stations, and every control |
| `music.dj` | Playback controls in Discord and the portal |

In Discord, DJ roles (Settings) can also control playback; with no DJ roles
set, everyone can. People who are not managers must be in the bot's voice
channel. Discord administrators can do everything.

## Settings

- **DJ roles**, **starting volume** (default 60%), **queue size** (default 100).
- **Now-playing messages** go to a chosen channel, or the channel of the last
  command. With **now-playing panel** on, one message with buttons is kept up
  to date (every 15 seconds while playing); off, each song gets its own post.
  The message can be redesigned in Look & Messages (`music.now-playing`).
- **Auto-leave** after N minutes alone or idle (default 5, 0 = never).
- **24/7 mode** keeps the bot in the home voice channel, rejoining after
  restarts and disconnects.
- **Idle radio**: a saved station that plays when the queue runs out. With
  24/7 on, this makes an always-on server radio.

Playback survives bot restarts and updates: the queue, position, loop,
shuffle and volume are saved, and a server that was playing picks up where it
left off within a few seconds of the bot starting.

## How it works

| Part | Location |
| --- | --- |
| Rules, player, sources, control protocol | `modules/music` (`@qbox/music`) |
| YouTube through yt-dlp | `modules/music/src/youtube.ts` |
| Database models | `MusicSettings`, `MusicTrack`, `MusicPlaylist`, `MusicPlaylistTrack`, `MusicStation`, `MusicSession` in `prisma/schema/music.prisma` |
| PostgreSQL repository | `packages/database/src/music/PrismaMusicRepository.ts` |
| Voice engine (@discordjs/voice + ffmpeg) | `packages/discord/src/music/DiscordVoiceEngine.ts` |
| `/music`, buttons, timer, control server | `packages/discord/src/commands/Music.command.ts`, `packages/discord/src/music/` |
| API | `apps/api/src/music/MusicRoutes.ts` |
| Portal | `apps/web/public/js/music.js`, `apps/web/public/js/musicYoutube.js` |
| Host scripts | `ops/oracle/setup.sh`, `ops/oracle/update.sh`, `ops/oracle/ytdlp.sh` |

Voice runs in the bot process. The portal talks to it through the API, which
calls a small control server inside the bot on `127.0.0.1:3102`
(`MUSIC_CONTROL_PORT`). Requests are signed with a key derived from the bot
token both processes already have, so nothing new needs configuring. If the
bot is offline, the portal says "The music player is not running (bot
offline)".

A YouTube song is saved in the queue by its video ID, never by its audio
address, because YouTube's audio addresses stop working after a few hours.
Just before a song plays (also after a seek, on a loop, and when a saved
queue is restored after a restart) the bot asks yt-dlp for the address and
remembers it in memory until 10 minutes before it expires. If a remembered
address fails at once, it is looked up one more time before the song counts
as failed. yt-dlp is started with a fixed list of arguments and never
through a shell; at most two run at once in the bot (one more in the API,
for portal searches), each for at most 12 seconds.

Host variables (all optional):

| Variable | What it does |
| --- | --- |
| `FFMPEG_PATH` | Where ffmpeg is, when it is not on `PATH`. |
| `MUSIC_STORAGE_DIR` | Where uploaded songs are stored (default `~/qbox-music`). |
| `MUSIC_GUILD_QUOTA_MB` | Library space per server (default 2048). |
| `MUSIC_CONTROL_PORT` | Port of the bot's local control server (default 3102). |
| `MUSIC_BOT_TOKEN` | Token of a second bot that joins voice. |
| `JAMENDO_CLIENT_ID` | Turns on Jamendo search. |
| `YTDLP_PATH` | Where yt-dlp is, when it is not on `PATH` or in `~/.local/bin`. |
| `YOUTUBE_COOKIES_FILE` | A `cookies.txt` yt-dlp uses when YouTube asks the host to sign in. |
