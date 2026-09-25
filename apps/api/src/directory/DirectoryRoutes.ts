import type { FastifyInstance } from "fastify";
import { PERMISSIONS, type Permission } from "@qbox/permissions";
import type { REST } from "discord.js";

import { DependencyUnavailableApiError, ValidationApiError } from "../errors/ApiError.js";
import type { ApiFeature, ApiFeatureContext } from "../features/ApiFeature.js";

interface ApiChannel { readonly id: string; readonly name?: string; readonly type: number; readonly parent_id?: string | null; readonly position?: number }
interface ApiRole { readonly id: string; readonly name: string; readonly color: number; readonly position: number; readonly managed: boolean }
interface ApiMember {
  readonly nick?: string | null;
  readonly roles: readonly string[];
  readonly user: { readonly id: string; readonly username: string; readonly global_name?: string | null; readonly avatar?: string | null; readonly bot?: boolean };
}

const CHANNEL_TYPES: Readonly<Record<number, string>> = { 0: "TEXT", 2: "VOICE", 4: "CATEGORY", 5: "ANNOUNCEMENT", 13: "STAGE", 15: "FORUM" };

/** Anyone who can manage a feature can see the server's channels, roles, and members. */
export const DIRECTORY_PERMISSIONS: readonly Permission[] = PERMISSIONS.filter((permission) => permission.endsWith(".manage") || permission === "platform.admin");

/**
 * Discord server directory for portal pickers:
 * `GET /api/v1/directory` (channels, roles) and
 * `GET /api/v1/directory/members?query=` or `?ids=a,b`.
 */
export function directoryApiFeature(rest: REST | undefined): ApiFeature {
  return { name: "directory", register: (server, context) => registerDirectoryRoutes(server, context, rest) };
}

function registerDirectoryRoutes(server: FastifyInstance, context: ApiFeatureContext, rest: REST | undefined): void {
  const discord = () => {
    if (!rest) throw new DependencyUnavailableApiError();
    return rest;
  };

  server.get("/api/v1/directory", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await context.guard(request, DIRECTORY_PERMISSIONS, { mutation: false });
    const [channels, roles] = await Promise.all([
      discord().get(`/guilds/${context.guildId}/channels`) as Promise<ApiChannel[]>,
      discord().get(`/guilds/${context.guildId}/roles`) as Promise<ApiRole[]>,
    ]).catch(() => { throw new DependencyUnavailableApiError(); });
    return {
      data: {
        channels: channels
          .map((channel) => ({ id: channel.id, name: channel.name ?? channel.id, type: CHANNEL_TYPES[channel.type] ?? "OTHER", ...(channel.parent_id ? { parentId: channel.parent_id } : {}), position: channel.position ?? 0 }))
          .sort((left, right) => left.position - right.position),
        roles: roles
          .filter((role) => role.id !== context.guildId && !role.managed)
          .map((role) => ({ id: role.id, name: role.name, color: `#${role.color.toString(16).padStart(6, "0")}`, position: role.position }))
          .sort((left, right) => right.position - left.position),
      },
    };
  });

  server.get("/api/v1/directory/members", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await context.guard(request, DIRECTORY_PERMISSIONS, { mutation: false });
    const query = request.query && typeof request.query === "object" ? (request.query as Record<string, unknown>) : {};
    if (typeof query.ids === "string") {
      const ids = query.ids.split(",").filter((id) => /^\d{17,20}$/.test(id)).slice(0, 50);
      const members = await Promise.all(ids.map((id) => (discord().get(`/guilds/${context.guildId}/members/${id}`) as Promise<ApiMember>).catch(() => undefined)));
      return { data: members.flatMap((member) => (member ? [mapMember(member)] : [])) };
    }
    const search = typeof query.query === "string" ? query.query.trim() : "";
    if (search.length < 1 || search.length > 32) throw new ValidationApiError([{ path: "query", code: "invalid", message: "Search needs 1 to 32 characters." }]);
    const members = (await discord().get(`/guilds/${context.guildId}/members/search?query=${encodeURIComponent(search)}&limit=10`).catch(() => { throw new DependencyUnavailableApiError(); })) as ApiMember[];
    return { data: members.map(mapMember) };
  });
}

function mapMember(member: ApiMember) {
  const avatar = member.user.avatar;
  return {
    id: member.user.id,
    username: member.user.username,
    displayName: member.nick ?? member.user.global_name ?? member.user.username,
    roleIds: member.roles,
    bot: member.user.bot === true,
    ...(avatar ? { avatarUrl: `https://cdn.discordapp.com/avatars/${member.user.id}/${avatar}.png?size=64` } : {}),
  };
}
