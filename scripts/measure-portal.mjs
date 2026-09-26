#!/usr/bin/env node
/**
 * Portal speed measurement for the hosted setup.
 *
 * Builds the real API (createApiApplication, the composition apps/api runs)
 * against a scratch PostgreSQL database and times portal requests while
 * simulating the hosted network:
 *
 * - every PostgreSQL query waits DB_DELAY_MS first (default 30 ms, the round
 *   trip to the Supabase session pooler), including BEGIN/COMMIT;
 * - every Discord call (bot REST client and the member's OAuth calls) is
 *   answered by a fake after DISCORD_DELAY_MS (default 100 ms).
 *
 * The delays are injected here only, by wrapping `pg.Client.prototype.query`,
 * `REST.prototype.request` and `globalThis.fetch` for discord.com inside this
 * process. Production code is not changed.
 *
 * Usage (after `pnpm build`):
 *   createdb -h 127.0.0.1 -p 5433 -U qbox qbox_speed_test
 *   DATABASE_URL=postgresql://qbox@127.0.0.1:5433/qbox_speed_test pnpm --filter @qbox/prisma prisma:migrate:deploy
 *   DATABASE_URL=postgresql://qbox@127.0.0.1:5433/qbox_speed_test node scripts/measure-portal.mjs
 *
 * Each endpoint is measured on a fresh API process (cold: no in-process
 * caches) and then again right away (warm). The same session cookie is reused
 * across processes; it was created through the real Discord sign-in callback.
 *
 * MEASURE_ONLY="GET /api/v1/me" (or "page tickets") limits the run,
 * MEASURE_SQL=1 prints each statement, MEASURE_VERBOSE=1 lists Discord calls.
 */
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomBytes } from "node:crypto";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || !/qbox_speed_test/.test(DATABASE_URL)) {
  console.error("Set DATABASE_URL to the scratch qbox_speed_test database.");
  process.exit(2);
}
const DB_DELAY_MS = Number(process.env.DB_DELAY_MS ?? 30);
const DISCORD_DELAY_MS = Number(process.env.DISCORD_DELAY_MS ?? 100);
const WEB_ROOT = join(ROOT, "apps/web/public");

const GUILD = "1400000000000000001";
const USER = "1400000000000000002";
const ROLE = "1400000000000000003";
const BOT = "1400000000000000004";

const port = await freePort();
const BASE = `http://127.0.0.1:${port}`;
const key = () => randomBytes(32).toString("base64url");
Object.assign(process.env, {
  NODE_ENV: "development",
  LOG_LEVEL: process.env.LOG_LEVEL ?? "silent",
  DATABASE_URL,
  DISCORD_TOKEN: `${Buffer.from(BOT).toString("base64")}.fake.token`,
  DISCORD_APPLICATION_ID: BOT,
  DISCORD_GUILD_ID: "",
  OPENAI_API_KEY: "",
  MUSIC_BOT_TOKEN: "",
  MUSIC_STORAGE_DIR: mkdtempSync(join(tmpdir(), "qbox-measure-music-")),
});

// ---------------------------------------------------------------------------
// Counters and simulated latency.
const stats = { db: 0, dbMs: 0, discord: 0, discordMs: 0, enabled: false };
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

const prismaRequire = createRequire(realpathSync(join(ROOT, "packages/prisma/node_modules/@prisma/adapter-pg/package.json")));
const pg = prismaRequire("pg");
const originalQuery = pg.Client.prototype.query;
pg.Client.prototype.query = function delayedQuery(config, values, callback) {
  if (!stats.enabled) return originalQuery.call(this, config, values, callback);
  stats.db += 1;
  stats.dbMs += DB_DELAY_MS;
  if (process.env.MEASURE_SQL) console.log(`  sql: ${String(typeof config === "string" ? config : config?.text).replace(/\s+/g, " ").slice(0, 140)}`);
  if (typeof values === "function" || typeof callback === "function") {
    setTimeout(() => originalQuery.call(this, config, values, callback), DB_DELAY_MS);
    return undefined;
  }
  return sleep(DB_DELAY_MS).then(() => originalQuery.call(this, config, values));
};

const apiRequire = createRequire(join(ROOT, "apps/api/package.json"));
const { REST } = apiRequire("discord.js");
const discordLog = new Map();
REST.prototype.request = async function fakeDiscordRest(options) {
  const route = String(options.fullRoute);
  if (stats.enabled) {
    stats.discord += 1;
    stats.discordMs += DISCORD_DELAY_MS;
    discordLog.set(`${options.method} ${route}`, (discordLog.get(`${options.method} ${route}`) ?? 0) + 1);
  }
  await sleep(DISCORD_DELAY_MS);
  return fakeBotRoute(String(options.method).toUpperCase(), route);
};

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  if (url.hostname !== "discord.com") return realFetch(input, init);
  if (stats.enabled) {
    stats.discord += 1;
    stats.discordMs += DISCORD_DELAY_MS;
    discordLog.set(`OAUTH ${url.pathname}`, (discordLog.get(`OAUTH ${url.pathname}`) ?? 0) + 1);
  }
  await sleep(DISCORD_DELAY_MS);
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  if (url.pathname === "/api/v10/oauth2/token")
    return json(200, { access_token: "fake-access-token", refresh_token: "fake-refresh-token", token_type: "Bearer", expires_in: 604800, scope: "identify guilds guilds.members.read" });
  if (url.pathname === "/api/v10/users/@me") return json(200, { id: USER, username: "speedtester", global_name: "Speed Tester", avatar: null });
  if (url.pathname === "/api/v10/users/@me/guilds") return json(200, [{ id: GUILD, name: "Speed Test", icon: null, owner: true, permissions: "8" }]);
  if (url.pathname === `/api/v10/users/@me/guilds/${GUILD}/member`) return json(200, { user: { id: USER }, roles: [ROLE] });
  return json(404, { message: "Unknown" });
};

function fakeBotRoute(method, route) {
  const path = route.split("?")[0];
  if (method === "GET" && path === "/users/@me") return { id: BOT, username: "guildhall", bot: true };
  if (method === "GET" && path === "/users/@me/guilds") return [{ id: GUILD, name: "Speed Test", icon: null }];
  if (method === "GET" && path === `/guilds/${GUILD}`) return { id: GUILD, name: "Speed Test", icon: null, owner_id: USER, roles: [] };
  if (method === "GET" && path === `/guilds/${GUILD}/roles`)
    return [
      { id: GUILD, name: "@everyone", color: 0, position: 0, managed: false, permissions: "0" },
      { id: ROLE, name: "Staff", color: 0x5865f2, position: 1, managed: false, permissions: "8" },
    ];
  if (method === "GET" && path === `/guilds/${GUILD}/channels`)
    return [
      { id: "1400000000000000010", name: "Support", type: 4, position: 0 },
      { id: "1400000000000000011", name: "general", type: 0, position: 1, parent_id: null },
      { id: "1400000000000000012", name: "tickets", type: 0, position: 2, parent_id: "1400000000000000010" },
    ];
  if (method === "GET" && path.startsWith(`/guilds/${GUILD}/members/`))
    return { user: { id: path.split("/").pop(), username: "member" }, roles: [], nick: null };
  return method === "GET" ? [] : {};
}

// ---------------------------------------------------------------------------
// The real API composition.
const { createApiApplication } = await import(pathToFileURL(join(ROOT, "apps/api/dist/composition/ApiApplication.js")).href);

function application() {
  return createApiApplication({
    api: { environment: "development", host: "127.0.0.1", port, publicBaseUrl: BASE, logLevel: "error" },
    authentication: {
      discordClientId: BOT,
      discordClientSecret: "fake-secret",
      discordRedirectUri: `${BASE}/auth/discord/callback`,
      sessionHmacKey: KEYS.session,
      csrfHmacKey: KEYS.csrf,
      metadataHmacKey: KEYS.metadata,
      oauthEncryptionKey: KEYS.oauth,
      keyVersion: "1",
    },
    discord: { token: process.env.DISCORD_TOKEN, applicationId: BOT },
    databaseUrl: DATABASE_URL,
    portalDirectory: WEB_ROOT,
  });
}
const KEYS = { session: key(), csrf: key(), metadata: key(), oauth: key() };

const jar = new Map();
function cookieHeader() {
  return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
}
function storeCookies(response) {
  for (const line of response.headers.getSetCookie?.() ?? []) {
    const [pair, ...attributes] = line.split(";");
    const index = pair.indexOf("=");
    const name = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    const expired = attributes.some((attribute) => /max-age=0\b/i.test(attribute) || /expires=Thu, 01 Jan 1970/i.test(attribute));
    if (expired || value === "") jar.delete(name);
    else jar.set(name, value);
  }
}

/** Browser-style HTTP cache: ETag revalidation unless the response says no-store. */
const browserCache = new Map();

async function request(method, path, { body, cache = false } = {}) {
  const headers = { cookie: cookieHeader(), "accept-encoding": "gzip, br" };
  if (body !== undefined) {
    headers["content-type"] = "application/json";
    headers.origin = BASE;
    headers["x-csrf-token"] = jar.get("qbox_csrf") ?? "";
  }
  const cached = cache ? browserCache.get(path) : undefined;
  if (cached) headers["if-none-match"] = cached.etag;
  const beforeDb = stats.db;
  const beforeDiscord = stats.discord;
  const started = performance.now();
  const response = await realFetch(`${BASE}${path}`, { method, headers, redirect: "manual", ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const raw = Buffer.from(await response.arrayBuffer());
  const ms = performance.now() - started;
  storeCookies(response);
  const cacheControl = response.headers.get("cache-control") ?? "";
  const etag = response.headers.get("etag");
  if (cache && etag && response.status === 200 && !/no-store/.test(cacheControl)) browserCache.set(path, { etag });
  return {
    status: response.status,
    ms,
    db: stats.db - beforeDb,
    discord: stats.discord - beforeDiscord,
    bytes: Number(response.headers.get("content-length") ?? raw.length),
    encoding: response.headers.get("content-encoding") ?? "",
    headers: response.headers,
    text: () => raw.toString("utf8"),
  };
}

/** Heap of one API process: sampled while it runs, above the harness baseline taken just before it started. */
const heap = { firstBaseline: undefined, baseline: 0, peakAbove: 0, peakTotal: 0, peakRss: 0 };
const heapTimer = setInterval(() => {
  const usage = process.memoryUsage();
  heap.peakTotal = Math.max(heap.peakTotal, usage.heapUsed);
  heap.peakRss = Math.max(heap.peakRss, usage.rss);
  heap.peakAbove = Math.max(heap.peakAbove, usage.heapUsed - heap.baseline);
}, 10);

async function withApp(operation) {
  globalThis.gc?.();
  heap.baseline = process.memoryUsage().heapUsed;
  heap.firstBaseline ??= heap.baseline;
  const app = application();
  await app.start();
  await sleep(150); // let startup work (permission sync, builder recovery) finish
  stats.enabled = true;
  try {
    return await operation(app);
  } finally {
    stats.enabled = false;
    await app.shutdown();
  }
}

// ---------------------------------------------------------------------------
// Sign in through the real Discord callback and seed a few feature rows.
const TICKET_SETTING_KEYS = ["enabled", "mode", "openCategoryChannelId", "closedCategoryChannelId", "threadParentChannelId", "transcriptChannelId", "logChannelId", "supportRoleIds", "pingSupportOnOpen", "maxOpenPerUser", "nameTemplate", "openMessage", "embedColor", "allowUserClose", "requireCloseReason", "closeConfirmation", "closeAction", "deleteDelaySeconds", "claimEnabled", "claimRestrictsReplies", "transcriptsEnabled", "transcriptDmUser", "feedbackEnabled", "autoCloseHours", "autoCloseWarningHours", "autoCloseExcludeClaimed", "blockedUserIds", "blockedRoleIds"];
async function ticketSettingsBody() {
  const overview = JSON.parse((await request("GET", "/api/v1/tickets/overview")).text()).data;
  const settings = overview.settings;
  const body = Object.fromEntries(TICKET_SETTING_KEYS.filter((name) => settings[name] !== null && settings[name] !== undefined).map((name) => [name, settings[name]]));
  return { ...body, expectedRevision: settings.revision ?? 0 };
}

await withApp(async () => {
  const start = await request("GET", "/auth/discord/start");
  const state = new URL(start.headers.get("location")).searchParams.get("state");
  const callback = await request("GET", `/auth/discord/callback?code=fake-authorization-code-0000000000&state=${encodeURIComponent(state)}`);
  if (callback.status !== 302 || !jar.has("qbox_session")) throw new Error(`Sign-in failed (${callback.status} ${callback.headers.get("location")}).`);
  const me = await request("GET", "/api/v1/me");
  const guild = JSON.parse(me.text()).guild;
  if (guild?.id !== GUILD) throw new Error(`The test server was not selected: ${me.text()}`);
  for (const name of ["Support", "Billing", "Reports"]) {
    const created = await request("POST", "/api/v1/tickets/categories", { body: { name, supportRoleIds: [ROLE], alertUserIds: [] } });
    if (created.status !== 200 && created.status !== 409) throw new Error(`Seeding a ticket category failed: ${created.text()}`);
  }
  const saved = await request("PUT", "/api/v1/tickets/settings", { body: { ...(await ticketSettingsBody()), enabled: true } });
  if (saved.status !== 200) throw new Error(`Seeding ticket settings failed: ${saved.text()}`);
});

// ---------------------------------------------------------------------------
// Single requests, cold (fresh process) and warm (immediate repeat).
const ENDPOINTS = [
  ["GET", "/api/v1/me"],
  ["GET", "/api/v1/guilds"],
  ["GET", "/api/v1/directory"],
  ["GET", "/api/v1/tickets/overview"],
  ["GET", "/api/v1/tickets?status=open"],
  ["GET", "/api/v1/moderation/overview"],
  ["GET", "/api/v1/builder/overview"],
  ["GET", "/api/v1/music/overview"],
  ["PUT", "/api/v1/tickets/settings"],
  ["GET", "/js/app.js"],
];

const rows = [];

const only = process.env.MEASURE_ONLY;
for (const [method, path] of ENDPOINTS.filter(([method, path]) => !only || `${method} ${path}`.includes(only))) {
  await withApp(async () => {
    if (process.env.MEASURE_SQL) console.log(`${method} ${path}`);
    const run = async () => {
      if (method === "PUT") {
        stats.enabled = false;
        const body = await ticketSettingsBody();
        stats.enabled = true;
        return request(method, path, { body });
      }
      return request(method, path);
    };
    const cold = await run();
    const warm = await run();
    if (cold.status >= 400 || warm.status >= 400) console.error(`${method} ${path}: ${cold.status}/${warm.status} ${warm.text().slice(0, 200)}`);
    rows.push({ name: `${method} ${path}`, cold, warm });
  });
}

// ---------------------------------------------------------------------------
// Full page loads as the browser makes them.
//
// Mirrors apps/web/public: index.html, then styles.css, the modules index.html
// preloads, and the js/app.js module graph (each module's imports are
// requested once it arrives), then app.js boot (session.js refreshSession:
// health + /me), then the page's own requests in the order its load() makes
// them. At most 6 requests run at once per origin, as in an HTTP/1.1 browser.
// Keep these plans in step with the portal code.
const PAGE_PLANS = {
  overview: [[["GET", "/api/v1/tickets/overview"]]],
  // tickets.js load(): directory starts with overview + list.
  tickets: [
    [["GET", "/api/v1/tickets/overview"], ["GET", "/api/v1/tickets"], ["GET", "/api/v1/directory"]],
  ],
  // moderation.js load(): directory starts with overview + cases.
  moderation: [
    [["GET", "/api/v1/moderation/overview"], ["GET", "/api/v1/moderation/cases?limit=100"], ["GET", "/api/v1/directory"]],
  ],
  // builder.js load(): overview + runs, then the selected run and the wipe preview together.
  builder: [
    [["GET", "/api/v1/builder/overview"], ["GET", "/api/v1/builder/runs?limit=25"]],
    [["GET", "/api/v1/builder/wipe/preview"]],
  ],
  // music.js load(): everything at once.
  music: [
    [["GET", "/api/v1/music/overview"], ["GET", "/api/v1/music/library"], ["GET", "/api/v1/music/playlists"], ["GET", "/api/v1/directory"], ["GET", "/api/v1/music/state"]],
  ],
};
/** Boot requests in app.js/session.js order: groups run one after another. */
const BOOT_PLAN = [
  [["GET", "/health/live"], ["GET", "/health/ready"], ["GET", "/api/v1/me"]],
];

/**
 * The portal's request order before the speed work (commit 31d3850): no
 * module preloads, health before /me, and page data loaded in steps. Run with
 * PORTAL_PLAN=31d3850 against a build of that commit to reproduce the BEFORE table.
 */
const LEGACY = process.env.PORTAL_PLAN === "31d3850";
if (LEGACY) {
  Object.assign(PAGE_PLANS, {
    tickets: [
      [["GET", "/api/v1/tickets/overview"], ["GET", "/api/v1/tickets"]],
      [["GET", "/api/v1/directory"]],
    ],
    moderation: [
      [["GET", "/api/v1/moderation/overview"], ["GET", "/api/v1/moderation/cases?limit=100"]],
      [["GET", "/api/v1/directory"]],
    ],
    music: [
      [["GET", "/api/v1/music/overview"]],
      [["GET", "/api/v1/music/library"], ["GET", "/api/v1/music/playlists"], ["GET", "/api/v1/directory"]],
      [["GET", "/api/v1/music/state"]],
    ],
  });
  BOOT_PLAN.splice(0, BOOT_PLAN.length, [["GET", "/health/live"], ["GET", "/health/ready"]], [["GET", "/api/v1/me"]]);
}

function limiter(limit) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= limit || queue.length === 0) return;
    active += 1;
    const { task, done, fail } = queue.shift();
    task().then(done, fail).finally(() => {
      active -= 1;
      next();
    });
  };
  return (task) => new Promise((done, fail) => {
    queue.push({ task, done, fail });
    next();
  });
}

async function pageLoad(page) {
  const slot = limiter(6);
  const totals = { requests: 0, db: 0, discord: 0, bytes: 0, notModified: 0 };
  const count = (result) => {
    totals.requests += 1;
    totals.db += result.db;
    totals.discord += result.discord;
    totals.bytes += result.bytes;
    if (result.status === 304) totals.notModified += 1;
    return result;
  };
  const get = (path, options) => slot(() => request("GET", path, options)).then(count);
  const started = performance.now();
  const beforeDb = stats.db;
  const beforeDiscord = stats.discord;
  await get(page === "overview" ? "/" : `/${page}`, { cache: true });
  const seen = new Set();
  const loadModule = async (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    await get(`/${file}`, { cache: true });
    const source = readFileSync(join(WEB_ROOT, file), "utf8");
    const imports = [...source.matchAll(/^\s*import\s[^;]*?from\s+"(\.\/[^"]+)"/gms)].map((match) => join(dirname(file), match[1]));
    await Promise.all(imports.map(loadModule));
  };
  const preloads = LEGACY ? [] : [...readFileSync(join(WEB_ROOT, "index.html"), "utf8").matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map((match) => match[1]);
  await Promise.all([get("/styles.css", { cache: true }), loadModule("js/app.js"), ...preloads.map(loadModule)]);
  const staticMs = performance.now() - started;
  for (const group of [...BOOT_PLAN, ...PAGE_PLANS[page]]) await Promise.all(group.map(([, path]) => get(path)));
  return { ms: performance.now() - started, staticMs, ...totals, db: stats.db - beforeDb, discord: stats.discord - beforeDiscord };
}

const pageRows = [];
for (const page of Object.keys(PAGE_PLANS).filter((name) => !only || only === `page ${name}`)) {
  browserCache.clear();
  await withApp(async () => {
    const cold = await pageLoad(page);
    const warm = await pageLoad(page);
    pageRows.push({ page, cold, warm });
  });
}
clearInterval(heapTimer);

// ---------------------------------------------------------------------------
const pad = (value, width) => String(value).padStart(width);
const fmt = (ms) => `${Math.round(ms)}`;
console.log(`\nDB delay ${DB_DELAY_MS} ms per query, Discord delay ${DISCORD_DELAY_MS} ms per call.\n`);
console.log(`${"request".padEnd(36)} | ${pad("cold ms", 7)} ${pad("db", 4)} ${pad("dsc", 4)} | ${pad("warm ms", 7)} ${pad("db", 4)} ${pad("dsc", 4)} | status`);
console.log("-".repeat(90));
for (const { name, cold, warm } of rows)
  console.log(`${name.padEnd(36)} | ${pad(fmt(cold.ms), 7)} ${pad(cold.db, 4)} ${pad(cold.discord, 4)} | ${pad(fmt(warm.ms), 7)} ${pad(warm.db, 4)} ${pad(warm.discord, 4)} | ${cold.status}/${warm.status}${warm.encoding ? ` ${warm.encoding}` : ""}`);
console.log(`\n${"page load".padEnd(12)} | ${pad("cold ms", 7)} ${pad("static", 6)} ${pad("reqs", 4)} ${pad("db", 4)} ${pad("dsc", 4)} ${pad("KB", 5)} | ${pad("warm ms", 7)} ${pad("static", 6)} ${pad("304s", 4)} ${pad("db", 4)} ${pad("dsc", 4)} ${pad("KB", 5)}`);
console.log("-".repeat(96));
for (const { page, cold, warm } of pageRows)
  console.log(`${page.padEnd(12)} | ${pad(fmt(cold.ms), 7)} ${pad(fmt(cold.staticMs), 6)} ${pad(cold.requests, 4)} ${pad(cold.db, 4)} ${pad(cold.discord, 4)} ${pad(Math.round(cold.bytes / 1024), 5)} | ${pad(fmt(warm.ms), 7)} ${pad(fmt(warm.staticMs), 6)} ${pad(warm.notModified, 4)} ${pad(warm.db, 4)} ${pad(warm.discord, 4)} ${pad(Math.round(warm.bytes / 1024), 5)}`);
const mb = (bytes) => Math.round(bytes / 1024 / 1024);
console.log(`\nHeap estimate for one API process: ${mb(heap.firstBaseline + heap.peakAbove)} MB (code loaded before the first start, ${mb(heap.firstBaseline)} MB, plus the most one process added, ${mb(heap.peakAbove)} MB).`);
console.log(`Heap: one API process added at most ${mb(heap.peakAbove)} MB over the harness baseline; peak heap ${mb(heap.peakTotal)} MB, peak RSS ${mb(heap.peakRss)} MB for the whole harness process${globalThis.gc ? "" : " (run with node --expose-gc for a clean baseline)"}.`);
if (process.env.MEASURE_VERBOSE) console.log("\nDiscord calls:", Object.fromEntries(discordLog));

async function freePort() {
  return new Promise((done, fail) => {
    const server = createServer();
    server.once("error", fail);
    server.listen(0, "127.0.0.1", () => {
      const { port: chosen } = server.address();
      server.close(() => done(chosen));
    });
  });
}
