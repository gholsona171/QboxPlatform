import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import { channelSelect, dateTime, intValue, loadDirectory, numberField, roleSelect, textField } from "./forms.js";
import { playerChart } from "./playerChart.js";
import { badge, escapeHtml, notify, row, table } from "./ui.js";
import { BRAND } from "./brand.js";

const view = { tab: "status", overview: undefined, status: undefined, statusError: undefined, history: undefined, range: "24h", error: undefined };
let container;

export async function renderFivemPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Checking the FiveM server...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    const [overview, history] = await Promise.all([getJson("fivem/overview"), getJson(`fivem/history?range=${view.range}`)]);
    view.overview = overview.data;
    view.history = history.data;
    view.error = undefined;
    await loadStatus();
    if (view.overview.can.manage) await loadDirectory();
  } catch (error) {
    view.error = error;
  }
}

async function loadStatus() {
  view.status = undefined;
  view.statusError = undefined;
  if (!view.overview.configured) return;
  try {
    view.status = (await getJson("fivem/status")).data;
  } catch (error) {
    view.statusError = error;
  }
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    container.innerHTML = `<section class="card"><h2>FiveM status is unavailable</h2><p class="microcopy">${escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  const tabs = [["status", "Status"], ...(view.overview.can.manage ? [["settings", "Settings"]] : [])];
  if (!tabs.some(([id]) => id === view.tab)) view.tab = "status";
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="FiveM sections">${tabs.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-f-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    <div>${view.tab === "settings" ? settingsTab() : statusTab()}</div>
  </section>`;
  bind();
}

/* ---------- Status ---------- */

function uptime(since) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(since).getTime()) / 60000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  return days ? `${days}d ${hours}h` : hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

function statusCard() {
  if (view.statusError) return `<div class="empty-state">${escapeHtml(view.statusError.message)}</div>`;
  const s = view.status;
  const metric = (label, value) => `<div class="card metric"><span class="metric-label">${escapeHtml(label)}</span><strong class="metric-value">${escapeHtml(String(value))}</strong></div>`;
  return `<div class="split-line"><h2>${escapeHtml(s.hostname || "FiveM server")}</h2>${badge(s.online ? "online" : "offline")}</div>
    ${s.online ? "" : `<p class="microcopy">${escapeHtml(s.error ?? "The server is not answering.")}</p>`}
    <section class="grid cols-4">
      ${metric("Players", s.online ? `${s.playerCount}/${s.maxPlayers}` : "—")}
      ${metric("Up for", s.online && view.overview.onlineSince ? uptime(view.overview.onlineSince) : "—")}
      ${metric("Peak (24h)", view.range === "24h" ? view.history.peak : "—")}
      ${metric("Uptime", view.history.uptimePercent === undefined ? "—" : `${view.history.uptimePercent}%`)}
    </section>
    <div class="toolbar">
      <button class="button compact" data-f-action="refresh">Refresh</button>
      ${view.overview.connectUrl ? `<a class="button primary compact" href="${escapeHtml(view.overview.connectUrl)}" target="_blank" rel="noopener noreferrer">Connect</a>` : ""}
      <small class="microcopy">Checked ${escapeHtml(dateTime(s.checkedAt))}${view.overview.restartTimes.length ? ` · Restarts ${escapeHtml(view.overview.restartTimes.join(", "))} (${escapeHtml(view.overview.timeZone)})` : ""}</small>
    </div>`;
}

function setupCard() {
  return `<div class="empty-state">
    <h3>Set up your FiveM server</h3>
    <p>${BRAND.name} is not connected to a FiveM server yet. Once it has the server address it shows live status and players here, keeps a status message updated in Discord, and can alert you when the server goes down.</p>
    ${view.overview.can.manage
      ? `<button class="button primary" data-f-tab="settings">Add the server address</button>`
      : `<p class="microcopy">Ask a server admin to add the server address on the Settings tab.</p>`}
  </div>`;
}

function statusTab() {
  if (!view.overview.configured) return setupCard();
  const players = view.status?.online ? view.status.players : [];
  return `${statusCard()}
    <section class="grid main-detail">
      <div class="card">
        <div class="split-line"><h3>Players over time</h3>
          <span class="toolbar">${["24h", "7d"].map((range) => `<button class="button compact ${view.range === range ? "primary" : ""}" data-f-range="${range}">${range === "24h" ? "24 hours" : "7 days"}</button>`).join("")}</span>
        </div>
        ${playerChart(view.history)}
      </div>
      <div class="card"><h3>Online now</h3>
        ${table(["ID", "Name", "Ping"], players.map((player) => row([["ID", String(player.id)], ["Name", escapeHtml(player.name)], ["Ping", `${player.ping} ms`]])), !view.status?.online ? "The server is offline." : view.status.playerCount > 0 ? "The player list is hidden on this server." : "Nobody is online.")}
      </div>
    </section>`;
}

/* ---------- Settings ---------- */

function settingsTab() {
  const s = view.overview.settings;
  return `<form class="form-grid readable-form" data-f-form="settings">
    <h3>Server</h3>
    ${textField("serverAddress", "Server address (host:port)", s.serverAddress, "123.45.67.89:30120", false, "full")}
    <div class="toolbar full"><button type="button" class="button compact" data-f-action="test">Test connection</button><span data-f-test></span></div>
    ${textField("connectUrl", "Connect link", s.connectUrl, "https://cfx.re/join/abc123", false, "full")}
    <h3>Status message</h3>
    <p class="microcopy full">${BRAND.name} keeps one message in this channel up to date with the status and player list.</p>
    ${channelSelect("statusChannelId", "Status channel", s.statusChannelId, "TEXT", "Not set")}
    ${numberField("updateIntervalSeconds", "Update every (seconds, 30-3600)", s.updateIntervalSeconds, 30, 3600)}
    <h3>Alerts</h3>
    ${channelSelect("alertChannelId", "Alert channel (down, back up, restarts)", s.alertChannelId, "TEXT", "Not set")}
    ${roleSelect("alertRoleId", "Role to ping when the server goes down or comes back", s.alertRoleId)}
    <h3>Restart schedule</h3>
    ${textField("restartTimes", "Daily restart times (HH:MM, comma separated)", s.restartTimes.join(", "), "06:00, 18:00", false, "full")}
    ${textField("timeZone", "Time zone", s.timeZone, "Europe/Berlin")}
    ${textField("restartWarningMinutes", "Warn this many minutes before (comma separated, 0 = now)", s.restartWarningMinutes.join(", "), "15, 5, 1")}
    <p class="microcopy full">Your browser's time zone is ${escapeHtml(Intl.DateTimeFormat().resolvedOptions().timeZone)}.</p>
    <button class="button primary full">Save settings</button>
  </form>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-f-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.fTab;
    history.replaceState({}, "", appPath(`/fivem?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-f-range]").forEach((button) => button.addEventListener("click", () => void changeRange(button.dataset.fRange)));
  container.querySelectorAll("[data-f-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.fAction)));
  container.querySelector("form[data-f-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    void save(event.currentTarget);
  });
}

async function changeRange(range) {
  try {
    view.range = range;
    view.history = (await getJson(`fivem/history?range=${range}`)).data;
    render();
  } catch (error) {
    notify(error.message, "error");
  }
}

async function action(name) {
  if (name === "refresh") {
    await loadStatus();
    return render();
  }
  if (name === "test") {
    const address = String(container.querySelector('[name="serverAddress"]')?.value ?? "").trim();
    if (!address) return notify("Enter the server address first.", "error");
    const result = container.querySelector("[data-f-test]");
    result.textContent = "Checking...";
    try {
      const test = (await sendJson("fivem/test", "POST", { serverAddress: address })).data;
      result.innerHTML = `${badge(test.online ? "online" : "offline")} ${escapeHtml(test.online ? `${test.hostname ?? "Server"} · ${test.playerCount}/${test.maxPlayers} players` : test.error ?? "Not reachable")}`;
    } catch (error) {
      result.textContent = "";
      notify(error.message, "error");
    }
  }
  return undefined;
}

async function save(form) {
  const data = new FormData(form);
  const text = (name) => String(data.get(name) ?? "").trim();
  const list = (name) => text(name).split(",").map((item) => item.trim()).filter(Boolean);
  const optional = (name) => (text(name) ? { [name]: text(name) } : {});
  try {
    await sendJson("fivem/settings", "PUT", {
      ...optional("serverAddress"),
      ...optional("connectUrl"),
      ...optional("statusChannelId"),
      updateIntervalSeconds: intValue(data, "updateIntervalSeconds", 60),
      ...optional("alertChannelId"),
      ...optional("alertRoleId"),
      restartTimes: list("restartTimes"),
      timeZone: text("timeZone") || "UTC",
      restartWarningMinutes: list("restartWarningMinutes").map(Number),
      expectedRevision: view.overview.settings.revision,
    });
    notify("FiveM settings saved.");
    await load();
    render();
  } catch (error) {
    notify(error.message || "That did not work.", "error");
  }
}

