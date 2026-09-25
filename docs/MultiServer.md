# Multi-server portal and API

The bot can be invited to any number of Discord servers. Every setting is
already stored per server ID; this document covers how the API knows which
server a browser is working in.

## Configuration

- `DISCORD_GUILD_ID` is optional. When set it is only the **default server**
  for a browser that has not picked one (this keeps a single-server deployment
  working during the transition). When unset, nothing assumes a server.
- OAuth scopes are `identify guilds guilds.members.read`. `guilds` lists the
  servers the member is in; `guilds.members.read` verifies membership and
  roles in the selected server.
- `DISCORD_TOKEN` lets the API list the servers the bot is in. Without it the
  server picker offers only the default server.

## Current server per browser

The API remembers the chosen server in the `qbox_guild` cookie: httpOnly,
`SameSite=Lax`, `Path=/`, `Secure` when the public URL is HTTPS, 30 days.

For every request the server is resolved in this order:

1. the `qbox_guild` cookie, when the signed-in member and the bot share that
   server (a cookie for a server they no longer share is ignored and cleared;
   if Discord cannot be reached, a stored `PRESENT` membership keeps it);
2. the configured default server (`DISCORD_GUILD_ID`);
3. none.

The resolution runs in a Fastify `preHandler` hook and is stored with
`AsyncLocalStorage` (`apps/api/src/auth/CurrentGuild.ts`), so
`ApiFeatureContext.guildId` reads the current request's server. Feature routes
read `context.guildId` inside their handlers, never at registration time.

A route that needs a server when none is resolved answers **409** with this
Problem Details document:

```json
{
  "type": "https://qbox.invalid/problems/guild-required",
  "title": "Server selection required",
  "status": 409,
  "detail": "Pick a server before using this route.",
  "code": "GUILD_REQUIRED",
  "requestId": "...",
  "correlationId": "..."
}
```

The portal shows the server picker when it sees `GUILD_REQUIRED`.

## Routes

`GET /api/v1/me` adds:

```json
{
  "guild": { "id": "…", "name": "…", "icon": null, "canManage": true },
  "guilds": [{ "id": "…", "name": "…", "icon": null, "owner": true, "canManage": true }],
  "inviteUrl": "https://discord.com/oauth2/authorize?client_id=<app id>&scope=bot%20applications.commands&permissions=8",
  "reauthRequired": false
}
```

- `guild` is the current server for this browser (cookie or default) or
  `null`. `membership.guildId` is `null` in that case too.
- `guilds` are the servers the member and the bot share. `canManage` is true
  for the Discord owner, Administrator or Manage Server members, and anyone
  holding any Qbox permission in that server.
- `reauthRequired` is true when the stored OAuth grant predates the `guilds`
  scope; `guilds` is then empty and the member must sign in again.
- `?refresh=1` re-verifies membership in the current server (only when the
  member is listed there, since an absent snapshot ends the member's sessions).

`GET /api/v1/guilds` returns `{ data: guilds, reauthRequired }`;
`?refresh=1` re-reads Discord instead of the 60 second cache.

`POST /api/v1/guilds/select` `{ "guildId": "…" }` (CSRF) verifies the member
is in that server through `guilds.members.read`, stores the membership snapshot
for that server, sets the cookie, and returns `{ data: guild }`. A server the
member and the bot do not share is refused with 403.

`POST /api/v1/guilds/clear` (CSRF) clears the cookie and returns
`{ "success": true }`.

## Sign-in

Login no longer requires membership in the default server. After the account
and grant are stored, the API records membership in the default server when
the member is in it, so a browser that has not picked a server can use it at
once. Members of other servers sign in and pick one.

## Server directory

`apps/api/src/auth/GuildDirectory.ts` intersects the member's server list
(read with their access token, refreshed through the stored refresh token) with
the bot's server list (`GET /users/@me/guilds` with the bot token, paged with
`after`, cached for a minute). The member's list is cached per identity for a
minute; login and `?refresh=1` bypass the cache.
