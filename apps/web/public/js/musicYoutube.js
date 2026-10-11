import { escapeHtml } from "./ui.js";

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/** "3:45", "1:02:03", or "Live" when YouTube gives no length. */
export function youtubeLength(seconds) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) return "Live";
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const rest = String(whole % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
}

function resultRow(video) {
  const play = `youtube:${video.id}`;
  return `<li class="music-item">
    <span></span><span class="music-cover small"><span aria-hidden="true">♪</span></span>
    <span class="meta"><strong>${escapeHtml(video.title)}</strong><small class="microcopy">${escapeHtml([video.channel, youtubeLength(video.durationSeconds)].filter(Boolean).join(" · "))}</small></span>
    <span class="music-actions"><button class="button compact" data-mu-play="${escapeHtml(play)}" data-now="true">Play now</button><button class="button compact" data-mu-play="${escapeHtml(play)}" data-now="false">Add</button></span>
  </li>`;
}

/**
 * The YouTube card on the Player tab: a search box and its results with
 * Play now and Add buttons. Empty when the host has no yt-dlp, so the card is
 * not shown at all. `results` is undefined until the first search.
 */
export function youtubeCard(available, results, query = "") {
  if (!available) return "";
  const videos = (results ?? []).filter((video) => video && VIDEO_ID.test(String(video.id)));
  const list = results === undefined
    ? `<p class="microcopy">Type a song name and press Search. In Discord, /music play with a song name plays the top result.</p>`
    : videos.length
      ? `<ul class="music-list music-results">${videos.map(resultRow).join("")}</ul>`
      : `<p class="microcopy">No videos found.</p>`;
  return `<div class="card">
    <h3>YouTube</h3>
    <form class="toolbar" data-mu-form="youtube-search"><input name="q" placeholder="Search YouTube for a song" maxlength="100" value="${escapeHtml(query)}" aria-label="Song name"><button class="button primary compact">Search</button></form>
    ${list}
  </div>`;
}
