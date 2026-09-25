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
  numberField,
  relative,
  roleNames,
  rolePicker,
  roleSelect,
  selectField,
  textField,
} from "./forms.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";

const TABS = [["open", "Open"], ["closed", "Closed"], ["create", "Create"]];
const DURATION_UNITS = [["1", "minutes"], ["60", "hours"], ["1440", "days"]];
const VISIBILITY = [["LIVE", "Live while voting"], ["AFTER_CLOSE", "Only after it closes"]];

const view = { tab: "open", overview: undefined, selected: undefined, error: undefined };
let container;

export async function renderPollsPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading polls...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    view.overview = (await getJson("polls/overview")).data;
    view.error = undefined;
    if (view.selected) view.selected = await getJson(`polls/${view.selected.poll.id}`).then((result) => result.data, () => undefined);
    const polls = [...view.overview.open, ...view.overview.closed];
    const voters = view.selected ? Object.values(view.selected.votersByOption).flat().map((voter) => voter.userId) : [];
    await loadDirectory([...polls.map((poll) => poll.createdById), ...voters]);
  } catch (error) {
    view.error = error;
  }
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    const denied = view.error.status === 403;
    container.innerHTML = `<section class="card"><h2>${denied ? "You don't have access to polls" : "Polls are unavailable"}</h2><p class="microcopy">${denied ? "Ask a server admin for the Create polls permission (polls.create) or the Manage polls permission (polls.manage)." : escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  const tabs = TABS.filter(([id]) => id !== "create" || view.overview.can.create);
  if (!tabs.some(([id]) => id === view.tab)) view.tab = "open";
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Poll sections">${tabs.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-p-tab="${id}">${escapeHtml(label)}${id === "open" ? ` (${view.overview.open.length})` : ""}</button>`).join("")}</nav>
    <div>${view.tab === "create" ? createTab() : listTab(view.tab === "open" ? view.overview.open : view.overview.closed)}</div>
  </section>`;
  bind();
}

/* ---------- Lists and details ---------- */

function listTab(polls) {
  const rows = polls.map((poll) => row([
    ["Poll", `<strong>#${poll.number}</strong>`],
    ["Question", escapeHtml(poll.question.slice(0, 90))],
    ["Voters", String(poll.voterCount)],
    ["Channel", escapeHtml(channelLabel(poll.channelId))],
    [poll.status === "OPEN" ? "Ends" : "Closed", escapeHtml(poll.status === "OPEN" ? (poll.endsAt ? relative(poll.endsAt) : "When closed") : relative(poll.closedAt ?? poll.updatedAt))],
  ], `data-p-poll="${escapeHtml(poll.id)}" class="${poll.id === view.selected?.poll.id ? "selected" : ""}" tabindex="0"`));
  return `<section class="grid main-detail">
    <div>${!rows.length && view.tab === "open"
      ? `<div class="empty-state"><p>No open polls.</p>${view.overview.can.create ? `<button class="button primary" data-p-tab="create">Create a poll</button><p class="microcopy">Or use /poll create in Discord.</p>` : ""}</div>`
      : table(["Poll", "Question", "Voters", "Channel", view.tab === "open" ? "Ends" : "Closed"], rows, "No closed polls yet.")}</div>
    <div class="card">${pollDetail()}</div>
  </section>`;
}

function pollDetail() {
  const results = view.selected;
  if (!results) return `<p class="microcopy">Select a poll to see results and voters.</p>`;
  const { poll } = results;
  const can = view.overview.can;
  const owner = can.manage || results.poll.createdById === view.overview.me;
  const bars = poll.options.map((option) => {
    const count = results.counts[option.id] ?? 0;
    const percent = results.voters ? Math.round((count / results.voters) * 100) : 0;
    const voters = results.votersByOption[option.id];
    return `<li><strong>${escapeHtml(option.emoji ? `${option.emoji} ${option.label}` : option.label)}</strong>
      <small>${count} vote${count === 1 ? "" : "s"} · ${percent}%</small>
      <div style="height:8px;border-radius:4px;background:var(--border)"><div style="height:8px;border-radius:4px;background:var(--accent);width:${percent}%"></div></div>
      ${voters?.length ? `<small>${voters.map((voter) => memberName(voter.userId)).join(", ")}</small>` : ""}</li>`;
  }).join("");
  return `<div class="detail-stack">
    <div class="split-line"><h2>Poll #${poll.number}</h2>${badge(poll.status === "OPEN" ? "open" : "closed")}</div>
    <p>${escapeHtml(poll.question)}</p>
    ${detail("Channel", escapeHtml(channelLabel(poll.channelId)))}
    ${detail("Created by", memberName(poll.createdById))}
    ${detail("Created", escapeHtml(dateTime(poll.createdAt)))}
    ${detail(poll.status === "OPEN" ? "Ends" : "Closed", escapeHtml(poll.status === "OPEN" ? (poll.endsAt ? dateTime(poll.endsAt) : "When closed by staff") : dateTime(poll.closedAt)))}
    ${detail("Choices", poll.maxChoices === 1 ? "Pick one" : `Pick up to ${poll.maxChoices}`)}
    ${detail("Results", poll.resultsVisibility === "LIVE" ? "Live while voting" : "Only after it closes")}
    ${detail("Votes", poll.anonymous ? "Anonymous" : "Public")}
    ${detail("Changing votes", poll.allowVoteChange ? "Allowed" : "Not allowed")}
    ${poll.allowedRoleIds.length ? detail("Who can vote", escapeHtml(roleNames(poll.allowedRoleIds))) : ""}
    <h3>Results · ${results.voters} voter${results.voters === 1 ? "" : "s"}</h3>
    <ul class="timeline">${bars}</ul>
    <div class="toolbar">
      ${owner && poll.status === "OPEN" ? `<button class="button compact" data-p-action="close">Close now</button>` : ""}
      ${owner && poll.status === "CLOSED" ? `<button class="button compact" data-p-action="reopen">Reopen</button>` : ""}
      ${can.manage ? `<a class="button compact" href="${escapeHtml(appPath(`/api/v1/polls/${encodeURIComponent(poll.id)}/export`))}" download>Export CSV</a>` : ""}
      ${can.manage ? `<button class="button compact danger" data-p-action="delete">Delete</button>` : ""}
    </div>
  </div>`;
}

/* ---------- Create ---------- */

function createTab() {
  const options = Array.from({ length: view.overview.maxOptions }, (_, index) => `<div class="question-row full">
      <input name="option${index}.label" maxlength="80" placeholder="Option ${index + 1}${index < 2 ? "" : " (optional)"}" aria-label="Option ${index + 1}" ${index < 2 ? "required" : ""}>
      <input name="option${index}.emoji" maxlength="64" placeholder="Emoji (optional)" aria-label="Emoji for option ${index + 1}">
      <span></span>
    </div>`).join("");
  return `<form class="form-grid readable-form" data-p-form="create">
    ${textField("question", "Question", "", "What should we play this weekend?", true, "full")}
    <h3 class="full">Options</h3>
    <p class="microcopy full">2 to ${view.overview.maxOptions} options. Leave extra rows empty.</p>
    ${options}
    <h3 class="full">Voting</h3>
    ${numberField("maxChoices", "Options each member can pick", 1, 1, view.overview.maxOptions)}
    ${selectField("resultsVisibility", "Show results", VISIBILITY, "LIVE")}
    ${checkbox("anonymous", "Anonymous (hide who voted for what)", false)}
    ${checkbox("allowVoteChange", "Let members change or remove their vote", true)}
    ${rolePicker("allowedRoleIds", "Who can vote", [], "Leave empty to let everyone vote.")}
    <h3 class="full">Posting</h3>
    ${channelSelect("channelId", "Channel", "", "TEXT", "Choose a channel", true)}
    ${roleSelect("pingRoleId", "Ping a role (optional)", "")}
    <h3 class="full">End</h3>
    <label>Run for<span class="duration-row"><input type="number" name="durationAmount" min="1" max="9999" placeholder="Leave empty"><select name="durationUnit">${DURATION_UNITS.map(([value, label]) => `<option value="${value}" ${value === "60" ? "selected" : ""}>${label}</option>`).join("")}</select></span></label>
    ${dateTimeField("endsAt", "Or end at")}
    <p class="microcopy full">Leave both empty to keep the poll open until you close it.</p>
    <button class="button primary full">Post poll</button>
  </form>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-p-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.pTab;
    view.selected = undefined;
    history.replaceState({}, "", appPath(`/polls?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-p-poll]").forEach((element) => {
    const open = () => void select(element.dataset.pPoll);
    element.addEventListener("click", open);
    element.addEventListener("keydown", (event) => { if (event.key === "Enter") open(); });
  });
  container.querySelectorAll("[data-p-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.pAction)));
  container.querySelectorAll("form[data-p-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void create(form);
  }));
  bindPickers(container);
}

async function select(id) {
  try {
    view.selected = (await getJson(`polls/${encodeURIComponent(id)}`)).data;
    await loadDirectory(Object.values(view.selected.votersByOption).flat().map((voter) => voter.userId));
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
  const poll = view.selected?.poll;
  if (!poll) return;
  const path = `polls/${encodeURIComponent(poll.id)}`;
  if (name === "close") return run("Poll closed. Results were posted in Discord.", () => sendJson(`${path}/close`, "POST", {}));
  if (name === "reopen") {
    const hours = window.prompt("Reopen for how many hours? Leave empty to keep it open until you close it.", "");
    if (hours === null) return undefined;
    const amount = Number.parseInt(hours, 10);
    return run("Poll reopened.", () => sendJson(`${path}/reopen`, "POST", Number.isInteger(amount) && amount > 0 ? { durationMinutes: amount * 60 } : {}));
  }
  if (name === "delete") {
    if (!(await confirmAction({ title: `Delete poll #${poll.number}?`, body: "The poll message and all votes are removed. This cannot be undone.", confirmText: "Delete" }))) return undefined;
    return run("Poll deleted.", async () => {
      await sendJson(path, "DELETE");
      view.selected = undefined;
    });
  }
  return undefined;
}

async function create(form) {
  const data = new FormData(form);
  const text = (name) => String(data.get(name) ?? "").trim();
  const options = Array.from({ length: view.overview.maxOptions }, (_, index) => ({ label: text(`option${index}.label`), emoji: text(`option${index}.emoji`) }))
    .filter((option) => option.label)
    .map((option) => (option.emoji ? option : { label: option.label }));
  const amount = intValue(data, "durationAmount", 0);
  const endsAt = text("endsAt");
  const body = {
    question: text("question"),
    options,
    maxChoices: intValue(data, "maxChoices", 1),
    resultsVisibility: text("resultsVisibility"),
    anonymous: boolValue(form, "anonymous"),
    allowVoteChange: boolValue(form, "allowVoteChange"),
    allowedRoleIds: data.getAll("allowedRoleIds"),
    channelId: text("channelId"),
    ...(text("pingRoleId") ? { pingRoleId: text("pingRoleId") } : {}),
    ...(amount > 0 ? { durationMinutes: amount * Number(text("durationUnit")) } : {}),
    ...(endsAt ? { endsAt: new Date(endsAt).toISOString() } : {}),
  };
  try {
    const created = (await sendJson("polls", "POST", body)).data;
    notify(`Poll #${created.number} posted.`);
    view.tab = "open";
    await load();
    await select(created.id);
  } catch (error) {
    notify(error.message || "That did not work.", "error");
  }
}
