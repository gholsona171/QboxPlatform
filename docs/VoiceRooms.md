# Voice Rooms

Join-to-create voice channels. A member joins a hub channel, Qbox creates a
room for them and moves them into it, and the room is deleted once it is
empty. The owner controls the room with buttons in its chat or with `/voice`.
Hubs and settings are managed in the portal (`/voice`).

## Where the code lives

| Part | Location |
| --- | --- |
| Rules and Discord REST adapter | `modules/voice-rooms` (`@qbox/voice-rooms`) |
| Database models | `VoiceSettings`, `VoiceHub`, `VoiceRoom` in `prisma/schema/voice.prisma` |
| PostgreSQL repository | `packages/database/src/voiceRooms/PrismaVoiceRepository.ts` |
| `/voice` command | `packages/discord/src/commands/Voice.command.ts` |
| Room creation, deletion, startup cleanup | `packages/discord/src/voiceRooms/VoiceRoomsFeature.ts` |
| Control panel buttons and forms | `packages/discord/src/voiceRooms/DiscordVoiceInteractionHandler.ts` |
| API | `apps/api/src/voiceRooms/VoiceRoutes.ts` |
| Portal | `apps/web/public/js/voice.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `voice.manage` | Hubs, settings, the active rooms list, force-deleting rooms, and controlling any room in Discord |

Room owners need no permission to control their own room. Discord
administrators can do everything.

## Hubs

A server can have up to 20 hubs. Each hub has:

- **Join channel:** the voice channel members join to get a room.
- **Category:** where new rooms go (default: the join channel's category). Rooms copy the category's permissions.
- **Room name:** `{user}` (display name), `{count}` (rooms open from this hub, including the new one), and `{game}` (the game in the member's Discord status, or "Voice").
- **User limit** (0 = none), **bitrate** (8-384 kbps; if the server's boost level doesn't allow it, 64 kbps is used), and **delete delay** (seconds an empty room waits before it is deleted).
- **Private by default:** rooms start hidden and locked; only the owner and permitted members can see and join.
- **Allowed roles:** when set, members without one of these roles are disconnected from the join channel.

A member who already owns a room is moved back to it instead of getting a second one.

## Owner controls

The control panel (posted in the room's text chat) and `/voice` offer:

| Control | Effect |
| --- | --- |
| Rename | Changes the room name (Discord allows 2 renames per 10 minutes) |
| Limit | Sets the user limit (0-99) |
| Lock / Unlock | Stops or allows new people joining |
| Hide / Unhide | Hides or shows the room in the channel list |
| Permit | Lets a member see and join even when locked or hidden |
| Reject | Blocks a member and disconnects them if they are in the room |
| Kick | Disconnects a member (they can rejoin unless the room is locked or they are rejected) |
| Transfer | Makes another member in the room the owner |
| Claim | Takes over the room when the owner is no longer in it |

`/voice panel` posts the control panel again. `/voice` works on the room you
are currently in.

## Settings

- **Voice rooms are on:** turns room creation on or off for every hub.
- **Control panel:** post the panel in each new room.
- **Claim:** allow members to claim a room after the owner leaves (staff can always take over).

## Cleanup

Empty rooms are deleted after their hub's delay; if someone joins before
then, the room stays. When the bot starts, rooms whose channels are gone are
forgotten and empty rooms are deleted. Rooms deleted by hand in Discord are
removed from the list. Deleting a hub keeps its open rooms until they empty.

## Setup

1. Give the bot **Manage Channels**, **Manage Roles** (to set room permissions), **Move Members**, **View Channels**, and **Connect**.
2. Create a voice channel for members to join, for example "Join to create".
3. In the portal, open **Voice Rooms > Hubs** and add a hub for that channel.
4. Grant `voice.manage` to staff who should manage hubs and rooms.

## Known limitations

- `{game}` needs the Presence intent, which Qbox does not request, so it shows "Voice" unless the intent is added.
- Empty-room timers live in memory; a restart cleans up empty rooms on startup instead.
