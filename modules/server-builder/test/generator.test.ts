import { describe, expect, it } from "vitest";

import {
  BUILDER_LIMITS,
  BUILDER_TEMPLATES,
  defaultForumSetup,
  generateBlueprint,
  linkOptions,
  summarize,
  plainChannelName,
  templateFor,
  wantsEmoji,
  channelEmoji,
  emojiChannelName,
  validateBlueprint,
  type BuilderAnswers,
  type BuilderBlueprint,
  type BuilderSection,
} from "../src/index.js";

const channels = (blueprint: BuilderBlueprint) => blueprint.categories.flatMap((category) => category.channels);
const names = (blueprint: BuilderBlueprint) => channels(blueprint).map((channel) => plainChannelName(channel.name));
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
    expect(channels(blueprint).filter((channel) => channel.type === "MEDIA").map((channel) => plainChannelName(channel.name))).toEqual(["screenshots", "clips", "art"]);
    expect(blueprint.categories.map((category) => category.name)).toContain("ART TEAM");
    expect(names(blueprint).filter((name) => name.startsWith("Lounge"))).toHaveLength(5);
    expect(names(blueprint)).toContain("art-team-chat");
    const text = templateFor("COMMUNITY").answers;
    const textMedia = channels(generateBlueprint(text)).find((channel) => plainChannelName(channel.name) === "screenshots");
    expect(textMedia).toMatchObject({ type: "TEXT", slowmodeSeconds: 10 });
  });

  it("lets staff into department channels unless staffAccess is NONE", () => {
    const base = templateFor("FIVEM_RP").answers;
    const staffKeys = generateBlueprint(base).roles.filter((role) => role.purpose === "staff").map((role) => role.key);
    const ems = (blueprint: BuilderBlueprint) => blueprint.categories.find((category) => category.name.includes("EMS"));
    const all = ems(generateBlueprint({ ...base, staffAccess: "ALL" }));
    for (const key of staffKeys) expect(all?.overwrites.find((overwrite) => overwrite.target === key)?.allow).toEqual(expect.arrayContaining(["ViewChannel", "SendMessages", "Connect", "Speak"]));
    expect(all?.overwrites.find((overwrite) => overwrite.target === "dept-ems")?.allow).toContain("ViewChannel");
    const none = ems(generateBlueprint({ ...base, staffAccess: "NONE" }));
    expect(none?.overwrites.map((overwrite) => overwrite.target)).toEqual(["@everyone", "dept-ems", "@bot"]);
    expect(templateFor("COMMUNITY").answers.staffAccess).toBe("ALL");
  });

  it("sets up every forum with guidelines, tags, a default reaction, and a pinned first post", () => {
    const blueprint = generateBlueprint(templateFor("FIVEM_RP").answers);
    const forums = channels(blueprint).filter((channel) => channel.type === "FORUM");
    expect(forums.map((channel) => plainChannelName(channel.name))).toEqual(["character-bios", "bug-reports", "help", "feedback"]);
    for (const forum of forums) {
      expect(forum.forum?.guidelines).toBeTruthy();
      expect(forum.forum?.tags.length).toBeGreaterThanOrEqual(3);
      expect(forum.forum?.defaultReactionEmoji).toBeTruthy();
      expect(forum.forum?.firstPost).toMatchObject({ title: "Read me first", pin: true });
    }
    expect(forums.find((channel) => plainChannelName(channel.name) === "help")?.forum?.tags.map((tag) => tag.name)).toEqual(["Question", "Solved", "Bug"]);
    expect(forums.find((channel) => plainChannelName(channel.name) === "bug-reports")?.forum?.tags.map((tag) => tag.name)).toEqual(["Open", "Fixed", "Cannot reproduce"]);
    expect(channels(blueprint).filter((channel) => channel.type !== "FORUM" && channel.type !== "MEDIA").every((channel) => channel.forum === undefined)).toBe(true);
    const media = channels(generateBlueprint({ ...templateFor("COMMUNITY").answers, useMediaChannels: true })).find((channel) => plainChannelName(channel.name) === "clips");
    expect(media?.forum?.tags.length).toBeGreaterThan(0);
    expect(media?.forum?.firstPost).toBeUndefined();
    expect(defaultForumSetup("random-topic")).toMatchObject({ tags: expect.any(Array), firstPost: { pin: true } });
  });

  it("puts a curated emoji on every channel by default, in the bar style", () => {
    const blueprint = generateBlueprint(templateFor("FIVEM_RP").answers);
    const byPlain = Object.fromEntries(channels(blueprint).map((channel) => [plainChannelName(channel.name), channel]));
    expect(byPlain.welcome?.name).toBe("👋┃welcome");
    expect(byPlain.rules?.name).toBe("📜┃rules");
    expect(byPlain.verify?.name).toBe("✅┃verify");
    expect(byPlain.announcements?.name).toBe("📢┃announcements");
    expect(byPlain["server-updates"]?.name).toBe("🆕┃server-updates");
    expect(byPlain["open-a-ticket"]?.name).toBe("🎫┃open-a-ticket");
    expect(byPlain["mod-log"]?.name).toBe("🔨┃mod-log");
    expect(byPlain["character-bios"]?.name).toBe("🎭┃character-bios");
    expect(byPlain["police-chat"]?.name).toBe("💬┃police-chat");
    expect(byPlain["police-briefings"]?.name).toBe("📋┃police-briefings");
    expect(byPlain["police-training"]?.name).toBe("🎓┃police-training");
    expect(byPlain["Police Radio"]?.name).toBe("📻┃Police Radio");
    expect(byPlain["Police Briefing Room"]?.name).toBe("🎙️┃Police Briefing Room");
    expect(byPlain["Lounge 1"]?.name).toBe("🔊┃Lounge 1");
    expect(byPlain["Staff Voice"]?.name).toBe("🔒┃Staff Voice");
    expect(byPlain["Join to Create"]?.name).toBe("➕┃Join to Create");
    expect(byPlain["18-plus"]).toBeUndefined();
    expect(channels(blueprint).every((channel) => channel.name !== plainChannelName(channel.name))).toBe(true);
    /* Keys stay plain. */
    expect(byPlain.welcome?.key).toBe("welcome");
    expect(byPlain["Lounge 1"]?.key).toBe("lounge-1");
    expect(() => validateBlueprint(blueprint)).not.toThrow();
  });

  it("supports the space style, key channels only, and no emoji at all", () => {
    const base = templateFor("GAMING").answers;
    const spaced = generateBlueprint({ ...base, emojiSeparator: "SPACE" });
    const named = (blueprint: BuilderBlueprint, plain: string) => channels(blueprint).find((channel) => plainChannelName(channel.name) === plain)?.name;
    expect(named(spaced, "welcome")).toBe("👋-welcome");
    expect(named(spaced, "Lounge 1")).toBe("🔊 Lounge 1");
    expect(() => validateBlueprint(spaced)).not.toThrow();
    const key = generateBlueprint({ ...base, channelEmojis: "KEY" });
    expect(named(key, "welcome")).toBe("👋┃welcome");
    expect(named(key, "events")).toBe("📅┃events");
    expect(named(key, "open-a-ticket")).toBe("🎫┃open-a-ticket");
    expect(named(key, "level-ups")).toBe("🏆┃level-ups");
    expect(named(key, "general")).toBe("general");
    expect(named(key, "staff-chat")).toBe("staff-chat");
    expect(named(key, "Lounge 1")).toBe("Lounge 1");
    const none = generateBlueprint({ ...base, channelEmojis: "NONE" });
    expect(channels(none).every((channel) => channel.name === plainChannelName(channel.name))).toBe(true);
    expect(named(none, "Join to Create")).toBe("Join to Create");
    /* Drafts from before the question default to every channel, bar style. */
    const { channelEmojis: _mode, emojiSeparator: _separator, ...legacy } = base;
    expect(named(generateBlueprint(legacy as BuilderAnswers), "welcome")).toBe("👋┃welcome");
    expect(templateFor("BUSINESS").answers).toMatchObject({ emojiCategories: false, channelEmojis: "KEY" });
    expect(wantsEmoji("KEY", { purpose: undefined }, true)).toBe(true);
    expect(wantsEmoji("KEY", { purpose: undefined }, false)).toBe(false);
  });

  it("finds an emoji by purpose, exact name, keyword, or type", () => {
    expect(channelEmoji("anything", "birthdays")).toBe("🎂");
    expect(channelEmoji("🎂┃birthdays")).toBe("🎂");
    expect(channelEmoji("memes")).toBe("😂");
    expect(channelEmoji("Meeting Room 2", undefined, "VOICE")).toBe("🗓️");
    expect(channelEmoji("trading-market")).toBe("💰");
    expect(channelEmoji("whatever")).toBe("💬");
    expect(channelEmoji("whatever", undefined, "STAGE")).toBe("🔊");
    expect(emojiChannelName("Big News", "📢", "TEXT", "BAR")).toBe("📢┃big-news");
    expect(emojiChannelName("Big News", "📢", "TEXT", "SPACE")).toBe("📢-big-news");
    expect(emojiChannelName("Lounge", "🔊", "VOICE", "SPACE")).toBe("🔊 Lounge");
    expect(emojiChannelName("➕ Join", "🔊", "VOICE", "BAR")).toBe("➕ Join");
    expect(defaultForumSetup("❓┃help").tags.map((tag) => tag.name)).toEqual(["Question", "Solved", "Bug"]);
  });

  it("rejects bad answers with plain messages", () => {
    const base = templateFor("BUSINESS").answers;
    expect(() => generateBlueprint({ ...base, serverName: " " })).toThrow("Server name");
    expect(() => generateBlueprint({ ...base, staffAccess: "SOME" as "ALL" })).toThrow("department channel");
    expect(() => generateBlueprint({ ...base, staffRanks: ["Admin", "admin"] })).toThrow("listed twice");
    expect(() => generateBlueprint({ ...base, voiceLounges: 11 })).toThrow("Voice lounges");
    expect(() => generateBlueprint({ ...base, channelEmojis: "SOME" as "ALL" })).toThrow("emoji");
    expect(() => generateBlueprint({ ...base, emojiSeparator: "DOT" as "BAR" })).toThrow("joined");
    expect(() => generateBlueprint({ ...base, description: "x".repeat(2001) })).toThrow("description");
  });
});
