import { loginUrl, logout } from "./api.js";
import { appPath, currentRoutePage, liveUrl, staticHosting } from "./config.js";
import { chooseServerView, initializeGuildPicker, renderServerHeader } from "./guilds.js";
import { currentGuild, refreshSession, session, signedIn } from "./session.js";
import { escapeHtml, initializeModal, notify, signInCard } from "./ui.js";
import { pages } from "./pages.js";
import { BRAND } from "./brand.js";


initializeModal();
initializeGuildPicker();

const navLink = (page) => `<a class="nav-link" href="${appPath(page.id === "overview" ? "/" : `/${page.id}`)}" data-route="${page.id}"><span class="nav-icon" aria-hidden="true">${page.icon}</span><span>${escapeHtml(page.label)}</span></a>`;

document.getElementById("navigation").innerHTML = pages
  .map((page, index) => (page.group && page.group !== pages[index - 1]?.group ? `<p class="nav-group">${escapeHtml(page.group)}</p>` : "") + navLink(page))
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

// A feature route answered 409 GUILD_REQUIRED: the browser has no server yet.
window.addEventListener("qbox:guild-required", () => {
  if (!session.account || !currentGuild()) return renderCurrentRoute();
  session.account.guild = null;
  renderChrome();
  renderCurrentRoute();
});

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
  document.title = `${current.label} · ${BRAND.name}`;
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.route === current.id));
  const content = document.getElementById("content");
  if (!signedIn() && current.id !== "overview") {
    content.innerHTML = signInCard(loginUrl(), staticHosting(), liveUrl());
    return;
  }
  if (signedIn() && !currentGuild()) {
    document.getElementById("pageTitle").textContent = "Choose a server";
    document.getElementById("breadcrumbs").textContent = "Pick the Discord server to manage.";
    content.innerHTML = chooseServerView();
    content.focus({ preventScroll: true });
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
  renderServerHeader();
  const dot = document.getElementById("connectionDot");
  const title = document.getElementById("connectionTitle");
  const text = document.getElementById("connectionText");
  dot.className = `status-dot ${session.health.available ? "live" : "danger"}`;
  title.textContent = staticHosting() ? "Preview site" : session.health.available ? "Connected" : "API offline";
  text.textContent = staticHosting()
    ? "Sign in on the live platform to manage your server."
    : session.health.available
      ? profile ? (currentGuild() ? `Changes here apply to ${currentGuild().name}.` : "Choose a server to get started.") : "Sign in with Discord to continue."
      : `The ${BRAND.name} API is not reachable right now.`;

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
