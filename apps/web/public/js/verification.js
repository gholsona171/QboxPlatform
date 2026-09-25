import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import {
  bindPickers,
  boolValue,
  channelLabel,
  channelSelect,
  checkbox,
  dateTime,
  detail,
  intValue,
  loadDirectory,
  memberName,
  memberPicker,
  numberField,
  optionalValue,
  relative,
  rolePicker,
  roleSelect,
  selectField,
  textArea,
  textField,
} from "./forms.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";

const TABS = [
  ["activity", "Activity"],
  ["settings", "Settings"],
  ["panel", "Panel"],
];
const RESULT_LABELS = { PASSED: "Passed", FAILED: "Failed", DENIED_AGE: "Denied: new account", KICKED: "Kicked", MANUAL: "Verified by staff", REVOKED: "Unverified by staff" };
const MODES = [["BUTTON", "Button: click to verify"], ["CAPTCHA", "Code: type the code Qbox shows"], ["QUESTION", "Questions: answer your questions"]];
const AGE_ACTIONS = [["DENY", "Don't let them verify"], ["KICK", "Kick them"], ["FLAG", "Let them verify, but flag them in the log"]];
const QUESTION_ROWS = 5;

const view = { tab: "activity", overview: undefined, attempts: [], filters: { result: "", search: "" }, error: undefined };
let container;

export async function renderVerificationPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading verification...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    const [overview, attempts] = await Promise.all([getJson("verification/overview"), getJson(`verification/attempts?${attemptsQuery()}`)]);
    view.overview = overview.data;
    view.attempts = attempts.data;
    view.error = undefined;
    await loadDirectory(view.attempts.flatMap((item) => [item.userId, ...(item.staffId ? [item.staffId] : [])]));
  } catch (error) {
    view.error = error;
  }
}

function attemptsQuery() {
  const query = new URLSearchParams({ limit: "100" });
  if (view.filters.result) query.set("result", view.filters.result);
  if (view.filters.search) query.set("search", view.filters.search);
  return query.toString();
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    const denied = view.error.status === 403;
    container.innerHTML = `<section class="card"><h2>${denied ? "You don't have access to verification" : "Verification is unavailable"}</h2><p class="microcopy">${denied ? "Ask a server admin for the Verify members permission (verification.members) or the Manage verification permission (verification.manage)." : escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  const tabs = TABS.filter(([id]) => id === "activity" || view.overview.can.manage);
  if (!tabs.some(([id]) => id === view.tab)) view.tab = "activity";
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Verification sections">${tabs.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-v-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    <div>${view.tab === "settings" ? settingsTab() : view.tab === "panel" ? panelTab() : activityTab()}</div>
  </section>`;
  bind();
}

/* ---------- Activity ---------- */

function activityTab() {
  const { stats, settings, can } = view.overview;
  const metric = (label, value) => `<div class="card metric"><span class="metric-label">${escapeHtml(label)}</span><strong class="metric-value">${escapeHtml(String(value))}</strong></div>`;
  const rows = view.attempts.map((item) => row([
    ["When", `<span title="${escapeHtml(dateTime(item.createdAt))}">${escapeHtml(relative(item.createdAt))}</span>`],
    ["Member", `${escapeHtml(item.userName)} <small><code>${escapeHtml(item.userId)}</code></small>`],
    ["Result", badge(RESULT_LABELS[item.result] ?? item.result)],
    ["Details", escapeHtml((item.reason ?? "—").slice(0, 100))],
    ["By", item.staffId ? memberName(item.staffId) : item.source === "AUTOMATIC" ? "Qbox" : "Member"],
  ]));
  if (!settings.enabled) {
    return `<div class="empty-state">
      <h3>Verification is off. New members get in without checking.</h3>
      ${can.manage
        ? `<p>Turn it on in Settings, then post the Verify button in Panel.</p><button class="button primary" data-v-tab="settings">Set up verification</button>`
        : `<p class="microcopy">Ask a server admin to set it up.</p>`}
    </div>`;
  }
  return `
    <section class="grid cols-4">
      ${metric("Verified (24h)", stats.verified24h)}${metric("Failed (24h)", stats.failed24h)}${metric("Waiting to verify", stats.pending)}${metric("Kicked (24h)", stats.kicked24h)}
    </section>
    <section class="grid main-detail">
      <div>
        <form class="toolbar" data-v-form="filters">
          <input name="search" placeholder="Search member name, ID, or details" value="${escapeHtml(view.filters.search)}">
          <select name="result"><option value="">All results</option>${Object.entries(RESULT_LABELS).map(([value, label]) => `<option value="${value}" ${view.filters.result === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}</select>
          <button class="button compact">Filter</button>
        </form>
        ${table(["When", "Member", "Result", "Details", "By"], rows, "No verification attempts yet.")}
        <p class="microcopy">Denied for a new account in the last 24 hours: ${stats.deniedAge24h}. Verified all time: ${stats.verifiedTotal}.</p>
      </div>
      ${can.members ? memberTools() : ""}
    </section>`;
}

function memberTools() {
  return `<form class="card form-grid" data-v-form="member">
    <h3>Check or change a member</h3>
    ${memberPicker("userId", "Member", [])}
    ${textField("reason", "Reason or note (optional)", "", "", false, "full")}
    <button class="button" name="op" value="status">Check status</button>
    <button class="button primary" name="op" value="verify">Verify</button>
    <button class="button danger full" name="op" value="unverify">Unverify</button>
    <div id="memberStatus" class="full"></div>
  </form>`;
}

/* ---------- Settings ---------- */

function settingsTab() {
  const s = view.overview.settings;
  const questions = Array.from({ length: QUESTION_ROWS }, (_, index) => {
    const question = s.questions[index] ?? {};
    return `<div class="question-row full">
      <input name="q${index}.prompt" maxlength="45" placeholder="Question ${index + 1}" value="${escapeHtml(question.prompt ?? "")}" aria-label="Question ${index + 1}">
      <input name="q${index}.answers" placeholder="Accepted answers, separated by commas" value="${escapeHtml((question.answers ?? []).join(", "))}" aria-label="Accepted answers for question ${index + 1}">
      <input type="hidden" name="q${index}.id" value="${escapeHtml(question.id ?? `q${index + 1}`)}">
    </div>`;
  }).join("");
  return `<form class="form-grid readable-form" data-v-form="settings">
    <h3>How members verify</h3>
    ${checkbox("enabled", "Verification is on", s.enabled)}
    ${selectField("mode", "Method", MODES, s.mode)}
    ${channelSelect("channelId", "Verification channel (for the panel)", s.channelId, "TEXT", "Not set")}
    ${rolePicker("verifiedRoleIds", "Roles to give when verified", s.verifiedRoleIds)}
    ${roleSelect("unverifiedRoleId", "Role for new members until they verify (removed when verified)", s.unverifiedRoleId)}
    <h3>Questions</h3>
    <p class="microcopy full">Used by the Questions method. Members must answer every question. Answers are not case sensitive. Up to 5 questions.</p>
    ${questions}
    <h3>Safety</h3>
    ${numberField("minAccountAgeDays", "Minimum account age (days, 0 = off)", s.minAccountAgeDays, 0, 365)}
    ${selectField("ageAction", "If the account is newer", AGE_ACTIONS, s.ageAction)}
    ${numberField("maxAttempts", "Wrong tries before a cooldown (0 = unlimited)", s.maxAttempts, 0, 20)}
    ${numberField("cooldownMinutes", "Cooldown (minutes)", s.cooldownMinutes, 1, 1440)}
    ${numberField("kickUnverifiedMinutes", "Kick members who haven't verified after (minutes, 0 = off)", s.kickUnverifiedMinutes, 0, 43200)}
    <h3>Messages</h3>
    ${channelSelect("logChannelId", "Log channel", s.logChannelId, "TEXT", "Not set")}
    ${checkbox("dmOnSuccess", "DM members when they verify", s.dmOnSuccess)}
    ${textArea("successMessage", "DM text (optional)", s.successMessage ?? "", "You are now verified in {server}. Welcome!")}
    ${channelSelect("welcomeChannelId", "Welcome channel after verifying", s.welcomeChannelId, "TEXT", "Don't post a welcome")}
    ${textArea("welcomeMessage", "Welcome message", s.welcomeMessage ?? "", "Welcome {user} to {server}!")}
    <p class="microcopy full">Use {user} to mention the member and {server} for the server name.</p>
    <button class="button primary full">Save settings</button>
  </form>`;
}

/* ---------- Panel ---------- */

function panelTab() {
  const s = view.overview.settings;
  const posted = s.panelMessageId && s.panelChannelId;
  return `<section class="grid cols-2">
    <form class="card form-grid" data-v-form="panel">
      <h3>Message with the Verify button</h3>
      <p class="microcopy full">Members press the Verify button on this message to start.</p>
      ${textField("title", "Title", s.panel.title, "", true, "full")}
      ${textArea("description", "Text", s.panel.description)}
      <label>Color<input type="color" name="color" value="${escapeHtml(s.panel.color)}"></label>
      ${textField("buttonLabel", "Button label", s.panel.buttonLabel, "", true)}
      <button class="button primary full">Save panel</button>
    </form>
    <div class="card detail-stack">
      <h3>Preview</h3>
      <div id="panelPreview">${panelPreview(s.panel)}</div>
      ${detail("Channel", s.channelId ? escapeHtml(channelLabel(s.channelId)) : "Not set. Choose one in Settings.")}
      ${posted ? detail("Posted", escapeHtml(channelLabel(s.panelChannelId))) : ""}
      <p class="microcopy">Posting again updates the existing panel when it is still in the same channel.</p>
      <button class="button full" data-v-action="post" ${s.channelId ? "" : "disabled"}>${posted ? "Update the Verify button message in Discord" : "Post the Verify button message in Discord"}</button>
    </div>
  </section>`;
}

function panelPreview(panel) {
  return `<div class="dc-message">
    <div class="dc-avatar">QB</div>
    <div class="dc-body">
      <div class="dc-author">Qbox <span class="dc-bot">APP</span></div>
      <div class="dc-embed" style="border-left-color:${escapeHtml(panel.color)}">
        <strong>${escapeHtml(panel.title)}</strong>
        <p>${escapeHtml(panel.description)}</p>
      </div>
      <div class="dc-buttons"><span class="dc-button success">${escapeHtml(panel.buttonLabel)}</span></div>
    </div>
  </div>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-v-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.vTab;
    history.replaceState({}, "", appPath(`/verification?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-v-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.vAction)));
  container.querySelectorAll("form[data-v-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form, event.submitter);
  }));
  const panelForm = container.querySelector('form[data-v-form="panel"]');
  panelForm?.addEventListener("input", () => {
    document.getElementById("panelPreview").innerHTML = panelPreview(panelFromForm(new FormData(panelForm)));
  });
  bindPickers(container);
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

async function action(name) {
  if (name === "post") await run((result) => `Panel posted in ${channelLabel(result.data.channelId)}.`, () => sendJson("verification/panel", "POST", {}));
}

async function submit(form, submitter) {
  const data = new FormData(form);
  const text = (name) => String(data.get(name) ?? "").trim();
  switch (form.dataset.vForm) {
    case "filters":
      view.filters = { result: text("result"), search: text("search") };
      return run(undefined, async () => undefined);
    case "member":
      return memberAction(submitter?.value ?? "status", data);
    case "settings":
      return run("Verification settings saved.", () => sendJson("verification/settings", "PUT", { ...settingsFromForm(form, data), expectedRevision: view.overview.settings.revision }));
    case "panel":
      return run("Panel saved.", () => sendJson("verification/settings", "PUT", settingsPayload({ panel: panelFromForm(data) })));
    default:
      return undefined;
  }
}

async function memberAction(op, data) {
  const userId = data.getAll("userId")[0];
  if (!userId) return notify("Choose a member first.", "error");
  const reason = optionalValue(data, "reason");
  if (op === "verify") return run("Member verified.", () => sendJson(`verification/members/${userId}/verify`, "POST", reason));
  if (op === "unverify") {
    if (!(await confirmAction({ title: "Unverify this member?", body: "Their verified roles are removed and they must verify again.", confirmText: "Unverify" }))) return undefined;
    return run("Member unverified.", () => sendJson(`verification/members/${userId}/unverify`, "POST", reason));
  }
  const target = document.getElementById("memberStatus");
  try {
    const status = (await getJson(`verification/members/${encodeURIComponent(userId)}`)).data;
    target.innerHTML = `<h3>${escapeHtml(status.displayName)}</h3>
      ${detail("Status", !status.inServer ? "Not in the server" : status.verified ? badge("verified") : badge("waiting"))}
      ${detail("Account created", escapeHtml(dateTime(status.accountCreatedAt)))}
      ${status.pending ? detail("Waiting since", escapeHtml(`${dateTime(status.pending.joinedAt)}${status.pending.flagged ? " (new account, flagged)" : ""}`)) : ""}
      <ul class="timeline">${status.attempts.map((item) => `<li><strong>${escapeHtml(RESULT_LABELS[item.result] ?? item.result)}</strong><small>${escapeHtml(dateTime(item.createdAt))}</small>${item.reason ? `<p>${escapeHtml(item.reason)}</p>` : ""}</li>`).join("") || "<li>No attempts yet.</li>"}</ul>`;
  } catch (error) {
    notify(error.message, "error");
  }
  return undefined;
}

/** Current settings with changes applied, in the shape the API expects. */
function settingsPayload(changes) {
  const { guildId: _guildId, revision, panelChannelId: _panelChannel, panelMessageId: _panelMessage, ...current } = view.overview.settings;
  return { ...current, ...changes, expectedRevision: revision };
}

function panelFromForm(data) {
  const text = (name) => String(data.get(name) ?? "").trim();
  return { title: text("title"), description: text("description"), color: text("color") || "#5865F2", buttonLabel: text("buttonLabel") };
}

function settingsFromForm(form, data) {
  const text = (name) => String(data.get(name) ?? "").trim();
  const questions = Array.from({ length: QUESTION_ROWS }, (_, index) => index).flatMap((index) => {
    const prompt = text(`q${index}.prompt`);
    if (!prompt) return [];
    const answers = text(`q${index}.answers`).split(",").map((answer) => answer.trim()).filter(Boolean);
    return [{ id: text(`q${index}.id`) || `q${index + 1}`, prompt, answers }];
  });
  const { unverifiedRoleId: _unverified, channelId: _channel, logChannelId: _log, successMessage: _success, welcomeChannelId: _welcomeChannel, welcomeMessage: _welcome, guildId: _guildId, revision: _revision, panelChannelId: _panelChannel, panelMessageId: _panelMessage, ...rest } = view.overview.settings;
  return {
    ...rest,
    enabled: boolValue(form, "enabled"),
    mode: text("mode"),
    verifiedRoleIds: data.getAll("verifiedRoleIds"),
    ...optionalValue(data, "unverifiedRoleId"),
    ...optionalValue(data, "channelId"),
    ...optionalValue(data, "logChannelId"),
    questions,
    minAccountAgeDays: intValue(data, "minAccountAgeDays", 0),
    ageAction: text("ageAction"),
    maxAttempts: intValue(data, "maxAttempts", 3),
    cooldownMinutes: intValue(data, "cooldownMinutes", 10),
    kickUnverifiedMinutes: intValue(data, "kickUnverifiedMinutes", 0),
    dmOnSuccess: boolValue(form, "dmOnSuccess"),
    ...optionalValue(data, "successMessage"),
    ...optionalValue(data, "welcomeChannelId"),
    ...optionalValue(data, "welcomeMessage"),
  };
}
