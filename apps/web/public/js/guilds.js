import { listGuilds, loginUrl, selectGuild } from "./api.js";
import { currentGuild, knownGuilds, session, signedIn } from "./session.js";
import { escapeHtml, notify } from "./ui.js";
import { BRAND } from "./brand.js";

/**
 * Server picker: the sidebar header shows the current server, the picker
 * dialog switches servers, and the "Choose a server" page covers the content
 * area when no server is chosen yet.
 *
 * Choosing a server sets the API's server cookie and then reloads the page,
 * so every page starts fresh with the new server's data.
 */

const ICON_COLORS = ["#5865f2", "#3ba55d", "#e0a526", "#eb459e", "#f47b67", "#1abc9c", "#9b59b6", "#e67e22"];

const validId = (id) => /^\d{17,20}$/.test(id ?? "");
const validHash = (hash) => /^(a_)?[0-9a-f]{32}$/.test(hash ?? "");

function initials(name) {
  return String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("") || "?";
}

function iconColor(id) {
  let sum = 0;
  for (const digit of String(id ?? "")) sum += digit.charCodeAt(0);
  return ICON_COLORS[sum % ICON_COLORS.length];
}

/** Server icon from the Discord CDN, or initials in a colored circle. */
export function guildIcon(guild, size = "") {
  const url = validId(guild.id) && validHash(guild.icon)
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`
    : undefined;
  return `<span class="server-icon ${size}" style="background:${iconColor(guild.id)}">${url ? `<img alt="" src="${escapeHtml(url)}">` : escapeHtml(initials(guild.name))}</span>`;
}

function guildTags(guild) {
  const role = guild.owner ? "Owner" : guild.canManage ? "Admin" : "Member";
  const tags = [`<span class="badge ${guild.canManage ? "info" : ""}">${role}</span>`];
  if (!guild.canManage) tags.push(`<span class="badge warning">Limited</span>`);
  return `<span class="guild-tags">${tags.join("")}</span>`;
}

function guildList() {
  const guilds = knownGuilds();
  if (!guilds.length) {
    return `<div class="empty-state">No servers yet. Add ${BRAND.name} to a server you are in, then refresh the list.</div>`;
  }
  const current = currentGuild()?.id;
  return `<ul class="guild-list">${guilds
    .map((guild) => `<li><button type="button" class="guild-option ${guild.id === current ? "current" : ""}" data-guild-select="${escapeHtml(guild.id)}" ${guild.id === current ? 'aria-current="true"' : ""}>
      ${guildIcon(guild)}
      <div><strong>${escapeHtml(guild.name)}</strong>${guildTags(guild)}</div>
    </button></li>`)
    .join("")}</ul>`;
}

function inviteButton(extraClass = "") {
  const url = session.account?.inviteUrl;
  if (typeof url !== "string" || !url.startsWith("https://discord.com/")) return "";
  return `<a class="button ${extraClass}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Add ${BRAND.name} to a server</a>`;
}

/* ---------- Sidebar header ---------- */

export function renderServerHeader() {
  const header = document.getElementById("serverHeader");
  const guild = currentGuild();
  if (!signedIn()) {
    header.innerHTML = `<div class="brand"><div class="brand-mark">GH</div><div><strong>${BRAND.name}</strong><span>Community control panel</span></div></div>`;
    return;
  }
  if (!guild) {
    header.innerHTML = `<div class="brand"><div class="brand-mark">GH</div><div><strong>${BRAND.name}</strong><span>No server chosen</span></div></div>
      <button type="button" class="button compact full" data-guild-picker>Choose a server</button>`;
    return;
  }
  header.innerHTML = `<div class="server-current">
      ${guildIcon(guild)}
      <div>
        <strong class="server-name" title="${escapeHtml(guild.name)}">${escapeHtml(guild.name)}</strong>
        <button type="button" class="server-switch" data-guild-picker aria-haspopup="dialog">Switch server</button>
      </div>
    </div>`;
}

/* ---------- Choose a server page ---------- */

export function chooseServerView() {
  if (session.account?.reauthRequired) {
    return `<section class="card sign-in-card">
      <div class="brand-mark large">QB</div>
      <h2>Sign in again to see your servers</h2>
      <p class="microcopy">Your Discord sign-in needs to be refreshed before ${BRAND.name} can list the servers you are in.</p>
      <a class="button primary" href="${escapeHtml(loginUrl())}">Sign in with Discord</a>
    </section>`;
  }
  return `<section class="card choose-server">
    <div class="section-head">
      <h2>Choose a server</h2>
      <p class="microcopy">Pick the Discord server you want to manage. Servers marked Limited only show member pages.</p>
    </div>
    ${guildList()}
    <div class="toolbar">
      ${inviteButton("primary")}
      <button type="button" class="button" data-guild-refresh>Refresh list</button>
    </div>
  </section>`;
}

/* ---------- Picker dialog ---------- */

function pickerElements() {
  const backdrop = document.getElementById("guildPickerBackdrop");
  return { backdrop, list: document.getElementById("guildPickerList"), actions: document.getElementById("guildPickerActions") };
}

let opener;

export function openGuildPicker() {
  const { backdrop, list, actions } = pickerElements();
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
  list.innerHTML = guildList();
  actions.innerHTML = `${inviteButton("compact")}<button type="button" class="button compact" data-guild-refresh>Refresh list</button><button type="button" class="button compact" id="guildPickerClose">Close</button>`;
  backdrop.hidden = false;
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
  (list.querySelector(".guild-option.current") ?? list.querySelector(".guild-option") ?? document.getElementById("guildPickerClose"))?.focus();
}

export function closeGuildPicker() {
  const { backdrop } = pickerElements();
  if (backdrop.hidden) return;
  backdrop.hidden = true;
  opener?.focus?.();
  opener = undefined;
}

async function refreshGuildList(button) {
  button.disabled = true;
  try {
    session.account.guilds = (await listGuilds(true)).data;
    const { backdrop, list } = pickerElements();
    if (!backdrop.hidden) list.innerHTML = guildList();
    rerenderChoosePage();
    notify("Server list refreshed.");
  } catch (error) {
    notify(error.message || "The server list could not be refreshed.", "error");
  } finally {
    button.disabled = false;
  }
}

function rerenderChoosePage() {
  const page = document.querySelector(".choose-server");
  if (page) page.outerHTML = chooseServerView();
}

async function chooseGuild(button) {
  const guildId = button.dataset.guildSelect;
  if (guildId === currentGuild()?.id) {
    closeGuildPicker();
    return;
  }
  button.disabled = true;
  try {
    await selectGuild(guildId);
    location.reload();
  } catch (error) {
    button.disabled = false;
    notify(error.message || "That server could not be selected.", "error");
  }
}

/** Wires the sidebar header, picker dialog, and choose-a-server page. Call once. */
export function initializeGuildPicker() {
  const { backdrop } = pickerElements();
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : undefined;
    if (!target) return;
    if (target.closest("[data-guild-picker]")) return openGuildPicker();
    if (target.closest("#guildPickerClose")) return closeGuildPicker();
    const select = target.closest("[data-guild-select]");
    if (select) return void chooseGuild(select);
    const refresh = target.closest("[data-guild-refresh]");
    if (refresh) return void refreshGuildList(refresh);
    if (!backdrop.hidden && target === backdrop) closeGuildPicker();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeGuildPicker();
  });
}
