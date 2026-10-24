import { describe, expect, it } from "vitest";

import {
  BUILDER_LIMITS,
  BUILDER_SERVER_TYPES,
  BUILDER_TEMPLATES,
  STUDIO_PRODUCT_LINES,
  describeAccess,
  generateBlueprint,
  linkOptions,
  normalizeBlueprint,
  plainChannelName,
  summarize,
  templateFor,
  validateBlueprint,
  type BuilderAnswers,
  type BuilderBlueprint,
} from "../src/index.js";

const channels = (blueprint: BuilderBlueprint) => blueprint.categories.flatMap((category) => category.channels);
const names = (blueprint: BuilderBlueprint) => channels(blueprint).map((channel) => plainChannelName(channel.name));
const categoryNames = (blueprint: BuilderBlueprint) => blueprint.categories.map((category) => category.name);
const studio = templateFor("ASSET_STUDIO").answers;
const lines = (...departments: string[]): BuilderAnswers => ({ ...studio, departments });
const find = (blueprint: BuilderBlueprint, plain: string) => channels(blueprint).find((channel) => plainChannelName(channel.name) === plain);

function withinLimits(blueprint: BuilderBlueprint): void {
  expect(() => validateBlueprint(blueprint)).not.toThrow();
  const summary = summarize(blueprint);
  expect(summary.totalChannels).toBeLessThanOrEqual(BUILDER_LIMITS.channels);
  expect(summary.roles).toBeLessThanOrEqual(BUILDER_LIMITS.roles);
  for (const category of blueprint.categories) expect(category.channels.length).toBeLessThanOrEqual(BUILDER_LIMITS.channelsPerCategory);
  for (const channel of channels(blueprint)) expect(channel.forum?.tags.length ?? 0).toBeLessThanOrEqual(BUILDER_LIMITS.forumTags);
  expect(blueprint.tickets?.types.length ?? 0).toBeLessThanOrEqual(BUILDER_LIMITS.ticketTypes);
  expect(summary.warnings.join(" ")).not.toContain("More than one category");
}

describe("FiveM asset studio starting point", () => {
  it("is offered with every product line on and builds a valid layout", () => {
    expect(BUILDER_SERVER_TYPES).toContain("ASSET_STUDIO");
    expect(BUILDER_TEMPLATES.map((template) => template.type)).toContain("ASSET_STUDIO");
    expect(studio.departments).toEqual(STUDIO_PRODUCT_LINES);
    expect(STUDIO_PRODUCT_LINES).toEqual(["Scripts", "MLOs", "Vehicles", "Clothing & EUP", "Props"]);
    const blueprint = generateBlueprint(studio);
    withinLimits(blueprint);
    expect(linkOptions(blueprint).filter((option) => !option.available).map((option) => option.link)).toEqual(["birthdays", "fivem"]);
  });

  it("has studio ranks, product teams, buyers, and community roles", () => {
    const roles = generateBlueprint(studio).roles;
    expect(roles.filter((role) => role.purpose === "staff").map((role) => role.name)).toEqual(["Owner", "Studio Manager", "Lead Developer", "Developer", "Moderator", "Support"]);
    expect(roles.filter((role) => role.purpose === "department").map((role) => role.name)).toEqual(["Script Developer", "MLO Builder", "Vehicle Artist", "Clothing Artist", "Prop Artist"]);
    const plain = roles.map((role) => role.name);
    for (const name of ["Partner", "Content Creator", "Customer", "Scripts Buyer", "MLOs Buyer", "Vehicles Buyer", "Clothing & EUP Buyer", "Props Buyer", "Server Owner", "Beta Tester", "Release Ping", "Member", "Unverified"])
      expect(plain).toContain(name);
    expect(roles.find((role) => role.purpose === "verified")?.name).toBe("Member");
    expect(new Set(roles.map((role) => role.key)).size).toBe(roles.length);
  });

  it("has a team-only showcase everyone can read, and a community showcase members post in", () => {
    const blueprint = generateBlueprint(studio);
    const access = describeAccess(blueprint);
    const showcase = find(blueprint, "showcase");
    const community = find(blueprint, "community-showcase");
    expect(access[showcase?.key ?? ""]).toEqual({ see: "Member", post: "staff, Script Developer, MLO Builder, Vehicle Artist, Clothing Artist, Prop Artist" });
    expect(access[community?.key ?? ""]).toEqual({ see: "Member", post: "Member" });
    const media = generateBlueprint({ ...studio, useMediaChannels: true });
    expect(find(media, "showcase")?.type).toBe("MEDIA");
    expect(find(media, "showcase")?.forum?.firstPost).toBeUndefined();
    expect(find(media, "showcase")?.forum?.tags.map((tag) => tag.name)).toEqual(["Script", "MLO", "Vehicle", "Clothing", "Prop", "Teaser", "Release"]);
    withinLimits(media);
    expect(names(generateBlueprint({ ...studio, include: { ...studio.include, media: false } }))).not.toContain("showcase");
  });

  it("lets only staff and the teams post releases and changelogs", () => {
    const blueprint = generateBlueprint(studio);
    const access = describeAccess(blueprint);
    for (const plain of ["announcements", "releases", "changelogs", "free-releases", "store", "pricing", "bundles"]) {
      const channel = find(blueprint, plain);
      expect(channel, plain).toBeDefined();
      expect(access[channel?.key ?? ""]?.see).toBe("Member");
      expect(access[channel?.key ?? ""]?.post).not.toContain("Member");
    }
    expect(access[find(blueprint, "vouches")?.key ?? ""]?.post).toContain("Customer");
  });

  it("hides buyer areas behind the buyer roles", () => {
    const blueprint = generateBlueprint(studio);
    const access = describeAccess(blueprint);
    expect(access[find(blueprint, "scripts-downloads")?.key ?? ""]).toEqual({ see: "staff, Scripts Buyer, Script Developer", post: "staff, Script Developer" });
    expect(access[find(blueprint, "scripts-support")?.key ?? ""]).toEqual({ see: "staff, Scripts Buyer, Script Developer", post: "staff, Scripts Buyer, Script Developer" });
    expect(access[find(blueprint, "customer-chat")?.key ?? ""]?.see).toContain("Customer");
    expect(access[find(blueprint, "customer-chat")?.key ?? ""]?.see).not.toContain("Member");
    expect(access[find(blueprint, "customer-announcements")?.key ?? ""]?.post).not.toContain("Customer");
    expect(access[find(blueprint, "beta-testing")?.key ?? ""]?.see).toBe("staff, Beta Tester, Script Developer, MLO Builder, Vehicle Artist, Clothing Artist, Prop Artist");
    expect(access[find(blueprint, "scripts-dev")?.key ?? ""]).toEqual({ see: "staff, Script Developer", post: "staff, Script Developer" });
    expect(access[find(blueprint, "qa-testing")?.key ?? ""]?.see).not.toContain("Member");
  });

  it("has commissions, feedback forums, and team planning channels", () => {
    const blueprint = generateBlueprint(studio);
    expect(names(blueprint)).toEqual(expect.arrayContaining(["commission-info", "commission-requests", "bug-reports", "feature-requests", "feedback", "planning", "roadmap", "qa-testing", "commission-board", "team-chat", "Team Voice", "Community Lounge 1", "store-log"]));
    expect(find(blueprint, "commission-requests")?.type).toBe("FORUM");
    expect(find(blueprint, "bug-reports")?.forum?.tags.map((tag) => tag.name)).toEqual(["Script", "MLO", "Vehicle", "Clothing", "Prop", "Open", "Fixed", "Cannot reproduce"]);
    const noForums = generateBlueprint({ ...studio, include: { ...studio.include, forums: false } });
    expect(find(noForums, "commission-requests")?.type).toBe("TEXT");
    expect(find(noForums, "scripts-help")?.type).toBe("TEXT");
    withinLimits(noForums);
  });

  describe("product line toggles", () => {
    const perLine: Record<string, { category: string; team: string; buyer: string; support: string; channel: string }> = {
      Scripts: { category: "💻 SCRIPTS", team: "Script Developer", buyer: "Scripts Buyer", support: "Script Support", channel: "scripts-downloads" },
      MLOs: { category: "🏗️ MLOS", team: "MLO Builder", buyer: "MLOs Buyer", support: "MLO Support", channel: "mlos-downloads" },
      Vehicles: { category: "🚗 VEHICLES", team: "Vehicle Artist", buyer: "Vehicles Buyer", support: "Vehicle Support", channel: "vehicles-downloads" },
      "Clothing & EUP": { category: "👕 CLOTHING & EUP", team: "Clothing Artist", buyer: "Clothing & EUP Buyer", support: "Clothing & EUP Support", channel: "clothing-eup-downloads" },
      Props: { category: "📦 PROPS", team: "Prop Artist", buyer: "Props Buyer", support: "Prop Support", channel: "props-downloads" },
    };

    it.each(STUDIO_PRODUCT_LINES)("%s is on by default and goes away when switched off", (line) => {
      const expected = perLine[line];
      if (!expected) throw new Error(`no expectations for ${line}`);
      const on = generateBlueprint(studio);
      const off = generateBlueprint(lines(...STUDIO_PRODUCT_LINES.filter((item) => item !== line)));
      withinLimits(off);
      expect(categoryNames(on)).toEqual(expect.arrayContaining([expected.category, `${expected.category} TEAM`]));
      expect(categoryNames(off)).not.toContain(expected.category);
      expect(categoryNames(off)).not.toContain(`${expected.category} TEAM`);
      for (const role of [expected.team, expected.buyer]) {
        expect(on.roles.map((item) => item.name)).toContain(role);
        expect(off.roles.map((item) => item.name)).not.toContain(role);
      }
      expect(names(on)).toContain(expected.channel);
      expect(names(off)).not.toContain(expected.channel);
      expect(on.tickets?.types.map((type) => type.name)).toContain(expected.support);
      expect(off.tickets?.types.map((type) => type.name)).not.toContain(expected.support);
    });

    it("keeps everything else when only scripts and MLOs stay on", () => {
      const blueprint = generateBlueprint(lines("Scripts", "MLOs"));
      withinLimits(blueprint);
      expect(blueprint.roles.filter((role) => role.purpose === "department").map((role) => role.name)).toEqual(["Script Developer", "MLO Builder"]);
      expect(names(blueprint)).toEqual(expect.arrayContaining(["releases", "showcase", "community-showcase", "store", "customer-chat", "commission-requests", "open-a-ticket", "scripts-support", "mlos-support"]));
      expect(blueprint.tickets?.types.map((type) => type.name)).toEqual(["Purchase / Store Question", "Script Support", "MLO Support", "Custom Commission", "Bug Report", "Partnership / Content Creator", "Refund / Licence Transfer"]);
      expect(find(blueprint, "bug-reports")?.forum?.tags.map((tag) => tag.name)).toEqual(["Script", "MLO", "Open", "Fixed", "Cannot reproduce"]);
    });

    it("works with every product line off, and with a custom one", () => {
      const none = generateBlueprint(lines());
      withinLimits(none);
      expect(none.roles.some((role) => role.purpose === "department")).toBe(false);
      expect(names(none)).toEqual(expect.arrayContaining(["releases", "showcase", "store", "customer-chat"]));
      const custom = generateBlueprint(lines("Scripts", "Weapons"));
      withinLimits(custom);
      expect(custom.roles.map((role) => role.name)).toEqual(expect.arrayContaining(["Weapons Team", "Weapons Buyer"]));
      expect(custom.tickets?.types.map((type) => type.name)).toContain("Weapons Support");
      expect(names(custom)).toEqual(expect.arrayContaining(["weapons-chat", "weapons-downloads", "weapons-support", "weapons-dev"]));
    });

    it("stays within Discord's limits with the most product lines and staff ranks", () => {
      const many = Array.from({ length: BUILDER_LIMITS.departments }, (_, index) => `Line ${index + 1}`);
      const ranks = Array.from({ length: BUILDER_LIMITS.staffRanks }, (_, index) => `Rank ${index + 1}`);
      const blueprint = generateBlueprint({ ...studio, departments: many, staffRanks: ranks, voiceLounges: BUILDER_LIMITS.voiceLounges, useMediaChannels: true, include: { ...studio.include, ageRestricted: true, birthdays: true, fivemStatus: true } });
      withinLimits(blueprint);
      expect(blueprint.tickets?.types).toHaveLength(BUILDER_LIMITS.ticketTypes);
      expect(blueprint.tickets?.panel.style).toBe("SELECT_MENU");
    });
  });
});

describe("ready-made ticket setups", () => {
  const STATUS: Record<string, readonly [string, string, string]> = {
    FIVEM_RP: ["📥 NEW TICKETS", "⏳ TICKETS IN PROGRESS", "📁 CLOSED TICKETS"],
    GAMING: ["📥 OPEN TICKETS", "⏳ BEING HANDLED", "📁 CLOSED TICKETS"],
    COMMUNITY: ["📥 OPEN TICKETS", "⏳ IN PROGRESS", "📁 CLOSED TICKETS"],
    BUSINESS: ["NEW REQUESTS", "IN PROGRESS", "RESOLVED"],
    ASSET_STUDIO: ["📥 NEW INQUIRIES", "⏳ IN PROGRESS", "📁 FINISHED"],
  };

  it.each(BUILDER_SERVER_TYPES)("%s has a panel, its ticket types, and three status categories", (type) => {
    const blueprint = generateBlueprint(templateFor(type).answers);
    withinLimits(blueprint);
    const tickets = blueprint.tickets;
    expect(tickets?.panel).toMatchObject({ name: "Support", title: expect.any(String), description: expect.any(String) });
    expect(tickets?.types.length).toBeGreaterThanOrEqual(4);
    for (const ticketType of tickets?.types ?? []) {
      expect(ticketType.questions.length).toBeGreaterThan(0);
      expect(ticketType.questions.length).toBeLessThanOrEqual(5);
      for (const question of ticketType.questions) expect(question.label.length).toBeLessThanOrEqual(45);
      expect(ticketType.description?.length ?? 0).toBeLessThanOrEqual(100);
    }
    const byPurpose = (purpose: string) => blueprint.categories.find((category) => category.purpose === purpose);
    expect([byPurpose("tickets")?.name, byPurpose("tickets-progress")?.name, byPurpose("tickets-closed")?.name]).toEqual(STATUS[type]);
    for (const purpose of ["tickets", "tickets-progress", "tickets-closed"]) {
      const category = byPurpose(purpose);
      expect(category?.channels).toEqual([]);
      expect(category?.overwrites.find((overwrite) => overwrite.target === "@everyone")?.deny).toContain("ViewChannel");
    }
    /* Normalizing (saving a draft) keeps the setup. */
    expect(normalizeBlueprint(blueprint).tickets?.types.map((item) => item.name)).toEqual(tickets?.types.map((item) => item.name));
  });

  it("names the types each kind of server needs", () => {
    const typesOf = (answers: BuilderAnswers) => generateBlueprint(answers).tickets?.types.map((type) => type.name);
    expect(typesOf(templateFor("FIVEM_RP").answers)).toEqual(["General Support", "Player Report", "Ban Appeal", "Staff Application", "Donation / Store", "Bug Report", "Police Department", "EMS Department", "Fire Department", "Mechanics Department", "Real Estate Department", "Gangs Department"]);
    expect(typesOf(templateFor("ASSET_STUDIO").answers)).toEqual(["Purchase / Store Question", "Script Support", "MLO Support", "Vehicle Support", "Clothing & EUP Support", "Prop Support", "Custom Commission", "Bug Report", "Partnership / Content Creator", "Refund / Licence Transfer"]);
    expect(typesOf(templateFor("GAMING").answers)).toEqual(["General Help", "Report a Player", "Ban Appeal", "Bug Report", "Claim a Prize", "Staff Application"]);
    expect(typesOf(templateFor("COMMUNITY").answers)).toEqual(["General Support", "Report a Member", "Appeal a Punishment", "Partnership Request", "Something Else"]);
    expect(typesOf(templateFor("BUSINESS").answers)).toEqual(["General Question", "Technical Support", "Billing & Invoices", "Feature Request", "Sales", "Customer Success", "Development"]);
    const police = generateBlueprint(templateFor("FIVEM_RP").answers).tickets?.types.find((type) => type.name === "Police Department");
    expect(police?.supportRoles).toEqual(["dept-police"]);
  });

  it("makes no ticket setup or status categories when tickets are off", () => {
    for (const template of BUILDER_TEMPLATES) {
      const blueprint = generateBlueprint({ ...template.answers, include: { ...template.answers.include, tickets: false } });
      expect(blueprint.tickets).toBeUndefined();
      expect(blueprint.categories.some((category) => category.purpose !== undefined)).toBe(false);
    }
  });
});
