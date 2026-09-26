import { describe, expect, it } from "vitest";

import {
  DiscordRestTicketGateway,
  InMemoryTicketRepository,
  TicketError,
  TicketService,
  defaultTicketSettings,
  panelButtonRows,
  validatePanelRows,
  type DiscordRestClient,
  type DiscordRestRequest,
  type TicketCategory,
  type TicketDiscordGateway,
  type TicketPanel,
  type TicketPanelPublishInput,
} from "../src/index.js";

const GUILD = "100000000000000001";
const PANEL_CHANNEL = "500000000000000005";
const OTHER_CHANNEL = "500000000000000006";
const MISSING_MESSAGE = "The panel's channel no longer exists. Pick a new channel for this panel and post it again.";

/** A Discord REST failure shaped like discord.js `DiscordAPIError`. */
function discordError(code: number, message: string): Error {
  return Object.assign(new Error(message), { code, status: code === 50001 ? 403 : 404 });
}

class ScriptedRest implements DiscordRestClient {
  public readonly calls: { method: string; route: string; options?: DiscordRestRequest | undefined }[] = [];
  public patchError: Error | undefined;
  public postError: Error | undefined;
  public get(route: `/${string}`) { this.calls.push({ method: "GET", route }); return Promise.resolve({}); }
  public post(route: `/${string}`, options?: DiscordRestRequest) {
    this.calls.push({ method: "POST", route, options });
    return this.postError ? Promise.reject(this.postError) : Promise.resolve({ id: "800000000000000009" });
  }
  public patch(route: `/${string}`, options?: DiscordRestRequest) {
    this.calls.push({ method: "PATCH", route, options });
    return this.patchError ? Promise.reject(this.patchError) : Promise.resolve({});
  }
  public put(route: `/${string}`) { this.calls.push({ method: "PUT", route }); return Promise.resolve({}); }
  public delete(route: `/${string}`) { this.calls.push({ method: "DELETE", route }); return Promise.resolve({}); }
}

function category(index: number, overrides: Partial<TicketCategory> = {}): TicketCategory {
  return {
    id: `cat-${index}`, guildId: GUILD, name: `Type ${index}`, buttonStyle: "PRIMARY", enabled: true, position: index,
    supportRoleIds: [], alertUserIds: [], defaultPriority: "NORMAL", questions: [], requiredRoleIds: [], ...overrides,
  };
}

function panel(overrides: Partial<TicketPanel> = {}): TicketPanel {
  return { id: "p", guildId: GUILD, name: "Main", channelId: PANEL_CHANNEL, title: "Support", description: "d", color: "#5865F2", style: "BUTTONS", placeholder: "Pick", categoryIds: [], ...overrides };
}

const componentRows = (call: { options?: DiscordRestRequest | undefined } | undefined) =>
  (call?.options?.body as { components: { components: { custom_id: string }[] }[] }).components.map((row) => row.components.map((item) => item.custom_id.replace("qbox:ticket:open:", "")));

describe("DiscordRestTicketGateway.publishPanel errors", () => {
  it.each([[10003, "Unknown Channel"], [50001, "Missing Access"]])("turns %i on the edit into a plain channel-missing error without posting", async (code, text) => {
    const rest = new ScriptedRest();
    rest.patchError = discordError(code, text);
    const error = await new DiscordRestTicketGateway(rest).publishPanel({ panel: panel({ messageId: "700000000000000001" }), categories: [category(0)] }).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(TicketError);
    expect(error).toMatchObject({ code: "INVALID_STATE", message: MISSING_MESSAGE });
    expect(rest.calls.map((call) => call.method)).toEqual(["PATCH"]);
  });

  it.each([[10003, "Unknown Channel"], [50001, "Missing Access"]])("turns %i on a first post into the same error", async (code, text) => {
    const rest = new ScriptedRest();
    rest.postError = discordError(code, text);
    await expect(new DiscordRestTicketGateway(rest).publishPanel({ panel: panel(), categories: [category(0)] })).rejects.toMatchObject({ code: "INVALID_STATE", message: MISSING_MESSAGE });
  });

  it("posts a new message when the old one is gone (10008)", async () => {
    const rest = new ScriptedRest();
    rest.patchError = discordError(10008, "Unknown Message");
    const result = await new DiscordRestTicketGateway(rest).publishPanel({ panel: panel({ messageId: "700000000000000001" }), categories: [category(0)] });
    expect(result).toEqual({ messageId: "800000000000000009" });
    expect(rest.calls.map((call) => `${call.method} ${call.route}`)).toEqual([
      `PATCH /channels/${PANEL_CHANNEL}/messages/700000000000000001`,
      `POST /channels/${PANEL_CHANNEL}/messages`,
    ]);
  });

  it("passes other post failures through unchanged", async () => {
    const rest = new ScriptedRest();
    rest.postError = discordError(50013, "Missing Permissions");
    await expect(new DiscordRestTicketGateway(rest).publishPanel({ panel: panel(), categories: [category(0)] })).rejects.toThrow("Missing Permissions");
  });
});

describe("panel button rows", () => {
  const categories = Array.from({ length: 7 }, (_, index) => category(index));

  it("lays out the owner's rows exactly, and five per row when none are set", async () => {
    const rest = new ScriptedRest();
    const gateway = new DiscordRestTicketGateway(rest);
    await gateway.publishPanel({ panel: panel({ rows: [["cat-2"], ["cat-0", "cat-1", "cat-3"], ["cat-6", "cat-5", "cat-4"]] }), categories });
    expect(componentRows(rest.calls[0])).toEqual([["cat-2"], ["cat-0", "cat-1", "cat-3"], ["cat-6", "cat-5", "cat-4"]]);
    await gateway.publishPanel({ panel: panel({ rows: null }), categories });
    expect(componentRows(rest.calls[1])).toEqual([["cat-0", "cat-1", "cat-2", "cat-3", "cat-4"], ["cat-5", "cat-6"]]);
  });

  it("ignores rows for the dropdown style", async () => {
    const rest = new ScriptedRest();
    await new DiscordRestTicketGateway(rest).publishPanel({ panel: panel({ style: "SELECT_MENU", rows: [["cat-1"], ["cat-0"]] }), categories: categories.slice(0, 2) });
    const components = (rest.calls[0]?.options?.body as { components: { components: { type: number; options: { value: string }[] }[] }[] }).components;
    expect(components).toHaveLength(1);
    expect(components[0]?.components[0]?.options.map((option) => option.value)).toEqual(["cat-0", "cat-1"]);
  });

  it("drops reasons that are off or deleted and places ones missing from the rows", () => {
    const shown = [category(0), category(1), category(3)];
    const rows = panelButtonRows({ rows: [["cat-2", "cat-1"], ["cat-9"], ["cat-0"]] }, shown);
    expect(rows.map((row) => row.map((item) => item.id))).toEqual([["cat-1", "cat-3"], ["cat-0"]]);
  });

  it("validates rows against the reasons the panel offers", () => {
    const ids = ["a", "b", "c"];
    expect(() => validatePanelRows([["a", "b"], ["c"]], ids)).not.toThrow();
    expect(() => validatePanelRows([], ids)).toThrow("between 1 and 5 rows");
    expect(() => validatePanelRows([["a"], ["b"], ["c"], [], [], []], ids)).toThrow("between 1 and 5 rows");
    expect(() => validatePanelRows([["a", "b", "c"], []], ids)).toThrow("between 1 and 5 buttons");
    expect(() => validatePanelRows([["a", "b", "c", "d", "e", "f"]], ["a", "b", "c", "d", "e", "f"])).toThrow("between 1 and 5 buttons");
    expect(() => validatePanelRows([["a", "b"], ["c", "x"]], ids)).toThrow("only contain reasons the panel offers");
    expect(() => validatePanelRows([["a", "b"], ["b", "c"]], ids)).toThrow("only one button row");
    expect(() => validatePanelRows([["a", "b"]], ids)).toThrow("Every reason");
    expect(() => validatePanelRows([["a"]], [])).toThrow("Choose which reasons");
  });
});

describe("TicketService panel rows and channel moves", () => {
  class Gateway implements Pick<TicketDiscordGateway, "publishPanel" | "deletePanelMessage"> {
    public readonly published: TicketPanelPublishInput[] = [];
    public readonly deleted: string[] = [];
    public async publishPanel(input: TicketPanelPublishInput) { this.published.push(input); return { messageId: "800000000000000001" }; }
    public async deletePanelMessage(channelId: string, messageId: string) { this.deleted.push(`${channelId}/${messageId}`); }
  }

  async function setup() {
    const gateway = new Gateway();
    const service = new TicketService(new InMemoryTicketRepository(), gateway as unknown as TicketDiscordGateway);
    const { nextNumber: _next, revision: _revision, ...defaults } = defaultTicketSettings(GUILD);
    await service.saveSettings({ ...defaults, enabled: true, expectedRevision: 0 });
    const reasons = [];
    for (const name of ["General", "Billing", "Reports"])
      reasons.push(await service.saveCategory({ guildId: GUILD, name, buttonStyle: "PRIMARY", enabled: true, supportRoleIds: [], alertUserIds: [], defaultPriority: "NORMAL", questions: [], requiredRoleIds: [] }));
    return { service, gateway, ids: reasons.map((reason) => reason.id) };
  }

  const base = { guildId: GUILD, name: "Main", channelId: PANEL_CHANNEL, title: "Support", description: "Open a ticket", color: "#5865F2", style: "BUTTONS" as const, placeholder: "Pick" };

  it("saves rows, rejects invalid ones, and sends them to the gateway", async () => {
    const { service, gateway, ids } = await setup();
    const [a, b, c] = ids as [string, string, string];
    await expect(service.savePanel({ ...base, categoryIds: ids, rows: [[a, b]] })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    const saved = await service.savePanel({ ...base, categoryIds: ids, rows: [[c], [a, b]] });
    expect(saved.rows).toEqual([[c], [a, b]]);
    await service.publishPanel(GUILD, saved.id);
    expect(gateway.published[0]?.panel.rows).toEqual([[c], [a, b]]);
    const automatic = await service.savePanel({ ...base, id: saved.id, categoryIds: ids, rows: [] });
    expect(automatic.rows).toBeNull();
  });

  it("forgets the posted message and removes the old one when a panel moves channel", async () => {
    const { service, gateway, ids } = await setup();
    const saved = await service.savePanel({ ...base, categoryIds: ids });
    const posted = await service.publishPanel(GUILD, saved.id);
    expect(posted.messageId).toBe("800000000000000001");
    const same = await service.savePanel({ ...base, id: saved.id, categoryIds: ids, title: "New title" });
    expect(same.messageId).toBe("800000000000000001");
    const moved = await service.savePanel({ ...base, id: saved.id, categoryIds: ids, channelId: OTHER_CHANNEL });
    expect(moved.messageId).toBeUndefined();
    expect(moved.channelId).toBe(OTHER_CHANNEL);
    expect(gateway.deleted).toEqual([`${PANEL_CHANNEL}/800000000000000001`]);
  });
});
