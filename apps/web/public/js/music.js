import { getJson, sendJson, uploadFile } from "./api.js";
import { appPath } from "./config.js";
import { bindPickers, boolValue, channelLabel, channelSelect, checkbox, intValue, loadDirectory, numberField, rolePicker, selectField, textField } from "./forms.js";
import { badge, confirmAction, escapeHtml, notify } from "./ui.js";
import { BRAND } from "./brand.js";

const TABS = [
  ["player", "Player"],
  ["library", "Library"],
  ["playlists", "Playlists"],
  ["radio", "Radio"],
  ["settings", "Settings"],
];
const AUDIO_TYPES = { mp3: "audio/mpeg", ogg: "audio/ogg", oga: "audio/ogg", opus: "audio/ogg", m4a: "audio/mp4", aac: "audio/aac", flac: "audio/flac", wav: "audio/wav" };
const SORTS = [["recent", "Recently added"], ["title", "Title"], ["artist", "Artist"]];
const GROUPS = [["none", "No grouping"], ["artist", "Group by artist"], ["album", "Group by album"]];
const LOOP_LABELS = { off: "Loop off", track: "Loop song", queue: "Loop queue" };
const SOURCE_LABELS = { library: "Library", link: "Link", radio: "Radio", jamendo: "Jamendo" };

const view = {
  tab: "player",
  overview: undefined,
  tracks: [],
  playlists: [],
  player: undefined,
  playerError: undefined,
  syncedAt: 0,
  error: undefined,
  filter: { query: "", sort: "recent", group: "none" },
  selected: new Set(),
  uploads: [],
  uploading: false,
  editingTrackId: undefined,
  openPlaylistId: undefined,
  addingToPlaylist: false,
  addQuery: "",
  radioResults: undefined,
  jamendoResults: undefined,
};
let container;
let tickTimer;
let syncTimer;

export async function renderMusicPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading music...</p></section>`;
  await load();
  render();
  startTimers();
}

async function load() {
  try {
    // Everything the page shows loads at the same time.
    const player = syncPlayer();
    const [overview, library, playlists] = await Promise.all([getJson("music/overview"), getJson("music/library"), getJson("music/playlists"), loadDirectory(), player]);
    view.overview = overview.data;
    view.tracks = library.data.tracks;
    view.playlists = playlists.data;
    view.error = undefined;
  } catch (error) {
    view.error = error;
  }
}

async function syncPlayer() {
  try {
    view.player = (await getJson("music/state")).data;
    view.playerError = undefined;
  } catch (error) {
    view.player = undefined;
    view.playerError = error.message;
  }
  view.syncedAt = Date.now();
}

function startTimers() {
  clearInterval(tickTimer);
  clearInterval(syncTimer);
  tickTimer = setInterval(() => {
    if (!container?.isConnected) return clearInterval(tickTimer);
    updateProgress();
  }, 1000);
  syncTimer = setInterval(async () => {
    if (!container?.isConnected) return clearInterval(syncTimer);
    if (document.hidden || view.tab !== "player") return;
    await syncPlayer();
    renderPlayerPanel();
  }, 5000);
}

/* ---------- Helpers ---------- */

const manager = () => view.overview?.canManage === true;

function fmt(seconds) {
  const whole = Math.max(0, Math.floor(seconds ?? 0));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const rest = String(whole % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
}

function bytes(value) {
  if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(1)} GB`;
  if (value >= 1024 ** 2) return `${(value / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.ceil(value / 1024)} KB`;
}

function trackCover(trackId) {
  return appPath(`/api/v1/music/library/${encodeURIComponent(trackId)}/cover`);
}

/** Only library covers are shown: the portal's content policy blocks pictures from other sites. */
function entryCover(entry) {
  return entry?.source === "library" && entry.coverPath && entry.ref ? trackCover(entry.ref) : undefined;
}

function cover(url, size = "") {
  return `<span class="music-cover ${size}"><span aria-hidden="true">♪</span>${url ? `<img alt="" loading="lazy" src="${escapeHtml(url)}">` : ""}</span>`;
}

function position() {
  const player = view.player;
  if (!player) return 0;
  const moved = player.state === "playing" ? (Date.now() - view.syncedAt) / 1000 : 0;
  const at = player.positionSeconds + moved;
  return player.durationSeconds ? Math.min(at, player.durationSeconds) : at;
}

function trackLine(track) {
  return [track.artist, track.album].filter(Boolean).join(" · ");
}

async function command(body, quiet = false) {
  try {
    const result = (await sendJson("music/command", "POST", body)).data;
    view.player = result.state;
    view.playerError = undefined;
    view.syncedAt = Date.now();
    if (!quiet) notify(result.message.replaceAll("**", ""));
    if (view.tab === "player") renderPlayerPanel();
    return true;
  } catch (error) {
    notify(error.message || "That did not work.", "error");
    return false;
  }
}

async function run(message, operation) {
  try {
    const result = await operation();
    if (message) notify(typeof message === "function" ? message(result) : message);
    await load();
    render();
  } catch (error) {
    notify(error.message || "That did not work.", "error");
  }
}

/* ---------- Page ---------- */

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    const denied = view.error.status === 403;
    container.innerHTML = `<section class="card"><h2>${denied ? "You don't have access to music" : "Music is unavailable"}</h2><p class="microcopy">${denied ? "Ask a server admin for the Play music (music.dj) or Manage music (music.manage) permission." : escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  const settings = view.overview.settings;
  if (!settings.enabled) {
    container.innerHTML = setupCard();
    bind();
    return;
  }
  const tabs = TABS.filter(([id]) => id !== "settings" || manager());
  if (!tabs.some(([id]) => id === view.tab)) view.tab = "player";
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Music sections">${tabs.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-mu-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    ${view.overview.ffmpeg ? "" : `<p class="music-warning">Music needs ffmpeg on the host. Ask whoever runs ${BRAND.name} to run <code>sudo apt-get install -y ffmpeg</code>.</p>`}
    <div>${view.tab === "library" ? libraryTab() : view.tab === "playlists" ? playlistsTab() : view.tab === "radio" ? radioTab() : view.tab === "settings" ? settingsTab() : playerTab()}</div>
  </section>`;
  bind();
}

function sourcesNote() {
  return `Music plays songs you upload, your playlists, direct links to audio files, and internet radio. Spotify, Apple Music and YouTube do not allow bots to play their music, so they are not supported (Discord's Listen Along works for Spotify).`;
}

function secondBotNote() {
  const overview = view.overview;
  if (!overview.secondBot) return `<p class="microcopy">Optional: a second bot account can play the music so ${BRAND.name} itself never sits in voice. See the Music guide.</p>`;
  if (overview.secondBotInGuild) return `<p class="microcopy">The music bot is in this server and plays the music.</p>`;
  return `<p class="microcopy">The music bot is not in this server yet. ${overview.secondBotInviteUrl ? `<a href="${escapeHtml(overview.secondBotInviteUrl)}" target="_blank" rel="noopener">Invite the music bot</a>.` : "Check MUSIC_BOT_TOKEN on the host."}</p>`;
}

function setupCard() {
  if (!manager()) return `<section class="card"><div class="empty-state"><h3>Music is off</h3><p>Ask a server manager to turn it on.</p></div></section>`;
  const settings = view.overview.settings;
  return `<section class="card"><form class="form-grid readable-form" data-mu-form="setup">
    <h2>Play music in voice channels</h2>
    <p class="full">${escapeHtml(sourcesNote())}</p>
    ${view.overview.ffmpeg ? "" : `<p class="full music-warning">Music needs ffmpeg on the host: <code>sudo apt-get install -y ffmpeg</code></p>`}
    ${channelSelect("homeChannelId", "Home voice channel (where the bot joins by default)", settings.homeChannelId, "VOICE", "None")}
    ${channelSelect("announceChannelId", "Now-playing messages go to", settings.announceChannelId, "TEXT", "The channel of the last command")}
    <div class="full">${secondBotNote()}</div>
    <button class="button primary full">Turn on music</button>
  </form></section>`;
}

/* ---------- Player ---------- */

function playerTab() {
  const channel = view.player?.channelId || view.overview.settings.homeChannelId || "";
  return `<div class="grid">
    <div data-mu-player>${playerPanel()}</div>
    <div class="card">
      <h3>Add to the queue</h3>
      <div class="toolbar">
        <input data-mu-add placeholder="Search your library, playlists and stations, or paste a direct audio link" value="${escapeHtml(view.addQuery)}" aria-label="Song, playlist, station or link">
        <button class="button primary compact" data-mu-action="add-typed" data-now="false">Add</button>
        <button class="button compact" data-mu-action="add-typed" data-now="true">Play now</button>
      </div>
      <div class="music-results" data-mu-add-results>${addResults()}</div>
    </div>
    <div class="card">
      <h3>Voice channel</h3>
      <div class="toolbar">
        ${channelSelect("voiceChannel", "Channel", channel, "VOICE", "Choose a voice channel")}
        <button class="button compact" data-mu-action="join">Join</button>
        <button class="button compact" data-mu-action="leave">Leave</button>
      </div>
    </div>
  </div>`;
}

function playerPanel() {
  if (view.playerError) return `<div class="card"><div class="empty-state"><h3>The player is not reachable</h3><p>${escapeHtml(view.playerError)}</p></div></div>`;
  const player = view.player;
  if (!player) return `<div class="card"><p class="microcopy">Loading the player...</p></div>`;
  const current = player.current;
  const live = player.live;
  const percent = current && player.durationSeconds ? Math.min(100, (position() / player.durationSeconds) * 100) : live ? 100 : 0;
  const state = player.state === "playing" ? badge("playing") : player.state === "paused" ? `<span class="badge warning">paused</span>` : player.state === "buffering" ? `<span class="badge warning">loading</span>` : `<span class="badge">idle</span>`;
  return `<div class="card">
    <div class="music-now">
      ${cover(entryCover(current), "large")}
      <div class="music-now-text">
        <div class="split-line"><span>${current ? badge(SOURCE_LABELS[current.source] ?? current.source) : ""} ${state}</span><small class="microcopy">${player.connected ? `In ${escapeHtml(channelLabel(player.channelId))}` : "Not in voice"}</small></div>
        <h2>${current ? escapeHtml(current.title) : "Nothing is playing"}</h2>
        <p class="microcopy">${current ? escapeHtml([current.artist, current.album].filter(Boolean).join(" · ")) || "&nbsp;" : "Add something below, or use /music play in Discord."}</p>
        <div class="music-progress ${live || !current ? "live" : ""}" data-mu-seek role="slider" aria-label="Song position" aria-valuemin="0" aria-valuemax="${player.durationSeconds ?? 0}" aria-valuenow="${Math.floor(position())}"><span data-mu-bar style="width:${percent}%"></span></div>
        <div class="music-times"><span data-mu-time>${live ? "LIVE" : fmt(position())}</span><span>${live ? "" : player.durationSeconds ? fmt(player.durationSeconds) : current ? "?:??" : "0:00"}</span></div>
      </div>
    </div>
    <div class="music-controls">
      <button class="button" data-mu-cmd="previous" title="Previous" aria-label="Previous">⏮</button>
      <button class="button" data-mu-cmd="rewind" title="Back 10 seconds" aria-label="Back 10 seconds" ${live ? "disabled" : ""}>⏪ 10</button>
      <button class="button primary" data-mu-cmd="toggle" title="Play or pause" aria-label="Play or pause">${player.state === "playing" ? "⏸" : "▶"}</button>
      <button class="button" data-mu-cmd="forward" title="Forward 10 seconds" aria-label="Forward 10 seconds" ${live ? "disabled" : ""}>10 ⏩</button>
      <button class="button" data-mu-cmd="skip" title="Next" aria-label="Next">⏭</button>
      <button class="button danger" data-mu-cmd="stop" title="Stop and clear" aria-label="Stop">⏹</button>
      <button class="button ${player.loop === "off" ? "" : "primary"}" data-mu-cmd="loop" title="Loop">${escapeHtml(LOOP_LABELS[player.loop])}</button>
      <button class="button ${player.shuffle ? "primary" : ""}" data-mu-cmd="shuffle" title="Shuffle">Shuffle ${player.shuffle ? "on" : "off"}</button>
      <label class="music-volume">Volume <input type="range" min="0" max="200" step="5" value="${player.volume}" data-mu-volume aria-label="Volume"> <span data-mu-volume-label>${player.volume}%</span></label>
    </div>
    ${player.lastError ? `<p class="microcopy">Last problem: ${escapeHtml(player.lastError)}</p>` : ""}
    ${queueList(player)}
  </div>`;
}

function queueList(player) {
  if (!player.queue.length) return `<div class="empty-state">The queue is empty.</div>`;
  const rows = player.queue.map((entry, at) => {
    const current = at === player.index;
    const length = entry.durationSeconds === null ? "live" : fmt(entry.durationSeconds);
    return `<li class="music-item ${current ? "current" : at < player.index ? "played" : ""}">
      <span class="microcopy">${at + 1}</span>
      ${cover(entryCover(entry), "small")}
      <span class="meta"><strong>${escapeHtml(entry.title)}</strong><small class="microcopy">${escapeHtml([entry.artist, length].filter(Boolean).join(" · "))}</small></span>
      <span class="music-actions">
        ${current ? "" : `<button class="button compact" data-mu-cmd="jump" data-position="${at + 1}" title="Play this" aria-label="Play this">▶</button>`}
        <button class="button compact" data-mu-cmd="move" data-from="${at + 1}" data-to="${at}" ${at === 0 ? "disabled" : ""} title="Move up" aria-label="Move up">↑</button>
        <button class="button compact" data-mu-cmd="move" data-from="${at + 1}" data-to="${at + 2}" ${at === player.queue.length - 1 ? "disabled" : ""} title="Move down" aria-label="Move down">↓</button>
        ${current ? "" : `<button class="button compact danger" data-mu-cmd="remove" data-position="${at + 1}" title="Remove" aria-label="Remove">✕</button>`}
      </span>
    </li>`;
  });
  return `<div class="split-line"><h3>Queue</h3><button class="button compact" data-mu-cmd="clear">Clear upcoming</button></div><ol class="music-list">${rows.join("")}</ol>`;
}

function addResults() {
  const query = view.addQuery.trim().toLowerCase();
  if (!query) return `<p class="microcopy">Type to search. Links must point straight at an audio file or stream.</p>`;
  if (/^https?:\/\//.test(query)) return `<p class="microcopy">Press Add to play this link.</p>`;
  const matches = (text) => text.toLowerCase().includes(query);
  const results = [
    ...view.playlists.filter((playlist) => matches(playlist.name)).map((playlist) => ({ query: `playlist:${playlist.id}`, title: playlist.name, detail: `Playlist · ${playlist.trackIds.length} songs`, image: playlist.coverTrackId ? trackCover(playlist.coverTrackId) : undefined })),
    ...view.overview.stations.filter((station) => matches(station.name)).map((station) => ({ query: `station:${station.id}`, title: station.name, detail: "Radio", image: undefined })),
    ...view.tracks.filter((track) => matches(`${track.title} ${track.artist ?? ""} ${track.album ?? ""}`)).map((track) => ({ query: `library:${track.id}`, title: track.title, detail: trackLine(track) || "Library", image: track.coverFileName ? trackCover(track.id) : undefined })),
  ].slice(0, 20);
  if (!results.length) return `<p class="microcopy">Nothing matches. Upload songs in Library, or paste a direct audio link.</p>`;
  return `<ul class="music-list">${results.map((item) => `<li class="music-item">
    <span></span>${cover(item.image, "small")}
    <span class="meta"><strong>${escapeHtml(item.title)}</strong><small class="microcopy">${escapeHtml(item.detail)}</small></span>
    <span class="music-actions"><button class="button compact" data-mu-play="${escapeHtml(item.query)}" data-now="false">Add</button><button class="button compact" data-mu-play="${escapeHtml(item.query)}" data-now="true">Play now</button></span>
  </li>`).join("")}</ul>`;
}

function renderPlayerPanel() {
  const panel = container?.querySelector("[data-mu-player]");
  if (!panel) return;
  panel.innerHTML = playerPanel();
  bindPlayer(panel);
}

function updateProgress() {
  const player = view.player;
  if (!player || view.tab !== "player" || player.state !== "playing" || player.live) return;
  const bar = container.querySelector("[data-mu-bar]");
  const time = container.querySelector("[data-mu-time]");
  const at = position();
  if (bar && player.durationSeconds) bar.style.width = `${Math.min(100, (at / player.durationSeconds) * 100)}%`;
  if (time) time.textContent = fmt(at);
}

/* ---------- Library ---------- */

function filteredTracks() {
  const query = view.filter.query.trim().toLowerCase();
  const tracks = view.tracks.filter((track) => !query || `${track.title} ${track.artist ?? ""} ${track.album ?? ""}`.toLowerCase().includes(query));
  const by = (key) => (left, right) => (left[key] ?? "").localeCompare(right[key] ?? "", undefined, { sensitivity: "base" });
  if (view.filter.sort === "title") tracks.sort(by("title"));
  if (view.filter.sort === "artist") tracks.sort((left, right) => by("artist")(left, right) || by("album")(left, right) || (left.trackNumber ?? 0) - (right.trackNumber ?? 0) || by("title")(left, right));
  return tracks;
}

function libraryTab() {
  const library = view.overview.library;
  const used = Math.min(100, (library.bytes / library.quotaBytes) * 100);
  const tracks = filteredTracks();
  const groups = new Map();
  for (const track of tracks) {
    const key = view.filter.group === "artist" ? track.artist || "Unknown artist" : view.filter.group === "album" ? track.album || "No album" : "";
    groups.set(key, [...(groups.get(key) ?? []), track]);
  }
  const selected = view.selected.size;
  return `<div class="grid">
    ${manager() ? uploadCard() : ""}
    <div class="music-quota"><div class="split-line"><small class="microcopy">${library.tracks} song${library.tracks === 1 ? "" : "s"} · ${bytes(library.bytes)} of ${bytes(library.quotaBytes)} used</small></div><progress max="100" value="${used.toFixed(1)}" aria-label="Library space used"></progress></div>
    <div class="toolbar">
      <input data-mu-filter="query" placeholder="Search title, artist or album" value="${escapeHtml(view.filter.query)}" aria-label="Search the library">
      <select data-mu-filter="sort" aria-label="Sort">${SORTS.map(([id, label]) => `<option value="${id}" ${view.filter.sort === id ? "selected" : ""}>${label}</option>`).join("")}</select>
      <select data-mu-filter="group" aria-label="Group">${GROUPS.map(([id, label]) => `<option value="${id}" ${view.filter.group === id ? "selected" : ""}>${label}</option>`).join("")}</select>
    </div>
    <div class="toolbar">
      <label class="music-check"><input type="checkbox" data-mu-select-all ${tracks.length && tracks.every((track) => view.selected.has(track.id)) ? "checked" : ""}> Select all shown</label>
      <span class="microcopy">${selected} selected</span>
      <button class="button compact" data-mu-action="queue-selected" ${selected ? "" : "disabled"}>Add to queue</button>
      ${manager() && view.playlists.length ? `<select data-mu-playlist-target aria-label="Playlist"><option value="">Add to playlist...</option>${view.playlists.map((playlist) => `<option value="${escapeHtml(playlist.id)}">${escapeHtml(playlist.name)}</option>`).join("")}</select>` : ""}
      ${manager() ? `<button class="button compact danger" data-mu-action="delete-selected" ${selected ? "" : "disabled"}>Delete</button>` : ""}
    </div>
    ${tracks.length ? [...groups.entries()].map(([name, items]) => `${name ? `<div class="music-group">${escapeHtml(name)} · ${items.length}</div>` : ""}<ul class="music-list">${items.map(trackRow).join("")}</ul>`).join("") : `<div class="empty-state">${view.tracks.length ? "No songs match." : manager() ? "No songs yet. Drop audio files above to start your library." : "No songs yet. A manager can upload some."}</div>`}
  </div>`;
}

function uploadCard() {
  return `<div class="card">
    <h3>Upload songs</h3>
    <label class="music-drop" data-mu-drop>
      <input type="file" multiple accept=".mp3,.ogg,.oga,.opus,.m4a,.aac,.flac,.wav,audio/*" data-mu-files hidden>
      <strong>Drop audio files here</strong> or click to choose. mp3, ogg, opus, m4a, aac, flac or wav, up to 50 MB each.
    </label>
    ${view.uploads.length ? `<div class="music-list">${view.uploads.map(uploadRow).join("")}</div>` : ""}
  </div>`;
}

function uploadRow(upload, at) {
  const status = upload.status === "done" ? `<span class="badge success">added</span>` : upload.status === "duplicate" ? `<span class="badge info">already in your library</span>` : upload.status === "failed" ? `<span class="badge danger">failed</span>` : upload.status === "uploading" ? `<span class="badge warning">uploading</span>` : `<span class="badge">waiting</span>`;
  return `<div class="music-upload" data-mu-upload="${at}">
    <span class="meta"><strong>${escapeHtml(upload.name)}</strong>${upload.message ? `<small class="microcopy"> ${escapeHtml(upload.message)}</small>` : ""}</span>
    <progress max="100" value="${Math.round(upload.progress * 100)}"></progress>
    ${status}
  </div>`;
}

function trackRow(track) {
  if (view.editingTrackId === track.id) {
    return `<li class="music-item"><form class="form-grid full" data-mu-form="track" data-id="${escapeHtml(track.id)}" style="grid-column:1/-1">
      ${textField("title", "Title", track.title, "", true)}
      ${textField("artist", "Artist", track.artist ?? "")}
      ${textField("album", "Album", track.album ?? "")}
      <div class="toolbar full"><button class="button primary compact">Save</button><button type="button" class="button compact" data-mu-action="cancel-edit">Cancel</button></div>
    </form></li>`;
  }
  const details = [track.artist, track.album, track.durationSeconds ? fmt(track.durationSeconds) : undefined, bytes(track.sizeBytes)].filter(Boolean).join(" · ");
  return `<li class="music-item">
    <input type="checkbox" data-mu-select="${escapeHtml(track.id)}" ${view.selected.has(track.id) ? "checked" : ""} aria-label="Select ${escapeHtml(track.title)}">
    ${cover(track.coverFileName ? trackCover(track.id) : undefined, "small")}
    <span class="meta"><strong>${escapeHtml(track.title)}</strong><small class="microcopy">${escapeHtml(details)}</small></span>
    <span class="music-actions">
      <button class="button compact" data-mu-play="library:${escapeHtml(track.id)}" data-now="true">Play now</button>
      <button class="button compact" data-mu-play="library:${escapeHtml(track.id)}" data-now="false">Add to queue</button>
      ${manager() ? `<button class="button compact" data-mu-action="edit-track" data-value="${escapeHtml(track.id)}">Edit</button><button class="button compact danger" data-mu-action="delete-track" data-value="${escapeHtml(track.id)}">Delete</button>` : ""}
    </span>
  </li>`;
}

/* ---------- Playlists ---------- */

function playlistsTab() {
  const open = view.playlists.find((playlist) => playlist.id === view.openPlaylistId);
  if (open) return playlistDetail(open);
  return `<div class="grid">
    ${manager() ? `<form class="toolbar" data-mu-form="new-playlist"><input name="name" placeholder="New playlist name" maxlength="100" required aria-label="Playlist name"><button class="button primary compact">Create playlist</button></form>` : ""}
    ${view.playlists.length ? `<ul class="music-list">${view.playlists.map((playlist) => `<li class="music-item">
      <span></span>${cover(playlist.coverTrackId ? trackCover(playlist.coverTrackId) : undefined, "small")}
      <span class="meta"><strong>${escapeHtml(playlist.name)}</strong><small class="microcopy">${playlist.trackIds.length} song${playlist.trackIds.length === 1 ? "" : "s"} · ${fmt(playlist.durationSeconds)}${playlist.description ? ` · ${escapeHtml(playlist.description)}` : ""}</small></span>
      <span class="music-actions">${playlistButtons(playlist)}<button class="button compact" data-mu-action="open-playlist" data-value="${escapeHtml(playlist.id)}">Open</button></span>
    </li>`).join("")}</ul>` : `<div class="empty-state">No playlists yet.${manager() ? " Create one above, then add songs from your library." : ""}</div>`}
  </div>`;
}

function playlistButtons(playlist) {
  const disabled = playlist.trackIds.length ? "" : "disabled";
  return `<button class="button compact" data-mu-playlist="${escapeHtml(playlist.id)}" data-mode="play" ${disabled}>Play</button>
    <button class="button compact" data-mu-playlist="${escapeHtml(playlist.id)}" data-mode="shuffle" ${disabled}>Shuffle play</button>
    <button class="button compact" data-mu-playlist="${escapeHtml(playlist.id)}" data-mode="queue" ${disabled}>Add to queue</button>`;
}

function playlistDetail(playlist) {
  const rows = playlist.tracks.map((track, at) => `<li class="music-item">
    <span class="microcopy">${at + 1}</span>${cover(track.coverFileName ? trackCover(track.id) : undefined, "small")}
    <span class="meta"><strong>${escapeHtml(track.title)}</strong><small class="microcopy">${escapeHtml(trackLine(track))}</small></span>
    <span class="music-actions">
      <button class="button compact" data-mu-play="library:${escapeHtml(track.id)}" data-now="true">Play now</button>
      ${manager() ? `<button class="button compact" data-mu-reorder="${at}" data-to="${at - 1}" ${at === 0 ? "disabled" : ""} aria-label="Move up">↑</button>
      <button class="button compact" data-mu-reorder="${at}" data-to="${at + 1}" ${at === playlist.tracks.length - 1 ? "disabled" : ""} aria-label="Move down">↓</button>
      <button class="button compact danger" data-mu-reorder="${at}" data-to="remove" aria-label="Remove from playlist">✕</button>` : ""}
    </span>
  </li>`);
  return `<div class="grid">
    <div class="split-line"><button class="button compact" data-mu-action="close-playlist">← All playlists</button><span class="toolbar">${playlistButtons(playlist)}</span></div>
    <div class="music-now">${cover(playlist.coverTrackId ? trackCover(playlist.coverTrackId) : undefined, "large")}<div><h2>${escapeHtml(playlist.name)}</h2><p class="microcopy">${playlist.tracks.length} songs · ${fmt(playlist.durationSeconds)}</p>${playlist.description ? `<p>${escapeHtml(playlist.description)}</p>` : ""}</div></div>
    ${manager() ? `<form class="form-grid readable-form" data-mu-form="playlist" data-id="${escapeHtml(playlist.id)}">
      ${textField("name", "Name", playlist.name, "", true)}
      ${textField("description", "Description", playlist.description ?? "")}
      <div class="toolbar full"><button class="button compact primary">Save</button><button type="button" class="button compact" data-mu-action="toggle-add-songs">${view.addingToPlaylist ? "Done adding" : "Add songs"}</button><button type="button" class="button compact danger" data-mu-action="delete-playlist" data-value="${escapeHtml(playlist.id)}">Delete playlist</button></div>
    </form>` : ""}
    ${view.addingToPlaylist ? addSongsPicker(playlist) : ""}
    ${rows.length ? `<ol class="music-list">${rows.join("")}</ol>` : `<div class="empty-state">This playlist is empty.${manager() ? " Use Add songs." : ""}</div>`}
  </div>`;
}

function addSongsPicker(playlist) {
  const available = filteredTracks().filter((track) => !playlist.trackIds.includes(track.id));
  return `<div class="card">
    <div class="toolbar"><input data-mu-filter="query" placeholder="Search your library" value="${escapeHtml(view.filter.query)}" aria-label="Search the library"><button class="button primary compact" data-mu-action="add-selected-to-open" ${view.selected.size ? "" : "disabled"}>Add ${view.selected.size || ""} selected</button></div>
    ${available.length ? `<ul class="music-list music-results">${available.map((track) => `<li class="music-item"><input type="checkbox" data-mu-select="${escapeHtml(track.id)}" ${view.selected.has(track.id) ? "checked" : ""} aria-label="Select ${escapeHtml(track.title)}">${cover(track.coverFileName ? trackCover(track.id) : undefined, "small")}<span class="meta"><strong>${escapeHtml(track.title)}</strong><small class="microcopy">${escapeHtml(trackLine(track))}</small></span><span></span></li>`).join("")}</ul>` : `<p class="microcopy">Every matching song is already on this playlist.</p>`}
  </div>`;
}

/* ---------- Radio ---------- */

function radioTab() {
  const stations = view.overview.stations;
  const results = view.radioResults;
  return `<div class="grid">
    <div class="card">
      <h3>Internet radio</h3>
      <form class="toolbar" data-mu-form="radio-search"><input name="q" placeholder="Search stations, for example lofi or jazz" maxlength="100" aria-label="Station name"><button class="button primary compact">Search</button></form>
      ${results === undefined ? `<p class="microcopy">Stations come from the free Radio Browser directory.</p>` : results.length ? `<ul class="music-list music-results">${results.map((station, at) => `<li class="music-item">
        <span></span>${cover(undefined, "small")}
        <span class="meta"><strong>${escapeHtml(station.name)}</strong><small class="microcopy">${escapeHtml([station.country, station.codec, station.bitrate ? `${station.bitrate} kbps` : "", station.tags.slice(0, 3).join(", ")].filter(Boolean).join(" · "))}</small></span>
        <span class="music-actions"><button class="button compact" data-mu-radio="${at}" data-mode="play">Play</button>${manager() ? `<button class="button compact" data-mu-radio="${at}" data-mode="save">Save</button>` : ""}</span>
      </li>`).join("")}</ul>` : `<p class="microcopy">No stations found.</p>`}
    </div>
    <div class="card">
      <h3>Saved stations</h3>
      ${stations.length ? `<ul class="music-list">${stations.map((station) => `<li class="music-item">
        <span></span>${cover(undefined, "small")}
        <span class="meta"><strong>${escapeHtml(station.name)}</strong><small class="microcopy">${escapeHtml(station.tags.join(", "))}</small></span>
        <span class="music-actions"><button class="button compact" data-mu-play="station:${escapeHtml(station.id)}" data-now="true">Play</button>${manager() ? `<button class="button compact danger" data-mu-action="delete-station" data-value="${escapeHtml(station.id)}">Remove</button>` : ""}</span>
      </li>`).join("")}</ul>` : `<div class="empty-state">No saved stations yet. Search above and press Save.</div>`}
    </div>
    <div class="card">
      <h3>Free music from Jamendo</h3>
      ${view.overview.jamendo ? jamendoSection() : `<p class="microcopy">Jamendo search is off. The host can add a JAMENDO_CLIENT_ID to search free Creative Commons music.</p>`}
    </div>
  </div>`;
}

function jamendoSection() {
  const results = view.jamendoResults;
  return `<form class="toolbar" data-mu-form="jamendo-search"><input name="q" placeholder="Search Creative Commons songs" maxlength="100" aria-label="Song or artist"><button class="button primary compact">Search</button></form>
    ${results === undefined ? "" : results.length ? `<ul class="music-list music-results">${results.map((track) => `<li class="music-item">
      <span></span>${cover(undefined, "small")}
      <span class="meta"><strong>${escapeHtml(track.title)}</strong><small class="microcopy">${escapeHtml([track.artist, track.album, fmt(track.durationSeconds)].filter(Boolean).join(" · "))}</small></span>
      <span class="music-actions"><button class="button compact" data-mu-play="jamendo:${escapeHtml(track.id)}" data-now="true">Play now</button><button class="button compact" data-mu-play="jamendo:${escapeHtml(track.id)}" data-now="false">Add</button></span>
    </li>`).join("")}</ul>` : `<p class="microcopy">No songs found.</p>`}`;
}

/* ---------- Settings ---------- */

function settingsTab() {
  const s = view.overview.settings;
  const stations = [["", "None (stay quiet)"], ...view.overview.stations.map((station) => [station.id, station.name])];
  return `<form class="form-grid readable-form" data-mu-form="settings">
    <h3>Music settings</h3>
    <p class="microcopy full">${escapeHtml(sourcesNote())}</p>
    ${checkbox("enabled", "Music is on", s.enabled)}
    ${rolePicker("djRoleIds", "DJ roles", s.djRoleIds, "People with these roles can control the music. Leave empty to let everyone in the bot's voice channel control it. Managers always can.")}
    ${numberField("defaultVolume", "Starting volume (0-200)", s.defaultVolume, 0, 200)}
    ${numberField("maxQueue", "Songs the queue can hold", s.maxQueue, 1, 500)}
    ${channelSelect("announceChannelId", "Now-playing messages go to", s.announceChannelId, "TEXT", "The channel of the last command")}
    ${checkbox("nowPlayingPanel", "Keep one now-playing panel with buttons (instead of a new message per song)", s.nowPlayingPanel)}
    ${numberField("autoLeaveMinutes", "Leave after this many minutes alone or idle (0 = never)", s.autoLeaveMinutes, 0, 1440)}
    ${checkbox("stayConnected247", "24/7: stay in the home channel, even when nobody listens", s.stayConnected247)}
    ${channelSelect("homeChannelId", "Home voice channel", s.homeChannelId, "VOICE", "None")}
    ${selectField("idleRadioStationId", "When the queue ends, play this station", stations, s.idleRadioStationId ?? "")}
    <p class="microcopy full">Tip: 24/7 with an idle station makes a server radio that is always on.</p>
    <div class="full">${secondBotNote()}</div>
    <button class="button primary full">Save settings</button>
  </form>`;
}

function settingsPayload(form, overrides = {}) {
  const data = new FormData(form);
  const current = view.overview.settings;
  const text = (name) => String(data.get(name) ?? "").trim();
  const has = (name) => form.elements[name] !== undefined;
  const optional = (name) => {
    const value = has(name) ? text(name) : current[name] ?? "";
    return value ? { [name]: value } : {};
  };
  return {
    enabled: has("enabled") ? boolValue(form, "enabled") : current.enabled,
    djRoleIds: has("djRoleIds") || form.querySelector('[data-name="djRoleIds"]') ? data.getAll("djRoleIds").map(String) : current.djRoleIds,
    defaultVolume: has("defaultVolume") ? intValue(data, "defaultVolume", 60) : current.defaultVolume,
    maxQueue: has("maxQueue") ? intValue(data, "maxQueue", 100) : current.maxQueue,
    ...optional("announceChannelId"),
    nowPlayingPanel: has("nowPlayingPanel") ? boolValue(form, "nowPlayingPanel") : current.nowPlayingPanel,
    stayConnected247: has("stayConnected247") ? boolValue(form, "stayConnected247") : current.stayConnected247,
    ...optional("homeChannelId"),
    autoLeaveMinutes: has("autoLeaveMinutes") ? intValue(data, "autoLeaveMinutes", 5) : current.autoLeaveMinutes,
    ...optional("idleRadioStationId"),
    expectedRevision: current.revision,
    ...overrides,
  };
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-mu-tab]").forEach((button) => button.addEventListener("click", async () => {
    view.tab = button.dataset.muTab;
    history.replaceState({}, "", appPath(`/music?tab=${view.tab}`));
    if (view.tab === "player") await syncPlayer();
    render();
  }));
  container.querySelectorAll("form[data-mu-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form);
  }));
  container.querySelectorAll("[data-mu-action]").forEach((button) => button.addEventListener("click", (event) => {
    event.preventDefault();
    void action(button.dataset.muAction, button.dataset.value, button);
  }));
  container.querySelectorAll("[data-mu-play]").forEach((button) => button.addEventListener("click", () => void command({ action: "play", query: button.dataset.muPlay, now: button.dataset.now === "true" })));
  container.querySelectorAll("[data-mu-playlist]").forEach((button) => button.addEventListener("click", () => {
    const mode = button.dataset.mode;
    void command({ action: "playlist", id: button.dataset.muPlaylist, shuffle: mode === "shuffle", now: mode !== "queue" });
  }));
  container.querySelectorAll("[data-mu-radio]").forEach((button) => button.addEventListener("click", () => void radioAction(view.radioResults?.[Number(button.dataset.muRadio)], button.dataset.mode)));
  container.querySelectorAll("[data-mu-reorder]").forEach((button) => button.addEventListener("click", () => void reorder(Number(button.dataset.muReorder), button.dataset.to)));
  bindLibrary();
  bindPickers(container);
  const add = container.querySelector("[data-mu-add]");
  add?.addEventListener("input", () => {
    view.addQuery = add.value;
    const results = container.querySelector("[data-mu-add-results]");
    results.innerHTML = addResults();
    results.querySelectorAll("[data-mu-play]").forEach((button) => button.addEventListener("click", () => void command({ action: "play", query: button.dataset.muPlay, now: button.dataset.now === "true" })));
  });
  add?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void addTyped(false);
  });
  const panel = container.querySelector("[data-mu-player]");
  if (panel) bindPlayer(panel);
}

function bindPlayer(panel) {
  panel.querySelectorAll("[data-mu-cmd]").forEach((button) => button.addEventListener("click", () => {
    const name = button.dataset.muCmd;
    if (name === "jump" || name === "remove") return void command({ action: name, position: Number(button.dataset.position) }, name === "jump");
    if (name === "move") return void command({ action: "move", from: Number(button.dataset.from), to: Number(button.dataset.to) }, true);
    if (name === "stop") return void confirmAction({ title: "Stop the music?", body: "This clears the queue.", confirmText: "Stop" }).then((ok) => ok && command({ action: "stop" }));
    return void command({ action: name }, ["toggle", "previous", "skip", "rewind", "forward"].includes(name));
  }));
  const seek = panel.querySelector("[data-mu-seek]");
  seek?.addEventListener("click", (event) => {
    const player = view.player;
    if (!player?.current || player.live || !player.durationSeconds) return;
    const box = seek.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    void command({ action: "seek", seconds: Math.floor(ratio * player.durationSeconds) }, true);
  });
  const volume = panel.querySelector("[data-mu-volume]");
  volume?.addEventListener("input", () => { panel.querySelector("[data-mu-volume-label]").textContent = `${volume.value}%`; });
  volume?.addEventListener("change", () => void command({ action: "volume", volume: Number(volume.value) }, true));
}

function bindLibrary() {
  container.querySelectorAll("[data-mu-filter]").forEach((input) => {
    const key = input.dataset.muFilter;
    input.addEventListener(key === "query" ? "input" : "change", () => {
      view.filter[key] = input.value;
      const caret = input.selectionStart;
      render();
      const again = container.querySelector(`[data-mu-filter="${key}"]`);
      again?.focus();
      if (key === "query" && again) again.setSelectionRange(caret, caret);
    });
  });
  container.querySelectorAll("[data-mu-select]").forEach((box) => box.addEventListener("change", () => {
    if (box.checked) view.selected.add(box.dataset.muSelect);
    else view.selected.delete(box.dataset.muSelect);
    render();
  }));
  container.querySelector("[data-mu-select-all]")?.addEventListener("change", (event) => {
    const tracks = filteredTracks();
    if (event.target.checked) tracks.forEach((track) => view.selected.add(track.id));
    else tracks.forEach((track) => view.selected.delete(track.id));
    render();
  });
  container.querySelector("[data-mu-playlist-target]")?.addEventListener("change", (event) => {
    const id = event.target.value;
    if (id) void addSelectedToPlaylist(id);
  });
  const drop = container.querySelector("[data-mu-drop]");
  const input = container.querySelector("[data-mu-files]");
  if (!drop || !input) return;
  input.addEventListener("change", () => void queueUploads([...input.files]));
  drop.addEventListener("dragover", (event) => {
    event.preventDefault();
    drop.classList.add("over");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (event) => {
    event.preventDefault();
    drop.classList.remove("over");
    void queueUploads([...(event.dataTransfer?.files ?? [])]);
  });
}

async function addTyped(now) {
  const query = view.addQuery.trim();
  if (!query) return notify("Type a song, playlist, station, or paste a link.", "error");
  if (await command({ action: "play", query, now })) {
    view.addQuery = "";
    const input = container.querySelector("[data-mu-add]");
    if (input) input.value = "";
    const results = container.querySelector("[data-mu-add-results]");
    if (results) results.innerHTML = addResults();
  }
  return undefined;
}

async function action(name, value, element) {
  switch (name) {
    case "add-typed":
      return addTyped(element.dataset.now === "true");
    case "join": {
      const channelId = container.querySelector('[name="voiceChannel"]')?.value;
      return command({ action: "join", ...(channelId ? { channelId } : {}) });
    }
    case "leave":
      return command({ action: "leave" });
    case "edit-track":
      view.editingTrackId = value;
      return render();
    case "cancel-edit":
      view.editingTrackId = undefined;
      return render();
    case "delete-track": {
      const track = view.tracks.find((item) => item.id === value);
      if (!(await confirmAction({ title: `Delete ${track?.title ?? "this song"}?`, body: "The file is removed from the server and from every playlist.", confirmText: "Delete" }))) return undefined;
      view.selected.delete(value);
      return run("Deleted.", () => sendJson(`music/library/${encodeURIComponent(value)}`, "DELETE"));
    }
    case "queue-selected": {
      const ids = filteredTracks().map((track) => track.id).filter((id) => view.selected.has(id));
      for (const id of ids) if (!(await command({ action: "play", query: `library:${id}` }, true))) return undefined;
      notify(`Added ${ids.length} song${ids.length === 1 ? "" : "s"} to the queue.`);
      view.selected.clear();
      return render();
    }
    case "delete-selected": {
      const ids = [...view.selected];
      if (!(await confirmAction({ title: `Delete ${ids.length} song${ids.length === 1 ? "" : "s"}?`, body: "The files are removed from the server and from every playlist.", confirmText: "Delete" }))) return undefined;
      view.selected.clear();
      return run(`Deleted ${ids.length} song${ids.length === 1 ? "" : "s"}.`, async () => {
        for (const id of ids) await sendJson(`music/library/${encodeURIComponent(id)}`, "DELETE");
      });
    }
    case "open-playlist":
      view.openPlaylistId = value;
      view.addingToPlaylist = false;
      view.selected.clear();
      return render();
    case "close-playlist":
      view.openPlaylistId = undefined;
      view.addingToPlaylist = false;
      return render();
    case "toggle-add-songs":
      view.addingToPlaylist = !view.addingToPlaylist;
      view.selected.clear();
      return render();
    case "add-selected-to-open":
      return addSelectedToPlaylist(view.openPlaylistId);
    case "delete-playlist": {
      const playlist = view.playlists.find((item) => item.id === value);
      if (!(await confirmAction({ title: `Delete the playlist ${playlist?.name ?? ""}?`, body: "The songs stay in the library.", confirmText: "Delete" }))) return undefined;
      view.openPlaylistId = undefined;
      return run("Playlist deleted.", () => sendJson(`music/playlists/${encodeURIComponent(value)}`, "DELETE"));
    }
    case "delete-station": {
      const station = view.overview.stations.find((item) => item.id === value);
      if (!(await confirmAction({ title: `Remove ${station?.name ?? "this station"}?`, body: "You can save it again from a search.", confirmText: "Remove" }))) return undefined;
      return run("Station removed.", () => sendJson(`music/stations/${encodeURIComponent(value)}`, "DELETE"));
    }
    default:
      return undefined;
  }
}

async function addSelectedToPlaylist(id) {
  const trackIds = [...view.selected];
  if (!id || !trackIds.length) return;
  view.selected.clear();
  await run((result) => `Added to ${result.data.name}.`, () => sendJson(`music/playlists/${encodeURIComponent(id)}/tracks`, "POST", { trackIds }));
}

async function reorder(from, to) {
  const playlist = view.playlists.find((item) => item.id === view.openPlaylistId);
  if (!playlist) return;
  const ids = [...playlist.trackIds];
  const [moved] = ids.splice(from, 1);
  if (to !== "remove") ids.splice(Number(to), 0, moved);
  await run(undefined, () => sendJson(`music/playlists/${encodeURIComponent(playlist.id)}/tracks`, "PUT", { trackIds: ids }));
}

async function radioAction(station, mode) {
  if (!station) return;
  if (mode === "save") {
    await run(`Saved ${station.name}.`, () => sendJson("music/stations", "POST", { name: station.name, url: station.url, ...(station.faviconUrl && /^https:/.test(station.faviconUrl) ? { faviconUrl: station.faviconUrl } : {}), tags: station.tags.slice(0, 10) }));
    return;
  }
  await command({ action: "play", query: `radio:${station.url}`, title: station.name, now: true });
}

function contentTypeOf(file) {
  const extension = (/\.([a-z0-9]{1,5})$/i.exec(file.name)?.[1] ?? "").toLowerCase();
  if (file.type && (file.type.startsWith("audio/") || file.type === "application/ogg")) return file.type;
  return AUDIO_TYPES[extension];
}

async function queueUploads(files) {
  const limit = view.overview.library.maxFileBytes;
  for (const file of files) {
    const type = contentTypeOf(file);
    const upload = { file, name: file.name, type, progress: 0, status: "waiting", message: "" };
    if (!type) Object.assign(upload, { status: "failed", message: "Not an audio file. Use mp3, ogg, opus, m4a, aac, flac or wav." });
    else if (file.size > limit) Object.assign(upload, { status: "failed", message: "Larger than 50 MB." });
    view.uploads.push(upload);
  }
  render();
  if (view.uploading) return;
  view.uploading = true;
  let added = 0;
  for (const upload of view.uploads) {
    if (upload.status !== "waiting") continue;
    upload.status = "uploading";
    refreshUpload(upload);
    try {
      const result = await uploadFile("music/library", upload.file, upload.type, (ratio) => {
        upload.progress = ratio;
        refreshUpload(upload);
      });
      upload.progress = 1;
      upload.status = result.data.duplicate ? "duplicate" : "done";
      upload.message = result.data.duplicate ? `Already in your library as ${result.data.track.title}.` : [result.data.track.title, result.data.track.artist].filter(Boolean).join(" - ");
      if (!result.data.duplicate) added += 1;
    } catch (error) {
      upload.status = "failed";
      upload.message = error.message;
    }
    refreshUpload(upload);
  }
  view.uploading = false;
  const failed = view.uploads.filter((upload) => upload.status === "failed").length;
  notify(`${added} song${added === 1 ? "" : "s"} added${failed ? `, ${failed} failed` : ""}.`, failed && !added ? "error" : "success");
  const finished = view.uploads;
  await load();
  view.uploads = finished.filter((upload) => upload.status === "failed");
  render();
}

function refreshUpload(upload) {
  const at = view.uploads.indexOf(upload);
  const row = container?.querySelector(`[data-mu-upload="${at}"]`);
  if (row) row.outerHTML = uploadRow(upload, at);
}

async function submit(form) {
  const kind = form.dataset.muForm;
  const data = new FormData(form);
  const text = (name) => String(data.get(name) ?? "").trim();
  if (kind === "setup") return run("Music is on.", () => sendJson("music/settings", "PUT", settingsPayload(form, { enabled: true })));
  if (kind === "settings") return run("Settings saved.", () => sendJson("music/settings", "PUT", settingsPayload(form)));
  if (kind === "track") {
    view.editingTrackId = undefined;
    return run("Saved.", () => sendJson(`music/library/${encodeURIComponent(form.dataset.id)}`, "PATCH", { title: text("title"), ...(text("artist") ? { artist: text("artist") } : {}), ...(text("album") ? { album: text("album") } : {}) }));
  }
  if (kind === "new-playlist") return run((result) => `Created ${result.data.name}.`, async () => {
    const result = await sendJson("music/playlists", "POST", { name: text("name") });
    view.openPlaylistId = result.data.id;
    view.addingToPlaylist = true;
    return result;
  });
  if (kind === "playlist") return run("Playlist saved.", () => sendJson(`music/playlists/${encodeURIComponent(form.dataset.id)}`, "PATCH", { name: text("name"), ...(text("description") ? { description: text("description") } : {}) }));
  if (kind === "radio-search" || kind === "jamendo-search") {
    const query = text("q");
    if (!query) return notify("Type something to search for.", "error");
    try {
      const results = (await getJson(`music/${kind === "radio-search" ? "radio" : "jamendo"}/search?q=${encodeURIComponent(query)}`)).data;
      if (kind === "radio-search") view.radioResults = results;
      else view.jamendoResults = results;
      render();
      const input = container.querySelector(`form[data-mu-form="${kind}"] input[name="q"]`);
      if (input) input.value = query;
    } catch (error) {
      notify(error.message || "Search failed.", "error");
    }
  }
  return undefined;
}
