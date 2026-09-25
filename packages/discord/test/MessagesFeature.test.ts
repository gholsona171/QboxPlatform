import { describe, expect, it } from "vitest";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { defaultLook, type LookProvider } from "@qbox/messages";

import { InteractionGuildMap } from "../src/messages/InteractionGuildMap.js";
import { messagesFeature } from "../src/messages/MessagesFeature.js";
import { createTestAuthorizer } from "./CommandTestFactory.js";

const GUILD = "100000000000000001";
const CHANNEL = "500000000000000001";

describe("InteractionGuildMap", () => {
  it("remembers guilds by id and token until they expire", () => {
    let now = 1_000;
    const map = new InteractionGuildMap(() => now, 1_000);
    map.remember("1", "tok", GUILD);
    map.remember("2", "dm", null);
    expect(map.byId("1")).toBe(GUILD);
    expect(map.byToken("tok")).toBe(GUILD);
    expect(map.byId("2")).toBeUndefined();
    now += 1_000;
    expect(map.byId("1")).toBeUndefined();
    expect(map.byToken("tok")).toBeUndefined();
  });
});

describe("messagesFeature", () => {
  it("themes REST requests through the client and learns guilds from interactions", async () => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    const sent: { fullRoute: string; body?: unknown }[] = [];
    client.rest.request = async (options) => {
      if (options.method.toUpperCase() === "GET" && options.fullRoute === `/channels/${CHANNEL}`) return { id: CHANNEL, guild_id: GUILD };
      sent.push({ fullRoute: options.fullRoute, body: options.body });
      return {};
    };
    const looks: LookProvider = { look: async () => ({ ...defaultLook(GUILD), accentColor: "#00FF00" }) };
    const feature = messagesFeature(looks)({ client, authorizer: createTestAuthorizer() });
    feature.attach?.(client);

    client.emit(Events.InteractionCreate, { id: "900000000000000001", token: "tok", guildId: GUILD } as never);
    await client.rest.post(`/channels/${CHANNEL}/messages`, { body: { embeds: [{ title: "Hi" }] } });
    await client.rest.post("/interactions/900000000000000001/tok/callback", { body: { type: 4, data: { embeds: [{ title: "Reply" }] } } });
    await client.rest.post("/webhooks/1/tok", { body: { embeds: [{ title: "Follow-up" }] } });
    expect(sent.map((call) => call.body)).toEqual([
      { embeds: [{ title: "Hi", color: 0x00ff00 }] },
      { type: 4, data: { embeds: [{ title: "Reply", color: 0x00ff00 }] } },
      { embeds: [{ title: "Follow-up", color: 0x00ff00 }] },
    ]);

    feature.detach?.();
    await client.rest.post(`/channels/${CHANNEL}/messages`, { body: { embeds: [{ title: "Plain again" }] } });
    expect(sent.at(-1)?.body).toEqual({ embeds: [{ title: "Plain again" }] });
    client.destroy();
  });
});
