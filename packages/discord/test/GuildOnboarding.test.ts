import { EventEmitter } from "node:events";
import { Events, type Client } from "discord.js";
import { describe, expect, it } from "vitest";

import { guildOnboardingFeature } from "../src/onboarding/GuildOnboardingFeature.js";

function fakeClient(guilds: readonly { id: string; ownerId: string; name: string }[]) {
  const emitter = new EventEmitter();
  const client = Object.assign(emitter, { guilds: { cache: new Map(guilds.map((guild) => [guild.id, guild])) } });
  return client as unknown as Client & EventEmitter;
}

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("guildOnboardingFeature", () => {
  it("makes every server owner the Qbox owner at startup and when the bot joins a server", async () => {
    const grants: string[] = [];
    const feature = guildOnboardingFeature({
      ensureOwner: async (guildId, ownerId) => {
        grants.push(`${guildId}:${ownerId}`);
        return { created: true };
      },
    })({ client: undefined as never, authorizer: undefined as never });
    const client = fakeClient([
      { id: "100000000000000001", ownerId: "200000000000000001", name: "One" },
      { id: "100000000000000002", ownerId: "200000000000000002", name: "Two" },
    ]);
    feature.attach?.(client);
    client.emit(Events.ClientReady, client);
    await flush();
    expect(grants).toEqual(["100000000000000001:200000000000000001", "100000000000000002:200000000000000002"]);

    client.emit(Events.GuildCreate, { id: "100000000000000003", ownerId: "200000000000000003", name: "Three" });
    await flush();
    expect(grants).toHaveLength(3);

    feature.detach?.();
    client.emit(Events.GuildCreate, { id: "100000000000000004", ownerId: "200000000000000004", name: "Four" });
    await flush();
    expect(grants).toHaveLength(3);
  });

  it("keeps going when one server's setup fails", async () => {
    const grants: string[] = [];
    const feature = guildOnboardingFeature({
      ensureOwner: async (guildId) => {
        if (guildId === "100000000000000001") throw new Error("database down");
        grants.push(guildId);
        return { created: false };
      },
    })({ client: undefined as never, authorizer: undefined as never });
    const client = fakeClient([
      { id: "100000000000000001", ownerId: "200000000000000001", name: "One" },
      { id: "100000000000000002", ownerId: "200000000000000002", name: "Two" },
    ]);
    feature.attach?.(client);
    client.emit(Events.ClientReady, client);
    await flush();
    expect(grants).toEqual(["100000000000000002"]);
  });
});
