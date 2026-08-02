const state = { me: undefined };
const csrfCookieName = document.cookie.includes("__Host-qbox_csrf=")
  ? "__Host-qbox_csrf"
  : "qbox_csrf";

const elements = {
  login: document.getElementById("login"),
  refresh: document.getElementById("refresh"),
  admin: document.getElementById("admin"),
  logout: document.getElementById("logout"),
  notice: document.getElementById("notice"),
  identity: document.getElementById("identity"),
  membership: document.getElementById("membership"),
  session: document.getElementById("session"),
  permissions: document.getElementById("permissions"),
  health: document.getElementById("health"),
  raw: document.getElementById("raw"),
};

function cookieValue(name) {
  const value = document.cookie
    .split("; ")
    .find((candidate) => candidate.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.slice(name.length + 1)) : undefined;
}

function setNotice(message, kind = "") {
  elements.notice.hidden = false;
  elements.notice.className = `notice ${kind}`.trim();
  elements.notice.textContent = message;
}

function clearNotice() {
  elements.notice.hidden = true;
  elements.notice.textContent = "";
  elements.notice.className = "notice";
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
      // Keep a generic user-facing error.
    }
    const error = new Error(problem.detail || response.statusText);
    error.code = problem.code;
    throw error;
  }
  return response.json();
}

async function loadAccount(refresh = false) {
  clearNotice();
  setLoading(true);
  try {
    const me = await requestJson(`/api/v1/me${refresh ? "?refresh=1" : ""}`);
    state.me = me;
    renderAuthenticated(me);
  } catch (error) {
    state.me = undefined;
    renderSignedOut();
    if (error.code === "AUTHENTICATION_REQUIRED") {
      setNotice("Signed out. Login with Discord to continue.");
    } else {
      setNotice(error.message || "Authentication failed", "error");
    }
  } finally {
    setLoading(false);
  }
}

async function loadHealth() {
  try {
    const [live, ready] = await Promise.all([
      requestJson("/health/live"),
      requestJson("/health/ready"),
    ]);
    elements.health.innerHTML = `<span class="ok">${live.liveness}</span> / ${
      ready.readiness === "ready"
        ? '<span class="ok">ready</span>'
        : '<span class="warn">not ready</span>'
    }`;
  } catch {
    elements.health.innerHTML = '<span class="bad">unavailable</span>';
  }
}

function renderSignedOut() {
  elements.login.style.display = "inline-flex";
  elements.refresh.disabled = true;
  elements.admin.disabled = true;
  elements.logout.disabled = true;
  elements.identity.textContent = "Signed out";
  elements.membership.textContent = "—";
  elements.session.textContent = "—";
  elements.permissions.textContent = "—";
  elements.raw.textContent = "—";
}

function renderAuthenticated(me) {
  elements.login.style.display = "none";
  elements.refresh.disabled = false;
  elements.admin.disabled = false;
  elements.logout.disabled = false;
  const avatar = me.account.avatar
    ? `https://cdn.discordapp.com/avatars/${me.account.discordUserId}/${me.account.avatar}.png?size=128`
    : "";
  elements.identity.innerHTML = `
    <div class="identity">
      ${avatar ? `<img class="avatar" src="${avatar}" alt="Discord avatar">` : ""}
      <div>
        <div>${escapeHtml(me.account.globalName || me.account.username || "Unknown Discord user")}</div>
        <div class="mono muted">Discord ID: ${escapeHtml(me.account.discordUserId)}</div>
        <div class="mono muted">Platform user: ${escapeHtml(me.account.platformUserId)}</div>
      </div>
    </div>`;
  elements.membership.innerHTML = `
    <div>Guild: <span class="mono">${escapeHtml(me.membership.guildId)}</span></div>
    <div>Status: ${statusBadge(me.membership.status)}</div>
    <div>Roles: <span class="mono">${me.membership.roleIds.length ? me.membership.roleIds.map(escapeHtml).join(", ") : "none"}</span></div>`;
  elements.session.innerHTML = `
    <div>Session ID: <span class="mono">${escapeHtml(me.session.id)}</span></div>
    <div>Idle expiry: <span class="mono">${escapeHtml(me.session.idleExpiresAt)}</span></div>
    <div>Absolute expiry: <span class="mono">${escapeHtml(me.session.absoluteExpiresAt)}</span></div>`;
  elements.permissions.innerHTML = `
    <div>platform.owner: ${decision(me.permissions.platformOwner)}</div>
    <div>platform.admin: ${decision(me.permissions.platformAdmin)}</div>`;
  elements.raw.textContent = JSON.stringify(me, null, 2);
}

function setLoading(loading) {
  elements.refresh.disabled = loading || !state.me;
  elements.admin.disabled = loading || !state.me;
  elements.logout.disabled = loading || !state.me;
}

function statusBadge(status) {
  if (status === "PRESENT") return '<span class="ok">PRESENT</span>';
  if (status === "ABSENT") return '<span class="bad">ABSENT</span>';
  return '<span class="warn">UNKNOWN</span>';
}

function decision(result) {
  return `${result.allowed ? '<span class="ok">allowed</span>' : '<span class="bad">denied</span>'} <span class="muted">(${escapeHtml(result.reason)})</span>`;
}

function authErrorMessage(code) {
  return {
    cancelled: "Discord login was cancelled",
    expired: "OAuth state expired",
    binding: "OAuth browser binding failed",
    dependency: "Discord could not be reached",
    "not-member": "You are not a member of the configured server",
    pending: "Membership screening is still pending",
    failed: "Authentication failed",
    invalid: "Authentication failed",
  }[code] || "Authentication failed";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

elements.refresh.addEventListener("click", () => loadAccount(true));
elements.admin.addEventListener("click", async () => {
  try {
    const result = await requestJson("/api/v1/admin-check");
    setNotice(`Administrator permission allowed: ${result.decision.reason}`, "ok");
  } catch (error) {
    setNotice(
      error.code === "AUTHORIZATION_DENIED"
        ? "Administrator permission denied"
        : error.message || "Admin check failed",
      "error",
    );
  }
});
elements.logout.addEventListener("click", async () => {
  try {
    await requestJson("/auth/logout", {
      method: "POST",
      headers: { "X-CSRF-Token": cookieValue(csrfCookieName) || "" },
    });
    state.me = undefined;
    renderSignedOut();
    setNotice("Signed out after logout.", "ok");
  } catch (error) {
    setNotice(error.message || "Logout failed", "error");
  }
});

const params = new URLSearchParams(location.search);
if (params.has("auth_error")) {
  setNotice(authErrorMessage(params.get("auth_error")), "error");
  history.replaceState(null, "", "/");
}

renderSignedOut();
loadHealth();
loadAccount();
