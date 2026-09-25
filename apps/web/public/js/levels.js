import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import {
  bindPickers,
  boolValue,
  channelPicker,
  channelSelect,
  checkbox,
  detail,
  directoryData,
  intValue,
  loadDirectory,
  memberPicker,
  memberText,
  numberField,
  relative,
  rolePicker,
  roleSelect,
  selectField,
  textField,
} from "./forms.js";
import { confirmAction, escapeHtml, notify, row, table } from "./ui.js";

const TABS = [
  ["leaderboard", "Leaderboard", false],
  ["members", "Members", true],
  ["settings", "Settings", true],
  ["rewards", "Rewards", true],
  ["reset", "Reset", true],
];
const LEVEL_UP_MODES = [["CURRENT", "In the channel where they leveled up"], ["CHANNEL", "In a specific channel"], ["DM", "In a direct message"], ["OFF", "Don't send"]];
const PREVIEW_LEVELS = [1, 5, 10, 20, 50];

const view = { tab: "leaderboard", page: 1, board: undefined, settings: undefined, levelCap: 1000, results: [], selected: undefined, error: undefined };
let container;

export async function renderLevelsPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading levels...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    view.board = (await getJson(`levels/leaderboard?page=${view.page}`)).data;
    view.error = undefined;
    if (view.board.canManage) {
      const overview = (await getJson("levels/overview")).data;
      view.settings = overview.settings;
      view.levelCap = overview.levelCap;
      await loadDirectory(view.selected ? [view.selected.member.userId] : []);
      if (view.selected) view.selected = (await getJson(`levels/members/${view.selected.member.userId}`)).data;
    }
  } catch (error) {
    view.error = error;
  }
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    container.innerHTML = `<section class="card"><h2>Levels are unavailable</h2><p class="microcopy">${escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  const tabs = TABS.filter(([, , staff]) => !staff || view.board.canManage);
  if (!tabs.some(([id]) => id === view.tab)) view.tab = "leaderboard";
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Levels sections">${tabs.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-l-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    <div>${tabContent()}</div>
  </section>`;
  bind();
}

function tabContent() {
  switch (view.tab) {
    case "members": return membersTab();
    case "settings": return settingsTab();
    case "rewards": return rewardsTab();
    case "reset": return resetTab();
    default: return leaderboardTab();
  }
}

/* ---------- Leaderboard ---------- */

function progress(profile) {
  const { member, currentLevelXp, nextLevelXp } = profile;
  if (nextLevelXp === undefined) return "Max level reached";
  return `${(member.xp - currentLevelXp).toLocaleString()} / ${(nextLevelXp - currentLevelXp).toLocaleString()} XP to level ${member.level + 1}`;
}

function leaderboardTab() {
  const board = view.board;
  const me = board.me;
  const pages = Math.max(1, Math.ceil(board.total / board.pageSize));
  const start = (board.page - 1) * board.pageSize;
  const metric = (label, value) => `<div class="card metric"><span class="metric-label">${escapeHtml(label)}</span><strong class="metric-value">${escapeHtml(String(value))}</strong></div>`;
  const rows = board.members.map((member, index) => row([
    ["Rank", `<strong>#${start + index + 1}</strong>`],
    ["Member", escapeHtml(member.displayName || member.userId)],
    ["Level", String(member.level)],
    ["XP", member.xp.toLocaleString()],
    ["Messages", member.messages.toLocaleString()],
    ["Voice", `${member.voiceMinutes.toLocaleString()} min`],
  ], member.userId === me.member.userId ? `class="selected"` : ""));
  if (!board.enabled) {
    return `<div class="empty-state">
      <h3>Levels are off${board.canManage ? ", so nobody is earning XP." : " on this server."}</h3>
      ${board.canManage
        ? `<p>Turn on Members earn XP in Settings. Add role rewards in Rewards.</p><button class="button primary" data-l-tab="settings">Turn on levels</button>`
        : ""}
    </div>`;
  }
  return `<section class="grid cols-4">
      ${metric("Your rank", me.rank ? `#${me.rank}` : "Unranked")}${metric("Your level", me.member.level)}${metric("Your XP", me.member.xp.toLocaleString())}${metric("Next level", progress(me))}
    </section>
    ${table(["Rank", "Member", "Level", "XP", "Messages", "Voice"], rows, "Nobody has earned XP yet.")}
    <div class="toolbar">
      <button class="button compact" data-l-page="${board.page - 1}" ${board.page <= 1 ? "disabled" : ""}>Previous</button>
      <span class="microcopy">Page ${board.page} of ${pages} · ${board.total} members</span>
      <button class="button compact" data-l-page="${board.page + 1}" ${board.page >= pages ? "disabled" : ""}>Next</button>
    </div>`;
}

/* ---------- Members ---------- */

function membersTab() {
  const rows = view.results.map((member) => row([
    ["Member", escapeHtml(member.displayName || member.userId)],
    ["Level", String(member.level)],
    ["XP", member.xp.toLocaleString()],
    ["Last XP message", member.lastMessageAt ? escapeHtml(relative(member.lastMessageAt)) : "—"],
  ], `data-l-member="${escapeHtml(member.userId)}" tabindex="0" class="${member.userId === view.selected?.member.userId ? "selected" : ""}"`));
  return `<section class="grid main-detail">
    <div>
      <form class="toolbar" data-l-form="search"><input name="search" placeholder="Search by name or paste a member ID" required><button class="button compact">Search</button></form>
      ${table(["Member", "Level", "XP", "Last XP message"], rows, "Search to find members with XP.")}
      <form class="form-grid" data-l-form="pick">${memberPicker("userId", "Or pick any server member", [], "Use this to give XP to someone who has none yet.")}<button class="button full">Open member</button></form>
    </div>
    <div class="card">${memberDetail()}</div>
  </section>`;
}

function memberDetail() {
  const profile = view.selected;
  if (!profile) return `<p class="microcopy">Select a member to change their XP or level.</p>`;
  const member = profile.member;
  const name = member.displayName || memberText(member.userId);
  return `<div class="detail-stack">
    <h2>${escapeHtml(name)}</h2>
    ${detail("Level", String(member.level))}
    ${detail("XP", member.xp.toLocaleString())}
    ${detail("Progress", escapeHtml(progress(profile)))}
    ${detail("Rank", profile.rank ? `#${profile.rank}` : "Unranked")}
    ${detail("Messages", member.messages.toLocaleString())}
    ${detail("Voice", `${member.voiceMinutes.toLocaleString()} min`)}
    <form class="form-grid" data-l-form="adjust">
      ${numberField("xp", "XP amount", 100, 1, 10000000)}
      <button class="button" name="action" value="give">Give XP</button>
      <button class="button" name="action" value="take">Take XP</button>
    </form>
    <form class="form-grid" data-l-form="set-level">
      ${numberField("level", "Level", member.level, 0, view.settings.maxLevel || view.levelCap)}
      <button class="button full">Set level</button>
    </form>
    <form class="form-grid" data-l-form="set-xp">
      ${numberField("xp", "Exact XP", member.xp, 0, 2000000000)}
      <button class="button full">Set XP</button>
    </form>
    <button class="button danger full" data-l-action="reset-member">Reset this member</button>
  </div>`;
}

/* ---------- Settings ---------- */

function multiplierRows(prefix, entries, kind) {
  const rows = [...entries, ...Array.from({ length: 3 }, () => ({ id: "", multiplier: "" }))];
  return rows.map((entry, index) => `<div class="question-row full">
    ${kind === "role" ? roleSelect(`${prefix}${index}.id`, "Role", entry.id) : channelSelect(`${prefix}${index}.id`, "Channel", entry.id, "ANY", "None")}
    <label>Multiplier<input type="number" name="${prefix}${index}.multiplier" min="0.1" max="10" step="0.1" value="${escapeHtml(entry.multiplier)}"></label>
  </div>`).join("");
}

function curvePreview(curve) {
  const xp = (level) => Math.round(curve.base * level ** curve.exponent + curve.linear * level);
  return PREVIEW_LEVELS.map((level) => `Level ${level}: ${xp(level).toLocaleString()} XP`).join(" · ");
}

function settingsTab() {
  const s = view.settings;
  return `<form class="form-grid readable-form" data-l-form="settings">
    ${checkbox("enabled", "Members earn XP", s.enabled)}
    <h3>Earning XP</h3>
    ${numberField("messageXpMin", "Minimum XP per message", s.messageXpMin, 0, 1000)}
    ${numberField("messageXpMax", "Maximum XP per message", s.messageXpMax, 0, 1000)}
    ${numberField("cooldownSeconds", "Seconds between messages that earn XP", s.cooldownSeconds, 0, 3600)}
    ${numberField("voiceXpPerMinute", "XP per minute in voice", s.voiceXpPerMinute, 0, 1000)}
    <p class="microcopy full">Voice XP needs at least two people in the channel. Muted or deafened members and the AFK channel don't earn XP.</p>
    <h3>Level curve</h3>
    <p class="microcopy full">XP needed for level n = base × n<sup>exponent</sup> + linear × n.</p>
    <label>Base<input type="number" name="curve.base" min="1" max="10000" step="any" value="${escapeHtml(s.curve.base)}" required></label>
    <label>Exponent<input type="number" name="curve.exponent" min="1" max="4" step="0.05" value="${escapeHtml(s.curve.exponent)}" required></label>
    <label>Linear<input type="number" name="curve.linear" min="0" max="10000" step="any" value="${escapeHtml(s.curve.linear)}" required></label>
    ${numberField("maxLevel", "Max level (0 = no max)", s.maxLevel, 0, view.levelCap)}
    <p class="microcopy full" id="curvePreview">${escapeHtml(curvePreview(s.curve))}</p>
    <h3>Multipliers</h3>
    <p class="microcopy full">A member gets their highest role multiplier, times the channel multiplier.</p>
    ${multiplierRows("rm", s.roleMultipliers, "role")}
    ${multiplierRows("cm", s.channelMultipliers, "channel")}
    <h3>No XP</h3>
    ${rolePicker("noXpRoleIds", "Roles that never earn XP", s.noXpRoleIds)}
    ${channelPicker("noXpChannelIds", "Channels (and their threads) that never earn XP", s.noXpChannelIds, "ANY")}
    <h3>Level-up message</h3>
    ${selectField("levelUpMode", "Send it", LEVEL_UP_MODES, s.levelUpMode)}
    ${channelSelect("levelUpChannelId", "Channel (when sending to a specific channel)", s.levelUpChannelId, "TEXT", "Not set")}
    ${textField("levelUpMessage", "Message ({user} and {level} are replaced)", s.levelUpMessage, "", true, "full")}
    <button class="button primary full">Save settings</button>
  </form>`;
}

/* ---------- Rewards ---------- */

function rewardsTab() {
  const s = view.settings;
  const rows = [...s.rewards, ...Array.from({ length: 5 }, () => ({ level: "", roleId: "" }))].map((reward, index) => `<div class="question-row full">
    <label>Level<input type="number" name="rw${index}.level" min="1" max="${view.levelCap}" value="${escapeHtml(reward.level)}"></label>
    ${roleSelect(`rw${index}.roleId`, "Role", reward.roleId)}
  </div>`).join("");
  return `<form class="form-grid readable-form" data-l-form="rewards">
    <p class="microcopy full">Members get these roles when they reach the level. Leave a row empty to skip it. In Discord's role list, drag the Qbox role above these roles.</p>
    ${rows}
    ${selectField("rewardMode", "When a member earns more than one", [["STACK", "Keep all reward roles"], ["HIGHEST", "Keep only the highest reward role"]], s.rewardMode)}
    ${checkbox("removeRewardsOnReset", "Remove reward roles when XP is reset", s.removeRewardsOnReset)}
    <button class="button primary full">Save rewards</button>
  </form>`;
}

/* ---------- Reset ---------- */

function resetTab() {
  return `<div class="card readable-form">
    <h3>Reset everyone's XP</h3>
    <p class="microcopy">This deletes all XP, levels, message counts, and voice minutes for this server. ${view.settings.removeRewardsOnReset ? "Reward roles are removed too." : "Reward roles are kept."} This can't be undone.</p>
    <button class="button danger" data-l-action="reset-all">Reset all XP</button>
  </div>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-l-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.lTab;
    history.replaceState({}, "", appPath(`/levels?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-l-page]").forEach((button) => button.addEventListener("click", () => {
    view.page = Number(button.dataset.lPage);
    void run(undefined, async () => undefined);
  }));
  container.querySelectorAll("[data-l-member]").forEach((element) => {
    const open = () => void openMember(element.dataset.lMember);
    element.addEventListener("click", open);
    element.addEventListener("keydown", (event) => { if (event.key === "Enter") open(); });
  });
  container.querySelectorAll("[data-l-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.lAction)));
  container.querySelectorAll("form[data-l-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form, event.submitter);
  }));
  const curve = container.querySelector("form[data-l-form=settings]");
  curve?.addEventListener("input", () => {
    const data = new FormData(curve);
    const value = (name) => Number(data.get(name));
    const preview = container.querySelector("#curvePreview");
    if (preview) preview.textContent = curvePreview({ base: value("curve.base"), exponent: value("curve.exponent"), linear: value("curve.linear") });
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

async function openMember(userId) {
  try {
    view.selected = (await getJson(`levels/members/${encodeURIComponent(userId)}`)).data;
    render();
  } catch (error) {
    notify(error.message, "error");
  }
}

async function action(name) {
  if (name === "reset-member") {
    const member = view.selected.member;
    if (!(await confirmAction({ title: "Reset this member?", body: "Their XP, level, and counts go back to zero.", confirmText: "Reset" }))) return;
    await run("Member reset.", async () => {
      await sendJson(`levels/members/${member.userId}`, "POST", { action: "reset" });
      view.selected = undefined;
      view.results = view.results.filter((item) => item.userId !== member.userId);
    });
    return;
  }
  if (name === "reset-all") {
    if (!(await confirmAction({ title: "Reset all XP?", body: "Everyone's XP and levels are deleted. This can't be undone.", confirmText: "Reset all XP" }))) return;
    await run((result) => `Reset ${result.data.members} members with levels.`, () => sendJson("levels/reset", "POST", { confirm: "RESET" }));
  }
}

function memberName(userId) {
  const known = directoryData().members.find((member) => member.id === userId);
  return known?.displayName;
}

async function submit(form, submitter) {
  const data = new FormData(form);
  const userId = view.selected?.member.userId;
  const displayName = userId ? memberName(userId) : undefined;
  const named = displayName ? { displayName } : {};
  switch (form.dataset.lForm) {
    case "search": {
      const search = String(data.get("search") ?? "").trim();
      try {
        view.results = (await getJson(`levels/members?search=${encodeURIComponent(search)}`)).data;
        render();
      } catch (error) {
        notify(error.message, "error");
      }
      return undefined;
    }
    case "pick": {
      const picked = data.getAll("userId")[0];
      if (!picked) return notify("Choose a member first.", "error");
      return openMember(picked);
    }
    case "adjust": {
      const give = submitter?.value !== "take";
      return run(give ? "XP given." : "XP taken.", () => sendJson(`levels/members/${userId}`, "POST", { action: give ? "give" : "take", xp: intValue(data, "xp", 0), ...(give ? named : {}) }));
    }
    case "set-level":
      return run("Level set.", () => sendJson(`levels/members/${userId}`, "POST", { action: "set-level", level: intValue(data, "level", 0), ...named }));
    case "set-xp":
      return run("XP set.", () => sendJson(`levels/members/${userId}`, "POST", { action: "set-xp", xp: intValue(data, "xp", 0), ...named }));
    case "settings":
      return run("Level settings saved.", () => sendJson("levels/settings", "PUT", payload(settingsFromForm(form, data))));
    case "rewards":
      return run("Rewards saved.", () => sendJson("levels/settings", "PUT", payload(rewardsFromForm(form, data))));
    default:
      return undefined;
  }
}

/** Current settings with changes applied, in the shape the API expects. */
function payload(changes) {
  const { guildId: _guildId, revision, levelUpChannelId, ...current } = view.settings;
  const merged = { ...current, ...(levelUpChannelId ? { levelUpChannelId } : {}), ...changes, expectedRevision: revision };
  if (!merged.levelUpChannelId) delete merged.levelUpChannelId;
  return merged;
}

function multipliersFrom(data, prefix) {
  const result = [];
  for (let index = 0; data.has(`${prefix}${index}.id`); index += 1) {
    const id = String(data.get(`${prefix}${index}.id`) ?? "").trim();
    const multiplier = Number(data.get(`${prefix}${index}.multiplier`));
    if (id && multiplier > 0) result.push({ id, multiplier });
  }
  return result;
}

function settingsFromForm(form, data) {
  const number = (name) => Number(data.get(name));
  return {
    enabled: boolValue(form, "enabled"),
    messageXpMin: intValue(data, "messageXpMin", 15),
    messageXpMax: intValue(data, "messageXpMax", 25),
    cooldownSeconds: intValue(data, "cooldownSeconds", 60),
    voiceXpPerMinute: intValue(data, "voiceXpPerMinute", 0),
    curve: { base: number("curve.base"), exponent: number("curve.exponent"), linear: number("curve.linear") },
    maxLevel: intValue(data, "maxLevel", 0),
    roleMultipliers: multipliersFrom(data, "rm"),
    channelMultipliers: multipliersFrom(data, "cm"),
    noXpRoleIds: data.getAll("noXpRoleIds"),
    noXpChannelIds: data.getAll("noXpChannelIds"),
    levelUpMode: String(data.get("levelUpMode")),
    levelUpChannelId: String(data.get("levelUpChannelId") ?? "").trim(),
    levelUpMessage: String(data.get("levelUpMessage") ?? "").trim(),
  };
}

function rewardsFromForm(form, data) {
  const rewards = [];
  for (let index = 0; data.has(`rw${index}.roleId`); index += 1) {
    const level = intValue(data, `rw${index}.level`, 0);
    const roleId = String(data.get(`rw${index}.roleId`) ?? "").trim();
    if (level > 0 && roleId) rewards.push({ level, roleId });
  }
  return { rewards, rewardMode: String(data.get("rewardMode")), removeRewardsOnReset: boolValue(form, "removeRewardsOnReset") };
}
