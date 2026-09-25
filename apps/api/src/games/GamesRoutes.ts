import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { DEFAULT_PORTS, GAMES_SERVER_KINDS, GamesError, MAX_SERVERS, type GamesService } from "@qbox/game-servers";

import type { ApiFeature, ApiFeatureContext } from "../features/ApiFeature.js";
import { errorOf, featureCall, parseInput as parse, routeParam, snowflakeSchema as snowflake } from "../features/routeHelpers.js";

const isGamesError = errorOf(GamesError);
const safe = <T>(operation: () => Promise<T>) => featureCall(operation, isGamesError);

const kindSchema = z.enum(["minecraft-java", "minecraft-bedrock", "steam"]);
const serverSchema = z.strictObject({
  name: z.string().max(60),
  kind: kindSchema,
  address: z.string().max(260),
  game: z.string().max(60).optional(),
  connectUrl: z.string().max(200).optional(),
  statusChannelId: snowflake.optional(),
  updateIntervalSeconds: z.number().int(),
  playerCountChannelId: snowflake.optional(),
  alertChannelId: snowflake.optional(),
  alertRoleId: snowflake.optional(),
  enabled: z.boolean(),
});
const settingsSchema = z.strictObject({
  playerCountTemplate: z.string().max(100),
  playerCountOfflineTemplate: z.string().max(100),
  expectedRevision: z.number().int().min(0),
});

/** Game server status as a pluggable API feature under `/api/v1/games`. */
export function gamesApiFeature(games: GamesService): ApiFeature {
  return { name: "game-servers", register: (server, context) => registerGamesRoutes(server, context, games) };
}

function registerGamesRoutes(server: FastifyInstance, context: ApiFeatureContext, games: GamesService): void {
  const { guard, member } = context;
  const id = (request: Parameters<typeof routeParam>[0]) => routeParam(request, "serverId");

  server.get("/api/v1/games/overview", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await member(request, { mutation: false });
    const manage = await guard(request, "games.manage", { mutation: false }).then(() => true, () => false);
    const [servers, settings] = await Promise.all([games.servers(context.guildId), games.settings(context.guildId)]);
    return {
      data: {
        servers: servers.map(({ server: item, state }) => ({
          ...item,
          online: state.lastOnline,
          onlineSince: state.lastOnline ? state.onlineSince : undefined,
          lastPolledAt: state.lastPolledAt,
          lastError: state.lastError,
          players: state.lastPlayerCount,
          maxPlayers: state.lastMaxPlayers,
        })),
        kinds: GAMES_SERVER_KINDS,
        defaultPorts: DEFAULT_PORTS,
        maxServers: MAX_SERVERS,
        ...(manage ? { settings } : {}),
        can: { manage },
      },
    };
  });

  server.get("/api/v1/games/servers/:serverId/status", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await member(request, { mutation: false });
    return { data: await safe(() => games.status(context.guildId, id(request))) };
  });

  server.get("/api/v1/games/servers/:serverId/history", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await member(request, { mutation: false });
    const query = parse(z.object({ range: z.enum(["24h", "7d"]).optional() }), request.query ?? {});
    return { data: await safe(() => games.history(context.guildId, id(request), query.range ?? "24h")) };
  });

  server.post("/api/v1/games/servers", async (request) => {
    await guard(request, "games.manage", { mutation: true });
    const body = parse(serverSchema, request.body);
    return { data: await safe(() => games.createServer(context.guildId, body)) };
  });

  server.put("/api/v1/games/servers/:serverId", async (request) => {
    await guard(request, "games.manage", { mutation: true });
    const body = parse(serverSchema, request.body);
    return { data: await safe(() => games.updateServer(context.guildId, id(request), body)) };
  });

  server.delete("/api/v1/games/servers/:serverId", async (request) => {
    await guard(request, "games.manage", { mutation: true });
    await safe(() => games.deleteServer(context.guildId, id(request)));
    return { success: true };
  });

  server.put("/api/v1/games/settings", async (request) => {
    await guard(request, "games.manage", { mutation: true });
    const body = parse(settingsSchema, request.body);
    return { data: await safe(() => games.saveSettings({ ...body, guildId: context.guildId })) };
  });

  server.post("/api/v1/games/test", async (request) => {
    await guard(request, "games.manage", { mutation: true });
    const body = parse(z.strictObject({ kind: kindSchema, address: z.string().min(1).max(260) }), request.body);
    return { data: await safe(() => games.test(body.kind, body.address)) };
  });
}
