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
  roleNames,
  selectField,
  textArea,
  textField,
} from "./forms.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";

const TABS = [
  ["apply", "Apply", () => true],
  ["review", "Review", (can) => can.review],
  ["forms", "Forms", (can) => can.manage],
  ["panels", "Panels", (can) => can.manage],
  ["stats", "Statistics", (can) => can.review],
];
const STATUS_LABELS = { PENDING: "Pending", ACCEPTED: "Accepted", DENIED: "Denied", WITHDRAWN: "Withdrawn" };
const QUESTION_TYPES = [["SHORT", "Short answer"], ["PARAGRAPH", "Long answer"], ["YES_NO", "Yes or no"], ["CHOICE", "Multiple choice"]];
const BUTTON_STYLES = [["PRIMARY", "Blurple"], ["SECONDARY", "Grey"], ["SUCCESS", "Green"], ["DANGER", "Red"]];
const MAX_QUESTIONS = 25;

const view = {
  tab: "apply",
  me: undefined,
  overview: undefined,
  setup: undefined,
  list: [],
  filters: { status: "PENDING", formId: "", search: "" },
  selected: undefined,
  applying: undefined,
  editingForm: undefined,
  editingPanel: undefined,
  error: undefined,
};
let container;

export async function renderApplicationsPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading applications...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    view.me = (await getJson("applications/me")).data;
    const can = view.me.can;
    const [overview, list, setup] = await Promise.all([
      can.review ? getJson("applications/overview") : undefined,
      can.review ? getJson(`applications?${listQuery()}`) : undefined,
      can.manage ? getJson("applications/forms") : undefined,
    ]);
    view.overview = overview?.data;
    view.list = list?.data ?? [];
    view.setup = setup?.data;
    if (view.selected) view.selected = (await getJson(`applications/${encodeURIComponent(view.selected.id)}`)).data;
    view.error = undefined;
    await loadDirectory([
      ...view.list.flatMap((item) => [item.applicantId, ...(item.decidedById ? [item.decidedById] : [])]),
      ...(view.selected?.votes.map((vote) => vote.userId) ?? []),
      ...(view.setup?.forms.flatMap((form) => form.pingMemberIds) ?? []),
    ]);
  } catch (error) {
    view.error = error;
  }
}

function listQuery() {
  const query = new URLSearchParams({ limit: "100" });
  if (view.filters.status) query.set("status", view.filters.status);
  if (view.filters.formId) query.set("formId", view.filters.formId);
  if (view.filters.search) query.set("search", view.filters.search);
  return query.toString();
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    container.innerHTML = `<section class="card"><h2>Applications are unavailable</h2><p class="microcopy">${escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  const tabs = TABS.filter(([, , visible]) => visible(view.me.can));
  if (!tabs.some(([id]) => id === view.tab)) view.tab = "apply";
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Application sections">${tabs.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-a-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    <div>${tabContent()}</div>
  </section>`;
  bind();
}

function tabContent() {
  switch (view.tab) {
    case "review": return reviewTab();
    case "forms": return formsTab();
    case "panels": return panelsTab();
    case "stats": return statsTab();
    default: return applyTab();
  }
}

/* ---------- Apply (every member) ---------- */

function applyTab() {
  const { forms, applications } = view.me;
  const form = forms.find((item) => item.id === view.applying);
  if (form) return applyForm(form);
  const list = forms.length
    ? `<ul class="reason-list">${forms.map((item) => `
        <li>
          <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.description || "")}</small>${item.canApply ? "" : `<small>${escapeHtml(item.reason)}</small>`}</div>
          <div class="toolbar">${item.canApply ? `<button class="button compact primary" data-a-action="apply" data-value="${escapeHtml(item.id)}">Apply</button>` : badge("closed")}</div>
        </li>`).join("")}</ul>`
    : `<div class="empty-state">There are no open applications right now.</div>`;
  const mine = applications.map((item) => row([
    ["#", `<strong>#${item.number}</strong>`],
    ["Form", escapeHtml(item.formName)],
    ["Status", badge(STATUS_LABELS[item.status].toLowerCase())],
    ["Sent", escapeHtml(relative(item.createdAt))],
    ["Reason", escapeHtml(item.decisionReason ?? "—")],
    ["", item.status === "PENDING" ? `<button class="button compact danger" data-a-action="withdraw" data-value="${escapeHtml(item.id)}">Withdraw</button>` : ""],
  ]));
  return `<section class="grid">
    <div><h3>Open applications</h3>${list}</div>
    <div><h3>Your applications</h3>${table(["#", "Form", "Status", "Sent", "Reason", ""], mine, "You haven't applied yet.")}</div>
  </section>`;
}

function applyForm(form) {
  const field = (question) => {
    const name = `a-${question.id}`;
    const label = `${escapeHtml(question.label)}${question.required ? "" : " (optional)"}`;
    const help = question.description ? `<small class="microcopy">${escapeHtml(question.description)}</small>` : "";
    const required = question.required ? "required" : "";
    if (question.type === "PARAGRAPH")
      return `<label class="full">${label}${help}<textarea name="${escapeHtml(name)}" ${required} ${question.minLength ? `minlength="${question.minLength}"` : ""} maxlength="${question.maxLength ?? 4000}"></textarea></label>`;
    if (question.type === "YES_NO" || question.type === "CHOICE") {
      const choices = question.type === "YES_NO" ? ["Yes", "No"] : question.choices;
      return `<label class="full">${label}${help}<select name="${escapeHtml(name)}" ${required}><option value="">Choose...</option>${choices.map((choice) => `<option>${escapeHtml(choice)}</option>`).join("")}</select></label>`;
    }
    return `<label class="full">${label}${help}<input name="${escapeHtml(name)}" ${required} ${question.minLength ? `minlength="${question.minLength}"` : ""} maxlength="${question.maxLength ?? 4000}"></label>`;
  };
  return `<form class="card form-grid readable-form" data-a-form="apply">
    <div class="split-line full"><h3>${escapeHtml(form.name)}</h3><button type="button" class="button compact" data-a-action="cancel-apply">Back</button></div>
    ${form.description ? `<p class="microcopy">${escapeHtml(form.description)}</p>` : ""}
    ${form.questions.map(field).join("")}
    <button class="button primary full">Send application</button>
  </form>`;
}

/* ---------- Review ---------- */

function reviewTab() {
  const forms = view.overview.forms;
  const rows = view.list.map((item) => row([
    ["#", `<strong>#${item.number}</strong>`],
    ["Form", escapeHtml(item.formName)],
    ["Member", escapeHtml(item.applicantName)],
    ["Status", badge(STATUS_LABELS[item.status].toLowerCase())],
    ["Votes", `👍 ${item.votes.filter((vote) => vote.vote === "UP").length} · 👎 ${item.votes.filter((vote) => vote.vote === "DOWN").length}`],
    ["Sent", escapeHtml(relative(item.createdAt))],
  ], `data-a-app="${escapeHtml(item.id)}" class="${item.id === view.selected?.id ? "selected" : ""}" tabindex="0"`));
  return `
    <form class="toolbar" data-a-form="filters">
      <input name="search" placeholder="Search #number, member name or ID, form" value="${escapeHtml(view.filters.search)}">
      <select name="status"><option value="">Any status</option>${Object.entries(STATUS_LABELS).map(([value, label]) => `<option value="${value}" ${view.filters.status === value ? "selected" : ""}>${label}</option>`).join("")}</select>
      <select name="formId"><option value="">All forms</option>${forms.map((form) => `<option value="${escapeHtml(form.id)}" ${view.filters.formId === form.id ? "selected" : ""}>${escapeHtml(form.name)}</option>`).join("")}</select>
      <button class="button compact">Filter</button>
    </form>
    <section class="grid main-detail">
      <div>${table(["#", "Form", "Member", "Status", "Votes", "Sent"], rows, "No applications match.")}</div>
      <div class="card">${applicationDetail()}</div>
    </section>`;
}

function applicationDetail() {
  const item = view.selected;
  if (!item) return `<p class="microcopy">Select an application to read the answers, vote, and decide.</p>`;
  const up = item.votes.filter((vote) => vote.vote === "UP");
  const down = item.votes.filter((vote) => vote.vote === "DOWN");
  const mine = item.votes.find((vote) => vote.userId === view.me.userId)?.vote;
  const pending = item.status === "PENDING";
  return `<div class="detail-stack">
    <div class="split-line"><h2>#${item.number} · ${escapeHtml(item.formName)}</h2>${badge(STATUS_LABELS[item.status].toLowerCase())}</div>
    ${detail("Member", `${memberName(item.applicantId)} <code>${escapeHtml(item.applicantId)}</code>`)}
    ${detail("Sent", `${escapeHtml(dateTime(item.createdAt))} · ${item.source === "WEB" ? "portal" : "Discord"}`)}
    ${item.decidedAt ? detail(STATUS_LABELS[item.status], `${item.decidedById ? memberName(item.decidedById) : ""} · ${escapeHtml(dateTime(item.decidedAt))}`) : ""}
    ${item.decisionReason ? detail("Reason", escapeHtml(item.decisionReason)) : ""}
    ${item.dmDelivered === false ? detail("DM", "Could not reach the member") : ""}
    ${item.threadId ? detail("Discussion", escapeHtml(channelLabel(item.threadId))) : ""}
    <h3>Answers</h3>
    ${item.answers.length ? item.answers.map((answer) => `<div><strong>${escapeHtml(answer.question)}</strong><p class="answer-text">${escapeHtml(answer.answer)}</p></div>`).join("") : `<p class="microcopy">No answers.</p>`}
    <h3>Votes</h3>
    <p>👍 ${up.length}${up.length ? ` (${up.map((vote) => memberName(vote.userId)).join(", ")})` : ""} · 👎 ${down.length}${down.length ? ` (${down.map((vote) => memberName(vote.userId)).join(", ")})` : ""}</p>
    ${pending ? `<div class="toolbar">
      <button class="button compact ${mine === "UP" ? "primary" : ""}" data-a-action="vote" data-value="${mine === "UP" ? "NONE" : "UP"}">👍 ${mine === "UP" ? "Remove vote" : "Upvote"}</button>
      <button class="button compact ${mine === "DOWN" ? "primary" : ""}" data-a-action="vote" data-value="${mine === "DOWN" ? "NONE" : "DOWN"}">👎 ${mine === "DOWN" ? "Remove vote" : "Downvote"}</button>
    </div>` : ""}
    <h3>Staff notes</h3>
    ${item.notes.length ? `<ul class="timeline">${item.notes.map((note) => `<li class="internal-note"><strong>${escapeHtml(note.authorName)}</strong><small>${escapeHtml(dateTime(note.createdAt))}</small><p>${escapeHtml(note.body)}</p></li>`).join("")}</ul>` : `<p class="microcopy">No notes yet. Only reviewers see notes.</p>`}
    <form class="form-grid" data-a-form="note"><label class="full">Add a note<textarea name="body" maxlength="1000" required></textarea></label><button class="button full">Save note</button></form>
    ${pending ? `<form class="form-grid" data-a-form="decision">
      <label class="full">Reason (sent to the member; needed to deny)<textarea name="reason" maxlength="1000"></textarea></label>
      <button class="button primary" name="status" value="ACCEPTED">Accept</button>
      <button class="button danger" name="status" value="DENIED">Deny</button>
    </form>` : ""}
  </div>`;
}

/* ---------- Forms ---------- */

function formsTab() {
  const { forms } = view.setup;
  const editing = forms.find((item) => item.id === view.editingForm);
  const list = forms.length
    ? `<ul class="reason-list">${forms.map((form) => `
        <li class="${form.id === view.editingForm ? "selected" : ""}">
          <div><strong>${escapeHtml(form.buttonEmoji || "")} ${escapeHtml(form.name)}</strong>${form.enabled ? "" : ` ${badge("closed")}`}
            <small>${form.questions.length} question(s) · Review in ${escapeHtml(channelLabel(form.reviewChannelId) || "no channel")}${form.acceptRoleIds.length ? ` · Gives ${escapeHtml(roleNames(form.acceptRoleIds))}` : ""}</small></div>
          <div class="toolbar"><button class="button compact" data-a-action="edit-form" data-value="${escapeHtml(form.id)}">Edit</button><button class="button compact danger" data-a-action="delete-form" data-value="${escapeHtml(form.id)}">Delete</button></div>
        </li>`).join("")}</ul>`
    : `<div class="empty-state">No forms yet. Create one for each position, for example "Staff" or "Whitelist".</div>`;
  const f = editing ?? {
    name: "", enabled: true, questions: [{ id: "q1", label: "", type: "PARAGRAPH", required: true, choices: [] }], cooldownDays: 7, onePending: true,
    requiredRoleIds: [], blockedRoleIds: [], reviewerRoleIds: [], pingMemberIds: [], acceptRoleIds: [], removeRoleIds: [], buttonStyle: "PRIMARY", position: forms.length,
  };
  return `
    <section class="grid editor-layout">
      <div class="grid">${list}${editing ? `<button class="button full" data-a-action="new-form">+ New form</button>` : ""}</div>
      <form class="card form-grid" data-a-form="form">
        <h3>${editing ? `Edit “${escapeHtml(editing.name)}”` : "New form"}</h3>
        ${textField("name", "Name", f.name, "Staff", true)}
        ${checkbox("enabled", "Open for applications", f.enabled)}
        ${textArea("description", "Description", f.description ?? "", "Shown to members before they apply.")}
        <h4>Questions (up to ${MAX_QUESTIONS})</h4>
        <p class="microcopy full">Discord shows five questions per page; members press Continue between pages.</p>
        <div class="grid full" id="questionList">${f.questions.map((question, index) => questionBlock(question, index)).join("")}</div>
        <button type="button" class="button full" data-a-action="add-question">+ Add question</button>
        <h4>Who can apply</h4>
        ${rolePicker("requiredRoleIds", "Members need one of these roles", f.requiredRoleIds, "Leave empty so anyone can apply.")}
        ${rolePicker("blockedRoleIds", "Members with these roles can't apply", f.blockedRoleIds)}
        ${numberField("minAccountAgeDays", "Minimum Discord account age (days)", f.minAccountAgeDays ?? "", 1, 3650, false)}
        ${numberField("cooldownDays", "Wait after a denial (days, 0 = none)", f.cooldownDays, 0, 365)}
        ${checkbox("onePending", "Only one pending application per member", f.onePending)}
        <h4>Review</h4>
        ${channelSelect("reviewChannelId", "Review channel", f.reviewChannelId, "TEXT", "Not set")}
        ${rolePicker("reviewerRoleIds", "Reviewer roles", f.reviewerRoleIds, "They can vote and decide on this form. Members with applications.review can review every form.")}
        ${memberPicker("pingMemberIds", "Ping these members on new applications", f.pingMemberIds)}
        ${channelSelect("discussionChannelId", "Discussion thread channel (optional)", f.discussionChannelId, "TEXT", "No discussion thread")}
        <p class="microcopy full">When set, each application opens a private thread in this channel with the member, so staff can ask questions.</p>
        <h4>When accepted</h4>
        ${rolePicker("acceptRoleIds", "Give these roles", f.acceptRoleIds)}
        ${rolePicker("removeRoleIds", "Remove these roles", f.removeRoleIds)}
        ${textArea("acceptMessage", "Accept DM", f.acceptMessage ?? "", "Default: Your {form} application in {server} was accepted.")}
        ${textArea("denyMessage", "Deny DM", f.denyMessage ?? "", "Default: Your {form} application in {server} was denied.")}
        <p class="microcopy full">DMs can use {user}, {form}, {number}, {reason}, and {server}. The reason is added below the message when it's not in the text.</p>
        <h4>Panel button</h4>
        ${textField("buttonLabel", "Button text", f.buttonLabel ?? "", "Default: the form name")}
        ${textField("buttonEmoji", "Emoji", f.buttonEmoji ?? "", "📝")}
        ${selectField("buttonStyle", "Button color", BUTTON_STYLES, f.buttonStyle)}
        ${numberField("position", "Order", f.position, 0, 1000)}
        <input type="hidden" name="expectedRevision" value="${editing ? editing.revision : ""}">
        <button class="button primary full">${editing ? "Save form" : "Create form"}</button>
      </form>
    </section>`;
}

function questionBlock(question, index) {
  const q = question ?? { id: `q${Math.random().toString(36).slice(2, 10)}`, label: "", type: "SHORT", required: true, choices: [] };
  return `<fieldset class="full" data-q>
    <legend>Question ${index + 1}</legend>
    <input type="hidden" name="qid" value="${escapeHtml(q.id)}">
    <label class="full">Question<input name="qlabel" maxlength="45" value="${escapeHtml(q.label)}" required></label>
    <label>Answer type<select name="qtype">${QUESTION_TYPES.map(([value, label]) => `<option value="${value}" ${q.type === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
    <label class="checkbox"><input type="checkbox" name="qrequired" ${q.required ? "checked" : ""}> Required</label>
    <label>Minimum length<input type="number" name="qmin" min="0" max="4000" value="${escapeHtml(q.minLength ?? "")}"></label>
    <label>Maximum length<input type="number" name="qmax" min="1" max="4000" value="${escapeHtml(q.maxLength ?? "")}"></label>
    <label class="full">Choices (multiple choice, one per line)<textarea name="qchoices">${escapeHtml(q.choices.join("\n"))}</textarea></label>
    <label class="full">Help text (optional)<input name="qdesc" maxlength="100" value="${escapeHtml(q.description ?? "")}"></label>
    <div class="toolbar full">
      <button type="button" class="button compact" data-q-move="-1">Move up</button>
      <button type="button" class="button compact" data-q-move="1">Move down</button>
      <button type="button" class="button compact danger" data-q-remove>Remove</button>
    </div>
  </fieldset>`;
}

/* ---------- Panels ---------- */

function panelsTab() {
  const { panels, forms } = view.setup;
  const editing = panels.find((item) => item.id === view.editingPanel);
  const list = panels.length
    ? `<ul class="reason-list">${panels.map((panel) => `
        <li class="${panel.id === view.editingPanel ? "selected" : ""}">
          <div><strong>${escapeHtml(panel.title)}</strong> ${badge(panel.messageId ? "posted" : "not posted")}
            <small>${escapeHtml(channelLabel(panel.channelId) || panel.channelId)} · ${panel.formIds.length || "All open"} form(s)</small></div>
          <div class="toolbar"><button class="button compact primary" data-a-action="publish-panel" data-value="${escapeHtml(panel.id)}">${panel.messageId ? "Update in Discord" : "Post in Discord"}</button><button class="button compact" data-a-action="edit-panel" data-value="${escapeHtml(panel.id)}">Edit</button><button class="button compact danger" data-a-action="delete-panel" data-value="${escapeHtml(panel.id)}">Delete</button></div>
        </li>`).join("")}</ul>`
    : `<div class="empty-state">No panels yet. A panel is a message with one Apply button per form.</div>`;
  const p = editing ?? { title: "Applications", description: "Pick a position below to apply.", color: "#5865F2", formIds: [] };
  return `
    <section class="grid editor-layout">
      <div class="grid">${list}${editing ? `<button class="button full" data-a-action="new-panel">+ New panel</button>` : ""}</div>
      <form class="card form-grid" data-a-form="panel">
        <h3>${editing ? "Edit panel" : "New panel"}</h3>
        ${channelSelect("channelId", "Post in channel", p.channelId, "TEXT", "Choose a channel", true)}
        ${textField("color", "Color", p.color)}
        ${textField("title", "Title", p.title, "", true, "full")}
        ${textArea("description", "Message", p.description)}
        <fieldset class="full"><legend>Forms on this panel (none checked = every open form)</legend>
          ${forms.length ? forms.map((form) => checkbox(`form-${form.id}`, `${form.name}${form.enabled ? "" : " (closed)"}`, p.formIds.includes(form.id))).join("") : '<p class="microcopy">Create a form first.</p>'}
        </fieldset>
        <button class="button primary full">${editing ? "Save panel" : "Create panel"}</button>
      </form>
    </section>`;
}

/* ---------- Statistics ---------- */

function statsTab() {
  const s = view.overview.stats;
  const metric = (label, value) => `<div class="card metric"><span class="metric-label">${escapeHtml(label)}</span><strong class="metric-value">${escapeHtml(String(value))}</strong></div>`;
  const average = s.averageReviewMinutes === undefined ? "—" : s.averageReviewMinutes >= 1440 ? `${(s.averageReviewMinutes / 1440).toFixed(1)} days` : s.averageReviewMinutes >= 60 ? `${Math.round(s.averageReviewMinutes / 60)} hours` : `${s.averageReviewMinutes} minutes`;
  return `<section class="grid cols-4">
      ${metric("All applications", s.total)}${metric("Pending", s.byStatus.PENDING)}${metric("Last 7 days", s.last7Days)}${metric("Average review time", average)}
    </section>
    <section class="grid cols-2">
      <div class="card"><h3>By status</h3>${table(["Status", "Applications"], Object.entries(s.byStatus).map(([status, count]) => row([["Status", escapeHtml(STATUS_LABELS[status])], ["Applications", String(count)]])))}</div>
      <div class="card"><h3>By form</h3>${table(["Form", "Total", "Pending", "Accepted", "Denied"], s.byForm.map((item) => row([["Form", escapeHtml(item.formName)], ["Total", String(item.total)], ["Pending", String(item.pending)], ["Accepted", String(item.accepted)], ["Denied", String(item.denied)]])), "No applications yet.")}</div>
    </section>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-a-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.aTab;
    history.replaceState({}, "", appPath(`/applications?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-a-app]").forEach((element) => {
    const open = () => void run(undefined, async () => {
      view.selected = view.list.find((item) => item.id === element.dataset.aApp);
    });
    element.addEventListener("click", open);
    element.addEventListener("keydown", (event) => { if (event.key === "Enter") open(); });
  });
  container.querySelectorAll("[data-a-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.aAction, button.dataset.value)));
  container.querySelectorAll("form[data-a-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form, event.submitter);
  }));
  const questions = container.querySelector("#questionList");
  questions?.addEventListener("click", (event) => {
    const block = event.target.closest("[data-q]");
    if (!block) return;
    if (event.target.closest("[data-q-remove]")) {
      if (questions.querySelectorAll("[data-q]").length > 1) block.remove();
    } else if (event.target.closest("[data-q-move]")) {
      const step = Number(event.target.closest("[data-q-move]").dataset.qMove);
      const sibling = step < 0 ? block.previousElementSibling : block.nextElementSibling;
      if (sibling && step < 0) sibling.before(block);
      else if (sibling) sibling.after(block);
    }
    renumberQuestions(questions);
  });
  bindPickers(container);
}

function renumberQuestions(list) {
  list.querySelectorAll("[data-q] legend").forEach((legend, index) => { legend.textContent = `Question ${index + 1}`; });
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
    case "apply":
      view.applying = value;
      return render();
    case "cancel-apply":
      view.applying = undefined;
      return render();
    case "withdraw":
      if (!(await confirmAction({ title: "Withdraw this application?", body: "Staff will no longer review it.", confirmText: "Withdraw" }))) return undefined;
      return run("Application withdrawn.", () => sendJson(`applications/${encodeURIComponent(value)}/withdraw`, "POST", {}));
    case "vote":
      return run(undefined, () => sendJson(`applications/${encodeURIComponent(view.selected.id)}/vote`, "POST", { vote: value }));
    case "add-question": {
      const list = container.querySelector("#questionList");
      const count = list.querySelectorAll("[data-q]").length;
      if (count >= MAX_QUESTIONS) return notify(`A form can have at most ${MAX_QUESTIONS} questions.`, "error");
      list.insertAdjacentHTML("beforeend", questionBlock(undefined, count));
      return undefined;
    }
    case "edit-form":
      view.editingForm = value;
      return render();
    case "new-form":
      view.editingForm = undefined;
      return render();
    case "delete-form":
      if (!(await confirmAction({ title: "Delete this form?", body: "Past applications stay in the list. Panels stop showing it.", confirmText: "Delete" }))) return undefined;
      if (view.editingForm === value) view.editingForm = undefined;
      return run("Form deleted.", () => sendJson(`applications/forms/${encodeURIComponent(value)}`, "DELETE"));
    case "edit-panel":
      view.editingPanel = value;
      return render();
    case "new-panel":
      view.editingPanel = undefined;
      return render();
    case "publish-panel":
      return run("Panel posted in Discord.", () => sendJson(`applications/panels/${encodeURIComponent(value)}/publish`, "POST", {}));
    case "delete-panel":
      if (!(await confirmAction({ title: "Delete this panel?", body: "The panel message is removed from Discord.", confirmText: "Delete" }))) return undefined;
      if (view.editingPanel === value) view.editingPanel = undefined;
      return run("Panel deleted.", () => sendJson(`applications/panels/${encodeURIComponent(value)}`, "DELETE"));
    default:
      return undefined;
  }
}

async function submit(form, submitter) {
  const data = new FormData(form);
  const text = (name) => String(data.get(name) ?? "").trim();
  switch (form.dataset.aForm) {
    case "filters":
      view.filters = { status: text("status"), formId: text("formId"), search: text("search") };
      return run(undefined, async () => undefined);
    case "apply": {
      const target = view.me.forms.find((item) => item.id === view.applying);
      const answers = Object.fromEntries(target.questions.map((question) => [question.id, text(`a-${question.id}`)]).filter(([, answer]) => answer));
      return run((result) => `Application #${result.data.number} sent. You'll get a DM when staff decide.`, async () => {
        const result = await sendJson(`applications/forms/${encodeURIComponent(target.id)}/submit`, "POST", { answers });
        view.applying = undefined;
        return result;
      });
    }
    case "note":
      return run("Note saved.", () => sendJson(`applications/${encodeURIComponent(view.selected.id)}/notes`, "POST", { body: text("body") }));
    case "decision": {
      const status = submitter?.value;
      const reason = text("reason");
      if (status === "DENIED" && !reason) return notify("Add a reason before denying.", "error");
      const label = status === "ACCEPTED" ? "Accept" : "Deny";
      if (!(await confirmAction({ title: `${label} application #${view.selected.number}?`, body: status === "ACCEPTED" ? "Roles are updated and the member gets a DM." : "The member gets a DM with the reason.", confirmText: label }))) return undefined;
      return run(`Application ${status === "ACCEPTED" ? "accepted" : "denied"}.`, () => sendJson(`applications/${encodeURIComponent(view.selected.id)}/decision`, "POST", { status, ...(reason ? { reason } : {}) }));
    }
    case "form": {
      const id = view.editingForm;
      return run(id ? "Form saved." : "Form created.", async () => {
        const result = await sendJson(id ? `applications/forms/${encodeURIComponent(id)}` : "applications/forms", id ? "PUT" : "POST", formPayload(form, data));
        view.editingForm = result.data.id;
        return result;
      });
    }
    case "panel": {
      const id = view.editingPanel;
      const payload = {
        channelId: text("channelId"),
        title: text("title"),
        description: text("description"),
        color: text("color"),
        formIds: view.setup.forms.filter((item) => boolValue(form, `form-${item.id}`)).map((item) => item.id),
      };
      return run(id ? "Panel saved. Update it in Discord to show the changes." : "Panel created. Post it in Discord when ready.", async () => {
        const result = await sendJson(id ? `applications/panels/${encodeURIComponent(id)}` : "applications/panels", id ? "PUT" : "POST", payload);
        view.editingPanel = result.data.id;
        return result;
      });
    }
    default:
      return undefined;
  }
}

function formPayload(form, data) {
  const text = (name) => String(data.get(name) ?? "").trim();
  const questions = [...form.querySelectorAll("[data-q]")].map((block) => {
    const value = (name) => String(block.querySelector(`[name="${name}"]`)?.value ?? "").trim();
    const type = value("qtype");
    const textual = type === "SHORT" || type === "PARAGRAPH";
    const min = Number.parseInt(value("qmin"), 10);
    const max = Number.parseInt(value("qmax"), 10);
    return {
      id: value("qid"),
      label: value("qlabel"),
      ...(value("qdesc") ? { description: value("qdesc") } : {}),
      type,
      required: block.querySelector('[name="qrequired"]')?.checked === true,
      ...(textual && Number.isInteger(min) ? { minLength: min } : {}),
      ...(textual && Number.isInteger(max) ? { maxLength: max } : {}),
      choices: type === "CHOICE" ? value("qchoices").split(/\n+/).map((line) => line.trim()).filter(Boolean) : [],
    };
  });
  const minAge = intValue(data, "minAccountAgeDays", 0);
  const revision = Number.parseInt(text("expectedRevision"), 10);
  return {
    name: text("name"),
    ...optionalValue(data, "description"),
    enabled: boolValue(form, "enabled"),
    questions,
    cooldownDays: intValue(data, "cooldownDays", 0),
    onePending: boolValue(form, "onePending"),
    requiredRoleIds: data.getAll("requiredRoleIds"),
    blockedRoleIds: data.getAll("blockedRoleIds"),
    ...(minAge > 0 ? { minAccountAgeDays: minAge } : {}),
    ...optionalValue(data, "reviewChannelId"),
    reviewerRoleIds: data.getAll("reviewerRoleIds"),
    pingMemberIds: data.getAll("pingMemberIds"),
    acceptRoleIds: data.getAll("acceptRoleIds"),
    removeRoleIds: data.getAll("removeRoleIds"),
    ...optionalValue(data, "acceptMessage"),
    ...optionalValue(data, "denyMessage"),
    ...optionalValue(data, "discussionChannelId"),
    ...optionalValue(data, "buttonLabel"),
    ...optionalValue(data, "buttonEmoji"),
    buttonStyle: text("buttonStyle"),
    position: intValue(data, "position", 0),
    ...(Number.isInteger(revision) ? { expectedRevision: revision } : {}),
  };
}
