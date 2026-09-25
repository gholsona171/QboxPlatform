import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import { channelSelect, checkbox, dateTime, intValue, loadDirectory, numberField, roleSelect, selectField, textField } from "./forms.js";
import { playerChart } from "./playerChart.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";
import { BRAND } from "./brand.js";

const KINDS = [
  ["minecraft-java", "Minecraft (Java)"],
  ["minecraft-bedrock", "Minecraft (Bedrock)"],
  ["steam", "Steam game (Rust, ARK, Valheim, Palworld, CS2, ...)"],
];

/** Query ports people ask about most. The query port is what goes in the address. */
const PORTS = [
  ["Minecraft (Java)", "25565", "Same as the game port. Leave the port out to use the SRV record."],
  ["Minecraft (Bedrock)", "19132", "Same as the game port."],
  ["Rust", "28015", "Query port = game port."],
  ["Valheim", "2457", "Game port + 1."],
  ["ARK", "27015", "The query port, not the game port (7777)."],
  ["CS2, Garry's Mod", "27015", "Query port = game port."],
  ["Palworld", "27015", "The query port; RCON and REST are not needed."],
  ["7 Days to Die", "26901", "Game port + 1."],
];

const view = { tab: "servers", overview: undefined, live: {}, selected: undefined, editing: undefined, history: undefined, range: "24h", error: undefined };
let container;

export async function renderGamesPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Checking your game servers...</p></section>`;
  await load();
  render();
  void loadLive();
}

async function load() {
  try {
    view.overview = (await getJson("games/overview")).data;
    view.error = undefined;
    if (view.selected && !view.overview.servers.some((server) => server.id === view.selected)) view.selected = undefined;
    if (view.selected) await loadHistory();
    await loadDirectory();
  } catch (error) {
    view.error = error;
  }
}

/** Live counts for every server, in parallel. Cards show the last known state until each answer arrives. */
async function loadLive() {
  if (!view.overview) return;
  await Promise.all(view.overview.servers.map(async (server) => {
    try {
      view.live[server.id] = (await getJson(`games/servers/${server.id}/status`)).data;
    } catch (error) {
      view.live[server.id] = { online: false, error: error.message, players: [], playerCount: 0, maxPlayers: 0 };
    }
    render();
  }));
}

async function loadHistory() {
  try {
    view.history = (await getJson(`games/servers/${view.selected}/history?range=${view.range}`)).data;
  } catch (error) {
    view.history = undefined;
    notify(error.message, "error");
  }
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    container.innerHTML = `<section class="card"><h2>Game servers are unavailable</h2><p class="microcopy">${escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  const tabs = [["servers", "Servers"], ...(view.overview.can.manage ? [["settings", "Settings"]] : [])];
  if (!tabs.some(([id]) => id === view.tab)) view.tab = "servers";
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Game server sections">${tabs.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-g-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    <div>${view.tab === "settings" ? settingsTab() : serversTab()}</div>
  </section>`;
  bind();
}

/* ---------- Servers ---------- */

function kindLabel(kind) {
  return KINDS.find(([id]) => id === kind)?.[1] ?? kind;
}

function gameLabel(server) {
  if (server.kind === "minecraft-java") return "Minecraft";
  if (server.kind === "minecraft-bedrock") return "Minecraft Bedrock";
  return server.game || "Steam game";
}

function uptime(since) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(since).getTime()) / 60000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  return days ? `${days}d ${hours}h` : hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

function setupCard() {
  return `<div class="empty-state">
    <h3>Add your first game server</h3>
    <p>${BRAND.name} shows live status and player counts here and in Discord, keeps a status message updated, renames a channel to the player count, and alerts you when a server goes down.</p>
    <p class="microcopy">Works with Minecraft (Java and Bedrock) and any game with Steam server queries: Rust, ARK, Valheim, Palworld, CS2, Garry's Mod, 7 Days to Die, Project Zomboid, DayZ, Squad, Satisfactory and more. FiveM has its own page.</p>
    ${view.overview.can.manage
      ? `<button class="button primary" data-g-action="new">Add a game server</button>`
      : `<p class="microcopy">Ask a server admin to add one.</p>`}
  </div>`;
}

function serverCard(server) {
  const live = view.live[server.id];
  const online = live ? live.online : server.online;
  const players = live ? live.playerCount : server.players;
  const max = live ? live.maxPlayers : server.maxPlayers;
  const state = online === undefined ? "not checked yet" : online ? "online" : "offline";
  return `<div class="card ${server.id === view.selected ? "selected" : ""}">
    <div class="split-line"><h3>${escapeHtml(server.name)}</h3>${server.enabled ? badge(state) : badge("off")}</div>
    <p class="microcopy">${escapeHtml(gameLabel(server))} · <code>${escapeHtml(server.address)}</code></p>
    <strong class="metric-value">${online ? `${players}/${max}` : "—"}</strong>
    <p class="microcopy">${online ? `players online${live ? ` · ${live.latencyMs} ms` : ""}` : online === false ? escapeHtml((live ? live.error : server.lastError) ?? "The server is not answering.") : live ? "Checking..." : "Waiting for the first check."}</p>
    <div class="toolbar">
      <button class="button compact" data-g-action="select" data-value="${escapeHtml(server.id)}">Details</button>
      ${view.overview.can.manage ? `<button class="button compact" data-g-action="edit" data-value="${escapeHtml(server.id)}">Edit</button>` : ""}
      ${server.connectUrl ? `<a class="button primary compact" href="${escapeHtml(server.connectUrl)}" target="_blank" rel="noopener noreferrer">Connect</a>` : ""}
    </div>
  </div>`;
}

function serversTab() {
  const { servers, maxServers, can } = view.overview;
  if (!servers.length && !view.editing) return setupCard();
  return `<section class="grid cols-2">${servers.map(serverCard).join("")}</section>
    <div class="toolbar">
      ${can.manage ? `<button class="button compact" data-g-action="new" ${servers.length >= maxServers ? "disabled" : ""}>Add a game server</button><span class="microcopy">${servers.length} of ${maxServers} servers</span>` : ""}
      <button class="button compact" data-g-action="refresh">Refresh</button>
    </div>
    ${view.editing ? `<div class="card">${editor(view.editing)}</div>` : ""}
    ${view.selected ? detail(servers.find((server) => server.id === view.selected)) : ""}`;
}

function detail(server) {
  if (!server) return "";
  const live = view.live[server.id];
  const metric = (label, value) => `<div class="card metric"><span class="metric-label">${escapeHtml(label)}</span><strong class="metric-value">${escapeHtml(String(value))}</strong></div>`;
  const players = live?.online ? live.players : [];
  return `<div class="card">
    <div class="split-line"><h2>${escapeHtml(live?.name || server.name)}</h2>${live ? badge(live.online ? "online" : "offline") : ""}</div>
    ${live && !live.online ? `<p class="microcopy">${escapeHtml(live.error ?? "The server is not answering.")}</p>` : ""}
    <section class="grid cols-4">
      ${metric("Players", live?.online ? `${live.playerCount}/${live.maxPlayers}` : "—")}
      ${metric("Up for", live?.online && server.onlineSince ? uptime(server.onlineSince) : "—")}
      ${metric(`Peak (${view.range})`, view.history ? view.history.peak : "—")}
      ${metric("Uptime", view.history?.uptimePercent === undefined ? "—" : `${view.history.uptimePercent}%`)}
    </section>
    <p class="microcopy">${escapeHtml(gameLabel(server))} · ${escapeHtml(server.address)}${live?.map ? ` · map ${escapeHtml(live.map)}` : ""}${live?.version ? ` · version ${escapeHtml(live.version)}` : ""}${live ? ` · ${live.latencyMs} ms · checked ${escapeHtml(dateTime(live.checkedAt))}` : ""}</p>
    <section class="grid main-detail">
      <div class="card">
        <div class="split-line"><h3>Players over time</h3>
          <span class="toolbar">${["24h", "7d"].map((range) => `<button class="button compact ${view.range === range ? "primary" : ""}" data-g-range="${range}">${range === "24h" ? "24 hours" : "7 days"}</button>`).join("")}</span>
        </div>
        ${view.history ? playerChart(view.history) : `<div class="empty-state">Loading...</div>`}
      </div>
      <div class="card"><h3>Online now</h3>
        ${table(["Name", "Time"], players.map((player) => row([["Name", escapeHtml(player.name)], ["Time", player.duration ? uptime(Date.now() - player.duration * 1000) : "—"]])), !live ? "Checking..." : !live.online ? "The server is offline." : live.playerCount > 0 ? "This game does not share player names." : "Nobody is online.")}
      </div>
    </section>
  </div>`;
}

/* ---------- Editor ---------- */

function newServer() {
  return { name: "", kind: "steam", address: "", game: "", connectUrl: "", statusChannelId: "", updateIntervalSeconds: 60, playerCountChannelId: "", alertChannelId: "", alertRoleId: "", enabled: true };
}

function editor(server) {
  const steam = server.kind === "steam";
  return `<form class="form-grid readable-form" data-g-form="server">
    <h3>${server.id ? "Edit server" : "New game server"}</h3>
    ${textField("name", "Name shown in Discord and here", server.name, "For example: Rust Main", true, "full")}
    ${selectField("kind", "Kind", KINDS, server.kind)}
    ${steam ? textField("game", "Game (label, for example Rust)", server.game, "Rust") : `<span></span>`}
    ${textField("address", steam ? "Address with query port (host:port)" : "Address (host or host:port)", server.address, steam ? "123.45.67.89:28015" : "play.example.com", true, "full")}
    <div class="toolbar full"><button type="button" class="button compact" data-g-action="test">Test connection</button><span data-g-test></span></div>
    <details class="full"><summary class="microcopy">Which port do I use?</summary>
      ${table(["Game", "Query port", "Note"], PORTS.map((cells) => row([["Game", escapeHtml(cells[0])], ["Query port", `<code>${escapeHtml(cells[1])}</code>`], ["Note", escapeHtml(cells[2])]])))}
    </details>
    ${textField("connectUrl", "Connect link (https://... or steam://connect/...)", server.connectUrl, "steam://connect/123.45.67.89:28015", false, "full")}
    ${checkbox("enabled", "Check this server and post updates", server.enabled)}
    <h3>Status message</h3>
    <p class="microcopy full">${BRAND.name} keeps one message in this channel up to date with the status and player list.</p>
    ${channelSelect("statusChannelId", "Status channel", server.statusChannelId, "TEXT", "Not set")}
    ${numberField("updateIntervalSeconds", "Update every (seconds, 60-600)", server.updateIntervalSeconds, 60, 600)}
    <h3>Player-count channel</h3>
    <p class="microcopy full">A voice or text channel renamed to the player count, at most every 5 minutes (Discord's limit). Change the wording on the Settings tab.</p>
    ${channelSelect("playerCountChannelId", "Channel to rename", server.playerCountChannelId, "ANY", "Not set")}
    <h3>Alerts</h3>
    ${channelSelect("alertChannelId", "Alert channel (down, back up)", server.alertChannelId, "TEXT", "Not set")}
    ${roleSelect("alertRoleId", "Role to ping", server.alertRoleId)}
    <div class="toolbar full">
      <button class="button primary">${server.id ? "Save server" : "Add server"}</button>
      <button type="button" class="button" data-g-action="cancel">Cancel</button>
      ${server.id ? `<button type="button" class="button danger" data-g-action="delete">Delete server</button>` : ""}
    </div>
  </form>`;
}

/* ---------- Settings ---------- */

function settingsTab() {
  const s = view.overview.settings;
  return `<form class="form-grid readable-form" data-g-form="settings">
    <h3>Player-count channel names</h3>
    <p class="microcopy full">Used for every server with a player-count channel. Placeholders: <code>{online}</code>, <code>{max}</code>, <code>{name}</code>, <code>{game}</code>.</p>
    ${textField("playerCountTemplate", "While online", s.playerCountTemplate, "🎮 {online}/{max} online", true, "full")}
    ${textField("playerCountOfflineTemplate", "While offline", s.playerCountOfflineTemplate, "🔴 Offline", true, "full")}
    <p class="microcopy full">Status messages and alerts can be customized under Messages once that page is available.</p>
    <button class="button primary full">Save settings</button>
  </form>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-g-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.gTab;
    history.replaceState({}, "", appPath(`/games?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-g-range]").forEach((button) => button.addEventListener("click", () => void changeRange(button.dataset.gRange)));
  container.querySelectorAll("[data-g-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.gAction, button.dataset.value)));
  container.querySelector('select[name="kind"]')?.addEventListener("change", (event) => {
    view.editing = readForm(event.currentTarget.form);
    render();
  });
  container.querySelectorAll("form[data-g-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form);
  }));
}

async function changeRange(range) {
  view.range = range;
  await loadHistory();
  render();
}

function readForm(form) {
  const data = new FormData(form);
  const text = (name) => String(data.get(name) ?? "").trim();
  return {
    ...(view.editing?.id ? { id: view.editing.id } : {}),
    name: text("name"),
    kind: text("kind") || "steam",
    address: text("address"),
    game: text("game"),
    connectUrl: text("connectUrl"),
    statusChannelId: text("statusChannelId"),
    updateIntervalSeconds: intValue(data, "updateIntervalSeconds", 60),
    playerCountChannelId: text("playerCountChannelId"),
    alertChannelId: text("alertChannelId"),
    alertRoleId: text("alertRoleId"),
    enabled: data.get("enabled") === "on",
  };
}

function toPayload(server) {
  const optional = (name) => (server[name] ? { [name]: server[name] } : {});
  return {
    name: server.name,
    kind: server.kind,
    address: server.address,
    ...(server.kind === "steam" ? optional("game") : {}),
    ...optional("connectUrl"),
    ...optional("statusChannelId"),
    updateIntervalSeconds: server.updateIntervalSeconds,
    ...optional("playerCountChannelId"),
    ...optional("alertChannelId"),
    ...optional("alertRoleId"),
    enabled: server.enabled,
  };
}

function reached(result) {
  return `${badge(result.online ? "online" : "offline")} ${escapeHtml(result.online ? `Reached: ${result.name ?? "Server"} — ${result.playerCount}/${result.maxPlayers}` : result.error ?? "Not reachable")}`;
}

async function action(name, value) {
  switch (name) {
    case "new":
      view.editing = newServer();
      render();
      return;
    case "edit":
      view.editing = { ...view.overview.servers.find((server) => server.id === value) };
      render();
      return;
    case "cancel":
      view.editing = undefined;
      render();
      return;
    case "select":
      view.selected = view.selected === value ? undefined : value;
      view.history = undefined;
      render();
      if (view.selected) {
        await loadHistory();
        render();
      }
      return;
    case "refresh":
      await load();
      render();
      await loadLive();
      return;
    case "test": {
      const form = container.querySelector("form[data-g-form=server]");
      const draft = readForm(form);
      if (!draft.address) return notify("Enter the server address first.", "error");
      const result = form.querySelector("[data-g-test]");
      result.textContent = "Checking...";
      try {
        result.innerHTML = reached((await sendJson("games/test", "POST", { kind: draft.kind, address: draft.address })).data);
      } catch (error) {
        result.textContent = "";
        notify(error.message, "error");
      }
      return;
    }
    case "delete": {
      if (!(await confirmAction({ title: "Delete this server?", body: "Its status message stops updating and its history is deleted.", confirmText: "Delete server" }))) return;
      try {
        await sendJson(`games/servers/${view.editing.id}`, "DELETE");
        notify("Server deleted.");
        view.editing = undefined;
        await load();
        render();
      } catch (error) {
        notify(error.message || "That did not work.", "error");
      }
    }
  }
  return undefined;
}

async function submit(form) {
  try {
    if (form.dataset.gForm === "settings") {
      const data = new FormData(form);
      await sendJson("games/settings", "PUT", {
        playerCountTemplate: String(data.get("playerCountTemplate") ?? "").trim(),
        playerCountOfflineTemplate: String(data.get("playerCountOfflineTemplate") ?? "").trim(),
        expectedRevision: view.overview.settings.revision,
      });
      notify("Game server settings saved.");
    } else {
      const draft = readForm(form);
      if (draft.id) {
        await sendJson(`games/servers/${draft.id}`, "PUT", toPayload(draft));
        notify("Server saved.");
      } else {
        const { server, status } = (await sendJson("games/servers", "POST", toPayload(draft))).data;
        view.live[server.id] = status;
        notify(status.online ? `Added. Reached ${status.name ?? server.name}: ${status.playerCount}/${status.maxPlayers} players.` : `Added, but it did not answer: ${status.error ?? "not reachable"}. Check the address and query port.`, status.online ? "success" : "warning");
      }
      view.editing = undefined;
    }
    await load();
    render();
    void loadLive();
  } catch (error) {
    notify(error.message || "That did not work.", "error");
  }
}
