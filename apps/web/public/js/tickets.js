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

const view = {
  tab: "inbox",
  overview: undefined,
  tickets: [],
  filters: { status: "open,claimed,pending", search: "", priority: "" },
  selectedId: undefined,
  detail: undefined,
  editingReason: undefined,
  editingPanel: undefined,
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
  const conversation = messages.length
    ? `<ul class="timeline">${messages.map((message) => `<li${message.internal ? ' class="internal-note"' : ""}><strong>${escapeHtml(message.authorName)}${message.internal ? " · internal note" : message.source === "WEB" ? " · from portal" : ""}</strong><small>${escapeHtml(new Date(message.createdAt).toLocaleString())}</small><p>${escapeHtml(message.content)}</p>${message.attachments.map((url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Attachment</a>`).join(" ")}</li>`).join("")}</ul>`
    : `<p class="microcopy">No messages yet.</p>`;
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
          ? `<button class="button compact" data-t-action="reopen">Reopen</button>${ticket.channelId ? `<button class="button compact danger" data-t-action="delete-channel">Delete channel</button>` : ""}`
          : `${ticket.claimedById ? `<button class="button compact" data-t-action="unclaim">Unassign</button>` : `<button class="button compact primary" data-t-action="claim">Claim</button>`}
             <button class="button compact" data-t-action="waiting" data-value="${ticket.status === "PENDING" ? "false" : "true"}">${ticket.status === "PENDING" ? "Resume" : "Waiting on member"}</button>
             <button class="button compact danger" data-t-action="close">Close</button>`}
        <a class="button compact" href="${escapeHtml(ticketTranscriptUrl(ticket.id))}">Transcript</a>
      </div>
      ${closed ? "" : `
        <form class="form-grid" data-t-form="reply"><label class="full">Reply in Discord<textarea name="content" maxlength="1900" required placeholder="The member sees this in their ticket"></textarea></label><button class="button primary full">Send reply</button></form>
        <form class="form-grid" data-t-form="note"><label class="full">Internal note<textarea name="content" maxlength="4000" required placeholder="Only staff can see this"></textarea></label><button class="button full">Save note</button></form>
        <form class="form-grid" data-t-form="priority">
          <label>Priority<select name="priority">${PRIORITIES.map((value) => `<option value="${value}" ${ticket.priority === value ? "selected" : ""}>${value.toLowerCase()}</option>`).join("")}</select></label>
          <label>Tags<input name="tags" value="${escapeHtml(ticket.tags.join(", "))}" placeholder="billing, refund"></label>
          <button class="button compact full">Save priority and tags</button>
        </form>
        <form class="form-grid" data-t-form="participant"><label class="full">Add someone to this ticket (Discord ID)<input name="userId" pattern="\\d{17,20}" required></label><button class="button compact full">Add</button></form>
        ${ticket.participantIds.length ? `<div class="chip-row">${ticket.participantIds.map((id) => `<span class="chip">${memberName(id)}<button type="button" aria-label="Remove" data-t-action="remove-participant" data-value="${escapeHtml(id)}">×</button></span>`).join("")}</div>` : ""}`}
      <h3>Conversation</h3>
      ${conversation}
      <h3>History</h3>
      <ul class="timeline">${events.slice().reverse().map((event) => `<li><strong>${escapeHtml(event.action.replaceAll("-", " "))}</strong><small>${escapeHtml(new Date(event.createdAt).toLocaleString())} · ${escapeHtml(event.source.toLowerCase())}</small></li>`).join("")}</ul>
    </div>`;
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
        ${memberPicker("alertUserIds", "Alert specific members", c.alertUserIds, "They are added to the ticket and pinged when it opens.")}
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
    ? `<ul class="reason-list">${panels.map((panel) => `
        <li class="${panel.id === view.editingPanel ? "selected" : ""}">
          <div><strong>${escapeHtml(panel.name)}</strong> ${badge(panel.messageId ? "posted" : "not posted")}
            <small>${escapeHtml(channelLabel(panel.channelId) || panel.channelId)} · ${panel.style === "SELECT_MENU" ? "Dropdown" : "Buttons"} · ${panel.categoryIds.length || "All"} reason(s)</small></div>
          <div class="toolbar"><button class="button compact primary" data-t-action="publish-panel" data-value="${escapeHtml(panel.id)}">${panel.messageId ? "Update in Discord" : "Post in Discord"}</button><button class="button compact" data-t-action="edit-panel" data-value="${escapeHtml(panel.id)}">Edit</button><button class="button compact danger" data-t-action="delete-panel" data-value="${escapeHtml(panel.id)}">Delete</button></div>
        </li>`).join("")}</ul>`
    : `<div class="empty-state">No panels yet. A panel is the message in your support channel with one button per ticket reason.</div>`;
  const p = editing ?? { name: "Support", title: "Need help?", description: "Pick a reason below and our team will be with you shortly.", color: view.overview.settings.embedColor, style: "BUTTONS", placeholder: "Select a reason", categoryIds: categories.filter((category) => category.enabled).map((category) => category.id) };
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
        <button class="button primary full">${editing ? "Save panel" : "Create panel"}</button>
      </form>
    </section>`;
}

/** Renders the panel the way Discord shows it, from the current form values. */
function panelPreview(panel) {
  const categories = view.overview.categories.filter((category) => panel.categoryIds.includes(category.id) && category.enabled);
  const color = /^#?[0-9a-f]{6}$/i.test(panel.color || "") ? (panel.color.startsWith("#") ? panel.color : `#${panel.color}`) : "#5865F2";
  const controls = panel.style === "SELECT_MENU"
    ? `<div class="dc-select">${escapeHtml(panel.placeholder || "Select a reason")}<span>⌄</span></div>`
    : `<div class="dc-buttons">${categories.map((category) => `<span class="dc-button ${category.buttonStyle.toLowerCase()}">${escapeHtml(category.emoji || "")} ${escapeHtml(category.name)}</span>`).join("") || '<span class="microcopy">No reasons selected</span>'}</div>`;
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
      ${checkbox("transcriptDmUser", "Send the transcript to the member", s.transcriptDmUser)}
      ${channelSelect("logChannelId", "Ticket log channel", s.logChannelId, "TEXT", "Not set")}
      ${checkbox("feedbackEnabled", "Ask members to rate their ticket", s.feedbackEnabled)}
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
  panelForm?.addEventListener("input", () => {
    document.getElementById("panelPreview").innerHTML = panelPreview(panelPayload(new FormData(panelForm)));
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
    case "edit-panel": view.editingPanel = value; return render();
    case "new-panel": view.editingPanel = undefined; return render();
    case "publish-panel": return run("Panel posted in Discord.", () => publishTicketPanel(value));
    case "delete-panel":
      if (!(await confirmAction({ title: "Delete this panel?", body: "The panel message is removed from Discord.", confirmText: "Delete" }))) return undefined;
      return run("Panel deleted.", () => deleteTicketPanel(value));
    default: return undefined;
  }
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
    case "note": return run("Note saved.", () => ticketAction(id, "notes", { content: data.get("content") }));
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
    ...optionalId(data, "parentChannelId"),
    ...(text("nameTemplate") ? { nameTemplate: text("nameTemplate") } : {}),
    ...(text("openMessage") ? { openMessage: text("openMessage") } : {}),
    ...(Number.isInteger(maxOpen) ? { maxOpenPerUser: maxOpen } : {}),
    questions,
  };
}

function panelPayload(data) {
  const text = (name) => String(data.get(name) ?? "").trim();
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
    categoryIds: [...data.keys()].filter((key) => key.startsWith("reason-")).map((key) => key.slice("reason-".length)),
  };
}


function statusLabel(status) {
  return { OPEN: "open", CLAIMED: "claimed", PENDING: "waiting", CLOSED: "closed" }[status] ?? status.toLowerCase();
}

