import { appPath, currentRoutePage } from "./config.js";
import { navItems } from "./data.js";
import { adminCheck, loginUrl, logout } from "./api.js";
import { initializeModal, notify } from "./ui.js";
import { refreshLiveState, renderAccountChrome, renderPage } from "./views.js";

const pages = new Set(navItems.map(([page]) => page));

initializeModal();

document.getElementById("navigation").innerHTML = navItems
  .map(([page, icon, label]) => `<a class="nav-link" href="${appPath(page === "overview" ? "/" : `/${page}`)}" data-route="${page}" data-page="${page}"><span class="nav-icon">${icon}</span><span>${label}</span></a>`)
  .join("");

document.addEventListener("click", async (event) => {
  const route = event.target.closest("[data-route]");
  if (route) {
    event.preventDefault();
    navigate(route.dataset.route, route.dataset.tab);
    closeMobileNav();
    return;
  }
});

document.getElementById("menuToggle").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  const open = !sidebar.classList.contains("open");
  sidebar.classList.toggle("open", open);
  document.getElementById("menuToggle").setAttribute("aria-expanded", String(open));
});

document.getElementById("profileButton").addEventListener("click", () => {
  const popover = document.getElementById("profilePopover");
  const open = popover.hidden;
  popover.hidden = !open;
  document.getElementById("profileButton").setAttribute("aria-expanded", String(open));
});

document.getElementById("notificationButton").addEventListener("click", async () => {
  try {
    const result = await adminCheck();
    notify(result.allowed ? "Live administrator check allowed." : "Live administrator check denied.", result.allowed ? "success" : "warning");
  } catch (error) {
    notify(error.message || "Live admin check is unavailable. Demo Mode remains usable.", "warning");
  }
});

document.getElementById("loginButton").setAttribute("href", loginUrl());
document.getElementById("logoutButton").addEventListener("click", async () => {
  try {
    await logout();
    notify("Logged out.");
    await refreshLiveState({ quiet: true });
  } catch (error) {
    notify(error.message || "Logout unavailable. Demo Mode remains usable.", "warning");
  }
});

window.addEventListener("popstate", () => renderCurrentRoute());

await refreshLiveState({ quiet: true });
renderCurrentRoute();
renderAccountChrome();

function navigate(page, tab) {
  const path = page === "overview" ? "/" : `/${page}${tab ? `?tab=${encodeURIComponent(tab)}` : ""}`;
  history.pushState({}, "", appPath(path));
  renderPage(page);
}

function renderCurrentRoute() {
  const page = currentRoutePage();
  renderPage(pages.has(page) ? page : "overview");
}

function closeMobileNav() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
}
