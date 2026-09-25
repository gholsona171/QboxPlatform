import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import {
  bindPickers,
  boolValue,
  channelLabel,
  channelSelect,
  checkbox,
  dateTime,
  intValue,
  loadDirectory,
  relative,
  roleName,
  rolePicker,
  selectField,
  textArea,
  textField,
} from "./forms.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";

const TABS = [
  ["messages", "Messages"],
  ["editor", "Editor"],
  ["history", "History"],
];
const TYPES = [["ONCE", "Once"], ["INTERVAL", "Every few minutes or hours"], ["DAILY", "Every day"], ["WEEKLY", "Every week"], ["MONTHLY", "Every month"]];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MAX_FIELDS = 10;

const view = { tab: "messages", messages: [], runs: [], editingId: undefined, historyFor: "", error: undefined };
let container;

export async function renderScheduledPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading scheduled messages...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    const [messages, runs] = await Promise.all([
      getJson("scheduled-messages"),
      getJson(`scheduled-messages/runs?limit=100${view.historyFor ? `&messageId=${encodeURIComponent(view.historyFor)}` : ""}`),
    ]);
    view.messages = messages.data;
    view.runs = runs.data;
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
    container.innerHTML = `<section class="card"><h2>${denied ? "You don't have access to scheduled messages" : "Scheduled messages are unavailable"}</h2><p class="microcopy">${denied ? "Ask a server admin for the scheduled.manage permission." : escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  if (!TABS.some(([id]) => id === view.tab)) view.tab = "messages";
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Scheduled message sections">${TABS.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-s-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    <div>${view.tab === "editor" ? editorTab() : view.tab === "history" ? historyTab() : messagesTab()}</div>
  </section>`;
  bind();
}

/* ---------- Messages ---------- */

function status(message) {
  if (!message.enabled) return badge("paused");
  return message.nextRunAt ? badge("active") : badge("finished");
}

function messagesTab() {
  const rows = view.messages.map((message) => row([
    ["Name", `<strong>${escapeHtml(message.name)}</strong>`],
    ["Channel", escapeHtml(channelLabel(message.channelId))],
    ["Schedule", escapeHtml(message.summary)],
    ["Next post", message.nextRunAt ? `${escapeHtml(dateTime(message.nextRunAt))}<br><small>${escapeHtml(relative(message.nextRunAt))}</small>` : "—"],
    ["Status", status(message)],
    ["Posts", escapeHtml(`${message.runCount}${message.maxRuns ? ` / ${message.maxRuns}` : ""}`)],
    ["", `<div class="toolbar">
      <button class="button compact primary" data-s-action="send" data-value="${escapeHtml(message.id)}">Send now</button>
      <button class="button compact" data-s-action="${message.enabled ? "pause" : "resume"}" data-value="${escapeHtml(message.id)}">${message.enabled ? "Pause" : "Resume"}</button>
      <button class="button compact" data-s-action="edit" data-value="${escapeHtml(message.id)}">Edit</button>
      <button class="button compact" data-s-action="history" data-value="${escapeHtml(message.id)}">History</button>
      <button class="button compact danger" data-s-action="delete" data-value="${escapeHtml(message.id)}">Delete</button>
    </div>`],
  ]));
  return `<div class="split-line"><h3>Scheduled messages</h3><button class="button primary compact" data-s-action="new">+ New message</button></div>
    ${table(["Name", "Channel", "Schedule", "Next post", "Status", "Posts", ""], rows, "No scheduled messages yet.")}`;
}

/* ---------- Editor ---------- */

function blankMessage() {
  return {
    name: "",
    channelId: "",
    content: "",
    pingRoleIds: [],
    schedule: { type: "DAILY", timeZone: browserZone(), time: "09:00" },
    enabled: true,
    deletePrevious: false,
    pin: false,
  };
}

function editorTab() {
  const editing = view.messages.find((message) => message.id === view.editingId);
  const m = editing ?? blankMessage();
  const s = m.schedule;
  const embed = m.embed ?? { fields: [] };
  const show = (types) => `data-show="${types}" ${types.split(" ").includes(s.type) ? "" : "hidden"}`;
  return `<section class="grid editor-layout">
    <div class="grid"><h3>Preview in Discord</h3><div id="scheduledPreview">${preview(m)}</div></div>
    <form class="card form-grid" data-s-form="message">
      <h3>${editing ? `Edit “${escapeHtml(editing.name)}”` : "New scheduled message"}</h3>
      ${textField("name", "Name (only staff see this)", m.name, "", true)}
      ${channelSelect("channelId", "Post in channel", m.channelId, "TEXT", "Choose a channel", true)}
      ${rolePicker("pingRoleIds", "Roles to ping", m.pingRoleIds)}
      ${textArea("content", "Message text", m.content ?? "")}
      <fieldset class="full"><legend>Embed (optional)</legend>
        ${textField("embed.title", "Title", embed.title ?? "", "", false, "full")}
        ${textArea("embed.description", "Description", embed.description ?? "")}
        ${textField("embed.color", "Color", embed.color ?? "", "#5865F2")}
        ${textField("embed.imageUrl", "Image link", embed.imageUrl ?? "", "https://...")}
        ${textField("embed.footer", "Footer", embed.footer ?? "", "", false, "full")}
        <div class="full field-list" id="embedFields">${embed.fields.map(fieldRow).join("")}</div>
        <button type="button" class="button compact full" data-s-action="add-field">+ Add field</button>
      </fieldset>
      <fieldset class="full"><legend>When to post</legend>
        ${selectField("schedule.type", "Repeat", TYPES, s.type)}
        <label>Time zone<input name="schedule.timeZone" list="scheduleZones" value="${escapeHtml(s.timeZone)}" required></label>
        <datalist id="scheduleZones">${timeZones().map((zone) => `<option value="${escapeHtml(zone)}"></option>`).join("")}</datalist>
        <label ${show("ONCE")}>Date and time<input type="datetime-local" name="schedule.runAt" value="${escapeHtml(s.runAt ?? "")}"></label>
        <label ${show("INTERVAL")}>Every (minutes, at least 10)<input type="number" name="schedule.intervalMinutes" min="10" max="525600" value="${escapeHtml(s.intervalMinutes ?? 60)}"></label>
        <label ${show("INTERVAL DAILY WEEKLY MONTHLY")}>Time<input type="time" name="schedule.time" value="${escapeHtml(s.time ?? "09:00")}"></label>
        <div class="full weekday-row" ${show("WEEKLY")}>${WEEKDAYS.map((day, index) => `<label class="checkbox"><input type="checkbox" name="schedule.weekdays" value="${index}" ${(s.weekdays ?? [1]).includes(index) ? "checked" : ""}> ${day.slice(0, 3)}</label>`).join("")}</div>
        <label ${show("MONTHLY")}>Day of the month<input type="number" name="schedule.dayOfMonth" min="1" max="31" value="${escapeHtml(s.dayOfMonth ?? 1)}"></label>
        <label ${show("INTERVAL DAILY WEEKLY MONTHLY")}>Start date (optional)<input type="date" name="schedule.startDate" value="${escapeHtml(s.startDate ?? "")}"></label>
        <label ${show("INTERVAL DAILY WEEKLY MONTHLY")}>End date (optional)<input type="date" name="schedule.endDate" value="${escapeHtml(s.endDate ?? "")}"></label>
        <p class="microcopy full" ${show("INTERVAL")}>With a start date, the first post is at the time above on that day. Without one, it counts from when you save.</p>
        <p class="microcopy full" ${show("MONTHLY")}>Months without that day use their last day.</p>
      </fieldset>
      ${checkbox("enabled", "Active (uncheck to pause)", m.enabled)}
      ${checkbox("deletePrevious", "Delete the previous post when posting again", m.deletePrevious)}
      ${checkbox("pin", "Pin each post", m.pin)}
      <label>Stop after this many posts (optional)<input type="number" name="maxRuns" min="1" max="100000" value="${escapeHtml(m.maxRuns ?? "")}"></label>
      <button class="button primary full">${editing ? "Save changes" : "Create message"}</button>
      ${editing ? `<button type="button" class="button full" data-s-action="new">Start a new message instead</button>` : ""}
    </form>
  </section>`;
}

function fieldRow(field = { name: "", value: "", inline: false }) {
  return `<div class="question-row embed-field">
    <input name="field.name" placeholder="Field name" value="${escapeHtml(field.name)}" aria-label="Field name">
    <input name="field.value" placeholder="Field value" value="${escapeHtml(field.value)}" aria-label="Field value">
    <span class="toolbar"><label class="checkbox"><input type="checkbox" data-field-inline ${field.inline ? "checked" : ""}> Inline</label><button type="button" class="button compact danger" data-field-remove aria-label="Remove field">×</button></span>
  </div>`;
}

/** Renders the post the way Discord shows it. */
function preview(message) {
  const embed = message.embed;
  const color = /^#[0-9a-f]{6}$/i.test(embed?.color ?? "") ? embed.color : "#1e1f22";
  const pings = message.pingRoleIds.map((id) => `<span class="dc-mention">@${escapeHtml(roleName(id))}</span>`).join(" ");
  const hasEmbed = embed && (embed.title || embed.description || embed.imageUrl || embed.fields.length);
  return `<div class="dc-message">
    <div class="dc-avatar">QB</div>
    <div class="dc-body">
      <div class="dc-author">Qbox <span class="dc-bot">APP</span></div>
      ${pings || message.content ? `<p class="dc-content">${pings} ${escapeHtml(message.content ?? "")}</p>` : ""}
      ${hasEmbed ? `<div class="dc-embed" style="border-left-color:${escapeHtml(color)}">
        ${embed.title ? `<strong>${escapeHtml(embed.title)}</strong>` : ""}
        ${embed.description ? `<p>${escapeHtml(embed.description)}</p>` : ""}
        ${embed.fields.length ? `<div class="dc-fields">${embed.fields.map((field) => `<div class="dc-field ${field.inline ? "" : "full"}"><strong>${escapeHtml(field.name)}</strong><p>${escapeHtml(field.value)}</p></div>`).join("")}</div>` : ""}
        ${embed.imageUrl ? `<p class="microcopy">[image]</p>` : ""}
        ${embed.footer ? `<small>${escapeHtml(embed.footer)}</small>` : ""}
      </div>` : ""}
      ${!pings && !message.content && !hasEmbed ? `<p class="microcopy">Add message text or an embed.</p>` : ""}
    </div>
  </div>`;
}

/* ---------- History ---------- */

function historyTab() {
  const nameOf = (id) => view.messages.find((message) => message.id === id)?.name ?? "Deleted message";
  const rows = view.runs.map((run) => row([
    ["When", escapeHtml(dateTime(run.ranAt))],
    ["Message", escapeHtml(nameOf(run.messageId))],
    ["Result", `${badge(run.success ? "sent" : "failed")}${run.manual ? " <small>sent now</small>" : ""}`],
    ["Details", run.success ? `<small>Message ${escapeHtml(run.discordMessageId ?? "")}</small>` : escapeHtml(run.error ?? "")],
  ]));
  return `<form class="toolbar" data-s-form="history">
      <select name="messageId"><option value="">All messages</option>${view.messages.map((message) => `<option value="${escapeHtml(message.id)}" ${message.id === view.historyFor ? "selected" : ""}>${escapeHtml(message.name)}</option>`).join("")}</select>
      <button class="button compact">Show</button>
    </form>
    ${table(["When", "Message", "Result", "Details"], rows, "Nothing has been posted yet.")}`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-s-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.sTab;
    history.replaceState({}, "", appPath(`/scheduled?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-s-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.sAction, button.dataset.value)));
  container.querySelectorAll("form[data-s-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form);
  }));
  bindPickers(container);
  const form = container.querySelector('form[data-s-form="message"]');
  if (!form) return;
  const refresh = () => {
    const type = form.elements["schedule.type"].value;
    form.querySelectorAll("[data-show]").forEach((element) => { element.hidden = !element.dataset.show.split(" ").includes(type); });
    document.getElementById("scheduledPreview").innerHTML = preview(payload(form));
  };
  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);
  form.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-field-remove]");
    if (!remove) return;
    remove.closest(".embed-field")?.remove();
    refresh();
  });
}

async function run(message, operation) {
  try {
    const result = await operation();
    if (message) notify(typeof message === "function" ? message(result) : message, result?.data?.success === false ? "error" : "success");
    await load();
    render();
  } catch (error) {
    notify(error.message || "That did not work.", "error");
  }
}

async function action(name, value) {
  const path = (suffix = "") => `scheduled-messages/${encodeURIComponent(value)}${suffix}`;
  switch (name) {
    case "new":
      view.editingId = undefined;
      view.tab = "editor";
      render();
      return;
    case "edit":
      view.editingId = value;
      view.tab = "editor";
      render();
      return;
    case "history":
      view.historyFor = value;
      view.tab = "history";
      await run(undefined, async () => undefined);
      return;
    case "send":
      await run((result) => (result.data.success ? "Posted." : `Could not post: ${result.data.error ?? "Discord rejected it."}`), () => sendJson(path("/send"), "POST", {}));
      return;
    case "pause":
      await run("Paused.", () => sendJson(path("/pause"), "POST", {}));
      return;
    case "resume":
      await run("Resumed.", () => sendJson(path("/resume"), "POST", {}));
      return;
    case "delete":
      if (!(await confirmAction({ title: "Delete this scheduled message?", body: "Its history is deleted too. Posts already in Discord stay.", confirmText: "Delete" }))) return;
      if (view.editingId === value) view.editingId = undefined;
      await run("Deleted.", () => sendJson(path(), "DELETE"));
      return;
    case "add-field": {
      const list = document.getElementById("embedFields");
      if (list.querySelectorAll(".embed-field").length >= MAX_FIELDS) return notify(`An embed can have at most ${MAX_FIELDS} fields.`, "error");
      list.insertAdjacentHTML("beforeend", fieldRow());
      return;
    }
    default:
  }
}

/** Form values in the shape the API expects. */
function payload(form) {
  const data = new FormData(form);
  const text = (name) => String(data.get(name) ?? "").trim();
  const type = text("schedule.type");
  const optional = (key, value) => (value ? { [key]: value } : {});
  const fields = [...form.querySelectorAll(".embed-field")].map((element) => ({
    name: element.querySelector('[name="field.name"]').value.trim(),
    value: element.querySelector('[name="field.value"]').value.trim(),
    inline: element.querySelector("[data-field-inline]").checked,
  })).filter((field) => field.name || field.value);
  const embed = {
    ...optional("title", text("embed.title")),
    ...optional("description", text("embed.description")),
    ...optional("color", text("embed.color")),
    ...optional("imageUrl", text("embed.imageUrl")),
    ...optional("footer", text("embed.footer")),
    fields,
  };
  const hasEmbed = embed.title || embed.description || embed.imageUrl || embed.footer || fields.length;
  const repeating = type !== "ONCE";
  const maxRuns = intValue(data, "maxRuns", 0);
  return {
    name: text("name"),
    channelId: text("channelId"),
    ...optional("content", text("content")),
    ...(hasEmbed ? { embed } : {}),
    pingRoleIds: data.getAll("pingRoleIds"),
    schedule: {
      type,
      timeZone: text("schedule.timeZone"),
      ...(type === "ONCE" ? optional("runAt", text("schedule.runAt")) : {}),
      ...(type === "INTERVAL" ? { intervalMinutes: intValue(data, "schedule.intervalMinutes", 60) } : {}),
      ...(repeating ? optional("time", text("schedule.time")) : {}),
      ...(type === "WEEKLY" ? { weekdays: data.getAll("schedule.weekdays").map(Number) } : {}),
      ...(type === "MONTHLY" ? { dayOfMonth: intValue(data, "schedule.dayOfMonth", 1) } : {}),
      ...(repeating ? optional("startDate", text("schedule.startDate")) : {}),
      ...(repeating ? optional("endDate", text("schedule.endDate")) : {}),
    },
    enabled: boolValue(form, "enabled"),
    deletePrevious: boolValue(form, "deletePrevious"),
    pin: boolValue(form, "pin"),
    ...(maxRuns > 0 ? { maxRuns } : {}),
  };
}

async function submit(form) {
  if (form.dataset.sForm === "history") {
    view.historyFor = String(new FormData(form).get("messageId") ?? "");
    return run(undefined, async () => undefined);
  }
  const body = payload(form);
  const id = view.editingId;
  return run(id ? "Saved." : "Scheduled message created.", async () => {
    const result = await sendJson(id ? `scheduled-messages/${encodeURIComponent(id)}` : "scheduled-messages", id ? "PUT" : "POST", body);
    view.editingId = result.data.id;
    return result;
  });
}

/* ---------- Helpers ---------- */

function browserZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function timeZones() {
  const zones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  return zones.includes("UTC") ? zones : ["UTC", ...zones];
}
