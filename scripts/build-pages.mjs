/**
 * Builds the GitHub Pages preview of the portal.
 *
 * Copies `apps/web/public` into the output directory, rewrites `<base href>`
 * to the Pages base path, switches the portal into static hosting mode, and
 * records the live platform URL used for login links. `404.html` mirrors
 * `index.html` so client-side routes load on direct visits.
 *
 * Usage: BASE_PATH=/QboxPlatform QBOX_LIVE_URL=https://host node scripts/build-pages.mjs _site
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const output = resolve(process.argv[2] ?? "_site");
const source = resolve("apps/web/public");
const basePath = `${(process.env.BASE_PATH ?? "").replace(/\/+$/, "")}/`;
const liveUrl = (process.env.QBOX_LIVE_URL ?? "").trim();

if (liveUrl && !/^https:\/\/[^\s"<>]+$/.test(liveUrl)) {
  throw new Error("QBOX_LIVE_URL must be an https URL.");
}
if (!/^\/[A-Za-z0-9._\-/]*$/.test(basePath)) {
  throw new Error("BASE_PATH contains unsupported characters.");
}

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(source, output, { recursive: true });

const html = readFileSync(resolve(source, "index.html"), "utf8")
  .replace('<base href="/">', `<base href="${basePath}">`)
  .replace('<meta name="qbox-hosting" content="live">', '<meta name="qbox-hosting" content="static">')
  .replace('<meta name="qbox-live-url" content="">', `<meta name="qbox-live-url" content="${liveUrl}">`);

writeFileSync(resolve(output, "index.html"), html);
writeFileSync(resolve(output, "404.html"), html);
writeFileSync(resolve(output, ".nojekyll"), "");
console.log(`Portal preview built in ${output} (base ${basePath}).`);
