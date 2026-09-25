import { appPath, currentRoutePage, liveUrl, staticHosting } from "./config.js";
import { appVersion } from "./data.js";
import { addRoleMenuOption, adminCheck, createDiscordRole, createRoleMenu, deleteDiscordRole, deleteRoleMenu, disableRoleMenu, editDiscordRole, inspectDiscordRole, listDiscordChannels, listDiscordRoleDependencies, listDiscordRoles, listRoleMenus, loadDiscordFeature, loadHealth, loadMe, loginUrl, logout, moveDiscordRole, publishRoleMenu, saveDiscordFeature } from "./api.js";
import { loadDemoState, loadVotes, mutateDemoState, recordActivity, resetDemoState, safeLocalStorageSnapshot, saveVotes } from "./store.js";
import { liveTicketsShell, mountLiveTickets } from "./tickets.js";
import { badge, confirmAction, demoChip, escapeHtml, formData, notify, row, table, timeline } from "./ui.js";

const statuses = {
  applications: ["Submitted", "Under Review", "Interview", "Approved", "Denied"],
  tickets: ["Open", "Claimed", "Waiting", "Closed"],
  moderation: ["Active", "Revoked"],
  verification: ["Pending", "Approved", "Rejected", "More Info Requested"],
  articles: ["Draft", "Published", "Archived"],
};

let live = { available: false };
let account;

export async function refreshLiveState({ quiet = false, refreshAccount = false } = {}) {
  live = await loadHealth();
  try {
    account = await loadMe(refreshAccount);
  } catch (error) {
    account = undefined;
    if (!quiet && new URLSearchParams(location.search).has("auth")) notify(error.message, "error");
  }
  renderAccountChrome();
  return { live, account };
}

export function renderPage(page) {
  const state = loadDemoState();
  const content = document.getElementById("content");
  const title = pageTitle(page);
  document.getElementById("pageTitle").textContent = title;
  document.getElementById("breadcrumbs").textContent = `Dashboard / ${title}`;
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.page === page));
  content.innerHTML = route(page, state);
  content.focus({ preventScroll: true });
  bindPageEvents(page);
  if (page === "tickets" && account) void mountLiveTickets();
}

export function renderAccountChrome() {
  const status = document.getElementById("connectionStatus");
  const name = document.getElementById("profileName");
  const avatar = document.getElementById("profileAvatar");
  const summary = document.getElementById("profileSummary");
  status.textContent = live.available ? "Live API reachable" : "Live services are not connected yet";
  status.className = `connection-pill ${live.available ? "success" : ""}`.trim();
  const profile = account?.account;
  const banner = document.querySelector(".demo-banner");
  if (banner) banner.hidden = Boolean(profile);
  const modeCard = document.querySelector(".sidebar-card");
  if (modeCard) {
    modeCard.querySelector(".status-dot")?.classList.toggle("live", Boolean(profile));
    modeCard.querySelector(".status-dot")?.classList.toggle("demo", !profile);
    const title = modeCard.querySelector("strong");
    const text = modeCard.querySelector("p");
    if (title) title.textContent = profile ? "Live" : "Demo Mode";
    if (text) text.textContent = profile ? "Signed in with Discord. Live pages change your server." : "Product actions are browser-only until live modules are connected.";
  }
  if (profile?.username || profile?.globalName) {
    name.textContent = profile.globalName || profile.username;
    const avatarUrl = profile.avatar && /^\d{17,20}$/.test(profile.discordUserId ?? "") && /^(a_)?[0-9a-f]{32}$/.test(profile.avatar)
      ? `https://cdn.discordapp.com/avatars/${profile.discordUserId}/${profile.avatar}.png?size=64`
      : undefined;
    avatar.innerHTML = avatarUrl ? `<img alt="" src="${escapeHtml(avatarUrl)}">` : escapeHtml((profile.username || "QB").slice(0, 2).toUpperCase());
    summary.innerHTML = `<strong>${escapeHtml(name.textContent)}</strong><p class="microcopy">Signed in with Discord as platform user ${escapeHtml(profile.platformUserId)}.</p>`;
  } else {
    name.textContent = "Demo Explorer";
    avatar.textContent = "QB";
    summary.innerHTML = `<strong>Demo Mode</strong><p class="microcopy">Explore every page without authentication. Login remains available when live services are configured.</p>`;
  }
}

function route(page, state) {
  switch (page) {
    case "applications": return applicationsPage(state);
    case "discord": return discordPage(state);
    case "tickets": return ticketsPage(state);
    case "staff": return staffPage(state);
    case "moderation": return moderationPage(state);
    case "verification": return verificationPage(state);
    case "polls": return pollsPage(state);
    case "birthdays": return birthdaysPage(state);
    case "knowledge": return knowledgePage(state);
    case "fivem": return fivemPage(state);
    case "settings": return settingsPage(state);
    default: return overviewPage(state);
  }
}

function discordPage(state) {
  const tab = new URLSearchParams(location.search).get("tab") || "overview";
  const tabs = [
    ["overview", "Overview"],
    ["role-management", "Role Management"],
    ["roles", "Role Menus"],
    ["welcome", "Welcome and Goodbye"],
    ["autoroles", "Autoroles"],
    ["rules", "Rules"],
    ["counters", "Member Counters"],
    ["logs", "Server Logs"],
    ["announcements", "Embeds and Announcements"],
    ["custom", "Custom Commands"],
    ["suggestions", "Suggestions"],
    ["starboard", "Starboard"],
  ];
  return `
    ${shellIntro("Discord Bot", "Discord remains fully usable without the portal. The portal configures and manages the same underlying features. Demo sections are browser-only until their backend is implemented.")}
    <section class="discord-tabs" aria-label="Discord Bot sections">
      ${tabs.map(([id, label]) => `<a class="button compact ${tab === id ? "primary" : "ghost"}" href="${appPath(`/discord?tab=${id}`)}" data-route="discord" data-tab="${id}">${escapeHtml(label)}</a>`).join("")}
    </section>
    ${tab === "role-management" ? discordRoleManagementPage(state) : tab === "roles" ? discordRoleMenusPage(state) : discordCommunityFeaturePage(state, tab)}
  `;
}

function discordRoleManagementPage(state) {
  const roles = [...(state.discord.roles || [])].sort((left, right) => right.position - left.position);
  const selected = roles[0];
  return `
    <section class="grid main-detail role-management-grid">
      <div class="card">
        <div class="split-line"><h2>Role Catalog</h2>${badge(account ? "LIVE" : "DEMO")}</div>
        <p class="microcopy">Discord is the source for role names, hierarchy, colors, and managed status. Qbox PostgreSQL is the source for feature dependencies and audit history.</p>
        <div class="toolbar">
          <input id="roleSearch" placeholder="Search roles" aria-label="Search roles">
          <select aria-label="Filter roles"><option>All</option><option>Assignable</option><option>Blocked</option><option>Managed</option></select>
          <button class="button compact" data-action="load-live-discord-roles">Load live roles</button>
        </div>
        ${table(["Role", "Position", "Members", "Status", "Usage"], roles.map((role) => row([
          ["Role", `<span class="role-chip" style="--role-color:${escapeHtml(role.color)}"></span><strong>${escapeHtml(role.name)}</strong><small>${escapeHtml(role.id)}</small>`],
          ["Position", String(role.position)],
          ["Members", role.memberCount === undefined ? "Unavailable" : String(role.memberCount)],
          ["Status", `${badge(role.assignable ? "Assignable" : "Blocked")} ${role.managed ? badge("Managed") : ""}`],
          ["Usage", String(role.dependencyCount || 0)],
        ], `class="clickable" data-select="${role.id}"`)))}
      </div>
      <div class="card" id="detailPanel">${roleCatalogDetail(selected)}</div>
    </section>
    <section class="card readable-form">
      <h2>Create Role</h2>
      <form class="form-grid" data-action="create-discord-role">
        ${input("name", "Role name", "Community Member")}
        ${input("color", "Color", "#22c55e")}
        ${select("hoist", "Display separately", ["false", "true"], "false")}
        ${select("mentionable", "Mentionable", ["false", "true"], "false")}
        <div class="sticky-actions full"><button class="button primary">Create live role</button><span class="microcopy">Discord validates hierarchy and bot capability before saving.</span></div>
      </form>
    </section>
  `;
}

function roleCatalogDetail(role) {
  if (!role) return `<div class="empty-state">Load live roles or select a demo role.</div>`;
  return `
    <div class="detail-stack" data-detail-id="${role.id}">
      <div class="split-line"><h2><span class="role-chip" style="--role-color:${escapeHtml(role.color)}"></span>${escapeHtml(role.name)}</h2>${badge(role.assignable ? "Assignable" : "Blocked")}</div>
      <p class="microcopy">${escapeHtml(role.unavailableReason || "Role is available for permitted Qbox operations.")}</p>
      ${detail("Role ID", role.id)}
      ${detail("Color", role.color)}
      ${detail("Position", String(role.position))}
      ${detail("Member count", role.memberCount === undefined ? "Unavailable" : String(role.memberCount))}
      ${detail("Managed", role.managed ? "Yes" : "No")}
      ${detail("Hoisted", role.hoisted ? "Yes" : "No")}
      ${detail("Mentionable", role.mentionable ? "Yes" : "No")}
      ${detail("Feature dependencies", String(role.dependencyCount || 0))}
      <h3>Edit Role</h3>
      <form class="form-grid" data-action="edit-discord-role">
        ${input("name", "Role name", role.name)}
        ${input("color", "Color", role.color)}
        ${select("hoist", "Display separately", ["false", "true"], String(role.hoisted))}
        ${select("mentionable", "Mentionable", ["false", "true"], String(role.mentionable))}
        ${input("position", "Hierarchy position", String(role.position))}
        <div class="sticky-actions full">
          <button class="button primary">Save role</button>
          <button class="button" type="button" data-action="inspect-role-dependencies">Inspect dependencies</button>
          <button class="button" type="button" data-action="move-discord-role">Move</button>
          <button class="button danger" type="button" data-action="delete-discord-role">Delete</button>
        </div>
      </form>
      <div id="roleDependencies" aria-live="polite"></div>
    </div>
  `;
}

function discordCommunityFeaturePage(state, tab) {
  if (tab === "overview") return discordCatalogPage(state, tab);
  const feature = communityFeatureState(state, tab);
  return `
    <section class="grid main-detail">
      <div class="card">
        <div class="split-line"><h2>${escapeHtml(feature.title)}</h2>${badge(account ? "LIVE API when authorized" : "DEMO")}</div>
        <p class="microcopy">${escapeHtml(feature.summary)}</p>
        <div class="toolbar">
          <button class="button compact" data-action="load-live-discord-feature" data-feature="${escapeHtml(feature.path)}">Load live settings</button>
        </div>
        ${table(["Setting", "Value"], feature.rows.map(([label, value]) => row([["Setting", escapeHtml(label)], ["Value", value]])))}
      </div>
      <div class="card">
        <h2>Manage</h2>
        <form class="form-grid" data-action="save-discord-feature" data-feature="${escapeHtml(feature.path)}">
          ${feature.form}
          <button class="button primary full">Save ${escapeHtml(feature.title)}</button>
        </form>
        <h2>Live preview</h2>
        <p class="microcopy">${escapeHtml(feature.preview)}</p>
      </div>
    </section>
  `;
}

function communityFeatureState(state, tab) {
  const discord = state.discord;
  const maps = {
    welcome: {
      title: "Welcome and Goodbye",
      path: "welcome",
      summary: "Configure persistent join and leave messaging. Discord commands remain available.",
      rows: [["Welcome", badge(discord.welcomeGoodbye.welcome.enabled ? "LIVE" : "DISABLED")], ["Goodbye", badge(discord.welcomeGoodbye.goodbye.enabled ? "LIVE" : "DISABLED")], ["Welcome channel", escapeHtml(channelLabel(state, discord.welcomeGoodbye.welcome.channelId))]],
      form: `${channelSelect(state, "channelId", "Welcome channel", discord.welcomeGoodbye.welcome.channelId)}${textarea("messageText", "Welcome message", discord.welcomeGoodbye.welcome.messageText)}${select("enabled", "Enabled", ["true", "false"], String(discord.welcomeGoodbye.welcome.enabled))}`,
      preview: "Use /welcome preview or /goodbye preview in Discord for an ephemeral live preview.",
    },
    autoroles: {
      title: "Autoroles", path: "autoroles", summary: "Assign configured roles when members join.",
      rows: [["Status", badge(discord.autoroles.enabled ? "LIVE" : "DISABLED")], ["Delay", `${discord.autoroles.delaySeconds}s`], ["Roles", String(discord.autoroles.roles.length)]],
      form: `${select("enabled", "Enabled", ["true", "false"], String(discord.autoroles.enabled))}${input("delaySeconds", "Delay seconds", String(discord.autoroles.delaySeconds))}${select("includeBots", "Include bots", ["false", "true"], String(discord.autoroles.includeBots))}`,
      preview: "Use /autorole test in Discord to validate hierarchy without assigning unrelated members.",
    },
    rules: {
      title: "Rules", path: "rules", summary: "Publish a durable Accept Rules button panel.",
      rows: [["Status", badge(discord.rules.enabled ? "LIVE" : "DISABLED")], ["Channel", escapeHtml(channelLabel(state, discord.rules.channelId))], ["Accepted role", escapeHtml(roleLabel(state, discord.rules.acceptedRoleId))]],
      form: `${channelSelect(state, "channelId", "Rules channel", discord.rules.channelId)}${textarea("messageText", "Rules text", discord.rules.messageText)}${roleSelect(state, "acceptedRoleId", "Accepted role", discord.rules.acceptedRoleId)}${input("buttonLabel", "Button label", discord.rules.buttonLabel)}${select("enabled", "Enabled", ["true", "false"], String(discord.rules.enabled))}`,
      preview: "Use /rules inspect before /rules publish.",
    },
    counters: featureList("Member Counters", "counters", "Automatically rename configured counter channels.", discord.counters),
    logs: {
      title: "Server Logs", path: "logs", summary: "Route configured audit events to Discord channels.",
      rows: [["Status", badge(discord.logs.enabled ? "LIVE" : "DISABLED")], ["Events", discord.logs.events.join(", ") || "none"], ["Destinations", Object.keys(discord.logs.destinations).join(", ") || "none"]],
      form: `${select("enabled", "Enabled", ["true", "false"], String(discord.logs.enabled))}${input("events", "Events comma list", discord.logs.events.join(","))}${textarea("destinations", "Destinations JSON", JSON.stringify(discord.logs.destinations))}`,
      preview: "Use /logs test for a safe Discord-side test.",
    },
    announcements: featureList("Embeds and Announcements", "embeds", "Build reusable embed templates and preview announcements.", discord.embeds),
    custom: featureList("Custom Commands", "custom-commands", "Manage persistent grouped slash responses.", discord.customCommands),
    suggestions: featureList("Suggestions", "suggestions", "Review persistent community suggestions.", discord.suggestions),
    starboard: {
      title: "Starboard", path: "starboard", summary: "Track reaction thresholds with one entry per source message.",
      rows: [["Status", badge(discord.starboard.enabled ? "LIVE" : "DISABLED")], ["Destination", `<code>${escapeHtml(discord.starboard.destinationChannelId)}</code>`], ["Threshold", String(discord.starboard.threshold)]],
      form: `${input("destinationChannelId", "Destination channel ID", discord.starboard.destinationChannelId)}${input("emoji", "Emoji", discord.starboard.emoji)}${input("threshold", "Threshold", String(discord.starboard.threshold))}${select("enabled", "Enabled", ["true", "false"], String(discord.starboard.enabled))}`,
      preview: "Use /starboard inspect for a safe live check.",
    },
  };
  return maps[tab] ?? maps.welcome;
}

function featureList(title, path, summary, items) {
  return {
    title, path, summary,
    rows: [["Items", String(items.length)], ["Mode", items.length ? "Configured" : "Empty"]],
    form: `${input("name", "Name", `${title} Demo`)}${textarea("description", "Description", summary)}${select("enabled", "Enabled", ["true", "false"], "true")}`,
    preview: `Use /${path.split("-")[0]} inspect or list in Discord for safe live state.`,
  };
}

function discordCatalogPage(state, tab) {
  const selected = state.discord.features.find((feature) => feature.name.toLowerCase().replaceAll(" ", "-").startsWith(tab));
  return `
    <section class="grid main-detail">
      <div class="card">
        <div class="split-line"><h2>Discord feature catalog</h2>${demoChip()}</div>
        ${table(["Feature", "Status", "Control surfaces", "Notes"], state.discord.features.map((feature) => row([
          ["Feature", `<strong>${escapeHtml(feature.name)}</strong>`],
          ["Status", badge(feature.status)],
          ["Control surfaces", feature.surfaces.map((surface) => `<span class="tag">${escapeHtml(surface)}</span>`).join(" ")],
          ["Notes", escapeHtml(feature.summary)],
        ])))}
      </div>
      <div class="card">
        <h2>${escapeHtml(selected?.name ?? "Feature links")}</h2>
        <p class="microcopy">Related product pages reuse the same future platform concepts instead of duplicating workflows.</p>
        <div class="grid">
          ${quick("tickets", "Discord Tickets -> Tickets")}
          ${quick("verification", "Discord Verification -> Verification")}
          ${quick("polls", "Discord Polls -> Polls")}
          ${quick("moderation", "Discord Moderation -> Moderation")}
        </div>
      </div>
    </section>
  `;
}

function discordRoleMenusPage(state) {
  return `
    <section class="grid main-detail">
      <div class="card">
        <div class="split-line"><h2>Role Menus</h2>${badge(account ? "LIVE API when authorized" : "DEMO")}</div>
        <p class="microcopy">Buttons and select menus are preferred. Reaction roles remain available for compatibility. Demo changes stay in this browser unless live API calls are authorized.</p>
        <div class="toolbar">
          <button class="button compact" data-action="load-live-role-menus">Load live menus</button>
          <button class="button compact" data-action="load-live-discord-channels">Load live channels</button>
        </div>
        ${table(["Menu", "Status", "Channel", "Presentation", "Mode", "Options"], state.discord.roleMenus.map((menu) => row([
          ["Menu", `<strong>${escapeHtml(menu.title)}</strong><small>${escapeHtml(menu.id)}</small>`],
          ["Status", badge(menu.status)],
          ["Channel", channelLabel(state, menu.channelId)],
          ["Presentation", escapeHtml(menu.presentationType)],
          ["Mode", escapeHtml(menu.assignmentMode)],
          ["Options", String(menu.options.length)],
        ], `class="clickable" data-select="${menu.id}"`)))}
      </div>
      <div class="card" id="detailPanel">${roleMenuDetail(state.discord.roleMenus[0])}</div>
    </section>
    <section class="card">
      <h2>Create role menu</h2>
      <form class="form-grid" data-action="create-role-menu">
        ${input("title", "Title", "Notification Roles")}
        ${channelSelect(state, "channelId", "Discord channel", "1262656532902842423")}
        ${select("presentationType", "Presentation", ["BUTTONS", "SELECT_MENU", "REACTIONS"])}
        ${select("assignmentMode", "Assignment mode", ["TOGGLE", "ADD_ONLY", "REMOVE_ONLY", "EXCLUSIVE"])}
        ${textarea("description", "Description", "Choose the Discord roles you want.")}
        <button class="button primary full">Create role-menu draft</button>
      </form>
    </section>
  `;
}

function roleMenuDetail(menu) {
  if (!menu) return `<div class="empty-state">Select a role menu.</div>`;
  return `
    <div class="detail-stack" data-detail-id="${menu.id}">
      <div class="split-line"><h2>${escapeHtml(menu.title)}</h2>${badge(menu.status)}</div>
      ${detail("Guild", menu.guildId)}
      ${detail("Channel", channelLabel(loadDemoState(), menu.channelId))}
      ${detail("Message", menu.messageId ? `https://discord.com/channels/${menu.guildId}/${menu.channelId}/${menu.messageId}` : "Not published")}
      ${detail("Presentation", menu.presentationType)}
      ${detail("Mode", menu.assignmentMode)}
      <h3>Options</h3>
      <ul class="list">${menu.options.map((option) => `<li><strong>${escapeHtml(option.label)}</strong><small>${escapeHtml(option.emoji || "No emoji")} - role ${escapeHtml(option.roleId)}</small></li>`).join("") || "<li>No options yet.</li>"}</ul>
      <form class="form-grid" data-action="add-role-menu-option">
        ${roleSelect(loadDemoState(), "roleId", "Role", "1262656532902842429")}
        ${input("label", "Label", "Announcements")}
        ${input("emoji", "Emoji", "Bell")}
        <button class="button full">Add option</button>
      </form>
      <div class="toolbar">
        <button class="button" data-action="publish-role-menu">Publish/republish demo</button>
        <button class="button" data-action="disable-role-menu">Disable</button>
        <button class="button danger" data-action="delete-role-menu">Delete</button>
      </div>
      <h3>Status history</h3>${timeline(menu.history)}
    </div>
  `;
}

function shellIntro(title, description) {
  return `<section class="feature-hero"><div class="page-header"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p></div>${demoChip()}</div></section>`;
}

function overviewPage(state) {
  const openTickets = state.tickets.filter((ticket) => ticket.status !== "Closed").length;
  const pendingApplications = state.applications.filter((app) => !["Approved", "Denied"].includes(app.status)).length;
  const pendingVerifications = state.verification.filter((item) => item.status === "Pending").length;
  const activePolls = state.polls.filter((poll) => poll.open).length;
  return `
    ${shellIntro("Community control panel", "Explore the planned QboxPlatform management experience. Sample values are deterministic demo data and do not represent live Discord, FiveM, or PostgreSQL state.")}
    <section class="grid cols-4">
      ${metric("Server status", state.fivem.online ? "Online" : "Offline", "Demo indicator, no FiveM command executed.")}
      ${metric("Discord community", "2,418", "Demo members • 143 online")}
      ${metric("FiveM server", `${state.fivem.players.length}/${state.fivem.capacity}`, "Demo player list")}
      ${metric("Staff available", state.staff.filter((s) => s.availability === "Available").length, "Demo availability")}
    </section>
    <section class="grid cols-4">
      ${metric("Pending applications", pendingApplications, "Review queue")}
      ${metric("Open tickets", openTickets, "Support workload")}
      ${metric("Pending verifications", pendingVerifications, "Identity queue")}
      ${metric("Active polls", activePolls, "Community feedback")}
    </section>
    <section class="grid main-detail">
      <div class="card">
        <div class="split-line"><h2>Recent activity</h2>${demoChip()}</div>
        ${timeline(state.activity)}
      </div>
      <div class="card">
        <h2>Quick actions</h2>
        <p class="microcopy">These shortcuts open demo workflows only.</p>
        <div class="grid">
          ${quick("applications", "Review applications")}
          ${quick("tickets", "Create support ticket")}
          ${quick("verification", "Open verification queue")}
          ${quick("fivem", "Inspect FiveM concept")}
        </div>
      </div>
    </section>
  `;
}

function applicationsPage(state) {
  const rows = state.applications.map((item) => row([
    ["ID", `<strong>${escapeHtml(item.id)}</strong>`],
    ["Applicant", escapeHtml(item.applicant)],
    ["Type", escapeHtml(item.type)],
    ["Status", badge(item.status)],
    ["Reviewer", escapeHtml(item.reviewer)],
  ], `class="clickable" data-select="${item.id}"`));
  return `
    ${shellIntro("Applications", "Review candidate submissions, templates, reviewers, notes, and status history in browser-only demo mode.")}
    <section class="grid main-detail">
      <div class="card">
        ${toolbar("Search applications", "appSearch", statuses.applications)}
        ${table(["ID", "Applicant", "Type", "Status", "Reviewer"], rows)}
      </div>
      <div class="card" id="detailPanel">${applicationDetail(state.applications[0])}</div>
    </section>
    <section class="card">
      <h2>Create sample application</h2>
      <form class="form-grid" data-action="create-application">
        ${input("applicant", "Applicant name", "Avery Demo")}
        ${input("type", "Application template", "Civilian")}
        ${select("reviewer", "Reviewer", state.staff.map((s) => s.name))}
        ${textarea("notes", "Internal review notes", "Created from the product showcase.")}
        <button class="button primary full">Submit sample application</button>
      </form>
    </section>
  `;
}

function applicationDetail(item) {
  if (!item) return `<div class="empty-state">Select an application.</div>`;
  return `
    <div class="detail-stack" data-detail-id="${item.id}">
      <div class="split-line"><h2>${escapeHtml(item.applicant)}</h2>${badge(item.status)}</div>
      ${detail("Application ID", item.id)}
      ${detail("Template", item.type)}
      ${detail("Reviewer", item.reviewer)}
      <label>Status<select data-action="application-status">${statuses.applications.map((status) => option(status, item.status)).join("")}</select></label>
      <label>Internal notes<textarea data-action="application-notes">${escapeHtml(item.notes)}</textarea></label>
      <button class="button" data-action="save-application">Save demo changes</button>
      <button class="button danger" data-action="delete-application">Delete with confirmation</button>
      <h3>Status history</h3>${timeline(item.history)}
    </div>
  `;
}

function ticketsPage(state) {
  if (account) return liveTicketsShell();
  const rows = state.tickets.map((item) => row([
    ["Ticket", `<strong>${escapeHtml(item.id)}</strong>`],
    ["Subject", escapeHtml(item.subject)],
    ["Category", escapeHtml(item.category)],
    ["Priority", badge(item.priority)],
    ["Status", badge(item.status)],
    ["Assignee", escapeHtml(item.assignee)],
  ], `class="clickable" data-select="${item.id}"`));
  return `
    ${shellIntro("Tickets", staticHosting() ? "Demo Mode preview. Open the live platform and log in with Discord to manage real tickets." : "Demo Mode. Log in with Discord to manage real tickets from your server.")}
    <section class="grid main-detail"><div class="card">${toolbar("Search tickets", "ticketSearch", statuses.tickets)}${table(["Ticket", "Subject", "Category", "Priority", "Status", "Assignee"], rows)}</div><div class="card" id="detailPanel">${ticketDetail(state.tickets[0])}</div></section>
    <section class="card"><h2>Create ticket</h2><form class="form-grid" data-action="create-ticket">${input("subject", "Subject", "Demo support request")}${select("category", "Category", ["Support", "Discord", "FiveM", "Billing"])}${select("priority", "Priority", ["Low", "Medium", "High"])}${select("assignee", "Assign staff", ["Unassigned", ...state.staff.map((s) => s.name)])}<button class="button primary full">Create demo ticket</button></form></section>
  `;
}

function ticketDetail(item) {
  if (!item) return `<div class="empty-state">Select a ticket.</div>`;
  return `<div class="detail-stack" data-detail-id="${item.id}"><div class="split-line"><h2>${escapeHtml(item.subject)}</h2>${badge(item.status)}</div>${detail("Category", item.category)}${detail("Priority", item.priority)}${detail("Assignee", item.assignee)}<label>Status<select data-action="ticket-status">${statuses.tickets.map((status) => option(status, item.status)).join("")}</select></label><label>Add message<textarea data-action="ticket-message" placeholder="Demo conversation message"></textarea></label><button class="button" data-action="save-ticket">Save ticket update</button><button class="button" data-action="reopen-ticket">Reopen ticket</button><h3>Conversation</h3><ul class="list">${item.messages.map((m) => `<li><strong>${escapeHtml(m.author)}</strong><small>${escapeHtml(m.body)}</small></li>`).join("")}</ul><h3>Activity history</h3>${timeline(item.history)}</div>`;
}

function staffPage(state) {
  const rows = state.staff.map((item) => row([
    ["Name", `<strong>${escapeHtml(item.name)}</strong>`],
    ["Role", escapeHtml(item.role)],
    ["Department", escapeHtml(item.department)],
    ["Availability", badge(item.availability)],
    ["Activity", `${item.score}%`],
  ], `class="clickable" data-select="${item.id}"`));
  return `${shellIntro("Staff", "Inspect staff profiles, availability, permissions, notes, and demo promote/demote actions.")}<section class="grid main-detail"><div class="card">${toolbar("Search staff", "staffSearch", ["Available", "Busy", "Away"])}${table(["Name", "Role", "Department", "Availability", "Activity"], rows)}</div><div class="card" id="detailPanel">${staffDetail(state.staff[0])}</div></section>`;
}

function staffDetail(item) {
  if (!item) return `<div class="empty-state">Select staff.</div>`;
  return `<div class="detail-stack" data-detail-id="${item.id}"><div class="split-line"><h2>${escapeHtml(item.name)}</h2>${badge(item.availability)}</div>${detail("Discord role", item.role)}${detail("Department", item.department)}${detail("Joined", item.joined)}${detail("Performance summary", `${item.score}% demo activity score`)}${detail("Warnings", item.warnings)}<label>Internal notes<textarea data-action="staff-notes">${escapeHtml(item.notes)}</textarea></label><div><strong>Permission summary</strong><p>${item.permissions.map((p) => `<span class="tag">${escapeHtml(p)}</span>`).join(" ")}</p></div><button class="button" data-action="promote-staff">Demo promote</button><button class="button" data-action="demote-staff">Demo demote</button><button class="button" data-action="save-staff">Save notes</button></div>`;
}

function moderationPage(state) {
  const rows = state.moderation.map((item) => row([
    ["Case", `<strong>${escapeHtml(item.id)}</strong>`],
    ["User", escapeHtml(item.subject)],
    ["Action", badge(item.action)],
    ["Reason", escapeHtml(item.reason)],
    ["Status", badge(item.status)],
  ], `class="clickable" data-select="${item.id}"`));
  return `${shellIntro("Moderation", "Create and revoke demo moderation cases. No Discord or FiveM moderation action is sent.")}<section class="grid main-detail"><div class="card">${table(["Case", "User", "Action", "Reason", "Status"], rows)}</div><div class="card" id="detailPanel">${moderationDetail(state.moderation[0])}</div></section><section class="card"><h2>Create moderation case</h2><form class="form-grid" data-action="create-case">${input("subject", "User identifier", "discord:demo-user")}${select("action", "Action", ["Note", "Warning", "Mute", "Kick", "Ban"])}${input("moderator", "Moderator", "Aria Stone")}${input("expiration", "Expiration", "")}${textarea("reason", "Reason", "Demo moderation reason")}${input("evidence", "Evidence link", "https://example.com/evidence")}<button class="button primary full">Create demo case</button></form></section>`;
}

function moderationDetail(item) {
  if (!item) return `<div class="empty-state">Select a case.</div>`;
  return `<div class="detail-stack" data-detail-id="${item.id}"><div class="split-line"><h2>${escapeHtml(item.id)}</h2>${badge(item.status)}</div>${detail("User identifier", item.subject)}${detail("Action", item.action)}${detail("Reason", item.reason)}${detail("Moderator", item.moderator)}${detail("Expiration", item.expiration || "None")}<button class="button danger" data-action="revoke-case">Revoke action in demo mode</button><h3>Case history</h3>${timeline(item.history)}</div>`;
}

function verificationPage(state) {
  const rows = state.verification.map((item) => row([
    ["ID", `<strong>${escapeHtml(item.id)}</strong>`],
    ["Member", escapeHtml(item.member)],
    ["Risk", badge(item.risk)],
    ["Status", badge(item.status)],
    ["Roles", item.roles.map((role) => `<span class="tag">${escapeHtml(role)}</span>`).join(" ")],
  ], `class="clickable" data-select="${item.id}"`));
  return `${shellIntro("Verification", "Review submitted answers, risk indicators, intended Discord roles, and audit history in demo mode.")}<section class="grid main-detail"><div class="card">${table(["ID", "Member", "Risk", "Status", "Roles"], rows)}</div><div class="card" id="detailPanel">${verificationDetail(state.verification[0])}</div></section>`;
}

function verificationDetail(item) {
  if (!item) return `<div class="empty-state">Select a verification.</div>`;
  return `<div class="detail-stack" data-detail-id="${item.id}"><div class="split-line"><h2>${escapeHtml(item.member)}</h2>${badge(item.status)}</div>${detail("Risk", item.risk)}<div><strong>Submitted answers</strong><ul class="list">${item.answers.map((answer) => `<li>${escapeHtml(answer)}</li>`).join("")}</ul></div><div><strong>Intended Discord roles preview</strong><p>${item.roles.map((role) => `<span class="tag">${escapeHtml(role)}</span>`).join(" ")}</p></div><button class="button" data-action="approve-verification">Approve</button><button class="button danger" data-action="reject-verification">Reject</button><button class="button" data-action="more-info-verification">Request more information</button><h3>Verification audit history</h3>${timeline(item.history)}</div>`;
}

function pollsPage(state) {
  const votes = loadVotes();
  return `${shellIntro("Polls", "Create polls, vote once per browser, and inspect result bars with local demo state.")}<section class="grid cols-2">${state.polls.map((poll) => pollCard(poll, votes[poll.id])).join("")}</section><section class="card"><h2>Create poll</h2><form class="form-grid" data-action="create-poll">${input("question", "Question", "What should QboxPlatform show next?")}${input("options", "Options, comma separated", "Events, Tickets, Staff tools")}${input("endsAt", "Optional end time", "2026-08-15T20:00")}${select("anonymous", "Anonymous", ["Yes", "No"])}<button class="button primary full">Create demo poll</button></form></section>`;
}

function pollCard(poll, votedOption) {
  const total = poll.options.reduce((sum, option) => sum + option.votes, 0) || 1;
  return `<article class="card" data-detail-id="${poll.id}"><div class="split-line"><h2>${escapeHtml(poll.question)}</h2>${badge(poll.open ? "Open" : "Closed")}</div><p class="microcopy">${poll.anonymous ? "Anonymous" : "Public"} demo poll • Ends ${escapeHtml(poll.endsAt || "manually")}</p>${poll.options.map((option) => `<div><div class="split-line"><span>${escapeHtml(option.label)}</span><strong>${option.votes}</strong></div><div class="progress"><span style="width:${Math.round((option.votes / total) * 100)}%"></span></div><button class="button compact" data-action="vote-poll" data-option="${escapeHtml(option.id)}" ${!poll.open || votedOption ? "disabled" : ""}>${votedOption === option.id ? "Voted" : "Vote"}</button></div>`).join("")}<div class="toolbar"><button class="button" data-action="toggle-poll">${poll.open ? "Close" : "Reopen"}</button></div></article>`;
}

function birthdaysPage(state) {
  return `${shellIntro("Birthdays", "Manage birthday reminders, privacy, and announcement previews in local demo mode.")}<section class="grid main-detail"><div class="card"><h2>Upcoming birthdays</h2>${table(["Name", "Date", "Year privacy", "Preview", "Action"], state.birthdays.map((item) => row([["Name", escapeHtml(item.name)], ["Date", escapeHtml(item.date)], ["Year privacy", item.showYear ? "Year visible" : "Year hidden"], ["Preview", escapeHtml(item.announcement)], ["Action", `<button class="button compact danger" data-action="remove-birthday" data-id="${item.id}">Remove</button>`]])))}</div><div class="card"><h2>Add birthday</h2><form class="form-grid" data-action="add-birthday">${input("name", "Name", "Avery")}${input("date", "MM-DD", "08-25")}${select("showYear", "Show birth year", ["No", "Yes"])}<button class="button primary full">Add birthday</button></form></div></section>${calendar(state.birthdays)}`;
}

function knowledgePage(state) {
  return `${shellIntro("Knowledge Base", "Search, draft, edit, publish, and archive articles. Changes remain in browser storage.")}<section class="grid main-detail"><div class="card">${toolbar("Search articles", "articleSearch", statuses.articles)}${table(["ID", "Title", "Category", "Status", "Tags"], state.articles.map((item) => row([["ID", `<strong>${escapeHtml(item.id)}</strong>`], ["Title", escapeHtml(item.title)], ["Category", escapeHtml(item.category)], ["Status", badge(item.status)], ["Tags", item.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join(" ")]], `class="clickable" data-select="${item.id}"`)))}</div><div class="card" id="detailPanel">${articleDetail(state.articles[0])}</div></section><section class="card"><h2>Create article</h2><form class="form-grid" data-action="create-article">${input("title", "Title", "New demo guide")}${input("category", "Category", "Public")}${input("tags", "Tags", "demo, guide")}${select("status", "Status", statuses.articles)}${textarea("body", "Article body", "Draft article content.")}<button class="button primary full">Create article</button></form></section>`;
}

function articleDetail(item) {
  if (!item) return `<div class="empty-state">Select an article.</div>`;
  return `<div class="detail-stack" data-detail-id="${item.id}"><div class="split-line"><h2>${escapeHtml(item.title)}</h2>${badge(item.status)}</div>${detail("Category", item.category)}${detail("Recent edit", item.edited)}<label>Status<select data-action="article-status">${statuses.articles.map((status) => option(status, item.status)).join("")}</select></label><label>Article preview<textarea data-action="article-body">${escapeHtml(item.body)}</textarea></label><button class="button" data-action="save-article">Save article</button></div>`;
}

function fivemPage(state) {
  const server = state.fivem;
  return `${shellIntro("FiveM Server", "Concept controls are visibly demo-only. No live FiveM commands are executed from this interface.")}<section class="grid cols-3">${metric("Server indicator", server.online ? "Online" : "Offline", "Demo status only")}${metric("Players", `${server.players.length}/${server.capacity}`, "Sample player list")}${metric("Resources", server.resources.length, "Demo resources")}</section><section class="grid main-detail"><div class="card"><h2>Players</h2>${table(["ID", "Name", "Ping", "Job"], server.players.map((p) => row([["ID", escapeHtml(p.id)], ["Name", escapeHtml(p.name)], ["Ping", `${p.ping}ms`], ["Job", escapeHtml(p.job)]])))}<h2>Recent joins</h2><ul class="list">${server.recentJoins.map((join) => `<li>${escapeHtml(join)}</li>`).join("")}</ul></div><div class="card"><h2>Demo controls</h2><p class="microcopy">These buttons update demo activity only.</p><label>Announcement composer<textarea data-action="fivem-announcement">Server restart reminder in 15 minutes.</textarea></label><button class="button" data-action="send-announcement">Preview announcement</button><button class="button danger" data-action="restart-server">Restart server (Demo only)</button><h3>Resources</h3>${server.resources.map((r) => `<div class="detail-row"><span>${escapeHtml(r.name)}</span>${badge(r.status)} <button class="button compact" data-action="toggle-resource" data-resource="${escapeHtml(r.name)}">Toggle demo</button></div>`).join("")}<h3>Whitelist lookup</h3>${table(["Subject", "Status"], server.whitelist.map((w) => row([["Subject", escapeHtml(w.subject)], ["Status", badge(w.status)]])))}</div></section>`;
}

function settingsPage(state) {
  const storageKeys = safeLocalStorageSnapshot();
  return `${shellIntro("Settings", "Configure demo preferences, inspect live-service status, and reset browser-only data.")}<section class="grid cols-2"><div class="card"><h2>Demo Mode</h2>${detail("Status", "Active for product module pages")}${detail("Stored keys", storageKeys.join(", ") || "None")}${detail("Public version", appVersion)}<button class="button danger" data-action="reset-demo">Reset Demo Data</button></div><div class="card"><h2>Live services</h2>${detail("API connection", live.available ? "Reachable" : "Live services are not connected yet")}${detail("Discord authentication", account ? "Authenticated" : "Not authenticated")}${staticHosting() ? `${detail("Hosting", "GitHub Pages preview (Demo Mode)")}${liveUrl() ? `<a class="button primary" href="${escapeHtml(liveUrl())}/">Open live platform</a>` : ""}` : `${detail("Health", "/health/live and /health/ready are served by the Qbox API")}<a class="button" href="${appPath("/health/live")}" target="_blank" rel="noreferrer">Open liveness</a><a class="button" href="${appPath("/health/ready")}" target="_blank" rel="noreferrer">Open readiness</a>`}</div><div class="card"><h2>Preferences</h2><form class="form-grid" data-action="save-settings">${select("theme", "Theme", ["Dark"], state.settings.theme === "dark" ? "Dark" : "Dark")}${select("notifications", "Notifications", ["On", "Off"], state.settings.notifications ? "On" : "Off")}<button class="button primary full">Save preferences</button></form></div><div class="card"><h2>Account</h2><p class="microcopy">Discord login remains available but is not required to explore Demo Mode.</p><a class="button primary" href="${loginUrl()}">Login with Discord</a><button class="button danger" data-action="logout">Logout</button></div></section>`;
}

function bindPageEvents(page) {
  document.querySelectorAll("[data-select]").forEach((row) => row.addEventListener("click", () => selectDetail(page, row.dataset.select)));
  document.querySelectorAll(".toolbar").forEach((toolbarElement) => bindToolbar(toolbarElement));
  document.querySelectorAll("form[data-action]").forEach((form) => form.addEventListener("submit", (event) => handleForm(event, form.dataset.action)));
  document.querySelectorAll("[data-action]").forEach((button) => {
    if (button.tagName !== "FORM") button.addEventListener("click", () => handleAction(button.dataset.action, button));
  });
}

function bindToolbar(toolbarElement) {
  const input = toolbarElement.querySelector("input");
  const selectElement = toolbarElement.querySelector("select");
  const tableElement = toolbarElement.parentElement.querySelector("table");
  if (!tableElement) return;
  const apply = () => {
    const query = input?.value.trim().toLowerCase() ?? "";
    const filter = selectElement?.value ?? "All";
    tableElement.querySelectorAll("tbody tr").forEach((tr) => {
      const text = tr.textContent.toLowerCase();
      const matchesQuery = !query || text.includes(query);
      const matchesFilter = filter === "All" || text.includes(filter.toLowerCase());
      tr.hidden = !(matchesQuery && matchesFilter);
    });
  };
  input?.addEventListener("input", apply);
  selectElement?.addEventListener("change", apply);
}

function selectDetail(page, id) {
  const state = loadDemoState();
  const panel = document.getElementById("detailPanel");
  if (!panel) return;
  const discordTab = new URLSearchParams(location.search).get("tab") || "overview";
  const maps = {
    applications: () => applicationDetail(state.applications.find((i) => i.id === id)),
    tickets: () => ticketDetail(state.tickets.find((i) => i.id === id)),
    staff: () => staffDetail(state.staff.find((i) => i.id === id)),
    moderation: () => moderationDetail(state.moderation.find((i) => i.id === id)),
    verification: () => verificationDetail(state.verification.find((i) => i.id === id)),
    knowledge: () => articleDetail(state.articles.find((i) => i.id === id)),
    discord: () => discordTab === "role-management"
      ? roleCatalogDetail(state.discord.roles.find((i) => i.id === id))
      : roleMenuDetail(state.discord.roleMenus.find((i) => i.id === id)),
  };
  panel.innerHTML = maps[page]?.() || "";
  bindPageEvents(page);
}

async function handleForm(event, action) {
  event.preventDefault();
  const data = formData(event.currentTarget);
  if (action === "save-discord-feature") {
    return saveDiscordFeatureForm(event.currentTarget.dataset.feature, data);
  }
  const state = mutateDemoState((draft) => {
    if (action === "create-application") {
      draft.applications.unshift({ id: `APP-${1000 + draft.applications.length + 1}`, applicant: data.applicant, type: data.type, status: "Submitted", reviewer: data.reviewer, notes: data.notes, submitted: "Today", history: [{ at: "Just now", action: "Submitted in Demo Mode" }] });
      recordActivity(draft, `Application created for ${data.applicant}`, "Applications");
    }
    if (action === "create-ticket") {
      draft.tickets.unshift({ id: `TCK-${104 + draft.tickets.length}`, subject: data.subject, category: data.category, priority: data.priority, status: "Open", assignee: data.assignee, messages: [{ author: "Requester", body: "Created in Demo Mode." }], history: [{ at: "Just now", action: "Ticket opened" }] });
      recordActivity(draft, `Ticket created: ${data.subject}`, "Tickets");
    }
    if (action === "create-case") {
      draft.moderation.unshift({ id: `MOD-${220 + draft.moderation.length}`, subject: data.subject, action: data.action, reason: data.reason, moderator: data.moderator, expiration: data.expiration, evidence: data.evidence ? [data.evidence] : [], status: "Active", history: [{ at: "Just now", action: `${data.action} recorded in Demo Mode` }] });
      recordActivity(draft, `Moderation case created for ${data.subject}`, "Moderation");
    }
    if (action === "create-poll") {
      draft.polls.unshift({ id: `POL-${410 + draft.polls.length}`, question: data.question, options: String(data.options).split(",").map((label, index) => ({ id: `new-${Date.now()}-${index}`, label: label.trim(), votes: 0 })).filter((o) => o.label), anonymous: data.anonymous === "Yes", endsAt: data.endsAt, open: true });
      recordActivity(draft, `Poll created: ${data.question}`, "Polls");
    }
    if (action === "add-birthday") {
      draft.birthdays.push({ id: `BD-${501 + draft.birthdays.length}`, name: data.name, date: data.date, showYear: data.showYear === "Yes", announcement: `Happy birthday, ${data.name}!` });
      recordActivity(draft, `Birthday added for ${data.name}`, "Birthdays");
    }
    if (action === "create-article") {
      draft.articles.unshift({ id: `KB-${700 + draft.articles.length}`, title: data.title, category: data.category, summary: String(data.body).slice(0, 90), status: data.status, tags: String(data.tags).split(",").map((tag) => tag.trim()).filter(Boolean), body: data.body, edited: "Just now" });
      recordActivity(draft, `Article created: ${data.title}`, "Knowledge Base");
    }
    if (action === "create-role-menu") {
      draft.discord.roleMenus.unshift({ id: `RM-${200 + draft.discord.roleMenus.length}`, title: data.title, description: data.description, status: "DRAFT", guildId: "1257928923048837201", channelId: data.channelId, messageId: "", presentationType: data.presentationType, assignmentMode: data.assignmentMode, revision: 1, lastOperationSource: "WEB", options: [], history: [{ at: "Just now", action: "Role-menu draft created in Demo Mode" }] });
      recordActivity(draft, `Role menu created: ${data.title}`, "Discord Bot");
    }
    if (action === "create-discord-role") {
      const role = { id: `ROLE-${Date.now()}`, guildId: "1257928923048837201", name: data.name, color: data.color, position: draft.discord.roles.length + 1, hoisted: data.hoist === "true", mentionable: data.mentionable === "true", managed: false, memberCount: 0, assignable: true, editable: true, deletable: true, dependencyCount: 0 };
      draft.discord.roles.unshift(role);
      recordActivity(draft, `Role created: ${data.name}`, "Discord Bot");
      if (account) void createDiscordRole({ name: data.name, color: data.color, hoist: data.hoist === "true", mentionable: data.mentionable === "true" }).then(loadLiveDiscordRoles).catch((error) => notify(error.message || "Live role create unavailable. Demo state updated only.", "warning"));
    }
    if (action === "edit-discord-role") {
      const id = event.currentTarget.closest("[data-detail-id]")?.dataset.detailId;
      const role = draft.discord.roles.find((candidate) => candidate.id === id);
      if (role) {
        role.name = data.name;
        role.color = data.color;
        role.hoisted = data.hoist === "true";
        role.mentionable = data.mentionable === "true";
        role.position = Number(data.position);
        recordActivity(draft, `Role edited: ${data.name}`, "Discord Bot");
        if (account) void editDiscordRole(id, { name: data.name, color: data.color, hoist: data.hoist === "true", mentionable: data.mentionable === "true", position: Number(data.position) }).then(loadLiveDiscordRoles).catch((error) => notify(error.message || "Live role edit unavailable. Demo state updated only.", "warning"));
      }
    }
    if (action === "add-role-menu-option") {
      const id = event.currentTarget.closest("[data-detail-id]")?.dataset.detailId;
      const menu = draft.discord.roleMenus.find((candidate) => candidate.id === id);
      if (menu) {
        menu.options.push({ id: `RM-OPT-${Date.now()}`, roleId: data.roleId, label: data.label, emoji: data.emoji, description: `${data.label} demo option.` });
        menu.status = "DRAFT";
        menu.history.unshift({ at: "Just now", action: `Option added for role ${data.roleId}` });
        recordActivity(draft, `Role-menu option added to ${menu.title}`, "Discord Bot");
        if (account) void addRoleMenuOption(menu.id, { roleId: data.roleId, label: data.label, emoji: data.emoji, expectedRevision: menu.revision }).catch((error) => notify(error.message || "Live option add unavailable. Demo state updated only.", "warning"));
      }
    }
    if (action === "save-settings") {
      draft.settings.theme = "dark";
      draft.settings.notifications = data.notifications === "On";
    }
  });
  notify("Demo changes saved in this browser.");
  renderPage(currentPage());
  return state;
}

async function saveDiscordFeatureForm(feature, data) {
  const state = loadDemoState();
  const payload = discordFeaturePayload(state.discord, feature, data);
  if (!payload) return notify("This form remains in Demo Mode until its live editor is connected.", "warning");
  if (!account) return notify("Login with Discord to save this configuration through the live API.", "warning");
  try {
    const result = await saveDiscordFeature(feature, payload);
    mutateDemoState((draft) => applyCommunitySettings(draft.discord, result.data));
    notify("Live Discord configuration saved.", "success");
    renderPage("discord");
  } catch (error) {
    notify(error.message || "Live save failed.", "warning");
  }
}

function discordFeaturePayload(discord, feature, data) {
  if (feature === "autoroles") {
    return {
      enabled: data.enabled === "true",
      delaySeconds: Number(data.delaySeconds),
      includeBots: data.includeBots === "true",
      expectedRevision: discord.autoroles.revision ?? 1,
    };
  }
  if (feature === "rules") {
    return {
      enabled: data.enabled === "true",
      channelId: data.channelId,
      messageText: data.messageText,
      buttonLabel: data.buttonLabel,
      acceptedRoleId: data.acceptedRoleId,
      expectedRevision: discord.rules.revision ?? 1,
    };
  }
  return undefined;
}

async function handleAction(action, element) {
  const id = element.closest("[data-detail-id]")?.dataset.detailId || element.dataset.id;
  if (action === "logout") return logout().then(() => notify("Logged out."), (error) => notify(error.message, "warning"));
  if (action === "reset-demo") {
    if (await confirmAction({ title: "Reset Demo Data", body: "This clears only Qbox demo localStorage data in this browser.", confirmText: "Reset" })) {
      resetDemoState();
      notify("Demo data reset.");
      renderPage("settings");
    }
    return;
  }
  if (action === "vote-poll") return votePoll(id, element.dataset.option);
  if (action === "toggle-poll") return mutateAndRender((s) => { const poll = s.polls.find((p) => p.id === id); poll.open = !poll.open; recordActivity(s, `${poll.question} ${poll.open ? "reopened" : "closed"}`, "Polls"); });
  if (action === "remove-birthday") return confirmThen("Remove Birthday", "This removes a demo birthday from this browser only.", () => mutateAndRender((s) => { s.birthdays = s.birthdays.filter((b) => b.id !== id); recordActivity(s, "Birthday removed", "Birthdays"); }));
  if (action === "restart-server") return confirmThen("Demo Restart", "This records a demo activity item only. No FiveM server command is sent.", () => mutateAndRender((s) => recordActivity(s, "FiveM restart demo action previewed", "FiveM")));
  if (action === "send-announcement") return mutateAndRender((s) => { s.fivem.announcements.unshift(value("[data-action='fivem-announcement']")); recordActivity(s, "FiveM announcement preview saved", "FiveM"); });
  if (action === "load-live-role-menus") return loadLiveRoleMenus();
  if (action === "load-live-discord-roles") return loadLiveDiscordRoles();
  if (action === "load-live-discord-channels") return loadLiveDiscordChannels();
  if (action === "inspect-role-dependencies") return loadRoleDependencies(id);
  if (action === "move-discord-role") return moveRoleFromForm(id);
  if (action === "delete-discord-role") return deleteRoleFromDetail(id);
  if (action === "load-live-discord-feature") return loadLiveDiscordFeature(element.dataset.feature);
  if (action === "publish-role-menu") return updateRoleMenu(action, id);
  if (action === "disable-role-menu") return updateRoleMenu(action, id);
  if (action === "delete-role-menu") return updateRoleMenu(action, id);
  if (action === "toggle-resource") return mutateAndRender((s) => { const r = s.fivem.resources.find((resource) => resource.name === element.dataset.resource); r.status = r.status === "Running" ? "Stopped" : "Running"; recordActivity(s, `${r.name} toggled in Demo Mode`, "FiveM"); });
  if (["approve-verification", "reject-verification", "more-info-verification"].includes(action)) return updateVerification(action, id);
  if (["promote-staff", "demote-staff", "save-staff"].includes(action)) return updateStaff(action, id);
  if (["revoke-case"].includes(action)) return confirmThen("Revoke demo case", "This changes demo case status only.", () => mutateAndRender((s) => { const item = s.moderation.find((i) => i.id === id); item.status = "Revoked"; item.history.unshift({ at: "Just now", action: "Revoked in Demo Mode" }); }));
  if (["save-application", "delete-application"].includes(action)) return updateApplication(action, id);
  if (["save-ticket", "reopen-ticket"].includes(action)) return updateTicket(action, id);
  if (action === "save-article") return mutateAndRender((s) => { const item = s.articles.find((i) => i.id === id); item.status = value("[data-action='article-status']"); item.body = value("[data-action='article-body']"); item.edited = "Just now"; recordActivity(s, `Article updated: ${item.title}`, "Knowledge Base"); });
}

async function loadLiveDiscordFeature(feature) {
  try {
    const result = await loadDiscordFeature(feature);
    mutateDemoState((draft) => applyCommunitySettings(draft.discord, result.data));
    notify("Live Discord feature settings loaded.", "success");
    renderPage("discord");
  } catch (error) {
    notify(error.message || "Live feature settings unavailable. Demo Mode remains usable.", "warning");
  }
}

function applyCommunitySettings(discord, settings) {
  if (settings.welcome || settings.goodbye) discord.welcomeGoodbye = { welcome: settings.welcome || discord.welcomeGoodbye.welcome, goodbye: settings.goodbye || discord.welcomeGoodbye.goodbye };
  if (settings.autoroles) discord.autoroles = settings.autoroles;
  if (settings.rules) discord.rules = settings.rules;
  if (settings.counters) discord.counters = settings.counters;
  if (settings.logs) discord.logs = settings.logs;
  if (settings.embedTemplates) discord.embeds = settings.embedTemplates;
  if (settings.customCommands) discord.customCommands = settings.customCommands;
  if (settings.suggestions) discord.suggestions = settings.suggestions;
  if (settings.starboard) discord.starboard = settings.starboard;
}

async function loadLiveRoleMenus() {
  try {
    const result = await listRoleMenus();
    mutateDemoState((draft) => {
      draft.discord.roleMenus = result.data.map((menu) => ({
        id: menu.id,
        title: menu.title,
        description: menu.description || "",
        status: menu.status,
        guildId: menu.guildId,
        channelId: menu.channelId,
        messageId: menu.messageId || "",
        presentationType: menu.presentationType,
        assignmentMode: menu.assignmentMode,
        options: menu.options,
        revision: menu.revision,
        lastOperationSource: menu.lastOperationSource,
        history: [{ at: "Live API", action: "Loaded from persistent role-menu service" }],
      }));
      recordActivity(draft, "Live role menus loaded from API", "Discord Bot");
    });
    notify("Live role menus loaded.", "success");
    renderPage("discord");
  } catch (error) {
    notify(error.message || "Live role menus unavailable. Demo Mode remains usable.", "warning");
  }
}

async function loadLiveDiscordRoles() {
  try {
    const result = await listDiscordRoles();
    mutateDemoState((draft) => {
      draft.discord.roles = result.data.map((role) => ({
        id: role.id,
        guildId: role.guildId,
        name: role.name,
        color: role.color,
        position: role.position,
        hoisted: role.hoisted,
        mentionable: role.mentionable,
        managed: role.managed,
        memberCount: role.memberCount,
        assignable: role.assignable,
        editable: role.editable,
        deletable: role.deletable,
        dependencyCount: role.dependencyCount,
        unavailableReason: role.unavailableReason || "",
      }));
      recordActivity(draft, "Live Discord role catalog loaded from API", "Discord Bot");
    });
    notify("Live Discord roles loaded.", "success");
    renderPage("discord");
  } catch (error) {
    notify(error.message || "Live role catalog unavailable. Demo Mode remains usable.", "warning");
  }
}

async function loadLiveDiscordChannels() {
  try {
    const result = await listDiscordChannels();
    mutateDemoState((draft) => {
      draft.discord.channels = result.data.map((channel) => ({
        id: channel.id,
        guildId: channel.guildId,
        name: channel.name,
        type: channel.type,
        parentId: channel.parentId || "",
        position: channel.position,
        nsfw: channel.nsfw,
        canView: channel.canView,
        canSendMessages: channel.canSendMessages,
        canEmbedLinks: channel.canEmbedLinks,
        canManage: channel.canManage,
      }));
      recordActivity(draft, "Live Discord channels loaded from API", "Discord Bot");
    });
    notify("Live Discord channels loaded.", "success");
    renderPage("discord");
  } catch (error) {
    notify(error.message || "Live channel lookup unavailable. Demo Mode remains usable.", "warning");
  }
}

async function loadRoleDependencies(roleId) {
  const panel = document.getElementById("roleDependencies");
  if (!panel) return;
  try {
    const result = account ? await listDiscordRoleDependencies(roleId) : { data: [] };
    panel.innerHTML = `<h3>Dependencies</h3><ul class="list">${result.data.map((dependency) => `<li><strong>${escapeHtml(dependency.feature)}</strong><small>${escapeHtml(dependency.label)} - ${escapeHtml(dependency.field)}</small></li>`).join("") || "<li>No Qbox feature dependencies reference this role.</li>"}</ul>`;
  } catch (error) {
    panel.innerHTML = `<p class="validation-error">${escapeHtml(error.message || "Dependencies unavailable.")}</p>`;
  }
}

async function moveRoleFromForm(roleId) {
  const position = Number(value("[name='position']"));
  if (!Number.isInteger(position)) return notify("Role position must be an integer.", "warning");
  if (!account) return notify("Demo role position is edited when you save the form. Login for live moves.", "warning");
  try {
    await moveDiscordRole(roleId, position);
    notify("Role moved in Discord.", "success");
    await loadLiveDiscordRoles();
  } catch (error) {
    notify(error.message || "Live role move failed.", "warning");
  }
}

async function deleteRoleFromDetail(roleId) {
  const state = loadDemoState();
  const role = state.discord.roles.find((candidate) => candidate.id === roleId);
  if (!role) return;
  const confirmed = await confirmAction({
    title: "Delete Discord Role",
    body: `Type-level confirmation is still enforced by the API. This action deletes ${role.name} only when Discord and Qbox validation allow it.`,
    confirmText: "Delete",
  });
  if (!confirmed) return;
  try {
    if (account) await deleteDiscordRole(roleId, role.name);
    mutateDemoState((draft) => {
      draft.discord.roles = draft.discord.roles.filter((candidate) => candidate.id !== roleId);
      recordActivity(draft, `Role deleted: ${role.name}`, "Discord Bot");
    });
    notify(account ? "Role deleted in Discord." : "Demo role removed from this browser.", "success");
    renderPage("discord");
  } catch (error) {
    notify(error.message || "Role delete failed.", "warning");
  }
}

function updateRoleMenu(action, id) {
  if (action === "delete-role-menu") {
    return confirmThen("Delete role menu", "This removes a demo role-menu configuration from this browser only unless you use the live API directly.", async () => {
      try { if (account) await deleteRoleMenu(id); } catch (error) { notify(error.message || "Live delete unavailable. Applying demo change only.", "warning"); }
      mutateAndRender((s) => { s.discord.roleMenus = s.discord.roleMenus.filter((menu) => menu.id !== id); recordActivity(s, "Role menu deleted in Demo Mode", "Discord Bot"); });
    });
  }
  return mutateAndRender((s) => {
    const menu = s.discord.roleMenus.find((candidate) => candidate.id === id);
    if (!menu) return;
    if (action === "publish-role-menu") {
      menu.status = "PUBLISHED";
      menu.messageId = menu.messageId || "1432100000000000001";
      menu.history.unshift({ at: "Just now", action: "Publish preview recorded in Demo Mode" });
      if (account) void publishRoleMenu(menu.id, menu.messageId, menu.revision).catch((error) => notify(error.message || "Live publish unavailable. Demo state updated only.", "warning"));
    }
    if (action === "disable-role-menu") {
      menu.status = "DISABLED";
      menu.history.unshift({ at: "Just now", action: "Disabled in Demo Mode" });
      if (account) void disableRoleMenu(menu.id, menu.revision).catch((error) => notify(error.message || "Live disable unavailable. Demo state updated only.", "warning"));
    }
    recordActivity(s, `Role menu ${menu.title} changed to ${menu.status}`, "Discord Bot");
  });
}

function updateApplication(action, id) {
  if (action === "delete-application") return confirmThen("Delete application", "This removes the demo application from this browser only.", () => mutateAndRender((s) => { s.applications = s.applications.filter((i) => i.id !== id); recordActivity(s, "Application deleted in Demo Mode", "Applications"); }));
  mutateAndRender((s) => { const item = s.applications.find((i) => i.id === id); item.status = value("[data-action='application-status']"); item.notes = value("[data-action='application-notes']"); item.history.unshift({ at: "Just now", action: `Status changed to ${item.status}` }); recordActivity(s, `Application ${item.id} changed to ${item.status}`, "Applications"); });
}

function updateTicket(action, id) {
  mutateAndRender((s) => {
    const item = s.tickets.find((i) => i.id === id);
    if (action === "reopen-ticket") item.status = "Open";
    else item.status = value("[data-action='ticket-status']");
    const message = value("[data-action='ticket-message']");
    if (message) item.messages.push({ author: "Demo Staff", body: message });
    item.history.unshift({ at: "Just now", action: `Ticket changed to ${item.status}` });
    recordActivity(s, `Ticket ${item.id} changed to ${item.status}`, "Tickets");
  });
}

function updateStaff(action, id) {
  mutateAndRender((s) => {
    const item = s.staff.find((i) => i.id === id);
    if (action === "promote-staff") item.role = item.role === "Senior Admin" ? "Senior Admin" : "Moderator";
    if (action === "demote-staff") item.role = "Trial Staff";
    item.notes = value("[data-action='staff-notes']");
    recordActivity(s, `Staff profile updated for ${item.name}`, "Staff");
  });
}

function updateVerification(action, id) {
  const next = action === "approve-verification" ? "Approved" : action === "reject-verification" ? "Rejected" : "More Info Requested";
  mutateAndRender((s) => { const item = s.verification.find((i) => i.id === id); item.status = next; item.history.unshift({ at: "Just now", action: `Verification ${next}` }); recordActivity(s, `Verification ${item.id} ${next}`, "Verification"); });
}

function votePoll(id, optionId) {
  const votes = loadVotes();
  if (votes[id]) return notify("You already voted in this browser.", "warning");
  mutateDemoState((s) => { const poll = s.polls.find((p) => p.id === id); const option = poll.options.find((o) => o.id === optionId); option.votes += 1; recordActivity(s, `Vote recorded for ${poll.question}`, "Polls"); });
  votes[id] = optionId;
  saveVotes(votes);
  notify("Demo vote recorded in this browser.");
  renderPage("polls");
}

function mutateAndRender(mutator) {
  mutateDemoState(mutator);
  notify("Demo changes saved in this browser.");
  renderPage(currentPage());
}

async function confirmThen(title, body, callback) {
  if (await confirmAction({ title, body, confirmText: "Confirm" })) callback();
}

function metric(label, value, detailText) {
  return `<article class="card metric"><div><div class="metric-label">${escapeHtml(label)}</div><div class="metric-value">${escapeHtml(value)}</div></div><div class="metric-detail">${escapeHtml(detailText)}</div></article>`;
}

function quick(page, label) {
  return `<a class="button" href="${appPath(`/${page}`)}" data-route="${page}">${escapeHtml(label)}</a>`;
}

function toolbar(placeholder, id, filters) {
  return `<div class="toolbar"><input id="${id}" placeholder="${escapeHtml(placeholder)}" aria-label="${escapeHtml(placeholder)}"><select aria-label="Filter"><option>All</option>${filters.map((filter) => `<option>${escapeHtml(filter)}</option>`).join("")}</select></div>`;
}

function input(name, labelText, valueText) {
  return `<label>${escapeHtml(labelText)}<input name="${escapeHtml(name)}" value="${escapeHtml(valueText)}"></label>`;
}

function textarea(name, labelText, valueText) {
  return `<label class="full">${escapeHtml(labelText)}<textarea name="${escapeHtml(name)}">${escapeHtml(valueText)}</textarea></label>`;
}

function select(name, labelText, values, selected = values[0]) {
  return `<label>${escapeHtml(labelText)}<select name="${escapeHtml(name)}">${values.map((v) => option(v, selected)).join("")}</select></label>`;
}

function roleSelect(state, name, labelText, selected) {
  const roles = state.discord.roles || [];
  if (roles.length === 0) return input(name, labelText, selected);
  return `<label>${escapeHtml(labelText)}<select name="${escapeHtml(name)}">${roles.map((role) => `<option value="${escapeHtml(role.id)}" ${role.id === selected ? "selected" : ""}>${escapeHtml(role.name)} (${escapeHtml(role.id)})</option>`).join("")}</select></label>`;
}

function channelSelect(state, name, labelText, selected) {
  const channels = state.discord.channels || [];
  if (channels.length === 0) return input(name, labelText, selected);
  return `<label>${escapeHtml(labelText)}<select name="${escapeHtml(name)}">${channels.map((channel) => `<option value="${escapeHtml(channel.id)}" ${channel.id === selected ? "selected" : ""}>#${escapeHtml(channel.name)} - ${escapeHtml(channel.type)} (${escapeHtml(channel.id)})</option>`).join("")}</select></label>`;
}

function channelLabel(state, channelId) {
  const channel = (state.discord.channels || []).find((candidate) => candidate.id === channelId);
  return channel ? `#${channel.name} (${channel.type}) ${channel.id}` : channelId;
}

function roleLabel(state, roleId) {
  const role = (state.discord.roles || []).find((candidate) => candidate.id === roleId);
  return role ? `${role.name} ${role.id}` : roleId;
}

function option(valueText, selected) {
  return `<option ${valueText === selected ? "selected" : ""}>${escapeHtml(valueText)}</option>`;
}

function detail(label, valueText) {
  return `<div class="detail-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(valueText)}</strong></div>`;
}

function value(selector) {
  return document.querySelector(selector)?.value ?? "";
}

function currentPage() {
  return currentRoutePage();
}

function pageTitle(page) {
  return {
    fivem: "FiveM Server",
    knowledge: "Knowledge Base",
    overview: "Overview",
  }[page] || page.charAt(0).toUpperCase() + page.slice(1);
}

function calendar(items) {
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  return `<section class="card"><h2>August demo calendar</h2><div class="calendar-grid">${days.map((day) => { const date = String(day).padStart(2, "0"); const matches = items.filter((item) => item.date === `08-${date}`); return `<div class="calendar-day"><strong>${day}</strong>${matches.map((item) => `<span class="tag">${escapeHtml(item.name)}</span>`).join("")}</div>`; }).join("")}</div></section>`;
}
