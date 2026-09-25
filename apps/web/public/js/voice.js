import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import {
  bindPickers,
  boolValue,
  channelLabel,
  channelSelect,
  checkbox,
  intValue,
  loadDirectory,
  memberName,
  numberField,
  optionalValue,
  relative,
  rolePicker,
  roleNames,
  textField,
} from "./forms.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";

const TABS = [
  ["hubs", "Hubs"],
  ["rooms", "Active rooms"],
  ["settings", "Settings"],
];

const view = { tab: "hubs", overview: undefined, editing: undefined, error: undefined };
let container;

export async function renderVoicePage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading voice rooms...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    view.overview = (await getJson("voice/overview")).data;
    view.error = undefined;
    await loadDirectory(view.overview.rooms.map((room) => room.ownerId));
  } catch (error) {
    view.error = error;
  }
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    const denied = view.error.status === 403;
    container.innerHTML = `<section class="card"><h2>${denied ? "You don't have access to voice rooms" : "Voice rooms are unavailable"}</h2><p class="microcopy">${denied ? "Ask a server admin for the voice.manage permission." : escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  if (!TABS.some(([id]) => id === view.tab)) view.tab = "hubs";
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Voice room sections">${TABS.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-v-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    <div>${view.tab === "rooms" ? roomsTab() : view.tab === "settings" ? settingsTab() : hubsTab()}</div>
  </section>`;
  bind();
}

/* ---------- Hubs ---------- */

function hubsTab() {
  const { hubs, maxHubs } = view.overview;
  const rows = hubs.map((hub) => row([
    ["Hub", `<strong>${escapeHtml(hub.name)}</strong>${hub.enabled ? "" : ` ${badge("off")}`}`],
    ["Join channel", escapeHtml(channelLabel(hub.channelId))],
    ["Room name", `<code>${escapeHtml(hub.nameTemplate)}</code>`],
    ["Limit", hub.userLimit ? String(hub.userLimit) : "None"],
    ["Private", hub.privateByDefault ? "Yes" : "No"],
    ["Roles", hub.allowedRoleIds.length ? escapeHtml(roleNames(hub.allowedRoleIds)) : "Everyone"],
  ], `data-v-hub="${escapeHtml(hub.id)}" tabindex="0" class="${hub.id === view.editing?.id ? "selected" : ""}"`));
  return `<section class="grid main-detail">
    <div>
      ${table(["Hub", "Join channel", "Room name", "Limit", "Private", "Roles"], rows, "No hubs yet. Add one to let members create their own rooms.")}
      <div class="toolbar"><button class="button compact" data-v-action="new-hub" ${hubs.length >= maxHubs ? "disabled" : ""}>Add a hub</button><span class="microcopy">${hubs.length} of ${maxHubs} hubs</span></div>
    </div>
    <div class="card">${view.editing ? hubForm(view.editing) : `<p class="microcopy">Select a hub to edit it, or add a new one.</p>`}</div>
  </section>`;
}

function hubForm(hub) {
  return `<form class="form-grid" data-v-form="hub">
    <h3>${hub.id ? "Edit hub" : "New hub"}</h3>
    ${textField("name", "Hub name", hub.name, "For example: Gaming", true, "full")}
    ${checkbox("enabled", "Hub is on", hub.enabled)}
    ${channelSelect("channelId", "Join this voice channel to create a room", hub.channelId, "VOICE", "Choose a voice channel", true)}
    ${channelSelect("categoryId", "Category for new rooms", hub.categoryId, "CATEGORY", "Same as the join channel")}
    ${textField("nameTemplate", "Room name ({user}, {count}, {game})", hub.nameTemplate, "{user}'s room", true, "full")}
    ${numberField("userLimit", "User limit (0 = no limit)", hub.userLimit, 0, 99)}
    ${numberField("bitrateKbps", "Bitrate in kbps (8-384, over 96 needs boosts)", hub.bitrateKbps, 8, 384)}
    ${numberField("deleteDelaySeconds", "Delete empty rooms after (seconds)", hub.deleteDelaySeconds, 0, 3600)}
    ${checkbox("privateByDefault", "Rooms start private (hidden and locked)", hub.privateByDefault)}
    ${rolePicker("allowedRoleIds", "Only these roles can use the hub (empty = everyone)", hub.allowedRoleIds)}
    <button class="button primary full">${hub.id ? "Save hub" : "Create hub"}</button>
    ${hub.id ? `<button type="button" class="button danger full" data-v-action="delete-hub">Delete hub</button>` : ""}
  </form>`;
}

/* ---------- Rooms ---------- */

function roomsTab() {
  const hubName = (id) => view.overview.hubs.find((hub) => hub.id === id)?.name ?? "Deleted hub";
  const rows = view.overview.rooms.map((room) => row([
    ["Room", `<strong>${escapeHtml(room.name)}</strong>`],
    ["Owner", memberName(room.ownerId)],
    ["Hub", escapeHtml(room.hubId ? hubName(room.hubId) : "Deleted hub")],
    ["State", `${room.locked ? badge("locked") : ""} ${room.hidden ? badge("hidden") : ""}`.trim() || "Open"],
    ["Created", escapeHtml(relative(room.createdAt))],
    ["", `<button class="button compact danger" data-v-action="delete-room" data-value="${escapeHtml(room.id)}">Delete</button>`],
  ]));
  return `${table(["Room", "Owner", "Hub", "State", "Created", ""], rows, "No active rooms right now.")}
    <div class="toolbar"><button class="button compact" data-v-action="refresh">Refresh</button></div>`;
}

/* ---------- Settings ---------- */

function settingsTab() {
  const s = view.overview.settings;
  return `<form class="form-grid readable-form" data-v-form="settings">
    ${checkbox("enabled", "Voice rooms are on", s.enabled)}
    ${checkbox("controlPanel", "Post a control panel with buttons in each new room's chat", s.controlPanel)}
    ${checkbox("allowClaim", "Let someone in the room claim it after the owner leaves", s.allowClaim)}
    <p class="microcopy full">Owners control their room with the panel or <code>/voice</code>. Staff with the voice.manage permission can control any room.</p>
    <button class="button primary full">Save settings</button>
  </form>`;
}

/* ---------- Events ---------- */

function newHub() {
  return { name: "", enabled: true, channelId: "", nameTemplate: "{user}'s room", userLimit: 0, bitrateKbps: 64, privateByDefault: false, deleteDelaySeconds: 0, allowedRoleIds: [] };
}

function bind() {
  container.querySelectorAll("[data-v-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.vTab;
    history.replaceState({}, "", appPath(`/voice?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-v-hub]").forEach((element) => {
    const open = () => {
      view.editing = view.overview.hubs.find((hub) => hub.id === element.dataset.vHub);
      render();
    };
    element.addEventListener("click", open);
    element.addEventListener("keydown", (event) => { if (event.key === "Enter") open(); });
  });
  container.querySelectorAll("[data-v-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.vAction, button.dataset.value)));
  container.querySelectorAll("form[data-v-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form);
  }));
  bindPickers(container);
}

async function run(message, operation) {
  try {
    const result = await operation();
    if (message) notify(message);
    await load();
    render();
    return result;
  } catch (error) {
    notify(error.message || "That did not work.", "error");
    return undefined;
  }
}

async function action(name, value) {
  switch (name) {
    case "new-hub":
      view.editing = newHub();
      render();
      return;
    case "refresh":
      await run(undefined, async () => undefined);
      return;
    case "delete-hub":
      if (!(await confirmAction({ title: "Delete this hub?", body: "Members can no longer create rooms from it. Existing rooms stay until they are empty.", confirmText: "Delete hub" }))) return;
      await run("Hub deleted.", async () => {
        await sendJson(`voice/hubs/${view.editing.id}`, "DELETE");
        view.editing = undefined;
      });
      return;
    case "delete-room":
      if (!(await confirmAction({ title: "Delete this room?", body: "The voice channel is deleted and everyone in it is disconnected.", confirmText: "Delete room" }))) return;
      await run("Room deleted.", () => sendJson(`voice/rooms/${value}`, "DELETE"));
  }
}

async function submit(form) {
  const data = new FormData(form);
  if (form.dataset.vForm === "settings") {
    await run("Voice room settings saved.", () => sendJson("voice/settings", "PUT", {
      enabled: boolValue(form, "enabled"),
      controlPanel: boolValue(form, "controlPanel"),
      allowClaim: boolValue(form, "allowClaim"),
      expectedRevision: view.overview.settings.revision,
    }));
    return;
  }
  const hub = {
    name: String(data.get("name") ?? "").trim(),
    enabled: boolValue(form, "enabled"),
    channelId: String(data.get("channelId") ?? "").trim(),
    ...optionalValue(data, "categoryId"),
    nameTemplate: String(data.get("nameTemplate") ?? "").trim(),
    userLimit: intValue(data, "userLimit", 0),
    bitrateKbps: intValue(data, "bitrateKbps", 64),
    deleteDelaySeconds: intValue(data, "deleteDelaySeconds", 0),
    privateByDefault: boolValue(form, "privateByDefault"),
    allowedRoleIds: data.getAll("allowedRoleIds"),
  };
  const id = view.editing?.id;
  const saved = await run(id ? "Hub saved." : "Hub created.", () => sendJson(id ? `voice/hubs/${id}` : "voice/hubs", id ? "PUT" : "POST", hub));
  if (saved) {
    view.editing = saved.data;
    render();
  }
}
