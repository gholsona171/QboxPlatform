import { describe, expect, it } from "vitest";

import { EMBED_LIMITS, embedColor, normalizeEmbed, normalizeMessage, validateLook } from "../src/index.js";

const GUILD = "100000000000000001";

describe("normalizeMessage", () => {
  it("cleans a Discord-format message and converts hex colors", () => {
    const message = normalizeMessage({
      content: "  Hello {user}  ",
      embeds: [
        { title: " Ticket #{number} ", description: "", color: "#5865F2", fields: [{ name: "A", value: "B", inline: true }, { name: "", value: "" }], footer: { text: "f", icon_url: "" }, author: { name: "" } },
        { title: "", description: "" },
      ],
    });
    expect(message).toEqual({ content: "Hello {user}", embeds: [{ title: "Ticket #{number}", color: 0x5865f2, fields: [{ name: "A", value: "B", inline: true }], footer: { text: "f" } }] });
  });

  it("rejects empty messages", () => {
    expect(() => normalizeMessage({ content: "", embeds: [{ title: "" }] })).toThrow("Write some text");
    expect(() => normalizeMessage({})).toThrow("Write some text");
  });

  it("enforces Discord limits", () => {
    const long = (size: number) => "x".repeat(size + 1);
    expect(() => normalizeMessage({ content: long(EMBED_LIMITS.content) })).toThrow("2000");
    expect(() => normalizeMessage({ embeds: Array.from({ length: 11 }, () => ({ title: "t" })) })).toThrow("at most 10 embeds");
    expect(() => normalizeEmbed({ title: long(EMBED_LIMITS.title) }, 1)).toThrow("256");
    expect(() => normalizeEmbed({ description: long(EMBED_LIMITS.description) }, 1)).toThrow("4096");
    expect(() => normalizeEmbed({ fields: Array.from({ length: 26 }, () => ({ name: "n", value: "v" })) }, 1)).toThrow("25 fields");
    expect(() => normalizeEmbed({ fields: [{ name: long(EMBED_LIMITS.fieldName), value: "v" }] }, 1)).toThrow("256");
    expect(() => normalizeEmbed({ fields: [{ name: "n", value: long(EMBED_LIMITS.fieldValue) }] }, 1)).toThrow("1024");
    expect(() => normalizeEmbed({ footer: { text: long(EMBED_LIMITS.footer) } }, 1)).toThrow("2048");
    expect(() => normalizeEmbed({ author: { name: long(EMBED_LIMITS.author) } }, 1)).toThrow("256");
    expect(() => normalizeEmbed({ description: "x".repeat(4096), fields: Array.from({ length: 2 }, () => ({ name: "n".repeat(256), value: "v".repeat(1024) })) }, 1)).toThrow("6000");
    expect(() => normalizeEmbed({ fields: [{ name: "only a name" }] }, 1)).toThrow("both a name and a value");
  });

  it("accepts only http(s) links and valid colors", () => {
    expect(() => normalizeEmbed({ url: "javascript:alert(1)", title: "t" }, 1)).toThrow("http(s)");
    expect(() => normalizeEmbed({ title: "t", image: { url: "ftp://x" } }, 1)).toThrow("http(s)");
    expect(normalizeEmbed({ title: "t", thumbnail: { url: "https://x.example/a.png" } }, 1)).toEqual({ title: "t", thumbnail: { url: "https://x.example/a.png" } });
    expect(embedColor("5865F2")).toBe(0x5865f2);
    expect(embedColor(0xffffff)).toBe(0xffffff);
    expect(() => embedColor(0x1000000)).toThrow("Embed color");
    expect(() => embedColor("red")).toThrow("hex color");
    expect(() => normalizeEmbed({ title: "t", timestamp: "yesterday" }, 1)).toThrow("ISO 8601");
  });
});

describe("validateLook", () => {
  it("normalizes colors and drops blanks", () => {
    const look = validateLook({ guildId: GUILD, enabled: true, accentColor: "5865f2", footerText: " {server} ", footerIconUrl: "", authorName: "", showTimestamp: true, mode: "fill" });
    expect(look).toEqual({ guildId: GUILD, enabled: true, accentColor: "#5865F2", footerText: "{server}", showTimestamp: true, mode: "fill" });
  });

  it("rejects bad input", () => {
    expect(() => validateLook({ guildId: GUILD, enabled: true, accentColor: "blue", showTimestamp: false, mode: "fill" })).toThrow("hex color");
    expect(() => validateLook({ guildId: GUILD, enabled: true, thumbnailUrl: "not a link", showTimestamp: false, mode: "fill" })).toThrow("http(s)");
    expect(() => validateLook({ guildId: GUILD, enabled: true, showTimestamp: false, mode: "loud" as "fill" })).toThrow("Mode");
  });
});
