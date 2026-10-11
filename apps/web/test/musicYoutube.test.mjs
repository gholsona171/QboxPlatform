import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { youtubeCard, youtubeLength } from "../public/js/musicYoutube.js";

const video = { id: "dQw4w9WgXcQ", title: "Never Gonna Give You Up", channel: "Rick Astley", durationSeconds: 213, thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" };

test("the YouTube card is hidden when the host has no yt-dlp", () => {
  assert.equal(youtubeCard(false, undefined), "");
  assert.equal(youtubeCard(false, [video], "song"), "");
});

test("the YouTube card starts as a search box without results", () => {
  const html = youtubeCard(true, undefined);
  assert.match(html, /<h3>YouTube<\/h3>/);
  assert.match(html, /<form class="toolbar" data-mu-form="youtube-search">/);
  assert.match(html, /<input name="q"[^>]*maxlength="100"/);
  assert.equal(html.includes("data-mu-play"), false);
  assert.equal(html.includes("No videos found"), false);
});

test("YouTube results show title, channel and length with Play now and Add buttons", () => {
  const html = youtubeCard(true, [video, { id: "rFZHOHl-L8A", title: "lofi radio", channel: "Lofi Girl", durationSeconds: null }], "never gonna");
  assert.ok(html.includes("<strong>Never Gonna Give You Up</strong>"));
  assert.ok(html.includes("Rick Astley · 3:33"));
  assert.ok(html.includes("Lofi Girl · Live"));
  assert.ok(html.includes('value="never gonna"'));
  assert.deepEqual([...html.matchAll(/data-mu-play="([^"]+)" data-now="(true|false)">([^<]+)</g)].map((match) => match.slice(1)), [
    ["youtube:dQw4w9WgXcQ", "true", "Play now"],
    ["youtube:dQw4w9WgXcQ", "false", "Add"],
    ["youtube:rFZHOHl-L8A", "true", "Play now"],
    ["youtube:rFZHOHl-L8A", "false", "Add"],
  ]);
  // The portal's content policy blocks pictures from other sites, so thumbnails are not linked.
  assert.equal(html.includes("ytimg"), false);
  assert.match(youtubeCard(true, []), /No videos found/);
});

test("YouTube results escape text and skip anything without a valid video ID", () => {
  const html = youtubeCard(true, [
    { id: "dQw4w9WgXcQ", title: '<img src=x onerror="alert(1)">', channel: "A & B <b>", durationSeconds: 59 },
    { id: 'x" onclick="alert(1)', title: "Bad ID", durationSeconds: 10 },
    { id: "short", title: "Short ID", durationSeconds: 10 },
    null,
  ], '"><script>alert(1)</script>');
  assert.equal(html.includes("<img"), false);
  assert.equal(html.includes("<script>"), false);
  assert.equal(html.includes("onclick="), false);
  assert.ok(html.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"));
  assert.ok(html.includes("A &amp; B &lt;b&gt; · 0:59"));
  assert.equal(html.includes("Bad ID"), false);
  assert.equal(html.includes("Short ID"), false);
  assert.equal(html.match(/<li /g)?.length, 1);
});

test("lengths read as minutes, hours, or Live", () => {
  assert.equal(youtubeLength(5), "0:05");
  assert.equal(youtubeLength(213), "3:33");
  assert.equal(youtubeLength(22258), "6:10:58");
  for (const value of [null, undefined, 0, -3, Number.NaN, "213"]) assert.equal(youtubeLength(value), "Live");
});

test("the Music page wires the YouTube card to the search route and the play command", async () => {
  const music = await readFile(new URL("../public/js/music.js", import.meta.url), "utf8");
  assert.match(music, /import \{ youtubeCard \} from "\.\/musicYoutube\.js";/);
  assert.match(music, /"youtube-search": \["youtube", "youtubeResults"\]/);
  assert.match(music, /getJson\(`music\/\$\{path\}\/search\?q=\$\{encodeURIComponent\(query\)\}`\)/);
  assert.match(music, /youtubeCard\(youtube\(\), view\.youtubeResults, view\.youtubeQuery\)/);
  assert.match(music, /const youtube = \(\) => view\.overview\?\.youtube === true;/);
  // Result buttons carry data-mu-play, which the page sends as a play command (a CSRF-protected POST).
  assert.match(music, /\[data-mu-play\]"\)\.forEach\(\(button\) => button\.addEventListener\("click", \(\) => void command\(\{ action: "play", query: button\.dataset\.muPlay/);
  assert.match(music, /sendJson\("music\/command", "POST", body\)/);
});
