import { describe, expect, it } from "vitest";
import type { OutgoingMessage } from "@qbox/shared/messages";

import { InMemoryMessagesRepository, MessageTemplateService, type MessagesGateway, type MessagesRepository } from "../src/index.js";

const GUILD = "100000000000000001";
const CHANNEL = "500000000000000001";

class FakeGateway implements MessagesGateway {
  public readonly posted: { channelId: string; message: OutgoingMessage }[] = [];
  public async postMessage(channelId: string, message: OutgoingMessage) {
    this.posted.push({ channelId, message });
    return { messageId: "700000000000000001" };
  }
  public async guildName() {
    return "Nightfall";
  }
}

function setup() {
  let clock = new Date("2026-09-25T12:00:00.000Z");
  const repository = new InMemoryMessagesRepository(() => clock);
  const gateway = new FakeGateway();
  const service = new MessageTemplateService(repository, { gateway, now: () => clock });
  return { service, repository, gateway, advance: (ms: number) => { clock = new Date(clock.getTime() + ms); } };
}

const fallback: OutgoingMessage = { embeds: [{ title: "Default" }] };

describe("MessageTemplateService.apply", () => {
  it("returns the fallback until a template is saved, then the rendered template", async () => {
    const { service, advance } = setup();
    expect(await service.apply(GUILD, "tickets.opened", { user: "<@1>" }, fallback)).toBe(fallback);
    await service.save(GUILD, "tickets.opened", { content: "Welcome {user}", embeds: [{ title: "Ticket #{number}", color: "#FF0000" }] });
    const rendered = await service.apply(GUILD, "tickets.opened", { user: "<@1>", number: 7 }, fallback);
    expect(rendered).toEqual({ content: "Welcome <@1>", embeds: [{ title: "Ticket #7", color: 0xff0000 }] });
    await service.reset(GUILD, "tickets.opened");
    expect(await service.apply(GUILD, "tickets.opened", {}, fallback)).toBe(fallback);
    advance(61_000);
    expect(await service.apply(GUILD, "tickets.opened", {}, fallback)).toBe(fallback);
  });

  it("caches templates for a minute and honours disabled templates", async () => {
    const { service, repository, advance } = setup();
    await service.save(GUILD, "levels.level-up", { content: "GG {user}" });
    expect(await service.apply(GUILD, "levels.level-up", { user: "a" }, fallback)).toEqual({ content: "GG a", embeds: [] });
    await repository.saveTemplate({ guildId: GUILD, key: "levels.level-up", enabled: false, content: "Changed", embeds: [] });
    expect(await service.apply(GUILD, "levels.level-up", { user: "a" }, fallback)).toEqual({ content: "GG a", embeds: [] });
    advance(60_000);
    expect(await service.apply(GUILD, "levels.level-up", { user: "a" }, fallback)).toBe(fallback);
  });

  it("never throws, even when the repository fails", async () => {
    const broken: MessagesRepository = {
      getLook: async () => { throw new Error("db down"); },
      saveLook: async () => { throw new Error("db down"); },
      listTemplates: async () => { throw new Error("db down"); },
      getTemplate: async () => { throw new Error("db down"); },
      saveTemplate: async () => { throw new Error("db down"); },
      deleteTemplate: async () => { throw new Error("db down"); },
    };
    const service = new MessageTemplateService(broken);
    expect(await service.apply(GUILD, "tickets.opened", {}, fallback)).toBe(fallback);
    expect(await service.look(GUILD)).toBeUndefined();
  });
});

describe("MessageTemplateService catalog", () => {
  it("lists the catalog with overrides and samples", async () => {
    const { service } = setup();
    await service.save(GUILD, "community.welcome", { content: "Hi {user}, you are member {memberCount} of {server}" }, "300000000000000001");
    const list = await service.list(GUILD);
    expect(list.map((entry) => entry.key)).toEqual([...list.map((entry) => entry.key)].sort());
    const welcome = list.find((entry) => entry.key === "community.welcome");
    expect(welcome).toMatchObject({ customized: true, enabled: true, updatedBy: "300000000000000001", template: { content: "Hi {user}, you are member {memberCount} of {server}", embeds: [] } });
    expect(welcome?.samples).toEqual({ user: "<@123456789012345678>", username: "Alex", server: "Nightfall", memberCount: "1,024" });
    expect(list.find((entry) => entry.key === "tickets.opened")).toMatchObject({ customized: false, enabled: true });
    await expect(service.save(GUILD, "nope.nope", { content: "x" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(service.save(GUILD, "tickets.opened", { content: "" })).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });

  it("previews with sample values and the look applied", async () => {
    const { service } = setup();
    await service.saveLook({ guildId: GUILD, enabled: true, accentColor: "#00FF00", footerText: "{server}", showTimestamp: false, mode: "fill" });
    const preview = await service.preview(GUILD, "tickets.opened", { content: "{user} opened #{number}", embeds: [{ title: "{reason}", description: "{subject}" }] });
    expect(preview).toEqual({
      content: "<@123456789012345678> opened #12",
      embeds: [{ title: "General support", description: "I need help with my account", color: 0x00ff00, footer: { text: "Nightfall" } }],
    });
  });

  it("sends a test message to a channel", async () => {
    const { service, gateway } = setup();
    await expect(service.sendTest(GUILD, "tickets.opened", CHANNEL)).rejects.toMatchObject({ code: "INVALID_STATE" });
    await service.save(GUILD, "tickets.opened", { embeds: [{ title: "Ticket #{number} in {server}" }] });
    await service.sendTest(GUILD, "tickets.opened", CHANNEL);
    await service.sendTest(GUILD, "tickets.opened", CHANNEL, { content: "Draft for {username}" });
    expect(gateway.posted).toEqual([
      { channelId: CHANNEL, message: { embeds: [{ title: "Ticket #12 in Nightfall" }] } },
      { channelId: CHANNEL, message: { content: "Draft for Alex", embeds: [] } },
    ]);
  });

  it("keeps look revisions and clears the look cache on save", async () => {
    const { service } = setup();
    expect(await service.getLook(GUILD)).toMatchObject({ revision: 0, mode: "fill", enabled: true });
    expect(await service.look(GUILD)).toMatchObject({ revision: 0 });
    const saved = await service.saveLook({ guildId: GUILD, enabled: true, accentColor: "#123456", showTimestamp: true, mode: "override", expectedRevision: 0 });
    expect(saved).toMatchObject({ revision: 1, accentColor: "#123456", mode: "override" });
    expect(await service.look(GUILD)).toMatchObject({ revision: 1 });
    await expect(service.saveLook({ guildId: GUILD, enabled: true, showTimestamp: false, mode: "fill", expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
  });
});
