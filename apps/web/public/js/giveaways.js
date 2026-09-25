import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import {
  bindPickers,
  boolValue,
  channelLabel,
  channelSelect,
  checkbox,
  dateTime,
  dateTimeField,
  detail,
  intValue,
  loadDirectory,
  memberName,
  memberPicker,
  numberField,
  relative,
  roleName,
  roleNames,
  rolePicker,
  roleSelect,
  textArea,
  textField,
} from "./forms.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";

const TABS = [["active", "Running"], ["ended", "Ended"], ["start", "Start"]];
const DURATION_UNITS = [["1", "minutes"], ["60", "hours"], ["1440", "days"], ["10080", "weeks"]];
const STATUS_LABELS = { RUNNING: "running", PAUSED: "paused", ENDED: "ended", CANCELLED: "cancelled" };
const BONUS_ROWS = 5;

const view = { tab: "active", overview: undefined, selected: undefined, error: undefined };
let container;

export async function renderGiveawaysPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading giveaways...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    view.overview = (await getJson("giveaways/overview")).data;
    view.error = undefined;
    if (view.selected) view.selected = await getJson(`giveaways/${view.selected.giveaway.id}`).then((result) => result.data, () => undefined);
    const giveaways = [...view.overview.active, ...view.overview.ended];
    await loadDirectory([...giveaways.flatMap((item) => [item.hostId, ...item.winnerIds]), ...(view.selected?.entries.map((entry) => entry.userId) ?? [])]);
  } catch (error) {
    view.error = error;
  }
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    const denied = view.error.status === 403;
    container.innerHTML = `<section class="card"><h2>${denied ? "You don't have access to giveaways" : "Giveaways are unavailable"}</h2><p class="microcopy">${denied ? "Ask a server admin for the Manage giveaways permission (giveaways.manage)." : escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  if (!TABS.some(([id]) => id === view.tab)) view.tab = "active";
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Giveaway sections">${TABS.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-g-tab="${id}">${escapeHtml(label)}${id === "active" ? ` (${view.overview.active.length})` : ""}</button>`).join("")}</nav>
    <div>${view.tab === "start" ? startTab() : listTab(view.overview[view.tab])}</div>
  </section>`;
  bind();
}

/* ---------- Lists and details ---------- */

function listTab(giveaways) {
  const rows = giveaways.map((item) => row([
    ["Giveaway", `<strong>#${item.number}</strong>`],
    ["Prize", escapeHtml(item.prize.slice(0, 80))],
    ["State", badge(STATUS_LABELS[item.status])],
    ["Entries", String(item.entrantCount)],
    [view.tab === "active" ? "Ends" : "Winners", view.tab === "active" ? escapeHtml(item.status === "PAUSED" ? "Paused" : relative(item.endsAt)) : item.winnerIds.map(memberName).join(", ") || "—"],
  ], `data-g-item="${escapeHtml(item.id)}" class="${item.id === view.selected?.giveaway.id ? "selected" : ""}" tabindex="0"`));
  return `<section class="grid main-detail">
    <div>${!rows.length && view.tab === "active"
      ? `<div class="empty-state"><p>No running giveaways.</p><button class="button primary" data-g-tab="start">Start a giveaway</button><p class="microcopy">Or use /giveaway start in Discord.</p></div>`
      : table(["Giveaway", "Prize", "State", "Entries", view.tab === "active" ? "Ends" : "Winners"], rows, "No ended giveaways yet.")}</div>
    <div class="card">${giveawayDetail()}</div>
  </section>`;
}

function giveawayDetail() {
  const data = view.selected;
  if (!data) return `<p class="microcopy">Select a giveaway to see its entries and actions.</p>`;
  const item = data.giveaway;
  const running = item.status === "RUNNING" || item.status === "PAUSED";
  const requirements = [
    ...(item.requiredRoleIds.length ? [`Has one of ${roleNames(item.requiredRoleIds)}`] : []),
    ...(item.blockedRoleIds.length ? [`Does not have ${roleNames(item.blockedRoleIds)}`] : []),
    ...(item.minAccountAgeDays ? [`Account at least ${item.minAccountAgeDays} days old`] : []),
    ...(item.minServerDays ? [`In the server at least ${item.minServerDays} days`] : []),
  ];
  const entries = [...data.entries].sort((left, right) => right.entries - left.entries).map((entry) => row([
    ["Member", memberName(entry.userId)],
    ["Entries", String(entry.entries)],
    ["Chance", `${data.totalEntries ? Math.round((entry.entries / data.totalEntries) * 1000) / 10 : 0}%`],
    ["Joined", escapeHtml(relative(entry.createdAt))],
  ]));
  return `<div class="detail-stack">
    <div class="split-line"><h2>#${item.number} · ${escapeHtml(item.prize)}</h2>${badge(STATUS_LABELS[item.status])}</div>
    ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
    ${detail("Channel", escapeHtml(channelLabel(item.channelId)))}
    ${detail("Host", memberName(item.hostId))}
    ${detail("Winners", item.status === "ENDED" ? item.winnerIds.map(memberName).join(", ") || "Nobody entered" : String(item.winnerCount))}
    ${detail(running ? "Ends" : "Ended", escapeHtml(running ? (item.status === "PAUSED" ? "Paused (the timer is stopped)" : dateTime(item.endsAt)) : dateTime(item.endedAt)))}
    ${detail("Requirements", escapeHtml(requirements.join("; ") || "Anyone can enter"))}
    ${item.bonusEntries.length ? detail("Bonus entries", escapeHtml(item.bonusEntries.map((bonus) => `@${roleName(bonus.roleId)} +${bonus.entries}`).join(", "))) : ""}
    ${detail("DM winners", item.dmWinners ? "Yes" : "No")}
    <div class="toolbar">
      ${item.status === "RUNNING" ? `<button class="button compact" data-g-action="pause">Pause</button>` : ""}
      ${item.status === "PAUSED" ? `<button class="button compact" data-g-action="resume">Resume</button>` : ""}
      ${running ? `<button class="button compact primary" data-g-action="end">End now</button><button class="button compact danger" data-g-action="cancel">Cancel</button>` : ""}
      ${item.status === "ENDED" ? `<button class="button compact" data-g-action="reroll">Reroll</button>` : ""}
    </div>
    <h3>Entries · ${data.entries.length} member${data.entries.length === 1 ? "" : "s"}, ${data.totalEntries} total</h3>
    ${table(["Member", "Entries", "Chance", "Joined"], entries, "Nobody has entered yet.")}
  </div>`;
}

/* ---------- Start ---------- */

function startTab() {
  const bonus = Array.from({ length: BONUS_ROWS }, (_, index) => `<div class="question-row full">
      ${roleSelect(`bonus${index}.roleId`, `Bonus role ${index + 1}`, "")}
      ${numberField(`bonus${index}.entries`, "Extra entries", "", 1, 100, false)}
      <span></span>
    </div>`).join("");
  return `<form class="form-grid readable-form" data-g-form="start">
    ${textField("prize", "Prize", "", "Discord Nitro", true, "full")}
    ${textArea("description", "Description (optional)", "")}
    ${numberField("winnerCount", "Number of winners", 1, 1, view.overview.maxWinners)}
    ${channelSelect("channelId", "Channel", "", "TEXT", "Choose a channel", true)}
    ${memberPicker("hostId", "Host (optional)", [], "Winners are told to contact the host. Defaults to you.")}
    <h3 class="full">End</h3>
    <label>Run for<span class="duration-row"><input type="number" name="durationAmount" min="1" max="9999" placeholder="Amount"><select name="durationUnit">${DURATION_UNITS.map(([value, label]) => `<option value="${value}" ${value === "1440" ? "selected" : ""}>${label}</option>`).join("")}</select></span></label>
    ${dateTimeField("endsAt", "Or end at")}
    <h3 class="full">Requirements</h3>
    ${rolePicker("requiredRoleIds", "Required roles", [], "Members need at least one of these roles. Leave empty for everyone.")}
    ${rolePicker("blockedRoleIds", "Blocked roles", [], "Members with any of these roles cannot enter.")}
    ${numberField("minAccountAgeDays", "Minimum account age (days)", 0, 0, 3650)}
    ${numberField("minServerDays", "Minimum days in the server", 0, 0, 3650)}
    <h3 class="full">Bonus entries</h3>
    <p class="microcopy full">Members with these roles get extra entries, which raises their chance to win.</p>
    ${bonus}
    <h3 class="full">Messages</h3>
    ${roleSelect("pingRoleId", "Ping a role (optional)", "")}
    ${checkbox("dmWinners", "DM the winners", true)}
    <button class="button primary full">Start giveaway</button>
  </form>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-g-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.gTab;
    view.selected = undefined;
    history.replaceState({}, "", appPath(`/giveaways?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-g-item]").forEach((element) => {
    const open = () => void select(element.dataset.gItem);
    element.addEventListener("click", open);
    element.addEventListener("keydown", (event) => { if (event.key === "Enter") open(); });
  });
  container.querySelectorAll("[data-g-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.gAction)));
  container.querySelectorAll("form[data-g-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void start(form);
  }));
  bindPickers(container);
}

async function select(id) {
  try {
    view.selected = (await getJson(`giveaways/${encodeURIComponent(id)}`)).data;
    await loadDirectory(view.selected.entries.map((entry) => entry.userId));
    render();
  } catch (error) {
    notify(error.message, "error");
  }
}

async function run(message, operation) {
  try {
    await operation();
    notify(message);
    await load();
    render();
  } catch (error) {
    notify(error.message || "That did not work.", "error");
  }
}

async function action(name) {
  const item = view.selected?.giveaway;
  if (!item) return undefined;
  const path = `giveaways/${encodeURIComponent(item.id)}`;
  switch (name) {
    case "pause":
      return run("Giveaway paused.", () => sendJson(`${path}/pause`, "POST", {}));
    case "resume":
      return run("Giveaway resumed. The end time moved back by the paused time.", () => sendJson(`${path}/resume`, "POST", {}));
    case "end":
      if (!(await confirmAction({ title: `End giveaway #${item.number} now?`, body: "Winners are picked and announced right away.", confirmText: "End now" }))) return undefined;
      return run("Giveaway ended and winners announced.", () => sendJson(`${path}/end`, "POST", {}));
    case "cancel":
      if (!(await confirmAction({ title: `Cancel giveaway #${item.number}?`, body: "No winners are picked. This cannot be undone.", confirmText: "Cancel giveaway" }))) return undefined;
      return run("Giveaway cancelled.", () => sendJson(`${path}/cancel`, "POST", {}));
    case "reroll": {
      const count = window.prompt("How many new winners?", String(item.winnerCount));
      if (count === null) return undefined;
      const winners = Number.parseInt(count, 10);
      return run("New winners picked and announced.", () => sendJson(`${path}/reroll`, "POST", Number.isInteger(winners) && winners > 0 ? { winners } : {}));
    }
    default:
      return undefined;
  }
}

async function start(form) {
  const data = new FormData(form);
  const text = (name) => String(data.get(name) ?? "").trim();
  const amount = intValue(data, "durationAmount", 0);
  const endsAt = text("endsAt");
  const hostId = data.getAll("hostId")[0];
  const bonusEntries = Array.from({ length: BONUS_ROWS }, (_, index) => ({ roleId: text(`bonus${index}.roleId`), entries: intValue(data, `bonus${index}.entries`, 1) }))
    .filter((bonus) => bonus.roleId);
  const body = {
    prize: text("prize"),
    ...(text("description") ? { description: text("description") } : {}),
    winnerCount: intValue(data, "winnerCount", 1),
    channelId: text("channelId"),
    ...(hostId ? { hostId } : {}),
    requiredRoleIds: data.getAll("requiredRoleIds"),
    blockedRoleIds: data.getAll("blockedRoleIds"),
    minAccountAgeDays: intValue(data, "minAccountAgeDays", 0),
    minServerDays: intValue(data, "minServerDays", 0),
    bonusEntries,
    ...(text("pingRoleId") ? { pingRoleId: text("pingRoleId") } : {}),
    dmWinners: boolValue(form, "dmWinners"),
    ...(amount > 0 ? { durationMinutes: amount * Number(text("durationUnit")) } : {}),
    ...(endsAt ? { endsAt: new Date(endsAt).toISOString() } : {}),
  };
  try {
    const created = (await sendJson("giveaways", "POST", body)).data;
    notify(`Giveaway #${created.number} started.`);
    view.tab = "active";
    await load();
    await select(created.id);
  } catch (error) {
    notify(error.message || "That did not work.", "error");
  }
}
