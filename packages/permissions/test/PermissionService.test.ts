import { describe, expect, it } from "vitest";

import { PermissionService } from "../src/index.js";

describe("PermissionService", () => {
  it("authorizes permissions granted to any subject role", () => {
    const service = new PermissionService();

    service.registerGrant({
      roleId: "moderator",
      permissions: ["moderation.warn", "moderation.kick"]
    });

    expect(
      service.hasPermission(
        {
          userId: "user-1",
          roleIds: ["member", "moderator"]
        },
        "moderation.warn"
      )
    ).toBe(true);
  });

  it("requires every requested permission for hasEveryPermission", () => {
    const service = new PermissionService();
    const subject = {
      userId: "user-1",
      roleIds: ["moderator"]
    } as const;

    service.registerGrant({
      roleId: "moderator",
      permissions: ["moderation.warn"]
    });

    expect(
      service.hasEveryPermission(subject, ["moderation.warn"])
    ).toBe(true);
    expect(
      service.hasEveryPermission(subject, [
        "moderation.warn",
        "moderation.ban"
      ])
    ).toBe(false);
  });

  it("authorizes any matching permission and clears registered grants", () => {
    const service = new PermissionService();
    const subject = {
      userId: "user-1",
      roleIds: ["staff"]
    } as const;

    service.registerGrant({
      roleId: "staff",
      permissions: ["tickets.manage"]
    });

    expect(
      service.hasAnyPermission(subject, [
        "moderation.ban",
        "tickets.manage"
      ])
    ).toBe(true);

    service.clear();

    expect(
      service.hasPermission(subject, "tickets.manage")
    ).toBe(false);
  });
});
