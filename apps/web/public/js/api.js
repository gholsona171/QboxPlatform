const csrfCookieName = document.cookie.includes("__Host-qbox_csrf=") ? "__Host-qbox_csrf" : "qbox_csrf";

export async function loadHealth() {
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
  return requestJson(`/api/v1/me${refresh ? "?refresh=1" : ""}`);
}

export async function adminCheck() {
  return requestJson("/api/v1/admin-check");
}

export async function listRoleMenus() {
  return requestJson("/api/v1/discord/role-menus");
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

export async function publishRoleMenu(menuId, messageId) {
  return requestJson(`/api/v1/discord/role-menus/${encodeURIComponent(menuId)}/publish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messageId }),
  });
}

export async function disableRoleMenu(menuId) {
  return requestJson(`/api/v1/discord/role-menus/${encodeURIComponent(menuId)}/disable`, {
    method: "POST",
  });
}

export async function deleteRoleMenu(menuId) {
  return requestJson(`/api/v1/discord/role-menus/${encodeURIComponent(menuId)}`, {
    method: "DELETE",
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
  return "/auth/discord/start";
}

export function cookieValue(name) {
  const value = document.cookie
    .split("; ")
    .find((candidate) => candidate.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.slice(name.length + 1)) : undefined;
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
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
    const message = userMessage(problem.code, problem.detail || response.statusText);
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
  };
  return messages[code] || fallback || "Live services are not connected yet.";
}
