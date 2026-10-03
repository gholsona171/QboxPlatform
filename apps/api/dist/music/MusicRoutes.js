import { z } from "zod";
import { MAX_FILE_BYTES, MAX_PLAYLIST_TRACKS, MAX_QUEUE_LIMIT, MusicError, parseMusicCommand } from "@qbox/music";
import { AuthorizationDeniedApiError, ValidationApiError } from "../errors/ApiError.js";
import { errorOf, featureCall, parseInput as parse, routeParam, routeQuery, snowflakeSchema as snowflake } from "../features/routeHelpers.js";
const isMusicError = errorOf(MusicError);
const safe = (operation) => featureCall(operation, isMusicError);
/** Audio content types the upload route accepts. */
const AUDIO_CONTENT_TYPE = /^(?:audio\/[a-z0-9.+-]+|application\/ogg|application\/octet-stream)(?:\s*;.*)?$/i;
const UPLOAD_TIMEOUT_MS = 300_000;
/** Joining voice and checking a link can take a while. */
const COMMAND_TIMEOUT_MS = 30_000;
const uuid = z.string().uuid();
const settingsSchema = z.strictObject({
    enabled: z.boolean(),
    djRoleIds: z.array(snowflake).max(25),
    defaultVolume: z.number().int().min(0).max(200),
    maxQueue: z.number().int().min(1).max(MAX_QUEUE_LIMIT),
    announceChannelId: snowflake.optional(),
    nowPlayingPanel: z.boolean(),
    stayConnected247: z.boolean(),
    homeChannelId: snowflake.optional(),
    autoLeaveMinutes: z.number().int().min(0).max(1440),
    idleRadioStationId: uuid.optional(),
    expectedRevision: z.number().int().min(0),
});
const trackSchema = z.strictObject({ title: z.string().max(200), artist: z.string().max(200).optional(), album: z.string().max(200).optional() });
const playlistSchema = z.strictObject({ name: z.string().max(100), description: z.string().max(500).optional() });
const playlistTracksSchema = z.strictObject({ trackIds: z.array(uuid).max(MAX_PLAYLIST_TRACKS) });
const stationSchema = z.strictObject({ name: z.string().max(200), url: z.string().max(2000), faviconUrl: z.string().max(500).optional(), tags: z.array(z.string().max(40)).max(10).optional() });
/** Music as a pluggable API feature under `/api/v1/music`. Playback goes to the bot through `control`. */
export function musicApiFeature(music, control, host) {
    return { name: "music", register: (server, context) => registerMusicRoutes(server, context, music, control, host) };
}
function registerMusicRoutes(server, context, music, control, host) {
    const { guard } = context;
    const id = (request) => routeParam(request, "id");
    const player = (request, mutation) => guard(request, ["music.dj", "music.manage"], { mutation });
    const manage = (request, mutation) => guard(request, "music.manage", { mutation });
    /** The member and whether they manage music (music.manage) or only DJ (music.dj). */
    const actor = async (request, mutation) => {
        try {
            return { identity: await manage(request, mutation), manager: true };
        }
        catch (error) {
            if (!(error instanceof AuthorizationDeniedApiError))
                throw error;
            return { identity: await guard(request, "music.dj", { mutation }), manager: false };
        }
    };
    server.get("/api/v1/music/overview", async (request, reply) => {
        reply.header("cache-control", "no-store");
        const { manager } = await actor(request, false);
        const guildId = context.guildId;
        const [settings, usage, stations, inGuild] = await Promise.all([
            safe(() => music.settings(guildId)),
            safe(() => music.usage(guildId)),
            safe(() => music.stations(guildId)),
            host.secondBot ? host.secondBot.inGuild(guildId).catch(() => false) : Promise.resolve(false),
        ]);
        return {
            data: {
                settings,
                stations,
                canManage: manager,
                ffmpeg: host.ffmpeg,
                jamendo: music.jamendoAvailable,
                secondBot: host.secondBot !== undefined,
                secondBotInGuild: inGuild,
                secondBotInviteUrl: host.secondBot?.inviteUrl,
                library: { tracks: usage.tracks, bytes: usage.bytes, quotaBytes: music.quotaBytes, maxFileBytes: MAX_FILE_BYTES },
            },
        };
    });
    server.get("/api/v1/music/state", async (request, reply) => {
        reply.header("cache-control", "no-store");
        await player(request, false);
        return { data: await safe(() => control.state(context.guildId)) };
    });
    server.post("/api/v1/music/command", { handlerTimeout: COMMAND_TIMEOUT_MS }, async (request) => {
        const { identity, manager } = await actor(request, true);
        const command = await safe(async () => parseMusicCommand(request.body));
        return { data: await safe(() => control.command(context.guildId, command, { userId: identity.userId, manager, dj: true, roleIds: identity.roleIds })) };
    });
    server.put("/api/v1/music/settings", async (request) => {
        await manage(request, true);
        const body = parse(settingsSchema, request.body);
        return { data: await safe(() => music.saveSettings({ ...body, guildId: context.guildId })) };
    });
    /* ---------- Library ---------- */
    server.get("/api/v1/music/library", async (request, reply) => {
        reply.header("cache-control", "no-store");
        await player(request, false);
        const [tracks, playlists] = await Promise.all([safe(() => music.library(context.guildId)), safe(() => music.playlists(context.guildId))]);
        return { data: { tracks, playlists: playlists.map(({ tracks: _tracks, ...playlist }) => playlist) } };
    });
    void server.register(async (upload) => {
        upload.addContentTypeParser(AUDIO_CONTENT_TYPE, { parseAs: "buffer", bodyLimit: MAX_FILE_BYTES }, (_request, body, done) => done(null, body));
        upload.post("/api/v1/music/library", {
            bodyLimit: MAX_FILE_BYTES,
            handlerTimeout: UPLOAD_TIMEOUT_MS,
            config: { upload: { contentType: AUDIO_CONTENT_TYPE, bodyLimit: MAX_FILE_BYTES } },
        }, async (request, reply) => {
            const identity = await manage(request, true);
            const header = request.headers["x-file-name"];
            const rawName = Array.isArray(header) ? header[0] : header;
            if (!rawName)
                throw new ValidationApiError([{ path: "x-file-name", code: "REQUIRED", message: "The upload is missing its file name." }]);
            const fileName = safeDecode(rawName);
            const data = Buffer.isBuffer(request.body) ? request.body : Buffer.alloc(0);
            const result = await safe(() => music.upload({ guildId: context.guildId, fileName, contentType: request.headers["content-type"] ?? "", data, uploadedBy: identity.userId }));
            reply.code(result.duplicate ? 200 : 201);
            return { data: result };
        });
    });
    server.patch("/api/v1/music/library/:id", async (request) => {
        await manage(request, true);
        const body = parse(trackSchema, request.body);
        return { data: await safe(() => music.updateTrack(context.guildId, id(request), body)) };
    });
    server.delete("/api/v1/music/library/:id", async (request) => {
        await manage(request, true);
        await safe(() => music.deleteTrack(context.guildId, id(request)));
        return { data: { deleted: true } };
    });
    server.get("/api/v1/music/library/:id/cover", async (request, reply) => {
        await player(request, false);
        const cover = await safe(() => music.cover(context.guildId, id(request)));
        reply.header("cache-control", "private, max-age=3600");
        reply.type(cover.contentType);
        return reply.send(cover.data);
    });
    /* ---------- Playlists ---------- */
    server.get("/api/v1/music/playlists", async (request, reply) => {
        reply.header("cache-control", "no-store");
        await player(request, false);
        return { data: await safe(() => music.playlists(context.guildId)) };
    });
    server.post("/api/v1/music/playlists", async (request, reply) => {
        await manage(request, true);
        const body = parse(playlistSchema, request.body);
        reply.code(201);
        return { data: await safe(() => music.createPlaylist(context.guildId, body.name, body.description)) };
    });
    server.patch("/api/v1/music/playlists/:id", async (request) => {
        await manage(request, true);
        const body = parse(playlistSchema, request.body);
        return { data: await safe(() => music.updatePlaylist(context.guildId, id(request), body.name, body.description)) };
    });
    server.put("/api/v1/music/playlists/:id/tracks", async (request) => {
        await manage(request, true);
        const body = parse(playlistTracksSchema, request.body);
        return { data: await safe(() => music.setPlaylistTracks(context.guildId, id(request), body.trackIds)) };
    });
    server.post("/api/v1/music/playlists/:id/tracks", async (request) => {
        await manage(request, true);
        const body = parse(playlistTracksSchema, request.body);
        return { data: await safe(() => music.addToPlaylist(context.guildId, id(request), body.trackIds)) };
    });
    server.delete("/api/v1/music/playlists/:id", async (request) => {
        await manage(request, true);
        await safe(() => music.deletePlaylist(context.guildId, id(request)));
        return { data: { deleted: true } };
    });
    /* ---------- Stations and search ---------- */
    server.get("/api/v1/music/stations", async (request, reply) => {
        reply.header("cache-control", "no-store");
        await player(request, false);
        return { data: await safe(() => music.stations(context.guildId)) };
    });
    server.post("/api/v1/music/stations", async (request, reply) => {
        await manage(request, true);
        const body = parse(stationSchema, request.body);
        reply.code(201);
        return { data: await safe(() => music.saveStation(context.guildId, body)) };
    });
    server.delete("/api/v1/music/stations/:id", async (request) => {
        await manage(request, true);
        await safe(() => music.deleteStation(context.guildId, id(request)));
        return { data: { deleted: true } };
    });
    server.get("/api/v1/music/radio/search", async (request) => {
        await player(request, false);
        return { data: await safe(() => music.searchRadio(query(request))) };
    });
    server.get("/api/v1/music/jamendo/search", async (request) => {
        await player(request, false);
        return { data: await safe(() => music.searchJamendo(query(request))) };
    });
}
function query(request) {
    const value = routeQuery(request)["q"];
    return typeof value === "string" ? value.slice(0, 100) : "";
}
function safeDecode(value) {
    try {
        return decodeURIComponent(value);
    }
    catch {
        return value;
    }
}
//# sourceMappingURL=MusicRoutes.js.map