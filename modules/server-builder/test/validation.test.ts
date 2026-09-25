import { describe, expect, it } from "vitest";

import {
  BOT,
  EVERYONE,
  PERMISSION_BITS,
  PRESETS,
  channelSlug,
  describeAccess,
  isEmoji,
  mergeOverwrites,
  normalizeBlueprint,
  permissionBits,
  validateBlueprint,
  type BuilderBlueprint,
  type BuilderChannel,
} from "../src/index.js";

const text = (key: string, overrides: Partial<BuilderChannel> = {}): BuilderChannel => ({ key, name: key, type: "TEXT", slowmodeSeconds: 0, nsfw: false, userLimit: 0, overwrites: [], ...overrides });

function blueprint(overrides: Partial<BuilderBlueprint> = {}): BuilderBlueprint {
  return {
    roles: [
      { key: "staff-admin", name: "Admin", color: "#E74C3C", hoist: true, mentionable: false, permissions: ["KickMembers"], purpose: "staff" },
      { key: "verified", name: "Verified", color: "#2ECC71", hoist: false, mentionable: false, permissions: [], purpose: "verified" },
    ],
    categories: [{ key: "cat-info", name: "INFO", overwrites: PRESETS.VERIFIED_ONLY("verified"), channels: [text("rules", { overwrites: PRESETS.READ_ONLY(["staff-admin"]) })] }],
    ...overrides,
  };
}

describe("validateBlueprint", () => {
  it("accepts a valid blueprint", () => {
    expect(() => validateBlueprint(blueprint())).not.toThrow();
  });

  it("rejects overwrites for roles that are not in the blueprint", () => {
    const bad = blueprint({ categories: [{ key: "cat", name: "C", overwrites: [{ target: "ghost", allow: ["ViewChannel"], deny: [] }], channels: [] }] });
    expect(() => validateBlueprint(bad)).toThrow("not in the blueprint");
  });

  it("rejects duplicate keys and duplicate purposes", () => {
    expect(() => validateBlueprint(blueprint({ categories: [{ key: "a", name: "A", overwrites: [], channels: [text("a")] }] }))).toThrow('key "a"');
    const twice = blueprint({ categories: [{ key: "c", name: "C", overwrites: [], channels: [text("x", { purpose: "rules" }), text("y", { purpose: "rules" })] }] });
    expect(() => validateBlueprint(twice)).toThrow("Only one channel");
  });

  it("enforces Discord limits", () => {
    const many = Array.from({ length: 51 }, (_, index) => text(`c${index}`));
    expect(() => validateBlueprint(blueprint({ categories: [{ key: "big", name: "Big", overwrites: [], channels: many }] }))).toThrow("50 per category");
    const categories = Array.from({ length: 11 }, (_, category) => ({ key: `cat${category}`, name: `Cat ${category}`, overwrites: [], channels: Array.from({ length: 45 }, (_, index) => text(`c${category}-${index}`)) }));
    expect(() => validateBlueprint(blueprint({ categories }))).toThrow("Discord allows 500");
    const roles = Array.from({ length: 251 }, (_, index) => ({ key: `r${index}`, name: `R${index}`, color: "#FFFFFF", hoist: false, mentionable: false, permissions: [] }));
    expect(() => validateBlueprint(blueprint({ roles, categories: [] }))).toThrow("250 roles");
    expect(() => validateBlueprint(blueprint({ categories: [{ key: "c", name: "x".repeat(101), overwrites: [], channels: [] }] }))).toThrow("between 1 and 100");
  });

  it("checks forum setup limits and keeps it to forum and media channels", () => {
    const forum = (overrides: Record<string, unknown>) => blueprint({ categories: [{ key: "c", name: "C", overwrites: [], channels: [{ ...text("help"), type: "FORUM", forum: { tags: [], ...overrides } }] }] });
    expect(() => validateBlueprint(forum({ guidelines: "Be nice.", tags: [{ name: "Question", emoji: "❓" }, { name: "Custom", emoji: "pepe:123456789012345678" }], defaultReactionEmoji: "👍", firstPost: { title: "Hi", content: "Read this.", pin: true } }))).not.toThrow();
    expect(() => validateBlueprint(forum({ guidelines: "x".repeat(4097) }))).toThrow("guidelines");
    expect(() => validateBlueprint(forum({ tags: Array.from({ length: 21 }, (_, index) => ({ name: `t${index}` })) }))).toThrow("too many tags");
    expect(() => validateBlueprint(forum({ tags: [{ name: "x".repeat(21) }] }))).toThrow("between 1 and 20");
    expect(() => validateBlueprint(forum({ tags: [{ name: "Bad", emoji: "smile" }] }))).toThrow("emoji");
    expect(() => validateBlueprint(forum({ defaultReactionEmoji: ":)" }))).toThrow("emoji");
    expect(() => validateBlueprint(forum({ firstPost: { title: "", content: "Hi", pin: true } }))).toThrow("title");
    expect(() => validateBlueprint(forum({ firstPost: { title: "Hi", content: "x".repeat(2001), pin: true } }))).toThrow("first post");
    const notForum = blueprint({ categories: [{ key: "c", name: "C", overwrites: [], channels: [text("chat", { forum: { tags: [] } })] }] });
    expect(() => validateBlueprint(notForum)).toThrow("not a forum");
    const media = blueprint({ categories: [{ key: "c", name: "C", overwrites: [], channels: [{ ...text("clips"), type: "MEDIA", forum: { tags: [{ name: "Clip" }] } }] }] });
    expect(() => validateBlueprint(media)).not.toThrow();
    expect(isEmoji("👍🏽")).toBe(true);
    expect(isEmoji("🇺🇸")).toBe(true);
    expect(isEmoji("👍👍")).toBe(false);
    const messy = normalizeBlueprint(forum({ guidelines: "  Be nice. ", tags: [{ name: " Question ", emoji: " " }], defaultReactionEmoji: "", firstPost: { title: " Hi ", content: " Read. ", pin: false } }));
    expect(messy.categories[0]?.channels[0]?.forum).toEqual({ guidelines: "Be nice.", tags: [{ name: "Question" }], firstPost: { title: "Hi", content: "Read.", pin: false } });
  });

  it("requires Discord-style text channel names and normalizes them on save", () => {
    const messy = blueprint({ categories: [{ key: "c", name: " Info ", overwrites: [], channels: [text("general", { name: "General Chat!" }), { ...text("vc"), type: "VOICE", name: " Lounge 1 " }] }] });
    expect(() => validateBlueprint(messy)).toThrow("general-chat");
    const normalized = normalizeBlueprint(messy);
    expect(normalized.categories[0]?.channels.map((channel) => channel.name)).toEqual(["general-chat", "Lounge 1"]);
    expect(() => validateBlueprint(normalized)).not.toThrow();
    expect(channelSlug("  📢 Big   News -- Today  ")).toBe("📢-big-news-today");
  });
});

describe("permission presets", () => {
  it("turns permission names into Discord bitfields", () => {
    expect(permissionBits(["ViewChannel", "SendMessages"])).toBe(String((1n << 10n) | (1n << 11n)));
    expect(PERMISSION_BITS.Administrator).toBe(8n);
    expect(permissionBits([])).toBe("0");
  });

  it("hides verified-only and staff-only channels from @everyone", () => {
    expect(PRESETS.VERIFIED_ONLY("verified")).toEqual([
      { target: EVERYONE, allow: [], deny: ["ViewChannel"] },
      { target: "verified", allow: ["ViewChannel"], deny: [] },
    ]);
    const staff = PRESETS.STAFF_ONLY(["staff-admin"]);
    expect(staff[0]).toEqual({ target: EVERYONE, allow: [], deny: ["ViewChannel"] });
    expect(staff.find((overwrite) => overwrite.target === BOT)?.allow).toContain("SendMessages");
    expect(PRESETS.HIDDEN_LOG(["staff-admin"]).find((overwrite) => overwrite.target === "staff-admin")).toEqual({ target: "staff-admin", allow: ["ViewChannel", "ReadMessageHistory"], deny: ["SendMessages"] });
    expect(PRESETS.MEDIA_ONLY(true)).toEqual([]);
    expect(PRESETS.MEDIA_ONLY(false)[0]?.allow).toEqual(["AttachFiles", "EmbedLinks"]);
    expect(PRESETS.DEPARTMENT_ONLY("dept-police")[1]).toMatchObject({ target: "dept-police", allow: expect.arrayContaining(["ViewChannel", "Connect"]) });
  });

  it("merges category and channel overwrites, with the channel winning", () => {
    const merged = mergeOverwrites([{ target: EVERYONE, allow: ["SendMessages"], deny: ["ViewChannel"] }], [{ target: EVERYONE, allow: ["ViewChannel"], deny: ["SendMessages"] }]);
    expect(merged).toEqual([{ target: EVERYONE, allow: ["ViewChannel"], deny: ["SendMessages"] }]);
  });

  it("describes who can see and post", () => {
    const access = describeAccess(blueprint({ categories: [{ key: "c", name: "C", overwrites: PRESETS.VERIFIED_ONLY("verified"), channels: [text("rules", { overwrites: PRESETS.READ_ONLY(["staff-admin"]) }), text("chat")] }] }));
    expect(access.rules).toEqual({ see: "Verified", post: "Admin" });
    expect(access.chat).toEqual({ see: "Verified", post: "Verified" });
  });

  it("describes access edited by hand", () => {
    const roles = [
      { key: "staff-admin", name: "Admin", color: "#E74C3C", hoist: true, mentionable: false, permissions: [], purpose: "staff" as const },
      { key: "staff-mod", name: "Moderator", color: "#2ECC71", hoist: true, mentionable: false, permissions: [], purpose: "staff" as const },
      { key: "dept-ems", name: "EMS", color: "#3498DB", hoist: true, mentionable: true, permissions: [], purpose: "department" as const },
      { key: "dept-police", name: "Police", color: "#3498DB", hoist: true, mentionable: true, permissions: [], purpose: "department" as const },
    ];
    const see = ["ViewChannel", "ReadMessageHistory"] as const;
    const access = describeAccess(blueprint({
      roles,
      categories: [{
        key: "c", name: "C", overwrites: [],
        channels: [
          text("two-roles", { overwrites: [{ target: EVERYONE, allow: [], deny: ["ViewChannel"] }, { target: "dept-ems", allow: [...see, "SendMessages"], deny: [] }, { target: "dept-police", allow: [...see, "SendMessages"], deny: [] }] }),
          text("see-only", { overwrites: [{ target: "dept-ems", allow: [...see], deny: ["SendMessages", "SendMessagesInThreads", "CreatePublicThreads"] }] }),
          text("staff-see-only", { overwrites: [{ target: EVERYONE, allow: [], deny: ["ViewChannel"] }, { target: "dept-ems", allow: [...see, "SendMessages"], deny: [] }, { target: "staff-admin", allow: [...see], deny: ["SendMessages"] }] }),
          { ...text("radio"), type: "VOICE", overwrites: [{ target: EVERYONE, allow: [], deny: ["ViewChannel"] }, { target: "dept-ems", allow: [...see, "Connect", "Speak"], deny: [] }, { target: "staff-admin", allow: [...see, "Connect"], deny: [] }, { target: "staff-mod", allow: [...see], deny: ["Connect"] }] },
          text("hidden-from-one", { overwrites: [{ target: "dept-police", allow: [], deny: ["ViewChannel"] }] }),
        ],
      }],
    }));
    expect(access["two-roles"]).toEqual({ see: "EMS, Police", post: "EMS, Police" });
    expect(access["see-only"]).toEqual({ see: "everyone", post: "everyone (not EMS)" });
    expect(access["staff-see-only"]).toEqual({ see: "EMS, Admin", post: "EMS" });
    expect(access.radio).toEqual({ see: "staff, EMS", post: "join: EMS, Admin" });
    expect(access["hidden-from-one"]).toEqual({ see: "everyone (not Police)", post: "everyone (not Police)" });
  });
});
