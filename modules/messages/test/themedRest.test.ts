import { describe, expect, it } from "vitest";
import type { DiscordRestClient, DiscordRestRequest } from "@qbox/shared/discord-rest";

import { defaultLook, guildResolver, installThemedRequests, themedRest, type InteractionGuildSource, type LookProvider, type MessagesLook, type RequestingRest } from "../src/index.js";

const GUILD = "100000000000000001";
const CHANNEL = "500000000000000001";
const DM_CHANNEL = "500000000000000002";

class FakeRest implements DiscordRestClient {
  public readonly calls: { method: string; route: string; body: unknown }[] = [];
  public gets = 0;
  public failChannelLookup = false;
  public async get(route: `/${string}`) {
    this.gets += 1;
    if (this.failChannelLookup) throw new Error("boom");
    if (route === `/channels/${CHANNEL}`) return { id: CHANNEL, guild_id: GUILD };
    if (route === `/channels/${DM_CHANNEL}`) return { id: DM_CHANNEL };
    if (route === `/guilds/${GUILD}`) return { id: GUILD, name: "Nightfall" };
    throw new Error(`unexpected GET ${route}`);
  }
  public async post(route: `/${string}`, request?: DiscordRestRequest) { this.calls.push({ method: "POST", route, body: request?.body }); return { id: "1" }; }
  public async patch(route: `/${string}`, request?: DiscordRestRequest) { this.calls.push({ method: "PATCH", route, body: request?.body }); return { id: "1" }; }
  public async put(route: `/${string}`, request?: DiscordRestRequest) { this.calls.push({ method: "PUT", route, body: request?.body }); return {}; }
  public async delete(route: `/${string}`, request?: DiscordRestRequest) { this.calls.push({ method: "DELETE", route, body: request?.body }); return {}; }
}

class FakeLooks implements LookProvider {
  public value: MessagesLook | undefined = { ...defaultLook(GUILD), accentColor: "#FF0000", footerText: "{server} · {brand}" };
  public fail = false;
  public async look() {
    if (this.fail) throw new Error("looks down");
    return this.value;
  }
}

class FakeInteractions implements InteractionGuildSource {
  public readonly ids = new Map<string, string>();
  public readonly tokens = new Map<string, string>();
  public byId(id: string) { return this.ids.get(id); }
  public byToken(token: string) { return this.tokens.get(token); }
}

function setup() {
  const rest = new FakeRest();
  const looks = new FakeLooks();
  const interactions = new FakeInteractions();
  const themed = themedRest(rest, guildResolver(rest, interactions), looks, { now: () => Date.parse("2026-09-25T12:00:00.000Z") });
  return { rest, looks, interactions, themed };
}

describe("themedRest", () => {
  it("themes channel messages and caches the channel lookup", async () => {
    const { rest, themed } = setup();
    await themed.post(`/channels/${CHANNEL}/messages`, { body: { content: "hi", embeds: [{ title: "T" }] } });
    await themed.patch(`/channels/${CHANNEL}/messages/42`, { body: { embeds: [{ title: "Edited", color: 1 }] } });
    expect(rest.calls[0]?.body).toEqual({ content: "hi", embeds: [{ title: "T", color: 0xff0000, footer: { text: "Nightfall · Guildhall" } }] });
    expect(rest.calls[1]?.body).toEqual({ embeds: [{ title: "Edited", color: 1, footer: { text: "Nightfall · Guildhall" } }] });
    expect(rest.gets).toBe(2); // one channel lookup, one guild name
  });

  it("leaves direct messages, bodies without embeds, and other routes untouched", async () => {
    const { rest, themed } = setup();
    const dm = { embeds: [{ title: "Private" }] };
    await themed.post(`/channels/${DM_CHANNEL}/messages`, { body: dm });
    await themed.post(`/channels/${DM_CHANNEL}/messages`, { body: dm });
    await themed.post(`/channels/${CHANNEL}/messages`, { body: { content: "plain" } });
    await themed.post(`/channels/${CHANNEL}/messages`, { body: { embeds: [] } });
    await themed.put(`/guilds/${GUILD}/members/1/roles/2`, { body: { embeds: [{ title: "not a message" }] } });
    await themed.post(`/guilds/${GUILD}/channels`, { body: { embeds: [{ title: "x" }], name: "odd" } });
    expect(rest.calls.map((call) => call.body)).toEqual([dm, dm, { content: "plain" }, { embeds: [] }, { embeds: [{ title: "not a message" }] }, { embeds: [{ title: "x" }], name: "odd" }]);
    expect(rest.gets).toBe(1);
  });

  it("themes interaction callbacks and webhook follow-ups through the interaction map", async () => {
    const { rest, themed, interactions } = setup();
    interactions.ids.set("900000000000000001", GUILD);
    interactions.tokens.set("tok", GUILD);
    await themed.post("/interactions/900000000000000001/tok/callback", { body: { type: 4, data: { embeds: [{ title: "Reply" }], flags: 64 } } });
    await themed.patch("/webhooks/800000000000000001/tok/messages/@original", { body: { embeds: [{ title: "Edit" }] } });
    await themed.post("/webhooks/800000000000000001/other/messages/@original", { body: { embeds: [{ title: "Unknown token" }] } });
    expect(rest.calls[0]?.body).toEqual({ type: 4, data: { embeds: [{ title: "Reply", color: 0xff0000, footer: { text: "Nightfall · Guildhall" } }], flags: 64 } });
    expect(rest.calls[1]?.body).toEqual({ embeds: [{ title: "Edit", color: 0xff0000, footer: { text: "Nightfall · Guildhall" } }] });
    expect(rest.calls[2]?.body).toEqual({ embeds: [{ title: "Unknown token" }] });
  });

  it("falls back to the untouched body when anything fails or the look is empty", async () => {
    const { rest, themed, looks } = setup();
    const body = { embeds: [{ title: "T" }] };
    looks.fail = true;
    await themed.post(`/channels/${CHANNEL}/messages`, { body });
    looks.fail = false;
    looks.value = defaultLook(GUILD);
    await themed.post(`/channels/${CHANNEL}/messages`, { body });
    looks.value = { ...defaultLook(GUILD), enabled: false, accentColor: "#FF0000" };
    await themed.post(`/channels/${CHANNEL}/messages`, { body });
    looks.value = undefined;
    await themed.post(`/channels/${CHANNEL}/messages`, { body });
    rest.failChannelLookup = true;
    await themed.post(`/channels/${"500000000000000009"}/messages`, { body });
    expect(rest.calls).toHaveLength(5);
    for (const call of rest.calls) expect(call.body).toBe(body);
  });
});

describe("installThemedRequests", () => {
  it("wraps a REST instance's request method in place and can restore it", async () => {
    const requests: { fullRoute: string; method: string; body?: unknown }[] = [];
    const fake = new FakeRest();
    const rest: RequestingRest = {
      get: (route) => fake.get(route),
      request: async (options) => { requests.push(options); return {}; },
    };
    const original = rest.request;
    const restore = installThemedRequests(rest, guildResolver(rest), new FakeLooks());
    await rest.request({ fullRoute: `/channels/${CHANNEL}/messages`, method: "post", body: { embeds: [{ title: "T" }] } });
    await rest.request({ fullRoute: `/channels/${CHANNEL}/messages`, method: "get" });
    expect(requests[0]?.body).toEqual({ embeds: [{ title: "T", color: 0xff0000, footer: { text: "Nightfall · Guildhall" } }] });
    expect(requests[1]).toEqual({ fullRoute: `/channels/${CHANNEL}/messages`, method: "get" });
    restore();
    expect(rest.request).toBe(original);
  });
});
