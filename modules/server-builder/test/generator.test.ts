import { describe, expect, it } from "vitest";

import {
  BUILDER_LIMITS,
  BUILDER_TEMPLATES,
  generateBlueprint,
  linkOptions,
  summarize,
  templateFor,
  validateBlueprint,
  type BuilderAnswers,
  type BuilderBlueprint,
  type BuilderSection,
} from "../src/index.js";

const channels = (blueprint: BuilderBlueprint) => blueprint.categories.flatMap((category) => category.channels);
const purposes = (blueprint: BuilderBlueprint) => channels(blueprint).map((channel) => channel.purpose).filter(Boolean);
const without = (answers: BuilderAnswers, ...sections: BuilderSection[]): BuilderAnswers => ({
  ...answers,
  include: { ...answers.include, ...Object.fromEntries(sections.map((section) => [section, false])) },
});

describe("generateBlueprint", () => {
  it("produces a valid blueprint within Discord limits for every template", () => {
    for (const template of BUILDER_TEMPLATES) {
      const blueprint = generateBlueprint(template.answers);
      expect(() => validateBlueprint(blueprint)).not.toThrow();
      const summary = summarize(blueprint);
      expect(summary.totalChannels).toBeLessThanOrEqual(BUILDER_LIMITS.channels);
      expect(summary.roles).toBeLessThanOrEqual(BUILDER_LIMITS.roles);
      expect(summary.warnings.join(" ")).not.toContain("More than one category");
      for (const category of blueprint.categories) expect(category.channels.length).toBeLessThanOrEqual(BUILDER_LIMITS.channelsPerCategory);
    }
  });

  it("lands a full FiveM roleplay server between 80 and 120 channels", () => {
    const answers = templateFor("FIVEM_RP").answers;
    const blueprint = generateBlueprint({ ...answers, include: { ...answers.include, ageRestricted: true } });
    const count = channels(blueprint).length;
    expect(count).toBeGreaterThanOrEqual(80);
    expect(count).toBeLessThanOrEqual(120);
    expect(blueprint.roles.filter((role) => role.purpose === "staff").map((role) => role.name)).toEqual(["Owner", "Admin", "Senior Moderator", "Moderator", "Trial Moderator"]);
    expect(blueprint.roles[0]?.permissions).toEqual(["Administrator"]);
    expect(blueprint.categories.map((category) => category.name)).toContain("🚓 POLICE");
    expect(purposes(blueprint)).toEqual(expect.arrayContaining(["welcome", "rules", "verify", "mod-log", "server-log", "tickets-panel", "ticket-transcripts", "applications-review", "staff-log", "level-up", "birthdays", "giveaways", "polls", "fivem-status", "fivem-alerts", "suggestions", "starboard", "announcements", "voice-hub"]));
    expect(channels(blueprint).some((channel) => channel.nsfw)).toBe(true);
    expect(linkOptions(blueprint).every((option) => option.available)).toBe(true);
  });

  it("is deterministic", () => {
    const answers = templateFor("GAMING").answers;
    expect(generateBlueprint(answers)).toEqual(generateBlueprint(answers));
  });

  it("removes sections that are turned off", () => {
    const base = templateFor("FIVEM_RP").answers;
    const blueprint = generateBlueprint(without(base, "verification", "tickets", "staffArea", "fivemStatus", "joinToCreate", "levels"));
    expect(blueprint.roles.some((role) => role.purpose === "verified")).toBe(false);
    expect(purposes(blueprint)).not.toEqual(expect.arrayContaining(["verify"]));
    for (const gone of ["verify", "tickets-panel", "ticket-transcripts", "mod-log", "fivem-status", "voice-hub", "level-up"]) expect(purposes(blueprint)).not.toContain(gone);
    expect(blueprint.categories.some((category) => category.name.includes("STAFF"))).toBe(false);
    expect(channels(blueprint).some((channel) => channel.nsfw)).toBe(false);
    const options = linkOptions(blueprint);
    expect(options.find((option) => option.link === "tickets")?.available).toBe(false);
    expect(options.find((option) => option.link === "verification")?.available).toBe(false);
  });

  it("uses media channels, departments, lounges, and plain category names when asked", () => {
    const base = templateFor("COMMUNITY").answers;
    const blueprint = generateBlueprint({ ...base, useMediaChannels: true, emojiCategories: false, voiceLounges: 5, departments: ["Art Team"] });
    expect(channels(blueprint).filter((channel) => channel.type === "MEDIA").map((channel) => channel.name)).toEqual(["screenshots", "clips", "art"]);
    expect(blueprint.categories.map((category) => category.name)).toContain("ART TEAM");
    expect(channels(blueprint).filter((channel) => channel.name.startsWith("Lounge"))).toHaveLength(5);
    expect(channels(blueprint).map((channel) => channel.name)).toContain("art-team-chat");
    const text = templateFor("COMMUNITY").answers;
    const textMedia = channels(generateBlueprint(text)).find((channel) => channel.name === "screenshots");
    expect(textMedia).toMatchObject({ type: "TEXT", slowmodeSeconds: 10 });
  });

  it("rejects bad answers with plain messages", () => {
    const base = templateFor("BUSINESS").answers;
    expect(() => generateBlueprint({ ...base, serverName: " " })).toThrow("Server name");
    expect(() => generateBlueprint({ ...base, staffRanks: ["Admin", "admin"] })).toThrow("listed twice");
    expect(() => generateBlueprint({ ...base, voiceLounges: 11 })).toThrow("Voice lounges");
  });
});
