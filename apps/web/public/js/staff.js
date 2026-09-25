import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import {
  bindPickers,
  channelSelect,
  dateTime,
  dateTimeField,
  detail,
  intValue,
  loadDirectory,
  memberName,
  memberPicker,
  numberField,
  optionalValue,
  relative,
  roleName,
  roleSelect,
  selectField,
  textArea,
  textField,
} from "./forms.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";

const TABS = [
  ["me", "My profile"],
  ["roster", "Roster"],
  ["leaves", "Leave requests"],
  ["shifts", "Shifts"],
  ["ranks", "Ranks"],
  ["settings", "Settings"],
];
const STATUS_LABELS = { ACTIVE: "Active", LOA: "On leave", SUSPENDED: "Suspended", RETIRED: "Retired" };
const LEAVE_LABELS = { PENDING: "Pending", APPROVED: "Approved", ACTIVE: "On leave", ENDED: "Ended", DENIED: "Denied", CANCELLED: "Cancelled" };
const RECORD_LABELS = { HIRE: "Hired", PROMOTE: "Promoted", DEMOTE: "Demoted", FIRE: "Removed from staff", LOA_START: "Leave started", LOA_END: "Leave ended", NOTE: "Note", STRIKE: "Strike" };

const view = { tab: "me", me: undefined, overview: undefined, leaves: [], shifts: [], leaderboard: undefined, weeksAgo: 0, leaveFilter: "PENDING", selected: undefined, profile: undefined, error: undefined };
let container;

export async function renderStaffPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading staff...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    view.me = (await getJson("staff/me")).data;
    view.overview = await getJson("staff/overview").then((result) => result.data, (error) => {
      if (error.status === 403) return undefined;
      throw error;
    });
    if (view.overview) {
      const [leaves, shifts, leaderboard] = await Promise.all([
        getJson(`staff/leaves?limit=200${view.leaveFilter ? `&status=${view.leaveFilter}` : ""}`),
        getJson("staff/shifts?limit=100"),
        getJson(`staff/leaderboard?weeksAgo=${view.weeksAgo}`),
      ]);
      view.leaves = leaves.data;
      view.shifts = shifts.data;
      view.leaderboard = leaderboard.data;
      if (view.selected) view.profile = await getJson(`staff/members/${view.selected}`).then((result) => result.data, () => undefined);
      if (!view.profile) view.selected = undefined;
    }
    view.error = undefined;
    const ids = [...(view.overview?.members ?? []).map((item) => item.userId), ...view.leaves.map((item) => item.userId), ...(view.profile?.records ?? []).map((item) => item.actorId)];
    await loadDirectory(ids.filter((id) => id !== "0"));
  } catch (error) {
    view.error = error;
  }
}

function can(name) {
  return view.overview?.can?.[name] === true;
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    container.innerHTML = `<section class="card"><h2>Staff is unavailable</h2><p class="microcopy">${escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  const tabs = TABS.filter(([id]) => {
    if (id === "me") return true;
    if (id === "ranks" || id === "settings") return can("manage");
    return Boolean(view.overview);
  });
  if (!tabs.some(([id]) => id === view.tab)) view.tab = "me";
  const pending = view.overview?.pendingLeaves ?? 0;
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Staff sections">${tabs.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-s-tab="${id}">${escapeHtml(label)}${id === "leaves" && pending ? ` (${pending})` : ""}</button>`).join("")}</nav>
    <div>${tabContent()}</div>
  </section>`;
  bind();
}

function tabContent() {
  switch (view.tab) {
    case "roster": return rosterTab();
    case "leaves": return leavesTab();
    case "shifts": return shiftsTab();
    case "ranks": return ranksTab();
    case "settings": return settingsTab();
    default: return meTab();
  }
}

function rankOf(rankId) {
  return view.overview?.ranks.find((rank) => rank.id === rankId) ?? view.me?.profile?.rank;
}

function hours(seconds) {
  const minutes = Math.floor(seconds / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}

function day(value) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function rankDot(rank) {
  return rank ? `<span style="color:${escapeHtml(rank.color)}">●</span> ${escapeHtml(rank.name)}` : "—";
}

/* ---------- My profile ---------- */

function meTab() {
  const profile = view.me.profile;
  if (!profile) return `<p class="microcopy">You're not on the staff roster.${view.overview ? " Use the Roster tab to see the team." : ""}</p>`;
  const { member, rank } = profile;
  const current = profile.leaves.find((leave) => ["PENDING", "APPROVED", "ACTIVE"].includes(leave.status));
  const shiftsAllowed = view.me.can.shifts;
  return `<section class="grid cols-2">
    <div class="card detail-stack">
      <div class="split-line"><h2>${escapeHtml(member.displayName)}</h2>${badge(STATUS_LABELS[member.status])}</div>
      ${detail("Rank", rankDot(rank))}
      ${detail("Callsign", escapeHtml(member.callsign ?? "None"))}
      ${detail("Joined", escapeHtml(day(member.joinedAt)))}
      ${detail("Active strikes", String(profile.activeStrikes))}
      ${detail("This week", escapeHtml(hours(profile.weekSeconds)))}
      ${shiftsAllowed ? `<div class="toolbar">${profile.openShift
        ? `<span class="microcopy">On shift since ${escapeHtml(dateTime(profile.openShift.startedAt))}</span><button class="button danger" data-s-action="clock" data-value="out">Clock out</button>`
        : `<button class="button primary" data-s-action="clock" data-value="in" ${member.status === "ACTIVE" ? "" : "disabled"}>Clock in</button>`}</div>` : ""}
    </div>
    <div class="card">
      <h3>Leave of absence</h3>
      ${current ? `<div class="detail-stack">
          ${detail("Status", badge(LEAVE_LABELS[current.status]))}
          ${detail("From", escapeHtml(dateTime(current.startsAt)))}
          ${detail("Until", escapeHtml(dateTime(current.endsAt)))}
          ${detail("Reason", escapeHtml(current.reason))}
          <button class="button" data-s-action="cancel-leave" data-value="${escapeHtml(current.id)}">${current.status === "ACTIVE" ? "End my leave now" : "Cancel request"}</button>
        </div>`
        : member.status === "ACTIVE" ? `<form class="form-grid" data-s-form="leave">
          ${dateTimeField("startsAt", "From", new Date().toISOString(), true)}
          ${dateTimeField("endsAt", "Until", new Date(Date.now() + 7 * 86_400_000).toISOString(), true)}
          ${textArea("reason", "Reason", "")}
          <p class="microcopy full">Up to ${view.me.maxLeaveDays} days. A manager reviews your request.</p>
          <button class="button primary full">Request leave</button>
        </form>` : `<p class="microcopy">You can request leave while your status is active.</p>`}
    </div>
  </section>
  <section class="grid cols-2">
    <div class="card"><h3>History</h3>${historyList(profile.records)}</div>
    <div class="card"><h3>Strikes</h3>${strikesList(profile.strikes, false)}<h3>Recent shifts</h3>${shiftsTable(profile.shifts, false)}</div>
  </section>`;
}

/* ---------- Roster ---------- */

function rosterTab() {
  const members = view.overview.members;
  const rows = members.map((member) => row([
    ["Member", memberName(member.userId)],
    ["Rank", rankDot(rankOf(member.rankId))],
    ["Callsign", escapeHtml(member.callsign ?? "—")],
    ["Status", badge(STATUS_LABELS[member.status])],
    ["Joined", escapeHtml(day(member.joinedAt))],
  ], `data-s-member="${escapeHtml(member.userId)}" class="${member.userId === view.selected ? "selected" : ""}" tabindex="0"`));
  const ranks = view.overview.ranks;
  const hire = can("manage") ? `<form class="card form-grid" data-s-form="hire">
      <h3>Hire</h3>
      ${ranks.length ? `${memberPicker("userId", "Member", [])}
      ${selectField("rankId", "Rank", ranks.map((rank) => [rank.id, rank.name]), ranks[ranks.length - 1]?.id)}
      ${textField("callsign", "Callsign (optional)", "", "e.g. 1A-12")}
      ${textField("reason", "Reason (optional)", "", "", false, "full")}
      <button class="button primary full">Hire</button>` : `<p class="microcopy full">Add a rank in the Ranks tab first.</p>`}
    </form>` : "";
  return `<section class="grid main-detail">
      <div>${table(["Member", "Rank", "Callsign", "Status", "Joined"], rows, "No staff yet.")}${hire}</div>
      <div class="card">${memberDetail()}</div>
    </section>`;
}

function memberDetail() {
  const profile = view.profile;
  if (!profile) return `<p class="microcopy">Select a staff member to see their history${can("manage") ? " or change their rank" : ""}.</p>`;
  const { member, rank } = profile;
  const ranks = view.overview.ranks;
  const index = ranks.findIndex((item) => item.id === rank.id);
  const manage = can("manage");
  return `<div class="detail-stack">
    <div class="split-line"><h2>${escapeHtml(member.displayName)}</h2>${badge(STATUS_LABELS[member.status])}</div>
    ${detail("Rank", rankDot(rank))}
    ${detail("Callsign", escapeHtml(member.callsign ?? "None"))}
    ${detail("Joined", escapeHtml(day(member.joinedAt)))}
    ${detail("Active strikes", String(profile.activeStrikes))}
    ${detail("This week", `${escapeHtml(hours(profile.weekSeconds))}${profile.openShift ? " (on shift)" : ""}`)}
    ${member.notes ? detail("Notes", escapeHtml(member.notes)) : ""}
    ${manage ? `
      <form class="form-grid" data-s-form="rank">
        <h3 class="full">Change rank</h3>
        ${selectField("rankId", "New rank", ranks.filter((item) => item.id !== rank.id).map((item) => [item.id, `${item.name}${ranks.indexOf(item) < index ? " (promote)" : " (demote)"}`]), ranks[index - 1]?.id ?? ranks[index + 1]?.id)}
        ${textField("reason", "Reason (optional)", "")}
        <button class="button full">Change rank</button>
      </form>
      <form class="form-grid" data-s-form="member">
        <h3 class="full">Details</h3>
        ${textField("callsign", "Callsign", member.callsign ?? "")}
        ${member.status === "LOA" ? `<p class="microcopy">On leave. End the leave in Leave requests to change status.</p>` : selectField("status", "Status", [["ACTIVE", "Active"], ["SUSPENDED", "Suspended"], ["RETIRED", "Retired"]], member.status)}
        ${dateTimeField("joinedAt", "Joined", member.joinedAt, true)}
        ${textArea("notes", "Notes", member.notes ?? "")}
        <button class="button full">Save details</button>
      </form>
      <form class="form-grid" data-s-form="strike">
        <h3 class="full">Give a strike</h3>
        ${textField("reason", "Reason", "", "", true, "full")}
        ${numberField("expiresInDays", "Expires after days (empty = never)", "", 1, 3650, false)}
        <button class="button danger">Give strike</button>
      </form>
      <form class="form-grid" data-s-form="note">
        ${textArea("text", "Add a note to their history", "")}
        <button class="button full">Add note</button>
      </form>
      <button class="button danger full" data-s-action="fire">Remove from staff</button>` : ""}
    <h3>History</h3>${historyList(profile.records)}
    <h3>Strikes</h3>${strikesList(profile.strikes, manage)}
    <h3>Recent shifts</h3>${shiftsTable(profile.shifts, false)}
  </div>`;
}

function historyList(records) {
  if (!records.length) return `<p class="microcopy">Nothing yet.</p>`;
  return `<ul class="timeline">${records.map((record) => `<li><strong>${escapeHtml(RECORD_LABELS[record.type])}${record.fromRank && record.toRank ? ` · ${escapeHtml(record.fromRank)} → ${escapeHtml(record.toRank)}` : record.toRank ? ` · ${escapeHtml(record.toRank)}` : ""}</strong>
    <small>${escapeHtml(dateTime(record.createdAt))} · by ${record.actorId === "0" ? escapeHtml(record.actorName) : memberName(record.actorId)}</small>
    ${record.reason ? `<p>${escapeHtml(record.reason)}</p>` : ""}</li>`).join("")}</ul>`;
}

function strikesList(strikes, manage) {
  if (!strikes.length) return `<p class="microcopy">No strikes.</p>`;
  return `<ul class="timeline">${strikes.map((strike) => `<li><strong>${escapeHtml(strike.reason)}</strong>
    <small>${escapeHtml(dateTime(strike.createdAt))} · ${strike.revokedAt ? "removed" : strike.active ? strike.expiresAt ? `expires ${escapeHtml(relative(strike.expiresAt))}` : "active" : "expired"}</small>
    ${manage && strike.active ? `<button class="button compact" data-s-action="revoke-strike" data-value="${escapeHtml(strike.id)}">Remove</button>` : ""}</li>`).join("")}</ul>`;
}

function shiftsTable(shifts, withMember) {
  return table([...(withMember ? ["Member"] : []), "Started", "Length"], shifts.map((shift) => row([
    ...(withMember ? [["Member", memberName(shift.userId)]] : []),
    ["Started", escapeHtml(dateTime(shift.startedAt))],
    ["Length", shift.endedAt ? `${escapeHtml(hours(shift.durationSeconds ?? 0))}${shift.autoEnded ? " (auto)" : ""}` : badge("on shift")],
  ])), "No shifts yet.");
}

/* ---------- Leave ---------- */

function leavesTab() {
  const manage = can("manage");
  const rows = view.leaves.map((leave) => row([
    ["Member", memberName(leave.userId)],
    ["From", escapeHtml(dateTime(leave.startsAt))],
    ["Until", escapeHtml(dateTime(leave.endsAt))],
    ["Reason", escapeHtml(leave.reason.slice(0, 80))],
    ["Status", `${badge(LEAVE_LABELS[leave.status])}${leave.reviewerId ? `<br><small>by ${memberName(leave.reviewerId)}${leave.reviewNote ? `: ${escapeHtml(leave.reviewNote)}` : ""}</small>` : ""}`],
    ["", manage ? leaveActions(leave) : ""],
  ]));
  return `<form class="toolbar" data-s-form="leave-filter">
      <select name="status">${[["PENDING", "Pending"], ["APPROVED,ACTIVE", "Approved and active"], ["", "All"]].map(([value, label]) => `<option value="${value}" ${view.leaveFilter === value ? "selected" : ""}>${label}</option>`).join("")}</select>
      <button class="button compact">Show</button>
    </form>
    ${table(["Member", "From", "Until", "Reason", "Status", ""], rows, "No leave requests.")}`;
}

function leaveActions(leave) {
  if (leave.status === "PENDING")
    return `<button class="button compact primary" data-s-action="approve" data-value="${escapeHtml(leave.id)}">Approve</button> <button class="button compact danger" data-s-action="deny" data-value="${escapeHtml(leave.id)}">Deny</button>`;
  if (leave.status === "ACTIVE" || leave.status === "APPROVED")
    return `<button class="button compact" data-s-action="end-leave" data-value="${escapeHtml(leave.id)}">${leave.status === "ACTIVE" ? "End now" : "Cancel"}</button>`;
  return "";
}

/* ---------- Shifts ---------- */

function shiftsTab() {
  const board = view.leaderboard;
  const until = new Date(new Date(board.until).getTime() - 1000);
  const rows = board.entries.map((entry, index) => row([
    ["#", String(index + 1)],
    ["Member", memberName(entry.userId)],
    ["Time", escapeHtml(hours(entry.seconds))],
    ["Shifts", String(entry.shifts)],
  ]));
  return `<section class="grid cols-2">
    <div class="card">
      <div class="split-line"><h3>Week of ${escapeHtml(day(board.since))} – ${escapeHtml(day(until))}</h3>
        <span class="toolbar"><button class="button compact" data-s-action="week" data-value="1">Previous</button><button class="button compact" data-s-action="week" data-value="-1" ${view.weeksAgo === 0 ? "disabled" : ""}>Next</button></span></div>
      ${table(["#", "Member", "Time", "Shifts"], rows, "No shifts this week.")}
      <p class="microcopy">Weeks run Monday to Sunday (UTC). ${view.overview.settings.autoClockOutHours ? `Shifts end automatically after ${view.overview.settings.autoClockOutHours} hours.` : ""}</p>
    </div>
    <div class="card"><h3>Recent shifts</h3>${shiftsTable(view.shifts, true)}</div>
  </section>`;
}

/* ---------- Ranks ---------- */

function ranksTab() {
  const ranks = view.overview.ranks;
  const counts = Object.fromEntries(ranks.map((rank) => [rank.id, view.overview.members.filter((member) => member.rankId === rank.id).length]));
  const cards = ranks.map((rank, index) => `<form class="card form-grid" data-s-form="rank-edit" data-id="${escapeHtml(rank.id)}">
      <div class="split-line full"><h3>${rankDot(rank)} <small class="microcopy">${counts[rank.id]} member${counts[rank.id] === 1 ? "" : "s"}${rank.roleId ? ` · @${escapeHtml(roleName(rank.roleId))}` : ""}</small></h3>
        <span class="toolbar"><button type="button" class="button compact" data-s-action="rank-up" data-value="${index}" ${index === 0 ? "disabled" : ""} aria-label="Move up">↑</button><button type="button" class="button compact" data-s-action="rank-down" data-value="${index}" ${index === ranks.length - 1 ? "disabled" : ""} aria-label="Move down">↓</button></span></div>
      ${rankFields(rank)}
      <button class="button">Save</button>
      <button type="button" class="button danger" data-s-action="rank-delete" data-value="${escapeHtml(rank.id)}">Delete</button>
    </form>`).join("");
  return `<p class="microcopy">Highest rank first. Promote moves a member up one rank; demote moves them down. Members get the rank's Discord role.</p>
    ${cards || `<div class="empty-state">No ranks yet.</div>`}
    <form class="card form-grid" data-s-form="rank-add"><h3 class="full">Add a rank</h3>${rankFields({ name: "", color: "#5865F2" })}<button class="button primary full">Add rank (at the bottom)</button></form>`;
}

function rankFields(rank) {
  return `${textField("name", "Name", rank.name, "", true)}
    ${roleSelect("roleId", "Discord role", rank.roleId)}
    <label>Color<input type="color" name="color" value="${escapeHtml(rank.color)}"></label>
    ${textField("description", "Description (optional)", rank.description ?? "")}`;
}

/* ---------- Settings ---------- */

function settingsTab() {
  const s = view.overview.settings;
  return `<form class="form-grid readable-form" data-s-form="settings">
    ${channelSelect("logChannelId", "Staff log channel (hires, promotions, strikes, leave requests)", s.logChannelId, "TEXT", "Not set")}
    ${channelSelect("rosterChannelId", "Roster channel (one message kept up to date)", s.rosterChannelId, "TEXT", "Not set")}
    ${roleSelect("loaRoleId", "Role while on leave", s.loaRoleId)}
    ${numberField("autoClockOutHours", "Auto clock-out after hours (0 = never)", s.autoClockOutHours, 0, 72)}
    ${numberField("maxLeaveDays", "Longest leave members can request (days)", s.maxLeaveDays, 1, 365)}
    <button class="button primary full">Save settings</button>
  </form>
  ${s.rosterChannelId ? `<div class="toolbar"><button class="button" data-s-action="publish">Post or update the roster message now</button></div>` : ""}`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-s-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.sTab;
    history.replaceState({}, "", appPath(`/staff?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-s-member]").forEach((element) => {
    const open = () => void select(element.dataset.sMember);
    element.addEventListener("click", open);
    element.addEventListener("keydown", (event) => { if (event.key === "Enter") open(); });
  });
  container.querySelectorAll("[data-s-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.sAction, button.dataset.value)));
  container.querySelectorAll("form[data-s-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form);
  }));
  bindPickers(container);
}

async function select(userId) {
  view.selected = userId;
  try {
    view.profile = (await getJson(`staff/members/${userId}`)).data;
    await loadDirectory(view.profile.records.map((record) => record.actorId).filter((id) => id !== "0"));
  } catch (error) {
    notify(error.message, "error");
  }
  render();
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

function settingsPayload(changes = {}) {
  const { guildId: _guildId, revision, rosterMessageId: _message, ...current } = view.overview.settings;
  return { ...current, ...changes, expectedRevision: revision };
}

async function moveRank(index, delta) {
  const ids = view.overview.ranks.map((rank) => rank.id);
  const [moved] = ids.splice(index, 1);
  ids.splice(index + delta, 0, moved);
  await run("Rank order saved.", () => sendJson("staff/ranks/order", "PUT", { rankIds: ids }));
}

async function action(name, value) {
  switch (name) {
    case "clock":
      return run(value === "in" ? "Clocked in." : "Clocked out.", () => sendJson("staff/me/clock", "POST", { action: value }));
    case "cancel-leave":
      return run("Leave updated.", () => sendJson(`staff/me/leaves/${value}/cancel`, "POST", {}));
    case "approve":
      return run("Leave approved.", () => sendJson(`staff/leaves/${value}/review`, "POST", { approve: true }));
    case "deny": {
      const note = window.prompt("Reason for denying (optional)");
      if (note === null) return undefined;
      return run("Leave denied.", () => sendJson(`staff/leaves/${value}/review`, "POST", { approve: false, ...(note.trim() ? { note: note.trim() } : {}) }));
    }
    case "end-leave":
      return run("Leave ended.", () => sendJson(`staff/leaves/${value}/end`, "POST", {}));
    case "revoke-strike":
      return run("Strike removed.", () => sendJson(`staff/strikes/${value}/revoke`, "POST", {}));
    case "fire": {
      const member = view.profile.member;
      if (!(await confirmAction({ title: `Remove ${member.displayName} from staff?`, body: "Their rank role is taken away. Their history is kept.", confirmText: "Remove" }))) return undefined;
      const reason = window.prompt("Reason (optional)") ?? "";
      view.selected = undefined;
      view.profile = undefined;
      return run("Removed from staff.", () => sendJson(`staff/members/${member.userId}/fire`, "POST", reason.trim() ? { reason: reason.trim() } : {}));
    }
    case "week":
      view.weeksAgo = Math.max(0, view.weeksAgo + Number(value));
      return run(undefined, async () => undefined);
    case "rank-up":
      return moveRank(Number(value), -1);
    case "rank-down":
      return moveRank(Number(value), 1);
    case "rank-delete":
      if (!(await confirmAction({ title: "Delete this rank?", body: "Only empty ranks can be deleted.", confirmText: "Delete" }))) return undefined;
      return run("Rank deleted.", () => sendJson(`staff/ranks/${value}`, "DELETE"));
    case "publish":
      return run("Roster message updated.", () => sendJson("staff/roster/publish", "POST", {}));
    default:
      return undefined;
  }
}

function rankPayload(data) {
  return {
    name: String(data.get("name") ?? "").trim(),
    color: String(data.get("color") ?? "#5865F2").toUpperCase(),
    ...optionalValue(data, "roleId"),
    ...optionalValue(data, "description"),
  };
}

function isoOf(value) {
  return value ? new Date(value).toISOString() : undefined;
}

async function submit(form) {
  const data = new FormData(form);
  const text = (name) => String(data.get(name) ?? "").trim();
  const userId = view.profile?.member.userId;
  switch (form.dataset.sForm) {
    case "leave":
      return run("Leave requested.", () => sendJson("staff/me/leaves", "POST", { startsAt: isoOf(text("startsAt")), endsAt: isoOf(text("endsAt")), reason: text("reason") }));
    case "leave-filter":
      view.leaveFilter = text("status");
      return run(undefined, async () => undefined);
    case "hire": {
      const hireId = data.getAll("userId")[0];
      if (!hireId) return notify("Choose a member first.", "error");
      const displayName = form.querySelector(`.chip-picker[data-name="userId"] .chip`)?.textContent?.replace("×", "").trim();
      return run("Hired.", () => sendJson("staff/members", "POST", {
        userId: hireId,
        ...(displayName && displayName !== hireId ? { displayName } : {}),
        rankId: text("rankId"),
        ...optionalValue(data, "callsign"),
        ...optionalValue(data, "reason"),
      }));
    }
    case "rank": {
      const ranks = view.overview.ranks;
      const target = ranks.findIndex((rank) => rank.id === text("rankId"));
      const current = ranks.findIndex((rank) => rank.id === view.profile.rank.id);
      const direction = target < current ? "promote" : "demote";
      return run(direction === "promote" ? "Promoted." : "Demoted.", () => sendJson(`staff/members/${userId}/${direction}`, "POST", { rankId: text("rankId"), ...optionalValue(data, "reason") }));
    }
    case "member":
      return run("Details saved.", () => sendJson(`staff/members/${userId}`, "PATCH", {
        callsign: text("callsign") || null,
        notes: text("notes") || null,
        ...(text("status") ? { status: text("status") } : {}),
        ...(text("joinedAt") ? { joinedAt: isoOf(text("joinedAt")) } : {}),
      }));
    case "strike": {
      const days = intValue(data, "expiresInDays", 0);
      return run("Strike given.", () => sendJson(`staff/members/${userId}/strikes`, "POST", { reason: text("reason"), ...(days > 0 ? { expiresInDays: days } : {}) }));
    }
    case "note":
      return run("Note added.", () => sendJson(`staff/members/${userId}/notes`, "POST", { text: text("text") }));
    case "rank-add":
      return run("Rank added.", () => sendJson("staff/ranks", "POST", rankPayload(data)));
    case "rank-edit":
      return run("Rank saved.", () => sendJson(`staff/ranks/${form.dataset.id}`, "PUT", rankPayload(data)));
    case "settings":
      return run("Staff settings saved.", () => sendJson("staff/settings", "PUT", settingsPayload({
        logChannelId: undefined,
        rosterChannelId: undefined,
        loaRoleId: undefined,
        ...optionalValue(data, "logChannelId"),
        ...optionalValue(data, "rosterChannelId"),
        ...optionalValue(data, "loaRoleId"),
        autoClockOutHours: intValue(data, "autoClockOutHours", 12),
        maxLeaveDays: intValue(data, "maxLeaveDays", 60),
      })));
    default:
      return undefined;
  }
}
