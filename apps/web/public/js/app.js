import { loginUrl, logout } from "./api.js";
import { appPath, currentRoutePage, liveUrl, staticHosting } from "./config.js";
import { renderDiscordPage } from "./discord.js";
import { refreshSession, session, signedIn } from "./session.js";
import { renderTicketsPage } from "./tickets.js";
import { escapeHtml, initializeModal, notify, signInCard } from "./ui.js";
import { renderOverviewPage, renderSettingsPage } from "./views.js";

const icon = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

const pages = [
  { id: "overview", label: "Overview", description: "Your server at a glance.", icon: icon('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'), render: renderOverviewPage },
  { id: "tickets", label: "Tickets", description: "Answer tickets and set up how members open them.", icon: icon('<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z"/><path d="M9 6v12" stroke-dasharray="2 2"/>'), render: renderTicketsPage },
  { id: "discord", label: "Discord Bot", description: "Welcome messages, roles, logs and other bot features.", icon: icon('<rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 7V4"/><circle cx="9" cy="13" r="1.2"/><circle cx="15" cy="13" r="1.2"/>'), render: renderDiscordPage },
  { id: "settings", label: "Account", description: "Your Discord sign-in and service status.", icon: icon('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'), render: renderSettingsPage },
];

initializeModal();

document.getElementById("navigation").innerHTML = pages
  .map((page) => `<a class="nav-link" href="${appPath(page.id === "overview" ? "/" : `/${page.id}`)}" data-route="${page.id}"><span class="nav-icon" aria-hidden="true">${page.icon}</span><span>${escapeHtml(page.label)}</span></a>`)
  .join("");

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-route]");
  if (!link) return;
  event.preventDefault();
  navigate(link.dataset.route, link.dataset.tab);
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
});

document.getElementById("menuToggle").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  const open = !sidebar.classList.contains("open");
  sidebar.classList.toggle("open", open);
  document.getElementById("menuToggle").setAttribute("aria-expanded", String(open));
});

document.getElementById("profileButton").addEventListener("click", () => {
  const popover = document.getElementById("profilePopover");
  popover.hidden = !popover.hidden;
  document.getElementById("profileButton").setAttribute("aria-expanded", String(!popover.hidden));
});

document.getElementById("logoutButton").addEventListener("click", async () => {
  try {
    await logout();
    notify("Signed out.");
  } catch (error) {
    notify(error.message || "Sign out failed.", "error");
  }
  await refreshSession();
  renderChrome();
  renderCurrentRoute();
});

window.addEventListener("popstate", () => renderCurrentRoute());

await refreshSession({ refreshAccount: new URLSearchParams(location.search).has("auth") });
renderChrome();
renderCurrentRoute();

export function navigate(pageId, tab) {
  const path = pageId === "overview" ? "/" : `/${pageId}${tab ? `?tab=${encodeURIComponent(tab)}` : ""}`;
  history.pushState({}, "", appPath(path));
  renderCurrentRoute();
}

function renderCurrentRoute() {
  const current = pages.find((page) => page.id === currentRoutePage()) ?? pages[0];
  document.getElementById("pageTitle").textContent = current.label;
  document.getElementById("breadcrumbs").textContent = current.description;
  document.title = `${current.label} · QboxPlatform`;
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.route === current.id));
  const content = document.getElementById("content");
  if (!signedIn() && current.id !== "overview") {
    content.innerHTML = signInCard(loginUrl(), staticHosting(), liveUrl());
    return;
  }
  content.innerHTML = "";
  void Promise.resolve(current.render(content)).catch((error) => {
    content.innerHTML = `<section class="card"><h2>Something went wrong</h2><p class="microcopy">${escapeHtml(error.message || "This page could not load.")}</p></section>`;
  });
  content.focus({ preventScroll: true });
}

function renderChrome() {
  const profile = session.account?.account;
  const dot = document.getElementById("connectionDot");
  const title = document.getElementById("connectionTitle");
  const text = document.getElementById("connectionText");
  dot.className = `status-dot ${session.health.available ? "live" : "danger"}`;
  title.textContent = staticHosting() ? "Preview site" : session.health.available ? "Connected" : "API offline";
  text.textContent = staticHosting()
    ? "Sign in on the live platform to manage your server."
    : session.health.available
      ? profile ? "Changes here apply to your Discord server." : "Sign in with Discord to continue."
      : "The Qbox API is not reachable right now.";

  const name = document.getElementById("profileName");
  const avatar = document.getElementById("profileAvatar");
  const summary = document.getElementById("profileSummary");
  const login = document.getElementById("loginButton");
  const logoutButton = document.getElementById("logoutButton");
  login.setAttribute("href", loginUrl());
  login.hidden = Boolean(profile);
  logoutButton.hidden = !profile;
  if (profile) {
    name.textContent = profile.globalName || profile.username || "Signed in";
    const avatarUrl = profile.avatar && /^\d{17,20}$/.test(profile.discordUserId ?? "") && /^(a_)?[0-9a-f]{32}$/.test(profile.avatar)
      ? `https://cdn.discordapp.com/avatars/${profile.discordUserId}/${profile.avatar}.png?size=64`
      : undefined;
    avatar.innerHTML = avatarUrl ? `<img alt="" src="${escapeHtml(avatarUrl)}">` : escapeHtml(name.textContent.slice(0, 2).toUpperCase());
    summary.innerHTML = `<strong>${escapeHtml(name.textContent)}</strong><p class="microcopy">Signed in with Discord.</p>`;
  } else {
    name.textContent = "Not signed in";
    avatar.textContent = "QB";
    summary.innerHTML = `<p class="microcopy">Sign in with the Discord account you use on the server.</p>`;
  }
}
