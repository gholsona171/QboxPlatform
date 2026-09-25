/**
 * Recomputes PERMISSION_CATALOG_CHECKSUM after permissions are added to
 * packages/permissions/src/catalog/PermissionCatalog.ts.
 *
 * Usage: node scripts/update-permission-checksum.mjs
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const file = "packages/permissions/src/catalog/PermissionCatalog.ts";
const source = readFileSync(file, "utf8");
const block = source.slice(source.indexOf("export const PERMISSIONS = ["), source.indexOf("] as const;"));
const permissions = [...block.matchAll(/"([a-z0-9.-]+)"/g)].map((match) => match[1]);
if (new Set(permissions).size !== permissions.length) throw new Error("Duplicate permission identifiers.");
const checksum = createHash("sha256").update(permissions.join("\n")).digest("hex");
writeFileSync(file, source.replace(/"sha256:[0-9a-f]{64}"/, `"sha256:${checksum}"`));
console.log(`${permissions.length} permissions, sha256:${checksum}`);
