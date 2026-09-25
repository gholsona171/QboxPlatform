import { describe, expect, it } from "vitest";

import { applyLook, defaultLook, lookIsEmpty, type MessagesLook } from "../src/index.js";

const GUILD = "100000000000000001";
const NOW = new Date("2026-09-25T12:00:00.000Z");

function look(overrides: Partial<MessagesLook>): MessagesLook {
  return { ...defaultLook(GUILD), accentColor: "#FF0000", footerText: "{server} · powered by {brand}", authorName: "{server}", ...overrides };
}

describe("applyLook", () => {
  it("fills only empty parts in fill mode", () => {
    const result = applyLook({ title: "Hi", color: 0x00ff00, footer: { text: "Keep me" } }, look({ thumbnailUrl: "https://x.example/t.png", showTimestamp: true }), { guildName: "Night", now: NOW });
    expect(result).toEqual({
      title: "Hi",
      color: 0x00ff00,
      footer: { text: "Keep me" },
      author: { name: "Night" },
      thumbnail: { url: "https://x.example/t.png" },
      timestamp: NOW.toISOString(),
    });
  });

  it("replaces color, footer, and author in override mode but never thumbnails or timestamps", () => {
    const embed = { title: "Hi", color: 0x00ff00, footer: { text: "Keep me" }, author: { name: "Old" }, thumbnail: { url: "https://x.example/mine.png" }, timestamp: "2020-01-01T00:00:00.000Z" };
    const result = applyLook(embed, look({ mode: "override", footerIconUrl: "https://x.example/i.png", thumbnailUrl: "https://x.example/t.png", showTimestamp: true }), { guildName: "Night", now: NOW });
    expect(result).toEqual({
      title: "Hi",
      color: 0xff0000,
      footer: { text: "Night · powered by Guildhall", icon_url: "https://x.example/i.png" },
      author: { name: "Night" },
      thumbnail: { url: "https://x.example/mine.png" },
      timestamp: "2020-01-01T00:00:00.000Z",
    });
  });

  it("adds a missing footer or author icon in fill mode without changing the text", () => {
    const result = applyLook({ footer: { text: "Mine" }, author: { name: "Me" } }, look({ footerIconUrl: "https://x.example/f.png", authorIconUrl: "https://x.example/a.png" }), { guildName: "Night" });
    expect(result.footer).toEqual({ text: "Mine", icon_url: "https://x.example/f.png" });
    expect(result.author).toEqual({ name: "Me", icon_url: "https://x.example/a.png" });
  });

  it("does nothing when disabled or empty", () => {
    const embed = { title: "Hi" };
    expect(applyLook(embed, look({ enabled: false }), { guildName: "Night" })).toBe(embed);
    expect(applyLook(embed, defaultLook(GUILD), { guildName: "Night" })).toEqual(embed);
    expect(lookIsEmpty(defaultLook(GUILD))).toBe(true);
    expect(lookIsEmpty(look({}))).toBe(false);
  });
});
