import {
  deleteTicketCategory,
  deleteTicketPanel,
  listDiscordChannels,
  listDiscordRoles,
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
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";

const TABS = [
  ["inbox", "Inbox"],
  ["settings", "Settings"],
  ["types", "Ticket types"],
  ["panels", "Panels"],
  ["stats", "Statistics"],
];
const STATUS_FILTERS = [["open,claimed,pending", "Active"], ["open", "Open"], ["claimed", "Claimed"], ["pending", "Waiting"], ["closed", "Closed"], ["", "All"]];
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];
const BUTTON_STYLES = [["PRIMARY", "Blurple"], ["SECONDARY", "Grey"], ["SUCCESS", "Green"], ["DANGER", "Red"]];

const view = {
  tab: "inbox",
  overview: undefined,
  tickets: [],
  filters: { status: "open,claimed,pending", search: "", priority: "" },
  selectedId: undefined,
  detail: undefined,
  editingCategory: undefined,
  editingPanel: undefined,
  channels: [],
  roles: [],
  error: undefined,
};

/** Placeholder rendered synchronously; `mountLiveTickets` fills it in. */
export function liveTicketsShell() {
  return `<section class="card" id="ticketsLive"><p class="microcopy">Loading live tickets...</p></section>`;
}

export async function mountLiveTickets() {
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  try {
    const [overview, tickets] = await Promise.all([ticketsOverview(), listTickets(view.filters)]);
    view.overview = overview.data;
    view.tickets = tickets.data;
    view.error = undefined;
  } catch (error) {
    view.error = error.message;
  }
  await loadResources();
  render();
}

async function loadResources() {
  if (view.channels.length && view.roles.length) return;
  const [channels, roles] = await Promise.allSettled([listDiscordChannels(), listDiscordRoles()]);
  if (channels.status === "fulfilled") view.channels = channels.value.data ?? [];
  if (roles.status === "fulfilled") view.roles = (roles.value.data ?? []).filter((role) => !role.managed && role.name !== "@everyone");
}

function render() {
  const root = document.getElementById("ticketsLive");
  if (!root) return;
  if (view.error) {
    root.innerHTML = `<h2>Tickets</h2><p class="microcopy">${escapeHtml(view.error)}</p><p class="microcopy">Ticket staff need the <code>tickets.handle</code> permission. Configuration needs <code>tickets.manage</code>.</p><button class="button" data-ticket-action="retry">Try again</button>`;
    bind(root);
    return;
  }
  const settings = view.overview.settings;
  root.innerHTML = `
    <div class="split-line"><h2>Tickets</h2>${badge(settings.enabled ? "LIVE" : "DISABLED")}</div>
    <p class="microcopy">${settings.enabled ? "Manage support tickets. Replies you send here are posted in the Discord ticket." : "Tickets are turned off. Open Settings to set them up."}</p>
    <nav class="discord-tabs" aria-label="Ticket sections">${TABS.map(([id, label]) => `<button class="button compact ${view.tab === id ? "primary" : "ghost"}" data-ticket-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    <div id="ticketsTab">${tabContent()}</div>`;
  bind(root);
}

function tabContent() {
  switch (view.tab) {
    case "settings": return settingsTab();
    case "types": return typesTab();
    case "panels": return panelsTab();
    case "stats": return statsTab();
    default: return inboxTab();
  }
}

function inboxTab() {
  const rows = view.tickets.map((ticket) => row([
    ["Ticket", `<strong>#${ticket.number}</strong><br><small>${escapeHtml(ticket.subject || ticket.categoryName || "General support")}</small>`],
    ["Member", escapeHtml(ticket.openerName)],
    ["Type", escapeHtml(ticket.categoryName || "General")],
    ["Priority", badge(ticket.priority.toLowerCase())],
    ["Status", badge(statusLabel(ticket.status))],
    ["Assignee", ticket.claimedById ? `<code>${escapeHtml(ticket.claimedById)}</code>` : "—"],
    ["Activity", escapeHtml(relative(ticket.lastActivityAt))],
  ], `data-ticket-select="${escapeHtml(ticket.id)}" class="${ticket.id === view.selectedId ? "selected" : ""}" tabindex="0"`));
  return `
    <form class="toolbar" data-ticket-form="filters">
      <input name="search" placeholder="Search number, subject, member, tag" value="${escapeHtml(view.filters.search)}">
      <select name="status">${STATUS_FILTERS.map(([value, label]) => `<option value="${value}" ${view.filters.status === value ? "selected" : ""}>${label}</option>`).join("")}</select>
      <select name="priority"><option value="">Any priority</option>${PRIORITIES.map((value) => `<option value="${value}" ${view.filters.priority === value ? "selected" : ""}>${value.toLowerCase()}</option>`).join("")}</select>
      <button class="button compact">Filter</button>
    </form>
    <section class="grid main-detail">
      <div>${table(["Ticket", "Member", "Type", "Priority", "Status", "Assignee", "Activity"], rows, "No tickets match these filters.")}</div>
      <div class="card" id="ticketDetail">${detailPanel()}</div>
    </section>`;
}

function detailPanel() {
  if (!view.detail) return `<p class="microcopy">Select a ticket to see the conversation and actions.</p>`;
  const { ticket, messages, events } = view.detail;
  const closed = ticket.status === "CLOSED";
  const answers = ticket.answers.map((answer) => `<div class="detail-row"><span>${escapeHtml(answer.question)}</span><strong>${escapeHtml(answer.answer)}</strong></div>`).join("");
  const conversation = messages.length
    ? `<ul class="timeline">${messages.map((message) => `<li${message.internal ? ' class="internal-note"' : ""}><strong>${escapeHtml(message.authorName)}${message.internal ? " · internal note" : message.source === "WEB" ? " · portal" : ""}</strong><small>${escapeHtml(new Date(message.createdAt).toLocaleString())}</small><p>${escapeHtml(message.content)}</p>${message.attachments.map((url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Attachment</a>`).join(" ")}</li>`).join("")}</ul>`
    : `<p class="microcopy">No messages recorded yet.</p>`;
  return `
    <div class="detail-stack" data-ticket-id="${escapeHtml(ticket.id)}">
      <div class="split-line"><h2>#${ticket.number} ${escapeHtml(ticket.subject || ticket.categoryName || "Support")}</h2>${badge(statusLabel(ticket.status))}</div>
      <div class="detail-row"><span>Member</span><strong>${escapeHtml(ticket.openerName)} <code>${escapeHtml(ticket.openerId)}</code></strong></div>
      <div class="detail-row"><span>Type</span><strong>${escapeHtml(ticket.categoryName || "General")}</strong></div>
      <div class="detail-row"><span>Assignee</span><strong>${ticket.claimedById ? `<code>${escapeHtml(ticket.claimedById)}</code>` : "Unclaimed"}</strong></div>
      <div class="detail-row"><span>Opened</span><strong>${escapeHtml(new Date(ticket.createdAt).toLocaleString())}</strong></div>
      ${ticket.rating ? `<div class="detail-row"><span>Rating</span><strong>${"★".repeat(ticket.rating)}${ticket.feedback ? ` — ${escapeHtml(ticket.feedback)}` : ""}</strong></div>` : ""}
      ${ticket.closeReason ? `<div class="detail-row"><span>Close reason</span><strong>${escapeHtml(ticket.closeReason)}</strong></div>` : ""}
      ${answers}
      <div class="toolbar">
        ${closed ? `<button class="button compact" data-ticket-action="reopen">Reopen</button>${ticket.channelId ? `<button class="button compact danger" data-ticket-action="delete-channel">Delete channel</button>` : ""}` : `
          ${ticket.claimedById ? `<button class="button compact" data-ticket-action="unclaim">Unclaim</button>` : `<button class="button compact primary" data-ticket-action="claim">Claim</button>`}
          <button class="button compact" data-ticket-action="waiting" data-value="${ticket.status === "PENDING" ? "false" : "true"}">${ticket.status === "PENDING" ? "Resume" : "Wait for member"}</button>
          <button class="button compact danger" data-ticket-action="close">Close</button>`}
        <a class="button compact" href="${escapeHtml(ticketTranscriptUrl(ticket.id))}">Transcript</a>
      </div>
      ${closed ? "" : `
      <form class="form-grid" data-ticket-form="priority">
        <label>Priority<select name="priority">${PRIORITIES.map((value) => `<option ${ticket.priority === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
        <label>Tags<input name="tags" value="${escapeHtml(ticket.tags.join(", "))}" placeholder="billing, refund"></label>
        <button class="button compact full">Save priority and tags</button>
      </form>
      <form class="form-grid" data-ticket-form="reply"><label>Reply in Discord<textarea name="content" maxlength="1900" required placeholder="Visible to the member"></textarea></label><button class="button primary full">Send reply</button></form>
      <form class="form-grid" data-ticket-form="note"><label>Internal note<textarea name="content" maxlength="4000" required placeholder="Only staff can see this"></textarea></label><button class="button full">Save note</button></form>
      <form class="form-grid" data-ticket-form="participant"><label>Add member by Discord ID<input name="userId" pattern="\\d{17,20}" required></label><button class="button compact full">Add member</button></form>
      ${ticket.participantIds.length ? `<div class="toolbar">${ticket.participantIds.map((id) => `<button class="button compact ghost" data-ticket-action="remove-participant" data-value="${escapeHtml(id)}">Remove ${escapeHtml(id)}</button>`).join("")}</div>` : ""}
      <form class="form-grid" data-ticket-form="transfer"><label>Transfer to staff Discord ID<input name="userId" pattern="\\d{17,20}" required></label><button class="button compact full">Transfer</button></form>`}
      <h3>Conversation</h3>
      ${conversation}
      <h3>History</h3>
      <ul class="timeline">${events.slice().reverse().map((event) => `<li><strong>${escapeHtml(event.action.replaceAll("-", " "))}</strong><small>${escapeHtml(new Date(event.createdAt).toLocaleString())} · ${escapeHtml(event.source.toLowerCase())}</small></li>`).join("")}</ul>
    </div>`;
}

function settingsTab() {
  const s = view.overview.settings;
  return `
    <form class="form-grid readable-form" data-ticket-form="settings">
      <h3>General</h3>
      ${checkbox("enabled", "Tickets enabled", s.enabled)}
      ${selectField("mode", "Where tickets live", [["CHANNEL", "Private channels"], ["THREAD", "Private threads"]], s.mode)}
      ${channelField("openCategoryChannelId", "Category for new ticket channels", s.openCategoryChannelId, "CATEGORY")}
      ${channelField("threadParentChannelId", "Channel for ticket threads", s.threadParentChannelId, "TEXT")}
      ${roleMulti("supportRoleIds", "Support team roles", s.supportRoleIds)}
      ${checkbox("pingSupportOnOpen", "Ping support roles when a ticket opens", s.pingSupportOnOpen)}
      ${numberField("maxOpenPerUser", "Open tickets allowed per member", s.maxOpenPerUser, 1, 25)}
      <h3>Messages</h3>
      ${textField("nameTemplate", "Channel name template", s.nameTemplate, "{number} {username} {category}")}
      ${textArea("openMessage", "Opening message", s.openMessage, "{user} {username} {number} {category} {subject}")}
      ${textField("embedColor", "Embed color", s.embedColor)}
      <h3>Closing</h3>
      ${checkbox("allowUserClose", "Members can close their own tickets", s.allowUserClose)}
      ${checkbox("closeConfirmation", "Ask for confirmation before closing", s.closeConfirmation)}
      ${checkbox("requireCloseReason", "Require a reason to close", s.requireCloseReason)}
      ${selectField("closeAction", "After closing", [["ARCHIVE", "Keep the channel (read-only)"], ["DELETE", "Delete the channel"]], s.closeAction)}
      ${numberField("deleteDelaySeconds", "Seconds before deleting", s.deleteDelaySeconds, 0, 3600)}
      ${channelField("closedCategoryChannelId", "Move closed channels to category", s.closedCategoryChannelId, "CATEGORY")}
      <h3>Claiming</h3>
      ${checkbox("claimEnabled", "Staff can claim tickets", s.claimEnabled)}
      ${checkbox("claimRestrictsReplies", "Only the claimer can reply after a claim (channel mode)", s.claimRestrictsReplies)}
      <h3>Transcripts and feedback</h3>
      ${checkbox("transcriptsEnabled", "Post transcripts when tickets close", s.transcriptsEnabled)}
      ${channelField("transcriptChannelId", "Transcript channel", s.transcriptChannelId, "TEXT")}
      ${checkbox("transcriptDmUser", "DM the transcript to the member", s.transcriptDmUser)}
      ${checkbox("feedbackEnabled", "Ask members to rate closed tickets", s.feedbackEnabled)}
      ${channelField("logChannelId", "Ticket log channel", s.logChannelId, "TEXT")}
      <h3>Auto-close</h3>
      ${numberField("autoCloseHours", "Close after hours without activity (0 = off)", s.autoCloseHours, 0, 720)}
      ${numberField("autoCloseWarningHours", "Warn this many hours before (0 = off)", s.autoCloseWarningHours, 0, 720)}
      ${checkbox("autoCloseExcludeClaimed", "Skip claimed tickets", s.autoCloseExcludeClaimed)}
      <h3>Access</h3>
      ${roleMulti("blockedRoleIds", "Roles that cannot open tickets", s.blockedRoleIds)}
      ${textArea("blockedUserIds", "Blocked member IDs (one per line)", s.blockedUserIds.join("\n"))}
      <input type="hidden" name="expectedRevision" value="${s.revision}">
      <button class="button primary full">Save settings</button>
    </form>`;
}

function typesTab() {
  const categories = view.overview.categories;
  const editing = categories.find((item) => item.id === view.editingCategory);
  const rows = categories.map((category) => row([
    ["Type", `${escapeHtml(category.emoji || "")} <strong>${escapeHtml(category.name)}</strong><br><small>${escapeHtml(category.description || "")}</small>`],
    ["Status", badge(category.enabled ? "enabled" : "disabled")],
    ["Priority", escapeHtml(category.defaultPriority.toLowerCase())],
    ["Questions", String(category.questions.length)],
    ["", `<button class="button compact" data-ticket-action="edit-category" data-value="${escapeHtml(category.id)}">Edit</button> <button class="button compact danger" data-ticket-action="delete-category" data-value="${escapeHtml(category.id)}">Delete</button>`],
  ]));
  const c = editing ?? { name: "", buttonStyle: "PRIMARY", enabled: true, supportRoleIds: [], requiredRoleIds: [], defaultPriority: "NORMAL", questions: [] };
  const questions = [0, 1, 2, 3, 4].map((index) => {
    const q = c.questions[index] ?? {};
    return `<fieldset class="form-grid"><legend>Question ${index + 1}</legend>
      <label>Label<input name="q${index}-label" maxlength="45" value="${escapeHtml(q.label || "")}"></label>
      <label>Placeholder<input name="q${index}-placeholder" maxlength="100" value="${escapeHtml(q.placeholder || "")}"></label>
      <label>Answer size<select name="q${index}-style"><option value="SHORT" ${q.style !== "PARAGRAPH" ? "selected" : ""}>Short</option><option value="PARAGRAPH" ${q.style === "PARAGRAPH" ? "selected" : ""}>Paragraph</option></select></label>
      ${checkbox(`q${index}-required`, "Required", q.required ?? true)}
    </fieldset>`;
  }).join("");
  return `
    <section class="grid main-detail">
      <div>${table(["Type", "Status", "Priority", "Questions", ""], rows, "No ticket types yet. Members can still open general tickets.")}</div>
      <form class="card form-grid" data-ticket-form="category">
        <h3>${editing ? `Edit ${escapeHtml(editing.name)}` : "New ticket type"}</h3>
        ${textField("name", "Name", c.name)}
        ${textField("description", "Short description", c.description || "")}
        ${textField("emoji", "Emoji", c.emoji || "", "🎫 or <:name:id>")}
        ${selectField("buttonStyle", "Button color", BUTTON_STYLES, c.buttonStyle)}
        ${selectField("defaultPriority", "Default priority", PRIORITIES.map((p) => [p, p.toLowerCase()]), c.defaultPriority)}
        ${checkbox("enabled", "Enabled", c.enabled)}
        ${roleMulti("supportRoleIds", "Extra support roles", c.supportRoleIds)}
        ${roleMulti("requiredRoleIds", "Only members with these roles can open (optional)", c.requiredRoleIds)}
        ${channelField("parentChannelId", "Override category/channel (optional)", c.parentChannelId)}
        ${textField("nameTemplate", "Channel name override (optional)", c.nameTemplate || "")}
        ${textArea("openMessage", "Opening message override (optional)", c.openMessage || "")}
        ${numberField("maxOpenPerUser", "Max open of this type per member (optional)", c.maxOpenPerUser ?? "", 1, 25, false)}
        <h3>Form questions</h3>
        <p class="microcopy">Members answer these in a pop-up form when opening this type. Leave a label empty to skip it.</p>
        ${questions}
        <button class="button primary full">${editing ? "Save changes" : "Create ticket type"}</button>
        ${editing ? `<button type="button" class="button full" data-ticket-action="new-category">Cancel editing</button>` : ""}
      </form>
    </section>`;
}

function panelsTab() {
  const { panels, categories } = view.overview;
  const editing = panels.find((item) => item.id === view.editingPanel);
  const rows = panels.map((panel) => row([
    ["Panel", `<strong>${escapeHtml(panel.name)}</strong><br><small>${escapeHtml(panel.title)}</small>`],
    ["Channel", escapeHtml(channelName(panel.channelId))],
    ["Style", escapeHtml(panel.style === "SELECT_MENU" ? "Dropdown" : "Buttons")],
    ["Status", badge(panel.messageId ? "published" : "draft")],
    ["", `<button class="button compact primary" data-ticket-action="publish-panel" data-value="${escapeHtml(panel.id)}">${panel.messageId ? "Update in Discord" : "Publish"}</button> <button class="button compact" data-ticket-action="edit-panel" data-value="${escapeHtml(panel.id)}">Edit</button> <button class="button compact danger" data-ticket-action="delete-panel" data-value="${escapeHtml(panel.id)}">Delete</button>`],
  ]));
  const p = editing ?? { name: "", title: "Need help?", description: "Choose a ticket type below and our team will help you as soon as possible.", color: view.overview.settings.embedColor, style: "BUTTONS", placeholder: "Select a ticket type", categoryIds: [] };
  return `
    <section class="grid main-detail">
      <div>${table(["Panel", "Channel", "Style", "Status", ""], rows, "No panels yet. A panel is the message members click to open tickets.")}</div>
      <form class="card form-grid" data-ticket-form="panel">
        <h3>${editing ? `Edit ${escapeHtml(editing.name)}` : "New panel"}</h3>
        ${textField("name", "Internal name", p.name)}
        ${channelField("channelId", "Post in channel", p.channelId, "TEXT", true)}
        ${textField("title", "Title", p.title)}
        ${textArea("description", "Message", p.description)}
        ${textField("color", "Color", p.color)}
        ${selectField("style", "Style", [["BUTTONS", "Buttons"], ["SELECT_MENU", "Dropdown menu"]], p.style)}
        ${textField("placeholder", "Dropdown placeholder", p.placeholder)}
        ${textField("imageUrl", "Image URL (optional)", p.imageUrl || "")}
        ${textField("footer", "Footer (optional)", p.footer || "")}
        <fieldset><legend>Ticket types on this panel (none selected = all enabled types)</legend>
          ${categories.map((category) => checkbox(`category-${category.id}`, category.name, p.categoryIds.includes(category.id))).join("") || '<p class="microcopy">Create ticket types first.</p>'}
        </fieldset>
        <button class="button primary full">${editing ? "Save panel" : "Create panel"}</button>
        ${editing ? `<button type="button" class="button full" data-ticket-action="new-panel">Cancel editing</button>` : ""}
      </form>
    </section>`;
}

function statsTab() {
  const s = view.overview.stats;
  const metric = (label, value) => `<div class="card metric"><span class="metric-label">${escapeHtml(label)}</span><strong class="metric-value">${escapeHtml(value)}</strong></div>`;
  return `
    <section class="grid cols-4">
      ${metric("Open", s.open)}${metric("Claimed", s.claimed)}${metric("Waiting", s.pending)}${metric("Closed", s.closed)}
      ${metric("Average rating", s.averageRating === undefined ? "n/a" : `${s.averageRating}/5 (${s.ratingCount})`)}
      ${metric("First response", minutes(s.averageFirstResponseMinutes))}
      ${metric("Time to resolve", minutes(s.averageResolutionMinutes))}
      ${metric("Total tickets", s.total)}
    </section>
    <section class="grid cols-2">
      <div class="card"><h3>By type</h3>${table(["Type", "Open", "Total"], s.byCategory.map((item) => row([["Type", escapeHtml(item.name)], ["Open", String(item.open)], ["Total", String(item.total)]])), "No tickets yet.")}</div>
      <div class="card"><h3>Top staff (closed tickets)</h3>${table(["Staff", "Closed"], s.topStaff.map((item) => row([["Staff", `<code>${escapeHtml(item.userId)}</code>`], ["Closed", String(item.closed)]])), "No claimed tickets closed yet.")}</div>
    </section>`;
}

function bind(root) {
  root.querySelectorAll("[data-ticket-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.ticketTab;
    history.replaceState({}, "", appPath(`/tickets?tab=${view.tab}`));
    render();
  }));
  root.querySelectorAll("[data-ticket-select]").forEach((element) => {
    const open = () => void selectTicket(element.dataset.ticketSelect);
    element.addEventListener("click", open);
    element.addEventListener("keydown", (event) => { if (event.key === "Enter") open(); });
  });
  root.querySelectorAll("[data-ticket-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.ticketAction, button.dataset.value)));
  root.querySelectorAll("form[data-ticket-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form.dataset.ticketForm, form);
  }));
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

async function refresh() {
  const [overview, tickets] = await Promise.all([ticketsOverview(), listTickets(view.filters)]);
  view.overview = overview.data;
  view.tickets = tickets.data;
  if (view.selectedId) view.detail = (await ticketDetail(view.selectedId).catch(() => undefined))?.data;
  render();
}

async function run(label, operation) {
  try {
    await operation();
    if (label) notify(label);
    await refresh();
  } catch (error) {
    notify(error.message || "That did not work.", "error");
  }
}

async function action(name, value) {
  const id = view.selectedId;
  switch (name) {
    case "retry": return mountLiveTickets();
    case "claim": return run("Ticket claimed.", () => ticketAction(id, "claim"));
    case "unclaim": return run("Claim released.", () => ticketAction(id, "unclaim"));
    case "waiting": return run("Status updated.", () => ticketAction(id, "waiting", { waiting: value === "true" }));
    case "reopen": return run("Ticket reopened.", () => ticketAction(id, "reopen"));
    case "remove-participant": return run("Member removed.", () => removeTicketParticipant(id, value));
    case "close": {
      const reason = window.prompt("Close reason (optional)") ?? undefined;
      if (reason === undefined) return undefined;
      return run("Ticket closed.", () => ticketAction(id, "close", reason ? { reason } : {}));
    }
    case "delete-channel":
      if (!(await confirmAction({ title: "Delete ticket channel", body: "The Discord channel is deleted. The record and transcript stay in Qbox.", confirmText: "Delete channel" }))) return undefined;
      return run("Channel deleted.", () => ticketAction(id, "delete-channel"));
    case "edit-category": view.editingCategory = value; return render();
    case "new-category": view.editingCategory = undefined; return render();
    case "delete-category":
      if (!(await confirmAction({ title: "Delete ticket type", body: "Existing tickets keep their history. Panels stop offering this type after you republish them.", confirmText: "Delete" }))) return undefined;
      return run("Ticket type deleted.", () => deleteTicketCategory(value));
    case "edit-panel": view.editingPanel = value; return render();
    case "new-panel": view.editingPanel = undefined; return render();
    case "publish-panel": return run("Panel posted in Discord.", () => publishTicketPanel(value));
    case "delete-panel":
      if (!(await confirmAction({ title: "Delete panel", body: "The panel message is removed from Discord.", confirmText: "Delete" }))) return undefined;
      return run("Panel deleted.", () => deleteTicketPanel(value));
    default: return undefined;
  }
}

async function submit(name, form) {
  const data = new FormData(form);
  const id = view.selectedId;
  switch (name) {
    case "filters":
      view.filters = { status: data.get("status") ?? "", search: String(data.get("search") ?? "").trim(), priority: data.get("priority") ?? "" };
      return run(undefined, async () => undefined);
    case "priority":
      return run("Ticket updated.", async () => {
        await ticketAction(id, "priority", { priority: data.get("priority") });
        await ticketAction(id, "tags", { tags: String(data.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean) });
      });
    case "reply": return run("Reply sent to Discord.", () => ticketAction(id, "reply", { content: data.get("content") }));
    case "note": return run("Note saved.", () => ticketAction(id, "notes", { content: data.get("content") }));
    case "participant": return run("Member added.", () => ticketAction(id, "participants", { userId: data.get("userId") }));
    case "transfer": return run("Ticket transferred.", () => ticketAction(id, "transfer", { userId: data.get("userId") }));
    case "settings": return run("Ticket settings saved.", () => saveTicketSettings(settingsPayload(form, data)));
    case "category":
      return run(view.editingCategory ? "Ticket type saved." : "Ticket type created.", async () => {
        await saveTicketCategory(categoryPayload(form, data), view.editingCategory);
        view.editingCategory = undefined;
      });
    case "panel":
      return run(view.editingPanel ? "Panel saved. Use Update in Discord to refresh it." : "Panel created. Publish it to post in Discord.", async () => {
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
    supportRoleIds: roleIds(data, "supportRoleIds"),
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
    blockedRoleIds: roleIds(data, "blockedRoleIds"),
    expectedRevision: int("expectedRevision"),
  };
}

function categoryPayload(form, data) {
  const text = (name) => String(data.get(name) ?? "").trim();
  const questions = [0, 1, 2, 3, 4].flatMap((index) => {
    const label = text(`q${index}-label`);
    if (!label) return [];
    const placeholder = text(`q${index}-placeholder`);
    return [{ id: `q${index + 1}`, label, ...(placeholder ? { placeholder } : {}), style: data.get(`q${index}-style`), required: form.elements[`q${index}-required`]?.checked === true, maxLength: data.get(`q${index}-style`) === "PARAGRAPH" ? 2000 : 200 }];
  });
  const maxOpen = Number.parseInt(text("maxOpenPerUser"), 10);
  return {
    name: text("name"),
    ...(text("description") ? { description: text("description") } : {}),
    ...(text("emoji") ? { emoji: text("emoji") } : {}),
    buttonStyle: data.get("buttonStyle"),
    defaultPriority: data.get("defaultPriority"),
    enabled: form.elements.enabled?.checked === true,
    supportRoleIds: roleIds(data, "supportRoleIds"),
    requiredRoleIds: roleIds(data, "requiredRoleIds"),
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
    placeholder: text("placeholder"),
    ...(text("imageUrl") ? { imageUrl: text("imageUrl") } : {}),
    ...(text("footer") ? { footer: text("footer") } : {}),
    categoryIds: [...data.keys()].filter((key) => key.startsWith("category-")).map((key) => key.slice("category-".length)),
  };
}

/** Role IDs from the multi-select, or from the ID textarea when roles could not be loaded. */
function roleIds(data, name) {
  if (data.has(`${name}-raw`)) return String(data.get(`${name}-raw`)).split(/\s+/).filter(Boolean);
  return data.getAll(name);
}

function optionalId(data, name) {
  const value = String(data.get(name) ?? "").trim();
  return value ? { [name]: value } : {};
}

function checkbox(name, label, checked) {
  return `<label class="checkbox"><input type="checkbox" name="${escapeHtml(name)}" ${checked ? "checked" : ""}> ${escapeHtml(label)}</label>`;
}

function textField(name, label, value, hint = "") {
  return `<label>${escapeHtml(label)}<input name="${escapeHtml(name)}" value="${escapeHtml(value ?? "")}" ${hint ? `placeholder="${escapeHtml(hint)}"` : ""}></label>`;
}

function textArea(name, label, value, hint = "") {
  return `<label>${escapeHtml(label)}<textarea name="${escapeHtml(name)}" ${hint ? `placeholder="${escapeHtml(hint)}"` : ""}>${escapeHtml(value ?? "")}</textarea></label>`;
}

function numberField(name, label, value, min, max, required = true) {
  return `<label>${escapeHtml(label)}<input type="number" name="${escapeHtml(name)}" value="${escapeHtml(value)}" min="${min}" max="${max}" ${required ? "required" : ""}></label>`;
}

function selectField(name, label, options, selected) {
  return `<label>${escapeHtml(label)}<select name="${escapeHtml(name)}">${options.map(([value, text]) => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}</select></label>`;
}

/** Channel picker when Discord resources are available, otherwise an ID field. */
function channelField(name, label, selected, type, required = false) {
  const channels = view.channels.filter((channel) => type === undefined || (type === "CATEGORY" ? channel.type === "CATEGORY" : channel.type === "TEXT" || channel.type === "ANNOUNCEMENT"));
  if (!channels.length)
    return `<label>${escapeHtml(label)} (ID)<input name="${escapeHtml(name)}" value="${escapeHtml(selected ?? "")}" pattern="\\d{17,20}" ${required ? "required" : ""}></label>`;
  return `<label>${escapeHtml(label)}<select name="${escapeHtml(name)}" ${required ? "required" : ""}><option value="">${required ? "Choose a channel" : "Not set"}</option>${channels.map((channel) => `<option value="${escapeHtml(channel.id)}" ${channel.id === selected ? "selected" : ""}>${type === "CATEGORY" ? "" : "#"}${escapeHtml(channel.name)}</option>`).join("")}</select></label>`;
}

function roleMulti(name, label, selected) {
  if (!view.roles.length)
    return `<label>${escapeHtml(label)} (role IDs, one per line)<textarea name="${escapeHtml(name)}-raw">${escapeHtml(selected.join("\n"))}</textarea></label>`;
  return `<label>${escapeHtml(label)}<select name="${escapeHtml(name)}" multiple size="${Math.min(8, Math.max(3, view.roles.length))}">${view.roles.map((role) => `<option value="${escapeHtml(role.id)}" ${selected.includes(role.id) ? "selected" : ""}>${escapeHtml(role.name)}</option>`).join("")}</select></label>`;
}

function channelName(id) {
  const channel = view.channels.find((item) => item.id === id);
  return channel ? `#${channel.name}` : id;
}

function statusLabel(status) {
  return { OPEN: "open", CLAIMED: "claimed", PENDING: "waiting", CLOSED: "closed" }[status] ?? status.toLowerCase();
}

function relative(value) {
  const minutesAgo = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutesAgo < 1) return "just now";
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  if (minutesAgo < 1440) return `${Math.round(minutesAgo / 60)}h ago`;
  return `${Math.round(minutesAgo / 1440)}d ago`;
}

function minutes(value) {
  if (value === undefined || value === null) return "n/a";
  return value >= 120 ? `${Math.round(value / 60)}h` : `${value}m`;
}
