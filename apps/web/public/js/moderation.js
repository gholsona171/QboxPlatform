import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import {
  bindPickers,
  boolValue,
  channelLabel,
  channelPicker,
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
  selectField,
  textArea,
  textField,
} from "./forms.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";

const TABS = [
  ["cases", "Cases"],
  ["action", "Take action"],
  ["channels", "Channel tools"],
  ["automod", "Automod"],
  ["settings", "Settings"],
  ["stats", "Statistics"],
];
const TYPE_LABELS = { WARN: "Warning", TIMEOUT: "Timeout", UNTIMEOUT: "Timeout removed", KICK: "Kick", BAN: "Ban", UNBAN: "Unban", SOFTBAN: "Softban", NOTE: "Note" };
const ACTIONS = [
  ["WARN", "Warn", "warn"],
  ["NOTE", "Add a staff note", "warn"],
  ["TIMEOUT", "Timeout", "timeout"],
  ["UNTIMEOUT", "Remove timeout", "timeout"],
  ["KICK", "Kick", "kick"],
  ["SOFTBAN", "Softban (kick and delete messages)", "ban"],
  ["BAN", "Ban", "ban"],
  ["UNBAN", "Unban", "ban"],
];
const AUTOMOD_ACTIONS = [["DELETE", "Delete the message"], ["WARN", "Delete and warn"], ["TIMEOUT", "Delete and time out"]];
const DURATION_UNITS = [["1", "minutes"], ["60", "hours"], ["1440", "days"], ["10080", "weeks"]];

const view = { tab: "cases", overview: undefined, cases: [], filters: { type: "", search: "", active: "" }, selected: undefined, error: undefined };
let container;

export async function renderModerationPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading moderation...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    const [overview, cases] = await Promise.all([getJson("moderation/overview"), getJson(`moderation/cases?${casesQuery()}`)]);
    view.overview = overview.data;
    view.cases = cases.data;
    view.error = undefined;
    if (view.selected) view.selected = view.cases.find((item) => item.number === view.selected.number) ?? view.selected;
    await loadDirectory(view.cases.flatMap((item) => [item.targetId, item.moderatorId]).filter((id) => id !== "0"));
  } catch (error) {
    view.error = error;
  }
}

function casesQuery() {
  const query = new URLSearchParams({ limit: "100" });
  if (view.filters.type) query.set("type", view.filters.type);
  if (view.filters.search) query.set("search", view.filters.search);
  if (view.filters.active) query.set("active", view.filters.active);
  return query.toString();
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    const denied = view.error.status === 403;
    container.innerHTML = `<section class="card"><h2>${denied ? "You don't have access to moderation" : "Moderation is unavailable"}</h2><p class="microcopy">${denied ? "Ask a server admin for the View moderation permission (moderation.view)." : escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  const can = view.overview.can;
  const tabs = TABS.filter(([id]) => id !== "automod" && id !== "settings" ? id !== "channels" || can.messages : can.manage).filter(([id]) => id !== "action" || ACTIONS.some(([, , need]) => can[need]));
  if (!tabs.some(([id]) => id === view.tab)) view.tab = "cases";
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Moderation sections">${tabs.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-m-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    <div>${tabContent()}</div>
  </section>`;
  bind();
}

function tabContent() {
  switch (view.tab) {
    case "action": return actionTab();
    case "channels": return channelsTab();
    case "automod": return automodTab();
    case "settings": return settingsTab();
    case "stats": return statsTab();
    default: return casesTab();
  }
}

/* ---------- Cases ---------- */

function setupNote() {
  if (!view.overview.can.manage) return "";
  const { automod, logChannelId } = view.overview.settings;
  const missing = [
    ...(automod.enabled ? [] : [["Automod is off.", "automod", "Turn on automod"]]),
    ...(logChannelId ? [] : [["No log channel is set, so actions are not posted in Discord.", "settings", "Pick a log channel"]]),
  ];
  if (!missing.length) return "";
  return `<div class="card">${missing.map(([text, tab, label]) => `<p class="split-line"><span>${escapeHtml(text)}</span><button class="button compact" data-m-tab="${tab}">${escapeHtml(label)}</button></p>`).join("")}</div>`;
}

function filtersActive() {
  return view.filters.type !== "" || view.filters.search !== "" || view.filters.active !== "";
}

function casesTab() {
  const rows = view.cases.map((item) => row([
    ["Case", `<strong>#${item.number}</strong>`],
    ["Action", `${badge(TYPE_LABELS[item.type].toLowerCase())}${item.revokedAt ? ` ${badge("pardoned")}` : ""}`],
    ["Member", `${escapeHtml(item.targetName)}`],
    ["By", item.moderatorId === "0" ? escapeHtml(item.moderatorName) : memberName(item.moderatorId)],
    ["Reason", escapeHtml((item.reason ?? "—").slice(0, 80))],
    ["When", escapeHtml(relative(item.createdAt))],
  ], `data-m-case="${item.number}" class="${item.number === view.selected?.number ? "selected" : ""}" tabindex="0"`));
  return `
    ${setupNote()}
    <form class="toolbar" data-m-form="filters">
      <input name="search" placeholder="Search #case, member name or ID, reason" value="${escapeHtml(view.filters.search)}">
      <select name="type"><option value="">All actions</option>${Object.entries(TYPE_LABELS).map(([value, label]) => `<option value="${value}" ${view.filters.type === value ? "selected" : ""}>${label}</option>`).join("")}</select>
      <select name="active"><option value="">Any state</option><option value="true" ${view.filters.active === "true" ? "selected" : ""}>Active</option><option value="false" ${view.filters.active === "false" ? "selected" : ""}>Ended or pardoned</option></select>
      <button class="button compact">Filter</button>
    </form>
    <section class="grid main-detail">
      <div>${table(["Case", "Action", "Member", "By", "Reason", "When"], rows, filtersActive() ? "No cases match." : "No cases yet. Actions taken in Take action or with Discord commands show up here.")}</div>
      <div class="card">${caseDetail()}</div>
    </section>`;
}

function caseDetail() {
  const item = view.selected;
  if (!item) return `<p class="microcopy">Select a case to see details, edit the reason, or pardon it.</p>`;
  const can = view.overview.can;
  return `<div class="detail-stack">
    <div class="split-line"><h2>Case #${item.number} · ${escapeHtml(TYPE_LABELS[item.type])}</h2>${item.revokedAt ? badge("pardoned") : item.active ? badge("active") : ""}</div>
    ${detail("Member", `${escapeHtml(item.targetName)} <code>${escapeHtml(item.targetId)}</code>`)}
    ${detail("Moderator", item.moderatorId === "0" ? escapeHtml(item.moderatorName) : memberName(item.moderatorId))}
    ${detail("Source", escapeHtml({ DISCORD: "Discord command", WEB: "Portal", AUTOMOD: "Automatic", EXTERNAL: "Done directly in Discord" }[item.source]))}
    ${detail("When", escapeHtml(dateTime(item.createdAt)))}
    ${item.durationMinutes ? detail("Length", escapeHtml(durationText(item.durationMinutes))) : ""}
    ${item.expiresAt ? detail(item.active ? "Ends" : "Ended", escapeHtml(dateTime(item.expiresAt))) : ""}
    ${item.dmDelivered === false ? detail("DM", "Could not reach the member") : ""}
    ${item.revokedAt ? detail("Pardoned", escapeHtml(`${dateTime(item.revokedAt)}${item.revokeReason ? ` — ${item.revokeReason}` : ""}`)) : ""}
    ${detail("Reason", escapeHtml(item.reason ?? "No reason given"))}
    ${item.evidence.length ? `<h3>Evidence</h3><ul class="timeline">${item.evidence.map((url) => `<li><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a></li>`).join("")}</ul>` : ""}
    <div class="toolbar"><button class="button compact" data-m-action="history" data-value="${escapeHtml(item.targetId)}">Member history</button></div>
    ${can.manage ? `
      <form class="form-grid" data-m-form="reason"><label class="full">Change reason<textarea name="reason" maxlength="1000" required>${escapeHtml(item.reason ?? "")}</textarea></label><button class="button full">Save reason</button></form>
      <form class="form-grid" data-m-form="evidence"><label class="full">Add evidence link<input name="url" type="url" placeholder="https://..." required></label><button class="button full">Add evidence</button></form>
      ${item.revokedAt ? "" : `<button class="button danger full" data-m-action="pardon">Pardon this case${item.active && (item.type === "BAN" || item.type === "TIMEOUT") ? " (lifts it in Discord)" : ""}</button>`}` : ""}
    <div id="memberHistory"></div>
  </div>`;
}

/* ---------- Take action ---------- */

function actionTab() {
  const can = view.overview.can;
  const actions = ACTIONS.filter(([, , need]) => can[need]);
  const settings = view.overview.settings;
  return `<form class="card form-grid readable-form" data-m-form="action">
    <h3>Take action on a member</h3>
    ${memberPicker("userId", "Member", [], "Search by name, or paste a user ID (needed to unban someone who left).")}
    ${selectField("type", "Action", actions.map(([value, label]) => [value, label]), actions[0]?.[0])}
    <label>Length (timeouts and temporary bans)<span class="duration-row"><input type="number" name="durationAmount" min="1" max="999" placeholder="${settings.defaultTimeoutMinutes >= 60 ? settings.defaultTimeoutMinutes / 60 : settings.defaultTimeoutMinutes}"><select name="durationUnit">${DURATION_UNITS.map(([value, label]) => `<option value="${value}" ${value === "60" ? "selected" : ""}>${label}</option>`).join("")}</select></span></label>
    ${selectField("deleteMessageHours", "Delete their messages (bans)", [["", "Server default"], ["0", "Don't delete"], ["1", "Last hour"], ["24", "Last 24 hours"], ["168", "Last 7 days"]], "")}
    ${textArea("reason", settings.requireReason ? "Reason (required)" : "Reason", "")}
    ${textField("evidence", "Evidence link (optional)", "", "https://...", false, "full")}
    <p class="microcopy">Leave the length empty for the default timeout (${escapeHtml(durationText(settings.defaultTimeoutMinutes))}) or a permanent ban.</p>
    <button class="button primary full">Apply</button>
  </form>`;
}

/* ---------- Channel tools ---------- */

function channelsTab() {
  return `<section class="grid cols-2">
    <form class="card form-grid" data-m-form="purge">
      <h3>Delete recent messages</h3>
      ${channelSelect("channelId", "Channel", "", "TEXT", "Choose a channel", true)}
      ${numberField("count", "How many (1-100)", 25, 1, 100)}
      ${memberPicker("userId", "Only from this member (optional)", [])}
      <p class="microcopy full">Discord only allows bulk-deleting messages newer than 14 days.</p>
      <button class="button danger full">Delete messages</button>
    </form>
    <div class="grid">
      <form class="card form-grid" data-m-form="lock">
        <h3>Lock or unlock a channel</h3>
        ${channelSelect("channelId", "Channel", "", "TEXT", "Choose a channel", true)}
        ${textField("reason", "Reason (optional)", "", "", false, "full")}
        <button class="button danger" name="locked" value="true">Lock</button>
        <button class="button" name="locked" value="false">Unlock</button>
      </form>
      <form class="card form-grid" data-m-form="slowmode">
        <h3>Slowmode</h3>
        ${channelSelect("channelId", "Channel", "", "TEXT", "Choose a channel", true)}
        ${numberField("seconds", "Seconds between messages (0 = off)", 5, 0, 21600)}
        <button class="button full">Set slowmode</button>
      </form>
    </div>
  </section>`;
}

/* ---------- Automod ---------- */

function automodTab() {
  const automod = view.overview.settings.automod;
  const ruleCard = (key, title, help, extra) => {
    const rule = automod[key];
    return `<fieldset class="full"><legend>${escapeHtml(title)}</legend>
      ${checkbox(`${key}.enabled`, `Check for ${title.toLowerCase()}`, rule.enabled)}
      <p class="microcopy full">${escapeHtml(help)}</p>
      ${selectField(`${key}.action`, "Then", AUTOMOD_ACTIONS, rule.action)}
      ${numberField(`${key}.timeoutMinutes`, "Timeout minutes", rule.timeoutMinutes, 1, 40320)}
      ${extra}
    </fieldset>`;
  };
  return `<form class="form-grid readable-form" data-m-form="automod">
    ${checkbox("automod.enabled", "Automod is on", automod.enabled)}
    <p class="microcopy full">Admins, and roles and channels you exempt below, are never checked. Blocked words, invites, links, and caps need the Message Content intent.</p>
    ${rolePicker("exemptRoleIds", "Exempt roles", automod.exemptRoleIds)}
    ${channelPicker("exemptChannelIds", "Exempt channels", automod.exemptChannelIds, "ANY")}
    ${ruleCard("spam", "Spam", "Too many messages in a short time.", `${numberField("spam.maxMessages", "Messages allowed", automod.spam.maxMessages, 2, 50)}${numberField("spam.perSeconds", "Within seconds", automod.spam.perSeconds, 1, 120)}`)}
    ${ruleCard("invites", "Invite links", "Links to other Discord servers.", "")}
    ${ruleCard("links", "Links", "Any link not on the allowed list.", textArea("links.allowedDomains", "Allowed domains (one per line)", automod.links.allowedDomains.join("\n")))}
    ${ruleCard("words", "Blocked words", "Whole words, not case sensitive. Use * as a wildcard, e.g. scam*.", textArea("words.words", "Blocked words (one per line)", automod.words.words.join("\n")))}
    ${ruleCard("mentions", "Mass mentions", "Too many user or role mentions in one message.", numberField("mentions.maxMentions", "Mentions allowed", automod.mentions.maxMentions, 1, 50))}
    ${ruleCard("caps", "Caps", "Messages that are mostly capital letters.", `${numberField("caps.minLength", "Only messages with at least this many letters", automod.caps.minLength, 1, 2000)}${numberField("caps.percent", "Percent capitals", automod.caps.percent, 50, 100)}`)}
    <button class="button primary full">Save automod</button>
  </form>`;
}

/* ---------- Settings ---------- */

function settingsTab() {
  const s = view.overview.settings;
  const steps = [0, 1, 2, 3, 4].map((index) => {
    const step = s.escalation[index] ?? {};
    return `<div class="question-row full">
      <input type="number" name="esc${index}.warnings" min="1" max="100" placeholder="Warnings" value="${escapeHtml(step.warnings ?? "")}" aria-label="Warnings for step ${index + 1}">
      <select name="esc${index}.action" aria-label="Action for step ${index + 1}">${[["TIMEOUT", "Timeout"], ["KICK", "Kick"], ["BAN", "Ban"]].map(([value, label]) => `<option value="${value}" ${step.action === value ? "selected" : ""}>${label}</option>`).join("")}</select>
      <input type="number" name="esc${index}.durationMinutes" min="0" max="525600" placeholder="Minutes (0 = permanent ban)" value="${escapeHtml(step.durationMinutes ?? "")}" aria-label="Length for step ${index + 1}">
    </div>`;
  }).join("");
  return `<form class="form-grid readable-form" data-m-form="settings">
    <h3>Logging and messages</h3>
    ${channelSelect("logChannelId", "Moderation log channel", s.logChannelId, "TEXT", "Not set")}
    ${checkbox("dmOnAction", "DM members when action is taken", s.dmOnAction)}
    ${checkbox("dmIncludeModerator", "Show the moderator's name in DMs", s.dmIncludeModerator)}
    ${textArea("appealMessage", "Appeal message in ban and kick DMs", s.appealMessage ?? "", "For example: Appeal at https://...")}
    <h3>Rules</h3>
    ${checkbox("requireReason", "Require a reason for every action", s.requireReason)}
    ${numberField("defaultTimeoutMinutes", "Default timeout (minutes)", s.defaultTimeoutMinutes, 1, 40320)}
    ${numberField("banDeleteMessageHours", "Delete messages on ban (hours, 0-168)", s.banDeleteMessageHours, 0, 168)}
    ${numberField("warningExpiryDays", "Warnings stop counting after (days, 0 = never)", s.warningExpiryDays, 0, 3650)}
    ${rolePicker("protectedRoleIds", "Protected roles (cannot be moderated through Qbox)", s.protectedRoleIds)}
    ${checkbox("recordExternalActions", "Record bans, unbans, and kicks done directly in Discord", s.recordExternalActions)}
    <h3>Automatic punishments</h3>
    <p class="microcopy full">When a member reaches this many active warnings, apply the action. Leave warnings empty to skip a row.</p>
    ${steps}
    <input type="hidden" name="expectedRevision" value="${s.revision}">
    <button class="button primary full">Save settings</button>
  </form>`;
}

/* ---------- Statistics ---------- */

function statsTab() {
  const s = view.overview.stats;
  const metric = (label, value) => `<div class="card metric"><span class="metric-label">${escapeHtml(label)}</span><strong class="metric-value">${escapeHtml(String(value))}</strong></div>`;
  return `<section class="grid cols-4">
      ${metric("All cases", s.total)}${metric("Last 7 days", s.last7Days)}${metric("Active bans", s.activeBans)}${metric("Active timeouts", s.activeTimeouts)}
    </section>
    <section class="grid cols-2">
      <div class="card"><h3>By action</h3>${table(["Action", "Cases"], Object.entries(s.byType).map(([type, count]) => row([["Action", escapeHtml(TYPE_LABELS[type] ?? type)], ["Cases", String(count)]])), "No cases yet.")}<p class="microcopy">Actions taken by automod: ${s.automodActions}</p></div>
      <div class="card"><h3>Most active moderators</h3>${table(["Moderator", "Cases"], s.topModerators.map((item) => row([["Moderator", escapeHtml(item.name)], ["Cases", String(item.cases)]])), "No moderator actions yet.")}</div>
    </section>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-m-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.mTab;
    history.replaceState({}, "", appPath(`/moderation?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-m-case]").forEach((element) => {
    const open = () => {
      view.selected = view.cases.find((item) => String(item.number) === element.dataset.mCase);
      render();
    };
    element.addEventListener("click", open);
    element.addEventListener("keydown", (event) => { if (event.key === "Enter") open(); });
  });
  container.querySelectorAll("[data-m-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.mAction, button.dataset.value)));
  container.querySelectorAll("form[data-m-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form, event.submitter);
  }));
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

async function action(name, value) {
  if (name === "history") {
    const target = document.getElementById("memberHistory");
    try {
      const history = (await getJson(`moderation/members/${encodeURIComponent(value)}`)).data;
      target.innerHTML = `<h3>Member history</h3>
        ${detail("Active warnings", String(history.activeWarnings))}
        ${detail("Banned", history.activeBan ? `Yes, case #${history.activeBan.number}` : "No")}
        ${detail("Timed out", history.activeTimeout ? `Until ${escapeHtml(dateTime(history.activeTimeout.expiresAt))}` : "No")}
        <ul class="timeline">${history.cases.map((item) => `<li><strong>#${item.number} ${escapeHtml(TYPE_LABELS[item.type])}${item.revokedAt ? " (pardoned)" : ""}</strong><small>${escapeHtml(dateTime(item.createdAt))}</small><p>${escapeHtml(item.reason ?? "No reason")}</p></li>`).join("")}</ul>`;
    } catch (error) {
      notify(error.message, "error");
    }
    return;
  }
  if (name === "pardon") {
    const reason = window.prompt("Reason for the pardon (optional)");
    if (reason === null) return;
    await run("Case pardoned.", () => sendJson(`moderation/cases/${view.selected.number}/pardon`, "POST", reason ? { reason } : {}));
  }
}

async function submit(form, submitter) {
  const data = new FormData(form);
  const text = (name) => String(data.get(name) ?? "").trim();
  switch (form.dataset.mForm) {
    case "filters":
      view.filters = { type: text("type"), search: text("search"), active: text("active") };
      return run(undefined, async () => undefined);
    case "reason":
      return run("Reason updated.", () => sendJson(`moderation/cases/${view.selected.number}`, "PATCH", { reason: text("reason") }));
    case "evidence":
      return run("Evidence added.", () => sendJson(`moderation/cases/${view.selected.number}/evidence`, "POST", { url: text("url") }));
    case "action": {
      const userId = data.getAll("userId")[0];
      if (!userId) return notify("Choose a member first.", "error");
      const type = text("type");
      const label = ACTIONS.find(([value]) => value === type)?.[1] ?? type;
      const amount = intValue(data, "durationAmount", 0);
      const destructive = ["KICK", "BAN", "SOFTBAN"].includes(type);
      if (destructive && !(await confirmAction({ title: `${label}?`, body: "This takes effect in Discord right away.", confirmText: label }))) return undefined;
      const displayName = form.querySelector(`.chip-picker[data-name="userId"] .chip`)?.textContent?.replace("×", "").trim();
      return run((result) => `${TYPE_LABELS[result.data.type]} recorded as case #${result.data.number}.`, () => sendJson("moderation/actions", "POST", {
        type,
        userId,
        ...(displayName && displayName !== userId ? { displayName } : {}),
        ...optionalValue(data, "reason"),
        ...(amount > 0 && (type === "TIMEOUT" || type === "BAN") ? { durationMinutes: amount * Number(text("durationUnit")) } : {}),
        ...(text("deleteMessageHours") !== "" && (type === "BAN" || type === "SOFTBAN") ? { deleteMessageHours: Number(text("deleteMessageHours")) } : {}),
        ...(text("evidence") ? { evidence: [text("evidence")] } : {}),
      }));
    }
    case "purge": {
      const channelId = text("channelId");
      if (!(await confirmAction({ title: "Delete messages?", body: `Up to ${text("count")} recent messages in ${channelLabel(channelId)} will be deleted.`, confirmText: "Delete" }))) return undefined;
      const userId = data.getAll("userId")[0];
      return run((result) => `Deleted ${result.data.deleted} messages.`, () => sendJson(`moderation/channels/${channelId}/purge`, "POST", { count: intValue(data, "count", 1), ...(userId ? { userId } : {}) }));
    }
    case "lock": {
      const locked = submitter?.value === "true";
      return run(locked ? "Channel locked." : "Channel unlocked.", () => sendJson(`moderation/channels/${text("channelId")}/lock`, "POST", { locked, ...optionalValue(data, "reason") }));
    }
    case "slowmode":
      return run("Slowmode updated.", () => sendJson(`moderation/channels/${text("channelId")}/slowmode`, "POST", { seconds: intValue(data, "seconds", 0) }));
    case "automod":
      return run("Automod saved.", () => sendJson("moderation/settings", "PUT", settingsPayload({ automod: automodPayload(form, data) })));
    case "settings":
      return run("Moderation settings saved.", () => sendJson("moderation/settings", "PUT", settingsPayload(settingsFromForm(form, data))));
    default:
      return undefined;
  }
}

/** Current settings with changes applied, in the shape the API expects. */
function settingsPayload(changes) {
  const { guildId: _guildId, revision, ...current } = view.overview.settings;
  return { ...current, ...changes, expectedRevision: revision };
}

function settingsFromForm(form, data) {
  const text = (name) => String(data.get(name) ?? "").trim();
  const escalation = [0, 1, 2, 3, 4].flatMap((index) => {
    const warnings = intValue(data, `esc${index}.warnings`, 0);
    if (warnings < 1) return [];
    return [{ warnings, action: text(`esc${index}.action`), durationMinutes: intValue(data, `esc${index}.durationMinutes`, 0) }];
  });
  const { logChannelId: _log, appealMessage: _appeal, guildId: _guildId, revision: _revision, ...rest } = view.overview.settings;
  return {
    ...rest,
    ...optionalValue(data, "logChannelId"),
    ...optionalValue(data, "appealMessage"),
    dmOnAction: boolValue(form, "dmOnAction"),
    dmIncludeModerator: boolValue(form, "dmIncludeModerator"),
    requireReason: boolValue(form, "requireReason"),
    defaultTimeoutMinutes: intValue(data, "defaultTimeoutMinutes", 60),
    banDeleteMessageHours: intValue(data, "banDeleteMessageHours", 0),
    warningExpiryDays: intValue(data, "warningExpiryDays", 0),
    protectedRoleIds: data.getAll("protectedRoleIds"),
    recordExternalActions: boolValue(form, "recordExternalActions"),
    escalation,
  };
}

function automodPayload(form, data) {
  const current = view.overview.settings.automod;
  const rule = (key) => ({ ...current[key], enabled: boolValue(form, `${key}.enabled`), action: String(data.get(`${key}.action`)), timeoutMinutes: intValue(data, `${key}.timeoutMinutes`, 10) });
  const lines = (name) => String(data.get(name) ?? "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return {
    enabled: boolValue(form, "automod.enabled"),
    exemptRoleIds: data.getAll("exemptRoleIds"),
    exemptChannelIds: data.getAll("exemptChannelIds"),
    spam: { ...rule("spam"), maxMessages: intValue(data, "spam.maxMessages", 6), perSeconds: intValue(data, "spam.perSeconds", 5) },
    invites: rule("invites"),
    links: { ...rule("links"), allowedDomains: lines("links.allowedDomains") },
    words: { ...rule("words"), words: lines("words.words") },
    mentions: { ...rule("mentions"), maxMentions: intValue(data, "mentions.maxMentions", 6) },
    caps: { ...rule("caps"), minLength: intValue(data, "caps.minLength", 12), percent: intValue(data, "caps.percent", 75) },
  };
}

function durationText(minutes) {
  if (minutes % 10080 === 0) return `${minutes / 10080} week${minutes === 10080 ? "" : "s"}`;
  if (minutes % 1440 === 0) return `${minutes / 1440} day${minutes === 1440 ? "" : "s"}`;
  if (minutes % 60 === 0) return `${minutes / 60} hour${minutes === 60 ? "" : "s"}`;
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
