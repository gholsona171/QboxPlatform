import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import { boolValue, channelLabel, channelSelect, checkbox, intValue, loadDirectory, numberField, relative, roleName, roleSelect, selectField, textArea, textField } from "./forms.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";
import { BRAND } from "./brand.js";

const TABS = [
  ["creators", "Creators"],
  ["editor", "Editor"],
  ["settings", "Settings"],
];
const PLATFORMS = [["twitch", "Twitch"], ["kick", "Kick"], ["youtube", "YouTube"]];
const ENDED = [["edit", "Edit it to say the stream ended"], ["delete", "Delete it"], ["keep", "Keep it as it is"]];

const view = { tab: "creators", overview: undefined, editingId: undefined, resolved: undefined, error: undefined };
let container;

export async function renderStreamsPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading creators...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    view.overview = (await getJson("streams/overview")).data;
    view.error = undefined;
    await loadDirectory();
  } catch (error) {
    view.error = error;
  }
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    const denied = view.error.status === 403;
    container.innerHTML = `<section class="card"><h2>${denied ? "You don't have access to stream announcements" : "Stream announcements are unavailable"}</h2><p class="microcopy">${denied ? "Ask a server admin for the Manage streams permission (streams.manage)." : escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  if (!TABS.some(([id]) => id === view.tab)) view.tab = "creators";
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Stream sections">${TABS.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-st-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    <div>${view.tab === "editor" ? editorTab() : view.tab === "settings" ? settingsTab() : creatorsTab()}</div>
  </section>`;
  bind();
}

/* ---------- Creators ---------- */

function platformName(platform) {
  return PLATFORMS.find(([id]) => id === platform)?.[1] ?? platform;
}

function avatar(item) {
  return `<span class="avatar">${item.avatarUrl ? `<img alt="" src="${escapeHtml(item.avatarUrl)}">` : escapeHtml(item.displayName.slice(0, 2).toUpperCase())}</span>`;
}

function status(item) {
  if (!item.enabled) return badge("paused");
  if (item.state.lastStreamId) return `<span class="badge success">Live now</span>`;
  return badge("offline");
}

function setupCard() {
  const platforms = view.overview.platforms;
  return `<div class="empty-state">
    <h3>Announce your streamers</h3>
    <p>Add the creators your community follows on Twitch, Kick, or YouTube. ${BRAND.name} checks them every couple of minutes and posts in Discord when they go live${platforms.youtube ? ", and can announce new YouTube videos too" : ""}.</p>
    <button class="button primary" data-st-action="new">Add your first creator</button>
    ${platforms.twitch ? "" : `<p class="microcopy">Twitch needs app credentials on the host. Kick and YouTube work right away.</p>`}
  </div>`;
}

function creatorsTab() {
  const items = view.overview.subscriptions;
  if (!items.length) return setupCard();
  const settings = view.overview.settings;
  const rows = items.map((item) => row([
    ["Creator", `<span class="creator-name">${avatar(item)}<strong>${escapeHtml(item.displayName)}</strong></span>`],
    ["Platform", badge(platformName(item.platform))],
    ["Status", status(item)],
    ["Channel", escapeHtml(item.announceChannelId ? channelLabel(item.announceChannelId) : settings.defaultChannelId ? `${channelLabel(settings.defaultChannelId)} (default)` : "Not set")],
    ["Last check", item.state.lastCheckedAt ? `${escapeHtml(relative(item.state.lastCheckedAt))}${item.state.lastError ? `<br><small class="microcopy">${escapeHtml(item.state.lastError)}</small>` : ""}` : "Not yet"],
    ["", `<div class="toolbar">
      <button class="button compact" data-st-action="edit" data-value="${escapeHtml(item.id)}">Edit</button>
      <button class="button compact" data-st-action="test" data-value="${escapeHtml(item.id)}">Test</button>
      <button class="button compact danger" data-st-action="delete" data-value="${escapeHtml(item.id)}">Remove</button>
    </div>`],
  ]));
  return `<div class="split-line"><h3>Creators</h3><button class="button primary compact" data-st-action="new">+ Add creator</button></div>
    ${settings.enabled ? "" : `<p class="microcopy">Announcements are paused. Turn them on in Settings.</p>`}
    ${table(["Creator", "Platform", "Status", "Channel", "Last check", ""], rows)}`;
}

/* ---------- Editor ---------- */

function blank() {
  return { platform: view.overview.platforms.twitch ? "twitch" : "kick", handle: "", announceChannelId: "", pingRoleId: "", messageText: "", announceVideos: false, enabled: true };
}

function editorTab() {
  const editing = view.overview.subscriptions.find((item) => item.id === view.editingId);
  const c = editing ?? blank();
  const platforms = view.overview.platforms;
  const options = PLATFORMS.map(([id, label]) => [id, platforms[id] ? label : `${label} (needs app credentials on the host)`]);
  return `<form class="form-grid readable-form" data-st-form="creator">
    <h3>${editing ? `Edit ${escapeHtml(editing.displayName)}` : "Add a creator"}</h3>
    ${editing
      ? `<div class="full"><span class="creator-name">${avatar(editing)}<strong>${escapeHtml(editing.displayName)}</strong> <small class="microcopy">${escapeHtml(platformName(editing.platform))} · ${escapeHtml(editing.handle)}</small></span></div>`
      : `${selectField("platform", "Platform", options, c.platform)}
        ${textField("handle", "Channel name, handle, or link", c.handle, "shroud, @mkbhd, or a channel link", true)}
        <div class="toolbar full"><button type="button" class="button compact" data-st-action="check">Check</button><span data-st-check></span></div>`}
    ${channelSelect("announceChannelId", "Announce in", c.announceChannelId, "TEXT", view.overview.settings.defaultChannelId ? `Default channel (${channelLabel(view.overview.settings.defaultChannelId)})` : "Choose a channel")}
    ${roleSelect("pingRoleId", "Role to ping", c.pingRoleId)}
    ${textArea("messageText", "Message text (optional)", c.messageText ?? "", "{ping} {creator} is live on {platform}! {url}")}
    <p class="microcopy full">Leave the text empty for the default. Placeholders: {ping} {creator} {platform} {title} {game} {viewers} {url}.</p>
    <div class="full" data-st-youtube ${c.platform === "youtube" ? "" : "hidden"}>${checkbox("announceVideos", "Also announce new videos", c.announceVideos)}</div>
    ${checkbox("enabled", "Active (uncheck to pause this creator)", c.enabled)}
    <button class="button primary full">${editing ? "Save changes" : "Add creator"}</button>
    ${editing ? `<button type="button" class="button full" data-st-action="new">Add a different creator instead</button>` : ""}
  </form>`;
}

/* ---------- Settings ---------- */

function settingsTab() {
  const s = view.overview.settings;
  return `<form class="form-grid readable-form" data-st-form="settings">
    <h3>Announcements</h3>
    ${checkbox("enabled", "Announce streams (uncheck to pause every creator)", s.enabled)}
    ${channelSelect("defaultChannelId", "Default channel for creators without their own", s.defaultChannelId, "TEXT", "Not set")}
    ${selectField("endedBehavior", "When the stream ends, what happens to the announcement?", ENDED, s.endedBehavior)}
    ${numberField("checkIntervalSeconds", "Check every (seconds, 60-600)", s.checkIntervalSeconds, 60, 600)}
    <p class="microcopy full">Each creator is checked at this interval. After a failed check ${BRAND.name} waits longer before trying again, up to 30 minutes.</p>
    <button class="button primary full">Save settings</button>
  </form>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-st-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.stTab;
    history.replaceState({}, "", appPath(`/streams?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-st-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.stAction, button.dataset.value)));
  container.querySelectorAll("form[data-st-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form);
  }));
  const platform = container.querySelector('select[name="platform"]');
  platform?.addEventListener("change", () => {
    container.querySelector("[data-st-youtube]").hidden = platform.value !== "youtube";
    view.resolved = undefined;
    container.querySelector("[data-st-check]").textContent = "";
  });
  container.querySelector('input[name="handle"]')?.addEventListener("input", () => { view.resolved = undefined; });
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

async function action(name, value) {
  switch (name) {
    case "new":
      view.editingId = undefined;
      view.resolved = undefined;
      view.tab = "editor";
      render();
      return;
    case "edit":
      view.editingId = value;
      view.tab = "editor";
      render();
      return;
    case "test":
      await run((result) => (result.data.live ? "Posted. They are live right now." : "Posted a sample announcement. They are offline right now."), () => sendJson(`streams/subscriptions/${encodeURIComponent(value)}/test`, "POST", {}));
      return;
    case "delete": {
      const item = view.overview.subscriptions.find((entry) => entry.id === value);
      if (!(await confirmAction({ title: `Stop following ${item?.displayName ?? "this creator"}?`, body: "Announcements already posted stay in Discord.", confirmText: "Remove" }))) return;
      if (view.editingId === value) view.editingId = undefined;
      await run("Removed.", () => sendJson(`streams/subscriptions/${encodeURIComponent(value)}`, "DELETE"));
      return;
    }
    case "check":
      await check();
      return;
    default:
  }
}

async function check() {
  const form = container.querySelector('form[data-st-form="creator"]');
  const platform = form.elements.platform.value;
  const handle = form.elements.handle.value.trim();
  const result = container.querySelector("[data-st-check]");
  if (!handle) return notify("Enter the channel name first.", "error");
  result.textContent = "Checking...";
  try {
    view.resolved = (await sendJson("streams/resolve", "POST", { platform, handle })).data;
    result.innerHTML = `<span class="creator-name">${avatar(view.resolved)}<strong>${escapeHtml(view.resolved.displayName)}</strong> <small class="microcopy">${escapeHtml(platformName(view.resolved.platform))}</small></span>`;
  } catch (error) {
    view.resolved = undefined;
    result.textContent = error.message || "Not found.";
  }
  return undefined;
}

function creatorPayload(form) {
  const data = new FormData(form);
  const text = (name) => String(data.get(name) ?? "").trim();
  const optional = (name) => (text(name) ? { [name]: text(name) } : {});
  return {
    ...optional("announceChannelId"),
    ...optional("pingRoleId"),
    ...optional("messageText"),
    announceVideos: boolValue(form, "announceVideos"),
    enabled: boolValue(form, "enabled"),
  };
}

async function submit(form) {
  if (form.dataset.stForm === "settings") {
    const data = new FormData(form);
    const channel = String(data.get("defaultChannelId") ?? "").trim();
    return run("Settings saved.", () => sendJson("streams/settings", "PUT", {
      enabled: boolValue(form, "enabled"),
      ...(channel ? { defaultChannelId: channel } : {}),
      endedBehavior: String(data.get("endedBehavior") ?? "edit"),
      checkIntervalSeconds: intValue(data, "checkIntervalSeconds", 90),
      expectedRevision: view.overview.settings.revision,
    }));
  }
  const id = view.editingId;
  if (id) return run("Saved.", () => sendJson(`streams/subscriptions/${encodeURIComponent(id)}`, "PUT", creatorPayload(form)));
  const platform = form.elements.platform.value;
  const handle = form.elements.handle.value.trim();
  return run((result) => `Following ${result.data.displayName}. ${result.data.pingRoleId ? `@${roleName(result.data.pingRoleId)} gets pinged when they go live.` : ""}`, async () => {
    const result = await sendJson("streams/subscriptions", "POST", { platform, handle, ...creatorPayload(form) });
    view.editingId = undefined;
    view.tab = "creators";
    return result;
  });
}
