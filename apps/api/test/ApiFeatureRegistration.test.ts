import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import type { PrismaPermissionPersistenceClient } from "@qbox/database";

import { apiFeatures } from "../src/features.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";

/**
 * The current server is only known per request. A feature that reads
 * `context.guildId` while registering its routes crashes the API on start
 * whenever no default server is configured.
 */
describe("API feature registration", () => {
  it("registers every feature without reading the current server", async () => {
    const prisma = {} as PrismaPermissionPersistenceClient["prisma"];
    const persistence = {
      prisma,
      repositories: { tickets: {}, discordCommunity: {} },
    } as unknown as PrismaPermissionPersistenceClient;
    const reads: string[] = [];
    const context: ApiFeatureContext = {
      get guildId(): string {
        reads.push(new Error().stack ?? "");
        throw new Error("Pick a server before using this route.");
      },
      guard: async () => ({ userId: "1", displayName: "one", roleIds: [] }),
      member: async () => ({ userId: "1", displayName: "one", roleIds: [] }),
    };
    const server = Fastify();
    for (const feature of apiFeatures({ persistence, discordRest: undefined })) {
      expect(() => feature.register(server, context), feature.name).not.toThrow();
    }
    expect(reads).toEqual([]);
    await server.close();
  });
});
