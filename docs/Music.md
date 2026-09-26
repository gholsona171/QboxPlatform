# Music

Play music and internet radio in your voice channels: songs you upload, your
playlists, direct links to audio files, and radio stations. Control it from
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

Music plays your library, direct links to audio files or streams (a link that
ends in `.mp3`, `.ogg`, `.m4a`, `.flac`, `.wav`, `.opus`, an `.m3u` or `.pls`
playlist, or any link the server says is audio), internet radio from the free
[Radio Browser](https://www.radio-browser.info) directory, and, when the host
sets it up, free Creative Commons music from Jamendo.

Spotify, Apple Music and YouTube do not allow bots to play their music, and
Guildhall does not work around that. Pasting one of their links explains this.
For Spotify, use Discord's own **Listen Along**; otherwise upload the file.
Links to web pages are refused: only direct audio links work.

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

An upload has two minutes to finish (`API_REQUEST_TIMEOUT_MS`, default
120000). On a very slow connection, raise it or upload fewer files at once.

## Controls

| In Discord | What it does |
| --- | --- |
| `/music play <query>` | Plays a song, playlist, saved station, or direct link. Suggestions come from your library, playlists and stations. Adds to the queue when something is playing. |
| `/music playlist <name> [shuffle]` | Queues a playlist. |
| `/music radio <name>` | Plays a saved station, or the first Radio Browser match. |
| `/music pause`, `resume`, `skip`, `previous` | Previous restarts the song after 5 seconds of play, otherwise goes back one. |
| `/music stop` | Stops, clears the queue, and leaves (stays in 24/7 mode). |
| `/music seek <time>`, `rewind [seconds]`, `forward [seconds]` | Jump to `1:30`, or move 10 seconds (or the number you give). Not for live radio. |
| `/music volume <0-200>` | Sets the volume. |
| `/music loop <off\|track\|queue>`, `/music shuffle` | Repeat and shuffle. Shuffle keeps the current song. |
| `/music queue [page]`, `/music nowplaying` | Shows the queue or the current song. |
| `/music remove <position>`, `move <from> <to>`, `clear` | Edit the queue. Numbers are the ones in `/music queue`. |
| `/music join`, `/music leave` | Join your voice channel, or leave. |

The now-playing panel has buttons for previous, back 10 seconds, play/pause,
forward 10 seconds, next, stop, loop, shuffle, and volume down/up. The portal's
Player tab has the same controls, a progress bar you can click to seek, a
volume slider, a voice channel picker, and the queue with move up/down,
remove and play-this buttons.

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
| Database models | `MusicSettings`, `MusicTrack`, `MusicPlaylist`, `MusicPlaylistTrack`, `MusicStation`, `MusicSession` in `prisma/schema/music.prisma` |
| PostgreSQL repository | `packages/database/src/music/PrismaMusicRepository.ts` |
| Voice engine (@discordjs/voice + ffmpeg) | `packages/discord/src/music/DiscordVoiceEngine.ts` |
| `/music`, buttons, timer, control server | `packages/discord/src/commands/Music.command.ts`, `packages/discord/src/music/` |
| API | `apps/api/src/music/MusicRoutes.ts` |
| Portal | `apps/web/public/js/music.js` |

Voice runs in the bot process. The portal talks to it through the API, which
calls a small control server inside the bot on `127.0.0.1:3102`
(`MUSIC_CONTROL_PORT`). Requests are signed with a key derived from the bot
token both processes already have, so nothing new needs configuring. If the
bot is offline, the portal says "The music player is not running (bot
offline)".

Host variables: `FFMPEG_PATH`, `MUSIC_STORAGE_DIR`, `MUSIC_GUILD_QUOTA_MB`,
`MUSIC_CONTROL_PORT`, `MUSIC_BOT_TOKEN`, `JAMENDO_CLIENT_ID` (all optional).
