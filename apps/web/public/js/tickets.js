import {
  deleteTicketCategory,
  deleteTicketPanel,
  listTickets,
  publishTicketPanel,
  removeTicketParticipant,
  saveTicketCategory,
  saveTicketPanel,
  saveTicketSettings,
  ticketAction,
  ticketDetail,
  ticketTranscriptUrl,
  ticketsOverview,
} from "./api.js";
import { appPath } from "./config.js";
import {
  bindPickers,
  channelExists,
  channelLabel,
  channelSelect,
  checkbox,
  detail,
  loadDirectory,
  memberName,
  memberPicker,
  minutes,
  numberField,
  optionalValue as optionalId,
  relative,
  roleNames,
  rolePicker,
  selectField,
  textArea,
  textField,
} from "./forms.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";
import { BRAND } from "./brand.js";

const TABS = [
  ["inbox", "Inbox"],
  ["reasons", "Ticket reasons"],
  ["panels", "Panels"],
  ["settings", "Settings"],
  ["stats", "Statistics"],
];
const STATUS_FILTERS = [["open,claimed,pending", "Active"], ["open", "Open"], ["claimed", "Claimed"], ["pending", "Waiting on member"], ["closed", "Closed"], ["", "All"]];
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];
const BUTTON_STYLES = [["PRIMARY", "Blurple"], ["SECONDARY", "Grey"], ["SUCCESS", "Green"], ["DANGER", "Red"]];
const STAFF_THREAD_MODES = [["INHERIT", "Use the server setting"], ["ON", "Always open a staff chat"], ["OFF", "Never open a staff chat"]];
const RETENTION_OPTIONS = [["6", "6 months"], ["9", "9 months"], ["12", "12 months"], ["0", "Forever"]];

const view = {
  tab: "inbox",
  overview: undefined,
  tickets: [],
  filters: { status: "open,claimed,pending", search: "", priority: "" },
  selectedId: undefined,
  detail: undefined,
  editingReason: undefined,
  editingPanel: undefined,
  /** Button rows being arranged in the panel editor (null = automatic), and which panel they belong to. */
  panelRows: null,
  rowsFor: undefined,
  canManage: false,
  error: undefined,
};

let container;

/** Tickets page: inbox for staff; setup (reasons, panels, settings) for managers. */
export async function renderTicketsPage(target) {
  container = target;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading tickets...</p></section>`;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  await load();
  render();
}

async function load() {
  // Channels and roles do not depend on the tickets, so they load at the same time.
  const directory = loadDirectory();
  try {
    const [overview, tickets] = await Promise.all([ticketsOverview(), listTickets(view.filters)]);
    view.overview = overview.data;
    view.tickets = tickets.data;
    view.error = undefined;
  } catch (error) {
    view.error = error;
    return;
  }
  view.canManage = view.overview.canManage === true;
  await directory;
  await loadDirectory([
    ...view.overview.categories.flatMap((category) => category.alertUserIds),
    ...view.tickets.flatMap((ticket) => [ticket.openerId, ...(ticket.claimedById ? [ticket.claimedById] : [])]),
  ]);
  if (view.selectedId) view.detail = (await ticketDetail(view.selectedId).catch(() => undefined))?.data;
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    const denied = view.error.status === 403;
    container.innerHTML = `<section class="card"><h2>${denied ? "You don't have access to tickets" : "Tickets are unavailable"}</h2>
      <p class="microcopy">${denied ? "Ask a server admin for the Handle tickets permission (tickets.handle) to answer tickets, or the Manage tickets permission (tickets.manage) to set them up." : escapeHtml(view.error.message)}</p>
      <button class="button" data-t-action="retry">Try again</button></section>`;
    bind();
    return;
  }
  const tabs = view.canManage ? TABS : TABS.filter(([id]) => id === "inbox" || id === "stats");
  if (!tabs.some(([id]) => id === view.tab)) view.tab = "inbox";
  container.innerHTML = `
    ${setupChecklist()}
    <section class="card">
      <nav class="tab-bar" aria-label="Ticket sections">${tabs.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-t-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
      <div id="ticketsTab">${tabContent()}</div>
    </section>`;
  bind();
}

function setupSteps() {
  const { settings, categories, panels } = view.overview;
  return [
    [settings.enabled && (settings.openCategoryChannelId || settings.threadParentChannelId) && settings.supportRoleIds.length > 0, "Turn tickets on, pick where they open, and choose your support team", "settings"],
    [categories.some((category) => category.enabled), "Add ticket reasons (one button each)", "reasons"],
    [panels.some((panel) => panel.messageId), "Post a panel in a channel", "panels"],
  ];
}

function setupDone() {
  return setupSteps().every(([done]) => done);
}

function setupChecklist() {
  if (!view.canManage || setupDone()) return "";
  const steps = setupSteps();
  return `<section class="card setup-card"><h2>Set up tickets</h2><ol class="checklist">${steps
    .map(([done, text, tab]) => `<li class="${done ? "done" : ""}"><span class="check" aria-hidden="true">${done ? "✓" : ""}</span><button class="link-button" data-t-tab="${tab}">${escapeHtml(text)}</button></li>`)
    .join("")}</ol></section>`;
}

function tabContent() {
  switch (view.tab) {
    case "reasons": return reasonsTab();
    case "panels": return panelsTab();
    case "settings": return settingsTab();
    case "stats": return statsTab();
    default: return inboxTab();
  }
}

/* ---------- Inbox ---------- */

function setupCard() {
  return `<div class="empty-state">
    <h3>Tickets aren't set up yet${view.canManage ? ", so no one can open one." : "."}</h3>
    <p>Members open a ticket with a button on a panel, and your support team answers it in Discord or here.</p>
    ${view.canManage
      ? `<button class="button primary" data-t-tab="settings">Finish setup</button>`
      : `<p class="microcopy">Ask a server admin to finish setup.</p>`}
  </div>`;
}

function filtersActive() {
  return view.filters.status !== "open,claimed,pending" || view.filters.search !== "" || view.filters.priority !== "";
}

function inboxTab() {
  if (!setupDone() && !view.tickets.length && !filtersActive()) return setupCard();
  const rows = view.tickets.map((ticket) => row([
    ["Ticket", `<strong>#${ticket.number}</strong><br><small>${escapeHtml(ticket.subject || ticket.categoryName || "General support")}</small>`],
    ["Member", escapeHtml(ticket.openerName)],
    ["Reason", escapeHtml(reasonLabel(ticket))],
    ["Priority", badge(ticket.priority.toLowerCase())],
    ["Status", badge(statusLabel(ticket.status))],
    ["Updated", escapeHtml(relative(ticket.lastActivityAt))],
  ], `data-t-select="${escapeHtml(ticket.id)}" class="${ticket.id === view.selectedId ? "selected" : ""}" tabindex="0"`));
  return `
    <form class="toolbar" data-t-form="filters">
      <input name="search" placeholder="Search #number, subject, member, tag" value="${escapeHtml(view.filters.search)}">
      <select name="status">${STATUS_FILTERS.map(([value, label]) => `<option value="${value}" ${view.filters.status === value ? "selected" : ""}>${label}</option>`).join("")}</select>
      <select name="priority"><option value="">Any priority</option>${PRIORITIES.map((value) => `<option value="${value}" ${view.filters.priority === value ? "selected" : ""}>${value.toLowerCase()}</option>`).join("")}</select>
      <button class="button compact">Filter</button>
    </form>
    <section class="grid main-detail">
      <div>${table(["Ticket", "Member", "Reason", "Priority", "Status", "Updated"], rows, filtersActive() ? "No tickets match these filters." : "No tickets yet.")}</div>
      <div class="card" id="ticketDetail">${detailPanel()}</div>
    </section>`;
}

/** "Donations #5": the reason plus this ticket's count within it. */
function reasonLabel(ticket) {
  if (!ticket.categoryName) return "General";
  return ticket.categoryNumber ? `${ticket.categoryName} #${ticket.categoryNumber}` : ticket.categoryName;
}

function detailPanel() {
  if (!view.detail) return `<p class="microcopy">Select a ticket to read the conversation and act on it.</p>`;
  const { ticket, messages, events } = view.detail;
  const closed = ticket.status === "CLOSED";
  const timeline = (items, empty) => items.length
    ? `<ul class="timeline">${items.map((message) => `<li${message.internal ? ' class="internal-note"' : ""}><strong>${escapeHtml(message.authorName)}${message.source === "WEB" ? " · from portal" : ""}</strong><small>${escapeHtml(new Date(message.createdAt).toLocaleString())}</small><p>${escapeHtml(message.content)}</p>${message.attachments.map((url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Attachment</a>`).join(" ")}</li>`).join("")}</ul>`
    : `<p class="microcopy">${empty}</p>`;
  const conversation = timeline(messages.filter((message) => !message.internal), "No messages yet.");
  return `
    <div class="detail-stack">
      <div class="split-line"><h2>#${ticket.number} ${escapeHtml(ticket.subject || ticket.categoryName || "Support")}</h2>${badge(statusLabel(ticket.status))}</div>
      ${detail("Member", `${escapeHtml(ticket.openerName)} <code>${escapeHtml(ticket.openerId)}</code>`)}
      ${detail("Reason", escapeHtml(reasonLabel(ticket)))}
      ${detail("Assigned to", ticket.claimedById ? memberName(ticket.claimedById) : "Nobody yet")}
      ${detail("Opened", escapeHtml(new Date(ticket.createdAt).toLocaleString()))}
      ${ticket.rating ? detail("Rating", `${"★".repeat(ticket.rating)}${ticket.feedback ? ` — ${escapeHtml(ticket.feedback)}` : ""}`) : ""}
      ${ticket.closeReason ? detail("Close reason", escapeHtml(ticket.closeReason)) : ""}
      ${ticket.answers.map((answer) => detail(escapeHtml(answer.question), escapeHtml(answer.answer))).join("")}
      <div class="toolbar">
        ${closed
          ? `<button class="button compact" data-t-action="reopen">Reopen</button><button class="button compact" data-t-action="send-transcript">Send transcript to member</button>${ticket.channelId ? `<button class="button compact danger" data-t-action="delete-channel">Delete channel</button>` : ""}`
          : `${ticket.claimedById ? `<button class="button compact" data-t-action="unclaim">Unassign</button>` : `<button class="button compact primary" data-t-action="claim">Claim</button>`}
             <button class="button compact" data-t-action="waiting" data-value="${ticket.status === "PENDING" ? "false" : "true"}">${ticket.status === "PENDING" ? "Resume" : "Waiting on member"}</button>
             <button class="button compact danger" data-t-action="close">Close</button>`}
        <a class="button compact" href="${escapeHtml(ticketTranscriptUrl(ticket.id))}">Transcript (.txt)</a>
        <a class="button compact" href="${escapeHtml(`${ticketTranscriptUrl(ticket.id)}?format=html`)}">Transcript (.html)</a>
      </div>
      ${closed ? "" : `
        <form class="form-grid" data-t-form="reply"><label class="full">Reply in Discord<textarea name="content" maxlength="1900" required placeholder="The member sees this in their ticket"></textarea></label><button class="button primary full">Send reply</button></form>
        <form class="form-grid" data-t-form="priority">
          <label>Priority<select name="priority">${PRIORITIES.map((value) => `<option value="${value}" ${ticket.priority === value ? "selected" : ""}>${value.toLowerCase()}</option>`).join("")}</select></label>
          <label>Tags<input name="tags" value="${escapeHtml(ticket.tags.join(", "))}" placeholder="billing, refund"></label>
          <button class="button compact full">Save priority and tags</button>
        </form>
        <form class="form-grid" data-t-form="participant"><label class="full">Add someone to this ticket (Discord ID)<input name="userId" pattern="\\d{17,20}" required></label><button class="button compact full">Add</button></form>
        ${ticket.participantIds.length ? `<div class="chip-row">${ticket.participantIds.map((id) => `<span class="chip">${memberName(id)}<button type="button" aria-label="Remove" data-t-action="remove-participant" data-value="${escapeHtml(id)}">×</button></span>`).join("")}</div>` : ""}`}
      <h3>Conversation</h3>
      ${conversation}
      ${staffChatSection(ticket, messages, events, closed, timeline)}
      <h3>History</h3>
      <ul class="timeline">${events.slice().reverse().map((event) => `<li><strong>${escapeHtml(event.action.replaceAll("-", " "))}</strong><small>${escapeHtml(new Date(event.createdAt).toLocaleString())} · ${escapeHtml(event.source.toLowerCase())}</small></li>`).join("")}</ul>
    </div>`;
}

/** The ticket's staff chat: staff thread messages and portal notes. The member never sees these. */
function staffChatSection(ticket, messages, events, closed, timeline) {
  const failure = ticket.staffThreadId ? undefined : events.slice().reverse().find((event) => event.action === "staff-thread-failed");
  const link = ticket.staffThreadId
    ? `<p><a class="button compact" href="https://discord.com/channels/${escapeHtml(ticket.guildId)}/${escapeHtml(ticket.staffThreadId)}" target="_blank" rel="noreferrer">🔒 Open the staff thread in Discord</a></p>`
    : "";
  const problem = failure
    ? `<p class="microcopy" role="status">Staff chat could not be created: ${escapeHtml(String(failure.details?.reason ?? "Discord refused."))}</p>`
    : "";
  const form = closed
    ? ""
    : `<form class="form-grid" data-t-form="note"><label class="full">Add to the staff chat<textarea name="content" maxlength="4000" required placeholder="Only staff can see this${ticket.staffThreadId ? ". It is also posted in the staff thread." : ""}"></textarea></label><button class="button full">Post to staff chat</button></form>`;
  return `<h3>Staff chat (not visible to the member)</h3>${problem}${link}${timeline(messages.filter((message) => message.internal), "No staff messages yet.")}${form}`;
}

/* ---------- Ticket reasons ---------- */

function reasonsTab() {
  const { categories } = view.overview;
  const editing = categories.find((item) => item.id === view.editingReason);
  const list = categories.length
    ? `<ul class="reason-list">${categories.map((category) => `
        <li class="${category.id === view.editingReason ? "selected" : ""}">
          <div><strong>${escapeHtml(category.emoji || "🎫")} ${escapeHtml(category.name)}</strong>${category.enabled ? "" : ` ${badge("off")}`}
            <small>${escapeHtml(category.description || "")}</small>
            <small>Opens in ${escapeHtml(channelLabel(category.parentChannelId) || "the default place")} · Team: ${escapeHtml(roleNames(category.supportRoleIds) || "default support team")}${category.alertUserIds.length ? ` · Alerts ${category.alertUserIds.length} member(s)` : ""}${category.requiredRoleIds.length ? ` · Only ${escapeHtml(roleNames(category.requiredRoleIds))}` : ""}</small>
          </div>
          <div class="toolbar"><button class="button compact" data-t-action="edit-reason" data-value="${escapeHtml(category.id)}">Edit</button><button class="button compact danger" data-t-action="delete-reason" data-value="${escapeHtml(category.id)}">Delete</button></div>
        </li>`).join("")}</ul>`
    : `<div class="empty-state">No ticket reasons yet. Each reason becomes a button on your panel, for example "General Support", "Report a Player", or "Ban Appeal".</div>`;
  const c = editing ?? { name: "", buttonStyle: "PRIMARY", enabled: true, supportRoleIds: [], alertUserIds: [], requiredRoleIds: [], defaultPriority: "NORMAL", questions: [] };
  return `
    <section class="grid editor-layout">
      <div class="grid">${list}${editing ? `<button class="button full" data-t-action="new-reason">+ New ticket reason</button>` : ""}</div>
      <form class="card form-grid" data-t-form="reason">
        <h3>${editing ? `Edit “${escapeHtml(editing.name)}”` : "New ticket reason"}</h3>
        ${textField("name", "Button text", c.name, "General Support", true)}
        ${textField("emoji", "Emoji", c.emoji || "", "🎫")}
        ${selectField("buttonStyle", "Button color", BUTTON_STYLES, c.buttonStyle)}
        ${selectField("defaultPriority", "Priority", PRIORITIES.map((p) => [p, p.toLowerCase()]), c.defaultPriority)}
        ${textField("description", "Short description (dropdown panels)", c.description || "", "Questions about the server", false, "full")}
        <h4>Where tickets open</h4>
        ${channelSelect("parentChannelId", view.overview.settings.mode === "THREAD" ? "Channel for these ticket threads" : "Discord category for these tickets", c.parentChannelId, view.overview.settings.mode === "THREAD" ? "TEXT" : "CATEGORY", "Use the default from Settings")}
        ${textField("nameTemplate", "Channel name", c.nameTemplate || "", "Default: {reason}-{reasonNumber}", false, "full")}
        <p class="microcopy">Each reason counts its own tickets, so the fifth ticket for this reason is number 5. Use {reasonNumber} for that count, {number} for the server-wide count, {reason} for this reason's name, {username} for the member.</p>
        <h4>Who is alerted and can help</h4>
        ${rolePicker("supportRoleIds", "Support roles for this reason", c.supportRoleIds, "Added to the support team from Settings.")}
        ${memberPicker("alertUserIds", "Alert specific members", c.alertUserIds, "They are added to the ticket and its staff chat, and pinged when it opens.")}
        ${selectField("staffThread", "Staff chat for this reason", STAFF_THREAD_MODES, c.staffThread || "INHERIT")}
        <h4>Who can open it</h4>
        ${rolePicker("requiredRoleIds", "Only members with these roles", c.requiredRoleIds, "Leave empty so everyone can open this reason.")}
        ${numberField("maxOpenPerUser", "Max open per member for this reason", c.maxOpenPerUser ?? "", 1, 25, false)}
        ${checkbox("enabled", "Show this reason on panels", c.enabled)}
        <h4>Opening message</h4>
        ${textArea("openMessage", "Message posted in the ticket", c.openMessage || "", "Default from Settings. Use {user}, {number}, {reasonNumber}, {reason}.")}
        <h4>Form questions (optional)</h4>
        <p class="microcopy full">Members answer these in a pop-up before the ticket opens. Up to 5. Leave a question empty to skip it.</p>
        ${[0, 1, 2, 3, 4].map((index) => questionRow(index, c.questions[index])).join("")}
        <button class="button primary full">${editing ? "Save reason" : "Add reason"}</button>
      </form>
    </section>`;
}

function questionRow(index, question = {}) {
  return `<div class="question-row full">
    <input name="q${index}-label" maxlength="45" placeholder="Question ${index + 1}" value="${escapeHtml(question.label || "")}" aria-label="Question ${index + 1}">
    <select name="q${index}-style" aria-label="Answer size"><option value="SHORT" ${question.style !== "PARAGRAPH" ? "selected" : ""}>Short answer</option><option value="PARAGRAPH" ${question.style === "PARAGRAPH" ? "selected" : ""}>Long answer</option></select>
    <label class="checkbox"><input type="checkbox" name="q${index}-required" ${question.required ?? true ? "checked" : ""}> Required</label>
  </div>`;
}

/* ---------- Panels ---------- */

function panelsTab() {
  const { panels, categories } = view.overview;
  const editing = panels.find((item) => item.id === view.editingPanel);
  const list = panels.length
    ? `<ul class="reason-list">${panels.map((panel) => {
        const missing = channelExists(panel.channelId) === false;
        const post = missing
          ? `<button class="button compact primary" data-t-action="repick-panel-channel" data-value="${escapeHtml(panel.id)}" title="The channel was deleted. Pick a new one, save, then post.">Post in Discord</button>`
          : `<button class="button compact primary" data-t-action="publish-panel" data-value="${escapeHtml(panel.id)}">${panel.messageId ? "Update in Discord" : "Post in Discord"}</button>`;
        return `
        <li class="${panel.id === view.editingPanel ? "selected" : ""}">
          <div><strong>${escapeHtml(panel.name)}</strong> ${missing ? `<span class="badge danger">Channel missing</span>` : badge(panel.messageId ? "posted" : "not posted")}
            <small>${missing ? "#deleted-channel" : escapeHtml(channelLabel(panel.channelId) || panel.channelId)} · ${panel.style === "SELECT_MENU" ? "Dropdown" : "Buttons"} · ${panel.categoryIds.length || "All"} reason(s)${panel.style !== "SELECT_MENU" && panel.rows?.length ? ` · ${panel.rows.length} row(s)` : ""}</small></div>
          <div class="toolbar">${post}<button class="button compact" data-t-action="edit-panel" data-value="${escapeHtml(panel.id)}">Edit</button><button class="button compact danger" data-t-action="delete-panel" data-value="${escapeHtml(panel.id)}">Delete</button></div>
        </li>`;
      }).join("")}</ul>`
    : `<div class="empty-state">No panels yet. A panel is the message in your support channel with one button per ticket reason.</div>`;
  const p = editing ?? { name: "Support", title: "Need help?", description: "Pick a reason below and our team will be with you shortly.", color: view.overview.settings.embedColor, style: "BUTTONS", placeholder: "Select a reason", categoryIds: categories.filter((category) => category.enabled).map((category) => category.id), rows: null };
  const rowsKey = editing?.id ?? "new";
  if (view.rowsFor !== rowsKey) {
    view.rowsFor = rowsKey;
    view.panelRows = p.rows?.length ? p.rows.map((row) => [...row]) : null;
  }
  return `
    <section class="grid editor-layout">
      <div class="grid">${list}${editing ? `<button class="button full" data-t-action="new-panel">+ New panel</button>` : ""}
        <h3>Preview in Discord</h3><div id="panelPreview">${panelPreview(p)}</div></div>
      <form class="card form-grid" data-t-form="panel">
        <h3>${editing ? `Edit “${escapeHtml(editing.name)}”` : "New panel"}</h3>
        ${textField("name", "Panel name (only you see this)", p.name, "", true)}
        ${channelSelect("channelId", "Post in channel", p.channelId, "TEXT", "Choose a channel", true)}
        ${textField("title", "Title", p.title, "", true, "full")}
        ${textArea("description", "Message", p.description)}
        ${textField("color", "Color", p.color)}
        ${selectField("style", "Show reasons as", [["BUTTONS", "Buttons"], ["SELECT_MENU", "Dropdown menu"]], p.style)}
        ${textField("placeholder", "Dropdown hint", p.placeholder)}
        ${textField("imageUrl", "Image URL (optional)", p.imageUrl || "", "https://...")}
        ${textField("footer", "Footer (optional)", p.footer || "", "", false, "full")}
        <fieldset class="full"><legend>Reasons on this panel</legend>
          ${categories.length ? categories.map((category) => checkbox(`reason-${category.id}`, `${category.emoji || "🎫"} ${category.name}${category.enabled ? "" : " (off)"}`, p.categoryIds.includes(category.id))).join("") : '<p class="microcopy">Add ticket reasons first.</p>'}
        </fieldset>
        <div class="full" id="panelRowsEditor">${rowsEditor(p.style, p.categoryIds)}</div>
        <button class="button primary full">${editing ? "Save panel" : "Create panel"}</button>
      </form>
    </section>`;
}

const MAX_ROWS = 5;
const MAX_ROW_BUTTONS = 5;

function categoryById(id) {
  return view.overview.categories.find((category) => category.id === id);
}

/** Splits items into rows of five, the way Discord lays out automatic buttons. */
function chunkRows(items) {
  const rows = [];
  for (let index = 0; index < items.length; index += MAX_ROW_BUTTONS) rows.push(items.slice(index, index + MAX_ROW_BUTTONS));
  return rows;
}

/**
 * Button rows exactly as the bot posts them: the arranged rows (reasons that
 * are off or unknown dropped, empty rows removed), otherwise five per row.
 */
function previewRows(panel, categories) {
  if (!panel.rows?.length) return chunkRows(categories).slice(0, MAX_ROWS);
  const shown = new Map(categories.map((category) => [category.id, category]));
  const used = new Set();
  const rows = panel.rows
    .map((row) => row.flatMap((id) => {
      const category = shown.get(id);
      if (!category || used.has(id)) return [];
      used.add(id);
      return [category];
    }).slice(0, MAX_ROW_BUTTONS))
    .filter((row) => row.length > 0);
  for (const category of categories) {
    if (used.has(category.id)) continue;
    const open = rows.find((row) => row.length < MAX_ROW_BUTTONS);
    if (open) open.push(category);
    else rows.push([category]);
  }
  return rows.slice(0, MAX_ROWS);
}

/** Keeps the arranged rows in step with the ticked reasons: unticked ones leave, newly ticked ones join the last row with space. */
function syncRows(categoryIds) {
  if (!view.panelRows) return;
  const wanted = new Set(categoryIds);
  const rows = view.panelRows.map((row) => row.filter((id) => wanted.has(id)));
  const placed = new Set(rows.flat());
  for (const id of categoryIds) {
    if (placed.has(id)) continue;
    let target = [...rows].reverse().find((row) => row.length < MAX_ROW_BUTTONS);
    if (!target) {
      if (rows.length >= MAX_ROWS) continue;
      target = [];
      rows.push(target);
    }
    target.push(id);
  }
  view.panelRows = rows.length ? rows : [[]];
}

/** Row editor for the buttons style: each row is a box of reason chips that can move between and within rows. */
function rowsEditor(style, categoryIds) {
  if (style === "SELECT_MENU") return `<fieldset><legend>Button rows</legend><p class="microcopy">Dropdown panels show every reason in one menu, so rows do not apply.</p></fieldset>`;
  if (!categoryIds.length) return `<fieldset><legend>Button rows</legend><p class="microcopy">Tick the reasons this panel offers to arrange their buttons into rows.</p></fieldset>`;
  const arranged = Array.isArray(view.panelRows);
  const toggle = `<label class="checkbox full"><input type="checkbox" data-rows-toggle ${arranged ? "checked" : ""}> Arrange the buttons into rows myself</label>`;
  if (!arranged)
    return `<fieldset><legend>Button rows</legend>${toggle}<p class="microcopy">Automatic: up to five buttons per row, in the order above.</p></fieldset>`;
  const rows = view.panelRows;
  const box = (row, rowIndex) => `
    <div class="panel-row" role="group" aria-label="Row ${rowIndex + 1}">
      <div class="panel-row-head"><strong>Row ${rowIndex + 1}</strong><small>${row.length}/${MAX_ROW_BUTTONS}</small>
        ${row.length === 0 ? `<button type="button" class="button compact" data-row-action="remove-row" data-row="${rowIndex}">Remove row</button>` : ""}</div>
      ${row.length ? `<ul class="panel-row-chips">${row.map((id, position) => {
        const category = categoryById(id);
        const name = category ? `${category.emoji || "🎫"} ${category.name}` : "Deleted reason";
        const label = escapeHtml(category?.name ?? "this reason");
        const nextFull = rows[rowIndex + 1] && rows[rowIndex + 1].length >= MAX_ROW_BUTTONS;
        const previousFull = rows[rowIndex - 1] && rows[rowIndex - 1].length >= MAX_ROW_BUTTONS;
        const button = (action, text, title, disabled) => `<button type="button" class="row-move" data-row-action="${action}" data-row="${rowIndex}" data-index="${position}" title="${title}" aria-label="${title}" ${disabled ? "disabled" : ""}>${text}</button>`;
        return `<li class="panel-row-chip ${category?.buttonStyle?.toLowerCase() ?? ""}"><span>${escapeHtml(name)}</span>
          <span class="row-moves">
            ${button("previous-row", "←", `Move ${label} to the previous row`, rowIndex === 0 || previousFull)}
            ${button("up", "↑", `Move ${label} earlier in this row`, position === 0)}
            ${button("down", "↓", `Move ${label} later in this row`, position === row.length - 1)}
            ${button("next-row", "→", `Move ${label} to the next row`, rowIndex === rows.length - 1 || nextFull)}
          </span></li>`;
      }).join("")}</ul>` : `<p class="microcopy">Empty. Move a button here or remove the row.</p>`}
    </div>`;
  return `<fieldset><legend>Button rows</legend>${toggle}
    <div class="panel-rows">${rows.map(box).join("")}</div>
    <div class="toolbar"><button type="button" class="button compact" data-row-action="add-row" ${rows.length >= MAX_ROWS ? "disabled" : ""}>+ Add row</button>
      <small class="microcopy">Up to ${MAX_ROWS} rows of ${MAX_ROW_BUTTONS} buttons. Empty rows are left out.</small></div>
  </fieldset>`;
}

/** Applies one row editor button. */
function moveInRows(action, rowIndex, index) {
  const rows = view.panelRows;
  if (!rows) return;
  const row = rows[rowIndex];
  switch (action) {
    case "add-row":
      if (rows.length < MAX_ROWS) rows.push([]);
      return;
    case "remove-row":
      if (row && row.length === 0 && rows.length > 1) rows.splice(rowIndex, 1);
      return;
    case "up":
      if (row && index > 0) [row[index - 1], row[index]] = [row[index], row[index - 1]];
      return;
    case "down":
      if (row && index < row.length - 1) [row[index + 1], row[index]] = [row[index], row[index + 1]];
      return;
    case "previous-row":
    case "next-row": {
      const target = rows[rowIndex + (action === "next-row" ? 1 : -1)];
      if (!row || !target || target.length >= MAX_ROW_BUTTONS) return;
      const [id] = row.splice(index, 1);
      if (action === "next-row") target.unshift(id);
      else target.push(id);
      return;
    }
    default:
  }
}

/** Renders the panel the way Discord shows it, from the current form values. */
function panelPreview(panel) {
  const offered = panel.categoryIds.length ? panel.categoryIds.map(categoryById).filter(Boolean) : view.overview.categories;
  const categories = offered.filter((category) => category.enabled);
  const color = /^#?[0-9a-f]{6}$/i.test(panel.color || "") ? (panel.color.startsWith("#") ? panel.color : `#${panel.color}`) : "#5865F2";
  const buttonRow = (row) => `<div class="dc-buttons">${row.map((category) => `<span class="dc-button ${category.buttonStyle.toLowerCase()}">${escapeHtml(category.emoji || "")} ${escapeHtml(category.name)}</span>`).join("")}</div>`;
  const controls = panel.style === "SELECT_MENU"
    ? `<div class="dc-select">${escapeHtml(panel.placeholder || "Select a reason")}<span>⌄</span></div>`
    : categories.length
      ? `<div class="dc-rows">${previewRows(panel, categories).map(buttonRow).join("")}</div>`
      : '<div class="dc-buttons"><span class="microcopy">No reasons selected</span></div>';
  return `<div class="dc-message">
    <div class="dc-avatar">QB</div>
    <div class="dc-body">
      <div class="dc-author">${BRAND.name} <span class="dc-bot">APP</span></div>
      <div class="dc-embed" style="border-left-color:${escapeHtml(color)}">
        <strong>${escapeHtml(panel.title || "")}</strong>
        <p>${escapeHtml(panel.description || "")}</p>
        ${panel.imageUrl ? `<p class="microcopy">[image]</p>` : ""}
        ${panel.footer ? `<small>${escapeHtml(panel.footer)}</small>` : ""}
      </div>
      ${controls}
    </div>
  </div>`;
}

/* ---------- Settings ---------- */

function settingsTab() {
  const s = view.overview.settings;
  return `
    <form class="form-grid readable-form" data-t-form="settings">
      <h3>Basics</h3>
      ${checkbox("enabled", "Tickets are on", s.enabled)}
      ${selectField("mode", "Tickets open as", [["CHANNEL", "Private channels"], ["THREAD", "Private threads"]], s.mode)}
      ${channelSelect("openCategoryChannelId", "Default Discord category (channel mode)", s.openCategoryChannelId, "CATEGORY", "Not set")}
      ${channelSelect("threadParentChannelId", "Default channel for threads (thread mode)", s.threadParentChannelId, "TEXT", "Not set")}
      ${rolePicker("supportRoleIds", "Support team roles", s.supportRoleIds, "These roles see and answer every ticket.")}
      ${checkbox("pingSupportOnOpen", "Ping the support team when a ticket opens", s.pingSupportOnOpen)}
      ${numberField("maxOpenPerUser", "Open tickets allowed per member", s.maxOpenPerUser, 1, 25)}
      <h3>Messages</h3>
      ${textField("nameTemplate", "Channel name", s.nameTemplate, "{number} {username} {reason}")}
      ${textField("embedColor", "Color", s.embedColor)}
      ${textArea("openMessage", "Opening message", s.openMessage, "{user} {username} {number} {category} {subject}")}
      <h3>Closing</h3>
      ${checkbox("allowUserClose", "Members can close their own tickets", s.allowUserClose)}
      ${checkbox("closeConfirmation", "Ask before closing", s.closeConfirmation)}
      ${checkbox("requireCloseReason", "Require a reason to close", s.requireCloseReason)}
      ${selectField("closeAction", "After a ticket closes", [["ARCHIVE", "Keep the channel (read-only)"], ["DELETE", "Delete the channel"]], s.closeAction)}
      ${numberField("deleteDelaySeconds", "Seconds before deleting", s.deleteDelaySeconds, 0, 3600)}
      ${channelSelect("closedCategoryChannelId", "Move closed tickets to category", s.closedCategoryChannelId, "CATEGORY", "Leave where they are")}
      <h3>Claiming</h3>
      ${checkbox("claimEnabled", "Staff can claim tickets", s.claimEnabled)}
      ${checkbox("claimRestrictsReplies", "Only the claimer can reply after a claim", s.claimRestrictsReplies)}
      <h3>Transcripts, logs and feedback</h3>
      ${checkbox("transcriptsEnabled", "Save a transcript when a ticket closes", s.transcriptsEnabled)}
      ${channelSelect("transcriptChannelId", "Transcript channel", s.transcriptChannelId, "TEXT", "Not set")}
      ${checkbox("transcriptDmUser", "Send the member their transcript when the ticket closes", s.transcriptDmUser)}
      ${channelSelect("logChannelId", "Ticket log channel", s.logChannelId, "TEXT", "Not set")}
      ${checkbox("feedbackEnabled", "Ask members to rate their ticket", s.feedbackEnabled)}
      <h3>Staff chat</h3>
      ${checkbox("staffThreadEnabled", "Open a private staff chat thread for every ticket", s.staffThreadEnabled !== false)}
      <p class="microcopy full">Only staff can see it; the member who opened the ticket is never added. Ticket reasons can turn it on or off for their tickets. The bot needs Create Private Threads, Manage Threads, and Send Messages in Threads.</p>
      <h3>Keeping closed tickets</h3>
      ${selectField("retentionMonths", "Keep closed tickets for", RETENTION_OPTIONS, String(s.retentionMonths ?? 12))}
      <p class="microcopy full">Closed tickets older than this are deleted from ${escapeHtml(BRAND.name)}. Members keep the transcript we sent them.</p>
      <h3>Auto-close</h3>
      ${numberField("autoCloseHours", "Close after hours with no activity (0 = never)", s.autoCloseHours, 0, 720)}
      ${numberField("autoCloseWarningHours", "Warn this many hours before (0 = no warning)", s.autoCloseWarningHours, 0, 720)}
      ${checkbox("autoCloseExcludeClaimed", "Don't auto-close claimed tickets", s.autoCloseExcludeClaimed)}
      <h3>Blocking</h3>
      ${rolePicker("blockedRoleIds", "Roles that can't open tickets", s.blockedRoleIds, "")}
      ${textArea("blockedUserIds", "Blocked member IDs (one per line)", s.blockedUserIds.join("\n"))}
      <input type="hidden" name="expectedRevision" value="${s.revision}">
      <button class="button primary full">Save settings</button>
    </form>`;
}

/* ---------- Statistics ---------- */

function statsTab() {
  const s = view.overview.stats;
  const metric = (label, value) => `<div class="card metric"><span class="metric-label">${escapeHtml(label)}</span><strong class="metric-value">${escapeHtml(value)}</strong></div>`;
  return `
    <section class="grid cols-4">
      ${metric("Open", s.open)}${metric("Claimed", s.claimed)}${metric("Waiting on member", s.pending)}${metric("Closed", s.closed)}
      ${metric("Average rating", s.averageRating === undefined ? "No ratings yet" : `${s.averageRating} / 5 (${s.ratingCount})`)}
      ${metric("First response", minutes(s.averageFirstResponseMinutes))}
      ${metric("Time to resolve", minutes(s.averageResolutionMinutes))}
      ${metric("All tickets", s.total)}
    </section>
    <section class="grid cols-2">
      <div class="card"><h3>By reason</h3>${table(["Reason", "Open", "Total"], s.byCategory.map((item) => row([["Reason", escapeHtml(item.name)], ["Open", String(item.open)], ["Total", String(item.total)]])), "No tickets yet.")}</div>
      <div class="card"><h3>Top staff (tickets closed)</h3>${table(["Staff", "Closed"], s.topStaff.map((item) => row([["Staff", memberName(item.userId)], ["Closed", String(item.closed)]])), "No claimed tickets closed yet.")}</div>
    </section>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-t-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.tTab;
    history.replaceState({}, "", appPath(`/tickets?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-t-select]").forEach((element) => {
    const open = () => void selectTicket(element.dataset.tSelect);
    element.addEventListener("click", open);
    element.addEventListener("keydown", (event) => { if (event.key === "Enter") open(); });
  });
  container.querySelectorAll("[data-t-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.tAction, button.dataset.value)));
  container.querySelectorAll("form[data-t-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form.dataset.tForm, form);
  }));
  bindPickers(container);
  const panelForm = container.querySelector('form[data-t-form="panel"]');
  if (!panelForm) return;
  const refresh = () => {
    const payload = panelPayload(new FormData(panelForm));
    syncRows(payload.categoryIds);
    const rowsBox = document.getElementById("panelRowsEditor");
    const focused = document.activeElement?.closest?.("#panelRowsEditor") ? document.activeElement.getAttribute("aria-label") : undefined;
    if (rowsBox) rowsBox.innerHTML = rowsEditor(payload.style, payload.categoryIds);
    if (focused) rowsBox?.querySelector(`[aria-label="${CSS.escape(focused)}"]:not([disabled])`)?.focus();
    document.getElementById("panelPreview").innerHTML = panelPreview(panelPayload(new FormData(panelForm)));
  };
  panelForm.addEventListener("input", (event) => {
    if (event.target.matches?.("[data-rows-toggle]")) {
      const categoryIds = panelPayload(new FormData(panelForm)).categoryIds;
      view.panelRows = event.target.checked ? chunkRows(categoryIds).slice(0, MAX_ROWS) : null;
    }
    refresh();
  });
  panelForm.addEventListener("change", (event) => {
    // Redrawn pickers (↻) announce themselves with a change event only.
    if (event.target.matches?.("select[name=channelId]")) refresh();
  });
  panelForm.addEventListener("click", (event) => {
    const button = event.target.closest("[data-row-action]");
    if (!button) return;
    event.preventDefault();
    moveInRows(button.dataset.rowAction, Number(button.dataset.row), Number(button.dataset.index));
    refresh();
  });
}

async function selectTicket(id) {
  view.selectedId = id;
  try {
    view.detail = (await ticketDetail(id)).data;
  } catch (error) {
    notify(error.message, "error");
  }
  render();
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
  const id = view.selectedId;
  switch (name) {
    case "retry": return run(undefined, async () => undefined);
    case "claim": return run("Ticket claimed.", () => ticketAction(id, "claim"));
    case "unclaim": return run("Ticket unassigned.", () => ticketAction(id, "unclaim"));
    case "waiting": return run("Status updated.", () => ticketAction(id, "waiting", { waiting: value === "true" }));
    case "reopen": return run("Ticket reopened.", () => ticketAction(id, "reopen"));
    case "send-transcript": return run("Transcript sent to the member.", () => ticketAction(id, "send-transcript"));
    case "remove-participant": return run("Removed from the ticket.", () => removeTicketParticipant(id, value));
    case "close": {
      const reason = window.prompt("Reason for closing (optional)");
      if (reason === null) return undefined;
      return run("Ticket closed.", () => ticketAction(id, "close", reason ? { reason } : {}));
    }
    case "delete-channel":
      if (!(await confirmAction({ title: "Delete ticket channel?", body: "The Discord channel is deleted. The ticket record and transcript are kept.", confirmText: "Delete channel" }))) return undefined;
      return run("Channel deleted.", () => ticketAction(id, "delete-channel"));
    case "edit-reason": view.editingReason = value; return render();
    case "new-reason": view.editingReason = undefined; return render();
    case "delete-reason":
      if (!(await confirmAction({ title: "Delete this ticket reason?", body: "Existing tickets keep their history. Update your panels afterwards so the button disappears.", confirmText: "Delete" }))) return undefined;
      return run("Ticket reason deleted.", () => deleteTicketCategory(value));
    case "edit-panel": view.editingPanel = value; view.rowsFor = undefined; return render();
    case "new-panel": view.editingPanel = undefined; view.rowsFor = undefined; return render();
    case "repick-panel-channel": return repickPanelChannel(value);
    case "publish-panel":
      try {
        await publishTicketPanel(value);
        notify("Panel posted in Discord.");
        await load();
        render();
      } catch (error) {
        notify(error.message || "That did not work.", "error");
        // The panel's channel was deleted: open the panel with its channel picker so a new one can be chosen.
        if (/no longer exists/i.test(error.message ?? "")) {
          await load();
          return repickPanelChannel(value, false);
        }
      }
      return undefined;
    case "delete-panel":
      if (!(await confirmAction({ title: "Delete this panel?", body: "The panel message is removed from Discord.", confirmText: "Delete" }))) return undefined;
      return run("Panel deleted.", () => deleteTicketPanel(value));
    default: return undefined;
  }
}

/** Opens a panel whose channel is gone in the editor with the channel picker focused, and reloads the channel list first. */
async function repickPanelChannel(id, explain = true) {
  view.editingPanel = id;
  view.rowsFor = undefined;
  await loadDirectory({ refresh: true });
  render();
  const select = container.querySelector('form[data-t-form="panel"] [name="channelId"]');
  select?.scrollIntoView({ block: "center", behavior: "smooth" });
  select?.focus();
  if (explain) notify("This panel's channel no longer exists. Pick a new channel, save the panel, then post it.", "warning");
}

async function submit(name, form) {
  const data = new FormData(form);
  const id = view.selectedId;
  switch (name) {
    case "filters":
      view.filters = { status: String(data.get("status") ?? ""), search: String(data.get("search") ?? "").trim(), priority: String(data.get("priority") ?? "") };
      return run(undefined, async () => undefined);
    case "priority":
      return run("Ticket updated.", async () => {
        await ticketAction(id, "priority", { priority: data.get("priority") });
        await ticketAction(id, "tags", { tags: String(data.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean) });
      });
    case "reply": return run("Reply sent to Discord.", () => ticketAction(id, "reply", { content: data.get("content") }));
    case "note": return run("Posted to the staff chat.", () => ticketAction(id, "notes", { content: data.get("content") }));
    case "participant": return run("Added to the ticket.", () => ticketAction(id, "participants", { userId: data.get("userId") }));
    case "settings": return run("Settings saved.", () => saveTicketSettings(settingsPayload(form, data)));
    case "reason":
      return run(view.editingReason ? "Ticket reason saved." : "Ticket reason added.", async () => {
        await saveTicketCategory(reasonPayload(form, data), view.editingReason);
        view.editingReason = undefined;
      });
    case "panel":
      return run(view.editingPanel ? "Panel saved. Click “Update in Discord” to refresh it." : "Panel created. Click “Post in Discord” to send it.", async () => {
        await saveTicketPanel(panelPayload(data), view.editingPanel);
        view.editingPanel = undefined;
        view.rowsFor = undefined;
      });
    default: return undefined;
  }
}

function settingsPayload(form, data) {
  const bool = (name) => form.elements[name]?.checked === true;
  const int = (name) => Number.parseInt(String(data.get(name) ?? "0"), 10) || 0;
  return {
    enabled: bool("enabled"),
    mode: data.get("mode"),
    ...optionalId(data, "openCategoryChannelId"),
    ...optionalId(data, "closedCategoryChannelId"),
    ...optionalId(data, "threadParentChannelId"),
    ...optionalId(data, "transcriptChannelId"),
    ...optionalId(data, "logChannelId"),
    supportRoleIds: data.getAll("supportRoleIds"),
    pingSupportOnOpen: bool("pingSupportOnOpen"),
    maxOpenPerUser: int("maxOpenPerUser"),
    nameTemplate: String(data.get("nameTemplate")),
    openMessage: String(data.get("openMessage")),
    embedColor: String(data.get("embedColor")),
    allowUserClose: bool("allowUserClose"),
    requireCloseReason: bool("requireCloseReason"),
    closeConfirmation: bool("closeConfirmation"),
    closeAction: data.get("closeAction"),
    deleteDelaySeconds: int("deleteDelaySeconds"),
    claimEnabled: bool("claimEnabled"),
    claimRestrictsReplies: bool("claimRestrictsReplies"),
    transcriptsEnabled: bool("transcriptsEnabled"),
    transcriptDmUser: bool("transcriptDmUser"),
    feedbackEnabled: bool("feedbackEnabled"),
    autoCloseHours: int("autoCloseHours"),
    autoCloseWarningHours: int("autoCloseWarningHours"),
    autoCloseExcludeClaimed: bool("autoCloseExcludeClaimed"),
    blockedUserIds: String(data.get("blockedUserIds") ?? "").split(/\s+/).filter(Boolean),
    blockedRoleIds: data.getAll("blockedRoleIds"),
    staffThreadEnabled: bool("staffThreadEnabled"),
    retentionMonths: int("retentionMonths"),
    expectedRevision: int("expectedRevision"),
  };
}

function reasonPayload(form, data) {
  const text = (name) => String(data.get(name) ?? "").trim();
  const questions = [0, 1, 2, 3, 4].flatMap((index) => {
    const label = text(`q${index}-label`);
    if (!label) return [];
    const long = data.get(`q${index}-style`) === "PARAGRAPH";
    return [{ id: `q${index + 1}`, label, style: long ? "PARAGRAPH" : "SHORT", required: form.elements[`q${index}-required`]?.checked === true, maxLength: long ? 2000 : 200 }];
  });
  const maxOpen = Number.parseInt(text("maxOpenPerUser"), 10);
  return {
    name: text("name"),
    ...(text("description") ? { description: text("description") } : {}),
    ...(text("emoji") ? { emoji: text("emoji") } : {}),
    buttonStyle: data.get("buttonStyle"),
    defaultPriority: data.get("defaultPriority"),
    enabled: form.elements.enabled?.checked === true,
    supportRoleIds: data.getAll("supportRoleIds"),
    alertUserIds: data.getAll("alertUserIds"),
    requiredRoleIds: data.getAll("requiredRoleIds"),
    staffThread: String(data.get("staffThread") || "INHERIT"),
    ...optionalId(data, "parentChannelId"),
    ...(text("nameTemplate") ? { nameTemplate: text("nameTemplate") } : {}),
    ...(text("openMessage") ? { openMessage: text("openMessage") } : {}),
    ...(Number.isInteger(maxOpen) ? { maxOpenPerUser: maxOpen } : {}),
    questions,
  };
}

function panelPayload(data) {
  const text = (name) => String(data.get(name) ?? "").trim();
  const categoryIds = [...data.keys()].filter((key) => key.startsWith("reason-")).map((key) => key.slice("reason-".length));
  return {
    name: text("name"),
    channelId: text("channelId"),
    title: text("title"),
    description: text("description"),
    color: text("color"),
    style: data.get("style"),
    placeholder: text("placeholder") || "Select a reason",
    ...(text("imageUrl") ? { imageUrl: text("imageUrl") } : {}),
    ...(text("footer") ? { footer: text("footer") } : {}),
    categoryIds,
    rows: arrangedRows(categoryIds),
  };
}

/** The arranged rows to save (empty rows left out), or null for automatic rows. */
function arrangedRows(categoryIds) {
  if (!view.panelRows || !categoryIds.length) return null;
  const rows = view.panelRows.map((row) => row.filter((id) => categoryIds.includes(id))).filter((row) => row.length > 0);
  return rows.length ? rows : null;
}


function statusLabel(status) {
  return { OPEN: "open", CLAIMED: "claimed", PENDING: "waiting", CLOSED: "closed" }[status] ?? status.toLowerCase();
}

