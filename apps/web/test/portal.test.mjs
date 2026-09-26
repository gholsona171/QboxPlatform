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

test("portal has a server picker that follows the guilds API contract", async () => {
  const html = await readFile(new URL("index.html", publicDirectory), "utf8");
  const api = await readFile(new URL("js/api.js", publicDirectory), "utf8");
  const guilds = await readFile(new URL("js/guilds.js", publicDirectory), "utf8");
  const app = await readFile(new URL("js/app.js", publicDirectory), "utf8");
  assert.ok(html.includes('id="serverHeader"'), "the sidebar has a server header");
  assert.ok(html.includes('id="guildPickerBackdrop"'), "the picker dialog is in the page shell");
  assert.match(api, /\/api\/v1\/guilds\$\{refresh \? "\?refresh=1" : ""\}/);
  assert.match(api, /mutateJson\("\/api\/v1\/guilds\/select", "POST", \{ guildId \}\)/);
  assert.match(api, /mutateJson\("\/api\/v1\/guilds\/clear", "POST"/);
  assert.match(api, /problem\.code === "GUILD_REQUIRED"/);
  assert.match(guilds, /cdn\.discordapp\.com\/icons\//);
  assert.match(guilds, /rel="noopener noreferrer"/);
  assert.match(app, /qbox:guild-required/);
  assert.match(app, /chooseServerView\(\)/);
});

test("portal shows the Guildhall name and no visible Qbox", async () => {
  const { BRAND } = await import("../public/js/brand.js");
  assert.equal(BRAND.name, "Guildhall");
  const html = await readFile(new URL("index.html", publicDirectory), "utf8");
  assert.match(html, /<title>Guildhall<\/title>/);
  assert.ok(html.includes("<strong>Guildhall</strong>"), "the sidebar brand block names Guildhall");
  for (const { file, text } of await portalSources()) {
    // Identifiers stay: qbox_ cookies, qbox: events, @qbox packages, QBOX_ variables, data- and meta attributes.
    const visible = text.replace(/qbox[_:-][\w-]*/gi, "").replace(/@qbox\/[\w-]+/g, "");
    assert.equal(/\bQbox(Platform)?\b/.test(visible), false, `${file} still shows Qbox`);
  }
});

test("the page shell preloads every portal module so they download in parallel", async () => {
  const html = await readFile(new URL("index.html", publicDirectory), "utf8");
  const preloaded = new Set([...html.matchAll(/<link rel="modulepreload" href="(js\/[^"]+)">/g)].map((match) => match[1]));
  const scripts = (await readdir(new URL("js/", publicDirectory))).filter((name) => name.endsWith(".js")).map((name) => `js/${name}`);
  for (const script of scripts) assert.ok(preloaded.has(script), `${script} is missing a modulepreload link in index.html`);
  for (const link of preloaded) assert.ok(scripts.includes(link), `${link} is preloaded but does not exist`);
});

test("a page load asks for health and the account at the same time, once", async () => {
  const session = await readFile(new URL("js/session.js", publicDirectory), "utf8");
  assert.match(session, /Promise\.all\(\[\s*loadHealth\(\),\s*loadMe\(refreshAccount\)/);
  const app = await readFile(new URL("js/app.js", publicDirectory), "utf8");
  assert.equal(app.match(/refreshSession\(/g)?.length, 2, "boot and sign-out refresh the session; page renders do not");
});

test("picker refresh buttons bypass the API's directory cache", async () => {
  const api = await readFile(new URL("js/api.js", publicDirectory), "utf8");
  const forms = await readFile(new URL("js/forms.js", publicDirectory), "utf8");
  assert.match(api, /\/api\/v1\/directory\$\{refresh \? "\?refresh=1" : ""\}/);
  assert.match(forms, /fetchChannelsAndRoles\(options\.refresh === true\)/);
  assert.match(forms, /loadDirectoryData\(refresh\)/);
});

test("feature pages load independent data in parallel", async () => {
  const read = (file) => readFile(new URL(`js/${file}`, publicDirectory), "utf8");
  assert.match(await read("tickets.js"), /const directory = loadDirectory\(\);\s*try \{\s*const \[overview, tickets\] = await Promise\.all/);
  assert.match(await read("moderation.js"), /Promise\.all\(\[getJson\("moderation\/overview"\), getJson\(`moderation\/cases\?\$\{casesQuery\(\)\}`\), directory\]\)/);
  assert.match(await read("music.js"), /Promise\.all\(\[getJson\("music\/overview"\), getJson\("music\/library"\), getJson\("music\/playlists"\), loadDirectory\(\), player\]\)/);
  assert.match(await read("builder.js"), /const \[selected, wipePreview\] = await Promise\.all/);
});
