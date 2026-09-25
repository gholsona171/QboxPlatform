import { appPath, liveUrl, staticHosting } from "./config.js";

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
    return { available: false, message: "Live services are not connected yet." };
  }
}

export async function loadMe(refresh = false) {
  if (staticHosting()) throw Object.assign(new Error("Login on the live platform."), { code: "AUTHENTICATION_REQUIRED" });
  return requestJson(`/api/v1/me${refresh ? "?refresh=1" : ""}`);
}

export async function adminCheck() {
  return requestJson("/api/v1/admin-check");
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

export async function inspectDiscordRole(roleId) {
  return requestJson(`/api/v1/discord/roles/${encodeURIComponent(roleId)}`);
}

export async function createDiscordRole(input) {
  return requestJson("/api/v1/discord/roles", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function editDiscordRole(roleId, input) {
  return requestJson(`/api/v1/discord/roles/${encodeURIComponent(roleId)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function deleteDiscordRole(roleId, confirmation) {
  return requestJson(`/api/v1/discord/roles/${encodeURIComponent(roleId)}`, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ confirmation }),
  });
}

export async function moveDiscordRole(roleId, position) {
  return requestJson(`/api/v1/discord/roles/${encodeURIComponent(roleId)}/move`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ position }),
  });
}

export async function listDiscordRoleDependencies(roleId) {
  return requestJson(`/api/v1/discord/roles/${encodeURIComponent(roleId)}/dependencies`);
}

export async function createRoleMenu(input) {
  return requestJson("/api/v1/discord/role-menus", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function addRoleMenuOption(menuId, input) {
  return requestJson(`/api/v1/discord/role-menus/${encodeURIComponent(menuId)}/options`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function publishRoleMenu(menuId, messageId, expectedRevision) {
  return requestJson(`/api/v1/discord/role-menus/${encodeURIComponent(menuId)}/publish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messageId, expectedRevision }),
  });
}

export async function disableRoleMenu(menuId, expectedRevision) {
  return requestJson(`/api/v1/discord/role-menus/${encodeURIComponent(menuId)}/disable`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ expectedRevision }),
  });
}

export async function deleteRoleMenu(menuId) {
  return requestJson(`/api/v1/discord/role-menus/${encodeURIComponent(menuId)}`, {
    method: "DELETE",
  });
}

export async function loadDiscordFeature(path) {
  return requestJson(`/api/v1/discord/${path}`);
}

export async function saveDiscordFeature(path, input, method = "PUT") {
  return requestJson(`/api/v1/discord/${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function ticketsOverview() {
  return requestJson("/api/v1/tickets/overview");
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
  return requestJson("/auth/logout", {
    method: "POST",
    headers: { "x-csrf-token": csrf },
  });
}

export function loginUrl() {
  if (staticHosting()) return liveUrl() ? `${liveUrl()}/auth/discord/start` : "#";
  return appPath("/auth/discord/start");
}

export function cookieValue(name) {
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
    throw Object.assign(new Error(message), { code: problem.code || "REQUEST_FAILED", status: response.status });
  }
  return response.json();
}

function userMessage(code, fallback) {
  const messages = {
    AUTHENTICATION_REQUIRED: "Session expired. You can keep exploring Demo Mode or login again.",
    AUTHORIZATION_DENIED: "Administrator permission denied.",
    DISCORD_GUILD_MEMBERSHIP_REQUIRED: "You are not a member of the configured server.",
    DISCORD_GUILD_MEMBERSHIP_PENDING: "Membership screening is still pending.",
    OAUTH_STATE_INVALID: "OAuth state expired. Start Discord login again.",
    DEPENDENCY_UNAVAILABLE: "Live services are not connected yet.",
    RESOURCE_CONFLICT: "This configuration changed in Discord or another browser while you were editing.",
  };
  return messages[code] || fallback || "Live services are not connected yet.";
}
