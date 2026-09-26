import { describe, expect, it } from "vitest";

import {
  BUILDER_SECTIONS,
  EVERYONE,
  NO_DESIGN_ANSWER,
  OpenAiBlueprintDesigner,
  UNEXPECTED_DESIGN,
  answersFromDesign,
  applyDesign,
  designerSystemPrompt,
  designerUserPrompt,
  generateBlueprint,
  parseDesignedBlueprint,
  plainChannelName,
  templateFor,
  validateBlueprint,
  type BuilderBlueprint,
  type DesignedBlueprint,
} from "../src/index.js";

const minimal = { serverType: "COMMUNITY", summary: "A small community." };

const full: DesignedBlueprint = {
  serverType: "FIVEM_RP",
  serverName: "Los Santos Life",
  staffRanks: ["Owner", "Admin", "Mod"],
  departments: ["Police", "EMS"],
  include: { tickets: true, applications: true, ageRestricted: false },
  voiceLounges: 1,
  channelEmojis: "ALL",
  removeChannels: ["🎲┃off-topic", "memes", "Lounge 1"],
  extraRoles: [
    { name: "Head of Staff", color: "#123456", purpose: "staff" },
    { name: "Taxi", color: "#abcdef", purpose: "department" },
    { name: "Wipe Ping", color: "#00ff00", purpose: "ping" },
    { name: "Admin", color: "#000000" },
  ],
  extraCategories: [
    { name: "Racing", emoji: "🏁", access: "everyone", channels: [{ name: "Race Results", type: "TEXT", topic: "Winners.", readOnly: true }, { name: "Race Talk", type: "TEXT" }, { name: "Pit Lane", type: "VOICE" }] },
    { name: "Command", access: "staff", channels: [{ name: "command-chat", emoji: "🎖️", type: "TEXT" }] },
    { name: "Taxi Depot", access: "roles", roles: ["Taxi", "Head of Staff", "Nobody"], channels: [{ name: "dispatch", type: "TEXT" }, { name: "fares", type: "FORUM" }] },
  ],
  summary: "A FiveM city with racing and a taxi company.",
};

const channels = (blueprint: BuilderBlueprint) => blueprint.categories.flatMap((category) => category.channels);
const find = (blueprint: BuilderBlueprint, plain: string) => channels(blueprint).find((channel) => plainChannelName(channel.name) === plain);
const category = (blueprint: BuilderBlueprint, name: string) => blueprint.categories.find((item) => item.name.endsWith(name));

describe("parseDesignedBlueprint", () => {
  it("accepts a good design and fills nothing in", () => {
    expect(parseDesignedBlueprint(minimal)).toEqual(minimal);
    const parsed = parseDesignedBlueprint({ ...full, extraCategories: [{ ...full.extraCategories?.[0], emoji: "not-an-emoji" }] });
    expect(parsed.extraCategories?.[0]?.emoji).toBeUndefined();
    expect(parsed.extraRoles).toHaveLength(4);
  });

  it("rejects missing fields, unknown sections, too many categories, and oversize values", () => {
    const bad = (value: unknown) => expect(() => parseDesignedBlueprint(value)).toThrow(UNEXPECTED_DESIGN);
    bad(undefined);
    bad("[]");
    bad({ summary: "no type" });
    bad({ serverType: "MINECRAFT", summary: "x" });
    bad({ ...minimal, include: { tickets: true, spaceship: true } });
    bad({ ...minimal, include: { tickets: "yes" } });
    bad({ ...minimal, extraCategories: Array.from({ length: 11 }, (_, index) => ({ name: `C${index}`, access: "everyone", channels: [{ name: "a", type: "TEXT" }] })) });
    bad({ ...minimal, extraCategories: [{ name: "C", access: "everyone", channels: [] }] });
    bad({ ...minimal, extraCategories: [{ name: "C", access: "everyone", channels: Array.from({ length: 26 }, (_, index) => ({ name: `c${index}`, type: "TEXT" })) }] });
    bad({ ...minimal, extraCategories: [{ name: "C", access: "friends", channels: [{ name: "a", type: "TEXT" }] }] });
    bad({ ...minimal, extraCategories: [{ name: "C", access: "everyone", channels: [{ name: "a", type: "DM" }] }] });
    bad({ ...minimal, extraRoles: Array.from({ length: 16 }, (_, index) => ({ name: `R${index}`, color: "#000000" })) });
    bad({ ...minimal, extraRoles: [{ name: "R", color: "red" }] });
    bad({ ...minimal, staffRanks: [] });
    bad({ ...minimal, staffRanks: Array.from({ length: 9 }, (_, index) => `Rank ${index}`) });
    bad({ ...minimal, departments: Array.from({ length: 13 }, (_, index) => `Dept ${index}`) });
    bad({ ...minimal, voiceLounges: 11 });
    bad({ ...minimal, serverName: "x".repeat(101) });
    bad({ ...minimal, summary: "x".repeat(601) });
    bad({ ...minimal, channelEmojis: "SOME" });
  });
});

describe("answersFromDesign", () => {
  it("falls back to the template for the chosen type, field by field", () => {
    const answers = answersFromDesign(parseDesignedBlueprint(minimal), "A small community");
    const template = templateFor("COMMUNITY").answers;
    expect(answers).toEqual({ ...template, description: "A small community" });
    const business = answersFromDesign(parseDesignedBlueprint({ serverType: "BUSINESS", summary: "x", staffRanks: ["CEO", "ceo", "Lead"], include: { levels: true } }), "p");
    expect(business.staffRanks).toEqual(["CEO", "Lead"]);
    expect(business.include.levels).toBe(true);
    expect(business.include.verification).toBe(false);
    expect(business.channelEmojis).toBe("KEY");
    expect(business.emojiCategories).toBe(false);
    expect(business.departments).toEqual(templateFor("BUSINESS").answers.departments);
    expect(() => generateBlueprint(business)).not.toThrow();
  });
});

describe("applyDesign", () => {
  it("removes channels, adds roles, and adds categories with each kind of access", () => {
    const answers = answersFromDesign(full, "prompt");
    const generated = generateBlueprint(answers);
    const { blueprint, dropped } = applyDesign(generated, full, answers);
    expect(dropped).toEqual([]);
    expect(() => validateBlueprint(blueprint)).not.toThrow();
    expect(find(blueprint, "off-topic")).toBeUndefined();
    expect(find(blueprint, "memes")).toBeUndefined();
    expect(find(blueprint, "Lounge 1")).toBeUndefined();
    expect(find(blueprint, "general")).toBeDefined();

    const names = blueprint.roles.map((role) => role.name);
    expect(names.filter((name) => name === "Admin")).toHaveLength(1);
    expect(names.slice(0, 4)).toEqual(["Owner", "Admin", "Mod", "Head of Staff"]);
    expect(names.indexOf("Taxi")).toBe(names.indexOf("EMS") + 1);
    expect(blueprint.roles.find((role) => role.name === "Head of Staff")).toMatchObject({ key: "role-head-of-staff", purpose: "staff", hoist: true, permissions: [] });
    expect(blueprint.roles.find((role) => role.name === "Wipe Ping")).toMatchObject({ purpose: "ping", mentionable: true, hoist: false });
    /* A new staff role gets in wherever the lowest generated staff rank does. */
    const staff = category(blueprint, "STAFF");
    expect(staff?.overwrites.find((overwrite) => overwrite.target === "role-head-of-staff")?.allow).toContain("ViewChannel");
    expect(category(blueprint, "LOGS")?.overwrites.find((overwrite) => overwrite.target === "role-head-of-staff")?.deny).toContain("SendMessages");

    const racing = category(blueprint, "RACING");
    expect(racing?.name).toBe("🏁 RACING");
    expect(racing?.overwrites).toEqual([{ target: EVERYONE, allow: [], deny: ["ViewChannel"] }, { target: "verified", allow: ["ViewChannel"], deny: [] }]);
    expect(racing?.channels.map((channel) => channel.name)).toEqual(["🏁┃race-results", "🏁┃race-talk", "🔊┃Pit Lane"]);
    expect(racing?.channels[0]?.overwrites.find((overwrite) => overwrite.target === EVERYONE)?.deny).toContain("SendMessages");
    expect(racing?.channels[0]?.overwrites.find((overwrite) => overwrite.target === "staff-owner")?.allow).toContain("SendMessages");
    expect(racing?.channels[0]?.topic).toBe("Winners.");
    expect(racing?.channels[1]?.overwrites).toEqual([]);
    expect(racing?.channels.map((channel) => channel.key)).toEqual(["race-results", "race-talk", "pit-lane"]);

    const command = category(blueprint, "COMMAND");
    expect(command?.name).toBe("📁 COMMAND");
    expect(command?.overwrites[0]).toEqual({ target: EVERYONE, allow: [], deny: ["ViewChannel"] });
    expect(command?.overwrites.map((overwrite) => overwrite.target)).toEqual(expect.arrayContaining(["staff-owner", "staff-admin", "staff-mod"]));
    expect(command?.channels[0]?.name).toBe("🎖️┃command-chat");

    const taxi = category(blueprint, "TAXI DEPOT");
    expect(taxi?.overwrites.map((overwrite) => overwrite.target)).toEqual([EVERYONE, "role-taxi", "role-head-of-staff", "@bot"]);
    expect(taxi?.overwrites[1]?.allow).toEqual(expect.arrayContaining(["ViewChannel", "SendMessages"]));
    const fares = taxi?.channels.find((channel) => channel.key === "fares");
    expect(fares?.type).toBe("FORUM");
    expect(fares?.forum?.firstPost?.pin).toBe(true);
    expect(fares?.forum?.tags.length).toBeGreaterThan(0);

    /* Extras sit before the departments and staff. */
    const order = blueprint.categories.map((item) => item.key);
    expect(order.indexOf("cat-racing")).toBeLessThan(order.indexOf("cat-police"));
    expect(order.indexOf("cat-taxi-depot")).toBeLessThan(order.indexOf("cat-staff"));
  });

  it("follows the emoji answer for extra channels and hides categories without a verified role", () => {
    const design: DesignedBlueprint = { ...full, include: { verification: false }, channelEmojis: "KEY", extraCategories: [{ name: "Extra", access: "everyone", channels: [{ name: "plain", type: "TEXT" }, { name: "given", emoji: "🎯", type: "TEXT" }] }], removeChannels: [], extraRoles: [] };
    const answers = answersFromDesign(design, "p");
    const { blueprint } = applyDesign(generateBlueprint(answers), design, answers);
    const extra = category(blueprint, "EXTRA");
    expect(extra?.overwrites).toEqual([]);
    expect(extra?.channels.map((channel) => channel.name)).toEqual(["plain", "🎯┃given"]);
    const none: DesignedBlueprint = { ...design, channelEmojis: "NONE" };
    const plain = answersFromDesign(none, "p");
    expect(category(applyDesign(generateBlueprint(plain), none, plain).blueprint, "EXTRA")?.channels.map((channel) => channel.name)).toEqual(["plain", "given"]);
    const unknownRoles: DesignedBlueprint = { ...design, extraCategories: [{ name: "Secret", access: "roles", roles: ["Nobody"], channels: [{ name: "x", type: "TEXT" }] }] };
    const secret = category(applyDesign(generateBlueprint(plain), unknownRoles, plain).blueprint, "SECRET");
    expect(secret?.overwrites.map((overwrite) => overwrite.target)).toEqual(expect.arrayContaining([EVERYONE, "staff-owner"]));
  });

  it("drops an extra that would break the blueprint and keeps the rest", () => {
    const design: DesignedBlueprint = {
      ...minimal,
      serverType: "COMMUNITY",
      summary: "x",
      extraCategories: [
        { name: "Fine", access: "everyone", channels: [{ name: "ok", type: "TEXT" }] },
        { name: "@everyone", access: "everyone", channels: [{ name: "x".repeat(100), type: "TEXT" }] },
      ],
      extraRoles: [{ name: "@everyone", color: "#000000" }, { name: "Fine Role", color: "#000000" }],
    };
    const answers = answersFromDesign(design, "p");
    const { blueprint, dropped } = applyDesign(generateBlueprint(answers), design, answers);
    expect(dropped).toEqual([expect.stringContaining('Role "@everyone" was left out'), expect.stringContaining('Category "@everyone" was left out')]);
    expect(blueprint.roles.some((role) => role.name === "Fine Role")).toBe(true);
    expect(blueprint.roles.some((role) => role.name === "@everyone")).toBe(false);
    expect(category(blueprint, "FINE")).toBeDefined();
    expect(() => validateBlueprint(blueprint)).not.toThrow();
  });
});

describe("designer prompts", () => {
  it("lists every section with the channels it creates", () => {
    const system = designerSystemPrompt(templateFor("FIVEM_RP").answers);
    for (const section of BUILDER_SECTIONS) expect(system).toContain(`- ${section}:`);
    expect(system).toContain("- tickets: ");
    expect(system).toMatch(/- tickets:.*open-a-ticket.*ticket-transcripts/);
    expect(system).toMatch(/- fivemStatus:.*server-status.*server-alerts.*how-to-connect/);
    expect(system).toMatch(/every layout of this server type: city-rules, .*general, off-topic/);
    expect(system).not.toContain("┃");
    expect(system).toContain('"serverType"');
    const user = designerUserPrompt(`  ${"long ".repeat(500)}`, { ...templateFor("GAMING").answers, description: "old" });
    expect(user).toContain("Description of the server:");
    expect(user.length).toBeLessThan(2000 + 1500);
    expect(user).toContain('"serverType":"GAMING"');
    expect(user).not.toContain('"description"');
  });
});

describe("OpenAiBlueprintDesigner", () => {
  const base = templateFor("COMMUNITY").answers;

  it("asks the chat completions API for a JSON object and returns what it parses", async () => {
    const requests: { url: string; body: Record<string, unknown>; auth: string }[] = [];
    const fakeFetch = (async (url: string, init: RequestInit) => {
      requests.push({ url, body: JSON.parse(String(init.body)), auth: new Headers(init.headers).get("authorization") ?? "" });
      return new Response(JSON.stringify({ choices: [{ message: { content: `\`\`\`json\n${JSON.stringify(minimal)}\n\`\`\`` } }] }), { status: 200 });
    }) as typeof fetch;
    const designer = new OpenAiBlueprintDesigner("sk-test", "gpt-test", fakeFetch);
    expect(await designer.design("A small community", base)).toEqual(minimal);
    expect(requests[0]).toMatchObject({ url: "https://api.openai.com/v1/chat/completions", auth: "Bearer sk-test", body: { model: "gpt-test", temperature: 0.4, max_tokens: 2500, response_format: { type: "json_object" } } });
    const messages = requests[0]?.body.messages as { role: string; content: string }[];
    expect(messages.map((message) => message.role)).toEqual(["system", "user"]);
    expect(messages[0]?.content).toContain("JSON only");
    expect(messages[1]?.content).toContain("A small community");
    expect(messages[1]?.content).toContain('"serverType":"COMMUNITY"');
    expect((await new OpenAiBlueprintDesigner("sk-test", "", fakeFetch).design("x", base))).toEqual(minimal);
    expect(requests[1]?.body.model).toBe("gpt-4o-mini");
  });

  it("explains failures plainly", async () => {
    const status = new OpenAiBlueprintDesigner("sk", "m", (async () => new Response("{}", { status: 500 })) as typeof fetch);
    await expect(status.design("x", base)).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: NO_DESIGN_ANSWER });
    const empty = new OpenAiBlueprintDesigner("sk", "m", (async () => new Response(JSON.stringify({ choices: [{ message: { content: "" } }] }), { status: 200 })) as typeof fetch);
    await expect(empty.design("x", base)).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: NO_DESIGN_ANSWER });
    const network = new OpenAiBlueprintDesigner("sk", "m", (async () => { throw new Error("ECONNRESET"); }) as typeof fetch);
    await expect(network.design("x", base)).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: NO_DESIGN_ANSWER });
    const junk = new OpenAiBlueprintDesigner("sk", "m", (async () => new Response(JSON.stringify({ choices: [{ message: { content: "Sure! Here is a layout." } }] }), { status: 200 })) as typeof fetch);
    await expect(junk.design("x", base)).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: UNEXPECTED_DESIGN });
    const slow = new OpenAiBlueprintDesigner("sk", "m", ((_url: string, init: RequestInit) => new Promise((_resolve, reject) => init.signal?.addEventListener("abort", () => reject(new Error("aborted"))))) as typeof fetch, 5);
    await expect(slow.design("x", base)).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: NO_DESIGN_ANSWER });
  });
});
