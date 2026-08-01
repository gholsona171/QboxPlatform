import { describe, expect, it } from "vitest";

import {
  PERMISSION_CATALOG_VERSION,
  UnknownPermissionCatalogEntriesError,
  isPermission,
  isValidPermissionIdentifier,
  permissionCatalogStatus,
  requirePermission,
  validatePersistedPermissionCatalog,
} from "../src/index.js";

describe("permission catalog", () => {
  it.each([
    "platform.owner",
    "moderation.warn",
    "tickets.close",
    "knowledge.publish",
  ])("accepts lowercase dot-separated syntax for %s", (permission) =>
    expect(isValidPermissionIdentifier(permission)).toBe(true),
  );

  it.each([
    "Platform.admin",
    "platform",
    "platform..admin",
    "platform_admin",
    "staff.*",
    ".admin",
  ])("rejects invalid exact identifier %s", (permission) =>
    expect(isValidPermissionIdentifier(permission)).toBe(false),
  );

  it("distinguishes valid syntax from compiled catalog membership", () => {
    expect(isPermission("tickets.close")).toBe(false);
    expect(() => requirePermission("tickets.close")).toThrow(
      "not present in catalog",
    );
    expect(requirePermission("platform.admin")).toBe("platform.admin");
  });

  it("reports future synchronization state without persistence", () => {
    expect(permissionCatalogStatus()).toEqual({
      compiledVersion: PERMISSION_CATALOG_VERSION,
      state: "persisted-catalog-unavailable",
    });
    expect(permissionCatalogStatus(PERMISSION_CATALOG_VERSION).state).toBe(
      "synchronized",
    );
    expect(permissionCatalogStatus("0.9.0").state).toBe("version-mismatch");
  });

  it("rejects and reports unknown persisted permission keys", () => {
    expect(() =>
      validatePersistedPermissionCatalog({
        version: "1.0.0",
        permissionKeys: [
          "platform.admin",
          "invented.permission",
          "also.invalid",
        ],
      }),
    ).toThrow(UnknownPermissionCatalogEntriesError);
    try {
      validatePersistedPermissionCatalog({
        version: "1.0.0",
        permissionKeys: ["invented.permission"],
      });
    } catch (error) {
      expect(
        (error as UnknownPermissionCatalogEntriesError).unknownKeys,
      ).toEqual(["invented.permission"]);
    }
  });
});
