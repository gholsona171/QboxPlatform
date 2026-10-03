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

describe("DiscordRestGuildAuthority.liveMember", () => {
  const MEMBER = "200000000000000005";
  function memberRest(answer: () => unknown, calls: string[] = []) {
    const respond = async (route: string) => {
      calls.push(route);
      const value = answer();
      if (value instanceof Error) throw value;
      return value;
    };
    return { get: respond, post: respond, patch: respond, put: respond, delete: respond };
  }

  it("reads the member's current roles through the bot and caches them for 30 seconds", async () => {
    const calls: string[] = [];
    let roles = [MEMBER_ROLE];
    let now = 0;
    const authority = new DiscordRestGuildAuthority(memberRest(() => ({ roles }), calls), { now: () => now });
    expect(await authority.liveMember(GUILD, MEMBER)).toEqual({ present: true, roleIds: [MEMBER_ROLE] });
    roles = [MEMBER_ROLE, ADMIN_ROLE];
    now = 29_000;
    expect(await authority.liveMember(GUILD, MEMBER)).toEqual({ present: true, roleIds: [MEMBER_ROLE] });
    now = 31_000;
    expect(await authority.liveMember(GUILD, MEMBER)).toEqual({ present: true, roleIds: [MEMBER_ROLE, ADMIN_ROLE] });
    expect(calls).toEqual([`/guilds/${GUILD}/members/${MEMBER}`, `/guilds/${GUILD}/members/${MEMBER}`]);
  });

  it("reports a member who left as not present", async () => {
    const unknown = Object.assign(new Error("Unknown Member"), { code: 10007, status: 404 });
    const authority = new DiscordRestGuildAuthority(memberRest(() => unknown));
    expect(await authority.liveMember(GUILD, MEMBER)).toEqual({ present: false, roleIds: [] });
  });

  it("answers undefined when Discord cannot be asked, so the stored roles decide", async () => {
    const errors: unknown[] = [];
    const authority = new DiscordRestGuildAuthority(memberRest(() => new Error("Discord unavailable")), { onError: (error) => errors.push(error) });
    expect(await authority.liveMember(GUILD, MEMBER)).toBeUndefined();
    expect(errors).toHaveLength(1);
  });
});
