import assert from "node:assert/strict";
import test from "node:test";

test("Discord Essentials catalog includes every planned portal subsection", async () => {
  const { seedDemoData } = await import("../public/js/data.js");
  const { featureRegistry } = await import("../public/js/featureRegistry.js");
  const state = seedDemoData();
  const names = state.discord.features.map((feature) => feature.name);
  assert.deepEqual(names, featureRegistry.map((feature) => feature.displayName));
});

test("Role Menus demo data is deterministic and contains no secret-bearing fields", async () => {
  const { seedDemoData } = await import("../public/js/data.js");
  const first = seedDemoData().discord.roleMenus;
  const second = seedDemoData().discord.roleMenus;
  assert.deepEqual(first, second);
  const serialized = JSON.stringify(first).toLowerCase();
  for (const forbidden of ["token", "secret", "cookie", "oauth", "csrf"]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});
