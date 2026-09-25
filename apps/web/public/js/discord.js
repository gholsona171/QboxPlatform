import { discordMutation, listDiscordChannels, listDiscordRoles, listRoleMenus, loadDiscordFeature, ticketDirectory } from "./api.js";
import { appPath } from "./config.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";

/** Each tab: label, API path for loading settings, and the renderer. */
const TABS = [
  ["welcome", "Welcome & goodbye", "welcome"],
  ["autoroles", "Autoroles", "autoroles"],
  ["rules", "Rules", "rules"],
  ["roles", "Roles", undefined],
  ["role-menus", "Role menus", undefined],
  ["counters", "Member counters", "counters"],
  ["logs", "Server logs", "logs"],
  ["announcements", "Embeds", "embeds"],
  ["custom", "Custom commands", "custom-commands"],
  ["suggestions", "Suggestions", "suggestions"],
  ["starboard", "Starboard", "starboard"],
];
const TAB_ALIASES = { "role-management": "roles", roles: "role-menus", overview: "welcome" };
const LOG_EVENTS = [
  ["memberJoin", "Member joined"],
  ["memberLeave", "Member left"],
  ["messageDelete", "Message deleted"],
  ["messageEdit", "Message edited"],
  ["roleChange", "Member roles changed"],
  ["nicknameChange", "Nickname changed"],
  ["voice", "Voice joins and leaves"],
  ["ban", "Bans and unbans"],
];
const COUNTER_TYPES = [["TOTAL_MEMBERS", "All members"], ["HUMANS", "Humans"], ["BOTS", "Bots"], ["ONLINE", "Online"], ["ROLE", "Members with a role"]];

const view = { tab: "welcome", settings: undefined, roles: [], channels: [], menus: [], error: undefined };
let container;

export async function renderDiscordPage(target) {
  container = target;
  const requested = new URLSearchParams(location.search).get("tab") ?? "welcome";
  view.tab = TABS.some(([id]) => id === requested) ? requested : TAB_ALIASES[requested] ?? "welcome";
  container.innerHTML = `<section class="card"><p class="microcopy">Loading your server...</p></section>`;
  await loadDirectory();
  await load();
  render();
}

async function loadDirectory() {
  const [roles, channels] = await Promise.allSettled([listDiscordRoles(), listDiscordChannels()]);
  if (roles.status === "fulfilled") view.roles = roles.value.data.filter((role) => !role.managed && role.name !== "@everyone");
  if (channels.status === "fulfilled") view.channels = channels.value.data;
  if (view.roles.length && view.channels.length) return;
  try {
    const directory = (await ticketDirectory()).data;
    if (!view.roles.length) view.roles = directory.roles;
    if (!view.channels.length) view.channels = directory.channels;
  } catch {
    // Pickers fall back to ID fields when the directory is not available to this user.
  }
}

async function load() {
  const path = TABS.find(([id]) => id === view.tab)?.[2];
  view.error = undefined;
  try {
    if (path) view.settings = (await loadDiscordFeature(path)).data;
    if (view.tab === "role-menus") view.menus = (await listRoleMenus()).data;
    if (view.tab === "roles") view.roles = (await listDiscordRoles()).data.filter((role) => role.name !== "@everyone");
  } catch (error) {
    view.error = error;
  }
}

function render() {
  if (!container?.isConnected) return;
  const body = view.error
    ? `<div class="empty-state">${view.error.status === 403 ? "You don't have permission to manage this feature. Ask a server admin to grant it." : escapeHtml(view.error.message)}</div>`
    : tabContent();
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Discord bot features">${TABS.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-d-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    ${body}
  </section>`;
  bind();
}

function tabContent() {
  switch (view.tab) {
    case "autoroles": return autorolesTab();
    case "rules": return rulesTab();
    case "roles": return rolesTab();
    case "role-menus": return roleMenusTab();
    case "counters": return countersTab();
    case "logs": return logsTab();
    case "announcements": return embedsTab();
    case "custom": return customTab();
    case "suggestions": return suggestionsTab();
    case "starboard": return starboardTab();
    default: return welcomeTab();
  }
}

/* ---------- Tabs ---------- */

function welcomeTab() {
  const welcome = view.settings.welcome ?? { enabled: false, messageText: "Welcome to {server}, {user}! You are member #{memberCount}.", embedEnabled: true, thumbnailAvatar: true };
  const goodbye = view.settings.goodbye ?? { enabled: false, messageText: "{username} left the server.", embedEnabled: false, thumbnailAvatar: true };
  return `<p class="microcopy">Placeholders: {user} {username} {displayName} {server} {memberCount}</p>
  <section class="grid cols-2">
    <form class="card form-grid" data-d-form="welcome">
      <h3>Welcome message ${badge(welcome.enabled ? "on" : "off")}</h3>
      ${checkbox("enabled", "Send a welcome message", welcome.enabled)}
      ${channelSelect("channelId", "Channel", welcome.channelId, "TEXT", true)}
      ${textArea("messageText", "Message", welcome.messageText)}
      ${checkbox("embedEnabled", "Show as an embed", welcome.embedEnabled)}
      ${textField("embedTitle", "Embed title", welcome.embedTitle ?? "")}
      ${textField("embedColor", "Embed color", welcome.embedColor ?? "#5865F2")}
      ${textArea("embedDescription", "Embed text (optional)", welcome.embedDescription ?? "")}
      ${checkbox("thumbnailAvatar", "Show the member's avatar", welcome.thumbnailAvatar)}
      ${checkbox("directMessageEnabled", "Also DM the member", welcome.directMessageEnabled ?? false)}
      <button class="button primary full">Save welcome</button>
    </form>
    <form class="card form-grid" data-d-form="goodbye">
      <h3>Goodbye message ${badge(goodbye.enabled ? "on" : "off")}</h3>
      ${checkbox("enabled", "Send a goodbye message", goodbye.enabled)}
      ${channelSelect("channelId", "Channel", goodbye.channelId, "TEXT", true)}
      ${textArea("messageText", "Message", goodbye.messageText)}
      ${checkbox("embedEnabled", "Show as an embed", goodbye.embedEnabled)}
      ${checkbox("thumbnailAvatar", "Show the member's avatar", goodbye.thumbnailAvatar)}
      <button class="button primary full">Save goodbye</button>
    </form>
  </section>`;
}

function autorolesTab() {
  const config = view.settings.autoroles;
  return `<section class="grid cols-2">
    <form class="card form-grid" data-d-form="autoroles">
      <h3>Give roles when someone joins ${badge(config.enabled ? "on" : "off")}</h3>
      ${checkbox("enabled", "Autoroles are on", config.enabled)}
      ${numberField("delaySeconds", "Wait before giving roles (seconds)", config.delaySeconds, 0, 86400)}
      ${checkbox("includeBots", "Also give roles to bots", config.includeBots)}
      <input type="hidden" name="expectedRevision" value="${config.revision ?? 0}">
      <button class="button primary full">Save</button>
    </form>
    <div class="card">
      <h3>Roles given</h3>
      <div class="chip-row">${config.roles.map((rule) => `<span class="chip">@${escapeHtml(roleName(rule.roleId))}</span>`).join("") || '<p class="microcopy">No roles yet.</p>'}</div>
      <form class="form-grid" data-d-form="autorole-add">${roleSelect("roleId", "Add a role", "", true)}<button class="button full">Add role</button></form>
      <p class="microcopy">Remove roles with <code>/autorole remove</code> in Discord.</p>
    </div>
  </section>`;
}

function rulesTab() {
  const rules = view.settings.rules ?? { enabled: false, messageText: "", buttonLabel: "Accept Rules" };
  return `<form class="card form-grid readable-form" data-d-form="rules">
    <h3>Rules acceptance ${badge(rules.enabled ? "on" : "off")}</h3>
    ${checkbox("enabled", "Rules button is on", rules.enabled)}
    ${channelSelect("channelId", "Rules channel", rules.channelId, "TEXT", true)}
    ${textArea("messageText", "Rules text", rules.messageText)}
    ${textField("buttonLabel", "Button text", rules.buttonLabel)}
    ${roleSelect("acceptedRoleId", "Role given after accepting", rules.acceptedRoleId, true)}
    ${roleSelect("pendingRoleId", "Role removed after accepting (optional)", rules.pendingRoleId)}
    <input type="hidden" name="expectedRevision" value="${rules.revision ?? 0}">
    <button class="button primary full">Save rules</button>
    <p class="microcopy full">Post or refresh the rules message with <code>/rules publish</code> in Discord.</p>
  </form>`;
}

function rolesTab() {
  const rows = view.roles.map((role) => row([
    ["Role", `<span class="role-dot" style="background:${escapeHtml(role.color && role.color !== "#000000" ? role.color : "#99aab5")}"></span> ${escapeHtml(role.name)}`],
    ["Members", String(role.memberCount ?? "—")],
    ["Used by Qbox", String(role.dependencyCount ?? 0)],
    ["", role.editable ? `<button class="button compact danger" data-d-action="delete-role" data-value="${escapeHtml(role.id)}" data-name="${escapeHtml(role.name)}">Delete</button>` : `<small class="microcopy">${escapeHtml(role.unavailableReason || (role.managed ? "Managed by an integration" : "Above the bot"))}</small>`],
  ]));
  return `<section class="grid editor-layout">
    <div>${table(["Role", "Members", "Used by Qbox", ""], rows, "No roles found.")}</div>
    <form class="card form-grid" data-d-form="role-create">
      <h3>Create a role</h3>
      ${textField("name", "Name", "", "", true)}
      ${textField("color", "Color", "#5865F2")}
      ${checkbox("hoist", "Show separately in the member list", false)}
      ${checkbox("mentionable", "Anyone can @mention it", false)}
      <button class="button primary full">Create role</button>
    </form>
  </section>`;
}

function roleMenusTab() {
  const cards = view.menus.map((menu) => `<div class="card">
    <div class="split-line"><h3>${escapeHtml(menu.title)}</h3>${badge(menu.status.toLowerCase())}</div>
    <p class="microcopy">${escapeHtml(channelLabel(menu.channelId))} · ${escapeHtml(menu.presentationType.replace("_", " ").toLowerCase())} · ${escapeHtml(menu.assignmentMode.replace("_", " ").toLowerCase())}</p>
    <div class="chip-row">${menu.options.map((option) => `<span class="chip">${escapeHtml(option.emoji ?? "")} ${escapeHtml(option.label)} → @${escapeHtml(roleName(option.roleId))}</span>`).join("") || '<span class="microcopy">No options yet.</span>'}</div>
    <form class="form-grid" data-d-form="menu-option" data-id="${escapeHtml(menu.id)}" data-revision="${menu.revision}">
      ${textField("label", "Option label", "", "", true)}
      ${roleSelect("roleId", "Role", "", true)}
      ${textField("emoji", "Emoji", "")}
      <button class="button compact full">Add option</button>
    </form>
    <div class="toolbar">${menu.status === "PUBLISHED" ? `<button class="button compact" data-d-action="disable-menu" data-value="${escapeHtml(menu.id)}" data-revision="${menu.revision}">Disable</button>` : ""}<button class="button compact danger" data-d-action="delete-menu" data-value="${escapeHtml(menu.id)}">Delete</button></div>
  </div>`).join("");
  return `<p class="microcopy">Build role menus here, then post them with <code>/role-menu publish</code> in Discord.</p>
  <section class="grid editor-layout">
    <div class="grid">${cards || '<div class="empty-state">No role menus yet.</div>'}</div>
    <form class="card form-grid" data-d-form="menu-create">
      <h3>New role menu</h3>
      ${textField("title", "Title", "", "Pick your roles", true)}
      ${channelSelect("channelId", "Channel", "", "TEXT", true)}
      ${textArea("description", "Description", "")}
      ${selectField("presentationType", "Style", [["BUTTONS", "Buttons"], ["SELECT_MENU", "Dropdown"], ["REACTIONS", "Reactions"]], "BUTTONS")}
      ${selectField("assignmentMode", "How roles work", [["TOGGLE", "Click to add or remove"], ["ADD_ONLY", "Add only"], ["REMOVE_ONLY", "Remove only"], ["EXCLUSIVE", "Only one at a time"]], "TOGGLE")}
      <button class="button primary full">Create role menu</button>
    </form>
  </section>`;
}

function countersTab() {
  const rows = view.settings.counters.map((counter) => row([
    ["Channel", escapeHtml(channelLabel(counter.channelId))],
    ["Shows", escapeHtml(counter.labelTemplate)],
    ["Counts", escapeHtml(COUNTER_TYPES.find(([id]) => id === counter.type)?.[1] ?? counter.type)],
    ["Last value", String(counter.lastValue ?? "—")],
  ]));
  return `<section class="grid editor-layout">
    <div>${table(["Channel", "Shows", "Counts", "Last value"], rows, "No counters yet. A counter renames a channel to show a live number, like \"Members: 1,204\".")}</div>
    <form class="card form-grid" data-d-form="counter">
      <h3>New counter</h3>
      ${channelSelect("channelId", "Channel to rename (voice channels work best)", "", "ANY", true)}
      ${textField("labelTemplate", "Name", "Members: {count}", "", true)}
      ${selectField("type", "Count", COUNTER_TYPES, "TOTAL_MEMBERS")}
      ${roleSelect("roleId", "Role (for role counters)", "")}
      ${numberField("intervalSeconds", "Refresh every (seconds)", 600, 300, 86400)}
      <button class="button primary full">Add counter</button>
    </form>
  </section>`;
}

function logsTab() {
  const logs = view.settings.logs ?? { enabled: false, events: [], destinations: {}, ignoredChannels: [], ignoredRoles: [], ignoredUsers: [], includeBots: false, colors: {} };
  const destination = Object.values(logs.destinations)[0] ?? "";
  return `<form class="card form-grid readable-form" data-d-form="logs">
    <h3>Server logs ${badge(logs.enabled ? "on" : "off")}</h3>
    ${checkbox("enabled", "Logging is on", logs.enabled)}
    ${channelSelect("destination", "Send logs to", destination, "TEXT", true)}
    <fieldset class="full"><legend>What to log</legend>${LOG_EVENTS.map(([id, label]) => checkbox(`event-${id}`, label, logs.events.includes(id))).join("")}</fieldset>
    ${checkbox("includeBots", "Include bot activity", logs.includeBots)}
    <button class="button primary full">Save logs</button>
  </form>`;
}

function embedsTab() {
  const rows = view.settings.embedTemplates.map((template) => row([["Name", escapeHtml(template.name)], ["Title", escapeHtml(template.title ?? "")]]));
  return `<section class="grid editor-layout">
    <div>${table(["Name", "Title"], rows, "No saved embeds yet.")}<p class="microcopy">Send a saved embed with <code>/embed send</code>.</p></div>
    <form class="card form-grid" data-d-form="embed">
      <h3>New embed</h3>
      ${textField("name", "Name", "", "rules-summary", true)}
      ${textField("title", "Title", "")}
      ${textArea("description", "Text", "")}
      ${checkbox("timestamp", "Show time sent", false)}
      <button class="button primary full">Save embed</button>
    </form>
  </section>`;
}

function customTab() {
  const rows = view.settings.customCommands.map((command) => row([["Command", `/${escapeHtml(command.name)}`], ["Reply", escapeHtml(command.responseText.slice(0, 80))], ["Status", badge(command.enabled ? "on" : "off")]]));
  return `<section class="grid editor-layout">
    <div>${table(["Command", "Reply", "Status"], rows, "No custom commands yet.")}</div>
    <form class="card form-grid" data-d-form="custom">
      <h3>New custom command</h3>
      ${textField("name", "Name", "", "store", true)}
      ${textField("description", "Description", "", "Link to our store")}
      ${textArea("responseText", "Reply", "")}
      ${numberField("cooldownSeconds", "Cooldown (seconds)", 0, 0, 86400)}
      ${checkbox("enabled", "Enabled", true)}
      <button class="button primary full">Save command</button>
    </form>
  </section>`;
}

function suggestionsTab() {
  const rows = view.settings.suggestions.map((item) => row([
    ["Suggestion", escapeHtml(item.content)],
    ["Votes", `▲ ${item.upvotes} ▼ ${item.downvotes}`],
    ["Status", badge(item.status.replace("_", " ").toLowerCase())],
    ["", `<div class="toolbar">${["UNDER_REVIEW", "APPROVED", "DENIED", "IMPLEMENTED"].map((status) => `<button class="button compact" data-d-action="suggestion" data-value="${escapeHtml(item.id)}" data-status="${status}">${escapeHtml(status.replace("_", " ").toLowerCase())}</button>`).join("")}</div>`],
  ]));
  return `${table(["Suggestion", "Votes", "Status", ""], rows, "No suggestions yet. Members submit them with /suggest submit.")}`;
}

function starboardTab() {
  const star = view.settings.starboard ?? { enabled: false, emoji: "⭐", threshold: 3, allowSelfStar: false, includeBotMessages: false, channels: [], ignoredRoles: [] };
  return `<form class="card form-grid readable-form" data-d-form="starboard">
    <h3>Starboard ${badge(star.enabled ? "on" : "off")}</h3>
    ${checkbox("enabled", "Starboard is on", star.enabled)}
    ${channelSelect("destinationChannelId", "Starboard channel", star.destinationChannelId, "TEXT", true)}
    ${textField("emoji", "Emoji", star.emoji)}
    ${numberField("threshold", "Reactions needed", star.threshold, 1, 1000)}
    ${checkbox("allowSelfStar", "People can star their own messages", star.allowSelfStar)}
    ${checkbox("includeBotMessages", "Include bot messages", star.includeBotMessages)}
    <button class="button primary full">Save starboard</button>
  </form>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-d-tab]").forEach((button) => button.addEventListener("click", async () => {
    view.tab = button.dataset.dTab;
    history.replaceState({}, "", appPath(`/discord?tab=${view.tab}`));
    await load();
    render();
  }));
  container.querySelectorAll("form[data-d-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form);
  }));
  container.querySelectorAll("[data-d-action]").forEach((button) => button.addEventListener("click", () => void action(button)));
}

async function run(message, operation) {
  try {
    await operation();
    notify(message);
    await load();
    render();
  } catch (error) {
    notify(error.message || "That did not work.", "error");
  }
}

async function submit(form) {
  const data = new FormData(form);
  const text = (name) => String(data.get(name) ?? "").trim();
  const bool = (name) => form.elements[name]?.checked === true;
  const int = (name) => Number.parseInt(text(name), 10) || 0;
  const optional = (name) => (text(name) ? { [name]: text(name) } : {});
  switch (form.dataset.dForm) {
    case "welcome":
      return run("Welcome message saved.", () => discordMutation("welcome", "PUT", { enabled: bool("enabled"), channelId: text("channelId"), messageText: text("messageText"), embedEnabled: bool("embedEnabled"), ...optional("embedTitle"), ...optional("embedDescription"), ...optional("embedColor"), thumbnailAvatar: bool("thumbnailAvatar"), directMessageEnabled: bool("directMessageEnabled") }));
    case "goodbye":
      return run("Goodbye message saved.", () => discordMutation("goodbye", "PUT", { enabled: bool("enabled"), channelId: text("channelId"), messageText: text("messageText"), embedEnabled: bool("embedEnabled"), thumbnailAvatar: bool("thumbnailAvatar") }));
    case "autoroles":
      return run("Autoroles saved.", () => discordMutation("autoroles", "PUT", { enabled: bool("enabled"), delaySeconds: int("delaySeconds"), includeBots: bool("includeBots"), expectedRevision: int("expectedRevision") }));
    case "autorole-add":
      return run("Role added.", () => discordMutation("autoroles/roles", "POST", { roleId: text("roleId") }));
    case "rules":
      return run("Rules saved.", () => discordMutation("rules", "PUT", { enabled: bool("enabled"), channelId: text("channelId"), messageText: text("messageText"), buttonLabel: text("buttonLabel") || "Accept Rules", acceptedRoleId: text("acceptedRoleId"), ...optional("pendingRoleId"), expectedRevision: int("expectedRevision") }));
    case "role-create":
      return run("Role created in Discord.", () => discordMutation("roles", "POST", { name: text("name"), color: text("color"), hoist: bool("hoist"), mentionable: bool("mentionable") }));
    case "menu-create":
      return run("Role menu created.", () => discordMutation("role-menus", "POST", { title: text("title"), channelId: text("channelId"), ...optional("description"), presentationType: text("presentationType"), assignmentMode: text("assignmentMode") }));
    case "menu-option":
      return run("Option added.", () => discordMutation(`role-menus/${form.dataset.id}/options`, "POST", { label: text("label"), roleId: text("roleId"), ...optional("emoji"), expectedRevision: Number(form.dataset.revision) }));
    case "counter":
      return run("Counter added.", () => discordMutation("counters", "POST", { channelId: text("channelId"), labelTemplate: text("labelTemplate"), type: text("type"), ...optional("roleId"), intervalSeconds: int("intervalSeconds"), enabled: true }));
    case "logs": {
      const events = LOG_EVENTS.map(([id]) => id).filter((id) => bool(`event-${id}`));
      const destination = text("destination");
      return run("Log settings saved.", () => discordMutation("logs", "PUT", { enabled: bool("enabled"), events, destinations: Object.fromEntries(events.map((id) => [id, destination])), ignoredChannels: [], ignoredRoles: [], ignoredUsers: [], includeBots: bool("includeBots"), colors: {} }));
    }
    case "embed":
      return run("Embed saved.", () => discordMutation("embeds", "POST", { name: text("name"), ...optional("title"), ...optional("description"), timestamp: bool("timestamp"), allowedRoleMentions: [] }));
    case "custom":
      return run("Custom command saved.", () => discordMutation("custom-commands", "POST", { name: text("name"), ...optional("description"), responseText: text("responseText"), enabled: bool("enabled"), cooldownSeconds: int("cooldownSeconds"), allowedChannels: [], deniedChannels: [], requiredRoles: [] }));
    case "starboard":
      return run("Starboard saved.", () => discordMutation("starboard", "PUT", { enabled: bool("enabled"), destinationChannelId: text("destinationChannelId"), emoji: text("emoji") || "⭐", threshold: int("threshold"), allowSelfStar: bool("allowSelfStar"), includeBotMessages: bool("includeBotMessages"), channels: [], ignoredRoles: [] }));
    default:
      return undefined;
  }
}

async function action(button) {
  const id = button.dataset.value;
  switch (button.dataset.dAction) {
    case "delete-role":
      if (!(await confirmAction({ title: `Delete @${button.dataset.name}?`, body: "The role is deleted from Discord. This cannot be undone.", confirmText: "Delete role" }))) return undefined;
      return run("Role deleted.", () => discordMutation(`roles/${id}`, "DELETE", { confirmation: button.dataset.name }));
    case "disable-menu":
      return run("Role menu disabled.", () => discordMutation(`role-menus/${id}/disable`, "POST", { expectedRevision: Number(button.dataset.revision) }));
    case "delete-menu":
      if (!(await confirmAction({ title: "Delete this role menu?", body: "Members can no longer use it.", confirmText: "Delete" }))) return undefined;
      return run("Role menu deleted.", () => discordMutation(`role-menus/${id}`, "DELETE"));
    case "suggestion":
      return run("Suggestion updated.", () => discordMutation(`suggestions/${id}/status`, "POST", { status: button.dataset.status }));
    default:
      return undefined;
  }
}

/* ---------- Helpers ---------- */

function checkbox(name, label, checked) {
  return `<label class="checkbox full"><input type="checkbox" name="${escapeHtml(name)}" ${checked ? "checked" : ""}> ${escapeHtml(label)}</label>`;
}

function textField(name, label, value, hint = "", required = false) {
  return `<label>${escapeHtml(label)}<input name="${escapeHtml(name)}" value="${escapeHtml(value ?? "")}" ${hint ? `placeholder="${escapeHtml(hint)}"` : ""} ${required ? "required" : ""}></label>`;
}

function textArea(name, label, value) {
  return `<label class="full">${escapeHtml(label)}<textarea name="${escapeHtml(name)}">${escapeHtml(value ?? "")}</textarea></label>`;
}

function numberField(name, label, value, min, max) {
  return `<label>${escapeHtml(label)}<input type="number" name="${escapeHtml(name)}" value="${escapeHtml(value)}" min="${min}" max="${max}" required></label>`;
}

function selectField(name, label, options, selected) {
  return `<label>${escapeHtml(label)}<select name="${escapeHtml(name)}">${options.map(([value, text]) => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}</select></label>`;
}

function channelSelect(name, label, selected, kind, required = false) {
  const channels = view.channels.filter((channel) => kind === "ANY" ? channel.type !== "CATEGORY" : channel.type === "TEXT" || channel.type === "ANNOUNCEMENT");
  if (!channels.length) return `<label>${escapeHtml(label)} (channel ID)<input name="${escapeHtml(name)}" value="${escapeHtml(selected ?? "")}" pattern="\\d{17,20}" ${required ? "required" : ""}></label>`;
  return `<label>${escapeHtml(label)}<select name="${escapeHtml(name)}" ${required ? "required" : ""}><option value="">Choose a channel</option>${channels.map((channel) => `<option value="${escapeHtml(channel.id)}" ${channel.id === selected ? "selected" : ""}>${channel.type === "VOICE" ? "🔊 " : "# "}${escapeHtml(channel.name)}</option>`).join("")}</select></label>`;
}

function roleSelect(name, label, selected, required = false) {
  const roles = view.roles.filter((role) => !role.managed);
  if (!roles.length) return `<label>${escapeHtml(label)} (role ID)<input name="${escapeHtml(name)}" value="${escapeHtml(selected ?? "")}" pattern="\\d{17,20}" ${required ? "required" : ""}></label>`;
  return `<label>${escapeHtml(label)}<select name="${escapeHtml(name)}" ${required ? "required" : ""}><option value="">${required ? "Choose a role" : "None"}</option>${roles.map((role) => `<option value="${escapeHtml(role.id)}" ${role.id === selected ? "selected" : ""}>@${escapeHtml(role.name)}</option>`).join("")}</select></label>`;
}

function roleName(id) {
  return view.roles.find((role) => role.id === id)?.name ?? id;
}

function channelLabel(id) {
  const channel = view.channels.find((item) => item.id === id);
  return channel ? `#${channel.name}` : id ?? "";
}
