import { describe, expect, it } from "vitest";

import { DiscordRestGuildAuthority } from "../src/auth/DiscordGuildAuthority.js";

const GUILD = "100000000000000001";
const ADMIN_ROLE = "400000000000000001";
const MANAGE_ROLE = "400000000000000002";
const MEMBER_ROLE = "400000000000000003";

function fakeRest(options: { readonly fail?: boolean; readonly calls?: string[] } = {}) {
  const respond = async (route: string) => {
    options.calls?.push(route);
    if (options.fail) throw new Error("Discord unavailable");
    if (route === `/guilds/${GUILD}`) return { owner_id: "200000000000000001" };
    if (route === `/guilds/${GUILD}/roles`)
      return [
        { id: GUILD, permissions: String(1n << 10n) },
        { id: ADMIN_ROLE, permissions: String(1n << 3n) },
        { id: MANAGE_ROLE, permissions: String((1n << 5n) | (1n << 10n)) },
        { id: MEMBER_ROLE, permissions: String((1n << 10n) | (1n << 11n)) },
      ];
    throw new Error(`unexpected ${route}`);
  };
  return { get: respond, post: respond, patch: respond, put: respond, delete: respond };
}

describe("DiscordRestGuildAuthority", () => {
  it("treats the owner, Administrator, and Manage Server as managers", async () => {
    const authority = new DiscordRestGuildAuthority(fakeRest());
    expect(await authority.isManager(GUILD, "200000000000000001", [])).toBe(true);
    expect(await authority.isManager(GUILD, "200000000000000002", [ADMIN_ROLE])).toBe(true);
    expect(await authority.isManager(GUILD, "200000000000000002", [MEMBER_ROLE, MANAGE_ROLE])).toBe(true);
    expect(await authority.isManager(GUILD, "200000000000000002", [MEMBER_ROLE])).toBe(false);
    expect(await authority.isManager(GUILD, "200000000000000002", [])).toBe(false);
  });

  it("caches Discord's answer per server and refreshes after the TTL", async () => {
    const calls: string[] = [];
    let now = 0;
    const authority = new DiscordRestGuildAuthority(fakeRest({ calls }), { ttlMs: 60_000, now: () => now });
    await authority.isManager(GUILD, "200000000000000002", [ADMIN_ROLE]);
    await authority.isManager(GUILD, "200000000000000002", [MEMBER_ROLE]);
    expect(calls).toHaveLength(2);
    now = 60_000;
    await authority.isManager(GUILD, "200000000000000002", []);
    expect(calls).toHaveLength(4);
  });

  it("denies when Discord cannot be reached and nothing is cached", async () => {
    const errors: unknown[] = [];
    const authority = new DiscordRestGuildAuthority(fakeRest({ fail: true }), { onError: (error) => errors.push(error) });
    expect(await authority.isManager(GUILD, "200000000000000001", [ADMIN_ROLE])).toBe(false);
    expect(errors).toHaveLength(1);
  });
});
