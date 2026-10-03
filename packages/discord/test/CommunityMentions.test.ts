import { describe, expect, it } from "vitest";

import { userMentions } from "../src/community/DiscordCommunityGateway.js";

describe("welcome message mentions", () => {
  it("lists the members mentioned in the text so Discord shows their names", () => {
    expect(userMentions("Welcome to Paradise City RP, <@123456789012345678>! You are member #22.")).toEqual(["123456789012345678"]);
    expect(userMentions("<@!123456789012345678> and <@123456789012345678> and <@234567890123456789>")).toEqual(["123456789012345678", "234567890123456789"]);
  });

  it("ignores role and channel mentions and empty text", () => {
    expect(userMentions("<@&123456789012345678> in <#123456789012345678>")).toEqual([]);
    expect(userMentions(undefined)).toEqual([]);
  });
});
