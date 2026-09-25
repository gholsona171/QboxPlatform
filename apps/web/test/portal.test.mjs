import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const publicDirectory = new URL("../public/", import.meta.url);

async function portalSources() {
  const scripts = await readdir(new URL("js/", publicDirectory));
  const files = ["index.html", "styles.css", ...scripts.map((name) => `js/${name}`)];
  return Promise.all(files.map(async (file) => ({ file, text: await readFile(new URL(file, publicDirectory), "utf8") })));
}

test("portal contains no demo data or demo mode", async () => {
  for (const { file, text } of await portalSources()) {
    assert.equal(/\bdemo\b/i.test(text), false, `${file} mentions demo`);
    assert.equal(/localStorage/.test(text), false, `${file} stores data in the browser`);
  }
});

test("every LIVE feature has a portal page", async () => {
  const { featureRegistry } = await import("../public/js/featureRegistry.js");
  const discord = await readFile(new URL("js/discord.js", publicDirectory), "utf8");
  const pages = await readFile(new URL("js/pages.js", publicDirectory), "utf8");
  for (const feature of featureRegistry.filter((item) => item.status === "LIVE")) {
    if (!feature.portalRoute.includes("?tab=")) {
      const pageId = feature.portalRoute.slice(1);
      assert.ok(pages.includes(`id: "${pageId}"`), `${feature.displayName} page "${pageId}" is missing from pages.js`);
      continue;
    }
    const tab = feature.portalRoute.split("tab=")[1];
    if (!tab || tab === "overview") continue;
    assert.ok(discord.includes(`"${tab}"`), `${feature.displayName} tab "${tab}" is missing from the Discord page`);
  }
});

test("portal mutations send the CSRF header", async () => {
  const api = await readFile(new URL("js/api.js", publicDirectory), "utf8");
  assert.match(api, /"x-csrf-token": csrf/);
  assert.doesNotMatch(api, /method: "(POST|PUT|PATCH|DELETE)"/);
});
