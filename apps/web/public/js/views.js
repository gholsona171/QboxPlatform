import { loginUrl, ticketsOverview } from "./api.js";
import { appPath, liveUrl, staticHosting } from "./config.js";
import { featureRegistry } from "./featureRegistry.js";
import { session, signedIn } from "./session.js";
import { badge, escapeHtml, signInCard } from "./ui.js";
import { BRAND } from "./brand.js";

/** Overview: live ticket numbers, API status, and the features that are working today. */
export async function renderOverviewPage(container) {
  const featureCards = featureRegistry
    .filter((feature) => feature.status === "LIVE")
    .map((feature) => {
      const isTickets = feature.id === "tickets";
      const tab = isTickets ? "" : feature.portalRoute.split("tab=")[1] ?? "";
      const href = appPath(isTickets ? "/tickets" : `/discord${tab ? `?tab=${tab}` : ""}`);
      return `<a class="feature-tile" href="${escapeHtml(href)}" data-route="${isTickets ? "tickets" : "discord"}" ${tab ? `data-tab="${escapeHtml(tab)}"` : ""}><strong>${escapeHtml(feature.displayName)}</strong><small>${feature.discordCommands.map((command) => `/${escapeHtml(command)}`).join(" ") || "Portal"}</small></a>`;
    })
    .join("");

  if (!signedIn()) {
    container.innerHTML = `${signInCard(loginUrl(), staticHosting(), liveUrl())}
      <section class="card"><h2>What you can manage</h2><p class="microcopy">${BRAND.tagline}</p><div class="feature-grid">${featureCards}</div></section>`;
    return;
  }

  container.innerHTML = `
    <section class="grid cols-4" id="overviewMetrics">${metrics()}</section>
    <section class="card"><h2>Features</h2><p class="microcopy">${BRAND.tagline}</p><div class="feature-grid">${featureCards}</div></section>`;

  try {
    const { stats } = (await ticketsOverview()).data;
    document.getElementById("overviewMetrics").innerHTML = metrics(stats);
  } catch {
    document.getElementById("overviewMetrics").innerHTML = metric("API", session.health.available ? "Online" : "Offline");
  }
}

/** Account: who is signed in, server membership, and service health. */
export function renderSettingsPage(container) {
  const me = session.account;
  const profile = me.account;
  const ready = session.health.ready;
  container.innerHTML = `
    <section class="grid cols-2">
      <div class="card">
        <h2>Discord account</h2>
        ${detail("Name", escapeHtml(profile.globalName || profile.username || "Unknown"))}
        ${detail("Username", escapeHtml(profile.username || "Unknown"))}
        ${detail("Discord ID", `<code>${escapeHtml(profile.discordUserId)}</code>`)}
        ${detail("Server membership", badge(String(me.membership?.status ?? "unknown").toLowerCase()))}
        ${detail("Portal access", me.permissions?.discordManager ? "Full access, because you own or administer the server in Discord." : `Set by your ${BRAND.name} permissions.`)}
        <a class="button" href="${escapeHtml(appPath("/auth/discord/start"))}">Refresh Discord sign-in</a>
      </div>
      <div class="card">
        <h2>Services</h2>
        ${detail("API", badge(session.health.available ? "online" : "offline"))}
        ${detail("Readiness", badge(ready?.readiness ?? "unknown"))}
        ${detail("Version", escapeHtml(ready?.version ?? "unknown"))}
        <p class="microcopy">Health details: <a href="${escapeHtml(appPath("/health/ready"))}" target="_blank" rel="noreferrer">/health/ready</a></p>
      </div>
    </section>`;
}

function metrics(stats) {
  const value = (text) => (stats ? text : "…");
  return `
    ${metric("API", session.health.available ? "Online" : "Offline")}
    ${metric("Open tickets", value(String((stats?.open ?? 0) + (stats?.claimed ?? 0))))}
    ${metric("Waiting on members", value(String(stats?.pending ?? 0)))}
    ${metric("Average rating", value(stats?.averageRating === undefined ? "No ratings yet" : `${stats.averageRating} / 5`))}`;
}

function metric(label, value) {
  return `<div class="card metric"><span class="metric-label">${escapeHtml(label)}</span><strong class="metric-value">${escapeHtml(value)}</strong></div>`;
}

function detail(label, value) {
  return `<div class="detail-row"><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`;
}
