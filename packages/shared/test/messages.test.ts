import { describe, expect, it } from "vitest";

import { passthroughTemplates, renderMessage, renderPlaceholders } from "../src/messages.js";

describe("message templates", () => {
  it("replaces known placeholders and leaves unknown ones as written", () => {
    const values = { user: "<@1>", number: 5, when: new Date("2026-09-25T12:00:00Z"), empty: null };
    expect(renderPlaceholders("Hi {user}, ticket {number} at {when} {empty}{missing}", values)).toBe("Hi <@1>, ticket 5 at <t:1790337600:f> {missing}");
  });

  it("renders every text field of an embed", () => {
    const rendered = renderMessage(
      {
        content: "{user}",
        embeds: [{ title: "Ticket #{number}", description: "{reason}", color: 1, footer: { text: "{server}" }, author: { name: "{username}", icon_url: "x" }, fields: [{ name: "{a}", value: "{b}", inline: true }], image: { url: "{img}" } }],
      },
      { user: "<@1>", number: 2, reason: "Donations", server: "Guildhall", username: "amy", a: "A", b: "B", img: "https://i" },
    );
    expect(rendered).toEqual({
      content: "<@1>",
      embeds: [{ title: "Ticket #2", description: "Donations", color: 1, footer: { text: "Guildhall" }, author: { name: "amy", icon_url: "x" }, fields: [{ name: "A", value: "B", inline: true }], image: { url: "https://i" } }],
    });
  });

  it("passes the fallback through when nothing is customized", async () => {
    const fallback = { content: "hi" };
    expect(await passthroughTemplates.apply("1", "tickets.opened", {}, fallback)).toBe(fallback);
  });
});
