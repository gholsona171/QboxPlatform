import { appPath, liveUrl, staticHosting } from "./config.js";
import { BRAND } from "./brand.js";

const csrfCookieName = document.cookie.includes("__Host-qbox_csrf=") ? "__Host-qbox_csrf" : "qbox_csrf";

export async function loadHealth() {
  if (staticHosting()) return { available: false, message: "This is the GitHub Pages preview. Open the live platform to manage Discord." };
  try {
    const [live, ready] = await Promise.all([
      requestJson("/health/live"),
      requestJson("/health/ready"),
    ]);
    return { available: true, live, ready };
  } catch {
    return { available: false, message: `Discord or the ${BRAND.name} API is not reachable right now.` };
  }
}

export async function loadMe(refresh = false) {
  if (staticHosting()) throw Object.assign(new Error("Login on the live platform."), { code: "AUTHENTICATION_REQUIRED" });
  return requestJson(`/api/v1/me${refresh ? "?refresh=1" : ""}`);
}

/** Servers the signed-in member and the bot share. refresh=true re-reads Discord. */
export function listGuilds(refresh = false) {
  return requestJson(`/api/v1/guilds${refresh ? "?refresh=1" : ""}`);
}

/** Makes one server the current server for this browser (cookie set by the API). */
export function selectGuild(guildId) {
  return mutateJson("/api/v1/guilds/select", "POST", { guildId });
}

export function clearGuild() {
  return mutateJson("/api/v1/guilds/clear", "POST", {});
}

export async function listRoleMenus() {
  return requestJson("/api/v1/discord/role-menus");
}

export async function listDiscordRoles() {
  return requestJson("/api/v1/discord/roles");
}

export async function listDiscordChannels() {
  return requestJson("/api/v1/discord/resources/channels");
}

export function discordMutation(path, method, body) {
  return mutateJson(`/api/v1/discord/${path}`, method, body);
}

export async function loadDiscordFeature(path) {
  return requestJson(`/api/v1/discord/${path}`);
}

export function ticketsOverview() {
  return requestJson("/api/v1/tickets/overview");
}

export function loadDirectoryData() {
  return requestJson("/api/v1/directory");
}

export function searchMembers(query) {
  return requestJson(`/api/v1/directory/members?query=${encodeURIComponent(query)}`);
}

export function lookupMembers(ids) {
  return requestJson(`/api/v1/directory/members?ids=${ids.map(encodeURIComponent).join(",")}`);
}

/** GET a feature API path under /api/v1. */
export function getJson(path) {
  return requestJson(`/api/v1/${path}`);
}

/** Change data under /api/v1 with the CSRF header. */
export function sendJson(path, method, body) {
  return mutateJson(`/api/v1/${path}`, method, body);
}

export function listTickets(filters = {}) {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""));
  return requestJson(`/api/v1/tickets${query.size ? `?${query}` : ""}`);
}

export function ticketDetail(ticketId) {
  return requestJson(`/api/v1/tickets/${encodeURIComponent(ticketId)}`);
}

export function ticketTranscriptUrl(ticketId) {
  return appPath(`/api/v1/tickets/${encodeURIComponent(ticketId)}/transcript`);
}

export function ticketAction(ticketId, action, body = {}) {
  return mutateJson(`/api/v1/tickets/${encodeURIComponent(ticketId)}/${action}`, "POST", body);
}

export function removeTicketParticipant(ticketId, userId) {
  return mutateJson(`/api/v1/tickets/${encodeURIComponent(ticketId)}/participants/${encodeURIComponent(userId)}`, "DELETE");
}

export function saveTicketSettings(settings) {
  return mutateJson("/api/v1/tickets/settings", "PUT", settings);
}

export function saveTicketCategory(category, id) {
  return mutateJson(id ? `/api/v1/tickets/categories/${encodeURIComponent(id)}` : "/api/v1/tickets/categories", id ? "PUT" : "POST", category);
}

export function deleteTicketCategory(id) {
  return mutateJson(`/api/v1/tickets/categories/${encodeURIComponent(id)}`, "DELETE");
}

export function saveTicketPanel(panel, id) {
  return mutateJson(id ? `/api/v1/tickets/panels/${encodeURIComponent(id)}` : "/api/v1/tickets/panels", id ? "PUT" : "POST", panel);
}

export function publishTicketPanel(id) {
  return mutateJson(`/api/v1/tickets/panels/${encodeURIComponent(id)}/publish`, "POST", {});
}

export function deleteTicketPanel(id) {
  return mutateJson(`/api/v1/tickets/panels/${encodeURIComponent(id)}`, "DELETE");
}

function mutateJson(path, method, body) {
  const csrf = cookieValue(csrfCookieName);
  return requestJson(path, {
    method,
    headers: {
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...(csrf ? { "x-csrf-token": csrf } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

export async function logout() {
  const csrf = cookieValue(csrfCookieName);
  if (!csrf) throw Object.assign(new Error("Session expired."), { code: "AUTHENTICATION_REQUIRED" });
  return mutateJson("/auth/logout", "POST");
}

export function loginUrl() {
  if (staticHosting()) return liveUrl() ? `${liveUrl()}/auth/discord/start` : "#";
  return appPath("/auth/discord/start");
}

function cookieValue(name) {
  const value = document.cookie
    .split("; ")
    .find((candidate) => candidate.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.slice(name.length + 1)) : undefined;
}

async function requestJson(path, options = {}) {
  if (staticHosting()) throw Object.assign(new Error("Live services are available on the live platform."), { code: "DEPENDENCY_UNAVAILABLE" });
  const response = await fetch(appPath(path), {
    credentials: "same-origin",
    ...options,
  });
  if (!response.ok) {
    let problem = {};
    try {
      problem = await response.json();
    } catch {
      // Keep provider and proxy errors out of the UI.
    }
    const detailMessage = Array.isArray(problem.errors) ? problem.errors.find((item) => typeof item?.message === "string")?.message : undefined;
    const message = detailMessage || userMessage(problem.code, problem.detail || response.statusText);
    if (problem.code === "GUILD_REQUIRED") window.dispatchEvent(new CustomEvent("qbox:guild-required"));
    throw Object.assign(new Error(message), { code: problem.code || "REQUEST_FAILED", status: response.status });
  }
  return response.json();
}

function userMessage(code, fallback) {
  const messages = {
    AUTHENTICATION_REQUIRED: "Your session expired. Sign in with Discord again.",
    AUTHORIZATION_DENIED: "Administrator permission denied.",
    DISCORD_GUILD_MEMBERSHIP_REQUIRED: "You are not a member of that server.",
    GUILD_REQUIRED: "Choose a server first.",
    DISCORD_GUILD_MEMBERSHIP_PENDING: "Membership screening is still pending.",
    OAUTH_STATE_INVALID: "OAuth state expired. Start Discord login again.",
    DEPENDENCY_UNAVAILABLE: `Discord or the ${BRAND.name} API is not reachable right now.`,
    RESOURCE_CONFLICT: "This configuration changed in Discord or another browser while you were editing.",
  };
  return messages[code] || fallback || `Discord or the ${BRAND.name} API is not reachable right now.`;
}
