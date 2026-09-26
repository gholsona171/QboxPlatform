import { describe, expect, it } from "vitest";

import { GuildRowIds } from "../src/policies/GuildRowIds.js";

function fakeClient(existing: Record<string, string> = {}) {
  const calls: string[] = [];
  const rows = new Map(Object.entries(existing));
  const guild = {
    findUnique: async ({ where }: { where: { discordGuildId: string } }) => {
      calls.push(`find ${where.discordGuildId}`);
      const id = rows.get(where.discordGuildId);
      return id === undefined ? null : { id };
    },
    upsert: async ({ where }: { where: { discordGuildId: string } }) => {
      calls.push(`upsert ${where.discordGuildId}`);
      const id = rows.get(where.discordGuildId) ?? `row-${where.discordGuildId}`;
      rows.set(where.discordGuildId, id);
      return { id };
    },
  };
  return { client: { guild } as never, calls, rows };
}

describe("GuildRowIds", () => {
  it("reads an existing row with one query and no upsert transaction", async () => {
    const { client, calls } = fakeClient({ "100000000000000001": "row-a" });
    expect(await new GuildRowIds(client).ensure("100000000000000001")).toEqual({ id: "row-a" });
    expect(calls).toEqual(["find 100000000000000001"]);
  });

  it("creates the row for a new server with an upsert and sees a reset database", async () => {
    const { client, calls, rows } = fakeClient();
    const ids = new GuildRowIds(client);
    expect(await ids.ensure("100000000000000002")).toEqual({ id: "row-100000000000000002" });
    rows.clear();
    rows.set("100000000000000002", "row-new");
    expect(await ids.ensure("100000000000000002")).toEqual({ id: "row-new" });
    expect(calls).toEqual(["find 100000000000000002", "upsert 100000000000000002", "find 100000000000000002"]);
  });
});
