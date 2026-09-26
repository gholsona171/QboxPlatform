import { loadDirectoryData, lookupMembers, searchMembers } from "./api.js";
import { escapeHtml } from "./ui.js";
import { currentGuild } from "./session.js";

/**
 * Shared form building blocks for every portal page.
 *
 * Channel, role, and member pickers read the server directory loaded with
 * `loadDirectory()` (channels, roles, and any members looked up so far).
 */
const directory = { channels: [], roles: [], members: [] };

/** Channels and roles older than this are fetched again, so new channels show up without a page reload. */
const DIRECTORY_MAX_AGE_MS = 15_000;
/** When channels and roles were last fetched (0 = never or invalidated). */
let loadedAt = 0;
/** Server the cached channels and roles belong to (the server cookie is not readable here, so the account's current server). */
let loadedFor;
let inFlight;

function currentGuildId() {
  return currentGuild()?.id;
}

/** Marks the cached channels and roles stale; the next `loadDirectory()` fetches them again. */
export function invalidateDirectory() {
  loadedAt = 0;
}

/**
 * Loads channels and roles (again when older than 15 seconds, after a server
 * switch, or with `{ refresh: true }`), plus names for the given member IDs.
 * Safe to call often. Accepts `(memberIds)`, `(memberIds, options)`, or `(options)`.
 */
export async function loadDirectory(memberIds = [], options = {}) {
  if (!Array.isArray(memberIds)) {
    options = memberIds ?? {};
    memberIds = [];
  }
  try {
    const stale = !loadedAt || Date.now() - loadedAt > DIRECTORY_MAX_AGE_MS || loadedFor !== currentGuildId();
    if (options.refresh || stale) await fetchChannelsAndRoles(options.refresh === true);
    const missing = [...new Set(memberIds)].filter((id) => !directory.members.some((member) => member.id === id));
    if (missing.length) rememberMembers((await lookupMembers(missing)).data);
  } catch {
    // Pickers fall back to plain ID fields (or the last list) when the directory is unavailable.
  }
  return directory;
}

async function fetchChannelsAndRoles(refresh = false) {
  inFlight ??= (async () => {
    try {
      const guild = currentGuildId();
      const data = (await loadDirectoryData(refresh)).data;
      directory.channels = data.channels;
      directory.roles = data.roles;
      loadedAt = Date.now();
      loadedFor = guild;
    } finally {
      inFlight = undefined;
    }
  })();
  return inFlight;
}

if (typeof window !== "undefined") {
  // A server switch makes every cached channel and role wrong.
  window.addEventListener("qbox:guild-changed", invalidateDirectory);
  // Coming back to the tab after a while (for example after creating channels in Discord) fetches again.
  window.addEventListener("focus", () => {
    if (loadedAt && Date.now() - loadedAt > DIRECTORY_MAX_AGE_MS) invalidateDirectory();
  });
  // The ↻ button next to a channel or role picker reloads the directory and redraws that picker, keeping its value.
  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-directory-refresh]");
    if (!button) return;
    event.preventDefault();
    void refreshPicker(button);
  });
}

export function directoryData() {
  return directory;
}

function rememberMembers(members) {
  for (const member of members) if (!directory.members.some((item) => item.id === member.id)) directory.members.push(member);
}

/* ---------- Inputs ---------- */

export function checkbox(name, label, checked) {
  return `<label class="checkbox full"><input type="checkbox" name="${escapeHtml(name)}" ${checked ? "checked" : ""}> ${escapeHtml(label)}</label>`;
}

export function textField(name, label, value, hint = "", required = false, width = "") {
  return `<label class="${width}">${escapeHtml(label)}<input name="${escapeHtml(name)}" value="${escapeHtml(value ?? "")}" ${hint ? `placeholder="${escapeHtml(hint)}"` : ""} ${required ? "required" : ""}></label>`;
}

export function textArea(name, label, value, hint = "") {
  return `<label class="full">${escapeHtml(label)}<textarea name="${escapeHtml(name)}" ${hint ? `placeholder="${escapeHtml(hint)}"` : ""}>${escapeHtml(value ?? "")}</textarea></label>`;
}

export function numberField(name, label, value, min, max, required = true) {
  return `<label>${escapeHtml(label)}<input type="number" name="${escapeHtml(name)}" value="${escapeHtml(value ?? "")}" min="${min}" max="${max}" ${required ? "required" : ""}></label>`;
}

export function dateTimeField(name, label, value, required = false) {
  const local = value ? new Date(new Date(value).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
  return `<label>${escapeHtml(label)}<input type="datetime-local" name="${escapeHtml(name)}" value="${escapeHtml(local)}" ${required ? "required" : ""}></label>`;
}

export function selectField(name, label, options, selected) {
  return `<label>${escapeHtml(label)}<select name="${escapeHtml(name)}">${options.map(([value, text]) => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}</select></label>`;
}

export function detail(label, value) {
  return `<div class="detail-row"><span>${label}</span><strong>${value}</strong></div>`;
}

/* ---------- Discord pickers ---------- */

const TEXT_TYPES = new Set(["TEXT", "ANNOUNCEMENT"]);

function channelsOf(kind) {
  if (kind === "CATEGORY") return directory.channels.filter((channel) => channel.type === "CATEGORY");
  if (kind === "VOICE") return directory.channels.filter((channel) => channel.type === "VOICE" || channel.type === "STAGE");
  if (kind === "ANY") return directory.channels.filter((channel) => channel.type !== "CATEGORY");
  return directory.channels.filter((channel) => TEXT_TYPES.has(channel.type));
}

function channelPrefix(type) {
  return type === "CATEGORY" ? "📁 " : type === "VOICE" || type === "STAGE" ? "🔊 " : "# ";
}

/** Shown for a saved channel or role that the server no longer has, so the owner sees it must be changed. */
export const MISSING_CHANNEL_LABEL = "#deleted-channel (missing)";
export const MISSING_ROLE_LABEL = "@deleted-role (missing)";

/** Whether a channel ID is in the loaded directory; undefined when the directory is not loaded. */
export function channelExists(id) {
  if (!id || !directory.channels.length) return undefined;
  return directory.channels.some((channel) => channel.id === id);
}

/** Small button that reloads channels and roles and redraws the picker it sits in. */
function refreshButton(what) {
  return `<button type="button" class="picker-refresh" data-directory-refresh title="Reload ${what} from Discord" aria-label="Reload ${what} from Discord">↻</button>`;
}

/** `data-*` attributes that let the ↻ button redraw a picker with the same arguments. */
function pickerData(type, args) {
  return `data-picker="${type}" data-picker-args="${escapeHtml(JSON.stringify(args))}"`;
}

/** Channel dropdown. `kind`: "TEXT", "CATEGORY", "VOICE", or "ANY". */
export function channelSelect(name, label, selected, kind = "TEXT", emptyLabel = "Choose a channel", required = false) {
  const channels = channelsOf(kind);
  const data = pickerData("channelSelect", [name, label, null, kind, emptyLabel, required]);
  if (!channels.length)
    return `<label ${data}>${escapeHtml(label)} (channel ID)<span class="select-row"><input name="${escapeHtml(name)}" value="${escapeHtml(selected ?? "")}" pattern="\\d{17,20}" ${required ? "required" : ""}>${refreshButton("channels")}</span></label>`;
  const known = !selected || channels.some((channel) => channel.id === selected);
  return `<label ${data}>${escapeHtml(label)}<span class="select-row"><select name="${escapeHtml(name)}" ${required ? "required" : ""}>
    <option value="">${escapeHtml(emptyLabel)}</option>
    ${known ? "" : `<option value="${escapeHtml(selected)}" selected>${MISSING_CHANNEL_LABEL}</option>`}
    ${channels.map((channel) => `<option value="${escapeHtml(channel.id)}" ${channel.id === selected ? "selected" : ""}>${channelPrefix(channel.type)}${escapeHtml(channel.name)}</option>`).join("")}
  </select>${refreshButton("channels")}</span></label>`;
}

/** Single role dropdown. */
export function roleSelect(name, label, selected, required = false) {
  const data = pickerData("roleSelect", [name, label, null, required]);
  if (!directory.roles.length)
    return `<label ${data}>${escapeHtml(label)} (role ID)<span class="select-row"><input name="${escapeHtml(name)}" value="${escapeHtml(selected ?? "")}" pattern="\\d{17,20}" ${required ? "required" : ""}>${refreshButton("roles")}</span></label>`;
  const known = !selected || directory.roles.some((role) => role.id === selected);
  return `<label ${data}>${escapeHtml(label)}<span class="select-row"><select name="${escapeHtml(name)}" ${required ? "required" : ""}><option value="">${required ? "Choose a role" : "None"}</option>${known ? "" : `<option value="${escapeHtml(selected)}" selected>${MISSING_ROLE_LABEL}</option>`}${directory.roles.map((role) => `<option value="${escapeHtml(role.id)}" ${role.id === selected ? "selected" : ""}>@${escapeHtml(role.name)}</option>`).join("")}</select>${refreshButton("roles")}</span></label>`;
}

/** Multi-role picker; submits one `name` value per chosen role. Call `bindPickers` after rendering. */
export function rolePicker(name, label, selected = [], help = "") {
  return `<div class="chip-picker full" data-name="${escapeHtml(name)}" ${pickerData("rolePicker", [name, label, null, help])}>
    <span class="picker-label">${escapeHtml(label)}</span>
    <div class="chip-row">${selected.map((id) => chip(name, id, roleChipLabel(id))).join("")}</div>
    <span class="select-row">${directory.roles.length
      ? `<select data-chip-add aria-label="Add a role to ${escapeHtml(label)}"><option value="">+ Add a role</option>${directory.roles.map((role) => `<option value="${escapeHtml(role.id)}">@${escapeHtml(role.name)}</option>`).join("")}</select>`
      : `<input data-id-add placeholder="Paste a role ID and press Enter" aria-label="Add a role ID">`}${refreshButton("roles")}</span>
    ${help ? `<small class="microcopy">${escapeHtml(help)}</small>` : ""}
  </div>`;
}

/** Multi-channel picker; submits one `name` value per chosen channel. */
export function channelPicker(name, label, selected = [], kind = "TEXT", help = "") {
  const channels = channelsOf(kind);
  return `<div class="chip-picker full" data-name="${escapeHtml(name)}" ${pickerData("channelPicker", [name, label, null, kind, help])}>
    <span class="picker-label">${escapeHtml(label)}</span>
    <div class="chip-row">${selected.map((id) => chip(name, id, channelExists(id) === false ? MISSING_CHANNEL_LABEL : channelLabel(id))).join("")}</div>
    <span class="select-row">${channels.length
      ? `<select data-chip-add aria-label="Add a channel to ${escapeHtml(label)}"><option value="">+ Add a channel</option>${channels.map((channel) => `<option value="${escapeHtml(channel.id)}">${channelPrefix(channel.type)}${escapeHtml(channel.name)}</option>`).join("")}</select>`
      : `<input data-id-add placeholder="Paste a channel ID and press Enter" aria-label="Add a channel ID">`}${refreshButton("channels")}</span>
    ${help ? `<small class="microcopy">${escapeHtml(help)}</small>` : ""}
  </div>`;
}

function roleChipLabel(id) {
  if (directory.roles.length && !directory.roles.some((role) => role.id === id)) return MISSING_ROLE_LABEL;
  return `@${roleName(id)}`;
}

const PICKERS = { channelSelect, roleSelect, rolePicker, channelPicker };

/** Reloads the directory and redraws the picker holding `button`, keeping what was chosen. */
async function refreshPicker(button) {
  const holder = button.closest("[data-picker]");
  const render = holder && PICKERS[holder.dataset.picker];
  if (!render) return;
  button.disabled = true;
  button.classList.add("spinning");
  try {
    await loadDirectory({ refresh: true });
    let args;
    try {
      args = JSON.parse(holder.dataset.pickerArgs ?? "[]");
    } catch {
      return;
    }
    const name = args[0];
    const multiple = holder.dataset.picker === "rolePicker" || holder.dataset.picker === "channelPicker";
    const value = multiple
      ? [...holder.querySelectorAll(`input[type=hidden][name="${CSS.escape(name)}"]`)].map((input) => input.value)
      : holder.querySelector(`[name="${CSS.escape(name)}"]`)?.value ?? "";
    args[2] = value;
    const template = document.createElement("template");
    template.innerHTML = render(...args).trim();
    const next = template.content.firstElementChild;
    if (!next) return;
    holder.replaceWith(next);
    if (multiple) bindPicker(next);
    // Live previews and dependent fields listen for input and change events.
    const field = next.querySelector(`[name="${CSS.escape(name)}"]`) ?? next;
    field.dispatchEvent(new Event("change", { bubbles: true }));
    next.querySelector("[data-directory-refresh]")?.focus();
  } finally {
    button.disabled = false;
    button.classList.remove("spinning");
  }
}

/** Member search picker; submits one `name` value per chosen member. */
export function memberPicker(name, label, selected = [], help = "") {
  return `<div class="chip-picker full" data-name="${escapeHtml(name)}">
    <span class="picker-label">${escapeHtml(label)}</span>
    <div class="chip-row">${selected.map((id) => chip(name, id, memberText(id))).join("")}</div>
    <input data-member-search placeholder="Search members by name, or paste a Discord ID" aria-label="Search members">
    <div class="member-results"></div>
    ${help ? `<small class="microcopy">${escapeHtml(help)}</small>` : ""}
  </div>`;
}

function chip(name, id, label) {
  return `<span class="chip">${escapeHtml(label)}<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(id)}"><button type="button" aria-label="Remove ${escapeHtml(label)}" data-chip-remove>×</button></span>`;
}

/** Wires every picker inside `root`. */
export function bindPickers(root) {
  root.querySelectorAll(".chip-picker").forEach(bindPicker);
}

function bindPicker(picker) {
  if (picker.dataset.bound) return;
  picker.dataset.bound = "true";
  {
    const name = picker.dataset.name;
    const chips = picker.querySelector(".chip-row");
    const add = (id, label) => {
      if (!id || picker.querySelector(`input[type=hidden][value="${CSS.escape(id)}"]`)) return;
      chips.insertAdjacentHTML("beforeend", chip(name, id, label));
    };
    chips.addEventListener("click", (event) => event.target.closest("[data-chip-remove]")?.closest(".chip")?.remove());
    const select = picker.querySelector("select[data-chip-add]");
    select?.addEventListener("change", () => {
      add(select.value, select.selectedOptions[0]?.textContent ?? select.value);
      select.value = "";
    });
    const idInput = picker.querySelector("input[data-id-add]");
    idInput?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      const value = idInput.value.trim();
      if (/^\d{17,20}$/.test(value)) add(value, value);
      idInput.value = "";
    });
    const search = picker.querySelector("input[data-member-search]");
    const results = picker.querySelector(".member-results");
    let timer;
    search?.addEventListener("input", () => {
      clearTimeout(timer);
      const query = search.value.trim();
      if (/^\d{17,20}$/.test(query)) {
        results.innerHTML = `<button type="button" class="member-result" data-id="${query}" data-label="${query}">Add ID ${query}</button>`;
        return;
      }
      if (query.length < 2) {
        results.innerHTML = "";
        return;
      }
      timer = setTimeout(async () => {
        try {
          const members = (await searchMembers(query)).data;
          rememberMembers(members);
          results.innerHTML = members.map((member) => `<button type="button" class="member-result" data-id="${escapeHtml(member.id)}" data-label="${escapeHtml(member.displayName)}">${member.avatarUrl ? `<img alt="" src="${escapeHtml(member.avatarUrl)}">` : ""}<span>${escapeHtml(member.displayName)}</span><small>@${escapeHtml(member.username)}</small></button>`).join("") || `<p class="microcopy">No members found.</p>`;
        } catch (error) {
          results.innerHTML = `<p class="microcopy">${escapeHtml(error.message)}</p>`;
        }
      }, 250);
    });
    search?.addEventListener("keydown", (event) => { if (event.key === "Enter") event.preventDefault(); });
    results?.addEventListener("click", (event) => {
      const result = event.target.closest(".member-result");
      if (!result) return;
      add(result.dataset.id, result.dataset.label);
      results.innerHTML = "";
      search.value = "";
    });
  }
}

/* ---------- Payload helpers ---------- */

/** `{ [name]: value }` when the field is filled, otherwise `{}`. */
export function optionalValue(data, name) {
  const value = String(data.get(name) ?? "").trim();
  return value ? { [name]: value } : {};
}

export function boolValue(form, name) {
  return form.elements[name]?.checked === true;
}

export function intValue(data, name, fallback = 0) {
  const parsed = Number.parseInt(String(data.get(name) ?? ""), 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}

/* ---------- Display helpers ---------- */

export function roleName(id) {
  return directory.roles.find((role) => role.id === id)?.name ?? id;
}

export function roleNames(ids) {
  return ids.map((id) => `@${roleName(id)}`).join(", ");
}

export function memberText(id) {
  return directory.members.find((member) => member.id === id)?.displayName ?? id;
}

/** HTML-safe member label: display name when known, otherwise the ID in code. */
export function memberName(id) {
  const member = directory.members.find((item) => item.id === id);
  return member ? escapeHtml(member.displayName) : `<code>${escapeHtml(id)}</code>`;
}

export function channelLabel(id) {
  if (!id) return "";
  const channel = directory.channels.find((item) => item.id === id);
  return channel ? `${channelPrefix(channel.type).trim()} ${channel.name}`.replace("# ", "#") : id;
}

export function relative(value) {
  const minutesAgo = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (Math.abs(minutesAgo) < 1) return "just now";
  const future = minutesAgo < 0;
  const size = Math.abs(minutesAgo);
  const text = size < 60 ? `${size}m` : size < 1440 ? `${Math.round(size / 60)}h` : `${Math.round(size / 1440)}d`;
  return future ? `in ${text}` : `${text} ago`;
}

export function minutes(value) {
  if (value === undefined || value === null) return "—";
  return value >= 120 ? `${Math.round(value / 60)}h` : `${value}m`;
}

export function dateTime(value) {
  return value ? new Date(value).toLocaleString() : "—";
}
