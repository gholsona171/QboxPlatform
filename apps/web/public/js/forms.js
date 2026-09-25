import { loadDirectoryData, lookupMembers, searchMembers } from "./api.js";
import { escapeHtml } from "./ui.js";

/**
 * Shared form building blocks for every portal page.
 *
 * Channel, role, and member pickers read the server directory loaded with
 * `loadDirectory()` (channels, roles, and any members looked up so far).
 */
const directory = { channels: [], roles: [], members: [] };

/** Loads channels and roles, plus names for the given member IDs. Safe to call often. */
export async function loadDirectory(memberIds = []) {
  try {
    if (!directory.channels.length && !directory.roles.length) {
      const data = (await loadDirectoryData()).data;
      directory.channels = data.channels;
      directory.roles = data.roles;
    }
    const missing = [...new Set(memberIds)].filter((id) => !directory.members.some((member) => member.id === id));
    if (missing.length) rememberMembers((await lookupMembers(missing)).data);
  } catch {
    // Pickers fall back to plain ID fields when the directory is unavailable.
  }
  return directory;
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

/** Channel dropdown. `kind`: "TEXT", "CATEGORY", "VOICE", or "ANY". */
export function channelSelect(name, label, selected, kind = "TEXT", emptyLabel = "Choose a channel", required = false) {
  const channels = channelsOf(kind);
  if (!channels.length)
    return `<label>${escapeHtml(label)} (channel ID)<input name="${escapeHtml(name)}" value="${escapeHtml(selected ?? "")}" pattern="\\d{17,20}" ${required ? "required" : ""}></label>`;
  const known = !selected || channels.some((channel) => channel.id === selected);
  return `<label>${escapeHtml(label)}<select name="${escapeHtml(name)}" ${required ? "required" : ""}>
    <option value="">${escapeHtml(emptyLabel)}</option>
    ${known ? "" : `<option value="${escapeHtml(selected)}" selected>Unknown channel ${escapeHtml(selected)}</option>`}
    ${channels.map((channel) => `<option value="${escapeHtml(channel.id)}" ${channel.id === selected ? "selected" : ""}>${channelPrefix(channel.type)}${escapeHtml(channel.name)}</option>`).join("")}
  </select></label>`;
}

/** Single role dropdown. */
export function roleSelect(name, label, selected, required = false) {
  if (!directory.roles.length)
    return `<label>${escapeHtml(label)} (role ID)<input name="${escapeHtml(name)}" value="${escapeHtml(selected ?? "")}" pattern="\\d{17,20}" ${required ? "required" : ""}></label>`;
  return `<label>${escapeHtml(label)}<select name="${escapeHtml(name)}" ${required ? "required" : ""}><option value="">${required ? "Choose a role" : "None"}</option>${directory.roles.map((role) => `<option value="${escapeHtml(role.id)}" ${role.id === selected ? "selected" : ""}>@${escapeHtml(role.name)}</option>`).join("")}</select></label>`;
}

/** Multi-role picker; submits one `name` value per chosen role. Call `bindPickers` after rendering. */
export function rolePicker(name, label, selected = [], help = "") {
  return `<div class="chip-picker full" data-name="${escapeHtml(name)}">
    <span class="picker-label">${escapeHtml(label)}</span>
    <div class="chip-row">${selected.map((id) => chip(name, id, `@${roleName(id)}`)).join("")}</div>
    ${directory.roles.length
      ? `<select data-chip-add aria-label="Add a role to ${escapeHtml(label)}"><option value="">+ Add a role</option>${directory.roles.map((role) => `<option value="${escapeHtml(role.id)}">@${escapeHtml(role.name)}</option>`).join("")}</select>`
      : `<input data-id-add placeholder="Paste a role ID and press Enter" aria-label="Add a role ID">`}
    ${help ? `<small class="microcopy">${escapeHtml(help)}</small>` : ""}
  </div>`;
}

/** Multi-channel picker; submits one `name` value per chosen channel. */
export function channelPicker(name, label, selected = [], kind = "TEXT", help = "") {
  const channels = channelsOf(kind);
  return `<div class="chip-picker full" data-name="${escapeHtml(name)}">
    <span class="picker-label">${escapeHtml(label)}</span>
    <div class="chip-row">${selected.map((id) => chip(name, id, channelLabel(id))).join("")}</div>
    ${channels.length
      ? `<select data-chip-add aria-label="Add a channel to ${escapeHtml(label)}"><option value="">+ Add a channel</option>${channels.map((channel) => `<option value="${escapeHtml(channel.id)}">${channelPrefix(channel.type)}${escapeHtml(channel.name)}</option>`).join("")}</select>`
      : `<input data-id-add placeholder="Paste a channel ID and press Enter" aria-label="Add a channel ID">`}
    ${help ? `<small class="microcopy">${escapeHtml(help)}</small>` : ""}
  </div>`;
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
  root.querySelectorAll(".chip-picker").forEach((picker) => {
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
  });
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
