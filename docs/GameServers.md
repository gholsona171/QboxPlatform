# Game Servers

Show your game servers' status in Discord and the portal (`/server`): live
player counts, an auto-updating status message per server, a channel renamed to
the player count, down and back-up alerts, and a player-count chart. It works
for Minecraft (Java and Bedrock) and for any game that answers Steam server
queries: Rust, ARK, Valheim, Palworld, Counter-Strike 2, Garry's Mod, 7 Days to
Die, Project Zomboid, DayZ, Squad, Satisfactory, and more.

FiveM has its own page (**FiveM Server**, `docs/FiveM.md`) because it also
handles restart warnings and the cfx.re connect link.

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, protocol clients, Discord REST adapter | `modules/game-servers` (`@qbox/game-servers`) |
| Database models | `GamesSettings`, `GamesServer`, `GamesStatusSnapshot` in `prisma/schema/games.prisma` |
| PostgreSQL repository | `packages/database/src/games/PrismaGamesRepository.ts` |
| `/server` command | `packages/discord/src/commands/Server.command.ts` |
| Status timer | `packages/discord/src/games/GamesFeature.ts` |
| API | `apps/api/src/games/GamesRoutes.ts` |
| Portal | `apps/web/public/js/games.js` (chart shared with FiveM in `playerChart.js`) |

## Permissions

| Permission | Allows |
| --- | --- |
| `games.manage` | Add, edit, and delete servers; change settings; test an address |

Any signed-in member can see the servers, live status, players, and chart in
the portal, and everyone can use `/server`. Discord administrators can do
everything.

## Discord commands

- `/server status [name]` — online or offline, players, map, version, latency, and a Connect button.
- `/server players [name]` — who is online (up to 20 names; some games do not share names).
- `/server list` — every server with its last known status.

`name` is optional: leave it out for the first server, or type the start of a
server's name.

## How the status is read

Guildhall queries each server directly, with a 5 second timeout, using the
protocol the server kind needs. Nothing has to be installed on the game server.

| Kind | Protocol | Address |
| --- | --- | --- |
| Minecraft (Java) | Server List Ping (TCP) | `host` or `host:port`, default `25565`. Without a port, the `_minecraft._tcp` SRV record is used when there is one. |
| Minecraft (Bedrock) | RakNet unconnected ping (UDP) | `host` or `host:port`, default `19132`. Bedrock does not share player names. |
| Steam game | A2S_INFO and A2S_PLAYER (UDP) | `host:port` where the port is the **query port**. |

Query ports for common games: Rust `28015` (same as the game port), Valheim
game port + 1 (`2457`), ARK `27015`, CS2 and Garry's Mod `27015`, Palworld
`27015`, 7 Days to Die game port + 1 (`26901`). The editor shows this table
under "Which port do I use?". Rust reports more than 255 players correctly.

## Features

- **Server cards:** the Servers tab shows every server with a live player count, latency, and a Connect link. **Details** opens the chart, the player list, uptime, and the peak.
- **Status message:** in the status channel, Guildhall posts one message per server and edits it at the update interval (60 to 600 seconds). It shows online or offline, players x/max, how long the server has been up, the player list (up to 20), map and version when the game reports them, latency, "Updated 2 minutes ago", and a Connect button for `https://` links (a `steam://connect/...` link is shown as text because Discord buttons cannot open it). If the message is deleted, a new one is posted.
- **Player-count channel:** pick a voice or text channel and Guildhall renames it to the player count, for example `🎮 45/200 online`, or `🔴 Offline` when the server is down. Discord allows two renames per ten minutes, so the name changes at most every 5 minutes.
- **Down and up alerts:** after 3 failed checks in a row the server counts as down, and Guildhall posts in the alert channel and pings the alert role. When it answers again, Guildhall posts that it is back and how long it was down. One slow answer does not trigger an alert.
- **Player chart:** every check is stored as a snapshot (online, players, max players, time). The portal shows the highest player count per 15 minutes for the last 24 hours, or per 2 hours for the last 7 days, with the peak and the uptime percentage. Snapshots older than 7 days are deleted every hour.
- **Test connection:** the editor checks an address before you save it and, when you add a server, the answer is shown right away ("Reached: Rusty Shores — 45/200").
- **Up to 10 servers** per Discord server. Turn one off with the "Check this server" box to keep it without polling it.

## Setup

1. In the portal, open **Game Servers** and press **Add a game server**.
2. Choose the kind, give the server a name, and enter the address. For Steam games, use the query port and add a game label (for example `Rust`) so messages say which game it is.
3. Press **Test connection**. Adjust the address or port until it says "Reached".
4. Optionally add a connect link, and pick a status channel, a player-count channel, an alert channel, and a role to ping.
5. Save. The bot starts checking within 30 seconds.
6. On the **Settings** tab, change the player-count channel wording if you like.
7. Grant `games.manage` to the staff who manage the servers.

The bot needs **Send Messages** and **Embed Links** in the status and alert
channels, and **Manage Channels** for the player-count channel. Make sure the
game server's query port is open in its firewall (UDP for Bedrock and Steam
games, TCP for Minecraft Java).

## Custom messages

The status message and both alerts go through the message templates
(`games.status`, `games.down`, `games.up`), so a server can replace their text
and embed. Placeholders:

| Placeholder | Meaning |
| --- | --- |
| `{name}` | Name the game server reports (falls back to `{server}`) |
| `{server}` | Name you gave the server in the portal |
| `{game}` | Game label: Minecraft, Minecraft Bedrock, or the Steam label |
| `{address}` | `host:port` |
| `{players}`, `{maxPlayers}` | Players online and slots |
| `{map}`, `{version}` | When the game reports them, otherwise empty |
| `{latency}` | Query time in milliseconds |
| `{playerList}` | Player names, one per line (up to 20) |
| `{connectUrl}` | Connect link, when set |
| `{downFor}` | How long the server was down (back-online message only) |

The player-count channel name uses `{online}`, `{max}`, `{name}`, and `{game}`.

## Known limitations

- Status messages, channel renames, and alerts only update while the bot is running; the portal's live status comes straight from the server.
- Staff with `games.manage` can test any address; the API sends the query from its own network.
- Compressed multi-packet Steam replies (rare, used by a few old GoldSrc servers) are not supported.
- Uptime is measured from when Guildhall first saw the server online, not from the server's real start time.
