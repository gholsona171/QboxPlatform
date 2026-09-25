import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import {
  bindPickers,
  boolValue,
  channelSelect,
  checkbox,
  detail,
  intValue,
  loadDirectory,
  memberPicker,
  numberField,
  optionalValue,
  roleSelect,
  selectField,
  textArea,
  textField,
} from "./forms.js";
import { confirmAction, escapeHtml, notify, row, table } from "./ui.js";

const TABS = [
  ["upcoming", "Upcoming"],
  ["calendar", "Calendar"],
  ["members", "All birthdays"],
  ["mine", "My birthday"],
  ["settings", "Settings"],
];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const today = new Date();

const view = { tab: "upcoming", overview: undefined, all: [], search: "", month: { year: today.getFullYear(), month: today.getMonth() + 1 }, editing: undefined, error: undefined };
let container;

export async function renderBirthdaysPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading birthdays...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    const [overview, all] = await Promise.all([getJson("birthdays/overview"), getJson(`birthdays${view.search ? `?search=${encodeURIComponent(view.search)}` : ""}`)]);
    view.overview = overview.data;
    view.all = all.data;
    view.error = undefined;
    if (view.overview.can.manage) await loadDirectory();
  } catch (error) {
    view.error = error;
  }
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    container.innerHTML = `<section class="card"><h2>Birthdays are unavailable</h2><p class="microcopy">${escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  const tabs = TABS.filter(([id]) => id !== "settings" || view.overview.can.manage);
  if (!tabs.some(([id]) => id === view.tab)) view.tab = "upcoming";
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Birthday sections">${tabs.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-b-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    ${view.overview.settings.enabled || view.tab === "settings" ? "" : view.overview.can.manage
      ? `<div class="empty-state"><h3>Birthday messages are off.</h3><p>Pick a channel and turn them on in Settings. Members add their date in My birthday or with /birthday set.</p><button class="button primary" data-b-tab="settings">Turn on birthday messages</button></div>`
      : `<p class="microcopy">Birthday messages are off. You can still add yours in My birthday; a server admin can turn them on.</p>`}
    <div>${tabContent()}</div>
  </section>`;
  bind();
}

function tabContent() {
  switch (view.tab) {
    case "calendar": return calendarTab();
    case "members": return membersTab();
    case "mine": return mineTab();
    case "settings": return settingsTab();
    default: return upcomingTab();
  }
}

/* ---------- Upcoming ---------- */

function upcomingTab() {
  const rows = view.overview.upcoming.map((item) => row([
    ["Date", `<strong>${escapeHtml(dateText(item.date))}</strong>`],
    ["Member", escapeHtml(item.displayName)],
    ["When", escapeHtml(whenText(item.daysUntil))],
    ["Turning", item.turning ? String(item.turning) : "—"],
  ]));
  return `<h3>Next 30 days</h3>${table(["Date", "Member", "When", "Turning"], rows, "No birthdays in the next 30 days.")}`;
}

/* ---------- Calendar ---------- */

function calendarTab() {
  const { year, month } = view.month;
  const first = new Date(year, month - 1, 1).getDay();
  const days = new Date(year, month, 0).getDate();
  const leap = new Date(year, 1, 29).getMonth() === 1;
  const onDay = (day) => view.all.filter((item) => item.month === month && (item.day === day || (!leap && month === 2 && day === 28 && item.day === 29)));
  const cells = [
    ...Array.from({ length: first }, () => `<div class="calendar-cell empty"></div>`),
    ...Array.from({ length: days }, (_, index) => {
      const day = index + 1;
      const people = onDay(day);
      const isToday = year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate();
      return `<div class="calendar-cell ${people.length ? "has-birthday" : ""} ${isToday ? "today" : ""}">
        <span class="calendar-day">${day}</span>
        ${people.map((item) => `<span class="calendar-name" title="${escapeHtml(item.displayName)}">🎂 ${escapeHtml(item.displayName)}</span>`).join("")}
      </div>`;
    }),
  ];
  return `<div class="split-line">
      <button class="button compact" data-b-action="prev-month" aria-label="Previous month">‹</button>
      <h3>${escapeHtml(MONTHS[month - 1])} ${year}</h3>
      <button class="button compact" data-b-action="next-month" aria-label="Next month">›</button>
    </div>
    <div class="calendar-grid">${WEEKDAYS.map((day) => `<div class="calendar-head">${day}</div>`).join("")}${cells.join("")}</div>`;
}

/* ---------- All birthdays ---------- */

function membersTab() {
  const manage = view.overview.can.manage;
  const rows = view.all.map((item) => row([
    ["Member", escapeHtml(item.displayName)],
    ["Birthday", escapeHtml(`${MONTHS[item.month - 1]} ${item.day}${item.year ? `, ${item.year}` : ""}`)],
    ["Next", escapeHtml(whenText(item.daysUntil))],
    ["Time zone", escapeHtml(item.timeZone)],
    ...(manage ? [["", `<div class="toolbar"><button class="button compact" data-b-action="edit" data-value="${escapeHtml(item.userId)}">Edit</button><button class="button compact danger" data-b-action="remove-member" data-value="${escapeHtml(item.userId)}">Remove</button></div>`]] : []),
  ]));
  const editing = view.editing ? view.all.find((item) => item.userId === view.editing) : undefined;
  return `<form class="toolbar" data-b-form="search">
      <input name="search" placeholder="Search by name or ID" value="${escapeHtml(view.search)}">
      <button class="button compact">Search</button>
    </form>
    <section class="${manage ? "grid main-detail" : ""}">
      <div>${table(["Member", "Birthday", "Next", "Time zone", ...(manage ? [""] : [])], rows, view.search ? "No birthdays match." : "No birthdays saved yet.")}</div>
      ${manage ? `<form class="card form-grid" data-b-form="member">
        <h3>${editing ? `Edit ${escapeHtml(editing.displayName)}` : "Set a member's birthday"}</h3>
        ${editing ? `<input type="hidden" name="userId" value="${escapeHtml(editing.userId)}"><input type="hidden" name="displayName" value="${escapeHtml(editing.displayName)}">` : memberPicker("userId", "Member", [])}
        ${dateFields(editing ?? {}, true)}
        <button class="button primary full">Save birthday</button>
        ${editing ? `<button type="button" class="button full" data-b-action="new">Set another member's birthday</button>` : ""}
      </form>` : ""}
    </section>`;
}

/* ---------- My birthday ---------- */

function mineTab() {
  const me = view.overview.me;
  const settings = view.overview.settings;
  return `<form class="form-grid readable-form" data-b-form="mine">
    <h3>${me ? "Your birthday" : "Add your birthday"}</h3>
    ${me ? detail("Saved", escapeHtml(`${MONTHS[me.month - 1]} ${me.day}${me.year ? `, ${me.year}` : ""} (${me.timeZone})`)) : ""}
    ${dateFields(me ?? { timeZone: browserZone() }, settings.allowYear)}
    <p class="microcopy full">Your birthday message is posted at ${String(settings.announceHour).padStart(2, "0")}:00 in your time zone.${settings.requireConfirmation ? " You will be asked to confirm the date." : ""}</p>
    <button class="button primary">Save</button>
    ${me ? `<button type="button" class="button danger" data-b-action="remove-mine">Remove my birthday</button>` : ""}
  </form>`;
}

function dateFields(value, allowYear) {
  const zones = timeZones();
  return `${selectField("month", "Month", MONTHS.map((name, index) => [String(index + 1), name]), String(value.month ?? 1))}
    ${numberField("day", "Day", value.day ?? 1, 1, 31)}
    ${allowYear ? numberField("year", "Year (optional)", value.year ?? "", 1900, today.getFullYear(), false) : ""}
    ${allowYear ? checkbox("showAge", "Show age in the birthday message", value.showAge === true) : ""}
    <label class="full">Time zone<input name="timeZone" list="birthdayZones" value="${escapeHtml(value.timeZone ?? "UTC")}" required></label>
    <datalist id="birthdayZones">${zones.map((zone) => `<option value="${escapeHtml(zone)}"></option>`).join("")}</datalist>`;
}

/* ---------- Settings ---------- */

function settingsTab() {
  const s = view.overview.settings;
  return `<form class="form-grid readable-form" data-b-form="settings">
    ${checkbox("enabled", "Birthdays are on", s.enabled)}
    ${channelSelect("channelId", "Announcement channel", s.channelId, "TEXT", "Not set")}
    ${textArea("message", "Message ({user}, {age}, {server})", s.message)}
    ${textField("embedColor", "Color", s.embedColor, "#F47FFF")}
    ${numberField("announceHour", "Post at hour (0-23, member's time zone)", s.announceHour, 0, 23)}
    ${roleSelect("roleId", "Birthday role (for the day)", s.roleId)}
    ${roleSelect("pingRoleId", "Role to ping", s.pingRoleId)}
    ${checkbox("allowYear", "Members can save their birth year", s.allowYear)}
    ${checkbox("requireConfirmation", "Members confirm their date before it is saved", s.requireConfirmation)}
    <p class="microcopy full">The bot needs Manage Roles, and its role must be above the birthday role.</p>
    <input type="hidden" name="expectedRevision" value="${s.revision}">
    <button class="button primary">Save settings</button>
    <button type="button" class="button" data-b-action="test">Send a test message</button>
  </form>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-b-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.bTab;
    history.replaceState({}, "", appPath(`/birthdays?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-b-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.bAction, button.dataset.value)));
  container.querySelectorAll("form[data-b-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form);
  }));
  bindPickers(container);
}

async function run(message, operation) {
  try {
    await operation();
    if (message) notify(message);
    await load();
    render();
  } catch (error) {
    notify(error.message || "That did not work.", "error");
  }
}

async function action(name, value) {
  switch (name) {
    case "prev-month":
    case "next-month": {
      const shift = name === "prev-month" ? -1 : 1;
      const date = new Date(view.month.year, view.month.month - 1 + shift, 1);
      view.month = { year: date.getFullYear(), month: date.getMonth() + 1 };
      render();
      return;
    }
    case "edit":
      view.editing = value;
      render();
      return;
    case "new":
      view.editing = undefined;
      render();
      return;
    case "remove-member":
      if (!(await confirmAction({ title: "Remove birthday?", body: "Their birthday will no longer be announced.", confirmText: "Remove" }))) return;
      view.editing = undefined;
      await run("Birthday removed.", () => sendJson(`birthdays/members/${encodeURIComponent(value)}`, "DELETE"));
      return;
    case "remove-mine":
      if (!(await confirmAction({ title: "Remove your birthday?", body: "It will no longer be announced.", confirmText: "Remove" }))) return;
      await run("Your birthday was removed.", () => sendJson("birthdays/me", "DELETE"));
      return;
    case "test":
      await run("Test message sent.", () => sendJson("birthdays/test", "POST", {}));
      return;
    default:
  }
}

function datePayload(form, data) {
  const year = intValue(data, "year", 0);
  return {
    month: intValue(data, "month", 1),
    day: intValue(data, "day", 1),
    ...(year > 0 ? { year, showAge: boolValue(form, "showAge") } : {}),
    timeZone: String(data.get("timeZone") ?? "UTC").trim(),
  };
}

async function submit(form) {
  const data = new FormData(form);
  switch (form.dataset.bForm) {
    case "search":
      view.search = String(data.get("search") ?? "").trim();
      return run(undefined, async () => undefined);
    case "mine": {
      const body = datePayload(form, data);
      if (view.overview.settings.requireConfirmation) {
        const ok = await confirmAction({ title: "Is this right?", body: `${MONTHS[body.month - 1]} ${body.day}${body.year ? `, ${body.year}` : ""} (${body.timeZone})`, confirmText: "Save birthday" });
        if (!ok) return undefined;
      }
      return run("Your birthday was saved.", () => sendJson("birthdays/me", "PUT", { ...body, confirmed: true }));
    }
    case "member": {
      const userId = data.getAll("userId")[0];
      if (!userId) return notify("Choose a member first.", "error");
      const chosen = form.querySelector(`.chip-picker[data-name="userId"] .chip`)?.textContent?.replace("×", "").trim();
      const displayName = String(data.get("displayName") ?? "").trim() || chosen;
      view.editing = undefined;
      return run("Birthday saved.", () => sendJson(`birthdays/members/${encodeURIComponent(userId)}`, "PUT", { ...datePayload(form, data), ...(displayName && displayName !== userId ? { displayName } : {}) }));
    }
    case "settings":
      return run("Birthday settings saved.", () => sendJson("birthdays/settings", "PUT", {
        enabled: boolValue(form, "enabled"),
        ...optionalValue(data, "channelId"),
        message: String(data.get("message") ?? "").trim(),
        embedColor: String(data.get("embedColor") ?? "").trim(),
        ...optionalValue(data, "roleId"),
        announceHour: intValue(data, "announceHour", 9),
        ...optionalValue(data, "pingRoleId"),
        allowYear: boolValue(form, "allowYear"),
        requireConfirmation: boolValue(form, "requireConfirmation"),
        expectedRevision: intValue(data, "expectedRevision", 0),
      }));
    default:
      return undefined;
  }
}

/* ---------- Helpers ---------- */

function dateText(value) {
  const [, month, day] = value.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}`;
}

function whenText(days) {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function browserZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function timeZones() {
  const zones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  return zones.includes("UTC") ? zones : ["UTC", ...zones];
}
