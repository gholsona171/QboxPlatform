import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { PERMISSIONS } from "@qbox/permissions";

import { featureRegistry } from "../src/index.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(packageRoot, "../..");

const commandNames = [
  "adminping",
  "announce",
  "autorole",
  "counter",
  "custom",
  "embed",
  "goodbye",
  "logs",
  "ping",
  "role-menu",
  "rules",
  "starboard",
  "suggest",
  "welcome",
  "roles",
  "ticket",
  "tickets",
  "mod",
  "verify",
  "apply",
  "applications",
  "staff",
  "poll",
  "giveaway",
  "birthday",
  "schedule",
  "rank",
  "leaderboard",
  "levels",
  "voice",
  "faq",
  "kb",
  "ask",
  "fivem",
  "streams",
  "music",
  "server",
  "builder",
];

describe("featureRegistry", () => {
  it("contains stable unique feature ids and display names", () => {
    expect(new Set(featureRegistry.map((feature) => feature.id)).size).toBe(featureRegistry.length);
    expect(featureRegistry.map((feature) => feature.displayName)).toContain("Role Management");
  });

  it("does not mark LIVE features without declared required surfaces", () => {
    for (const feature of featureRegistry.filter((item) => item.status === "LIVE")) {
      expect(feature.portalRoute).toMatch(/^\/[a-z]/);
      expect(feature.portalAvailable).toBe(true);
      expect(feature.discordFallbackAvailable).toBe(true);
      for (const command of feature.discordCommands) expect(commandNames).toContain(command);
      for (const permission of feature.requiredPermissions) expect(PERMISSIONS).toContain(permission as never);
      if (feature.id !== "command-center") expect(feature.apiRoutes.length).toBeGreaterThan(0);
      if (feature.id !== "command-center") expect(feature.persistence.length).toBeGreaterThan(0);
    }
  });

  it("keeps the web mirror and markdown document synchronized by feature name and status", async () => {
    const web = await import("../../../apps/web/public/js/featureRegistry.js");
    expect(web.featureRegistry.map((feature: { displayName: string; status: string }) => [feature.displayName, feature.status]))
      .toEqual(featureRegistry.map((feature) => [feature.displayName, feature.status]));
    const markdown = await readFile(resolve(repositoryRoot, "docs/DiscordFeatureParity.md"), "utf8");
    for (const feature of featureRegistry) expect(markdown).toContain(`| ${feature.displayName} | ${feature.status} |`);
  });
});
